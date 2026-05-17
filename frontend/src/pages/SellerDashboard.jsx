import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [inventory, setInventory] = useState([]);

  // Wrapped in useCallback so we can call it after updating stock to refresh the list
  const fetchInventory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      // Notice we are hitting /products/seller and passing the token!
      const res = await axios.get(`${backendUrl}/products/seller`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/signin');

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'SELLER' && payload.role !== 'ADMIN') {
        alert("🔒 Access Denied: You must be a registered Seller to view this page.");
        return navigate('/dashboard'); 
      }
      setAuthorized(true);
      fetchInventory();
    } catch (e) {
      navigate('/signin');
    }
  }, [navigate, fetchInventory]);

  const handleUpdateStock = async (productId, currentStock) => {
    const newStockStr = window.prompt(`Enter new stock amount (Current: ${currentStock}):`, currentStock);
    if (newStockStr === null || newStockStr === "") return; // User clicked cancel

    const parsedStock = parseInt(newStockStr, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return alert("Please enter a valid positive number.");
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${backendUrl}/products/${productId}/stock`, 
        { newStock: parsedStock },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh the list to show the new stock number
      fetchInventory(); 
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Failed to update stock'}`);
    }
  };

  if (!authorized) return null; 

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#FFFFFF', fontFamily: 'sans-serif' }}>
      <Navbar />
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#16A34A', marginBottom: '10px' }}>🏪 Seller Operations Hub</h1>
        <p style={{ color: '#888' }}>Welcome back. Only approved Sellers can access these tools.</p>

        <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
          {/* Inventory Box */}
          <div style={{ flex: 1, padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>📦 Manage Inventory ({inventory.length})</h3>
              <button style={{ padding: '8px 16px', background: '#16A34A', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>+ Add</button>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {inventory.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#111', borderRadius: '8px', border: '1px solid #333' }}>
                  <span>{item.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ color: item.pStock > 0 ? '#16A34A' : '#EF4444' }}>
                      Stock: {item.pStock}
                    </span>
                    <button 
                      onClick={() => handleUpdateStock(item.id, item.pStock)}
                      style={{ padding: '4px 10px', background: '#333', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
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