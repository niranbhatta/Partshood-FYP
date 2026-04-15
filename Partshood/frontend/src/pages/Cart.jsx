import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const cartItems = cart?.items || [];
  const { token } = useAuth();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const increaseQuantity = (productId, currentQuantity) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const decreaseQuantity = (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  const removeItem = (productId) => {
    removeFromCart(productId);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!shippingAddress) return alert('Please enter shipping address');
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/orders',
        { shippingAddress, paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      clearCart();
      if (data.paymentUrl) {
         window.location.href = data.paymentUrl;
      } else {
         navigate('/orders');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to place order');
    }
  };

  return (
    <div className="cart-page">
      <Navbar />
      <div className="cart-container">
        <h2 className="cart-heading">Shopping Cart</h2>

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty</p>
            <Link to="/" className="pill-btn">Continue Shopping</Link>
          </div>
        ) : (
          <div className="cart-grid">
            <div className="cart-items-list">
              {cartItems.map(item => (
                <div key={item.product._id} className="cart-item-row">
                  <div className="cart-item-image">
                    <img src={item.product.image} alt={item.product.name} />
                  </div>
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{item.product.name}</h4>
                    <p className="cart-item-price">Rs. {item.product.price}</p>
                  </div>
                  <div className="cart-item-quantity">
                    <button className="qty-btn" onClick={() => decreaseQuantity(item.product._id, item.quantity)}><Minus size={14} /></button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => increaseQuantity(item.product._id, item.quantity)}><Plus size={14} /></button>
                  </div>
                  <div className="cart-item-total">Rs. {item.product.price * item.quantity}</div>
                  <button className="cart-remove-btn" onClick={() => removeItem(item.product._id)}><Trash2 size={16} /></button>
                </div>
              ))}
            </div>

            <div className="cart-summary-card">
              <h3 className="summary-title">Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span className="font-semibold">Rs. {cartTotal}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="text-green font-semibold">Free</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>Rs. {cartTotal}</span>
              </div>
              <div className="checkout-fields">
                <textarea 
                  className="shipping-input"
                  placeholder="Enter full shipping address..." 
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
                <select 
                  className="payment-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="eSewa">eSewa Mock Payment</option>
                  <option value="Khalti">Khalti Mock Payment</option>
                </select>
              </div>
              <button className="pill-btn checkout-btn" onClick={handlePlaceOrder}>Place Order</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
