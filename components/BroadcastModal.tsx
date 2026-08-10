import React, { useState } from 'react';
import { X, Megaphone } from 'lucide-react';

interface BroadcastModalProps {
  onClose: () => void;
  onSend: (message: string, priority: 'Normal' | 'High') => void;
}

export function BroadcastModal({ onClose, onSend }: BroadcastModalProps) {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'Normal' | 'High'>('Normal');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please write an announcement text.');
      return;
    }
    onSend(message.trim(), priority);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" id="broadcast-modal">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col relative">
        
        {/* Accent board */}
        <div className="bg-indigo-600 h-2 w-full" />

        {/* Header bar */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Megaphone size={20} className="text-indigo-650 animate-pulse" /> Warden Broadcast Message
            </h2>
            <p className="text-xs text-slate-400 mt-1">Send global dashboard notices instantly to students</p>
          </div>
          <button 
            onClick={onClose}
            id="btn-broadcast-modal-close"
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" id="broadcast-form">
          {error && (
            <div className="bg-rose-50 text-rose-900 border border-rose-100 p-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Announcement content */}
          <div className="space-y-1.5">
            <label htmlFor="broadcast-message-input" className="text-xs font-bold text-slate-505 uppercase tracking-wide">Broadcast Notice Text</label>
            <textarea
              id="broadcast-message-input"
              rows={4}
              placeholder="e.g. Hostel power maintenance scheduled tomorrow between 10 AM to 1 PM across all Boys Blocks..."
              value={message}
              onChange={e => {
                setMessage(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-808 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-all text-sm"
              maxLength={350}
              required
            />
          </div>

          {/* Priority selector */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block font-sans">Priority Category</span>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 border border-slate-205 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPriority('Normal')}
                id="btn-priority-normal"
                className={`py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                  priority === 'Normal'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Normal Notify
              </button>
              <button
                type="button"
                onClick={() => setPriority('High')}
                id="btn-priority-high"
                className={`py-2 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                  priority === 'High'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                High Priority
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={onClose}
              id="btn-cancel-broadcast"
              type="button"
              className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 active:scale-97 transition-colors text-center"
            >
              Cancel
            </button>
            <button
              id="btn-submit-broadcast"
              type="submit"
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 active:scale-97 transition-all text-center border border-indigo-600"
            >
              Broadcast Alert
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
