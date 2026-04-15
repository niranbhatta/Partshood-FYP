import React from 'react';
import Navbar from '../components/Navbar';
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Wallet, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Payment.css';

const Payment = () => {
  const { user } = useAuth();

  const transactions = [
    { id: 1, type: 'spent', title: 'Yamaha R15 V3 Visor', category: 'Auto Parts', amount: -1500, date: '2026-03-28' },
    { id: 2, type: 'added', title: 'Wallet Top-up', category: 'eSewa Transfer', amount: 5000, date: '2026-03-25' },
    { id: 3, type: 'spent', title: 'Bajaj Pulsar Brake Pad', category: 'Maintenance', amount: -800, date: '2026-03-22' },
    { id: 4, type: 'spent', title: 'Helmet Polish', category: 'Accessories', amount: -450, date: '2026-03-15' },
  ];

  return (
    <div className="payment-page">
      <Navbar />
      <div className="payment-container">
        <header className="payment-header">
          <h2 className="payment-heading"><Wallet size={28} /> Payment Methods</h2>
          <p className="text-gray" style={{marginTop: 8}}>Manage your cards and view your transaction history</p>
        </header>

        <div className="payment-grid">
          {/* Left Column: Card Management */}
          <section className="card-management-section">
            <h3 className="card-section-title">Your Cards</h3>
            
            <div className="credit-card">
              <div className="card-top">
                <span className="card-type">VISA</span>
                <ShieldCheck size={24} opacity={0.6} />
              </div>
              <div className="card-number">
                **** **** **** 4589
              </div>
              <div className="card-bottom">
                <div className="card-info">
                  <div className="card-info-label">Card Holder</div>
                  <div className="card-info-value">{user?.name || 'Customer Name'}</div>
                </div>
                <div className="card-info">
                  <div className="card-info-label">Expires</div>
                  <div className="card-info-value">08/28</div>
                </div>
              </div>
            </div>

            <button className="add-card-btn">
              <Plus size={20} />
              <span>Add New Payment Method</span>
            </button>

            <div className="fx-card" style={{marginTop: 32, background: '#f1f5f9', border: 'none'}}>
              <div className="fx-card-title" style={{fontSize: 14, color: '#64748b', marginBottom: 8}}>Current Wallet Balance</div>
              <div className="fx-balance-val" style={{fontSize: 24, fontWeight: 800, color: '#1e293b'}}>Rs. 2,250.00</div>
              <div className="fx-badge-green" style={{marginTop: 12, display: 'inline-block'}}>Verified Account</div>
            </div>
          </section>

          {/* Right Column: Transaction History */}
          <section className="payment-history-section">
            <div className="payment-history-card">
              <div className="history-header">
                <h3 className="history-title">Recent Transactions</h3>
                <button className="pill-btn small outline">View All</button>
              </div>

              <div className="transaction-list">
                {transactions.map(tx => (
                  <div key={tx.id} className="transaction-item">
                    <div className="tx-info">
                      <div className={`tx-icon-box ${tx.type}`}>
                        {tx.type === 'spent' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                      </div>
                      <div className="tx-details">
                        <h4>{tx.title}</h4>
                        <p>{tx.category} • {new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className={`tx-amount ${tx.type === 'spent' ? 'neg' : 'pos'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Payment;
