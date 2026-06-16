const { Order, OrderItem, Product, User } = require('../models');
const { Cart, CartItem } = require('../models');
const Razorpay = require('razorpay');

// Initialize Razorpay (Move to a separate config file later if you want)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponCode, shippingAddress } = req.body;

    // 1. Fetch Cart & Items
    const cart = await Cart.findOne({ 
      where: { userId },
      include: [{ model: CartItem, include: [Product] }] 
    });

    if (!cart || cart.CartItems.length === 0) {
      return res.status(400).json({ msg: 'Cart is empty' });
    }

    // 2. The Math Pipeline: Calculate Subtotal
    let subtotal = 0;
    cart.CartItems.forEach(item => {
      subtotal += item.quantity * item.Product.price;
    });

    // 3. The Math Pipeline: Discounts
    let discountAmount = 0;
    if (couponCode === 'WELCOME10') { // Hardcoded for now, replace with DB lookup
      discountAmount = subtotal * 0.10; // 10% off
    }

    // 4. The Math Pipeline: Taxes (e.g., 18% GST on discounted amount)
    const postDiscountTotal = subtotal - discountAmount;
    const taxAmount = postDiscountTotal * 0.18;

    // 5. Final Amount Computation
    const finalAmount = postDiscountTotal + taxAmount;

    // 6. Create Razorpay Order
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100), // Razorpay expects paise (smallest currency unit)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    });

    // 7. Save the Order to PostgreSQL
    const newOrder = await Order.create({
      userId,
      subtotal,
      discountAmount,
      taxAmount,
      couponCode,
      amount: finalAmount, // The final amount they pay
      shippingAddress,
      rzpOrderId: rzpOrder.id,
      status: 'PENDING'
    });

    // 8. Move CartItems to OrderItems & Clear Cart (Logic goes here)

    res.status(201).json({
      order: newOrder,
      razorpayOrder: rzpOrder
    });

  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).json({ msg: 'Failed to process checkout pipeline' });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role; // e.g., 'SELLER' or 'ADMIN'

    // Build the dynamic product filter: Admins see all, Sellers see only their own
    const productFilter = currentUserRole === 'ADMIN' ? {} : { sellerId: currentUserId };

    const orders = await Order.findAll({
      where: { status: ['PAID', 'PROCESSING', 'SHIPPED'] },
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'email', 'firstName', 'lastName'] 
        },
        { 
          model: OrderItem, 
          as: 'items',
          required: true, // CRITICAL: Only return the Order if it contains items matching the product filter below
          include: [{ 
            model: Product, 
            as: 'product', 
            where: productFilter, // The Isolation Filter
            attributes: ['name', 'sku', 'imgs', 'sellerId'] 
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ msg: 'Failed to fetch orders' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: newStatus, carrier, trackingId } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    // BR-ORD-01: Strict Finite State Machine (FSM)
    // Defines exactly which states can transition to which next states
    const validTransitions = {
      'PENDING': ['PAID', 'CANCELLED'],
      'PAID': ['PROCESSING', 'SHIPPED', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [], // Terminal state
      'CANCELLED': []  // Terminal state
    };

    // Prevent illegal transitions (e.g., DELIVERED -> PENDING)
    if (!validTransitions[order.status].includes(newStatus)) {
      return res.status(400).json({ 
        msg: `Illegal state transition. Cannot move from ${order.status} to ${newStatus}.` 
      });
    }

    order.status = newStatus;
    
    // Only update tracking info if the order is actually being shipped
    if (newStatus === 'SHIPPED') {
      if (carrier) order.carrier = carrier;
      if (trackingId) order.trackingId = trackingId;
    }

    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ msg: 'Failed to update order status' });
  }
};

// 3. CUSTOMER: Fetch personal order history
exports.getCustomerOrders = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Extracted safely from JWT via protect middleware

    const orders = await Order.findAll({
      where: { userId: currentUserId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'category', 'imgs'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']], // Newest orders first
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching customer order history:', error);
    res.status(500).json({ message: 'Failed to retrieve your order history.' });
  }
};

// --- RAZORPAY PAYMENT VERIFICATION ---
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

exports.verifyPayment = async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = req.body;

    // 1. Verify the Cryptographic Signature
    // This ensures the request actually came from Razorpay and not a hacker
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ msg: 'Payment verification failed. Invalid signature.' });
    }

    // 2. Find the Order in the Database
    const order = await Order.findOne({ where: { rzpOrderId: razorpay_order_id } });
    
    if (!order) {
      return res.status(404).json({ msg: 'Order not found.' });
    }

    // 3. Update the Order Status to PAID
    order.status = 'PAID';
    order.rzpPaymentId = razorpay_payment_id;
    order.rzpSignature = razorpay_signature;
    await order.save();

    // 4. Fire the "Order Confirmed" Email Notification
    try {
      const user = await User.findByPk(order.userId);
      await sendEmail({
        email: user.email,
        subject: 'Order Confirmed - Coloured Corners',
        message: `Thank you for your purchase! Your payment of ₹${order.amount} has been successfully received. We are now processing your order (ID: ${order.id}).`
      });
    } catch (emailErr) {
      console.error('Failed to send payment confirmation email:', emailErr);
      // We don't throw an error here because the payment actually succeeded!
    }

    res.status(200).json({ 
      msg: 'Payment verified successfully', 
      orderId: order.id 
    });

  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ msg: 'Server error during payment verification' });
  }
};