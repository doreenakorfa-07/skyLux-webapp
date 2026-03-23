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
    <div className="glass-card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Search Flights</h2>
      <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
        <div className="input-group">
          <label>Origin</label>
          <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="E.g. New York" required />
        </div>
        <div className="input-group">
          <label>Destination</label>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="E.g. London" required />
        </div>
        <div className="input-group">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Search</button>
      </form>
    </div>
  );
};

export default FlightSearch;
