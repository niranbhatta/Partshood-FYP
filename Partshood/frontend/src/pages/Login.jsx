import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { user, login } = useAuth(); // grabbing the login logic from our global auth bubble

  // if they stumbled onto this page but are already logged in, instantly kick them back out
  if (user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // triggered when they hit the "Sign In" button
  const handleLogin = async (e) => {
    e.preventDefault(); // stop the browser from aggressively reloading the page
    setErrorMessage('');
    try {
      // throwing the email and password at the context which throws it at the backend
      const loggedInUser = await login(email, password);
      
      // smart redirection based on who just logged in
      if (loggedInUser.role === 'admin' || loggedInUser.role === 'seller') {
        navigate(loggedInUser.role === 'admin' ? '/admin-dashboard' : '/seller-dashboard');
      } else {
        navigate('/'); // normal buyers land on the homepage
      }
    } catch (err) {
      // catching API rejections like "invalid password" and putting them on screen
      setErrorMessage(err.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-content">
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your Partshood account</p>

        {/* cleanly showing the red error box only when things go wrong */}
        {errorMessage && <div className="auth-error">{errorMessage}</div>}

        <form onSubmit={handleLogin} className="auth-form">
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="pill-btn auth-submit-btn">Sign In</button>
        </form>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
