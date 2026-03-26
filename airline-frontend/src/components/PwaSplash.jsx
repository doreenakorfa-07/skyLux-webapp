import React, { useState, useEffect } from 'react';

const PwaSplash = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if running as a PWA (standalone)
    const isStandalone = !!(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);
    console.log('PWA: Running in standalone mode?', isStandalone);
    
    // Only show splash if in standalone mode and hasn't been shown this session
    const hasShownSplash = sessionStorage.getItem('pwa-splash-shown');
    
    if (isStandalone && !hasShownSplash) {
      setVisible(true);
      sessionStorage.setItem('pwa-splash-shown', 'true');
      
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000); // Show for 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeOut 0.5s ease 2.5s forwards'
    }}>
      <style>
        {`
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; pointer-events: none; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      <img 
        src="/icons/android-chrome-512x512.png" 
        alt="SkyLux Logo" 
        style={{
          width: '280px',
          maxWidth: '80%',
          animation: 'scaleIn 1.2s ease-out'
        }} 
      />
      <div style={{
        marginTop: '2rem',
        color: '#c5a059',
        fontSize: '1.2rem',
        letterSpacing: '0.3rem',
        fontFamily: 'serif',
        opacity: 0,
        animation: 'scaleIn 1s ease-out 0.5s forwards'
      }}>
        LUXURY MEETS THE SKY
      </div>
    </div>
  );
};

export default PwaSplash;
