import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { createServer as createViteServer } from 'vite';
import { initializeApp, cert, getApps, App as FirebaseApp } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth as FirebaseAuth } from 'firebase-admin/auth';
import { INITIAL_DEPARTMENTS, INITIAL_GALLERY, INITIAL_TEACHERS, INITIAL_EVENT, INITIAL_SITE_SETTINGS } from './src/data/initialData';
import { Teacher, GalleryItem, RSVPRecord, Department, SiteSettings } from './src/types';

// ─── Firebase Admin Initialisation ──────────────────────────────────────────
const _require = createRequire(import.meta.url);

let serviceAccount: any;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (e) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT env var:', e);
  }
}
if (!serviceAccount) {
  try {
    serviceAccount = _require('./serviceAccountKey.json');
  } catch (e) {
    // Check if path specified in GOOGLE_APPLICATION_CREDENTIALS
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        serviceAccount = _require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));
      } catch {}
    }
  }
}

let firebaseApp: FirebaseApp | null = null;
let db: Firestore | null = null;

if (serviceAccount) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp({ credential: cert(serviceAccount) }) : getApps()[0];
    db = getFirestore(firebaseApp);
    console.log('✅ Firebase Admin initialized with service account.');
  } catch (initErr) {
    console.error('❌ Failed to initialize Firebase with service account:', initErr);
  }
} else {
  console.warn('⚠️ No serviceAccountKey.json or FIREBASE_SERVICE_ACCOUNT found.');
  if (process.env.LIVE_BACKEND_URL) {
    console.log(`🌐 Live proxy active: ${process.env.LIVE_BACKEND_URL}`);
  } else {
    console.warn('💡 Set LIVE_BACKEND_URL in .env or add serviceAccountKey.json to load live database data.');
  }
}

// Collection names
const COL_TEACHERS   = 'teachers';
const COL_DEPARTMENTS = 'departments';
const COL_GALLERY    = 'gallery';
const COL_RSVPS      = 'rsvps';
const COL_SETTINGS   = 'settings';
const DOC_SETTINGS   = 'siteSettings';

