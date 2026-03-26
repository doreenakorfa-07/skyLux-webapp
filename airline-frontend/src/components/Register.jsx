import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    otherNames: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await authService.signup({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        otherNames: formData.otherNames,
        username: formData.username
      });
      setSuccess('Your account has been created successfully!');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="glass-card auth-card" style={{ maxWidth: '600px' }}>
        <h2 className="auth-title">Join SkyLux</h2>
        <p className="auth-subtitle">Create an account to start your journey</p>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleRegister}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label htmlFor="firstName">First Name</label>
              <input 
                id="firstName"
                type="text" 
                placeholder="Miracle"
                value={formData.firstName} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="lastName">Last Name</label>
              <input 
                id="lastName"
                type="text" 
                placeholder="Afoko"
                value={formData.lastName} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="otherNames">Other Names (Optional)</label>
            <input 
              id="otherNames"
              type="text" 
              placeholder="Middle Names"
              value={formData.otherNames} 
              onChange={handleChange} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input 
                id="username"
                type="text" 
                placeholder="miracleafoko"
                value={formData.username} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input 
                id="email"
                type="email" 
                placeholder="miracle@example.com"
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input 
                id="password"
                type="password" 
                placeholder="Min. 8 characters"
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm</label>
              <input 
                id="confirmPassword"
                type="password" 
                placeholder="Repeat password"
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            Create Account
          </button>
        </form>
        
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
