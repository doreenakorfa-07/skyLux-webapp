import React, { useState, useEffect } from 'react';
import { flightService } from '../services/api';

const AdminDashboard = () => {
  const [flights, setFlights] = useState([]);
  const [newFlight, setNewFlight] = useState({
    flightNumber: '', origin: '', destination: '', departureTime: '', arrivalTime: '', price: '', totalSeats: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      const res = await flightService.getAll();
      setFlights(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFlight = async (e) => {
    e.preventDefault();
    try {
      const flightData = { 
        ...newFlight, 
        availableSeats: newFlight.totalSeats,
        departureTime: newFlight.departureTime + ":00", // Ensure ISO format
        arrivalTime: newFlight.arrivalTime + ":00"
      };
      await flightService.add(flightData);
      setMessage('Flight added successfully!');
      setNewFlight({ flightNumber: '', origin: '', destination: '', departureTime: '', arrivalTime: '', price: '', totalSeats: '' });
      fetchFlights();
    } catch (err) {
      setMessage('Failed to add flight');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this flight?')) {
      await flightService.delete(id);
      fetchFlights();
    }
  };

  return (
    <div className="admin-dashboard">
      <h2 style={{ marginBottom: '1.5rem' }}>Admin Dashboard</h2>
      
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3>Add New Flight</h3>
        {message && <p>{message}</p>}
        <form onSubmit={handleAddFlight} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          <div className="input-group">
            <label>Flight Num</label>
            <input type="text" value={newFlight.flightNumber} onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Origin</label>
            <input type="text" value={newFlight.origin} onChange={(e) => setNewFlight({ ...newFlight, origin: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Destination</label>
            <input type="text" value={newFlight.destination} onChange={(e) => setNewFlight({ ...newFlight, destination: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Price</label>
            <input type="number" value={newFlight.price} onChange={(e) => setNewFlight({ ...newFlight, price: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Departure</label>
            <input type="datetime-local" value={newFlight.departureTime} onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Arrival</label>
            <input type="datetime-local" value={newFlight.arrivalTime} onChange={(e) => setNewFlight({ ...newFlight, arrivalTime: e.target.value })} required />
          </div>
          <div className="input-group">
            <label>Total Seats</label>
            <input type="number" value={newFlight.totalSeats} onChange={(e) => setNewFlight({ ...newFlight, totalSeats: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: 'fit-content', alignSelf: 'end' }}>Add Flight</button>
        </form>
      </div>

      <div className="glass-card">
        <h3>Existing Flights</h3>
        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
              <th>Flight</th>
              <th>Route</th>
              <th>Seats</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {flights.map(f => (
              <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 0' }}>{f.flightNumber}</td>
                <td>{f.origin} to {f.destination}</td>
                <td>{f.availableSeats}/{f.totalSeats}</td>
                <td>
                  <button onClick={() => handleDelete(f.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
