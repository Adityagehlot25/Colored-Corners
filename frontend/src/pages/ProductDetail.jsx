import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default function ProductDetail() {
  const { id } = useParams(); // Grabs the ID from the URL!
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${backendUrl}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  if (!product) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Product not found!</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#FFFFFF', fontFamily: 'sans-serif' }}>
      <Navbar />

      <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ background: 'transparent', color: '#888', border: 'none', cursor: 'pointer', marginBottom: '20px', fontSize: '16px' }}
        >
          ← Back to Marketplace
        </button>

        <div style={{ display: 'flex', gap: '40px', background: 'rgba(255,255,255,0.03)', padding: '40px', borderRadius: '16px', border: '1px solid #222' }}>
          
          {/* Left Column: Image Gallery */}
          <div style={{ flex: 1 }}>
            <img 
              src={product.imgs && product.imgs.length > 0 ? product.imgs[0] : 'https://via.placeholder.com/400'} 
              alt={product.name} 
              style={{ width: '100%', borderRadius: '12px', objectFit: 'cover' }} 
            />
          </div>

          {/* Right Column: Product Info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#16A34A', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {product.category}
            </span>
            <h1 style={{ margin: '10px 0 5px 0' }}>{product.name}</h1>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>SKU: {product.sku}</p>
            
            <h2 style={{ fontSize: '28px', margin: '0 0 20px 0' }}>${product.price}</h2>
            
            <p style={{ lineHeight: '1.6', color: '#CCC', marginBottom: '30px' }}>
              {product.desc}
            </p>

            {/* Dynamic Facets Rendering */}
            {product.facets && Object.keys(product.facets).length > 0 && (
              <div style={{ marginBottom: '30px', background: '#111', padding: '15px', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>Specifications</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {Object.entries(product.facets).map(([key, value]) => (
                    <li key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #222' }}>
                      <span style={{ color: '#888', textTransform: 'capitalize' }}>{key}</span>
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock Status & Cart Button */}
            <div style={{ marginTop: 'auto' }}>
              <p style={{ color: product.pStock > 0 ? '#16A34A' : '#EF4444', fontWeight: 'bold', marginBottom: '15px' }}>
                {product.pStock > 0 ? `${product.pStock} in stock` : 'Out of Stock'}
              </p>
              <button 
                onClick={() => addToCart(product, 1)}
                disabled={product.pStock === 0}
                style={{ 
                  width: '100%', padding: '15px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: 'bold',
                  background: product.pStock > 0 ? '#16A34A' : '#333',
                  color: product.pStock > 0 ? '#FFF' : '#666',
                  cursor: product.pStock > 0 ? 'pointer' : 'not-allowed'
                }}
              >
                {product.pStock > 0 ? 'Add to Cart 🛒' : 'Currently Unavailable'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}