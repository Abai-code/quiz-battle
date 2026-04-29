import React, { useState, useEffect } from 'react';

function AddQuestion() {
  const [question, setQuestion] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    category: 'IT'
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = ['IT', 'Спорт', 'Тарих', 'Тілдер', 'География', 'Ғылым'];
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchHeaders = {
    'Content-Type': 'application/json',
    'x-user-role': currentUser.role,
    'x-user-id': currentUser.id,
    'x-user-name': currentUser.name
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const [editingId, setEditingId] = useState(null); // Өңделіп жатқан сұрақтың ID-і

  const fetchQuestions = () => {
    fetch('http://localhost:5000/api/questions')
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(err => console.error(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const url = editingId 
      ? `http://localhost:5000/api/questions/${editingId}` 
      : 'http://localhost:5000/api/questions';
    
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: fetchHeaders,
      body: JSON.stringify(question)
    })
    .then(res => res.json())
    .then(() => {
      alert(editingId ? 'Сұрақ жаңартылды!' : 'Сұрақ сәтті қосылды!');
      resetForm();
      setLoading(false);
      fetchQuestions();
    })
    .catch(err => {
      alert('Қате кетті');
      setLoading(false);
    });
  };

  const handleEdit = (q) => {
    setEditingId(q.id);
    setQuestion({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      category: q.category
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setQuestion({
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
      category: 'IT'
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Бұл сұрақты өшіруге сенімдісіз бе?')) {
      fetch(`http://localhost:5000/api/questions/${id}`, { 
        method: 'DELETE',
        headers: fetchHeaders
      })
        .then(res => {
          if (!res.ok) throw new Error('Өшіруге рұқсат жоқ');
          alert('Сұрақ өшірілді');
          fetchQuestions();
        })
        .catch(err => alert(err.message));
    }
  };

  return (
    <main className="page-container">
      <h2 className="section-title">{editingId ? 'Сұрақты өңдеу' : 'Сұрақтарды басқару (Quiz)'}</h2>
      
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto 50px auto' }}>
        <form onSubmit={handleSubmit}>
          {editingId && <p style={{ color: 'var(--primary-color)', marginBottom: '10px', fontWeight: 'bold' }}>⚠️ Қазір өңдеу режиміндесіз (ID: {editingId})</p>}
          <div className="form-group">
            <label>Сұрақ мәтіні</label>
            <textarea 
              className="form-control" 
              value={question.question_text}
              onChange={(e) => setQuestion({...question, question_text: e.target.value})}
              placeholder="Мысалы: Қазақстанның астанасы қай қала?"
              required
            ></textarea>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>A нұсқасы</label>
              <input type="text" className="form-control" value={question.option_a} onChange={(e) => setQuestion({...question, option_a: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>B нұсқасы</label>
              <input type="text" className="form-control" value={question.option_b} onChange={(e) => setQuestion({...question, option_b: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>C нұсқасы</label>
              <input type="text" className="form-control" value={question.option_c} onChange={(e) => setQuestion({...question, option_c: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>D нұсқасы</label>
              <input type="text" className="form-control" value={question.option_d} onChange={(e) => setQuestion({...question, option_d: e.target.value})} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
            <div className="form-group">
              <label>Дұрыс жауап</label>
              <select className="form-control" value={question.correct_option} onChange={(e) => setQuestion({...question, correct_option: e.target.value})}>
                <option value="A">A нұсқасы</option>
                <option value="B">B нұсқасы</option>
                <option value="C">C нұсқасы</option>
                <option value="D">D нұсқасы</option>
              </select>
            </div>
            <div className="form-group">
              <label>Санаты</label>
              <select className="form-control" value={question.category} onChange={(e) => setQuestion({...question, category: e.target.value})}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn" style={{ flex: 2, marginTop: '20px' }} disabled={loading}>
              {loading ? 'Сақталуда...' : (editingId ? 'Өзгерісті сақтау' : 'Сұрақты қосу')}
            </button>
            {editingId && (
              <button type="button" className="btn" style={{ flex: 1, marginTop: '20px', background: 'rgba(255,255,255,0.1)' }} onClick={resetForm}>
                Бас тарту
              </button>
            )}
          </div>
        </form>
      </div>

      <h3 className="section-title">Бар сұрақтар тізімі ({questions.length})</h3>
      <div style={{ display: 'grid', gap: '15px' }}>
        {questions.map((q, index) => (
          <div key={q.id} className="card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', background: 'var(--primary-color)', color: '#000', padding: '2px 8px', borderRadius: '5px', marginRight: '10px' }}>{q.category}</span>
              <strong style={{ display: 'block', marginTop: '5px' }}>{index + 1}. {q.question_text}</strong>
              <small style={{ opacity: 0.6 }}>Дұрыс жауап: {q.correct_option}</small>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn" style={{ background: 'rgba(255,255,255,0.1)', padding: '5px 15px' }} onClick={() => handleEdit(q)}>Өңдеу</button>
              <button className="btn" style={{ background: '#e74c3c', padding: '5px 15px' }} onClick={() => handleDelete(q.id)}>Өшіру</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default AddQuestion;
