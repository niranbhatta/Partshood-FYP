import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, Filter, Search as SearchIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [searchName, setSearchName] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (brand) params.append('brand', brand);
        if (bikeModel) params.append('bikeModel', bikeModel);
        if (searchName) params.append('name', searchName);

        const url = `http://localhost:5000/api/products?${params.toString()}`;
        const { data } = await axios.get(url);
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products');
      }
    };
    fetchProducts();
  }, [category, brand, bikeModel, searchName]);

  const categories = ['Body Parts', 'Brakes', 'Electricals', 'Exhaust', 'Drivetrain'];
  const brands = ['Yamaha', 'KTM', 'Bajaj', 'Royal Enfield', 'TVS'];
  const bikeModels = ['R15', 'FZ S', 'Duke 200', 'Duke 390', 'Pulsar 220', 'Avenger 220', 'Classic 350', 'Apache'];

  return (
    <div className="shop-page">
      <Navbar />
      
      <div className="shop-header-minimal">
        <div className="container">
          <h1>Product Catalog</h1>
          <p>Find the high quality parts for your ride</p>
        </div>
      </div>

      <div className="shop-container">
        {/* Sidebar Filters */}
        <aside className="shop-sidebar">
          <div className="filter-section">
            <h3 className="sidebar-title"><Filter size={18} /> Filters</h3>
            
            <div className="filter-group">
              <label>Search Name</label>
              <div className="sidebar-search">
                <input 
                  type="text" 
                  placeholder="e.g. Visor..." 
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>Brand</label>
              <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                <option value="">All Brands</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="filter-group">
              <label>Bike Model</label>
              <select value={bikeModel} onChange={(e) => setBikeModel(e.target.value)}>
                <option value="">All Models</option>
                {bikeModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <button className="reset-btn" onClick={() => {
              setCategory(''); setBrand(''); setBikeModel(''); setSearchName('');
            }}>
              Reset Filters
            </button>
          </div>
        </aside>

        {/* Product Listing */}
        <main className="shop-content">
          <div className="listing-header">
            <p>{products.length} Products Found</p>
          </div>

          <div className="product-grid-simple">
            {products.map(product => (
              <div key={product._id} className="product-card-simple">
                <div className="product-img-wrapper" onClick={() => navigate(`/product/${product._id}`)}>
                  <img src={product.image} alt={product.name} />
                  {product.stock === 0 && <span className="out-of-stock">Out of Stock</span>}
                </div>
                <div className="product-info-simple">
                  <span className="product-cat-label">{product.category}</span>
                  <h3 onClick={() => navigate(`/product/${product._id}`)}>{product.name}</h3>
                  <div className="product-meta-row">
                    <span className="price">Rs. {product.price}</span>
                    <div className="rating">
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      <span>4.5</span>
                    </div>
                  </div>
                  <button 
                    className="add-to-cart-btn"
                    disabled={product.stock === 0}
                    onClick={() => addToCart(product._id)}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="no-products">
              <p>No products match your filters.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop;
