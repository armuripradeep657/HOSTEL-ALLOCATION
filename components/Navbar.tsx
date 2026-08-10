import React from 'react';
import { User, UserRole } from '../types';
import { Building, LogOut, User as UserIcon, MessageSquareWarning, Bell, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onOpenProfile: () => void;
  onDashboardClick: () => void;
  onOpenComplaints: () => void;
  pendingRequestsCount: number;
  pendingComplaintsCount: number;
  onOpenNotifications: () => void;
}

export function Navbar({
  user,
  onLogout,
  onOpenProfile,
  onDashboardClick,
  onOpenComplaints,
  pendingRequestsCount,
  pendingComplaintsCount,
  onOpenNotifications
}: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 flex items-center justify-between" id="app-navbar">
      {/* Brand Logo & Name */}
      <button 
        onClick={onDashboardClick}
        className="flex items-center gap-3.5 hover:opacity-80 transition-opacity text-left cursor-pointer"
        id="btn-navbar-logo"
      >
        <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-505/20">
          <Building size={20} />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none font-mono">HOSTEL</h1>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5 block leading-none">Hostel Manager</span>
        </div>
      </button>

      {/* Navigations & Indicators */}
      <div className="flex items-center gap-2">
        {/* Dashboard Button */}
        <button
          onClick={onDashboardClick}
          id="btn-navbar-dashboard"
          className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all flex items-center gap-2 text-sm font-bold"
          title="Go to Dashboard"
        >
          <LayoutDashboard size={20} />
          <span className="hidden md:inline">Dashboard</span>
        </button>

        {/* Complaints Notification Badge */}
        <button
          onClick={onOpenComplaints}
          id="btn-navbar-complaints"
          className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-all relative flex items-center gap-2 text-sm font-bold"
          title="Complaints"
        >
          <MessageSquareWarning size={20} />
          <span className="hidden md:inline">Complaints</span>
          {pendingComplaintsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 md:right-1 md:top-1.5 min-w-[18px] h-[18px] rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center px-1 border-2 border-white animate-pulse">
              {pendingComplaintsCount}
            </span>
          )}
        </button>

        {/* Requests & Broadcasts Modal/Dashboard Selector */}
        <button
          onClick={onOpenNotifications}
          id="btn-navbar-notifications"
          className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-650 transition-all relative flex items-center gap-2 text-sm font-bold"
          title={user.role === UserRole.ADMIN ? 'Pending Booking Requests' : 'Broadcast Alerts'}
        >
          <Bell size={20} />
          <span className="hidden md:inline">
            {user.role === UserRole.ADMIN ? 'Requests' : 'Alerts'}
          </span>
          {pendingRequestsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 md:right-1 md:top-1.5 min-w-[18px] h-[18px] rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center px-1 border-2 border-white">
              {pendingRequestsCount}
            </span>
          )}
        </button>

        <div className="h-6 w-[1px] bg-slate-200 mx-2" />

        {/* User Card Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            id="btn-navbar-profile"
            className="flex items-center gap-2.5 p-1 px-2.5 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-2xl transition-all text-left cursor-pointer"
          >
            <img
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
              alt={user.name}
              className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
            />
            <div className="hidden lg:block">
              <div className="text-xs font-black text-slate-800 leading-tight truncate max-w-[110px]">{user.name}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mt-0.5">{user.role}</div>
            </div>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            id="btn-navbar-logout"
            className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
