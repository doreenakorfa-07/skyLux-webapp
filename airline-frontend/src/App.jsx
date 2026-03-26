import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import FlightList from './components/FlightList';
import Booking from './components/Booking';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import History from './components/History';
import Welcome from './components/Welcome';
import ProtectedRoute from './components/ProtectedRoute';
import PwaSplash from './components/PwaSplash';
import { ToastProvider } from './components/Toast';
import './App.css';
import './index-additions.css';

function App() {
  return (
    <ToastProvider>
      <Router>
        <PwaSplash />
        <div className="App">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/flights" element={<ProtectedRoute><FlightList /></ProtectedRoute>} />
              <Route path="/book/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/history" element={<History />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
