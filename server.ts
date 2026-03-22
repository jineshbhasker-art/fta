import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.db');
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    displayName TEXT,
    role TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS vat_returns (
    id TEXT PRIMARY KEY,
    userId TEXT,
    status TEXT,
    period TEXT,
    vatRef TEXT,
    periodFrom TEXT,
    periodTo TEXT,
    taxYearEnd TEXT,
    totalSales REAL,
    totalVAT REAL,
    totalExpenses REAL,
    totalRecoverableVAT REAL,
    netVAT REAL,
    dueDate TEXT,
    filedAt TEXT,
    updatedAt TEXT,
    createdAt TEXT,
    formData TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    userId TEXT,
    type TEXT,
    amount REAL,
    status TEXT,
    dueDate TEXT,
    paidAt TEXT,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS corporate_tax_returns (
    id TEXT PRIMARY KEY,
    userId TEXT,
    status TEXT,
    period TEXT,
    netTax REAL,
    dueDate TEXT,
    filedAt TEXT,
    updatedAt TEXT,
    createdAt TEXT,
    formData TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS correspondence (
    id TEXT PRIMARY KEY,
    userId TEXT,
    subject TEXT,
    fromName TEXT,
    date TEXT,
    status TEXT,
    content TEXT,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    userId TEXT,
    taxType TEXT,
    trn TEXT,
    status TEXT,
    effectiveDate TEXT,
    entityName TEXT,
    createdAt TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  );
`);

// Seed Database
async function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  if (userCount.count > 0) return;

  console.log('Seeding database with mock data...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin', 10);
  const now = new Date().toISOString();

  // Create Users
  const users = [
    { id: 'admin-id', username: 'admin', email: 'jinzstallionz@gmail.com', password: adminPassword, displayName: 'MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C', role: 'admin' },
    { id: 'user-1', username: 'corporate_user', email: 'corporate@example.com', password: hashedPassword, displayName: 'Global Trading LLC', role: 'corporate' },
    { id: 'user-2', username: 'person_user', email: 'person@example.com', password: hashedPassword, displayName: 'John Doe', role: 'person' }
  ];

  const insertUser = db.prepare('INSERT INTO users (id, username, email, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const u of users) {
    insertUser.run(u.id, u.username, u.email, u.password, u.displayName, u.role, now);
  }

  // Helper to seed data for a user
  const seedUserData = (userId: string, entityName: string) => {
    // Create Registrations
    const registrations = [
      { id: `reg-vat-${userId}`, userId, taxType: 'VAT', trn: '230010165962', status: 'Active', effectiveDate: '2024-01-01', entityName },
      { id: `reg-ct-${userId}`, userId, taxType: 'Corporate Tax', trn: '200987654321001', status: 'Active', effectiveDate: '2024-06-01', entityName }
    ];
    const insertReg = db.prepare('INSERT INTO registrations (id, userId, taxType, trn, status, effectiveDate, entityName, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const r of registrations) {
      insertReg.run(r.id, r.userId, r.taxType, r.trn, r.status, r.effectiveDate, r.entityName, now);
    }

    // Create VAT Returns
    const defaultVATFormData = {
      vatRef: '',
      periodFrom: '',
      periodTo: '',
      status: 'Draft',
      period: '01/12/2025 - 28/02/2026',
      stagger: 'Stagger 2 - Quarterly (Mar to Feb)',
      dueDate: '30/03/2026',
      taxYearEnd: '28/02/2026',
      sales: {
        standardRated: {
          abuDhabi: { amount: 0, vat: 0, adjustment: 0 },
          dubai: { amount: 0, vat: 0, adjustment: 0 },
          sharjah: { amount: 0, vat: 0, adjustment: 0 },
          ajman: { amount: 0, vat: 0, adjustment: 0 },
          ummAlQuwain: { amount: 0, vat: 0, adjustment: 0 },
          rasAlKhaimah: { amount: 0, vat: 0, adjustment: 0 },
          fujairah: { amount: 0, vat: 0, adjustment: 0 },
        },
        touristRefunds: { amount: 0, vat: 0 },
        reverseCharge: { amount: 0, vat: 0 },
        zeroRated: { amount: 0 },
        exempt: { amount: 0 },
        goodsImported: { amount: 0, vat: 0 },
        adjustmentsImports: { amount: 0, vat: 0 },
      },
      expenses: {
        standardRated: { amount: 0, vat: 0, adjustment: 0 },
        reverseCharge: { amount: 0, vat: 0 },
      },
      profitMarginScheme: 'No'
    };

    const vatReturns = [
      { 
        id: `vat-img-1-${userId}`, 
        userId, 
        status: 'Draft', 
        period: '01/12/2025 - 28/02/2026', 
        vatRef: '230010165962',
        periodFrom: '01/12/2025',
        periodTo: '28/02/2026',
        taxYearEnd: '28/02/2026',
        totalSales: 519580.20, 
        totalVAT: 25979.01, 
        totalExpenses: 0, 
        totalRecoverableVAT: 0, 
        netVAT: 25979.01, 
        dueDate: '30/03/2026', 
        filedAt: null, 
        formData: { ...defaultVATFormData, sales: { ...defaultVATFormData.sales, goodsImported: { amount: 519580.20, vat: 25979.01 } } } 
      },
      { 
        id: `vat-img-2-${userId}`, 
        userId, 
        status: 'Submitted', 
        period: '01/09/2025 - 30/11/2025', 
        vatRef: '230009650203',
        periodFrom: '01/09/2025',
        periodTo: '30/11/2025',
        taxYearEnd: '28/02/2026',
        totalSales: 0, 
        totalVAT: 0, 
        totalExpenses: 445976.20, 
        totalRecoverableVAT: 22298.81, 
        netVAT: -22298.81, 
        dueDate: '29/12/2025', 
        filedAt: '2025-12-25T10:00:00Z', 
        formData: { ...defaultVATFormData, expenses: { ...defaultVATFormData.expenses, standardRated: { amount: 445976.20, vat: 22298.81, adjustment: 0 } } } 
      },
      { 
        id: `vat-img-3-${userId}`, 
        userId, 
        status: 'Submitted', 
        period: '01/06/2025 - 31/08/2025', 
        vatRef: '230009007872',
        periodFrom: '01/06/2025',
        periodTo: '31/08/2025',
        taxYearEnd: '28/02/2026',
        totalSales: 0, 
        totalVAT: 0, 
        totalExpenses: 123245.60, 
        totalRecoverableVAT: 6162.28, 
        netVAT: -6162.28, 
        dueDate: '29/09/2025', 
        filedAt: '2025-09-26T10:00:00Z', 
        formData: { ...defaultVATFormData, expenses: { ...defaultVATFormData.expenses, standardRated: { amount: 123245.60, vat: 6162.28, adjustment: 0 } } } 
      },
      { 
        id: `vat-img-4-${userId}`, 
        userId, 
        status: 'Submitted', 
        period: '01/03/2025 - 31/05/2025', 
        vatRef: '230008349468',
        periodFrom: '01/03/2025',
        periodTo: '31/05/2025',
        taxYearEnd: '28/02/2026',
        totalSales: 132939.60, 
        totalVAT: 6646.98, 
        totalExpenses: 0, 
        totalRecoverableVAT: 0, 
        netVAT: 6646.98, 
        dueDate: '30/06/2025', 
        filedAt: '2025-06-24T10:00:00Z', 
        formData: { ...defaultVATFormData, sales: { ...defaultVATFormData.sales, standardRated: { ...defaultVATFormData.sales.standardRated, dubai: { amount: 132939.60, vat: 6646.98, adjustment: 0 } } } } 
      },
      { 
        id: `vat-img-5-${userId}`, 
        userId, 
        status: 'Submitted', 
        period: '01/12/2024 - 28/02/2025', 
        vatRef: '230007923042',
        periodFrom: '01/12/2024',
        periodTo: '28/02/2025',
        taxYearEnd: '28/02/2025',
        totalSales: 499780.20, 
        totalVAT: 24989.01, 
        totalExpenses: 0, 
        totalRecoverableVAT: 0, 
        netVAT: 24989.01, 
        dueDate: '28/03/2025', 
        filedAt: '2025-03-25T10:00:00Z', 
        formData: { ...defaultVATFormData, sales: { ...defaultVATFormData.sales, standardRated: { ...defaultVATFormData.sales.standardRated, abuDhabi: { amount: 499780.20, vat: 24989.01, adjustment: 0 } } } } 
      },
      { 
        id: `vat-img-6-${userId}`, 
        userId, 
        status: 'Overdue', 
        period: '01/09/2024 - 30/11/2024', 
        vatRef: '230007123456',
        periodFrom: '01/09/2024',
        periodTo: '30/11/2024',
        taxYearEnd: '28/02/2025',
        totalSales: 250000.00, 
        totalVAT: 12500.00, 
        totalExpenses: 0, 
        totalRecoverableVAT: 0, 
        netVAT: 12500.00, 
        dueDate: '29/12/2024', 
        filedAt: null, 
        formData: { ...defaultVATFormData, sales: { ...defaultVATFormData.sales, standardRated: { ...defaultVATFormData.sales.standardRated, sharjah: { amount: 250000.00, vat: 12500.00, adjustment: 0 } } } } 
      }
    ];
    const insertVAT = db.prepare(`
      INSERT INTO vat_returns (id, userId, status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, filedAt, updatedAt, createdAt, formData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const v of vatReturns) {
      insertVAT.run(v.id, v.userId, v.status, v.period, v.vatRef, v.periodFrom, v.periodTo, v.taxYearEnd, v.totalSales, v.totalVAT, v.totalExpenses, v.totalRecoverableVAT, v.netVAT, v.dueDate, v.filedAt, now, now, JSON.stringify(v.formData));
    }

    // Create Corporate Tax Returns
    const ctReturns = [
      { id: `ct-1-${userId}`, userId, status: 'Submitted', period: '2023', netTax: 45000, dueDate: '2024-09-30', filedAt: '2024-08-15', formData: { taxableIncome: 500000 } },
      { id: `ct-2-${userId}`, userId, status: 'Draft', period: '2024', netTax: 0, dueDate: '2025-09-30', filedAt: null, formData: { taxableIncome: 0 } }
    ];
    const insertCT = db.prepare(`
      INSERT INTO corporate_tax_returns (id, userId, status, period, netTax, dueDate, filedAt, updatedAt, createdAt, formData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of ctReturns) {
      insertCT.run(c.id, c.userId, c.status, c.period, c.netTax, c.dueDate, c.filedAt, now, now, JSON.stringify(c.formData));
    }

    // Create Payments
    const payments = [
      { id: `pay-1-${userId}`, userId, type: 'VAT Payment', amount: 15000, status: 'Paid', dueDate: '2024-04-28', paidAt: '2024-04-25' },
      { id: `pay-2-${userId}`, userId, type: 'VAT Payment', amount: 17500, status: 'Paid', dueDate: '2024-07-28', paidAt: '2024-07-26' },
      { id: `pay-3-${userId}`, userId, type: 'Corporate Tax', amount: 45000, status: 'Outstanding', dueDate: '2024-09-30', paidAt: null }
    ];
    const insertPayment = db.prepare(`
      INSERT INTO payments (id, userId, type, amount, status, dueDate, paidAt, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of payments) {
      insertPayment.run(p.id, p.userId, p.type, p.amount, p.status, p.dueDate, p.paidAt, now);
    }

    // Create Correspondence
    const correspondence = [
      { id: `msg-1-${userId}`, userId, subject: 'VAT Registration Approved', fromName: 'FTA Admin', date: '2024-01-12', status: 'Read', content: 'Your VAT registration has been approved. Your TRN is 100234567890003.' },
      { id: `msg-2-${userId}`, userId, subject: 'Corporate Tax Deadline Reminder', fromName: 'Tax System', date: '2024-08-01', status: 'Unread', content: 'This is a reminder that your Corporate Tax return for 2023 is due by 30 Sep 2024.' },
      { id: `msg-3-${userId}`, userId, subject: 'Tax Certificate Issued', fromName: 'FTA Admin', date: '2024-05-15', status: 'Read', content: 'Your Tax Residency Certificate has been issued and is available for download.' }
    ];
    const insertMsg = db.prepare(`
      INSERT INTO correspondence (id, userId, subject, fromName, date, status, content, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const m of correspondence) {
      insertMsg.run(m.id, m.userId, m.subject, m.fromName, m.date, m.status, m.content, now);
    }
  };

  seedUserData('admin-id', 'MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C');
  seedUserData('user-1', 'Global Trading LLC');
  seedUserData('user-2', 'John Doe');

  console.log('Database seeded successfully.');
}

async function startServer() {
  await seedDatabase();
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.post('/api/auth/register', async (req, res) => {
    const { username, password, displayName, role } = req.body;
    console.log(`Registration attempt for: ${username}`);
    const id = Math.random().toString(36).substr(2, 9);
    const hashedPassword = await bcrypt.hash(password, 10);
    const email = `${username.toLowerCase()}@emara.tax`;
    const createdAt = new Date().toISOString();

    try {
      const stmt = db.prepare('INSERT INTO users (id, username, email, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
      stmt.run(id, username, email, hashedPassword, displayName, role || 'corporate', createdAt);
      console.log(`User created: ${username}`);
      res.status(201).json({ message: 'User created' });
    } catch (err) {
      console.error(`Registration failed for ${username}:`, err);
      res.status(400).json({ error: 'Username already exists' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for: ${username}`);
    // Try to find user by username or email
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, username) as any;

    if (!user) {
      console.log(`User not found: ${username}`);
    } else {
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(`User found: ${user.username}, Password match: ${passwordMatch}`);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Auto-create admin if not exists and trying to login with admin/admin
      if (username === 'admin' && password === 'admin') {
        console.log('Auto-creating admin user...');
        const id = 'admin-id';
        const hashedPassword = await bcrypt.hash('admin', 10);
        const email = 'admin@emara.tax';
        const createdAt = new Date().toISOString();
        db.prepare('INSERT OR IGNORE INTO users (id, username, email, password, displayName, role, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
          id, 'admin', email, hashedPassword, 'MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C', 'admin', createdAt
        );
        const newUser = db.prepare('SELECT * FROM users WHERE username = ?').get('admin') as any;
        const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET);
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
        console.log('Admin auto-created and logged in.');
        return res.json({ user: { id: newUser.id, username: newUser.username, displayName: newUser.displayName, role: newUser.role } });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role } });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT id, username, email, displayName, role, createdAt FROM users WHERE id = ?').get(req.user.id) as any;
    res.json(user);
  });

  // VAT Return Routes
  app.get('/api/vat_returns', authenticateToken, (req: any, res) => {
    const returns = db.prepare('SELECT * FROM vat_returns WHERE userId = ? ORDER BY updatedAt DESC').all(req.user.id);
    res.json(returns.map((r: any) => ({ ...r, formData: JSON.parse(r.formData) })));
  });

  app.get('/api/vat_returns/:id', authenticateToken, (req: any, res) => {
    const r = db.prepare('SELECT * FROM vat_returns WHERE id = ? AND userId = ?').get(req.params.id, req.user.id) as any;
    if (!r) return res.sendStatus(404);
    res.json({ ...r, formData: JSON.parse(r.formData) });
  });

  app.post('/api/vat_returns', authenticateToken, (req: any, res) => {
    const id = Math.random().toString(36).substr(2, 9);
    const { status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, formData } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO vat_returns (id, userId, status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, filedAt, updatedAt, createdAt, formData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, req.user.id, status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, 
      status === 'Submitted' ? now : null, now, now, JSON.stringify(formData)
    );
    
    res.status(201).json({ id });
  });

  app.put('/api/vat_returns/:id', authenticateToken, (req: any, res) => {
    const { status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate, formData } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      UPDATE vat_returns 
      SET status = ?, period = ?, vatRef = ?, periodFrom = ?, periodTo = ?, taxYearEnd = ?, totalSales = ?, totalVAT = ?, totalExpenses = ?, totalRecoverableVAT = ?, netVAT = ?, dueDate = ?, filedAt = ?, updatedAt = ?, formData = ?
      WHERE id = ? AND userId = ?
    `);
    
    const result = stmt.run(
      status, period, vatRef, periodFrom, periodTo, taxYearEnd, totalSales, totalVAT, totalExpenses, totalRecoverableVAT, netVAT, dueDate,
      status === 'Submitted' ? now : null, now, JSON.stringify(formData),
      req.params.id, req.user.id
    );
    
    if (result.changes === 0) return res.sendStatus(404);
    res.json({ message: 'Updated' });
  });

  app.delete('/api/vat_returns/:id', authenticateToken, (req: any, res) => {
    const result = db.prepare('DELETE FROM vat_returns WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.sendStatus(404);
    res.json({ message: 'Deleted' });
  });

  // Payment Routes
  app.get('/api/payments', authenticateToken, (req: any, res) => {
    const payments = db.prepare('SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
    res.json(payments);
  });

  // Corporate Tax Routes
  app.get('/api/corporate_tax_returns', authenticateToken, (req: any, res) => {
    const returns = db.prepare('SELECT * FROM corporate_tax_returns WHERE userId = ? ORDER BY updatedAt DESC').all(req.user.id);
    res.json(returns.map((r: any) => ({ ...r, formData: JSON.parse(r.formData) })));
  });

  app.post('/api/corporate_tax_returns', authenticateToken, (req: any, res) => {
    const id = Math.random().toString(36).substr(2, 9);
    const { status, period, netTax, dueDate, formData } = req.body;
    const now = new Date().toISOString();
    
    const stmt = db.prepare(`
      INSERT INTO corporate_tax_returns (id, userId, status, period, netTax, dueDate, filedAt, updatedAt, createdAt, formData)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(id, req.user.id, status, period, netTax, dueDate, status === 'Submitted' ? now : null, now, now, JSON.stringify(formData));
    res.status(201).json({ id });
  });

  app.delete('/api/corporate_tax_returns/:id', authenticateToken, (req: any, res) => {
    const result = db.prepare('DELETE FROM corporate_tax_returns WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) return res.sendStatus(404);
    res.json({ message: 'Deleted' });
  });

  // Correspondence Routes
  app.get('/api/correspondence', authenticateToken, (req: any, res) => {
    const correspondence = db.prepare('SELECT * FROM correspondence WHERE userId = ? ORDER BY date DESC').all(req.user.id);
    res.json(correspondence);
  });

  app.get('/api/registrations', authenticateToken, (req: any, res) => {
    const registrations = db.prepare('SELECT * FROM registrations WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
    res.json(registrations);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
