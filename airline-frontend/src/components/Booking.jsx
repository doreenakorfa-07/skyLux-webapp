import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightService, bookingService } from '../services/api';
import { useToast } from './Toast';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [flight, setFlight] = useState(null);
  const [numSeats, setNumSeats] = useState(1);
  const [selectedClass, setSelectedClass] = useState('ECONOMY');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatInput, setSeatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [paymentDetails, setPaymentDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [summaryPrice, setSummaryPrice] = useState(0);

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
        setLoading(true);
        const [flightRes, seatsRes] = await Promise.all([
          flightService.getById(id),
          bookingService.getOccupiedSeats(id)
        ]);
        
        if (flightRes.data) {
          setFlight(flightRes.data);
        }
        
        if (seatsRes.data) {
          setOccupiedSeats(seatsRes.data.map(s => s.toUpperCase()));
        }
      } catch (err) {
        console.error("Error fetching booking data:", err);
        showToast("Failed to load flight details. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (flight) {
      const selectedClassInfo = classes.find(c => c.id === selectedClass) || classes[0];
      setSummaryPrice((flight.price * selectedClassInfo.multiplier * numSeats).toFixed(2));
    }
  }, [flight, selectedClass, numSeats]);

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      navigate('/login');
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
        await bookingService.book(id, numSeats, selectedClass, paymentMethod);
        showToast(paymentMethod === 'ONLINE' ? 'Payment Successful!' : 'Reservation Confirmed!', 'success');
        setTimeout(() => navigate('/profile'), 3000);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          showToast('Session expired. Please log in again.', 'error');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          showToast('Booking failed: ' + (err.response?.data?.message || 'Check your connection'), 'error');
        }
        setProcessing(false);
      }
    }, 1500);
  };

  if (loading) return <div className="loading-state">Preparing your journey details...</div>;
  if (!flight) return <div className="no-flights">Flight not found.</div>;

  const selectedClassInfo = classes.find(c => c.id === selectedClass) || classes[0];
  const currentPrice = (flight.price * selectedClassInfo.multiplier).toFixed(2);

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
                <span className="bold">{selectedClassInfo.label}</span>
              </div>
              <div className="detail-row">
                <span>Seat(s)</span>
                <span className="bold">Auto-assigned</span>
              </div>
              
              <div className="price-display">
                <span className="label">Total Amount</span>
                <span className="value">${summaryPrice}</span>
              </div>
            </div>

            {step === 1 ? (
              <form onSubmit={handleStep1Submit} className="checkout-section">
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                   <label>Number of Passengers / Seats</label>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <button 
                        type="button" 
                        onClick={() => setNumSeats(Math.max(1, numSeats - 1))}
                        className="btn btn-secondary" 
                        style={{ width: '40px', height: '40px', padding: 0 }}
                     >-</button>
                     <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{numSeats}</span>
                     <button 
                        type="button" 
                        onClick={() => setNumSeats(Math.min(10, numSeats + 1))}
                        className="btn btn-secondary" 
                        style={{ width: '40px', height: '40px', padding: 0 }}
                     >+</button>
                   </div>
                </div>

                <div className="input-group">
                  <div className="glass-card" style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#10b981' }}>
                      ✨ <strong>Smart Seat Allocation Active:</strong> The system will automatically select the best available seats for you in the {selectedClassInfo.label} section.
                    </p>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }}>
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
