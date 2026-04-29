import React, { useState } from 'react';

function About() {
  const [showMore, setShowMore] = useState(false);

  return (
    <main className="page-container">
      <h2 className="section-title">Біз туралы</h2>
      
      <div className="card text-center mx-auto max-w-2xl">
        <p style={{ fontSize: '1.1rem', marginBottom: '20px', lineHeight: '1.8' }}>
          <strong>Quiz Battle</strong> — бұл студенттер мен оқушыларға арналған бірегей онлайн платформа. 
          Біздің басты мақсатымыз — оқу процесін геймификациялау арқылы білім алуды қызықты 
          әрі бәсекелестікке толы ету.
        </p>

        {/* Толығырақ мәтін — басқанда ашылады */}
        <div style={{
          maxHeight: showMore ? '600px' : '0',
          opacity: showMore ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.4s ease',
          marginBottom: showMore ? '30px' : '0'
        }}>
          <div className="text-center" style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px' }}>
            <p style={{ marginBottom: '10px' }}>🎯 <strong>Миссиямыз:</strong> Білім алуды ойын арқылы қызықты ету.</p>
            <p style={{ marginBottom: '10px' }}>👥 <strong>Команда:</strong> Абай атындағы университеттің студенттері.</p>
            <p style={{ marginBottom: '10px' }}>🚀 <strong>Жоспар:</strong> Жаңа пәндер мен мобильді қосымша.</p>
            <button className="btn btn-outline" style={{ marginTop: '15px', padding: '6px 15px', fontSize: '0.8rem' }} onClick={() => setShowMore(false)}>Жабу ✕</button>
          </div>
        </div>
        
        {!showMore && (
          <button className="btn" style={{ marginBottom: '30px' }} onClick={() => setShowMore(true)}>Толығырақ оқу ↓</button>
        )}
        
        <div style={{ marginTop: '30px' }}>
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1171&q=80" 
            alt="Team" 
            style={{ width: '100%', borderRadius: '20px', boxShadow: 'var(--shadow-xl)' }}
          />
        </div>
      </div>
    </main>
  );
}

export default About;
