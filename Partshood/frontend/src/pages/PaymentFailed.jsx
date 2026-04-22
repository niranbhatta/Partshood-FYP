import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-page" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      {/* hardcoding some inline styles here just to pop out a quick clean centered card format */}
      <div style={{ maxWidth: 600, margin: '100px auto', background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'center' }}>
        <XCircle size={60} color="#ef4444" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Payment Failed or Canceled</h2>
        <p style={{ color: '#64748b', marginTop: 10 }}>Your transaction could not be completed. You have not been charged.</p>
        
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 30 }}>
          {/* giving them a way back to retry or just check their order history */}
          <button onClick={() => navigate('/cart')} className="pill-btn outline">Back to Cart</button>
          <button onClick={() => navigate('/orders')} className="pill-btn">View Orders</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
