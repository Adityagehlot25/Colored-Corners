import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartSidebar from './CartSidebar';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart } = useCart();

  // 1. Decode the JWT to find out who is logged in
  let userRole = 'CUSTOMER';
  const token = localStorage.getItem('token');

  // Counts total items (e.g., 2 shirts + 1 laptop = 3)
  const cartItemCount = cart.reduce((total, item) => total + item.qty, 0);

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userRole = payload.role; // Will be CUSTOMER, SELLER, or ADMIN
    } catch (e) {
      console.error('Failed to parse token');
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/signin');
  };

  // Helper function for styling active links
  const getLinkStyle = (path) => ({
    color: location.pathname === path ? '#FFFFFF' : '#888888',
    textDecoration: 'none',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: location.pathname === path ? 'rgba(255,255,255,0.1)' : 'transparent',
    transition: 'all 0.2s ease'
  });

  // return (
  //   <nav style={{
  //     display: 'flex',
  //     justifyContent: 'space-between',
  //     alignItems: 'center',
  //     padding: '15px 40px',
  //     background: 'rgba(10, 10, 10, 0.8)',
  //     backdropFilter: 'blur(10px)',
  //     borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  //     position: 'sticky',
  //     top: 0,
  //     zIndex: 100
  //   }}>
  //     <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#FFF' }}>
  //       Coloured Corners
  //     </div>

  //     <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
  //       {/* EVERYONE can see the Customer Dashboard */}
  //       <Link to="/dashboard" style={getLinkStyle('/dashboard')}>
  //         🛍️ Marketplace
  //       </Link>

  //       {/* ONLY Sellers and Admins can see this button! */}
  //       {(userRole === 'SELLER' || userRole === 'ADMIN') && (
  //         <Link to="/seller-dashboard" style={getLinkStyle('/seller-dashboard')}>
  //           🏪 Seller Hub
  //         </Link>
  //       )}

  //       <button
  //         onClick={() => setIsCartOpen(true)}
  //         style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', fontSize: '16px', position: 'relative', marginRight: '20px' }}
  //       >
  //         🛒 Cart
  //         {cartItemCount > 0 && (
  //           <span style={{
  //             position: 'absolute', top: '-8px', right: '-15px', background: '#EF4444',
  //             color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px', fontWeight: 'bold'
  //           }}>
  //             {cartItemCount}
  //           </span>
  //         )}
  //       </button>

  //       <button
  //         onClick={handleLogout}
  //         style={{
  //           background: 'transparent',
  //           color: '#FF453A',
  //           border: '1px solid rgba(255, 69, 58, 0.3)',
  //           padding: '8px 16px',
  //           borderRadius: '8px',
  //           cursor: 'pointer',
  //           marginLeft: '10px'
  //         }}
  //       >
  //         Logout
  //       </button>
  //     </div>
  //     <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
  //   </nav>
  // );
  return (
    <> {/* <-- ADD THIS FRAGMENT OPENING TAG */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 40px',
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#FFF' }}>
          Coloured Corners
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/dashboard" style={getLinkStyle('/dashboard')}>
            🛍️ Marketplace
          </Link>

          {(userRole === 'SELLER' || userRole === 'ADMIN') && (
            <Link to="/seller-dashboard" style={getLinkStyle('/seller-dashboard')}>
              🏪 Seller Hub
            </Link>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', fontSize: '16px', position: 'relative', marginRight: '20px' }}
          >
            🛒 Cart
            {cartItemCount > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-15px', background: '#EF4444',
                color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px', fontWeight: 'bold'
              }}>
                {cartItemCount}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: '#FF453A',
              border: '1px solid rgba(255, 69, 58, 0.3)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              marginLeft: '10px'
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* MOVE THE SIDEBAR DOWN HERE, OUTSIDE THE NAV! */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );

}
