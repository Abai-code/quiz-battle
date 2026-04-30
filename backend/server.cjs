const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || '1234'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'Web_db'}`,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // Fallback for older frontend code during transition
    req.user = { 
       id: req.headers['x-user-id'], 
       role: req.headers['x-user-role'],
       name: req.headers['x-user-name'] 
    };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid Token' });
    req.user = user;
    next();
  });
};

const checkRole = (roles) => (req, res, next) => {
  authenticateToken(req, res, () => {
    const role = req.user?.role || req.headers['x-user-role'];
    if (roles.includes(role)) next();
    else res.status(403).json({ error: 'Access Denied' });
  });
};

// Activity Logging
async function logAction(userId, userName, action, details = '') {
  try {
    await pool.query(
      'INSERT INTO activity_logs (user_id, user_name, action, details) VALUES ($1, $2, $3, $4)',
      [userId || null, userName || 'System', action, details]
    );
  } catch (err) { console.error('Log Error:', err.message); }
}

async function initDB() {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        points INTEGER DEFAULT 0,
        avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
      );
      -- Егер кесте бұрыннан бар болса, бағанды қосу
      ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id SERIAL PRIMARY KEY,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option TEXT NOT NULL,
        category TEXT DEFAULT 'Жалпы'
      );
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        user_name TEXT,
        action TEXT NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS battles (
        id SERIAL PRIMARY KEY,
        challenger_id INTEGER REFERENCES users(id),
        opponent_id INTEGER REFERENCES users(id),
        challenger_score INTEGER DEFAULT 0,
        opponent_score INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INTEGER REFERENCES users(id),
        receiver_id INTEGER REFERENCES users(id),
        message_text TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'Жалпы',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        video_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
    `);
    client.release();
  } catch (err) { console.error('DB Init Error:', err); }
}

async function seedQuestions() {
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM quiz_questions');
    if (parseInt(countResult.rows[0].count) < 10) { 
      console.log('Seeding initial questions...');
      const questions = [
        ['JavaScript-те айнымалыны жариялаудың қай тәсілі дұрыс?', 'var', 'let', 'const', 'Барлығы дұрыс', 'D', 'IT'],
        ['Әлемдегі ең жылдам адам кім?', 'Месси', 'Усейн Болт', 'Фелпс', 'Роналду', 'B', 'Спорт'],
        ['Қазақ хандығы қай жылы құрылды?', '1465 ж.', '1500 ж.', '1220 ж.', '1700 ж.', 'A', 'Тарих'],
        ['Python тілінде тізім (list) қалай белгіленеді?', '{}', '()', '[]', '<>', 'C', 'IT'],
        ['Футболдан 2022 жылғы әлем чемпионы?', 'Франция', 'Бразилия', 'Аргентина', 'Германия', 'C', 'Спорт'],
        ['Абылай ханның шын есімі?', 'Әбілмансұр', 'Мұхаммед', 'Қасым', 'Тәуке', 'A', 'Тарих'],
        ['HTML деген не?', 'Бағдарламалау тілі', 'Мәтінді белгілеу тілі', 'Деректер қоры', 'Жүйе', 'B', 'IT'],
        ['Абай Құнанбаевтың неше қара сөзі бар?', '40', '45', '50', '35', 'B', 'Өнер'],
        ['Қазақстан Тәуелсіздігін қай жылы алды?', '1986 ж.', '1991 ж.', '1995 ж.', '1990 ж.', 'B', 'Тарих'],
        ['React кітапханасын кім жасады?', 'Google', 'Microsoft', 'Facebook', 'Apple', 'C', 'IT'],
        ['Күн жүйесіндегі ең үлкен планета?', 'Жер', 'Марс', 'Юпитер', 'Сатурн', 'C', 'Ғылым']
      ];
      for (const q of questions) {
        await pool.query(
          'INSERT INTO quiz_questions (question_text, option_a, option_b, option_c, option_d, correct_option, category) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          q
        );
      }
      console.log('Seeding complete!');
    }
  } catch (err) { console.error('Seed Error:', err); }
}

async function startServer() {
  await initDB();
  await seedQuestions();
}
startServer();

// --- API ---

