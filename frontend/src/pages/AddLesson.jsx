import React, { useState, useEffect } from 'react';

function AddLesson() {
  const [lesson, setLesson] = useState({ title: '', videoUrl: '', courseId: '' });
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (lesson.courseId) {
      fetchLessons(lesson.courseId);
    } else {
      setLessons([]);
    }
  }, [lesson.courseId]);

  const fetchCourses = () => {
    fetch('http://localhost:5000/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error(err));
  };

  const fetchLessons = (courseId) => {
    fetch(`http://localhost:5000/api/courses/${courseId}/lessons`)
      .then(res => res.json())
      .then(data => setLessons(data))
      .catch(err => console.error(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const url = editingId 
      ? `http://localhost:5000/api/lessons/${editingId}`
      : 'http://localhost:5000/api/lessons';
    
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: lesson.title,
        video_url: lesson.videoUrl,
        course_id: parseInt(lesson.courseId)
      })
    })
    .then(res => res.json())
    .then(data => {
      alert(editingId ? 'Сабақ жаңартылды' : `Сабақ сәтті қосылды: ${data.title}`);
      setLesson({ ...lesson, title: '', videoUrl: '' });
      setEditingId(null);
      setLoading(false);
      fetchLessons(lesson.courseId);
    })
    .catch(err => {
      console.error(err);
      alert('Сабақты сақтау кезінде қате кетті');
      setLoading(false);
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Бұл сабақты өшіруға сенімдісіз бе?')) {
      fetch(`http://localhost:5000/api/lessons/${id}`, { method: 'DELETE' })
        .then(async res => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Өшіру мүмкін болмады');
          }
          return res.json();
        })
        .then(() => {
          alert('Сабақ өшірілді');
          fetchLessons(lesson.courseId);
        })
        .catch(err => {
          console.error('Өшіру қатесі:', err);
          alert(`Қате кетті: ${err.message}`);
        });
    }
  };

  const handleEdit = (l) => {
    setLesson({ title: l.title, videoUrl: l.video_url, courseId: l.course_id.toString() });
    setEditingId(l.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="page-container">
      <h2 className="section-title">{editingId ? 'Сабақты өзгерту' : 'Сабақ қосу'}</h2>
      
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto 50px auto' }}>
        {courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ marginBottom: '20px' }}>⚠️ Әзірге ешқандай курс жоқ. Алдымен курс қосыңыз.</p>
            <button className="btn" onClick={() => window.location.href='/add-course'}>Курс қосуға өту</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Курсты таңдаңыз</label>
              <select 
                className="form-control"
                value={lesson.courseId}
                onChange={(e) => setLesson({...lesson, courseId: e.target.value})}
                required
                disabled={editingId !== null}
              >
                <option value="">Курсты таңдаңыз...</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Сабақ атауы</label>
              <input 
                type="text" 
                className="form-control"
                value={lesson.title}
                onChange={(e) => setLesson({...lesson, title: e.target.value})}
                placeholder="Мысалы: Компоненттер және Props" 
                required 
              />
            </div>
            <div className="form-group">
              <label>Видео сілтемесі (URL)</label>
              <input 
                type="url" 
                className="form-control"
                value={lesson.videoUrl}
                onChange={(e) => setLesson({...lesson, videoUrl: e.target.value})}
                placeholder="https://youtube.com/..." 
                required 
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn" style={{ flex: 1, marginTop: '10px' }} disabled={loading}>
                {loading ? 'Сақталуда...' : (editingId ? 'Өзгертуді сақтау' : 'Сабақты қосу')}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  className="btn" 
                  style={{ marginTop: '10px', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                  onClick={() => { setEditingId(null); setLesson({ ...lesson, title: '', videoUrl: '' }); }}
                >
                  Бас тарту
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {lesson.courseId && (
        <>
          <h3 className="section-title" style={{ fontSize: '1.5rem' }}>Таңдалған курстың сабақтары</h3>
          <div style={{ display: 'grid', gap: '15px', maxWidth: '800px', margin: '0 auto' }}>
            {lessons.length === 0 ? (
              <p style={{ textAlign: 'center', opacity: 0.6 }}>Бұл курста әлі сабақтар жоқ.</p>
            ) : (
              lessons.map((l, index) => (
                <div key={l.id} className="card" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{index + 1}.</span>
                    <span>{l.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn" style={{ padding: '5px 15px', fontSize: '0.8rem' }} onClick={() => handleEdit(l)}>Өзгерту</button>
                    <button className="btn" style={{ padding: '5px 15px', fontSize: '0.8rem', background: '#e74c3c' }} onClick={() => handleDelete(l.id)}>Өшіру</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </main>
  );
}

export default AddLesson;