// ─── Seed Firestore with Initial Data (only if collections are empty) ────────
async function seedIfEmpty() {
  if (!db) {
    return;
  }
  try {
    console.log('🔥 Connecting to Firebase Firestore (techxeraday)...');

    // Seed departments
    const deptSnap = await db.collection(COL_DEPARTMENTS).limit(1).get();
    if (deptSnap.empty) {
      console.log('📦 Seeding departments...');
      const batch = db.batch();
      for (const dept of INITIAL_DEPARTMENTS) {
        const ref = db.collection(COL_DEPARTMENTS).doc(dept.id);
        batch.set(ref, dept);
      }
      await batch.commit();
      console.log(`✅ Seeded ${INITIAL_DEPARTMENTS.length} departments`);
    } else {
      console.log(`✅ Departments already exist (${deptSnap.size}+ docs)`);
    }

    // Seed teachers
    const teacherSnap = await db.collection(COL_TEACHERS).limit(1).get();
    if (teacherSnap.empty) {
      console.log('📦 Seeding teachers...');
      // Write in batches of 500 (Firestore limit)
      const chunkSize = 400;
      for (let i = 0; i < INITIAL_TEACHERS.length; i += chunkSize) {
        const batch = db.batch();
        const chunk = INITIAL_TEACHERS.slice(i, i + chunkSize);
        for (const teacher of chunk) {
          const ref = db.collection(COL_TEACHERS).doc(teacher.id);
          batch.set(ref, teacher);
        }
        await batch.commit();
      }
      console.log(`✅ Seeded ${INITIAL_TEACHERS.length} teachers`);
    } else {
      console.log(`✅ Teachers already exist`);
    }

    // Seed gallery
    const gallerySnap = await db.collection(COL_GALLERY).limit(1).get();
    if (gallerySnap.empty) {
      console.log('📦 Seeding gallery...');
      const batch = db.batch();
      for (const item of INITIAL_GALLERY) {
        const ref = db.collection(COL_GALLERY).doc(item.id);
        batch.set(ref, item);
      }
      await batch.commit();
      console.log(`✅ Seeded ${INITIAL_GALLERY.length} gallery items`);
    } else {
      console.log(`✅ Gallery already exists`);
    }

    // Seed site settings
    const settingsDoc = await db.collection(COL_SETTINGS).doc(DOC_SETTINGS).get();
    if (!settingsDoc.exists) {
      console.log('📦 Seeding site settings...');
      await db.collection(COL_SETTINGS).doc(DOC_SETTINGS).set(INITIAL_SITE_SETTINGS);
      console.log('✅ Site settings seeded');
    } else {
      console.log('✅ Site settings already exist');
    }

    // Seed event info
    const eventDoc = await db.collection(COL_SETTINGS).doc('celebrationEvent').get();
    if (!eventDoc.exists) {
      console.log('📦 Seeding celebration event info...');
      await db.collection(COL_SETTINGS).doc('celebrationEvent').set(INITIAL_EVENT);
      console.log('✅ Celebration event info seeded');
    }

    // Seed / Update Admin Credentials
    const credRef = db.collection(COL_SETTINGS).doc('adminCredentials');
    await credRef.set({
      email: 'techersday2062@gmail.com',
      password: 'Techers@2062',
      name: 'Admin',
      role: 'Super Administrator',
    }, { merge: true });
    console.log('✅ Admin credentials configured: techersday2062@gmail.com');

    // Seed sample RSVPs
    const rsvpSnap = await db.collection(COL_RSVPS).limit(1).get();
    if (rsvpSnap.empty) {
      console.log('📦 Seeding sample RSVPs...');
      const sampleRsvps: RSVPRecord[] = [
        {
          id: 'rsvp-1',
          teacherId: 'dr-arvind-kumar',
          teacherName: 'Dr. Arvind Kumar',
          guestName: "Arun Sharma (Alumnus '20)",
          email: 'arun.sharma@example.com',
          department: 'Science & Humanities',
          attending: 'Yes',
          guestCount: 2,
          dietaryNeeds: 'Vegetarian',
          wishesNote: 'Looking forward to honoring Dr. Kumar for his incredible guidance!',
          submittedAt: '2026-08-20T14:30:00Z',
        },
        {
          id: 'rsvp-2',
          teacherId: 'dr-emily-chen',
          teacherName: 'Dr. Emily Chen',
          guestName: 'Pooja Patel (Final Year CSE)',
          email: 'pooja.patel@student.eit.edu',
          department: 'Computer Science Engineering',
          attending: 'Yes',
          guestCount: 1,
          dietaryNeeds: 'None',
          wishesNote: 'Thank you Dr. Chen for inspiring our AI projects!',
          submittedAt: '2026-08-22T09:15:00Z',
        },
      ];
      const batch = db.batch();
      for (const rsvp of sampleRsvps) {
        batch.set(db.collection(COL_RSVPS).doc(rsvp.id), rsvp);
      }
      await batch.commit();
      console.log('✅ Sample RSVPs seeded');
    }

    console.log('🎉 Firebase Firestore ready!');
  } catch (err) {
    console.error('❌ Firestore seed error:', err);
  }
}

// ─── Helper: Get all docs from a collection ─────────────────────────────────
async function getAll<T>(collection: string): Promise<T[]> {
  if (!db) return [];
  const snap = await db.collection(collection).get();
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
}

