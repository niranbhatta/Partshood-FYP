import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Sparkles, Package } from 'lucide-react';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // pinging the backend for our static list of hand-curated items when the page loads
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/recommendations');
        setRecommendations(data);
      } catch (err) {
        console.error("Failed to fetch recommendations");
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      <Navbar />
      
      {/* Hero Section */}
      <div style={{ 
        background: "linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url('/superbike_banner.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '80px 24px', 
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>Expert Recommendations</h1>
        <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
          Find the high quality recommended parts for your ride
        </p>
      </div>

      <div style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 24px' }}>
        {/* standard loading spinner while we wait for the network */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div className="loader" style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f4f6', 
              borderTop: '4px solid #6366f1', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
            <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading your recommendations...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '32px' 
          }}>
            {/* looping through whatever the backend gave us and spitting out nice cards */}
            {recommendations.map((rec) => (
              <div key={rec._id} style={{ 
                background: 'white', 
                borderRadius: '20px', 
                overflow: 'hidden', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'default'
              }} className="rec-card">
                <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                  <img src={rec.image} alt={rec.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ 
                    position: 'absolute', 
                    top: '16px', 
                    right: '16px', 
                    background: 'rgba(255, 255, 255, 0.9)', 
                    padding: '8px', 
                    borderRadius: '12px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Package size={20} color="#6366f1" />
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>{rec.name}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                    {rec.description}
                  </p>
                  <button style={{ 
                    width: '100%', 
                    padding: '12px', 
                    background: '#f1f5f9', 
                    color: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}>
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 24px', background: 'white', borderRadius: '24px', border: '2px dashed #e5e7eb' }}>
            <div style={{ width: '64px', height: '64px', background: '#f9fafb', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Package size={32} color="#9ca3af" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>No Recommendations Yet</h3>
            <p style={{ color: '#6b7280' }}>Check back soon for expert picks and handpicked spare parts.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .rec-card:hover { transform: translateY(-4px); boxShadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
      `}</style>
    </div>
  );
};

export default Recommendations;
