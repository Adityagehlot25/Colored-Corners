const crypto = require('crypto');
const { Order, Product } = require('../models');
const { createRzpOrder } = require('../services/paymentService');

/**
 * Initiates the checkout process.
 * Validates cart stock, recalculates prices securely on the server, and generates a Razorpay Order.
 */
exports.initiateCheckout = async (req, res) => {
  try {
    const { cartItems, shippingAddress } = req.body;
    const currentUserId = req.user.id;

    // SECURITY: Never trust the frontend's total price. 
    // We must fetch the live prices from our database to prevent manipulation.
    let calculatedTotal = 0;
    
    for (const item of cartItems) {
      const dbProduct = await Product.findByPk(item.product.id);
      
      // Validate that the product exists and we have enough physical stock
      if (!dbProduct || dbProduct.pStock < item.qty) {
        return res.status(400).json({ 
          message: `Item ${item.product.name} is invalid or out of stock.` 
        });
      }
      calculatedTotal += Number(dbProduct.price) * item.qty;
    }

    // 1. Create the initial order in our database with a PENDING state
    const newOrder = await Order.create({
      userId: currentUserId,
      amount: calculatedTotal,
      shippingAddress,
      status: 'PENDING'
    });

    // 2. Request a unique Order ID from the Razorpay API
    const razorpayOrder = await createRzpOrder(calculatedTotal, newOrder.id);
    
    // 3. Link the Razorpay ID to our internal order and save
    newOrder.rzpOrderId = razorpayOrder.id;
    await newOrder.save();

    // 4. Send the required data back to the frontend to launch the payment modal
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

/**
 * Verifies the cryptographic signature from Razorpay after a successful client-side payment.
 * If valid, transitions the order to PAID.
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { rzpOrderId, rzpPaymentId, rzpSig, orderId } = req.body;
    const currentUserId = req.user.id;

    // Ensure all required cryptographic proofs were sent by the frontend
    if (!rzpOrderId || !rzpPaymentId || !rzpSig || !orderId) {
      return res.status(400).json({ message: 'Missing required payment parameters' });
    }

    // 1. Recreate the signature using our private backend secret
    const signatureBody = rzpOrderId + "|" + rzpPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(signatureBody)
      .digest('hex');

    // 2. SECURITY: Use timingSafeEqual to prevent timing attacks when comparing hashes
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(rzpSig)
    );

    if (!isSignatureValid) {
      return res.status(400).json({ message: 'Invalid payment signature. Possible tampering detected.' });
    }

    // 3. Update the internal order status to PAID
    // We strictly ensure we only update if the order belongs to the user and is currently PENDING.
    const [numberOfAffectedRows] = await Order.update(
      { 
        status: 'PAID', 
        rzpPaymentId: rzpPaymentId, 
        rzpSignature: rzpSig 
      },
      { 
        where: { 
          id: orderId, 
          userId: currentUserId, 
          rzpOrderId: rzpOrderId, 
          status: 'PENDING' 
        } 
      }
    );

    // If no rows were updated, the order either doesn't exist, isn't PENDING, or belongs to someone else
    if (numberOfAffectedRows === 0) {
      return res.status(400).json({ message: 'Order update failed. Order may already be processed.' });
    }

    res.status(200).json({ message: 'Payment verified successfully.' });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({ message: 'Internal server error during verification' });
  }
};