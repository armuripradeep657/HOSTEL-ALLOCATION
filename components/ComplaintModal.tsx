import React, { useState } from 'react';
import { X, MessageSquareWarning, ArrowRight } from 'lucide-react';

interface ComplaintModalProps {
  onClose: () => void;
  onSubmit: (type: string, description: string) => void;
}

export function ComplaintModal({ onClose, onSubmit }: ComplaintModalProps) {
  const [type, setType] = useState<'Maintenance' | 'Noise' | 'Cleanliness' | 'Other'>('Maintenance');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a short description about the issue.');
      return;
    }
    onSubmit(type, description.trim());
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" id="complaint-modal">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col relative">
        
        {/* Accent strip */}
        <div className="bg-indigo-600 h-2 w-full" />

        {/* Header bar */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MessageSquareWarning size={20} className="text-indigo-650" /> File Maintenance Ticket
            </h2>
            <p className="text-xs text-slate-400 mt-1">Submit hostel facility issues directly to the warden</p>
          </div>
          <button 
            onClick={onClose}
            id="btn-complaint-modal-close"
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form panel body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" id="complaint-form">
          {error && (
            <div className="bg-rose-50 text-rose-905 p-3 rounded-xl text-xs border border-rose-100">
              {error}
            </div>
          )}

          {/* Issue category list */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Issue Category</span>
            <div className="grid grid-cols-2 gap-2">
              {(['Maintenance', 'Noise', 'Cleanliness', 'Other'] as const).map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setType(cat)}
                  id={`btn-select-cat-${cat}`}
                  className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all text-center cursor-pointer ${
                    type === cat
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-350'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Issue description */}
          <div className="space-y-1.5">
            <label htmlFor="issue-description-input" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Describe the Issue</label>
            <textarea
              id="issue-description-input"
              rows={4}
              placeholder="e.g. Geyser is not heating on Floor 3 Room 303..."
              value={description}
              onChange={e => {
                setDescription(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-808 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              maxLength={400}
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={onClose}
              id="btn-cancel-complaint"
              type="button"
              className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 active:scale-97 transition-colors text-center"
            >
              Cancel
            </button>
            <button
              id="btn-submit-complaint"
              type="submit"
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 active:scale-97 transition-all text-center border border-indigo-600"
            >
              Submit Ticket <ArrowRight size={14} />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
