import pg from 'pg';
import { INITIAL_SITE_SETTINGS, INITIAL_EVENT } from './src/data/initialData';
import { Teacher, Department, GalleryItem, RSVPRecord, SiteSettings, CelebrationEvent } from './src/types';

let _pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (_pool) return _pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      '[db.ts] DATABASE_URL environment variable is not set. ' +
      'Add it in Vercel → Project Settings → Environment Variables.'
    );
  }
  _pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });
  return _pool;
}

// Backwards-compatible export so existing code using `pool` still works
export const pool = new Proxy({} as pg.Pool, {
  get(_target, prop) {
    return (getPool() as any)[prop];
  },
});

// ─── Settings Helpers ────────────────────────────────────────────────────────
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await pool.query('SELECT data FROM settings WHERE id = $1', ['siteSettings']);
    if (res.rows.length > 0 && res.rows[0].data) {
      return { ...INITIAL_SITE_SETTINGS, ...res.rows[0].data };
    }
  } catch (err) {
    console.error('Error fetching siteSettings:', err);
  }
  return INITIAL_SITE_SETTINGS;
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const merged = { ...current, ...updates };
  await pool.query(
    `INSERT INTO settings (id, data, updated_at)
     VALUES ('siteSettings', $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [JSON.stringify(merged)]
  );
  return merged;
}

export async function getCelebrationEvent(): Promise<CelebrationEvent> {
  try {
    const res = await pool.query('SELECT data FROM settings WHERE id = $1', ['celebrationEvent']);
    if (res.rows.length > 0 && res.rows[0].data) {
      return { ...INITIAL_EVENT, ...res.rows[0].data };
    }
  } catch (err) {
    console.error('Error fetching celebrationEvent:', err);
  }
  return INITIAL_EVENT;
}

export async function updateCelebrationEvent(updates: Partial<CelebrationEvent>): Promise<CelebrationEvent> {
  const current = await getCelebrationEvent();
  const merged = { ...current, ...updates };
  await pool.query(
    `INSERT INTO settings (id, data, updated_at)
     VALUES ('celebrationEvent', $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [JSON.stringify(merged)]
  );
  return merged;
}

// ─── Departments ─────────────────────────────────────────────────────────────
export async function getDepartments(): Promise<Department[]> {
  const query = `
    SELECT d.id, d.name, d.code, d.description, d."headOfDepartment",
           COALESCE(tc.count, 0)::int as "teacherCount"
    FROM departments d
    LEFT JOIN (
      SELECT "departmentId", COUNT(*) as count
      FROM teachers
      GROUP BY "departmentId"
    ) tc ON d.id = tc."departmentId"
    ORDER BY d.name ASC;
  `;
  const res = await pool.query(query);
  return res.rows;
}

export async function getDepartmentById(id: string): Promise<Department | null> {
  const res = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
  return res.rows[0] || null;
}

