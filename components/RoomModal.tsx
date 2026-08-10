import React, { useState, useMemo } from 'react';
import { Room, User, Bed, UserRole, RoomStatus } from '../types';
import { FEATURES } from '../constants';
import { X, Wifi, ShieldAlert, BadgeInfo, Check, Sparkles, AlertCircle, Wrench, IndianRupee, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

interface RoomModalProps {
  room: Room;
  user: User;
  allUsers: User[];
  onClose: () => void;
  onAction: (room: Room, action: string, bedId?: string) => void;
  onFeatureUpdate: (roomId: string, newFeatures: string[]) => void;
  onRoomUpdate: (updatedRoom: Room) => void;
  hasPendingRequest: boolean;
  availableFeatures?: string[];
}

export function RoomModal({
  room,
  user,
  allUsers,
  onClose,
  onAction,
  onFeatureUpdate,
  onRoomUpdate,
  hasPendingRequest,
  availableFeatures = FEATURES
}: RoomModalProps) {
  const isAdmin = user.role === UserRole.ADMIN;
  const isStudent = user.role === UserRole.STUDENT;

  const [localFeatures, setLocalFeatures] = useState<string[]>(room.features || []);
  const [isEditingFeatures, setIsEditingFeatures] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [localPrice, setLocalPrice] = useState<number>(room.price || 0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const carouselSlides = useMemo(() => {
    let mainRoomUrl = "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80"; // Double Sharing default
    let mainRoomTitle = "Premium Twin-Sharing Layout";
    let mainRoomDesc = "Spacious layout engineered for peer collaboration and privacy, featuring dedicated wardrobes and study stations.";

    if (room.type && (room.type.includes('Single') || room.type.includes('1-in-1'))) {
      mainRoomUrl = "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80";
      mainRoomTitle = "Private Single Occupancy Suite";
      mainRoomDesc = "Your own private quiet workspace and bedroom, perfect for deep focus, studying, and rest.";
    } else if (room.type && (room.type.includes('Quad') || room.type.includes('4-in-1'))) {
      mainRoomUrl = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80";
      mainRoomTitle = "Vibrant Quad Sharing Cluster";
      mainRoomDesc = "An interactive four-bed cluster that maximizes roominess and offers comfortable modular bunks.";
    } else if (room.type && (room.type.includes('Dorm') || room.type.includes('8-in-1') || room.type.includes('12-in-1') || room.type.includes('Large Dorm'))) {
      mainRoomUrl = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1000&q=80";
      mainRoomTitle = "Cozy Shared Dormitory Suite";
      mainRoomDesc = "Fully optimized modern sharing suite with separate locker bays, reading lights, and thick privacy curtains.";
    }

    return [
      {
        title: mainRoomTitle,
        description: mainRoomDesc,
        tag: "Sleeping Quarters",
        url: mainRoomUrl,
      },
      {
        title: "Dedicated Study & Workstations",
        description: "Equipped with high-speed mesh Wi-Fi routing, task lamps, multi-plug boards, and comfortable supportive chairs.",
        tag: "Productivity",
        url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "Social Lounge & Activity Zone",
        description: "Connect and network inside the modern hostel common rooms complete with smart TVs and premium seating.",
        tag: "Recreation",
        url: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1000&q=80",
      },
      {
        title: "Pantry & In-House Laundry",
        description: "Get 24/7 access to microwave hot bays, water purifiers, and fully automated washing and drying equipment.",
        tag: "Utilities",
        url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80",
      }
    ];
  }, [room.type]);

  // Helper function to find user details by occupant ID
  const getOccupantDetails = (occupantId?: string | null) => {
    if (!occupantId) return null;
    return allUsers.find(u => u.id === occupantId) || { id: occupantId, name: 'Allocated occupant', email: '', role: UserRole.STUDENT, gender: user.gender };
  };

  const handleToggleFeature = (feature: string) => {
    let nextFeatures;
    if (localFeatures.includes(feature)) {
      nextFeatures = localFeatures.filter(f => f !== feature);
    } else {
      nextFeatures = [...localFeatures, feature];
    }
    setLocalFeatures(nextFeatures);
  };

  const handleSaveFeatures = () => {
    onFeatureUpdate(room.id, localFeatures);
    setIsEditingFeatures(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" id={`room-modal-${room.id}`}>
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden flex flex-col relative max-h-[90vh]">
        
        {/* Header decoration bar */}
        <div className={`h-2 w-full ${room.status === RoomStatus.MAINTENANCE ? 'bg-amber-500' : 'bg-indigo-600'}`} />

        {/* Action Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-800 font-mono">Room Block {room.number}</h2>
              <span className={`text-xs font-black px-2.5 py-1 rounded-full uppercase ${
                room.status === RoomStatus.AVAILABLE ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 
                room.status === RoomStatus.MAINTENANCE ? 'bg-amber-50 text-amber-800 border border-amber-200' : 
                'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}>
                {room.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Floor {room.floor} · {room.type} · Capacity {room.capacity} beds
            </p>
          </div>
          <button 
            onClick={onClose}
            id="btn-room-modal-close"
            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-450 hover:text-slate-800 rounded-xl transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Room Gallery & Amenities Showcase Carousel */}
          <div className="space-y-2.5" id="room-gallery-showcase">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Camera size={14} className="text-indigo-500" /> Configurations & Amenities Showcase
            </h3>
            
            <div className="relative h-60 w-full rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-900 group select-none">
              {/* Slides */}
              {carouselSlides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    idx === currentSlideIndex 
                      ? "opacity-100 scale-100 pointer-events-auto" 
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                >
                  {/* Image */}
                  <img
                    src={slide.url}
                    alt={slide.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
                  />
                  
                  {/* Top overlay badge for slide tag */}
                  <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-indigo-600 text-white font-extrabold uppercase tracking-widest text-[9px] px-2.5 py-1 rounded-lg shadow-sm shadow-indigo-600/30">
                    {slide.tag}
                  </div>

                  {/* Bottom Text Information & Gradient */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-transparent p-5 pt-12 flex flex-col justify-end">
                    <h4 className="text-base font-extrabold text-white tracking-tight leading-tight">
                      {slide.title}
                    </h4>
                    <p className="text-xs text-slate-200 mt-1.5 leading-relaxed font-medium opacity-90 max-w-[90%]">
                      {slide.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Navigation Arrows */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1));
                }}
                id="btn-carousel-prev"
                aria-label="Previous configuration slide"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/40 backdrop-blur-md hover:bg-slate-950/60 text-white rounded-xl transition-all active:scale-95 border border-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex((prev) => (prev === carouselSlides.length - 1 ? 0 : prev + 1));
                }}
                id="btn-carousel-next"
                aria-label="Next configuration slide"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-950/40 backdrop-blur-md hover:bg-slate-950/60 text-white rounded-xl transition-all active:scale-95 border border-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>

              {/* Slide Indicator Dots (top right overlay style to keep clean from captions) */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-950/40 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10">
                {carouselSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlideIndex(idx);
                    }}
                    id={`btn-carousel-dot-${idx}`}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentSlideIndex 
                        ? "bg-white w-3.5" 
                        : "bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bed Allocation grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-500" /> Bed Allocations & Request Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {room.beds.map((bed) => {
                const occupant = getOccupantDetails(bed.occupantId);
                const isBedAvailable = bed.status === 'Available';
                const isBedOccupied = bed.status === 'Occupied';
                const isBedRequested = bed.status === 'Requested';
                const isBedMaintenance = bed.status === 'Maintenance';

                return (
                  <div 
                    key={bed.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between h-40 transition-all ${
                      isBedOccupied ? 'bg-indigo-50/20 border-indigo-200' : 
                      isBedRequested ? 'bg-orange-50/30 border-orange-200 animate-pulse' :
                      isBedMaintenance ? 'bg-amber-50/20 border-amber-200' :
                      'bg-slate-50/30 border-slate-200 hover:border-slate-350'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Bed Node</span>
                        <h4 className="text-base font-black text-slate-800">Bed Single {bed.number}</h4>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isBedOccupied ? 'bg-indigo-100 text-indigo-805' : 
                        isBedRequested ? 'bg-orange-100 text-orange-800' :
                        isBedMaintenance ? 'bg-amber-100 text-amber-805' : 
                        'bg-emerald-100 text-emerald-805'
                      }`}>
                        {bed.status}
                      </span>
                    </div>

                    {/* Occupant card if occupied */}
                    {isBedOccupied && occupant && (
                      <div className="flex items-center gap-2 mt-2 bg-white border border-slate-100 p-2 rounded-xl">
                        <img 
                          src={occupant.avatarUrl || `https://ui-avatars.com/api/?name=${occupant.name}&background=random`} 
                          alt={occupant.name} 
                          className="w-7 h-7 rounded-full border border-slate-205"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-slate-800 truncate leading-none">{occupant.name}</p>
                          <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{occupant.id}</span>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => onAction(room, 'vacate', bed.id)}
                            id={`btn-vacate-${bed.id}`}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-2 py-1 rounded text-[10px] font-black transition-colors"
                          >
                            Vacate
                          </button>
                        )}
                      </div>
                    )}

                    {/* Requested status info */}
                    {isBedRequested && occupant && (
                      <div className="text-xs text-orange-750 bg-orange-50/50 p-2 rounded-xl border border-orange-100">
                        Requested by <span className="font-bold">{occupant.name}</span>. Pending Warden approval.
                      </div>
                    )}

                    {/* Actions if vacant/available */}
                    {isBedAvailable && (
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                          <Check size={14} /> Available Now
                        </span>
                        {isStudent && !user.assignedRoomId && !hasPendingRequest && (
                          <button
                            onClick={() => onAction(room, 'request', bed.id)}
                            id={`btn-request-bed-${bed.id}`}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 font-black text-xs shadow-md shadow-indigo-600/15 active:scale-95 transition-all text-center shrink-0 border border-indigo-600"
                          >
                            Book Bed
                          </button>
                        )}
                      </div>
                    )}

                    {/* Maintenance mode */}
                    {isBedMaintenance && (
                      <div className="text-xs text-amber-750 bg-amber-50/50 p-2 rounded-xl border border-amber-100 flex items-center gap-1.5">
                        <AlertCircle size={14} className="text-amber-500 shrink-0" /> Under Repair or checks
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Features */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Room Amenities</h3>
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (isEditingFeatures) {
                        handleSaveFeatures();
                      } else {
                        setIsEditingFeatures(true);
                      }
                    }}
                    id="btn-edit-features"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    {isEditingFeatures ? 'Save Features' : 'Edit Amenities'}
                  </button>
                )}
              </div>

              {isEditingFeatures ? (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-wrap gap-2" id="features-editor">
                  {availableFeatures.map(f => {
                    const isChecked = localFeatures.includes(f);
                    return (
                      <button
                        key={f}
                        onClick={() => handleToggleFeature(f)}
                        id={`btn-toggle-feature-${f}`}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all ${
                          isChecked 
                            ? 'bg-indigo-650 border-indigo-600 text-white' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {f}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5" id="features-display animate-in zoom-in-5">
                  {room.features && room.features.length > 0 ? (
                    room.features.map(f => (
                      <div 
                        key={f}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-bold flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Wifi size={13} className="text-indigo-500" />
                        <span>{f}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs italic">No specific features configured.</span>
                  )}
                </div>
              )}
            </div>

            {/* Room Fee Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Fee Billing Structure</h3>
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (isEditingPrice) {
                        const updatedRoom = { ...room, price: Number(localPrice) || 0 };
                        onRoomUpdate(updatedRoom);
                        setIsEditingPrice(false);
                      } else {
                        setLocalPrice(room.price || 0);
                        setIsEditingPrice(true);
                      }
                    }}
                    id="btn-edit-price"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    {isEditingPrice ? 'Save Fee' : 'Edit Fee'}
                  </button>
                )}
              </div>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-3.5 shadow-inner">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <IndianRupee size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  {isEditingPrice ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-slate-500">₹</span>
                      <input
                        type="number"
                        value={localPrice}
                        onChange={(e) => setLocalPrice(Number(e.target.value) || 0)}
                        id="input-room-fees"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-left"
                        placeholder="Enter room fee"
                        min="0"
                      />
                    </div>
                  ) : (
                    <h4 className="text-base font-black text-slate-800">₹{(room.price).toLocaleString('en-IN')}</h4>
                  )}
                  <span className="text-[10px] text-slate-400 block uppercase font-bold mt-0.5">Per Student / Year</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warden Services Section (Admin only) */}
          {isAdmin && (
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Warden Control Services</h3>
              <div className="flex flex-wrap gap-2">
                {room.status === RoomStatus.MAINTENANCE ? (
                  <button
                    onClick={() => onAction(room, 'maintenance_complete')}
                    id="btn-room-modal-maintenance-complete"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 px-4 text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 active:scale-95 transition-all text-center border border-emerald-600"
                  >
                    <Check size={14} /> Mark Maintenance Completed
                  </button>
                ) : (
                  <button
                    onClick={() => onAction(room, 'maintenance')}
                    id="btn-room-modal-maintenance"
                    className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl py-3 px-4 text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 active:scale-95 transition-all text-center border border-amber-600"
                  >
                    <Wrench size={14} /> Tag Room for Service (Maintenance Mode)
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer info box */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-400 shrink-0">
          <BadgeInfo size={12} /> ALL ROOMMATE COMPATIBILITY GENDER PRE-FILTERS APPLIED
        </div>

      </div>
    </div>
  );
}
