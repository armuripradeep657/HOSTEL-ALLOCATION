import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { MOCK_USERS, MOCK_ROOMS, HOSTELS, FEATURES, INTEREST_TAGS, ASSET_TYPES } from "./constants.ts";
import { User, UserRole, Room, RoomStatus, BookingRequest, Complaint, BroadcastMessage, GatePassRequest, AttendanceRecord, Hostel, ActivityLog } from "./types.ts";
import { isFirebaseConfigured, fetchFromDB, saveToDB } from "./firebase-service.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body-parsing
  app.use(express.json());

  // In-memory collections as runtime caches / fallbacks
  let users: User[] = [];
  let rooms: Room[] = [];
  let hostels: Hostel[] = [];
  let features: string[] = [];
  let interestTags: string[] = [];
  let assetTypes: string[] = [];
  let bookingRequests: BookingRequest[] = [];
  let complaints: Complaint[] = [];
  let broadcastMessages: BroadcastMessage[] = [];
  let gatePassRequests: GatePassRequest[] = [];
  let attendanceRecords: AttendanceRecord[] = [];
  let activityLogs: ActivityLog[] = [];

  // Helper to save target mock data if database has no custom users
  async function saveMockUsersToDatabase() {
    if (!isFirebaseConfigured) return;
    const studentsObj: any = {};
    const adminsObj: any = {};
    const usersObj: any = {};
    MOCK_USERS.forEach(u => {
      let finalGender = u.gender || (u.name.toLowerCase().includes("priya") ? "Female" : "Male");
      if (u.id.toLowerCase() === "s102" || u.id.toLowerCase() === "s104") {
        finalGender = "Female";
      }
      if (u.role === UserRole.ADMIN) {
        const item = {
          id: u.id,
          name: u.name,
          role: "Admin",
          dob: u.dob || "1980-05-15",
          password: u.password || "admin123",
          gender: finalGender
        };
        adminsObj[u.id] = item;
        usersObj[u.id] = item;
      } else {
        const item = {
          id: u.id,
          name: u.name,
          department: u.department || "Computer Science",
          password: u.password || "student123",
          dob: u.dob || "2004-02-14",
          isAlloted: u.isAlloted ?? false,
          roomNo: u.roomNo || "",
          hostelName: u.hostelName || "",
          assignedRoomId: u.assignedRoomId || null,
          assignedBedId: u.assignedBedId || null,
          tags: u.tags || [],
          gender: finalGender,
          email: u.email || `${u.id}@hostel.com`,
          githubUsername: u.githubUsername || ""
        };
        studentsObj[u.id] = item;
        usersObj[u.id] = item;
      }
    });
    await saveToDB("admin", adminsObj);
    await saveToDB("students", studentsObj);
    await saveToDB("users", usersObj);
  }

  // Helper to save individual users to the correct RTDB sub-path
  async function saveUserToAppropriatePath(user: User) {
    if (!isFirebaseConfigured) return;
    let finalGender = user.gender || (user.name.toLowerCase().includes("priya") ? "Female" : "Male");
    if (user.id.toLowerCase() === "s102" || user.id.toLowerCase() === "s104") {
      finalGender = "Female";
    }
    if (user.role === UserRole.ADMIN) {
      const node = {
        id: user.id,
        name: user.name,
        role: "Admin",
        dob: user.dob || "1980-05-15",
        password: user.password || "admin123",
        gender: finalGender
      };
      await saveToDB(`admin/${user.id}`, node);
      await saveToDB(`users/${user.id}`, node);
    } else {
      const node = {
        id: user.id,
        name: user.name,
        department: user.department || "",
        password: user.password || "",
        dob: user.dob || "",
        isAlloted: user.isAlloted ?? false,
        roomNo: user.roomNo || "",
        hostelName: user.hostelName || "",
        assignedRoomId: user.assignedRoomId || null,
        assignedBedId: user.assignedBedId || null,
        tags: user.tags || [],
        gender: finalGender,
        email: user.email || `${user.id}@hostel.com`,
        githubUsername: user.githubUsername || ""
      };
      await saveToDB(`students/${user.id}`, node);
      await saveToDB(`users/${user.id}`, node);
    }
  }

  // Helper to load all databases either from RTDB or fallbacks
  async function syncAllData() {
    if (isFirebaseConfigured) {
      try {
        const [dbStudents, dbAdmins, dbLegacyUsers] = await Promise.all([
          fetchFromDB("students", null),
          fetchFromDB("admin", null),
          fetchFromDB("users", null)
        ]);
        
        const parsedUsers: User[] = [];
        const seenIds = new Set<string>();

        // Parse students
        if (dbStudents && typeof dbStudents === "object") {
          const entries = Array.isArray(dbStudents)
            ? dbStudents.map((item, idx) => [String(idx), item])
            : Object.entries(dbStudents);

          entries.forEach(([key, s]) => {
            if (s && typeof s === "object") {
              const rawId = (s as any).id || (s as any).uid || key;
              if (rawId) {
                const id = String(rawId).trim();
                if (id && !seenIds.has(id.toLowerCase())) {
                  seenIds.add(id.toLowerCase());
                  let finalGender = (s as any).gender || "Male";
                  if (id.toLowerCase() === "s102" || id.toLowerCase() === "s104") {
                    finalGender = "Female";
                  }
                  parsedUsers.push({
                    id: id,
                    name: (s as any).name || "Student",
                    email: (s as any).email || `${id}@hostel.com`,
                    role: UserRole.STUDENT,
                    gender: finalGender,
                    avatarUrl: (s as any).avatarUrl || "https://picsum.photos/200/200",
                    assignedRoomId: (s as any).assignedRoomId || null,
                    assignedBedId: (s as any).assignedBedId || null,
                    tags: (s as any).tags || [],
                    department: (s as any).department || "",
                    password: (s as any).password || "",
                    dob: (s as any).dob || "",
                    isAlloted: (s as any).isAlloted ?? false,
                    roomNo: (s as any).roomNo || "",
                    hostelName: (s as any).hostelName || "",
                    githubUsername: (s as any).githubUsername || ""
                  });
                }
              }
            }
          });
        }

        // Parse admins
        if (dbAdmins && typeof dbAdmins === "object") {
          const entries = Array.isArray(dbAdmins)
            ? dbAdmins.map((item, idx) => [String(idx), item])
            : Object.entries(dbAdmins);

          entries.forEach(([key, a]) => {
            if (a && typeof a === "object") {
              const rawId = (a as any).id || (a as any).uid || key;
              if (rawId) {
                const id = String(rawId).trim();
                if (id && !seenIds.has(id.toLowerCase())) {
                  seenIds.add(id.toLowerCase());
                  parsedUsers.push({
                    id: id,
                    name: (a as any).name || "Admin",
                    email: (a as any).email || `${id}@hostel-admin.com`,
                    role: UserRole.ADMIN,
                    gender: (a as any).gender || "Male",
                    avatarUrl: (a as any).avatarUrl || "https://picsum.photos/200/200",
                    assignedRoomId: null,
                    assignedBedId: null,
                    tags: (a as any).tags || [],
                    department: (a as any).department || "",
                    password: (a as any).password || "",
                    dob: (a as any).dob || "",
                    isAlloted: false
                  });
                }
              }
            }
          });
        }

        // Parse legacy users (from the general "users" node)
        if (dbLegacyUsers && typeof dbLegacyUsers === "object") {
          const entries = Array.isArray(dbLegacyUsers)
            ? dbLegacyUsers.map((item, idx) => [String(idx), item])
            : Object.entries(dbLegacyUsers);

          entries.forEach(([key, u]) => {
            if (u && typeof u === "object") {
              const rawId = (u as any).id || (u as any).uid || key;
              if (rawId) {
                const id = String(rawId).trim();
                if (id && !seenIds.has(id.toLowerCase())) {
                  seenIds.add(id.toLowerCase());
                  
                  // Determine role from role field (case insensitive)
                  let parsedRole = UserRole.STUDENT;
                  const roleStr = String((u as any).role || "").toUpperCase();
                  if (roleStr === "ADMIN" || roleStr === "WARDEN" || roleStr.includes("ADMIN")) {
                    parsedRole = UserRole.ADMIN;
                  }

                  let finalGender = (u as any).gender || "Male";
                  if (id.toLowerCase() === "s102" || id.toLowerCase() === "s104") {
                    finalGender = "Female";
                  }

                  parsedUsers.push({
                    id: id,
                    name: (u as any).name || "User",
                    email: (u as any).email || `${id}@hostel.com`,
                    role: parsedRole,
                    gender: finalGender,
                    avatarUrl: (u as any).avatarUrl || "https://picsum.photos/200/200",
                    assignedRoomId: (u as any).assignedRoomId || null,
                    assignedBedId: (u as any).assignedBedId || null,
                    tags: (u as any).tags || [],
                    department: (u as any).department || "",
                    password: (u as any).password || "",
                    dob: (u as any).dob || "",
                    isAlloted: (u as any).isAlloted ?? false,
                    roomNo: (u as any).roomNo || "",
                    hostelName: (u as any).hostelName || ""
                  });
                }
              }
            }
          });
        }

        if (parsedUsers.length > 0) {
          users = parsedUsers;
        } else {
          // If RTDB has no students, admins or users nodes, load mocks & register in database
          users = [...MOCK_USERS];
          await saveMockUsersToDatabase();
        }
      } catch (e) {
        console.error("Failed to parse students, admins, and legacy users trees, fallback to MOCK_USERS:", e);
        users = [...MOCK_USERS];
      }
    } else {
      users = [...MOCK_USERS];
    }

    hostels = await fetchFromDB("hostels", [...HOSTELS]);
    features = await fetchFromDB("features", [...FEATURES]);
    interestTags = await fetchFromDB("interest_tags", [...INTEREST_TAGS]);
    assetTypes = await fetchFromDB("asset_types", [...ASSET_TYPES]);
    rooms = await fetchFromDB("rooms", [...MOCK_ROOMS]);

    // Sanitizing rooms: remove fake allocations and stale allocations from non-existent user IDs.
    const validUserIds = new Set(users.map(u => u.id.toLowerCase()));
    let roomsModified = false;
    rooms = rooms.map(r => {
      let isRoomChanged = false;
      const originalOccupantsLength = r.occupants ? r.occupants.length : 0;
      const validOccupants = (r.occupants || []).filter(oId => {
        const idLower = String(oId || "").toLowerCase();
        return idLower && !idLower.startsWith("mock_") && validUserIds.has(idLower);
      });
      if (validOccupants.length !== originalOccupantsLength) {
        r.occupants = validOccupants;
        isRoomChanged = true;
      }

      const updatedBeds = (r.beds || []).map(b => {
        if (b.occupantId) {
          const idLower = String(b.occupantId).toLowerCase();
          if (idLower.startsWith("mock_") || !validUserIds.has(idLower)) {
            isRoomChanged = true;
            return {
              ...b,
              occupantId: null,
              status: b.status === "Occupied" ? "Available" : b.status
            };
          }
        }
        return b;
      });

      if (isRoomChanged) {
        roomsModified = true;
        r.beds = updatedBeds;
        // recalculate status
        const isMaintenance = r.status === RoomStatus.MAINTENANCE;
        if (!isMaintenance) {
          const occupiedCount = updatedBeds.filter(b => b.occupantId !== null).length;
          if (occupiedCount === r.capacity) {
            r.status = RoomStatus.OCCUPIED;
          } else {
            r.status = RoomStatus.AVAILABLE;
          }
        }
      }
      return r;
    });

    if (roomsModified && isFirebaseConfigured) {
      console.log("🧹 Found and removed stale/fake allocations. Syncing clean rooms to Firebase RTDB...");
      await saveToDB("rooms", rooms);
    }

    // Also sanitize users: if a user is allotted but their allocated room/bed was cleaned, free them!
    let usersModified = false;
    users = users.map(u => {
      if (u.role === UserRole.STUDENT && u.assignedRoomId) {
        const room = rooms.find(r => r.id === u.assignedRoomId);
        const bed = room?.beds?.find(b => b.id === u.assignedBedId);
        // If room or bed doesn't link back to this occupant, clear assignment
        if (!room || !bed || bed.occupantId !== u.id) {
          usersModified = true;
          return {
            ...u,
            assignedRoomId: null,
            assignedBedId: null,
            roomNo: "",
            hostelName: "",
            isAlloted: false
          };
        }
      }
      return u;
    });

    if (usersModified && isFirebaseConfigured) {
      console.log("🧹 User assignments sanitized. Saving cleaned user nodes to Firebase...");
      for (const u of users) {
        await saveUserToAppropriatePath(u);
      }
    }

    bookingRequests = await fetchFromDB("bookingRequests", []);
    complaints = await fetchFromDB("complaints", []);
    broadcastMessages = await fetchFromDB("broadcastMessages", []);
    gatePassRequests = await fetchFromDB("gatePassRequests", []);
    attendanceRecords = await fetchFromDB("attendanceRecords", []);
    activityLogs = await fetchFromDB("activityLogs", []);
  }

  // Perform initial synchronization
  await syncAllData();

  // Automatic migration to make sure everyone in the rtdb has the gender field (Male/Female)
  async function backfillAllUserGenders() {
    if (!isFirebaseConfigured) return;
    console.log("🔄 Running database backfill to add gender for everyone in RTDB...");
    try {
      for (const user of users) {
        await saveUserToAppropriatePath(user);
      }
      console.log("✅ Successfully updated all user records with gender parameter in Firebase.");
    } catch (err: any) {
      console.error("❌ Failed to perform database gender migration:", err.message || err);
    }
  }
  await backfillAllUserGenders();

  // API router / endpoints

  // 0. Configuration check endpoint
  app.get("/api/config", (req, res) => {
    res.json({ isFirebaseConfigured });
  });

  // Hostels configuration endpoints
  app.get("/api/hostels", async (req, res) => {
    try {
      await syncAllData();
    } catch (e) {
      console.error("Error syncing during GET /api/hostels:", e);
    }
    res.json(hostels);
  });

  app.put("/api/hostels", async (req, res) => {
    try {
      hostels = req.body;
      await saveToDB("hostels", hostels);
      res.json({ success: true, hostels });
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Features activation configuration endpoints
  app.get("/api/features", async (req, res) => {
    try {
      await syncAllData();
    } catch (e) {
      console.error("Error syncing during GET /api/features:", e);
    }
    res.json(features);
  });

  app.put("/api/features", async (req, res) => {
    try {
      features = req.body;
      await saveToDB("features", features);
      res.json({ success: true, features });
    } catch (e: any) {
      res.status(500).json({ error: e.message || String(e) });
    }
  });

  // Student interest-tags endpoints
  app.get("/api/interest-tags", async (req, res) => {
    try {
      await syncAllData();
    } catch (e) {
      console.error("Error syncing during GET /api/interest-tags:", e);
    }
    res.json(interestTags);
  });

  // Room asset types endpoints
  app.get("/api/asset-types", async (req, res) => {
    try {
      await syncAllData();
    } catch (e) {
      console.error("Error syncing during GET /api/asset-types:", e);
    }
    res.json(assetTypes);
  });

  // 1. Users DB endpoints
  app.get("/api/users", async (req, res) => {
    try {
      await syncAllData();
    } catch (e) {
      console.error("Error syncing during GET /api/users:", e);
    }
    res.json(users);
  });

  app.post("/api/users", async (req, res) => {
    const newUser: User = req.body;
    const existsIndex = users.findIndex(u => u.id === newUser.id);
    if (existsIndex > -1) {
      users[existsIndex] = { ...users[existsIndex], ...newUser };
      res.json(users[existsIndex]);
      await saveUserToAppropriatePath(users[existsIndex]);
    } else {
      users.push(newUser);
      res.json(newUser);
      await saveUserToAppropriatePath(newUser);
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    const { id } = req.params;
    const updatedFields = req.body;
    const existsIndex = users.findIndex(u => u.id === id);
    if (existsIndex > -1) {
      users[existsIndex] = { ...users[existsIndex], ...updatedFields };
      res.json(users[existsIndex]);
      await saveUserToAppropriatePath(users[existsIndex]);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });

  // 2. Rooms DB Endpoints
  app.get("/api/rooms", async (req, res) => {
    try {
      await syncAllData();
    } catch (e) {
      console.error("Error syncing during GET /api/rooms:", e);
    }
    res.json(rooms);
  });

  app.put("/api/rooms/:id", async (req, res) => {
    const { id } = req.params;
    const updatedFields = req.body;
    const existsIndex = rooms.findIndex(r => r.id === id);
    if (existsIndex > -1) {
      rooms[existsIndex] = { ...rooms[existsIndex], ...updatedFields };
      res.json(rooms[existsIndex]);
      await saveToDB("rooms", rooms);
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  });

  // 3. Booking requests endpoints
  app.get("/api/booking-requests", async (req, res) => {
    try {
      await syncAllData();
    } catch (e) {
      console.error("Error syncing during GET /api/booking-requests:", e);
    }
    res.json(bookingRequests);
  });

  app.post("/api/booking-requests", async (req, res) => {
    const newRequest: BookingRequest = req.body;
    if (!newRequest.id) {
      newRequest.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
    bookingRequests.push(newRequest);
    res.json(newRequest);
    await saveToDB("bookingRequests", bookingRequests);
  });

  app.delete("/api/booking-requests/:id", async (req, res) => {
    const { id } = req.params;
    bookingRequests = bookingRequests.filter(reqItem => reqItem.id !== id);
    res.json({ success: true, id });
    await saveToDB("bookingRequests", bookingRequests);
  });

  // 4. Complaints DB endpoints
  app.get("/api/complaints", async (req, res) => {
    try {
      await syncAllData();
    } catch (e) {
      console.error("Error syncing during GET /api/complaints:", e);
    }
    res.json(complaints);
  });

  app.post("/api/complaints", async (req, res) => {
    const newComplaint: Complaint = req.body;
    if (!newComplaint.id) {
      newComplaint.id = `cmp_${Date.now()}`;
    }
    complaints.push(newComplaint);
    res.json(newComplaint);
    await saveToDB("complaints", complaints);
  });

  app.put("/api/complaints/:id", async (req, res) => {
    const { id } = req.params;
    const updatedFields = req.body;
    const existsIndex = complaints.findIndex(c => c.id === id);
    if (existsIndex > -1) {
      complaints[existsIndex] = { ...complaints[existsIndex], ...updatedFields };
      res.json(complaints[existsIndex]);
      await saveToDB("complaints", complaints);
    } else {
      res.status(404).json({ message: "Complaint not found" });
    }
  });

  // 5. Broadcast DB endpoints
  app.get("/api/broadcasts", async (req, res) => {
    try {
      await syncAllData();
    } catch (e) {
      console.error("Error syncing during GET /api/broadcasts:", e);
    }
    res.json(broadcastMessages);
  });

  app.post("/api/broadcasts", async (req, res) => {
    const newMessage: BroadcastMessage = req.body;
    if (!newMessage.id) {
      newMessage.id = `br_${Date.now()}`;
    }
    broadcastMessages.unshift(newMessage); // Prepend/unshift so newest is first
    res.json(newMessage);
    await saveToDB("broadcastMessages", broadcastMessages);
  });

  // 6. Gate passes DB endpoints
  app.get("/api/gatepasses", async (req, res) => {
    try {
      await syncAllData();
    } catch (e) {
      console.error("Error syncing during GET /api/gatepasses:", e);
    }
    res.json(gatePassRequests);
  });

  app.post("/api/gatepasses", async (req, res) => {
    const newRequest: GatePassRequest = req.body;
    if (!newRequest.id) {
      newRequest.id = `gp_${Date.now()}`;
    }
    gatePassRequests.unshift(newRequest);
    res.json(newRequest);
    await saveToDB("gatePassRequests", gatePassRequests);
  });

  app.put("/api/gatepasses/:id", async (req, res) => {
    const { id } = req.params;
    const updatedFields = req.body;
    const existsIndex = gatePassRequests.findIndex(g => g.id === id);
    if (existsIndex > -1) {
      gatePassRequests[existsIndex] = { ...gatePassRequests[existsIndex], ...updatedFields };
      res.json(gatePassRequests[existsIndex]);
      await saveToDB("gatePassRequests", gatePassRequests);
    } else {
      res.status(404).json({ message: "Gate pass not found" });
    }
  });

  // 7. Attendance DB endpoints
  app.get("/api/attendance", async (req, res) => {
    try {
      await syncAllData();
    } catch (e) {
      console.error("Error syncing during GET /api/attendance:", e);
    }
    res.json(attendanceRecords);
  });

  app.post("/api/attendance", async (req, res) => {
    const newRecord: AttendanceRecord = req.body;
    attendanceRecords.push(newRecord);
    res.json(newRecord);
    await saveToDB("attendanceRecords", attendanceRecords);
  });

  // 8. Activity logs endpoints
  app.get("/api/activities", async (req, res) => {
    try {
      await syncAllData();
    } catch (e) {
      console.error("Error syncing during GET /api/activities:", e);
    }
    res.json(activityLogs);
  });

  app.post("/api/activities", async (req, res) => {
    const newLog: ActivityLog = req.body;
    if (!newLog.id) {
      newLog.id = `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
    if (!newLog.timestamp) {
      newLog.timestamp = Date.now();
    }
    activityLogs.unshift(newLog); // Prepend/unshift so newest is first
    if (activityLogs.length > 200) {
      activityLogs = activityLogs.slice(0, 200);
    }
    res.json(newLog);
    await saveToDB("activityLogs", activityLogs);
  });

  // Integration of Vite-Dev or Production build static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
