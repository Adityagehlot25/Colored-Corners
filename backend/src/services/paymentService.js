const Razorpay = require('razorpay');

// Initialize Razorpay with your Test Keys
const rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Generates a unique Order ID from Razorpay.
 * @param {number} amount - The total amount in standard currency (e.g., Dollars/Rupees)
 * @param {string} receiptId - Your internal database Order ID
 */
const createRzpOrder = async (amount, receiptId) => {
    const options = {
        amount: Math.round(amount * 100), // CRITICAL: Razorpay expects the smallest unit (paise/cents). ₹10.00 = 1000.
        currency: 'INR', // Change to USD if you are charging in dollars
        receipt: receiptId,
    };

    return await rzp.orders.create(options);
};

module.exports = { createRzpOrder };