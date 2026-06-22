# FreelanceFlow — Complete Master Development Prompt
> Full-Stack SaaS Project Management Tool for Freelancers
> Stack: React.js + Node.js/Express + MySQL (XAMPP) | Built in 5 Days

---

## TABLE OF CONTENTS
1. [Tech Stack & Tools](#1-tech-stack--tools)
2. [5-Day Development Plan](#2-5-day-development-plan)
3. [Complete File & Folder Structure](#3-complete-file--folder-structure)
4. [Design System](#4-design-system)
5. [Database Schema (Full SQL)](#5-database-schema-full-sql)
6. [Backend — Complete Setup](#6-backend--complete-setup)
7. [Frontend — Complete Setup](#7-frontend--complete-setup)
8. [Page-by-Page Specifications](#8-page-by-page-specifications)
9. [Key Feature Implementations](#9-key-feature-implementations)
10. [API Endpoint Reference](#10-api-endpoint-reference)
11. [Environment Variables](#11-environment-variables)
12. [XAMPP Configuration](#12-xampp-configuration)
13. [Sample Data Seeder](#13-sample-data-seeder)

---

## 1. TECH STACK & TOOLS

### Frontend
| Package | Version | Purpose |
|---|---|---|
| react | ^18.2.0 | UI framework |
| react-dom | ^18.2.0 | DOM rendering |
| react-router-dom | ^6.22.0 | Client-side routing |
| axios | ^1.6.7 | HTTP client |
| recharts | ^2.12.0 | Financial charts |
| jspdf | ^2.5.1 | PDF generation |
| jspdf-autotable | ^3.8.2 | Table plugin for jsPDF |
| react-hot-toast | ^2.4.1 | Toast notifications |
| react-icons | ^5.0.1 | Icon library |
| date-fns | ^3.3.1 | Date utilities |

### Backend
| Package | Version | Purpose |
|---|---|---|
| express | ^4.18.2 | Web framework |
| mysql2 | ^3.9.1 | MySQL database driver |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| cors | ^2.8.5 | Cross-origin headers |
| dotenv | ^16.4.1 | Environment variables |
| express-validator | ^7.0.1 | Input validation |
| morgan | ^1.10.0 | HTTP request logger |
| nodemon | ^3.0.3 | Dev auto-reload |

### Database
- **XAMPP MySQL** (localhost:3306)
- Database name: `freelanceflow`

---

## 2. 5-DAY DEVELOPMENT PLAN

### Day 1 — Project Setup + Auth + Database
- [ ] XAMPP MySQL setup, create database + all tables
- [ ] Initialize backend (Node/Express), connect MySQL
- [ ] Build auth routes: `POST /api/auth/register`, `POST /api/auth/login`
- [ ] JWT middleware, bcrypt password hash
- [ ] Initialize React frontend with folder structure
- [ ] Build Login page and Register page with full CSS
- [ ] Set up Axios instance with interceptors
- [ ] AuthContext (global user state, token storage)
- [ ] ProtectedRoute component

### Day 2 — Client & Project CRM
- [ ] Backend: Client CRUD routes (all scoped to `req.user.id`)
- [ ] Backend: Project CRUD routes
- [ ] Backend: Task CRUD routes
- [ ] Frontend: Sidebar + Layout component
- [ ] Frontend: Clients page (list, add, edit, delete)
- [ ] Frontend: Client detail page (all projects for that client)
- [ ] Frontend: Projects page (list, filter by status)
- [ ] Frontend: Project detail page (tasks, time logs)
- [ ] Frontend: Tasks page (all tasks, priority badges, due dates)
- [ ] Freemium check middleware (max 2 clients on Free plan)

### Day 3 — Time Tracking Engine
- [ ] Backend: TimeLog CRUD routes (start/stop/manual entry)
- [ ] Backend: Calculate total hours + burn rate per project
- [ ] Frontend: TimerContext (global persistent timer)
- [ ] Frontend: Timer component (stopwatch, lives in Sidebar)
- [ ] Frontend: TimeTracking page (all logs, manual entry modal)
- [ ] localStorage persistence for active timer (survives refresh)
- [ ] Auto-calculate duration on stop (EndTime - StartTime)

### Day 4 — Invoicing + PDF + Charts
- [ ] Backend: Invoice CRUD routes
- [ ] Backend: Invoice wizard logic (fetch unbilled logs → mark as billed)
- [ ] Frontend: Invoices list page
- [ ] Frontend: Create Invoice wizard (3 steps)
- [ ] Frontend: Invoice detail / preview page
- [ ] PDF generation with jsPDF (downloadable invoice)
- [ ] Dashboard page with Recharts (Revenue bar chart, status donut)
- [ ] Stats cards (Active Projects, Pending Invoices, Total Revenue)

### Day 5 — Polish + Deploy + Seeder
- [ ] "Load Sample Data" button (seeder API endpoint)
- [ ] Settings page (profile, change password, plan upgrade UI)
- [ ] Responsive design audit (all pages mobile-friendly)
- [ ] Error boundaries, loading spinners, empty states
- [ ] Toast notifications for all CRUD operations
- [ ] Final QA pass (freemium limits, data isolation)
- [ ] README.md with setup instructions
- [ ] Deploy to Render/Railway (optional)

---

## 3. COMPLETE FILE & FOLDER STRUCTURE

```
freelanceflow/
│
├── backend/
│   ├── config/
│   │   └── db.js                    # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js        # register, login, getMe
│   │   ├── clientController.js      # CRUD for clients
│   │   ├── projectController.js     # CRUD for projects
│   │   ├── taskController.js        # CRUD for tasks
│   │   ├── timeLogController.js     # start, stop, manual, list, delete
│   │   ├── invoiceController.js     # create, list, getById, markPaid, delete
│   │   ├── dashboardController.js   # stats, revenue chart data
│   │   └── seederController.js      # load sample data
│   ├── middleware/
│   │   ├── authMiddleware.js        # verifyToken (JWT check)
│   │   └── tierMiddleware.js        # checkFreemiumLimit
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── timeLogRoutes.js
│   │   ├── invoiceRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── seederRoutes.js
│   ├── utils/
│   │   └── invoiceNumber.js         # generate unique invoice numbers
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js                    # Express app entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── assets/
    │   │   └── logo.svg
    │   │
    │   ├── components/              # Reusable shared components
    │   │   ├── Layout/
    │   │   │   ├── Layout.jsx
    │   │   │   └── Layout.css
    │   │   ├── Sidebar/
    │   │   │   ├── Sidebar.jsx
    │   │   │   └── Sidebar.css
    │   │   ├── Navbar/
    │   │   │   ├── Navbar.jsx
    │   │   │   └── Navbar.css
    │   │   ├── Timer/
    │   │   │   ├── Timer.jsx
    │   │   │   └── Timer.css
    │   │   ├── Modal/
    │   │   │   ├── Modal.jsx
    │   │   │   └── Modal.css
    │   │   ├── StatsCard/
    │   │   │   ├── StatsCard.jsx
    │   │   │   └── StatsCard.css
    │   │   ├── ProjectCard/
    │   │   │   ├── ProjectCard.jsx
    │   │   │   └── ProjectCard.css
    │   │   ├── ClientCard/
    │   │   │   ├── ClientCard.jsx
    │   │   │   └── ClientCard.css
    │   │   ├── TaskItem/
    │   │   │   ├── TaskItem.jsx
    │   │   │   └── TaskItem.css
    │   │   ├── TimeLogItem/
    │   │   │   ├── TimeLogItem.jsx
    │   │   │   └── TimeLogItem.css
    │   │   ├── InvoiceCard/
    │   │   │   ├── InvoiceCard.jsx
    │   │   │   └── InvoiceCard.css
    │   │   ├── LoadingSpinner/
    │   │   │   ├── LoadingSpinner.jsx
    │   │   │   └── LoadingSpinner.css
    │   │   ├── EmptyState/
    │   │   │   ├── EmptyState.jsx
    │   │   │   └── EmptyState.css
    │   │   ├── ConfirmDialog/
    │   │   │   ├── ConfirmDialog.jsx
    │   │   │   └── ConfirmDialog.css
    │   │   ├── BurnRateBar/
    │   │   │   ├── BurnRateBar.jsx
    │   │   │   └── BurnRateBar.css
    │   │   └── ProtectedRoute/
    │   │       └── ProtectedRoute.jsx
    │   │
    │   ├── pages/                   # Each page is a folder
    │   │   ├── Login/
    │   │   │   ├── Login.jsx
    │   │   │   └── Login.css
    │   │   ├── Register/
    │   │   │   ├── Register.jsx
    │   │   │   └── Register.css
    │   │   ├── Dashboard/
    │   │   │   ├── Dashboard.jsx
    │   │   │   └── Dashboard.css
    │   │   ├── Clients/
    │   │   │   ├── Clients.jsx
    │   │   │   └── Clients.css
    │   │   ├── ClientDetail/
    │   │   │   ├── ClientDetail.jsx
    │   │   │   └── ClientDetail.css
    │   │   ├── Projects/
    │   │   │   ├── Projects.jsx
    │   │   │   └── Projects.css
    │   │   ├── ProjectDetail/
    │   │   │   ├── ProjectDetail.jsx
    │   │   │   └── ProjectDetail.css
    │   │   ├── Tasks/
    │   │   │   ├── Tasks.jsx
    │   │   │   └── Tasks.css
    │   │   ├── TimeTracking/
    │   │   │   ├── TimeTracking.jsx
    │   │   │   └── TimeTracking.css
    │   │   ├── Invoices/
    │   │   │   ├── Invoices.jsx
    │   │   │   └── Invoices.css
    │   │   ├── InvoiceDetail/
    │   │   │   ├── InvoiceDetail.jsx
    │   │   │   └── InvoiceDetail.css
    │   │   └── Settings/
    │   │       ├── Settings.jsx
    │   │       └── Settings.css
    │   │
    │   ├── context/
    │   │   ├── AuthContext.jsx      # User state, login/logout
    │   │   └── TimerContext.jsx     # Global stopwatch state
    │   │
    │   ├── hooks/
    │   │   ├── useAuth.js           # shortcut for useContext(AuthContext)
    │   │   ├── useTimer.js          # shortcut for useContext(TimerContext)
    │   │   └── useFetch.js          # generic data-fetching hook
    │   │
    │   ├── services/
    │   │   ├── api.js               # Axios instance (baseURL + auth header)
    │   │   ├── authService.js
    │   │   ├── clientService.js
    │   │   ├── projectService.js
    │   │   ├── taskService.js
    │   │   ├── timeLogService.js
    │   │   └── invoiceService.js
    │   │
    │   ├── utils/
    │   │   ├── formatCurrency.js    # ₹ / $ formatting
    │   │   ├── formatDate.js        # readable date strings
    │   │   ├── formatDuration.js    # minutes → "2h 30m"
    │   │   └── generatePDF.js       # jsPDF invoice builder
    │   │
    │   ├── styles/
    │   │   └── variables.css        # CSS custom properties (design tokens)
    │   │
    │   ├── App.jsx
    │   ├── App.css
    │   └── index.js
    │
    └── package.json
```

---

## 4. DESIGN SYSTEM

### 4.1 Color Palette
```css
/* src/styles/variables.css */
:root {
  /* Brand */
  --color-primary:        #4F46E5;   /* Indigo 600 */
  --color-primary-hover:  #4338CA;   /* Indigo 700 */
  --color-primary-light:  #EEF2FF;   /* Indigo 50 */
  --color-secondary:      #7C3AED;   /* Violet 600 */

  /* Semantic */
  --color-success:        #10B981;   /* Emerald 500 */
  --color-success-light:  #D1FAE5;
  --color-warning:        #F59E0B;   /* Amber 500 */
  --color-warning-light:  #FEF3C7;
  --color-danger:         #EF4444;   /* Red 500 */
  --color-danger-light:   #FEE2E2;
  --color-info:           #3B82F6;   /* Blue 500 */
  --color-info-light:     #DBEAFE;

  /* Neutrals */
  --color-bg:             #F8FAFC;   /* Page background */
  --color-surface:        #FFFFFF;   /* Card background */
  --color-border:         #E2E8F0;
  --color-border-hover:   #CBD5E1;
  --color-text-primary:   #1E293B;
  --color-text-secondary: #64748B;
  --color-text-muted:     #94A3B8;

  /* Sidebar */
  --color-sidebar-bg:     #1E293B;
  --color-sidebar-text:   #94A3B8;
  --color-sidebar-active: #4F46E5;
  --color-sidebar-hover:  #334155;

  /* Shadows */
  --shadow-sm:    0 1px 2px 0 rgba(0,0,0,0.05);
  --shadow-md:    0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  --shadow-lg:    0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
  --shadow-xl:    0 20px 25px -5px rgba(0,0,0,0.1);

  /* Radius */
  --radius-sm:    6px;
  --radius-md:    10px;
  --radius-lg:    14px;
  --radius-xl:    20px;
  --radius-full:  9999px;

  /* Spacing scale */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;

  /* Typography */
  --font-sans:   'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:   'JetBrains Mono', 'Fira Code', monospace;

  --text-xs:   11px;
  --text-sm:   13px;
  --text-base: 15px;
  --text-md:   16px;
  --text-lg:   18px;
  --text-xl:   20px;
  --text-2xl:  24px;
  --text-3xl:  30px;
  --text-4xl:  36px;

  /* Transitions */
  --transition-fast:   all 0.15s ease;
  --transition-normal: all 0.25s ease;

  /* Layout */
  --sidebar-width:       260px;
  --sidebar-width-collapsed: 72px;
  --topbar-height:       64px;
}
```

### 4.2 Typography
Import Inter in `public/index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### 4.3 Status Badge Colors
```
Active Projects   → --color-success  (green)
Completed         → --color-text-muted (gray)
On Hold           → --color-warning  (amber)
Overdue Task      → --color-danger   (red)
Pending Invoice   → --color-warning  (amber)
Paid Invoice      → --color-success  (green)
Draft Invoice     → --color-info     (blue)
```

### 4.4 Layout Measurements
```
Sidebar:    260px wide (fixed left)
Main area:  calc(100vw - 260px), padded 32px
Top bar:    64px tall (inside main area)
Card grid:  repeat(auto-fill, minmax(320px, 1fr))
Stats row:  4 equal columns
Page max-w: 1440px
```

---

## 5. DATABASE SCHEMA (FULL SQL)

Save as `database/freelanceflow.sql` and run in XAMPP phpMyAdmin or terminal.

```sql
-- ============================================================
-- FreelanceFlow Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS freelanceflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE freelanceflow;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  plan          ENUM('free','pro') NOT NULL DEFAULT 'free',
  avatar_color  VARCHAR(7)    DEFAULT '#4F46E5',   -- hex for generated avatar
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: clients
-- ============================================================
CREATE TABLE clients (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150),
  phone         VARCHAR(20),
  company       VARCHAR(100),
  address       TEXT,
  hourly_rate   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency      VARCHAR(5)    NOT NULL DEFAULT 'INR',
  notes         TEXT,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_clients_user (user_id)
);

-- ============================================================
-- TABLE: projects
-- ============================================================
CREATE TABLE projects (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  client_id     INT           NOT NULL,
  name          VARCHAR(150)  NOT NULL,
  description   TEXT,
  status        ENUM('active','on_hold','completed','cancelled') NOT NULL DEFAULT 'active',
  budget        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  start_date    DATE,
  end_date      DATE,
  color         VARCHAR(7)    DEFAULT '#4F46E5',
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  INDEX idx_projects_user   (user_id),
  INDEX idx_projects_client (client_id)
);

-- ============================================================
-- TABLE: tasks
-- ============================================================
CREATE TABLE tasks (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  project_id    INT           NOT NULL,
  user_id       INT           NOT NULL,
  title         VARCHAR(200)  NOT NULL,
  description   TEXT,
  status        ENUM('todo','in_progress','review','done') NOT NULL DEFAULT 'todo',
  priority      ENUM('low','medium','high','urgent')       NOT NULL DEFAULT 'medium',
  due_date      DATE,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_tasks_project (project_id),
  INDEX idx_tasks_user    (user_id)
);

-- ============================================================
-- TABLE: time_logs
-- ============================================================
CREATE TABLE time_logs (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT           NOT NULL,
  project_id       INT           NOT NULL,
  task_id          INT,                              -- optional, link to task
  description      VARCHAR(255),
  start_time       DATETIME      NOT NULL,
  end_time         DATETIME,                         -- NULL = timer still running
  duration_minutes INT           GENERATED ALWAYS AS (
    CASE WHEN end_time IS NOT NULL
         THEN TIMESTAMPDIFF(MINUTE, start_time, end_time)
         ELSE NULL
    END
  ) STORED,
  hourly_rate      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  amount           DECIMAL(12,2) GENERATED ALWAYS AS (
    CASE WHEN duration_minutes IS NOT NULL
         THEN ROUND((duration_minutes / 60.0) * hourly_rate, 2)
         ELSE 0.00
    END
  ) STORED,
  is_billed        TINYINT(1)    NOT NULL DEFAULT 0,
  is_manual        TINYINT(1)    NOT NULL DEFAULT 0, -- manually entered vs timer
  created_at       DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id)    REFERENCES tasks(id)    ON DELETE SET NULL,
  INDEX idx_timelogs_user    (user_id),
  INDEX idx_timelogs_project (project_id)
);

-- ============================================================
-- TABLE: invoices
-- ============================================================
CREATE TABLE invoices (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT           NOT NULL,
  client_id      INT           NOT NULL,
  invoice_number VARCHAR(30)   NOT NULL UNIQUE,   -- e.g. INV-2024-0001
  status         ENUM('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
  issue_date     DATE          NOT NULL,
  due_date       DATE          NOT NULL,
  subtotal       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_rate       DECIMAL(5,2)  NOT NULL DEFAULT 18.00,  -- GST default 18%
  tax_amount     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  notes          TEXT,
  created_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  INDEX idx_invoices_user   (user_id),
  INDEX idx_invoices_client (client_id)
);

-- ============================================================
-- TABLE: invoice_items
-- ============================================================
CREATE TABLE invoice_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id   INT           NOT NULL,
  time_log_id  INT,                               -- link back to time log
  description  VARCHAR(255)  NOT NULL,
  hours        DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
  rate         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  amount       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (invoice_id)  REFERENCES invoices(id)   ON DELETE CASCADE,
  FOREIGN KEY (time_log_id) REFERENCES time_logs(id)  ON DELETE SET NULL
);
```

---

## 6. BACKEND — COMPLETE SETUP

### 6.1 package.json
```json
{
  "name": "freelanceflow-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.1",
    "express": "^4.18.2",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "mysql2": "^3.9.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.3"
  }
}
```

### 6.2 server.js
```javascript
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
require('dotenv').config();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/clients',    require('./routes/clientRoutes'));
app.use('/api/projects',   require('./routes/projectRoutes'));
app.use('/api/tasks',      require('./routes/taskRoutes'));
app.use('/api/timelogs',   require('./routes/timeLogRoutes'));
app.use('/api/invoices',   require('./routes/invoiceRoutes'));
app.use('/api/dashboard',  require('./routes/dashboardRoutes'));
app.use('/api/seed',       require('./routes/seederRoutes'));

// ── Global error handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
```

### 6.3 config/db.js
```javascript
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'freelanceflow',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
});

// Test connection on startup
pool.getConnection((err, conn) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ MySQL connected');
  conn.release();
});

module.exports = pool.promise(); // Use promise-based API
```

### 6.4 middleware/authMiddleware.js
```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  // { id, email, plan }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};
```

### 6.5 middleware/tierMiddleware.js
```javascript
const db = require('../config/db');

// Blocks free-plan users from adding more than 2 clients
const checkFreemiumLimit = async (req, res, next) => {
  try {
    if (req.user.plan === 'pro') return next(); // Pro users: no limit

    const [rows] = await db.query(
      'SELECT COUNT(*) AS total FROM clients WHERE user_id = ?',
      [req.user.id]
    );
    if (rows[0].total >= 2) {
      return res.status(403).json({
        message: 'Free plan allows max 2 clients. Upgrade to Pro for unlimited.',
        upgradeRequired: true,
      });
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { checkFreemiumLimit };
```

### 6.6 controllers/authController.js
```javascript
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 12);
    const colors = ['#4F46E5','#7C3AED','#0891B2','#059669','#D97706','#DC2626'];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, avatar_color) VALUES (?, ?, ?, ?)',
      [name, email, hash, avatarColor]
    );

    const token = jwt.sign(
      { id: result.insertId, email, plan: 'free' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: result.insertId, name, email, plan: 'free', avatarColor },
    });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, plan: user.plan },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, plan: user.plan, avatarColor: user.avatar_color },
    });
  } catch (err) { next(err); }
};

