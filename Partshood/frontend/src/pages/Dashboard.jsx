import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Bell, Search, TrendingUp, TrendingDown, RefreshCcw, ArrowUpRight, Package, Box } from 'lucide-react';
import DashboardSidebar from '../components/DashboardSidebar';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const DashboardHome = ({ orders, products, totalRevenue }) => {
  const activeOrders = orders.filter(o => o.orderStatus !== 'Delivered').length;

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card dark">
          <p className="stat-title">Total Revenue</p>
          <h3 className="stat-value">Rs. {totalRevenue.toLocaleString()}</h3>
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
                <td className="font-semibold">Rs. {order.totalAmount}</td>
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

const OrdersManager = ({ orders, token, onRefresh }) => {
  const [updating, setUpdating] = useState(null);

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
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
              <td>{order.user?.name || 'N/A'}</td>
              <td>{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</td>
              <td className="font-semibold">Rs. {order.totalAmount}</td>
              <td>{order.paymentMethod}</td>
              <td>
                <span className={`status-pill ${order.orderStatus.toLowerCase()}`}>
                  {order.orderStatus}
                </span>
              </td>
              <td>
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
  const sellerBrand = user?.role === 'seller' ? (user?.company || '') : '';
  const [form, setForm] = useState({
    name: '', price: '', category: 'Body Parts', brand: sellerBrand, bikeModel: '', stock: 0, description: '', image: 'https://placehold.co/150'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    try {
      await axios.post(
        'http://localhost:5000/api/products',
        { ...form, price: Number(form.price), stock: Number(form.stock), brand: user?.role === 'seller' ? sellerBrand : form.brand },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowForm(false);
      setForm({ name: '', price: '', category: 'Body Parts', brand: sellerBrand, bikeModel: '', stock: 0, description: '', image: 'https://placehold.co/150' });
      onRefresh();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add product";
      setAddError(msg);
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
          <button className="pill-btn small" onClick={() => { setShowForm(!showForm); setAddError(''); }}>
            {showForm ? 'Cancel' : '+ Add Product'}
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
            <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
              <option>Body Parts</option>
              <option>Brakes</option>
              <option>Electricals</option>
              <option>Exhaust</option>
              <option>Drivetrain</option>
            </select>
            {user?.role === 'seller' ? (
              <input placeholder="Brand" value={sellerBrand} readOnly style={{background: '#f3f4f6', cursor: 'not-allowed'}} title="Locked to your company brand" />
            ) : (
              <input placeholder="Brand (e.g. Yamaha)" value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} required />
            )}
            <input placeholder="Bike Model (e.g. R15)" value={form.bikeModel} onChange={(e) => setForm({...form, bikeModel: e.target.value})} required />
            <input placeholder="Stock Quantity" type="number" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} />
            <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({...form, image: e.target.value})} />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
          </div>
          <button type="submit" className="pill-btn">Save Product</button>
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
            <th>Category</th>
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
              <td>{product.category}</td>
              <td>
                {user?.role === 'admin' || (user?.role === 'seller' && product.brand?.toLowerCase() === sellerBrand.toLowerCase()) ? (
                  <button className="delete-btn" onClick={() => deleteProduct(product._id)}>Delete</button>
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
                <input className="form-input" placeholder="John Doe" value={createForm.name} onChange={e => setCreateForm({...createForm, name: e.target.value})} required />
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

const BRANDS = ['Yamaha', 'KTM', 'Bajaj', 'Royal Enfield', 'TVS', 'Honda', 'Hero', 'Suzuki'];

const SellersManager = ({ token }) => {
  const [sellers, setSellers] = useState([]);
  const [editingSeller, setEditingSeller] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', company: '', phone: '', address: '', status: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', company: BRANDS[0], phone: '', address: '' });
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
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/sellers',
        createForm,
        { headers: { Authorization: `Bearer ${token}` } }
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
                  <select className="form-input" value={createForm.company} onChange={e => setCreateForm({...createForm, company: e.target.value})} required>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    <option value="__custom__">Other (type below)</option>
                  </select>
                  {createForm.company === '__custom__' && (
                    <input className="form-input" style={{marginTop: 8}} placeholder="Enter custom brand name" onChange={e => setCreateForm({...createForm, company: e.target.value})} />
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

const AnalyticsPanel = ({ orders, products }) => {
  const totalRev = orders.reduce((s, o) => s + o.totalAmount, 0);
  const avgOrder = orders.length ? Math.round(totalRev / orders.length) : 0;
  const deliveredCount = orders.filter(o => o.orderStatus === 'Delivered').length;
  const pendingCount = orders.filter(o => o.orderStatus === 'Pending').length;
  const processingCount = orders.filter(o => o.orderStatus === 'Processing').length;
  
  // Dummy data for the stacked bar
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

  return (
    <div className="fx-page">
      <div className="fx-header">
        <div className="fx-greeting">
          <h2>Good morning, Niran</h2>
          <p>Stay on top of your tasks, monitor progress, and track status.</p>
        </div>
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
              <div className="fx-limit-right">{orders.length + 50}</div>
            </div>
          </div>

          {/* Card: My Cards */}
          <div className="fx-card">
            <div className="fx-cards-header">
              <div className="fx-card-title">Top Products</div>
              <button className="fx-add-btn">+ Add new</button>
            </div>
            
            <div className="fx-cc-list">
              <div className="fx-cc fx-cc-dark">
                <div className="fx-cc-top">
                  <div className="fx-cc-chip">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg> active
                  </div>
                  <div className="fx-cc-brands">
                    <div className="fx-cc-circle c1"></div><div className="fx-cc-circle c2"></div>
                  </div>
                </div>
                <div className="fx-cc-num">Engine Oil</div>
                <div className="fx-cc-bot">
                  <div><span className="fx-cc-lbl">STOCK</span><br/>45</div>
                  <div><span className="fx-cc-lbl">SOLD</span><br/>120</div>
                </div>
              </div>

              <div className="fx-cc fx-cc-orange">
                <div className="fx-cc-top">
                  <div className="fx-cc-chip fx-cc-chip-light">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg> active
                  </div>
                </div>
                <div className="fx-cc-num" style={{marginTop: 10}}>Brake Pads</div>
                <div className="fx-cc-bot">
                  <div><span className="fx-cc-lbl">STOCK</span><br/>28</div>
                </div>
              </div>
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
                <div className="fx-sc-val">{orders.length}</div>
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
                <div className="fx-sc-val">{products.length}</div>
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
                  {orders.slice(0, 5).map((o, i) => (
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
                  {orders.length === 0 && (
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

  useEffect(() => { fetchPreOrders(); }, []);

  if (loading) return <div className="fx-loader">Loading Pre-Orders...</div>;

  return (
    <div className="fx-card fx-table-card">
      <div className="fx-table-header">
        <div className="fx-card-title">Customer Pre-Order Requests</div>
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
            {preOrders.map(po => (
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
                  <div className="po-actions">
                    <button className="po-btn accept" onClick={() => updateStatus(po._id, 'accepted')}>Check</button>
                    <button className="po-btn reject" onClick={() => updateStatus(po._id, 'not-found')}>N/A</button>
                  </div>
                </td>
              </tr>
            ))}
            {preOrders.length === 0 && (
              <tr><td colSpan="7" style={{textAlign: 'center', padding: '40px', color: '#9ca3af'}}>No pre-order requests found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
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
        setProducts(data.filter(p => p.sellerId?._id === user?.id || p.sellerId === user?.id));
      }
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchOrders();
      fetchProducts();
    }
  }, [token, user]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  const currentTab = location.pathname;

  const renderContent = () => {
    if (currentTab.includes('/dashboard/orders') || currentTab.includes('/seller-dashboard/orders') || currentTab.includes('/admin-dashboard/orders')) {
      return <OrdersManager orders={orders} token={token} onRefresh={fetchOrders} />;
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
      return <AnalyticsPanel orders={orders} products={products} />;
    }
    if (currentTab.includes('preorders')) {
      return <PreOrdersManager token={token} user={user} />;
    }
    return <DashboardHome orders={orders} products={products} totalRevenue={totalRevenue} />;
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
