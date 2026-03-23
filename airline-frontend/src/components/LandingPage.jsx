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
    <div className="landing-page">
      <section className="hero" style={{ 
        height: '80vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: 'linear-gradient(rgba(30, 58, 138, 0.3), rgba(59, 130, 246, 0.3)), url("/images/user_airplane.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '2rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '4rem',
        textAlign: 'center',
        padding: '0 2rem'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{ fontSize: '4rem', marginBottom: '1rem', fontWeight: '800', letterSpacing: '-0.05em' }}>
            Elevate Your Journey
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '3rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 3rem' }}>
            Experience unparalleled comfort and seamless travel with Antigravity Airways. Your adventure starts here.
          </p>
          <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
            <FlightSearch />
          </div>
        </div>
        <div className="hero-decoration" style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '500px',
          height: '500px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 1
        }}></div>
      </section>

      <section className="destinations">
        <h2 style={{ fontSize: '2.5rem', marginBottom: '2.5rem', textAlign: 'center' }}>Popular Destinations</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {destinations.map((dest, i) => (
            <div key={i} className="dest-card glass-card" style={{ padding: '0', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s' }}
                 onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                 onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <img src={dest.image} alt={dest.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0 }}>{dest.title}</h3>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--secondary)' }}>All inclusive</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary)' }}>${dest.price}</span>
                  <p style={{ margin: 0, fontSize: '0.8rem' }}>Starting from</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta glass-card" style={{ 
        marginTop: '6rem', 
        background: 'var(--primary)', 
        color: 'white', 
        padding: '4rem', 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Ready to Take Off?</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.9 }}>Join thousands of happy travelers and book your next flight today.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ background: 'white', color: 'var(--primary)', fontSize: '1.1rem', padding: '1rem 3rem' }}>
          Get Started Now
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
