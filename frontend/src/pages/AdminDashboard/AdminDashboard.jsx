import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import { 
  FiSearch, FiLogOut, FiShield, FiGrid, FiUsers, 
  FiUser, FiCheckCircle, FiDollarSign, FiFolder, FiFileText, FiLayers 
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatDate';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'customer'

  // Check auth on mount
  useEffect(() => {
    const isAdmin = localStorage.getItem('ff_admin_auth') === 'true';
    if (!isAdmin) {
      toast.error('Unauthorized access. Please login as Super Admin.');
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/admin/users');
        setUsers(data);
      } catch (err) {
        toast.error('Failed to load admin data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ff_admin_auth');
    toast.success('Logged out of Super Admin Panel.');
    navigate('/login');
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.expertise?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUsers = users.length;
  const proUsers = users.filter(u => u.plan === 'pro').length;
  const freeUsers = totalUsers - proUsers;
  const totalClients = users.reduce((sum, u) => sum + parseInt(u.client_count || 0), 0);
  const totalProjects = users.reduce((sum, u) => sum + parseInt(u.project_count || 0), 0);
  const totalInvoices = users.reduce((sum, u) => sum + parseInt(u.invoice_count || 0), 0);
  const amountCollected = proUsers * 999; // ₹999 per Pro user

  if (loading) {
    return <LoadingSpinner size="lg" className="min-h-[80vh]" />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* ─── Left Sidebar Navigation ─── */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800">
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <FiShield size={20} />
          </div>
          <div>
            <h2 className="font-black text-sm tracking-tight text-white uppercase">Super Admin</h2>
            <p className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase">System CRM</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1.5">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <FiGrid size={18} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveView('customer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition cursor-pointer ${
              activeView === 'customer'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
            }`}
          >
            <FiUsers size={18} />
            <span>Customer Directory</span>
          </button>
        </nav>

        {/* Sidebar Footer (Logout) */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            <FiLogOut size={14} />
            <span>Logout Panel</span>
          </button>
        </div>

      </aside>

      {/* ─── Main Content Area ─── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {activeView === 'dashboard' ? 'Dashboard Overview' : 'Customer Directory'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeView === 'dashboard' 
                ? 'High-level business performance metrics and account statistics.'
                : 'Manage customer registrations and analyze workspace activities.'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
              Live Connection
            </span>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 max-w-7xl w-full mx-auto">
          
          {/* ══════════ VIEW: DASHBOARD ══════════ */}
          {activeView === 'dashboard' && (
            <div className="space-y-8">
              
              {/* Main Metric Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Total Customers */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <FiUsers size={24} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Customers</span>
                    <h2 className="text-3xl font-black text-slate-950">{totalUsers}</h2>
                    <p className="text-[11px] text-slate-500">Registered platform accounts</p>
                  </div>
                </div>

                {/* 2. Free Accounts */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <FiUser size={24} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free Trial</span>
                    <h2 className="text-3xl font-black text-amber-600">{freeUsers}</h2>
                    <p className="text-[11px] text-slate-500">Active non-paid accounts</p>
                  </div>
                </div>

                {/* 3. Pro Accounts */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FiCheckCircle size={24} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paid Pro</span>
                    <h2 className="text-3xl font-black text-emerald-600">{proUsers}</h2>
                    <p className="text-[11px] text-slate-500">Subscribed paid users</p>
                  </div>
                </div>

                {/* 4. Amount Collected */}
                <div className="bg-white border border-rose-200 bg-rose-50/20 rounded-2xl p-6 shadow-sm flex items-start gap-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <FiDollarSign size={24} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Amount Collected</span>
                    <h2 className="text-3xl font-black text-rose-600">₹{amountCollected.toLocaleString('en-IN')}</h2>
                    <p className="text-[11px] text-slate-500">Revenue from Pro plan (₹999/mo)</p>
                  </div>
                </div>

              </div>

              {/* Platform Activity Metric Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 5. Client Profiles */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                    <FiLayers size={24} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Profiles</span>
                    <h2 className="text-3xl font-black text-slate-900">{totalClients}</h2>
                    <p className="text-[11px] text-slate-500">Total clients created by users</p>
                  </div>
                </div>

                {/* 6. Total Projects */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <FiFolder size={24} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Projects</span>
                    <h2 className="text-3xl font-black text-purple-600">{totalProjects}</h2>
                    <p className="text-[11px] text-slate-500">Total client projects managed</p>
                  </div>
                </div>

                {/* 7. Total Invoices */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-start gap-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                    <FiFileText size={24} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Invoices</span>
                    <h2 className="text-3xl font-black text-violet-600">{totalInvoices}</h2>
                    <p className="text-[11px] text-slate-500">Invoices billed and generated</p>
                  </div>
                </div>

              </div>

              {/* Informative Help Banner */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-8 shadow-md">
                <h3 className="text-lg font-black tracking-tight">Need granular customer data?</h3>
                <p className="text-sm text-indigo-100 mt-1 max-w-2xl">
                  Switch to the **Customer Directory** view using the left sidebar menu to see full registrations, including login emails, user passwords (hashed), client counts, and creation dates.
                </p>
                <button
                  onClick={() => setActiveView('customer')}
                  className="mt-4 px-4 py-2 bg-white text-indigo-700 font-bold text-xs rounded-xl shadow hover:bg-indigo-50 transition cursor-pointer"
                >
                  Open Customer Table
                </button>
              </div>

            </div>
          )}

          {/* ══════════ VIEW: CUSTOMER DIRECTORY ══════════ */}
          {activeView === 'customer' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeIn">
              
              {/* Table Toolbar */}
              <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <FiSearch size={16} />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search customers by name, email, or expertise..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-600 bg-white placeholder:text-slate-400 font-semibold"
                  />
                </div>
                <div className="text-xs font-bold text-slate-500 bg-slate-200/50 px-3 py-1.5 rounded-lg shrink-0">
                  Showing {filteredUsers.length} of {totalUsers} customers
                </div>
              </div>

              {/* Excel Grid Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                      <th className="border-r border-slate-200 px-3 py-3 text-[10px] uppercase font-bold tracking-wider text-center w-14">#</th>
                      <th className="border-r border-slate-200 px-4 py-3 text-[10px] uppercase font-bold tracking-wider text-left min-w-[150px]">Customer Name</th>
                      <th className="border-r border-slate-200 px-4 py-3 text-[10px] uppercase font-bold tracking-wider text-left min-w-[200px]">Email Address</th>
                      <th className="border-r border-slate-200 px-4 py-3 text-[10px] uppercase font-bold tracking-wider text-left min-w-[220px]">Password (Hashed)</th>
                      <th className="border-r border-slate-200 px-4 py-3 text-[10px] uppercase font-bold tracking-wider text-center w-28">Plan status</th>
                      <th className="border-r border-slate-200 px-4 py-3 text-[10px] uppercase font-bold tracking-wider text-left min-w-[150px]">Expertise</th>
                      <th className="border-r border-slate-200 px-4 py-3 text-[10px] uppercase font-bold tracking-wider text-left min-w-[130px]">Registered Date</th>
                      <th className="border-r border-slate-200 px-3 py-3 text-[10px] uppercase font-bold tracking-wider text-center w-24">Clients</th>
                      <th className="border-r border-slate-200 px-3 py-3 text-[10px] uppercase font-bold tracking-wider text-center w-24">Projects</th>
                      <th className="px-3 py-3 text-[10px] uppercase font-bold tracking-wider text-center w-24">Invoices</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-12 text-slate-400 italic text-xs">
                          No customer registrations match your search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, idx) => (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="border-r border-slate-150 px-3 py-3.5 text-center bg-slate-50/60 font-black text-slate-500 text-xs">
                            {idx + 1}
                          </td>
                          <td className="border-r border-slate-150 px-4 py-3.5 text-sm font-bold text-slate-800">
                            {user.name}
                          </td>
                          <td className="border-r border-slate-150 px-4 py-3.5 text-sm font-semibold text-slate-600 font-mono">
                            {user.email}
                          </td>
                          <td className="border-r border-slate-150 px-4 py-3.5 text-[11px] font-mono text-slate-400 break-all select-all" title={user.password}>
                            {user.password || 'N/A'}
                          </td>
                          <td className="border-r border-slate-150 px-4 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                              user.plan === 'pro'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-500/5'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.plan === 'pro' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                              {user.plan === 'pro' ? 'Paid Pro' : 'Free Trial'}
                            </span>
                          </td>
                          <td className="border-r border-slate-150 px-4 py-3.5 text-sm font-medium text-slate-600 italic">
                            {user.expertise || 'N/A'}
                          </td>
                          <td className="border-r border-slate-150 px-4 py-3.5 text-sm font-semibold text-slate-600 font-mono">
                            {formatDate(user.created_at)}
                          </td>
                          <td className="border-r border-slate-150 px-3 py-3.5 text-center text-sm font-bold text-slate-800 bg-slate-50/30">
                            {user.client_count}
                          </td>
                          <td className="border-r border-slate-150 px-3 py-3.5 text-center text-sm font-bold text-slate-800 bg-slate-50/30">
                            {user.project_count}
                          </td>
                          <td className="px-3 py-3.5 text-center text-sm font-bold text-slate-800 bg-slate-50/30">
                            {user.invoice_count}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;
