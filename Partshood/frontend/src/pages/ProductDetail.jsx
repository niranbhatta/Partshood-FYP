import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams(); // tearing the product ID out of the URL string so we know what to fetch
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // fires as soon as the page loads, pulling down the specific item data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product');
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!product) return <div className="loading-screen">Product not found</div>;

  const isOutOfStock = product.stock === 0;

  // funneling both "Buy Now" and "Add to Cart" through the same logic
  const handleAction = (action) => {
    // silently intercepting guests and forcing them to log in before they can interact with the cart
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (action === 'cart') {
      addToCart(product._id);
    } else if (action === 'buy') {
      // 'buy now' adds it to the cart and instantly slides them over to the checkout phase
      addToCart(product._id);
      navigate('/cart');
    }
  };

  return (
    <div className="detail-page">
      <Navbar />
      <div className="detail-container">
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to Shop</Link>

        <div className="detail-grid">
          <div className="detail-image-box">
            <img src={product.image || 'https://placehold.co/400'} alt={product.name} />
          </div>

          <div className="detail-info">
            <span className="detail-category">{product.category}</span>
            <h1 className="detail-name">{product.name}</h1>

            <div className="detail-rating-row">
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>{product.rating} ({product.reviews} Reviews)</span>
            </div>

            <p className="detail-description">{product.description}</p>

            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-label">Brand</span>
                <span className="meta-value">{product.brand}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Bike Model</span>
                <span className="meta-value">{product.bikeModel}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Stock</span>
                {/* dynamically throwing on css classes based on whether it is in stock or not */}
                <span className={`meta-value ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                  {isOutOfStock ? 'Out of Stock' : `${product.stock} available`}
                </span>
              </div>
            </div>

            <div className="detail-price">Rs. {product.price}</div>

            <div className="detail-actions">
              {/* toggling the UI completely if the item is gone, routing them to the preorder flow instead */}
              {isOutOfStock ? (
                <div className="detail-out-of-stock-row">
                  <span className="detail-oos-badge">Out of Stock</span>
                  <button className="pill-btn preorder-btn" onClick={() => navigate('/pre-order')}>Pre Order</button>
                </div>
              ) : (
                <>
                  <button className="pill-btn outline" onClick={() => handleAction('cart')}>
                    <ShoppingCart size={16} /> Add To Cart
                  </button>
                  <button className="pill-btn" onClick={() => handleAction('buy')}>Buy Now</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
