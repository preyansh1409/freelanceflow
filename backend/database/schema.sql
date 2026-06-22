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
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  plan          ENUM('free','pro') NOT NULL DEFAULT 'free',
  avatar_color  VARCHAR(7)    DEFAULT '#4F46E5',
  expertise     VARCHAR(500)  DEFAULT NULL,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE: clients
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
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
CREATE TABLE IF NOT EXISTS projects (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  client_id     INT           NOT NULL,
  name          VARCHAR(150)  NOT NULL,
  description   TEXT,
  status        ENUM('active','on_hold','completed','cancelled') NOT NULL DEFAULT 'active',
  billing_type  ENUM('hourly','fixed') NOT NULL DEFAULT 'hourly',
  duration      VARCHAR(50)   DEFAULT NULL,
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
CREATE TABLE IF NOT EXISTS tasks (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  project_id      INT           NOT NULL,
  user_id         INT           NOT NULL,
  title           VARCHAR(200)  NOT NULL,
  description     TEXT,
  status          ENUM('todo','in_progress','review','done') NOT NULL DEFAULT 'todo',
  priority        ENUM('low','medium','high','urgent')       NOT NULL DEFAULT 'medium',
  estimated_hours DECIMAL(5,2)  DEFAULT NULL,
  due_date        DATE,
  created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_tasks_project (project_id),
  INDEX idx_tasks_user    (user_id)
);

-- ============================================================
-- TABLE: time_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS time_logs (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT           NOT NULL,
  project_id       INT           NOT NULL,
  task_id          INT,
  description      VARCHAR(255),
  start_time       DATETIME      NOT NULL,
  end_time         DATETIME,
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
  is_manual        TINYINT(1)    NOT NULL DEFAULT 0,
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
CREATE TABLE IF NOT EXISTS invoices (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT           NOT NULL,
  client_id      INT           NOT NULL,
  invoice_number VARCHAR(30)   NOT NULL UNIQUE,
  status         ENUM('draft','sent','paid','overdue','cancelled') NOT NULL DEFAULT 'draft',
  issue_date     DATE          NOT NULL,
  due_date       DATE          NOT NULL,
  subtotal       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  tax_rate       DECIMAL(5,2)  NOT NULL DEFAULT 18.00,
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
CREATE TABLE IF NOT EXISTS invoice_items (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id   INT           NOT NULL,
  time_log_id  INT,
  description  VARCHAR(255)  NOT NULL,
  hours        DECIMAL(8,2)  NOT NULL DEFAULT 0.00,
  rate         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  amount       DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (invoice_id)  REFERENCES invoices(id)   ON DELETE CASCADE,
  FOREIGN KEY (time_log_id) REFERENCES time_logs(id)  ON DELETE SET NULL
);
