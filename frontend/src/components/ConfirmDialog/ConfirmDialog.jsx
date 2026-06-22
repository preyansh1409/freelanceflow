import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmDialog = ({ isOpen, title = 'Are you sure?', message = 'This action cannot be undone.', confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, isDanger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:left-64 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-neutral-border overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 ${isDanger ? 'bg-danger-light text-danger' : 'bg-primary-light text-primary'}`}>
              <FiAlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-text-primary mb-2">{title}</h3>
              <p className="text-sm text-neutral-text-secondary">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-neutral-border">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 text-sm font-semibold text-neutral-text-secondary hover:text-neutral-text-primary bg-white border border-neutral-border rounded-lg shadow-sm hover:bg-slate-50 transition"
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition ${isDanger ? 'bg-danger hover:bg-red-600' : 'bg-primary hover:bg-primary-hover'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
