import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import PaymentModal from '../../components/PaymentModal/PaymentModal';
import {
  FiUser, FiLock, FiZap, FiAlertTriangle, FiSave,
  FiPlus, FiX, FiCheckCircle, FiShield, FiStar, FiChevronRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

/* ── Shared input ── */
const Field = ({ label, hint, ...props }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
    <input
      {...props}
      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
    />
  </div>
);

/* ── Section wrapper ── */
const Section = ({ title, description, children, border = true }) => (
  <div className={`py-8 ${border ? 'border-b border-slate-100' : ''}`}>
    <div className="mb-6">
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
    </div>
    {children}
  </div>
);

const TABS = [
  { id: 'profile',   label: 'Profile',        icon: FiUser },
  { id: 'billing',   label: 'Billing & Plan',  icon: FiZap },
  { id: 'security',  label: 'Password Update', icon: FiLock },
  { id: 'danger',    label: 'Delete Account',  icon: FiAlertTriangle },
];

const Settings = () => {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [name, setName]       = useState(user?.name  || '');
  const [email, setEmail]     = useState(user?.email || '');
  const [expertise, setExpertise] = useState([]);
  const [newTag, setNewTag]   = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');

  const [isDeleteOpen,  setIsDeleteOpen]  = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isEditing,     setIsEditing]     = useState(false);
  const [savedName,     setSavedName]     = useState(user?.name  || '');
  const [savedEmail,    setSavedEmail]    = useState(user?.email || '');
  const [savedExpertise,setSavedExpertise]= useState([]);

  const isPro = user?.plan === 'pro';

  const proFeatures = [
    'Unlimited clients & projects',
    'PDF invoices with custom branding',
    'Advanced financial analytics',
    'Priority time tracking & timesheets',
  ];

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setName(data.name || '');
      setEmail(data.email || '');
      const tags = data.expertise ? data.expertise.split(',').map(s => s.trim()).filter(Boolean) : [];
      setExpertise(tags); setSavedExpertise(tags);
      setSavedName(data.name || ''); setSavedEmail(data.email || '');
    }).catch(() => toast.error('Could not fetch profile'));
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name || !email) { toast.error('Name and email are required'); return; }
    setLoading(true);
    try {
      await api.put('/auth/profile', { name, email, expertise: expertise.join(', ') });
      const stored = localStorage.getItem('ff_user');
      if (stored) { const u = JSON.parse(stored); u.name = name; u.email = email; localStorage.setItem('ff_user', JSON.stringify(u)); }
      setSavedName(name); setSavedEmail(email); setSavedExpertise([...expertise]);
      toast.success('Profile updated');
      setIsEditing(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const handleCancelEdit = () => {
    setName(savedName); setEmail(savedEmail); setExpertise([...savedExpertise]);
    setIsAddingTag(false); setNewTag('');
    setIsEditing(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) { toast.error('Fill in all fields'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Minimum 6 characters'); return; }
    setLoading(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password changed');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/auth/account');
      toast.success('Account deleted.');
      setIsDeleteOpen(false);
      logout();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  /* ── Tab content panels ── */
  const ProfilePanel = () => (
    <form onSubmit={handleProfileUpdate}>
      {/* Header action */}
      <Section title="Basic Information" description="Your public display name and contact email.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            {isEditing
              ? <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all" />
              : <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">{savedName || '—'}</div>}
          </div>
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            {isEditing
              ? <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all" />
              : <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700">{savedEmail || '—'}</div>}
          </div>
        </div>
      </Section>

      <Section title="Expertise & Skills" description="Tags that describe your professional skills and services." border={false}>
        <div className="flex flex-wrap gap-2 items-center min-h-[52px] p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
          {expertise.length === 0 && !isAddingTag && (
            <span className="text-slate-400 text-sm italic">{isEditing ? 'No skills — click Add Skill to add' : 'No skills added yet'}</span>
          )}
          {expertise.map((tag, idx) => (
            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-sm font-semibold">
              {tag}
              {isEditing && <button type="button" onClick={() => setExpertise(expertise.filter((_, i) => i !== idx))} className="text-indigo-300 hover:text-red-400 transition ml-0.5"><FiX size={12} /></button>}
            </span>
          ))}
          {isEditing && (isAddingTag ? (
            <div className="flex items-center gap-2">
              <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="e.g. React, UI/UX"
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-400 w-36 bg-white"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newTag.trim()) { setExpertise([...expertise, newTag.trim()]); setNewTag(''); setIsAddingTag(false); } } }}
                autoFocus />
              <button type="button" onClick={() => { if (newTag.trim()) { setExpertise([...expertise, newTag.trim()]); setNewTag(''); } setIsAddingTag(false); }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition">Add</button>
              <button type="button" onClick={() => { setNewTag(''); setIsAddingTag(false); }}
                className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-sm font-semibold">Cancel</button>
            </div>
          ) : (
            <button type="button" onClick={() => setIsAddingTag(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-300 hover:border-indigo-400 hover:text-indigo-600 text-slate-400 rounded-lg text-sm font-semibold transition">
              <FiPlus size={13} /> Add Skill
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3">
          {isEditing ? (
            <>
              <button type="button" onClick={handleCancelEdit}
                className="px-5 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold text-sm rounded-xl transition cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-sm rounded-xl transition shadow-md shadow-indigo-100 cursor-pointer">
                <FiSave size={14} />
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold text-sm rounded-xl transition cursor-pointer">
              ✏️ Edit Profile
            </button>
          )}
        </div>
      </Section>
    </form>
  );

  const BillingPanel = () => (
    <>
      <Section title="Current Plan" description="Your active subscription and billing cycle.">
        <div className={`flex items-center justify-between p-6 rounded-2xl border-2 ${isPro ? 'border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isPro ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <FiStar size={20} className="text-white" />
            </div>
            <div>
              <p className="text-base font-black text-slate-800">{isPro ? 'Pro Plan' : 'Free Plan'}</p>
              <p className="text-sm text-slate-400">{isPro ? 'All features unlocked · Renews monthly' : 'Limited to 2 clients'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-black ${isPro ? 'text-indigo-600' : 'text-slate-400'}`}>{isPro ? '₹999' : '₹0'}</p>
            <p className="text-xs text-slate-400 font-medium">per month</p>
          </div>
        </div>
      </Section>

      {!isPro && (
        <Section title="Upgrade to Pro" description="Unlock all features and remove all limits." border={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {proFeatures.map(f => (
              <div key={f} className="flex items-center gap-3 p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <FiCheckCircle size={13} className="text-indigo-600" />
                </div>
                <span className="text-sm text-slate-700 font-medium">{f}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div>
              <p className="text-base font-black text-slate-800">FreelanceFlow Pro</p>
              <p className="text-sm text-slate-400">Everything you need to scale your business</p>
            </div>
            <button onClick={() => setIsPaymentOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg shadow-indigo-200 cursor-pointer transition hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <FiZap size={15} />
              Upgrade — ₹999/mo
            </button>
          </div>
        </Section>
      )}

      {isPro && (
        <Section title="Plan Features" description="Everything included in your Pro subscription." border={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {proFeatures.map(f => (
              <div key={f} className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                <FiCheckCircle size={15} className="text-green-500 shrink-0" />
                <span className="text-sm text-slate-700 font-medium">{f}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  );

  const SecurityPanel = () => (
    <form onSubmit={handlePasswordChange}>
      <Section title="Change Password" description="Use a strong password to keep your account safe.">
        <div className="max-w-md space-y-4">
          <Field label="Current Password" hint="Required for verification" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
          <Field label="New Password" hint="Min. 6 characters" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" />
          <Field label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
        </div>
      </Section>
      <Section title="" border={false}>
        <div className="flex justify-end">
          <button type="submit" disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl transition shadow-sm cursor-pointer">
            <FiShield size={14} />
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </Section>
    </form>
  );

  const DangerPanel = () => (
    <Section title="Delete Account" description="Permanently remove your account and all associated data." border={false}>
      <div className="max-w-lg">
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl mb-5 space-y-3">
          {['All client profiles and contact info', 'Projects, tasks, and time logs', 'All generated invoices and billing history'].map(item => (
            <div key={item} className="flex items-center gap-3 text-sm text-red-700">
              <FiAlertTriangle size={14} className="shrink-0" />
              {item}
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500 mb-5">This action is <strong className="text-slate-700">irreversible</strong>. Once confirmed, there is no way to recover your data.</p>
        <button type="button" onClick={() => setIsDeleteOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-red-100 cursor-pointer">
          <FiAlertTriangle size={14} />
          Delete My Account Permanently
        </button>
      </div>
    </Section>
  );

  const panels = { profile: <ProfilePanel />, billing: <BillingPanel />, security: <SecurityPanel />, danger: <DangerPanel /> };
  const activeTab = TABS.find(t => t.id === tab);

  return (
    <div className="pb-10">
      {/* ── Page title ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account preferences and subscription</p>
      </div>

      {/* ── Tab layout ── */}
      <div className="flex gap-8 items-start">

        {/* Left nav */}
        <nav className="w-56 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-2 sticky top-6">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            const isDanger = id === 'danger';
            return (
              <button key={id} onClick={() => setTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-0.5 last:mb-0 text-left
                  ${active
                    ? isDanger ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-700'
                    : isDanger ? 'text-red-400 hover:bg-red-50 hover:text-red-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}>
                <Icon size={16} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {active && <FiChevronRight size={14} className="opacity-40" />}
              </button>
            );
          })}
        </nav>

        {/* Right content */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
          {/* Content header */}
          <div className={`px-8 py-5 border-b flex items-center gap-3 ${tab === 'danger' ? 'border-red-100 bg-red-50/40' : 'border-slate-100'}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              tab === 'profile'  ? 'bg-indigo-500' :
              tab === 'billing'  ? 'bg-purple-600' :
              tab === 'security' ? 'bg-slate-600'  :
                                   'bg-red-500'
            }`}>
              {activeTab && <activeTab.icon size={16} className="text-white" />}
            </div>
            <div>
              <h2 className={`text-base font-bold ${tab === 'danger' ? 'text-red-700' : 'text-slate-800'}`}>{activeTab?.label}</h2>
              <p className="text-xs text-slate-400">
                {tab === 'profile'  && 'Update your personal information and expertise'}
                {tab === 'billing'  && 'Manage your subscription and payment details'}
                {tab === 'security' && 'Protect your account with a strong password'}
                {tab === 'danger'   && 'Irreversible actions — proceed with caution'}
              </p>
            </div>
            {tab === 'billing' && (
              <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold border ${isPro ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                {isPro ? '⭐ Pro' : 'Free'}
              </span>
            )}
          </div>

          {/* Panel */}
          <div className="px-8">
            {panels[tab]}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Account?"
        message="Are you sure? This will permanently erase all your data including clients, projects, invoices, and time logs."
        confirmText="Yes, Delete Permanently"
        cancelText="Cancel"
        onConfirm={handleDeleteAccount}
        onCancel={() => setIsDeleteOpen(false)}
      />
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
    </div>
  );
};

export default Settings;
