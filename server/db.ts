import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const dbPath = process.cwd() + '/voosimples.db';
export const db = new Database(dbPath, { verbose: console.log });

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      plan TEXT DEFAULT 'free',
      status TEXT DEFAULT 'active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      examId INTEGER,
      score INTEGER,
      completedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId INTEGER,
      plan TEXT,
      status TEXT,
      mercadoPagoPreferenceId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  // Create superuser if it doesn't exist
  const superUserEmail = 'suporte@unityautomacoes.com.br';
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(superUserEmail);
  
  if (!existingUser) {
    const passwordHash = bcrypt.hashSync('200616', 10);
    db.prepare(`
      INSERT INTO users (name, email, passwordHash, role, plan)
      VALUES (?, ?, ?, ?, ?)
    `).run('Super Admin', superUserEmail, passwordHash, 'admin', 'premium');
    console.log('Superuser created successfully.');
  }
}