// GET /api/auth/me  (protected)
const getMe = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, plan, avatar_color, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe };
```

### 6.7 controllers/clientController.js
```javascript
// ALL queries scoped to req.user.id — CRITICAL for data isolation
const db = require('../config/db');

const getAllClients = async (req, res, next) => {
  try {
    const [clients] = await db.query(
      `SELECT c.*,
        COUNT(DISTINCT p.id) AS project_count,
        SUM(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) AS active_projects
       FROM clients c
       LEFT JOIN projects p ON p.client_id = c.id AND p.user_id = ?
       WHERE c.user_id = ?
       GROUP BY c.id
       ORDER BY c.created_at DESC`,
      [req.user.id, req.user.id]
    );
    res.json(clients);
  } catch (err) { next(err); }
};

const getClientById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM clients WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Client not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const createClient = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, hourly_rate, currency, notes } = req.body;
    const [result] = await db.query(
      `INSERT INTO clients (user_id, name, email, phone, company, address, hourly_rate, currency, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, email, phone, company, address, hourly_rate || 0, currency || 'INR', notes]
    );
    const [created] = await db.query('SELECT * FROM clients WHERE id = ?', [result.insertId]);
    res.status(201).json(created[0]);
  } catch (err) { next(err); }
};

const updateClient = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, hourly_rate, currency, notes } = req.body;
    await db.query(
      `UPDATE clients SET name=?, email=?, phone=?, company=?, address=?, hourly_rate=?, currency=?, notes=?
       WHERE id = ? AND user_id = ?`,
      [name, email, phone, company, address, hourly_rate, currency, notes, req.params.id, req.user.id]
    );
    const [updated] = await db.query('SELECT * FROM clients WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (updated.length === 0) return res.status(404).json({ message: 'Client not found' });
    res.json(updated[0]);
  } catch (err) { next(err); }
};

const deleteClient = async (req, res, next) => {
  try {
    const [result] = await db.query(
      'DELETE FROM clients WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAllClients, getClientById, createClient, updateClient, deleteClient };
```

### 6.8 controllers/projectController.js
```javascript
const db = require('../config/db');

const getAllProjects = async (req, res, next) => {
  try {
    const { status, client_id } = req.query;
    let query = `
      SELECT p.*, c.name AS client_name, c.company AS client_company, c.hourly_rate,
        COUNT(DISTINCT t.id) AS task_count,
        COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) AS done_tasks,
        COALESCE(SUM(tl.duration_minutes), 0) AS total_minutes,
        COALESCE(SUM(tl.amount), 0) AS total_billed_amount
      FROM projects p
      JOIN clients c ON c.id = p.client_id
      LEFT JOIN tasks t ON t.project_id = p.id
      LEFT JOIN time_logs tl ON tl.project_id = p.id AND tl.end_time IS NOT NULL
      WHERE p.user_id = ?`;
    const params = [req.user.id];

    if (status)    { query += ' AND p.status = ?';    params.push(status); }
    if (client_id) { query += ' AND p.client_id = ?'; params.push(client_id); }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC';

    const [projects] = await db.query(query, params);

    // Compute burn rate percentage for each project
    const enriched = projects.map(p => ({
      ...p,
      burn_rate_pct: p.budget > 0 ? Math.min(100, Math.round((p.total_billed_amount / p.budget) * 100)) : 0,
    }));

    res.json(enriched);
  } catch (err) { next(err); }
};

const getProjectById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.name AS client_name, c.company AS client_company, c.hourly_rate, c.currency
       FROM projects p JOIN clients c ON c.id = p.client_id
       WHERE p.id = ? AND p.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Project not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

const createProject = async (req, res, next) => {
  try {
    const { client_id, name, description, status, budget, start_date, end_date, color } = req.body;
    // Verify client belongs to user
    const [client] = await db.query('SELECT id FROM clients WHERE id = ? AND user_id = ?', [client_id, req.user.id]);
    if (client.length === 0) return res.status(404).json({ message: 'Client not found' });

    const [result] = await db.query(
      `INSERT INTO projects (user_id, client_id, name, description, status, budget, start_date, end_date, color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, client_id, name, description, status || 'active', budget || 0, start_date, end_date, color || '#4F46E5']
    );
    const [created] = await db.query('SELECT * FROM projects WHERE id = ?', [result.insertId]);
    res.status(201).json(created[0]);
  } catch (err) { next(err); }
};

