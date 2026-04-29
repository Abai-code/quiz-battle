import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../api';


function QuizGame() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [battleResult, setBattleResult] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // тандалған жауап
  const [isCorrect, setIsCorrect] = useState(null); // дұрыс па?
  const navigate = useNavigate();

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    fetch(`${API_BASE}/questions`)

      .then(res => res.json())
      .then(data => { 
        // Сұрақтарды араластыру және әр сұрақтың нұсқаларын араластыру
        const preparedQuestions = shuffleArray(data).map(q => {
          const options = [
            { key: 'A', text: q.option_a },
            { key: 'B', text: q.option_b },
            { key: 'C', text: q.option_c },
            { key: 'D', text: q.option_d }
          ];
          return { ...q, shuffledOptions: shuffleArray(options) };
        });
        setQuestions(preparedQuestions); 
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAnswer = (optionKey, isCorrectOption) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(optionKey);
    setIsCorrect(isCorrectOption);

    const newScore = score + (isCorrectOption ? 10 : 0);
    if (isCorrectOption) setScore(newScore);

    setTimeout(async () => {
      const next = currentQuestion + 1;
      if (next < questions.length) {
        setCurrentQuestion(next);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        const result = await finishGame(newScore);
        setBattleResult(result);
        setShowScore(true);
      }
    }, 1000);
  };

  const finishGame = async (finalScore) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return null;

    fetch(`${API_BASE}/update-score`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, score: finalScore })
    });

    const pendingBattleId = localStorage.getItem('pendingBattleId');
    const activeBattleId = localStorage.getItem('activeBattleId');

    if (pendingBattleId) {
      await fetch(`${API_BASE}/battles/${pendingBattleId}/challenger`, {

        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: finalScore })
      });
      localStorage.removeItem('pendingBattleId');
      return { text: 'Шақыру жіберілді! 🚀', details: 'Қарсылас ойынды ойнаған соң нәтиже белгілі болады.' };
    } else if (activeBattleId) {
      const oppScore = parseInt(localStorage.getItem('challengerScore'));
      const oppName = localStorage.getItem('challengerName');
      await fetch(`${API_BASE}/battles/${activeBattleId}/complete`, {

        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: finalScore })
      });
      localStorage.removeItem('activeBattleId');
      localStorage.removeItem('challengerScore');
      localStorage.removeItem('challengerName');

      const text = finalScore > oppScore ? '🎉 Жеңіс! Сіз жеңдіңіз!' 
                  : finalScore < oppScore ? '😔 Жеңіліс... Келесіде сәттілік!' 
                  : '🤝 Тең түстіңіз!';
      return { text, details: `Сіздің ұпайыңыз: ${finalScore} | ${oppName}: ${oppScore}` };
    }
    return null;
  };

  if (loading) return <div className="page-container">Жүктелуде...</div>;
  if (questions.length === 0) return <div className="page-container">Сұрақтар табылмады</div>;

  const currentQ = questions[currentQuestion];

  return (
    <main className="page-container">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        {showScore ? (
          <div>
            <h2 className="section-title">Ойын аяқталды!</h2>
            <p style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>{score} ұпай</p>
            {battleResult && (
              <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
                <h3>{battleResult.text}</h3>
                <p>{battleResult.details}</p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
              <button className="btn" onClick={() => navigate('/ranking')}>Рейтинг</button>
              <button className="btn" onClick={() => window.location.reload()} style={{ background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)' }}>Қайта ойнау</button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ opacity: 0.7 }}>Сұрақ {currentQuestion + 1} / {questions.length}</p>
            <h3 style={{ marginBottom: '30px' }}>{currentQ.question_text}</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {currentQ.shuffledOptions.map((opt, idx) => {
                const isSelected = selectedAnswer === opt.key;
                const isThisCorrect = currentQ.correct_option === opt.key;
                let btnStyle = { background: 'var(--input-bg)', color: 'var(--text-color)', border: '1px solid rgba(150,150,150,0.2)', transition: 'all 0.3s' };
                if (selectedAnswer !== null) {
                  if (isThisCorrect) btnStyle = { background: '#27ae60', color: 'white', border: 'none', transform: 'scale(1.02)' };
                  else if (isSelected && !isCorrect) btnStyle = { background: '#e74c3c', color: 'white', border: 'none' };
                }
                return (
                  <button key={idx} className="btn" style={btnStyle} onClick={() => handleAnswer(opt.key, isThisCorrect)} disabled={selectedAnswer !== null}>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default QuizGame;
