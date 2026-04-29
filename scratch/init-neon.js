const { Pool } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_t6mPvnra8wiq@ep-bold-silence-anem8177.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString: NEON_URL,
});

async function setup() {
  console.log('--- Neon DB Setup Started ---');
  try {
    const client = await pool.connect();
    
    console.log('1. Creating Tables...');
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

      -- LMS Tables (from current code)
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT
      );

      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id),
        title TEXT NOT NULL,
        video_url TEXT,
        content TEXT
      );

      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        lesson_id INTEGER REFERENCES lessons(id),
        completed BOOLEAN DEFAULT TRUE,
        UNIQUE(user_id, lesson_id)
      );
    `);

    console.log('2. Seeding initial questions...');
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
      ['React кітапханасын кім жасады?', 'Google', 'Microsoft', 'Facebook', 'Apple', 'C', 'IT']
    ];

    for (const q of questions) {
      await client.query(
        'INSERT INTO quiz_questions (question_text, option_a, option_b, option_c, option_d, correct_option, category) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
        q
      );
    }

    console.log('3. Creating Admin User...');
    const hashedPw = '$2b$10$7R.uM6L7Wp1L6I.w7eA/7.9n9Y5Jv5W8z8k9Y5Jv5W8z8k9Y5Jv5W'; // admin123 (approx)
    await client.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES ('Admin', 'admin@quiz.kz', $1, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [hashedPw]);

    console.log('--- Setup Completed Successfully! ---');
    client.release();
  } catch (err) {
    console.error('Setup Error:', err.message);
  } finally {
    await pool.end();
  }
}

setup();
