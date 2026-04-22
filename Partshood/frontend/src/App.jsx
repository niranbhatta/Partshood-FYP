import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import SellerRoute from './components/SellerRoute';
import Shop from './pages/Shop';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Recommendations from './pages/Recommendations';
import PreOrder from './pages/PreOrder';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';

function App() {
  return (
    // wrapping the whole app in the router so we can navigate without full page reloads
    <BrowserRouter>
      {/* feeding user token state to all components */}
      <AuthProvider>
        {/* fetching and sharing the cart data globally */}
        <CartProvider>
          <Routes>
            {/* perfectly open routes anyone can look at */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/product/:id" element={<ProductDetail />} />

            {/* wrapping sensitive user routes in the ProtectedRoute component so it forces a login if they try to bypass it */}
            <Route path="/cart" element={
              <ProtectedRoute><Cart /></ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute><Orders /></ProtectedRoute>
            } />
            <Route path="/recommendations" element={
              <ProtectedRoute><Recommendations /></ProtectedRoute>
            } />
            <Route path="/pre-order" element={
              <ProtectedRoute><PreOrder /></ProtectedRoute>
            } />
            <Route path="/payment-success" element={
              <ProtectedRoute><PaymentSuccess /></ProtectedRoute>
            } />
            <Route path="/payment-failed" element={
              <ProtectedRoute><PaymentFailed /></ProtectedRoute>
            } />

            {/* strictly locking the dashboard routes to specific user roles so regular buyers can't see the sales metrics */}
            <Route path="/admin-dashboard/*" element={
              <AdminRoute><Dashboard /></AdminRoute>
            } />
            <Route path="/seller-dashboard/*" element={
              <SellerRoute><Dashboard /></SellerRoute>
            } />

            {/* support old dashboard links by redirecting or keeping them role aware */}
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
