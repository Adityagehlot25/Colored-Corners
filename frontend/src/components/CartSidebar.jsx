import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar({ isOpen, onClose }) {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Calculate the total price dynamically
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Dark Overlay - Clicking it closes the cart */}
      <div 
        onClick={onClose}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999 }}
      />

      {/* The Slide-out Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '400px', backgroundColor: '#1A1A1A', 
        zIndex: 1000, padding: '20px', display: 'flex', flexDirection: 'column', color: '#FFF',
        boxShadow: '-5px 0 15px rgba(0,0,0,0.5)', overflowY: 'auto'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
          <h2>Your Cart</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#FFF', fontSize: '24px', cursor: 'pointer' }}>×</button>
        </div>

        {cart.length === 0 ? (
          <p style={{ color: '#888', marginTop: '20px', textAlign: 'center' }}>Your cart is empty.</p>
        ) : (
          <div style={{ flex: 1, marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {cart.map((item) => (
              <div key={item.product.id} style={{ display: 'flex', gap: '15px', background: '#0A0A0A', padding: '10px', borderRadius: '8px', border: '1px solid #333' }}>
                <img src={item.product.imgs[0]} alt={item.product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>{item.product.name}</h4>
                    <p style={{ margin: 0, color: '#16A34A', fontWeight: 'bold' }}>${item.product.price}</p>
                  </div>
                  
                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => updateQuantity(item.product.id, item.qty - 1)} style={{ padding: '2px 8px', background: '#333', border: 'none', color: '#FFF', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.qty + 1)} style={{ padding: '2px 8px', background: '#333', border: 'none', color: '#FFF', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                    
                    <button onClick={() => removeFromCart(item.product.id)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#EF4444', fontSize: '12px', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sticky Checkout Footer */}
        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid #333', paddingTop: '20px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
              <span>Subtotal:</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={() => {
                onClose();
                navigate('/checkout'); // We will build this page in Phase B!
              }}
              style={{ width: '100%', padding: '15px', background: '#16A34A', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}