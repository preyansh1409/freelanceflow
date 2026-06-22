import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiUsers, FiBriefcase, FiCheckSquare, FiClock, FiFileText, FiSettings, FiCheckCircle, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
    { to: '/clients', icon: FiUsers, label: 'Clients' },
    { to: '/projects', icon: FiBriefcase, label: 'Projects' },
    { to: '/tasks', icon: FiCheckSquare, label: 'Tasks' },
    { to: '/time-tracking', icon: FiClock, label: 'Time Tracking' },
    { to: '/invoices', icon: FiFileText, label: 'Invoices' },
    { to: '/projects?tab=completed', icon: FiCheckCircle, label: 'Completed Projects' },
    { to: '/settings', icon: FiSettings, label: 'Settings' },
  ];

  const isLinkActive = (to) => {
    if (to.includes('?')) {
      return location.pathname + location.search === to;
    }
    if (to === '/projects') {
      return location.pathname === '/projects' && !location.search.includes('tab=completed');
    }
    return location.pathname === to;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-400 border-r border-slate-800 flex flex-col transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Freelance<span className="text-primary">Flow</span>
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = isLinkActive(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border-2 ${
                    active
                      ? 'bg-primary text-white font-semibold shadow-md shadow-primary/20 border-primary/70'
                      : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="px-4 py-5 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-xl text-sm font-bold bg-red-500 border-2 border-red-400 text-white hover:bg-red-600 hover:border-red-500 active:scale-95 transition-all duration-150 cursor-pointer shadow-lg shadow-red-500/20"
          >
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
