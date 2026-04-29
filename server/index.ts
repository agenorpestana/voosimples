import express from 'express';
import cors from 'cors';
import { db, initDb } from './db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const app = express();
const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 3001);

app.use(cors());
app.use(express.json());

// Initialize Database
initDb();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtvoosimples';

// Middleware to verify Admin
const verifyAdmin = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Token missing' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, role: string };
    if (decoded.role !== 'admin') {
      res.status(403).json({ error: 'Not authorized as admin' });
      return;
    }
    // @ts-ignore
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to verify User
const verifyUser = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Token missing' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number, role: string, email: string };
    // @ts-ignore
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users]: any = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
      return;
    }
    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Credenciais inválidas.' });
      return;
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, plan: user.plan }, JWT_SECRET, { expiresIn: '1d' });
    
    // Log activity
    await db.query('INSERT INTO audit_logs (userId, action, details) VALUES (?, ?, ?)', [user.id, 'login', 'User logged in successfully']);
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Register Route
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, plan } = req.body;
  try {
    const [existing]: any = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing && existing.length > 0) {
      res.status(400).json({ error: 'E-mail já cadastrado.' });
      return;
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    const [result]: any = await db.query('INSERT INTO users (name, email, passwordHash, plan) VALUES (?, ?, ?, ?)', [name, email, passwordHash, 'free']);
    
    // Auto login
    const user = { id: result.insertId, name, email, role: 'user', plan: 'free' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '1d' });
    
    await db.query('INSERT INTO audit_logs (userId, action, details) VALUES (?, ?, ?)', [user.id, 'register', 'User registered']);
    
    res.json({ token, user, intendedPlan: plan || 'free' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Route: Get Users
app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const [users]: any = await db.query('SELECT id, name, email, role, plan, status, createdAt FROM users');
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Route: Get Audit Logs
app.get('/api/admin/logs', verifyAdmin, async (req, res) => {
  try {
    const [logs]: any = await db.query(`
      SELECT audit_logs.*, users.name as userName, users.email as userEmail
      FROM audit_logs
      LEFT JOIN users ON audit_logs.userId = users.id
      ORDER BY timestamp DESC
      LIMIT 100
    `);
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Route: Get Settings
app.get('/api/admin/settings', verifyAdmin, async (req, res) => {
  try {
    const [settingsRows]: any = await db.query('SELECT `key`, value FROM settings');
    const settings: Record<string, string> = {};
    for (const row of settingsRows) {
      settings[row.key] = row.value;
    }
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Route: Update Settings
app.post('/api/admin/settings', verifyAdmin, async (req, res) => {
  try {
    const { settings } = req.body;
    
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      for (const key of Object.keys(settings)) {
        await connection.query('INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [key, settings[key]]);
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    // @ts-ignore
    await db.query('INSERT INTO audit_logs (userId, action, details) VALUES (?, ?, ?)', [req.user.id, 'update_settings', 'Updated system settings']);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Exams Mock Route
app.get('/api/exams', (req, res) => {
  res.json([
    { id: 1, title: 'Simulado PP - Regulamentos', questions: 20 },
    { id: 2, title: 'Simulado PP - Meteorologia', questions: 20 },
    { id: 3, title: 'Simulado PC - Navegação', questions: 20 },
  ]);
});

// Checkout Route
app.post('/api/checkout', verifyUser, async (req, res) => {
  try {
    const { plan } = req.body;
    // @ts-ignore
    const user = req.user;

    const price = plan === 'premium' ? 49.9 : (plan === 'vip' ? 89.9 : 0);
    if (price === 0) {
      res.status(400).json({ error: 'Plano inválido ou gratuito.' });
      return;
    }

    // Retrieve Mercado Pago access token from settings
    const [tokenRows]: any = await db.query('SELECT value FROM settings WHERE `key` = ?', ['MERCADO_PAGO_ACCESS_TOKEN']);
    const mpToken = tokenRows && tokenRows.length > 0 ? tokenRows[0].value : process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!mpToken) {
      // For demonstration of the feature when no MP API key is set
      // we'll just simulate a payment by generating a fake link
      const fakeOrderId = uuidv4();
      await db.query('INSERT INTO orders (id, userId, plan, status) VALUES (?, ?, ?, ?)', [fakeOrderId, user.id, plan, 'pending']);
      res.json({ init_point: `/simulated-payment?orderId=${fakeOrderId}` });
      return;
    }

    const client = new MercadoPagoConfig({ accessToken: mpToken });
    const preference = new Preference(client);
    
    const orderId = uuidv4();
    await db.query('INSERT INTO orders (id, userId, plan, status) VALUES (?, ?, ?, ?)', [orderId, user.id, plan, 'pending']);

    const appUrl = process.env.APP_URL || ('http://localhost:' + PORT);

    const prefResponse = await preference.create({
      body: {
        items: [
          {
            id: plan,
            title: `Assinatura ${plan.toUpperCase()} - VooSimples`,
            quantity: 1,
            unit_price: price,
            currency_id: 'BRL',
          }
        ],
        payer: {
          email: user.email,
        },
        external_reference: orderId,
        back_urls: {
          success: `${appUrl}/checkout/success`,
          failure: `${appUrl}/checkout/failure`,
          pending: `${appUrl}/checkout/pending`,
        },
        auto_return: 'approved',
        notification_url: `${appUrl}/api/webhooks/mercadopago`
      }
    });

    // Update order with preference ID
    await db.query('UPDATE orders SET mercadoPagoPreferenceId = ? WHERE id = ?', [prefResponse.id, orderId]);

    res.json({ init_point: prefResponse.init_point });

  } catch (err: any) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mercado Pago Webhook
app.post('/api/webhooks/mercadopago', async (req, res) => {
  try {
    const payment = req.body;

    if (payment.action === 'payment.created' || payment.type === 'payment') {
      const paymentId = payment.data.id;
      
      const [tokenRows]: any = await db.query('SELECT value FROM settings WHERE `key` = ?', ['MERCADO_PAGO_ACCESS_TOKEN']);
      const mpToken = tokenRows && tokenRows.length > 0 ? tokenRows[0].value : process.env.MERCADO_PAGO_ACCESS_TOKEN;
      
      if (!mpToken) {
        res.status(200).send('OK');
        return;
      }
      
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${mpToken}` }
      });
      const paymentData = await response.json();
      
      const orderId = paymentData.external_reference;
      
      if (paymentData.status === 'approved') {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', ['approved', orderId]);
        
        const [orders]: any = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        const order = orders[0];
        if (order) {
           await db.query('UPDATE users SET plan = ? WHERE id = ?', [order.plan, order.userId]);
           await db.query('INSERT INTO audit_logs (userId, action, details) VALUES (?, ?, ?)', [order.userId, 'plan_upgrade', `Upgraded to ${order.plan} via Mercado Pago`]);
        }
      }
    }
    
    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error', err);
    res.status(500).send('Error');
  }
});

// Simulate Payment endpoint (only for dev/testing when MP is not configured)
app.post('/api/simulate-payment', async (req, res) => {
  try {
    const { orderId } = req.body;
    const [orders]: any = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const order = orders[0];
    if (order) {
      await db.query('UPDATE orders SET status = ? WHERE id = ?', ['approved', orderId]);
      await db.query('UPDATE users SET plan = ? WHERE id = ?', [order.plan, order.userId]);
      await db.query('INSERT INTO audit_logs (userId, action, details) VALUES (?, ?, ?)', [order.userId, 'plan_upgrade', `Upgraded to ${order.plan} via Simulated Payment`]);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(async () => {
    await db.end();
  });
});
