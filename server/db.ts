import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'voosimples',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const db = pool;

export async function initDb() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        passwordHash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        plan VARCHAR(50) DEFAULT 'free',
        planCycle VARCHAR(50) DEFAULT 'monthly',
        planExpiration DATETIME DEFAULT NULL,
        status VARCHAR(50) DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try {
      await db.query('ALTER TABLE users ADD COLUMN planCycle VARCHAR(50) DEFAULT "monthly"');
    } catch (e) { /* ignore if exists */ }
    try {
      await db.query('ALTER TABLE users ADD COLUMN planExpiration DATETIME DEFAULT NULL');
    } catch (e) { /* ignore if exists */ }

    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT,
        examId INT,
        score INT,
        completedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        \`key\` VARCHAR(255) PRIMARY KEY,
        value TEXT
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        userId INT,
        plan VARCHAR(50),
        status VARCHAR(50),
        mercadoPagoPreferenceId VARCHAR(255),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create superuser if it doesn't exist
    const superUserEmail = 'suporte@unityautomacoes.com.br';
    const [existingUsers]: any = await db.query('SELECT id FROM users WHERE email = ?', [superUserEmail]);
    
    if (existingUsers.length === 0) {
      const passwordHash = bcrypt.hashSync('200616', 10);
      await db.query(`
        INSERT INTO users (name, email, passwordHash, role, plan)
        VALUES (?, ?, ?, ?, ?)
      `, ['Super Admin', superUserEmail, passwordHash, 'admin', 'premium']);
      console.log('Superuser created successfully.');
    }
  } catch (err) {
    console.error('Error initializing MySQL database:', err);
  }
}
