import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiEye, FiEyeOff, FiClock, FiFileText, FiUsers, FiTrendingUp, FiCheckCircle, FiZap, FiShield, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

/* ---------- animated counter ---------- */
const AnimatedCounter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

/* ---------- floating orb ---------- */
const Orb = ({ className }) => (
  <div className={`absolute rounded-full blur-3xl opacity-30 animate-pulse ${className}`} />
);

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  // Super Admin Credentials State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setAdminError('');
    if (adminUsername === 'super' && adminPassword === 'admin') {
      localStorage.setItem('ff_admin_auth', 'true');
      toast.success('Access Granted. Opening CRM Dashboard...');
      setShowAdminModal(false);
      navigate('/admin');
    } else {
      setAdminError('Invalid Super Admin credentials. Please try again.');
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    const res = await login(email, password);
    if (res.success) { toast.success('Welcome back!'); navigate('/dashboard'); }
    else { setError(res.message); toast.error(res.message); }
  };

  const features = [
    { icon: FiClock,      label: 'Time Tracking',    desc: 'Track every billable minute' },
    { icon: FiFileText,   label: 'Smart Invoices',    desc: 'Auto-generate & send invoices' },
    { icon: FiUsers,      label: 'Client CRM',        desc: 'Manage all client relationships' },
    { icon: FiTrendingUp, label: 'Revenue Analytics', desc: 'Real-time financial insights' },
  ];

  const stats = [
    { value: 1200, suffix: '+', label: 'Freelancers' },
    { value: 98,   suffix: '%', label: 'Satisfaction' },
    { value: 50,   suffix: 'k+', label: 'Invoices Sent' },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">

      {/* ─── Left panel ─── */}
      <div className="hidden md:flex flex-1 flex-col justify-between px-12 py-10 overflow-hidden relative"
           style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)' }}>

        {/* floating orbs */}
        <Orb className="w-72 h-72 bg-white top-[-80px] left-[-60px]" />
        <Orb className="w-96 h-96 bg-purple-300 bottom-[-100px] right-[-80px]" style={{ animationDelay: '1s' }} />
        <Orb className="w-48 h-48 bg-indigo-200 top-[40%] right-[5%]" style={{ animationDelay: '2s' }} />

        {/* grid mesh overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

        {/* top */}
        <div className={`relative z-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white/90 text-xs font-semibold backdrop-blur-md border border-white/20 mb-6">
            <FiZap size={11} className="text-yellow-300" />
            Version 1.0.0 — Now Live
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white mb-3">
            Manage your freelancing<br />
            <span className="text-yellow-300">business</span> with absolute ease.
          </h2>
          <p className="text-white/70 leading-relaxed text-sm max-w-sm">
            Track time, create invoices, monitor project budgets, manage client
            relationships, and run your business like a pro — all in one place.
          </p>
        </div>

        {/* feature cards */}
        <div className={`relative z-10 grid grid-cols-2 gap-3 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {features.map(({ icon: Icon, label, desc }, i) => (
            <div key={label}
              className="group flex items-start gap-3 p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm hover:bg-white/20 hover:border-white/30 transition-all duration-300 cursor-default"
              style={{ animationDelay: `${i * 100}ms` }}>
              <div className="p-2 rounded-lg bg-white/15 group-hover:bg-white/25 transition shrink-0">
                <Icon size={15} className="text-white" />
              </div>
              <div>
                <p className="text-white text-xs font-bold">{label}</p>
                <p className="text-white/60 text-[10px] leading-snug mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* stats */}
        <div className={`relative z-10 flex items-center gap-8 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {stats.map(({ value, suffix, label }, i) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-black text-white">
                <AnimatedCounter end={value} suffix={suffix} duration={1800 + i * 200} />
              </p>
              <p className="text-white/55 text-[11px] font-medium mt-0.5">{label}</p>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-400/20 border border-green-400/30">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block" />
            <span className="text-green-300 text-[11px] font-semibold">All systems operational</span>
          </div>
        </div>

        {/* testimonial */}
        <div className={`relative z-10 p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm transition-all duration-700 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
            ))}
          </div>
          <p className="text-white/80 text-xs leading-relaxed italic">
            "FreelanceFlow transformed how I run my agency. Invoices, time tracking, and client management — all under one roof."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">R</div>
            <div>
              <p className="text-white text-xs font-semibold">Rahul Sharma</p>
              <p className="text-white/50 text-[10px]">Freelance Designer, Mumbai</p>
            </div>
            <FiCheckCircle size={14} className="ml-auto text-green-400" />
          </div>
        </div>

        {/* footer */}
        <div className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} FreelanceFlow. All rights reserved.
        </div>
      </div>

      {/* ─── Right panel: Login Form ─── */}
      <div className="w-full md:w-[500px] flex flex-col justify-center px-8 sm:px-16 bg-neutral-surface shadow-2xl relative z-10">
        <div className="w-full max-w-sm mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-black text-neutral-text-primary tracking-tight">Welcome back</h1>
            <p className="text-sm text-neutral-text-secondary mt-1.5">Sign in to your FreelanceFlow account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-xs bg-danger-light text-danger rounded-lg border border-danger/10 font-semibold animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-text-secondary">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-white border border-neutral-border rounded-lg text-sm text-neutral-text-primary placeholder:text-neutral-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-light transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-text-secondary">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-white border border-neutral-border rounded-lg text-sm text-neutral-text-primary placeholder:text-neutral-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-light transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-text-secondary hover:text-neutral-text-primary"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold text-sm py-3 rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition duration-150 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-neutral-border"></div>
              <span className="flex-shrink mx-4 text-neutral-text-muted text-[10px] uppercase font-bold tracking-wider">Or Quick Access</span>
              <div className="flex-grow border-t border-neutral-border"></div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setEmail('demo@freelanceflow.com');
                setPassword('password');
                const res = await login('demo@freelanceflow.com', 'password');
                if (res.success) { toast.success('Logged in with Demo Account!'); navigate('/dashboard'); }
                else { setError(res.message); toast.error(res.message); }
              }}
              className="w-full flex items-center justify-center bg-secondary/10 hover:bg-secondary/20 text-secondary font-bold text-sm py-3 rounded-lg border border-secondary/20 transition duration-150 cursor-pointer disabled:cursor-not-allowed"
            >
              Demo Auto-Login
            </button>

            <button
              type="button"
              onClick={() => setShowAdminModal(true)}
              className="w-full flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm py-3 rounded-lg border border-indigo-200 transition duration-150 cursor-pointer mt-2"
            >
              <FiShield size={14} className="mr-2" />
              Super Admin Login
            </button>
          </form>

          <p className="text-center text-xs text-neutral-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-primary-hover transition">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Super Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                  <FiShield size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 leading-tight text-base">Super Admin Authorization</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Please verify admin credentials to proceed</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowAdminModal(false);
                  setAdminUsername('');
                  setAdminPassword('');
                  setAdminError('');
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAdminLogin} className="p-6 space-y-4">
              {adminError && (
                <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-100 font-bold">
                  {adminError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition font-medium"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition font-medium"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-3 rounded-lg shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition cursor-pointer"
              >
                Verify & Open CRM
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Login;
