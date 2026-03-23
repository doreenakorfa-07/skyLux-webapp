import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { bookingService, userService, paymentService } from '../services/api';
import { useToast } from './Toast';

const Profile = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePictureUrl') || '');
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, paymentsRes] = await Promise.all([
          bookingService.getUserBookings(),
          paymentService.getUserPayments()
        ]);
        
        const paymentsMap = paymentsRes.data.reduce((acc, p) => {
          if (p.booking && p.booking.id) {
            acc[p.booking.id] = p.transactionId;
          }
          return acc;
        }, {});

        const bookingsWithTxn = bookingsRes.data.map(b => ({
          ...b,
          transactionId: paymentsMap[b.id] || 'N/A'
        }));

        setBookings(bookingsWithTxn);
      } catch (err) {
        console.error('Failed to fetch profile data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleImageUpload = async (e) => {
    console.log('handleImageUpload triggered');
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Staring upload to backend...');
      const res = await userService.uploadProfilePicture(formData);
      
      const imageUrl = res.data.profilePictureUrl;
      localStorage.setItem('profilePictureUrl', imageUrl);
      setProfilePic(imageUrl);
      console.log('Profile picture updated successfully');
      showToast('Profile picture updated!', 'success');
    } catch (err) {
      console.error('Upload failed with error:', err);
      if (err.response) {
        console.error('Backend error response:', err.response.data);
      }
      showToast('Failed to upload image. Please check your connection.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingService.cancelBooking(bookingId);
      showToast("Booking cancelled successfully.", "success");
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
    } catch (err) {
      showToast("Failed to cancel booking.", "error");
    }
  };

  if (loading) return <div className="container">Loading profile...</div>;

  return (
    <div className="profile-page container">
      <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>My Account</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* User Info Card */}
        <div className="glass-card" style={{ height: 'fit-content', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div 
              onClick={() => fileInputRef.current.click()}
              style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '50%', 
                background: 'var(--primary)', 
                margin: '0 auto 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative',
                border: '4px solid rgba(255,255,255,0.2)',
                transition: 'transform 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {profilePic ? (
                <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                email ? email[0].toUpperCase() : 'U'
              )}
              {uploading && (
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  background: 'rgba(0,0,0,0.5)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.8rem'
                }}>
                  Uploading...
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleImageUpload} 
            />
            <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '1rem' }}>Click image to change</p>
            <h3 style={{ margin: '0' }}>{email}</h3>
            <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {role === 'ROLE_ADMIN' ? 'Administrator' : 'Frequent Flyer'}
            </p>
          </div>
          <hr style={{ opacity: 0.1, margin: '1.5rem 0' }} />
          <div style={{ fontSize: '0.9rem' }}>
            <p><strong>Member Since:</strong> March 2026</p>
            <p><strong>Status:</strong> Active</p>
          </div>
        </div>

        {/* Booking History */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Booking History</h3>
          {loading ? (
            <p>Loading your journeys...</p>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ opacity: 0.6 }}>No bookings found yet.</p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '1rem' }}
                onClick={() => window.location.href = '/flights'}
              >
                Book Your First Flight
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  style={{ 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem' }}>
                      {booking.flight ? `${booking.flight.origin} → ${booking.flight.destination}` : 'Unknown Route (Flight Deleted)'}
                    </h4>
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem', opacity: 0.8 }}>
                      <strong>Flight:</strong> {booking.flight?.flightNumber || 'N/A'} | <strong>Class:</strong> {booking.flightClass}
                    </p>
                    <p style={{ margin: '0', fontSize: '0.85rem', opacity: 0.8 }}>
                      <strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()} | <strong>Seat:</strong> {booking.seatNumber}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                      <strong>Txn ID:</strong> {booking.transactionId}
                    </p>
                  </div>
                   <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      display: 'inline-block', 
                      padding: '0.25rem 0.75rem', 
                      background: booking.status === 'CONFIRMED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                      color: booking.status === 'CONFIRMED' ? '#10b981' : '#ef4444', 
                      borderRadius: '1rem', 
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem'
                    }}>
                      {booking.status}
                    </div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Total: ${booking.totalPrice.toFixed(2)}</p>
                    {booking.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => handleCancel(booking.id)}
                        className="btn btn-secondary" 
                        style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444' }}
                      >
                        Cancel Flight
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
