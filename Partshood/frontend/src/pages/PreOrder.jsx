import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Package, Send, CheckCircle } from 'lucide-react';
import './PreOrder.css';

const PreOrder = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bikeModel: '',
    brand: '',
    partName: ''
  });
  const [customBrand, setCustomBrand] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const bikeModels = ['R15', 'FZ S', 'Duke 200', 'Duke 390', 'Pulsar 220', 'Avenger 220', 'Classic 350', 'Apache'];
  const brands = ['Yamaha', 'KTM', 'Bajaj', 'Royal Enfield', 'TVS'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Use custom values if "Other" is selected
    const finalData = {
      bikeModel: formData.bikeModel === 'Other' ? customModel : formData.bikeModel,
      brand: formData.brand === 'Other' ? customBrand : formData.brand,
      partName: formData.partName
    };

    if (!finalData.bikeModel || !finalData.brand || !finalData.partName) {
      setError('Please fill all fields');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/preorder', finalData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit pre-order');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="preorder-page">
        <Navbar />
        <div className="preorder-container" style={{textAlign: 'center', marginTop: 100}}>
          <CheckCircle size={80} color="#22c55e" style={{marginBottom: 24}} />
          <h2 style={{fontSize: 28, fontWeight: 800}}>Pre-Order Submitted!</h2>
          <p className="text-gray" style={{marginTop: 12}}>Admin and the respective Seller have been notified.</p>
          <p className="text-gray">Redirecting to your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preorder-page">
      <Navbar />
      <div className="preorder-container">
        <div className="preorder-card">
          <header className="preorder-header">
            <div className="icon-badge" style={{background: '#f1f5f9', color: '#1e293b', marginBottom: 20, display: 'inline-flex', padding: 12, borderRadius: 16}}>
              <Package size={32} />
            </div>
            <h2>Pre-Order Parts</h2>
            <p>Can't find a part? Let us know and we'll source it for you.</p>
          </header>

          <form className="preorder-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="input-wrap">
                <label>Bike Model</label>
                <select 
                  required
                  value={formData.bikeModel}
                  onChange={(e) => setFormData({...formData, bikeModel: e.target.value})}
                >
                  <option value="">Select bike model</option>
                  {bikeModels.map(m => <option key={m} value={m}>{m}</option>)}
                  <option value="Other">Other (type below)</option>
                </select>
                {formData.bikeModel === 'Other' && (
                  <input 
                    type="text"
                    placeholder="Enter custom bike model"
                    required
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    style={{marginTop: 10}}
                  />
                )}
              </div>

              <div className="input-wrap">
                <label>Company / Brand</label>
                <select 
                  required
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                >
                  <option value="">Select brand</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  <option value="Other">Other (type below)</option>
                </select>
                {formData.brand === 'Other' && (
                  <input 
                    type="text"
                    placeholder="Enter custom brand name"
                    required
                    value={customBrand}
                    onChange={(e) => setCustomBrand(e.target.value)}
                    style={{marginTop: 10}}
                  />
                )}
              </div>
            </div>

            <div className="input-wrap">
              <label>Part Name (Type manually)</label>
              <input 
                type="text" 
                placeholder="e.g. Engine Valve, Fairing Bolt, Carbon Fiber Mudguard..."
                required
                value={formData.partName}
                onChange={(e) => setFormData({...formData, partName: e.target.value})}
              />
            </div>

            {error && <p className="error-text" style={{color: '#ef4444', textAlign: 'center'}}>{error}</p>}

            <button type="submit" className="submit-preorder-btn" disabled={loading}>
              <Send size={18} />
              {loading ? 'Submitting...' : 'Send Pre-Order Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PreOrder;
