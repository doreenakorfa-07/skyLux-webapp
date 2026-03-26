import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { exchangeRates } from '../utils/currencyUtils';
import Modal from './Modal';

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
  const [deferredPrompt, setDeferredPrompt] = React.useState(null);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired!');
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    window.dispatchEvent(new Event('currencyChange')); // Notify other components
  };

  const handleBookFlightsClick = (e) => {
    if (!token) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  return (
    <nav className="navbar glass-card">
      <Link to="/" className="navbar-logo">
        <div className="logo-icon">S</div>
        <span className="logo-text">SkyLux</span>
        <span className="logo-suffix">Airways</span>
      </Link>

      <button 
        className={`mobile-menu-toggle ${isMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
        <div className="hamburger-line"></div>
      </button>

      <div className={`navbar-links ${isMenuOpen ? 'mobile-show' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <Link to="/" className="nav-link">Home</Link>
        <Link to={token ? "/welcome" : "/"} className="nav-link">Search</Link>
        <Link to="/flights" className="nav-link" onClick={handleBookFlightsClick}>Book Flights</Link>
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

        {deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="fade-in"
            style={{
              marginLeft: '1rem',
              background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.1) 0%, rgba(197, 160, 89, 0.05) 100%)',
              border: '1px solid rgba(197, 160, 89, 0.4)',
              color: 'var(--accent)',
              padding: '0.5rem 1rem',
              borderRadius: '50px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              flexShrink: 0,
              fontSize: '0.85rem',
              fontWeight: '500',
              letterSpacing: '0.05rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            onMouseOver={e => { 
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(197, 160, 89, 0.2) 0%, rgba(197, 160, 89, 0.1) 100%)';
              e.currentTarget.style.borderColor = 'rgba(197, 160, 89, 0.8)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(197, 160, 89, 0.2)';
            }}
            onMouseOut={e => { 
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(197, 160, 89, 0.1) 0%, rgba(197, 160, 89, 0.05) 100%)';
              e.currentTarget.style.borderColor = 'rgba(197, 160, 89, 0.4)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v13M7 11l5 5 5-5"/>
              <path d="M5 21h14"/>
            </svg>
            <span>Install App</span>
          </button>
        )}

        <div 
          className="currency-selector" 
          style={{ marginLeft: '1rem' }}
          onClick={(e) => e.stopPropagation()} // Prevent menu from closing on click
        >
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

      <Modal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onConfirm={() => { setShowAuthModal(false); navigate('/login'); }}
        secondaryActionText="Sign Up"
        onSecondaryAction={() => { setShowAuthModal(false); navigate('/register'); }}
        title="Sign In Required"
        message="Please sign in or create an account to book your luxury journey with SkyLux Airways."
        confirmText="Sign In"
        cancelText="Maybe Later"
      />
    </nav>
  );
};

export default Navbar;
