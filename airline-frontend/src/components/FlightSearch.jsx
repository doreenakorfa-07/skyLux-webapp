import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FlightSearch = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/flights?origin=${origin}&destination=${destination}&date=${date}`);
  };

  return (
    <div className="flight-search-bar glass-card">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <label>From</label>
          <div className="input-wrapper">
            <input 
              type="text" 
              value={origin} 
              onChange={(e) => setOrigin(e.target.value)} 
              placeholder="Origin City" 
              required 
            />
          </div>
        </div>
        
        <div className="search-divider"></div>
        
        <div className="search-input-group">
          <label>To</label>
          <div className="input-wrapper">
            <input 
              type="text" 
              value={destination} 
              onChange={(e) => setDestination(e.target.value)} 
              placeholder="Destination City" 
              required 
            />
          </div>
        </div>
        
        <div className="search-divider"></div>

        <div className="search-input-group">
          <label>Departure</label>
          <div className="input-wrapper">
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
            />
          </div>
        </div>
        
        <button type="submit" className="btn btn-accent search-btn">
          Find Flights
        </button>
      </form>
    </div>
  );
};

export default FlightSearch;
