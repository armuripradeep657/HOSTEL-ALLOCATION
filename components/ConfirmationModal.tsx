import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  isDangerous?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  isDangerous = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-150" id="confirmation-backdrop">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 space-y-4 relative animate-in zoom-in-95 duration-155" id="confirmation-modal-box">
        
        {/* Warning Indicator */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${isDangerous ? 'bg-rose-100 text-rose-800' : 'bg-indigo-100 text-indigo-800'}`}>
            <AlertCircle size={22} className={isDangerous ? 'animate-pulse' : ''} />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-black text-slate-900 leading-snug">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-1.5">{message}</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            id="btn-confirm-cancel"
            className="flex-1 py-3 px-4 bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 rounded-xl font-bold text-xs active:scale-97 transition-all text-center"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            id="btn-confirm-agree"
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs text-white active:scale-97 transition-all text-center border mr-px ${
              isDangerous 
                ? 'bg-rose-600 hover:bg-rose-500 border-rose-600 shadow-md shadow-rose-500/10' 
                : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-600 shadow-md shadow-indigo-600/10'
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
