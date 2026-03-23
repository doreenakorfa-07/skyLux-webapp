import React, { useState, useEffect } from 'react';
import { flightService, adminService } from '../services/api';
import Modal from './Modal';
import { useToast } from './Toast';

const CLASS_COLOR = {
  FIRST: '#c9b037',
  BUSINESS: '#a78bfa',
  PREMIUM_ECONOMY: '#34d399',
  ECONOMY: '#60a5fa',
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('flights');
  const [flights, setFlights] = useState([]);
  const [users, setUsers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [newFlight, setNewFlight] = useState({
    flightNumber: '', origin: '', destination: '', departureTime: '', arrivalTime: '', price: '', totalSeats: ''
  });
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flightToDelete, setFlightToDelete] = useState(null);

  useEffect(() => {
    fetchFlights();
    fetchAnalytics();
  }, []);

  const fetchFlights = async () => {
    try {
      const res = await flightService.getAll();
      setFlights(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [usersRes, bookingsRes] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAllBookings(),
      ]);
      setUsers(usersRes.data);
      setAllBookings(bookingsRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const handleToggleBlock = async (userId) => {
    try {
      console.log('SkyLux: Toggling block for user:', userId);
      await adminService.blockUser(userId);
      fetchAnalytics();
      showToast('User status updated successfully.', 'success');
    } catch (err) {
      console.error('SkyLux: Block toggle failed', err);
      const errMsg = err.response?.data?.message || 'Failed to update user status';
      showToast(errMsg, 'error');
    }
  };

  const handleAddFlight = async (e) => {
    e.preventDefault();
    try {
      const flightData = {
        ...newFlight,
        availableSeats: newFlight.totalSeats,
        departureTime: newFlight.departureTime + ':00',
        arrivalTime: newFlight.arrivalTime + ':00'
      };
      await flightService.add(flightData);
      showToast('Flight added successfully!', 'success');
      setNewFlight({ flightNumber: '', origin: '', destination: '', departureTime: '', arrivalTime: '', price: '', totalSeats: '' });
      fetchFlights();
    } catch (err) {
      showToast('Failed to add flight', 'error');
    }
  };

  const openDeleteModal = (flight) => {
    setFlightToDelete(flight);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!flightToDelete) return;
    try {
      await flightService.delete(flightToDelete.id);
      fetchFlights();
      showToast(`Flight ${flightToDelete.flightNumber} deleted.`, 'info');
    } catch (err) {
      showToast('Failed to delete flight.', 'error');
    } finally {
      setIsModalOpen(false);
      setFlightToDelete(null);
    }
  };

  const tabs = [
    { id: 'flights', label: '✈ Flights', },
    { id: 'users', label: '👥 Users', badge: users.length },
    { id: 'bookings', label: '📋 Bookings', badge: allBookings.length },
  ];

  const confirmedBookings = allBookings.filter(b => b.status === 'CONFIRMED').length;
  const revenue = allBookings.filter(b => b.status === 'CONFIRMED').reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return (
    <div className="admin-dashboard">
      <h2 style={{ marginBottom: '1rem' }}>Admin Dashboard</h2>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Users', value: users.length, icon: '👥', color: '#a78bfa' },
          { label: 'Total Flights', value: flights.length, icon: '✈', color: '#c9b037' },
          { label: 'Active Bookings', value: confirmedBookings, icon: '📋', color: '#34d399' },
          { label: 'Total Revenue', value: `$${revenue.toFixed(0)}`, icon: '💰', color: '#60a5fa' },
        ].map(s => (
          <div key={s.label} className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>{s.icon}</span>
            <div>
              <div style={{ color: s.color, fontSize: '1.5rem', fontWeight: '700' }}>{s.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: `1px solid ${activeTab === t.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
              background: activeTab === t.id ? 'rgba(201,176,55,0.12)' : 'rgba(255,255,255,0.04)',
              color: activeTab === t.id ? 'var(--primary)' : 'var(--text-muted)',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: activeTab === t.id ? '600' : '400',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
            {t.badge !== undefined && (
              <span style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '0.05rem 0.5rem', fontSize: '0.75rem' }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Flights Tab */}
      {activeTab === 'flights' && (
        <>
          <div className="glass-card" style={{ marginBottom: '2rem' }}>
            <h3>Add New Flight</h3>
            <form onSubmit={handleAddFlight} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
              {[
                { label: 'Flight Num', key: 'flightNumber', type: 'text' },
                { label: 'Origin', key: 'origin', type: 'text' },
                { label: 'Destination', key: 'destination', type: 'text' },
                { label: 'Price', key: 'price', type: 'number' },
              ].map(f => (
                <div className="input-group" key={f.key}>
                  <label>{f.label}</label>
                  <input type={f.type} value={newFlight[f.key]} onChange={e => setNewFlight({ ...newFlight, [f.key]: e.target.value })} required />
                </div>
              ))}
              <div className="input-group">
                <label>Departure</label>
                <input type="datetime-local" value={newFlight.departureTime} onChange={e => setNewFlight({ ...newFlight, departureTime: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Arrival</label>
                <input type="datetime-local" value={newFlight.arrivalTime} onChange={e => setNewFlight({ ...newFlight, arrivalTime: e.target.value })} required />
              </div>
              <div className="input-group">
                <label>Total Seats</label>
                <input type="number" value={newFlight.totalSeats} onChange={e => setNewFlight({ ...newFlight, totalSeats: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: 'fit-content', alignSelf: 'end' }}>Add Flight</button>
            </form>
          </div>

          <div className="glass-card">
            <h3>Existing Flights</h3>
            <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {['Flight', 'Route', 'First', 'Business', 'Premium Eco.', 'Economy', 'Total Seats', 'Action'].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flights.map(f => {
                  const avail = f.availableSeatsByClass || {};
                  const total = f.totalSeatsByClass || {};
                  const classes = [
                    { key: 'FIRST', color: CLASS_COLOR.FIRST },
                    { key: 'BUSINESS', color: CLASS_COLOR.BUSINESS },
                    { key: 'PREMIUM_ECONOMY', color: CLASS_COLOR.PREMIUM_ECONOMY },
                    { key: 'ECONOMY', color: CLASS_COLOR.ECONOMY },
                  ];
                  return (
                    <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '0.75rem' }}><strong>{f.flightNumber}</strong></td>
                      <td style={{ padding: '0.75rem' }}>{f.origin} → {f.destination}</td>
                      {classes.map(cls => (
                        <td key={cls.key} style={{ padding: '0.75rem' }}>
                          <span style={{ display: 'inline-block', background: `${cls.color}18`, border: `1px solid ${cls.color}44`, color: cls.color, borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.8rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {avail[cls.key] ?? '—'} / {total[cls.key] ?? '—'}
                          </span>
                        </td>
                      ))}
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-light)', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.85rem', fontWeight: '700' }}>
                          {f.availableSeats ?? '—'} / {f.totalSeats ?? '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button onClick={() => openDeleteModal(f)} className="cancel-btn-text">Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Registered Users <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '400' }}>({users.length} total)</span></h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Username', 'Full Name', 'Email', 'Role', 'Bookings', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const userBookings = allBookings.filter(b => b.user?.id === u.id || b.user?.email === u.email);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem' }}><strong style={{ color: 'var(--primary)' }}>@{u.username || '—'}</strong></td>
                    <td style={{ padding: '0.75rem' }}>{[u.firstName, u.otherNames, u.lastName].filter(Boolean).join(' ') || '—'}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ background: u.role === 'ROLE_ADMIN' ? 'rgba(201,176,55,0.12)' : 'rgba(96,165,250,0.1)', color: u.role === 'ROLE_ADMIN' ? '#c9b037' : '#60a5fa', border: `1px solid ${u.role === 'ROLE_ADMIN' ? 'rgba(201,176,55,0.3)' : 'rgba(96,165,250,0.3)'}`, borderRadius: '20px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: '600' }}>
                        {u.role === 'ROLE_ADMIN' ? '👑 Admin' : '👤 Member'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', borderRadius: '6px', padding: '0.2rem 0.5rem', fontWeight: '600' }}>
                        {userBookings.length}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        background: u.blocked ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)', 
                        color: u.blocked ? '#f43f5e' : '#10b981', 
                        border: `1px solid ${u.blocked ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)'}`, 
                        borderRadius: '20px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: '600' 
                      }}>
                        {u.blocked ? '🚫 Blocked' : '✅ Active'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {u.role !== 'ROLE_ADMIN' && (
                        <button 
                          onClick={() => handleToggleBlock(u.id)} 
                          className={u.blocked ? "btn-success-text" : "cancel-btn-text"}
                          style={{ fontSize: '0.85rem', fontWeight: '600' }}
                        >
                          {u.blocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>All Bookings <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '400' }}>({allBookings.length} total)</span></h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {['Passenger', 'Flight', 'Route', 'Class', 'Seat', 'Payment', 'Price', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allBookings.map(b => {
                const cls = b.flightClass?.toUpperCase() || 'ECONOMY';
                const clsColor = CLASS_COLOR[cls] || '#60a5fa';
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <strong>{b.user?.username || b.user?.email?.split('@')[0] || '—'}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{b.user?.email}</div>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{b.flight?.flightNumber || '—'}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{b.flight ? `${b.flight.origin} → ${b.flight.destination}` : '—'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ background: `${clsColor}18`, border: `1px solid ${clsColor}44`, color: clsColor, borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.78rem', fontWeight: '600' }}>
                        {cls.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '600', letterSpacing: '0.05em' }}>{b.seatNumber || '—'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ background: b.paymentMethod === 'AIRPORT' ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)', color: b.paymentMethod === 'AIRPORT' ? '#fbbf24' : '#34d399', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.78rem', fontWeight: '600' }}>
                        {b.paymentMethod === 'AIRPORT' ? '🏢 Airport' : '💳 Online'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: '700', color: 'var(--primary)' }}>${b.totalPrice?.toFixed(2) || '—'}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ background: b.status === 'CONFIRMED' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', color: b.status === 'CONFIRMED' ? '#10b981' : '#f43f5e', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.78rem', fontWeight: '600' }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {allBookings.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No bookings yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setFlightToDelete(null); }}
        onConfirm={confirmDelete}
        title="Delete Flight?"
        message={`Are you sure you want to permanently delete flight ${flightToDelete?.flightNumber} (${flightToDelete?.origin} → ${flightToDelete?.destination})? This cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Keep Flight"
      />
    </div>
  );
};

export default AdminDashboard;
