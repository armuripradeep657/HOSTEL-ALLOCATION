import React from 'react';
import { BookingRequest, Room } from '../types';
import { X, Check, XCircle, Clock, Users, ArrowUpRight } from 'lucide-react';

interface BookingRequestsPanelProps {
  requests: BookingRequest[];
  rooms: Room[];
  onApprove: (request: BookingRequest) => void;
  onReject: (request: BookingRequest) => void;
  onClose: () => void;
}

export function BookingRequestsPanel({
  requests,
  rooms,
  onApprove,
  onReject,
  onClose
}: BookingRequestsPanelProps) {
  // Find room and floor for display
  const getRoomInfo = (roomId: string) => {
    const r = rooms.find(room => room.id === roomId);
    if (!r) return { number: '?', floor: '?' };
    return { number: r.number, floor: r.floor };
  };

  return (
    <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl border-l border-slate-200 z-[100] flex flex-col animate-in slide-in-from-right duration-350" id="booking-requests-panel">
      {/* Panel bar accent */}
      <div className="bg-indigo-600 h-2 w-full" />

      {/* Header bar */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users size={20} className="text-indigo-650" /> Allocation Approvals
          </h2>
          <p className="text-xs text-slate-400 mt-1">Pending allocation requests from hostel freshman</p>
        </div>
        <button 
          onClick={onClose}
          id="btn-requests-panel-close"
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-2">
            <Clock size={36} className="opacity-30 mb-2" />
            <h4 className="font-bold text-slate-650 text-sm">All Caught Up!</h4>
            <p className="text-xs">No pending student allocation tickets on this queue.</p>
          </div>
        ) : (
          requests.map(req => {
            const room = getRoomInfo(req.roomId);
            const dateStr = new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div 
                key={req.id} 
                className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4.5 space-y-4 hover:border-indigo-200 transition-colors"
                id={`req-item-${req.id}`}
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-slate-800 leading-tight truncate">{req.studentName}</h4>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">UID: {req.studentId}</span>
                  </div>
                  <span className="text-[10px] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg text-indigo-600 font-bold whitespace-nowrap">
                    Clock {dateStr}
                  </span>
                </div>

                <div className="bg-white border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Requested Location</span>
                    <strong className="text-xs text-slate-705">Room Block {room.number} · Bed {req.bedId.split('-').pop()}</strong>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Floor {room.floor}
                  </div>
                </div>

                {/* Confirm rejection actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove(req)}
                    id={`btn-approve-req-${req.id}`}
                    className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-97 transition-all border border-indigo-600"
                  >
                    <Check size={14} /> Approve Assign
                  </button>
                  <button
                    onClick={() => onReject(req)}
                    id={`btn-reject-req-${req.id}`}
                    className="py-1.5 px-3 bg-white border border-slate-200 text-slate-500 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-605 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-97 transition-all text-center"
                  >
                    <XCircle size={14} /> Decline
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