app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  const letterRegex = /[a-zA-Zа-яА-ЯәғқңөұүіӘҒҚҢӨҰҮІ]/;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Барлық өрістерді толтырыңыз' });
  }

  if (name.length < 3) {
    return res.status(400).json({ error: 'Аты-жөніңіз кемінде 3 таңбадан тұруы керек' });
  }
  
  if (!letterRegex.test(name)) {
    return res.status(400).json({ error: 'Аты-жөнінде кемінде бір әріп болуы керек' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Құпия сөз кемінде 6 таңбадан тұруы керек' });
  }

  const englishLetterRegex = /[a-zA-Z]/;
  const onlyEnglishRegex = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/~\-|\\ ]+$/;

  if (!englishLetterRegex.test(password) || !onlyEnglishRegex.test(password)) {
    return res.status(400).json({ error: 'Құпия сөзде тек ағылшын әріптері мен сандар рұқсат етілген (кемінде бір әріп)' });
  }

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Бұл Email бұрыннан тіркелген' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *', 
      [name, email, hashedPassword, role || 'student']
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ user, token });
  } catch (err) { 
    console.error('Register error:', err);
    res.status(500).json({ error: 'Тіркелу кезінде қате кетті' }); 
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      let match = false;
      if (user.password.startsWith('$2b$')) {
        match = await bcrypt.compare(password, user.password);
      } else {
        match = (password === user.password); // Fallback for plain text existing users
      }

      if (match) {
        await logAction(user.id, user.name, 'USER_LOGIN', email);
        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ user, token });
      } else {
        res.status(401).json({ error: 'Қате құпия сөз' });
      }
    } else res.status(401).json({ error: 'Пайдаланушы табылмады' });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.get('/api/ranking', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const result = await pool.query(
      'SELECT id, name, points, avatar_url, role FROM users ORDER BY points DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.get('/api/questions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quiz_questions');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// --- NEW 1V1 BATTLE SYSTEM ---

// 0. Кездейсоқ қарсылас табу
app.get('/api/battles/random-opponent/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  console.log(`--- Matchmaking attempt by User ID: ${userId} ---`);
  
  try {
    // Барлық пайдаланушыларды тексеру (debug үшін)
    const allUsers = await pool.query('SELECT id, name FROM users');
    console.log('Users in DB:', allUsers.rows);

    const result = await pool.query(
      'SELECT id, name FROM users WHERE id != $1 ORDER BY RANDOM() LIMIT 1',
      [userId]
    );
    
    if (result.rows.length > 0) {
      console.log('Found opponent:', result.rows[0]);
      res.json(result.rows[0]);
    } else {
      console.log('No opponents found for ID:', userId);
      res.status(404).json({ error: 'Басқа пайдаланушылар табылмады' });
    }
  } catch (err) { 
    console.error('Matchmaking DB Error:', err.message);
    res.status(500).json({ error: 'Қате' }); 
  }
});

// 1. Шақыру жіберу
app.post('/api/battles', async (req, res) => {
  const { challengerId, opponentId } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO battles (challenger_id, opponent_id) VALUES ($1, $2) RETURNING *',
      [challengerId, opponentId]
    );
    
    // Автоматты түрде хабарлама жіберу
    const challenger = await pool.query('SELECT name FROM users WHERE id = $1', [challengerId]);
    await pool.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [opponentId, 'Жаңа шақыру!', `${challenger.rows[0].name} сізді жекпе-жекке шақырды.`]
    );
    
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Батл бастау қатесі' }); }
});

