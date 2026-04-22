import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, User, LogOut, Heart, Search, Menu, 
  Settings, ChevronDown, Package, Box
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation(); // letting us know what page we are on so we can highlight the active link
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, logout } = useAuth(); // grabbing the logged in user so we know what buttons to show
  const { cartCount } = useCart(); // populating the little red bubble on the shopping cart
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // dynamically figuring out where the 'Dashboard' button should take them
  const dashboardPath = user?.role === 'admin' ? '/admin-dashboard' : '/seller-dashboard';

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">Partshood</Link>

        <nav className="nav-links">
          <Link to="/" className={currentPath === '/' ? 'active' : ''}>Home</Link>
          <Link to="/shop" className={currentPath === '/shop' ? 'active' : ''}>Shop</Link>
          
          {/* normal buyers don't need to see the management dashboard, just their own orders */}
          {user?.role === 'customer' && (
            <>
              <Link to="/pre-order" className={currentPath === '/pre-order' ? 'active' : ''}>Pre-Order</Link>
              <Link to="/orders" className={currentPath === '/orders' ? 'active' : ''}>My Orders</Link>
            </>
          )}

          {/* unlocking the actual dashboard if they have the privileges for it */}
          {(user?.role === 'admin' || user?.role === 'seller') && (
            <Link to={dashboardPath} className={currentPath.includes('dashboard') ? 'active' : ''}>
              Dashboard
            </Link>
          )}
          <Link to="/recommendations" className={currentPath === '/recommendations' ? 'active' : ''}>Recommendations</Link>
        </nav>

        <div className="nav-search">
          <input 
            type="text" 
            placeholder="Search parts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={18} className="search-icon" />
        </div>

        <div className="nav-actions">
          {/* toggling between 'Login' and their actual name depending on auth state */}
          {user ? (
            <div className="user-info">
              <Link to={dashboardPath} className="user-name">
                <User size={18} />
                <span>{user.name}</span>
              </Link>
              <button className="logout-btn" onClick={handleLogout}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
          
          {/* the shopping cart icon with the dynamic item counter bubble */}
          <Link to="/cart" className="cart-icon">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
