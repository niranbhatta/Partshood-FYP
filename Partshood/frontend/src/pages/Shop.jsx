import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Star, Filter, Search as SearchIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Shop.css';

const Shop = () => {
  // pulling query parameters off the URL in case they clicked a brand logo on the homepage
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [searchName, setSearchName] = useState('');
  
  // tracking the available filter options so the dropdowns aren't empty
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // running once on load to populate the sidebar dropdowns with whatever is actually in the DB
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [brandsRes, catsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/products/brands'),
          axios.get('http://localhost:5000/api/products/categories')
        ]);
        setBrands(brandsRes.data);
        setCategories(catsRes.data);
      } catch (error) {
        console.error('Failed to fetch metadata');
      }
    };
    fetchMetadata();
  }, []);

  // auto-refetching the grid data dynamically every single time they tweak a filter on the sidebar
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // building out the filter query string 
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (brand) params.append('brand', brand);
        if (searchName) params.append('name', searchName);

        const url = `http://localhost:5000/api/products?${params.toString()}`;
        const { data } = await axios.get(url);
        setProducts(data);

        // dynamically shrinking the brand options if they pick a specific category so they don't see useless empty filters
        if (category) {
          const catParams = new URLSearchParams();
          catParams.append('category', category);
          const catProducts = data;
          const brandsInCategory = [...new Set(catProducts.map(p => p.brand))].sort();
          setBrands(brandsInCategory);
        } else {
          // resetting back to normal full list if they clear the category
          try {
            const { data: allBrands } = await axios.get('http://localhost:5000/api/products/brands');
            setBrands(allBrands);
          } catch (e) { /* keep existing */ }
        }
      } catch (error) {
        console.error('Failed to fetch products');
      }
    };
    fetchProducts();
  }, [category, brand, searchName]);

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
              <select value={category} onChange={(e) => { setCategory(e.target.value); setBrand(''); }}>
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

            <button className="reset-btn" onClick={() => {
              setCategory(''); setBrand(''); setSearchName('');
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
                  
                  {/* mutating the button logic if they don't actually have any physical inventory left */}
                  {product.stock === 0 ? (
                    <div className="out-of-stock-actions">
                      <span className="out-of-stock-label">Out of Stock</span>
                      <button 
                        className="preorder-link-btn"
                        onClick={(e) => { e.stopPropagation(); navigate('/pre-order'); }}
                      >
                        Pre Order
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => addToCart(product._id)}
                    >
                      Add to Cart
                    </button>
                  )}
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
