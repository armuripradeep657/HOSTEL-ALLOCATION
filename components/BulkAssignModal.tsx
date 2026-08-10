import React, { useState, useMemo } from 'react';
import { User, Room, UserRole, Bed, Hostel } from '../types';
import { HOSTELS } from '../constants';
import { X, Cpu, Check, Users, ShieldAlert, Sparkles } from 'lucide-react';

interface BulkAssignModalProps {
  users: User[];
  rooms: Room[];
  onClose: () => void;
  onAssign: (assignments: { userId: string; roomId: string; bedId: string }[]) => void;
  hostels?: Hostel[];
}

export function BulkAssignModal({
  users,
  rooms,
  onClose,
  onAssign,
  hostels = HOSTELS
}: BulkAssignModalProps) {
  // Find all unassigned students in the system
  const unassignedStudents = useMemo(() => {
    return users.filter(u => u.role === UserRole.STUDENT && !u.assignedRoomId);
  }, [users]);

  // Find all available empty or partially-occupied beds across all blocks
  const availableBeds = useMemo(() => {
    const bedsList: { room: Room; bed: Bed }[] = [];
    rooms.forEach(room => {
      if (room.status === 'Maintenance') return;
      room.beds.forEach(bed => {
        if (bed.status === 'Available') {
          bedsList.push({ room, bed });
        }
      });
    });
    return bedsList;
  }, [rooms]);

  // Assignments preview state
  const [assignments, setAssignments] = useState<{ userId: string; userName: string; roomId: string; roomNumber: string; bedId: string }[]>([]);
  const [isGenerated, setIsGenerated] = useState(false);

  // Auto matching algorithm
  const handleAutoGenerate = () => {
    const newAssignments: typeof assignments = [];
    const usedBeds = new Set<string>();

    // Copy arrays for index track
    const studentsRemaining = [...unassignedStudents];
    
    studentsRemaining.forEach(student => {
      // Find hostel of correct gender
      const matchingBeds = availableBeds.filter(({ room, bed }) => {
        const hostel = hostels.find(h => h.id === room.hostelId);
        if (!hostel) return false;

        // Gender restriction check
        const hostelGenderMatch = 
          (student.gender === 'Male' && hostel.type === 'Boys') ||
          (student.gender === 'Female' && hostel.type === 'Girls');

        return hostelGenderMatch && !usedBeds.has(bed.id);
      });

      // Best match by roommate tags similarity (Score compatibility)
      let bestBedIndex = -1;
      let highestScore = -1;

      for (let i = 0; i < matchingBeds.length; i++) {
        const candidate = matchingBeds[i];
        
        // Find other occupants in candidate room
        const roomOccupants = candidate.room.beds
          .filter(b => b.status === 'Occupied' && b.occupantId)
          .map(b => users.find(u => u.id === b.occupantId))
          .filter(Boolean) as User[];

        let matchScore = 0;
        roomOccupants.forEach(occ => {
          const commonTags = student.tags?.filter(t => occ.tags?.includes(t)) || [];
          matchScore += commonTags.length;
        });

        if (matchScore > highestScore) {
          highestScore = matchScore;
          bestBedIndex = i;
        }
      }

      if (bestBedIndex !== -1) {
        const selected = matchingBeds[bestBedIndex];
        newAssignments.push({
          userId: student.id,
          userName: student.name,
          roomId: selected.room.id,
          roomNumber: selected.room.number,
          bedId: selected.bed.id
        });
        usedBeds.add(selected.bed.id);
      }
    });

    setAssignments(newAssignments);
    setIsGenerated(true);
  };

  const handleExecute = () => {
    const payload = assignments.map(a => ({
      userId: a.userId,
      roomId: a.roomId,
      bedId: a.bedId
    }));
    onAssign(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" id="bulk-assign-modal">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col relative max-h-[90vh]">
        
        {/* Accent border */}
        <div className="bg-indigo-600 h-2 w-full" />

        {/* Header bar */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Cpu size={20} className="text-indigo-650 animate-pulse" /> Auto-Compat allocator
            </h2>
            <p className="text-xs text-slate-400 mt-1">Bulk-allocate unassigned students using roommate match scorers</p>
          </div>
          <button 
            onClick={onClose}
            id="btn-bulk-assign-close"
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wide">Unassigned Students</span>
              <strong className="text-2xl font-black text-slate-800">{unassignedStudents.length}</strong>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wide">Vacant System Beds</span>
              <strong className="text-2xl font-black text-slate-805">{availableBeds.length}</strong>
            </div>
          </div>

          {unassignedStudents.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center text-slate-450 flex flex-col items-center gap-2">
              <Check className="text-emerald-500 bg-emerald-50 border border-emerald-100 p-2 rounded-2xl w-10 h-10 animate-bounce" />
              <p className="text-xs font-bold">Absolutely No Unassigned Students!</p>
              <span className="text-[10px] text-slate-400">All student profiles are already assigned to active beds.</span>
            </div>
          ) : !isGenerated ? (
            <div className="space-y-4" id="generator-welcome">
              <div className="bg-indigo-50 border border-indigo-105 p-4 rounded-2xl flex items-start gap-3">
                <Sparkles size={18} className="text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs text-indigo-905 leading-relaxed">
                  <strong className="font-bold">Smart Allocator Node active.</strong> Clicking auto-generate will pair students to vacancies based on compatibility tag intersections (Gamer tags, Sleep times) while strictly honoring separate gender block parameters.
                </div>
              </div>
              <button
                type="button"
                onClick={handleAutoGenerate}
                id="btn-trigger-bulk-auto"
                className="w-full py-4 bg-indigo-650 hover:bg-indigo-600 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-650/25 active:scale-97 transition-all flex items-center justify-center gap-2 border border-indigo-600 cursor-pointer"
              >
                <span>Generate Smart Assignments ({unassignedStudents.length} Students)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3" id="assignments-preview">
              <h3 className="text-xs font-black uppercase text-slate-450 tracking-wider">Assignments Preview Mappins</h3>
              
              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden max-h-56 overflow-y-auto">
                {assignments.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No compliant pairings could be established. Check gender block limits.
                  </div>
                ) : (
                  assignments.map(item => (
                    <div key={item.userId} className="p-3 bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <strong className="font-bold text-slate-800 block">{item.userName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{item.userId}</span>
                      </div>
                      <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600">
                        Room {item.roomNumber} · Bed {item.bedId.split('-').pop()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGenerated(false)}
                  id="btn-re-generate"
                  className="flex-1 py-3 px-4 bg-white border border-slate-250 text-slate-500 hover:bg-slate-50 rounded-xl font-bold text-xs text-center cursor-pointer"
                >
                  Reset Generator
                </button>
                <button
                  type="button"
                  onClick={handleExecute}
                  id="btn-execute-bulk"
                  disabled={assignments.length === 0}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-505 disabled:bg-slate-200 disabled:text-slate-450 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10 active:scale-97 transition-all text-center border border-emerald-600"
                >
                  Confirm bulk allocation
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
