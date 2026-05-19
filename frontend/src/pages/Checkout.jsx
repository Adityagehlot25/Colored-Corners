import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import Navbar from '../components/Navbar';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

export default function Checkout() {
  const { cart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);
  const token = localStorage.getItem('token');

  const handlePayment = async () => {
    if (!token) return alert('Please login to continue');
    setLoading(true);

    try {
      // 1. Tell our backend to create a PENDING order
      const { data: orderData } = await axios.post(
        `${backendUrl}/payments/checkout`,
        { cartItems: cart },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Configure the Razorpay Modal
      const options = {
        key: rzpKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Coloured Corners',
        description: 'Test Transaction',
        order_id: orderData.rzpOrderId, // This is the Idempotency Key!
        handler: async function (response) {
          // 3. Razorpay says success! Send the proof to our backend to verify
          try {
            await axios.post(
              `${backendUrl}/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                internal_order_id: orderData.orderId,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            // 4. Verification passed! Clear the cart and celebrate
            alert('🎉 Payment Successful! Order is PAID.');
            cart.forEach(item => removeFromCart(item.product.id)); 
            navigate('/dashboard'); // Send them back home

          } catch (verifyError) {
            alert('❌ Payment verification failed. Please contact support.');
          }
        },
        theme: {
          color: '#16A34A' // Matches your green Tailwind theme!
        }
      };

      // Open the Razorpay Modal
      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (err) {
      console.error('Checkout error:', err);
      alert('Could not initiate checkout. Is your backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <Navbar />
        <div className="text-center mt-20">
          <h2>Your cart is empty!</h2>
          <button onClick={() => navigate('/dashboard')} className="mt-5 text-green-600 underline">Go Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Navbar />
      <div className="p-10 max-w-[800px] mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>
        
        <div className="bg-white/5 p-8 rounded-2xl border border-[#222]">
          <h3 className="text-xl font-semibold mb-5 border-b border-[#333] pb-3">Order Summary</h3>
          
          <div className="flex flex-col gap-4 mb-8">
            {cart.map(item => (
              <div key={item.product.id} className="flex justify-between">
                <span className="text-gray-300">{item.qty}x {item.product.name}</span>
                <span className="font-medium">${(item.product.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-[#333] pt-5 mb-8">
            <span className="text-xl">Total to Pay:</span>
            <span className="text-2xl font-bold text-green-600">${cartTotal.toFixed(2)}</span>
          </div>

          <button 
            onClick={handlePayment}
            disabled={loading}
            className={`w-full p-4 rounded-lg text-lg font-bold transition-all ${
              loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white cursor-pointer'
            }`}
          >
            {loading ? 'Processing...' : `Pay $${cartTotal.toFixed(2)} Securely`}
          </button>
        </div>
      </div>
    </div>
  );
}