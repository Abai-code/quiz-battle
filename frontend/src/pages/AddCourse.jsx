import React, { useState, useEffect } from 'react';

function AddCourse() {
  const [course, setCourse] = useState({ title: '', description: '', category: 'IT' });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const categories = ['IT', 'Спорт', 'Тарих', 'Тілдер', 'Өнер', 'Ғылым'];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    fetch('http://localhost:5000/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const url = editingId 
      ? `http://localhost:5000/api/courses/${editingId}`
      : 'http://localhost:5000/api/courses';
    
    const method = editingId ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course)
    })
    .then(async res => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Сервер қатесі');
      }
      return res.json();
    })
    .then(data => {
      alert(editingId ? 'Курс сәтті жаңартылды' : `Жаңа курс сәтті қосылды: ${data.title}`);
      setCourse({ title: '', description: '', category: 'IT' });
      setEditingId(null);
      setLoading(false);
      fetchCourses();
    })
    .catch(err => {
      console.error(err);
      alert(`Қате кетті: ${err.message}`);
      setLoading(false);
    });
  };

  const handleDelete = async (id) => {
    const confirmed = await window.confirm('Бұл курсты өшіруге сенімдісіз бе? Барлық сабақтар да жойылады.');
    if (confirmed) {
      fetch(`http://localhost:5000/api/courses/${id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error('Өшіру мүмкін болмады');
          return res.json();
        })
        .then(() => {
          alert('Курс өшірілді');
          fetchCourses();
        })
        .catch(err => alert(`Қате кетті: ${err.message}`));
    }
  };

  const handleEdit = (c) => {
    setCourse({ title: c.title, description: c.description, category: c.category || 'IT' });
    setEditingId(c.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="page-container">
      <h2 className="section-title">{editingId ? 'Курсты өзгерту' : 'Жаңа курс қосу'}</h2>
      
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto 50px auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Курс атауы</label>
            <input 
              type="text" 
              className="form-control"
              value={course.title}
              onChange={(e) => setCourse({...course, title: e.target.value})}
              placeholder="Мысалы: React негіздері" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Санаты</label>
            <select 
              className="form-control"
              value={course.category}
              onChange={(e) => setCourse({...course, category: e.target.value})}
              required
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Сипаттамасы</label>
            <textarea 
              rows="4" 
              className="form-control"
              value={course.description}
              onChange={(e) => setCourse({...course, description: e.target.value})}
              placeholder="Курс туралы қысқаша мәлімет..."
              style={{ minHeight: '120px' }}
              required
            ></textarea>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn" style={{ flex: 1, marginTop: '10px' }} disabled={loading}>
              {loading ? 'Сақталуда...' : (editingId ? 'Өзгертуді сақтау' : 'Курсты сақтау')}
            </button>
            {editingId && (
              <button 
                type="button" 
                className="btn" 
                style={{ marginTop: '10px', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                onClick={() => { setEditingId(null); setCourse({ title: '', description: '', category: 'IT' }); }}
              >
                Бас тарту
              </button>
            )}
          </div>
        </form>
      </div>

      <h3 className="section-title" style={{ fontSize: '1.5rem' }}>Бар курстарды басқару</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {courses.map(c => (
          <div key={c.id} className="card" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.7rem', background: 'var(--primary-color)', color: '#000', padding: '2px 10px', borderRadius: '10px', fontWeight: 'bold' }}>{c.category}</span>
            <h4 style={{ color: 'var(--primary-color)', margin: '10px 0' }}>{c.title}</h4>
            <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '20px', minHeight: '40px' }}>{c.description}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn" style={{ flex: 1, padding: '5px', fontSize: '0.8rem' }} onClick={() => handleEdit(c)}>Өзгерту</button>
              <button className="btn" style={{ flex: 1, padding: '5px', fontSize: '0.8rem', background: '#e74c3c' }} onClick={() => handleDelete(c.id)}>Өшіру</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default AddCourse;