const updateProject = async (req, res, next) => {
  try {
    const { name, description, status, budget, start_date, end_date, color } = req.body;
    const [result] = await db.query(
      `UPDATE projects SET name=?, description=?, status=?, budget=?, start_date=?, end_date=?, color=?
       WHERE id = ? AND user_id = ?`,
      [name, description, status, budget, start_date, end_date, color, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Project not found' });
    const [updated] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) { next(err); }
};

const deleteProject = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM projects WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
};

module.exports = { getAllProjects, getProjectById, createProject, updateProject, deleteProject };
```

### 6.9 controllers/taskController.js
```javascript
const db = require('../config/db');

const getTasksByProject = async (req, res, next) => {
  try {
    const [tasks] = await db.query(
      `SELECT t.* FROM tasks t
       JOIN projects p ON p.id = t.project_id
       WHERE t.project_id = ? AND t.user_id = ? AND p.user_id = ?
       ORDER BY
         FIELD(t.priority, 'urgent','high','medium','low'),
         t.due_date ASC`,
      [req.params.projectId, req.user.id, req.user.id]
    );
    res.json(tasks);
  } catch (err) { next(err); }
};

const getAllTasks = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    let query = `
      SELECT t.*, p.name AS project_name, c.name AS client_name
      FROM tasks t
      JOIN projects p ON p.id = t.project_id
      JOIN clients c ON c.id = p.client_id
      WHERE t.user_id = ?`;
    const params = [req.user.id];
    if (status)   { query += ' AND t.status = ?';   params.push(status); }
    if (priority) { query += ' AND t.priority = ?'; params.push(priority); }
    query += ' ORDER BY FIELD(t.priority,"urgent","high","medium","low"), t.due_date ASC';

    const [tasks] = await db.query(query, params);
    res.json(tasks);
  } catch (err) { next(err); }
};

const createTask = async (req, res, next) => {
  try {
    const { project_id, title, description, status, priority, due_date } = req.body;
    const [proj] = await db.query('SELECT id FROM projects WHERE id = ? AND user_id = ?', [project_id, req.user.id]);
    if (proj.length === 0) return res.status(404).json({ message: 'Project not found' });

    const [result] = await db.query(
      'INSERT INTO tasks (project_id, user_id, title, description, status, priority, due_date) VALUES (?,?,?,?,?,?,?)',
      [project_id, req.user.id, title, description, status || 'todo', priority || 'medium', due_date]
    );
    const [created] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(created[0]);
  } catch (err) { next(err); }
};

