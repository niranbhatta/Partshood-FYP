import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Package, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const Orders = () => {
  const [ordersList, setOrdersList] = useState([]);
  const { token } = useAuth(); // grabbing the jwt token to prove who we are to the backend

  // firing a request to the backend as soon as the page boots up to grab our order history
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrdersList(data);
      } catch (err) {
        console.error("Failed to fetch orders");
      }
    };
    if (token) fetchOrders();
  }, [token]);

  // flattening the array of items into a clean comma-separated string for the table
  const formatItems = (items) => {
    return items.map(item => `${item.name} x${item.quantity}`).join(', ');
  };

  // mapping backend string statuses to our frontend css classes for color coding
  const getStatusClass = (status) => {
    if (status === 'Delivered') return 'delivered';
    if (status === 'Processing') return 'processing';
    if (status === 'Pre-Order') return 'preorder';
    return 'pending'; // fallback state
  };

  return (
    <div className="orders-page">
      <Navbar />
      <div className="orders-container">
        <div className="orders-header">
          <h2 className="orders-heading"><Package size={24} /> My Orders</h2>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ordersList.map(order => (
                <tr key={order._id}>
                  {/* slicing the huge mongo ID down to just the last 8 characters so it looks like a real order number */}
                  <td className="order-id-cell">{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                  <td className="text-gray">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{formatItems(order.items)}</td>
                  <td className="font-semibold">Rs. {order.totalAmount}</td>
                  <td>
                    {/* injecting the dynamic pill color based on what the backend said */}
                    <span className={`order-status-pill ${getStatusClass(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td>
                    <button className="view-order-btn"><Eye size={16} /> View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
