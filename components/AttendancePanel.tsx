import React, { useState, useMemo } from 'react';
import { Room, User, Hostel, AttendanceRecord } from '../types';
import { X, Check, Eye, ClipboardCheck, Users, HelpCircle, Download } from 'lucide-react';

interface AttendancePanelProps {
  rooms: Room[];
  users: User[];
  selectedHostel: Hostel;
  attendanceHistory?: AttendanceRecord[];
  onClose: () => void;
  onSave: (date: string, records: { studentId: string; roomId: string; status: 'Present' | 'Absent' }[]) => void;
}

export function AttendancePanel({
  rooms,
  users,
  selectedHostel,
  attendanceHistory = [],
  onClose,
  onSave
}: AttendancePanelProps) {
  // Find all students assigned to this hostel
  const residents = useMemo(() => {
    return users.filter(u => {
      if (!u.assignedRoomId) return false;
      return u.assignedRoomId.startsWith(`${selectedHostel.id}-`);
    });
  }, [users, selectedHostel]);

  // Today's date String
  const todayISO = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Set initial status records
  const [records, setRecords] = useState<Record<string, 'Present' | 'Absent'>>(() => {
    const initial: Record<string, 'Present' | 'Absent'> = {};
    residents.forEach(res => {
      initial[res.id] = 'Present';
    });
    return initial;
  });

  const handleToggleStatus = (studentId: string, status: 'Present' | 'Absent') => {
    setRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = () => {
    const recordsArray = residents.map(res => ({
      studentId: res.id,
      roomId: res.assignedRoomId!,
      status: records[res.id] || 'Present'
    }));

    onSave(todayISO, recordsArray);
  };

  const handleExportCSV = () => {
    if (residents.length === 0) return;
    
    // Generate CSV content for active marking
    const headers = ["Student ID", "Student Name", "Room ID", "Room Number", "Status", "Date", "Hostel Name"];
    const rows = residents.map(st => {
      const roomNum = st.assignedRoomId?.split('-')[1] || '?';
      const status = records[st.id] || 'Present';
      return [
        st.id,
        `"${st.name.replace(/"/g, '""')}"`,
        st.assignedRoomId || '',
        roomNum,
        status,
        todayISO,
        `"${selectedHostel.name.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    // Download flow
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_${selectedHostel.id}_${todayISO}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllHistoryCSV = () => {
    // Filter records in history for this hostel
    const hostelRecords = attendanceHistory.filter(h => h.hostelId === selectedHostel.id);
    
    if (hostelRecords.length === 0) {
      alert(`No saved historical attendance logs found for ${selectedHostel.name}. Saving a record using "Save Daily Record" creates one.`);
      return;
    }

    // Generate full historical CSV content
    const headers = ["Date", "Student ID", "Student Name", "Room ID", "Status", "Hostel Name"];
    const rows: string[][] = [];

    hostelRecords.forEach(record => {
      record.records.forEach(r => {
        const student = users.find(u => u.id === r.studentId);
        const name = student ? student.name : `ID: ${r.studentId}`;
        rows.push([
          record.date,
          r.studentId,
          `"${name.replace(/"/g, '""')}"`,
          r.roomId,
          r.status,
          `"${selectedHostel.name.replace(/"/g, '""')}"`
        ]);
      });
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    // Download flow
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Attendance_History_${selectedHostel.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" id="attendance-panel-popup">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full overflow-hidden flex flex-col relative max-h-[90vh]">
        
        {/* Accent bar */}
        <div className="bg-indigo-600 h-2 w-full" />

        {/* Header bar */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ClipboardCheck size={20} className="text-indigo-650" /> Daily roll-call
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Mark student room roll-call for <strong className="font-bold text-slate-700">{selectedHostel.name}</strong> · {todayISO}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {residents.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                id="btn-attendance-export-csv"
                title="Export current attendance list as CSV"
                className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 border border-indigo-100/50 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95"
              >
                <Download size={14} className="shrink-0" />
                <span>Export CSV</span>
              </button>
            )}
            <button 
              onClick={onClose}
              id="btn-attendance-panel-close"
              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Attendance roll list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {residents.length > 0 && (
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2" id="download-attendance-controls">
              <div>
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                  <Download size={12} className="text-indigo-650 shrink-0" /> Local Downloads
                </h4>
                <p className="text-[11px] text-indigo-600 mt-0.5">
                  Export attendance lists for {selectedHostel.name}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  id="btn-attendance-export-marked-csv"
                  title="Download the currently marked attendance for today"
                  className="flex-1 sm:flex-initial py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 text-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5 text-[11px] font-black cursor-pointer active:scale-95 shadow-sm shadow-slate-100"
                >
                  <Download size={12} className="text-slate-550" />
                  <span>Today's Marklist</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadAllHistoryCSV}
                  id="btn-attendance-export-history-csv"
                  title="Download the complete saved historical attendance logs database for this hostel"
                  className="flex-1 sm:flex-initial py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center justify-center gap-1.5 text-[11px] font-black cursor-pointer active:scale-95 shadow-md shadow-indigo-600/15"
                >
                  <Download size={12} className="text-indigo-100" />
                  <span>Full Saved Logs</span>
                </button>
              </div>
            </div>
          )}

          {residents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <Users size={36} className="opacity-30 mb-2" />
              <h4 className="font-bold text-slate-600 text-sm">No Residents Assigned</h4>
              <p className="text-xs max-w-xs mt-1">Allocate students to rooms first using the interactive 3D map or Bulk Allocator.</p>
            </div>
          ) : (
            <div className="space-y-2" id="attendance-students-list">
              {residents.map(student => {
                const roomNum = student.assignedRoomId?.split('-')[1] || '?';
                const status = records[student.id] || 'Present';

                return (
                  <div 
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl gap-3.5 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={student.avatarUrl || `https://ui-avatars.com/api/?name=${student.name}&background=random`} 
                        alt={student.name} 
                        className="w-9 h-9 rounded-full border border-slate-205 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-black text-slate-800 truncate leading-tight">{student.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5 whitespace-nowrap">
                          <span>Room No {roomNum}</span>
                          <span>·</span>
                          <span>ID: {student.id}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(student.id, 'Present')}
                        id={`btn-mark-present-${student.id}`}
                        className={`py-1.5 px-3.5 rounded-lg text-xs font-black border transition-all text-center cursor-pointer ${
                          status === 'Present'
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(student.id, 'Absent')}
                        id={`btn-mark-absent-${student.id}`}
                        className={`py-1.5 px-3.5 rounded-lg text-xs font-black border transition-all text-center cursor-pointer ${
                          status === 'Absent'
                            ? 'bg-rose-600 border-rose-600 text-white shadow-sm shadow-rose-600/10'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 flex gap-2 shrink-0">
          <button
            onClick={onClose}
            id="btn-attendance-cancel"
            type="button"
            className="flex-1 py-3 px-4 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 active:scale-97 transition-colors text-center"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            id="btn-attendance-submit"
            disabled={residents.length === 0}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-505 disabled:bg-slate-200 disabled:border-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 active:scale-97 transition-all text-center border border-indigo-600"
          >
            Save Daily Record
          </button>
        </div>

      </div>
    </div>
  );
}
