import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, Users, UserCheck, BarChart2, Box, MessageSquare, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DashboardSidebar.css';

const DashboardSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, logout } = useAuth();
  
  const basePath = user?.role === 'admin' ? '/admin-dashboard' : '/seller-dashboard';

  let menuItems = [];
  
  // conditionally building out the sidebar links so sellers don't see admin pages
  if (user?.role === 'admin') {
    menuItems = [
      { path: basePath, label: 'Dashboard', icon: Home },
      { path: `${basePath}/sellers`, label: 'Sellers', icon: Users },
      { path: `${basePath}/customers`, label: 'Customers', icon: UserCheck },
      { path: `${basePath}/orders`, label: 'Orders', icon: Package },
      { path: `${basePath}/products`, label: 'Products', icon: Box },
      { path: `${basePath}/approval`, label: 'Product Approval', icon: UserCheck },
      { path: `${basePath}/preorders`, label: 'Pre-Orders', icon: Package },
      { path: `${basePath}/analytics`, label: 'Analytics', icon: BarChart2 },
      { path: `${basePath}/recommendations`, label: 'Recommendations', icon: Sparkles }
    ];
  } else if (user?.role === 'seller') {
    menuItems = [
      { path: basePath, label: 'Dashboard', icon: Home },
      { path: `${basePath}/orders`, label: 'My Orders', icon: Package },
      { path: `${basePath}/products`, label: 'My Products', icon: Box },
      { path: `${basePath}/preorders`, label: 'Pre-Orders', icon: Package },
      { path: `${basePath}/analytics`, label: 'Analytics', icon: BarChart2 }
    ];
  }

  return (
    <aside className="dash-sidebar">
      <Link to="/" className="dash-sidebar-brand">Partshood</Link>

      <ul className="dash-sidebar-menu">
        {/* looping over the array we built above and highlighting the one they are currently looking at */}
        {menuItems.map(item => (
          <li key={item.path} className={currentPath === item.path ? 'active' : ''}>
            <Link to={item.path}>
              <item.icon size={18} />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>


      <ul className="dash-sidebar-footer">
        <li><Link to="/login" onClick={logout}><LogOut size={18} /> Log out</Link></li>
      </ul>
    </aside>
  );
};

export default DashboardSidebar;
