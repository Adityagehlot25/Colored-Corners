import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar({ isOpen, onClose }) {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Dark Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-[999] cursor-pointer"
      />

      {/* The Slide-out Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] bg-[#1A1A1A] z-[1000] p-5 flex flex-col text-white shadow-[-5px_0_15px_rgba(0,0,0,0.5)] overflow-y-auto">

        <div className="flex justify-between items-center border-b border-gray-800 pb-4">
          <h2 className="text-xl font-bold m-0">Your Cart</h2>
          <button onClick={onClose} className="bg-transparent border-none text-white text-2xl cursor-pointer hover:text-gray-400 transition-colors">
            &times;
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="text-gray-400 mt-5 text-center">Your cart is empty.</p>
        ) : (
          <div className="flex-1 mt-5 flex flex-col gap-4">
            {cart.map((item) => (
              <div key={item.product.id} className="flex gap-4 bg-[#0A0A0A] p-3 rounded-lg border border-gray-800">
                <img src={item.product.imgs[0]} alt={item.product.name} className="w-20 h-20 object-cover rounded-md" />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="m-0 mb-1 text-sm">{item.product.name}</h4>
                    <p className="m-0 text-green-600 font-bold">₹{item.product.price}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.qty - 1)}
                      className="px-2 py-0.5 bg-gray-800 text-white rounded cursor-pointer hover:bg-gray-700 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-sm w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.qty + 1)}
                      className="px-2 py-0.5 bg-gray-800 text-white rounded cursor-pointer hover:bg-gray-700 transition-colors"
                    >
                      +
                    </button>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="ml-auto bg-transparent border-none text-red-500 text-xs cursor-pointer hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sticky Checkout Footer */}
        {cart.length > 0 && (
          <div className="border-t border-gray-800 pt-5 mt-5">
            <div className="flex justify-between text-lg font-bold mb-4">
              <span>Subtotal:</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => {
                const token = localStorage.getItem('token');
                onClose();
                
                if (!token) {
                  // User is a guest. Send to sign-in with a redirect parameter.
                  navigate('/signin?redirect=/checkout');
                } else {
                  // User is logged in. Proceed normally.
                  navigate('/checkout');
                }
              }}
              className="w-full py-3 bg-green-600 text-white rounded-lg text-base font-bold cursor-pointer hover:bg-green-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}