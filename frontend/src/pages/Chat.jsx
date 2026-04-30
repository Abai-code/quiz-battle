import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import API_BASE from '../api';


function Chat() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadDetails, setUnreadDetails] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Қолданушылар тізімін алу
    fetch(`${API_BASE}/ranking`)
      .then(res => res.json())
      .then(data => setUsers(data.filter(u => u.id !== user.id)))
      .catch(console.error);

    // Оқылмағандарды алу (әр 5 сек)
    const fetchUnread = () => {
      fetch(`${API_BASE}/unread-messages`, {
        headers: { 'x-user-id': user.id }
      })
      .then(res => res.json())
      .then(data => setUnreadDetails(data.details || []))
      .catch(console.error);
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [user?.id, navigate]);

  // Жаңа хабарламаларды бақылау
  useEffect(() => {
    if (activeChat && user) {
      const interval = setInterval(() => {
        fetch(`${API_BASE}/messages/${activeChat}`, {
          headers: { 'x-user-id': user.id }
        })
        .then(res => res.json())
        .then(data => {
          setMessages(prev => {
            if (data.length > prev.length) {
              markAsRead(activeChat);
              return data;
            }
            return prev;
          });
        })
        .catch(console.error);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeChat, user?.id]);

  const loadChat = (otherId) => {
    setActiveChat(otherId);
    setMessages([]); // Ескі хабарламаларды тазалау
    
    fetch(`${API_BASE}/messages/${otherId}`, {
      headers: { 'x-user-id': user.id }
    })
    .then(res => res.json())
    .then(data => {
      setMessages(data);
      markAsRead(otherId);
    })
    .catch(console.error);
  };

  const markAsRead = (senderId) => {
    fetch(`${API_BASE}/messages/read/${senderId}`, {
      method: 'PATCH',
      headers: { 'x-user-id': user.id }
    })
    .then(() => {
      // Локальді түрде оқылмағандар санын жаңарту
      setUnreadDetails(prev => prev.filter(d => d.sender_id !== senderId));
    })
    .catch(console.error);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
      body: JSON.stringify({ receiver_id: activeChat, message_text: newMessage })
    })
    .then(res => res.json())
    .then(data => {
      setMessages(prev => [...prev, { ...data, sender_id: user.id }]);
      setNewMessage('');
    })
    .catch(console.error);
  };

  const getUnreadCount = (userId) => {
    const detail = unreadDetails.find(d => d.sender_id === userId);
    return detail ? detail.count : 0;
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container chat-page" style={{ paddingBottom: '20px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div className="chat-container card" style={{ 
        display: 'grid', 
        gridTemplateColumns: '280px 1fr', 
        flex: 1,
        maxWidth: '100%',
        margin: '0 auto',
        padding: 0, 
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        border: '1px solid var(--border-color)',
        minHeight: 0
      }}>
        
        {/* User List */}
        <div className="users-list" style={{ 
          borderRight: '1px solid var(--border-color)', 
          padding: '20px', 
          overflowY: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ marginBottom: '15px', flexShrink: 0 }}>Пайдаланушылар</h3>
          <input 
            type="text" 
            placeholder="Іздеу..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ marginBottom: '20px', padding: '10px 15px', fontSize: '0.9rem' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>
            {filteredUsers.length === 0 ? (
              <p style={{ opacity: 0.5, textAlign: 'center', fontSize: '0.9rem', marginTop: '10px' }}>Табылмады</p>
            ) : (
              filteredUsers.map(u => {
              const unread = getUnreadCount(u.id);
              return (
                <div 
                  key={u.id} 
                  className={`user-item ${activeChat === u.id ? 'active' : ''}`}
                  onClick={() => loadChat(u.id)}
                  style={{
                    padding: '12px 15px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: activeChat === u.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.03)',
                    color: activeChat === u.id ? '#000' : 'inherit',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: '0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={u.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} 
                      alt="av" 
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} 
                    />
                    <span style={{ fontWeight: unread > 0 ? '800' : 'normal' }}>{u.name}</span>
                  </div>
                  {unread > 0 && activeChat !== u.id && (
                    <span style={{ 
                      background: '#e74c3c', color: 'white', 
                      borderRadius: '50%', width: '20px', height: '20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 'bold'
                    }}>
                      {unread}
                    </span>
                  )}
                </div>
              );
            })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="chat-window" style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.1)', height: '100%', minHeight: 0, overflow: 'hidden' }}>
          {activeChat ? (
            <>
              <div className="chat-header" style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)', fontWeight: 'bold', flexShrink: 0 }}>
                {users.find(u => u.id === activeChat)?.name}
              </div>
              <div className="messages-area" ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '25px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
                {messages.map((m) => (
                  <div key={m.id || Math.random()} style={{
                    alignSelf: m.sender_id === user.id ? 'flex-end' : 'flex-start',
                    display: 'flex',
                    flexDirection: m.sender_id === user.id ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: '8px',
                    maxWidth: '75%'
                  }}>
                    <img 
                      src={m.sender_id === user.id 
                        ? (user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`) 
                        : (users.find(u => u.id === m.sender_id)?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${users.find(u => u.id === m.sender_id)?.name}`)} 
                      alt="av" 
                      style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0 }} 
                    />
                    <div style={{
                      background: m.sender_id === user.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)',
                      color: m.sender_id === user.id ? '#000' : 'inherit',
                      padding: '10px 18px',
                      borderRadius: '18px',
                      fontSize: '0.95rem',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      borderBottomRightRadius: m.sender_id === user.id ? '2px' : '18px',
                      borderBottomLeftRadius: m.sender_id !== user.id ? '2px' : '18px',
                    }}>
                      {m.message_text}
                    </div>
                  </div>
                ))}
              </div>
              <form className="message-form" onSubmit={sendMessage} style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', flexShrink: 0 }}>
                <input 
                  type="text" 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Хабарлама жазыңыз..."
                  className="input-field"
                  maxLength={100}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn" style={{ padding: '10px 25px' }}>Жіберу</button>
              </form>
            </>
          ) : (
            <div className="chat-placeholder" style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--text-muted)', 
              fontSize: '1.1rem',
              padding: '40px',
              textAlign: 'center',
              gap: '20px'
            }}>
              <div style={{ 
                width: '80px', height: '80px', 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2.5rem',
                border: '1px solid var(--border-color)'
              }}>
                💬
              </div>
              <div>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-color)' }}>Хабарламалар</h3>
                <p style={{ margin: 0, opacity: 0.6, fontSize: '0.95rem' }}>Чатты бастау үшін пайдаланушыны таңдаңыз</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
