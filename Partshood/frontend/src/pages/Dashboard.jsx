import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Bell, Search, TrendingUp, TrendingDown, RefreshCcw, ArrowUpRight, Package, Box } from 'lucide-react';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const DashboardHome = ({ orders, products, totalRevenue, user }) => {
  // filtering out anything that's already reached the customer so we only see active work
  const activeOrders = orders.filter(o => o.orderStatus !== 'Delivered').length;

  // calculating revenue differently depending on if you are the admin or just a seller 
  const getSellerSubtotal = (order) => {
    if (user?.role !== 'seller') return order.totalAmount; // admins get to see the whole pie
    const sellerProductIds = products.map(p => p._id.toString());
    return order.items.reduce((sum, item) => {
      const productId = item.product?._id || item.product;
      if (sellerProductIds.includes(productId.toString())) {
        return sum + (item.price * item.quantity);
      }
      return sum;
    }, 0);
  };

  const displayRevenue = user?.role === 'seller' 
    ? orders.reduce((sum, o) => sum + getSellerSubtotal(o), 0)
    : totalRevenue;

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card dark">
          <p className="stat-title">Total Revenue</p>
          <h3 className="stat-value">Rs. {displayRevenue.toLocaleString()}</h3>
          <p className="stat-trend positive"><TrendingUp size={14} /> Live data</p>
        </div>
        <div className="stat-card">
          <p className="stat-title">Active Orders</p>
          <h3 className="stat-value">{activeOrders}</h3>
          <p className="stat-trend positive"><TrendingUp size={14} /> Currently processing</p>
        </div>
        <div className="stat-card">
          <p className="stat-title">Total Orders</p>
          <h3 className="stat-value">{orders.length}</h3>
          <p className="stat-trend positive"><TrendingUp size={14} /> All time</p>
        </div>
        <div className="stat-card">
          <p className="stat-title">Total Products</p>
          <h3 className="stat-value">{products.length}</h3>
          <p className="stat-trend positive"><TrendingUp size={14} /> In catalog</p>
        </div>
      </div>

      <div className="recent-orders-card">
        <div className="chart-header">
          <h3>Recent Orders</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 10).map(order => (
              <tr key={order._id}>
                <td className="text-gray">{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                <td>{order.user?.name || 'N/A'}</td>
                <td>{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
                <td className="font-semibold">Rs. {getSellerSubtotal(order)}</td>
                <td>
                  <span className={`status-pill ${order.orderStatus.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const OrdersManager = ({ orders, products, token, onRefresh, user }) => {
  const [updating, setUpdating] = useState(null);

  const getSellerSubtotal = (order) => {
    if (user?.role !== 'seller') return order.totalAmount;
    const sellerProductIds = products.map(p => p._id.toString());
    return order.items.reduce((sum, item) => {
      const productId = item.product?._id || item.product;
      if (sellerProductIds.includes(productId.toString())) {
        return sum + (item.price * item.quantity);
      }
      return sum;
    }, 0);
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId); // locking the dropdown while the network request is flying
    try {
      await axios.put(
        `http://localhost:5000/api/orders/admin/${orderId}`,
        { orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRefresh();
    } catch (err) {
      console.error("Failed to update order status");
    }
    setUpdating(null);
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/orders/admin/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (err) {
      console.error("Failed to delete order");
    }
  };

  return (
    <div className="recent-orders-card">
      <div className="chart-header">
        <h3>All Orders</h3>
        <button className="icon-btn-small" onClick={onRefresh}><RefreshCcw size={14} /></button>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td className="text-gray">{order._id.substring(order._id.length - 8).toUpperCase()}</td>
              <td>{order.user?.name || 'Deleted User'}</td>
              <td>{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
              <td className="font-semibold">Rs. {getSellerSubtotal(order)}</td>
              <td>{order.paymentMethod}</td>
              <td>
                <span className={`status-pill ${order.orderStatus.toLowerCase()}`}>
                  {order.orderStatus}
                </span>
              </td>
              <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  className="status-select"
                  value={order.orderStatus}
                  disabled={updating === order._id}
                  onChange={(e) => updateStatus(order._id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <button className="delete-btn" onClick={() => deleteOrder(order._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && <p className="empty-msg">No orders yet</p>}
    </div>
  );
};

const ProductsManager = ({ products, token, onRefresh, user }) => {
  const [showForm, setShowForm] = useState(false);
  const [addError, setAddError] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // instantly injecting the seller's brand into the form so they don't have to type it (and can't spoof it)
  const sellerBrand = user?.role === 'seller' ? (user?.company || '') : '';
  const [form, setForm] = useState({
    name: '', price: '', category: 'Body Parts', brand: sellerBrand, bikeModel: '', stock: 0, description: '', image: 'https://placehold.co/150'
  });
  const [editingId, setEditingId] = useState(null);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };
      const { data } = await axios.post('http://localhost:5000/api/upload', formData, config);
      setForm((prev) => ({ ...prev, image: `http://localhost:5000${data.image}` }));
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      setAddError('Image upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    try {
      const finalCategory = isCustomCategory ? customCategory : form.category;
      const productData = { 
        ...form, 
        category: finalCategory,
        price: Number(form.price), 
        stock: Number(form.stock), 
        brand: user?.role === 'seller' ? sellerBrand : form.brand 
      };

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/products/${editingId}`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/products',
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', price: '', category: 'Body Parts', brand: sellerBrand, bikeModel: '', stock: 0, description: '', image: 'https://placehold.co/150' });
      setCustomCategory('');
      setIsCustomCategory(false);
      onRefresh();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save product";
      setAddError(msg);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      category: p.category,
      brand: p.brand,
      bikeModel: p.bikeModel,
      stock: p.stock,
      description: p.description,
      image: p.image
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Check if category is custom (not in default list)
    const defaults = ['Body Parts', 'Brakes', 'Electricals', 'Exhaust', 'Drivetrain'];
    if (!defaults.includes(p.category)) {
      setIsCustomCategory(true);
      setCustomCategory(p.category);
    } else {
      setIsCustomCategory(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (err) {
      console.error("Failed to delete product");
    }
  };

  const displayProducts = user?.role === 'seller'
    ? products.filter(p => p.brand?.toLowerCase() === sellerBrand.toLowerCase())
    : products;

  return (
    <div className="recent-orders-card">
      <div className="chart-header">
        <h3>Product Catalog {sellerBrand && <span style={{fontSize: 13, color: '#6b7280', fontWeight: 400}}>— {sellerBrand} only</span>}</h3>
        <div className="flex gap-2">
          <button className="pill-btn small" onClick={() => { 
            if (editingId) {
              setEditingId(null);
              setForm({ name: '', price: '', category: 'Body Parts', brand: sellerBrand, bikeModel: '', stock: 0, description: '', image: 'https://placehold.co/150' });
            }
            setShowForm(!showForm); 
            setAddError(''); 
          }}>
            {showForm ? (editingId ? 'Cancel Edit' : 'Cancel') : '+ Add Product'}
          </button>
          <button className="icon-btn-small" onClick={onRefresh}><RefreshCcw size={14} /></button>
        </div>
      </div>

      {addError && <div style={{background: '#fef2f2', color: '#dc2626', padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 500}}>{addError}</div>}

      {showForm && (
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <input placeholder="Product Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required />
            <div className="form-group" style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <select 
                value={isCustomCategory ? 'Other' : form.category} 
                onChange={(e) => {
                  if (e.target.value === 'Other') {
                    setIsCustomCategory(true);
                  } else {
                    setIsCustomCategory(false);
                    setForm({...form, category: e.target.value});
                  }
                }}
              >
                <option>Body Parts</option>
                <option>Brakes</option>
                <option>Electricals</option>
                <option>Exhaust</option>
                <option>Drivetrain</option>
                <option value="Other">Other (type below)</option>
              </select>
              {isCustomCategory && (
                <input 
                  placeholder="Enter manual category name" 
                  value={customCategory} 
                  onChange={(e) => setCustomCategory(e.target.value)} 
                  required 
                />
              )}
            </div>
            {user?.role === 'seller' ? (
              <input placeholder="Brand" value={sellerBrand} readOnly style={{background: '#f3f4f6', cursor: 'not-allowed'}} title="Locked to your company brand" />
            ) : (
              <input placeholder="Brand (e.g. Yamaha)" value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} required />
            )}
            <input placeholder="Bike Model (e.g. R15)" value={form.bikeModel} onChange={(e) => setForm({...form, bikeModel: e.target.value})} required />
            <input placeholder="Stock Quantity" type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input placeholder="Image URL (or select file)" value={form.image} onChange={(e) => setForm({...form, image: e.target.value})} />
              <input type="file" accept="image/*" onChange={uploadFileHandler} style={{ fontSize: '13px', padding: '8px', border: '1px solid #e1e7ef', borderRadius: '8px' }} />
              {uploading && <span style={{ fontSize: '12px', color: '#6366f1' }}>Uploading image...</span>}
            </div>
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
          </div>
          <button type="submit" className="pill-btn">{editingId ? 'Update Product' : 'Save Product'}</button>
          {user?.role === 'seller' && !editingId && <p style={{fontSize: '12px', color: '#6b7280', marginTop: '10px'}}>* Your product will be visible in the shop after Admin approval.</p>}
        </form>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Model</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayProducts.map(product => (
            <tr key={product._id}>
              <td className="item-cell">
                <img src={product.image} alt={product.name} style={{width: 32, height: 32, borderRadius: 8, objectFit: 'cover'}} />
                {product.name}
              </td>
              <td>{product.brand}</td>
              <td>{product.bikeModel}</td>
              <td className="font-semibold">Rs. {product.price}</td>
              <td>
                <span className={product.stock === 0 ? 'text-red' : ''}>
                  {product.stock === 0 ? 'Out of Stock' : product.stock}
                </span>
              </td>
              <td>
                <span className={`fx-status-pill po-${product.status || 'approved'}`}>
                  {(product.status || 'approved').toUpperCase()}
                </span>
              </td>
              <td>
                {user?.role === 'admin' || (user?.role === 'seller' && product.brand?.toLowerCase() === sellerBrand.toLowerCase()) ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="edit-btn" onClick={() => handleEdit(product)}>Edit</button>
                    <button className="delete-btn" onClick={() => deleteProduct(product._id)}>Delete</button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {displayProducts.length === 0 && <p className="empty-msg">No products in catalog</p>}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Customers Manager — Admin can view, add, remove customers
// ──────────────────────────────────────────────────────────────
const CustomersManager = ({ token }) => {
  const [customers, setCustomers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [createError, setCreateError] = useState('');

  // pulling the list of normal buyers from the backend
  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/users/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers");
    }
  };

  useEffect(() => {
    if (token) fetchCustomers();
  }, [token]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCreateError('');
    try {
      await axios.post('http://localhost:5000/api/users/customers',
        createForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreateForm({ name: '', email: '', password: '', phone: '', address: '' });
      setShowCreate(false);
      fetchCustomers();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to remove this customer?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/customers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCustomers();
    } catch (err) {
      console.error("Failed to delete customer");
    }
  };

  return (
    <div className="recent-orders-card">
      <div className="chart-header">
        <h3>Manage Customers</h3>
        <div className="action-btns">
          <button className="pill-btn small" onClick={() => { setShowCreate(!showCreate); setCreateError(''); }}>
            {showCreate ? 'Cancel' : '+ Add Customer'}
          </button>
          <button className="icon-btn-small" onClick={fetchCustomers}><RefreshCcw size={14} /></button>
        </div>
      </div>

      {showCreate && (
        <div className="create-seller-panel">
          <h4 className="create-seller-title">Create New Customer Account</h4>
          <p className="create-seller-subtitle">This account will be instantly active</p>

          {createError && <div className="seller-form-error">{createError}</div>}

          <form className="create-seller-form" onSubmit={handleCreateCustomer}>
            <div className="create-seller-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Niran" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="customer@example.com" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="text" placeholder="Set a password" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+977-98XXXXXXXX" value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" placeholder="Kathmandu, Nepal" value={createForm.address} onChange={e => setCreateForm({...createForm, address: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="pill-btn">Create Customer Account</button>
          </form>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td style={{fontSize: 13, color: '#6b7280'}}>{c.email}</td>
              <td style={{fontSize: 13}}>{c.phone || '—'}</td>
              <td style={{fontSize: 13}}>{c.address || '—'}</td>
              <td style={{fontSize: 12, color: '#9ca3af'}}>{new Date(c.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="delete-btn" onClick={() => deleteCustomer(c._id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {customers.length === 0 && <p className="empty-msg">No customers found.</p>}
    </div>
  );
};

const BRANDS = ['Yamaha', 'KTM', 'Bajaj', 'Royal Enfield', 'Triumph', 'Honda', 'Hero', 'Suzuki'];

const SellersManager = ({ token }) => {
  const [sellers, setSellers] = useState([]);
  const [editingSeller, setEditingSeller] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', company: '', phone: '', address: '', status: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', company: BRANDS[0], phone: '', address: '' });
  const [customBrand, setCustomBrand] = useState('');
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(null);

  const fetchSellers = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/users/sellers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSellers(data);
    } catch (err) {
      console.error("Failed to fetch sellers");
    }
  };

  useEffect(() => {
    if (token) fetchSellers();
  }, [token]);

  const handleCreateSeller = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess(null);
    // dynamically swapping out the dropdown value if they selected the "Other" brand
    try {
      const finalCompany = isCustomBrand ? customBrand : createForm.company;
      const { data } = await axios.post('http://localhost:5000/api/users/sellers',
        { ...createForm, company: finalCompany },
        { headers: { Authorization: `Bearer ${token}` } } // validating admin token
      );
      setCreateSuccess({
        name: data.seller.name,
        email: data.seller.email,
        company: data.seller.company,
        password: createForm.password
      });
      setCreateForm({ name: '', email: '', password: '', company: BRANDS[0], phone: '', address: '' });
      fetchSellers();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create seller');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/users/sellers/${id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSellers();
    } catch (err) {
      console.error("Failed to update status");
    }
  };

  const openEdit = (seller) => {
    setEditingSeller(seller._id);
    setEditForm({
      name: seller.name,
      email: seller.email,
      company: seller.company || '',
      phone: seller.phone || '',
      address: seller.address || '',
      status: seller.status
    });
  };

  const saveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/users/sellers/${editingSeller}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingSeller(null);
      fetchSellers();
    } catch (err) {
      console.error("Failed to update seller");
    }
  };

  const deleteSeller = async (id) => {
    if (!window.confirm('Are you sure you want to remove this seller?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/sellers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSellers();
    } catch (err) {
      console.error("Failed to delete seller");
    }
  };

  return (
    <div className="recent-orders-card">
      <div className="chart-header">
        <h3>Manage Sellers</h3>
        <div className="action-btns">
          <button className="pill-btn small" onClick={() => { setShowCreate(!showCreate); setCreateError(''); setCreateSuccess(null); }}>
            {showCreate ? 'Cancel' : '+ Add Seller'}
          </button>
          <button className="icon-btn-small" onClick={fetchSellers}><RefreshCcw size={14} /></button>
        </div>
      </div>

      {/* ── Create Seller Inline Form ── */}
      {showCreate && (
        <div className="create-seller-panel">
          <h4 className="create-seller-title">Create New Seller Account</h4>
          <p className="create-seller-subtitle">This account will be pre-approved and assigned to a specific brand</p>

          {createError && <div className="seller-form-error">{createError}</div>}

          {createSuccess ? (
            <div className="seller-created-card">
              <div className="seller-created-header">
                <Package size={20} />
                <span>Seller Created Successfully — Share these credentials</span>
              </div>
              <div className="credential-grid">
                <div className="credential-row"><span className="cred-label">Name</span><span className="cred-value">{createSuccess.name}</span></div>
                <div className="credential-row"><span className="cred-label">Email</span><span className="cred-value">{createSuccess.email}</span></div>
                <div className="credential-row"><span className="cred-label">Password</span><span className="cred-value cred-password">{createSuccess.password}</span></div>
                <div className="credential-row"><span className="cred-label">Brand</span><span className="cred-value"><strong>{createSuccess.company}</strong></span></div>
              </div>
              <button className="pill-btn small" onClick={() => { setCreateSuccess(null); setShowCreate(false); }}>Done</button>
            </div>
          ) : (
            <form className="create-seller-form" onSubmit={handleCreateSeller}>
              <div className="create-seller-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" placeholder="e.g. Yamaha Nepal Pvt. Ltd." value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="seller@brand.com" value={createForm.email} onChange={e => setCreateForm({...createForm, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Login Password</label>
                  <input className="form-input" type="text" placeholder="Set a password for the seller" value={createForm.password} onChange={e => setCreateForm({...createForm, password: e.target.value})} required minLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand / Company</label>
                  <select className="form-input" value={isCustomBrand ? '__custom__' : createForm.company} onChange={e => {
                    if (e.target.value === '__custom__') {
                      setIsCustomBrand(true);
                      setCustomBrand('');
                    } else {
                      setIsCustomBrand(false);
                      setCreateForm({...createForm, company: e.target.value});
                    }
                  }} required>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    <option value="__custom__">Other (type below)</option>
                  </select>
                  {isCustomBrand && (
                    <input className="form-input" style={{marginTop: 8}} placeholder="Enter custom brand name" value={customBrand} onChange={e => setCustomBrand(e.target.value)} required />
                  )}
                  <small className="form-hint">Seller will ONLY be able to list products of this brand</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" placeholder="+977-98XXXXXXXX" value={createForm.phone} onChange={e => setCreateForm({...createForm, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Address</label>
                  <input className="form-input" placeholder="Kathmandu, Nepal" value={createForm.address} onChange={e => setCreateForm({...createForm, address: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="pill-btn">Create Seller Account</button>
            </form>
          )}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editingSeller && (
        <div className="seller-edit-overlay">
          <div className="seller-edit-modal">
            <h3>Edit Seller Profile</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Company / Brand</label>
                <select className="form-input" value={BRANDS.includes(editForm.company) ? editForm.company : '__custom__'} onChange={e => { if(e.target.value !== '__custom__') setEditForm({...editForm, company: e.target.value}); }}>
                  {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  <option value="__custom__">Other</option>
                </select>
                {!BRANDS.includes(editForm.company) && (
                  <input className="form-input" style={{marginTop: 8}} value={editForm.company} placeholder="Custom brand" onChange={e => setEditForm({...editForm, company: e.target.value})} />
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-input" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="pill-btn" onClick={saveEdit}>Save Changes</button>
              <button className="pill-btn outline" onClick={() => setEditingSeller(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Brand</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Approval</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((seller) => (
            <tr key={seller._id}>
              <td>{seller.name}</td>
              <td style={{fontSize: 13, color: '#6b7280'}}>{seller.email}</td>
              <td>
                <span className="brand-pill">{seller.company || '—'}</span>
              </td>
              <td style={{fontSize: 13}}>{seller.phone || '—'}</td>
              <td>
                <span className={`status-pill ${seller.status === 'approved' ? 'delivered' : seller.status === 'pending' ? 'pending' : 'cancelled'}`}>
                  {seller.status}
                </span>
              </td>
              <td>
                <select 
                  className="status-select"
                  value={seller.status}
                  onChange={(e) => updateStatus(seller._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </td>
              <td>
                <div className="action-btns">
                  <button className="edit-btn" onClick={() => openEdit(seller)}>Edit</button>
                  <button className="delete-btn" onClick={() => deleteSeller(seller._id)}>Remove</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sellers.length === 0 && <p className="empty-msg">No sellers found.</p>}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Analytics — Finexy-style Dashboard
// ──────────────────────────────────────────────────────────────

const FxStackedBarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.v1 + d.v2), 100);
  const bw = 28;
  const gap = 16;
  const totalW = data.length * (bw + gap) - gap + 40;
  return (
    <svg width="100%" height="200" viewBox={`0 0 ${totalW} 200`} preserveAspectRatio="none" style={{overflow: 'visible'}}>
      <defs>
        <pattern id="fxHatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#ffffff" strokeWidth="2.5" />
        </pattern>
        <mask id="hatchMask">
          <rect width="100%" height="100%" fill="url(#fxHatch)" />
        </mask>
      </defs>
      
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((v, i) => {
        const y = 170 - (v / 100) * 150;
        return (
          <g key={i}>
            <line x1="20" y1={y} x2={totalW} y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />
            <text x="10" y={y + 3} textAnchor="end" fontSize="10" fill="#9ca3af">{v}k</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const h1 = (d.v1 / max) * 150; // Black bar
        const h2 = (d.v2 / max) * 150; // Orange patterned bar
        const x = 20 + i * (bw + gap);
        // We draw the black bar at bottom, orange bar at top 
        // Note: The reference image shows black bar at bottom, orange bar on top.
        // Actually, the black part is often below. Sometimes orange is below.
        // I'll put black below, orange on top.
        return (
          <g key={i}>
            <rect x={x} y={170 - h1} width={bw} height={h1} rx="4" fill="#1a1a1a" />
            <rect x={x} y={170 - h1 - h2 - 2} width={bw} height={h2} rx="4" fill="#ff6536" />
            <rect x={x} y={170 - h1 - h2 - 2} width={bw} height={h2} rx="4" fill="#1a1a1a" mask="url(#hatchMask)" opacity="0.1" />
            <text x={x + bw/2} y={190} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="500">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
};

const AnalyticsPanel = ({ orders: allOrders, products: allProducts, user, sellers }) => {
  const [selectedSellerId, setSelectedSellerId] = useState('all');

  // Create a product-to-seller map for accurate filtering
  const productSellerMap = useMemo(() => {
    const map = {};
    allProducts.forEach(p => {
      map[p._id] = (p.sellerId?._id || p.sellerId);
    });
    return map;
  }, [allProducts]);

  // Filter data based on selection (only for admin)
  const filteredOrders = useMemo(() => {
    if (user?.role !== 'admin' || selectedSellerId === 'all') return allOrders;
    return allOrders.filter(o => 
      o.items.some(i => productSellerMap[i.product] === selectedSellerId)
    );
  }, [allOrders, selectedSellerId, productSellerMap, user]);

  const filteredProducts = useMemo(() => {
    if (user?.role !== 'admin' || selectedSellerId === 'all') return allProducts;
    return allProducts.filter(p => (p.sellerId?._id || p.sellerId) === selectedSellerId);
  }, [allProducts, selectedSellerId, user]);

  const totalRev = filteredOrders.reduce((s, o) => {
    // If Admin and specific seller selected, or if user is a seller, only count their items
    const sellerIdToFilter = user?.role === 'admin' ? selectedSellerId : user?.id;
    
    if (sellerIdToFilter && sellerIdToFilter !== 'all') {
      const sellerItems = o.items.filter(i => {
        const prodId = i.product?._id || i.product;
        return productSellerMap[prodId] === sellerIdToFilter;
      });
      const sellerAmount = sellerItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      return s + sellerAmount;
    }
    return s + o.totalAmount;
  }, 0);
  const avgOrder = filteredOrders.length ? Math.round(totalRev / filteredOrders.length) : 0;
  const deliveredCount = filteredOrders.filter(o => o.orderStatus === 'Delivered').length;
  const pendingCount = filteredOrders.filter(o => o.orderStatus === 'Pending').length;
  const processingCount = filteredOrders.filter(o => o.orderStatus === 'Processing').length;
  
  const chartData = [
    { label: 'Jan', v1: 15, v2: 25 },
    { label: 'Feb', v1: 20, v2: 40 },
    { label: 'Mar', v1: 10, v2: 60 },
    { label: 'Apr', v1: 25, v2: 30 },
    { label: 'May', v1: 30, v2: 45 },
    { label: 'Jun', v1: 15, v2: 70 },
    { label: 'Jul', v1: 20, v2: 20 },
    { label: 'Aug', v1: 10, v2: 50 },
  ];

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="fx-page">
      <div className="fx-header">
        <div className="fx-greeting">
          <h2>Good {getTimeOfDay()}, {user?.name}</h2>
          <p>
            {user?.role === 'admin' 
              ? (selectedSellerId === 'all' ? 'Marketplace Overview (Aggregate)' : `Viewing performance for ${sellers.find(s => s._id === selectedSellerId)?.name || 'Seller'}`)
              : 'Detailed performance insights for your products.'}
          </p>
        </div>

        {user?.role === 'admin' && (
          <div className="fx-seller-selector">
            <span style={{fontSize: 13, marginRight: 8, color: '#6b7280'}}>View Analytics For:</span>
            <select 
              value={selectedSellerId} 
              onChange={(e) => setSelectedSellerId(e.target.value)}
              className="fx-select-minimal"
            >
              <option value="all">Entire Marketplace</option>
              {sellers.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.company || 'Private'})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="fx-grid">
        {/* ======== LEFT COLUMN ======== */}
        <div className="fx-col fx-col-left">
          
          {/* Card: Total Balance */}
          <div className="fx-card fx-balance-card">
            <div className="fx-card-top-row">
              <span className="fx-card-title">Total Revenue</span>
              <div className="fx-curr-badge">
                <span style={{marginRight: 4}}>🇳🇵</span> NPR <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
            
            <div className="fx-balance-val">
              Rs. {totalRev.toLocaleString()}
            </div>
            <div className="fx-badge-green">
              ↑ 5% <span style={{color: '#9ca3af', fontWeight: 500}}>than last month</span>
            </div>

            <div className="fx-action-btns">
              <button className="fx-btn fx-btn-dark">
                <RefreshCcw size={14} /> View Orders
              </button>
              <button className="fx-btn fx-btn-outline">
                <ArrowUpRight size={14} /> Catalog
              </button>
            </div>

            <div className="fx-wallets-header">
              <span>Order Status</span> <span style={{color: '#d1d5db'}}>|</span> <span style={{color: '#9ca3af'}}>Total 3 states</span>
            </div>

            <div className="fx-wallets-list">
              <div className="fx-wallet-item">
                <div className="fx-w-top">
                  <div className="fx-w-title"><div className="fx-w-dot fx-dot-blue"></div> Delivered</div>
                  <div className="fx-dots">⋮</div>
                </div>
                <div className="fx-w-val">{deliveredCount}</div>
                <div className="fx-w-status fx-text-green">Active</div>
              </div>
              <div className="fx-wallet-item">
                <div className="fx-w-top">
                  <div className="fx-w-title"><div className="fx-w-dot fx-dot-orange"></div> Processing</div>
                  <div className="fx-dots">⋮</div>
                </div>
                <div className="fx-w-val">{processingCount}</div>
                <div className="fx-w-status fx-text-green">Active</div>
              </div>
              <div className="fx-wallet-item">
                <div className="fx-w-top">
                  <div className="fx-w-title"><div className="fx-w-dot fx-dot-red"></div> Pending</div>
                  <div className="fx-dots">⋮</div>
                </div>
                <div className="fx-w-val">{pendingCount}</div>
                <div className="fx-w-status fx-text-red">Inactive</div>
              </div>
            </div>
          </div>

          {/* Card: Monthly Spending Limit */}
          <div className="fx-card">
            <div className="fx-card-title" style={{marginBottom: 16}}>Monthly Fulfillment Goal</div>
            <div className="fx-progress-bar">
              <div className="fx-progress-fill" style={{width: '30%'}}></div>
            </div>
            <div className="fx-limit-texts">
              <div className="fx-limit-left"><b>{deliveredCount}</b> fulfilled out of</div>
              <div className="fx-limit-right">{filteredOrders.length + 50}</div>
            </div>
          </div>


        </div>

        {/* ======== RIGHT COLUMN ======== */}
        <div className="fx-col fx-col-right">
          
          <div className="fx-right-top-grid">
            
            {/* 2x2 Stats Grid */}
            <div className="fx-2x2-stats">
              
              <div className="fx-stat-card fx-stat-orange">
                <div className="fx-sc-header">
                  <span className="fx-sc-title">Total Revenue</span>
                  <div className="fx-sc-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>
                </div>
                <div className="fx-sc-val">Rs. {totalRev.toLocaleString()}</div>
                <div className="fx-sc-trend fx-sc-trend-light">
                  ↑ 7% <span className="fx-sc-trend-sub">This month</span>
                </div>
              </div>

              <div className="fx-stat-card">
                <div className="fx-sc-header">
                  <span className="fx-sc-title">Total Orders</span>
                  <div className="fx-sc-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>
                </div>
                <div className="fx-sc-val">{filteredOrders.length}</div>
                <div className="fx-sc-trend fx-sc-trend-red">
                  ↓ 5% <span className="fx-sc-trend-sub">This month</span>
                </div>
              </div>

              <div className="fx-stat-card">
                <div className="fx-sc-header">
                  <span className="fx-sc-title">Avg. Order Value</span>
                  <div className="fx-sc-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg></div>
                </div>
                <div className="fx-sc-val">Rs. {avgOrder.toLocaleString()}</div>
                <div className="fx-sc-trend fx-sc-trend-green">
                  ↑ 8% <span className="fx-sc-trend-sub">This month</span>
                </div>
              </div>

              <div className="fx-stat-card">
                <div className="fx-sc-header">
                  <span className="fx-sc-title">Total Products</span>
                  <div className="fx-sc-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg></div>
                </div>
                <div className="fx-sc-val">{filteredProducts.length}</div>
                <div className="fx-sc-trend fx-sc-trend-green">
                  ↑ 4% <span className="fx-sc-trend-sub">This month</span>
                </div>
              </div>

            </div>

            {/* Income Chart Card */}
            <div className="fx-card fx-chart-card">
              <div className="fx-chart-header">
                <div>
                  <div className="fx-card-title">Total Income</div>
                  <div className="fx-card-subtitle" style={{marginTop: 4}}>View your income in a certain period of time</div>
                </div>
              </div>
              
              <div className="fx-chart-legend-box">
                <span className="fx-card-subtitle">Profit and Loss</span>
                <div className="fx-legends">
                  <div className="fx-legend"><span className="fx-leg-dot fx-dot-blue"></span> Profit</div>
                  <div className="fx-legend"><span className="fx-leg-dot fx-dot-black"></span> Loss</div>
                </div>
              </div>

              <div className="fx-chart-wrapper">
                <FxStackedBarChart data={chartData} />
              </div>
            </div>

          </div>

          {/* Recent Activities Table */}
          <div className="fx-card fx-table-card">
            <div className="fx-table-header">
              <div className="fx-card-title">Recent Activities</div>
              <div className="fx-table-actions">
                <div className="fx-search">
                  <Search size={14} color="#9ca3af" />
                  <input type="text" placeholder="Search" />
                </div>
                <button className="fx-filter-btn">
                  Filter <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                </button>
              </div>
            </div>

            <div className="fx-table-wrapper">
              <table className="fx-table">
                <thead>
                  <tr>
                    <th style={{width: 40}}><input type="checkbox" className="fx-cbx" /></th>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{width: 40}}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.slice(0, 5).map((o, i) => (
                    <tr key={i}>
                      <td><input type="checkbox" className="fx-cbx" defaultChecked={i===3} /></td>
                      <td style={{color: '#6b7280'}}>{o._id.slice(-8).toUpperCase()}</td>
                      <td>
                        <div className="fx-activity-col">
                          <div className={`fx-act-icon fx-act-${i%3}`}>A</div>
                          {o.items?.[0]?.name || 'Auto Part'}
                        </div>
                      </td>
                      <td style={{fontWeight: 500}}>Rs. {o.totalAmount.toLocaleString()}</td>
                      <td>
                        <span className={`fx-status-dot fx-${o.orderStatus?.toLowerCase() || 'pending'}`}></span>
                        {o.orderStatus}
                      </td>
                      <td style={{color: '#6b7280'}}>{new Date(o.createdAt).toLocaleString()}</td>
                      <td style={{color: '#9ca3af', letterSpacing: 2}}>...</td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{textAlign: 'center', color: '#9ca3af', padding: '30px'}}>
                        No recent activities.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};


const PreOrdersManager = ({ token, user }) => {
  const [preOrders, setPreOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchPreOrders = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/preorder', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPreOrders(data);
    } catch (err) {
      console.error("Failed to fetch pre-orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/preorder/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPreOrders();
    } catch (err) {
      console.error("Failed to update status");
    }
  };

  const deletePreOrder = async (id) => {
    if (!window.confirm('Remove this restocked pre-order from the list?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/preorder/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPreOrders();
    } catch (err) {
      console.error("Failed to delete pre-order");
    }
  };

  useEffect(() => { fetchPreOrders(); }, []);

  if (loading) return <div className="fx-loader">Loading Pre-Orders...</div>;

  // Split pre-orders into tabs
  const pendingOrders = preOrders.filter(po => ['pending', 'accepted', 'not-found'].includes(po.status));
  const restockedOrders = preOrders.filter(po => po.status === 'restocked');
  const displayOrders = activeTab === 'pending' ? pendingOrders : restockedOrders;

  return (
    <div className="fx-card fx-table-card">
      <div className="fx-table-header">
        <div className="fx-card-title">Customer Pre-Order Requests</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #f3f4f6' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '12px 24px',
            fontSize: '13px',
            fontWeight: activeTab === 'pending' ? 700 : 500,
            color: activeTab === 'pending' ? '#1a1a1a' : '#9ca3af',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '2px solid #1a1a1a' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Pending / Active ({pendingOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('restocked')}
          style={{
            padding: '12px 24px',
            fontSize: '13px',
            fontWeight: activeTab === 'restocked' ? 700 : 500,
            color: activeTab === 'restocked' ? '#059669' : '#9ca3af',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'restocked' ? '2px solid #059669' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Restocked ({restockedOrders.length})
        </button>
      </div>

      <div className="fx-table-wrapper">
        <table className="fx-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Bike Model</th>
              <th>Part Name (Manual)</th>
              <th>Brand</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayOrders.map(po => (
              <tr key={po._id}>
                <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="user-cell">
                    <span className="user-initial">{po.customer?.name?.[0]}</span>
                    <div>
                      <div className="user-name">{po.customer?.name}</div>
                      <div className="user-email">{po.customer?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="font-semibold">{po.bikeModel}</td>
                <td style={{color: '#3b82f6', fontWeight: 600}}>{po.partName}</td>
                <td><span className="brand-badge">{po.brand}</span></td>
                <td>
                  <span className={`fx-status-pill po-${po.status}`}>
                    {po.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  {activeTab === 'pending' ? (
                    <div className="po-actions">
                      {po.status === 'pending' && (
                        <>
                          <button className="po-btn accept" onClick={() => updateStatus(po._id, 'accepted')}>Accept</button>
                          <button className="po-btn reject" onClick={() => updateStatus(po._id, 'not-found')}>N/A</button>
                        </>
                      )}
                      {po.status === 'accepted' && (
                        <button 
                          className="po-btn" 
                          style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                          onClick={() => updateStatus(po._id, 'restocked')}
                        >
                          ✓ Restocked
                        </button>
                      )}
                      {po.status === 'not-found' && (
                        <button className="po-btn accept" onClick={() => updateStatus(po._id, 'pending')}>Re-open</button>
                      )}
                    </div>
                  ) : (
                    <div className="po-actions">
                      <button 
                        className="po-btn reject" 
                        onClick={() => deletePreOrder(po._id)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {displayOrders.length === 0 && (
              <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#9ca3af'}}>
                {activeTab === 'pending' ? 'No pending pre-order requests.' : 'No restocked items yet.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};



const RecommendationsManager = ({ token }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchRecommendations = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/recommendations');
      setRecommendations(data);
    } catch (err) {
      console.error("Failed to fetch recommendations");
    }
  };

  useEffect(() => { fetchRecommendations(); }, []);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('http://localhost:5000/api/upload', formData, config);
      setForm((prev) => ({ ...prev, image: `http://localhost:5000${data.image}` }));
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/recommendations/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/api/recommendations', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', description: '', image: '' });
      fetchRecommendations();
    } catch (err) {
      console.error("Failed to save recommendation");
    }
  };

  const handleEdit = (rec) => {
    setForm({ name: rec.name, description: rec.description, image: rec.image });
    setEditingId(rec._id);
    setShowForm(true);
  };

  const deleteRecommendation = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/recommendations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRecommendations();
    } catch (err) {
      console.error("Failed to delete recommendation");
    }
  };

  return (
    <div className="fx-card fx-table-card">
      <div className="fx-table-header">
        <div className="fx-card-title">{editingId ? 'Edit Recommendation' : 'Recommended Parts Management'}</div>
        <button className="fx-btn fx-btn-dark" onClick={() => {
          if (showForm && editingId) {
            setEditingId(null);
            setForm({ name: '', description: '', image: '' });
          }
          setShowForm(!showForm);
        }}>
          {showForm ? 'Cancel' : '+ Add Recommendation'}
        </button>
      </div>

      {showForm && (
        <form className="fx-form" onSubmit={handleSubmit} style={{ padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <input 
              className="fx-form-input" 
              placeholder="Part Name" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              required 
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                className="fx-form-input" 
                placeholder="Image URL or Upload below" 
                value={form.image} 
                onChange={e => setForm({...form, image: e.target.value})} 
              />
              <input type="file" onChange={uploadFileHandler} style={{ fontSize: '13px' }} />
              {uploading && <span style={{ fontSize: '12px', color: '#6366f1' }}>Uploading...</span>}
            </div>
          </div>
          <textarea 
            className="fx-form-input" 
            placeholder="Short Description" 
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})} 
            required 
            style={{ width: '100%', minHeight: '80px', marginBottom: '16px' }}
          />
          <button type="submit" className="fx-btn fx-btn-dark">Save Recommendation</button>
        </form>
      )}

      <div className="fx-table-wrapper">
        <table className="fx-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Part Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recommendations.map(rec => (
              <tr key={rec._id}>
                <td><img src={rec.image} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} /></td>
                <td className="font-semibold">{rec.name}</td>
                <td style={{ 
                  color: '#6b7280', 
                  fontSize: '13px', 
                  maxWidth: '500px', 
                  minWidth: '350px',
                  whiteSpace: 'normal',
                  lineHeight: '1.6'
                }}>
                  {rec.description}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="edit-btn" 
                      onClick={() => handleEdit(rec)}
                      style={{ padding: '4px 10px', fontSize: '11px' }}
                    >
                      Edit
                    </button>
                    <button className="fx-status-pill cancelled" onClick={() => deleteRecommendation(rec._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const PendingProductsManager = ({ token, onRefresh }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'rejected'

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/products?status=${activeTab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/products/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to update status");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Failed to delete product");
    }
  };

  useEffect(() => { fetchProducts(); }, [activeTab]);

  return (
    <div className="fx-card fx-table-card">
      <div className="fx-table-header" style={{ borderBottom: '1px solid #f3f4f6', marginBottom: 0 }}>
        <div className="fx-tabs" style={{ display: 'flex', gap: '24px' }}>
          <button 
            className={`fx-tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
            style={{ 
              padding: '16px 0', 
              fontSize: '14px', 
              fontWeight: 600, 
              color: activeTab === 'pending' ? '#6366f1' : '#6b7280',
              borderBottom: activeTab === 'pending' ? '2px solid #6366f1' : '2px solid transparent',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              outline: 'none'
            }}
          >
            Awaiting Approval
          </button>
          <button 
            className={`fx-tab ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
            style={{ 
              padding: '16px 0', 
              fontSize: '14px', 
              fontWeight: 600, 
              color: activeTab === 'rejected' ? '#6366f1' : '#6b7280',
              borderBottom: activeTab === 'rejected' ? '2px solid #6366f1' : '2px solid transparent',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              outline: 'none'
            }}
          >
            Rejected History
          </button>
        </div>
      </div>

      <div className="fx-table-wrapper">
        {loading ? (
          <div className="fx-loader" style={{ padding: '40px' }}>Syncing with inventory...</div>
        ) : (
          <table className="fx-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand / Model</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="fx-activity-col">
                      <img src={p.image} alt="" style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#111827' }}>{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{p.brand}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{p.bikeModel}</div>
                  </td>
                  <td>{p.sellerId?.name || 'Admin Added'}</td>
                  <td className="font-semibold">Rs. {p.price.toLocaleString()}</td>
                  <td>
                    <div className="po-actions">
                      {activeTab === 'pending' ? (
                        <>
                          <button className="fx-status-pill shipped" onClick={() => updateStatus(p._id, 'approved')}>Approve</button>
                          <button className="fx-status-pill cancelled" onClick={() => updateStatus(p._id, 'rejected')}>Reject</button>
                        </>
                      ) : (
                        <>
                          <button className="fx-status-pill shipped" onClick={() => updateStatus(p._id, 'approved')}>Re-Approve</button>
                          <button className="fx-status-pill cancelled" onClick={() => deleteProduct(p._id)}>Delete Permanently</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
                    {activeTab === 'pending' ? 'Zero pending requests. Good job!' : 'No rejected items in history.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};


const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const { token, user } = useAuth();
  const location = useLocation();

  const fetchOrders = async () => {
    try {
      const endpoint = user?.role === 'admin' 
        ? 'http://localhost:5000/api/orders/admin/all' 
        : 'http://localhost:5000/api/orders/seller/all';

      const { data } = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders");
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/products');
      if (user?.role === 'admin') {
        setProducts(data);
      } else {
        const sellerBrand = user?.company?.toLowerCase() || '';
        setProducts(data.filter(p => {
          const isOwner = p.sellerId?._id === user?.id || p.sellerId === user?.id;
          const isBrandMatch = p.brand?.toLowerCase() === sellerBrand;
          return isOwner || isBrandMatch;
        }));
      }
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };

  const fetchSellers = async () => {
    if (user?.role !== 'admin') return;
    try {
      const { data } = await axios.get('http://localhost:5000/api/users/sellers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSellers(data);
    } catch (err) {
      console.error("Failed to fetch sellers");
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchOrders();
      fetchProducts();
      if (user?.role === 'admin') fetchSellers();
    }
  }, [token, user]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const currentTab = location.pathname;

  const renderContent = () => {
    if (currentTab.includes('/dashboard/orders') || currentTab.includes('/seller-dashboard/orders') || currentTab.includes('/admin-dashboard/orders')) {
      return <OrdersManager orders={orders} products={products} token={token} onRefresh={fetchOrders} user={user} />;
    }
    if (currentTab.includes('/dashboard/products') || currentTab.includes('/seller-dashboard/products') || currentTab.includes('/admin-dashboard/products')) {
      return <ProductsManager products={products} token={token} onRefresh={() => { fetchProducts(); }} user={user} />;
    }
    if (currentTab.includes('/dashboard/sellers') || currentTab.includes('/admin-dashboard/sellers')) {
      return <SellersManager token={token} />;
    }
    if (currentTab.includes('/dashboard/customers') || currentTab.includes('/admin-dashboard/customers')) {
      return <CustomersManager token={token} />;
    }
    if (currentTab.includes('/analytics')) {
      return <AnalyticsPanel orders={orders} products={products} user={user} sellers={sellers} />;
    }
    if (currentTab.includes('preorders')) {
      return <PreOrdersManager token={token} user={user} />;
    }
    if (currentTab.includes('recommendations')) {
      return <RecommendationsManager token={token} />;
    }
    if (currentTab.includes('approval')) {
      return <PendingProductsManager token={token} onRefresh={fetchProducts} />;
    }
    return <DashboardHome orders={orders} products={products} totalRevenue={totalRevenue} user={user} />;
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h2>
            {currentTab.includes('/orders') ? 'Order Management' :
             currentTab.includes('/products') ? 'Product Catalog' :
             currentTab.includes('/sellers') ? 'Sellers Management' :
             currentTab.includes('/customers') ? 'Customer Management' :
             currentTab.includes('/analytics') ? 'Analytics' : 
             currentTab.includes('/recommendations') ? 'Recommendations Management' :
             currentTab.includes('/preorders') ? 'Pre-Order Requests' : 'Dashboard'}
          </h2>
          <div className="header-actions">
            <div className="search-bar">
              <Search size={16} className="text-gray" />
              <input type="text" placeholder="Search..." />
            </div>
            <div className="icon-btn">
              <Bell size={18} />
            </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
