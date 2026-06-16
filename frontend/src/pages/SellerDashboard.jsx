import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  
  // Tab State: 'inventory' | 'orders'
  const [activeTab, setActiveTab] = useState('inventory');

  // Inventory States
  const [inventory, setInventory] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProductId, setEditProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', sku: '', price: '', pStock: '', category: 'Apparel', status: 'DRAFT', isPre: false, imgs: ''
  });

  // Order States
  const [orders, setOrders] = useState([]);
  const [shippingModal, setShippingModal] = useState({ isOpen: false, orderId: null });
  const [trackingData, setTrackingData] = useState({ carrier: '', trackingId: '' });

  const authToken = localStorage.getItem('token');

  // --- DATA FETCHING ---

  const fetchInventory = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/products/seller`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setInventory(res.data);
    } catch (err) {
      toast.error('Failed to load inventory.');
    }
  }, [authToken]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/orders/seller`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setOrders(res.data);
    } catch (err) {
      toast.error('Failed to load orders.');
    }
  }, [authToken]);

  // Auth & Initial Data Load
  useEffect(() => {
    if (!authToken) return navigate('/signin');

    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      if (payload.role !== 'SELLER' && payload.role !== 'ADMIN') {
        toast.error("Access Denied: Seller account required.");
        return navigate('/dashboard');
      }
      setAuthorized(true);
      fetchInventory();
      fetchOrders();
    } catch (e) {
      navigate('/signin');
    }
  }, [navigate, fetchInventory, fetchOrders, authToken]);

  // --- INVENTORY HANDLERS ---
  
  const handleOpenEdit = (product) => {
    setFormData({
      name: product.name, sku: product.sku, price: product.price, pStock: product.pStock,
      category: product.category || 'Apparel', status: product.status, isPre: product.isPre,
      imgs: product.imgs && product.imgs.length > 0 ? product.imgs[0] : ''
    });
    setEditProductId(product.id);
    setShowProductModal(true);
  };

  const handleOpenAdd = () => {
    setFormData({ name: '', sku: '', price: '', pStock: '', category: 'Apparel', status: 'DRAFT', isPre: false, imgs: '' });
    setEditProductId(null);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, imgs: formData.imgs ? [formData.imgs] : [] };

      if (editProductId) {
        await axios.put(`${backendUrl}/products/${editProductId}`, payload, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        toast.success('Product updated successfully!');
      } else {
        await axios.post(`${backendUrl}/products`, payload, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        toast.success('Product added successfully!');
      }

      setShowProductModal(false);
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  // --- ORDER FULFILLMENT HANDLERS ---

  // BR-ORD-01: UI-Side State Machine validation
  const getAvailableTransitions = (currentStatus) => {
    const rules = {
      'PENDING': [], // Sellers shouldn't touch pending orders
      'PAID': ['PROCESSING', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [],
      'CANCELLED': []
    };
    return rules[currentStatus] || [];
  };

  const executeStatusUpdate = async (orderId, newStatus, carrier = null, trackingId = null) => {
    try {
      const payload = { status: newStatus };
      if (carrier) payload.carrier = carrier;
      if (trackingId) payload.trackingId = trackingId;

      await axios.put(`${backendUrl}/orders/${orderId}/status`, payload, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders(); // Refresh list to reflect new status
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleStatusChange = (orderId, currentStatus, newStatus) => {
    if (newStatus === currentStatus) return;

    // If moving to SHIPPED, we must intercept the flow and ask for tracking info
    if (newStatus === 'SHIPPED') {
      setTrackingData({ carrier: '', trackingId: '' });
      setShippingModal({ isOpen: true, orderId });
      return;
    }

    // Otherwise, execute the state change immediately
    executeStatusUpdate(orderId, newStatus);
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!trackingData.carrier || !trackingData.trackingId) {
      return toast.error("Carrier and Tracking ID are required.");
    }
    
    executeStatusUpdate(shippingModal.orderId, 'SHIPPED', trackingData.carrier, trackingData.trackingId);
    setShippingModal({ isOpen: false, orderId: null });
  };

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Navbar />
      <div className="p-10 max-w-[1200px] mx-auto">
        <h1 className="text-green-600 mb-2 text-3xl font-bold">🏪 Seller Operations Hub</h1>
        <p className="text-gray-400 mb-8">Manage your catalog and fulfill customer orders.</p>

        {/* --- TABS NAVIGATION --- */}
        <div className="flex gap-4 border-b border-[#333] mb-8 pb-2">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`pb-2 px-4 text-lg font-bold transition-all ${activeTab === 'inventory' ? 'text-white border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            📦 Inventory
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`pb-2 px-4 text-lg font-bold transition-all flex items-center gap-2 ${activeTab === 'orders' ? 'text-white border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-300'}`}
          >
            🚚 Live Orders 
            {orders.filter(o => o.status === 'PAID').length > 0 && (
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                {orders.filter(o => o.status === 'PAID').length} New
              </span>
            )}
          </button>
        </div>

        {/* --- INVENTORY TAB --- */}
        {activeTab === 'inventory' && (
          <div className="bg-white/5 p-8 rounded-2xl border border-[#222]">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-semibold">Catalog ({inventory.length} items)</h3>
              <button onClick={handleOpenAdd} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-medium">
                + Add Product
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
                    <button onClick={() => handleOpenEdit(item)} className="px-3 py-1.5 bg-[#333] text-white rounded text-xs hover:bg-gray-700 transition-colors">
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              ))}
              {inventory.length === 0 && <p className="text-gray-500">No products in your catalog yet.</p>}
            </div>
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-5">
            {orders.length === 0 ? (
              <div className="bg-white/5 p-8 rounded-2xl border border-[#222] text-center">
                <p className="text-gray-500">No active orders right now.</p>
              </div>
            ) : (
              orders.map(order => {
                const availableStatuses = getAvailableTransitions(order.status);
                
                return (
                  <div key={order.id} className="bg-white/5 p-6 rounded-2xl border border-[#222] flex flex-col md:flex-row gap-6">
                    {/* Order Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-gray-500 font-mono">ID: {order.id.split('-')[0]}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          order.status === 'PAID' ? 'bg-green-600/20 text-green-500' : 
                          order.status === 'PROCESSING' ? 'bg-yellow-600/20 text-yellow-500' : 
                          'bg-blue-600/20 text-blue-500'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-1">{order.user.firstName} {order.user.lastName}</h3>
                      <p className="text-sm text-gray-400 mb-4 whitespace-pre-wrap">
                        {order.shippingAddress.flat}, {order.shippingAddress.building}{'\n'}
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pin}{'\n'}
                        📞 {order.shippingAddress.phone}
                      </p>

                      <div className="bg-[#111] p-3 rounded-lg border border-[#333]">
                        <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Items to Fulfill:</h4>
                        {order.items.map(item => (
                          <div key={item.id} className="text-sm flex justify-between py-1 border-b border-[#222] last:border-0">
                            <span>{item.quantity}x {item.product.name} <span className="text-gray-500 text-xs">({item.product.sku})</span></span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full md:w-64 flex flex-col justify-end gap-3 border-t md:border-t-0 md:border-l border-[#333] pt-4 md:pt-0 md:pl-6">
                      <span className="text-sm text-gray-400 block">Update Status:</span>
                      
                      {availableStatuses.length > 0 ? (
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, order.status, e.target.value)}
                          className="w-full p-3 bg-[#111] border border-[#444] rounded-lg text-white focus:outline-none focus:border-green-500 cursor-pointer"
                        >
                          <option value={order.status} disabled>{order.status}</option>
                          {availableStatuses.map(status => (
                            <option key={status} value={status}>Mark as {status}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="p-3 bg-[#111] border border-[#333] rounded-lg text-gray-500 text-center cursor-not-allowed">
                          {order.status} (Locked)
                        </div>
                      )}
                      
                      {order.trackingId && (
                        <p className="text-xs text-gray-500 mt-2">
                          Tracking: {order.carrier} - {order.trackingId}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* --- ADD/EDIT PRODUCT MODAL (Existing logic untouched) --- */}
      {showProductModal && (
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
               <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 p-3 bg-transparent border border-[#444] text-white rounded-lg cursor-pointer hover:bg-white/5 transition-colors font-medium">Cancel</button>
               <button type="submit" className="flex-1 p-3 bg-green-600 border-none text-white rounded-lg cursor-pointer hover:bg-green-500 transition-colors font-medium">
                 {editProductId ? 'Save Changes' : 'Create Product'}
               </button>
             </div>
           </form>
         </div>
       </div>
      )}

      {/* --- SHIPPING INFO MODAL --- */}
      {shippingModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000] p-4">
          <div className="bg-[#1A1A1A] p-8 rounded-2xl w-full max-w-[400px] border border-[#333] shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Ship Order</h2>
            <p className="text-sm text-gray-400 mb-6">Enter the tracking details to notify the customer.</p>

            <form onSubmit={handleShippingSubmit} className="flex flex-col gap-4">
              <input 
                required 
                placeholder="Carrier (e.g., BlueDart, Delhivery)" 
                value={trackingData.carrier} 
                onChange={e => setTrackingData({ ...trackingData, carrier: e.target.value })} 
                className="p-3 bg-[#0A0A0A] text-white border border-[#444] rounded-lg focus:outline-none focus:border-green-600" 
              />
              <input 
                required 
                placeholder="Tracking Number" 
                value={trackingData.trackingId} 
                onChange={e => setTrackingData({ ...trackingData, trackingId: e.target.value })} 
                className="p-3 bg-[#0A0A0A] text-white border border-[#444] rounded-lg focus:outline-none focus:border-green-600" 
              />

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShippingModal({ isOpen: false, orderId: null })} 
                  className="flex-1 p-3 bg-transparent border border-[#444] text-white rounded-lg hover:bg-white/5 font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 p-3 bg-green-600 border-none text-white rounded-lg hover:bg-green-500 font-medium"
                >
                  Confirm Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}