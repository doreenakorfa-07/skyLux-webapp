import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService, adminService, paymentService } from '../services/api';
import { useToast } from './Toast';
import Modal from './Modal';
import { getCurrencySymbol } from '../utils/currencyUtils';

const BookingCard = ({ booking, isAdmin, onDelete }) => (
  <div className="history-item glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
    <div className="history-main-info" style={{ flex: 1 }}>
      <h4 style={{ margin: 0, fontSize: '1.2rem' }}>
        {booking.flight ? `${booking.flight.origin} to ${booking.flight.destination}` : 'Legendary Route'}
        {isAdmin && booking.user && (
          <span style={{ marginLeft: '1rem', fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 'normal' }}>
            — Passenger: {booking.user.firstName} {booking.user.lastName} ({booking.user.username || booking.user.email})
          </span>
        )}
      </h4>
      <div className="history-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <span><strong>Flight:</strong> {booking.flight?.flightNumber || 'SK-000'}</span>
        <span><strong>Date:</strong> {new Date(booking.bookingDate).toLocaleDateString()}</span>
        <span><strong>Class:</strong> {booking.flightClass}</span>
        <span><strong>Seat:</strong> {booking.seatNumber}</span>
        {isAdmin && <span><strong>Txn:</strong> #{booking.transactionId}</span>}
      </div>
    </div>
    <div className="history-status-area" style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <span className={`status-badge ${booking.status === 'CONFIRMED' ? 'status-confirmed' : 'status-cancelled'}`}>
          {booking.status}
        </span>
        <span className={`status-badge ${booking.paymentStatus === 'SUCCESS' ? 'payment-success' : booking.paymentStatus === 'REFUNDED' ? 'payment-refunded' : 'payment-pending'}`}>
          {booking.paymentStatus}
        </span>
      </div>
      <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--accent-color)' }}>
        {getCurrencySymbol(booking.currency)}{booking.totalPrice?.toFixed(2) || '0.00'}
      </span>
      {isAdmin && onDelete && (
        <button
          onClick={() => onDelete(booking.id)}
          className="delete-record-btn"
          style={{ marginTop: '0.5rem', opacity: 0.6 }}
          title="Permanently Delete Log"
        >
          🗑️
        </button>
      )}
    </div>
  </div>
);

const History = () => {
  const [masterHistory, setMasterHistory] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('master'); // 'master' | 'mine'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const { showToast } = useToast();
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const isAdmin = role === 'ROLE_ADMIN';

  useEffect(() => {
    if (!token) {
      showToast('Please log in to view your history.', 'error');
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        if (isAdmin) {
          const [allBookingsRes, allPaymentsRes, myBookingsRes, myPaymentsRes] = await Promise.all([
            adminService.getAllHistory(),
            adminService.getAllPayments(),
            bookingService.getUserBookings(),
            paymentService.getUserPayments()
          ]);

          const allPaymentsMap = (allPaymentsRes.data || []).reduce((acc, p) => {
            if (p.booking?.id) acc[p.booking.id] = { transactionId: p.transactionId, paymentStatus: p.status };
            return acc;
          }, {});
          const myPaymentsMap = (myPaymentsRes.data || []).reduce((acc, p) => {
            if (p.booking?.id) acc[p.booking.id] = { transactionId: p.transactionId, paymentStatus: p.status };
            return acc;
          }, {});

          setMasterHistory(allBookingsRes.data.map(b => ({
            ...b,
            transactionId: allPaymentsMap[b.id]?.transactionId || 'N/A',
            paymentStatus: allPaymentsMap[b.id]?.paymentStatus || 'PENDING'
          })));
          setMyHistory(myBookingsRes.data.map(b => ({
            ...b,
            transactionId: myPaymentsMap[b.id]?.transactionId || 'N/A',
            paymentStatus: myPaymentsMap[b.id]?.paymentStatus || 'PENDING'
          })));
        } else {
          const [bookingsRes, paymentsRes] = await Promise.all([
            bookingService.getUserBookings(),
            paymentService.getUserPayments()
          ]);
          const paymentsMap = (paymentsRes.data || []).reduce((acc, p) => {
            if (p.booking?.id) acc[p.booking.id] = { transactionId: p.transactionId, paymentStatus: p.status };
            return acc;
          }, {});
          setMyHistory(bookingsRes.data.map(b => ({
            ...b,
            transactionId: paymentsMap[b.id]?.transactionId || 'N/A',
            paymentStatus: paymentsMap[b.id]?.paymentStatus || 'PENDING'
          })));
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
        showToast('Could not load history.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [isAdmin, token]);

  const handlePermanentDelete = async () => {
    try {
      await bookingService.hardDeleteBooking(deleteConfirmId);
      showToast('Record permanently deleted.', 'success');
      setMasterHistory(prev => prev.filter(b => b.id !== deleteConfirmId));
    } catch (err) {
      showToast('Deletion failed.', 'error');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  if (loading) return <div className="loading-state">Retrieving records...</div>;

  const displayHistory = isAdmin && activeTab === 'master' ? masterHistory : myHistory;

  return (
    <div className="history-page fade-in">
      <div className="history-header" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 className="section-title">
          {isAdmin
            ? (activeTab === 'master' ? 'SkyLux Master History' : 'My Journeys')
            : 'Your Journey History'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {isAdmin
            ? (activeTab === 'master'
                ? 'A complete log of every reservation processed through our elite network.'
                : 'Your personal travel history as a SkyLux Elite Voyager.')
            : 'Every destination you have conquered and memories you have made.'}
        </p>
      </div>

      {/* Admin Tab Switcher */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', justifyContent: 'center' }}>
          {[
            { id: 'master', label: '🏛️ Master History', desc: 'All system bookings' },
            { id: 'mine',   label: '✈️ My Journeys',   desc: 'My personal travels' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '10px',
                border: `1px solid ${activeTab === tab.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                background: activeTab === tab.id ? 'rgba(201,176,55,0.12)' : 'rgba(255,255,255,0.04)',
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: activeTab === tab.id ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem'
              }}
            >
              <span>{tab.label}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>{tab.desc}</span>
            </button>
          ))}
        </div>
      )}

      <div className="history-grid" style={{ display: 'grid', gap: '1.5rem' }}>
        {displayHistory.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p>{isAdmin && activeTab === 'mine' ? "You haven't made any bookings yet as a traveler." : 'No historical records found.'}</p>
          </div>
        ) : (
          displayHistory.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isAdmin={isAdmin && activeTab === 'master'}
              onDelete={isAdmin && activeTab === 'master' ? setDeleteConfirmId : null}
            />
          ))
        )}
      </div>

      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handlePermanentDelete}
        title="Permanently Delete Record?"
        message="This will erase the booking from ALL system logs permanently. This action cannot be undone."
        confirmText="Yes, Delete Forever"
        cancelText="Cancel"
      />
    </div>
  );
};

export default History;
