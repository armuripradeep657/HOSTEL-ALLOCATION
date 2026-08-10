import React from 'react';
import { Complaint, UserRole } from '../types';
import { X, Check, MessageSquareCode, Clock, ShieldAlert } from 'lucide-react';

interface ComplaintsPanelProps {
  complaints: Complaint[];
  role: UserRole;
  onResolve: (id: string) => void;
  onClose: () => void;
}

export function ComplaintsPanel({
  complaints,
  role,
  onResolve,
  onClose
}: ComplaintsPanelProps) {
  const isAdmin = role === UserRole.ADMIN;

  return (
    <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl border-l border-slate-200 z-[100] flex flex-col animate-in slide-in-from-right duration-350" id="complaints-panel">
      
      {/* Accent head */}
      <div className="bg-indigo-600 h-2 w-full" />

      {/* Header bar */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <MessageSquareCode size={20} className="text-indigo-650" /> Facility Tickets
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin ? 'Active student facility issue reports' : 'My submitted service ticket history'}
          </p>
        </div>
        <button 
          onClick={onClose}
          id="btn-complaints-panel-close"
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scroll list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-2">
            <Clock size={36} className="opacity-30 mb-2" />
            <h4 className="font-bold text-slate-650 text-sm">No Tickets!</h4>
            <p className="text-xs">No complaints or maintenance tickets on record.</p>
          </div>
        ) : (
          [...complaints].reverse().map(c => {
            const dateStr = new Date(c.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
            const isPending = c.status === 'Pending';

            return (
              <div 
                key={c.id} 
                className={`border rounded-2xl p-4.5 space-y-3 transition-colors ${
                  isPending 
                    ? 'bg-amber-50/20 border-amber-200' 
                    : 'bg-slate-50/30 border-slate-200'
                }`}
                id={`complaint-item-${c.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] bg-slate-105 border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-bold uppercase">
                      {c.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1.5">{dateStr}</span>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                    isPending 
                      ? 'bg-amber-100 text-amber-805 border border-amber-200' 
                      : 'bg-emerald-100 text-emerald-805 border border-emerald-200'
                  }`}>
                    {c.status}
                  </span>
                </div>

                <div className="bg-white border border-slate-100/80 p-3 rounded-xl">
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">{c.description}</p>
                </div>

                <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 font-bold whitespace-nowrap min-w-0">
                  <span className="truncate">Student: <strong className="text-slate-650">{c.studentName} ({c.studentId})</strong></span>
                  {isAdmin && isPending && (
                    <button
                      onClick={() => onResolve(c.id)}
                      id={`btn-resolve-complaint-${c.id}`}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-2.5 py-1 font-black shadow-md shadow-indigo-600/10 active:scale-95 transition-all text-center border border-indigo-610"
                    >
                      Resolve Status
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
