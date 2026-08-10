/// <reference types="vite/client" />
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_ROOMS, MOCK_USERS, HOSTELS, FEATURES, INTEREST_TAGS } from './constants';
import {
  Room,
  RoomStatus,
  User,
  UserRole,
  BookingRequest,
  Complaint,
  BroadcastMessage,
  GatePassRequest,
  AttendanceRecord,
  Hostel,
  ActivityLog
} from "./types";

import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { FloorMap } from './components/FloorMap';
import { RoomModal } from './components/RoomModal';
import { UserProfile } from './components/UserProfile';
import { BookingRequestsPanel } from './components/BookingRequestsPanel';
import { CreateUserModal } from './components/CreateUserModal';
import { ComplaintModal } from './components/ComplaintModal';
import { ComplaintsPanel } from './components/ComplaintsPanel';
import { ConfirmationModal } from './components/ConfirmationModal';
import { BroadcastModal } from './components/BroadcastModal';
import { NotificationsPanel } from './components/NotificationsPanel';
import { GatePassModal } from './components/GatePassModal';
import { GatePassPanel } from './components/GatePassPanel';
import { CCTVModal } from './components/CCTVModal';
import { AttendancePanel } from './components/AttendancePanel';
import { BulkAssignModal } from './components/BulkAssignModal';
import { QRScannerModal } from './components/QRScannerModal';
import {
  ArrowUpRight,
  TrendingUp,
  Users,
  IndianRupee,
  CheckCircle,
  AlertTriangle,
  X,
  UserPlus,
  Search,
  MessageSquareWarning,
  Clock,
  Building,
  Trash2,
  Megaphone,
  Ticket,
  UserCheck,
  Layers,
  Wrench,
  Activity,
  LogOut,
  Filter,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  QrCode,
  Scan
} from 'lucide-react';

import { getOfflineQueue, addToOfflineQueue, syncOfflineQueue, QueuedAction } from './offlineQueue';

import { motion, AnimatePresence } from 'motion/react';

// Backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

