import axios from 'axios';

// ============================================================================
// CLIENT-SIDE MOCK MODE
// Set USE_MOCKS = true to test the full application entirely in the browser 
// without needing XAMPP MySQL running. Set to false to use the real database.
// ============================================================================
const USE_MOCKS = false; 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ff_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally (token expired → redirect to login)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ff_token');
      localStorage.removeItem('ff_user');
      localStorage.removeItem('ff_timer');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Helper to generate mock data structures ────────────────────────────────
const getDemoData = (user) => ({
  user: user || { id: 1, name: "Demo Freelancer", email: "demo@freelanceflow.com", plan: "free", avatarColor: "#4F46E5" },
  clients: [
    { id: 1, name: "Rahul Sharma", email: "rahul@techcorp.in", company: "TechCorp India", phone: "+91 98765 43210", address: "Mumbai, India", hourly_rate: 2500, currency: "INR", notes: "Prefers milestone-based payments", project_count: 2, active_projects: 1, created_at: new Date().toISOString() },
    { id: 2, name: "Priya Mehta", email: "priya@startup.io", company: "StartupIO", phone: "+91 98765 00000", address: "Bangalore, India", hourly_rate: 3000, currency: "INR", notes: "Weekly billing cycles", project_count: 1, active_projects: 1, created_at: new Date().toISOString() }
  ],
  projects: [
    { id: 1, client_id: 1, client_name: "Rahul Sharma", client_company: "TechCorp India", name: "E-Commerce Website", description: "Full-stack online store with payment gateway integration", status: "active", billing_type: "hourly", duration: "3 Months", budget: 150000, start_date: "2024-01-01", end_date: "2024-03-31", color: "#4F46E5", task_count: 3, done_tasks: 1, total_minutes: 600, total_billed_amount: 25000, burn_rate_pct: 17, currency: "INR", created_at: new Date().toISOString() },
    { id: 2, client_id: 2, client_name: "Priya Mehta", client_company: "StartupIO", name: "Mobile App MVP", description: "React Native mobile app for iOS and Android", status: "active", billing_type: "hourly", duration: "4 Months", budget: 200000, start_date: "2024-02-01", end_date: "2024-05-31", color: "#7C3AED", task_count: 3, done_tasks: 1, total_minutes: 480, total_billed_amount: 24000, burn_rate_pct: 12, currency: "INR", created_at: new Date().toISOString() },
    { id: 3, client_id: 1, client_name: "Rahul Sharma", client_company: "TechCorp India", name: "Brand Identity", description: "Logo and brand guidelines doc", status: "completed", billing_type: "fixed", duration: "2 Months", budget: 50000, start_date: "2023-11-01", end_date: "2024-01-15", color: "#0891B2", task_count: 0, done_tasks: 0, total_minutes: 600, total_billed_amount: 50000, burn_rate_pct: 100, currency: "INR", created_at: new Date().toISOString() }
  ],
  tasks: [
    { id: 1, project_id: 1, project_name: "E-Commerce Website", client_name: "Rahul Sharma", title: "Design database schema", description: "Create SQL tables and ER diagram", status: "done", priority: "high", estimated_hours: 10, due_date: "2024-01-15" },
    { id: 2, project_id: 1, project_name: "E-Commerce Website", client_name: "Rahul Sharma", title: "Build product listing API", description: "Implement product retrieval routes", status: "in_progress", priority: "high", estimated_hours: 15, due_date: "2024-02-20" },
    { id: 3, project_id: 1, project_name: "E-Commerce Website", client_name: "Rahul Sharma", title: "Payment gateway integration", description: "Stripe payment testing", status: "todo", priority: "urgent", estimated_hours: 20, due_date: "2024-03-10" },
    { id: 4, project_id: 2, project_name: "Mobile App MVP", client_name: "Priya Mehta", title: "User authentication", description: "Register, login, profile validation", status: "done", priority: "high", estimated_hours: 8, due_date: "2024-02-15" },
    { id: 5, project_id: 2, project_name: "Mobile App MVP", client_name: "Priya Mehta", title: "Dashboard screens", description: "React Native UI implementation", status: "in_progress", priority: "medium", estimated_hours: 25, due_date: "2024-03-20" },
    { id: 6, project_id: 2, project_name: "Mobile App MVP", client_name: "Priya Mehta", title: "Push notifications", description: "Setup Firebase triggers", status: "todo", priority: "low", estimated_hours: 12, due_date: "2024-05-01" },
  ],
  timelogs: [
    { id: 1, project_id: 1, project_name: "E-Commerce Website", client_name: "Rahul Sharma", description: "DB design and ERD", start_time: "2024-01-10T09:00:00.000Z", end_time: "2024-01-10T13:00:00.000Z", duration_minutes: 240, hourly_rate: 2500, amount: 10000, is_billed: 1, is_manual: 1 },
    { id: 2, project_id: 1, project_name: "E-Commerce Website", client_name: "Rahul Sharma", description: "Backend API setup", start_time: "2024-01-15T10:00:00.000Z", end_time: "2024-01-15T16:00:00.000Z", duration_minutes: 360, hourly_rate: 2500, amount: 15000, is_billed: 1, is_manual: 1 },
    { id: 3, project_id: 2, project_name: "Mobile App MVP", client_name: "Priya Mehta", description: "Project planning", start_time: "2024-02-01T11:00:00.000Z", end_time: "2024-02-01T13:00:00.000Z", duration_minutes: 120, hourly_rate: 3000, amount: 6000, is_billed: 1, is_manual: 1 },
    { id: 4, project_id: 2, project_name: "Mobile App MVP", client_name: "Priya Mehta", description: "Auth implementation", start_time: "2024-02-10T09:00:00.000Z", end_time: "2024-02-10T17:00:00.000Z", duration_minutes: 480, hourly_rate: 3000, amount: 24000, is_billed: 1, is_manual: 1 },
  ],
  invoices: [
    { id: 1, client_name: "Rahul Sharma", client_company: "TechCorp India", invoice_number: "INV-SEED-001", status: "paid", issue_date: "2024-01-31", due_date: "2024-02-28", subtotal: 37500, tax_rate: 18, tax_amount: 6750, total: 44250, currency: "INR", items: [] },
    { id: 2, client_name: "Priya Mehta", client_company: "StartupIO", invoice_number: "INV-SEED-002", status: "paid", issue_date: "2024-02-28", due_date: "2024-03-31", subtotal: 50000, tax_rate: 18, tax_amount: 9000, total: 59000, currency: "INR", items: [] }
  ],
  runningTimer: null
});

