import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Package, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const Orders = () => {
  const [ordersList, setOrdersList] = useState([]);
  const { token } = useAuth();

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

  const formatItems = (items) => {
    return items.map(item => `${item.name} x${item.quantity}`).join(', ');
  };

  const getStatusClass = (status) => {
    if (status === 'Delivered') return 'delivered';
    if (status === 'Processing') return 'processing';
    if (status === 'Pre-Order') return 'preorder';
    return 'pending';
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
                  <td className="order-id-cell">{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                  <td className="text-gray">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{formatItems(order.items)}</td>
                  <td className="font-semibold">Rs. {order.totalAmount}</td>
                  <td>
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
