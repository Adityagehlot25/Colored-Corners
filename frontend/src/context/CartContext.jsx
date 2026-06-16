import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const getGuestId = () => {
    let id = localStorage.getItem('guestId');
    if (!id) {
      id = 'guest_' + crypto.randomUUID(); // Secure UUID fix!
      localStorage.setItem('guestId', id);
    }
    return id;
  };

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : { 'x-guest-id': getGuestId() };
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get(`${backendUrl}/cart`, { headers: getHeaders() });
      if (res.data && res.data.items) {
        setCart(res.data.items.map(item => ({ product: item.product, qty: item.quantity })));
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error('Failed to fetch remote cart', err);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const addToCart = async (product, requestedQty = 1) => {
    try {
      await axios.post(`${backendUrl}/cart/add`, { productId: product.id, quantity: requestedQty, guestId: getGuestId() }, { headers: getHeaders() });
      await fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart.');
    }
  };

  const updateQuantity = async (productId, newQty) => {
    // 1. Optimistic UI update (feels instant to the user)
    setCart(prevCart => prevCart.map(item => 
      item.product.id === productId ? { ...item, qty: newQty } : item
    ));
    
    // 2. Background API Sync
    try {
      await axios.put(`${backendUrl}/cart/update`, { productId, quantity: newQty }, { headers: getHeaders() });
    } catch (err) {
      fetchCart(); // Revert if backend fails
    }
  };

  const removeFromCart = async (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    try {
      await axios.delete(`${backendUrl}/cart/remove/${productId}`, { headers: getHeaders() });
    } catch (err) {
      fetchCart();
    }
  };

  // NEW: Hard clear for checkout success
  const clearCart = async () => {
    setCart([]);
    try {
      await axios.delete(`${backendUrl}/cart/clear`, { headers: getHeaders() });
    } catch (err) {
      console.error('Failed to clear backend cart', err);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart, getGuestId }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);