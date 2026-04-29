import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../api';


function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const localUser = JSON.parse(localStorage.getItem('user'));
    if (!localUser) {
      navigate('/login');
      return;
    }

    setUser(localUser);
    setNewName(localUser.name || '');

    fetch(`${API_BASE}/users`)

      .then(res => res.json())
      .then(data => {
        const found = data.find(u => u.email === localUser.email);
        if (found) {
          setUser(found);
          setNewName(found.name);
          localStorage.setItem('user', JSON.stringify(found));
        }
      })
      .catch(err => console.error(err));
  }, [navigate]);

  const handleUpdate = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/update-profile`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, name: newName })
    })
    .then(res => res.json())
    .then(data => {
      const updatedUser = { ...user, name: data.name };
      setUser(updatedUser);
      setIsEditing(false);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Профиль жаңартылды!');
    })
    .catch(err => console.error(err));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Сурет өлшемін тексеру (макс. 10МБ)
    if (file.size > 10 * 1024 * 1024) {
      alert('Сурет тым үлкен! 10МБ-тан аспайтын сурет таңдаңыз.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      
      // Серверге жіберу
      fetch(`${API_BASE}/user/avatar`, {

        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': user.id 
        },
        body: JSON.stringify({ avatar_url: base64String })
      })
      .then(() => {
        const updatedUser = { ...user, avatar_url: base64String };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      })
      .catch(err => console.error(err));
    };
    reader.readAsDataURL(file);
  };

  if (!user) return <div className="page-container" style={{ textAlign: 'center', padding: '100px' }}>Жүктелуде...</div>;

  const accuracy = user.total_questions > 0 
    ? Math.round((user.total_correct / user.total_questions) * 100) 
    : 0;

  return (
    <main className="page-container">
      <h2 className="section-title">Жеке Профиль</h2>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
          <img 
            src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
            alt="Avatar" 
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)', padding: '5px' }}
          />
        </div>
        
        {isEditing ? (
          <form onSubmit={handleUpdate}>
            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label 
                htmlFor="avatar-upload" 
                style={{ 
                  display: 'inline-block', 
                  padding: '12px 24px', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px dashed var(--primary-color)', 
                  borderRadius: '12px', 
                  cursor: 'pointer', 
                  marginBottom: '20px',
                  transition: '0.3s',
                  color: 'var(--primary-color)',
                  fontWeight: 'bold'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(255, 215, 0, 0.1)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                📸 Суретті таңдау
              </label>
              <input 
                id="avatar-upload"
                type="file" 
                accept="image/*" 
                onChange={handleFileUpload} 
                style={{ display: 'none' }}
              />
              
              <label style={{ display: 'block', marginBottom: '10px', opacity: 0.7 }}>Аты-жөніңіз</label>
              <input type="text" className="form-control" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ textAlign: 'center' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn" style={{ flex: 1 }}>Сақтау</button>
              <button type="button" className="btn btn-outline" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>Бас тарту</button>
            </div>
          </form>
        ) : (
          <div>
            <h3 style={{ fontSize: '2rem', marginBottom: '10px' }}>{user.name}</h3>
            <p style={{ opacity: 0.7, marginBottom: '30px' }}>Email: {user.email} | Рөлі: {user.role}</p>
            <button className="btn" onClick={() => setIsEditing(true)} style={{ width: '100%', marginBottom: '40px' }}>Профильді өңдеу</button>
          </div>
        )}

        <div style={{ borderTop: '1px solid rgba(150,150,150,0.1)', paddingTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div>
            <h4 style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>{user.games_played || 0}</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Ойындар</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>{user.points || 0}</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Ұпайлар</p>
          </div>
          <div>
            <h4 style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>{accuracy}%</h4>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Дәлдік</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;
