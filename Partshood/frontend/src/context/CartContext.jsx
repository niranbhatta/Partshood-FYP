import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const { token, user } = useAuth();

  const fetchCart = async () => {
    if (!token) {
      setCart(null);
      setCartCount(0);
      return;
    }
    try {
      const { data } = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(data);
      if (data && data.items) {
        setCartCount(data.items.reduce((acc, item) => acc + item.quantity, 0));
      }
    } catch (error) {
      console.error('Failed to fetch cart', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token, user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!token) return { success: false, message: 'Please login first' };
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/cart',
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(data.cart);
      if (data.cart && data.cart.items) {
        setCartCount(data.cart.items.reduce((acc, item) => acc + item.quantity, 0));
      }
      return { success: true, message: 'Item added to cart' };
    } catch (error) {
      console.error('Failed to add to cart', error);
      return { success: false, message: 'Failed to add item' };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!token) return;
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/cart/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(data.cart);
      if (data.cart && data.cart.items) {
        setCartCount(data.cart.items.reduce((acc, item) => acc + item.quantity, 0));
      }
    } catch (error) {
      console.error('Failed to update cart', error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!token) return;
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/cart/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(data.cart);
      if (data.cart && data.cart.items) {
        setCartCount(data.cart.items.reduce((acc, item) => acc + item.quantity, 0));
      }
    } catch (error) {
      console.error('Failed to remove item', error);
    }
  };

  const clearCart = () => {
    setCart(null);
    setCartCount(0);
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
