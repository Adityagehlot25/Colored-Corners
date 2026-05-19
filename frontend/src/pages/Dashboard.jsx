import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default function Dashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  // 1. Add a loading state!
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/signin');

    const fetchItems = async () => {
      try {
        const res = await axios.get(`${backendUrl}/products`);
        setItems(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        // 2. Stop loading whether it succeeds or fails
        setLoading(false);
      }
    };

    fetchItems();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Navbar />

      <div className="p-10 max-w-[1200px] mx-auto">
        <h1 className="mb-2 text-3xl font-bold">Welcome to the Marketplace</h1>
        <p className="text-gray-400">
          This is the Customer view. Anyone who is logged in can see this page, browse products, and make purchases.
        </p>

        <div className="mt-10 flex flex-wrap gap-5">
          {/* 3. Show pulsing skeletons if loading, otherwise show the real items */}
          {loading ? (
            // Generate 4 fake skeleton cards while waiting for the network
            [...Array(4)].map((_, index) => (
              <div key={index} className="border border-[#333] rounded-xl p-4 w-[250px] bg-white/5 animate-pulse">
                <div className="w-full h-[200px] bg-gray-800 rounded-lg"></div>
                <div className="mt-4 h-5 bg-gray-800 rounded w-3/4"></div>
                <div className="mt-2 h-5 bg-gray-800 rounded w-1/4"></div>
              </div>
            ))
          ) : items.length === 0 ? (
            <p className="text-gray-500">No products available right now.</p>
          ) : (
            // Your normal live data mapping
            items.map((i) => (
              <div
                key={i.id}
                onClick={() => navigate(`/product/${i.id}`)}
                className="border border-[#333] rounded-xl p-4 w-[250px] bg-white/5 cursor-pointer hover:-translate-y-1 hover:border-green-600/50 transition-all duration-300"
              >
                <img src={i.imgs[0]} alt={i.name} className="w-full h-[200px] object-cover rounded-lg" />
                <h3 className="mt-4 text-lg font-semibold">{i.name}</h3>
                <p className="text-green-600 font-bold mt-1">₹{i.price}</p>
                {i.status === 'OUT_OF_STOCK' && <span className="text-red-500 text-xs font-semibold uppercase tracking-wider">Out of Stock</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}