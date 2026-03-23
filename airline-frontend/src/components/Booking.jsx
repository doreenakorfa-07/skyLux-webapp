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
  const { showToast } = useToast();

  const classes = [
    { id: 'ECONOMY', label: 'Economy', multiplier: 1, image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=400' },
    { id: 'PREMIUM_ECONOMY', label: 'Premium Economy', multiplier: 1.5, image: 'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?q=80&w=400' },
    { id: 'BUSINESS', label: 'Business Class', multiplier: 3, image: '/images/business_class.png' },
    { id: 'FIRST', label: 'First Class', multiplier: 6, image: '/images/first_class.png' },
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
      // Generate some suggestions in the correct class bounds
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
      showToast(`Seat ${seat} is already occupied! Try these: ${suggestions.join(', ')}`, "error", 7000);
      return;
    }
    
    setStep(2);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'ONLINE') {
      if (paymentDetails.number.replace(/\s+/g, '').length !== 16) {
        showToast("Please enter a valid 16-digit card number.", "error");
        return;
      }
    }
    
    setProcessing(true);
    
    setTimeout(async () => {
      try {
        await bookingService.book(id, seatNumber.trim().toUpperCase(), selectedClass, paymentMethod);
        if (paymentMethod === 'ONLINE') showToast('Payment successful & Booking confirmed!', 'success');
        else showToast('Booking confirmed! Please pay at the airport counter.', 'success');
        
        // Give the user time to see the toast before navigating
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } catch (err) {
        showToast('Booking failed: ' + (err.response?.data?.message || 'Unknown error'), 'error');
        setProcessing(false);
      }
    }, 1500);
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!flight) return <div className="container">Flight not found.</div>;

  const currentPrice = (flight.price * classes.find(c => c.id === selectedClass).multiplier).toFixed(2);

  return (
    <div className="booking-page container">
      <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>Customize Your Journey</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        <div className="flight-summary glass-card">
          <h3>Flight Details</h3>
          <div style={{ marginTop: '1.5rem' }}>
            <p><strong>Flight:</strong> {flight.flightNumber}</p>
            <p><strong>Route:</strong> {flight.origin} → {flight.destination}</p>
            <p><strong>Departure:</strong> {new Date(flight.departureTime).toLocaleString()}</p>
            <hr style={{ margin: '1.5rem 0', opacity: 0.2 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem' }}>Total Price:</span>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>${currentPrice}</span>
            </div>
          </div>
          
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} style={{ marginTop: '2rem' }}>
              <div className="input-group">
                <label>Pick Your Seat (e.g., 12A)</label>
                <input 
                  type="text" 
                  placeholder="Enter seat number"
                  value={seatNumber} 
                  onChange={(e) => setSeatNumber(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.25rem' }}>
                Continue to Payment
              </button>
            </form>
          ) : (
            <form onSubmit={handlePayment} style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: 0 }}>Checkout</h4>
                <div style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>💳</div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('ONLINE')}
                  style={{ flex: 1, padding: '0.75rem', border: paymentMethod === 'ONLINE' ? '2px solid var(--primary)' : '1px solid #ccc', background: paymentMethod === 'ONLINE' ? 'rgba(37,99,235,0.1)' : 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Pay Online Now
                </button>
                <button 
                  type="button" 
                  onClick={() => setPaymentMethod('AIRPORT')}
                  style={{ flex: 1, padding: '0.75rem', border: paymentMethod === 'AIRPORT' ? '2px solid var(--primary)' : '1px solid #ccc', background: paymentMethod === 'AIRPORT' ? 'rgba(37,99,235,0.1)' : 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Pay at Airport
                </button>
              </div>

              {paymentMethod === 'ONLINE' && (
                <>
                  <div className="input-group">
                    <label>Card Number</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      maxLength="19"
                      value={paymentDetails.number} 
                      onChange={(e) => setPaymentDetails({...paymentDetails, number: e.target.value})} 
                      required 
                      style={{ letterSpacing: '2px' }}
                    />
                  </div>
                  <div className="input-group">
                    <label>Name on Card</label>
                    <input 
                      type="text" 
                      placeholder="Jane Doe"
                      value={paymentDetails.name} 
                      onChange={(e) => setPaymentDetails({...paymentDetails, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label>Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY"
                        maxLength="5"
                        value={paymentDetails.expiry} 
                        onChange={(e) => setPaymentDetails({...paymentDetails, expiry: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label>CVV</label>
                      <input 
                        type="password" 
                        placeholder="123"
                        maxLength="4"
                        value={paymentDetails.cvv} 
                        onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)} disabled={processing}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2, background: paymentMethod === 'ONLINE' ? '#10b981' : 'var(--primary)' }} disabled={processing}>
                  {processing ? 'Processing...' : (paymentMethod === 'ONLINE' ? `Pay $${currentPrice}` : 'Reserve Seat')}
                </button>
              </div>
              <p style={{ textAlign: 'center', fontSize: '0.75rem', opacity: 0.6, marginTop: '1rem', marginBottom: 0 }}>
                {paymentMethod === 'ONLINE' ? 'Secure SSL Encrypted Checkout 🔒' : 'Pay at the check-in desk upon arrival.'}
              </p>
            </form>
          )}
        </div>

        <div className="class-selection">
          <h3>Select Your Class</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
            {classes.map((c) => (
              <div 
                key={c.id} 
                className={`class-card glass-card ${selectedClass === c.id ? 'active-class' : ''}`}
                onClick={() => setSelectedClass(c.id)}
                style={{ 
                  padding: '0', 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  border: selectedClass === c.id ? '3px solid var(--primary)' : '1px solid rgba(255,255,255,0.3)',
                  transition: 'transform 0.2s'
                }}
              >
                <img src={c.image} alt={c.label} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontWeight: 'bold', margin: '0 0 0.25rem' }}>{c.label}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', marginBottom: '0.25rem' }}>x{c.multiplier} price</p>
                  <p style={{ fontSize: '0.8rem', color: flight.availableSeatsByClass && flight.availableSeatsByClass[c.id] > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold', margin: 0 }}>
                    {flight.availableSeatsByClass ? flight.availableSeatsByClass[c.id] : 0} Seats Left
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
