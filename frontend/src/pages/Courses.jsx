import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../api';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Барлығы');
  const [activeVideo, setActiveVideo] = useState(null);
  const [progress, setProgress] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const categories = ['Барлығы', 'IT', 'Спорт', 'Тарих', 'Тілдер', 'Өнер', 'Ғылым'];

  useEffect(() => {
    fetchCourses();
    if (user.id) fetchProgress();
  }, []);

  useEffect(() => {
    let result = courses;
    if (activeCategory !== 'Барлығы') {
      result = result.filter(c => c.category === activeCategory);
    }
    if (search) {
      result = result.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredCourses(result);
  }, [search, activeCategory, courses]);

  useEffect(() => {
    if (activeVideo) {
      fetchComments(activeVideo.id);
    }
  }, [activeVideo]);

  const fetchCourses = () => {
    fetch(`${API_BASE}/courses`)
      .then(res => res.json())
      .then(data => {
        const coursesData = Array.isArray(data) ? data : [];
        setCourses(coursesData);
        setFilteredCourses(coursesData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch courses error:', err);
        setCourses([]);
        setFilteredCourses([]);
        setLoading(false);
      });
  };

  const fetchProgress = () => {
    fetch(`${API_BASE}/user-progress/${user.id}`)

      .then(res => res.json())
      .then(data => setProgress(data))
      .catch(err => console.error(err));
  };

  const fetchComments = (lessonId) => {
    fetch(`${API_BASE}/lessons/${lessonId}/comments`)

      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error(err));
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setLessons([]);
    setActiveVideo(null);
    fetch(`${API_BASE}/lessons/${course.id}`)

      .then(res => res.json())
      .then(data => setLessons(data))
      .catch(err => console.error(err));
  };

  const toggleProgress = (lessonId) => {
    if (!user.id) return alert('Прогресті сақтау үшін жүйеге кіріңіз');
    fetch(`${API_BASE}/toggle-progress`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, lessonId })
    })
    .then(res => res.json())
    .then(data => {
      if (data.completed) setProgress([...progress, lessonId]);
      else setProgress(progress.filter(id => id !== lessonId));
    });
  };

  const postComment = (e) => {
    e.preventDefault();
    if (!user.id) return alert('Пікір қалдыру үшін жүйеге кіріңіз');
    if (!newComment.trim()) return;

    fetch(`${API_BASE}/comments`, {

      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, lessonId: activeVideo.id, text: newComment })
    })
    .then(res => res.json())
    .then(() => {
      setNewComment('');
      fetchComments(activeVideo.id);
    });
  };

  const getYouTubeEmbedUrl = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (loading) return <div className="page-container" style={{ textAlign: 'center' }}>Жүктелуде...</div>;

  return (
    <main className="page-container">
      <h2 className="section-title">Оқу платформасы</h2>
      
      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center' }}>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Курсты іздеу..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`btn ${activeCategory === cat ? '' : 'btn-outline'}`}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedCourse ? '380px 1fr' : '1fr', gap: '40px' }}>
        
        {/* Курстар тізімі (Sol jaq) */}
        <div className="grid" style={{ alignContent: 'start' }}>
          {filteredCourses.length === 0 ? <p className="text-center py-20">Ештеңе табылмады.</p> : filteredCourses.map(course => (
            <div 
              key={course.id} 
              className="card" 
              style={{ 
                cursor: 'pointer', 
                padding: '16px',
                border: selectedCourse?.id === course.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                transform: selectedCourse?.id === course.id ? 'translateY(-2px)' : 'none',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleCourseClick(course)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <h4 style={{ margin: '0', fontSize: '1.1rem' }}>{course.title}</h4>
                    {selectedCourse?.id === course.id && <span style={{ color: 'var(--primary-color)', fontSize: '0.8rem' }}>●</span>}
                  </div>
                  <p style={{ margin: '0', fontSize: '0.85rem', opacity: 0.6, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                </div>
                <button className="btn" style={{ padding: '6px 16px', fontSize: '0.8rem', whiteSpace: 'nowrap', background: selectedCourse?.id === course.id ? 'var(--primary-color)' : 'transparent', color: selectedCourse?.id === course.id ? '#000' : 'var(--text-color)', border: '1px solid var(--primary-color)' }}>
                  {selectedCourse?.id === course.id ? 'Ашық' : 'Ашу'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Сабақтар мен Ойнатқыш (On jaq) */}
        {selectedCourse && (
          <div className="card" style={{ position: 'relative' }}>
            <button className="btn btn-outline" style={{ position: 'absolute', top: '24px', right: '24px', padding: '6px 16px', fontSize: '0.8rem' }} onClick={() => setSelectedCourse(null)}>Жабу ✕</button>
            <h3 style={{ marginBottom: '32px', fontSize: '1.75rem', maxWidth: '80%' }}>{selectedCourse.title}</h3>
            
            <div className="grid">
              {activeVideo ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                  <div>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '20px', background: '#000', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                      <iframe 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                        src={getYouTubeEmbedUrl(activeVideo.video_url)}
                        title={activeVideo.title}
                        allowFullScreen
                      ></iframe>
                    </div>
                    <h4 style={{ marginTop: '24px', fontSize: '1.5rem' }}>{activeVideo.title}</h4>
                    <p style={{ marginTop: '12px', opacity: 0.7, lineHeight: '1.6', fontSize: '0.95rem' }}>
                      {selectedCourse.description}
                    </p>

                    {/* Comments */}
                    <div style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                      <h5 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Пікірлер ({comments.length})</h5>
                      <form onSubmit={postComment} style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" className="form-control" style={{ padding: '8px 12px', fontSize: '0.9rem', minHeight: 'auto' }} placeholder="Пікір қалдырыңыз..." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                        <button type="submit" className="btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Жіберу</button>
                      </form>
                      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {comments.length === 0 ? <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>Әзірге пікірлер жоқ.</p> : comments.map(c => (
                          <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <strong style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}>{c.user_name}</strong>
                              <small style={{ opacity: 0.5, fontSize: '0.75rem' }}>{new Date(c.created_at).toLocaleDateString()}</small>
                            </div>
                            <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.9 }}>{c.comment_text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Lesson Cards */}
                  <div className="grid" style={{ alignContent: 'start', gap: '12px' }}>
                    <h5 style={{ opacity: 0.6, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Сабақтар</h5>
                    {lessons.map((l, index) => (
                      <div 
                        key={l.id} 
                        style={{ 
                          padding: '16px', 
                          background: activeVideo?.id === l.id ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)', 
                          borderRadius: '16px', 
                          display: 'flex', 
                          gap: '14px',
                          alignItems: 'center',
                          border: activeVideo?.id === l.id ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                          cursor: 'pointer'
                        }}
                        onClick={() => setActiveVideo(l)}
                      >
                        <div style={{ 
                          width: '24px', height: '24px', borderRadius: '6px', border: '1px solid var(--primary-color)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: progress.includes(l.id) ? 'var(--primary-color)' : 'transparent', color: '#000', fontSize: '0.8rem'
                        }} onClick={(e) => { e.stopPropagation(); toggleProgress(l.id); }}>
                          {progress.includes(l.id) ? '✓' : ''}
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: activeVideo?.id === l.id ? '700' : '500' }}>{index + 1}. {l.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2">
                  {lessons.map((l, index) => (
                    <div key={l.id} className="card" style={{ padding: '24px', cursor: 'pointer' }} onClick={() => setActiveVideo(l)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ color: 'var(--primary-color)', margin: 0 }}>{index + 1}. {l.title}</h4>
                        <div style={{ 
                          width: '28px', height: '28px', borderRadius: '8px', border: '1px solid var(--primary-color)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: progress.includes(l.id) ? 'var(--primary-color)' : 'transparent', color: '#000',
                          transition: '0.3s'
                        }} onClick={(e) => { e.stopPropagation(); toggleProgress(l.id); }}>
                          {progress.includes(l.id) ? '✓' : ''}
                        </div>
                      </div>
                      <button className="btn btn-outline" style={{ width: '100%', pointerEvents: 'none' }}>Сабақты бастау</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Courses;
