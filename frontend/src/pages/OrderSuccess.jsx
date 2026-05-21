import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function OrderSuccess() {
  const navigate = useNavigate();
  
  // We extract the internal 'orderId' passed from the Checkout route state
  const { state } = useLocation();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Navbar />
      <div className="flex flex-col items-center justify-center mt-20 p-5">
        <div className="bg-white/5 border border-green-500/30 p-10 rounded-2xl text-center max-w-lg">
          <div className="text-6xl mb-5">🎉</div>
          
          <h1 className="text-3xl font-bold text-green-500 mb-4">Payment Successful!</h1>
          
          {/* Display the Order ID if it was successfully passed through router state */}
          {state?.orderId && (
            <p className="text-gray-300 font-mono bg-black/50 p-2 rounded mb-4 text-sm">
              Order ID: {state.orderId}
            </p>
          )}
          
          <p className="text-gray-400 mb-8">
            Your order has been placed and is currently being processed. We will send a confirmation email shortly.
          </p>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-lg transition-colors w-full"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}