type ConfirmationState = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  isDangerous: boolean;
  confirmText?: string;
  cancelText?: string;
};

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [broadcastMessages, setBroadcastMessages] = useState<BroadcastMessage[]>([]);
  const [gatePassRequests, setGatePassRequests] = useState<GatePassRequest[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [hostels, setHostels] = useState<Hostel[]>(HOSTELS);
  const [features, setFeatures] = useState<string[]>([]);
  const [interestTags, setInterestTags] = useState<string[]>([]);

  const [selectedHostel, setSelectedHostel] = useState<Hostel>(HOSTELS[0]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const availableHostels = useMemo(() => {
    if (!currentUser) return hostels;
    if (currentUser.role === UserRole.ADMIN) return hostels;
    const gender = (currentUser.gender || '').toLowerCase();
    if (gender === 'male') {
      return hostels.filter(h => h.id === 'krishna' || h.id === 'bhargav' || h.id === 'sanjay');
    } else if (gender === 'female') {
      return hostels.filter(h => h.id === 'vaigai' || h.id === 'noyal');
    }
    return hostels;
  }, [currentUser, hostels]);

  useEffect(() => {
    if (availableHostels.length > 0 && !availableHostels.some(h => !h || h.id === selectedHostel.id)) {
      const match = availableHostels.find(h => h.id === selectedHostel.id);
      if (!match) {
        setSelectedHostel(availableHostels[0]);
      }
    } else if (availableHostels.length > 0 && !selectedHostel) {
      setSelectedHostel(availableHostels[0]);
    }
  }, [availableHostels, selectedHostel]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [viewProfileId, setViewProfileId] = useState<string | null>(null);
  const [isRequestsPanelOpen, setIsRequestsPanelOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isComplaintsPanelOpen, setIsComplaintsPanelOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
  const [isGatePassModalOpen, setIsGatePassModalOpen] = useState(false);
  const [isGatePassPanelOpen, setIsGatePassPanelOpen] = useState(false);
  const [isAttendancePanelOpen, setIsAttendancePanelOpen] = useState(false);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);

  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'allocation' | 'vacate' | 'maintenance' | 'complaint' | 'gatepass' | 'attendance' | 'broadcast'>('all');

  const filteredActivityLogs = useMemo(() => {
    if (activityFilter === 'all') return activityLogs;
    return activityLogs.filter(log => log.type === activityFilter);
  }, [activityLogs, activityFilter]);

  const [isCCTVOpen, setIsCCTVOpen] = useState(false);
  const [cctvFloor, setCctvFloor] = useState(1);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDangerous: false,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
  });

  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean | null>(null);

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueueLength, setOfflineQueueLength] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isOfflinePanelExpanded, setIsOfflinePanelExpanded] = useState<boolean>(false);

  // 🔁 LOAD CONFIG + ALL COLLECTIONS FROM BACKEND + FALLBACK TO MOCKS
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Fetch config status
        const configRes = await fetch(`${API_BASE_URL}/api/config`);
        if (configRes.ok) {
          const configData = await configRes.json();
          setIsFirebaseConnected(configData.isFirebaseConfigured);
        } else {
          setIsFirebaseConnected(false);
        }

        const [usersRes, roomsRes, bookingsRes, complaintsRes, broadcastsRes, gatepassesRes, attendanceRes, hostelsRes, featuresRes, interestTagsRes, activitiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users`),
          fetch(`${API_BASE_URL}/api/rooms`),
          fetch(`${API_BASE_URL}/api/booking-requests`),
          fetch(`${API_BASE_URL}/api/complaints`),
          fetch(`${API_BASE_URL}/api/broadcasts`),
          fetch(`${API_BASE_URL}/api/gatepasses`),
          fetch(`${API_BASE_URL}/api/attendance`),
          fetch(`${API_BASE_URL}/api/hostels`),
          fetch(`${API_BASE_URL}/api/features`),
          fetch(`${API_BASE_URL}/api/interest-tags`),
          fetch(`${API_BASE_URL}/api/activities`),
        ]);

        const usersData = await usersRes.json();
        const roomsData = await roomsRes.json();
        const bookingsData = await bookingsRes.json();
        const complaintsData = await complaintsRes.json().catch(() => []);
        const broadcastsData = await broadcastsRes.json().catch(() => []);
        const gatepassesData = await gatepassesRes.json().catch(() => []);
        const attendanceData = await attendanceRes.json().catch(() => []);
        const hostelsData = await hostelsRes.json().catch(() => []);
        const featuresData = await featuresRes.json().catch(() => []);
        const interestTagsData = await interestTagsRes.json().catch(() => []);
        const activitiesData = await activitiesRes.json().catch(() => []);

        const finalUsers = usersData.length ? usersData : MOCK_USERS;
        const finalRooms = roomsData.length ? roomsData : MOCK_ROOMS;
        const finalHostels = hostelsData.length ? hostelsData : HOSTELS;
        const finalFeatures = featuresData.length ? featuresData : FEATURES;
        const finalInterestTags = interestTagsData.length ? interestTagsData : INTEREST_TAGS;

        setUsers(finalUsers);
        setRooms(finalRooms);
        setHostels(finalHostels);
        setFeatures(finalFeatures);
        setInterestTags(finalInterestTags);
        setBookingRequests(bookingsData);
        setComplaints(complaintsData);
        setBroadcastMessages(broadcastsData);
        setGatePassRequests(gatepassesData);
        setAttendanceRecords(attendanceData);
        setActivityLogs(activitiesData);
      } catch (err) {
        console.error("Backend unavailable or loading failed → using mocks", err);
        setUsers(MOCK_USERS);
        setRooms(MOCK_ROOMS);
        setHostels(HOSTELS);
        setFeatures(FEATURES);
        setInterestTags(INTEREST_TAGS);
        setBookingRequests([]);
        setComplaints([]);
        setBroadcastMessages([]);
        setGatePassRequests([]);
        setAttendanceRecords([]);
        setActivityLogs([]);
        setIsFirebaseConnected(false);
      }
    }

    loadInitialData();
  }, []);

  // 🌐 OFFLINE SYNC MECHANISMS
  const triggerSync = async () => {
    if (isSyncing) return;
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    try {
      const result = await syncOfflineQueue(
        (action) => {
          console.log(`Successfully synced offline action: ${action.description}`);
        },
        (action, err) => {
          console.error(`Failed to sync offline action (${action.description}):`, err);
        }
      );

      if (result.successCount > 0) {
        setNotification({
          message: `Successfully synced ${result.successCount} pending offline action(s)!`,
          type: "success"
        });
        setTimeout(() => setNotification(null), 3500);

        // Refresh all collections from server to ensure UI is in perfect sync
        try {
          const [roomsRes, bookingsRes, complaintsRes, gatepassesRes, usersRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/rooms`),
            fetch(`${API_BASE_URL}/api/booking-requests`),
            fetch(`${API_BASE_URL}/api/complaints`),
            fetch(`${API_BASE_URL}/api/gatepasses`),
            fetch(`${API_BASE_URL}/api/users`),
          ]);
          if (roomsRes.ok) setRooms(await roomsRes.json());
          if (bookingsRes.ok) setBookingRequests(await bookingsRes.json());
          if (complaintsRes.ok) setComplaints(await complaintsRes.json());
          if (gatepassesRes.ok) setGatePassRequests(await gatepassesRes.json());
          if (usersRes.ok) setUsers(await usersRes.json());
        } catch (e) {
          console.warn("Offline actions synced, but reloading server data failed:", e);
        }
      }
    } catch (e) {
      console.error("Critical error in offline sync queue:", e);
    } finally {
      setIsSyncing(false);
      setOfflineQueueLength(getOfflineQueue().length);
    }
  };

  const executeActionWithOfflineCache = async (
    url: string,
    options: {
      method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body: any;
      description: string;
    }
  ) => {
    // If we are offline, queue immediately
    if (!navigator.onLine) {
      addToOfflineQueue({
        url,
        method: options.method,
        body: options.body,
        description: options.description,
      });
      setOfflineQueueLength(getOfflineQueue().length);
      setNotification({
        message: `Offline: "${options.description}" saved locally. Will sync when online.`,
        type: "success"
      });
      setTimeout(() => setNotification(null), 4000);
      return null;
    }

    try {
      const res = await fetch(url, {
        method: options.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options.body),
      });

      if (!res.ok) {
        if (res.status >= 500) {
          // Server error, save locally
          addToOfflineQueue({
            url,
            method: options.method,
            body: options.body,
            description: options.description,
          });
          setOfflineQueueLength(getOfflineQueue().length);
          setNotification({
            message: `Server Connection Error: Saved "${options.description}" locally for retry.`,
            type: "success"
          });
          setTimeout(() => setNotification(null), 4000);
          return null;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      return res;
    } catch (err) {
      // Network failure / fetch abort
      addToOfflineQueue({
        url,
        method: options.method,
        body: options.body,
        description: options.description,
      });
      setOfflineQueueLength(getOfflineQueue().length);
      setNotification({
        message: `Network Offline: Saved "${options.description}" locally to sync later.`,
        type: "success"
      });
      setTimeout(() => setNotification(null), 4000);
      return null;
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNotification({ message: "Back online! Syncing pending offline actions...", type: "success" });
      setTimeout(() => setNotification(null), 3000);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setNotification({ message: "Internet connection lost. Switched to offline mode.", type: "error" });
      setTimeout(() => setNotification(null), 3000);
    };

    const handleQueueChanged = (e: Event) => {
      const customEvent = e as CustomEvent<QueuedAction[]>;
      setOfflineQueueLength(customEvent.detail.length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-queue-changed', handleQueueChanged);

    // Sync queue initially if we are online on startup
    setOfflineQueueLength(getOfflineQueue().length);
    if (navigator.onLine) {
      triggerSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-queue-changed', handleQueueChanged);
    };
  }, []);

  useEffect(() => {
    // Retry syncing periodically every 15 seconds if online and there are items in queue
    const interval = setInterval(() => {
      if (navigator.onLine && getOfflineQueue().length > 0 && !isSyncing) {
        triggerSync();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [isSyncing]);

  // Filter Rooms based on Selected Hostel
  const hostelRooms = useMemo(() => {
    return rooms.filter(r => r.hostelId === selectedHostel.id);
  }, [rooms, selectedHostel.id]);

  // Computed Stats
  const totalRooms = hostelRooms.length;
  const totalBeds = hostelRooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBeds = hostelRooms.reduce(
    (acc, r) => acc + r.beds.filter(b => b.status === 'Occupied').length,
    0
  );
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const alreadyCheckedIn = useMemo(() => {
    if (!currentUser) return false;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const todayRecord = attendanceRecords.find(
      r => r.date === dateStr && r.hostelId === selectedHostel?.id
    );
    if (!todayRecord) return false;
    const studentRecord = todayRecord.records.find(rec => rec.studentId === currentUser.id);
    return studentRecord?.status === 'Present';
  }, [attendanceRecords, currentUser, selectedHostel]);

  const revenue = hostelRooms.reduce((acc, r) => {
    const usedBeds = r.beds.filter(b => b.status === 'Occupied').length;
    return acc + usedBeds * r.price;
  }, 0);

  // 📥 EXPORT HOSTEL OCCUPANCY DATA AS CSV
  const handleExportCSV = () => {
    const headers = [
      "Hostel Name",
      "Room Number",
      "Floor",
      "Room Type",
      "Capacity",
      "Room Status",
      "Room Price (INR)",
      "Bed Number",
      "Bed Status",
      "Student ID",
      "Student Name",
      "Student Email",
      "Student Department"
    ];

    const rows = [];

    for (const room of hostelRooms) {
      if (room.beds && room.beds.length > 0) {
        for (const bed of room.beds) {
          const student = bed.occupantId ? users.find(u => u.id === bed.occupantId) : null;
          rows.push([
            selectedHostel.name,
            room.number,
            room.floor,
            room.type,
            room.capacity,
            room.status,
            room.price,
            bed.number,
            bed.status,
            student ? student.id : "N/A",
            student ? student.name : "N/A",
            student ? student.email : "N/A",
            student ? student.department : "N/A"
          ]);
        }
      } else {
        rows.push([
          selectedHostel.name,
          room.number,
          room.floor,
          room.type,
          room.capacity,
          room.status,
          room.price,
          "N/A",
          "N/A",
          "N/A",
          "N/A",
          "N/A",
          "N/A"
        ]);
      }
    }

    const csvContent = [
      headers.join(","),
      ...rows.map(row => 
        row.map(val => {
          const str = String(val === null || val === undefined ? '' : val);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const sanitizedHostelName = selectedHostel.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `${sanitizedHostelName}_occupancy_report_${dateStr}.csv`);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification({
      message: `Successfully exported occupancy data for ${selectedHostel.name}!`,
      type: "success"
    });
    setTimeout(() => setNotification(null), 3500);
  };

  // LOGIN
  const handleLogin = (user: User) => {
    setCurrentUser(user);

    if (user.assignedRoomId) {
      const room = rooms.find(r => r.id === user.assignedRoomId);
      if (room) {
        const hostel = HOSTELS.find(h => h.id === room.hostelId);
        if (hostel) setSelectedHostel(hostel);
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedRoom(null);
    setViewProfileId(null);

    setIsRequestsPanelOpen(false);
    setIsComplaintModalOpen(false);
    setIsComplaintsPanelOpen(false);
    setIsBroadcastModalOpen(false);
    setIsNotificationsPanelOpen(false);
    setIsGatePassPanelOpen(false);
    setIsGatePassModalOpen(false);
    setIsAttendancePanelOpen(false);
    setIsBulkAssignOpen(false);
    setIsQRScannerOpen(false);

    setShowAvailableOnly(false);
    setSearchQuery('');
  };

  const handleDashboardClick = () => {
    setSelectedRoom(null);
    setViewProfileId(null);

    setIsRequestsPanelOpen(false);
    setIsCreateUserOpen(false);
    setIsComplaintModalOpen(false);
    setIsComplaintsPanelOpen(false);
    setIsBroadcastModalOpen(false);
    setIsNotificationsPanelOpen(false);
    setIsGatePassPanelOpen(false);
    setIsGatePassModalOpen(false);
    setIsAttendancePanelOpen(false);
    setIsBulkAssignOpen(false);
    setIsQRScannerOpen(false);

    setShowAvailableOnly(false);
    setSearchQuery('');
  };

  // CREATE USER (PERSIST)
  const handleCreateUser = (newUser: User) => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to create user");
        }

        const savedUser: User = await res.json();

        setUsers(prev => [...prev, savedUser]);
        setIsCreateUserOpen(false);
        setNotification({
          message: `Student ${savedUser.name} (ID: ${savedUser.id}) created successfully.`,
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        console.error("Error creating user:", err);
        setNotification({
          message: err.message || "Could not create user. Please try again.",
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    })();
  };

  // PROFILE PIC UPDATE (frontend only)
  const handleUpdateAvatar = (userId: string, newAvatarUrl: string) => {
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, avatarUrl: newAvatarUrl } : u
    );

    setUsers(updatedUsers);

    if (currentUser?.id === userId) {
      setCurrentUser(prev => (prev ? { ...prev, avatarUrl: newAvatarUrl } : null));
    }

    setNotification({ message: "Profile updated.", type: "success" });
    setTimeout(() => setNotification(null), 3000);
  };

  // TAG UPDATE (frontend only)
  const handleUpdateTags = (userId: string, newTags: string[]) => {
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, tags: newTags } : u
    );

    setUsers(updatedUsers);

    if (currentUser?.id === userId) {
      setCurrentUser(prev => (prev ? { ...prev, tags: newTags } : null));
    }

    setNotification({ message: "Tags updated.", type: "success" });
    setTimeout(() => setNotification(null), 2000);
  };

  // GITHUB UPDATE
  const handleUpdateGithub = (userId: string, newGithub: string) => {
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, githubUsername: newGithub } : u
    );

    setUsers(updatedUsers);

    if (currentUser?.id === userId) {
      setCurrentUser(prev => (prev ? { ...prev, githubUsername: newGithub } : null));
    }

    // Attempt backend sync
    (async () => {
      try {
        await fetch(`${API_BASE_URL}/api/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ githubUsername: newGithub }),
        });
      } catch (err) {
        console.error("Failed to sync GitHub account to server:", err);
      }
    })();

    setNotification({ message: "GitHub profile linked successfully.", type: "success" });
    setTimeout(() => setNotification(null), 3000);
  };

  // 📝 LOG ACTIVITY LOGGER
  const logActivity = async (message: string, type: 'allocation' | 'vacate' | 'maintenance' | 'complaint' | 'gatepass' | 'attendance' | 'broadcast' | 'other', extra?: Partial<ActivityLog>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          type,
          timestamp: Date.now(),
          operatorName: currentUser?.name || "System",
          ...extra
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error("Failed to log activity:", err);
      const fallbackLog: ActivityLog = {
        id: `act_local_${Date.now()}`,
        message,
        type,
        timestamp: Date.now(),
        operatorName: currentUser?.name || "System",
        ...extra
      };
      setActivityLogs(prev => [fallbackLog, ...prev]);
    }
  };

  // UNASSIGN BED (frontend only for now)
  const handleUnassignUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser || !targetUser.assignedRoomId || !targetUser.assignedBedId) return;

    const roomId = targetUser.assignedRoomId;
    const bedId = targetUser.assignedBedId;

    const updatedRooms = rooms.map(r => {
      if (r.id !== roomId) return r;

      const updatedBeds = r.beds.map(b =>
        b.id === bedId ? { ...b, status: "Available", occupantId: null } : b
      );

      return {
        ...r,
        beds: updatedBeds,
        occupants: (r.occupants || []).filter(id => id !== userId)
      };
    });

    setRooms(updatedRooms);

    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, assignedRoomId: null, assignedBedId: null, isAlloted: false, roomNo: undefined, hostelName: undefined } : u
    );

    setUsers(updatedUsers);

    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, assignedRoomId: null, assignedBedId: null, isAlloted: false, roomNo: undefined, hostelName: undefined });
    }

    logActivity(`${targetUser.name} moved out of Room ${roomId.split('-')[1] || roomId}`, 'vacate', {
      studentId: targetUser.id,
      studentName: targetUser.name,
      roomId: roomId,
    });

    setNotification({ message: "User unassigned.", type: "success" });
    setTimeout(() => setNotification(null), 3000);
  };

  // ROOM ACTIONS (request, vacate, maintenance)
  // ROOM ACTIONS (request, vacate, maintenance)
const RoomAction = (room: Room, action: string, bedId?: string) => {
  // STUDENT REQUEST → always update UI, then TRY backend
  if (action === "request" && bedId && currentUser) {
    const tempReq: BookingRequest = {
      id: `req_${Date.now()}`,           // temporary id for frontend
      roomId: room.id,
      bedId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      timestamp: Date.now(),
    };

    // 1️⃣ Instant UI update (old behaviour)
    setBookingRequests(prev => [...prev, tempReq]);

    const updatedRooms = rooms.map(r => {
      if (r.id !== room.id) return r;
      return {
        ...r,
        beds: r.beds.map(b =>
          b.id === bedId ? { ...b, status: "Requested" } : b
        ),
      };
    });

    setRooms(updatedRooms);

    logActivity(`${currentUser.name} requested Room ${room.number}`, 'allocation', {
      studentId: currentUser.id,
      studentName: currentUser.name,
      roomId: room.id,
    });

    setNotification({ message: "Request sent!", type: "success" });
    setTimeout(() => setNotification(null), 3000);

    // 2️⃣ TRY to sync with backend (non-blocking)
    (async () => {
      try {
        const res = await executeActionWithOfflineCache(`${API_BASE_URL}/api/booking-requests`, {
          method: "POST",
          body: tempReq, // Pass the full tempReq which includes the correct custom ID
          description: `Room booking request for Room ${room.number} (${currentUser.name})`
        });

        if (res && res.ok) {
          const savedReq: BookingRequest = await res.json();
          // Replace temp request with backend-saved one
          setBookingRequests(prev =>
            prev.map(r => (r.id === tempReq.id ? savedReq : r))
          );
        }
      } catch (err) {
        console.warn("Could not sync booking request to backend:", err);
      }
    })();

    return;
  }

  // 🔽 everything below is SAME as you already have (vacate + maintenance)
  if (action === "vacate" && bedId) {
    (async () => {
      try {
        const targetBed = room.beds.find(b => b.id === bedId);
        const occupantId = targetBed?.occupantId;

        let updatedRoomsLocal = rooms.map(r => {
          if (r.id === room.id) {
            const updatedBeds = r.beds.map(b =>
              b.id === bedId
                ? { ...b, status: "Available" as const, occupantId: null }
                : b
            );
            const isMaintenance = r.status === RoomStatus.MAINTENANCE;
            let newStatus = r.status;
            if (!isMaintenance) {
              const isFull = updatedBeds.every(
                b => b.status === "Occupied" || b.status === "Maintenance"
              );
              newStatus = isFull ? RoomStatus.OCCUPIED : RoomStatus.AVAILABLE;
            }
             return {
              ...r,
              beds: updatedBeds,
              occupants: (r.occupants || []).filter(id => id !== occupantId),
              status: newStatus,
            };
          }
          return r;
        });

        const updatedRoom = updatedRoomsLocal.find(r => r.id === room.id);
        if (!updatedRoom) {
          throw new Error("Updated room not found");
        }

        // If there was an occupant, update that user
        let updatedUser: User | null = null;
        let updatedUsersLocal = users;
        if (occupantId) {
          updatedUsersLocal = users.map(u =>
            u.id === occupantId
              ? { ...u, assignedRoomId: null, assignedBedId: null, isAlloted: false, roomNo: undefined, hostelName: undefined }
              : u
          );
          updatedUser =
            updatedUsersLocal.find(u => u.id === occupantId) || null;
        }

        // Persist changes
        const promises: Promise<Response>[] = [
          fetch(`${API_BASE_URL}/api/rooms/${room.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedRoom),
          }),
        ];

        if (updatedUser) {
          promises.push(
            fetch(`${API_BASE_URL}/api/users/${updatedUser.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updatedUser),
            })
          );
        }

        const results = await Promise.all(promises);
        if (results.some(r => !r.ok)) {
          throw new Error("Failed to save vacate in backend");
        }

        const savedRoom: Room = await results[0].json();
        setRooms(prev =>
          prev.map(r => (r.id === savedRoom.id ? savedRoom : r))
        );

        if (updatedUser) {
          const savedUser: User = await results[1].json();
          setUsers(prev =>
            prev.map(u => (u.id === savedUser.id ? savedUser : u))
          );
          if (currentUser?.id === savedUser.id) {
            setCurrentUser(savedUser);
          }
        }

        setSelectedRoom(savedRoom);

        const student = users.find(u => u.id === occupantId);
        const studentName = student?.name || "Student";
        logActivity(`${studentName} vacated Room ${room.number}`, 'vacate', {
          studentId: occupantId || undefined,
          studentName,
          roomId: room.id,
        });

        setNotification({ message: "Bed vacated successfully.", type: "success" });
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        console.error("Error vacating bed:", err);
        setNotification({
          message: err.message || "Could not vacate bed.",
          type: "error",
        });
        setTimeout(() => setNotification(null), 4000);
      }
    })();

    return;
  }

  // MAINTENANCE part
  const updatedRooms = rooms.map(r => {
    if (r.id === room.id && action === "maintenance") {
      const maintenanceBeds = r.beds.map(b => ({
        ...b,
        status: "Maintenance" as const,
      }));
      return { ...r, status: RoomStatus.MAINTENANCE, beds: maintenanceBeds };
    }
    if (r.id === room.id && action === "maintenance_complete") {
      const availableBeds = r.beds.map(b => ({
        ...b,
        status: "Available" as const,
        occupantId: null,
      }));
      return { ...r, status: RoomStatus.AVAILABLE, beds: availableBeds };
    }
    return r;
  });

  if (action === "maintenance" || action === "maintenance_complete") {
    (async () => {
      try {
        const updatedRoom = updatedRooms.find(r => r.id === room.id);
        if (!updatedRoom) return;

        const res = await fetch(`${API_BASE_URL}/api/rooms/${room.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRoom),
        });

        if (!res.ok) {
          throw new Error("Failed to save maintenance state");
        }

        const savedRoom: Room = await res.json();
        setRooms(prev =>
          prev.map(r => (r.id === savedRoom.id ? savedRoom : r))
        );
        if (selectedRoom?.id === room.id) {
          setSelectedRoom(savedRoom);
        }

        logActivity(
          action === "maintenance" 
            ? `Room ${room.number} Tagged for Service (Maintenance Mode enabled)` 
            : `Maintenance completed for Room ${room.number}`,
          'maintenance',
          { roomId: room.id }
        );

        setNotification({
          message: action === "maintenance" ? "Room set to maintenance mode." : "Maintenance marked completed successfully.",
          type: "success"
        });
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        console.error("Error setting maintenance:", err);
        setNotification({
          message: err.message || "Could not update maintenance state.",
          type: "error",
        });
        setTimeout(() => setNotification(null), 4000);
      }
    })();
  } else {
    setRooms(updatedRooms);
    if (selectedRoom?.id === room.id) {
      const updatedRoom = updatedRooms.find(r => r.id === room.id);
      setSelectedRoom(updatedRoom || null);
    }
  }
};

  // ---------- APPROVE REQUEST (with gender restriction + persist to DB) ----------
  const handleApproveRequest = (request: BookingRequest) => {
    (async () => {
      try {
        const room = rooms.find(r => r.id === request.roomId);
        const user = users.find(u => u.id === request.studentId);
        const hostel = room ? HOSTELS.find(h => h.id === room.hostelId) : undefined;

        // Gender checks
        if (room && user && hostel) {
          if (hostel.type === "Girls" && user.gender === "Male") {
            setNotification({
              message: "Cannot approve: male student for girls hostel.",
              type: "error"
            });
            setTimeout(() => setNotification(null), 4000);
            return;
          }
          if (hostel.type === "Boys" && user.gender === "Female") {
            setNotification({
              message: "Cannot approve: female student for boys hostel.",
              type: "error"
            });
            setTimeout(() => setNotification(null), 4000);
            return;
          }
        }

        // 1️⃣ Update room locally
        const updatedRoomsLocal = rooms.map(r => {
          if (r.id === request.roomId) {
            const updatedBeds = r.beds.map(b =>
              b.id === request.bedId
                ? { ...b, status: "Occupied" as const, occupantId: request.studentId }
                : b
            );
            const isFull = updatedBeds.every(
              b => b.status === "Occupied" || b.status === "Maintenance"
            );
             return {
              ...r,
              beds: updatedBeds,
              occupants: [...(r.occupants || []), request.studentId],
              status: isFull ? RoomStatus.OCCUPIED : r.status,
            };
          }
          return r;
        });

        const updatedRoom = updatedRoomsLocal.find(r => r.id === request.roomId);
        if (!updatedRoom) {
          throw new Error("Updated room not found");
        }

        // 2️⃣ Update user locally
        const student = users.find(u => u.id === request.studentId);
        if (!student) {
          throw new Error("Student not found");
        }

        const updatedUser: User = {
          ...student,
          assignedRoomId: request.roomId,
          assignedBedId: request.bedId,
          isAlloted: true,
          roomNo: request.roomId.split('-')[1] || "",
          hostelName: hostel?.name || "Hostel"
        };

        // 3️⃣ Persist room + user + delete booking request in backend
        const [roomRes, userRes, delRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/rooms/${request.roomId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedRoom),
          }),
          fetch(`${API_BASE_URL}/api/users/${request.studentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUser),
          }),
          fetch(`${API_BASE_URL}/api/booking-requests/${request.id}`, {
            method: "DELETE",
          }),
        ]);

        if (!roomRes.ok || !userRes.ok || !delRes.ok) {
          console.error("Approval error statuses:", roomRes.status, userRes.status, delRes.status);
          throw new Error("Failed to save approval in backend");
        }

        const savedRoom: Room = await roomRes.json();
        const savedUser: User = await userRes.json();

        // 4️⃣ Update React state
        setRooms(prev =>
          prev.map(r => (r.id === savedRoom.id ? savedRoom : r))
        );
        setUsers(prev =>
          prev.map(u => (u.id === savedUser.id ? savedUser : u))
        );
        setBookingRequests(prev =>
          prev.filter(req => req.id !== request.id)
        );

        if (currentUser?.id === savedUser.id) {
          setCurrentUser(savedUser);
        }

        logActivity(`${request.studentName} allocated to Room ${request.roomId.split('-')[1] || request.roomId}`, 'allocation', {
          studentId: request.studentId,
          studentName: request.studentName,
          roomId: request.roomId,
        });

        setNotification({
          message: `Request for ${request.studentName} approved.`,
          type: "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        console.error("Error approving request:", err);
        setNotification({
          message: err.message || "Could not approve request.",
          type: "error",
        });
        setTimeout(() => setNotification(null), 4000);
      }
    })();
  };

  // ---------- REJECT REQUEST (persist room + delete from DB) ----------
  const Request = (request: BookingRequest) => {
  (async () => {
    try {
      // 1️⃣ Free the bed locally
      const updatedRoomsLocal = rooms.map(r => {
        if (r.id === request.roomId) {
          const updatedBeds = r.beds.map(b =>
            b.id === request.bedId
              ? { ...b, status: "Available" as const, occupantId: null }
              : b
          );
          return { ...r, beds: updatedBeds };
        }
        return r;
      });

      const updatedRoom = updatedRoomsLocal.find(r => r.id === request.roomId);
      if (!updatedRoom) {
        throw new Error("Updated room not found");
      }

      // 2️⃣ Persist room
      const roomRes = await fetch(`${API_BASE_URL}/api/rooms/${request.roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRoom),
      });

      if (!roomRes.ok) {
        throw new Error("Failed to save rejection in backend");
      }

      // 2.5️⃣ Try deleting booking request on backend, but don't block UI
      try {
        await fetch(`${API_BASE_URL}/api/booking-requests/${request.id}`, {
          method: "DELETE",
        });
      } catch (e) {
        console.warn("Could not delete booking request from backend:", e);
      }

      const savedRoom: Room = await roomRes.json();

      // 3️⃣ Update state + drop request locally
      setRooms(prev =>
        prev.map(r => (r.id === savedRoom.id ? savedRoom : r))
      );
      setBookingRequests(prev =>
        prev.filter(req => req.id !== request.id)
      );

      setNotification({
        message: "Request rejected. Bed released.",
        type: "success",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      console.error("Error rejecting request:", err);
      setNotification({
        message: err.message || "Could not reject request.",
        type: "error",
      });
      setTimeout(() => setNotification(null), 4000);
    }
  })();
};


  // ---------- ROOM FEATURE UPDATE (used by RoomModal) ----------
  const handleFeatureUpdate = (roomId: string, newFeatures: string[]) => {
    (async () => {
      try {
        const room = rooms.find(r => r.id === roomId);
        if (!room) return;

        const updatedRoom: Room = { ...room, features: newFeatures };
        const res = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRoom),
        });

        if (!res.ok) {
          throw new Error("Failed to update room features");
        }

        const savedRoom: Room = await res.json();
        setRooms(prev => prev.map(r => (r.id === savedRoom.id ? savedRoom : r)));
        if (selectedRoom?.id === savedRoom.id) {
          setSelectedRoom(savedRoom);
        }

        setNotification({ message: "Room features updated.", type: "success" });
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        console.error("Error updating room features:", err);
        setNotification({
          message: err.message || "Could not update room features.",
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    })();
  };

  // COMPLAINT CREATE
  const handleSubmitComplaint = (type: string, description: string) => {
    if (!currentUser) return;

    const newComplaint = {
      id: `cmp_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      type: type as any,
      description,
      status: "Pending" as const,
      timestamp: Date.now()
    };

    setComplaints(prev => [newComplaint, ...prev]);
    setIsComplaintModalOpen(false);

    logActivity(`${currentUser.name} filed a new ${type} complaint`, 'complaint', {
      studentId: currentUser.id,
      studentName: currentUser.name,
    });

    setNotification({ message: "Complaint filed.", type: "success" });
    setTimeout(() => setNotification(null), 3000);

    executeActionWithOfflineCache(`${API_BASE_URL}/api/complaints`, {
      method: "POST",
      body: newComplaint,
      description: `File complaint regarding ${newComplaint.type} (${currentUser.name})`
    }).catch(err => console.error("Error creating complaint:", err));
  };

  // RESOLVE COMPLAINT
  const handleResolveComplaint = (id: string) => {
    setComplaints(prev =>
      prev.map(c =>
        c.id === id ? { ...c, status: "Resolved" as const } : c
      )
    );

    const targetComp = complaints.find(c => c.id === id);
    if (targetComp) {
      logActivity(`Complaint from ${targetComp.studentName} regarding ${targetComp.type} marked Resolved`, 'complaint', {
        studentId: targetComp.studentId,
        studentName: targetComp.studentName,
      });
    }

    setNotification({ message: "Resolved.", type: "success" });
    setTimeout(() => setNotification(null), 3000);

    executeActionWithOfflineCache(`${API_BASE_URL}/api/complaints/${id}`, {
      method: "PUT",
      body: { status: "Resolved" },
      description: `Mark complaint as Resolved (ID: ${id})`
    }).catch(err => console.error("Error resolving complaint:", err));
  };

  // BROADCAST
  const handleSendBroadcast = (message: string, priority: 'Normal' | 'High') => {
    const newBroadcast: BroadcastMessage = {
      id: `broadcast_${Date.now()}`,
      message,
      priority,
      sender: currentUser?.name || "Admin",
      timestamp: Date.now()
    };

    setBroadcastMessages(prev => [newBroadcast, ...prev]);
    setIsBroadcastModalOpen(false);

    setNotification({ message: "Broadcast sent.", type: "success" });
    setTimeout(() => setNotification(null), 3000);

    executeActionWithOfflineCache(`${API_BASE_URL}/api/broadcasts`, {
      method: "POST",
      body: newBroadcast,
      description: `Broadcast message: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"`
    }).catch(err => console.error("Error creating broadcast:", err));
  };

  // GATEPASS REQUEST
  const handleRequestGatePass = (departure: string, returnDate: string, reason: string) => {
    if (!currentUser) return;

    const newRequest: GatePassRequest = {
      id: `gp_${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      departureDate: departure,
      returnDate,
      reason,
      status: "Pending" as const,
      timestamp: Date.now()
    };

    setGatePassRequests(prev => [newRequest, ...prev]);
    setIsGatePassModalOpen(false);

    logActivity(`${currentUser.name} requested a gate pass for departure on ${departure}`, 'gatepass', {
      studentId: currentUser.id,
      studentName: currentUser.name,
    });

    setNotification({ message: "GatePass submitted.", type: "success" });
    setTimeout(() => setNotification(null), 3000);

    executeActionWithOfflineCache(`${API_BASE_URL}/api/gatepasses`, {
      method: "POST",
      body: newRequest,
      description: `GatePass request for ${currentUser.name} on ${departure}`
    }).catch(err => console.error("Error creating gate pass request:", err));
  };

  // GATEPASS APPROVE
  const handleApproveGatePass = (id: string) => {
    setGatePassRequests(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: "Approved" as const } : r
      )
    );

    const targetGP = gatePassRequests.find(r => r.id === id);
    if (targetGP) {
      logActivity(`Gate pass request for ${targetGP.studentName} was approved`, 'gatepass', {
        studentId: targetGP.studentId,
        studentName: targetGP.studentName,
      });
    }

    setNotification({ message: "Approved.", type: "success" });
    setTimeout(() => setNotification(null), 2000);

    executeActionWithOfflineCache(`${API_BASE_URL}/api/gatepasses/${id}`, {
      method: "PUT",
      body: { status: "Approved" },
      description: `Approve GatePass request for ${targetGP?.studentName || 'Student'}`
    }).catch(err => console.error("Error approving gate pass requests:", err));
  };

  // GATEPASS REJECT
  const GatePass = (id: string) => {
    setGatePassRequests(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: "Rejected" as const } : r
      )
    );

    const targetGP = gatePassRequests.find(r => r.id === id);
    if (targetGP) {
      logActivity(`Gate pass request for ${targetGP.studentName} was rejected`, 'gatepass', {
        studentId: targetGP.studentId,
        studentName: targetGP.studentName,
      });
    }

    setNotification({ message: "Rejected.", type: "success" });
    setTimeout(() => setNotification(null), 2000);

    executeActionWithOfflineCache(`${API_BASE_URL}/api/gatepasses/${id}`, {
      method: "PUT",
      body: { status: "Rejected" },
      description: `Reject GatePass request for ${targetGP?.studentName || 'Student'}`
    }).catch(err => console.error("Error rejecting gate pass requests:", err));
  };

  // ATTENDANCE SAVE
  const handleAttendanceSave = (date: string, records: any[]) => {
    const newRecord: AttendanceRecord = {
      date,
      hostelId: selectedHostel.id,
      records
    };

    setAttendanceRecords(prev => [...prev, newRecord]);
    setIsAttendancePanelOpen(false);

    logActivity(`Daily attendance marked for ${selectedHostel.name} on ${date}`, 'attendance', {
      hostelId: selectedHostel.id,
    });

    setNotification({ message: "Attendance saved.", type: "success" });
    setTimeout(() => setNotification(null), 3000);

    executeActionWithOfflineCache(`${API_BASE_URL}/api/attendance`, {
      method: "POST",
      body: newRecord,
      description: `Save attendance for ${selectedHostel.name} on ${date}`
    }).catch(err => console.error("Error saving attendance:", err));
  };

  // STUDENT SELF CHECK-IN VIA QR CODE
  const handleStudentCheckIn = async (roomId: string) => {
    if (!currentUser) return;
    
    // Get today's date in YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Find if there is an existing attendance record for today in this hostel
    const existingRecordIndex = attendanceRecords.findIndex(
      r => r.date === dateStr && r.hostelId === selectedHostel.id
    );

    let updatedRecords = [...attendanceRecords];
    let targetRecord: AttendanceRecord;

    if (existingRecordIndex > -1) {
      const oldRecord = attendanceRecords[existingRecordIndex];
      const recordsList = [...oldRecord.records];
      
      const studentRecordIndex = recordsList.findIndex(r => r.studentId === currentUser.id);
      if (studentRecordIndex > -1) {
        recordsList[studentRecordIndex] = {
          ...recordsList[studentRecordIndex],
          roomId,
          status: 'Present'
        };
      } else {
        recordsList.push({
          studentId: currentUser.id,
          roomId,
          status: 'Present'
        });
      }

      targetRecord = {
        ...oldRecord,
        records: recordsList
      };
      updatedRecords[existingRecordIndex] = targetRecord;
    } else {
      // Create new record for today
      // Initialize with all residents as 'Absent' except this student who is 'Present'
      const residents = users.filter(u => {
        if (!u.assignedRoomId) return false;
        return u.assignedRoomId.startsWith(`${selectedHostel.id}-`);
      });

      const recordsList = residents.map(r => ({
        studentId: r.id,
        roomId: r.assignedRoomId!,
        status: r.id === currentUser.id ? ('Present' as const) : ('Absent' as const)
      }));

      if (!recordsList.some(r => r.studentId === currentUser.id)) {
        recordsList.push({
          studentId: currentUser.id,
          roomId,
          status: 'Present'
        });
      }

      targetRecord = {
        date: dateStr,
        hostelId: selectedHostel.id,
        records: recordsList
      };
      updatedRecords.push(targetRecord);
    }

    setAttendanceRecords(updatedRecords);

    setNotification({
      message: `Checked-in to Room ${roomId.split('-')[1]} successfully! Attendance updated.`,
      type: "success"
    });
    setTimeout(() => setNotification(null), 3500);

    // Sync to backend
    try {
      await executeActionWithOfflineCache(`${API_BASE_URL}/api/attendance`, {
        method: "POST",
        body: targetRecord,
        description: `QR Check-In for ${currentUser.name} at Room ${roomId}`
      });
    } catch (err) {
      console.error("Error saving QR check-in:", err);
    }

    // Log the check-in activity
    logActivity(
      `${currentUser.name} checked in to Room ${roomId.split('-')[1]} via QR code scanning.`,
      'attendance',
      {
        studentId: currentUser.id,
        studentName: currentUser.name,
        roomId: roomId,
        hostelId: selectedHostel.id
      }
    );
  };

  // BULK ASSIGN (persist rooms + users)
  const handleBulkAssign = (assignments: { userId: string; roomId: string; bedId: string }[]) => {
    (async () => {
      try {
        let updatedRooms = [...rooms];
        let updatedUsers = [...users];
        let blockedCount = 0;

        const touchedRoomIds = new Set<string>();
        const touchedUserIds = new Set<string>();

        assignments.forEach(assign => {
          const room = updatedRooms.find(r => r.id === assign.roomId);
          const user = updatedUsers.find(u => u.id === assign.userId);
          if (!room || !user) return;

          const hostel = HOSTELS.find(h => h.id === room.hostelId);
          if (hostel) {
            if (hostel.type === "Girls" && user.gender === "Male") {
              blockedCount++;
              return;
            }
            if (hostel.type === "Boys" && user.gender === "Female") {
              blockedCount++;
              return;
            }
          }

          updatedRooms = updatedRooms.map(r => {
            if (r.id === assign.roomId) {
              const updatedBeds = r.beds.map(b =>
                b.id === assign.bedId
                  ? { ...b, status: "Occupied" as const, occupantId: assign.userId }
                  : b
              );
              const isFull = updatedBeds.every(
                b => b.status === "Occupied" || b.status === "Maintenance"
              );
               return {
                ...r,
                beds: updatedBeds,
                occupants: [...(r.occupants || []), assign.userId],
                status: isFull ? RoomStatus.OCCUPIED : r.status,
              };
            }
            return r;
          });

          updatedUsers = updatedUsers.map(u =>
            u.id === assign.userId
              ? {
                  ...u,
                  assignedRoomId: assign.roomId,
                  assignedBedId: assign.bedId,
                  isAlloted: true,
                  roomNo: assign.roomId.split('-')[1] || "",
                  hostelName: hostel?.name || "Hostel"
                }
              : u
          );

          touchedRoomIds.add(assign.roomId);
          touchedUserIds.add(assign.userId);
        });

        const roomsToSave = updatedRooms.filter(r => touchedRoomIds.has(r.id));
        const usersToSave = updatedUsers.filter(u => touchedUserIds.has(u.id));

        const savePromises: Promise<Response>[] = [
          ...roomsToSave.map(room =>
            fetch(`${API_BASE_URL}/api/rooms/${room.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(room),
            })
          ),
          ...usersToSave.map(user =>
            fetch(`${API_BASE_URL}/api/users/${user.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(user),
            })
          ),
        ];

        const results = await Promise.all(savePromises);
        if (results.some(r => !r.ok)) {
          throw new Error("Failed to save some bulk assignments to backend");
        }

        setRooms(updatedRooms);
        setUsers(updatedUsers);
        setIsBulkAssignOpen(false);

        const successCount = assignments.length - blockedCount;
        if (successCount > 0) {
          logActivity(`Bulk auto-alloted ${successCount} students to available rooms.`, 'allocation');
        }

        let message = `Successfully assigned ${successCount} students to rooms.`;
        if (blockedCount > 0) {
          message += ` ${blockedCount} assignment(s) were blocked due to hostel gender restrictions.`;
        }

        setNotification({
          message,
          type: blockedCount > 0 && successCount === 0 ? "error" : "success",
        });
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        console.error("Error in bulk assign:", err);
        setNotification({
          message: err.message || "Could not complete bulk assignment.",
          type: "error",
        });
        setTimeout(() => setNotification(null), 4000);
      }
    })();
  };

  // ROOM UPDATE (used by RoomModal)
  const handleRoomUpdate = (updatedRoom: Room) => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/rooms/${updatedRoom.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedRoom),
        });

        if (!res.ok) {
          throw new Error("Failed to update room properties");
        }

        const savedRoom: Room = await res.json();
        setRooms(prev => prev.map(r => (r.id === savedRoom.id ? savedRoom : r)));
        if (selectedRoom?.id === savedRoom.id) {
          setSelectedRoom(savedRoom);
        }

        setNotification({ message: "Room details saved successfully.", type: "success" });
        setTimeout(() => setNotification(null), 3000);
      } catch (err: any) {
        console.error("Error updating room:", err);
        setNotification({
          message: err.message || "Could not update room.",
          type: "error",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    })();
  };

  // RESET SYSTEM (frontend only)
  const handleResetSystem = () => {
    setConfirmation({
      isOpen: true,
      title: "Reset System?",
      message: "This will clear ALL assignments.",
      confirmText: "Reset",
      cancelText: "Cancel",
      isDangerous: true,
      onConfirm: () => {
        const resetRooms = rooms.map(r => ({
          ...r,
          status: RoomStatus.AVAILABLE,
          occupants: [],
          beds: r.beds.map(b => ({
            ...b,
            occupantId: null,
            status: b.status === "Maintenance" ? "Maintenance" : "Available"
          }))
        }));

        const resetUsers = users.map(u => ({
          ...u,
          assignedRoomId: null,
          assignedBedId: null
        }));

        setRooms(resetRooms);
        setUsers(resetUsers);
        setBookingRequests([]);

        setNotification({
          message: "System reset.",
          type: "success"
        });

        setTimeout(() => setNotification(null), 3000);
      }
    });
  };

  // CCTV
  const handleOpenCCTV = (floor: number) => {
    setCctvFloor(floor);
    setIsCCTVOpen(true);
  };

  const onCloseModal = () => setSelectedRoom(null);

  const filteredUsers = searchQuery.trim()
    ? users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const profileUser = viewProfileId ? users.find(u => u.id === viewProfileId) : null;

  if (!currentUser) return <Login onLogin={handleLogin} users={users} />;

  const hasPendingRequest = bookingRequests.some(req => req.studentId === currentUser.id);
  const displayedRooms = showAvailableOnly
    ? hostelRooms.filter(r => r.status === RoomStatus.AVAILABLE)
    : hostelRooms;

  const displayedComplaints =
    currentUser.role === UserRole.ADMIN
      ? complaints
      : complaints.filter(c => c.studentId === currentUser.id);

  const totalPendingComplaintsCount = complaints.filter(c => c.status === 'Pending').length;
  const myPendingComplaints = complaints.filter(
    c => c.studentId === currentUser.id && c.status === 'Pending'
  ).length;

  const displayedGatePasses =
    currentUser.role === UserRole.ADMIN
      ? gatePassRequests
      : gatePassRequests.filter(r => r.studentId === currentUser.id);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onOpenProfile={() => setViewProfileId(currentUser.id)}
        onDashboardClick={handleDashboardClick}
        onOpenComplaints={() => setIsComplaintsPanelOpen(true)}
        pendingRequestsCount={
          currentUser.role === UserRole.ADMIN ? bookingRequests.length : broadcastMessages.length
        }
        pendingComplaintsCount={totalPendingComplaintsCount}
        onOpenNotifications={() =>
          currentUser.role === UserRole.ADMIN
            ? setIsRequestsPanelOpen(true)
            : setIsNotificationsPanelOpen(true)
        }
      />

      {notification && (
        <div className="fixed top-24 right-6 z-[100] animate-in slide-in-from-right duration-300 fade-in">
          <div
            className={`px-5 py-4 rounded-xl shadow-xl flex items-start gap-3 border backdrop-blur-md ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div
              className={`p-1 rounded-full ${
                notification.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle size={16} className="text-emerald-600" />
              ) : (
                <AlertTriangle size={16} className="text-rose-600" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-sm leading-none mb-1">
                {notification.type === 'success' ? 'Action Successful' : 'Error'}
              </h4>
              <p className="text-xs opacity-90 leading-tight">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 hover:bg-black/5 p-1 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <main className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
        {/* HOSTEL SELECTOR */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Building size={16} /> Select Hostel Building
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {availableHostels.map(hostel => (
              <button
                key={hostel.id}
                onClick={() => setSelectedHostel(hostel)}
                className={`p-4 rounded-xl border text-left transition-all duration-200 group relative overflow-hidden ${
                  selectedHostel.id === hostel.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div className="relative z-10">
                  <div className="text-sm font-bold truncate group-hover:scale-105 transition-transform origin-left">
                    {hostel.name}
                  </div>
                </div>
                {selectedHostel.id === hostel.id && (
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ADMIN DASHBOARD */}
        {currentUser.role === UserRole.ADMIN && (
          <div className="mb-12 space-y-6">
            {/* Search & Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative w-full max-w-xl">
              <div className="relative group z-30">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search
                    size={20}
                    className="text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                  />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search users by Name or ID..."
                  className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm focus:shadow-md"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-40 max-h-80 overflow-y-auto overflow-x-hidden custom-scrollbar animate-in slide-in-from-top-2 fade-in">
                  {filteredUsers.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {filteredUsers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setViewProfileId(u.id);
                            setSearchQuery('');
                          }}
                          className="w-full p-3 flex items-center gap-4 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                        >
                          <img
                            src={
                              u.avatarUrl ||
                              `https://ui-avatars.com/api/?name=${u.name}&background=random`
                            }
                            alt={u.name}
                            className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 group-hover:border-indigo-200"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 truncate">
                              {u.name}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                              <span className="font-mono bg-slate-100 px-1.5 rounded text-[10px] text-slate-600">
                                {u.id}
                              </span>
                              <span className="truncate">{u.email}</span>
                            </div>
                          </div>
                          {u.assignedRoomId && (
                            <div className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                              Room {u.assignedRoomId.split('-')[1]}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500">
                      <Search size={24} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">
                        No users found matching &quot;{searchQuery}&quot;
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2.5 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer shrink-0"
            >
              <Download size={14} /> Export Occupancy (CSV)
            </button>
          </div>

          {/* Admin Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Revenue */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-100 transition-colors" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="text-slate-500 text-sm font-medium">{selectedHostel.name} Revenue</div>
                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <IndianRupee size={20} className="text-emerald-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 relative z-10">
                  ₹{revenue.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-emerald-600 mt-2 flex items-center relative z-10">
                  <TrendingUp size={12} className="mr-1" /> Estimated Annual
                </div>
              </div>

              {/* Occupancy */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-100 transition-colors" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="text-slate-500 text-sm font-medium">Occupancy Rate</div>
                  <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                    <Users size={20} className="text-indigo-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 relative z-10">{occupancyRate}%</div>
                <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
              </div>

              {/* Pending Requests */}
              <div
                onClick={() => setIsRequestsPanelOpen(true)}
                className="bg-white border border-slate-200 p-6 rounded-2xl cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="text-slate-500 text-sm font-medium group-hover:text-blue-600 transition-colors">
                    Pending Requests
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <Users size={20} className="text-blue-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 relative z-10">
                  {bookingRequests.length}
                </div>
                <div className="text-xs text-blue-600 mt-2 relative z-10">
                  Click to manage approvals
                </div>
              </div>

              {/* Manage Users */}
              <div
                onClick={() => setIsCreateUserOpen(true)}
                className="bg-white border border-slate-200 p-6 rounded-2xl cursor-pointer hover:border-fuchsia-300 hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50/0 to-fuchsia-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="text-slate-500 text-sm font-medium group-hover:text-fuchsia-600 transition-colors">
                    Manage Users
                  </div>
                  <div className="p-2 bg-fuchsia-50 rounded-lg border border-fuchsia-100">
                    <UserPlus size={20} className="text-fuchsia-600" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 flex items-center gap-2 relative z-10">
                  <span className="text-2xl">Create</span>
                </div>
                <div className="text-xs text-fuchsia-600 mt-2 relative z-10">
                  Register new student ID
                </div>
              </div>
            </div>

            {/* Admin Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Broadcast */}
              <div
                onClick={() => setIsBroadcastModalOpen(true)}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Broadcast</h3>
                    <p className="text-[10px] text-slate-500">Send alerts</p>
                  </div>
                </div>
                <div className="bg-slate-100 p-2 rounded-lg text-slate-400 group-hover:text-indigo-600">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              {/* Bulk Assign */}
              <div
                onClick={() => setIsBulkAssignOpen(true)}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-violet-300 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-lg group-hover:bg-violet-100 transition-colors">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Bulk Assign</h3>
                    <p className="text-[10px] text-slate-500">Auto-fill rooms</p>
                  </div>
                </div>
              </div>

              {/* Gate Pass Admin */}
              <div
                onClick={() => setIsGatePassPanelOpen(true)}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                    <Ticket size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Gate Pass</h3>
                    <p className="text-[10px] text-slate-500">
                      {gatePassRequests.filter(r => r.status === 'Pending').length} Pending
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendance Admin */}
              <div
                onClick={() => setIsAttendancePanelOpen(true)}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">Attendance</h3>
                    <p className="text-[10px] text-slate-500">Daily check</p>
                  </div>
                </div>
              </div>

              {/* Reset System */}
              <div
                onClick={handleResetSystem}
                className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-rose-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-200 text-rose-700 rounded-lg">
                    <Trash2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-rose-900 text-sm">Reset All</h3>
                    <p className="text-[10px] text-rose-700">Dangerous</p>
                  </div>
                </div>
              </div>
            </div>


          </div>
        )}

        {/* STUDENT DASHBOARD */}
        {currentUser.role === UserRole.STUDENT && (
          <div className="mb-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-slate-900">
                  Welcome back, {currentUser.name.split(' ')[0]}
                </h1>
                <p className="text-slate-500">
                  Currently viewing{' '}
                  <span className="font-bold text-indigo-600">{selectedHostel.name}</span>. Use the
                  selector above to switch hostels.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsQRScannerOpen(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white border border-transparent rounded-xl shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all flex items-center gap-2 text-sm font-bold active:scale-95 cursor-pointer"
                >
                  <QrCode size={18} className="text-white" /> Room Check-In
                </button>
                <button
                  onClick={() => setIsComplaintsPanelOpen(true)}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 text-sm font-bold group cursor-pointer"
                >
                  <Clock size={18} className="text-indigo-500" /> History
                </button>
                <button
                  onClick={() => setIsGatePassModalOpen(true)}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white border border-transparent rounded-xl shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 text-sm font-bold active:scale-95"
                >
                  <Ticket size={18} className="text-white" /> Gate Pass
                </button>
                <button
                  onClick={() => setIsComplaintModalOpen(true)}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-transparent rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 text-sm font-bold active:scale-95"
                >
                  <MessageSquareWarning size={18} className="text-white" /> File Complaint
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Housing Status */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
                <div
                  className={`p-3 rounded-full ${
                    currentUser.assignedRoomId
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <CheckCircle size={24} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Housing Status</div>
                  <div className="text-sm font-bold text-slate-900">
                    {currentUser.assignedRoomId
                      ? `Room ${currentUser.assignedRoomId.split('-')[1]}`
                      : 'Not Assigned'}
                  </div>
                </div>
              </div>

              {/* Booking Request */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
                <div
                  className={`p-3 rounded-full ${
                    hasPendingRequest ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Booking Request</div>
                  <div className="text-sm font-bold text-slate-900">
                    {hasPendingRequest ? 'Pending Approval' : 'No Active Requests'}
                  </div>
                </div>
              </div>

              {/* QR Door Check-In Status */}
              <div
                className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all shadow-sm group"
                onClick={() => setIsQRScannerOpen(true)}
              >
                <div
                  className={`p-3 rounded-full ${
                    alreadyCheckedIn
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'
                  } transition-colors`}
                >
                  <QrCode size={24} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">QR Check-In</div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {alreadyCheckedIn ? 'Present' : 'Not Checked In'}
                    {!alreadyCheckedIn && (
                      <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                    )}
                  </div>
                </div>
              </div>

              {/* Complaints */}
              <div
                className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 cursor-pointer hover:border-indigo-300 transition-colors shadow-sm group"
                onClick={() => setIsComplaintsPanelOpen(true)}
              >
                <div
                  className={`p-3 rounded-full ${
                    myPendingComplaints > 0
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                  } transition-colors`}
                >
                  <MessageSquareWarning size={24} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">My Complaints</div>
                  <div className="text-sm font-bold text-slate-900">
                    {myPendingComplaints} Pending
                  </div>
                </div>
              </div>

              {/* Gate Pass Status */}
              <div
                className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 cursor-pointer hover:border-indigo-300 transition-colors shadow-sm group"
                onClick={() => setIsGatePassPanelOpen(true)}
              >
                <div
                  className={`p-3 rounded-full ${
                    gatePassRequests.filter(
                      r => r.studentId === currentUser.id && r.status === 'Pending'
                    ).length > 0
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-slate-100 text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-500'
                  } transition-colors`}
                >
                  <Ticket size={24} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase font-bold">Gate Pass</div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Status
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setIsGatePassModalOpen(true);
                      }}
                      className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] rounded border border-indigo-100 hover:bg-indigo-100"
                    >
                      + New
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FLOOR MAP + FILTERS */}
        <div className="relative">
          <div className="absolute top-4 left-4 md:left-24 right-4 z-10 flex flex-col md:flex-row items-start md:items-center justify-end gap-4 pointer-events-none">
            <div className="pointer-events-auto bg-white/80 backdrop-blur-md border border-slate-200 p-1.5 rounded-xl flex items-center space-x-1 shadow-sm">
              <button
                onClick={() => setShowAvailableOnly(false)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                  !showAvailableOnly
                    ? 'bg-slate-200 text-slate-800 shadow-inner'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                All Rooms
              </button>
              <button
                onClick={() => setShowAvailableOnly(true)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                  showAvailableOnly
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    showAvailableOnly ? 'bg-white' : 'bg-emerald-500'
                  }`}
                />{' '}
                Available Only
              </button>
            </div>
          </div>

          <FloorMap
            rooms={displayedRooms}
            onRoomClick={setSelectedRoom}
            selectedRoomId={selectedRoom?.id}
            gridCols={selectedHostel.gridCols}
            onOpenCCTV={handleOpenCCTV}
            showCCTV={true}
          />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-slate-400 text-sm">
        <p>Booking System v2.0 • Designed for Indian Colleges</p>
      </footer>

      {/* MODALS & PANELS */}
      {selectedRoom && (
        <RoomModal
          room={selectedRoom}
          user={currentUser}
          allUsers={users}
          onClose={onCloseModal}
          onAction={RoomAction}
          onFeatureUpdate={handleFeatureUpdate}
          onRoomUpdate={handleRoomUpdate}
          hasPendingRequest={hasPendingRequest}
          availableFeatures={features}
        />
      )}

      {profileUser && (
        <UserProfile
          user={profileUser}
          onClose={() => setViewProfileId(null)}
          onUnassign={() => handleUnassignUser(profileUser.id)}
          onUpdateAvatar={
            currentUser?.role === UserRole.ADMIN || currentUser?.id === profileUser.id
              ? url => handleUpdateAvatar(profileUser.id, url)
              : undefined
          }
          onUpdateTags={
            currentUser?.id === profileUser.id
              ? tags => handleUpdateTags(profileUser.id, tags)
              : undefined
          }
          onUpdateGithub={
            currentUser?.role === UserRole.ADMIN || currentUser?.id === profileUser.id
              ? github => handleUpdateGithub(profileUser.id, github)
              : undefined
          }
          availableInterestTags={interestTags}
        />
      )}

      {isRequestsPanelOpen && currentUser.role === UserRole.ADMIN && (
        <BookingRequestsPanel
          requests={bookingRequests}
          rooms={rooms}
          onApprove={handleApproveRequest}
          onReject={Request}
          onClose={() => setIsRequestsPanelOpen(false)}
        />
      )}

      {isComplaintsPanelOpen && (
        <ComplaintsPanel
          complaints={displayedComplaints}
          role={currentUser.role}
          onResolve={handleResolveComplaint}
          onClose={() => setIsComplaintsPanelOpen(false)}
        />
      )}

      {isComplaintModalOpen && (
        <ComplaintModal
          onClose={() => setIsComplaintModalOpen(false)}
          onSubmit={handleSubmitComplaint}
        />
      )}

      {isCreateUserOpen && currentUser.role === UserRole.ADMIN && (
        <CreateUserModal
          onClose={() => setIsCreateUserOpen(false)}
          onCreate={handleCreateUser}
          existingUsers={users}
          availableInterestTags={interestTags}
        />
      )}

      {isBroadcastModalOpen && (
        <BroadcastModal
          onClose={() => setIsBroadcastModalOpen(false)}
          onSend={handleSendBroadcast}
        />
      )}

      {isNotificationsPanelOpen && (
        <NotificationsPanel
          messages={broadcastMessages}
          onClose={() => setIsNotificationsPanelOpen(false)}
        />
      )}

      {isGatePassModalOpen && (
        <GatePassModal
          onClose={() => setIsGatePassModalOpen(false)}
          onSubmit={handleRequestGatePass}
        />
      )}

      {isGatePassPanelOpen && (
        <GatePassPanel
          requests={displayedGatePasses}
          role={currentUser.role}
          onApprove={handleApproveGatePass}
          onReject={GatePass}
          onClose={() => setIsGatePassPanelOpen(false)}
        />
      )}

      {isAttendancePanelOpen && (
        <AttendancePanel
          rooms={rooms}
          users={users}
          selectedHostel={selectedHostel}
          attendanceHistory={attendanceRecords}
          onClose={() => setIsAttendancePanelOpen(false)}
          onSave={handleAttendanceSave}
        />
      )}

      {isBulkAssignOpen && (
        <BulkAssignModal
          users={users}
          rooms={rooms}
          onClose={() => setIsBulkAssignOpen(false)}
          onAssign={handleBulkAssign}
          hostels={hostels}
        />
      )}

      {isCCTVOpen && (
        <CCTVModal
          floorNumber={cctvFloor}
          hostelName={selectedHostel.name}
          onClose={() => setIsCCTVOpen(false)}
        />
      )}

      {isQRScannerOpen && currentUser && (
        <QRScannerModal
          currentUser={currentUser}
          rooms={rooms}
          selectedHostel={selectedHostel}
          attendanceHistory={attendanceRecords}
          onClose={() => setIsQRScannerOpen(false)}
          onCheckIn={handleStudentCheckIn}
        />
      )}

      <ConfirmationModal
        isOpen={confirmation.isOpen}
        title={confirmation.title}
        message={confirmation.message}
        onConfirm={confirmation.onConfirm}
        onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
        isDangerous={confirmation.isDangerous}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
      />

      {/* 📶 OFFLINE CACHE AND SYNC MANAGER PANEL */}
      <div className="fixed bottom-6 right-6 z-[95] flex flex-col items-end gap-3 font-sans">
        <div
          className={`bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xl rounded-2xl p-4 transition-all duration-300 ${
            isOfflinePanelExpanded ? 'w-80 h-96' : 'w-72 h-16'
          } flex flex-col justify-between overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsOfflinePanelExpanded(!isOfflinePanelExpanded)}>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                {isOnline ? (
                  <>
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                  </>
                ) : (
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-50 border border-rose-200">
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-800 tracking-tight leading-none flex items-center gap-1">
                  {isOnline ? 'Network Connected' : 'Offline Mode'}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight mt-0.5 font-bold">
                  {offlineQueueLength > 0 ? `${offlineQueueLength} actions cached` : 'Database up to date'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {offlineQueueLength > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Pending
                </span>
              )}
              <button
                type="button"
                className="text-[11px] font-extrabold text-indigo-600 hover:text-indigo-800 underline uppercase tracking-wide cursor-pointer"
              >
                {isOfflinePanelExpanded ? 'Collapse' : 'Details'}
              </button>
            </div>
          </div>

          {/* Expanded State Action Queue List */}
          {isOfflinePanelExpanded && (
            <div className="flex-1 overflow-hidden flex flex-col justify-between mt-4 space-y-4">
              <div className="flex-1 overflow-y-auto pr-1 space-y-2 border-t border-slate-100 pt-3">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Action Synchronization Queue
                </h4>
                {getOfflineQueue().length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <p className="font-semibold">All synced!</p>
                    <p className="text-[10px] mt-1 opacity-80">No pending actions cached in localStorage.</p>
                  </div>
                ) : (
                  getOfflineQueue().map((action) => (
                    <div
                      key={action.id}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl flex flex-col gap-1 text-left transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md tracking-wider">
                          {action.method}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 leading-snug">
                        {action.description}
                      </p>
                      <span className="text-[9px] text-slate-400 truncate font-mono max-w-[240px]">
                        {action.url.replace(API_BASE_URL, '')}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Action Button */}
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={triggerSync}
                  disabled={!isOnline || offlineQueueLength === 0 || isSyncing}
                  className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    isSyncing
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : !isOnline
                      ? 'bg-slate-50 text-slate-400 border border-slate-200/60 cursor-not-allowed'
                      : offlineQueueLength === 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 active:scale-[0.98] cursor-pointer'
                  }`}
                >
                  <RefreshCw
                    size={14}
                    className={isSyncing ? 'animate-spin text-slate-400' : 'text-current'}
                  />
                  {isSyncing
                    ? 'Syncing Actions...'
                    : !isOnline
                    ? 'Offline: Waiting for WiFi'
                    : offlineQueueLength === 0
                    ? 'All Synced & Verified'
                    : 'Force Sync Queue Now'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
