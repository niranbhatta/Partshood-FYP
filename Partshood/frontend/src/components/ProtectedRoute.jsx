import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// standard wrapper that stops guests from looking at pages like the checkout or user dashboard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // don't redirect them until we actually hit the api to check their token
  if (loading) return <div className="loading-screen">Loading...</div>;

  // bounce them to login immediately if we know they aren't authenticated
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
