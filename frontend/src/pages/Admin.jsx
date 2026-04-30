import React, { useState, useEffect } from 'react';
import API_BASE from '../api';

import { useNavigate } from 'react-router-dom';

function Admin() {
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [view, setView] = useState('stats'); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [editItem, setEditItem] = useState(null);
  
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchHeaders = {
    'Content-Type': 'application/json',
    'x-user-role': currentUser.role,
    'x-user-id': currentUser.id,
    'x-user-name': currentUser.name
  };

  useEffect(() => {
    if (currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();

    // Егер хабарламаларды көріп жатса, бәрін оқылды деп белгілеу
    if (view === 'messages') {
      fetch(`${API_BASE}/contact/read-all`, {
        method: 'PATCH',
        headers: fetchHeaders
      }).catch(err => console.error('Mark read error:', err));
    }
  }, [view]);

  const fetchData = () => {
    setLoading(true);
    const endpoints = {
      users: `${API_BASE}/users`,
      questions: `${API_BASE}/questions`,
      messages: `${API_BASE}/contact`,
      courses: `${API_BASE}/courses`,
      stats: `${API_BASE}/admin/stats`,
      logs: `${API_BASE}/admin/logs`
    };


    fetch(endpoints[view], { headers: fetchHeaders })
      .then(res => res.json())
      .then(data => {
        if (view === 'users') setUsers(data);
        else if (view === 'questions') setQuestions(data);
        else if (view === 'messages') setMessages(data);
        else if (view === 'courses') setCourses(data);
        else if (view === 'stats') setStats(data);
        else if (view === 'logs') setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const deleteItem = async (id, type) => {
    const confirmed = await window.confirm('Бұл мәліметті өшіргіңіз келеді ме?');
    if (confirmed) {
      fetch(`${API_BASE}/${type}/${id}`, { 
        method: 'DELETE',
        headers: fetchHeaders
      })
      .then(() => fetchData());
    }
  };

  const handleEdit = (item) => {
    setEditItem({ ...item });
    setShowEditModal(true);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    const type = view;
    const id = editItem.id;
    
    fetch(`${API_BASE}/${type}/${id}`, {
      method: 'PUT',
      headers: fetchHeaders,
      body: JSON.stringify(editItem)
    })
    .then(() => {
      setShowEditModal(false);
      fetchData();
    });
  };

  const changeRole = (userId, newRole) => {
    fetch(`${API_BASE}/users/${userId}/role`, {
      method: 'PATCH',
      headers: fetchHeaders,
      body: JSON.stringify({ role: newRole })
    })
    .then(() => fetchData());
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: fetchHeaders,
      body: JSON.stringify(newUser)
    })
    .then(() => {
      setShowAddUserModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'student' });
      fetchData();
    });
  };

  const filteredData = () => {
    const term = searchTerm.toLowerCase();
    if (view === 'users') return users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    if (view === 'questions') return questions.filter(q => q.question_text.toLowerCase().includes(term));
    if (view === 'courses') return courses.filter(c => c.title.toLowerCase().includes(term));
    if (view === 'messages') return messages.filter(m => m.name.toLowerCase().includes(term) || m.message.toLowerCase().includes(term));
    if (view === 'logs') return logs.filter(l => l.user_name?.toLowerCase().includes(term) || l.action.toLowerCase().includes(term));
    return [];
  };

  return (
    <main className="page-container" style={{ maxWidth: '1400px' }}>
      <div className="admin-header" style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', gap: '20px', flexWrap: 'wrap', background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' 
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(45deg, var(--primary-color), #8e44ad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Басқару Панелі</h2>
          <p style={{ opacity: 0.6, marginTop: '5px' }}>Қош келдіңіз, {currentUser.name}! Жүйе әрекеттері мен статистикасын бақылаңыз.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn" onClick={() => navigate('/add-question')} style={{ width: 'auto', background: 'rgba(255,255,255,0.1)' }}>+ Сұрақ қосу</button>
          <button className="btn" onClick={() => setShowAddUserModal(true)}>+ Пайдаланушы қосу</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }}>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { id: 'stats', label: '📊 Статистика' },
            { id: 'users', label: '👥 Пайдаланушылар' },
            { id: 'questions', label: '❓ Сұрақтар' },
            { id: 'courses', label: '📚 Курстар' },
            { id: 'messages', label: '📩 Хабарламалар' },
            { id: 'logs', label: '📜 Жүйелік логтар' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => { setView(item.id); setSearchTerm(''); }}
              style={{
                textAlign: 'left', padding: '15px 20px', borderRadius: '12px', border: 'none', background: view === item.id ? 'var(--primary-color)' : 'transparent', color: view === item.id ? 'white' : 'inherit', cursor: 'pointer', transition: '0.3s', fontSize: '1rem', fontWeight: view === item.id ? 'bold' : 'normal'
              }}
            >
              {item.label}
            </button>
          ))}
        </aside>

        <div className="card" style={{ padding: '30px', borderRadius: '20px', minHeight: '600px' }}>
          {view !== 'stats' && (
            <div style={{ marginBottom: '30px' }}>
              <input type="text" placeholder="Іздеу..." className="input-field" style={{ margin: 0, borderRadius: '12px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px' }}><div className="loader">Жүктелуде...</div></div>
          ) : view === 'stats' ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div className="card" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
                  <h4 style={{ opacity: 0.6 }}>Пайдаланушылар</h4>
                  <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats?.summary?.users || 0}</p>
                </div>
                <div className="card" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
                  <h4 style={{ opacity: 0.6 }}>Сұрақтар саны</h4>
                  <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats?.summary?.questions || 0}</p>
                </div>
                <div className="card" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
                  <h4 style={{ opacity: 0.6 }}>Аяқталған ойындар</h4>
                  <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats?.summary?.games || 0}</p>
                </div>
              </div>
              
              <h3>Соңғы жекпе-жектер (Challenges)</h3>
              <table className="leaderboard" style={{ width: '100%', marginTop: '20px' }}>
                <thead>
                  <tr>
                    <th>Уақыты</th>
                    <th>Ойыншы 1</th>
                    <th>Ойыншы 2</th>
                    <th>Нәтиже</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentChallenges?.map(c => (
                    <tr key={c.id}>
                      <td>{new Date(c.created_at).toLocaleString()}</td>
                      <td>{c.challenger_name} ({c.challenger_score})</td>
                      <td>{c.opponent_name} ({c.opponent_score})</td>
                      <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        {c.challenger_score > c.opponent_score ? c.challenger_name : (c.challenger_score < c.opponent_score ? c.opponent_name : 'Тең')}
                      </td>
                      <td><span className="badge" style={{ background: c.status === 'completed' ? '#27ae60' : '#f39c12' }}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : view === 'logs' ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="leaderboard" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Уақыты</th>
                    <th>Орындаушы</th>
                    <th>Әрекет</th>
                    <th>Мәліметтер</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData().map(log => (
                    <tr key={log.id}>
                      <td style={{ fontSize: '0.8rem', opacity: 0.6 }}>{new Date(log.created_at).toLocaleString()}</td>
                      <td><strong>{log.user_name || 'Жүйе'}</strong></td>
                      <td><span className="badge" style={{ background: log.action.includes('DELETED') ? '#e74c3c' : '#3498db' }}>{log.action}</span></td>
                      <td style={{ fontSize: '0.9rem' }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="leaderboard" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr style={{ background: 'transparent' }}>
                    <th style={{ padding: '15px' }}>ID</th>
                    {view === 'users' && <><th>Аты</th><th>Email</th><th>Рөл</th></>}
                    {view === 'questions' && <><th>Сұрақ</th><th>Жауап</th><th>Санат</th></>}
                    {view === 'courses' && <><th>Тақырыбы</th><th>Сипаттамасы</th></>}
                    {view === 'messages' && <><th>Аты</th><th>Хабарлама</th><th>Күні</th></>}
                    <th style={{ textAlign: 'right', paddingRight: '15px' }}>Әрекеттер</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData().map(item => (
                    <tr key={item.id} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                      <td style={{ padding: '15px', borderRadius: '10px 0 0 10px' }}>{item.id}</td>
                      {view === 'users' && (
                        <>
                          <td>{item.name}</td>
                          <td style={{ opacity: 0.6 }}>{item.email}</td>
                          <td>
                            <select value={item.role} onChange={(e) => changeRole(item.id, e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '6px' }}>
                              <option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option>
                            </select>
                          </td>
                        </>
                      )}
                      {view === 'questions' && (
                        <>
                          <td style={{ maxWidth: '300px' }}>{item.question_text}</td>
                          <td><span className="badge" style={{ background: '#27ae60' }}>{item.correct_option || item.correct_answer}</span></td>
                          <td>{item.category}</td>
                        </>
                      )}
                      {view === 'courses' && (
                        <>
                          <td><strong>{item.title}</strong></td>
                          <td style={{ opacity: 0.6, maxWidth: '300px' }}>{item.description}</td>
                        </>
                      )}
                      {view === 'messages' && (
                        <>
                          <td>{item.name}</td>
                          <td style={{ maxWidth: '300px' }}>{item.message}</td>
                          <td style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(item.created_at).toLocaleDateString()}</td>
                        </>
                      )}
                      <td style={{ textAlign: 'right', paddingRight: '15px', borderRadius: '0 10px 10px 0' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {(view === 'questions' || view === 'courses') && (
                            <button className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', width: 'auto', background: 'rgba(255,255,255,0.1)' }} onClick={() => handleEdit(item)}>Өңдеу</button>
                          )}
                          <button className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#e74c3c', width: 'auto' }} onClick={() => deleteItem(item.id, view)}>Өшіру</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals for Add/Edit */}
      {(showAddUserModal || showEditModal) && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' }}>
          <div className="card" style={{ width: '600px', padding: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              {showEditModal ? 'Мәліметтерді өңдеу' : 'Жаңа пайдаланушы'}
            </h3>
            <form onSubmit={showEditModal ? saveEdit : handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {showEditModal ? (
                <>
                  {view === 'questions' && (
                    <div style={{ display: 'grid', gap: '15px' }}>
                      <div className="form-group">
                        <label>Сұрақ мәтіні</label>
                        <textarea className="form-control" value={editItem.question_text} onChange={e => setEditItem({...editItem, question_text: e.target.value})} rows="2" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                          <label>A нұсқасы</label>
                          <input className="form-control" value={editItem.option_a} onChange={e => setEditItem({...editItem, option_a: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>B нұсқасы</label>
                          <input className="form-control" value={editItem.option_b} onChange={e => setEditItem({...editItem, option_b: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>C нұсқасы</label>
                          <input className="form-control" value={editItem.option_c} onChange={e => setEditItem({...editItem, option_c: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>D нұсқасы</label>
                          <input className="form-control" value={editItem.option_d} onChange={e => setEditItem({...editItem, option_d: e.target.value})} />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className="form-group">
                          <label>Дұрыс нұсқа (A/B/C/D)</label>
                          <select className="form-control" value={editItem.correct_option} onChange={e => setEditItem({...editItem, correct_option: e.target.value})}>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Санат (Category)</label>
                          <input className="form-control" value={editItem.category} onChange={e => setEditItem({...editItem, category: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  )}
                  {view === 'courses' && (
                    <>
                      <div className="form-group">
                        <label>Курс атауы</label>
                        <input className="form-control" value={editItem.title} onChange={e => setEditItem({...editItem, title: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Сипаттамасы</label>
                        <textarea className="form-control" value={editItem.description} onChange={e => setEditItem({...editItem, description: e.target.value})} rows="4" />
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Аты-жөні</label>
                    <input type="text" placeholder="Аты" required className="form-control" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="Email" required className="form-control" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Құпия сөз</label>
                    <input type="password" placeholder="Пароль" required className="form-control" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Рөлі</label>
                    <select className="form-control" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>Сақтау</button>
                <button type="button" className="btn" style={{ flex: 1, background: 'rgba(255,255,255,0.1)' }} onClick={() => { setShowAddUserModal(false); setShowEditModal(false); }}>Бас тарту</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Admin;
