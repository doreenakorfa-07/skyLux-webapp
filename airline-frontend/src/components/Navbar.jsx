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
    localStorage.removeItem('profilePictureUrl'); // Also remove profile picture URL
    navigate('/login');
  };

  const email = localStorage.getItem('email');

  return (
    <nav className="navbar glass-card">
      <Link to="/" className="navbar-logo">
        <div className="logo-icon">S</div>
        <span className="logo-text">SkyLux</span>
        <span className="logo-suffix">Airways</span>
      </Link>
      <div className="navbar-links">
        <Link to="/" className="nav-link">Search</Link>
        <Link to="/flights" className="nav-link">Book Flights</Link>
        {token ? (
          <>
            <Link to="/profile" className="nav-link">My Account</Link>
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
      </div>
    </nav>
  );
};

export default Navbar;
