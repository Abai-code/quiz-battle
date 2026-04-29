import React from 'react';

function Card({ title, content, children }) {
  return (
    <div className="card" style={{
      background: 'var(--card-bg)',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: 'var(--shadow)',
      marginBottom: '20px'
    }}>
      {title && <h3 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>{title}</h3>}
      {content && <p>{content}</p>}
      {children}
    </div>
  );
}

export default Card;
