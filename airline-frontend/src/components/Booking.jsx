import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightService, bookingService } from '../services/api';
import { useToast } from './Toast';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [selectedClass, setSelectedClass] = useState('ECONOMY');
  const [seatNumber, setSeatNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [paymentDetails, setPaymentDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const formatCardNumber = (num) => {
    return num.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const CLASS_ROWS = {
    'FIRST':           { min: 1,  max: 2,  label: 'Rows 1–2' },
    'BUSINESS':        { min: 3,  max: 6,  label: 'Rows 3–6' },
    'PREMIUM_ECONOMY': { min: 7,  max: 12, label: 'Rows 7–12' },
    'ECONOMY':         { min: 13, max: 35, label: 'Rows 13–35' },
  };

  const classes = [
    { id: 'ECONOMY',         label: 'Economy',         multiplier: 1,   image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=400' },
    { id: 'PREMIUM_ECONOMY', label: 'Premium Economy', multiplier: 1.5, image: 'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?q=80&w=400' },
    { id: 'BUSINESS',        label: 'Business Class',  multiplier: 3,   image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=400' },
    { id: 'FIRST',           label: 'First Class',     multiplier: 6,   image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?q=80&w=400' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [flightRes, seatsRes] = await Promise.all([
          flightService.getAll(),
          bookingService.getOccupiedSeats(id)
        ]);
        const f = flightRes.data.find(item => item.id.toString() === id);
        setFlight(f);
        setOccupiedSeats(seatsRes.data.map(s => s.toUpperCase()));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    
    const seat = seatNumber.trim().toUpperCase();
    const seatMatch = seat.match(/^(\d+)[A-F]$/);
    if (!seatMatch) {
      showToast("Invalid seat format. Use formats like 1A, 15F, etc.", "error");
      return;
    }

    const rowNum = parseInt(seatMatch[1], 10);
    const classRows = {
      'FIRST': [1, 2],
      'BUSINESS': [3, 4, 5, 6],
      'PREMIUM_ECONOMY': [7, 8, 9, 10, 11, 12],
      'ECONOMY': Array.from({length: 23}, (_, i) => i + 13) // 13 to 35
    };

    const validRows = classRows[selectedClass];
    if (!validRows.includes(rowNum)) {
      showToast(`${selectedClass.replace('_', ' ')} seats must be selected from rows ${validRows[0]} to ${validRows[validRows.length - 1]}.`, "error");
      return;
    }

    if (occupiedSeats.includes(seat)) {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      const suggestions = [];
      for (let r of validRows) {
        for (let l of letters) {
          if (!occupiedSeats.includes(`${r}${l}`)) {
            suggestions.push(`${r}${l}`);
            if (suggestions.length >= 5) break;
          }
        }
        if (suggestions.length >= 5) break;
      }
      showToast(`Seat ${seat} is already occupied! Suggestions: ${suggestions.join(', ')}`, "error", 7000);
      return;
    }
    
    setStep(2);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'ONLINE' && paymentDetails.number.replace(/\s+/g, '').length !== 16) {
      showToast("Please enter a valid 16-digit card number.", "error");
      return;
    }
    
    setProcessing(true);
    setTimeout(async () => {
      try {
        await bookingService.book(id, seatNumber.trim().toUpperCase(), selectedClass, paymentMethod);
        showToast(paymentMethod === 'ONLINE' ? 'Payment Successful!' : 'Reservation Confirmed!', 'success');
        setTimeout(() => navigate('/profile'), 3000);
      } catch (err) {
        showToast('Booking failed: ' + (err.response?.data?.message || 'Unknown error'), 'error');
        setProcessing(false);
      }
    }, 1500);
  };

  if (loading) return <div className="loading-state">Preparing your journey details...</div>;
  if (!flight) return <div className="no-flights">Flight not found.</div>;

  const currentPrice = (flight.price * classes.find(c => c.id === selectedClass).multiplier).toFixed(2);

  return (
    <div className="booking-page fade-in">
      <h1 className="section-title">Configure Your Journey</h1>
      
      <div className="booking-grid">
        <div className="flight-selection-area">
          <div className="class-selection">
            <h3 className="summary-title">Travel Class</h3>
            <div className="class-grid">
              {classes.map((c) => (
                <div 
                  key={c.id} 
                  className={`booking-class-card glass-card ${selectedClass === c.id ? 'active' : ''}`}
                  onClick={() => setSelectedClass(c.id)}
                >
                  <img src={c.image} alt={c.label} />
                  {selectedClass === c.id && <span className="class-badge">Selected</span>}
                  <div className="class-info">
                    <h4>{c.label}</h4>
                    <span className="multiplier">x{c.multiplier} Premium</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="booking-summary-column">
          <div className="flight-summary-card glass-card">
            <h3 className="summary-title">Booking Summary</h3>
            <div className="summary-details">
              <div className="detail-row">
                <span>Flight</span>
                <span className="bold">{flight.flightNumber}</span>
              </div>
              <div className="detail-row">
                <span>Route</span>
                <span className="bold">{flight.origin} → {flight.destination}</span>
              </div>
              <div className="detail-row">
                <span>Class</span>
                <span className="bold">{classes.find(c => c.id === selectedClass).label}</span>
              </div>
              <div className="detail-row">
                <span>Seat</span>
                <span className="bold">{seatNumber || 'Not selected'}</span>
              </div>
              
              <div className="price-display">
                <span className="label">Total Amount</span>
                <span className="value">${currentPrice}</span>
              </div>
            </div>

            {step === 1 ? (
              <form onSubmit={handleStep1Submit} className="checkout-section">
                <div className="input-group">
                  <label>Select Seat (e.g., 1A, 25F)</label>
                  <input 
                    type="text" 
                    placeholder="Enter seat number..."
                    value={seatNumber} 
                    onChange={(e) => setSeatNumber(e.target.value)} 
                    required 
                    style={seatNumber ? (() => {
                      const m = seatNumber.trim().toUpperCase().match(/^(\d+)[A-F]$/);
                      if (!m) return {};
                      const row = parseInt(m[1], 10);
                      const { min, max } = CLASS_ROWS[selectedClass];
                      return row >= min && row <= max
                        ? { borderColor: '#10b981', boxShadow: '0 0 0 2px rgba(16,185,129,0.2)' }
                        : { borderColor: '#f43f5e', boxShadow: '0 0 0 2px rgba(244,63,94,0.2)' };
                    })() : {}}
                  />
                  {/* Live seat validation hint */}
                  {(() => {
                    const { min, max, label } = CLASS_ROWS[selectedClass];
                    const m = seatNumber.trim().toUpperCase().match(/^(\d+)[A-F]$/);
                    const row = m ? parseInt(m[1], 10) : null;
                    const isWrong = row !== null && (row < min || row > max);
                    const isRight = row !== null && row >= min && row <= max;
                    return (
                      <div style={{ marginTop: '0.4rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {isWrong ? (
                          <>
                            <span style={{ color: '#f43f5e', fontWeight: 600 }}>⚠ Wrong class!</span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {classes.find(c => c.id === selectedClass)?.label} requires {label} (got row {row}).
                            </span>
                          </>
                        ) : isRight ? (
                          <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Valid {classes.find(c => c.id === selectedClass)?.label} seat</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>ℹ {classes.find(c => c.id === selectedClass)?.label}: {label}</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <button type="submit" className="btn btn-primary btn-full">
                  Proceed to Checkout
                </button>
              </form>
            ) : (
              <div className="checkout-section fade-in">
                <h4 style={{ marginBottom: '1.5rem' }}>Secure Checkout</h4>
                <div className="payment-toggle">
                  <button 
                    type="button" 
                    className={`toggle-btn ${paymentMethod === 'ONLINE' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('ONLINE')}
                  >
                    Credit Card
                  </button>
                  <button 
                    type="button" 
                    className={`toggle-btn ${paymentMethod === 'AIRPORT' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('AIRPORT')}
                  >
                    Pay at Airport
                  </button>
                </div>

                <form onSubmit={handlePayment}>
                  {paymentMethod === 'ONLINE' && (
                    <div className="fade-in">
                      <div className="input-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label>Cardholder Name</label>
                          <button 
                            type="button" 
                            className="text-link" 
                            style={{ fontSize: '0.75rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            onClick={() => setPaymentDetails({ number: '4242424242424242', expiry: '12/28', cvv: '123', name: 'Test User' })}
                          >
                            Use Test Card
                          </button>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Full name on card" 
                          value={paymentDetails.name}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, name: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="input-group">
                        <label>Card Number</label>
                        <input 
                          type="text" 
                          placeholder="4242 4242 4242 4242" 
                          value={formatCardNumber(paymentDetails.number)}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, number: e.target.value.replace(/\s+/g, '') })}
                          maxLength="19" 
                          required 
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="input-group" style={{ flex: 2 }}>
                          <label>Expiry</label>
                          <input 
                            type="text" 
                            placeholder="MM / YY" 
                            value={paymentDetails.expiry}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })}
                            maxLength="5" 
                            required 
                          />
                        </div>
                        <div className="input-group" style={{ flex: 1 }}>
                          <label>CVV</label>
                          <input 
                            type="password" 
                            placeholder="***" 
                            value={paymentDetails.cvv}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                            maxLength="3" 
                            required 
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)} disabled={processing}>
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={processing}>
                      {processing ? 'Processing...' : (paymentMethod === 'ONLINE' ? 'Complete Payment' : 'Confirm Booking')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
