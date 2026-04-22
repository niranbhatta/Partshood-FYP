import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// building a globally accessible state for the shopping cart
const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const { token, user } = useAuth(); // grabbing the jwt token from our other context to prove who we are

  // hits the backend to grab what's currently in their database cart
  const fetchCart = async () => {
    if (!token) {
      setCart(null);
      setCartCount(0); // clear it out if they log out
      return;
    }
    try {
      const { data } = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(data);
      if (data && data.items) {
        // summing up the quantities of everything in the cart so the little bubble on the navbar is accurate
        setCartCount(data.items.reduce((acc, item) => acc + item.quantity, 0));
      }
    } catch (error) {
      console.error('Failed to fetch cart', error);
    }
  };

  // re-fetch the cart whenever they log in or the token changes
  useEffect(() => {
    fetchCart();
  }, [token, user]);

  // triggered when they click 'add to cart' on a product detail page
  const addToCart = async (productId, quantity = 1) => {
    if (!token) return { success: false, message: 'Please login first' };
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/cart',
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } } // proving to the backend who is making the request
      );
      setCart(data.cart);
      // updating the navbar bubble instantly
      if (data.cart && data.cart.items) {
        setCartCount(data.cart.items.reduce((acc, item) => acc + item.quantity, 0));
      }
      return { success: true, message: 'Item added to cart' };
    } catch (error) {
      console.error('Failed to add to cart', error);
      return { success: false, message: 'Failed to add item' };
    }
  };

  // triggered when they hit the plus/minus buttons on the cart page itself
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

  // hitting the trashcan icon on an item
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

  // instantly wiping the ui cart without hitting the db, mainly used right after a successful checkout
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
