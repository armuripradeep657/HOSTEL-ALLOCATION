import React from 'react';
import { BroadcastMessage } from '../types';
import { X, Bell, AlertTriangle, MessageSquareQuote, Check } from 'lucide-react';

interface NotificationsPanelProps {
  messages: BroadcastMessage[];
  onClose: () => void;
}

export function NotificationsPanel({ messages, onClose }: NotificationsPanelProps) {
  return (
    <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl border-l border-slate-200 z-[100] flex flex-col animate-in slide-in-from-right duration-350" id="notifications-panel">
      
      {/* Top tag Accent */}
      <div className="bg-indigo-600 h-2 w-full" />

      {/* Header bar */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Bell size={20} className="text-indigo-650" /> Broadcast Alerts
          </h2>
          <p className="text-xs text-slate-400 mt-1">Official warden dashboard bulletin board logs</p>
        </div>
        <button 
          onClick={onClose}
          id="btn-notifications-panel-close"
          className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-405 hover:text-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Message feed scroll container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 space-y-2">
            <Check size={36} className="text-emerald-500 bg-emerald-50 p-2.5 rounded-full mb-2 animate-bounce" />
            <h4 className="font-bold text-slate-650 text-sm">All Clear!</h4>
            <p className="text-xs">No active broadcasts or emergency bulletins found.</p>
          </div>
        ) : (
          [...messages].reverse().map(msg => {
            const dateStr = new Date(msg.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            const isHigh = msg.priority === 'High';

            return (
              <div 
                key={msg.id} 
                className={`border rounded-2xl p-4.5 space-y-3.5 transition-colors relative overflow-hidden ${
                  isHigh 
                    ? 'bg-rose-50/20 border-rose-200 shadow-sm' 
                    : 'bg-slate-50/50 border-slate-200'
                }`}
                id={`broadcast-item-${msg.id}`}
              >
                {/* Visual marker */}
                {isHigh && (
                  <div className="absolute top-0 right-0 py-1 px-2 text-[9px] uppercase font-black text-white bg-rose-650 rounded-bl-xl tracking-wide flex items-center gap-1">
                    <AlertTriangle size={10} /> Urgent Notification
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wide">
                      Sender: {msg.sender}
                    </h4>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">{dateStr}</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-150 p-3.5 rounded-2xl">
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">{msg.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
