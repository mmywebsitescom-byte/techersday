import express from 'express';
import * as db from '../db';
import { Department, Teacher, GalleryItem, RSVPRecord } from '../src/types';

const app = express();
app.use(express.json({ limit: '25mb' }));

// ── CORS & Headers ───────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const router = express.Router();

// ── Health ───────────────────────────────────────────────────────────────────
router.get('/health', async (_req, res) => {
  try {
    const stats = await db.getStats();
    res.json({
      status: 'ok',
      database: 'supabase-connected',
      provider: 'supabase-rest-https',
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[Health Check Error]', err);
    res.status(500).json({
      status: 'error',
      database: 'connection_error',
      error: err?.message || 'Database connection error',
    });
  }
});

// ── Event ────────────────────────────────────────────────────────────────────
router.get('/event', async (_req, res) => {
  try {
    const event = await db.getCelebrationEvent();
    res.json(event);
  } catch (err: any) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Failed to fetch event info', detail: err?.message });
  }
});

router.put('/event', async (req, res) => {
  try {
    const updated = await db.updateCelebrationEvent(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update event', detail: err?.message });
  }
});

// ── Site Settings ────────────────────────────────────────────────────────────
router.get('/site-settings', async (_req, res) => {
  try {
    const settings = await db.getSiteSettings();
    res.json(settings);
  } catch (err: any) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings', detail: err?.message });
  }
});

router.put('/site-settings', async (req, res) => {
  try {
    const updated = await db.updateSiteSettings(req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save settings', detail: err?.message });
  }
});

// ── Departments ──────────────────────────────────────────────────────────────
router.get('/departments', async (_req, res) => {
  try {
    const depts = await db.getDepartments();
    res.json(depts);
  } catch (err: any) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Failed to fetch departments', detail: err?.message });
  }
});

router.get('/departments/:id', async (req, res) => {
  try {
    const dept = await db.getDepartmentById(req.params.id);
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    res.json(dept);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch department', detail: err?.message });
  }
});

router.post('/departments', async (req, res) => {
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
    await db.createDepartment(newDept);
    res.status(201).json(newDept);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create department', detail: err?.message });
  }
});

router.put('/departments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await db.updateDepartment(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Department not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update department', detail: err?.message });
  }
});

router.delete('/departments/:id', async (req, res) => {
  try {
    await db.deleteDepartment(req.params.id);
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete department', detail: err?.message });
  }
});

// ── Teachers ─────────────────────────────────────────────────────────────────
router.get('/teachers', async (req, res) => {
  try {
    const { departmentId, search } = req.query;
    const teachers = await db.getTeachers(
      typeof departmentId === 'string' ? departmentId : undefined,
      typeof search === 'string' ? search : undefined
    );
    res.json(teachers);
  } catch (err: any) {
    console.error('Error fetching teachers:', err);
    res.status(500).json({ error: 'Failed to fetch teachers', detail: err?.message });
  }
});

router.get('/teachers/:id', async (req, res) => {
  try {
    const teacher = await db.getTeacherById(req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    res.json(teacher);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch teacher', detail: err?.message });
  }
});

router.post('/teachers', async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.designation || !body.departmentId) {
      return res.status(400).json({ error: 'Name, designation, and department are required' });
    }

    const dept = await db.getDepartmentById(body.departmentId);
    const departmentName = dept ? dept.name : (body.departmentName || 'Science & Humanities');

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

    await db.createTeacher(newTeacher);
    res.status(201).json(newTeacher);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create teacher', detail: err?.message });
  }
});

router.put('/teachers/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await db.updateTeacher(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Teacher not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update teacher', detail: err?.message });
  }
});

router.delete('/teachers/:id', async (req, res) => {
  try {
    await db.deleteTeacher(req.params.id);
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete teacher', detail: err?.message });
  }
});

// ── Gallery ──────────────────────────────────────────────────────────────────
router.get('/gallery', async (req, res) => {
  try {
    const { category, search } = req.query;
    const items = await db.getGallery(
      typeof category === 'string' ? category : undefined,
      typeof search === 'string' ? search : undefined
    );
    res.json(items);
  } catch (err: any) {
    console.error('Error fetching gallery:', err);
    res.status(500).json({ error: 'Failed to fetch gallery', detail: err?.message });
  }
});

router.get('/gallery/:id', async (req, res) => {
  try {
    const item = await db.getGalleryById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Gallery item not found' });
    res.json(item);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch gallery item', detail: err?.message });
  }
});

router.post('/gallery', async (req, res) => {
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
    await db.createGalleryItem(newItem);
    res.status(201).json(newItem);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add gallery item', detail: err?.message });
  }
});

router.put('/gallery/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await db.updateGalleryItem(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Gallery item not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update gallery item', detail: err?.message });
  }
});

router.delete('/gallery/:id', async (req, res) => {
  try {
    await db.deleteGalleryItem(req.params.id);
    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete gallery item', detail: err?.message });
  }
});

// ── RSVPs ────────────────────────────────────────────────────────────────────
router.get('/rsvp', async (_req, res) => {
  try {
    const list = await db.getRsvps();
    res.json(list);
  } catch (err: any) {
    console.error('Error fetching RSVPs:', err);
    res.status(500).json({ error: 'Failed to fetch RSVPs', detail: err?.message });
  }
});

router.post('/rsvp', async (req, res) => {
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
    await db.createRsvp(newRsvp);
    res.status(201).json({ success: true, rsvp: newRsvp });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit RSVP', detail: err?.message });
  }
});

// ── Stats Dashboard ──────────────────────────────────────────────────────────
router.get('/stats', async (_req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (err: any) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats', detail: err?.message });
  }
});

// ── Admin Auth ───────────────────────────────────────────────────────────────
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const isValid = await db.validateAdminCredentials(email || '', password || '');

    if (isValid) {
      return res.json({
        success: true,
        user: {
          name: 'Administrator',
          email: (email || '').trim().toLowerCase(),
          role: 'Super Administrator',
        },
        token: `admin-token-${Date.now()}`,
      });
    }

    return res.status(401).json({ error: 'Incorrect email or password. Please try again.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Authentication error. Please try again.', detail: err?.message });
  }
});

// Mount router on BOTH '/api' and '/'
app.use('/api', router);
app.use('/', router);

// Global unhandled error middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled API Error]:', err);
  res.status(500).json({ error: 'Internal server error', detail: err?.message || String(err) });
});

export default app;
