# FreelanceFlow

A premium Full-Stack SaaS Project Management Tool for Freelancers.

Built using:
- **Backend**: Node.js/Express, MySQL connection pooling, JWT Authentication, bcrypt password hashing.
- **Frontend**: React.js (Vite), Tailwind CSS, Recharts for financials, jsPDF for downloading invoice PDFs, react-router-dom, react-hot-toast.

---

## Folder Structure

```
freelanceflow/
├── backend/
│   ├── config/
│   │   └── db.js                    # MySQL connection pool
│   ├── database/
│   │   └── schema.sql               # Database creation script
│   ├── controllers/                 # Express controllers scoped to req.user.id
│   ├── middleware/                  # JWT check & freemium client limits
│   ├── routes/                      # API routing
│   ├── utils/                       # Invoice number generator
│   ├── server.js                    # Express app entry point
│   └── .env                         # Backend environment variables
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/              # Shared components (Sidebar, Navbar, Timer, etc.)
    │   ├── context/                 # AuthContext & TimerContext
    │   ├── pages/                   # App pages (Dashboard, Clients, Projects, Tasks, etc.)
    │   ├── services/                # Axios instance and API service
    │   ├── utils/                   # PDF builders and formatters
    │   ├── App.jsx                  # Main routing component
    │   ├── index.css                # Tailwind base configurations
    │   └── main.jsx                 # Vite entry point
    └── .env                         # Frontend environment variables
```

---

## Getting Started

### 1. Database Setup (XAMPP MySQL)

1. Open your **XAMPP Control Panel** and start **Apache** and **MySQL**.
2. Navigate to [http://localhost/phpmyadmin](http://localhost/phpmyadmin) in your browser.
3. Click **New** in the sidebar to create a new database:
   - Name: `freelanceflow`
   - Collation: `utf8mb4_unicode_ci`
   - Click **Create**.
4. Select the `freelanceflow` database, go to the **SQL** tab, copy the contents of `backend/database/schema.sql`, paste it, and click **Go**.

---

### 2. Backend Installation & Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify your configuration in the `.env` file (it is pre-configured with default XAMPP settings):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=freelanceflow
   JWT_SECRET=freelanceflow_jwt_super_secret_2026_change_this
   JWT_EXPIRES_IN=7d
   ```
4. Start the backend developer server (runs on port `5000` with auto-reload):
   ```bash
   npm run dev
   ```

---

### 3. Frontend Installation & Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server (runs on `http://localhost:5173` or `http://localhost:3000`):
   ```bash
   npm run dev
   ```

---

## Key Features

1. **Dashboard Analytics**: Visualize paid revenue charts (Recharts) and track active stats.
2. **Freemium Limits Check**: Free users can add at most 2 clients before being prompted to upgrade to Pro.
3. **Persistent Timer Stopwatch**: Start timers for projects; the stopwatch ticks in the Sidebar footer and survives page refreshes.
4. **Task Priorities**: View overdue tasks and transition statuses inline (To Do, In Progress, Review, Completed).
5. **Invoice Billing Wizard**: A 3-step billing wizard that fetches unbilled logs for a client, lets you select items to bill, computes taxes, and generates a downloadable PDF invoice.
