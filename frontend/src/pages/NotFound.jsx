import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontSize: '6rem', color: 'var(--primary-color)' }}>404</h1>
      <h2>Бет табылмады</h2>
      <p style={{ margin: '20px 0' }}>Сіз іздеген бет жоқ немесе басқа мекенжайға ауыстырылған.</p>
      <Link to="/" className="btn">Басты бетке оралу</Link>
    </div>
  );
}

export default NotFound;