const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, due_date } = req.body;
    const [result] = await db.query(
      'UPDATE tasks SET title=?, description=?, status=?, priority=?, due_date=? WHERE id=? AND user_id=?',
      [title, description, status, priority, due_date, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Task not found' });
    const [updated] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) { next(err); }
};

const deleteTask = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};

module.exports = { getTasksByProject, getAllTasks, createTask, updateTask, deleteTask };
```

### 6.10 controllers/timeLogController.js
```javascript
const db = require('../config/db');

// Start a new timer session
const startTimer = async (req, res, next) => {
  try {
    const { project_id, task_id, description } = req.body;

    // Check no timer already running
    const [running] = await db.query(
      'SELECT id FROM time_logs WHERE user_id = ? AND end_time IS NULL',
      [req.user.id]
    );
    if (running.length > 0) {
      return res.status(400).json({ message: 'A timer is already running. Stop it first.' });
    }

    // Get project's hourly rate
    const [proj] = await db.query(
      `SELECT p.id, c.hourly_rate FROM projects p
       JOIN clients c ON c.id = p.client_id
       WHERE p.id = ? AND p.user_id = ?`,
      [project_id, req.user.id]
    );
    if (proj.length === 0) return res.status(404).json({ message: 'Project not found' });

    const [result] = await db.query(
      'INSERT INTO time_logs (user_id, project_id, task_id, description, start_time, hourly_rate) VALUES (?,?,?,?,NOW(),?)',
      [req.user.id, project_id, task_id || null, description || null, proj[0].hourly_rate]
    );
    const [log] = await db.query('SELECT * FROM time_logs WHERE id = ?', [result.insertId]);
    res.status(201).json(log[0]);
  } catch (err) { next(err); }
};

// Stop the running timer
const stopTimer = async (req, res, next) => {
  try {
    const [running] = await db.query(
      'SELECT * FROM time_logs WHERE user_id = ? AND end_time IS NULL',
      [req.user.id]
    );
    if (running.length === 0) return res.status(400).json({ message: 'No timer running' });

    const log = running[0];
    await db.query('UPDATE time_logs SET end_time = NOW() WHERE id = ?', [log.id]);
    const [updated] = await db.query('SELECT * FROM time_logs WHERE id = ?', [log.id]);
    res.json(updated[0]);
  } catch (err) { next(err); }
};

// Manual entry (no timer)
const addManualEntry = async (req, res, next) => {
  try {
    const { project_id, task_id, description, start_time, end_time, hourly_rate } = req.body;

    const [proj] = await db.query(
      'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      [project_id, req.user.id]
    );
    if (proj.length === 0) return res.status(404).json({ message: 'Project not found' });

    const [result] = await db.query(
      `INSERT INTO time_logs (user_id, project_id, task_id, description, start_time, end_time, hourly_rate, is_manual)
       VALUES (?,?,?,?,?,?,?,1)`,
      [req.user.id, project_id, task_id || null, description, start_time, end_time, hourly_rate]
    );
    const [log] = await db.query('SELECT * FROM time_logs WHERE id = ?', [result.insertId]);
    res.status(201).json(log[0]);
  } catch (err) { next(err); }
};

// Get running timer (if any)
const getRunningTimer = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT tl.*, p.name AS project_name
       FROM time_logs tl
       JOIN projects p ON p.id = tl.project_id
       WHERE tl.user_id = ? AND tl.end_time IS NULL`,
      [req.user.id]
    );
    res.json(rows[0] || null);
  } catch (err) { next(err); }
};

// All logs for a project
const getLogsByProject = async (req, res, next) => {
  try {
    const [logs] = await db.query(
      `SELECT tl.*, t.title AS task_title
       FROM time_logs tl
       LEFT JOIN tasks t ON t.id = tl.task_id
       WHERE tl.project_id = ? AND tl.user_id = ?
         AND tl.end_time IS NOT NULL
       ORDER BY tl.start_time DESC`,
      [req.params.projectId, req.user.id]
    );
    res.json(logs);
  } catch (err) { next(err); }
};

// All logs for the user
const getAllLogs = async (req, res, next) => {
  try {
    const { project_id, is_billed } = req.query;
    let query = `
      SELECT tl.*, p.name AS project_name, c.name AS client_name, t.title AS task_title
      FROM time_logs tl
      JOIN projects p ON p.id = tl.project_id
      JOIN clients c ON c.id = p.client_id
      LEFT JOIN tasks t ON t.id = tl.task_id
      WHERE tl.user_id = ? AND tl.end_time IS NOT NULL`;
    const params = [req.user.id];
    if (project_id) { query += ' AND tl.project_id = ?'; params.push(project_id); }
    if (is_billed !== undefined) { query += ' AND tl.is_billed = ?'; params.push(is_billed); }
    query += ' ORDER BY tl.start_time DESC';

    const [logs] = await db.query(query, params);
    res.json(logs);
  } catch (err) { next(err); }
};

const deleteLog = async (req, res, next) => {
  try {
    const [result] = await db.query(
      'DELETE FROM time_logs WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Log not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};

module.exports = { startTimer, stopTimer, addManualEntry, getRunningTimer, getLogsByProject, getAllLogs, deleteLog };
```

### 6.11 controllers/invoiceController.js
```javascript
const db = require('../config/db');
const { generateInvoiceNumber } = require('../utils/invoiceNumber');

// Create invoice from unbilled logs
const createInvoice = async (req, res, next) => {
  try {
    const { client_id, time_log_ids, due_date, tax_rate, notes } = req.body;

    if (!time_log_ids || time_log_ids.length === 0) {
      return res.status(400).json({ message: 'Select at least one time log' });
    }

    // Validate all logs belong to user + client + are unbilled
    const placeholders = time_log_ids.map(() => '?').join(',');
    const [logs] = await db.query(
      `SELECT tl.* FROM time_logs tl
       JOIN projects p ON p.id = tl.project_id
       WHERE tl.id IN (${placeholders})
         AND tl.user_id = ?
         AND p.client_id = ?
         AND tl.is_billed = 0
         AND tl.end_time IS NOT NULL`,
      [...time_log_ids, req.user.id, client_id]
    );

    if (logs.length !== time_log_ids.length) {
      return res.status(400).json({ message: 'Some logs are invalid or already billed' });
    }

    const subtotal   = logs.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);
    const tax        = (subtotal * (tax_rate || 18)) / 100;
    const total      = subtotal + tax;
    const invoiceNum = await generateInvoiceNumber(req.user.id, db);

    const [inv] = await db.query(
      `INSERT INTO invoices (user_id, client_id, invoice_number, issue_date, due_date, subtotal, tax_rate, tax_amount, total, notes)
       VALUES (?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?)`,
      [req.user.id, client_id, invoiceNum, due_date, subtotal, tax_rate || 18, tax, total, notes]
    );

    // Insert invoice items
    for (const log of logs) {
      const hours = (log.duration_minutes || 0) / 60;
      await db.query(
        'INSERT INTO invoice_items (invoice_id, time_log_id, description, hours, rate, amount) VALUES (?,?,?,?,?,?)',
        [inv.insertId, log.id, log.description || 'Development work', hours.toFixed(2), log.hourly_rate, log.amount]
      );
    }

    // Mark logs as billed
    await db.query(
      `UPDATE time_logs SET is_billed = 1 WHERE id IN (${placeholders})`,
      time_log_ids
    );

    const [created] = await db.query('SELECT * FROM invoices WHERE id = ?', [inv.insertId]);
    res.status(201).json(created[0]);
  } catch (err) { next(err); }
};

const getAllInvoices = async (req, res, next) => {
  try {
    const [invoices] = await db.query(
      `SELECT i.*, c.name AS client_name, c.company AS client_company
       FROM invoices i JOIN clients c ON c.id = i.client_id
       WHERE i.user_id = ?
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    res.json(invoices);
  } catch (err) { next(err); }
};

const getInvoiceById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT i.*, c.name AS client_name, c.email AS client_email,
              c.company AS client_company, c.address AS client_address, c.currency
       FROM invoices i JOIN clients c ON c.id = i.client_id
       WHERE i.id = ? AND i.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Invoice not found' });

    const [items] = await db.query(
      'SELECT * FROM invoice_items WHERE invoice_id = ?',
      [req.params.id]
    );
    res.json({ ...rows[0], items });
  } catch (err) { next(err); }
};

const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const [result] = await db.query(
      'UPDATE invoices SET status = ? WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Status updated', status });
  } catch (err) { next(err); }
};

const deleteInvoice = async (req, res, next) => {
  try {
    // Un-bill the time logs associated with this invoice
    await db.query(
      `UPDATE time_logs SET is_billed = 0
       WHERE id IN (SELECT time_log_id FROM invoice_items WHERE invoice_id = ?)`,
      [req.params.id]
    );
    await db.query('DELETE FROM invoices WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Invoice deleted' });
  } catch (err) { next(err); }
};

module.exports = { createInvoice, getAllInvoices, getInvoiceById, updateInvoiceStatus, deleteInvoice };
```

### 6.12 controllers/dashboardController.js
```javascript
const db = require('../config/db');

