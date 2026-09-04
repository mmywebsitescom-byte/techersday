import { createClient, SupabaseClient } from '@supabase/supabase-js';
import pg from 'pg';
import { INITIAL_SITE_SETTINGS, INITIAL_EVENT } from './src/data/initialData';
import { Teacher, Department, GalleryItem, RSVPRecord, SiteSettings, CelebrationEvent } from './src/types';

// ── Supabase HTTPS Client (Serverless-optimized, zero TCP connection limits) ──
let _supabase: SupabaseClient | null = null;

const DEFAULT_SUPABASE_URL = 'https://hucuonrxbvkdcvrultjq.supabase.co';

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_KEY;

  if (!key) {
    throw new Error(
      '[db.ts] Supabase Key is missing. Please set SUPABASE_SECRET_KEY or SUPABASE_PUBLISHABLE_KEY in Vercel Environment Variables.'
    );
  }

  _supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _supabase;
}

// ── Backwards-compatible pg.Pool (used if direct SQL is needed) ──────────────
let _pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (_pool) return _pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      '[db.ts] DATABASE_URL environment variable is not set.'
    );
  }

  _pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  });
  _pool.on('error', (err) => {
    console.error('[db.ts] Unexpected pg client idle error:', err);
  });
  return _pool;
}

export const pool = new Proxy({} as pg.Pool, {
  get(_target, prop) {
    return (getPool() as any)[prop];
  },
});

// ─── Settings Helpers ────────────────────────────────────────────────────────
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('settings').select('data').eq('id', 'siteSettings').maybeSingle();
    if (!error && data?.data) {
      return { ...INITIAL_SITE_SETTINGS, ...data.data };
    }
  } catch (err) {
    console.error('Error fetching siteSettings:', err);
  }
  return INITIAL_SITE_SETTINGS;
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const merged = { ...current, ...updates };
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('settings').upsert({
      id: 'siteSettings',
      data: merged,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error('Error saving siteSettings:', error);
  } catch (err) {
    console.error('Failed to update siteSettings:', err);
  }
  return merged;
}

export async function getCelebrationEvent(): Promise<CelebrationEvent> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('settings').select('data').eq('id', 'celebrationEvent').maybeSingle();
    if (!error && data?.data) {
      return { ...INITIAL_EVENT, ...data.data };
    }
  } catch (err) {
    console.error('Error fetching celebrationEvent:', err);
  }
  return INITIAL_EVENT;
}

export async function updateCelebrationEvent(updates: Partial<CelebrationEvent>): Promise<CelebrationEvent> {
  const current = await getCelebrationEvent();
  const merged = { ...current, ...updates };
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('settings').upsert({
      id: 'celebrationEvent',
      data: merged,
      updated_at: new Date().toISOString(),
    });
    if (error) console.error('Error saving celebrationEvent:', error);
  } catch (err) {
    console.error('Failed to update celebrationEvent:', err);
  }
  return merged;
}

// ─── Departments ─────────────────────────────────────────────────────────────
export async function getDepartments(): Promise<Department[]> {
  const supabase = getSupabase();
  const [deptRes, teacherRes] = await Promise.all([
    supabase.from('departments').select('*').order('name', { ascending: true }),
    supabase.from('teachers').select('departmentId'),
  ]);

  if (deptRes.error) {
    console.error('Error fetching departments:', deptRes.error);
    throw deptRes.error;
  }

  const depts = deptRes.data || [];
  const teachers = teacherRes.data || [];

  const countMap: Record<string, number> = {};
  for (const t of teachers) {
    if (t.departmentId) {
      countMap[t.departmentId] = (countMap[t.departmentId] || 0) + 1;
    }
  }

  return depts.map((d: any) => ({
    id: d.id,
    name: d.name,
    code: d.code,
    description: d.description || `Department of ${d.name} at Excellence Institute of Technology.`,
    headOfDepartment: d.headOfDepartment || 'To be appointed',
    teacherCount: countMap[d.id] ?? d.teacherCount ?? 0,
  }));
}

export async function getDepartmentById(id: string): Promise<Department | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('departments').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return data as Department;
}

