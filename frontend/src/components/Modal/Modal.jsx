import React from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:left-64 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-neutral-border overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col my-8 max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-border">
          <h3 className="text-lg font-bold text-neutral-text-primary">{title}</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-neutral-text-secondary hover:text-neutral-text-primary p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
