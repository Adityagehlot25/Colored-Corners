import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/signin');
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#FFFFFF', fontFamily: 'sans-serif' }}>
      
      {/* --- Drop the Navbar here --- */}
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '10px' }}>Welcome to the Marketplace</h1>
        <p style={{ color: '#888' }}>
          This is the Customer view. Anyone who is logged in can see this page, browse products, and make purchases.
        </p>

        {/* Placeholder for Customer Content */}
        <div style={{ 
          marginTop: '40px', 
          padding: '40px', 
          border: '1px dashed #333', 
          borderRadius: '16px', 
          textAlign: 'center',
          color: '#555'
        }}>
          <h2>🛍️ Product Grid Will Go Here</h2>
        </div>
      </div>
    </div>
  );
}
