import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// a specialized wrapper specifically for the seller dashboard panels
const SellerRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  // strict role check, regular customers get booted back to the homepage
  if (user.role !== 'seller') return <Navigate to="/" replace />;

  return children;
};

export default SellerRoute;
