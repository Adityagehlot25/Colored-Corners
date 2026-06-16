import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function OrderFailed() {
  const navigate = useNavigate();
  
  // Extract the specific failure reason passed from the Razorpay callback in Checkout.jsx
  const { state } = useLocation();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Navbar />
      <div className="flex flex-col items-center justify-center mt-20 p-5">
        <div className="bg-white/5 border border-red-500/30 p-10 rounded-2xl text-center max-w-lg">
          <div className="text-6xl mb-5">❌</div>
          
          <h1 className="text-3xl font-bold text-red-500 mb-4">Payment Failed</h1>
          
          <p className="text-gray-400 mb-4">
            We could not process your payment. Your cart is perfectly safe. 
          </p>
          
          {/* Render the exact reason the payment failed (e.g., "Card declined by issuing bank") */}
          {state?.reason && (
            <p className="text-red-400 bg-red-500/10 p-3 rounded mb-8 text-sm border border-red-500/20">
              Reason: {state.reason}
            </p>
          )}
          
          <button 
            onClick={() => navigate('/checkout')}
            className="bg-[#333] hover:bg-[#444] text-white font-bold py-3 px-8 rounded-lg transition-colors w-full"
          >
            Review Cart & Try Again
          </button>
        </div>
      </div>
    </div>
  );
}