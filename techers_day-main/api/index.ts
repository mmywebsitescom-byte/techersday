import express from 'express';
import { initializeApp, cert, getApps, App as FirebaseApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth as FirebaseAuth } from 'firebase-admin/auth';
// ─── Lazy Initialize Firebase Admin ──────────────────────────────────────────────
let firebaseInitMode = 'none';
let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

function getDb(): Firestore {
  if (cachedDb) return cachedDb;

  if (getApps().length > 0) {
    cachedApp = getApps()[0];
  } else {
    let serviceAccount: any;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
        serviceAccount = JSON.parse(raw);
        firebaseInitMode = 'env-service-account';
      } catch (e: any) {
        console.error('[Firebase] Error parsing FIREBASE_SERVICE_ACCOUNT env var:', e?.message || e);
        firebaseInitMode = 'env-parse-error';
      }
    }

    if (serviceAccount) {
      cachedApp = initializeApp({ credential: cert(serviceAccount) });
    } else {
      console.warn('[Firebase] No FIREBASE_SERVICE_ACCOUNT env var found - initializing with projectId default.');
      firebaseInitMode = 'no-credentials';
      cachedApp = initializeApp({ projectId: 'techxeraday' });
    }
  }

  cachedDb = getFirestore(cachedApp);
  return cachedDb;
}

// Proxy getter for db so all db.collection calls use getDb() lazily
const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    const realDb = getDb() as any;
    const value = realDb[prop];
    return typeof value === 'function' ? value.bind(realDb) : value;
  }
});

const COL_TEACHERS = 'teachers';
const COL_DEPARTMENTS = 'departments';
const COL_GALLERY = 'gallery';
const COL_SETTINGS = 'settings';
const DOC_SETTINGS = 'siteSettings';

async function getAll<T>(collection: string): Promise<T[]> {
  try {
    const snap = await getDb().collection(collection).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
  } catch (err) {
    console.error(`Error fetching collection ${collection}:`, err);
    return [];
  }
}

const app = express();
app.use(express.json({ limit: '25mb' }));

// CORS & Headers Middleware
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health
app.get('/api/health', (_req, res) => {
  const hasEnvVar = !!process.env.FIREBASE_SERVICE_ACCOUNT;
  res.json({
    status: 'ok',
    database: 'firestore',
    project: 'techxeraday',
    firebaseInitMode,
    hasServiceAccountEnv: hasEnvVar,
    timestamp: new Date().toISOString(),
    message: !hasEnvVar
      ? 'WARNING: FIREBASE_SERVICE_ACCOUNT env var is not set. Writes will fail!'
      : 'Firebase initialized correctly.',
  });
});

// Event
app.get('/api/event', async (_req, res) => {
  try {
    const doc = await db.collection(COL_SETTINGS).doc('celebrationEvent').get();
    if (!doc.exists) {
      return res.json({
        title: "Annual Teachers' Day Ceremony 2026",
        date: "September 05, 2026",
        time: "10:00 AM - 1:00 PM IST",
        venue: "Grand Academic Auditorium, Main Campus",
        year: "2026",
        invitationNote: "Join us in celebrating the faculty mentors who shape tomorrow's innovators.",
      });
    }
    res.json({ ...doc.data() });
  } catch (err) {
    res.json({
      title: "Annual Teachers' Day Ceremony 2026",
      date: "September 05, 2026",
      time: "10:00 AM - 1:00 PM IST",
      venue: "Grand Academic Auditorium, Main Campus",
      year: "2026",
      invitationNote: "Join us in celebrating the faculty mentors who shape tomorrow's innovators.",
    });
  }
});

