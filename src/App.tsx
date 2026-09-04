import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './components/HomeScreen';
import { DepartmentSelectScreen } from './components/DepartmentSelectScreen';
import { DepartmentFacultyScreen } from './components/DepartmentFacultyScreen';
import { TeacherProfileScreen } from './components/TeacherProfileScreen';
import { GalleryScreen } from './components/GalleryScreen';
import { AdminPortal } from './components/AdminPortal';
import { RSVPModal } from './components/RSVPModal';
import { SkeletonLoader } from './components/SkeletonLoader';
import { Teacher, Department, GalleryItem, RSVPRecord, CelebrationEvent, SiteSettings } from './types';
import {
  CACHE_KEYS,
  CACHE_TTL,
  cacheGet,
  cacheSet,
  cacheSnapshot,
  cacheClearAll,
  isCacheFresh,
} from './utils/localCache';

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  institutionName: "Excellence Institute",
  heroTagline: "Honoring the Architects of Our Future",
  heroTitle: "Happy Teachers' Day",
  heroQuote: "To the world, you may be just a teacher, but to your students, you are a hero.",
  heroQuoteAuthor: "Annual Ceremony 2026",
  crestType: 'default-crest',
  customCrestImageUrl: '',
  badgeIcon: 'sparkles',
  showSparkleBadge: true,
  crestBorderGlow: 'gold',
  crestSize: 'medium',
  backgroundMode: 'gradient',
  bgImageUrl: '',
  bgImageOpacity: 85,
  bgBlur: 0,
  bgOverlayColor: '#fbf9f8',
  bgOverlayOpacity: 20,
  bgGradientStyle: 'subtle-purple',
  galleryButtonText: "GALLERY",
  galleryButtonVisible: true,
  departmentsButtonText: "SELECT YOUR DEPARTMENT",
  departmentsButtonVisible: true,
  rsvpButtonText: "RSVP NOW",
  rsvpButtonVisible: false,
  giftIsRevealed: false,
  giftRevealDateTime: '2026-09-05T14:30',
};

const DEFAULT_EVENT: CelebrationEvent = {
  title: "Teachers' Day Celebration 2026",
  date: "5 Sept 2026",
  time: "10:00 AM",
  venue: "College Auditorium",
  year: "2026",
  invitationNote: "Join us in celebrating the faculty mentors who shape tomorrow's innovators.",
};

