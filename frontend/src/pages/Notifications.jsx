import React, { useState, useEffect } from 'react';
import API_BASE from '../api';

import { useNavigate } from 'react-router-dom';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchNotifications();
  }, [user]);

  const fetchNotifications = () => {
    fetch(`${API_BASE}/notifications`, {

      headers: { 'x-user-id': user.id }
    })
    .then(res => res.json())
    .then(data => setNotifications(data))
    .catch(err => console.error(err));
  };

  const markAsRead = (id) => {
    fetch(`${API_BASE}/notifications/${id}/read`, {

      method: 'PATCH',
      headers: { 'x-user-id': user.id }
    })
    .then(() => fetchNotifications())
    .catch(err => console.error(err));
  };

  return (
    <main className="page-container">
      <h2 className="section-title">Хабарламалар</h2>
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {notifications.length === 0 ? (
          <p style={{ textAlign: 'center', opacity: 0.7 }}>Жаңа хабарламалар жоқ.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {notifications.map(n => (
              <div key={n.id} style={{ 
                padding: '20px', 
                borderRadius: '12px', 
                background: n.is_read ? 'rgba(255,255,255,0.03)' : 'rgba(243, 156, 18, 0.1)',
                borderLeft: n.is_read ? 'none' : '4px solid var(--primary-color)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ marginBottom: '5px' }}>{n.title}</h4>
                  <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>{n.message}</p>
                  <p style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '10px' }}>{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.is_read && (
                  <button className="btn" style={{ padding: '8px 15px', fontSize: '0.8rem' }} onClick={() => markAsRead(n.id)}>Оқылды</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Notifications;
