import React from 'react';
import { useNavigate } from 'react-router-dom';
import FlightSearch from './FlightSearch';

const LandingPage = () => {
  const navigate = useNavigate();

  const destinations = [
    { title: 'London', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=400', price: '499' },
    { title: 'Paris', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=400', price: '520' },
    { title: 'Tokyo', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=400', price: '850' },
    { title: 'New York', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=400', price: '450' },
    { title: 'Dubai', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=400', price: '720' },
    { title: 'Sydney', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=400', price: '950' },
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
          <div className="search-wrapper">
            <FlightSearch />
          </div>
        </div>
      </header>

      <section className="featured-destinations">
        <h2 className="section-title">Popular Destinations</h2>
        <div className="destinations-grid">
          {destinations.map((dest, i) => (
            <div key={i} className="dest-card glass-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="dest-image-wrapper">
                <img src={dest.image} alt={dest.title} className="dest-image" />
                <div className="dest-overlay">
                  <span className="dest-price">From ${dest.price}</span>
                </div>
              </div>
              <div className="dest-info">
                <h3>{dest.title}</h3>
                <p>All-inclusive packages starting today.</p>
                <button onClick={() => navigate('/flights')} className="btn btn-primary btn-sm">
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
    </div>
  );
};

export default LandingPage;