// ─── Main Server ─────────────────────────────────────────────────────────────
async function startServer() {
  // Seed Firestore with initial data if empty
  await seedIfEmpty();

  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // ── Proxy to Live Backend (if configured) ──────────────────────────────────
  if (process.env.LIVE_BACKEND_URL) {
    const targetUrl = process.env.LIVE_BACKEND_URL.replace(/\/$/, '');
    console.log(`🌐 Proxying /api requests to live backend: ${targetUrl}`);
    app.use('/api', async (req, res, next) => {
      try {
        const dest = `${targetUrl}/api${req.url}`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (req.headers.authorization) headers['authorization'] = req.headers.authorization as string;

        const fetchOptions: RequestInit = {
          method: req.method,
          headers,
        };
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
          fetchOptions.body = JSON.stringify(req.body);
        }
        const resp = await fetch(dest, fetchOptions);
        const data = await resp.json();
        return res.status(resp.status).json(data);
      } catch (err: any) {
        console.error('Proxy error to live backend:', err);
        return res.status(502).json({ error: 'Failed to proxy request to live backend', detail: err?.message });
      }
    });
  }

  // ── Health ────────────────────────────────────────────────────────────────
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      database: 'firestore',
      project: 'techxeraday',
      liveProxy: process.env.LIVE_BACKEND_URL || null,
      hasServiceAccount: !!serviceAccount,
      timestamp: new Date().toISOString()
    });
  });

  // ── Event Info ────────────────────────────────────────────────────────────
  app.get('/api/event', async (_req, res) => {
    try {
      if (!db) return res.json(INITIAL_EVENT);
      const doc = await db.collection(COL_SETTINGS).doc('celebrationEvent').get();
      if (!doc.exists) return res.json(INITIAL_EVENT);
      res.json({ ...doc.data() });
    } catch (err) {
      console.error('GET event error:', err);
      res.json(INITIAL_EVENT);
    }
  });

  app.put('/api/event', async (req, res) => {
    try {
      if (!db) return res.status(503).json({ error: 'Database not initialized' });
      const ref = db.collection(COL_SETTINGS).doc('celebrationEvent');
      const sanitized = JSON.parse(JSON.stringify(req.body));
      await ref.set(sanitized, { merge: true });
      const updated = await ref.get();
      res.json({ ...updated.data() });
    } catch (err) {
      console.error('PUT event error:', err);
      res.status(500).json({ error: 'Failed to update event info' });
    }
  });

  // ── Site Settings ─────────────────────────────────────────────────────────
  app.get('/api/site-settings', async (_req, res) => {
    try {
      const doc = await db.collection(COL_SETTINGS).doc(DOC_SETTINGS).get();
      if (!doc.exists) return res.json(INITIAL_SITE_SETTINGS);
      res.json({ ...doc.data() });
    } catch (err) {
      console.error('GET site-settings error:', err);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.put('/api/site-settings', async (req, res) => {
    try {
      const ref = db.collection(COL_SETTINGS).doc(DOC_SETTINGS);
      await ref.set(req.body, { merge: true });
      const updated = await ref.get();
      res.json({ ...updated.data() });
    } catch (err) {
      console.error('PUT site-settings error:', err);
      res.status(500).json({ error: 'Failed to save settings' });
    }
  });

  // ── Departments ───────────────────────────────────────────────────────────
  app.get('/api/departments', async (_req, res) => {
    try {
      const [depts, teachers] = await Promise.all([
        getAll<Department>(COL_DEPARTMENTS),
        getAll<Teacher>(COL_TEACHERS),
      ]);
      // Recalculate teacher counts dynamically
      const result = depts.map(d => ({
        ...d,
        teacherCount: teachers.filter(t => t.departmentId === d.id).length,
      }));
      res.json(result);
    } catch (err) {
      console.error('GET departments error:', err);
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  });

  app.get('/api/departments/:id', async (req, res) => {
    try {
      const doc = await db.collection(COL_DEPARTMENTS).doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ error: 'Department not found' });
      res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
      console.error('GET department/:id error:', err);
      res.status(500).json({ error: 'Failed to fetch department' });
    }
  });

  app.post('/api/departments', async (req, res) => {
    try {
      const body = req.body;
      if (!body.name || !body.code) {
        return res.status(400).json({ error: 'Department name and code are required' });
      }
      const id = body.id || body.code.toLowerCase().replace(/[^a-z0-9]/g, '') || `dept-${Date.now()}`;
      const newDept: Department = {
        id,
        name: body.name,
        code: body.code.toUpperCase(),
        description: body.description || `Department of ${body.name} at Excellence Institute of Technology.`,
        headOfDepartment: body.headOfDepartment || 'To be appointed',
        teacherCount: 0,
      };
      await db.collection(COL_DEPARTMENTS).doc(id).set(newDept);
      res.status(201).json(newDept);
    } catch (err) {
      console.error('POST department error:', err);
      res.status(500).json({ error: 'Failed to create department' });
    }
  });

  app.put('/api/departments/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const ref = db.collection(COL_DEPARTMENTS).doc(id);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ error: 'Department not found' });

      const current = doc.data() as Department;
      const body = req.body;
      const updated: Partial<Department> = {};

      if (body.name !== undefined)             updated.name = body.name;
      if (body.code !== undefined)             updated.code = body.code.toUpperCase();
      if (body.description !== undefined)      updated.description = body.description;
      if (body.headOfDepartment !== undefined) updated.headOfDepartment = body.headOfDepartment;

      await ref.update(updated);

      // If department name changed, update all teachers in that dept
      if (body.name && body.name !== current.name) {
        const teacherSnap = await db.collection(COL_TEACHERS)
          .where('departmentId', '==', id)
          .get();
        if (!teacherSnap.empty) {
          const batch = db.batch();
          teacherSnap.docs.forEach(d => batch.update(d.ref, { departmentName: body.name }));
          await batch.commit();
          console.log(`Updated departmentName for ${teacherSnap.size} teachers`);
        }
      }

      const finalDoc = await ref.get();
      res.json({ id: finalDoc.id, ...finalDoc.data() });
    } catch (err) {
      console.error('PUT department/:id error:', err);
      res.status(500).json({ error: 'Failed to update department' });
    }
  });

  app.delete('/api/departments/:id', async (req, res) => {
    try {
      await db.collection(COL_DEPARTMENTS).doc(req.params.id).delete();
      res.json({ success: true, message: 'Department deleted successfully' });
    } catch (err) {
      console.error('DELETE department/:id error:', err);
      res.status(500).json({ error: 'Failed to delete department' });
    }
  });

  // ── Teachers ──────────────────────────────────────────────────────────────
  app.get('/api/teachers', async (req, res) => {
    try {
      const { departmentId, search } = req.query;
      let query: FirebaseFirestore.Query = db.collection(COL_TEACHERS);

      if (departmentId && typeof departmentId === 'string' && departmentId !== 'all') {
        query = query.where('departmentId', '==', departmentId);
      }

      const snap = await query.get();
      let list: Teacher[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Teacher));

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        list = list.filter(t =>
          t.name.toLowerCase().includes(q) ||
          t.departmentName.toLowerCase().includes(q) ||
          t.designation.toLowerCase().includes(q) ||
          t.subjects.some(s => s.toLowerCase().includes(q))
        );
      }

      res.json(list);
    } catch (err) {
      console.error('GET teachers error:', err);
      res.status(500).json({ error: 'Failed to fetch teachers' });
    }
  });

  app.get('/api/teachers/:id', async (req, res) => {
    try {
      const doc = await db.collection(COL_TEACHERS).doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ error: 'Teacher not found' });
      res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
      console.error('GET teacher/:id error:', err);
      res.status(500).json({ error: 'Failed to fetch teacher' });
    }
  });

  app.post('/api/teachers', async (req, res) => {
    try {
      const body = req.body;
      if (!body.name || !body.designation || !body.departmentId) {
        return res.status(400).json({ error: 'Name, designation, and department are required' });
      }

      // Look up department name from Firestore
      const deptDoc = await db.collection(COL_DEPARTMENTS).doc(body.departmentId).get();
      const departmentName = deptDoc.exists
        ? (deptDoc.data() as Department).name
        : (body.departmentName || 'Science & Humanities');

      const id = body.id || `teacher-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newTeacher: Teacher = {
        id,
        name: body.name,
        designation: body.designation,
        departmentId: body.departmentId,
        departmentName,
        subjects: Array.isArray(body.subjects) ? body.subjects : [],
        photoUrl: body.photoUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
        appreciationQuote: body.appreciationQuote || "Dedicated to shaping tomorrow's leaders through insight, patience, and scholarship.",
        bio: body.bio || '',
        dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        email: body.email || '',
        officeLocation: body.officeLocation || '',
      };

      await db.collection(COL_TEACHERS).doc(id).set(newTeacher);
      res.status(201).json(newTeacher);
    } catch (err) {
      console.error('POST teacher error:', err);
      res.status(500).json({ error: 'Failed to create teacher' });
    }
  });

  app.put('/api/teachers/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const ref = db.collection(COL_TEACHERS).doc(id);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ error: 'Teacher not found' });

      const body = req.body;
      const updates: Partial<Teacher> = { ...body };

      // Resolve department name if departmentId changed
      if (body.departmentId) {
        const deptDoc = await db.collection(COL_DEPARTMENTS).doc(body.departmentId).get();
        if (deptDoc.exists) {
          updates.departmentName = (deptDoc.data() as Department).name;
        }
      }

      // Ensure subjects is always an array
      if (body.subjects && !Array.isArray(body.subjects)) {
        updates.subjects = [];
      }

      await ref.update(updates);
      const finalDoc = await ref.get();
      res.json({ id: finalDoc.id, ...finalDoc.data() });
    } catch (err) {
      console.error('PUT teacher/:id error:', err);
      res.status(500).json({ error: 'Failed to update teacher' });
    }
  });

  app.delete('/api/teachers/:id', async (req, res) => {
    try {
      await db.collection(COL_TEACHERS).doc(req.params.id).delete();
      res.json({ success: true, message: 'Teacher deleted successfully' });
    } catch (err) {
      console.error('DELETE teacher/:id error:', err);
      res.status(500).json({ error: 'Failed to delete teacher' });
    }
  });

  // ── Gallery ───────────────────────────────────────────────────────────────
  app.get('/api/gallery', async (req, res) => {
    try {
      const { category, search } = req.query;
      let query: FirebaseFirestore.Query = db.collection(COL_GALLERY);

      if (category && typeof category === 'string' && category !== 'All') {
        query = query.where('category', '==', category);
      }

      const snap = await query.get();
      let list: GalleryItem[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem));

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        list = list.filter(item =>
          item.title.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
        );
      }

      res.json(list);
    } catch (err) {
      console.error('GET gallery error:', err);
      res.status(500).json({ error: 'Failed to fetch gallery' });
    }
  });

  app.get('/api/gallery/:id', async (req, res) => {
    try {
      const doc = await db.collection(COL_GALLERY).doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ error: 'Gallery item not found' });
      res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
      console.error('GET gallery/:id error:', err);
      res.status(500).json({ error: 'Failed to fetch gallery item' });
    }
  });

  app.post('/api/gallery', async (req, res) => {
    try {
      const { title, category, imageUrl, date, description } = req.body;
      if (!title || !imageUrl) {
        return res.status(400).json({ error: 'Title and image URL are required' });
      }
      const id = req.body.id || `gallery-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newItem: GalleryItem = {
        id,
        title,
        category: category || 'Events',
        imageUrl,
        date: date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        description: description || '',
      };
      await db.collection(COL_GALLERY).doc(id).set(newItem);
      res.status(201).json(newItem);
    } catch (err) {
      console.error('POST gallery error:', err);
      res.status(500).json({ error: 'Failed to add gallery item' });
    }
  });

  app.put('/api/gallery/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const ref = db.collection(COL_GALLERY).doc(id);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ error: 'Gallery item not found' });

      const updates = { ...req.body };
      delete updates.id; // Never overwrite the document ID
      await ref.update(updates);
      const finalDoc = await ref.get();
      res.json({ id: finalDoc.id, ...finalDoc.data() });
    } catch (err) {
      console.error('PUT gallery/:id error:', err);
      res.status(500).json({ error: 'Failed to update gallery item' });
    }
  });

  app.delete('/api/gallery/:id', async (req, res) => {
    try {
      const ref = db.collection(COL_GALLERY).doc(req.params.id);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ error: 'Gallery item not found' });
      await ref.delete();
      res.json({ success: true, message: 'Gallery item deleted successfully' });
    } catch (err) {
      console.error('DELETE gallery/:id error:', err);
      res.status(500).json({ error: 'Failed to delete gallery item' });
    }
  });

  // ── RSVPs ─────────────────────────────────────────────────────────────────
  app.get('/api/rsvp', async (_req, res) => {
    try {
      const snap = await db.collection(COL_RSVPS).orderBy('submittedAt', 'desc').get();
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      res.json(list);
    } catch (err) {
      // If no index yet, fallback to unordered
      try {
        const snap = await db.collection(COL_RSVPS).get();
        res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error('GET rsvp error:', e);
        res.status(500).json({ error: 'Failed to fetch RSVPs' });
      }
    }
  });

  app.post('/api/rsvp', async (req, res) => {
    try {
      const { teacherId, teacherName, guestName, email, department, attending, guestCount, dietaryNeeds, wishesNote } = req.body;
      if (!guestName || !email) {
        return res.status(400).json({ error: 'Guest name and email are required' });
      }
      const id = `rsvp-${Date.now()}`;
      const newRsvp: RSVPRecord = {
        id,
        teacherId: teacherId || '',
        teacherName: teacherName || '',
        guestName,
        email,
        department: department || 'General',
        attending: attending || 'Yes',
        guestCount: Number(guestCount) || 1,
        dietaryNeeds: dietaryNeeds || 'None',
        wishesNote: wishesNote || '',
        submittedAt: new Date().toISOString(),
      };
      await db.collection(COL_RSVPS).doc(id).set(newRsvp);
      res.status(201).json({ success: true, rsvp: newRsvp });
    } catch (err) {
      console.error('POST rsvp error:', err);
      res.status(500).json({ error: 'Failed to submit RSVP' });
    }
  });

  // ── Stats Dashboard ───────────────────────────────────────────────────────
  app.get('/api/stats', async (_req, res) => {
    try {
      const [tSnap, dSnap, gSnap, rSnap] = await Promise.all([
        db.collection(COL_TEACHERS).count().get(),
        db.collection(COL_DEPARTMENTS).count().get(),
        db.collection(COL_GALLERY).count().get(),
        db.collection(COL_RSVPS).count().get(),
      ]);
      res.json({
        totalTeachers: tSnap.data().count,
        totalDepartments: dSnap.data().count,
        totalGalleryPhotos: gSnap.data().count,
        totalRsvps: rSnap.data().count,
      });
    } catch (err) {
      console.error('GET stats error:', err);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // ── Admin Auth (Direct Credentials) ──────────────────────────────────────
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

  // ── Vite / Static ─────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔥 Database: Firebase Firestore (techxeraday)`);
    console.log(`📊 Supports: 150+ teachers, 500+ gallery images — persisted forever\n`);
  });
}

startServer();
