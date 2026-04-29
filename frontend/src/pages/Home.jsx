import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <main className="page-container">
      {/* Hero Section */}
      <section className="text-center mx-auto max-w-2xl" style={{ padding: '60px 0' }}>
        <h2 style={{ fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '20px', fontWeight: '800' }}>
          Білім мен Жарыстың <br />
          <span style={{ color: 'var(--primary-color)' }}>Жаңа Деңгейі</span>
        </h2>
        <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '40px' }}>
          Quiz Battle — бұл жай ғана тест емес, бұл нағыз білім шайқасы. 
          Курстарды оқы, достарыңмен жарыс және үздіктердің қатарына қосыл.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <Link to="/start-game" className="btn">Ойынды бастау</Link>
          <Link to="/courses" className="btn btn-outline">Курстарды көру</Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-3" style={{ marginTop: '40px' }}>
        <div className="card text-center">
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>📚 LMS</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Бейне-сабақтар мен прогресті бақылау.</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>⚔️ Battle</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Басқа ойыншылармен тікелей жарыс.</p>
        </div>
        <div className="card text-center">
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '10px' }}>🏆 Рейтинг</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Үздіктер тақтасында бірінші бол.</p>
        </div>
      </section>

      {user.name && (
        <section className="card text-center mx-auto max-w-2xl" style={{ marginTop: '50px' }}>
          <h3>Қош келдіңіз, {user.name}! 👋</h3>
          <p style={{ marginTop: '10px', opacity: 0.7 }}>Бүгінгі жекпе-жекті бастауға дайынсыз ба?</p>
          <div style={{ marginTop: '20px' }}>
            <Link to="/profile" className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>Профильге өту</Link>
          </div>
        </section>
      )}
    </main>
  );
}

export default Home;
