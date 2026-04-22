import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Star, ShieldCheck, Truck, Wrench, Clock, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Home.css';

// hardcoding the primary categories here so we don't have to hit the db just to render the tabs
const CATEGORIES = ['Body Parts', 'Brakes', 'Electricals', 'Exhaust', 'Drivetrain'];
const BRANDS_LIST = [
  { name: 'Yamaha', models: 'R15, FZ S, MT-15' },
  { name: 'KTM', models: 'Duke 200, Duke 390, RC' },
  { name: 'Bajaj', models: 'Pulsar, Dominar, Avenger' },
  { name: 'Royal Enfield', models: 'Classic, Bullet, Meteor' },
  { name: 'Triumph', models: 'Speed 400, Bonneville, Scrambler' }
];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  // fetching the product reel, and passing the category filter if they clicked one of the tabs
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = activeCategory
          ? `http://localhost:5000/api/products?category=${activeCategory}`
          : 'http://localhost:5000/api/products';
        const { data } = await axios.get(url);
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  // logic to toggle the category tabs on and off
  const handleCategoryClick = (cat) => {
    if (activeCategory === cat) {
      setActiveCategory(''); // clicking the active tab clears the filter so they see everything again
    } else {
      setActiveCategory(cat);
    }
    setLoading(true); // turning the spinner back on while the new data arrives
  };

  // quickly firing them into the shop page but with the brand pre-filtered
  const handleBrandClick = (brandName) => {
    navigate(`/shop?brand=${brandName}`);
  };

  return (
    <div className="home-page">
      <Navbar />

      {/* ═══ HERO SECTION ═══ */}
      <section className="hero-section">
        <div className="hero-bg"></div>

        <div className="hero-social">
          <a href="https://facebook.com" target="_blank" rel="noreferrer">Fb</a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">Ig</a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">X</a>
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">
              <ShieldCheck size={14} />
              <span>Nepal's Trusted Marketplace</span>
            </div>
            <h1 className="hero-title">
              Premium
              <span className="hero-title-accent">Motorcycle</span>
              Spare Parts
            </h1>
            <p className="hero-description">
              Find genuine spare parts for Yamaha, KTM, Bajaj, Royal Enfield and more. 
              From brakes to body kits — everything your ride needs, delivered to your doorstep.
            </p>
            <div className="hero-actions">
              <Link to="/shop" className="btn-primary">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link to="/pre-order" className="btn-outline">
                Pre-Order Parts
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <h4>500<span>+</span></h4>
                <p>Products</p>
              </div>
              <div className="hero-stat">
                <h4>5<span>+</span></h4>
                <p>Brands</p>
              </div>
              <div className="hero-stat">
                <h4>24<span>/7</span></h4>
                <p>Support</p>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <span className="hero-year">2026</span>
            <div className="hero-image-wrapper">
              <div className="hero-image-glow"></div>
              <img src="/superbike_banner.png" alt="Premium Motorcycle Parts" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CATEGORY TABS ═══ */}
      <div className="category-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat)}
          >
            + {cat}
          </button>
        ))}
      </div>

      {/* ═══ FEATURED PRODUCTS ═══ */}
      <section className="featured-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <p className="section-label">Our Collection</p>
              <h2 className="section-title">
                {activeCategory || 'Featured'} <span>Parts</span>
              </h2>
            </div>
            <Link to="/shop" className="view-all-link">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="home-loader">
              <div className="home-spinner"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="products-grid">
              {/* only slicing the first 4 items so we don't accidentally render 100 products on the homepage */}
              {products.slice(0, 4).map((product) => (
                <Link
                  to={`/product/${product._id}`}
                  key={product._id}
                  className="product-card-home"
                >
                  <div className="product-card-img">
                    <img src={product.image} alt={product.name} />
                    <span className="product-card-cat">{product.category}</span>
                    {/* flipping colours based on stock layout */}
                    <span className={`product-card-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="product-card-body">
                    <p className="product-card-brand">{product.brand} — {product.bikeModel}</p>
                    <h3 className="product-card-name">{product.name}</h3>
                    <div className="product-card-footer">
                      <span className="product-card-price">
                        Rs. {product.price.toLocaleString()} <small>NPR</small>
                      </span>
                      <span className="product-card-rating">
                        <Star size={14} fill="#fbbf24" /> {product.rating}
                      </span>
                    </div>
                    {/* catching users trying to click pre-order so they don't get navigated to the product detail page via the wrapper link */}
                    {product.stock === 0 && (
                      <Link
                        to="/pre-order"
                        className="home-preorder-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Pre Order →
                      </Link>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <p>No products found in this category. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ BRANDS SECTION ═══ */}
      <section className="brands-section">
        <div className="section-container">
          <div className="section-header">
            <div>
              <p className="section-label">Trusted Brands</p>
              <h2 className="section-title">Shop by <span>Brand</span></h2>
            </div>
          </div>
          <div className="brands-grid">
            {BRANDS_LIST.map((brand) => (
              <div
                key={brand.name}
                className="brand-card"
                onClick={() => handleBrandClick(brand.name)}
              >
                <div className="brand-icon">
                  {brand.name.charAt(0)}
                </div>
                <h4>{brand.name}</h4>
                <p>{brand.models}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ABOUT SECTION ═══ */}
      <section className="about-section">
        <div className="section-container">
          <div className="about-grid">
            <div>
              <p className="about-label">About Us</p>
              <h2 className="about-title">Partshood</h2>
              <p className="about-text">
                Partshood is Nepal's leading multi-vendor motorcycle spare parts marketplace. 
                We connect riders with verified sellers offering genuine parts for all major 
                motorcycle brands — from Yamaha to KTM, Bajaj to Royal Enfield.
              </p>
              <p className="about-text">
                Whether you need a quick replacement or a performance upgrade, our curated 
                catalog and pre-order system ensures you always find what your ride needs.
              </p>
              <div className="about-features">
                <div className="about-feature">
                  <div className="about-feature-icon"><ShieldCheck size={20} /></div>
                  <div>
                    <h5>Genuine Parts</h5>
                    <p>100% authentic OEM parts from verified sellers</p>
                  </div>
                </div>
                <div className="about-feature">
                  <div className="about-feature-icon"><Truck size={20} /></div>
                  <div>
                    <h5>Free Shipping</h5>
                    <p>Free delivery across Nepal on all orders</p>
                  </div>
                </div>
                <div className="about-feature">
                  <div className="about-feature-icon"><Wrench size={20} /></div>
                  <div>
                    <h5>Pre-Order System</h5>
                    <p>Can't find a part? Request it via pre-order</p>
                  </div>
                </div>
                <div className="about-feature">
                  <div className="about-feature-icon"><Clock size={20} /></div>
                  <div>
                    <h5>Secure Payments</h5>
                    <p>Pay with eSewa or Cash on Delivery</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-visual">
              <div className="about-image-main">
                <img src="/superbike_banner.png" alt="Partshood Motorcycle" />
              </div>
              <div className="about-info-card">
                <h5>Partshood Marketplace</h5>
                <p>
                  Kathmandu, Nepal<br />
                  Multi-vendor platform<br />
                  support@partshood.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PRE-ORDER CTA ═══ */}
      <section className="preorder-cta">
        <div className="section-container">
          <div className="preorder-banner">
            <div className="preorder-info">
              <h3>Can't find the part you need?</h3>
              <p>
                Use our pre-order system to request any motorcycle spare part. 
                Our verified sellers will source it for you.
              </p>
            </div>
            <Link to="/pre-order" className="btn-primary">
              Pre-Order Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="home-footer">
        <div className="section-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3>Partshood</h3>
              <p>
                Nepal's trusted motorcycle spare parts marketplace. 
                Connecting riders with genuine parts from verified sellers.
              </p>
            </div>
            <div className="footer-col">
              <h5>Quick Links</h5>
              <Link to="/shop">Shop Parts</Link>
              <Link to="/pre-order">Pre-Order</Link>
              <Link to="/recommendations">Recommendations</Link>
              <Link to="/orders">My Orders</Link>
            </div>
            <div className="footer-col">
              <h5>Categories</h5>
              {CATEGORIES.map(cat => (
                <Link to={`/shop`} key={cat} onClick={() => {}}>{cat}</Link>
              ))}
            </div>
            <div className="footer-col">
              <h5>Account</h5>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/cart">Cart</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Partshood. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
