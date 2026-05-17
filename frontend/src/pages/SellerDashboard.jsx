import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [inventory, setInventory] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  
  // NEW: Tracks if we are editing an existing item. If null, we are adding a new one.
  const [editProductId, setEditProductId] = useState(null); 
  
  const [formData, setFormData] = useState({
    name: '', sku: '', price: '', pStock: '', category: 'Apparel', status: 'DRAFT', isPre: false, imgs: ''
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

  // NEW: Opens the modal and pre-fills it with the chosen product's data
  const handleOpenEdit = (product) => {
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      pStock: product.pStock,
      category: product.category || 'Apparel',
      status: product.status,
      isPre: product.isPre,
      imgs: product.imgs && product.imgs.length > 0 ? product.imgs[0] : '' 
    });
    setEditProductId(product.id); // Tell React we are in "Edit Mode"
    setShowModal(true);
  };

  // NEW: Opens the modal for adding a fresh product
  const handleOpenAdd = () => {
    setFormData({ name: '', sku: '', price: '', pStock: '', category: 'Apparel', status: 'DRAFT', isPre: false, imgs: '' });
    setEditProductId(null); // Tell React we are in "Add Mode"
    setShowModal(true);
  };

  // UPGRADED: Handles both POST (Add) and PUT (Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault(); 
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        imgs: formData.imgs ? [formData.imgs] : [] 
      };

      if (editProductId) {
        // We are EDITING
        await axios.put(`${backendUrl}/products/${editProductId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ Product updated successfully!');
      } else {
        // We are ADDING
        await axios.post(`${backendUrl}/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('✅ Product added successfully!');
      }
      
      setShowModal(false);
      fetchInventory();    
      
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || 'Failed to save product'}`);
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
              <button onClick={handleOpenAdd} style={{ padding: '8px 16px', background: '#16A34A', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>+ Add</button>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {inventory.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#111', borderRadius: '8px', border: '1px solid #333' }}>
                  <span>{item.name} <span style={{fontSize: '12px', color: '#666'}}>({item.status})</span></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ color: item.pStock > 0 ? '#16A34A' : '#EF4444' }}>Stock: {item.pStock}</span>
                    {/* The Edit button now triggers the full modal! */}
                    <button onClick={() => handleOpenEdit(item)} style={{ padding: '4px 10px', background: '#333', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>✏️ Edit Details</button>
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

      {/* --- THE RECYCLED MODAL (ADD & EDIT) --- */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#1A1A1A', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #333' }}>
            {/* Dynamically change the title */}
            <h2>{editProductId ? 'Edit Product' : 'Add New Product'}</h2>
            
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              
              <input required placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '10px', background: '#0A0A0A', color: 'white', border: '1px solid #444', borderRadius: '6px' }} />
              <input required placeholder="Unique SKU (e.g., TSHIRT-BLK-M)" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} style={{ padding: '10px', background: '#0A0A0A', color: 'white', border: '1px solid #444', borderRadius: '6px' }} />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <input required type="number" placeholder="Price ($)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={{ flex: 1, padding: '10px', background: '#0A0A0A', color: 'white', border: '1px solid #444', borderRadius: '6px' }} />
                <input required type="number" placeholder="Stock Level" value={formData.pStock} onChange={e => setFormData({...formData, pStock: e.target.value})} style={{ flex: 1, padding: '10px', background: '#0A0A0A', color: 'white', border: '1px solid #444', borderRadius: '6px' }} />
              </div>

              <input type="url" placeholder="Paste an Image URL here" value={formData.imgs} onChange={e => setFormData({...formData, imgs: e.target.value})} style={{ padding: '10px', background: '#0A0A0A', color: 'white', border: '1px solid #444', borderRadius: '6px' }} />

              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ padding: '10px', background: '#0A0A0A', color: 'white', border: '1px solid #444', borderRadius: '6px' }}>
                <option value="DRAFT">Save as Draft</option>
                <option value="ACTIVE">Publish (Active)</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#AAA' }}>
                <input type="checkbox" checked={formData.isPre} onChange={e => setFormData({...formData, isPre: e.target.checked})} />
                This is a Pre-order item
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #444', color: '#FFF', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '10px', background: '#16A34A', border: 'none', color: '#FFF', borderRadius: '6px', cursor: 'pointer' }}>
                  {editProductId ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}