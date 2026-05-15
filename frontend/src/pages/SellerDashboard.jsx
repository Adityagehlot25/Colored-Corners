import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return navigate('/signin');
    }

    try {
      // Security Check: Decode token and verify role
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      if (payload.role !== 'SELLER' && payload.role !== 'ADMIN') {
        alert("🔒 Access Denied: You must be a registered Seller to view this page.");
        return navigate('/dashboard'); // Kick them back to the customer page!
      }
      
      setAuthorized(true);
    } catch (e) {
      navigate('/signin');
    }
  }, [navigate]);

  // Don't render anything until we confirm they are a seller
  if (!authorized) return null; 

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#FFFFFF', fontFamily: 'sans-serif' }}>
      
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#16A34A', marginBottom: '10px' }}>🏪 Seller Operations Hub</h1>
        <p style={{ color: '#888' }}>
          Welcome back. Only approved Sellers can access these tools.
        </p>

        {/* Placeholder for Seller Content */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
          <div style={{ flex: 1, padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid #222' }}>
            <h3>📦 Manage Inventory</h3>
            <button style={{ padding: '10px 20px', marginTop: '10px', background: '#16A34A', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>+ Add New Product</button>
          </div>
          <div style={{ flex: 1, padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid #222' }}>
            <h3>📈 Recent Sales</h3>
            <p style={{ color: '#555', marginTop: '10px' }}>No sales yet this week.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
