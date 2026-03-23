import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { flightService } from '../services/api';

const FlightList = () => {
  const [flights, setFlights] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  useEffect(() => {
    const origin = query.get('origin');
    const destination = query.get('destination');
    const date = query.get('date');

    if (origin && destination && date) {
      flightService.search(origin, destination, date).then(res => setFlights(res.data));
    } else {
      flightService.getAll().then(res => setFlights(res.data));
    }
  }, [location.search]);

  return (
    <div className="flight-list">
      <h2 style={{ marginBottom: '1.5rem' }}>Available Flights</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {flights.length > 0 ? flights.map(f => (
          <div key={f.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>{f.flightNumber}</span>
              <span style={{ color: 'var(--primary)' }}>${f.price}</span>
            </div>
            <p style={{ color: 'var(--secondary)' }}>{f.origin} → {f.destination}</p>
            <p style={{ fontSize: '0.9rem' }}>Departure: {new Date(f.departureTime).toLocaleString()}</p>
            <p style={{ fontSize: '0.8rem', color: f.availableSeats > 0 ? 'green' : 'red' }}>
              Seats available: {f.availableSeats}
            </p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '1rem' }} 
              disabled={f.availableSeats === 0}
              onClick={() => navigate(`/book/${f.id}`)}
            >
              Book Now
            </button>
          </div>
        )) : <p>No flights found.</p>}
      </div>
    </div>
  );
};

export default FlightList;
