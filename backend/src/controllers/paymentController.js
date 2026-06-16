const crypto = require('crypto');
const { Order, Product, OrderItem } = require('../models');
const { createRzpOrder } = require('../services/paymentService');
const { deductStockAtomically } = require('../services/inventoryService');

exports.initiateCheckout = async (req, res) => {
  try {
    const { cartItems, shippingAddress } = req.body;
    const currentUserId = req.user.id;

    let calculatedTotal = 0;
    const validatedItems = []; // Array to hold data for the order_items table

    // 1. Calculate totals and prepare the items
    for (const item of cartItems) {
      const dbProduct = await Product.findByPk(item.product.id);

      if (!dbProduct || dbProduct.pStock < item.qty) {
        return res.status(400).json({ message: `Item ${item.product.name} is invalid or out of stock.` });
      }

      calculatedTotal += Number(dbProduct.price) * item.qty;

      validatedItems.push({
        productId: dbProduct.id,
        quantity: item.qty,
        priceAtPurchase: dbProduct.price // Locking in the historical price
      });
    }

    // 2. Create the parent Order
    const newOrder = await Order.create({
      userId: currentUserId,
      amount: calculatedTotal,
      shippingAddress,
      status: 'PENDING'
    });

    // 3. Bulk insert all cart items into the OrderItem table, linking them to the newOrder
    const orderItemsPayload = validatedItems.map(item => ({
      ...item,
      orderId: newOrder.id
    }));
    await OrderItem.bulkCreate(orderItemsPayload);

    // 4. Request Razorpay Order ID
    const razorpayOrder = await createRzpOrder(calculatedTotal, newOrder.id);
    newOrder.rzpOrderId = razorpayOrder.id;
    await newOrder.save();

    res.status(200).json({
      orderId: newOrder.id,
      rzpOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    });
  } catch (error) {
    console.error('Checkout Initiation Error:', error);
    res.status(500).json({ message: 'Failed to initiate checkout process' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { rzpOrderId, rzpPaymentId, rzpSig, orderId } = req.body;
    const currentUserId = req.user.id;

    if (!rzpOrderId || !rzpPaymentId || !rzpSig || !orderId) {
      return res.status(400).json({ message: 'Missing required payment parameters' });
    }

    const signatureBody = rzpOrderId + "|" + rzpPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody)
      .digest('hex');

    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(rzpSig)
    );

    if (!isSignatureValid) {
      return res.status(400).json({ message: 'Invalid payment signature.' });
    }

    // Update state to PAID
    const [numberOfAffectedRows] = await Order.update(
      { status: 'PAID', rzpPaymentId: rzpPaymentId, rzpSignature: rzpSig },
      { where: { id: orderId, userId: currentUserId, rzpOrderId: rzpOrderId, status: 'PENDING' } }
    );

    if (numberOfAffectedRows === 0) {
      return res.status(400).json({ message: 'Order update failed.' });
    }

    // ==========================================
    // THE ATOMIC DEDUCTION CALL
    // ==========================================
    try {
      await deductStockAtomically(orderId);
    } catch (deductionError) {
      console.error('CRITICAL: Payment successful, but stock deduction failed:', deductionError);
      // NOTE: In a production environment, this is where you would trigger an automated 
      // refund API call to Razorpay because we cannot fulfill the order. 
      // For now, we update the status to alert the admin.
      await Order.update({ status: 'CANCELLED' }, { where: { id: orderId } });
      return res.status(409).json({ message: 'Payment secured, but items sold out during checkout. A refund will be issued.' });
    }

    res.status(200).json({ message: 'Payment verified and stock deducted successfully.' });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ message: 'Internal server error during verification' });
  }
};