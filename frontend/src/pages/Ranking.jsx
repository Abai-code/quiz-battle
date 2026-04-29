import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../api';


function Ranking() {
  const [leaders, setLeaders] = useState([]);
  const [page, setPage] = useState(0);
  const limit = 10;
  const [battles, setBattles] = useState([]);
  const [completedBattles, setCompletedBattles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, opponent: null });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchRanking();
  }, [page]);

  useEffect(() => {
    if (user.id) {
      fetchBattles();
      fetchCompletedBattles();
      const interval = setInterval(() => {
        fetchBattles();
        fetchCompletedBattles();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchRanking = () => {
    setLoading(true);
    fetch(`${API_BASE}/ranking?limit=${limit}&offset=${page * limit}`)

      .then(res => res.json())
      .then(data => { setLeaders(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchBattles = () => {
    fetch(`${API_BASE}/battles/${user.id}`)

      .then(res => res.json())
      .then(data => setBattles(data));
  };

  const fetchCompletedBattles = () => {
    fetch(`${API_BASE}/battles/completed/${user.id}`)

      .then(res => res.json())
      .then(data => setCompletedBattles(data))
      .catch(() => {});
  };

  const handleChallenge = (opponent) => {
    if (!user.id) return alert('Жүйеге кіріңіз');
    if (user.id === opponent.id) return alert('Өзіңізге сын тастай алмайсыз');
    setModal({ show: true, opponent });
  };

  const confirmChallenge = async () => {
    try {
      const res = await fetch(`${API_BASE}/battles`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengerId: user.id, opponentId: modal.opponent.id })
      });
      const data = await res.json();
      localStorage.setItem('pendingBattleId', data.id);
      setModal({ show: false, opponent: null });
      navigate('/quiz');
    } catch (err) {
      alert('Қате');
    }
  };

  const acceptBattle = (battle) => {
    localStorage.setItem('activeBattleId', battle.id);
    localStorage.setItem('challengerScore', battle.challenger_score);
    localStorage.setItem('challengerName', battle.challenger_name);
    navigate('/quiz');
  };

  return (
    <main className="page-container">
      <h2 className="section-title">Battle & Рейтинг</h2>

      {battles.length > 0 && (
        <div className="card" style={{ marginBottom: '30px', border: '1px solid var(--primary-color)' }}>
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '15px' }}>Сізге келген шақырулар! 🔥</h3>
          <div style={{ display: 'grid', gap: '15px' }}>
            {battles.map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px' }}>
                <span><strong>{b.challenger_name}</strong> сізді жарысқа шақырды!</span>
                <button className="btn" onClick={() => acceptBattle(b)}>Қабылдау</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Аяқталған жекпе-жектер нәтижесі */}
      {completedBattles.length > 0 && (
        <div className="card" style={{ marginBottom: '30px', border: '1px solid rgba(150,150,150,0.2)' }}>
          <h3 style={{ marginBottom: '15px', opacity: 0.8 }}>⚔️ Соңғы жекпе-жектер</h3>
          <div style={{ display: 'grid', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '5px' }}>
            {completedBattles.map(b => {
              const isChallenger = b.challenger_id === user.id;
              const myScore = isChallenger ? b.challenger_score : b.opponent_score;
              const oppScore = isChallenger ? b.opponent_score : b.challenger_score;
              const oppName = isChallenger ? b.opponent_name : b.challenger_name;
              const won = myScore > oppScore;
              const draw = myScore === oppScore;
              const color = won ? '#27ae60' : draw ? '#f39c12' : '#e74c3c';
              const label = won ? '🎉 Жеңіс' : draw ? '🤝 Тең' : '😔 Жеңіліс';

              return (
                <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 15px', borderRadius: '10px', borderLeft: `3px solid ${color}` }}>
                  <span style={{ opacity: 0.8 }}>vs <strong>{oppName}</strong></span>
                  <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>{myScore} : {oppScore}</span>
                  <span style={{ color, fontWeight: 'bold' }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card">
        {loading ? <p>Жүктелуде...</p> : (
          <>
            <table className="leaderboard">
              <thead>
                <tr><th>№</th><th>Ойыншы</th><th style={{ textAlign: 'right' }}>Ұпай</th><th style={{ textAlign: 'center' }}>Battle</th></tr>
              </thead>
              <tbody>
                {leaders.map((leader, index) => (
                  <tr key={leader.id}>
                    <td>{index + 1 + (page * limit)}</td>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={leader.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${leader.name}`} 
                        alt="avatar" 
                        style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} 
                      />
                      <span>{leader.name} {user.id === leader.id && '(Сіз)'}</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{leader.points}</td>
                    <td style={{ textAlign: 'center' }}>
                      {user.id !== leader.id && <button className="btn" style={{ padding: '5px 15px' }} onClick={() => handleChallenge(leader)}>Раз на раз</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px' }}>
              <button 
                className="btn btn-outline" 
                disabled={page === 0} 
                onClick={() => setPage(page - 1)}
                style={{ padding: '8px 20px', fontSize: '0.9rem' }}
              >
                ⬅️ Алдыңғы
              </button>
              <span style={{ display: 'flex', alignItems: 'center', opacity: 0.7 }}>Бет: {page + 1}</span>
              <button 
                className="btn btn-outline" 
                disabled={leaders.length < limit}
                onClick={() => setPage(page + 1)}
                style={{ padding: '8px 20px', fontSize: '0.9rem' }}
              >
                Келесі ➡️
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Custom Modal */}
      {modal.show && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-icon">⚡</div>
            <h3>Сын тастау</h3>
            <p><strong>{modal.opponent?.name}</strong> ойыншысына сын тастайсыз ба?</p>
            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setModal({ show: false, opponent: null })}>Бас тарту</button>
              <button className="btn" onClick={confirmChallenge}>Иә, бастау</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          animation: fadeIn 0.3s ease;
        }
        .modal-card {
          background: #1a1a2e;
          padding: 40px;
          border-radius: 24px;
          text-align: center;
          max-width: 400px;
          width: 90%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
        }
        .modal-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }
        .modal-card h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
          color: var(--primary-color);
        }
        .modal-card p {
          opacity: 0.8;
          margin-bottom: 30px;
          line-height: 1.5;
        }
        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
        }
        .btn.secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
        }
        .btn.secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </main>
  );
}

export default Ranking;
