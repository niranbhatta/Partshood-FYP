import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Auth.css';

const Register = () => {
  // tracking roughly a million input fields so we can send a clean object to the backend
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // defaults to customer so people don't accidentally make seller accounts
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();
  const { user, register } = useAuth();

  // bounce them to the homepage if they are currently logged in
  if (user) return <Navigate to="/" replace />;

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    try {
      // lobbing all their form data straight into the auth context
      await register(name, email, password, role, company, phone, address);
      
      // letting sellers know they can't just immediately start listing items
      if (role === 'seller') {
        setSuccessMessage('Seller account created! Pending admin approval. Redirecting...');
      } else {
        setSuccessMessage('Account created! Redirecting to login...');
      }
      
      // giving them 2 seconds to read the success message before aggressively shoving them to the login screen
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-content">
        <h2 className="auth-title">Create account</h2>
        <p className="auth-subtitle">Join the Partshood marketplace</p>

        {errorMessage && <div className="auth-error">{errorMessage}</div>}
        {successMessage && <div className="auth-success">{successMessage}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Niran"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">I want to register as a:</label>
            <select
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+977-98XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="Kathmandu, Nepal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {/* only sliding down the company name field if they selected the seller dropdown */}
          {role === 'seller' && (
            <div className="form-group">
              <label className="form-label">Company / Brand Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Yamaha, KTM, Bajaj"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
              <small className="form-hint">You will only be able to sell parts for this brand</small>
            </div>
          )}

          <button type="submit" className="pill-btn auth-submit-btn">Create Account</button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
