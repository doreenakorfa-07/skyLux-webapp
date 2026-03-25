import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState({ isOpen: false, city: '' });

  const handleDestinationClick = (city) => {
    if (localStorage.getItem('token')) {
      navigate(`/flights?city=${city}`);
    } else {
      setShowLoginModal({ isOpen: true, city });
    }
  };

  const destinations = [
    { name: 'London', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=600', price: '499' },
    { name: 'Accra', img: '/images/accra.png', price: '750' },
    { name: 'Lagos', img: '/images/lagos.png', price: '720' },
    { name: 'New York', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=600', price: '450' },
    { name: 'Nairobi', img: '/images/nairobi.png', price: '450' },
    { name: 'Dubai', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600', price: '720' },
  ];

  return (
    <div className="landing-container">
      <header className="hero-section">
        <div className="hero-content fade-in">
          <span className="hero-badge">Luxury Meets the Sky</span>
          <h1 className="hero-title">
            Elevate Your Journey
          </h1>
          <p className="hero-subtitle">
            Experience unparalleled comfort and seamless travel with SkyLux Airways. Your adventure starts here.
          </p>
          <div className="hero-cta" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
              Sign In
            </button>
            <button onClick={() => navigate('/register')} className="btn btn-accent" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
              Create Account
            </button>
          </div>
        </div>
      </header>

      <section className="featured-destinations">
        <h2 className="section-title">Popular Destinations</h2>
        <div className="destinations-grid">
          {destinations.map((dest, i) => (
            <div 
              key={i} 
              className="dest-card glass-card fade-in" 
              style={{ animationDelay: `${i * 0.1}s`, cursor: 'pointer' }}
              onClick={() => handleDestinationClick(dest.name)}
            >
              <div className="dest-image-wrapper">
                <img src={dest.img} alt={dest.name} className="dest-image" />
                <div className="dest-overlay">
                  <span className="dest-price">From ${dest.price}</span>
                </div>
              </div>
              <div className="dest-info">
                <h3>{dest.name}</h3>
                <p>All-inclusive packages starting today.</p>
                <button onClick={(e) => { e.stopPropagation(); handleDestinationClick(dest.name); }} className="btn btn-primary btn-sm">
                  Explore Flights
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card glass-card fade-in">
          <h2 className="cta-title">Ready to Take Off?</h2>
          <p className="cta-text">Join thousands of happy travelers and book your next flight today.</p>
          <button onClick={() => navigate('/register')} className="btn btn-accent">
            Get Started Now
          </button>
        </div>
      </section>

      <Modal 
        isOpen={showLoginModal.isOpen} 
        onClose={() => setShowLoginModal({ isOpen: false, city: '' })}
        onConfirm={() => navigate('/login')}
        secondaryActionText="Sign Up"
        onSecondaryAction={() => navigate('/register')}
        title="Sign In Required"
        message={`Please sign in or create an account to explore flights to ${showLoginModal.city}.`}
        confirmText="Sign In"
      />
    </div>
  );
};

export default LandingPage;