app.put('/api/event', async (req, res) => {
  try {
    const ref = db.collection(COL_SETTINGS).doc('celebrationEvent');
    await ref.set(req.body, { merge: true });
    const updated = await ref.get();
    res.json({ ...updated.data() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Site Settings
app.get('/api/site-settings', async (_req, res) => {
  try {
    const doc = await db.collection(COL_SETTINGS).doc(DOC_SETTINGS).get();
    if (!doc.exists) {
      return res.json({
        institutionName: "Excellence Institute of Technology",
        heroTagline: "Honoring the Architects of Our Future",
        heroTitle: "Happy Teachers' Day",
        heroQuote: "To the world, you may be just a teacher, but to your students, you are a hero.",
        heroQuoteAuthor: "Annual Ceremony 2026",
        crestType: "default-crest",
        customCrestImageUrl: "",
        badgeIcon: "sparkles",
        showSparkleBadge: true,
        crestBorderGlow: "gold",
        crestSize: "medium",
        backgroundMode: "gradient",
        bgImageUrl: "",
        bgImageOpacity: 85,
        bgBlur: 0,
        bgOverlayColor: "#fbf9f8",
        bgOverlayOpacity: 20,
        bgGradientStyle: "subtle-purple",
        galleryButtonText: "GALLERY",
        galleryButtonVisible: true,
        departmentsButtonText: "SELECT YOUR DEPARTMENT",
        departmentsButtonVisible: true,
        rsvpButtonText: "RSVP NOW",
        rsvpButtonVisible: false,
      });
    }
    res.json({ ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/site-settings', async (req, res) => {
  try {
    if (firebaseInitMode === 'no-credentials') {
      console.error('[site-settings PUT] Cannot write: no Firebase credentials. Set FIREBASE_SERVICE_ACCOUNT in Vercel.');
      return res.status(503).json({ error: 'Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT in Vercel env vars.' });
    }
    const ref = db.collection(COL_SETTINGS).doc(DOC_SETTINGS);
    // Sanitize: strip undefined values that Firestore rejects
    const body = JSON.parse(JSON.stringify(req.body));
    await ref.set(body, { merge: true });
    const updated = await ref.get();
    console.log('[site-settings PUT] Saved successfully to Firestore.');
    res.json({ ...updated.data() });
  } catch (err: any) {
    console.error('[site-settings PUT] Firestore write error:', err?.message || err);
    res.status(500).json({ error: 'Failed to save settings', detail: err?.message });
  }
});

// Departments
app.get('/api/departments', async (_req, res) => {
  try {
    let [depts, teachers] = await Promise.all([
      getAll<any>(COL_DEPARTMENTS),
      getAll<any>(COL_TEACHERS),
    ]);

    // If Firestore database is brand new and empty, seed initial data automatically
    if (depts.length === 0) {
      const initialDepts = [
        { id: "cse", name: "Computer Science & Engineering", code: "CSE", headOfDepartment: "Dr. Arvind Kumar", description: "Pioneering artificial intelligence, algorithms, software engineering, and cloud computing.", teacherCount: 0 },
        { id: "ece", name: "Electronics & Communication", code: "ECE", headOfDepartment: "Dr. Sarah Jenkins", description: "Innovating embedded systems, VLSI design, signal processing, and robotics.", teacherCount: 0 },
        { id: "me", name: "Mechanical Engineering", code: "ME", headOfDepartment: "Dr. Rajesh Sharma", description: "Focusing on thermal systems, robotics, CAD/CAM design, and material science.", teacherCount: 0 },
        { id: "ce", name: "Civil Engineering", code: "CE", headOfDepartment: "Dr. Meera Nair", description: "Advancing structural design, sustainable infrastructure, and green building.", teacherCount: 0 },
        { id: "sh", name: "Science & Humanities", code: "S&H", headOfDepartment: "Dr. Marcus Vance", description: "Fostering foundation in Applied Physics, Mathematics, Chemistry, and Humanities.", teacherCount: 0 }
      ];
      try {
        const batch = db.batch();
        initialDepts.forEach(d => batch.set(db.collection(COL_DEPARTMENTS).doc(d.id), d));
        await batch.commit();
        depts = initialDepts;
      } catch (seedErr) {
        depts = initialDepts;
      }
    }

    const result = depts.map(d => ({
      ...d,
      teacherCount: teachers.filter(t => t.departmentId === d.id).length,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.code) {
      return res.status(400).json({ error: 'Department name and code required' });
    }
    const id = body.id || body.code.toLowerCase().replace(/[^a-z0-9]/g, '') || `dept-${Date.now()}`;
    const newDept = {
      id,
      name: body.name,
      code: body.code.toUpperCase(),
      description: body.description || `Department of ${body.name}`,
      headOfDepartment: body.headOfDepartment || 'To be appointed',
      teacherCount: 0,
    };
    await db.collection(COL_DEPARTMENTS).doc(id).set(newDept);
    res.status(201).json(newDept);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create department' });
  }
});

app.put('/api/departments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const ref = db.collection(COL_DEPARTMENTS).doc(id);
    await ref.update(req.body);
    const finalDoc = await ref.get();
    res.json({ id: finalDoc.id, ...finalDoc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update department' });
  }
});

app.delete('/api/departments/:id', async (req, res) => {
  try {
    await db.collection(COL_DEPARTMENTS).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

// Teachers
app.get('/api/teachers', async (req, res) => {
  try {
    const { departmentId, search } = req.query;
    let query: FirebaseFirestore.Query = db.collection(COL_TEACHERS);
    if (departmentId && typeof departmentId === 'string' && departmentId !== 'all') {
      query = query.where('departmentId', '==', departmentId);
    }
    const snap = await query.get();
    let list: any[] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.name && t.name.toLowerCase().includes(q)) ||
        (t.designation && t.designation.toLowerCase().includes(q)) ||
        (t.subjects && t.subjects.some((s: string) => s.toLowerCase().includes(q)))
      );
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

app.post('/api/teachers', async (req, res) => {
  try {
    const body = req.body;
    const id = body.id || `teacher-${Date.now()}`;
    const newTeacher = {
      id,
      name: body.name || 'Faculty Member',
      designation: body.designation || 'Professor',
      departmentId: body.departmentId || 'sh',
      departmentName: body.departmentName || 'Science & Humanities',
      subjects: Array.isArray(body.subjects) ? body.subjects : [],
      photoUrl: body.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      appreciationQuote: body.appreciationQuote || '',
      bio: body.bio || '',
      dateAdded: body.dateAdded || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      email: body.email || '',
      officeLocation: body.officeLocation || '',
      giftImages: Array.isArray(body.giftImages) ? body.giftImages : [],
    };
    await db.collection(COL_TEACHERS).doc(id).set(newTeacher);
    res.status(201).json(newTeacher);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add teacher' });
  }
});

app.put('/api/teachers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const ref = db.collection(COL_TEACHERS).doc(id);
    await ref.update(req.body);
    const finalDoc = await ref.get();
    res.json({ id: finalDoc.id, ...finalDoc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

app.delete('/api/teachers/:id', async (req, res) => {
  try {
    await db.collection(COL_TEACHERS).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

// Gallery
app.get('/api/gallery', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query: FirebaseFirestore.Query = db.collection(COL_GALLERY);
    if (category && typeof category === 'string' && category !== 'All') {
      query = query.where('category', '==', category);
    }
    const snap = await query.get();
    let list: any[] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(item =>
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery' });
  }
});

app.post('/api/gallery', async (req, res) => {
  try {
    const { title, category, imageUrl, date, description } = req.body;
    const id = req.body.id || `gallery-${Date.now()}`;
    const newItem = {
      id,
      title: title || 'Memory',
      category: category || 'Events',
      imageUrl: imageUrl || '',
      date: date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      description: description || '',
    };
    await db.collection(COL_GALLERY).doc(id).set(newItem);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post memory' });
  }
});

app.put('/api/gallery/:id', async (req, res) => {
  try {
    const ref = db.collection(COL_GALLERY).doc(req.params.id);
    await ref.update(req.body);
    const finalDoc = await ref.get();
    res.json({ id: finalDoc.id, ...finalDoc.data() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

app.delete('/api/gallery/:id', async (req, res) => {
  try {
    await db.collection(COL_GALLERY).doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// Admin Auth (Direct Credentials)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Validate techersday2062@gmail.com / Techers@2062
    if (cleanEmail === 'techersday2062@gmail.com' && cleanPass === 'Techers@2062') {
      return res.json({
        success: true,
        user: {
          name: 'Administrator',
          email: 'techersday2062@gmail.com',
          role: 'Super Administrator',
        },
        token: `admin-token-${Date.now()}`,
      });
    }

    // Check Firestore admin credentials
    try {
      const credRef = db.collection(COL_SETTINGS).doc('adminCredentials');
      const credDoc = await credRef.get();
      if (credDoc.exists) {
        const creds = credDoc.data() as any;
        if (creds && creds.email && creds.email.toLowerCase() === cleanEmail && creds.password === cleanPass) {
          return res.json({
            success: true,
            user: {
              name: creds.name || 'Administrator',
              email: creds.email,
              role: 'Super Administrator',
            },
            token: `admin-token-${Date.now()}`,
          });
        }
      }
    } catch (dbErr) {
      // Continue to reject
    }

    return res.status(401).json({ error: 'Incorrect email or password. Please try again.' });
  } catch (err: any) {
    console.error('POST auth/login error:', err);
    res.status(500).json({ error: 'Authentication error. Please try again.' });
  }
});

export default app;
