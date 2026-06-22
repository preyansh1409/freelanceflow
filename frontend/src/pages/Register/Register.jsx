import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiEye, FiEyeOff, FiClock, FiFileText, FiUsers, FiTrendingUp, FiCheckCircle, FiZap, FiShield } from 'react-icons/fi';
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
const Orb = ({ className, style }) => (
  <div className={`absolute rounded-full blur-3xl opacity-30 animate-pulse ${className}`} style={style} />
);

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    const res = await register(name, email, password);
    if (res.success) {
      toast.success('Registration successful! Welcome to FreelanceFlow.');
      navigate('/dashboard');
    } else {
      setError(res.message);
      toast.error(res.message);
    }
  };

  const perks = [
    { icon: FiClock,      label: 'Time Tracking',    desc: 'Track every billable minute automatically' },
    { icon: FiFileText,   label: 'Smart Invoices',    desc: 'Auto-generate & send professional invoices' },
    { icon: FiUsers,      label: 'Client CRM',        desc: 'Manage all your client relationships' },
    { icon: FiTrendingUp, label: 'Revenue Analytics', desc: 'Real-time financial insights & reports' },
  ];

  const stats = [
    { value: 1200, suffix: '+', label: 'Freelancers' },
    { value: 98,   suffix: '%', label: 'Satisfaction' },
    { value: 50,   suffix: 'k+', label: 'Invoices Sent' },
  ];

  const checkpoints = [
    'No credit card required',
    'Free 14-day trial',
    'Cancel anytime',
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">

      {/* ─── Left panel ─── */}
      <div
        className="hidden md:flex flex-1 flex-col justify-between px-12 py-10 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)' }}
      >
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

        {/* top: heading */}
        <div className={`relative z-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white/90 text-xs font-semibold backdrop-blur-md border border-white/20 mb-6">
            <FiZap size={11} className="text-yellow-300" />
            Free 14-day trial — No credit card needed
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white mb-3">
            Start tracking, billing,<br />
            and <span className="text-yellow-300">scaling</span> today.
          </h2>
          <p className="text-white/70 leading-relaxed text-sm max-w-sm">
            Join thousands of freelancers who use FreelanceFlow to run their client
            businesses systematically. Stop leaking billable hours — start today.
          </p>

          {/* checkpoints */}
          <div className="flex flex-wrap gap-3 mt-5">
            {checkpoints.map(c => (
              <div key={c} className="flex items-center gap-1.5 text-xs text-white/80">
                <FiCheckCircle size={13} className="text-green-400 shrink-0" />
                {c}
              </div>
            ))}
          </div>
        </div>

        {/* feature cards */}
        <div className={`relative z-10 grid grid-cols-2 gap-3 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {perks.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="group flex items-start gap-3 p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm hover:bg-white/20 hover:border-white/30 transition-all duration-300 cursor-default"
            >
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

        {/* security badge */}
        <div className={`relative z-10 flex items-center gap-3 p-4 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm transition-all duration-700 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="p-2.5 rounded-lg bg-white/15 shrink-0">
            <FiShield size={18} className="text-green-300" />
          </div>
          <div>
            <p className="text-white text-xs font-bold">Enterprise-grade security</p>
            <p className="text-white/60 text-[10px] mt-0.5">Your data is encrypted end-to-end and never shared with third parties.</p>
          </div>
        </div>

        {/* footer */}
        <div className="relative z-10 text-xs text-white/40">
          © {new Date().getFullYear()} FreelanceFlow. All rights reserved.
        </div>
      </div>

      {/* ─── Right panel: Register Form ─── */}
      <div className="w-full md:w-[500px] flex flex-col justify-center px-8 sm:px-16 bg-neutral-surface shadow-2xl relative z-10">
        <div className="w-full max-w-sm mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-black text-neutral-text-primary tracking-tight">Create your account</h1>
            <p className="text-sm text-neutral-text-secondary mt-1.5">Free 14-day trial, no credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-xs bg-danger-light text-danger rounded-lg border border-danger/10 font-semibold animate-shake">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-text-secondary">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 bg-white border border-neutral-border rounded-lg text-sm text-neutral-text-primary placeholder:text-neutral-text-muted focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary-light transition"
                required
              />
            </div>

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
                  placeholder="Min. 6 characters"
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
                'Create Account'
              )}
            </button>

            {/* quick assurances */}
            <div className="flex justify-center gap-4">
              {checkpoints.map(c => (
                <div key={c} className="flex items-center gap-1 text-[10px] text-neutral-text-muted">
                  <FiCheckCircle size={10} className="text-green-500 shrink-0" />
                  {c}
                </div>
              ))}
            </div>
          </form>

          <p className="text-center text-xs text-neutral-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-primary-hover transition">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
