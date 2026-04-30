import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import API_BASE from '../api';


function Header({ toggleTheme }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [unreadCounts, setUnreadCounts] = useState({ total: 0, details: [] });
  const [challengeCount, setChallengeCount] = useState(0);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [contactUnreadCount, setContactUnreadCount] = useState(0);

  useEffect(() => {
    const handleUserUpdate = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
    };
    const handleContactRead = () => {
      setContactUnreadCount(0);
    };
    window.addEventListener('userUpdated', handleUserUpdate);
    window.addEventListener('storage', handleUserUpdate);
    window.addEventListener('contactRead', handleContactRead);
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
      window.removeEventListener('storage', handleUserUpdate);
      window.removeEventListener('contactRead', handleContactRead);
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = () => {
      // Батлдар
      fetch(`${API_BASE}/battles/${user.id}`)
        .then(res => res.json())
        .then(data => setChallengeCount(data.length))
        .catch(err => console.error('Battle fetch error:', err));
      
      // Хабарламалар (Чат)
      fetch(`${API_BASE}/unread-messages`, {
        headers: { 'x-user-id': user.id }
      })
        .then(res => res.json())
        .then(data => setUnreadCounts(data || { total: 0, details: [] }))
        .catch(err => console.error('Unread fetch error:', err));

      // Жүйелік хабарламалар (Notifications)
      fetch(`${API_BASE}/notifications`, {
        headers: { 'x-user-id': user.id }
      })
        .then(res => res.json())
        .then(data => setNotifications(data || []))
        .catch(err => console.error('Notif fetch error:', err));

      // Админге келген хабарламалар (Contact messages)
      if (user.role === 'admin') {
        fetch(`${API_BASE}/contact/unread-count`, {
          headers: { 'x-user-id': user.id, 'x-user-role': user.role }
        })
          .then(res => res.json())
          .then(data => setContactUnreadCount(data.count || 0))
          .catch(err => console.error('Contact unread fetch error:', err));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const unreadNotifsCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <header id="main-header">
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <h1>Quiz Battle</h1>
      </div>

      <nav className="nav-links">
        <NavLink to="/" end>Басты бет</NavLink>
        <NavLink to="/courses">Курстар</NavLink>
        <NavLink to="/start-game">Ойын</NavLink>
        <NavLink to="/ranking" style={{ position: 'relative' }}>
          Рейтинг
          {challengeCount > 0 && (
            <span className="badge-count">{challengeCount}</span>
          )}
        </NavLink>
        <NavLink to="/chat" style={{ position: 'relative' }}>
          Чат {unreadCounts.total > 0 && `(${unreadCounts.total})`}
          {unreadCounts.total > 0 && (
            <span className="badge-count">{unreadCounts.total}</span>
          )}
        </NavLink>
        <NavLink to="/contact">Байланыс</NavLink>
        
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <div className="admin-group" style={{ display: 'flex', gap: '10px', marginLeft: '10px', paddingLeft: '10px', borderLeft: '1px solid var(--border-color)' }}>
            <NavLink to="/add-course">Курс+</NavLink>
            <NavLink to="/add-lesson">Сабақ+</NavLink>
            <NavLink to="/add-question">Сұрақ+</NavLink>
          </div>
        )}

        {user?.role === 'admin' && (
          <NavLink to="/admin" style={{ color: 'var(--primary-color)', position: 'relative' }}>
            Админ
            {contactUnreadCount > 0 && (
              <span style={{ 
                position: 'absolute', top: '5px', right: '-5px', 
                width: '8px', height: '8px', background: '#ff3b30', 
                borderRadius: '50%', border: '1px solid #fff' 
              }}></span>
            )}
          </NavLink>
        )}
      </nav>

      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user && (
          <NavLink to="/notifications" className="nav-icon-link" style={{ position: 'relative', fontSize: '1.2rem', padding: '5px' }}>
            🔔
            {unreadNotifsCount > 0 && (
              <span className="badge-count" style={{ top: '-5px', right: '-5px' }}>{unreadNotifsCount}</span>
            )}
          </NavLink>
        )}

        <button onClick={toggleTheme} className="theme-toggle">🌓</button>

        {user ? (
          <>
            <NavLink to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img 
                src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} 
                alt="Profile" 
                style={{ 
                  width: '38px', height: '38px', borderRadius: '50%', 
                  border: '2px solid var(--primary-color)',
                  padding: '2px',
                  objectFit: 'cover',
                  background: 'rgba(255,255,255,0.1)'
                }} 
              />
            </NavLink>
            <button onClick={handleLogout} className="btn logout-btn" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>Шығу</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-outline" style={{ padding: '8px 18px' }}>Кіру</NavLink>
            <NavLink to="/register" className="btn" style={{ padding: '8px 18px' }}>Тіркелу</NavLink>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
