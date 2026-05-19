const crypto = require('crypto');
const Order = require('../models/Order');
const { createRzpOrder } = require('../services/paymentService');

// STEP 1: The user clicks "Checkout"
exports.initiateCheckout = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const userId = req.user.id; // From your JWT auth middleware

    // SECURITY RULE: NEVER trust the frontend total. Always recalculate on the backend.
    // For Phase B MVP, we assume cartItems has { price, qty }
    const calculatedTotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

    // 1. Create a PENDING order in our PostgreSQL database
    const newOrder = await Order.create({
      userId,
      amount: calculatedTotal,
      status: 'PENDING'
    });

    // 2. Ask Razorpay for a unique Order ID (Idempotency)
    const rzpOrder = await createRzpOrder(calculatedTotal, newOrder.id);

    // 3. Save the Razorpay Order ID to our database
    newOrder.rzpOrderId = rzpOrder.id;
    await newOrder.save();

    // 4. Send it back to the frontend to launch the payment modal
    res.status(200).json({
      orderId: newOrder.id,
      rzpOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency
    });

  } catch (error) {
    console.error('Checkout Error:', error);
    res.status(500).json({ message: 'Failed to initiate checkout' });
  }
};

// STEP 2: The payment succeeds, and Razorpay sends us proof
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, internal_order_id } = req.body;

    // SECURITY RULE: The HMAC Validation
    // We recreate the signature using our secret key to ensure the frontend wasn't hacked.
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // The payment is 100% legitimate!
      
      // Update our database state to PAID (BR-ORD-01)
      await Order.update(
        { 
          status: 'PAID', 
          rzpPaymentId: razorpay_payment_id, 
          rzpSignature: razorpay_signature 
        },
        { where: { id: internal_order_id } }
      );

      // (Later in Phase C, we will deduct physical stock here!)

      res.status(200).json({ message: 'Payment verified successfully!' });
    } else {
      // Someone tampered with the data
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};