import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, Camera, Shield, CheckCircle, AlertTriangle, Sparkles, RefreshCw, Volume2, VolumeX, Eye, Info } from 'lucide-react';
import { User, Room, Hostel, AttendanceRecord } from '../types';

interface QRScannerModalProps {
  currentUser: User;
  rooms: Room[];
  selectedHostel: Hostel;
  attendanceHistory: AttendanceRecord[];
  onClose: () => void;
  onCheckIn: (roomId: string) => void;
}

export function QRScannerModal({
  currentUser,
  rooms,
  selectedHostel,
  attendanceHistory,
  onClose,
  onCheckIn,
}: QRScannerModalProps) {
  const [activeTab, setActiveTab] = useState<'camera' | 'simulation'>('simulation');
  const [cameraPermission, setCameraPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [selectedSimulatedDoor, setSelectedSimulatedDoor] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Audio Beep Effect using Web Audio API
  const playBeep = (isSuccess: boolean) => {
    if (isSoundMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      if (isSuccess) {
        // High, pleasant double beep for success
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.12);
        
        // Second beep
        setTimeout(() => {
          const osc2 = audioCtx.createOscillator();
          const gain2 = audioCtx.createGain();
          osc2.connect(gain2);
          gain2.connect(audioCtx.destination);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // C6
          gain2.gain.setValueAtTime(0.08, audioCtx.currentTime);
          osc2.start();
          osc2.stop(audioCtx.currentTime + 0.15);
        }, 120);
      } else {
        // Low, warning buzz for error
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(180, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn('AudioContext beep blocked or failed:', e);
    }
  };

  // Get current date string (YYYY-MM-DD)
  const getTodayDateStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayDateStr();

  // Check if student has checked in today for this hostel
  const hasCheckedInToday = () => {
    const todayRecord = attendanceHistory.find(
      r => r.date === todayStr && r.hostelId === selectedHostel.id
    );
    if (!todayRecord) return false;
    const studentRecord = todayRecord.records.find(rec => rec.studentId === currentUser.id);
    return studentRecord?.status === 'Present';
  };

  const alreadyCheckedIn = hasCheckedInToday();

  // Start real camera stream
  const startCamera = async () => {
    stopCamera();
    try {
      setCameraPermission('prompt');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraPermission('granted');
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraPermission('denied');
    }
  };

  // Stop real camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Switch between tabs
  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Trigger scanning sequence
  const triggerScan = (roomId: string) => {
    if (isScanning || alreadyCheckedIn) return;
    setIsScanning(true);
    setScanResult(null);

    // Simulate standard scanning duration (1.8s) for immersive experience
    setTimeout(() => {
      setIsScanning(false);
      
      const targetRoomId = currentUser.assignedRoomId;
      if (!targetRoomId) {
        playBeep(false);
        setScanResult({
          success: false,
          message: 'Check-in failed. You do not have an assigned room in the system.'
        });
        return;
      }

      if (roomId === targetRoomId) {
        playBeep(true);
        setScanResult({
          success: true,
          message: `Successfully verified Room ${roomId.split('-')[1]} QR Code!`,
          data: { roomId, timestamp: new Date().toLocaleTimeString() }
        });
        onCheckIn(roomId);
      } else {
        playBeep(false);
        const scannedNum = roomId.split('-')[1] || roomId;
        const assignedNum = targetRoomId.split('-')[1] || 'None';
        setScanResult({
          success: false,
          message: `Access Denied: Scanned Room ${scannedNum} Door QR code, but your assigned room is Room ${assignedNum}.`
        });
      }
    }, 1800);
  };

  // Auto scan in camera mode (simulating pointing at door)
  const handleCameraAutoScan = () => {
    if (!currentUser.assignedRoomId) {
      triggerScan('none');
      return;
    }
    // Simulate scanning the student's actual door QR successfully
    triggerScan(currentUser.assignedRoomId);
  };

  // List of rooms on the same floor as student's assigned room (for simulation choice)
  const studentFloorRooms = rooms.filter(r => {
    // Show rooms in the selected hostel
    if (currentUser.assignedRoomId) {
      const parts = currentUser.assignedRoomId.split('-');
      const assignedRoom = rooms.find(rm => rm.id === currentUser.assignedRoomId);
      if (assignedRoom) {
        return r.floor === assignedRoom.floor;
      }
    }
    return r.floor === 1; // Fallback to floor 1
  }).slice(0, 4); // Limit to a few rooms for gorgeous display

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[150] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200" id="qr-scanner-modal">
      <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 max-w-2xl w-full overflow-hidden flex flex-col relative max-h-[92vh]">
        
        {/* Banner header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl">
              <QrCode size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black font-mono tracking-tight uppercase">Room Door Check-In Scanner</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Mark Attendance Automatically via Room Door QR Code</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              title={isSoundMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isSoundMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            
            {/* Close button */}
            <button 
              onClick={onClose}
              id="btn-qr-scanner-close"
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Info Ribbon */}
        <div className="px-6 py-3 bg-indigo-950/30 border-b border-slate-800 text-xs text-indigo-300 flex items-center gap-2">
          <Info size={14} className="shrink-0 text-indigo-400" />
          <span>
            {alreadyCheckedIn 
              ? `You have already checked in today (${todayStr})! Attendance marked: Present.` 
              : `Point your camera at the QR code posted outside your room door to register your check-in.`}
          </span>
        </div>

        {/* Main Interface Workspace */}
        <div className="p-6 bg-slate-950 flex-1 flex flex-col gap-6 overflow-y-auto">
          
          {/* Target Student Room Info Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Student Profile & Assignment</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white font-mono">{currentUser.name}</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-black font-mono px-2 py-0.5 rounded border border-indigo-500/20 uppercase">
                  {currentUser.id}
                </span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Assigned Check-In Target</span>
              {currentUser.assignedRoomId ? (
                <div className="flex items-center sm:justify-end gap-2 mt-0.5">
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    Room {currentUser.assignedRoomId.split('-')[1]}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-lg border border-slate-700 font-bold uppercase">
                    {selectedHostel.name}
                  </span>
                </div>
              ) : (
                <div className="text-xs font-bold text-rose-400 flex items-center gap-1 sm:justify-end">
                  <AlertTriangle size={14} /> Not Assigned
                </div>
              )}
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveTab('simulation');
                setScanResult(null);
              }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'simulation'
                  ? 'bg-slate-850 text-white shadow-sm border border-slate-750'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={14} className="text-indigo-400" /> Virtual Door Simulator
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('camera');
                setScanResult(null);
              }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'camera'
                  ? 'bg-slate-850 text-white shadow-sm border border-slate-750'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Camera size={14} className="text-emerald-450" /> Live Webcam Scanner
            </button>
          </div>

          {/* Active View Content */}
          <div className="relative flex-1 flex flex-col items-center justify-center min-h-[280px]">
            
            {/* 1. CAMERA SCANNER MODE */}
            {activeTab === 'camera' && (
              <div className="w-full max-w-md flex flex-col items-center">
                <div className="w-full aspect-video bg-black rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-2xl">
                  {/* Camera denied alert */}
                  {cameraPermission === 'denied' && (
                    <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-3 z-20">
                      <div className="p-3 bg-rose-500/15 text-rose-400 rounded-full border border-rose-500/30">
                        <AlertTriangle size={24} />
                      </div>
                      <h4 className="text-xs font-bold text-white uppercase font-mono">Camera Blocked or Unavailable</h4>
                      <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                        Iframe sandbox policies or browser preferences block video device access. Please use the <b>Virtual Door Simulator</b> tab for checking in!
                      </p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-colors cursor-pointer border border-slate-700"
                      >
                        Retry Camera
                      </button>
                    </div>
                  )}

                  {/* Camera prompt / active state */}
                  {cameraPermission !== 'denied' && (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                  )}

                  {/* Live Laser Sweeper Overlay */}
                  {cameraPermission === 'granted' && !isScanning && !scanResult && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black font-mono px-2 py-0.5 rounded border border-emerald-500/30 uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" /> Camera Active
                      </span>
                    </div>
                  )}

                  {/* Red Scan Line */}
                  {isScanning && (
                    <div className="absolute left-0 right-0 h-0.5 bg-rose-500 shadow-lg shadow-rose-500/60 z-10 animate-bounce" style={{ top: '40%' }} />
                  )}

                  {/* Centered Scanning Reticle */}
                  {!scanResult && (
                    <div className="absolute w-44 h-44 border-2 border-emerald-500/40 rounded-2xl flex items-center justify-center z-10 pointer-events-none">
                      {/* Viewfinder corner ticks */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br" />
                      
                      {isScanning ? (
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw size={24} className="text-emerald-450 animate-spin" />
                          <span className="text-[9px] font-black font-mono uppercase text-emerald-400 tracking-widest bg-black/85 px-2 py-0.5 rounded">
                            Analyzing...
                          </span>
                        </div>
                      ) : (
                        <QrCode size={40} className="text-emerald-500/30 animate-pulse" />
                      )}
                    </div>
                  )}

                  {/* Scanning Overlay State */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-10 pointer-events-none" />
                  )}
                </div>

                {/* Camera Actions */}
                {cameraPermission === 'granted' && !alreadyCheckedIn && !scanResult && !isScanning && (
                  <div className="mt-4 flex flex-col items-center space-y-2">
                    <button
                      type="button"
                      onClick={handleCameraAutoScan}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <QrCode size={14} /> Scan Door QR Code
                    </button>
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider text-center">
                      Auto-detects and scans your room door QR code from camera feed
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 2. VIRTUAL DOOR SIMULATOR MODE */}
            {activeTab === 'simulation' && (
              <div className="w-full flex flex-col items-center space-y-6">
                <div className="text-center space-y-1.5 max-w-sm">
                  <h4 className="text-xs font-bold text-white uppercase font-mono">Simulate a Physical Door Check-In</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Select a door below to simulate walking up to that hostel room and scanning its posted QR code. Only your assigned room door QR code is valid.
                  </p>
                </div>

                {/* List of Simulated Doors */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  {studentFloorRooms.map((r) => {
                    const isAssigned = r.id === currentUser.assignedRoomId;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedSimulatedDoor(r.id);
                          triggerScan(r.id);
                        }}
                        disabled={isScanning || alreadyCheckedIn}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 relative overflow-hidden transition-all group ${
                          isAssigned
                            ? 'bg-emerald-950/20 hover:bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                            : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                        } disabled:opacity-50 disabled:pointer-events-none cursor-pointer`}
                      >
                        {/* Interactive scan laser visual preview */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                        
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-black font-mono uppercase">Room {r.number}</span>
                          <span className={`p-1 rounded-lg ${isAssigned ? 'bg-emerald-500/10' : 'bg-slate-800'}`}>
                            <QrCode size={14} />
                          </span>
                        </div>

                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">Status / Cap</span>
                          <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                            {r.status} · {r.capacity} Beds
                          </span>
                        </div>

                        {isAssigned && (
                          <div className="absolute bottom-2 right-2 bg-emerald-500 text-slate-950 text-[8px] font-black font-mono px-1.5 py-0.5 rounded leading-none">
                            YOUR DOOR
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Help tip */}
                <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wider text-center">
                  Click on any room card above to trigger the simulated laser scanner interface!
                </p>
              </div>
            )}

            {/* Simulated Scanning Animation Stage */}
            {isScanning && (
              <div className="absolute inset-0 bg-slate-950/90 rounded-3xl flex flex-col items-center justify-center p-6 space-y-4 z-40 animate-in fade-in duration-200">
                <div className="relative w-28 h-28 border border-indigo-500/30 rounded-2xl flex items-center justify-center">
                  {/* Laser Sweeper */}
                  <div className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-md shadow-indigo-500/80 animate-pulse" style={{ top: '45%' }} />
                  <QrCode size={48} className="text-indigo-400 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <span className="text-xs font-black text-white uppercase font-mono tracking-widest flex items-center justify-center gap-2">
                    <RefreshCw size={12} className="animate-spin text-indigo-400" /> Scanning QR Code
                  </span>
                  <p className="text-[9px] text-slate-400 font-mono uppercase">Decoding sector comfort matrix payload...</p>
                </div>
              </div>
            )}

            {/* Results Frame Overlay */}
            {scanResult && (
              <div className="absolute inset-0 bg-slate-950/95 rounded-3xl flex flex-col items-center justify-center p-6 space-y-4 z-40 animate-in zoom-in-95 duration-200">
                <div className={`p-4 rounded-full ${
                  scanResult.success 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {scanResult.success ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                </div>

                <div className="text-center max-w-sm space-y-1">
                  <h3 className={`text-xs font-black font-mono uppercase ${scanResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {scanResult.success ? 'Verification Successful' : 'Verification Denied'}
                  </h3>
                  <p className="text-[10px] text-slate-300 font-bold leading-relaxed">
                    {scanResult.message}
                  </p>
                </div>

                {scanResult.success && scanResult.data && (
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl text-center space-y-0.5 text-[10px] font-mono text-slate-400 min-w-[200px]">
                    <div>Sector: {scanResult.data.roomId}</div>
                    <div>Time: {scanResult.data.timestamp}</div>
                    <div>Status: Marked Present</div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {!scanResult.success && (
                    <button
                      type="button"
                      onClick={() => setScanResult(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer border border-slate-700"
                    >
                      Try Again
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Checked-In Block */}
            {alreadyCheckedIn && !scanResult && (
              <div className="absolute inset-0 bg-slate-950/90 rounded-3xl flex flex-col items-center justify-center p-6 space-y-4 z-30">
                <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  <CheckCircle size={32} />
                </div>
                <div className="text-center space-y-1.5 max-w-xs">
                  <h3 className="text-xs font-black font-mono text-emerald-400 uppercase">Attendance Completed</h3>
                  <p className="text-[10px] text-slate-300 font-bold leading-relaxed">
                    You have registered your attendance check-in for today (<b>{todayStr}</b>).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-[10px] font-black rounded-xl uppercase tracking-widest cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Footer info banner */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[9px] uppercase font-mono tracking-wider text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield size={10} className="text-emerald-500 shrink-0" />
            Attendance Lock: Secure Geolocation Sync Active
          </div>
          <div className="text-slate-400 text-right">
            Daily Reset: 12:00 AM
          </div>
        </div>

      </div>
    </div>
  );
}
