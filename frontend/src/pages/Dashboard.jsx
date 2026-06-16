import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

// Define the available categories based on your business
const CATEGORIES = ['All', 'Apparel', 'Accessories', 'Digital', 'Home'];

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Data States
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // We use a separate state to handle the 'debounced' search so we don't spam the API
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // 1. The Debouncer: Waits 500ms after the user stops typing before setting the actual search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. The Fetcher: Runs whenever the debounced query or the category changes
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        // Build the query string dynamically
        let queryParams = `?category=${activeCategory}`;
        if (debouncedQuery) {
          queryParams += `&q=${encodeURIComponent(debouncedQuery)}`;
        }

        const res = await axios.get(`${backendUrl}/products${queryParams}`);
        setItems(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [debouncedQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Navbar />

      <div className="p-10 max-w-[1200px] mx-auto">
        
        {/* --- HEADER & SEARCH BAR --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-10 mt-5">
          <div>
            <h1 className="text-3xl font-bold mb-2">The Marketplace</h1>
            <p className="text-gray-400">Discover premium goods, crafted for you.</p>
          </div>
          
          <div className="w-full md:w-[400px]">
            <input 
              type="text"
              placeholder="Search products, SKUs, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 bg-[#111] border border-[#333] rounded-xl text-white focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* --- CATEGORY PILLS --- */}
        <div className="flex flex-wrap gap-3 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-green-600 text-white border border-green-500' 
                  : 'bg-transparent text-gray-400 border border-[#333] hover:border-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="flex flex-wrap gap-6">
          {loading ? (
            // Loading Skeletons
            [...Array(4)].map((_, index) => (
              <div key={index} className="border border-[#333] rounded-xl p-4 w-[280px] bg-white/5 animate-pulse">
                <div className="w-full h-[220px] bg-gray-800 rounded-lg"></div>
                <div className="mt-4 h-5 bg-gray-800 rounded w-3/4"></div>
                <div className="mt-2 h-5 bg-gray-800 rounded w-1/4"></div>
              </div>
            ))
          ) : items.length === 0 ? (
            // No Results State
            <div className="w-full text-center py-20 bg-white/5 rounded-2xl border border-[#222]">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-gray-500">We couldn't find anything matching "{searchQuery}". Try adjusting your filters.</p>
            </div>
          ) : (
            // Live Data Mapping
            items.map((i) => (
              <div
                key={i.id}
                onClick={() => navigate(`/product/${i.id}`)}
                className={`border rounded-xl p-4 w-[280px] bg-white/5 cursor-pointer transition-all duration-300 ${
                  i.pStock > 0 
                    ? 'border-[#333] hover:-translate-y-1 hover:border-green-600/50' 
                    : 'border-red-900/30 opacity-60 grayscale hover:opacity-100' // Visual cue for Out of Stock
                }`}
              >
                <div className="relative">
                  <img src={i.imgs[0]} alt={i.name} className="w-full h-[220px] object-cover rounded-lg" />
                  
                  {/* Out of Stock Overlay Badge */}
                  {i.pStock === 0 && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      SOLD OUT
                    </div>
                  )}
                </div>
                
                <h3 className="mt-4 text-lg font-semibold truncate">{i.name}</h3>
                
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xl font-light text-gray-200">₹{i.price}</p>
                  {i.pStock > 0 && i.pStock <= 5 && (
                    <span className="text-yellow-500 text-xs font-bold">Only {i.pStock} left!</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}