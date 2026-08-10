import React, { useState, useEffect, useMemo } from 'react';
import { X, Video, ShieldAlert, Circle, EyeOff, Camera, RefreshCw, Sliders, Maximize2, Sun, Moon, Sparkles, Activity } from 'lucide-react';

interface CCTVModalProps {
  floorNumber: number;
  hostelName: string;
  onClose: () => void;
}

interface CameraFeed {
  id: string;
  name: string;
  location: string;
  resolution: string;
  fps: number;
  url: string;
}

export function CCTVModal({ floorNumber, hostelName, onClose }: CCTVModalProps) {
  const [time, setTime] = useState(new Date());
  const [currentFloor, setCurrentFloor] = useState<number>(floorNumber);
  const [isNightVision, setIsNightVision] = useState<boolean>(false);
  const [signalNoise, setSignalNoise] = useState<number>(10); // Noise slider %
  const [selectedFeed, setSelectedFeed] = useState<CameraFeed | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);

  // Tick the clock in real-time
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    return time.toLocaleTimeString([], { hour12: false });
  };

  const formatDate = () => {
    return time.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
  };

  // Generate dynamic, real-time images of hostel rooms and spaces based on the floor selection
  const cameraFeeds: CameraFeed[] = useMemo(() => {
    switch (currentFloor) {
      case 1:
        return [
          {
            id: 'f1-cam1',
            name: 'CAM 01 - MAIN PORTAL',
            location: 'ENTRANCE LOBBY RECEPTION',
            resolution: '1080P',
            fps: 30,
            url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'f1-cam2',
            name: 'CAM 02 - RM #102 INLET',
            location: 'DOUBLE SHARING COMFORT BLOCK',
            resolution: '1080P',
            fps: 30,
            url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'f1-cam3',
            name: 'CAM 03 - SERVICE WING',
            location: 'LAUNDRY & IRONING BAY',
            resolution: '720P',
            fps: 15,
            url: 'https://images.unsplash.com/photo-1545173168-9f1907e8006e?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'f1-cam4',
            name: 'CAM 04 - SOUTH COURT',
            location: 'OUTDOOR STUDENT GARDEN',
            resolution: '1080P',
            fps: 30,
            url: 'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&w=800&q=80',
          },
        ];
      case 2:
        return [
          {
            id: 'f2-cam1',
            name: 'CAM 01 - CORRIDOR 2A',
            location: 'ELEVATOR BLOCK LOBBY',
            resolution: '1080P',
            fps: 30,
            url: 'https://images.unsplash.com/photo-1573346400032-40b54b4d4554?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'f2-cam2',
            name: 'CAM 02 - RM #205 INLET',
            location: 'SINGLE STUDY FOCUS UNIT',
            resolution: '1080P',
            fps: 25,
            url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'f2-cam3',
            name: 'CAM 03 - RECREATIONAL WING',
            location: 'SOCIAL LOUNGE & COFFEE HUB',
            resolution: '1080P',
            fps: 30,
            url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'f2-cam4',
            name: 'CAM 04 - PARKING NORTH',
            location: 'BIKE & VEHICLE DECK',
            resolution: '720P',
            fps: 15,
            url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
          },
        ];
      case 3:
        return [
          {
            id: 'f3-cam1',
            name: 'CAM 01 - CORRIDOR 3B',
            location: 'NORTH CORE HALLWAY',
            resolution: '1080P',
            fps: 30,
            url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'f3-cam2',
            name: 'CAM 02 - RM #311 INLET',
            location: 'FOUR SHARING QUAD CLUSTER',
            resolution: '1080P',
            fps: 30,
            url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'f3-cam3',
            name: 'CAM 03 - RECEPTION AREA',
            location: 'WARDEN DESK & VISITOR ZONE',
            resolution: '1080P',
            fps: 30,
            url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'f3-cam4',
            name: 'CAM 04 - WATER COOLER BAY',
            location: 'COMMON PANTRY AREA',
            resolution: '720P',
            fps: 15,
            url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
          },
        ];
      default:
        return [
          {
            id: 'f4-cam1',
            name: 'CAM 01 - CREATIVE CELL',
            location: 'QUIET STUDY LIBRARY',
            resolution: '1080P',
            fps: 25,
            url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'f4-cam2',
            name: 'CAM 02 - RM #420 INLET',
            location: 'SHARED COZY DORMITORY SUITE',
            resolution: '1080P',
            fps: 30,
            url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'f4-cam3',
            name: 'CAM 03 - DINING PORTAL',
            location: 'HOT KITCHEN & FOOD BAY',
            resolution: '1080P',
            fps: 30,
            url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
          },
          {
            id: 'f4-cam4',
            name: 'CAM 04 - TERRACORE DECK',
            location: 'ROOFTOP STUDY TERRACE',
            resolution: '1080P',
            fps: 35,
            url: 'https://images.unsplash.com/photo-1531971589569-0d93700fd00f?auto=format&fit=crop&w=800&q=80',
          },
        ];
    }
  }, [currentFloor]);

  const handleRefreshFeed = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast("All security feeds successfully re-synchronized.");
    }, 850);
  };

  const handleCaptureSnapshot = (camName: string) => {
    setIsFlashActive(true);
    setTimeout(() => {
      setIsFlashActive(false);
      showToast(`Snapshot captured from ${camName} & saved to logs!`);
    }, 200);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" id="cctv-modal">
      
      {/* Visual White Flash Effect */}
      {isFlashActive && (
        <div className="fixed inset-0 bg-white z-[999] opacity-100 pointer-events-none transition-opacity duration-200" />
      )}

      {/* Main Container */}
      <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-5xl w-full overflow-hidden flex flex-col relative max-h-[92vh]" id="cctv-container">
        
        {/* Header toolbar */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl relative">
              <Video size={16} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping inline-block" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black font-mono tracking-tight uppercase">{hostelName} - LIVE VIRTUAL VISUALIZER</h2>
                <span className="bg-rose-500/10 text-rose-400 text-[9px] font-black font-mono px-2 py-0.5 rounded border border-rose-500/30 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1 h-1 bg-rose-500 rounded-full animate-pulse" /> LIVE STREAM
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Real-time Space Showcase & Safety Monitors (Floor {currentFloor})</p>
            </div>
          </div>

          {/* Quick controls bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono font-bold shrink-0">
            {/* Dynamic Floor selector */}
            <div className="flex items-center bg-slate-850 border border-slate-800 rounded-xl p-1 text-slate-300">
              <span className="text-[10px] px-2 text-slate-400 uppercase font-black">Floor:</span>
              {[1, 2, 3, 4].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setCurrentFloor(f);
                    setSelectedFeed(null);
                    showToast(`Switched live camera matrix to Floor ${f}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    currentFloor === f
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Live Indicator Date Time */}
            <div className="bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 text-[11px] font-bold">
              {formatDate()} &nbsp;{formatTime()}
            </div>

            {/* Close button */}
            <button 
              onClick={onClose}
              id="btn-cctv-modal-close"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Dynamic Controls Strip */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Night Vision Switch */}
            <button
              type="button"
              onClick={() => {
                setIsNightVision(!isNightVision);
                showToast(isNightVision ? 'Night vision mode deactivated.' : 'Infrared night vision mode activated.');
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-bold font-mono uppercase tracking-wide transition-colors ${
                isNightVision
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {isNightVision ? <Sun size={14} /> : <Moon size={14} />}
              {isNightVision ? 'Night Vision: ON' : 'Night Vision: OFF'}
            </button>

            {/* Sync Feeds */}
            <button
              type="button"
              onClick={handleRefreshFeed}
              disabled={isSyncing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-bold font-mono uppercase tracking-wide transition-colors cursor-pointer"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin text-indigo-400' : ''} />
              Re-Sync Streams
            </button>
          </div>

          {/* Noise / Signal Slider */}
          <div className="flex items-center gap-3 text-slate-400 text-xs font-mono font-bold">
            <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-slate-500">
              <Sliders size={12} /> Static Interference:
            </span>
            <input
              type="range"
              min="0"
              max="45"
              value={signalNoise}
              onChange={(e) => setSignalNoise(parseInt(e.target.value, 10))}
              className="accent-indigo-600 w-28 h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
            />
            <span className="w-8 text-right font-mono text-slate-300">{signalNoise}%</span>
          </div>
        </div>

        {/* Matrix Screens & Selected Panel */}
        <div className="flex-1 p-6 bg-slate-950 flex flex-col lg:flex-row gap-6 overflow-hidden relative min-h-[420px]" id="cctv-feeds-workspace">
          
          {/* Signal Static Interference Noise Filter (CSS based) */}
          <div 
            className="absolute inset-0 pointer-events-none z-10 opacity-30 select-none bg-[length:100%_4px,3px_100%]"
            style={{
              backgroundImage: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.3) 50%), linear-gradient(90deg, rgba(255,0,0,0.05), rgba(0,255,0,0.02), rgba(0,0,0,0.05))',
              filter: `blur(${signalNoise / 12}px)`,
              opacity: 0.15 + (signalNoise / 100),
            }}
          />

          {/* Master Video Feed Grid */}
          <div className={`flex-1 grid grid-cols-1 ${selectedFeed ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-4 overflow-y-auto`}>
            
            {cameraFeeds.map((feed) => {
              const isSelected = selectedFeed?.id === feed.id;
              
              // Skip others if one feed is actively selected fullscreen-style
              if (selectedFeed && !isSelected) return null;

              return (
                <div
                  key={feed.id}
                  className={`bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 group transition-all duration-300 ${
                    isSelected ? 'aspect-video w-full' : 'aspect-video'
                  }`}
                >
                  {/* Actual Real-Time Room Showcase Picture */}
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={feed.url}
                      alt={feed.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-60 group-hover:scale-102 transition-transform duration-1000 ease-out"
                      style={{
                        filter: isNightVision 
                          ? `brightness(1.3) contrast(1.2) grayscale(100%) sepia(100%) hue-rotate(90deg) saturate(350%) blur(${signalNoise / 25}px)`
                          : `blur(${signalNoise / 30}px) brightness(${1 - (signalNoise / 200)})`,
                      }}
                    />
                    {/* Simulated Screen Overlay Lines */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
                  </div>

                  {/* Header text info Overlay */}
                  <div className="flex items-start justify-between relative z-10 w-full">
                    <span className="bg-black/80 backdrop-blur-md text-[9px] font-mono font-black text-white uppercase px-2.5 py-1.5 rounded-lg border border-slate-800 tracking-wider flex items-center gap-1.5">
                      <Circle size={8} className="fill-rose-500 text-rose-500 animate-pulse shrink-0" />
                      {feed.name}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-emerald-450 bg-black/85 px-2 py-0.5 rounded-lg border border-emerald-950 font-extrabold uppercase">
                        {feed.resolution} / {feed.fps}FPS
                      </span>
                    </div>
                  </div>

                  {/* Camera action overlay tools on hover */}
                  <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-15">
                    {!isSelected && (
                      <button
                        type="button"
                        onClick={() => setSelectedFeed(feed)}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform hover:scale-110 flex items-center gap-1 text-xs font-bold uppercase tracking-wider cursor-pointer font-mono"
                      >
                        <Maximize2 size={14} /> Focus Feed
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCaptureSnapshot(feed.name)}
                      className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 transition-all transform hover:scale-110 flex items-center gap-1 text-xs font-bold uppercase tracking-wider cursor-pointer font-mono"
                    >
                      <Camera size={14} /> Snapshot
                    </button>
                  </div>

                  {/* Footer overlay labels */}
                  <div className="flex items-end justify-between relative z-10 mt-auto w-full">
                    <div className="flex flex-col bg-black/75 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-white/5 max-w-[70%]">
                      <span className="text-[10px] font-extrabold font-mono text-slate-100 uppercase tracking-wide leading-none">
                        {feed.location}
                      </span>
                      <span className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest leading-none flex items-center gap-1">
                        <Activity size={10} className="text-emerald-500 shrink-0" /> Space Secured & Online
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-350 bg-black/60 px-2.5 py-1 rounded-lg border border-white/5 tracking-wider font-extrabold">
                      {formatTime()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details / Interactive Panel on Side when a camera is in focus mode */}
          {selectedFeed && (
            <div className="w-full lg:w-80 bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between animate-in slide-in-from-right duration-300">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-500" /> CAMERA FOCUS LOGS
                  </h3>
                  <button
                    type="button"
                    onClick={() => setSelectedFeed(null)}
                    className="text-[10px] font-mono font-black text-rose-400 hover:text-rose-350 border border-rose-500/30 hover:border-rose-500/60 bg-rose-500/5 px-2.5 py-1 rounded-lg uppercase transition-colors tracking-widest cursor-pointer"
                  >
                    Reset Grid
                  </button>
                </div>

                {/* Cam Specs */}
                <div className="space-y-3.5">
                  <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-850">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block font-mono">Current Channel</span>
                    <span className="text-sm font-black font-mono text-slate-200 block mt-0.5">{selectedFeed.name}</span>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-850">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block font-mono">Operational Sector</span>
                    <span className="text-xs font-bold text-slate-350 block mt-0.5 uppercase leading-snug">{selectedFeed.location}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-slate-950/40 rounded-2xl border border-slate-850/60 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block font-mono">Signal Type</span>
                      <span className="text-xs font-bold text-emerald-450 block mt-1 font-mono">ENCRYPTED</span>
                    </div>
                    <div className="p-3 bg-slate-950/40 rounded-2xl border border-slate-850/60 text-center">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block font-mono">Bandwidth</span>
                      <span className="text-xs font-bold text-slate-350 block mt-1 font-mono">4.2 Mbps</span>
                    </div>
                  </div>
                </div>

                {/* Live space comfort telemetry showcase */}
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity size={12} className="text-indigo-500 animate-pulse" /> Live Area Status
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-450">Comfort Index:</span>
                      <span className="text-emerald-400 font-bold">96% Optimal</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-450">Room Lighting:</span>
                      <span className="text-amber-400 font-bold">320 Lux</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-450">AC Temperature:</span>
                      <span className="text-slate-200 font-bold">22.5 °C</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-5 border-t border-slate-800 mt-5">
                <button
                  type="button"
                  onClick={() => handleCaptureSnapshot(selectedFeed.name)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Camera size={14} /> Capture Full Snapshot
                </button>
                <p className="text-[9px] text-center font-mono text-slate-500 leading-snug">
                  CCTV captures are automatically stored in the secure campus safety vault for audit verification.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer info/toasts */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldAlert size={12} className="text-amber-500 shrink-0" />
            Warden & Safety Access Portal · Encryption Active (AES-256)
          </div>
          <div className="text-slate-400 text-right">
            Active Connection: 100% Stable
          </div>
        </div>

        {/* Floating Custom Success/Notification Toasts */}
        {toastMessage && (
          <div className="absolute bottom-16 right-6 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="bg-slate-950/95 border border-slate-850 px-4.5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs text-white backdrop-blur-md">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
              <span className="font-bold leading-none">{toastMessage}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
