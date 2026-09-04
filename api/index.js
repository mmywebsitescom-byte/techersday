// server/api.ts
import express from "express";

// db.ts
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

// src/data/initialData.ts
var INITIAL_SITE_SETTINGS = {
  institutionName: "Excellence Institute of Technology",
  heroTagline: "Honoring the Architects of Our Future",
  heroTitle: "Happy Teachers' Day",
  heroQuote: "To the world, you may be just a teacher, but to your students, you are a hero.",
  heroQuoteAuthor: "Annual Ceremony 2026",
  // Icon / Crest Settings
  crestType: "default-crest",
  customCrestImageUrl: "",
  badgeIcon: "sparkles",
  showSparkleBadge: true,
  crestBorderGlow: "gold",
  crestSize: "medium",
  // Background & Transparency Settings
  backgroundMode: "gradient",
  bgImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80",
  bgImageOpacity: 85,
  bgBlur: 0,
  bgOverlayColor: "#fbf9f8",
  bgOverlayOpacity: 20,
  bgGradientStyle: "subtle-purple",
  // Action Buttons
  galleryButtonText: "GALLERY",
  galleryButtonVisible: true,
  departmentsButtonText: "SELECT YOUR DEPARTMENT",
  departmentsButtonVisible: true,
  rsvpButtonText: "RSVP NOW",
  rsvpButtonVisible: false,
  // Browser Tab Icon & Title
  faviconUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=64&auto=format&fit=crop&q=80",
  siteTabTitle: "Happy Teachers' Day | Excellence Institute",
  // Global Gifts & Reveal System
  giftImages: [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1000&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&auto=format&fit=crop&q=80"
  ],
  giftRevealDateTime: "2026-09-05T10:00",
  giftIsRevealed: false,
  giftLockedMessage: "A Special Gift is arriving for all teachers! Unlocks at the exact scheduled celebration time.",
  // Home Page Countdown Box
  showCountdownBox: true,
  countdownTitle: "Coming Soon: Something Big!",
  countdownSubtitle: "Teachers' Day Grand Ceremony & Secret Gift Reveal",
  countdownTargetDate: "2026-09-05T10:00"
};
var INITIAL_EVENT = {
  title: "Teachers' Day Celebration 2026",
  date: "5 Sept 2026",
  time: "10:00 AM",
  venue: "College Auditorium",
  year: "2026",
  invitationNote: "Join us in celebrating the faculty mentors who shape tomorrow's innovators.",
  invitationHeading: "You are Specially Invited to the Teachers' Day Celebration 2026",
  rsvpButtonText: "RSVP CONFIRMATION",
  showRsvpButton: true,
  accentTheme: "indigo-gold"
};

