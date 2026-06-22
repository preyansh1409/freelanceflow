import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatsCard from '../../components/StatsCard/StatsCard';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { FiBriefcase, FiFileText, FiDollarSign, FiAlertCircle, FiDatabase, FiPlus } from 'react-icons/fi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    active_projects: 0,
    pending_invoices: 0,
    pending_amount: 0,
    total_revenue: 0,
    overdue_tasks: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [isDbOffline, setIsDbOffline] = useState(false);

  const fetchData = async () => {
    try {
      setIsDbOffline(false);
      const [statsRes, revenueRes, projectsRes, tasksRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/revenue-chart'),
        api.get('/projects?status=active'),
        api.get('/tasks?status=todo')
      ]);

      setStats(statsRes.data);
      setRevenueData(revenueRes.data);
      setRecentProjects(projectsRes.data.slice(0, 5));
      setUpcomingTasks(tasksRes.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.message && err.message.includes('Network Error')) {
        setIsDbOffline(true);
      } else {
        toast.error('Could not load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSeed = async () => {
    setLoading(true);
    try {
      await api.post('/seed');
      toast.success('Sample data loaded successfully!');
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to seed database');
    } finally {
      setLoading(false);
    }
  };

  // Determine user greeting based on local time
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[70vh]" />;
  }

  if (isDbOffline) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-neutral-border rounded-xl shadow-sm text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-danger-light text-danger mb-4">
          <FiDatabase size={28} />
        </div>
        <h3 className="text-lg font-bold text-neutral-text-primary mb-1">Database Offline</h3>
        <p className="text-sm text-neutral-text-secondary max-w-sm mb-6">
          The backend API or local MySQL database is currently unreachable. Make sure XAMPP (MySQL/Apache) is running.
        </p>
        <button 
          onClick={() => { setLoading(true); fetchData(); }} 
          className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow transition"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Check if projects list is empty to show seed banner
  const hasNoData = recentProjects.length === 0 && stats.total_revenue === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-neutral-text-primary tracking-tight">
            {getGreeting()}, {user?.name} 👋
          </h2>
          <p className="text-sm text-neutral-text-secondary mt-1">
            Here's what is happening with your business today.
          </p>
        </div>
        <div className="text-sm font-semibold text-neutral-text-secondary bg-white px-4 py-2 border border-neutral-border rounded-lg shadow-sm">
          {formatDate(new Date())}
        </div>
      </div>

      {/* Seeder Banner */}
      {hasNoData && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-lg">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="font-extrabold text-base">New to FreelanceFlow?</h4>
            <p className="text-xs text-white/80">Load sample clients, projects, tasks, time logs, and invoices to preview the dashboard instantly.</p>
          </div>
          <button 
            onClick={handleSeed}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-primary font-bold text-xs rounded-lg shadow transition cursor-pointer"
          >
            <FiDatabase size={14} />
            <span>Load Sample Data</span>
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Active Projects" 
          value={stats.active_projects} 
          icon={FiBriefcase} 
          color="success"
          description="Projects currently in progress"
        />
        <StatsCard 
          title="Pending Invoices" 
          value={formatCurrency(stats.pending_amount)} 
          icon={FiFileText} 
          color="warning"
          description={`${stats.pending_invoices} invoices sent & awaiting payment`}
        />
        <StatsCard 
          title="Total Revenue" 
          value={formatCurrency(stats.total_revenue)} 
          icon={FiDollarSign} 
          color="primary"
          description="All paid invoice earnings"
        />
        <StatsCard 
          title="Overdue Tasks" 
          value={stats.overdue_tasks} 
          icon={FiAlertCircle} 
          color="danger"
          description="Incomplete tasks past their due date"
        />
      </div>

      {/* Revenue Chart Section */}
      <div className="bg-white border border-neutral-border rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-neutral-text-primary uppercase tracking-wider mb-4">Paid Monthly Revenue</h3>
        {revenueData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-xs text-neutral-text-muted italic border border-dashed border-neutral-border rounded-lg">
            No paid revenue logged in the last 12 months yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip formatter={(value) => [`₹${parseFloat(value).toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom Grid: Recent Projects & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Recent Projects */}
        <div className="bg-white border border-neutral-border rounded-xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-text-primary uppercase tracking-wider">Active Projects</h3>
              <Link to="/projects" className="text-xs font-semibold text-primary hover:text-primary-hover transition">
                View all
              </Link>
            </div>
            {recentProjects.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-neutral-border rounded-lg text-xs text-neutral-text-muted">
                No active projects. Add a client first, then create a project!
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-neutral-border rounded-lg hover:shadow-sm transition">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                      <div className="overflow-hidden">
                        <Link to={`/projects/${p.id}`} className="text-sm font-bold text-neutral-text-primary hover:text-primary transition truncate block">
                          {p.name}
                        </Link>
                        <span className="text-[10px] text-neutral-text-secondary block truncate">Client: {p.client_name}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-neutral-text-primary font-mono">{p.burn_rate_pct}% used</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {recentProjects.length === 0 && (
            <Link 
              to="/projects" 
              className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-neutral-border rounded-lg text-xs font-bold text-neutral-text-primary transition"
            >
              <FiPlus size={14} />
              <span>Create Project</span>
            </Link>
          )}
        </div>

        {/* Right Column: Upcoming Tasks */}
        <div className="bg-white border border-neutral-border rounded-xl shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-text-primary uppercase tracking-wider">Upcoming Tasks</h3>
              <Link to="/tasks" className="text-xs font-semibold text-primary hover:text-primary-hover transition">
                View all
              </Link>
            </div>
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-neutral-border rounded-lg text-xs text-neutral-text-muted">
                No upcoming tasks. Create tasks inside your projects to organize your work.
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingTasks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3.5 bg-slate-50 border border-neutral-border rounded-lg hover:shadow-sm transition">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        t.priority === 'urgent' ? 'bg-danger animate-pulse' : 
                        t.priority === 'high' ? 'bg-warning' : 
                        t.priority === 'medium' ? 'bg-info' : 'bg-slate-400'
                      }`} />
                      <div className="overflow-hidden">
                        <span className="text-sm font-bold text-neutral-text-primary block truncate">{t.title}</span>
                        <span className="text-[10px] text-neutral-text-secondary block truncate">Project: {t.project_name}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-neutral-text-secondary whitespace-nowrap">{formatDate(t.due_date)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {upcomingTasks.length === 0 && (
            <Link 
              to="/tasks" 
              className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-neutral-border rounded-lg text-xs font-bold text-neutral-text-primary transition"
            >
              <FiPlus size={14} />
              <span>Create Task</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
