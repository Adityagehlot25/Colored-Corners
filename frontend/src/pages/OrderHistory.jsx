import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${backendUrl}/orders/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Error loading order history:', err);
        setError('Could not load your order history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'DELIVERED': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'SHIPPED': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'PROCESSING': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'PAID': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'CANCELLED': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Navbar />
      <div className="p-6 max-w-[1000px] mx-auto pt-12">
        <h1 className="text-3xl font-bold tracking-tight">Your Order History</h1>
        <p className="text-gray-400 mt-2 mb-8">Track status, view receipts, and manage your historical purchases.</p>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse border border-[#333]" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-900/20 border border-red-900 text-red-400">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-[#333] rounded-xl bg-white/5">
            <p className="text-gray-500 text-lg">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border border-[#333] bg-white/5 rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:border-gray-700">
                {/* Order Meta Header */}
                <div className="bg-white/[0.02] border-b border-[#333] p-4 flex flex-wrap justify-between items-center gap-4 text-sm text-gray-400">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Order Placed</p>
                      <p className="mt-1 font-medium text-gray-300">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Total Amount</p>
                      <p className="mt-1 font-bold text-white">₹{Number(order.amount).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">Order ID</p>
                      <p className="mt-1 font-mono text-xs text-gray-400">{order.id}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Order Line Items */}
                <div className="p-4 divide-y divide-[#222]">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <img 
                          src={item.product?.imgs?.[0] || 'https://via.placeholder.com/150'} 
                          alt={item.product?.name} 
                          className="w-16 h-16 object-cover rounded-lg border border-[#333] bg-[#111]"
                        />
                        <div>
                          <h4 className="font-semibold text-base text-white hover:text-green-400 cursor-pointer transition-colors">{item.product?.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{item.product?.category}</p>
                          <p className="text-sm text-gray-400 mt-1">Qty: <span className="text-white font-medium">{item.quantity}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-200">₹{Number(item.priceAtPurchase).toLocaleString('en-IN')}</p>
                        <p className="text-xs text-gray-600 mt-0.5">Historical Price Locked</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Logistics Tracking Row */}
                {(order.carrier || order.trackingId) && (
                  <div className="bg-black/40 px-4 py-3 border-t border-[#222] flex gap-4 text-xs text-gray-400">
                    <p>🚚 <span className="font-semibold text-gray-300">Carrier:</span> {order.carrier || 'Standard Logistics'}</p>
                    <p>📦 <span className="font-semibold text-gray-300">Tracking ID:</span> <span className="font-mono text-gray-200">{order.trackingId}</span></p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}