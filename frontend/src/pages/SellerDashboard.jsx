import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [inventory, setInventory] = useState([]);
  
  // NEW STATE: Controls whether the modal is visible
  const [showModal, setShowModal] = useState(false);
  
  // NEW STATE: Holds the data the user is currently typing into the form
  const [formData, setFormData] = useState({
    name: '', sku: '', price: '', pStock: '', category: 'Apparel', status: 'DRAFT', isPre: false, imgs: '',
  });

  const fetchInventory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
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
        alert("🔒 Access Denied");
        return navigate('/dashboard'); 
      }
      setAuthorized(true);
      fetchInventory();
    } catch (e) {
      navigate('/signin');
    }
  }, [navigate, fetchInventory]);

  // NEW FUNCTION: Handles the form submission
  const handleAddProduct = async (e) => {
    e.preventDefault(); // Stops the page from refreshing
    try {
      const token = localStorage.getItem('token');

      // We convert the single URL string into an Array, because Postgres expects an Array!
      const payload = {
        ...formData,
        imgs: formData.imgs ? [formData.imgs] : [] 
      };
      
      // Send the formData state to the backend POST route we just made
      await axios.post(`${backendUrl}/products`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('✅ Product added successfully!');
      setShowModal(false); // Close the modal
      fetchInventory();    // Re-fetch the data so the new item appears instantly
      
      // Reset the form for next time
      setFormData({ name: '', sku: '', price: '', pStock: '', category: 'Apparel', status: 'DRAFT', isPre: false, imgs: '' });
      
    } catch (err) {
      // If the backend BR-CAT-02 validation fails, it shows the error here!
      alert(`❌ ${err.response?.data?.message || 'Failed to add product'}`);
    }
  };

  // ... (Keep your existing handleUpdateStock function here) ...
  const handleUpdateStock = async (productId, currentStock) => {
    const newStockStr = window.prompt(`Enter new stock amount (Current: ${currentStock}):`, currentStock);
    if (newStockStr === null || newStockStr === "") return; 
    const parsedStock = parseInt(newStockStr, 10);
    if (isNaN(parsedStock) || parsedStock < 0) return alert("Please enter a valid positive number.");
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${backendUrl}/products/${productId}/stock`, { newStock: parsedStock }, { headers: { Authorization: `Bearer ${token}` } });
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

        <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
          <div style={{ flex: 1, padding: '30px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid #222' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>📦 Manage Inventory ({inventory.length})</h3>
              {/* This button now toggles the modal state to true */}
              <button onClick={() => setShowModal(true)} style={{ padding: '8px 16px', background: '#16A34A', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>+ Add</button>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {inventory.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#111', borderRadius: '8px', border: '1px solid #333' }}>
                  <span>{item.name} <span style={{fontSize: '12px', color: '#666'}}>({item.status})</span></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ color: item.pStock > 0 ? '#16A34A' : '#EF4444' }}>Stock: {item.pStock}</span>
                    <button onClick={() => handleUpdateStock(item.id, item.pStock)} style={{ padding: '4px 10px', background: '#333', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✏️ Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* ... Recent Sales box remains here ... */}
        </div>
      </div>

      {/* --- THE ADD PRODUCT MODAL --- */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#1A1A1A', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #333' }}>
            <h2>Add New Product</h2>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              
              <input required placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '10px', background: '#0A0A0A', color: 'white', border: '1px solid #444', borderRadius: '6px' }} />
              <input required placeholder="Unique SKU (e.g., TSHIRT-BLK-M)" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} style={{ padding: '10px', background: '#0A0A0A', color: 'white', border: '1px solid #444', borderRadius: '6px' }} />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <input required type="number" placeholder="Price ($)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ flex: 1, padding: '10px', background: '#0A0A0A', color: 'white', border: '1px solid #444', borderRadius: '6px' }} />
                <input required type="number" placeholder="Initial Stock" value={formData.pStock} onChange={e => setFormData({...formData, pStock: e.target.value})} style={{ flex: 1, padding: '10px', background: '#0A0A0A', color: 'white', border: '1px solid #444', borderRadius: '6px' }} />
              </div>

              <input 
                type="url" 
                placeholder="Paste an Image URL here" 
                value={formData.imgs} 
                onChange={e => setFormData({...formData, imgs: e.target.value})} 
                style={{ padding: '10px', background: '#0A0A0A', color: 'white', border: '1px solid #444', borderRadius: '6px' }} 
              />

              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ padding: '10px', background: '#0A0A0A', color: 'white', border: '1px solid #444', borderRadius: '6px' }}>
                <option value="DRAFT">Save as Draft</option>
                <option value="ACTIVE">Publish (Active)</option>
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#AAA' }}>
                <input type="checkbox" checked={formData.isPre} onChange={e => setFormData({...formData, isPre: e.target.checked})} />
                This is a Pre-order item
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #444', color: '#FFF', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#16A34A', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer' }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}