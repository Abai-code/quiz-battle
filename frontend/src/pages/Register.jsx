import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = '';
    const letterRegex = /[a-zA-Zа-яА-ЯәғқңөұүіӘҒҚҢӨҰҮІ]/;
    const englishOnlyRegex = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/~\-|\\ ]+$/;

    if (name === 'name') {
      if (value.length < 3) error = 'Кемінде 3 таңба керек';
      else if (!letterRegex.test(value)) error = 'Кемінде бір әріп болуы керек';
    } else if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) error = 'Email форматы қате';
    } else if (name === 'password') {
      if (value.length < 6) error = 'Кемінде 6 таңба керек';
      else if (!/[a-zA-Z]/.test(value) || !englishOnlyRegex.test(value)) error = 'Тек ағылшын әріптері мен сандар (кемінде 1 әріп)';
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    const error = validateField(name, value);
    setErrors({ ...errors, [name]: error });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setApiError('');
    
    // Барлық өрістерді қайта тексеру
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        alert('Сәтті тіркелдіңіз!');
        window.location.href = '/';
      } else {
        setApiError(data.error || 'Қате кетті');
      }
    } catch (err) {
      setApiError('Сервермен байланыс жоқ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputStyle = (fieldName) => ({
    borderColor: errors[fieldName] ? '#e74c3c' : formData[fieldName] && !errors[fieldName] ? '#2ecc71' : 'rgba(255,255,255,0.1)',
    transition: 'all 0.3s'
  });

  return (
    <main className="page-container">
      <div className="form-container card" style={{ maxWidth: '450px' }}>
        <h2 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '30px' }}>Тіркелу</h2>
        
        {apiError && (
          <div style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', padding: '12px', borderRadius: '10px', marginBottom: '20px', textAlign: 'center', border: '1px solid #e74c3c' }}>
            {apiError}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Аты-жөніңіз</label>
            <input 
              name="name"
              type="text" 
              className="form-control"
              placeholder="Атыңыз" 
              value={formData.name}
              onChange={handleChange}
              style={getInputStyle('name')}
              required 
            />
            {errors.name && <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '5px' }}>{errors.name}</p>}
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              name="email"
              type="email" 
              className="form-control"
              placeholder="example@mail.com" 
              value={formData.email}
              onChange={handleChange}
              style={getInputStyle('email')}
              required 
            />
            {errors.email && <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '5px' }}>{errors.email}</p>}
          </div>

          <div className="form-group">
            <label>Құпия сөз</label>
            <input 
              name="password"
              type="password" 
              className="form-control"
              placeholder="********" 
              value={formData.password}
              onChange={handleChange}
              style={getInputStyle('password')}
              required 
            />
            {errors.password && <p style={{ color: '#e74c3c', fontSize: '0.8rem', marginTop: '5px' }}>{errors.password}</p>}
          </div>

          <div className="form-group">
            <label>Рөліңіз</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="form-control" 
              style={{ 
                background: 'var(--input-bg)', 
                color: 'var(--text-color)', 
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                appearance: 'none', // Стандартты стрелканы алып тастау (кейбір браузерлерде)
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'white\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 10px center',
                backgroundSize: '18px'
              }}
            >
              <option value="student" style={{ background: '#1a1a2e', color: 'white' }}>Студент / Оқушы</option>
              <option value="teacher" style={{ background: '#1a1a2e', color: 'white' }}>Мұғалім</option>
            </select>
          </div>

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '20px', padding: '12px' }} disabled={isSubmitting}>
            {isSubmitting ? 'Жүктелуде...' : 'Тіркелу'}
          </button>
        </form>

        <p style={{ marginTop: '25px', textAlign: 'center', opacity: 0.8 }}>
          Аккаунтыңыз бар ма? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}>Кіру</Link>
        </p>
      </div>
    </main>
  );
}

export default Register;
