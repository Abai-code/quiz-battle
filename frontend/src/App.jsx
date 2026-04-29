import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import { ToastProvider } from './components/ToastProvider';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import Blog from './pages/Blog';
import QuizGame from './pages/QuizGame';
import Login from './pages/Login';
import Register from './pages/Register';
import AddCourse from './pages/AddCourse';
import AddLesson from './pages/AddLesson';
import AddQuestion from './pages/AddQuestion';
import StartGame from './pages/StartGame';
import Courses from './pages/Courses';
import Admin from './pages/Admin';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!user) {
    return <Login />; // Redirect to login if not authenticated
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h1 style={{ fontSize: '4rem', color: 'var(--primary-color)' }}>403</h1>
        <h2>Рұқсат шектелген (Access Denied)</h2>
        <p>Бұл бетке кіру үшін сізде жеткілікті рұқсат жоқ.</p>
        <button className="btn" style={{ marginTop: '20px', width: 'auto', padding: '10px 30px' }} onClick={() => window.location.href = '/'}>Басты бетке оралу</button>
      </div>
    );
  }

  return children;
};

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <div className="app-container">
        <Header toggleTheme={toggleTheme} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/index.html" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/quiz" element={<QuizGame />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Админ және Мұғалім үшін қорғалған беттер */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            } />
            
            <Route path="/courses" element={<Courses />} />
            
            <Route path="/add-course" element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'moderator']}>
                <AddCourse />
              </ProtectedRoute>
            } />
            <Route path="/add-lesson" element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'moderator']}>
                <AddLesson />
              </ProtectedRoute>
            } />
            <Route path="/add-question" element={
              <ProtectedRoute allowedRoles={['admin', 'teacher', 'moderator']}>
                <AddQuestion />
              </ProtectedRoute>
            } />
            
            <Route path="/start-game" element={<StartGame />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/chat" element={<Chat />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer style={{ 
          textAlign: 'center', 
          padding: '30px', 
          marginTop: '50px', 
          borderTop: '1px solid var(--border-color)',
          opacity: 0.7,
          fontSize: '0.9rem'
        }}>
          <p style={{ marginBottom: '15px', fontWeight: 'bold' }}>© 2026 Quiz Battle. Авторы: Абай</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', flexWrap: 'wrap' }}>
            <a href="https://instagram.com/_omirkhanovich_" target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📸</span> @_omirkhanovich_
            </a>
            <a href="mailto:abaiseitkasym09@gmail.com" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📧</span> abaiseitkasym09@gmail.com
            </a>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
