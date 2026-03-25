import React, { useState, useEffect, useRef } from 'react';
import { bookingService, userService, paymentService, authService } from '../services/api';
import { useToast } from './Toast';
import Modal from './Modal';
import SettingsModal from './SettingsModal';
import { getCurrencySymbol } from '../utils/currencyUtils';

const Profile = () => {
  const [bookings, setBookings] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePictureUrl') || '');
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return; // prevent StrictMode double-call
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const [bookingsRes, paymentsRes, userRes] = await Promise.all([
          bookingService.getUserBookings(),
          paymentService.getUserPayments(),
          userService.getUserProfile()
        ]);
        
        const paymentsMap = paymentsRes.data.reduce((acc, p) => {
          if (p.booking && p.booking.id) {
            acc[p.booking.id] = { transactionId: p.transactionId, paymentStatus: p.status };
          }
          return acc;
        }, {});

        const bookingsWithTxn = bookingsRes.data.map(b => ({
          ...b,
          transactionId: paymentsMap[b.id]?.transactionId || 'N/A',
          paymentStatus: paymentsMap[b.id]?.paymentStatus || null
        }));

        setBookings(bookingsWithTxn);
        setUserData(userRes.data);
        
        if (userRes.data.profilePictureUrl) {
          setProfilePic(userRes.data.profilePictureUrl);
          localStorage.setItem('profilePictureUrl', userRes.data.profilePictureUrl);
        }
      } catch (err) {
        console.error('SkyLux: Failed to fetch profile data', err);
        if (err.response?.status === 401) {
          // Session expired — token + refresh token both invalid (e.g. backend restarted)
          showToast('Your session has expired. Please log in again.', 'error');
          setTimeout(() => {
            authService.logout();
            window.location.href = '/login';
          }, 2000);
        } else {
          showToast('Unable to fetch live profile. Showing cached data.', 'info');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await userService.uploadProfilePicture(formData);
      const imageUrl = res.data.profilePictureUrl;
      localStorage.setItem('profilePictureUrl', imageUrl);
      setProfilePic(imageUrl);
      showToast('Profile picture updated!', 'success');
    } catch (err) {
      showToast('Failed to upload image.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const openCancelModal = (bookingId) => {
    setBookingToCancel(bookingId);
    setIsModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;
    const booking = bookings.find(b => b.id === bookingToCancel);
    try {
      await bookingService.cancelBooking(bookingToCancel);
      showToast(`Cancellation successful! A refund of ${getCurrencySymbol(booking.currency)}${booking.totalPrice.toFixed(2)} has been automatically initiated.`, "success");
      setBookings(bookings.map(b => b.id === bookingToCancel ? { ...b, status: 'CANCELLED', paymentStatus: 'REFUNDED' } : b));
    } catch (err) {
      showToast("Failed to cancel booking.", "error");
    } finally {
      setIsModalOpen(false);
      setBookingToCancel(null);
    }
  };

  const handleCleanup = async () => {
    try {
      await bookingService.archiveCleanupBookings();
      showToast("History tidied successfully.", "success");
      setBookings(bookings.filter(b => b.status !== 'CANCELLED' && b.flight));
    } catch (err) {
      showToast("Failed to cleanup history.", "error");
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      await bookingService.archiveBooking(bookingId);
      showToast("Record removed.", "success");
      setBookings(bookings.filter(b => b.id !== bookingId));
    } catch (err) {
      showToast("Failed to remove record.", "error");
    }
  };

  if (loading) return <div className="loading-state">Personalizing your experience...</div>;

  const displayName = userData?.username || userData?.email || localStorage.getItem('email') || 'Valued Guest';
  const displayEmail = userData?.email || localStorage.getItem('email');
  const hasUsername = !!userData?.username;
  const hasRemovable = bookings.some(b => b.status === 'CANCELLED' || !b.flight);

  return (
    <div className="profile-container fade-in">
      <h1 className="section-title">Your SkyLux Profile</h1>
      
      <div className="profile-layout">
        {/* User Sidebar */}
        <aside className="user-info-card glass-card">
          <button className="settings-gear-btn" onClick={() => setIsSettingsOpen(true)} title="Account Settings">⚙</button>
          <div className="avatar-container" onClick={() => fileInputRef.current.click()}>
            <div className="profile-avatar">
              {profilePic ? (
                <img src={profilePic} alt="Profile" />
              ) : (
                displayName[0].toUpperCase()
              )}
            </div>
            <div className="upload-overlay">
              {uploading ? 'Updating...' : 'Change Photo'}
            </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleImageUpload} 
          />
          
          <h2 className="user-name">{displayName}</h2>
          {/* Always show email if it exists and is different from the primary display name */}
          {displayEmail && displayEmail !== displayName && (
            <p className="user-email">{displayEmail}</p>
          )}
          {/* If they are the same (no username), show only one, but if the user wants BOTH, we can show it here too */}
          {!hasUsername && displayEmail && (
            <p className="user-email">{displayEmail}</p>
          )}
          
          <p className="user-role">
            {userData?.role === 'ROLE_ADMIN' ? 'SkyLux Executive' : 'Elite Voyager'}
          </p>
          
          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-label">Member Since</span>
              <span className="stat-value">March 2026</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Journeys</span>
              <span className="stat-value">{bookings.length}</span>
            </div>
          </div>
        </aside>

        {/* Bookings Area */}
        <main className="history-area">
          <div className="history-header">
            <h3 className="summary-title">Recent Journeys</h3>
            {hasRemovable && (
              <button className="tidy-btn" onClick={handleCleanup}>
                <span className="tidy-icon">🧹</span> Tidy History
              </button>
            )}
          </div>
          
          {bookings.length === 0 ? (
            <div className="no-flights glass-card">
              <p>Your passport is looking a bit empty.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.href = '/flights'}
              >
                Plan Your Next Escape
              </button>
            </div>
          ) : (
            <div className="history-container">
              {bookings.map((booking) => (
                <div key={booking.id} className="history-item glass-card">
                  <div className="history-main-info">
                    <h4>
                      {booking.flight ? `${booking.flight.origin} to ${booking.flight.destination}` : 'Legendary Route'}
                    </h4>
                    <div className="history-meta">
                      <span><strong>Flight:</strong> {booking.flight?.flightNumber || 'SK-000'}</span>
                      <span><strong>Class:</strong> {booking.flightClass}</span>
                      <span><strong>Seat:</strong> {booking.seatNumber}</span>
                    </div>
                    <span className="txn-id">Transaction #{booking.transactionId}</span>
                  </div>

                  <div className="history-status-area">
                    <div className={`status-badge ${booking.status === 'CONFIRMED' ? 'status-confirmed' : 'status-cancelled'}`}>
                      {booking.status}
                    </div>
                    <div className={`status-badge ${booking.paymentStatus === 'SUCCESS' ? 'payment-success' : booking.paymentStatus === 'FAILED' ? 'payment-failed' : booking.paymentStatus === 'REFUNDED' ? 'payment-refunded' : 'payment-pending'}`}>
                      {booking.paymentStatus === 'SUCCESS' ? '✓ Paid' : booking.paymentStatus === 'FAILED' ? '✕ Payment Failed' : booking.paymentStatus === 'REFUNDED' ? '💸 Refunded' : '⏳ Pending'}
                    </div>
                    <span className="history-price">{getCurrencySymbol(booking.currency)}{booking.totalPrice.toFixed(2)}</span>
                    {booking.status === 'CONFIRMED' && (
                      <button 
                        onClick={() => openCancelModal(booking.id)}
                        className="cancel-btn-text"
                      >
                        Cancel Reservation
                      </button>
                    )}
                    {(booking.status === 'CANCELLED' || !booking.flight) && (
                      <button 
                        onClick={() => handleDelete(booking.id)}
                        className="delete-record-btn"
                        title="Remove from history"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmCancel}
        title="Cancel Reservation?"
        message="Are you sure you want to cancel your flight? This action cannot be undone, and your seat will be released immediately."
        confirmText="Yes, Cancel"
        cancelText="Keep Booking"
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userData={userData}
        onUpdate={(updated) => setUserData(updated)}
      />
    </div>
  );
};

export default Profile;