export function App() {
  // Parse route and identifiers from URL
  const parseCurrentUrl = (teachersList: Teacher[] = [], deptsList: Department[] = []) => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    // 1. Teacher Profile Route: /teacher/:id or ?teacher=:id or /department/:dept/teacher/:id
    const teacherMatch = path.match(/^\/teacher\/([^/]+)/) || path.match(/\/teacher\/([^/]+)/);
    const queryTeacherId = searchParams.get('teacher') || searchParams.get('id');
    const targetTeacherId = teacherMatch ? decodeURIComponent(teacherMatch[1]) : queryTeacherId;

    if (targetTeacherId && teachersList.length > 0) {
      const foundTeacher = teachersList.find(
        (t) => t.id.toLowerCase() === targetTeacherId.toLowerCase()
      );
      if (foundTeacher) {
        const parentDept = deptsList.find(
          (d) => d.id.toLowerCase() === foundTeacher.departmentId.toLowerCase()
        );
        return {
          screen: 'teacher' as const,
          teacher: foundTeacher,
          dept: parentDept || null,
        };
      }
    }

    // 2. Department Route: /department/:id or /departments/:id or ?dept=:id
    const deptMatch = path.match(/^\/department[s]?\/([^/]+)/);
    const queryDeptId = searchParams.get('dept');
    const targetDeptId = deptMatch ? decodeURIComponent(deptMatch[1]) : queryDeptId;

    if (targetDeptId && targetDeptId !== 'departments' && deptsList.length > 0) {
      const foundDept = deptsList.find(
        (d) => d.id.toLowerCase() === targetDeptId.toLowerCase() || d.code.toLowerCase() === targetDeptId.toLowerCase()
      );
      if (foundDept) {
        return {
          screen: 'department-teachers' as const,
          teacher: null,
          dept: foundDept,
        };
      }
    }

    // 3. Static Named Routes
    if (path === '/admin' || path.startsWith('/admin/')) return { screen: 'admin' as const, teacher: null, dept: null };
    if (path === '/gallery') return { screen: 'gallery' as const, teacher: null, dept: null };
    if (path === '/departments') return { screen: 'departments' as const, teacher: null, dept: null };

    return { screen: 'home' as const, teacher: null, dept: null };
  };

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentScreen, setCurrentScreenRaw] = useState<'home' | 'departments' | 'department-teachers' | 'teacher' | 'gallery' | 'admin'>('home');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [rsvps, setRsvps] = useState<RSVPRecord[]>([]);
  const [eventInfo, setEventInfo] = useState<CelebrationEvent>(DEFAULT_EVENT);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  
  // Selected department for faculty list view
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  // Selected teacher for profile view
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // RSVP Modal
  const [isRSVPModalOpen, setIsRSVPModalOpen] = useState(false);
  const [rsvpTargetTeacher, setRsvpTargetTeacher] = useState<Teacher | null>(null);

  // URL-aware navigation — updates browser URL when screen changes
  const setCurrentScreen = (
    screen: 'home' | 'departments' | 'department-teachers' | 'teacher' | 'gallery' | 'admin',
    targetTeacher?: Teacher,
    targetDept?: Department
  ) => {
    let newUrl = '/';
    if (screen === 'home') newUrl = '/';
    else if (screen === 'departments') newUrl = '/departments';
    else if (screen === 'department-teachers') {
      const dept = targetDept || selectedDepartment;
      newUrl = dept ? `/department/${dept.id}` : '/departments';
    } else if (screen === 'teacher') {
      const t = targetTeacher || selectedTeacher;
      newUrl = t ? `/teacher/${t.id}` : '/departments';
    } else if (screen === 'gallery') newUrl = '/gallery';
    else if (screen === 'admin') newUrl = '/admin';

    if (window.location.pathname !== newUrl) {
      window.history.pushState({ screen, teacherId: targetTeacher?.id, deptId: targetDept?.id }, '', newUrl);
    }
    setCurrentScreenRaw(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePop = () => {
      const parsed = parseCurrentUrl(teachers, departments);
      if (parsed.teacher) setSelectedTeacher(parsed.teacher);
      if (parsed.dept) setSelectedDepartment(parsed.dept);
      setCurrentScreenRaw(parsed.screen);
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [teachers, departments]);

  // ─── Data Loading: localStorage cache → Supabase API ───────────────────────
  useEffect(() => {
    const loadData = async () => {
      // ── Step 1: Try localStorage cache first ──────────────────────────────
      if (isCacheFresh()) {
        const cachedTeachers = cacheGet<Teacher[]>(CACHE_KEYS.teachers);
        const cachedDepts = cacheGet<Department[]>(CACHE_KEYS.departments);
        const cachedGallery = cacheGet<GalleryItem[]>(CACHE_KEYS.gallery);
        const cachedRsvps = cacheGet<RSVPRecord[]>(CACHE_KEYS.rsvps, CACHE_TTL.ADMIN);
        const cachedEvent = cacheGet<CelebrationEvent>(CACHE_KEYS.event);
        const cachedSettings = cacheGet<SiteSettings>(CACHE_KEYS.settings);

        if (cachedTeachers && cachedTeachers.length > 0 && cachedDepts && cachedDepts.length > 0) {
          setTeachers(cachedTeachers);
          setDepartments(cachedDepts);
          if (cachedGallery) setGalleryItems(cachedGallery);
          if (cachedRsvps) setRsvps(cachedRsvps);
          if (cachedEvent) setEventInfo(cachedEvent);
          if (cachedSettings) setSiteSettings(cachedSettings);

          const resolved = parseCurrentUrl(cachedTeachers, cachedDepts);
          if (resolved.teacher) setSelectedTeacher(resolved.teacher);
          else setSelectedTeacher(cachedTeachers[0] || null);

          if (resolved.dept) setSelectedDepartment(resolved.dept);
          else setSelectedDepartment(cachedDepts[0] || null);

          setCurrentScreenRaw(resolved.screen);
          setIsLoading(false);
          return;
        }
      }

      // ── Step 2: Fetch fresh data from Supabase ────────────────────────────
      try {
        const [teachersRes, deptsRes, galleryRes, rsvpRes, eventRes, settingsRes] = await Promise.allSettled([
          fetch('/api/teachers').then((r) => r.json()),
          fetch('/api/departments').then((r) => r.json()),
          fetch('/api/gallery').then((r) => r.json()),
          fetch('/api/rsvp').then((r) => r.json()),
          fetch('/api/event').then((r) => r.json()),
          fetch('/api/site-settings').then((r) => r.json()),
        ]);

        let loadedTeachers: Teacher[] = [];
        let loadedDepts: Department[] = [];
        let loadedGallery: GalleryItem[] = [];
        let loadedRsvps: RSVPRecord[] = [];
        let loadedEvent = DEFAULT_EVENT;
        let loadedSettings = DEFAULT_SITE_SETTINGS;

        if (teachersRes.status === 'fulfilled' && Array.isArray(teachersRes.value)) {
          loadedTeachers = teachersRes.value;
          setTeachers(loadedTeachers);
        }
        if (deptsRes.status === 'fulfilled' && Array.isArray(deptsRes.value)) {
          loadedDepts = deptsRes.value;
          setDepartments(loadedDepts);
        }
        if (galleryRes.status === 'fulfilled' && Array.isArray(galleryRes.value)) {
          loadedGallery = galleryRes.value;
          setGalleryItems(loadedGallery);
        }
        if (rsvpRes.status === 'fulfilled' && Array.isArray(rsvpRes.value)) {
          loadedRsvps = rsvpRes.value;
          setRsvps(loadedRsvps);
        }
        if (eventRes.status === 'fulfilled' && eventRes.value?.title) {
          loadedEvent = eventRes.value;
          setEventInfo(loadedEvent);
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value?.heroTitle) {
          loadedSettings = settingsRes.value;
          setSiteSettings(loadedSettings);
        }

        // Re-resolve active route with Supabase data
        const resolved = parseCurrentUrl(loadedTeachers, loadedDepts);
        if (resolved.teacher) setSelectedTeacher(resolved.teacher);
        else if (loadedTeachers.length > 0) setSelectedTeacher(loadedTeachers[0]);

        if (resolved.dept) setSelectedDepartment(resolved.dept);
        else if (loadedDepts.length > 0) setSelectedDepartment(loadedDepts[0]);

        setCurrentScreenRaw(resolved.screen);

        // Save to cache for instant future loads
        cacheSnapshot({
          teachers: loadedTeachers,
          departments: loadedDepts,
          gallery: loadedGallery,
          rsvps: loadedRsvps,
          event: loadedEvent,
          settings: loadedSettings,
        });
      } catch (err) {
        console.error('[Supabase] Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Sync browser Tab Icon (Favicon) & Document Title from Supabase settings
  useEffect(() => {
    if (siteSettings.siteTabTitle) {
      document.title = siteSettings.siteTabTitle;
    } else if (siteSettings.heroTitle) {
      document.title = `${siteSettings.heroTitle} | ${siteSettings.institutionName || 'Excellence Institute'}`;
    }

    if (siteSettings.faviconUrl) {
      // Remove ALL existing icon link tags to prevent caching conflicts
      document.querySelectorAll("link[rel~='icon'], link[rel='shortcut icon']").forEach((el) => el.remove());
      // Add fresh favicon with cache-busting timestamp
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = `${siteSettings.faviconUrl}${siteSettings.faviconUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`;
      document.head.appendChild(link);
    }
  }, [siteSettings.faviconUrl, siteSettings.siteTabTitle, siteSettings.heroTitle, siteSettings.institutionName]);

  // Handlers for Department & Teacher Actions
  const handleSelectDepartment = (deptId: string) => {
    const dept = departments.find(
      (d) => d.id.toLowerCase() === deptId.toLowerCase()
    );
    if (dept) {
      setSelectedDepartment(dept);
      setCurrentScreen('department-teachers', undefined, dept);
    } else {
      setCurrentScreen('department-teachers');
    }
  };

  const handleSelectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    const parentDept = departments.find(
      (d) => d.id.toLowerCase() === teacher.departmentId.toLowerCase()
    );
    if (parentDept) {
      setSelectedDepartment(parentDept);
    }
    setCurrentScreen('teacher', teacher, parentDept);
  };

  const handleOpenRSVP = (teacher?: Teacher) => {
    setRsvpTargetTeacher(teacher || selectedTeacher);
    setIsRSVPModalOpen(true);
  };

  // Event Info Mutator
  const handleUpdateEvent = async (updatedData: Partial<CelebrationEvent>) => {
    const merged = { ...eventInfo, ...updatedData };
    setEventInfo(merged);
    try {
      const res = await fetch('/api/event', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
      if (res.ok) {
        const saved = await res.json();
        setEventInfo(saved);
        cacheSet(CACHE_KEYS.event, saved); // update cache
      }
    } catch (err) {
      console.error('Failed to save event info to server:', err);
    }
  };

  // API Mutators
  const handleAddTeacher = async (newTeacherData: Omit<Teacher, 'id' | 'dateAdded'>) => {
    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeacherData),
      });
      if (!res.ok) throw new Error('Failed to create teacher');
      const savedTeacher = await res.json();
      setTeachers((prev) => {
        const updated = [savedTeacher, ...prev];
        cacheSet(CACHE_KEYS.teachers, updated); // update cache
        return updated;
      });
    } catch (err) {
      const local: Teacher = {
        ...newTeacherData,
        id: `teacher-${Date.now()}`,
        dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      };
      setTeachers((prev) => {
        const updated = [local, ...prev];
        cacheSet(CACHE_KEYS.teachers, updated);
        return updated;
      });
    }
  };

  const handleUpdateTeacher = async (id: string, updatedData: Partial<Teacher>) => {
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error('Failed to update teacher');
      const savedTeacher = await res.json();
      setTeachers((prev) => {
        const updated = prev.map((t) => (t.id === id ? savedTeacher : t));
        cacheSet(CACHE_KEYS.teachers, updated); // update cache
        return updated;
      });
      if (selectedTeacher.id === id) setSelectedTeacher(savedTeacher);
    } catch (err) {
      setTeachers((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t));
        cacheSet(CACHE_KEYS.teachers, updated);
        return updated;
      });
      if (selectedTeacher.id === id) {
        setSelectedTeacher((prev) => ({ ...prev, ...updatedData }));
      }
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      await fetch(`/api/teachers/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn(err);
    }
    setTeachers((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      cacheSet(CACHE_KEYS.teachers, updated); // update cache
      return updated;
    });
  };

  const handleAddGallery = async (newItem: Omit<GalleryItem, 'id'>) => {
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (!res.ok) throw new Error('Failed to post memory');
      const saved = await res.json();
      setGalleryItems((prev) => {
        const updated = [saved, ...prev];
        cacheSet(CACHE_KEYS.gallery, updated); // update cache
        return updated;
      });
    } catch (err) {
      const local: GalleryItem = { ...newItem, id: `gallery-${Date.now()}` };
      setGalleryItems((prev) => {
        const updated = [local, ...prev];
        cacheSet(CACHE_KEYS.gallery, updated);
        return updated;
      });
    }
  };

  const handleUpdateGallery = async (id: string, updatedData: Partial<GalleryItem>) => {
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error('Failed to update gallery memory');
      const saved = await res.json();
      setGalleryItems((prev) => {
        const updated = prev.map((item) => (item.id === id ? saved : item));
        cacheSet(CACHE_KEYS.gallery, updated); // update cache
        return updated;
      });
    } catch (err) {
      setGalleryItems((prev) => {
        const updated = prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item));
        cacheSet(CACHE_KEYS.gallery, updated);
        return updated;
      });
    }
  };

  const handleDeleteGallery = async (id: string) => {
    try {
      await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn(err);
    }
    setGalleryItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      cacheSet(CACHE_KEYS.gallery, updated); // update cache
      return updated;
    });
  };

  const handleConfirmRSVP = async (rsvpData: any) => {
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rsvpData),
      });
      const data = await res.json();
      if (data.rsvp) {
        setRsvps((prev) => [data.rsvp, ...prev]);
      }
    } catch (err) {
      const local: RSVPRecord = {
        ...rsvpData,
        id: `rsvp-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      };
      setRsvps((prev) => [local, ...prev]);
    }
  };

  // Department Handlers
  const handleAddDepartment = async (newDeptData: Omit<Department, 'teacherCount'>) => {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeptData),
      });
      if (!res.ok) throw new Error('Failed to create department');
      const saved = await res.json();
      setDepartments((prev) => [...prev, saved]);
    } catch (err) {
      const local: Department = {
        ...newDeptData,
        id: newDeptData.id || `dept-${Date.now()}`,
        teacherCount: 0,
      };
      setDepartments((prev) => [...prev, local]);
    }
  };

  const handleUpdateDepartment = async (id: string, updatedData: Partial<Department>) => {
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error('Failed to update department');
      const saved = await res.json();
      setDepartments((prev) => prev.map((d) => (d.id === id ? saved : d)));
      if (selectedDepartment.id === id) {
        setSelectedDepartment(saved);
      }
      // Update teachers state if department name changed
      if (updatedData.name) {
        setTeachers((prev) =>
          prev.map((t) => (t.departmentId === id ? { ...t, departmentName: updatedData.name! } : t))
        );
      }
    } catch (err) {
      setDepartments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...updatedData } : d))
      );
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    try {
      await fetch(`/api/departments/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn(err);
    }
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateSiteSettings = async (newSettings: Partial<SiteSettings>) => {
    try {
      const merged = { ...siteSettings, ...newSettings };
      setSiteSettings(merged);
      const res = await fetch('/api/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
      if (res.ok) {
        const saved = await res.json();
        setSiteSettings(saved);
        cacheSet(CACHE_KEYS.settings, saved); // update cache
      }
    } catch (err) {
      setSiteSettings((prev) => {
        const merged2 = { ...prev, ...newSettings };
        cacheSet(CACHE_KEYS.settings, merged2);
        return merged2;
      });
    }
  };

  if (isLoading) {
    return <SkeletonLoader screen={currentScreen} />;
  }

  const activeDept = selectedDepartment || departments[0] || null;
  const activeTeacher = selectedTeacher || teachers[0] || null;

  return (
    <div className="min-h-screen bg-[#fbf9f8] text-[#1b1c1c] font-sans selection:bg-[#fed65b]/40 selection:text-[#180331]">
      {/* Top Main Navigation Bar */}
      <Navbar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
      />

      {/* Screen Routing */}
      {currentScreen === 'home' && (
        <HomeScreen
          settings={siteSettings}
          onNavigate={setCurrentScreen}
        />
      )}

      {currentScreen === 'departments' && (
        <DepartmentSelectScreen
          departments={departments}
          teachers={teachers}
          onSelectDepartment={handleSelectDepartment}
          onSelectTeacher={handleSelectTeacher}
          onNavigate={setCurrentScreen}
        />
      )}

      {currentScreen === 'department-teachers' && (
        activeDept ? (
          <DepartmentFacultyScreen
            department={activeDept}
            teachers={teachers}
            allDepartments={departments}
            onSelectDepartment={handleSelectDepartment}
            onSelectTeacher={handleSelectTeacher}
            onNavigate={setCurrentScreen}
            onOpenRSVP={handleOpenRSVP}
          />
        ) : (
          <SkeletonLoader screen="department-teachers" />
        )
      )}

      {currentScreen === 'teacher' && (
        activeTeacher ? (
          <TeacherProfileScreen
            teacher={activeTeacher}
            allTeachers={teachers}
            eventInfo={eventInfo}
            settings={siteSettings}
            onNavigate={setCurrentScreen}
            onSelectTeacher={handleSelectTeacher}
            onOpenRSVP={handleOpenRSVP}
            onBackToDepartment={() => {
              const parentDept = departments.find(
                (d) => d.id.toLowerCase() === activeTeacher.departmentId.toLowerCase()
              );
              if (parentDept) setSelectedDepartment(parentDept);
              setCurrentScreen('department-teachers');
            }}
          />
        ) : (
          <SkeletonLoader screen="teacher" />
        )
      )}

      {currentScreen === 'gallery' && (
        <GalleryScreen
          galleryItems={galleryItems}
          onAddMemory={handleAddGallery}
          onNavigate={setCurrentScreen}
        />
      )}

      {currentScreen === 'admin' && (
        <AdminPortal
          teachers={teachers}
          departments={departments}
          galleryItems={galleryItems}
          rsvps={rsvps}
          settings={siteSettings}
          eventInfo={eventInfo}
          onNavigateHome={() => setCurrentScreen('home')}
          onAddTeacher={handleAddTeacher}
          onUpdateTeacher={handleUpdateTeacher}
          onDeleteTeacher={handleDeleteTeacher}
          onAddDepartment={handleAddDepartment}
          onUpdateDepartment={handleUpdateDepartment}
          onDeleteDepartment={handleDeleteDepartment}
          onAddGallery={handleAddGallery}
          onUpdateGallery={handleUpdateGallery}
          onDeleteGallery={handleDeleteGallery}
          onUpdateSettings={handleUpdateSiteSettings}
          onUpdateEvent={handleUpdateEvent}
          onViewTeacher={(t) => handleSelectTeacher(t)}
        />
      )}

      {/* RSVP Confirmation Modal */}
      <RSVPModal
        isOpen={isRSVPModalOpen}
        onClose={() => setIsRSVPModalOpen(false)}
        selectedTeacher={rsvpTargetTeacher}
        allTeachers={teachers}
        departments={departments}
        eventInfo={eventInfo}
        onConfirmRSVP={handleConfirmRSVP}
      />
    </div>
  );
}

export default App;
