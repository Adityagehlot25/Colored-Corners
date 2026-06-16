import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      return navigate('/signin');
    }

    try {
      // Decode the JWT payload to get user details without needing a backend call
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
    } catch (error) {
      console.error("Invalid token", error);
      localStorage.removeItem('token');
      navigate('/signin');
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Navbar />
      
      <div className="max-w-[800px] mx-auto p-8 mt-10">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* User ID Card */}
          <div className="col-span-1 md:col-span-1 bg-white/5 border border-[#333] p-6 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-600/20 text-green-500 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
              {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="text-xl font-bold truncate w-full">{user.email || 'User'}</h2>
            <span className="text-xs font-mono text-gray-500 mt-2 bg-black/50 px-2 py-1 rounded">Role: {user.role}</span>
          </div>

          {/* Quick Links Menu */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
            <Link to="/orders/history" className="bg-white/5 border border-[#333] p-6 rounded-2xl hover:border-green-500 hover:bg-white/10 transition-all flex items-center justify-between group">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">📦 Order History</h3>
                <p className="text-sm text-gray-400 mt-1">Track your packages and view receipts</p>
              </div>
              <span className="text-2xl opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all">→</span>
            </Link>

            {/* If they are a seller or admin, give them a shortcut to the Seller Hub */}
            {(user.role === 'SELLER' || user.role === 'ADMIN') && (
              <Link to="/seller-dashboard" className="bg-white/5 border border-[#333] p-6 rounded-2xl hover:border-blue-500 hover:bg-white/10 transition-all flex items-center justify-between group">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">🏪 Seller Hub</h3>
                  <p className="text-sm text-gray-400 mt-1">Manage inventory and fulfill orders</p>
                </div>
                <span className="text-2xl opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all">→</span>
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}