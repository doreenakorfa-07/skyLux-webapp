import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { exchangeRates } from '../utils/currencyUtils';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('profilePictureUrl'); // Also remove profile picture URL
    navigate('/login');
  };

  const email = localStorage.getItem('email');
  const [currency, setCurrency] = React.useState(localStorage.getItem('currency') || 'USD');

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    window.dispatchEvent(new Event('currencyChange')); // Notify other components
  };

  return (
    <nav className="navbar glass-card">
      <Link to={token ? "/welcome" : "/"} className="navbar-logo">
        <div className="logo-icon">S</div>
        <span className="logo-text">SkyLux</span>
        <span className="logo-suffix">Airways</span>
      </Link>
      <div className="navbar-links">
        <Link to={token ? "/welcome" : "/"} className="nav-link">Search</Link>
        <Link to="/flights" className="nav-link">Book Flights</Link>
        {token ? (
          <>
            <Link to="/profile" className="nav-link">My Account</Link>
            <Link to="/history" className="nav-link">History</Link>
            {role === 'ROLE_ADMIN' && (
              <Link to="/admin" className="nav-link admin-link">Admin</Link>
            )}
            <button onClick={handleLogout} className="btn btn-accent btn-sm">Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}

        <div className="currency-selector" style={{ marginLeft: '1rem' }}>
          <select 
            value={currency} 
            onChange={handleCurrencyChange}
            className="glass-card"
            style={{ 
              background: 'rgba(255,255,255,0.05)', 
              color: 'var(--text-primary)', 
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.3rem 0.5rem',
              borderRadius: '6px',
              outline: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            {Object.keys(exchangeRates).map(curr => (
              <option key={curr} value={curr} style={{ background: '#1a1a1a', color: 'white' }}>
                {curr} ({exchangeRates[curr].symbol})
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
