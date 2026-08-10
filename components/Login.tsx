import React, { useState } from 'react';
import { User } from '../types';
import { Building2, LogIn, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

export function Login({ onLogin, users }: LoginProps) {
  const [customId, setCustomId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customId.trim()) {
      setError('Please enter a User ID.');
      return;
    }
    const user = users.find(u => u.id.toLowerCase() === customId.trim().toLowerCase());
    if (user) {
      if (user.password && user.password !== password) {
        setError('Incorrect password. Please try again.');
        return;
      }
      onLogin(user);
    } else {
      setError(`UID "${customId}" not found. Please contact administration for authorization.`);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden" id="login-screen">
      {/* Background patterns: extremely subtle on pure white */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.04] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600 blur-3xl" />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col z-10" id="login-container">
        {/* Banner Section */}
        <div className="bg-indigo-600 px-10 py-12 text-white flex flex-col items-center text-center relative rounded-t-3xl">
          <div className="p-4 bg-white/10 rounded-2xl mb-4 backdrop-blur-md">
            <Building2 size={42} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tight">Hostel Allocation</h1>
        </div>

        {/* Form Body */}
        <div className="p-10 flex-1 flex flex-col gap-8 bg-white rounded-b-3xl">
          {error && (
            <div className="bg-rose-50 text-rose-900 border border-rose-100 p-4 rounded-xl text-sm flex items-start gap-3" id="login-error">
              <ShieldAlert size={20} className="text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form manual ID */}
          <form onSubmit={handleCustomLogin} className="space-y-6" id="login-form">
            <div className="space-y-2">
              <label htmlFor="user-id-input" className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                Enter Register No / User ID
              </label>
              <input
                id="user-id-input"
                type="text"
                placeholder="Enter your user ID..."
                value={customId}
                onChange={e => {
                  setCustomId(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-base"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="user-password-input" className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                Password
              </label>
              <input
                id="user-password-input"
                type="password"
                placeholder="Enter your password..."
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-base"
              />
            </div>

            <button
              id="btn-login-custom"
              type="submit"
              className="w-full py-4 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-base tracking-wide shadow-md hover:shadow-lg hover:shadow-indigo-600/10 active:scale-98 transition-all text-center flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <LogIn size={20} />
              <span>Sign In</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