const getEmptyData = (user) => ({
  user: user || { id: 1, name: "Demo Freelancer", email: "demo@freelanceflow.com", plan: "free", avatarColor: "#4F46E5" },
  clients: [],
  projects: [],
  tasks: [],
  timelogs: [],
  invoices: [],
  runningTimer: null
});

const saveMockDb = (dbState) => {
  localStorage.setItem('ff_mock_db', JSON.stringify(dbState));
};

const loadMockDb = () => {
  const stored = localStorage.getItem('ff_mock_db');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse mock database, resetting', e);
    }
  }
  
  // Default fallback if not stored
  const userStr = localStorage.getItem('ff_user');
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {}
  }
  
  if (!user) {
    user = { id: 1, name: "Demo Freelancer", email: "demo@freelanceflow.com", plan: "free", avatarColor: "#4F46E5" };
  }
  
  const dbState = user.email === 'demo@freelanceflow.com' ? getDemoData(user) : getEmptyData(user);
  saveMockDb(dbState);
  return dbState;
};

let mockDb = loadMockDb();

// ── Mock Interceptors ────────────────────────────────────────────────────────
if (USE_MOCKS) {
  // Override axios request methods to return simulated mock database responses
  api.post = async (url, data) => {
    mockDb = loadMockDb();
    console.log(`[Mock Server] POST ${url}`, data);
    await new Promise(r => setTimeout(r, 400)); // Simulate delay
    
    if (url === '/auth/login' || url === '/auth/register') {
      const isRegister = url === '/auth/register';
      const colors = ['#4F46E5','#7C3AED','#0891B2','#059669','#D97706','#DC2626'];
      const avatarColor = colors[Math.floor(Math.random() * colors.length)];
      
      const user = isRegister
        ? { id: Date.now(), name: data.name, email: data.email, plan: 'free', avatarColor }
        : (data.email === 'demo@freelanceflow.com'
           ? { id: 1, name: "Demo Freelancer", email: "demo@freelanceflow.com", plan: "free", avatarColor: "#4F46E5" }
           : { id: Date.now(), name: data.email.split('@')[0], email: data.email, plan: 'free', avatarColor });

      mockDb = (user.email === 'demo@freelanceflow.com') ? getDemoData(user) : getEmptyData(user);
      saveMockDb(mockDb);
      return { data: { token: 'mock_jwt_token', user } };
    }
    
    if (url === '/timelogs/start') {
      const proj = mockDb.projects.find(p => String(p.id) === String(data.project_id));
      const newLog = {
        id: mockDb.timelogs.length + 1,
        project_id: data.project_id,
        project_name: proj ? proj.name : 'Unknown',
        task_id: data.task_id || null,
        description: data.description || '',
        start_time: new Date().toISOString(),
        end_time: null,
        hourly_rate: proj ? proj.hourly_rate : 2500,
        amount: 0,
        is_billed: 0,
        is_manual: 0
      };
      mockDb.runningTimer = newLog;
      saveMockDb(mockDb);
      return { data: newLog };
    }

    if (url === '/timelogs/stop') {
      if (!mockDb.runningTimer) throw { response: { data: { message: 'No timer running' } } };
      const timer = mockDb.runningTimer;
      timer.end_time = new Date().toISOString();
      const diffMs = new Date(timer.end_time).getTime() - new Date(timer.start_time).getTime();
      timer.duration_minutes = Math.max(1, Math.round(diffMs / 60000));
      timer.amount = Math.round((timer.duration_minutes / 60) * timer.hourly_rate);
      mockDb.timelogs.unshift(timer);
      mockDb.runningTimer = null;
      saveMockDb(mockDb);
      return { data: timer };
    }

    if (url === '/timelogs/manual') {
      const proj = mockDb.projects.find(p => String(p.id) === String(data.project_id));
      const diffMs = new Date(data.end_time).getTime() - new Date(data.start_time).getTime();
      const mins = Math.max(1, Math.round(diffMs / 60000));
      const amount = Math.round((mins / 60) * data.hourly_rate);
      const newLog = {
        id: mockDb.timelogs.length + 1,
        ...data,
        duration_minutes: mins,
        amount,
        is_billed: 0,
        is_manual: 1
      };
      mockDb.timelogs.unshift(newLog);
      saveMockDb(mockDb);
      return { data: newLog };
    }

    if (url === '/clients') {
      const newClient = {
        id: mockDb.clients.length + 1,
        ...data,
        project_count: 0,
        active_projects: 0,
        created_at: new Date().toISOString()
      };
      mockDb.clients.unshift(newClient);
      saveMockDb(mockDb);
      return { data: newClient };
    }

    if (url === '/projects') {
      const client = mockDb.clients.find(c => String(c.id) === String(data.client_id));
      const newProj = {
        id: mockDb.projects.length + 1,
        ...data,
        client_name: client ? client.name : 'Unknown',
        client_company: client ? client.company : '',
        hourly_rate: client ? client.hourly_rate : 2500,
        currency: client ? client.currency : 'INR',
        task_count: 0,
        done_tasks: 0,
        total_minutes: 0,
        total_billed_amount: 0,
        burn_rate_pct: 0,
        created_at: new Date().toISOString()
      };
      mockDb.projects.unshift(newProj);
      saveMockDb(mockDb);
      return { data: newProj };
    }

    if (url === '/tasks') {
      const proj = mockDb.projects.find(p => String(p.id) === String(data.project_id));
      const newTask = {
        id: mockDb.tasks.length + 1,
        ...data,
        project_name: proj ? proj.name : 'Project',
        status: 'todo',
        created_at: new Date().toISOString()
      };
      mockDb.tasks.unshift(newTask);
      saveMockDb(mockDb);
      return { data: newTask };
    }

    if (url === '/invoices') {
      const client = mockDb.clients.find(c => String(c.id) === String(data.client_id));
      const logsToBill = mockDb.timelogs.filter(l => data.time_log_ids.includes(l.id));
      logsToBill.forEach(l => l.is_billed = 1);
      
      const subtotal = logsToBill.reduce((sum, l) => sum + parseFloat(l.amount || 0), 0);
      const taxAmount = (subtotal * data.tax_rate) / 100;
      const total = subtotal + taxAmount;

      const newInv = {
        id: mockDb.invoices.length + 1,
        client_id: data.client_id,
        client_name: client ? client.name : 'Unknown',
        client_company: client ? client.company : '',
        invoice_number: `INV-SEED-00${mockDb.invoices.length + 1}`,
        status: 'draft',
        issue_date: new Date().toISOString().substring(0, 10),
        due_date: data.due_date,
        subtotal,
        tax_rate: data.tax_rate,
        tax_amount: taxAmount,
        total,
        notes: data.notes,
        currency: client ? client.currency : 'INR',
        items: logsToBill.map(l => ({
          description: l.description || 'Development work',
          hours: ((l.duration_minutes || 0) / 60).toFixed(2),
          rate: l.hourly_rate,
          amount: l.amount
        }))
      };
      mockDb.invoices.unshift(newInv);
      saveMockDb(mockDb);
      return { data: newInv };
    }

    if (url === '/invoices/draft') {
      const client = mockDb.clients.find(c => String(c.id) === String(data.client_id));
      if (!client) throw { response: { status: 404, data: { message: 'Client not found' } } };

      const subtotal = parseFloat(client.hourly_rate || 0);
      const taxRate = 18;
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const dueDateStr = dueDate.toISOString().substring(0, 10);

      const newInv = {
        id: mockDb.invoices.length + 1,
        client_id: data.client_id,
        client_name: client ? client.name : 'Unknown',
        client_company: client ? client.company : '',
        invoice_number: `INV-SEED-00${mockDb.invoices.length + 1}`,
        status: 'draft',
        issue_date: new Date().toISOString().substring(0, 10),
        due_date: dueDateStr,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        notes: data.notes || 'Auto-generated invoice',
        currency: client ? client.currency : 'INR',
        items: [{
          description: client.company || client.name || 'Project Development',
          hours: "1.00",
          rate: subtotal,
          amount: subtotal
        }]
      };
      mockDb.invoices.unshift(newInv);
      saveMockDb(mockDb);
      return { data: newInv };
    }

    if (url === '/seed') {
      mockDb = getDemoData(mockDb.user);
      saveMockDb(mockDb);
      return { data: { message: 'Sample data loaded successfully' } };
    }

    throw { response: { data: { message: 'Endpoint not mocked' } } };
  };

  api.get = async (url, config) => {
    mockDb = loadMockDb();
    console.log(`[Mock Server] GET ${url}`, config);
    await new Promise(r => setTimeout(r, 300));
    
    if (url === '/auth/me') {
      return { data: mockDb.user };
    }

    if (url === '/dashboard/stats') {
      const activeProjects = mockDb.projects.filter(p => p.status === 'active').length;
      const pendingInvoices = mockDb.invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length;
      const pendingAmount = mockDb.invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);
      const totalRevenue = mockDb.invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
      const overdueTasks = mockDb.tasks.filter(t => t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()).length;
      
      return {
        data: {
          active_projects: activeProjects,
          pending_invoices: pendingInvoices,
          pending_amount: pendingAmount,
          total_revenue: totalRevenue,
          overdue_tasks: overdueTasks
        }
      };
    }

    if (url === '/dashboard/revenue-chart') {
      const paidInvoices = mockDb.invoices.filter(i => i.status === 'paid');
      const monthlyData = {};
      paidInvoices.forEach(i => {
        const d = new Date(i.issue_date);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthLabel = `${months[d.getMonth()]} ${d.getFullYear()}`;
        const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[sortKey]) {
          monthlyData[sortKey] = { month: monthLabel, SortKey: sortKey, revenue: 0 };
        }
        monthlyData[sortKey].revenue += parseFloat(i.total || 0);
      });
      const dataList = Object.keys(monthlyData).sort().map(k => monthlyData[k]);
      return { data: dataList };
    }

    if (url.startsWith('/projects/')) {
      const id = url.split('/projects/')[1];
      const proj = mockDb.projects.find(p => String(p.id) === String(id));
      if (!proj) throw { response: { status: 404, data: { message: 'Not found' } } };
      return { data: proj };
    }

    if (url.startsWith('/projects?client_id=')) {
      const clientId = url.split('client_id=')[1];
      const projs = mockDb.projects.filter(p => String(p.client_id) === String(clientId));
      return { data: projs };
    }

    if (url.startsWith('/projects')) {
      return { data: mockDb.projects };
    }

    if (url.startsWith('/clients/')) {
      const id = url.split('/clients/')[1];
      const client = mockDb.clients.find(c => String(c.id) === String(id));
      if (!client) throw { response: { status: 404, data: { message: 'Not found' } } };
      return { data: client };
    }

    if (url.startsWith('/clients')) {
      return { data: mockDb.clients };
    }

    if (url.startsWith('/tasks/project/')) {
      const projId = url.split('/project/')[1];
      const tasks = mockDb.tasks.filter(t => String(t.project_id) === String(projId));
      return { data: tasks };
    }

    if (url.startsWith('/tasks')) {
      return { data: mockDb.tasks };
    }

    if (url === '/timelogs/running') {
      return { data: mockDb.runningTimer };
    }

    if (url.startsWith('/timelogs/project/')) {
      const projId = url.split('/project/')[1];
      const logs = mockDb.timelogs.filter(l => String(l.project_id) === String(projId));
      return { data: logs };
    }

    if (url.startsWith('/timelogs')) {
      // Handle query params like ?is_billed=0
      let list = mockDb.timelogs;
      if (url.includes('is_billed=0')) {
        list = list.filter(l => l.is_billed === 0);
      }
      return { data: list };
    }

    if (url.startsWith('/invoices/')) {
      const id = url.split('/invoices/')[1];
      const invoice = mockDb.invoices.find(i => String(i.id) === String(id));
      if (!invoice) throw { response: { status: 404, data: { message: 'Not found' } } };
      return { data: invoice };
    }

    if (url.startsWith('/invoices')) {
      return { data: mockDb.invoices };
    }

    throw { response: { data: { message: 'Endpoint not mocked' } } };
  };

  api.put = async (url, data) => {
    mockDb = loadMockDb();
    console.log(`[Mock Server] PUT ${url}`, data);
    await new Promise(r => setTimeout(r, 400));

    if (url.startsWith('/clients/')) {
      const id = url.split('/clients/')[1];
      const index = mockDb.clients.findIndex(c => String(c.id) === String(id));
      if (index === -1) throw { response: { status: 404, data: { message: 'Not found' } } };
      mockDb.clients[index] = { ...mockDb.clients[index], ...data };
      saveMockDb(mockDb);
      return { data: mockDb.clients[index] };
    }

    if (url.startsWith('/projects/')) {
      const id = url.split('/projects/')[1];
      const index = mockDb.projects.findIndex(p => String(p.id) === String(id));
      if (index === -1) throw { response: { status: 404, data: { message: 'Not found' } } };
      mockDb.projects[index] = { ...mockDb.projects[index], ...data };
      saveMockDb(mockDb);
      return { data: mockDb.projects[index] };
    }

    if (url.startsWith('/tasks/')) {
      const id = url.split('/tasks/')[1];
      const index = mockDb.tasks.findIndex(t => String(t.id) === String(id));
      if (index === -1) throw { response: { status: 404, data: { message: 'Not found' } } };
      mockDb.tasks[index] = { ...mockDb.tasks[index], ...data };
      saveMockDb(mockDb);
      return { data: mockDb.tasks[index] };
    }

    if (url === '/auth/profile') {
      mockDb.user.name = data.name;
      mockDb.user.email = data.email;
      saveMockDb(mockDb);
      return { data: mockDb.user };
    }

    if (url === '/auth/password') {
      return { data: { message: 'Password updated' } };
    }

    throw { response: { data: { message: 'Endpoint not mocked' } } };
  };

  api.patch = async (url, data) => {
    mockDb = loadMockDb();
    console.log(`[Mock Server] PATCH ${url}`, data);
    await new Promise(r => setTimeout(r, 400));

    if (url.includes('/status')) {
      const id = url.split('/invoices/')[1].split('/status')[0];
      const index = mockDb.invoices.findIndex(i => String(i.id) === String(id));
      if (index === -1) throw { response: { status: 404, data: { message: 'Not found' } } };
      mockDb.invoices[index].status = data.status;
      saveMockDb(mockDb);
      return { data: mockDb.invoices[index] };
    }

    throw { response: { data: { message: 'Endpoint not mocked' } } };
  };

  api.delete = async (url) => {
    mockDb = loadMockDb();
    console.log(`[Mock Server] DELETE ${url}`);
    await new Promise(r => setTimeout(r, 400));

    if (url.startsWith('/clients/')) {
      const id = url.split('/clients/')[1];
      mockDb.clients = mockDb.clients.filter(c => String(c.id) !== String(id));
      saveMockDb(mockDb);
      return { data: { message: 'Deleted' } };
    }

    if (url.startsWith('/projects/')) {
      const id = url.split('/projects/')[1];
      mockDb.projects = mockDb.projects.filter(p => String(p.id) !== String(id));
      saveMockDb(mockDb);
      return { data: { message: 'Deleted' } };
    }

    if (url.startsWith('/tasks/')) {
      const id = url.split('/tasks/')[1];
      mockDb.tasks = mockDb.tasks.filter(t => String(t.id) !== String(id));
      saveMockDb(mockDb);
      return { data: { message: 'Deleted' } };
    }

    if (url.startsWith('/timelogs/')) {
      const id = url.split('/timelogs/')[1];
      mockDb.timelogs = mockDb.timelogs.filter(l => String(l.id) !== String(id));
      saveMockDb(mockDb);
      return { data: { message: 'Deleted' } };
    }

    if (url.startsWith('/invoices/')) {
      const id = url.split('/invoices/')[1];
      mockDb.invoices = mockDb.invoices.filter(i => String(i.id) !== String(id));
      saveMockDb(mockDb);
      return { data: { message: 'Deleted' } };
    }

    if (url === '/auth/account') {
      saveMockDb(mockDb);
      return { data: { message: 'Deleted' } };
    }

    throw { response: { data: { message: 'Endpoint not mocked' } } };
  };
}

export default api;
