import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// Custom Alert (Toast) Implementation
export const setupCustomAlerts = () => {
  window.nativeAlert = window.alert;
  window.nativeConfirm = window.confirm;

  window.alert = (message, type = 'info') => {
    // Determine type from message content if not explicitly provided
    if (typeof message === 'string') {
      if (message.toLowerCase().includes('қате') || message.toLowerCase().includes('error')) type = 'error';
      else if (message.toLowerCase().includes('сәтті') || message.toLowerCase().includes('success') || message.toLowerCase().includes('жаңартылды') || message.toLowerCase().includes('қосылды') || message.toLowerCase().includes('өшірілді')) type = 'success';
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    const Toast = () => {
      const [visible, setVisible] = useState(false);
      
      useEffect(() => {
        // Trigger entrance animation
        setTimeout(() => setVisible(true), 10);
        
        // Auto dismiss after 3.5 seconds
        const timer = setTimeout(() => {
          setVisible(false);
          setTimeout(() => {
            root.unmount();
            if (container.parentNode) container.parentNode.removeChild(container);
          }, 300); // Wait for exit animation
        }, 3500);
        
        return () => clearTimeout(timer);
      }, []);
      
      const colors = {
        success: '#2ecc71',
        error: '#e74c3c',
        info: 'var(--primary-color)'
      };
      
      return (
        <div style={{
          position: 'fixed',
          top: '30px',
          right: '30px',
          background: 'var(--card-bg)',
          color: 'var(--text-color)',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3), 0 0 0 1px var(--border-color)',
          borderLeft: `6px solid ${colors[type] || colors.info}`,
          zIndex: 99999,
          transform: visible ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.9)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          fontWeight: '600',
          fontSize: '1rem',
          maxWidth: '350px',
          lineHeight: '1.4'
        }}>
          <span style={{ fontSize: '1.4rem' }}>
            {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
          </span>
          {message}
        </div>
      );
    };
    
    root.render(<Toast />);
  };
  
  window.confirm = customConfirm;
};

// Custom Confirm Dialog Implementation
export const customConfirm = (message) => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    const ConfirmDialog = () => {
      const [visible, setVisible] = useState(false);
      
      useEffect(() => {
        setTimeout(() => setVisible(true), 10);
      }, []);

      const handleClose = (result) => {
        setVisible(false);
        setTimeout(() => {
          root.unmount();
          if (container.parentNode) container.parentNode.removeChild(container);
          resolve(result);
        }, 200);
      };
      
      return (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 100000, 
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s ease',
          fontFamily: 'inherit'
        }}>
          <div style={{
            background: 'var(--card-bg)', padding: '35px 30px', borderRadius: '16px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)', maxWidth: '420px', width: '90%',
            textAlign: 'center', border: '1px solid var(--border-color)',
            transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <div style={{ 
              fontSize: '3.5rem', marginBottom: '20px', 
              background: 'rgba(231, 76, 60, 0.1)', 
              width: '80px', height: '80px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', margin: '0 auto 20px auto' 
            }}>
              ⚠️
            </div>
            <h3 style={{ marginBottom: '12px', fontSize: '1.5rem', fontWeight: '800' }}>Растау қажет</h3>
            <p style={{ opacity: 0.85, marginBottom: '30px', lineHeight: '1.6', fontSize: '1.05rem' }}>{message}</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => handleClose(false)} 
                style={{ flex: 1, padding: '12px', fontWeight: 'bold' }}
              >
                Бас тарту
              </button>
              <button 
                className="btn" 
                onClick={() => handleClose(true)} 
                style={{ flex: 1, background: '#e74c3c', color: 'white', border: 'none', padding: '12px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)' }}
              >
                Иә, өшіру
              </button>
            </div>
          </div>
        </div>
      );
    };
    
    root.render(<ConfirmDialog />);
  });
};