export async function createDepartment(dept: Department): Promise<Department> {
  await pool.query(
    `INSERT INTO departments (id, name, code, description, "headOfDepartment", "teacherCount")
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [dept.id, dept.name, dept.code, dept.description, dept.headOfDepartment, dept.teacherCount || 0]
  );
  return dept;
}

export async function updateDepartment(id: string, updates: Partial<Department>): Promise<Department | null> {
  const current = await getDepartmentById(id);
  if (!current) return null;

  const name = updates.name !== undefined ? updates.name : current.name;
  const code = updates.code !== undefined ? updates.code.toUpperCase() : current.code;
  const description = updates.description !== undefined ? updates.description : current.description;
  const headOfDepartment = updates.headOfDepartment !== undefined ? updates.headOfDepartment : current.headOfDepartment;

  await pool.query(
    `UPDATE departments
     SET name = $1, code = $2, description = $3, "headOfDepartment" = $4
     WHERE id = $5`,
    [name, code, description, headOfDepartment, id]
  );

  // If department name changed, sync teachers
  if (name !== current.name) {
    await pool.query('UPDATE teachers SET "departmentName" = $1 WHERE "departmentId" = $2', [name, id]);
  }

  return getDepartmentById(id);
}

export async function deleteDepartment(id: string): Promise<boolean> {
  const res = await pool.query('DELETE FROM departments WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

// ─── Teachers ────────────────────────────────────────────────────────────────
export async function getTeachers(departmentId?: string, search?: string): Promise<Teacher[]> {
  let query = 'SELECT * FROM teachers WHERE 1=1';
  const params: any[] = [];

  if (departmentId && departmentId !== 'all') {
    params.push(departmentId);
    query += ` AND "departmentId" = $${params.length}`;
  }

  query += ' ORDER BY name ASC';
  const res = await pool.query(query, params);
  let list: Teacher[] = res.rows.map(row => ({
    id: row.id,
    name: row.name,
    designation: row.designation,
    departmentId: row.departmentId,
    departmentName: row.departmentName,
    subjects: Array.isArray(row.subjects) ? row.subjects : [],
    photoUrl: row.photoUrl,
    appreciationQuote: row.appreciationQuote,
    bio: row.bio,
    dateAdded: row.dateAdded,
    email: row.email,
    officeLocation: row.officeLocation,
    giftImages: Array.isArray(row.giftImages) ? row.giftImages : [],
  }));

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.departmentName.toLowerCase().includes(q) ||
      t.designation.toLowerCase().includes(q) ||
      t.subjects.some(s => s.toLowerCase().includes(q))
    );
  }

  return list;
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  const res = await pool.query('SELECT * FROM teachers WHERE id = $1', [id]);
  if (!res.rows[0]) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    name: row.name,
    designation: row.designation,
    departmentId: row.departmentId,
    departmentName: row.departmentName,
    subjects: Array.isArray(row.subjects) ? row.subjects : [],
    photoUrl: row.photoUrl,
    appreciationQuote: row.appreciationQuote,
    bio: row.bio,
    dateAdded: row.dateAdded,
    email: row.email,
    officeLocation: row.officeLocation,
    giftImages: Array.isArray(row.giftImages) ? row.giftImages : [],
  };
}

export async function createTeacher(teacher: Teacher): Promise<Teacher> {
  await pool.query(
    `INSERT INTO teachers (id, name, designation, "departmentId", "departmentName", subjects, "photoUrl", "appreciationQuote", bio, "dateAdded", email, "officeLocation", "giftImages")
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12, $13::jsonb)`,
    [
      teacher.id,
      teacher.name,
      teacher.designation,
      teacher.departmentId,
      teacher.departmentName,
      JSON.stringify(teacher.subjects || []),
      teacher.photoUrl,
      teacher.appreciationQuote,
      teacher.bio || '',
      teacher.dateAdded,
      teacher.email || '',
      teacher.officeLocation || '',
      JSON.stringify(teacher.giftImages || []),
    ]
  );
  return teacher;
}

export async function updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher | null> {
  const current = await getTeacherById(id);
  if (!current) return null;

  const merged = { ...current, ...updates };

  // If department changed, resolve departmentName
  if (updates.departmentId && updates.departmentId !== current.departmentId) {
    const dept = await getDepartmentById(updates.departmentId);
    if (dept) merged.departmentName = dept.name;
  }

  await pool.query(
    `UPDATE teachers
     SET name = $1, designation = $2, "departmentId" = $3, "departmentName" = $4,
         subjects = $5::jsonb, "photoUrl" = $6, "appreciationQuote" = $7, bio = $8,
         email = $9, "officeLocation" = $10, "giftImages" = $11::jsonb
     WHERE id = $12`,
    [
      merged.name,
      merged.designation,
      merged.departmentId,
      merged.departmentName,
      JSON.stringify(merged.subjects || []),
      merged.photoUrl,
      merged.appreciationQuote,
      merged.bio || '',
      merged.email || '',
      merged.officeLocation || '',
      JSON.stringify(merged.giftImages || []),
      id,
    ]
  );

  return getTeacherById(id);
}

export async function deleteTeacher(id: string): Promise<boolean> {
  const res = await pool.query('DELETE FROM teachers WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

// ─── Gallery ─────────────────────────────────────────────────────────────────
export async function getGallery(category?: string, search?: string): Promise<GalleryItem[]> {
  let query = 'SELECT * FROM gallery WHERE 1=1';
  const params: any[] = [];

  if (category && category !== 'All') {
    params.push(category);
    query += ` AND category = $${params.length}`;
  }

  query += ' ORDER BY created_at DESC';
  const res = await pool.query(query, params);
  let list: GalleryItem[] = res.rows.map(row => ({
    id: row.id,
    title: row.title,
    category: row.category,
    imageUrl: row.imageUrl,
    date: row.date,
    description: row.description,
  }));

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(item =>
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  }

  return list;
}

export async function getGalleryById(id: string): Promise<GalleryItem | null> {
  const res = await pool.query('SELECT * FROM gallery WHERE id = $1', [id]);
  if (!res.rows[0]) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    imageUrl: row.imageUrl,
    date: row.date,
    description: row.description,
  };
}

export async function createGalleryItem(item: GalleryItem): Promise<GalleryItem> {
  await pool.query(
    `INSERT INTO gallery (id, title, category, "imageUrl", date, description)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [item.id, item.title, item.category, item.imageUrl, item.date, item.description || '']
  );
  return item;
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem | null> {
  const current = await getGalleryById(id);
  if (!current) return null;

  const merged = { ...current, ...updates };
  await pool.query(
    `UPDATE gallery
     SET title = $1, category = $2, "imageUrl" = $3, date = $4, description = $5
     WHERE id = $6`,
    [merged.title, merged.category, merged.imageUrl, merged.date, merged.description || '', id]
  );
  return getGalleryById(id);
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const res = await pool.query('DELETE FROM gallery WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

// ─── RSVPs ───────────────────────────────────────────────────────────────────
export async function getRsvps(): Promise<RSVPRecord[]> {
  const res = await pool.query('SELECT * FROM rsvps ORDER BY created_at DESC');
  return res.rows.map(row => ({
    id: row.id,
    teacherId: row.teacherId,
    teacherName: row.teacherName,
    guestName: row.guestName,
    email: row.email,
    department: row.department,
    attending: row.attending,
    guestCount: row.guestCount,
    dietaryNeeds: row.dietaryNeeds,
    wishesNote: row.wishesNote,
    submittedAt: row.submittedAt,
  }));
}

export async function createRsvp(rsvp: RSVPRecord): Promise<RSVPRecord> {
  await pool.query(
    `INSERT INTO rsvps (id, "teacherId", "teacherName", "guestName", email, department, attending, "guestCount", "dietaryNeeds", "wishesNote", "submittedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      rsvp.id,
      rsvp.teacherId || '',
      rsvp.teacherName || '',
      rsvp.guestName,
      rsvp.email,
      rsvp.department,
      rsvp.attending,
      rsvp.guestCount,
      rsvp.dietaryNeeds || '',
      rsvp.wishesNote || '',
      rsvp.submittedAt,
    ]
  );
  return rsvp;
}

// ─── Stats ───────────────────────────────────────────────────────────────────
export async function getStats() {
  const res = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM teachers)::int as teachers,
      (SELECT COUNT(*) FROM departments)::int as departments,
      (SELECT COUNT(*) FROM gallery)::int as gallery,
      (SELECT COUNT(*) FROM rsvps)::int as rsvps;
  `);
  const row = res.rows[0];
  return {
    totalTeachers: row.teachers,
    totalDepartments: row.departments,
    totalGalleryPhotos: row.gallery,
    totalRsvps: row.rsvps,
  };
}

// ─── Admin Authentication ─────────────────────────────────────────────────────
export async function validateAdminCredentials(email: string, pass: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  // Hardcoded master credential
  if (cleanEmail === 'techersday2062@gmail.com' && cleanPass === 'Techers@2062') {
    return true;
  }

  // Check Supabase settings
  try {
    const res = await pool.query('SELECT data FROM settings WHERE id = $1', ['adminCredentials']);
    if (res.rows.length > 0 && res.rows[0].data) {
      const creds = res.rows[0].data;
      if (creds && creds.email && creds.email.toLowerCase() === cleanEmail && creds.password === cleanPass) {
        return true;
      }
    }
  } catch (err) {
    console.error('Error validating admin:', err);
  }

  return false;
}
