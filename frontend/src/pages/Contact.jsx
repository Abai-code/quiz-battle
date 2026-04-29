import React, { useState } from 'react';

function Contact() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(() => {
      alert('Хабарлама сәтті жіберілді! Жақында жауап береміз.');
      setFormData({ name: user.name || '', email: user.email || '', subject: '', message: '' });
      setLoading(false);
    })
    .catch(err => {
      alert('Жіберу кезінде қате кетті.');
      setLoading(false);
    });
  };

  return (
    <main className="page-container">
      <h2 className="section-title">Байланыс</h2>
      <div className="card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <p style={{ textAlign: 'center', marginBottom: '30px', opacity: 0.8 }}>
          Сұрақтарыңыз немесе ұсыныстарыңыз болса, бізге хабарласыңыз.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Атыңыз</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Толық атыңызды енгізіңіз" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Электронды пошта</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="example@gmail.com" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Тақырып</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Қандай сұрақ бойынша?" 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Хабарлама</label>
            <textarea 
              className="form-control" 
              rows="5" 
              placeholder="Хабарламаңызды жазыңыз..." 
              required
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            ></textarea>
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Жіберілуде...' : 'Жіберу'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Contact;
