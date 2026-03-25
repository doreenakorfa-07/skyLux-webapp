import React from 'react';

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', secondaryActionText, onSecondaryAction }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-content glass-card slide-up">
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            {cancelText}
          </button>
          {secondaryActionText && (
            <button className="btn btn-accent" onClick={onSecondaryAction}>
              {secondaryActionText}
            </button>
          )}
          <button className="btn btn-primary" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