// db.ts
var _supabase = null;
var DEFAULT_SUPABASE_URL = "https://hucuonrxbvkdcvrultjq.supabase.co";
function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_KEY;
  if (!key) {
    throw new Error(
      "[db.ts] Supabase Key is missing. Please set SUPABASE_SECRET_KEY or SUPABASE_PUBLISHABLE_KEY in Vercel Environment Variables."
    );
  }
  _supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  return _supabase;
}
var _pool = null;
function getPool() {
  if (_pool) return _pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "[db.ts] DATABASE_URL environment variable is not set."
    );
  }
  _pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 1e4,
    connectionTimeoutMillis: 5e3
  });
  _pool.on("error", (err) => {
    console.error("[db.ts] Unexpected pg client idle error:", err);
  });
  return _pool;
}
var pool = new Proxy({}, {
  get(_target, prop) {
    return getPool()[prop];
  }
});
async function getSiteSettings() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("settings").select("data").eq("id", "siteSettings").maybeSingle();
    if (!error && data?.data) {
      return { ...INITIAL_SITE_SETTINGS, ...data.data };
    }
  } catch (err) {
    console.error("Error fetching siteSettings:", err);
  }
  return INITIAL_SITE_SETTINGS;
}
async function updateSiteSettings(updates) {
  const current = await getSiteSettings();
  const merged = { ...current, ...updates };
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("settings").upsert({
      id: "siteSettings",
      data: merged,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (error) console.error("Error saving siteSettings:", error);
  } catch (err) {
    console.error("Failed to update siteSettings:", err);
  }
  return merged;
}
async function getCelebrationEvent() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("settings").select("data").eq("id", "celebrationEvent").maybeSingle();
    if (!error && data?.data) {
      return { ...INITIAL_EVENT, ...data.data };
    }
  } catch (err) {
    console.error("Error fetching celebrationEvent:", err);
  }
  return INITIAL_EVENT;
}
async function updateCelebrationEvent(updates) {
  const current = await getCelebrationEvent();
  const merged = { ...current, ...updates };
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("settings").upsert({
      id: "celebrationEvent",
      data: merged,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (error) console.error("Error saving celebrationEvent:", error);
  } catch (err) {
    console.error("Failed to update celebrationEvent:", err);
  }
  return merged;
}
async function getDepartments() {
  const supabase = getSupabase();
  const [deptRes, teacherRes] = await Promise.all([
    supabase.from("departments").select("*").order("name", { ascending: true }),
    supabase.from("teachers").select("departmentId")
  ]);
  if (deptRes.error) {
    console.error("Error fetching departments:", deptRes.error);
    throw deptRes.error;
  }
  const depts = deptRes.data || [];
  const teachers = teacherRes.data || [];
  const countMap = {};
  for (const t of teachers) {
    if (t.departmentId) {
      countMap[t.departmentId] = (countMap[t.departmentId] || 0) + 1;
    }
  }
  return depts.map((d) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    description: d.description || `Department of ${d.name} at Excellence Institute of Technology.`,
    headOfDepartment: d.headOfDepartment || "To be appointed",
    teacherCount: countMap[d.id] ?? d.teacherCount ?? 0
  }));
}
async function getDepartmentById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("departments").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data;
}
async function createDepartment(dept) {
  const supabase = getSupabase();
  const { error } = await supabase.from("departments").insert([dept]);
  if (error) throw error;
  return dept;
}
async function updateDepartment(id, updates) {
  const supabase = getSupabase();
  const { error } = await supabase.from("departments").update(updates).eq("id", id);
  if (error) throw error;
  if (updates.name) {
    await supabase.from("teachers").update({ departmentName: updates.name }).eq("departmentId", id);
  }
  return getDepartmentById(id);
}
async function deleteDepartment(id) {
  const supabase = getSupabase();
  const { error } = await supabase.from("departments").delete().eq("id", id);
  return !error;
}
async function getTeachers(departmentId, search) {
  const supabase = getSupabase();
  let query = supabase.from("teachers").select("*").order("name", { ascending: true });
  if (departmentId && departmentId !== "all") {
    query = query.eq("departmentId", departmentId);
  }
  if (search && search.trim()) {
    const term = search.trim();
    query = query.or(`name.ilike.%${term}%,designation.ilike.%${term}%,departmentName.ilike.%${term}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
async function getTeacherById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("teachers").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data;
}
async function createTeacher(teacher) {
  const supabase = getSupabase();
  const { error } = await supabase.from("teachers").insert([teacher]);
  if (error) throw error;
  return teacher;
}
async function updateTeacher(id, updates) {
  const supabase = getSupabase();
  const { error } = await supabase.from("teachers").update(updates).eq("id", id);
  if (error) throw error;
  return getTeacherById(id);
}
async function deleteTeacher(id) {
  const supabase = getSupabase();
  const { error } = await supabase.from("teachers").delete().eq("id", id);
  return !error;
}
async function getGallery(category, search) {
  const supabase = getSupabase();
  let query = supabase.from("gallery").select("*").order("created_at", { ascending: false });
  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  if (search && search.trim()) {
    const term = search.trim();
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
async function getGalleryById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("gallery").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return data;
}
async function createGalleryItem(item) {
  const supabase = getSupabase();
  const { error } = await supabase.from("gallery").insert([item]);
  if (error) throw error;
  return item;
}
async function updateGalleryItem(id, updates) {
  const supabase = getSupabase();
  const { error } = await supabase.from("gallery").update(updates).eq("id", id);
  if (error) throw error;
  return getGalleryById(id);
}
async function deleteGalleryItem(id) {
  const supabase = getSupabase();
  const { error } = await supabase.from("gallery").delete().eq("id", id);
  return !error;
}
async function getRsvps() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("rsvps").select("*").order("submittedAt", { ascending: false });
  if (error) throw error;
  return data || [];
}
async function createRsvp(rsvp) {
  const supabase = getSupabase();
  const { error } = await supabase.from("rsvps").insert([rsvp]);
  if (error) throw error;
  return rsvp;
}
async function getStats() {
  const supabase = getSupabase();
  const [t, d, g, r] = await Promise.all([
    supabase.from("teachers").select("*", { count: "exact", head: true }),
    supabase.from("departments").select("*", { count: "exact", head: true }),
    supabase.from("gallery").select("*", { count: "exact", head: true }),
    supabase.from("rsvps").select("*", { count: "exact", head: true })
  ]);
  return {
    totalTeachers: t.count ?? 0,
    totalDepartments: d.count ?? 0,
    totalGalleryPhotos: g.count ?? 0,
    totalRsvps: r.count ?? 0
  };
}
async function validateAdminCredentials(email, pass) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();
  if (cleanEmail === "techersday2062@gmail.com" && cleanPass === "Techers@2062") {
    return true;
  }
  try {
    const supabase = getSupabase();
    const { data } = await supabase.from("settings").select("data").eq("id", "adminCredentials").maybeSingle();
    if (data?.data) {
      const creds = data.data;
      if (creds && creds.email && creds.email.toLowerCase() === cleanEmail && creds.password === cleanPass) {
        return true;
      }
    }
  } catch (err) {
    console.error("Error validating admin:", err);
  }
  return false;
}

// server/api.ts
var app = express();
app.use(express.json({ limit: "25mb" }));
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (_req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
var router = express.Router();
router.get("/health", async (_req, res) => {
  try {
    const stats = await getStats();
    res.json({
      status: "ok",
      database: "supabase-connected",
      provider: "supabase-rest-https",
      stats,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (err) {
    console.error("[Health Check Error]", err);
    res.status(500).json({
      status: "error",
      database: "connection_error",
      error: err?.message || "Database connection error"
    });
  }
});
router.get("/event", async (_req, res) => {
  try {
    const event = await getCelebrationEvent();
    res.json(event);
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({ error: "Failed to fetch event info", detail: err?.message });
  }
});
router.put("/event", async (req, res) => {
  try {
    const updated = await updateCelebrationEvent(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update event", detail: err?.message });
  }
});
router.get("/site-settings", async (_req, res) => {
  try {
    const settings = await getSiteSettings();
    res.json(settings);
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ error: "Failed to fetch settings", detail: err?.message });
  }
});
router.put("/site-settings", async (req, res) => {
  try {
    const updated = await updateSiteSettings(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to save settings", detail: err?.message });
  }
});
router.get("/departments", async (_req, res) => {
  try {
    const depts = await getDepartments();
    res.json(depts);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Failed to fetch departments", detail: err?.message });
  }
});
router.get("/departments/:id", async (req, res) => {
  try {
    const dept = await getDepartmentById(req.params.id);
    if (!dept) return res.status(404).json({ error: "Department not found" });
    res.json(dept);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch department", detail: err?.message });
  }
});
router.post("/departments", async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.code) {
      return res.status(400).json({ error: "Department name and code are required" });
    }
    const id = body.id || body.code.toLowerCase().replace(/[^a-z0-9]/g, "") || `dept-${Date.now()}`;
    const newDept = {
      id,
      name: body.name,
      code: body.code.toUpperCase(),
      description: body.description || `Department of ${body.name} at Excellence Institute of Technology.`,
      headOfDepartment: body.headOfDepartment || "To be appointed",
      teacherCount: 0
    };
    await createDepartment(newDept);
    res.status(201).json(newDept);
  } catch (err) {
    res.status(500).json({ error: "Failed to create department", detail: err?.message });
  }
});
router.put("/departments/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await updateDepartment(id, req.body);
    if (!updated) return res.status(404).json({ error: "Department not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update department", detail: err?.message });
  }
});
router.delete("/departments/:id", async (req, res) => {
  try {
    await deleteDepartment(req.params.id);
    res.json({ success: true, message: "Department deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete department", detail: err?.message });
  }
});
router.get("/teachers", async (req, res) => {
  try {
    const { departmentId, search } = req.query;
    const teachers = await getTeachers(
      typeof departmentId === "string" ? departmentId : void 0,
      typeof search === "string" ? search : void 0
    );
    res.json(teachers);
  } catch (err) {
    console.error("Error fetching teachers:", err);
    res.status(500).json({ error: "Failed to fetch teachers", detail: err?.message });
  }
});
router.get("/teachers/:id", async (req, res) => {
  try {
    const teacher = await getTeacherById(req.params.id);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch teacher", detail: err?.message });
  }
});
router.post("/teachers", async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.designation || !body.departmentId) {
      return res.status(400).json({ error: "Name, designation, and department are required" });
    }
    const dept = await getDepartmentById(body.departmentId);
    const departmentName = dept ? dept.name : body.departmentName || "Science & Humanities";
    const id = body.id || `teacher-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newTeacher = {
      id,
      name: body.name,
      designation: body.designation,
      departmentId: body.departmentId,
      departmentName,
      subjects: Array.isArray(body.subjects) ? body.subjects : [],
      photoUrl: body.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80",
      appreciationQuote: body.appreciationQuote || "Dedicated to shaping tomorrow's leaders through insight, patience, and scholarship.",
      bio: body.bio || "",
      dateAdded: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      email: body.email || "",
      officeLocation: body.officeLocation || ""
    };
    await createTeacher(newTeacher);
    res.status(201).json(newTeacher);
  } catch (err) {
    res.status(500).json({ error: "Failed to create teacher", detail: err?.message });
  }
});
router.put("/teachers/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await updateTeacher(id, req.body);
    if (!updated) return res.status(404).json({ error: "Teacher not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update teacher", detail: err?.message });
  }
});
router.delete("/teachers/:id", async (req, res) => {
  try {
    await deleteTeacher(req.params.id);
    res.json({ success: true, message: "Teacher deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete teacher", detail: err?.message });
  }
});
router.get("/gallery", async (req, res) => {
  try {
    const { category, search } = req.query;
    const items = await getGallery(
      typeof category === "string" ? category : void 0,
      typeof search === "string" ? search : void 0
    );
    res.json(items);
  } catch (err) {
    console.error("Error fetching gallery:", err);
    res.status(500).json({ error: "Failed to fetch gallery", detail: err?.message });
  }
});
router.get("/gallery/:id", async (req, res) => {
  try {
    const item = await getGalleryById(req.params.id);
    if (!item) return res.status(404).json({ error: "Gallery item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch gallery item", detail: err?.message });
  }
});
router.post("/gallery", async (req, res) => {
  try {
    const { title, category, imageUrl, date, description } = req.body;
    if (!title || !imageUrl) {
      return res.status(400).json({ error: "Title and image URL are required" });
    }
    const id = req.body.id || `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newItem = {
      id,
      title,
      category: category || "Events",
      imageUrl,
      date: date || (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      description: description || ""
    };
    await createGalleryItem(newItem);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add gallery item", detail: err?.message });
  }
});
router.put("/gallery/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await updateGalleryItem(id, req.body);
    if (!updated) return res.status(404).json({ error: "Gallery item not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update gallery item", detail: err?.message });
  }
});
router.delete("/gallery/:id", async (req, res) => {
  try {
    await deleteGalleryItem(req.params.id);
    res.json({ success: true, message: "Gallery item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete gallery item", detail: err?.message });
  }
});
router.get("/rsvp", async (_req, res) => {
  try {
    const list = await getRsvps();
    res.json(list);
  } catch (err) {
    console.error("Error fetching RSVPs:", err);
    res.status(500).json({ error: "Failed to fetch RSVPs", detail: err?.message });
  }
});
router.post("/rsvp", async (req, res) => {
  try {
    const { teacherId, teacherName, guestName, email, department, attending, guestCount, dietaryNeeds, wishesNote } = req.body;
    if (!guestName || !email) {
      return res.status(400).json({ error: "Guest name and email are required" });
    }
    const id = `rsvp-${Date.now()}`;
    const newRsvp = {
      id,
      teacherId: teacherId || "",
      teacherName: teacherName || "",
      guestName,
      email,
      department: department || "General",
      attending: attending || "Yes",
      guestCount: Number(guestCount) || 1,
      dietaryNeeds: dietaryNeeds || "None",
      wishesNote: wishesNote || "",
      submittedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await createRsvp(newRsvp);
    res.status(201).json({ success: true, rsvp: newRsvp });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit RSVP", detail: err?.message });
  }
});
router.get("/stats", async (_req, res) => {
  try {
    const stats = await getStats();
    res.json(stats);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch stats", detail: err?.message });
  }
});
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const isValid = await validateAdminCredentials(email || "", password || "");
    if (isValid) {
      return res.json({
        success: true,
        user: {
          name: "Administrator",
          email: (email || "").trim().toLowerCase(),
          role: "Super Administrator"
        },
        token: `admin-token-${Date.now()}`
      });
    }
    return res.status(401).json({ error: "Incorrect email or password. Please try again." });
  } catch (err) {
    res.status(500).json({ error: "Authentication error. Please try again.", detail: err?.message });
  }
});
app.use("/api", router);
app.use("/", router);
app.use((err, _req, res, _next) => {
  console.error("[Unhandled API Error]:", err);
  res.status(500).json({ error: "Internal server error", detail: err?.message || String(err) });
});
var api_default = app;
export {
  api_default as default
};
