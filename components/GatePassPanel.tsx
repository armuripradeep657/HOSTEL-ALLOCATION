import React from 'react';
import { GatePassRequest, UserRole } from '../types';
import { X, Check, XCircle, Calendar, ShieldCheck, HelpCircle } from 'lucide-react';

interface GatePassPanelProps {
  requests: GatePassRequest[];
  role: UserRole;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onClose: () => void;
}

export function GatePassPanel({
  requests,
  role,
  onApprove,
  onReject,
  onClose
}: GatePassPanelProps) {
  const isAdmin = role === UserRole.ADMIN;

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl border-l border-slate-200 z-[100] flex flex-col animate-in slide-in-from-right duration-350" id="gatepass-panel">
      
      {/* Top Tag bar */}
      <div className="bg-indigo-600 h-2 w-full" />

      {/* Header bar */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-indigo-650" /> Outing Passes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isAdmin ? 'Review active outbound campus outing logs' : 'My submitted campus outing permissions'}
          </p>
        </div>
        <button 
          onClick={onClose}
          id="btn-gatepass-panel-close"
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Outing requests feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-2">
            <HelpCircle size={36} className="opacity-30 mb-2" />
            <h4 className="font-bold text-slate-650 text-sm">No Active Outings!</h4>
            <p className="text-xs">No active or historic outing requests found.</p>
          </div>
        ) : (
          [...requests].reverse().map(req => {
            const isPending = req.status === 'Pending';
            const isApproved = req.status === 'Approved';
            const isRejected = req.status === 'Rejected';

            return (
              <div 
                key={req.id} 
                className={`border rounded-2xl p-4.5 space-y-3.5 transition-colors ${
                  isPending 
                    ? 'bg-amber-50/25 border-amber-200' 
                    : isRejected
                      ? 'bg-rose-50/15 border-rose-100'
                      : 'bg-slate-50/30 border-slate-200'
                }`}
                id={`gatepass-item-${req.id}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <h4 className="text-sm font-black text-slate-850 leading-none truncate">{req.studentName}</h4>
                    <span className="text-[10px] font-mono text-slate-400 block mt-1">UID: {req.studentId}</span>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border ${
                    isPending ? 'bg-amber-100 text-amber-805 border-amber-200' :
                    isApproved ? 'bg-emerald-100 text-emerald-805 border-emerald-205' :
                    'bg-slate-150 text-slate-500 border-slate-200'
                  }`}>
                    {req.status}
                  </span>
                </div>

                {/* Calendar details */}
                <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Calendar size={14} className="text-indigo-405 shrink-0" />
                    <span>Departure:</span>
                    <strong className="text-slate-800 font-bold ml-auto">{formatDate(req.departureDate)}</strong>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-605">
                    <Calendar size={14} className="text-indigo-405 shrink-0" />
                    <span>Arrival:</span>
                    <strong className="text-slate-800 font-bold ml-auto">{formatDate(req.returnDate)}</strong>
                  </div>
                </div>

                {/* outing details */}
                <div className="bg-white/80 p-3.5 border border-slate-100 rounded-xl text-xs text-slate-650 leading-relaxed font-sans">
                  {req.reason}
                </div>

                {/* Actions if Admin & Pending */}
                {isAdmin && isPending && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApprove(req.id)}
                      id={`btn-approve-gp-${req.id}`}
                      className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-97 transition-all border border-indigo-610"
                    >
                      <Check size={14} /> Approve Pass
                    </button>
                    <button
                      onClick={() => onReject(req.id)}
                      id={`btn-reject-gp-${req.id}`}
                      className="py-1.5 px-3 bg-white border border-slate-250 text-slate-500 hover:bg-rose-50 hover:border-rose-250 hover:text-rose-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-97 transition-all"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
