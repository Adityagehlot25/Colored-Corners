import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default function Dashboard() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/signin');

    const fetchItems = async () => {
      try {
        const res = await axios.get(`${backendUrl}/products`);
        setItems(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    
    fetchItems();
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#FFFFFF', fontFamily: 'sans-serif' }}>
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '10px' }}>Welcome to the Marketplace</h1>
        <p style={{ color: '#888' }}>
          This is the Customer view. Anyone who is logged in can see this page, browse products, and make purchases.
        </p>

        {/* The Live Data Grid! */}
        <div style={{ 
          marginTop: '40px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '20px' 
        }}>
          {items.map((i) => (
            <div key={i.id}
            onClick={() => navigate(`/product/${i.id}`)}
            style={{ border: '1px solid #333', borderRadius: '12px', padding: '15px', width: '250px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <img src={i.imgs[0]} alt={i.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
              <h3 style={{ marginTop: '15px', fontSize: '18px' }}>{i.name}</h3>
              <p style={{ color: '#16A34A', fontWeight: 'bold', marginTop: '5px' }}>${i.price}</p>
              {i.status === 'OUT_OF_STOCK' && <span style={{ color: 'red', fontSize: '12px' }}>Out of Stock</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}