import React, { useState } from 'react';
import { X, CalendarDays, ArrowRight } from 'lucide-react';

interface GatePassModalProps {
  onClose: () => void;
  onSubmit: (departureDate: string, returnDate: string, reason: string) => void;
}

export function GatePassModal({ onClose, onSubmit }: GatePassModalProps) {
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departureDate || !returnDate || !reason.trim()) {
      setError('Please fill in all outing request fields.');
      return;
    }

    if (new Date(departureDate) > new Date(returnDate)) {
      setError('Departure date cannot be after return date.');
      return;
    }

    onSubmit(departureDate, returnDate, reason.trim());
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" id="gatepass-modal">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full overflow-hidden flex flex-col relative">
        
        {/* Accent board block */}
        <div className="bg-indigo-600 h-2 w-full" />

        {/* Header bar */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <CalendarDays size={20} className="text-indigo-650" /> Register Outing Pass
            </h2>
            <p className="text-xs text-slate-400 mt-1">Submit campus leave permissions to Warden approval</p>
          </div>
          <button 
            onClick={onClose}
            id="btn-gatepass-modal-close"
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form panel body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" id="gatepass-form">
          {error && (
            <div className="bg-rose-50 text-rose-900 border border-rose-100 p-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Departure */}
            <div className="space-y-1.5">
              <label htmlFor="departure-date-input" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Departure Date/Time</label>
              <input
                id="departure-date-input"
                type="datetime-local"
                value={departureDate}
                onChange={e => {
                  setDepartureDate(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2.5 px-4 text-slate-800 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-all text-xs"
                required
              />
            </div>

            {/* Return */}
            <div className="space-y-1.5">
              <label htmlFor="return-date-input" className="text-xs font-bold text-slate-500 uppercase tracking-wide">Returning Date/Time</label>
              <input
                id="return-date-input"
                type="datetime-local"
                value={returnDate}
                onChange={e => {
                  setReturnDate(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50 border border-slate-205 rounded-xl py-2.5 px-4 text-slate-800 focus:outline-none focus:border-indigo-555 focus:ring-1 focus:ring-indigo-555 transition-all text-xs"
                required
              />
            </div>
          </div>

          {/* Outing reason */}
          <div className="space-y-1.5">
            <label htmlFor="outing-reason-input" className="text-xs font-bold text-slate-505 uppercase tracking-wide">Outing Reason Details</label>
            <textarea
              id="outing-reason-input"
              rows={3}
              placeholder="e.g. Traveling back to my hometown for Diwali break..."
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                setError('');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-slate-808 focus:outline-none focus:border-indigo-550 focus:ring-1 focus:ring-indigo-550 transition-all text-sm"
              maxLength={250}
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={onClose}
              id="btn-cancel-gatepass"
              type="button"
              className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 active:scale-97 transition-colors text-center"
            >
              Cancel
            </button>
            <button
              id="btn-submit-gatepass"
              type="submit"
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-550 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 active:scale-97 transition-all text-center border border-indigo-600"
            >
              Submit Gate Pass <ArrowRight size={14} />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
