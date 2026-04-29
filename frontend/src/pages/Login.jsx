import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE from '../api';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!formData.email || !formData.password) {
      setMessage('Барлық өрістерді толтырыңыз');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage('Электронды пошта форматы қате');
      return;
    }

    setMessage('Тексерілуде...');

    try {
      const response = await fetch(`${API_BASE}/login`, {

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user || data));
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        alert(`${data.name || 'Сәтті'} ретінде сәтті кірдіңіз!`);
        window.location.href = '/';
      } else {
        setMessage(data.error || 'Қате кетті');
      }
    } catch (error) {
      console.error(error);
      setMessage('Сервермен байланыс жоқ');
    }
  };

  return (
    <main className="page-container">
      <div className="form-container card">
        <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Жүйеге кіру</h2>
        {message && <p style={{ color: '#e74c3c', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>{message}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Электрондық пошта (Email)</label>
            <input 
              type="email" 
              className="form-control"
              placeholder="example@gmail.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label>Құпия сөз (Password)</label>
            <input 
              type="password" 
              className="form-control"
              placeholder="********" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>
          <button className="btn" style={{ width: '100%', marginTop: '10px' }}>Кіру</button>
          <p style={{ marginTop: '25px', textAlign: 'center', opacity: 0.8 }}>
            Аккаунтыңыз жоқ па? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}>Тіркелу</Link>
          </p>
        </form>
      </div>
    </main>
  );
}

export default Login;
