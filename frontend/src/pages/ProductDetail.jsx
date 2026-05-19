import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export default function ProductDetail() {
  const { id } = useParams();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] font-sans">
        <Navbar />
        <div className="p-10 max-w-[1000px] mx-auto">
          {/* Back button skeleton */}
          <div className="h-6 bg-gray-800/50 rounded w-40 mb-5 animate-pulse"></div>
          
          <div className="flex flex-col md:flex-row gap-10 bg-white/5 p-10 rounded-2xl border border-[#222]">
            {/* Image Skeleton */}
            <div className="flex-1">
              <div className="w-full aspect-[4/3] md:aspect-square bg-gray-800 rounded-xl animate-pulse"></div>
            </div>
            
            {/* Details Skeleton */}
            <div className="flex-1 flex flex-col animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-24 mb-2"></div> {/* Category */}
              <div className="h-10 bg-gray-800 rounded w-3/4 mb-5"></div> {/* Title */}
              <div className="h-4 bg-gray-800 rounded w-1/3 mb-5"></div> {/* SKU */}
              
              <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div> {/* Price */}
              
              {/* Description Paragraph Skeletons */}
              <div className="space-y-3 mb-8">
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-full"></div>
                <div className="h-4 bg-gray-800 rounded w-5/6"></div>
              </div>

              {/* Bottom Button Skeleton */}
              <div className="mt-auto pt-5">
                <div className="h-6 bg-gray-800 rounded w-32 mb-4"></div>
                <div className="w-full h-14 bg-gray-800 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!product) return <div className="text-white text-center mt-12">Product not found!</div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Navbar />

      <div className="p-10 max-w-[1000px] mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-transparent text-gray-400 border-none cursor-pointer mb-5 text-base hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back to Marketplace
        </button>

        <div className="flex flex-col md:flex-row gap-10 bg-white/5 p-10 rounded-2xl border border-[#222]">
          
          {/* Left Column: Image Gallery */}
          <div className="flex-1">
            <img 
              src={product.imgs && product.imgs.length > 0 ? product.imgs[0] : 'https://via.placeholder.com/400'} 
              alt={product.name} 
              className="w-full rounded-xl object-cover shadow-lg" 
            />
          </div>

          {/* Right Column: Product Info */}
          <div className="flex-1 flex flex-col">
            <span className="text-green-600 text-sm uppercase tracking-wider font-bold">
              {product.category}
            </span>
            <h1 className="my-2 text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-500 text-sm mb-5">SKU: {product.sku}</p>
            
            <h2 className="text-3xl mb-5 font-light">${product.price}</h2>
            
            <p className="leading-relaxed text-gray-300 mb-8">
              {product.desc}
            </p>

            {/* Dynamic Facets Rendering */}
            {product.facets && Object.keys(product.facets).length > 0 && (
              <div className="mb-8 bg-[#111] p-5 rounded-lg border border-[#222]">
                <h3 className="text-base mb-3 border-b border-[#333] pb-2">Specifications</h3>
                <ul className="flex flex-col gap-2">
                  {Object.entries(product.facets).map(([key, value]) => (
                    <li key={key} className="flex justify-between py-1 border-b border-[#222] last:border-0">
                      <span className="text-gray-400 capitalize">{key}</span>
                      <span className="font-medium">{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock Status & Cart Button */}
            <div className="mt-auto pt-5">
              <p className={`font-bold mb-4 ${product.pStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.pStock > 0 ? `${product.pStock} in stock` : 'Out of Stock'}
              </p>
              <button 
                onClick={() => addToCart(product, 1)}
                disabled={product.pStock === 0}
                className={`w-full p-4 rounded-lg border-none text-lg font-bold transition-all duration-200 ${
                  product.pStock > 0 
                    ? 'bg-green-600 text-white cursor-pointer hover:bg-green-500 active:scale-[0.98]' 
                    : 'bg-[#333] text-gray-600 cursor-not-allowed'
                }`}
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