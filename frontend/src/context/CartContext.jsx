import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, requestedQty = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // ENFORCE BR-CAT-04: Cap at physical stock
        const newQty = Math.min(existingItem.qty + requestedQty, product.pStock);
        if (newQty === existingItem.qty) {
          alert(`You already have all available stock (${product.pStock}) in your cart!`);
          return prevCart;
        }
        return prevCart.map(item => 
          item.product.id === product.id ? { ...item, qty: newQty } : item
        );
      } else {
        return [...prevCart, { product, qty: requestedQty }];
      }
    });
  };

  // NEW: Update quantity exactly (used for the + and - buttons)
  const updateQuantity = (productId, newQty) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.product.id === productId) {
        // Enforce BR-CAT-04 (Max stock) and prevent going below 1
        const boundedQty = Math.max(1, Math.min(newQty, item.product.pStock));
        return { ...item, qty: boundedQty };
      }
      return item;
    }));
  };

  // NEW: Remove an item completely
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);