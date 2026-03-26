import React from 'react';
import { useNavigate } from 'react-router-dom';
import FlightSearch from './FlightSearch';

const Welcome = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = React.useState(localStorage.getItem('username') || '');
  const email = localStorage.getItem('email') || 'Traveler';
  const role = localStorage.getItem('role');

  React.useEffect(() => {
    const handleUpdate = () => {
      setUserName(localStorage.getItem('username') || '');
    };
    window.addEventListener('userUpdate', handleUpdate);
    return () => window.removeEventListener('userUpdate', handleUpdate);
  }, []);

  const displayName = userName || email.split('@')[0];
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <div className="container fade-in" style={{ paddingTop: '4rem' }}>
      <div className="glass-card" style={{ textAlign: 'center', marginBottom: '3rem', padding: '4rem 2rem' }}>
        <span className="hero-badge" style={{ marginBottom: '1rem' }}>Welcome Aboard</span>
        <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>
          Hello, {capitalizedName}!
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          We're thrilled to have you back. Ready for your next adventure with SkyLux Airways? Explore our latest flights and manage your journeys effortlessly.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/flights')} className="btn btn-primary" style={{ minWidth: '160px' }}>
            Book a Flight
          </button>
          <button onClick={() => navigate('/profile')} className="btn btn-accent" style={{ minWidth: '160px' }}>
            My Account
          </button>
          {role === 'ROLE_ADMIN' && (
            <button onClick={() => navigate('/admin')} className="btn btn-secondary" style={{ minWidth: '160px' }}>
              Admin Dashboard
            </button>
          )}
        </div>
      </div>

      <div className="search-wrapper" style={{ marginTop: '-1rem', marginBottom: '3rem', position: 'relative', zIndex: 10 }}>
        <FlightSearch />
      </div>

      <div className="destinations-grid" style={{ marginTop: '2rem' }}>
         <div className="glass-card fade-in" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.3s' }} onClick={() => navigate('/flights')}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem', background: 'var(--primary-light)', color: 'var(--accent)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✈️</div>
            <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Explore Flights</h3>
            <p style={{ color: 'var(--text-muted)' }}>Discover new destinations and book your next luxury journey.</p>
         </div>
         <div className="glass-card fade-in" style={{ animationDelay: '0.1s', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.3s' }} onClick={() => navigate('/profile')}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem', background: 'var(--primary-light)', color: 'var(--accent)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎫</div>
            <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Your Bookings</h3>
            <p style={{ color: 'var(--text-muted)' }}>View and manage your upcoming flights and past journeys.</p>
         </div>
         <div className="glass-card fade-in" style={{ animationDelay: '0.2s', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.3s' }} onClick={() => navigate('/profile')}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem', background: 'var(--primary-light)', color: 'var(--accent)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
            <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Profile Settings</h3>
            <p style={{ color: 'var(--text-muted)' }}>Update your personal information and travel preferences.</p>
         </div>
      </div>
    </div>
  );
};

export default Welcome;
