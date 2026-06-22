import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiLogOut, FiSettings } from 'react-icons/fi';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/clients')) return 'Clients';
    if (path.startsWith('/projects')) return 'Projects';
    if (path.startsWith('/tasks')) return 'Tasks';
    if (path.startsWith('/time-tracking')) return 'Time Tracking';
    if (path.startsWith('/invoices')) return 'Invoices';
    if (path.startsWith('/settings')) return 'Settings';
    return 'FreelanceFlow';
  };

  const nameInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
    : 'U';

  return (
    <header className="h-16 bg-white border-b border-neutral-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-neutral-text-secondary hover:bg-slate-100 md:hidden"
        >
          <FiMenu size={20} />
        </button>
        <h1 className="text-lg font-bold text-neutral-text-primary tracking-tight">{getPageTitle()}</h1>
      </div>

      <div className="relative">
        <button 
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm text-white focus:outline-none shadow-sm hover:opacity-90 transition"
          style={{ backgroundColor: user?.avatarColor || '#4F46E5' }}
        >
          {nameInitials}
        </button>

        {dropdownOpen && (
          <>
            <div onClick={() => setDropdownOpen(false)} className="fixed inset-0 z-45" />
            <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-border rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2 border-b border-neutral-border">
                <p className="text-[10px] text-neutral-text-secondary uppercase font-semibold">Logged in as</p>
                <p className="text-sm font-bold text-neutral-text-primary truncate">{user?.name}</p>
              </div>
              <Link 
                to="/settings" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-text-secondary hover:bg-slate-50 hover:text-neutral-text-primary transition"
                onClick={() => setDropdownOpen(false)}
              >
                <FiSettings size={14} />
                <span>Settings</span>
              </Link>
              <button 
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger-light/30 transition"
              >
                <FiLogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