const getStats = async (req, res, next) => {
  try {
    const uid = req.user.id;

    const [[{ active_projects }]] = await db.query(
      "SELECT COUNT(*) AS active_projects FROM projects WHERE user_id=? AND status='active'", [uid]);

    const [[{ pending_invoices, pending_amount }]] = await db.query(
      "SELECT COUNT(*) AS pending_invoices, COALESCE(SUM(total),0) AS pending_amount FROM invoices WHERE user_id=? AND status IN ('sent','overdue')", [uid]);

    const [[{ total_revenue }]] = await db.query(
      "SELECT COALESCE(SUM(total),0) AS total_revenue FROM invoices WHERE user_id=? AND status='paid'", [uid]);

    const [[{ overdue_tasks }]] = await db.query(
      "SELECT COUNT(*) AS overdue_tasks FROM tasks WHERE user_id=? AND status!='done' AND due_date < CURDATE()", [uid]);

    res.json({ active_projects, pending_invoices, pending_amount, total_revenue, overdue_tasks });
  } catch (err) { next(err); }
};

// Monthly revenue for the last 12 months
const getRevenueChart = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT DATE_FORMAT(issue_date, '%b %Y') AS month,
              DATE_FORMAT(issue_date, '%Y-%m') AS sort_key,
              SUM(total) AS revenue
       FROM invoices
       WHERE user_id = ? AND status = 'paid'
         AND issue_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY sort_key, month
       ORDER BY sort_key ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// Project status distribution for donut chart
const getProjectStatusChart = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT status, COUNT(*) AS count FROM projects WHERE user_id = ? GROUP BY status',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

module.exports = { getStats, getRevenueChart, getProjectStatusChart };
```

### 6.13 utils/invoiceNumber.js
```javascript
const generateInvoiceNumber = async (userId, db) => {
  const year = new Date().getFullYear();
  const [[{ count }]] = await db.query(
    'SELECT COUNT(*) AS count FROM invoices WHERE user_id = ? AND YEAR(created_at) = ?',
    [userId, year]
  );
  const seq = String(count + 1).padStart(4, '0');
  return `INV-${year}-${seq}`;
};

module.exports = { generateInvoiceNumber };
```

### 6.14 All Routes Files

**routes/authRoutes.js**
```javascript
const router = require('express').Router();
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        auth, getMe);

module.exports = router;
```

**routes/clientRoutes.js**
```javascript
const router = require('express').Router();
const ctrl   = require('../controllers/clientController');
const auth   = require('../middleware/authMiddleware');
const { checkFreemiumLimit } = require('../middleware/tierMiddleware');

router.use(auth);
router.get('/',    ctrl.getAllClients);
router.get('/:id', ctrl.getClientById);
router.post('/',   checkFreemiumLimit, ctrl.createClient);
router.put('/:id', ctrl.updateClient);
router.delete('/:id', ctrl.deleteClient);

module.exports = router;
```

**routes/projectRoutes.js**
```javascript
const router = require('express').Router();
const ctrl   = require('../controllers/projectController');
const auth   = require('../middleware/authMiddleware');

router.use(auth);
router.get('/',     ctrl.getAllProjects);
router.get('/:id',  ctrl.getProjectById);
router.post('/',    ctrl.createProject);
router.put('/:id',  ctrl.updateProject);
router.delete('/:id', ctrl.deleteProject);

module.exports = router;
```

**routes/taskRoutes.js**
```javascript
const router = require('express').Router();
const ctrl   = require('../controllers/taskController');
const auth   = require('../middleware/authMiddleware');

router.use(auth);
router.get('/',                       ctrl.getAllTasks);
router.get('/project/:projectId',     ctrl.getTasksByProject);
router.post('/',                      ctrl.createTask);
router.put('/:id',                    ctrl.updateTask);
router.delete('/:id',                 ctrl.deleteTask);

module.exports = router;
```

**routes/timeLogRoutes.js**
```javascript
const router = require('express').Router();
const ctrl   = require('../controllers/timeLogController');
const auth   = require('../middleware/authMiddleware');

router.use(auth);
router.get('/',                       ctrl.getAllLogs);
router.get('/running',                ctrl.getRunningTimer);
router.get('/project/:projectId',     ctrl.getLogsByProject);
router.post('/start',                 ctrl.startTimer);
router.post('/stop',                  ctrl.stopTimer);
router.post('/manual',                ctrl.addManualEntry);
router.delete('/:id',                 ctrl.deleteLog);

module.exports = router;
```

**routes/invoiceRoutes.js**
```javascript
const router = require('express').Router();
const ctrl   = require('../controllers/invoiceController');
const auth   = require('../middleware/authMiddleware');

router.use(auth);
router.get('/',           ctrl.getAllInvoices);
router.get('/:id',        ctrl.getInvoiceById);
router.post('/',          ctrl.createInvoice);
router.patch('/:id/status', ctrl.updateInvoiceStatus);
router.delete('/:id',     ctrl.deleteInvoice);

module.exports = router;
```

**routes/dashboardRoutes.js**
```javascript
const router = require('express').Router();
const ctrl   = require('../controllers/dashboardController');
const auth   = require('../middleware/authMiddleware');

router.use(auth);
router.get('/stats',           ctrl.getStats);
router.get('/revenue-chart',   ctrl.getRevenueChart);
router.get('/project-status',  ctrl.getProjectStatusChart);

module.exports = router;
```

---

## 7. FRONTEND — COMPLETE SETUP

### 7.1 package.json
```json
{
  "name": "freelanceflow-frontend",
  "version": "1.0.0",
  "dependencies": {
    "axios":           "^1.6.7",
    "date-fns":        "^3.3.1",
    "jspdf":           "^2.5.1",
    "jspdf-autotable": "^3.8.2",
    "react":           "^18.2.0",
    "react-dom":       "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-icons":     "^5.0.1",
    "react-router-dom":"^6.22.0",
    "react-scripts":   "5.0.1",
    "recharts":        "^2.12.0"
  }
}
```

### 7.2 index.js
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/variables.css';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
```

### 7.3 index.css (Global resets only)
```css
/* src/index.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-sans);
  font-size:   var(--text-base);
  color:       var(--color-text-primary);
  background:  var(--color-bg);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a { text-decoration: none; color: inherit; }
button { cursor: pointer; font-family: inherit; }
input, select, textarea {
  font-family: inherit;
  font-size: var(--text-base);
}
img { max-width: 100%; }
ul { list-style: none; }

/* Scrollbar */
::-webkit-scrollbar       { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 999px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-border-hover); }
```

### 7.4 App.jsx
```javascript
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider }  from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import ProtectedRoute    from './components/ProtectedRoute/ProtectedRoute';
import Layout            from './components/Layout/Layout';

import Login        from './pages/Login/Login';
import Register     from './pages/Register/Register';
import Dashboard    from './pages/Dashboard/Dashboard';
import Clients      from './pages/Clients/Clients';
import ClientDetail from './pages/ClientDetail/ClientDetail';
import Projects     from './pages/Projects/Projects';
import ProjectDetail from './pages/ProjectDetail/ProjectDetail';
import Tasks        from './pages/Tasks/Tasks';
import TimeTracking from './pages/TimeTracking/TimeTracking';
import Invoices     from './pages/Invoices/Invoices';
import InvoiceDetail from './pages/InvoiceDetail/InvoiceDetail';
import Settings     from './pages/Settings/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TimerProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
              },
              success: { iconTheme: { primary: 'var(--color-success)', secondary: '#fff' } },
              error:   { iconTheme: { primary: 'var(--color-danger)',  secondary: '#fff' } },
            }}
          />
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index              element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"   element={<Dashboard />} />
              <Route path="clients"     element={<Clients />} />
              <Route path="clients/:id" element={<ClientDetail />} />
              <Route path="projects"    element={<Projects />} />
              <Route path="projects/:id" element={<ProjectDetail />} />
              <Route path="tasks"       element={<Tasks />} />
              <Route path="time-tracking" element={<TimeTracking />} />
              <Route path="invoices"    element={<Invoices />} />
              <Route path="invoices/:id" element={<InvoiceDetail />} />
              <Route path="settings"    element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </TimerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

### 7.5 services/api.js
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ff_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally (token expired → redirect to login)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ff_token');
      localStorage.removeItem('ff_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
```