export async function createDepartment(dept: Department): Promise<Department> {
  const supabase = getSupabase();
  const { error } = await supabase.from('departments').insert([dept]);
  if (error) throw error;
  return dept;
}

export async function updateDepartment(id: string, updates: Partial<Department>): Promise<Department | null> {
  const supabase = getSupabase();
  const { error } = await supabase.from('departments').update(updates).eq('id', id);
  if (error) throw error;

  // Sync teacher department name if renamed
  if (updates.name) {
    await supabase.from('teachers').update({ departmentName: updates.name }).eq('departmentId', id);
  }

  return getDepartmentById(id);
}

export async function deleteDepartment(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('departments').delete().eq('id', id);
  return !error;
}

// ─── Teachers ────────────────────────────────────────────────────────────────
export async function getTeachers(departmentId?: string, search?: string): Promise<Teacher[]> {
  const supabase = getSupabase();
  let query = supabase.from('teachers').select('*').order('name', { ascending: true });

  if (departmentId && departmentId !== 'all') {
    query = query.eq('departmentId', departmentId);
  }

  if (search && search.trim()) {
    const term = search.trim();
    query = query.or(`name.ilike.%${term}%,designation.ilike.%${term}%,departmentName.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Teacher[];
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('teachers').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return data as Teacher;
}

export async function createTeacher(teacher: Teacher): Promise<Teacher> {
  const supabase = getSupabase();
  const { error } = await supabase.from('teachers').insert([teacher]);
  if (error) throw error;
  return teacher;
}

export async function updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher | null> {
  const supabase = getSupabase();
  const { error } = await supabase.from('teachers').update(updates).eq('id', id);
  if (error) throw error;
  return getTeacherById(id);
}

export async function deleteTeacher(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('teachers').delete().eq('id', id);
  return !error;
}

// ─── Gallery ─────────────────────────────────────────────────────────────────
export async function getGallery(category?: string, search?: string): Promise<GalleryItem[]> {
  const supabase = getSupabase();
  let query = supabase.from('gallery').select('*').order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (search && search.trim()) {
    const term = search.trim();
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as GalleryItem[];
}

export async function getGalleryById(id: string): Promise<GalleryItem | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('gallery').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return data as GalleryItem;
}

export async function createGalleryItem(item: GalleryItem): Promise<GalleryItem> {
  const supabase = getSupabase();
  const { error } = await supabase.from('gallery').insert([item]);
  if (error) throw error;
  return item;
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem | null> {
  const supabase = getSupabase();
  const { error } = await supabase.from('gallery').update(updates).eq('id', id);
  if (error) throw error;
  return getGalleryById(id);
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.from('gallery').delete().eq('id', id);
  return !error;
}

// ─── RSVPs ───────────────────────────────────────────────────────────────────
export async function getRsvps(): Promise<RSVPRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('rsvps').select('*').order('submittedAt', { ascending: false });
  if (error) throw error;
  return (data || []) as RSVPRecord[];
}

export async function createRsvp(rsvp: RSVPRecord): Promise<RSVPRecord> {
  const supabase = getSupabase();
  const { error } = await supabase.from('rsvps').insert([rsvp]);
  if (error) throw error;
  return rsvp;
}

// ─── Stats ───────────────────────────────────────────────────────────────────
export async function getStats() {
  const supabase = getSupabase();
  const [t, d, g, r] = await Promise.all([
    supabase.from('teachers').select('*', { count: 'exact', head: true }),
    supabase.from('departments').select('*', { count: 'exact', head: true }),
    supabase.from('gallery').select('*', { count: 'exact', head: true }),
    supabase.from('rsvps').select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalTeachers: t.count ?? 0,
    totalDepartments: d.count ?? 0,
    totalGalleryPhotos: g.count ?? 0,
    totalRsvps: r.count ?? 0,
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
    const supabase = getSupabase();
    const { data } = await supabase.from('settings').select('data').eq('id', 'adminCredentials').maybeSingle();
    if (data?.data) {
      const creds = data.data;
      if (creds && creds.email && creds.email.toLowerCase() === cleanEmail && creds.password === cleanPass) {
        return true;
      }
    }
  } catch (err) {
    console.error('Error validating admin:', err);
  }

  return false;
}
