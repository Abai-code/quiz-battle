import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StartGame() {
  const [opponent, setOpponent] = useState('random');
  const navigate = useNavigate();

  const handleStart = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return navigate('/login');

    if (opponent === 'friend') {
      navigate('/ranking');
    } else if (opponent === 'bot') {
      // Ботпен ойнау логикасы (келешекте)
      navigate('/quiz');
    } else {
      // Кездейсоқ қарсылас іздеу
      try {
        const userId = user.id || user._id; // Кез келген ID түрін тексеру
        const res = await fetch(`http://localhost:5001/api/battles/random-opponent/${userId}`);
        
        if (res.ok) {
          const opp = await res.json();
          // Батл құру
          const battleRes = await fetch('http://localhost:5001/api/battles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ challengerId: userId, opponentId: opp.id })
          });
          
          if (battleRes.ok) {
            const battle = await battleRes.json();
            localStorage.setItem('pendingBattleId', battle.id);
            navigate('/quiz');
            return;
          }
        }
        
        // Егер адам табылмаса немесе қате болса
        alert('Қазірше сізден басқа бос адамдар жоқ. Жаттығу режимі (Бот) қосылды.');
        navigate('/quiz');
      } catch (err) {
        console.error('Matchmaking error:', err);
        navigate('/quiz');
      }
    }
  };

  const opponentOptions = [
    { id: 'random', title: 'Кездейсоқ', desc: 'Автоматты іздеу', icon: '⚡' },
    { id: 'friend', title: 'Доспен', desc: 'Рейтингтен таңдау', icon: '🤝' },
    { id: 'bot', title: 'Ботпен', desc: 'Жаттығу режимі', icon: '🤖' }
  ];

  return (
    <main className="page-container" style={{ paddingTop: '80px' }}>
      <h2 className="section-title" style={{ marginBottom: '20px' }}>Ойын режимі</h2>
      <div className="card" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', padding: '25px' }}>
        
        {/* Compact VS Section */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <div className="player-card-mini" style={{ width: '100px', padding: '10px' }}>
            <div className="avatar-placeholder" style={{ fontSize: '2rem' }}>👤</div>
            <p style={{ marginTop: '5px', fontSize: '0.9rem', fontWeight: 'bold' }}>Сіз</p>
          </div>
          <div className="vs-badge" style={{ width: '45px', height: '45px', fontSize: '1.2rem' }}>VS</div>
          <div className="player-card-mini" style={{ width: '100px', padding: '10px', opacity: 0.6 }}>
            <div className="avatar-placeholder" style={{ fontSize: '2rem' }}>?</div>
            <p style={{ marginTop: '5px', fontSize: '0.9rem' }}>Қарсылас</p>
          </div>
        </div>

        <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', opacity: 0.8 }}>Қарсыласты таңдаңыз</h3>
        
        {/* Compact Custom Card Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
          {opponentOptions.map(opt => (
            <div 
              key={opt.id}
              onClick={() => setOpponent(opt.id)}
              style={{
                padding: '15px 10px',
                background: opponent === opt.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.03)',
                color: opponent === opt.id ? '#000' : 'inherit',
                borderRadius: '15px',
                cursor: 'pointer',
                border: opponent === opt.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                transition: '0.2s transform, 0.2s background',
                transform: opponent === opt.id ? 'scale(1.03)' : 'scale(1)',
                boxShadow: opponent === opt.id ? '0 5px 15px rgba(241, 196, 15, 0.2)' : 'none'
              }}
              className="opponent-card"
            >
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{opt.icon}</div>
              <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{opt.title}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{opt.desc}</div>
            </div>
          ))}
        </div>

        <button 
          className="btn" 
          onClick={handleStart}
          style={{ width: '100%', maxWidth: '300px', padding: '14px', fontSize: '1.1rem', borderRadius: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
        >
          {opponent === 'friend' ? 'Досты таңдау' : 'Ойынды бастау'}
        </button>
      </div>

      <style>{`
        .vs-badge {
          background: var(--primary-color);
          color: #000;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-weight: 900;
          font-size: 1.5rem;
          box-shadow: 0 0 20px var(--primary-color);
          animation: pulse-vs 2s infinite;
        }
        @keyframes pulse-vs {
          0% { transform: scale(1); box-shadow: 0 0 10px var(--primary-color); }
          50% { transform: scale(1.1); box-shadow: 0 0 30px var(--primary-color); }
          100% { transform: scale(1); box-shadow: 0 0 10px var(--primary-color); }
        }
        .player-card-mini {
          background: rgba(255,255,255,0.05);
          padding: 20px;
          border-radius: 20px;
          width: 140px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .avatar-placeholder {
          font-size: 3rem;
        }
        .opponent-card:hover {
          transform: translateY(-5px) !important;
          border-color: var(--primary-color) !important;
        }
      `}</style>
    </main>
  );
}

export default StartGame;
