import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [showModal, setShowModal] = useState(!token);

  useEffect(() => {
    if (!token) {
      setShowModal(true);
    }
  }, [token]);

  if (token) return children;

  return (
    <Modal
      isOpen={showModal}
      onClose={() => { setShowModal(false); navigate(-1); }}
      onConfirm={() => { setShowModal(false); navigate('/login'); }}
      secondaryActionText="Sign Up"
      onSecondaryAction={() => { setShowModal(false); navigate('/register'); }}
      title="Sign In Required"
      message="Please sign in or create an account to book a flight with SkyLux Airways."
      confirmText="Sign In"
      cancelText="Go Back"
    />
  );
};

export default ProtectedRoute;
