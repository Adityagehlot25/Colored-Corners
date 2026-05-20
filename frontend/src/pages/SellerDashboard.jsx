import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [showModal, setShowModal] = useState(false);
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
        toast.error("Access Denied: Seller account required");
        return navigate('/dashboard');
      }
      setAuthorized(true);
      fetchInventory();
    } catch (e) {
      navigate('/signin');
    }
  }, [navigate, fetchInventory]);

  const handleOpenEdit = (product) => {
    setFormData({
      name: product.name, sku: product.sku, price: product.price, pStock: product.pStock,
      category: product.category || 'Apparel', status: product.status, isPre: product.isPre,
      imgs: product.imgs && product.imgs.length > 0 ? product.imgs[0] : ''
    });
    setEditProductId(product.id);
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setFormData({ name: '', sku: '', price: '', pStock: '', category: 'Apparel', status: 'DRAFT', isPre: false, imgs: '' });
    setEditProductId(null);
    setShowModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { ...formData, imgs: formData.imgs ? [formData.imgs] : [] };

      if (editProductId) {
        await axios.put(`${backendUrl}/products/${editProductId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product updated successfully!');
      } else {
        await axios.post(`${backendUrl}/products`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product added successfully!');
      }

      setShowModal(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Navbar />
      <div className="p-10 max-w-[1200px] mx-auto">
        <h1 className="text-green-600 mb-2 text-3xl font-bold">🏪 Seller Operations Hub</h1>
        <p className="text-gray-400">Welcome back. Only approved Sellers can access these tools.</p>

        <div className="flex flex-col lg:flex-row gap-5 mt-10">
          <div className="flex-1 p-8 bg-white/5 rounded-2xl border border-[#222]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold">📦 Manage Inventory ({inventory.length})</h3>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-500 transition-colors font-medium"
              >
                + Add
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {inventory.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-[#111] rounded-lg border border-[#333]">
                  <span className="font-medium">
                    {item.name} <span className="text-xs text-gray-500 ml-2">({item.status})</span>
                  </span>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold ${item.pStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      Stock: {item.pStock}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3 py-1.5 bg-[#333] text-white rounded cursor-pointer text-xs hover:bg-gray-700 transition-colors"
                    >
                      ✏️ Edit Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-8 bg-white/5 rounded-2xl border border-[#222]">
            <h3 className="text-xl font-semibold">📈 Recent Sales</h3>
            <p className="text-gray-500 mt-3">No sales yet this week.</p>
          </div>
        </div>
      </div>

      {/* --- THE MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000] p-4">
          <div className="bg-[#1A1A1A] p-8 rounded-2xl w-full max-w-[450px] border border-[#333] shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">{editProductId ? 'Edit Product' : 'Add New Product'}</h2>

            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">

              <input required placeholder="Product Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="p-3 bg-[#0A0A0A] text-white border border-[#444] rounded-lg focus:outline-none focus:border-green-600 transition-colors" />
              <input required placeholder="Unique SKU (e.g., TSHIRT-BLK-M)" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="p-3 bg-[#0A0A0A] text-white border border-[#444] rounded-lg focus:outline-none focus:border-green-600 transition-colors" />

              <div className="flex gap-3">
                <input required type="number" placeholder="Price (₹)" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="flex-1 p-3 bg-[#0A0A0A] text-white border border-[#444] rounded-lg focus:outline-none focus:border-green-600 transition-colors" />
                <input required type="number" placeholder="Stock Level" value={formData.pStock} onChange={e => setFormData({ ...formData, pStock: e.target.value })} className="flex-1 p-3 bg-[#0A0A0A] text-white border border-[#444] rounded-lg focus:outline-none focus:border-green-600 transition-colors" />
              </div>

              <input type="url" placeholder="Paste an Image URL here" value={formData.imgs} onChange={e => setFormData({ ...formData, imgs: e.target.value })} className="p-3 bg-[#0A0A0A] text-white border border-[#444] rounded-lg focus:outline-none focus:border-green-600 transition-colors" />

              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="p-3 bg-[#0A0A0A] text-white border border-[#444] rounded-lg focus:outline-none focus:border-green-600 transition-colors cursor-pointer">
                <option value="DRAFT">Save as Draft</option>
                <option value="ACTIVE">Publish (Active)</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>

              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer mt-1">
                <input type="checkbox" checked={formData.isPre} onChange={e => setFormData({ ...formData, isPre: e.target.checked })} className="w-4 h-4 accent-green-600" />
                This is a Pre-order item
              </label>

              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 p-3 bg-transparent border border-[#444] text-white rounded-lg cursor-pointer hover:bg-white/5 transition-colors font-medium">Cancel</button>
                <button type="submit" className="flex-1 p-3 bg-green-600 border-none text-white rounded-lg cursor-pointer hover:bg-green-500 transition-colors font-medium">
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