### 7.6 context/AuthContext.jsx
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => {
    const stored = localStorage.getItem('ff_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token,   setToken]   = useState(() => localStorage.getItem('ff_token') || null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('ff_token', data.token);
      localStorage.setItem('ff_user',  JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('ff_token', data.token);
      localStorage.setItem('ff_user',  JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    localStorage.removeItem('ff_timer');  // clear any running timer
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
```

### 7.7 context/TimerContext.jsx
```javascript
// Persistent stopwatch — survives page refresh via localStorage
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const TimerContext = createContext(null);

export const TimerProvider = ({ children }) => {
  // Persisted state shape: { logId, projectId, projectName, startTime (ISO string), description }
  const [timerData,    setTimerData]    = useState(() => {
    const stored = localStorage.getItem('ff_timer');
    return stored ? JSON.parse(stored) : null;
  });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef(null);

  const isRunning = Boolean(timerData);

  // Tick every second
  useEffect(() => {
    if (timerData) {
      const startMs = new Date(timerData.startTime).getTime();
      const tick = () => {
        setElapsedSeconds(Math.floor((Date.now() - startMs) / 1000));
      };
      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
      setElapsedSeconds(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerData]);

  const start = async ({ projectId, projectName, taskId, description }) => {
    try {
      const { data } = await api.post('/timelogs/start', { project_id: projectId, task_id: taskId, description });
      const payload = {
        logId: data.id,
        projectId,
        projectName,
        startTime: data.start_time,
        description,
      };
      localStorage.setItem('ff_timer', JSON.stringify(payload));
      setTimerData(payload);
      toast.success(`Timer started — ${projectName}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start timer');
    }
  };

  const stop = async () => {
    try {
      const { data } = await api.post('/timelogs/stop');
      localStorage.removeItem('ff_timer');
      setTimerData(null);
      const mins = data.duration_minutes || 0;
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      toast.success(`Timer stopped — ${h}h ${m}m logged`);
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not stop timer');
    }
  };

  const formatElapsed = () => {
    const h = Math.floor(elapsedSeconds / 3600);
    const m = Math.floor((elapsedSeconds % 3600) / 60);
    const s = elapsedSeconds % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  return (
    <TimerContext.Provider value={{ isRunning, timerData, elapsedSeconds, formatElapsed, start, stop }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
export default TimerContext;
```

### 7.8 components/ProtectedRoute/ProtectedRoute.jsx
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
```

---

## 8. PAGE-BY-PAGE SPECIFICATIONS

### 8.1 Login Page (`pages/Login/Login.jsx` + `Login.css`)

**Layout:** Full-page split — left panel (brand/gradient), right panel (form). NO sidebar.

**JSX Structure:**
```
<div class="login-page">
  <div class="login-left">            ← gradient bg, logo, tagline
  <div class="login-right">           ← white, centered form
    <h1>Welcome back</h1>
    <p>Sign in to FreelanceFlow</p>
    <form>
      email input
      password input (toggle show/hide)
      error message div
      submit button (shows spinner while loading)
    </form>
    <p>Don't have an account? → /register link</p>
```

**CSS Highlights:**
```css
.login-page { display: flex; height: 100vh; }
.login-left  { flex: 1; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 60px; display: flex; flex-direction: column; justify-content: center; color: white; }
.login-right { width: 500px; display: flex; flex-direction: column; justify-content: center; padding: 60px; background: var(--color-surface); }
.login-input { width: 100%; padding: 12px 16px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: var(--text-base); transition: var(--transition-fast); outline: none; }
.login-input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-light); }
.login-btn { width: 100%; padding: 13px; background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-md); font-size: var(--text-base); font-weight: 600; transition: var(--transition-fast); }
.login-btn:hover { background: var(--color-primary-hover); }
```

---

### 8.2 Register Page (`pages/Register/Register.jsx` + `Register.css`)
Same layout as Login. Additional "Full Name" field. Same CSS pattern. On success → navigate to `/dashboard`.

---

### 8.3 Layout Component (`components/Layout/Layout.jsx` + `Layout.css`)

**This is the main shell wrapping all protected pages.**

```
<div class="app-layout">
  <Sidebar />                      ← 260px fixed left
  <div class="app-main">
    <Navbar />                     ← 64px top bar
    <main class="app-content">
      <Outlet />                   ← page renders here
    </main>
  </div>
</div>
```

```css
.app-layout { display: flex; height: 100vh; overflow: hidden; }
.app-main   { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.app-content { flex: 1; overflow-y: auto; padding: var(--space-8); background: var(--color-bg); }
```

---

### 8.4 Sidebar (`components/Sidebar/Sidebar.jsx` + `Sidebar.css`)

**Contains:** Logo, nav links, Timer widget at bottom.

**Nav Links:**
```
/dashboard     → FiGrid         "Dashboard"
/clients       → FiUsers        "Clients"
/projects      → FiBriefcase    "Projects"
/tasks         → FiCheckSquare  "Tasks"
/time-tracking → FiClock        "Time Tracking"
/invoices      → FiFileText     "Invoices"
/settings      → FiSettings     "Settings"
```

```css
.sidebar { width: var(--sidebar-width); height: 100vh; background: var(--color-sidebar-bg); display: flex; flex-direction: column; position: fixed; left: 0; top: 0; z-index: 100; }
.sidebar-logo { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.sidebar-logo h2 { color: #fff; font-size: var(--text-xl); font-weight: 700; }
.sidebar-logo span { color: var(--color-primary); }   /* "Flow" in brand color */
.sidebar-nav { flex: 1; padding: 12px 12px; overflow-y: auto; }
.nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: var(--radius-md); color: var(--color-sidebar-text); font-size: var(--text-sm); font-weight: 500; transition: var(--transition-fast); margin-bottom: 2px; }
.nav-item:hover  { background: var(--color-sidebar-hover); color: #fff; }
.nav-item.active { background: var(--color-primary); color: #fff; }
.nav-item svg    { width: 18px; height: 18px; flex-shrink: 0; }
.sidebar-footer  { padding: 16px; border-top: 1px solid rgba(255,255,255,0.08); }
```

---

### 8.5 Navbar (`components/Navbar/Navbar.jsx` + `Navbar.css`)

**Contains:** Page title (dynamic), right-side user avatar + dropdown (logout).

```css
.navbar { height: var(--topbar-height); background: var(--color-surface); border-bottom: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between; padding: 0 var(--space-8); }
.navbar-title { font-size: var(--text-xl); font-weight: 700; color: var(--color-text-primary); }
.user-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: var(--text-sm); color: #fff; cursor: pointer; }
```

---

### 8.6 Timer Component (`components/Timer/Timer.jsx` + `Timer.css`)

Lives in the Sidebar footer. Shows current elapsed time and project name when running.

```
State A (idle):   [▶ Start Timer] button + project selector dropdown
State B (running): [⬛ 00:23:45  "Project Name"] with pulsing red dot
```

```css
.timer-widget { background: rgba(255,255,255,0.06); border-radius: var(--radius-md); padding: 12px; }
.timer-display { font-size: var(--text-lg); font-weight: 700; color: #fff; font-variant-numeric: tabular-nums; font-family: var(--font-mono); }
.timer-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-danger); animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }
```

---

### 8.7 Dashboard Page (`pages/Dashboard/Dashboard.jsx` + `Dashboard.css`)

**Sections:**
1. **Header:** "Good morning, [Name] 👋" + date
2. **Stats Row (4 cards):**
   - Active Projects (green icon)
   - Pending Invoices (amber icon + amount)
   - Total Revenue (indigo icon)
   - Overdue Tasks (red icon)
3. **Revenue Bar Chart (Recharts):** Last 12 months paid invoices
4. **Two columns below:**
   - Left: Recent Projects (last 5 active projects)
   - Right: Upcoming Deadlines (next 5 tasks by due_date)
5. **Load Sample Data button** (only shown when no data exists)

**Recharts RevenueChart:**
```javascript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={280}>
  <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
    <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
    <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']} />
    <Bar dataKey="revenue" fill="var(--color-primary)" radius={[6,6,0,0]} />
  </BarChart>
</ResponsiveContainer>
```

---

### 8.8 Clients Page (`pages/Clients/Clients.jsx` + `Clients.css`)

**Layout:** Page header + "Add Client" button. Cards grid.

**ClientCard shows:** Avatar (initials + color), Name, Company, Email, Hourly Rate, # Projects badge, action buttons (Edit / Delete).

**Add/Edit Client Modal fields:**
- Name* (required)
- Company
- Email
- Phone
- Address (textarea)
- Hourly Rate* (number)
- Currency (INR / USD / EUR)
- Notes

**Freemium warning:** If user is on Free plan and has 2 clients, show a locked badge and upgrade modal instead of "Add Client" button.

---

### 8.9 Projects Page (`pages/Projects/Projects.jsx` + `Projects.css`)

**Top:** Filter tabs — All | Active | On Hold | Completed

**ProjectCard shows:**
- Color swatch (left border with project.color)
- Project name + Client name + Company
- Status badge
- Budget + Burn Rate bar:
  ```
  Budget: ₹50,000   Used: ₹23,450 (47%)
  [████████░░░░░░░░] 47%   (green < 70%, amber 70-90%, red > 90%)
  ```
- Task completion: "8/12 tasks"
- End date + overdue warning

**Add/Edit Project Modal fields:**
- Client (dropdown — lists user's clients)
- Project Name*
- Description
- Status (Active / On Hold / Completed / Cancelled)
- Budget* (number)
- Start Date
- End Date
- Color picker (6 preset swatches)

---

### 8.10 Project Detail Page (`pages/ProjectDetail/ProjectDetail.jsx`)

**Tabs inside the page:**
1. **Overview** — Budget gauge, burn rate, total hours
2. **Tasks** — Kanban-style or list, add task form
3. **Time Logs** — list of all logs for this project, total hours
4. **Quick Timer** — start timer for this project directly

---

### 8.11 Tasks Page (`pages/Tasks/Tasks.jsx` + `Tasks.css`)

**Filters:** Status | Priority | Project

**TaskItem row shows:**
- Priority badge (color-coded dot)
- Task title
- Project name → Client name
- Due date (red if overdue, amber if due today)
- Status select dropdown (click to change inline)
- Delete button

---

### 8.12 TimeTracking Page (`pages/TimeTracking/TimeTracking.jsx` + `TimeTracking.css`)

**Two sections:**

**A. Active Timer Card** (if running):
```
[Project Name]           00:23:45
Started at 2:30 PM       [■ Stop]
```

**B. Time Logs Table:**
- Columns: Date | Project | Description | Duration | Rate | Amount | Billed | Actions
- Filter: Project | Billed/Unbilled
- "Add Manual Entry" button → modal

**Manual Entry Modal fields:**
- Project (dropdown)
- Task (optional dropdown filtered by project)
- Description
- Date
- Start Time
- End Time (calculates duration live)
- Hourly Rate (pre-filled from project's client)

---

### 8.13 Invoices Page (`pages/Invoices/Invoices.jsx` + `Invoices.css`)

**Header:** "Invoices" + "Create Invoice" button

**Stats strip:** Total Invoiced | Paid | Pending | Overdue

**Invoice list table:**
- Invoice # | Client | Issue Date | Due Date | Amount | Status | Actions (View / Mark Paid / Delete)

**Status badge colors:**
- draft → blue, sent → amber, paid → green, overdue → red, cancelled → gray

---

### 8.14 Create Invoice (3-Step Wizard — inside Invoices page via modal)

**Step 1 — Select Client & Date Range:**
- Client dropdown
- Date range picker (from / to) — fetches unbilled logs on change

**Step 2 — Review Time Logs:**
- Table of unbilled logs for that client + date range
- Checkboxes to include/exclude each log
- Live subtotal updates as you check/uncheck

**Step 3 — Invoice Details:**
- Due Date
- Tax Rate (default 18%)
- Notes
- **Preview:** Invoice # | Subtotal | Tax | Total
- [Generate Invoice] button

---

### 8.15 Invoice Detail Page (`pages/InvoiceDetail/InvoiceDetail.jsx`)

**Renders a full invoice preview in the browser:**
```
┌────────────────────────────────────────────────────┐
│  FreelanceFlow                    INVOICE           │
│  [Your Name]                   #INV-2024-0001       │
│  your@email.com                Issue: Jan 1, 2024   │
│                                Due:   Jan 31, 2024  │
├────────────────────────────────────────────────────┤
│  BILL TO:                                           │
│  Client Name / Company                              │
│  client@email.com                                   │
├────────────────────────────────────────────────────┤
│  Description         Hours    Rate      Amount      │
│  Development work     3.5h   ₹2000    ₹7,000       │
│  API integration      2.0h   ₹2000    ₹4,000       │
├────────────────────────────────────────────────────┤
│                              Subtotal:  ₹11,000     │
│                              GST 18%:   ₹1,980      │
│                              TOTAL:    ₹12,980      │
└────────────────────────────────────────────────────┘
[Download PDF]  [Mark as Paid]  [Back]
```

---

### 8.16 Settings Page (`pages/Settings/Settings.jsx` + `Settings.css`)

**Sections:**
1. **Profile** — name, email, update form
2. **Change Password** — current, new, confirm
3. **Plan** — shows current plan badge, upgrade card
4. **Danger Zone** — delete account (confirmation dialog)

---

## 9. KEY FEATURE IMPLEMENTATIONS

### 9.1 PDF Invoice Generation (`src/utils/generatePDF.js`)
```javascript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export const generateInvoicePDF = (invoice, userProfile) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const primary = [79, 70, 229];   // #4F46E5 as RGB
  const dark    = [30, 41, 59];
  const gray    = [100, 116, 139];
  const W = doc.internal.pageSize.getWidth();

  // ── Header band ─────────────────────────────────────
  doc.setFillColor(...primary);
  doc.rect(0, 0, W, 38, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FreelanceFlow', 14, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(userProfile.name,  14, 24);
  doc.text(userProfile.email, 14, 30);

  // INVOICE label right side
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', W - 14, 20, { align: 'right' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoice_number, W - 14, 30, { align: 'right' });

  // ── Invoice meta ─────────────────────────────────────
  doc.setTextColor(...dark);
  doc.setFontSize(9);
  doc.text(`Issue Date: ${format(new Date(invoice.issue_date), 'dd MMM yyyy')}`, W - 14, 48, { align: 'right' });
  doc.text(`Due Date:   ${format(new Date(invoice.due_date),  'dd MMM yyyy')}`, W - 14, 54, { align: 'right' });

  // ── Bill To ────────────────────────────────────────
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text('BILL TO', 14, 48);
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.client_name,    14, 56);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  if (invoice.client_company) doc.text(invoice.client_company, 14, 62);
  if (invoice.client_email)   doc.text(invoice.client_email,   14, 68);

  // ── Items table ────────────────────────────────────
  autoTable(doc, {
    startY: 78,
    head: [['Description', 'Hours', 'Rate', 'Amount']],
    body: invoice.items.map(item => [
      item.description,
      `${parseFloat(item.hours).toFixed(2)}h`,
      `₹${parseFloat(item.rate).toFixed(2)}`,
      `₹${parseFloat(item.amount).toFixed(2)}`,
    ]),
    headStyles: {
      fillColor: primary, textColor: [255,255,255], fontStyle: 'bold', fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: dark },
    alternateRowStyles: { fillColor: [248,250,252] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'right', cellWidth: 25 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 35 },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Totals ────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 8;
  const totalsX = W - 80;
  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text('Subtotal', totalsX, finalY);
  doc.setTextColor(...dark);
  doc.text(`₹${parseFloat(invoice.subtotal).toFixed(2)}`, W - 14, finalY, { align: 'right' });

  doc.setTextColor(...gray);
  doc.text(`GST (${invoice.tax_rate}%)`, totalsX, finalY + 7);
  doc.setTextColor(...dark);
  doc.text(`₹${parseFloat(invoice.tax_amount).toFixed(2)}`, W - 14, finalY + 7, { align: 'right' });

  // Total highlight box
  doc.setFillColor(...primary);
  doc.roundedRect(totalsX - 4, finalY + 12, W - totalsX + 4 - 10, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', totalsX, finalY + 21);
  doc.text(`₹${parseFloat(invoice.total).toFixed(2)}`, W - 14, finalY + 21, { align: 'right' });

  // ── Footer ────────────────────────────────────────
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.setFont('helvetica', 'normal');
  if (invoice.notes) {
    doc.text('Notes:', 14, finalY + 36);
    doc.setTextColor(...dark);
    doc.text(invoice.notes, 14, finalY + 42);
  }
  doc.setTextColor(...gray);
  doc.text('Generated by FreelanceFlow', W / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  doc.save(`${invoice.invoice_number}.pdf`);
};
```

### 9.2 Burn Rate Progress Bar (`components/BurnRateBar/BurnRateBar.jsx`)
```javascript
const BurnRateBar = ({ percentage, budget, spent }) => {
  const color = percentage < 70 ? 'var(--color-success)'
              : percentage < 90 ? 'var(--color-warning)'
              : 'var(--color-danger)';
  return (
    <div className="burnrate">
      <div className="burnrate-header">
        <span>Budget: ₹{budget.toLocaleString()}</span>
        <span style={{ color }}>{percentage}% used</span>
      </div>
      <div className="burnrate-track">
        <div className="burnrate-fill" style={{ width: `${percentage}%`, background: color }} />
      </div>
      <span className="burnrate-spent">Spent: ₹{spent.toLocaleString()}</span>
    </div>
  );
};
```

### 9.3 Currency & Duration Formatters (`src/utils/`)
```javascript
// formatCurrency.js
export const formatCurrency = (amount, currency = 'INR') => {
  const symbols = { INR: '₹', USD: '$', EUR: '€' };
  const sym = symbols[currency] || '₹';
  return `${sym}${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// formatDuration.js
export const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// formatDate.js
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  if (isToday(d))    return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'dd MMM yyyy');
};
export const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  return isPast(parseISO(dateStr));
};
```

---

## 10. API ENDPOINT REFERENCE

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ✗ | Register new user |
| POST | `/api/auth/login` | ✗ | Login, returns JWT |
| GET  | `/api/auth/me` | ✓ | Get current user |
| GET  | `/api/clients` | ✓ | All clients (scoped) |
| GET  | `/api/clients/:id` | ✓ | Single client |
| POST | `/api/clients` | ✓ | Create client (freemium check) |
| PUT  | `/api/clients/:id` | ✓ | Update client |
| DELETE | `/api/clients/:id` | ✓ | Delete client |
| GET  | `/api/projects` | ✓ | All projects (with ?status=active) |
| GET  | `/api/projects/:id` | ✓ | Single project |
| POST | `/api/projects` | ✓ | Create project |
| PUT  | `/api/projects/:id` | ✓ | Update project |
| DELETE | `/api/projects/:id` | ✓ | Delete project |
| GET  | `/api/tasks` | ✓ | All tasks (with ?status=&priority=) |
| GET  | `/api/tasks/project/:projectId` | ✓ | Tasks for a project |
| POST | `/api/tasks` | ✓ | Create task |
| PUT  | `/api/tasks/:id` | ✓ | Update task |
| DELETE | `/api/tasks/:id` | ✓ | Delete task |
| GET  | `/api/timelogs` | ✓ | All logs (with ?project_id=&is_billed=) |
| GET  | `/api/timelogs/running` | ✓ | Currently running timer |
| GET  | `/api/timelogs/project/:projectId` | ✓ | Logs for project |
| POST | `/api/timelogs/start` | ✓ | Start timer |
| POST | `/api/timelogs/stop` | ✓ | Stop timer |
| POST | `/api/timelogs/manual` | ✓ | Manual time entry |
| DELETE | `/api/timelogs/:id` | ✓ | Delete log |
| GET  | `/api/invoices` | ✓ | All invoices |
| GET  | `/api/invoices/:id` | ✓ | Invoice + items |
| POST | `/api/invoices` | ✓ | Create invoice |
| PATCH | `/api/invoices/:id/status` | ✓ | Update status |
| DELETE | `/api/invoices/:id` | ✓ | Delete (un-bills logs) |
| GET  | `/api/dashboard/stats` | ✓ | Summary stats |
| GET  | `/api/dashboard/revenue-chart` | ✓ | Monthly revenue data |
| GET  | `/api/dashboard/project-status` | ✓ | Project status counts |
| POST | `/api/seed` | ✓ | Load sample data |

---

## 11. ENVIRONMENT VARIABLES

**backend/.env**
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=freelanceflow
JWT_SECRET=freelanceflow_jwt_super_secret_2024_change_this
JWT_EXPIRES_IN=7d
```

**frontend/.env** (in `frontend/` root)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 12. XAMPP CONFIGURATION

### Step-by-step XAMPP setup:
1. Open XAMPP Control Panel → Start **Apache** + **MySQL**
2. Open browser → `http://localhost/phpmyadmin`
3. Click **New** → Database name: `freelanceflow` → Collation: `utf8mb4_unicode_ci` → Create
4. Click `freelanceflow` → **SQL tab** → paste the full SQL from Section 5 → **Go**
5. Verify all 7 tables are created

### Running the project:
```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev          # nodemon → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm install
npm start            # CRA → http://localhost:3000
```

### Common XAMPP issues:
- Port 3306 conflict → change `DB_PORT` in `.env`
- MySQL root has a password → set `DB_PASSWORD` in `.env`
- CORS error → verify `origin: 'http://localhost:3000'` in `server.js`

---

## 13. SAMPLE DATA SEEDER

**backend/controllers/seederController.js**
```javascript
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const loadSampleData = async (req, res, next) => {
  const uid = req.user.id;
  try {
    // 2 Sample Clients
    const [c1] = await db.query(
      `INSERT INTO clients (user_id, name, email, company, hourly_rate, currency)
       VALUES (?, 'Rahul Sharma', 'rahul@techcorp.in', 'TechCorp India', 2500, 'INR')`,
      [uid]
    );
    const [c2] = await db.query(
      `INSERT INTO clients (user_id, name, email, company, hourly_rate, currency)
       VALUES (?, 'Priya Mehta', 'priya@startup.io', 'StartupIO', 3000, 'INR')`,
      [uid]
    );

    // 3 Sample Projects
    const [p1] = await db.query(
      `INSERT INTO projects (user_id, client_id, name, description, status, budget, start_date, end_date, color)
       VALUES (?, ?, 'E-Commerce Website', 'Full-stack online store', 'active', 150000, '2024-01-01', '2024-03-31', '#4F46E5')`,
      [uid, c1.insertId]
    );
    const [p2] = await db.query(
      `INSERT INTO projects (user_id, client_id, name, description, status, budget, start_date, end_date, color)
       VALUES (?, ?, 'Mobile App MVP', 'React Native mobile app', 'active', 200000, '2024-02-01', '2024-05-31', '#7C3AED')`,
      [uid, c2.insertId]
    );
    const [p3] = await db.query(
      `INSERT INTO projects (user_id, client_id, name, description, status, budget, start_date, end_date, color)
       VALUES (?, ?, 'Brand Identity', 'Logo and brand guidelines', 'completed', 50000, '2023-11-01', '2024-01-15', '#0891B2')`,
      [uid, c1.insertId]
    );

    // 6 Sample Tasks
    const tasks = [
      [p1.insertId, uid, 'Design database schema', 'done',     'high',   '2024-01-15'],
      [p1.insertId, uid, 'Build product listing API', 'in_progress', 'high',  '2024-02-20'],
      [p1.insertId, uid, 'Payment gateway integration', 'todo','urgent', '2024-03-10'],
      [p2.insertId, uid, 'User authentication', 'done',        'high',   '2024-02-15'],
      [p2.insertId, uid, 'Dashboard screens', 'in_progress',   'medium', '2024-03-20'],
      [p2.insertId, uid, 'Push notifications', 'todo',         'low',    '2024-05-01'],
    ];
    for (const t of tasks) {
      await db.query(
        'INSERT INTO tasks (project_id, user_id, title, status, priority, due_date) VALUES (?,?,?,?,?,?)', t
      );
    }

    // 8 Sample Time Logs (completed, with historical dates)
    const rate = 2500;
    const logs = [
      [uid, p1.insertId, 'DB design and ERD',         '2024-01-10 09:00:00', '2024-01-10 13:00:00', rate, 1],
      [uid, p1.insertId, 'Backend API setup',         '2024-01-15 10:00:00', '2024-01-15 16:00:00', rate, 1],
      [uid, p1.insertId, 'Frontend React setup',      '2024-01-20 09:00:00', '2024-01-20 14:30:00', rate, 1],
      [uid, p2.insertId, 'Project planning',          '2024-02-01 11:00:00', '2024-02-01 13:00:00', 3000, 1],
      [uid, p2.insertId, 'Auth implementation',       '2024-02-10 09:00:00', '2024-02-10 17:00:00', 3000, 1],
      [uid, p3.insertId, 'Logo design concepts',      '2023-11-10 10:00:00', '2023-11-10 15:00:00', 2500, 1],
      [uid, p3.insertId, 'Brand guidelines doc',      '2023-12-05 09:00:00', '2023-12-05 14:00:00', 2500, 1],
      [uid, p1.insertId, 'Product listing page',      '2024-02-15 09:00:00', '2024-02-15 13:00:00', rate, 0],
    ];
    for (const [u,p,desc,st,et,hr,billed] of logs) {
      await db.query(
        'INSERT INTO time_logs (user_id, project_id, description, start_time, end_time, hourly_rate, is_billed, is_manual) VALUES (?,?,?,?,?,?,?,1)',
        [u, p, desc, st, et, hr, billed]
      );
    }

    // 2 Paid Invoices for charts
    const invNums = [`INV-SEED-001`, `INV-SEED-002`];
    await db.query(
      `INSERT INTO invoices (user_id, client_id, invoice_number, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total)
       VALUES (?, ?, ?, 'paid', '2024-01-31', '2024-02-28', 37500, 18, 6750, 44250)`,
      [uid, c1.insertId, invNums[0]]
    );
    await db.query(
      `INSERT INTO invoices (user_id, client_id, invoice_number, status, issue_date, due_date, subtotal, tax_rate, tax_amount, total)
       VALUES (?, ?, ?, 'paid', '2024-02-28', '2024-03-31', 50000, 18, 9000, 59000)`,
      [uid, c2.insertId, invNums[1]]
    );

    res.json({ message: '✅ Sample data loaded successfully!' });
  } catch (err) { next(err); }
};

module.exports = { loadSampleData };
```

**routes/seederRoutes.js**
```javascript
const router = require('express').Router();
const { loadSampleData } = require('../controllers/seederController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, loadSampleData);
module.exports = router;
```

**Frontend "Load Sample Data" button:**
```javascript
// On Dashboard, inside a useEffect — check if projects.length === 0
// Show a banner:
{projects.length === 0 && (
  <div className="seed-banner">
    <p>No data yet. Load sample data to preview the dashboard!</p>
    <button onClick={handleSeed} className="btn btn-primary">Load Sample Data</button>
  </div>
)}

const handleSeed = async () => {
  await api.post('/seed');
  toast.success('Sample data loaded!');
  // re-fetch stats + projects
};
```

---

## FINAL CHECKLIST BEFORE SUBMISSION

- [ ] Every DB query uses `WHERE user_id = req.user.id` — no data leaks
- [ ] JWT token stored in `localStorage` as `ff_token`
- [ ] Timer state stored in `localStorage` as `ff_timer` (survives refresh)
- [ ] PDF downloads use `invoice.invoice_number` as filename
- [ ] Free plan users blocked at 3rd client (HTTP 403 + upgradeRequired flag)
- [ ] All forms show validation errors inline
- [ ] All CRUD operations fire toast notifications
- [ ] Loading spinners on all async operations
- [ ] Empty states for all list pages
- [ ] Responsive: sidebar collapses on mobile (`@media max-width: 768px`)
- [ ] `npm run build` succeeds with no errors
- [ ] `README.md` includes: setup steps, env variables, DB import instructions

---

*FreelanceFlow Master Prompt — Complete Full-Stack Specification*
*React.js + Node.js/Express + MySQL (XAMPP) | All rights to developer*
