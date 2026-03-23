import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const email = localStorage.getItem('email');

  return (
    <nav className="navbar glass-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none' }}>
        Antigravity Airways
      </Link>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--text)' }}>Search</Link>
        <Link to="/flights" style={{ textDecoration: 'none', color: 'var(--text)' }}>Book Flights</Link>
        {token ? (
          <>
            <Link to="/profile" style={{ textDecoration: 'none', color: 'var(--text)' }}>My Profile</Link>
            {role === 'ROLE_ADMIN' && <Link to="/admin" style={{ textDecoration: 'none', color: 'var(--text)' }}>Admin</Link>}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Logout</button>
              {localStorage.getItem('profilePictureUrl') && (
                <img 
                  src={localStorage.getItem('profilePictureUrl')} 
                  alt="User" 
                  style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                />
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/register" style={{ textDecoration: 'none', color: 'var(--text)' }}>Register</Link>
            <Link to="/login" className="btn btn-primary" style={{ textDecoration: 'none' }}>Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
