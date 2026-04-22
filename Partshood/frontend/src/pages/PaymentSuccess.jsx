import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const PaymentSuccess = () => {
  // pulling the raw encrypted payload right out of the url that esewa just redirected us back from
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const dataParam = searchParams.get('data');

      // if there's no data payload we caught them trying to access this page manually, boot them.
      if (!dataParam) {
        setError('Invalid payment parameters from eSewa');
        setVerifying(false);
        return;
      }

      try {
        // Send base64 payload to backend for verification and status update so nobody can spoof payments
        await axios.post(
          `http://localhost:5000/api/orders/esewa/verify`,
          { data: dataParam },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setVerifying(false); // flip off the loading spinner
        
        // Let them look at the big green checkmark for exactly 3 seconds before auto-routing them
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } catch (err) {
        setVerifying(false);
        setError('Failed to verify payment with our servers, but your transaction might have gone through. Please contact support.');
      }
    };

    // Only run if token is available
    if (token) {
      verifyPayment();
    }
  }, [searchParams, navigate, token]);

  return (
    <div className="payment-page" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: 600, margin: '100px auto', background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'center' }}>
        
        {/* dynamically swapping between a spinner, a red error, or a green checkmark based on state */}
        {verifying ? (
          <div>
            <div style={{ width: 40, height: 40, border: '4px solid #f1f5f9', borderTop: '4px solid #22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Verifying Payment...</h2>
            <p style={{ color: '#64748b', marginTop: 10 }}>Please wait while we confirm your transaction with eSewa.</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div>
            <AlertCircle size={60} color="#ef4444" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Payment Verification Issue</h2>
            <p style={{ color: '#64748b', marginTop: 10 }}>{error}</p>
            <button onClick={() => navigate('/orders')} className="pill-btn" style={{ marginTop: 20 }}>Go to My Orders</button>
          </div>
        ) : (
          <div>
            <CheckCircle size={60} color="#22c55e" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>Payment Successful!</h2>
            <p style={{ color: '#64748b', marginTop: 10 }}>Your order has been confirmed and is now being processed.</p>
            <p style={{ color: '#64748b', marginTop: 10 }}>Redirecting to your orders...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
