import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { flightService } from '../services/api';

const FlightList = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);

  useEffect(() => {
    const origin = query.get('origin');
    const destination = query.get('destination');
    const date = query.get('date');
    const city = query.get('city');

    setLoading(true);
    const fetchFlights = async () => {
      try {
        let res;
        if (origin && destination) {
          res = await flightService.search(origin, destination, date || '');
        } else {
          res = await flightService.getAll();
        }
        
        let filteredFlights = res.data;
        if (city) {
          const lowerCity = city.toLowerCase();
          filteredFlights = filteredFlights.filter(f => 
            f.origin.toLowerCase() === lowerCity || f.destination.toLowerCase() === lowerCity
          );
        }
        setFlights(filteredFlights);
      } catch (err) {
        console.error("Failed to fetch flights", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, [location.search]);

  return (
    <div className="flight-results-container fade-in">
      <div className="results-header">
        <h2 className="section-title">Available Flights</h2>
        <p className="results-count">{flights.length} flights found for your journey</p>
      </div>

      {loading ? (
        <div className="loading-state">Finding the best flights for you...</div>
      ) : (
        <div className="flight-grid">
          {flights.length > 0 ? flights.map((f, i) => (
            <div key={f.id} className="flight-card glass-card fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flight-card-header">
                <div className="flight-info">
                  <span className="flight-number">{f.flightNumber}</span>
                  <div className="route-info">
                    <span className="city">{f.origin}</span>
                    <span className="route-arrow">→</span>
                    <span className="city">{f.destination}</span>
                  </div>
                </div>
                <div className="price-tag">
                  <span className="currency">$</span>
                  <span className="amount">{f.price}</span>
                </div>
              </div>
              
              <div className="flight-card-details">
                <div className="detail-item">
                  <span className="detail-label">Departure</span>
                  <span className="detail-value">{new Date(f.departureTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Availability</span>
                  <span className={`detail-status ${f.availableSeats > 5 ? 'status-ok' : 'status-low'}`}>
                    {f.availableSeats > 0 ? `${f.availableSeats} seats left` : 'Sold Out'}
                  </span>
                </div>
              </div>

              <button 
                className={`btn ${f.availableSeats > 0 ? 'btn-primary' : 'btn-secondary'} btn-full`}
                disabled={f.availableSeats === 0}
                onClick={() => navigate(`/book/${f.id}`)}
              >
                {f.availableSeats > 0 ? 'Reserve Seat' : 'Fully Booked'}
              </button>
            </div>
          )) : (
            <div className="no-flights glass-card">
              <h3>No Flights Found</h3>
              <p>Try searching for different dates or locations.</p>
              <button onClick={() => navigate('/')} className="btn btn-accent">Back to Search</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightList;
