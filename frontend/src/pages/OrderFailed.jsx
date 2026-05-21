import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function OrderFailed() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Navbar />
      <div className="flex flex-col items-center justify-center mt-20 p-5">
        <div className="bg-white/5 border border-red-500/30 p-10 rounded-2xl text-center max-w-lg">
          <div className="text-6xl mb-5">❌</div>
          <h1 className="text-3xl font-bold text-red-500 mb-4">Payment Failed</h1>
          <p className="text-gray-400 mb-8">
            We could not process your payment. Do not worry, your cart is perfectly safe. Please try again with a different payment method.
          </p>
          <button 
            onClick={() => nav('/checkout')}
            className="bg-[#333] hover:bg-[#444] text-white font-bold py-3 px-8 rounded-lg transition-colors w-full"
          >
            Review Cart & Try Again
          </button>
        </div>
      </div>
    </div>
  );
}