import React, { useState, useMemo } from 'react';
import { Room, RoomStatus } from '../types';
import { Video, Layers, Users, ShieldAlert, CheckCircle2, ChevronRight, HelpCircle, Search, X } from 'lucide-react';

interface FloorMapProps {
  rooms: Room[];
  onRoomClick: (room: Room) => void;
  selectedRoomId?: string;
  gridCols: number;
  onOpenCCTV: (floor: number) => void;
  showCCTV: boolean;
}

export function FloorMap({
  rooms,
  onRoomClick,
  selectedRoomId,
  gridCols,
  onOpenCCTV,
  showCCTV
}: FloorMapProps) {
  // Find all unique floors in the supplied rooms
  const floors = useMemo(() => {
    const uniqueFloors = Array.from(new Set(rooms.map(r => r.floor)));
    return uniqueFloors.sort((a, b) => a - b);
  }, [rooms]);

  // Handle active floor state selection
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [capacityFilter, setCapacityFilter] = useState<string>('All');

  // Multi-criteria room matching checker
  const isRoomMatch = useMemo(() => {
    return (room: Room, query: string, statusFil: string, capFil: string) => {
      // 1. Check status filter
      if (statusFil !== 'All' && room.status !== statusFil) {
        return false;
      }
      
      // 2. Check capacity filter
      if (capFil !== 'All' && room.capacity !== parseInt(capFil, 10)) {
        return false;
      }

      // 3. Check search query if present
      if (query.trim() !== '') {
        const q = query.toLowerCase().trim();
        const matchNumber = room.number.toLowerCase().includes(q);
        const matchType = room.type.toLowerCase().includes(q);
        const matchStatus = room.status.toLowerCase().includes(q);
        const qNum = parseInt(q, 10);
        const matchCapacity = !isNaN(qNum) && (
          room.capacity === qNum || 
          room.type.toLowerCase().includes(`${qNum}-in-1`) || 
          room.type.toLowerCase().includes(`${qNum} bed`)
        );
        
        return matchNumber || matchType || matchStatus || matchCapacity;
      }

      return true;
    };
  }, []);

  const hasActiveFilter = useMemo(() => {
    return searchQuery.trim() !== '' || statusFilter !== 'All' || capacityFilter !== 'All';
  }, [searchQuery, statusFilter, capacityFilter]);

  // Count matches on each floor for indicator badge
  const floorMatches = useMemo(() => {
    const counts: Record<number, number> = {};
    if (!hasActiveFilter) return counts;
    
    rooms.forEach(r => {
      const isMatch = isRoomMatch(r, searchQuery, statusFilter, capacityFilter);
      if (isMatch) {
        counts[r.floor] = (counts[r.floor] || 0) + 1;
      }
    });
    return counts;
  }, [rooms, searchQuery, statusFilter, capacityFilter, hasActiveFilter, isRoomMatch]);

  // If active floor is not in the list of available floors for this hostel, pick the first one
  const safeActiveFloor = useMemo(() => {
    if (floors.includes(activeFloor)) return activeFloor;
    return floors[0] || 1;
  }, [floors, activeFloor]);

  // Filter rooms on the active floor
  const floorRooms = useMemo(() => {
    return rooms.filter(r => r.floor === safeActiveFloor).sort((a, b) => parseInt(a.number) - parseInt(b.number));
  }, [rooms, safeActiveFloor]);

  // Define status colors & styles
  const getStatusStyles = (status: RoomStatus) => {
    switch (status) {
      case RoomStatus.AVAILABLE:
        return {
          bg: 'bg-emerald-50 border-emerald-200 hover:border-emerald-500 hover:shadow-emerald-100',
          badge: 'bg-emerald-100 text-emerald-800',
          text: 'text-emerald-900',
          glow: 'group-hover:bg-emerald-400',
        };
      case RoomStatus.OCCUPIED:
        return {
          bg: 'bg-indigo-50 border-indigo-200 hover:border-indigo-500 hover:shadow-indigo-100',
          badge: 'bg-indigo-100 text-indigo-800',
          text: 'text-indigo-900',
          glow: 'group-hover:bg-indigo-400',
        };
      case RoomStatus.MAINTENANCE:
        return {
          bg: 'bg-amber-50 border-amber-200 hover:border-amber-500 hover:shadow-amber-100',
          badge: 'bg-amber-100 text-amber-800',
          text: 'text-amber-900',
          glow: 'group-hover:bg-amber-400',
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200',
          badge: 'bg-slate-100 text-slate-800',
          text: 'text-slate-905',
          glow: 'group-hover:bg-slate-400',
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-6" id="floor-map-layout">
      {/* Floor selection sidebar */}
      <div className="md:col-span-3 space-y-4" id="floor-sidebar">
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm gap-2 flex flex-col">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 mb-2">
            <Layers size={16} className="text-slate-500" /> Building Floors
          </h3>
          <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {floors.map(floor => {
              const matchCount = floorMatches[floor] || 0;
              return (
                <button
                  key={floor}
                  onClick={() => setActiveFloor(floor)}
                  id={`btn-select-floor-${floor}`}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-left flex items-center justify-between transition-all shrink-0 md:shrink border ${
                    safeActiveFloor === floor
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                      : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${safeActiveFloor === floor ? 'bg-white' : 'bg-slate-300'}`} />
                    <span>Floor {floor}</span>
                    {matchCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-[9px] bg-amber-400 text-slate-905 font-black uppercase tracking-wider rounded-md animate-bounce inline-flex items-center justify-center leading-none">
                        {matchCount} match{matchCount > 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={14} className={`opacity-60 hidden md:block ${safeActiveFloor === floor ? 'text-white' : 'text-slate-405'}`} />
                </button>
              );
            })}
          </div>

          {/* CCTV Feed button */}
          {showCCTV && (
            <button
              onClick={() => onOpenCCTV(safeActiveFloor)}
              id="btn-active-floor-cctv"
              className="mt-4 p-3.5 w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-slate-900/10 active:scale-95 transition-all text-center border border-slate-800"
            >
              <Video size={14} /> View Floor {safeActiveFloor} CCTV
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-3 hidden md:block">
          <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Room Status Guide</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-200 inline-block" />
              <span className="font-bold text-slate-700">Available</span>
              <span className="text-[10px] text-slate-400 ml-auto">Vacant beds present</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded bg-indigo-100 border border-indigo-200 inline-block" />
              <span className="font-bold text-slate-700">Occupied</span>
              <span className="text-[10px] text-slate-400 ml-auto">All beds occupied</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-200 inline-block" />
              <span className="font-bold text-slate-700">Maintenance</span>
              <span className="text-[10px] text-slate-400 ml-auto">Under service/checks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid mapping */}
      <div className="md:col-span-9 space-y-4" id="floor-grid-panel">
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm min-h-[460px] flex flex-col">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-mono">Floor Layout</h3>
              <p className="text-xs text-slate-400 mt-1">Select a room block to manage bed allocations or view amenities</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input field */}
              <div className="relative flex-1 sm:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Locate room #, type, status, or capacity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="input-floor-map-search"
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400 font-bold"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    id="btn-clear-floor-search"
                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs text-slate-500 font-bold shrink-0 justify-center">
                <Users size={14} /> {floorRooms.length} Rooms
              </div>
            </div>
          </div>

          {/* Quick Filters sub-bar */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50/50 p-2 text-xs mb-6 rounded-2xl border border-slate-100" id="floor-map-filter-bar">
            <span className="font-extrabold text-slate-700 text-[10px] uppercase tracking-wider px-2 border-r border-slate-200 mr-1 shrink-0">
              🔍 Quick Filter:
            </span>
            
            {/* Status Filter Toggles */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-slate-400 font-bold text-[10px] sm:inline hidden mr-1">Status:</span>
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${statusFilter === 'All' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter(RoomStatus.AVAILABLE)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${statusFilter === RoomStatus.AVAILABLE ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                Available
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter(RoomStatus.OCCUPIED)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${statusFilter === RoomStatus.OCCUPIED ? 'bg-indigo-650 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                Occupied
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter(RoomStatus.MAINTENANCE)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer ${statusFilter === RoomStatus.MAINTENANCE ? 'bg-amber-650 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-450 shrink-0" />
                Maintenance
              </button>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 mx-1.5 hidden sm:block" />

            {/* Capacity Filter Toggles */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-slate-400 font-bold text-[10px] sm:inline hidden mr-1">Capacity:</span>
              <button
                type="button"
                onClick={() => setCapacityFilter('All')}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${capacityFilter === 'All' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
              >
                All Capacity
              </button>
              {['1', '2', '4', '8', '12'].map(capVal => {
                const text = capVal === '1' ? 'Single' : `${capVal} Beds`;
                return (
                  <button
                    key={capVal}
                    type="button"
                    onClick={() => setCapacityFilter(capVal)}
                    className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${capacityFilter === capVal ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-650 hover:bg-slate-50'}`}
                  >
                    {text}
                  </button>
                );
              })}
            </div>

            {/* Reset Filters Toggle */}
            {(statusFilter !== 'All' || capacityFilter !== 'All' || searchQuery.trim() !== '') && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('All');
                  setCapacityFilter('All');
                  setSearchQuery('');
                }}
                className="ml-auto text-[10px] font-extrabold uppercase text-rose-500 hover:text-rose-700 transition-colors cursor-pointer shrink-0"
                id="btn-clear-all-quick-filters"
              >
                Reset
              </button>
            )}
          </div>

          {/* Search Result Feedback Indicator banner */}
          {hasActiveFilter && (() => {
            const activeMatches = floorRooms.filter(r => 
              isRoomMatch(r, searchQuery, statusFilter, capacityFilter)
            ).length;
            const totalMatches = (Object.values(floorMatches) as number[]).reduce((a: number, b: number) => a + b, 0);

            return (
              <div className="bg-indigo-50 border border-indigo-100/50 p-3.5 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-in slide-in-from-top-1 duration-200" id="search-query-match-banner">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <span className="text-slate-700 font-bold">
                    {activeMatches > 0 ? (
                      <>
                        Found <strong className="text-indigo-600 font-extrabold">{activeMatches}</strong> matching rooms highlighted on Floor <strong className="font-extrabold">{safeActiveFloor}</strong>
                        {(statusFilter !== 'All' || capacityFilter !== 'All') && (
                          <span className="text-slate-450 font-normal"> (filtered by status/capacity)</span>
                        )}
                      </>
                    ) : (
                      <>
                        No matching rooms on Floor <strong className="font-extrabold">{safeActiveFloor}</strong>.
                        {totalMatches > 0 ? (
                          <span className="text-indigo-600 font-bold ml-1">Check matches on other floors in the sidebar!</span>
                        ) : (
                          <span className="text-slate-500 font-normal ml-1">Try another search term or filter.</span>
                        )}
                      </>
                    )}
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setCapacityFilter('All');
                  }}
                  id="btn-banner-clear-search"
                  className="text-indigo-600 hover:text-indigo-850 font-black uppercase text-[10px] tracking-wider cursor-pointer text-left shrink-0"
                >
                  Clear All
                </button>
              </div>
            );
          })()}

          {floorRooms.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
              <HelpCircle size={36} className="opacity-30 mb-2" />
              <p className="text-sm">No rooms found matching filters on this floor.</p>
            </div>
          ) : (
            /* Isometric floor layout container */
            <div className="flex-1 flex items-center justify-center py-6">
              <div 
                className="grid gap-5 w-full"
                style={{ 
                  gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` 
                }}
                id="interactive-rooms-grid"
              >
                {floorRooms.map(room => {
                  const styles = getStatusStyles(room.status);
                  const isSelected = selectedRoomId === room.id;
                  const isSearchMatch = hasActiveFilter && isRoomMatch(room, searchQuery, statusFilter, capacityFilter);

                  let finalClasses = `group p-4 rounded-2xl border text-left flex flex-col justify-between aspect-square transition-all duration-305 relative overflow-hidden shadow-inner ${styles.bg}`;
                  
                  if (isSelected) {
                    finalClasses += " ring-2 ring-indigo-600 scale-[1.02] shadow-md z-10";
                  } else {
                    finalClasses += " shadow-sm";
                  }

                  if (hasActiveFilter) {
                    if (isSearchMatch) {
                      finalClasses += " ring-4 ring-amber-400 scale-[1.04] shadow-lg shadow-amber-400/20 border-amber-400 z-10 animate-pulse bg-amber-50/50";
                    } else {
                      finalClasses += " opacity-30 border-slate-100 saturate-50 hover:opacity-80";
                    }
                  }

                  return (
                    <button
                      key={room.id}
                      onClick={() => onRoomClick(room)}
                      id={`btn-room-click-${room.id}`}
                      className={finalClasses}
                    >
                      <div className="relative z-10 w-full animate-fade-in">
                        <div className="flex items-start justify-between w-full">
                          <span className={`text-base font-black ${styles.text}`}>
                            #{room.number}
                          </span>
                          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${styles.badge}`}>
                            {room.type.split(' ')[0]}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold block mt-3 uppercase tracking-wider">
                          Beds Allocated
                        </span>
                        {/* Bed little visual indicators */}
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {room.beds.map(bed => (
                            <span
                              key={bed.id}
                              className={`w-2.5 h-2.5 rounded-full inline-block border-[1.5px] border-white transition-all ${
                                bed.status === 'Occupied' 
                                  ? 'bg-indigo-605' 
                                  : bed.status === 'Requested' 
                                    ? 'bg-orange-400 animate-pulse' 
                                    : bed.status === 'Maintenance'
                                      ? 'bg-amber-400'
                                      : 'bg-emerald-400' 
                              }`}
                              title={`Bed ${bed.number}: ${bed.status}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Accent corner bar */}
                      <div className={`absolute bottom-0 left-0 right-0 h-1.5 group-hover:bg-indigo-500 transition-colors bg-black/5`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