// 2. Шақыруларды алу
app.get('/api/battles/:userId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, u.name as challenger_name 
      FROM battles b 
      JOIN users u ON b.challenger_id = u.id 
      WHERE b.opponent_id = $1 AND b.status = 'pending'
    `, [req.params.userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// Аяқталған жекпе-жектерді алу (шақырушы немесе қарсылас ретінде)
app.get('/api/battles/completed/:userId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, 
        u1.name as challenger_name, 
        u2.name as opponent_name
      FROM battles b
      JOIN users u1 ON b.challenger_id = u1.id
      JOIN users u2 ON b.opponent_id = u2.id
      WHERE (b.challenger_id = $1 OR b.opponent_id = $1) 
        AND b.status = 'completed'
      ORDER BY b.created_at DESC
      LIMIT 50
    `, [req.params.userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.patch('/api/battles/:id/challenger', async (req, res) => {
  const { score } = req.body;
  try {
    await pool.query('UPDATE battles SET challenger_score = $1 WHERE id = $2', [score, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// 4. Қарсыластың ойынды аяқтауы
app.patch('/api/battles/:id/complete', async (req, res) => {
  const { score } = req.body;
  try {
    const battle = await pool.query('SELECT * FROM battles WHERE id = $1', [req.params.id]);
    await pool.query('UPDATE battles SET opponent_score = $1, status = \'completed\' WHERE id = $2', [score, req.params.id]);
    
    // Хабарлама жіберу
    const opponent = await pool.query('SELECT name FROM users WHERE id = $1', [battle.rows[0].opponent_id]);
    await pool.query(
      'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
      [battle.rows[0].challenger_id, 'Ойын аяқталды!', `${opponent.rows[0].name} ойынды аяқтады. Нәтижені тексеріңіз.`]
    );

    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// --- SYSTEM NOTIFICATIONS ---

app.get('/api/notifications', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.user?.id;
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// 4. Пайдаланушы аватарасын жаңарту
app.patch('/api/user/avatar', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.user?.id;
  const { avatar_url } = req.body;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });
  try {
    await pool.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatar_url, userId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// --- CHAT SYSTEM ---

// 1. Хабарлама жіберу
app.post('/api/messages', async (req, res) => {
  const senderId = req.headers['x-user-id'] || req.user?.id;
  const { receiver_id, message_text } = req.body;
  
  if (!senderId || !receiver_id) {
    return res.status(400).json({ error: 'ID жетіспейді' });
  }

  // Ұзындығын тексеру (макс. 100 таңба)
  if (message_text && message_text.length > 100) {
    return res.status(400).json({ error: 'Хабарлама тым ұзын (макс. 100 таңба)' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, message_text) VALUES ($1, $2, $3) RETURNING *',
      [senderId, receiver_id, message_text]
    );
    res.json(result.rows[0]);
  } catch (err) { 
    console.error('SQL Error in sendMessage:', err.message);
    res.status(500).json({ error: 'Қате' }); 
  }
});

// 2. Чат тарихын алу
app.get('/api/messages/:otherId', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.user?.id;
  const otherId = req.params.otherId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const result = await pool.query(`
      SELECT * FROM messages 
      WHERE (sender_id = $1 AND receiver_id = $2) 
         OR (sender_id = $2 AND receiver_id = $1)
      ORDER BY created_at ASC
    `, [userId, otherId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// 3. Оқылмаған хабарламалар санын алу (жалпы және әр қолданушы бойынша)
app.get('/api/unread-messages', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.user?.id;
  console.log('--- DEBUG: Unread messages request ---');
  console.log('User ID from header:', userId);

  if (!userId) {
    console.log('Error: No User ID provided');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const result = await pool.query(`
      SELECT sender_id, COUNT(*) as count 
      FROM messages 
      WHERE receiver_id = $1 AND is_read = FALSE 
      GROUP BY sender_id
    `, [userId]);
    
    const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    console.log('Query result rows:', result.rows);
    console.log('Total unread count calculated:', total);

    res.json({ total, details: result.rows });
  } catch (err) { 
    console.error('SQL Error in unread-messages:', err.message);
    res.status(500).json({ error: 'Қате' }); 
  }
});

// 4. Хабарламаларды оқылды деп белгілеу
app.patch('/api/messages/read/:senderId', async (req, res) => {
  const userId = req.headers['x-user-id'] || req.user?.id;
  const senderId = req.params.senderId;
  try {
    await pool.query('UPDATE messages SET is_read = TRUE WHERE receiver_id = $1 AND sender_id = $2', [userId, senderId]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// --- ADMIN ---

app.get('/api/admin/logs', checkRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.get('/api/users', checkRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.post('/api/update-score', async (req, res) => {
  const { email, score } = req.body;
  try {
    await pool.query('UPDATE users SET points = points + $1 WHERE email = $2', [score, email]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// Courses
app.get('/api/courses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.post('/api/courses', checkRole(['admin', 'teacher']), async (req, res) => {
  const { title, description, category } = req.body;
  const userId = req.headers['x-user-id'];
  const userName = req.headers['x-user-name'];
  try {
    const result = await pool.query('INSERT INTO courses (title, description, category) VALUES ($1, $2, $3) RETURNING *', [title, description, category]);
    await logAction(userId, userName, 'COURSE_CREATED', title);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.delete('/api/courses/:id', checkRole(['admin', 'teacher']), async (req, res) => {
  const userId = req.headers['x-user-id'];
  const userName = req.headers['x-user-name'];
  try {
    await pool.query('DELETE FROM courses WHERE id = $1', [req.params.id]);
    await logAction(userId, userName, 'COURSE_DELETED', `ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// Lessons
app.get('/api/lessons/:courseId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lessons WHERE course_id = $1 ORDER BY id', [req.params.courseId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.post('/api/lessons', checkRole(['admin', 'teacher']), async (req, res) => {
  const { course_id, title, video_url } = req.body;
  const userId = req.headers['x-user-id'];
  const userName = req.headers['x-user-name'];
  try {
    const result = await pool.query('INSERT INTO lessons (course_id, title, video_url) VALUES ($1, $2, $3) RETURNING *', [course_id, title, video_url]);
    await logAction(userId, userName, 'LESSON_CREATED', title);
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// Questions (admin)
app.get('/api/lessons/:lessonId/comments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name as user_name 
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.lesson_id = $1 
      ORDER BY c.created_at DESC
    `, [req.params.lessonId]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.post('/api/comments', async (req, res) => {
  const { userId, lessonId, text } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO comments (user_id, lesson_id, comment_text) VALUES ($1, $2, $3) RETURNING *',
      [userId, lessonId, text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// Questions (admin)
app.post('/api/questions', checkRole(['admin', 'teacher']), async (req, res) => {
  const { question_text, option_a, option_b, option_c, option_d, correct_option, category } = req.body;
  const userId = req.headers['x-user-id'];
  const userName = req.headers['x-user-name'];
  try {
    const result = await pool.query(
      'INSERT INTO quiz_questions (question_text, option_a, option_b, option_c, option_d, correct_option, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [question_text, option_a, option_b, option_c, option_d, correct_option, category || 'Жалпы']
    );
    await logAction(userId, userName, 'QUESTION_CREATED', question_text.substring(0, 30));
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.put('/api/questions/:id', checkRole(['admin', 'teacher']), async (req, res) => {
  const { question_text, option_a, option_b, option_c, option_d, correct_option, category } = req.body;
  const userId = req.headers['x-user-id'];
  const userName = req.headers['x-user-name'];
  try {
    await pool.query(
      'UPDATE quiz_questions SET question_text=$1, option_a=$2, option_b=$3, option_c=$4, option_d=$5, correct_option=$6, category=$7 WHERE id=$8',
      [question_text, option_a, option_b, option_c, option_d, correct_option, category, req.params.id]
    );
    await logAction(userId, userName, 'QUESTION_UPDATED', `ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.delete('/api/questions/:id', checkRole(['admin', 'teacher']), async (req, res) => {
  const userId = req.headers['x-user-id'];
  const userName = req.headers['x-user-name'];
  try {
    await pool.query('DELETE FROM quiz_questions WHERE id = $1', [req.params.id]);
    await logAction(userId, userName, 'QUESTION_DELETED', `ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// Users (admin)
app.patch('/api/users/:id/role', checkRole(['admin']), async (req, res) => {
  const { role } = req.body;
  const adminId = req.headers['x-user-id'];
  const adminName = req.headers['x-user-name'];
  try {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);
    await logAction(adminId, adminName, 'ROLE_CHANGED', `ID:${req.params.id} -> ${role}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.delete('/api/users/:id', checkRole(['admin']), async (req, res) => {
  const adminId = req.headers['x-user-id'];
  const adminName = req.headers['x-user-name'];
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    await logAction(adminId, adminName, 'USER_DELETED', `ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// Admin Stats
app.get('/api/admin/stats', checkRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const totalQuestions = await pool.query('SELECT COUNT(*) FROM quiz_questions');
    const totalGames = await pool.query('SELECT COUNT(*) FROM battles WHERE status = \'completed\'');
    
    const recentChallenges = await pool.query(`
      SELECT b.*, u1.name as challenger_name, u2.name as opponent_name
      FROM battles b
      JOIN users u1 ON b.challenger_id = u1.id
      JOIN users u2 ON b.opponent_id = u2.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `);

    res.json({
      summary: {
        users: totalUsers.rows[0].count,
        questions: totalQuestions.rows[0].count,
        games: totalGames.rows[0].count
      },
      recentChallenges: recentChallenges.rows
    });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// Contact
app.get('/api/contact', checkRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contact_messages ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.get('/api/contact/unread-count', checkRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM contact_messages WHERE is_read = FALSE');
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.patch('/api/contact/read-all', checkRole(['admin']), async (req, res) => {
  try {
    await pool.query('UPDATE contact_messages SET is_read = TRUE');
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    await pool.query('INSERT INTO contact_messages (name, email, subject, message) VALUES ($1, $2, $3, $4)', [name, email, subject, message]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.delete('/api/messages/:id', checkRole(['admin']), async (req, res) => {
  const adminId = req.headers['x-user-id'];
  const adminName = req.headers['x-user-name'];
  try {
    await pool.query('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
    await logAction(adminId, adminName, 'MESSAGE_DELETED', `ID: ${req.params.id}`);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

// User Progress
app.get('/api/user-progress/:userId', async (req, res) => {
  try {
    const result = await pool.query('SELECT lesson_id FROM user_progress WHERE user_id = $1', [req.params.userId]);
    res.json(result.rows.map(r => r.lesson_id));
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

app.post('/api/toggle-progress', async (req, res) => {
  const { userId, lessonId } = req.body;
  try {
    const check = await pool.query('SELECT * FROM user_progress WHERE user_id = $1 AND lesson_id = $2', [userId, lessonId]);
    if (check.rows.length > 0) {
      await pool.query('DELETE FROM user_progress WHERE user_id = $1 AND lesson_id = $2', [userId, lessonId]);
      res.json({ completed: false });
    } else {
      await pool.query('INSERT INTO user_progress (user_id, lesson_id) VALUES ($1, $2)', [userId, lessonId]);
      res.json({ completed: true });
    }
  } catch (err) { res.status(500).json({ error: 'Қате' }); }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
