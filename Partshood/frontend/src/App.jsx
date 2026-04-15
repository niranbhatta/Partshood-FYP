import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SellerRoute from './components/SellerRoute';
import Shop from './pages/Shop';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Payment from './pages/Payment';
import PreOrder from './pages/PreOrder';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Shop />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            <Route path="/cart" element={
              <ProtectedRoute><Cart /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><Orders /></ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute><Payment /></ProtectedRoute>
            } />
            <Route path="/pre-order" element={
              <ProtectedRoute><PreOrder /></ProtectedRoute>
            } />

            <Route path="/admin-dashboard/*" element={
              <AdminRoute><Dashboard /></AdminRoute>
            } />
            <Route path="/seller-dashboard/*" element={
              <SellerRoute><Dashboard /></SellerRoute>
            } />

            {/* Support old dashboard links by redirecting or keeping them role aware */}
            <Route path="/dashboard/*" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
