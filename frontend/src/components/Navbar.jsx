import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();

  let userRole = 'CUSTOMER';
  const token = localStorage.getItem('token');
  const cartItemCount = cart.reduce((total, item) => total + item.qty, 0);

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch (e) {
      console.error('Failed to parse token');
    }
  }

  const handleLogout = () => {
    // 1. Remove the auth token
    localStorage.removeItem('token');
    
    // 2. Wipe the cart data from the browser
    localStorage.removeItem('cart');
    // 3. Force a hard redirect. 
    // We use window.location instead of navigate('/signin') because a hard 
    // reload completely flushes out the React Context memory so the cart UI resets to 0 instantly.
    window.location.href = '/signin';
  };

  // Helper function for styling active links with Tailwind
  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `px-4 py-2 rounded-lg transition-all duration-200 ${
      isActive 
        ? 'text-white font-bold bg-white/10' 
        : 'text-gray-400 font-normal hover:bg-white/5 hover:text-gray-200'
    }`;
  };

  return (
    <>
      <nav className="flex justify-between items-center px-10 py-4 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-[100]">
        <div className="font-bold text-xl text-white">
          Coloured Corners
        </div>

        <div className="flex gap-5 items-center">
          <Link to="/dashboard" className={getLinkClass('/dashboard')}>
            🛍️ Marketplace
          </Link>

          {(userRole === 'SELLER' || userRole === 'ADMIN') && (
            <Link to="/seller-dashboard" className={getLinkClass('/seller-dashboard')}>
              🏪 Seller Hub
            </Link>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-transparent border-none text-white cursor-pointer text-base mr-5"
          >
            🛒 Cart
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs font-bold">
                {cartItemCount}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="bg-transparent text-red-500 border border-red-500/30 px-4 py-2 rounded-lg cursor-pointer ml-2 hover:bg-red-500/10 transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}