
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  GUEST = 'GUEST'
}

export type Gender = 'Male' | 'Female';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gender: Gender;
  avatarUrl?: string;
  assignedRoomId?: string | null;
  assignedBedId?: string | null;
  tags?: string[]; // Added for Roommate Compatibility
  department?: string;
  password?: string;
  dob?: string;
  isAlloted?: boolean;
  roomNo?: string;
  hostelName?: string;
  githubUsername?: string;
}

export enum RoomType {
  SINGLE = '1-in-1 (Single)',
  DOUBLE = '2-in-1 (Double)',
  QUAD = '4-in-1 (Quad)',
  OCTO = '8-in-1 (Dorm)',
  DODECA = '12-in-1 (Large Dorm)'
}

export enum RoomStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  MAINTENANCE = 'Maintenance'
}

export interface Bed {
  id: string;
  number: number;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Requested';
  occupantId?: string | null;
}

export interface MaintenanceRecord {
  id: string;
  timestamp: number;
  type: string;
  description: string;
  staffName: string;
}

export interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  condition: 'Good' | 'Fair' | 'Poor';
}

export interface Hostel {
  id: string;
  name: string;
  type: 'Boys' | 'Girls';
  description: string;
  gridCols: number;
  floors: number;
}

export interface Room {
  id: string;
  hostelId: string;
  number: string;
  floor: number;
  type: RoomType;
  price: number;
  status: RoomStatus;
  capacity: number;
  occupants: string[];
  beds: Bed[];
  features: string[];
  maintenanceLog: MaintenanceRecord[];
  assets: Asset[]; // Added for Inventory Management
}

export interface Stats {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  revenue: number;
  occupancyRate: number;
}

export interface BookingRequest {
  id: string;
  roomId: string;
  bedId: string;
  studentId: string;
  studentName: string;
  timestamp: number;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  type: 'Maintenance' | 'Noise' | 'Cleanliness' | 'Other';
  description: string;
  status: 'Pending' | 'Resolved';
  timestamp: number;
}

export interface BroadcastMessage {
  id: string;
  message: string;
  sender: string;
  priority: 'Normal' | 'High';
  timestamp: number;
}

export type GatePassStatus = 'Pending' | 'Approved' | 'Rejected';

export interface GatePassRequest {
  id: string;
  studentId: string;
  studentName: string;
  departureDate: string; // ISO Date String
  returnDate: string;    // ISO Date String
  reason: string;
  status: GatePassStatus;
  timestamp: number;
}

export interface AttendanceRecord {
  date: string; // ISO Date YYYY-MM-DD
  hostelId: string;
  records: {
    studentId: string;
    roomId: string;
    status: 'Present' | 'Absent';
  }[];
}

export interface ActivityLog {
  id: string;
  message: string;
  timestamp: number;
  type: 'allocation' | 'vacate' | 'maintenance' | 'complaint' | 'gatepass' | 'attendance' | 'broadcast' | 'other';
  studentId?: string;
  studentName?: string;
  roomId?: string;
  hostelId?: string;
  operatorName?: string;
}

