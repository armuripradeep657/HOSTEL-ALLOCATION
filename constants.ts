
import { Room, RoomStatus, RoomType, User, UserRole, Bed, Hostel, MaintenanceRecord, Asset } from './types.ts';

export const FEATURES = ['Wi-Fi', 'AC', 'Geyser', 'Balcony', 'Attached Washroom', 'Study Desk', 'Lockers'];

export const INTEREST_TAGS = ['Early Riser', 'Night Owl', 'Gamer', 'Musician', 'Studious', 'Fitness Freak', 'Foodie', 'Artist', 'Reader'];

export const ASSET_TYPES = ['Wooden Chair', 'Study Table', 'Ceiling Fan', 'Tube Light', 'Mattress', 'Cupboard', 'Curtains'];

export const HOSTELS: Hostel[] = [
  { 
    id: 'krishna', 
    name: 'Krishna Hostel', 
    type: 'Boys',
    description: '', 
    gridCols: 5, 
    floors: 5 
  },
  { 
    id: 'vaigai', 
    name: 'Vaigai Hostel', 
    type: 'Girls',
    description: '', 
    gridCols: 4, 
    floors: 4 
  },
  { 
    id: 'bhargav', 
    name: 'Bhargav Hostel', 
    type: 'Boys',
    description: '', 
    gridCols: 3, 
    floors: 3 
  },
  { 
    id: 'sanjay', 
    name: 'Sanjay Hostel',
    type: 'Boys',
    description: '', 
    gridCols: 5, 
    floors: 6 
  },
  { 
    id: 'noyal', 
    name: 'Noyal Hostel', 
    type: 'Girls',
    description: '', 
    gridCols: 4, 
    floors: 4 
  }
];

// Mock Users
export const MOCK_USERS: User[] = [
  {
    id: 'admin1',
    name: 'Warden Suresh',
    email: 'admin@123',
    role: UserRole.ADMIN,
    gender: 'Male',
    avatarUrl: 'https://picsum.photos/200/200',
    tags: [],
    dob: '1980-05-15',
    password: 'admin123'
  },
  {
    id: 'student1',
    name: 'Sanjay Ram Chowdary',
    email: 'sanjay@student.com',
    role: UserRole.STUDENT,
    gender: 'Male',
    assignedRoomId: null,
    assignedBedId: null,
    avatarUrl: 'https://picsum.photos/201/201',
    tags: ['Gamer', 'Night Owl'],
    department: 'Computer Science',
    password: 'student123',
    dob: '2004-02-14',
    isAlloted: false,
    githubUsername: 'armuripradeep657'
  },
  {
    id: 'student2',
    name: 'Priya Sharma',
    email: 'priya@student.com',
    role: UserRole.STUDENT,
    gender: 'Female',
    assignedRoomId: null,
    assignedBedId: null,
    avatarUrl: 'https://picsum.photos/202/202',
    tags: ['Studious', 'Early Riser', 'Reader'],
    department: 'Information Technology',
    password: 'student123',
    dob: '2004-09-20',
    isAlloted: false
  },
  {
    id: 'A001',
    name: 'Hostel Admin',
    email: 'A001@hostel.com',
    role: UserRole.ADMIN,
    gender: 'Male',
    assignedRoomId: null,
    assignedBedId: null,
    avatarUrl: 'https://picsum.photos/203/203',
    tags: ['Administrator'],
    department: 'Administration',
    password: 'admin123',
    dob: '1990-01-15',
    isAlloted: false
  }
];

// Generate Mock Rooms for all Hostels
const generateRooms = (): Room[] => {
  const rooms: Room[] = [];

  HOSTELS.forEach(hostel => {
    let roomsPerFloor = hostel.gridCols * 2;
    if (hostel.id === 'bhargav') roomsPerFloor = 6;
    if (hostel.id === 'sanjay') roomsPerFloor = 15;

    for (let f = 1; f <= hostel.floors; f++) {
      for (let r = 1; r <= roomsPerFloor; r++) {
        const roomNumStr = `${f * 100 + r}`;
        const uniqueRoomId = `${hostel.id}-${roomNumStr}`;
        
        let type = RoomType.DOUBLE;
        let capacity = 2;
        let price = 140000;

        if (hostel.id === 'krishna') {
             if (r % 5 === 0) { type = RoomType.SINGLE; capacity = 1; price = 180000; }
             else if (r % 2 === 0) { type = RoomType.QUAD; capacity = 4; price = 110000; }
        } else if (hostel.id === 'vaigai') {
             if (r % 3 === 0) { type = RoomType.OCTO; capacity = 8; price = 90000; }
             else { type = RoomType.DOUBLE; capacity = 2; price = 145000; }
        } else if (hostel.id === 'bhargav') {
             type = r % 2 === 0 ? RoomType.SINGLE : RoomType.DOUBLE;
             capacity = type === RoomType.SINGLE ? 1 : 2;
             price = type === RoomType.SINGLE ? 200000 : 160000;
        } else if (hostel.id === 'sanjay') {
             if (r === 1) { type = RoomType.DODECA; capacity = 12; price = 80000; }
             else { type = RoomType.SINGLE; capacity = 1; price = 250000; }
        } else {
             type = RoomType.QUAD; capacity = 4; price = 100000;
        }

        const isMaintenance = Math.random() > 0.98;
        
        const beds: Bed[] = [];
        const occupants: string[] = [];

        for(let b=1; b <= capacity; b++) {
          const bedId = `${uniqueRoomId}-${b}`;
          
          beds.push({
              id: bedId,
              number: b,
              status: isMaintenance ? 'Maintenance' : 'Available',
              occupantId: null
          });
        }

        let status = isMaintenance ? RoomStatus.MAINTENANCE : RoomStatus.AVAILABLE;
        
        const features = [...FEATURES].filter(() => Math.random() > 0.3);
        if (!features.includes('Attached Washroom')) features.push('Attached Washroom');
        
        const maintenanceLog: MaintenanceRecord[] = [];
        if (isMaintenance) {
            maintenanceLog.push({
                id: `log_${uniqueRoomId}_1`,
                timestamp: Date.now() - (Math.random() * 86400000),
                type: 'Repair',
                description: 'Routine plumbing inspection and lock repair.',
                staffName: 'Admin System'
            });
        }

        // Mock Assets
        const assets: Asset[] = [];
        const assetCount = Math.floor(Math.random() * 3) + 2; // 2-4 assets
        for(let i=0; i<assetCount; i++) {
           assets.push({
              id: `ast_${uniqueRoomId}_${i}`,
              name: ASSET_TYPES[Math.floor(Math.random() * ASSET_TYPES.length)],
              serialNumber: `SN-${Math.floor(Math.random() * 10000)}`,
              condition: 'Good'
           });
        }

        rooms.push({
          id: uniqueRoomId,
          hostelId: hostel.id,
          number: roomNumStr,
          floor: f,
          type,
          price,
          status,
          capacity,
          occupants,
          beds,
          features: Array.from(new Set(features)),
          maintenanceLog,
          assets
        });
      }
    }
  });

  return rooms;
};

export const MOCK_ROOMS = generateRooms();
