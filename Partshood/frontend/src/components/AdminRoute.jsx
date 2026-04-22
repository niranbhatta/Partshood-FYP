import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// a wrapper component that blocks people from looking at admin-only pages
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // wait until we know for sure who they are
  if (loading) return <div className="loading-screen">Loading...</div>;

  // kick them to the login page if they aren't even logged in
  if (!user) return <Navigate to="/login" replace />;

  // kick them to the homepage if they log in but aren't an admin
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  // if they passed all checks, render whatever component was wrapped inside
  return children;
};

export default AdminRoute;
