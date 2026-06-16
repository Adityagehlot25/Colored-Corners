import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // 1. Generate or Retrieve the Guest ID
  const getGuestId = () => {
    let id = localStorage.getItem('guestId');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guestId', id);
    }
    return id;
  };

  // 2. Fetch the true cart state from the database
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : { 'x-guest-id': getGuestId() };
      
      const res = await axios.get(`${backendUrl}/cart`, { headers });
      
      // Map the backend response to match our frontend UI structure
      if (res.data && res.data.items) {
        const formattedCart = res.data.items.map(item => ({
          product: item.product,
          qty: item.quantity
        }));
        setCart(formattedCart);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error('Failed to fetch remote cart', err);
    }
  };

  // Fetch from DB on mount
  useEffect(() => {
    fetchCart();
  }, []);

  // 3. Add to Cart (Pushes to Database, then refreshes UI)
  const addToCart = async (product, requestedQty = 1) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : { 'x-guest-id': getGuestId() };
      
      await axios.post(`${backendUrl}/cart/add`, {
        productId: product.id,
        quantity: requestedQty,
        guestId: getGuestId()
      }, { headers });
      
      await fetchCart(); // Re-sync the state with the database
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart.');
    }
  };

  // 4. Optimistic UI Updates for Quantity & Removal 
  // (Maintains snappy frontend performance without needing immediate backend routes for every click)
  const updateQuantity = (productId, newQty) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.product.id === productId) {
        const boundedQty = Math.max(1, Math.min(newQty, item.product.pStock));
        return { ...item, qty: boundedQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, fetchCart, getGuestId }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);