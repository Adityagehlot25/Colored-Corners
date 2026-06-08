import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();

  // 1. Determine Auth State
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token; // Returns true if token exists, false if null
  let userRole = 'CUSTOMER';

  // 2. Safely parse role only if logged in
  if (isLoggedIn) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role;
    } catch (e) {
      console.error('Failed to parse token');
    }
  }

  const cartItemCount = cart.reduce((total, item) => total + item.qty, 0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    window.location.href = '/signin';
  };

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
        <Link to="/dashboard" className="font-bold text-xl text-white hover:text-green-500 transition-colors">
          Coloured Corners
        </Link>

        <div className="flex gap-4 items-center">
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
            className="relative px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg transition-all"
          >
            🛒 Cart
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-green-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* --- DYNAMIC AUTHENTICATION RENDER --- */}
          {isLoggedIn ? (
            <>
              <Link to="/profile" className={getLinkClass('/profile')}>
                👤 Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-transparent text-red-500 border border-red-500/30 px-4 py-2 rounded-lg cursor-pointer ml-2 hover:bg-red-500/10 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
             <Link
               to="/signin"
               className="bg-green-600 text-white px-5 py-2 rounded-lg ml-2 hover:bg-green-500 transition-colors font-bold"
             >
               Sign In
             </Link>
          )}
        </div>
      </nav>

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}