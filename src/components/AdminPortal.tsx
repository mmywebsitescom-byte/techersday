import React, { useState, useEffect, useRef } from 'react';

import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Image as ImageIcon,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Users,
  CalendarCheck,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Home,
  Palette,
  Sliders,
  Layers,
  Star,
  Trophy,
  Flame,
  Award,
  Heart,
  BookOpen,
  Shield,
  RotateCcw,
  Check,
  ExternalLink,
  ZoomIn,
  Calendar,
  Clock,
  MapPin,
  Link as LinkIcon,
  Download,
  FileImage,
  RefreshCw,
  Globe,
  FolderPlus,
  Gift,
} from 'lucide-react';
import {
  Teacher,
  Department,
  GalleryItem,
  RSVPRecord,
  SiteSettings,
  CelebrationEvent,
  CrestType,
  BadgeIconType,
  GalleryCategory,
} from '../types';
import {
  PRESET_BACKGROUND_IMAGES,
  PRESET_CREST_ICONS,
  INITIAL_SITE_SETTINGS,
  INITIAL_EVENT,
  DEFAULT_GIFT_IMAGES,
} from '../data/initialData';
import { CrestRenderer } from './CrestRenderer';
import { downloadImageFile } from '../utils/downloadUtils';

interface AdminPortalProps {
  teachers: Teacher[];
  departments: Department[];
  galleryItems: GalleryItem[];
  rsvps: RSVPRecord[];
  settings: SiteSettings;
  eventInfo?: CelebrationEvent;
  onNavigateHome: () => void;
  onAddTeacher: (teacher: Omit<Teacher, 'id' | 'dateAdded'>) => Promise<void>;
  onUpdateTeacher: (id: string, teacher: Partial<Teacher>) => Promise<void>;
  onDeleteTeacher: (id: string) => Promise<void>;
  onAddDepartment?: (dept: Omit<Department, 'teacherCount'>) => Promise<void>;
  onUpdateDepartment?: (id: string, dept: Partial<Department>) => Promise<void>;
  onDeleteDepartment?: (id: string) => Promise<void>;
  onAddGallery: (item: Omit<GalleryItem, 'id'>) => Promise<void>;
  onUpdateGallery?: (id: string, item: Partial<GalleryItem>) => Promise<void>;
  onDeleteGallery?: (id: string) => Promise<void>;
  onUpdateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  onUpdateEvent?: (event: Partial<CelebrationEvent>) => Promise<void>;
  onViewTeacher?: (teacher: Teacher) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  teachers,
  departments,
  galleryItems,
  rsvps,
  settings,
  eventInfo,
  onNavigateHome,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onAddGallery,
  onUpdateGallery,
  onDeleteGallery,
  onUpdateSettings,
  onUpdateEvent,
  onViewTeacher,
}) => {
  // Auth state - check sessionStorage for existing session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('adminToken') !== null;
  });
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Admin View
  const [activeTab, setActiveTab] = useState<
    'invitation' | 'appearance' | 'gallery' | 'teachers' | 'departments' | 'rsvps' | 'dashboard' | 'settings' | 'gifts'
  >('invitation');

  // Teacher Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Drawer State for Teachers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  // Form Fields for Add/Edit Teacher
  const [formName, setFormName] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formDeptId, setFormDeptId] = useState(departments[0]?.id || 'sh');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formQuote, setFormQuote] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formOffice, setFormOffice] = useState('');
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [formSubjects, setFormSubjects] = useState<string[]>([]);
  const [formGiftImages, setFormGiftImages] = useState<string[]>([]);
  const [giftImageUrlInput, setGiftImageUrlInput] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Drawer State for Departments (Add, Edit, Update)
  const [isDeptDrawerOpen, setIsDeptDrawerOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptFormName, setDeptFormName] = useState('');
  const [deptFormCode, setDeptFormCode] = useState('');
  const [deptFormHOD, setDeptFormHOD] = useState('');
  const [deptFormDescription, setDeptFormDescription] = useState('');
  const [deptFormError, setDeptFormError] = useState('');
  const [isDeptSubmitting, setIsDeptSubmitting] = useState(false);
  const [deptSearchQuery, setDeptSearchQuery] = useState('');

  // Appearance Settings State
  const [localSettings, setLocalSettings] = useState<SiteSettings>({ ...settings });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [appearanceSubTab, setAppearanceSubTab] = useState<'icon' | 'favicon' | 'background' | 'content' | 'buttons'>('icon');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Gallery Management State
  const [gallerySearchQuery, setGallerySearchQuery] = useState('');
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<GalleryCategory>('All');
  const [isGalleryDrawerOpen, setIsGalleryDrawerOpen] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryFormTitle, setGalleryFormTitle] = useState('');
  const [galleryFormCategory, setGalleryFormCategory] = useState<'Events' | 'Classroom' | 'Faculty' | 'Celebrations'>('Events');
  const [galleryFormImageUrl, setGalleryFormImageUrl] = useState('');
  const [galleryFormDate, setGalleryFormDate] = useState('');
  const [galleryFormDescription, setGalleryFormDescription] = useState('');
  const [galleryFormError, setGalleryFormError] = useState('');
  const [isGallerySubmitting, setIsGallerySubmitting] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [imageLoadStatus, setImageLoadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // File Inputs
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);
  const teacherFileInputRef = useRef<HTMLInputElement | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const wallpaperFileInputRef = useRef<HTMLInputElement | null>(null);
  const faviconFileInputRef = useRef<HTMLInputElement | null>(null);
  const giftFileInputRef = useRef<HTMLInputElement | null>(null);

  // Event & Invitation Settings State
  const [localEvent, setLocalEvent] = useState<CelebrationEvent>(() => eventInfo || INITIAL_EVENT);
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [copiedTeacherId, setCopiedTeacherId] = useState<string | null>(null);

  // Sync localEvent if props change
  useEffect(() => {
    if (eventInfo) {
      setLocalEvent({ ...eventInfo });
    }
  }, [eventInfo]);

  const handleSaveEventDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingEvent(true);
    try {
      if (onUpdateEvent) {
        await onUpdateEvent(localEvent);
      }
      setNotification('Ceremony invitation card settings saved to Supabase! ✨');
    } catch (err) {
      setNotification('Failed to save invitation settings. Please try again.');
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleCopyTeacherUrl = async (teacher: Teacher, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/teacher/${teacher.id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedTeacherId(teacher.id);
      setNotification(`Copied personal URL for ${teacher.name}! 🔗`);
      setTimeout(() => setCopiedTeacherId(null), 3000);
    } catch (err) {
      setNotification('Failed to copy URL to clipboard');
    }
  };

  // Sync localSettings if props change
  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  // Preset teacher photos for quick selection in drawer
  const presetPhotos = [
    { label: 'Dr. Kumar', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZGR6k2nBnEZdIcueoK1e_Slm5OrO2TuJ5GWsTHfdyg3Ke4_Eydq0qEecoesAI0r_k5Cyuc_-CNoQ7_CRj1rJvSQV6yVSNySX8wY8xdsyRlqDyK01Iub1rJ6xJJjmqfi36nhDhGv3bow33gLNvAXN7LhLk6hJjtJ72UUujSkoO-NJ4Kz6xwgTK3jVoKndihuOaUWDeSFrbPFyQjXZPek9k0nK6UR7FawCjYJM7tnUANv-nyS6AM27X' },
    { label: 'Dr. Hughes', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATf4X5MCUaqNy5M9FBmeJdOz8Wy8SjR2Yj7MRph9l5Ctr9ljkjck4YdQos0KrjsjH69t9qUlHeEhmq5eI20CA-7rUEg0mT7ishQqt1t9Cowk3NEPqJHLiXVcE1d9dxNvZLeYOLYigiNEgwakmy1NTzTBW6lKMwboG4fJadAHnzX-OqT67kxQDXoa4iaIslTJpu92sWy5YJ9cUVRTkBfbL63WF5qrnAQr29iykvnWP1cc_1OWeM4ySz' },
    { label: 'Dr. Chen', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-9ppe6mKxy_nliVr_15xb-1Coh5Y-Sq2T1a8M3oWChkPfLMrZkPrCW9VWP4tc8Czu4kfo_y86KcdBTcKCEiWhMgGTtSVILr9zCMWNio1Y1dlFntKjMTe8tyOcAwNkl28avODcs1DxKVXpoHk_KZCZVA7PrKqWnANfXKY_Hwv0WG66mg5VST2wT8bnm5bxNJFlgzW3YKkO05aL1zulw93w-aLMVjS_N8vf2e_egUSMrMJM8J7lVhqx' },
    { label: 'Prof. Jenkins', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80' },
    { label: 'Prof. Miller', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80' },
    { label: 'Dr. Sen', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80' },
    { label: 'Prof. Thorne', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80' },
  ];

  // Preset Custom Crest/Logo Icons
  const presetCrestLogos = [
    { label: 'Academic Seal', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&auto=format&fit=crop&q=80' },
    { label: 'Golden Shield', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80' },
    { label: 'Scholar Torch', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80' },
    { label: 'Campus Belltower', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&auto=format&fit=crop&q=80' },
  ];

  // Preset Browser Tab Icons (Favicons)
  const presetFavicons = [
    { label: 'Academic Seal', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=64&auto=format&fit=crop&q=80', emoji: '🏛️' },
    { label: 'Golden Shield', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=64&auto=format&fit=crop&q=80', emoji: '🛡️' },
    { label: 'Scholar Torch', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=64&auto=format&fit=crop&q=80', emoji: '🔥' },
    { label: 'Graduation Cap', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=64&auto=format&fit=crop&q=80', emoji: '🎓' },
    { label: 'Golden Star', url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=64&auto=format&fit=crop&q=80', emoji: '⭐' },
    { label: 'Wisdom Book', url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=64&auto=format&fit=crop&q=80', emoji: '📖' },
  ];

  // Preset Gallery Photos
  const presetGalleryPhotos = [
    { label: 'Annual Teachers Gala', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80', category: 'Celebrations' as const },
    { label: 'Faculty Academic Council', url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80', category: 'Faculty' as const },
    { label: 'Auditorium Keynote', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80', category: 'Events' as const },
    { label: 'Physics Laboratory Class', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80', category: 'Classroom' as const },
    { label: 'Excellence in Teaching Award', url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&auto=format&fit=crop&q=80', category: 'Celebrations' as const },
    { label: 'Campus Golden Quad', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80', category: 'Events' as const },
  ];

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setIsLoggingIn(true);
    setAuthError('');
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    // Direct Instant Verification for techersday2062@gmail.com / Techers@2062
    if (cleanEmail === 'techersday2062@gmail.com' && cleanPassword === 'Techers@2062') {
      const token = `admin-token-${Date.now()}`;
      sessionStorage.setItem('adminToken', token);
      setIsAuthenticated(true);
      setNotification('Welcome back, Administrator!');
      setIsLoggingIn(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        sessionStorage.setItem('adminToken', data.token || `admin-${Date.now()}`);
        setIsAuthenticated(true);
        setNotification(`Welcome back, ${data.user?.name || 'Administrator'}!`);
      } else {
        setAuthError(data.error || 'Incorrect email or password. Please try again.');
      }
    } catch (err: any) {
      setAuthError('Incorrect email or password. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };


  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setEmailInput('');
    setPasswordInput('');
    setNotification('Logged out successfully.');
  };

  const handleSaveAppearance = async () => {
    setIsSavingSettings(true);
    try {
      await onUpdateSettings(localSettings);
      setNotification('Home Page Appearance, Logo, and Theme saved successfully!');
    } catch (err) {
      setNotification('Failed to save appearance settings.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleResetAppearance = () => {
    setLocalSettings({ ...INITIAL_SITE_SETTINGS });
    setNotification('Appearance reset to factory defaults.');
  };

  // Quick theme applicator
  const applyThemePreset = (theme: 'classic' | 'midnight' | 'library' | 'golden') => {
    switch (theme) {
      case 'classic':
        setLocalSettings((prev) => ({
          ...prev,
          crestType: 'default-crest',
          badgeIcon: 'sparkles',
          crestBorderGlow: 'gold',
          bgGradientStyle: 'subtle-purple',
          bgOverlayColor: '#fbf9f8',
          bgOverlayOpacity: 20,
          bgImageOpacity: 85,
          bgBlur: 0,
        }));
        break;
      case 'midnight':
        setLocalSettings((prev) => ({
          ...prev,
          crestType: 'golden-trophy',
          badgeIcon: 'star',
          crestBorderGlow: 'purple',
          bgGradientStyle: 'dark-luxury',
          bgOverlayColor: '#180331',
          bgOverlayOpacity: 65,
          bgImageOpacity: 70,
          bgBlur: 3,
          bgImageUrl: PRESET_BACKGROUND_IMAGES[2].url,
        }));
        break;
      case 'library':
        setLocalSettings((prev) => ({
          ...prev,
          crestType: 'book-open',
          badgeIcon: 'award',
          crestBorderGlow: 'gold',
          bgGradientStyle: 'golden-warmth',
          bgOverlayColor: '#f3eee8',
          bgOverlayOpacity: 30,
          bgImageOpacity: 75,
          bgBlur: 1,
          bgImageUrl: PRESET_BACKGROUND_IMAGES[0].url,
        }));
        break;
      case 'golden':
        setLocalSettings((prev) => ({
          ...prev,
          crestType: 'torch-of-wisdom',
          badgeIcon: 'flame',
          crestBorderGlow: 'gold',
          bgGradientStyle: 'golden-warmth',
          bgOverlayColor: '#fff8e7',
          bgOverlayOpacity: 25,
          bgImageOpacity: 80,
          bgBlur: 0,
          bgImageUrl: PRESET_BACKGROUND_IMAGES[2].url,
        }));
        break;
    }
    setNotification(`Theme preset loaded! Click "Save All Changes" to publish.`);
  };

  // Department Handlers (Add, Edit, Delete)
  const openAddDeptDrawer = () => {
    setEditingDeptId(null);
    setDeptFormName('');
    setDeptFormCode('');
    setDeptFormHOD('');
    setDeptFormDescription('');
    setDeptFormError('');
    setIsDeptDrawerOpen(true);
  };

  const openEditDeptDrawer = (dept: Department) => {
    setEditingDeptId(dept.id);
    setDeptFormName(dept.name);
    setDeptFormCode(dept.code);
    setDeptFormHOD(dept.headOfDepartment);
    setDeptFormDescription(dept.description);
    setDeptFormError('');
    setIsDeptDrawerOpen(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptFormName.trim() || !deptFormCode.trim()) {
      setDeptFormError('Please provide department name and code.');
      return;
    }

    setIsDeptSubmitting(true);
    setDeptFormError('');

    try {
      if (editingDeptId) {
        if (onUpdateDepartment) {
          await onUpdateDepartment(editingDeptId, {
            name: deptFormName,
            code: deptFormCode.toUpperCase(),
            headOfDepartment: deptFormHOD || 'To be appointed',
            description: deptFormDescription,
          });
          setNotification(`Updated Department: ${deptFormName}`);
        }
      } else {
        if (onAddDepartment) {
          const generatedId = deptFormCode.toLowerCase().replace(/[^a-z0-9]/g, '') || `dept-${Date.now()}`;
          await onAddDepartment({
            id: generatedId,
            name: deptFormName,
            code: deptFormCode.toUpperCase(),
            headOfDepartment: deptFormHOD || 'To be appointed',
            description: deptFormDescription || `Department of ${deptFormName} at Excellence Institute of Technology.`,
          });
          setNotification(`Created New Department: ${deptFormName}`);
        }
      }
      setIsDeptDrawerOpen(false);
    } catch (err) {
      setDeptFormError('Failed to save department. Please try again.');
    } finally {
      setIsDeptSubmitting(false);
    }
  };

  const handleDeleteDeptClick = async (dept: Department) => {
    const facultyCount = teachers.filter((t) => t.departmentId === dept.id).length;
    const confirmMsg = facultyCount > 0
      ? `This department currently has ${facultyCount} faculty member(s). Are you sure you want to delete ${dept.name}?`
      : `Are you sure you want to delete ${dept.name}?`;

    if (window.confirm(confirmMsg)) {
      if (onDeleteDepartment) {
        await onDeleteDepartment(dept.id);
        setNotification(`Deleted department "${dept.name}"`);
      }
    }
  };

  // Gallery CRUD Handlers
  const openAddGalleryDrawer = () => {
    setEditingGalleryId(null);
    setGalleryFormTitle('');
    setGalleryFormCategory('Events');
    setGalleryFormImageUrl(presetGalleryPhotos[0].url);
    setGalleryFormDate(new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    setGalleryFormDescription('');
    setGalleryFormError('');
    setImageLoadStatus('success');
    setIsGalleryDrawerOpen(true);
  };

  const openEditGalleryDrawer = (item: GalleryItem) => {
    setEditingGalleryId(item.id);
    setGalleryFormTitle(item.title);
    setGalleryFormCategory(item.category);
    setGalleryFormImageUrl(item.imageUrl);
    setGalleryFormDate(item.date);
    setGalleryFormDescription(item.description || '');
    setGalleryFormError('');
    setImageLoadStatus('success');
    setIsGalleryDrawerOpen(true);
  };

  const handleTestPreviewImage = () => {
    if (!galleryFormImageUrl.trim()) {
      setImageLoadStatus('error');
      setGalleryFormError('Please enter a valid image URL to preview.');
      return;
    }
    setImageLoadStatus('loading');
    const img = new Image();
    img.onload = () => {
      setImageLoadStatus('success');
      setGalleryFormError('');
      setNotification('Image loaded and verified successfully!');
    };
    img.onerror = () => {
      setImageLoadStatus('error');
      setGalleryFormError('Could not load image from this URL. Please check the link or use another photo.');
    };
    img.src = galleryFormImageUrl;
  };

  // Automatic Image Compressor to ensure Supabase 1MB payload size safety
  const compressImage = (file: File, maxWidth = 1280, maxHeight = 900, quality = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'gallery' | 'teacher' | 'logo' | 'wallpaper' | 'favicon' | 'gift'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setNotification(`Optimizing and uploading "${file.name}"...`);
      const isFavicon = target === 'favicon' || target === 'logo';
      const compressed = await compressImage(
        file,
        isFavicon ? 256 : 1280,
        isFavicon ? 256 : 900,
        isFavicon ? 0.9 : 0.8
      );

      if (!compressed) {
        setNotification('Could not read image file. Please try another image.');
        return;
      }

      if (target === 'gallery') {
        setGalleryFormImageUrl(compressed);
        setImageLoadStatus('success');
        if (!galleryFormTitle) setGalleryFormTitle(file.name.replace(/\.[^/.]+$/, ''));
        setNotification(`Photo "${file.name}" optimized and ready! Click "Save" in the drawer.`);
      } else if (target === 'teacher') {
        setFormPhotoUrl(compressed);
        setNotification(`Profile photo "${file.name}" optimized and loaded!`);
      } else if (target === 'gift') {
        setFormGiftImages((prev) => [...prev, compressed]);
        setNotification(`Gift page uploaded and added! 🎁`);
      } else if (target === 'logo') {
        const updated = {
          ...localSettings,
          crestType: 'custom-image' as const,
          customCrestImageUrl: compressed,
        };
        setLocalSettings(updated);
        onUpdateSettings(updated);
        setNotification(`Custom Home Page Logo updated and saved to Supabase! ✨`);
      } else if (target === 'wallpaper') {
        const updated = {
          ...localSettings,
          bgImageUrl: compressed,
          backgroundMode: 'image' as const,
        };
        setLocalSettings(updated);
        onUpdateSettings(updated);
        setNotification(`Wallpaper updated and saved to Supabase! ✨`);
      } else if (target === 'favicon') {
        const updated = {
          ...localSettings,
          faviconUrl: compressed,
        };
        setLocalSettings(updated);
        onUpdateSettings(updated);
        setNotification(`Browser Tab Icon updated and saved! ✨`);
      }
    }
  };

  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryFormTitle.trim() || !galleryFormImageUrl.trim()) {
      setGalleryFormError('Please provide both memory title and photo URL.');
      return;
    }

    setIsGallerySubmitting(true);
    setGalleryFormError('');

    try {
      if (editingGalleryId) {
        if (onUpdateGallery) {
          await onUpdateGallery(editingGalleryId, {
            title: galleryFormTitle,
            category: galleryFormCategory,
            imageUrl: galleryFormImageUrl,
            date: galleryFormDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            description: galleryFormDescription,
          });
          setNotification(`Updated gallery memory "${galleryFormTitle}"`);
        }
      } else {
        await onAddGallery({
          title: galleryFormTitle,
          category: galleryFormCategory,
          imageUrl: galleryFormImageUrl,
          date: galleryFormDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          description: galleryFormDescription,
        });
        setNotification(`Added "${galleryFormTitle}" to celebration gallery!`);
      }
      setIsGalleryDrawerOpen(false);
    } catch (err) {
      setGalleryFormError('Failed to save memory. Please try again.');
    } finally {
      setIsGallerySubmitting(false);
    }
  };

  const handleDeleteGalleryClick = async (item: GalleryItem) => {
    if (window.confirm(`Are you sure you want to delete "${item.title}" from the gallery?`)) {
      if (onDeleteGallery) {
        await onDeleteGallery(item.id);
        setNotification(`Deleted "${item.title}" from gallery`);
      }
    }
  };

  const handleDownloadPhoto = async (item: GalleryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotification(`Downloading "${item.title}"...`);
    const success = await downloadImageFile(item.imageUrl, `${item.title}.jpg`);
    if (success) {
      setNotification(`Downloaded "${item.title}" successfully!`);
    }
  };

  // Filtered Gallery Items
  const filteredGallery = galleryItems.filter((item) => {
    const matchesCategory =
      galleryCategoryFilter === 'All' ||
      item.category.toLowerCase() === galleryCategoryFilter.toLowerCase();

    const matchesSearch =
      item.title.toLowerCase().includes(gallerySearchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(gallerySearchQuery.toLowerCase())) ||
      item.category.toLowerCase().includes(gallerySearchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Filtered Departments
  const filteredDepartments = (departments || []).filter((dept) => {
    const q = (deptSearchQuery || '').toLowerCase();
    return (
      (dept.name || '').toLowerCase().includes(q) ||
      (dept.code || '').toLowerCase().includes(q) ||
      (dept.headOfDepartment || '').toLowerCase().includes(q) ||
      (dept.description || '').toLowerCase().includes(q)
    );
  });

  // Teacher Drawer Handlers
  const openAddDrawer = () => {
    setEditingTeacherId(null);
    setFormName('');
    setFormDesignation('');
    setFormDeptId(departments[0]?.id || 'sh');
    setFormPhotoUrl(presetPhotos[0].url);
    setFormQuote('Dedicated to shaping tomorrow’s innovators with wisdom, patience, and scholarly devotion.');
    setFormBio('');
    setFormEmail('');
    setFormOffice('');
    setFormSubjects(['Physics', 'Thermodynamics']);
    setFormGiftImages([]);
    setGiftImageUrlInput('');
    setFormError('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (teacher: Teacher) => {
    setEditingTeacherId(teacher.id);
    setFormName(teacher.name);
    setFormDesignation(teacher.designation);
    setFormDeptId(teacher.departmentId);
    setFormPhotoUrl(teacher.photoUrl);
    setFormQuote(teacher.appreciationQuote);
    setFormBio(teacher.bio || '');
    setFormEmail(teacher.email || '');
    setFormOffice(teacher.officeLocation || '');
    setFormSubjects([...teacher.subjects]);
    setFormGiftImages(teacher.giftImages ? [...teacher.giftImages] : []);
    setGiftImageUrlInput('');
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleAddSubjectTag = () => {
    if (currentTagInput.trim()) {
      if (!formSubjects.includes(currentTagInput.trim())) {
        setFormSubjects([...formSubjects, currentTagInput.trim()]);
      }
      setCurrentTagInput('');
    }
  };

  const handleRemoveSubjectTag = (tagToRemove: string) => {
    setFormSubjects(formSubjects.filter((s) => s !== tagToRemove));
  };

  const handleAddGiftImageUrl = () => {
    if (giftImageUrlInput.trim()) {
      setFormGiftImages([...formGiftImages, giftImageUrlInput.trim()]);
      setGiftImageUrlInput('');
    }
  };

  const handleRemoveGiftImage = (indexToRemove: number) => {
    setFormGiftImages(formGiftImages.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDesignation.trim()) {
      setFormError('Please provide teacher name and designation.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const selectedDept = departments.find((d) => d.id === formDeptId);
      const deptName = selectedDept ? selectedDept.name : 'Science & Humanities';

      if (editingTeacherId) {
        await onUpdateTeacher(editingTeacherId, {
          name: formName,
          designation: formDesignation,
          departmentId: formDeptId,
          departmentName: deptName,
          photoUrl: formPhotoUrl || presetPhotos[0].url,
          appreciationQuote: formQuote,
          bio: formBio,
          email: formEmail,
          officeLocation: formOffice,
          subjects: formSubjects,
          giftImages: formGiftImages,
        });
        setNotification(`Updated profile & gift collection for ${formName}`);
      } else {
        await onAddTeacher({
          name: formName,
          designation: formDesignation,
          departmentId: formDeptId,
          departmentName: deptName,
          photoUrl: formPhotoUrl || presetPhotos[0].url,
          appreciationQuote: formQuote,
          bio: formBio,
          email: formEmail,
          officeLocation: formOffice,
          subjects: formSubjects,
          giftImages: formGiftImages,
        });
        setNotification(`Added ${formName} with gift collection to Teachers' Day portal`);
      }
      setIsDrawerOpen(false);
    } catch (err) {
      setFormError('An error occurred while saving. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (teacher: Teacher) => {
    if (window.confirm(`Are you sure you want to remove ${teacher.name} from the celebration directory?`)) {
      await onDeleteTeacher(teacher.id);
      setNotification(`Removed ${teacher.name}`);
    }
  };

  // Filter & Pagination for teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDeptFilter === 'all' || t.departmentId.toLowerCase() === selectedDeptFilter.toLowerCase();

    return matchesSearch && matchesDept;
  });

  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage) || 1;
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Gradient styles map for preview
  const gradientStyles: Record<string, string> = {
    'subtle-purple': 'radial-gradient(circle at 50% 35%, rgba(238, 219, 255, 0.35) 0%, rgba(238, 219, 255, 0.05) 50%, transparent 75%)',
    'golden-warmth': 'radial-gradient(circle at 50% 35%, rgba(254, 214, 91, 0.30) 0%, rgba(254, 214, 91, 0.05) 50%, transparent 75%)',
    'regal-twilight': 'radial-gradient(circle at 50% 30%, rgba(103, 80, 164, 0.35) 0%, rgba(24, 3, 49, 0.15) 55%, transparent 85%)',
    'classic-cream': 'linear-gradient(180deg, rgba(251, 249, 248, 0.2) 0%, rgba(243, 238, 232, 0.1) 100%)',
    'dark-luxury': 'radial-gradient(circle at 50% 40%, rgba(35, 8, 62, 0.70) 0%, rgba(15, 2, 30, 0.85) 85%)',
    'none': 'none',
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fbf9f8] flex items-center justify-center p-6 selection:bg-[#fed65b]/40 selection:text-[#180331]">
        <div className="bg-[#ffffff] max-w-md w-full rounded-3xl border border-[#ccc4cf]/40 shadow-2xl p-8 md:p-10 animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#180331] text-[#ffe088] rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg border border-[#ffe088]/30">
              <Lock size={28} />
            </div>
            <h1 className="font-playfair text-2xl md:text-3xl font-bold text-[#180331]">Admin Control Panel</h1>
            <p className="text-xs text-[#7b757f] mt-1.5 leading-relaxed">
              Sign in with your administrator credentials to manage faculty, departments, home logo &amp; theme, and gallery memories.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2 animate-shake">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@techxeraday.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-4 py-3 text-xs text-[#180331] focus:border-[#180331] focus:bg-[#ffffff] outline-none transition-all"
                  required
                />
                <Mail size={16} className="absolute right-3.5 top-3.5 text-[#7b757f]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-4 py-3 text-xs text-[#180331] focus:border-[#180331] focus:bg-[#ffffff] outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#7b757f] hover:text-[#180331] cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>


            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full btn-primary py-3.5 rounded-xl font-inter text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg mt-2 cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Secure Sign In</span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#ccc4cf]/30 text-center">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-xs font-inter font-semibold text-[#4a454e] hover:text-[#180331] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              Back to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf9f8] text-[#1b1c1c] flex">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-[#180331] text-[#ffe088] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up border border-[#ffe088]/30">
          <CheckCircle size={18} />
          <span className="text-xs font-medium">{notification}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <aside className="w-64 bg-[#ffffff] border-r border-[#ccc4cf]/40 flex flex-col justify-between p-5 shrink-0 hidden md:flex">
        <div>
          {/* Admin User Header */}
          <div className="flex items-center gap-3.5 pb-6 border-b border-[#efeded] mb-6">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHU7U1ZPrf90HugXxMCfhHfgEruSW1UzJq7mELkoGbEwA89fAo7Er9qxCl_8y7crFHvsQoToF7aVkGCphxMA6DtOmB_i7pCk2tPNukmqHydsEm5cTNfiBGBx4ICei7PMtRPKnenqdNQ4HX_9_WslFNvneUW1KnnSIMNFqldLE2b4IoGi8MKiNzxBzpei6dgJbNDoKhClEtu_iZM4__7jAcsxFa778ow1aW6HeS_qj7ErPQTCkg09hX"
              alt="Admin"
              className="w-11 h-11 rounded-full object-cover border border-[#ffe088] shadow-xs"
            />
            <div>
              <h2 className="font-inter text-sm font-semibold text-[#180331]">Admin Control</h2>
              <p className="text-[11px] text-[#7b757f]">Super Administrator</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('invitation')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'invitation'
                  ? 'bg-[#180331] text-[#ffffff] font-semibold shadow-xs'
                  : 'text-[#4a454e] hover:bg-[#f5f3f3] hover:text-[#180331]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar size={18} className={activeTab === 'invitation' ? 'text-[#ffe088]' : 'text-[#735c00]'} />
                <span>Invitation &amp; Event</span>
              </div>
              <span className="bg-[#fed65b] text-[#180331] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                Card
              </span>
            </button>

            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'appearance'
                  ? 'bg-[#180331] text-[#ffffff] font-semibold shadow-xs'
                  : 'text-[#4a454e] hover:bg-[#f5f3f3] hover:text-[#180331]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Palette size={18} />
                <span>Home &amp; Logo</span>
              </div>
              <span className="bg-[#efeded] text-[#180331] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                Theme
              </span>
            </button>

            <button
              onClick={() => setActiveTab('departments')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'departments'
                  ? 'bg-[#180331] text-[#ffffff] font-semibold shadow-xs'
                  : 'text-[#4a454e] hover:bg-[#f5f3f3] hover:text-[#180331]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 size={18} />
                <span>Departments</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#efeded] text-[#180331]">
                {departments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('teachers')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'teachers'
                  ? 'bg-[#180331] text-[#ffffff] font-semibold shadow-xs'
                  : 'text-[#4a454e] hover:bg-[#f5f3f3] hover:text-[#180331]'
              }`}
            >
              <div className="flex items-center gap-3">
                <GraduationCap size={18} />
                <span>Teachers</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#efeded] text-[#180331]">
                {teachers.length}
              </span>
            </button>

            {/* 🎁 Global Gifts & Reveal Schedule Tab */}
            <button
              onClick={() => setActiveTab('gifts')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'gifts'
                  ? 'bg-[#180331] text-[#ffffff] font-semibold shadow-xs'
                  : 'text-[#4a454e] hover:bg-[#f5f3f3] hover:text-[#180331]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Gift size={18} className={activeTab === 'gifts' ? 'text-[#ffe088]' : 'text-[#9a4b00]'} />
                <span>Gifts &amp; Countdown</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fed65b]/30 text-[#9a4b00]">
                {(localSettings.giftImages || DEFAULT_GIFT_IMAGES).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-[#180331] text-[#ffffff] font-semibold shadow-xs'
                  : 'text-[#4a454e] hover:bg-[#f5f3f3] hover:text-[#180331]'
              }`}
            >
              <div className="flex items-center gap-3">
                <ImageIcon size={18} />
                <span>Gallery &amp; Photos</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#efeded] text-[#180331]">
                {galleryItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rsvps')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'rsvps'
                  ? 'bg-[#180331] text-[#ffffff] font-semibold'
                  : 'text-[#4a454e] hover:bg-[#f5f3f3] hover:text-[#180331]'
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarCheck size={18} />
                <span>Ceremony RSVPs</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#efeded] text-[#180331]">
                {rsvps.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#180331] text-[#ffffff] font-semibold'
                  : 'text-[#4a454e] hover:bg-[#f5f3f3] hover:text-[#180331]'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Overview Stats</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#180331] text-[#ffffff] font-semibold'
                  : 'text-[#4a454e] hover:bg-[#f5f3f3] hover:text-[#180331]'
              }`}
            >
              <Settings size={18} />
              <span>System Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="pt-6 border-t border-[#efeded] space-y-2">
          <button
            onClick={onNavigateHome}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#180331] bg-[#efeded]/60 hover:bg-[#efeded] transition-colors cursor-pointer"
          >
            <Home size={16} />
            <span>Go to Public Website</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        {/* Mobile Header Bar */}
        <header className="md:hidden bg-[#ffffff] border-b border-[#ccc4cf]/40 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-playfair font-bold text-[#180331]">Admin Control</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateHome}
              className="text-xs px-3 py-1.5 bg-[#efeded] text-[#180331] rounded-lg font-medium"
            >
              View Site
            </button>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="text-xs bg-[#fbf9f8] border border-[#ccc4cf] rounded-lg px-2 py-1.5"
            >
              <option value="invitation">Invitation &amp; Event</option>
              <option value="appearance">Home &amp; Logo</option>
              <option value="departments">Departments</option>
              <option value="teachers">Teachers</option>
              <option value="gifts">Gifts &amp; Countdown</option>
              <option value="gallery">Gallery</option>
              <option value="rsvps">RSVPs</option>
              <option value="dashboard">Dashboard</option>
              <option value="settings">Settings</option>
            </select>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* TAB 0: INVITATION CARD & CEREMONY EVENT MANAGEMENT                        */}
        {/* ========================================================================= */}
        {activeTab === 'invitation' && (
          <div className="p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8 animate-fade-in-up">
            {/* Header with Quick Save */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#efeded]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#180331]">
                    Celebration Invitation Card
                  </h1>
                  <span className="bg-[#fed65b] text-[#180331] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#ffe088]/40">
                    Live Reactive
                  </span>
                </div>
                <p className="text-xs text-[#7b757f] mt-1">
                  Customize the official celebration date, time, auditorium venue, invitation title, and RSVP details shown on every teacher's profile card.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLocalEvent({ ...INITIAL_EVENT });
                    setNotification('Reset invitation card to default settings.');
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#ccc4cf] hover:border-[#180331] text-xs font-medium text-[#4a454e] hover:text-[#180331] transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleSaveEventDetails}
                  disabled={isSavingEvent}
                  className="btn-primary rounded-xl px-6 py-2.5 font-inter text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSavingEvent ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Save Invitation Details</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main 2-Column Editor Layout: Form on Left, Live Preview on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Controls (7 cols) */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-[#efeded] pb-3">
                    <h2 className="font-playfair text-lg font-bold text-[#180331]">
                      1. Invitation Header &amp; Titles
                    </h2>
                    <span className="text-[11px] text-[#7b757f]">Shown prominently on card</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#180331] mb-1.5">
                      Main Invitation Headline
                    </label>
                    <input
                      type="text"
                      value={localEvent.invitationHeading || ''}
                      placeholder="You are Specially Invited to the Teachers' Day Celebration 2026"
                      onChange={(e) => setLocalEvent({ ...localEvent, invitationHeading: e.target.value })}
                      className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-xs text-[#180331] outline-none focus:border-[#180331]"
                    />
                    <p className="text-[11px] text-[#7b757f] mt-1">
                      Tip: Use <code className="bg-[#efeded] px-1 py-0.5 rounded text-[10px] text-[#180331]">{"{teacherName}"}</code> to dynamically insert the teacher's name (e.g. <em>"Honoring {"{teacherName}"} at Teachers' Day 2026"</em>).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#180331] mb-1.5">
                      Event / Celebration Title
                    </label>
                    <input
                      type="text"
                      value={localEvent.title || ''}
                      placeholder="Teachers' Day Celebration 2026"
                      onChange={(e) => setLocalEvent({ ...localEvent, title: e.target.value })}
                      className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-xs text-[#180331] outline-none focus:border-[#180331]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#180331] mb-1.5">
                      Celebration Year
                    </label>
                    <input
                      type="text"
                      value={localEvent.year || ''}
                      placeholder="2026"
                      onChange={(e) => setLocalEvent({ ...localEvent, year: e.target.value })}
                      className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-xs text-[#180331] outline-none focus:border-[#180331]"
                    />
                  </div>
                </div>

                {/* 2. Date, Time & Venue Bento Boxes */}
                <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-[#efeded] pb-3">
                    <h2 className="font-playfair text-lg font-bold text-[#180331]">
                      2. Date, Time &amp; Location
                    </h2>
                    <span className="text-[11px] text-[#7b757f]">3 Bento Card Boxes</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#180331] mb-1.5 flex items-center gap-1.5">
                        <Calendar size={14} className="text-[#735c00]" />
                        <span>Date</span>
                      </label>
                      <input
                        type="text"
                        value={localEvent.date || ''}
                        placeholder="5 Sept 2026"
                        onChange={(e) => setLocalEvent({ ...localEvent, date: e.target.value })}
                        className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs text-[#180331] outline-none focus:border-[#180331]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#180331] mb-1.5 flex items-center gap-1.5">
                        <Clock size={14} className="text-[#735c00]" />
                        <span>Time</span>
                      </label>
                      <input
                        type="text"
                        value={localEvent.time || ''}
                        placeholder="10:00 AM"
                        onChange={(e) => setLocalEvent({ ...localEvent, time: e.target.value })}
                        className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs text-[#180331] outline-none focus:border-[#180331]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#180331] mb-1.5 flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#735c00]" />
                        <span>Venue</span>
                      </label>
                      <input
                        type="text"
                        value={localEvent.venue || ''}
                        placeholder="College Auditorium"
                        onChange={(e) => setLocalEvent({ ...localEvent, venue: e.target.value })}
                        className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs text-[#180331] outline-none focus:border-[#180331]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#180331] mb-1.5">
                      Invitation Subtitle Note / Special Message
                    </label>
                    <textarea
                      rows={2}
                      value={localEvent.invitationNote || ''}
                      placeholder="Join us in celebrating the faculty mentors who shape tomorrow's innovators."
                      onChange={(e) => setLocalEvent({ ...localEvent, invitationNote: e.target.value })}
                      className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl p-3 text-xs text-[#180331] outline-none focus:border-[#180331]"
                    />
                  </div>
                </div>

                {/* 3. RSVP Button & Theme */}
                <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-[#efeded] pb-3">
                    <h2 className="font-playfair text-lg font-bold text-[#180331]">
                      3. RSVP Button &amp; Card Theme
                    </h2>
                    <span className="text-[11px] text-[#7b757f]">Interactive styling</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#180331] mb-1.5">
                        RSVP Button Label
                      </label>
                      <input
                        type="text"
                        value={localEvent.rsvpButtonText || ''}
                        placeholder="RSVP CONFIRMATION"
                        onChange={(e) => setLocalEvent({ ...localEvent, rsvpButtonText: e.target.value })}
                        className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-xs text-[#180331] outline-none focus:border-[#180331]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#180331] mb-1.5">
                        Card Glow Theme
                      </label>
                      <select
                        value={localEvent.accentTheme || 'indigo-gold'}
                        onChange={(e) => setLocalEvent({ ...localEvent, accentTheme: e.target.value as any })}
                        className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-xs text-[#180331] outline-none cursor-pointer"
                      >
                        <option value="indigo-gold">Deep Indigo &amp; Warm Gold (Default Luxury)</option>
                        <option value="royal-burgundy">Royal Burgundy &amp; Rose Gold</option>
                        <option value="emerald-gold">Emerald Forest &amp; Golden Glow</option>
                        <option value="midnight-dark">Midnight Slate &amp; Electric Sky</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <h4 className="text-xs font-semibold text-[#180331]">Show RSVP Confirmation Button</h4>
                      <p className="text-[11px] text-[#7b757f]">Allows teachers and guests to submit their attendance online</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localEvent.showRsvpButton !== false}
                        onChange={(e) => setLocalEvent({ ...localEvent, showRsvpButton: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#180331]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Card Preview (5 cols) matching Screenshot */}
              <div className="lg:col-span-6 sticky top-6 space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#180331] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#735c00]" />
                    <span>Live Invitation Card Preview</span>
                  </span>
                  <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Updates Live
                  </span>
                </div>

                {/* Preview Wrapper */}
                {(() => {
                  const themeMap = {
                    'indigo-gold': { bg: 'bg-[#180331]', border: 'border-[#2e1a47]', text: 'text-[#eedbff]', accent: 'text-[#ffe088]', btnBg: 'bg-[#ffe088]', btnText: 'text-[#241a00]', glow: 'rgba(255, 224, 136, 0.14)' },
                    'royal-burgundy': { bg: 'bg-[#300714]', border: 'border-[#501026]', text: 'text-[#ffe4e6]', accent: 'text-[#fecdd3]', btnBg: 'bg-[#fecdd3]', btnText: 'text-[#4c0519]', glow: 'rgba(254, 205, 211, 0.16)' },
                    'emerald-gold': { bg: 'bg-[#052e16]', border: 'border-[#14532d]', text: 'text-[#dcfce7]', accent: 'text-[#86efac]', btnBg: 'bg-[#86efac]', btnText: 'text-[#022c22]', glow: 'rgba(134, 239, 172, 0.16)' },
                    'midnight-dark': { bg: 'bg-[#090d16]', border: 'border-[#1e293b]', text: 'text-[#e2e8f0]', accent: 'text-[#38bdf8]', btnBg: 'bg-[#38bdf8]', btnText: 'text-[#082f49]', glow: 'rgba(56, 189, 248, 0.16)' },
                  };
                  const activeThemeStyle = themeMap[localEvent.accentTheme || 'indigo-gold'] || themeMap['indigo-gold'];
                  const previewHeading = (localEvent.invitationHeading || `You are Specially Invited to the ${localEvent.title || "Teachers' Day Celebration 2026"}`)
                    .replace(/{teacherName}/g, teachers[0]?.name || 'Faculty Member');

                  return (
                    <div className={`w-full ${activeThemeStyle.bg} text-[#ffffff] rounded-2xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden border ${activeThemeStyle.border}`}>
                      {/* Subtle background radial glow */}
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
                        style={{
                          background: `radial-gradient(circle at 50% 0%, ${activeThemeStyle.glow}, transparent 70%)`
                        }}
                      />

                      <h3 className={`font-playfair text-xl sm:text-2xl font-bold mb-6 ${activeThemeStyle.text} tracking-tight relative z-10 leading-snug`}>
                        {previewHeading}
                      </h3>

                      {/* 3 Bento Date / Time / Venue Boxes */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 relative z-10">
                        <div className="flex flex-col items-center p-3.5 bg-[#ffffff]/10 backdrop-blur-xs rounded-xl border border-[#ffffff]/10">
                          <Calendar className={`w-6 h-6 mb-1.5 ${activeThemeStyle.accent}`} />
                          <p className="font-inter text-sm text-[#ccc4cf] uppercase tracking-wider text-[10px] mb-0.5">Date</p>
                          <p className="font-inter text-sm md:text-base font-semibold text-[#ffffff]">{localEvent.date || '5 Sept 2026'}</p>
                        </div>

                        <div className="flex flex-col items-center p-3.5 bg-[#ffffff]/10 backdrop-blur-xs rounded-xl border border-[#ffffff]/10">
                          <Clock className={`w-6 h-6 mb-1.5 ${activeThemeStyle.accent}`} />
                          <p className="font-inter text-sm text-[#ccc4cf] uppercase tracking-wider text-[10px] mb-0.5">Time</p>
                          <p className="font-inter text-sm md:text-base font-semibold text-[#ffffff]">{localEvent.time || '10:00 AM'}</p>
                        </div>

                        <div className="flex flex-col items-center p-3.5 bg-[#ffffff]/10 backdrop-blur-xs rounded-xl border border-[#ffffff]/10">
                          <MapPin className={`w-6 h-6 mb-1.5 ${activeThemeStyle.accent}`} />
                          <p className="font-inter text-sm text-[#ccc4cf] uppercase tracking-wider text-[10px] mb-0.5">Venue</p>
                          <p className="font-inter text-sm md:text-base font-semibold text-[#ffffff]">{localEvent.venue || 'College Auditorium'}</p>
                        </div>
                      </div>

                      {/* Event note if provided */}
                      {localEvent.invitationNote && (
                        <p className="text-[11px] text-[#ffffff]/80 max-w-md mx-auto mb-6 font-inter italic relative z-10">
                          "{localEvent.invitationNote}"
                        </p>
                      )}

                      {/* RSVP Button */}
                      {localEvent.showRsvpButton !== false && (
                        <div className="relative z-10 flex justify-center">
                          <button
                            type="button"
                            className={`${activeThemeStyle.btnBg} ${activeThemeStyle.btnText} px-6 py-2.5 rounded-xl font-inter text-[11px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5`}
                          >
                            <CheckCircle size={14} />
                            {localEvent.rsvpButtonText || 'RSVP CONFIRMATION'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Quick Action Hint */}
                <div className="bg-[#ffffff] p-4 rounded-xl border border-[#ccc4cf]/40 shadow-xs flex items-center justify-between text-xs text-[#4a454e]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Synchronized with all <strong>{teachers.length} Faculty Profiles</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveEventDetails}
                    className="text-[#180331] font-bold hover:underline cursor-pointer"
                  >
                    Save Changes Now →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB: GLOBAL GIFTS, EXACT REVEAL TIMER & HOME COUNTDOWN BOX                */}
        {/* ========================================================================= */}
        {activeTab === 'gifts' && (
          <div className="p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#efeded]">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#fed65b]/25 text-[#9a4b00]">
                    <Gift size={24} />
                  </div>
                  <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#180331]">
                    Gifts &amp; Countdown Control
                  </h1>
                  <span className="bg-[#fed65b] text-[#180331] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#ffe088]/40">
                    Live Reactive
                  </span>
                </div>
                <p className="text-xs text-[#7b757f] mt-1">
                  Configure the shared gifts collection that displays for all teachers at the same time, set the exact reveal schedule, and customize the Home Page "Coming Soon: Something Big!" countdown box.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await onUpdateSettings(localSettings);
                      setNotification('✅ Gifts, Exact Reveal Time & Countdown saved successfully!');
                    } catch {
                      setNotification('Failed to save settings to Supabase.');
                    }
                  }}
                  className="btn-primary rounded-xl px-6 py-2.5 font-inter text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer transition-all"
                >
                  <Check size={16} />
                  <span>Save All Settings</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT COLUMN: Reveal Timer & Home Countdown */}
              <div className="lg:col-span-6 space-y-6">
                {/* 1. Exact Reveal Time Card */}
                <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#ccc4cf]/40 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#fed65b]/30 text-[#9a4b00]">
                        <Clock size={18} />
                      </div>
                      <h3 className="font-playfair text-lg font-bold text-[#180331]">
                        Exact Gift Reveal Schedule
                      </h3>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      localSettings.giftIsRevealed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {localSettings.giftIsRevealed ? 'Unlocked For Everyone' : 'Locked with Countdown'}
                    </span>
                  </div>

                  <p className="text-xs text-[#7b757f]">
                    Control when faculty members can open their gift book. You can reveal it immediately or lock it with a live ticking countdown until the exact celebration moment.
                  </p>

                  {/* Immediate vs Scheduled Reveal Toggle */}
                  <div className="p-3.5 bg-[#fbf9f8] rounded-xl border border-[#efeded]">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.giftIsRevealed ?? true}
                        onChange={(e) => {
                          const updated = { ...localSettings, giftIsRevealed: e.target.checked };
                          setLocalSettings(updated);
                        }}
                        className="w-4 h-4 rounded text-[#180331] focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-[#180331]">
                        Reveal Gifts Immediately (Unlocked for all teachers now)
                      </span>
                    </label>
                  </div>

                  {/* Exact Date & Time Picker */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                      Exact Reveal Date &amp; Time
                    </label>
                    <input
                      type="datetime-local"
                      value={localSettings.giftRevealDateTime || '2026-09-05T10:00'}
                      onChange={(e) => {
                        const updated = { ...localSettings, giftRevealDateTime: e.target.value };
                        setLocalSettings(updated);
                      }}
                      className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-4 py-2.5 text-xs text-[#180331] focus:border-[#180331] outline-none"
                    />
                    <p className="text-[11px] text-[#7b757f] mt-1">
                      When "Reveal Immediately" is unchecked, gifts remain locked until this exact timestamp.
                    </p>
                  </div>

                  {/* Teaser Message */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                      Locked Teaser Message
                    </label>
                    <textarea
                      rows={2}
                      value={localSettings.giftLockedMessage || ''}
                      onChange={(e) => {
                        const updated = { ...localSettings, giftLockedMessage: e.target.value };
                        setLocalSettings(updated);
                      }}
                      placeholder="A Special Gift is arriving for all teachers! Unlocks at the exact scheduled celebration time."
                      className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl p-3 text-xs text-[#180331] focus:border-[#180331] outline-none resize-none"
                    />
                  </div>
                </div>

                {/* 2. Home Page Countdown Box Settings */}
                <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#ccc4cf]/40 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#fed65b]/30 text-[#9a4b00]">
                        <Sparkles size={18} />
                      </div>
                      <h3 className="font-playfair text-lg font-bold text-[#180331]">
                        Home Page Countdown Box
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.showCountdownBox !== false}
                        onChange={(e) => {
                          const updated = { ...localSettings, showCountdownBox: e.target.checked };
                          setLocalSettings(updated);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#180331]"></div>
                    </label>
                  </div>

                  <p className="text-xs text-[#7b757f]">
                    Displays the high-visibility "Coming Soon: Something Big!" live ticking countdown on the home screen.
                  </p>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                      Countdown Box Title
                    </label>
                    <input
                      type="text"
                      value={localSettings.countdownTitle ?? 'Coming Soon: Something Big!'}
                      onChange={(e) => {
                        const updated = { ...localSettings, countdownTitle: e.target.value };
                        setLocalSettings(updated);
                      }}
                      className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-4 py-2.5 text-xs text-[#180331] focus:border-[#180331] outline-none"
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                      Subtitle / Event Note
                    </label>
                    <input
                      type="text"
                      value={localSettings.countdownSubtitle ?? "Teachers' Day Grand Ceremony & Secret Gift Reveal"}
                      onChange={(e) => {
                        const updated = { ...localSettings, countdownSubtitle: e.target.value };
                        setLocalSettings(updated);
                      }}
                      className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-4 py-2.5 text-xs text-[#180331] focus:border-[#180331] outline-none"
                    />
                  </div>

                  {/* Target Date for Home Countdown */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                      Target Countdown Date &amp; Time
                    </label>
                    <input
                      type="datetime-local"
                      value={localSettings.countdownTargetDate || localSettings.giftRevealDateTime || '2026-09-05T10:00'}
                      onChange={(e) => {
                        const updated = { ...localSettings, countdownTargetDate: e.target.value };
                        setLocalSettings(updated);
                      }}
                      className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-4 py-2.5 text-xs text-[#180331] focus:border-[#180331] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Global Shared Gifts Collection */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-[#ffffff] rounded-2xl p-6 border border-[#ccc4cf]/40 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-playfair text-lg font-bold text-[#180331]">
                        Global Shared Gift Book Pages
                      </h3>
                      <p className="text-xs text-[#7b757f] mt-0.5">
                        These images are shown to <strong>every teacher at the same time</strong> in the book scroll viewer.
                      </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 bg-[#fed65b]/30 text-[#9a4b00] rounded-full">
                      {(localSettings.giftImages || DEFAULT_GIFT_IMAGES).length} Pages
                    </span>
                  </div>

                  {/* Add URL */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e]">
                      Add New Gift Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://... gift, award, or greeting card image"
                        value={giftImageUrlInput}
                        onChange={(e) => setGiftImageUrlInput(e.target.value)}
                        className="flex-grow bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs focus:border-[#180331] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (giftImageUrlInput.trim()) {
                            const current = localSettings.giftImages || DEFAULT_GIFT_IMAGES.map((d) => d.url);
                            const updated = { ...localSettings, giftImages: [...current, giftImageUrlInput.trim()] };
                            setLocalSettings(updated);
                            setGiftImageUrlInput('');
                            setNotification('Added gift page! Click "Save All Settings" to publish.');
                          }
                        }}
                        className="px-4 py-2 bg-[#180331] text-[#ffe088] rounded-xl text-xs font-semibold hover:bg-[#2e1a47] cursor-pointer whitespace-nowrap"
                      >
                        Add Page
                      </button>
                    </div>
                  </div>

                  {/* Quick Add Presets */}
                  <div>
                    <span className="block text-[11px] font-semibold text-[#7b757f] mb-2 uppercase">
                      Quick Add Celebration Presets:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {DEFAULT_GIFT_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const current = localSettings.giftImages || DEFAULT_GIFT_IMAGES.map((d) => d.url);
                            if (!current.includes(preset.url)) {
                              const updated = { ...localSettings, giftImages: [...current, preset.url] };
                              setLocalSettings(updated);
                              setNotification(`Added "${preset.label}" to gift book!`);
                            }
                          }}
                          className="flex items-center gap-2 p-2 bg-[#fbf9f8] hover:bg-[#fff9e6] border border-[#e8d8b0] rounded-xl text-left text-xs transition-colors cursor-pointer"
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-8 h-8 rounded-lg object-cover border border-[#e8d8b0]"
                          />
                          <span className="truncate font-medium text-[#180331]">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Current Pages Grid */}
                  <div>
                    <span className="block text-xs font-semibold text-[#4a454e] mb-2 uppercase">
                      Current Book Pages (Turn Order):
                    </span>
                    <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto p-3 bg-[#fbf9f8] rounded-2xl border border-[#efeded]">
                      {(localSettings.giftImages && localSettings.giftImages.length > 0 ? localSettings.giftImages : DEFAULT_GIFT_IMAGES.map(d => d.url)).map((url, idx) => (
                        <div
                          key={idx}
                          className="relative rounded-xl overflow-hidden border-2 border-[#e8d8b0] bg-[#fffdf5] shadow-xs group"
                          style={{ height: '140px' }}
                        >
                          <img
                            src={url}
                            alt={`Gift page ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                            p.{idx + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const current = localSettings.giftImages || DEFAULT_GIFT_IMAGES.map((d) => d.url);
                              const updated = {
                                ...localSettings,
                                giftImages: current.filter((_, i) => i !== idx),
                              };
                              setLocalSettings(updated);
                            }}
                            className="absolute top-1.5 right-1.5 p-1.5 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                            title="Remove this page"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: HOME PAGE & LOGO / THEME MANAGEMENT                                */}
        {/* ========================================================================= */}
        {activeTab === 'appearance' && (
          <div className="p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8 animate-fade-in-up">
            {/* Header with Quick Save & Reset */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#efeded]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#180331]">
                    Home Page &amp; Logo Control
                  </h1>
                  <span className="bg-[#180331] text-[#ffe088] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#ffe088]/40">
                    Live Reactive
                  </span>
                </div>
                <p className="text-xs text-[#7b757f] mt-1">
                  Change the home page logo/crest emblem, typography, wallpaper, and background transparency in real time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResetAppearance}
                  className="px-4 py-2.5 rounded-xl border border-[#ccc4cf] text-xs font-semibold uppercase tracking-wider text-[#4a454e] hover:bg-[#efeded] flex items-center gap-2 cursor-pointer transition-colors"
                  title="Reset to initial defaults"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>

                <button
                  onClick={handleSaveAppearance}
                  disabled={isSavingSettings}
                  className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  <Check size={16} />
                  {isSavingSettings ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>
            </div>

            {/* Quick Theme Presets Banner */}
            <div className="bg-[#ffffff] p-5 rounded-2xl border border-[#ccc4cf]/40 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h4 className="font-inter font-semibold text-xs text-[#180331] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={14} className="text-[#735c00]" />
                    Quick One-Click Themes
                  </h4>
                  <p className="text-[11px] text-[#7b757f] mt-0.5">
                    Instantly load curated harmonious palettes, crest emblems, and background presets.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => applyThemePreset('classic')}
                    className="px-3 py-1.5 rounded-lg border border-[#ccc4cf] text-xs font-medium text-[#180331] hover:bg-[#efeded] bg-[#fbf9f8] transition-colors cursor-pointer"
                  >
                    ✨ Classic Gold &amp; Cream
                  </button>
                  <button
                    type="button"
                    onClick={() => applyThemePreset('midnight')}
                    className="px-3 py-1.5 rounded-lg border border-[#180331] text-xs font-medium text-[#ffe088] bg-[#180331] hover:bg-[#2a0852] transition-colors cursor-pointer shadow-xs"
                  >
                    🌌 Midnight Luxury Gala
                  </button>
                  <button
                    type="button"
                    onClick={() => applyThemePreset('library')}
                    className="px-3 py-1.5 rounded-lg border border-[#fed65b] text-xs font-medium text-[#735c00] bg-[#fed65b]/20 hover:bg-[#fed65b]/30 transition-colors cursor-pointer"
                  >
                    🏛️ Grand Campus Library
                  </button>
                  <button
                    type="button"
                    onClick={() => applyThemePreset('golden')}
                    className="px-3 py-1.5 rounded-lg border border-[#ffe088] text-xs font-medium text-[#9a4b00] bg-[#fff8e7] hover:bg-[#ffeec2] transition-colors cursor-pointer"
                  >
                    🔥 Torch of Wisdom
                  </button>
                </div>
              </div>
            </div>

            {/* Split Layout: Left Controls & Right Live Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Settings Controls */}
              <div className="lg:col-span-7 space-y-6">
                {/* Sub-tab Navigation */}
                <div className="flex border-b border-[#efeded] gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setAppearanceSubTab('icon')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
                      appearanceSubTab === 'icon'
                        ? 'bg-[#180331] text-[#ffffff] shadow-xs'
                        : 'text-[#4a454e] hover:bg-[#efeded]'
                    }`}
                  >
                    <Shield size={14} />
                    1. Logo &amp; Crest
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppearanceSubTab('background')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
                      appearanceSubTab === 'background'
                        ? 'bg-[#180331] text-[#ffffff] shadow-xs'
                        : 'text-[#4a454e] hover:bg-[#efeded]'
                    }`}
                  >
                    <Sliders size={14} />
                    2. Wallpaper &amp; Transparency
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppearanceSubTab('content')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
                      appearanceSubTab === 'content'
                        ? 'bg-[#180331] text-[#ffffff] shadow-xs'
                        : 'text-[#4a454e] hover:bg-[#efeded]'
                    }`}
                  >
                    <Edit2 size={14} />
                    3. Text &amp; Quotes
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppearanceSubTab('buttons')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
                      appearanceSubTab === 'buttons'
                        ? 'bg-[#180331] text-[#ffffff] shadow-xs'
                        : 'text-[#4a454e] hover:bg-[#efeded]'
                    }`}
                  >
                    <Layers size={14} />
                    4. Buttons
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppearanceSubTab('favicon')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
                      appearanceSubTab === 'favicon'
                        ? 'bg-[#180331] text-[#ffffff] shadow-xs'
                        : 'text-[#4a454e] hover:bg-[#efeded]'
                    }`}
                  >
                    <Globe size={14} />
                    5. Tab Icon (Favicon)
                  </button>
                </div>

                {/* SubTab 1: Logo & Crest */}
                {appearanceSubTab === 'icon' && (
                  <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 shadow-xs space-y-6 animate-fade-in-up">
                    <div>
                      <h3 className="font-playfair text-lg font-bold text-[#180331]">
                        Home Page Logo &amp; Institutional Crest
                      </h3>
                      <p className="text-xs text-[#7b757f] mt-0.5">
                        Select an emblem style or upload your custom institution logo photo.
                      </p>
                    </div>

                    {/* Emblem Type Selector Grid */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-2.5">
                        Choose Logo / Emblem Style
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {PRESET_CREST_ICONS.map((crest) => (
                          <button
                            key={crest.id}
                            type="button"
                            onClick={() =>
                              setLocalSettings((prev) => ({
                                ...prev,
                                crestType: crest.id as CrestType,
                              }))
                            }
                            className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                              localSettings.crestType === crest.id
                                ? 'border-[#180331] bg-[#180331]/5 text-[#180331] font-semibold ring-2 ring-[#180331]/10'
                                : 'border-[#ccc4cf]/60 hover:bg-[#fbf9f8] text-[#4a454e]'
                            }`}
                          >
                            <span className="p-1.5 bg-[#ffffff] rounded-lg shadow-xs border border-[#ccc4cf]/30 text-[#180331]">
                              {crest.id === 'default-crest' && <Shield size={16} />}
                              {crest.id === 'academic-cap' && <GraduationCap size={16} />}
                              {crest.id === 'golden-trophy' && <Trophy size={16} />}
                              {crest.id === 'torch-of-wisdom' && <Flame size={16} />}
                              {crest.id === 'star-crest' && <Star size={16} />}
                              {crest.id === 'book-open' && <BookOpen size={16} />}
                              {crest.id === 'custom-image' && <ImageIcon size={16} />}
                            </span>
                            <span className="text-xs">{crest.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Logo Image URL & Upload */}
                    <div className="p-4 bg-[#fbf9f8] rounded-xl border border-[#ccc4cf]/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#180331]">
                          Upload Custom Logo / Logo Image URL
                        </label>
                        <button
                          type="button"
                          onClick={() => logoFileInputRef.current?.click()}
                          className="text-xs text-[#180331] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Upload size={12} />
                          Upload from Device
                        </button>
                        <input
                          ref={logoFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'logo')}
                        />
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://... (Paste image URL)"
                          value={localSettings.customCrestImageUrl || ''}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              crestType: 'custom-image',
                              customCrestImageUrl: e.target.value,
                            }))
                          }
                          className="flex-1 bg-[#ffffff] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-xs focus:border-[#180331] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (localSettings.customCrestImageUrl) {
                              setLocalSettings((prev) => ({ ...prev, crestType: 'custom-image' }));
                              setNotification('Logo set! Click "Save All Changes" to publish.');
                            }
                          }}
                          className="px-4 py-2.5 bg-[#180331] text-[#ffe088] rounded-xl text-xs font-bold uppercase cursor-pointer"
                        >
                          Use Logo
                        </button>
                      </div>

                      <div>
                        <span className="text-[11px] text-[#7b757f] block mb-1.5 font-medium">
                          Or pick from preset sample logos:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {presetCrestLogos.map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                setLocalSettings((prev) => ({
                                  ...prev,
                                  crestType: 'custom-image',
                                  customCrestImageUrl: p.url,
                                }))
                              }
                              className={`text-[11px] px-2.5 py-1 bg-[#ffffff] border rounded-lg transition-colors cursor-pointer ${
                                localSettings.customCrestImageUrl === p.url && localSettings.crestType === 'custom-image'
                                  ? 'border-[#180331] bg-[#180331] text-[#ffffff]'
                                  : 'border-[#ccc4cf] text-[#4a454e] hover:border-[#180331]'
                              }`}
                            >
                              {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Corner Badge Icon */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#4a454e]">
                          Corner Sparkle Badge Icon
                        </label>
                        <label className="flex items-center gap-2 text-xs text-[#180331] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localSettings.showSparkleBadge}
                            onChange={(e) =>
                              setLocalSettings((prev) => ({
                                ...prev,
                                showSparkleBadge: e.target.checked,
                              }))
                            }
                            className="rounded border-[#ccc4cf] accent-[#180331]"
                          />
                          Show Badge
                        </label>
                      </div>

                      {localSettings.showSparkleBadge && (
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                          {(
                            [
                              { id: 'sparkles', label: 'Sparkles', icon: Sparkles },
                              { id: 'star', label: 'Star', icon: Star },
                              { id: 'trophy', label: 'Trophy', icon: Trophy },
                              { id: 'heart', label: 'Heart', icon: Heart },
                              { id: 'award', label: 'Award', icon: Award },
                              { id: 'graduation-cap', label: 'Cap', icon: GraduationCap },
                              { id: 'flame', label: 'Flame', icon: Flame },
                            ] as const
                          ).map((b) => {
                            const IconComponent = b.icon;
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() =>
                                  setLocalSettings((prev) => ({
                                    ...prev,
                                    badgeIcon: b.id as BadgeIconType,
                                  }))
                                }
                                className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                  localSettings.badgeIcon === b.id
                                    ? 'bg-[#180331] text-[#ffe088] border-[#180331] shadow-xs'
                                    : 'bg-[#ffffff] text-[#4a454e] border-[#ccc4cf]/60 hover:bg-[#fbf9f8]'
                                }`}
                              >
                                <IconComponent size={16} />
                                <span className="text-[10px] font-medium">{b.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Crest Glow & Size */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                          Outer Ring Glow
                        </label>
                        <select
                          value={localSettings.crestBorderGlow}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              crestBorderGlow: e.target.value as any,
                            }))
                          }
                          className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-xs outline-none cursor-pointer"
                        >
                          <option value="gold">Golden Radiance Glow</option>
                          <option value="purple">Royal Purple Halo</option>
                          <option value="subtle">Subtle Shadow</option>
                          <option value="none">Clean Minimal Border</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                          Emblem Size
                        </label>
                        <select
                          value={localSettings.crestSize}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              crestSize: e.target.value as any,
                            }))
                          }
                          className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-xs outline-none cursor-pointer"
                        >
                          <option value="small">Compact (Small)</option>
                          <option value="medium">Standard (Medium - Recommended)</option>
                          <option value="large">Prominent Grand (Large)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* SubTab 2: Background Wallpaper & Transparency */}
                {appearanceSubTab === 'background' && (
                  <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 shadow-xs space-y-6 animate-fade-in-up">
                    <div>
                      <h3 className="font-playfair text-lg font-bold text-[#180331]">
                        Home Page Background &amp; Transparency Control
                      </h3>
                      <p className="text-xs text-[#7b757f] mt-0.5">
                        Choose wallpapers, and adjust transparency, background blur, and tint overlays with precision sliders.
                      </p>
                    </div>

                    {/* Wallpaper Presets */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-2.5">
                        Choose Background Wallpaper Preset
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {PRESET_BACKGROUND_IMAGES.map((img) => (
                          <div
                            key={img.id}
                            onClick={() =>
                              setLocalSettings((prev) => ({
                                ...prev,
                                bgImageUrl: img.url,
                              }))
                            }
                            className={`rounded-xl border overflow-hidden cursor-pointer group transition-all relative ${
                              localSettings.bgImageUrl === img.url
                                ? 'border-[#180331] ring-2 ring-[#180331]/20 shadow-md'
                                : 'border-[#ccc4cf]/60 hover:border-[#180331]'
                            }`}
                          >
                            <img
                              src={img.url}
                              alt={img.name}
                              className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="p-2 bg-[#ffffff]">
                              <p className="text-[11px] font-semibold text-[#180331] truncate">{img.name}</p>
                              <span className="text-[9px] text-[#7b757f] uppercase">{img.category}</span>
                            </div>
                            {localSettings.bgImageUrl === img.url && (
                              <div className="absolute top-1.5 right-1.5 bg-[#180331] text-[#ffe088] p-1 rounded-full shadow-md">
                                <Check size={12} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Custom Background URL & Upload */}
                    <div className="p-4 bg-[#fbf9f8] rounded-xl border border-[#ccc4cf]/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#180331]">
                          Or Custom Wallpaper Image URL / Upload
                        </label>
                        <button
                          type="button"
                          onClick={() => wallpaperFileInputRef.current?.click()}
                          className="text-xs text-[#180331] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Upload size={12} />
                          Upload File
                        </button>
                        <input
                          ref={wallpaperFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'wallpaper')}
                        />
                      </div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={localSettings.bgImageUrl}
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            bgImageUrl: e.target.value,
                          }))
                        }
                        className="w-full bg-[#ffffff] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-xs focus:border-[#180331] outline-none"
                      />
                    </div>

                    {/* Quick Visibility & Transparency Presets */}
                    <div className="p-4 bg-[#fbf9f8] rounded-xl border border-[#ccc4cf]/60 space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#180331] block">
                        Quick Wallpaper Transparency Presets
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              bgImageOpacity: 100,
                              bgOverlayOpacity: 0,
                              bgBlur: 0,
                              bgGradientStyle: 'none',
                            }))
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            localSettings.bgImageOpacity === 100 && localSettings.bgOverlayOpacity === 0
                              ? 'bg-[#180331] text-[#ffe088] border-[#180331] shadow-xs'
                              : 'bg-[#ffffff] text-[#180331] border-[#ccc4cf] hover:bg-[#efeded]'
                          }`}
                        >
                          🌟 100% Full Solid Photo (Clear)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              bgImageOpacity: 80,
                              bgOverlayOpacity: 15,
                              bgBlur: 0,
                              bgGradientStyle: 'subtle-purple',
                            }))
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#ffffff] text-[#4a454e] border border-[#ccc4cf] hover:bg-[#efeded] transition-colors cursor-pointer"
                        >
                          ✨ 80% Vivid Atmosphere
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              bgImageOpacity: 50,
                              bgOverlayOpacity: 40,
                              bgBlur: 0,
                            }))
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#ffffff] text-[#4a454e] border border-[#ccc4cf] hover:bg-[#efeded] transition-colors cursor-pointer"
                        >
                          🌫️ 50% Watermark
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              bgImageOpacity: 30,
                              bgOverlayOpacity: 65,
                              bgBlur: 3,
                            }))
                          }
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#ffffff] text-[#4a454e] border border-[#ccc4cf] hover:bg-[#efeded] transition-colors cursor-pointer"
                        >
                          🎨 30% Soft Focus
                        </button>
                      </div>
                    </div>

                    {/* Slider 1: Background Image Opacity / Visibility */}
                    <div className="p-4 bg-[#fbf9f8] rounded-xl border border-[#ccc4cf]/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#180331] flex items-center gap-1.5">
                          <Sliders size={14} />
                          Background Image Opacity / Visibility
                        </label>
                        <span className="bg-[#180331] text-[#ffe088] px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                          {localSettings.bgImageOpacity ?? 85}%
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7b757f]">
                        100% = crystal clear photograph, 0% = hidden / transparent.
                      </p>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={localSettings.bgImageOpacity ?? 85}
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            bgImageOpacity: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-[#180331] cursor-pointer h-2 bg-[#ccc4cf]/40 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-[#7b757f] font-mono">
                        <span>0% (Transparent)</span>
                        <span>50% (Watermark)</span>
                        <span className="font-bold text-[#180331]">100% (Solid Crystal Clear)</span>
                      </div>
                    </div>

                    {/* Slider 2: Background Blur Depth */}
                    <div className="p-4 bg-[#fbf9f8] rounded-xl border border-[#ccc4cf]/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#180331] flex items-center gap-1.5">
                          <Layers size={14} />
                          Background Blur (Bokeh Depth)
                        </label>
                        <span className="bg-[#180331] text-[#ffe088] px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                          {localSettings.bgBlur ?? 0}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={localSettings.bgBlur ?? 0}
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            bgBlur: Number(e.target.value),
                          }))
                        }
                        className="w-full accent-[#180331] cursor-pointer h-2 bg-[#ccc4cf]/40 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-[#7b757f] font-mono">
                        <span>0px (Crisp Sharp)</span>
                        <span>8px (Soft Focus)</span>
                        <span>20px (Maximum Dreamy)</span>
                      </div>
                    </div>

                    {/* Slider 3: Overlay Tint Color & Opacity */}
                    <div className="p-4 bg-[#fbf9f8] rounded-xl border border-[#ccc4cf]/60 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-semibold uppercase tracking-wider text-[#180331]">
                            Background Overlay Tint Color
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setLocalSettings((prev) => ({
                                ...prev,
                                bgOverlayOpacity: 0,
                              }))
                            }
                            className="text-[10px] text-[#735c00] font-semibold hover:underline cursor-pointer"
                          >
                            Disable Tint (0% Overlay)
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {[
                            { label: 'Soft Ivory', color: '#fbf9f8' },
                            { label: 'Warm Cream', color: '#f5eee6' },
                            { label: 'Midnight Regal', color: '#180331' },
                            { label: 'Pure White', color: '#ffffff' },
                            { label: 'Golden Tint', color: '#fff9e6' },
                            { label: 'Dark Obsidian', color: '#121212' },
                          ].map((t, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() =>
                                setLocalSettings((prev) => ({
                                  ...prev,
                                  bgOverlayColor: t.color,
                                }))
                              }
                              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer transition-colors ${
                                localSettings.bgOverlayColor === t.color
                                  ? 'border-[#180331] bg-[#180331] text-[#ffffff]'
                                  : 'border-[#ccc4cf] bg-[#ffffff] text-[#4a454e]'
                              }`}
                            >
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/15"
                                style={{ backgroundColor: t.color }}
                              />
                              {t.label}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={localSettings.bgOverlayColor || '#fbf9f8'}
                            onChange={(e) =>
                              setLocalSettings((prev) => ({
                                ...prev,
                                bgOverlayColor: e.target.value,
                              }))
                            }
                            className="w-10 h-10 rounded-xl cursor-pointer border border-[#ccc4cf] p-1"
                          />
                          <input
                            type="text"
                            value={localSettings.bgOverlayColor || '#fbf9f8'}
                            onChange={(e) =>
                              setLocalSettings((prev) => ({
                                ...prev,
                                bgOverlayColor: e.target.value,
                              }))
                            }
                            className="flex-1 bg-[#ffffff] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Overlay Opacity Slider */}
                      <div className="space-y-2 pt-2 border-t border-[#ccc4cf]/40">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold uppercase tracking-wider text-[#180331]">
                            Tint Overlay Opacity / Dimming
                          </label>
                          <span className="bg-[#180331] text-[#ffe088] px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                            {localSettings.bgOverlayOpacity ?? 20}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7b757f]">
                          Set to 0% for pure unmasked photographic wallpaper visibility.
                        </p>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          value={localSettings.bgOverlayOpacity ?? 20}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              bgOverlayOpacity: Number(e.target.value),
                            }))
                          }
                          className="w-full accent-[#180331] cursor-pointer h-2 bg-[#ccc4cf]/40 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SubTab 3: Text & Quotes */}
                {appearanceSubTab === 'content' && (
                  <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 shadow-xs space-y-5 animate-fade-in-up">
                    <div>
                      <h3 className="font-playfair text-lg font-bold text-[#180331]">
                        Hero Typography &amp; Appreciation Message
                      </h3>
                      <p className="text-xs text-[#7b757f] mt-0.5">
                        Edit institution title, main heading, and celebratory quotation.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                        College / Institution Name
                      </label>
                      <input
                        type="text"
                        value={localSettings.institutionName}
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            institutionName: e.target.value,
                          }))
                        }
                        placeholder="Excellence Institute of Technology"
                        className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#180331] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                        Hero Tagline / Subtitle Badge (Optional)
                      </label>
                      <input
                        type="text"
                        value={localSettings.heroTagline}
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            heroTagline: e.target.value,
                          }))
                        }
                        placeholder="Honoring the Architects of Our Future"
                        className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#180331] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                        Main Hero Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={localSettings.heroTitle}
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            heroTitle: e.target.value,
                          }))
                        }
                        placeholder="Happy Teachers' Day"
                        className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-base font-bold font-playfair focus:border-[#180331] outline-none text-[#180331]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e]">
                          Celebration Appreciation Quote
                        </label>
                        <span className="text-[11px] text-[#7b757f]">
                          {localSettings.heroQuote?.length || 0} / 250
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={250}
                        value={localSettings.heroQuote}
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            heroQuote: e.target.value,
                          }))
                        }
                        placeholder="To the world, you may be just a teacher, but to your students, you are a hero."
                        className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl p-3 text-sm focus:border-[#180331] outline-none resize-none font-serif"
                      />
                    </div>
                  </div>
                )}

                {/* SubTab 4: Action Buttons */}
                {appearanceSubTab === 'buttons' && (
                  <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 shadow-xs space-y-5 animate-fade-in-up">
                    <div>
                      <h3 className="font-playfair text-lg font-bold text-[#180331]">
                        Home Action Buttons &amp; Call To Actions
                      </h3>
                      <p className="text-xs text-[#7b757f] mt-0.5">
                        Configure the buttons shown on the public landing page.
                      </p>
                    </div>

                    {/* Gallery Button */}
                    <div className="p-4 bg-[#fbf9f8] rounded-xl border border-[#ccc4cf]/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#180331]">
                          Button 1 (Gallery / Media)
                        </label>
                        <label className="flex items-center gap-2 text-xs text-[#180331] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localSettings.galleryButtonVisible !== false}
                            onChange={(e) =>
                              setLocalSettings((prev) => ({
                                ...prev,
                                galleryButtonVisible: e.target.checked,
                              }))
                            }
                            className="rounded border-[#ccc4cf] accent-[#180331]"
                          />
                          Visible
                        </label>
                      </div>
                      <input
                        type="text"
                        value={localSettings.galleryButtonText}
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            galleryButtonText: e.target.value,
                          }))
                        }
                        placeholder="GALLERY"
                        className="w-full bg-[#ffffff] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs"
                      />
                    </div>

                    {/* Departments Button */}
                    <div className="p-4 bg-[#fbf9f8] rounded-xl border border-[#ccc4cf]/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#180331]">
                          Button 2 (Primary Navigation)
                        </label>
                        <label className="flex items-center gap-2 text-xs text-[#180331] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={localSettings.departmentsButtonVisible !== false}
                            onChange={(e) =>
                              setLocalSettings((prev) => ({
                                ...prev,
                                departmentsButtonVisible: e.target.checked,
                              }))
                            }
                            className="rounded border-[#ccc4cf] accent-[#180331]"
                          />
                          Visible
                        </label>
                      </div>
                      <input
                        type="text"
                        value={localSettings.departmentsButtonText}
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            departmentsButtonText: e.target.value,
                          }))
                        }
                        placeholder="SELECT YOUR DEPARTMENT"
                        className="w-full bg-[#ffffff] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* SubTab 5: Browser Tab Icon & Title (Favicon) */}
                {appearanceSubTab === 'favicon' && (
                  <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 shadow-xs space-y-6 animate-fade-in-up">
                    <div>
                      <h3 className="font-playfair text-lg font-bold text-[#180331] flex items-center gap-2">
                        <Globe size={18} className="text-[#180331]" />
                        Browser Tab Icon &amp; Tab Title (Favicon)
                      </h3>
                      <p className="text-xs text-[#7b757f] mt-0.5">
                        Customize the icon and title displayed on the browser tab when users visit your website.
                      </p>
                    </div>

                    {/* Live Browser Tab Preview Simulator */}
                    <div className="p-4 bg-[#efeded]/60 rounded-2xl border border-[#ccc4cf]/60">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#4a454e] block mb-2">
                        Live Browser Tab Preview
                      </span>
                      <div className="bg-[#ffffff] rounded-t-xl border border-b-0 border-[#ccc4cf] p-2.5 flex items-center gap-2.5 max-w-sm shadow-xs">
                        <div className="w-5 h-5 rounded-md overflow-hidden bg-[#f5f3f3] border border-[#ccc4cf]/50 flex items-center justify-center shrink-0">
                          {localSettings.faviconUrl ? (
                            <img
                              src={localSettings.faviconUrl}
                              alt="Tab Icon"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=64&auto=format&fit=crop&q=80';
                              }}
                            />
                          ) : (
                            <span className="text-xs">🎓</span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-[#180331] truncate">
                          {localSettings.siteTabTitle || localSettings.heroTitle || "Happy Teachers' Day"}
                        </span>
                        <X size={12} className="text-[#7b757f] ml-auto shrink-0" />
                      </div>
                    </div>

                    {/* Browser Tab Title Input */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                        Browser Tab Title (Page Title in Google Chrome / Safari / Edge)
                      </label>
                      <input
                        type="text"
                        value={localSettings.siteTabTitle || ''}
                        onChange={(e) =>
                          setLocalSettings((prev) => ({
                            ...prev,
                            siteTabTitle: e.target.value,
                          }))
                        }
                        placeholder="Happy Teachers' Day | Excellence Institute"
                        className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-xs text-[#180331] font-medium focus:border-[#180331] outline-none"
                      />
                    </div>

                    {/* Tab Icon (Favicon) URL & Upload */}
                    <div className="p-4 bg-[#fbf9f8] rounded-xl border border-[#ccc4cf]/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[#180331]">
                          Upload Custom Favicon / Tab Icon URL
                        </label>
                        <button
                          type="button"
                          onClick={() => faviconFileInputRef.current?.click()}
                          className="text-xs text-[#180331] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Upload size={12} />
                          Upload from Computer (.png / .ico / .jpg)
                        </button>
                        <input
                          ref={faviconFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'favicon')}
                        />
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://... (Paste icon image URL)"
                          value={localSettings.faviconUrl || ''}
                          onChange={(e) =>
                            setLocalSettings((prev) => ({
                              ...prev,
                              faviconUrl: e.target.value,
                            }))
                          }
                          className="flex-1 bg-[#ffffff] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-xs focus:border-[#180331] outline-none"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (localSettings.faviconUrl) {
                              // Remove old favicons and force a fresh one (cache-busting)
                              document.querySelectorAll("link[rel~='icon'], link[rel='shortcut icon']").forEach((el) => el.remove());
                              const link = document.createElement('link');
                              link.rel = 'icon';
                              link.type = 'image/png';
                              const url = localSettings.faviconUrl;
                              link.href = `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
                              document.head.appendChild(link);
                              // Persist to Supabase immediately
                              try {
                                await onUpdateSettings(localSettings);
                                setNotification('✅ Tab Icon saved and applied to browser tab!');
                              } catch {
                                setNotification('Tab icon applied locally but failed to save to Supabase.');
                              }
                            } else {
                              setNotification('Paste or pick an icon URL first.');
                            }
                          }}
                          className="px-4 py-2.5 bg-[#180331] text-[#ffe088] rounded-xl text-xs font-bold uppercase cursor-pointer whitespace-nowrap"
                        >
                          Apply Icon
                        </button>
                      </div>

                      {/* Preset Tab Icons Picker */}
                      <div>
                        <span className="text-[11px] text-[#7b757f] block mb-2 font-medium">
                          Or pick from preset curated tab icons:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {presetFavicons.map((fav, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={async () => {
                                const updated = { ...localSettings, faviconUrl: fav.url };
                                setLocalSettings(updated);
                                // Remove old favicons and force a fresh one (cache-busting)
                                document.querySelectorAll("link[rel~='icon'], link[rel='shortcut icon']").forEach((el) => el.remove());
                                const link = document.createElement('link');
                                link.rel = 'icon';
                                link.type = 'image/png';
                                link.href = `${fav.url}${fav.url.includes('?') ? '&' : '?'}_t=${Date.now()}`;
                                document.head.appendChild(link);
                                // Save immediately to Supabase
                                try {
                                  await onUpdateSettings(updated);
                                  setNotification(`✅ "${fav.label}" tab icon applied and saved!`);
                                } catch {
                                  setNotification(`Tab icon set to "${fav.label}". Save All Changes to persist.`);
                                }
                              }}
                              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                localSettings.faviconUrl === fav.url
                                  ? 'border-[#180331] bg-[#180331]/5 text-[#180331] font-semibold ring-2 ring-[#180331]/10'
                                  : 'border-[#ccc4cf]/60 bg-[#ffffff] hover:bg-[#fbf9f8] text-[#4a454e]'
                              }`}
                            >
                              <div className="w-6 h-6 rounded-md overflow-hidden bg-[#efeded] shrink-0 border border-[#ccc4cf]/40">
                                <img
                                  src={fav.url}
                                  alt={fav.label}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[11px] font-medium block truncate">
                                  {fav.emoji} {fav.label}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Live Interactive Miniature Preview */}
              <div className="lg:col-span-5 sticky top-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#180331] flex items-center gap-1.5">
                    <Eye size={14} />
                    Live Public Preview
                  </span>
                  <div className="flex items-center gap-1.5 bg-[#ffffff] p-1 rounded-xl border border-[#ccc4cf]/40 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors cursor-pointer ${
                        previewDevice === 'desktop'
                          ? 'bg-[#180331] text-[#ffffff]'
                          : 'text-[#7b757f] hover:text-[#180331]'
                      }`}
                    >
                      Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors cursor-pointer ${
                        previewDevice === 'mobile'
                          ? 'bg-[#180331] text-[#ffffff]'
                          : 'text-[#7b757f] hover:text-[#180331]'
                      }`}
                    >
                      Mobile
                    </button>
                  </div>
                </div>

                {/* Simulated Screen Frame */}
                <div
                  className={`bg-[#ffffff] rounded-2xl border-4 border-[#180331]/80 shadow-2xl overflow-hidden transition-all duration-300 mx-auto ${
                    previewDevice === 'mobile' ? 'max-w-[320px]' : 'w-full'
                  }`}
                >
                  <div className="bg-[#180331] px-3.5 py-2 flex items-center justify-between text-[#ffe088] text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                    <span className="font-mono text-[9px] opacity-80 truncate max-w-[150px]">
                      {localSettings.institutionName}
                    </span>
                    <button
                      onClick={onNavigateHome}
                      className="hover:text-[#ffffff] flex items-center gap-1 cursor-pointer"
                      title="Open full page"
                    >
                      <ExternalLink size={10} />
                    </button>
                  </div>

                  <div
                    className={`relative min-h-[460px] flex flex-col items-center justify-center p-6 text-center overflow-hidden transition-all duration-300 ${
                      localSettings.bgGradientStyle === 'dark-luxury' ? 'text-[#ffffff]' : 'text-[#1b1c1c]'
                    }`}
                  >
                    <div
                      className="absolute inset-0 z-0"
                      style={{
                        backgroundColor: localSettings.bgGradientStyle === 'dark-luxury' ? '#0f021e' : (localSettings.bgOverlayColor || '#fbf9f8'),
                      }}
                    />

                    {localSettings.bgImageUrl && (
                      <div
                        className="absolute inset-0 z-0 bg-cover bg-center transition-all pointer-events-none"
                        style={{
                          backgroundImage: `url(${localSettings.bgImageUrl})`,
                          opacity: (localSettings.bgImageOpacity !== undefined ? localSettings.bgImageOpacity : 85) / 100,
                          filter: (localSettings.bgBlur ?? 0) > 0 ? `blur(${localSettings.bgBlur}px)` : 'none',
                          transform: (localSettings.bgBlur ?? 0) > 0 ? 'scale(1.03)' : 'none',
                        }}
                      />
                    )}

                    {(localSettings.bgOverlayOpacity ?? 20) > 0 && (
                      <div
                        className="absolute inset-0 z-0 transition-all pointer-events-none"
                        style={{
                          backgroundColor: localSettings.bgOverlayColor || '#fbf9f8',
                          opacity: (localSettings.bgOverlayOpacity ?? 20) / 100,
                        }}
                      />
                    )}

                    {gradientStyles[localSettings.bgGradientStyle] && gradientStyles[localSettings.bgGradientStyle] !== 'none' && (
                      <div
                        className="absolute inset-0 z-0 pointer-events-none transition-all"
                        style={{
                          background: gradientStyles[localSettings.bgGradientStyle],
                        }}
                      />
                    )}

                    <div className="relative z-10 flex flex-col items-center max-w-sm mx-auto animate-fade-in-up">
                      <CrestRenderer settings={localSettings} sizeOverride="small" />

                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7b757f] mb-1">
                        {localSettings.institutionName || 'Excellence Institute'}
                      </p>

                      {localSettings.heroTagline && (
                        <span className="text-[9px] font-bold text-[#735c00] bg-[#fed65b]/30 px-2 py-0.5 rounded-full border border-[#ffe088]/40 mb-2">
                          {localSettings.heroTagline}
                        </span>
                      )}

                      <h2
                        className={`font-playfair text-2xl sm:text-3xl font-bold mb-2 leading-tight ${
                          localSettings.bgGradientStyle === 'dark-luxury' ? 'text-[#ffe088]' : 'text-[#180331]'
                        }`}
                      >
                        {localSettings.heroTitle || "Happy Teachers' Day"}
                      </h2>

                      <p className="text-xs italic text-[#4a454e] mb-5 line-clamp-3">
                        "{localSettings.heroQuote || 'Thank you for being our guide and hero.'}"
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {localSettings.galleryButtonVisible !== false && (
                          <div className="px-3 py-1.5 bg-[#ffffff] border border-[#ccc4cf] rounded-lg text-[10px] font-semibold text-[#180331] shadow-2xs flex items-center gap-1">
                            <ImageIcon size={10} />
                            {localSettings.galleryButtonText || 'GALLERY'}
                          </div>
                        )}
                        {localSettings.departmentsButtonVisible !== false && (
                          <div className="px-3 py-1.5 bg-[#180331] text-[#ffffff] rounded-lg text-[10px] font-semibold shadow-2xs">
                            {localSettings.departmentsButtonText || 'DEPARTMENTS'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#ffffff] rounded-xl border border-[#ccc4cf]/40 flex items-center justify-between text-xs text-[#7b757f]">
                  <span>Changes apply to public visitors on save</span>
                  <button
                    type="button"
                    onClick={handleSaveAppearance}
                    className="font-bold text-[#180331] hover:underline cursor-pointer"
                  >
                    Save &amp; Publish →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DEPARTMENT MANAGEMENT (ADD, EDIT, UPDATE, DELETE)                  */}
        {/* ========================================================================= */}
        {activeTab === 'departments' && (
          <div className="p-6 md:p-10 max-w-6xl w-full mx-auto space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#efeded]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#180331]">
                    Academic Departments
                  </h1>
                  <span className="bg-[#fed65b] text-[#180331] text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {departments.length} Departments
                  </span>
                </div>
                <p className="text-xs text-[#7b757f] mt-1">
                  Add new departments, update descriptions, designate Heads of Department (HOD), or remove programs.
                </p>
              </div>

              <button
                onClick={openAddDeptDrawer}
                className="btn-primary rounded-xl px-5 py-3 font-inter text-xs font-semibold tracking-wider uppercase flex items-center gap-2 self-start sm:self-auto shadow-md cursor-pointer hover:shadow-lg transition-all"
              >
                <FolderPlus size={18} />
                Add New Department
              </button>
            </div>

            {/* Search Bar */}
            <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#ccc4cf]/40 shadow-xs flex items-center gap-3">
              <Search size={18} className="text-[#7b757f]" />
              <input
                type="text"
                placeholder="Search departments by name, code, or HOD..."
                value={deptSearchQuery}
                onChange={(e) => setDeptSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-xs text-[#180331] outline-none"
              />
            </div>

            {/* Department Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDepartments.map((dept) => {
                const facultyCount = teachers.filter((t) => t.departmentId === dept.id).length;
                return (
                  <div
                    key={dept.id}
                    className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#735c00] bg-[#fed65b]/20 px-3 py-1 rounded-full border border-[#ffe088]/40">
                          Code: {dept.code}
                        </span>
                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditDeptDrawer(dept)}
                            className="p-1.5 text-[#180331] hover:bg-[#efeded] rounded-lg transition-colors cursor-pointer"
                            title="Edit Department"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDeptClick(dept)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Department"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <h3 className="font-playfair text-xl font-bold text-[#180331] mb-1.5">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-[#4a454e] leading-relaxed line-clamp-3 mb-4">
                        {dept.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#efeded] flex items-center justify-between text-xs text-[#7b757f]">
                      <span>
                        HOD: <strong className="text-[#180331] font-semibold">{dept.headOfDepartment}</strong>
                      </span>
                      <span className="bg-[#efeded] text-[#180331] px-2.5 py-1 rounded-full text-[11px] font-bold">
                        {facultyCount} Active Faculty
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredDepartments.length === 0 && (
              <div className="bg-[#ffffff] p-12 rounded-2xl border border-[#ccc4cf]/40 text-center space-y-3">
                <Building2 size={40} className="mx-auto text-[#ccc4cf]" />
                <h3 className="font-playfair text-lg font-bold text-[#180331]">No Departments Found</h3>
                <p className="text-xs text-[#7b757f]">Try adjusting your search query or add a new department.</p>
                <button
                  onClick={openAddDeptDrawer}
                  className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider mt-2 cursor-pointer"
                >
                  Add Department
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TEACHERS MANAGEMENT (ADD, EDIT, UPDATE, DELETE)                    */}
        {/* ========================================================================= */}
        {activeTab === 'teachers' && (
          <div className="p-6 md:p-10 max-w-6xl w-full mx-auto space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#180331]">
                  Faculty Management ({teachers.length})
                </h1>
                <p className="text-xs text-[#7b757f] mt-1">
                  Manage teachers, subject tags, personalized appreciation quotes, and invitations.
                </p>
              </div>

              <button
                onClick={openAddDrawer}
                className="btn-primary rounded-xl px-5 py-3 font-inter text-xs font-semibold tracking-wider uppercase flex items-center gap-2 self-start sm:self-auto shadow-md cursor-pointer hover:shadow-lg transition-all"
              >
                <Plus size={18} />
                Add New Teacher
              </button>
            </div>

            <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#ccc4cf]/40 shadow-xs flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 text-[#7b757f]" size={18} />
                <input
                  type="text"
                  placeholder="Search faculty by name, department, or subject tag..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#180331] outline-none focus:border-[#180331]"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Filter size={16} className="text-[#7b757f] shrink-0" />
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => {
                    setSelectedDeptFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full md:w-auto bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-xs text-[#180331] outline-none cursor-pointer"
                >
                  <option value="all">All Departments ({teachers.length})</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-[#ffffff] rounded-2xl border border-[#ccc4cf]/40 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#efeded] bg-[#fbf9f8] uppercase tracking-wider text-[11px] text-[#7b757f]">
                      <th className="py-4 px-5">Teacher</th>
                      <th className="py-4 px-5">Department</th>
                      <th className="py-4 px-5">Subjects Taught</th>
                      <th className="py-4 px-5">Appreciation Quote</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#efeded]">
                    {paginatedTeachers.map((teacher) => (
                      <tr key={teacher.id} className="hover:bg-[#fbf9f8]/80 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3.5">
                            <img
                              src={teacher.photoUrl}
                              alt={teacher.name}
                              className="w-10 h-10 rounded-full object-cover border border-[#ffe088] shadow-xs"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div>
                              <h4 className="font-inter font-semibold text-sm text-[#180331]">
                                {teacher.name}
                              </h4>
                              <p className="text-[11px] text-[#7b757f]">{teacher.designation}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-[#4a454e] font-medium">
                          {teacher.departmentName}
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {teacher.subjects.slice(0, 2).map((sub, idx) => (
                              <span
                                key={idx}
                                className="bg-[#efeded] text-[#180331] text-[10px] px-2 py-0.5 rounded-full"
                              >
                                {sub}
                              </span>
                            ))}
                            {teacher.subjects.length > 2 && (
                              <span className="text-[10px] text-[#7b757f] font-medium self-center">
                                +{teacher.subjects.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5 max-w-xs">
                          <p className="text-[11px] text-[#7b757f] italic line-clamp-2">
                            "{teacher.appreciationQuote}"
                          </p>
                        </td>
                        <td className="py-4 px-5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => handleCopyTeacherUrl(teacher, e)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 ${
                              copiedTeacherId === teacher.id
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-[#4a454e] hover:text-[#180331] hover:bg-[#efeded]'
                            }`}
                            title={`Copy personal URL for ${teacher.name} (/teacher/${teacher.id})`}
                          >
                            {copiedTeacherId === teacher.id ? <Check size={16} /> : <LinkIcon size={16} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (onViewTeacher) {
                                onViewTeacher(teacher);
                              } else {
                                window.open(`/teacher/${teacher.id}`, '_blank');
                              }
                            }}
                            className="p-1.5 text-[#4a454e] hover:text-[#180331] hover:bg-[#efeded] rounded-lg transition-colors cursor-pointer"
                            title="Open Teacher's Tribute & Invitation Page"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditDrawer(teacher)}
                            className="p-1.5 text-[#4a454e] hover:text-[#180331] hover:bg-[#efeded] rounded-lg transition-colors cursor-pointer"
                            title="Edit Faculty Profile"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(teacher)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {paginatedTeachers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#7b757f]">
                          No teachers match the search or filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-[#efeded] flex items-center justify-between text-xs text-[#7b757f]">
                <span>
                  Showing {paginatedTeachers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                  {Math.min(currentPage * itemsPerPage, filteredTeachers.length)} of {filteredTeachers.length} teachers
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="p-2 border border-[#ccc4cf]/40 rounded-lg disabled:opacity-40 hover:bg-[#efeded] transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-semibold text-[#180331]">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="p-2 border border-[#ccc4cf]/40 rounded-lg disabled:opacity-40 hover:bg-[#efeded] transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: GALLERY MANAGEMENT                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'gallery' && (
          <div className="p-6 md:p-10 max-w-7xl w-full mx-auto space-y-6 animate-fade-in-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#efeded]">
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#180331]">
                    Gallery &amp; Photo Management
                  </h1>
                  <span className="bg-[#fed65b] text-[#180331] text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {galleryItems.length} Photos
                  </span>
                </div>
                <p className="text-xs text-[#7b757f] mt-1">
                  Add image URLs with instant live preview, upload photo memories, download full-res assets, or delete entries.
                </p>
              </div>

              <button
                onClick={openAddGalleryDrawer}
                className="btn-primary rounded-xl px-5 py-3 font-inter text-xs font-semibold tracking-wider uppercase flex items-center gap-2 shadow-md cursor-pointer hover:shadow-lg transition-all"
              >
                <Plus size={18} />
                Add Image URL / Upload
              </button>
            </div>

            {/* Filter Bar & Search */}
            <div className="bg-[#ffffff] p-4 rounded-2xl border border-[#ccc4cf]/40 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 text-[#7b757f]" size={18} />
                <input
                  type="text"
                  placeholder="Search memories by title, category, or description..."
                  value={gallerySearchQuery}
                  onChange={(e) => setGallerySearchQuery(e.target.value)}
                  className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#180331] outline-none focus:border-[#180331]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                {(['All', 'Events', 'Classroom', 'Faculty', 'Celebrations'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGalleryCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-colors cursor-pointer ${
                      galleryCategoryFilter === cat
                        ? 'bg-[#180331] text-[#ffffff] shadow-2xs'
                        : 'bg-[#fbf9f8] text-[#4a454e] border border-[#ccc4cf]/60 hover:bg-[#efeded]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#ffffff] rounded-2xl border border-[#ccc4cf]/40 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="relative overflow-hidden bg-[#efeded]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80';
                      }}
                    />

                    <span className="absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider text-[#735c00] bg-[#ffffff]/90 backdrop-blur-xs px-2.5 py-0.5 rounded-md shadow-xs">
                      {item.category}
                    </span>

                    <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
                      <button
                        onClick={() => setLightboxItem(item)}
                        className="p-2.5 bg-[#ffffff] text-[#180331] rounded-full hover:scale-110 transition-transform shadow-md cursor-pointer"
                        title="View Fullsize"
                      >
                        <ZoomIn size={16} />
                      </button>
                      <button
                        onClick={() => handleDownloadPhoto(item)}
                        className="p-2.5 bg-[#fed65b] text-[#180331] rounded-full hover:scale-110 transition-transform shadow-md cursor-pointer"
                        title="Download Photo"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => openEditGalleryDrawer(item)}
                        className="p-2.5 bg-[#ffffff] text-[#180331] rounded-full hover:scale-110 transition-transform shadow-md cursor-pointer"
                        title="Edit Memory"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteGalleryClick(item)}
                        className="p-2.5 bg-red-600 text-[#ffffff] rounded-full hover:scale-110 transition-transform shadow-md cursor-pointer"
                        title="Delete Memory"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-inter font-bold text-sm text-[#180331] line-clamp-1">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-[#4a454e] mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#efeded] flex items-center justify-between text-[11px] text-[#7b757f]">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {item.date}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadPhoto(item)}
                          className="text-[#735c00] hover:text-[#180331] font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download size={12} />
                          Download
                        </button>
                        <span>•</span>
                        <button
                          onClick={() => openEditGalleryDrawer(item)}
                          className="text-[#180331] hover:underline font-semibold text-xs cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: RSVPS GUEST LIST                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'rsvps' && (
          <div className="p-6 md:p-10 max-w-6xl w-full mx-auto space-y-6 animate-fade-in-up">
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#180331]">
              Ceremony RSVPs ({rsvps.length})
            </h1>
            <div className="bg-[#ffffff] rounded-2xl border border-[#ccc4cf]/40 overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#efeded] bg-[#fbf9f8] uppercase tracking-wider text-[11px] text-[#7b757f]">
                    <th className="py-4 px-5">Guest Name</th>
                    <th className="py-4 px-5">Faculty</th>
                    <th className="py-4 px-5">Department</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#efeded]">
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-[#fbf9f8]">
                      <td className="py-4 px-5">
                        <p className="font-semibold text-[#180331]">{rsvp.guestName}</p>
                        <p className="text-[11px] text-[#7b757f]">{rsvp.email}</p>
                      </td>
                      <td className="py-4 px-5 text-[#180331] font-medium">{rsvp.teacherName || 'General Ceremony'}</td>
                      <td className="py-4 px-5 text-[#7b757f]">{rsvp.department}</td>
                      <td className="py-4 px-5">
                        <span className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                          {rsvp.attending} ({rsvp.guestCount} Guest{rsvp.guestCount > 1 ? 's' : ''})
                        </span>
                      </td>
                      <td className="py-4 px-5 text-[#4a454e]">{rsvp.wishesNote || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: DASHBOARD OVERVIEW                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="p-6 md:p-10 max-w-6xl w-full mx-auto space-y-6 animate-fade-in-up">
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#180331]">
              Celebration Dashboard
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 shadow-xs">
                <span className="text-[11px] text-[#7b757f] uppercase font-semibold">Total Faculty</span>
                <p className="text-3xl font-bold text-[#180331] mt-2 font-playfair">{teachers.length}</p>
              </div>
              <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 shadow-xs">
                <span className="text-[11px] text-[#7b757f] uppercase font-semibold">Departments</span>
                <p className="text-3xl font-bold text-[#180331] mt-2 font-playfair">{departments.length}</p>
              </div>
              <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 shadow-xs">
                <span className="text-[11px] text-[#7b757f] uppercase font-semibold">Gallery Memories</span>
                <p className="text-3xl font-bold text-[#180331] mt-2 font-playfair">{galleryItems.length}</p>
              </div>
              <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 shadow-xs">
                <span className="text-[11px] text-[#7b757f] uppercase font-semibold">Confirmed RSVPs</span>
                <p className="text-3xl font-bold text-[#180331] mt-2 font-playfair">{rsvps.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SYSTEM SETTINGS                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="p-6 md:p-10 max-w-3xl w-full mx-auto space-y-6 animate-fade-in-up">
            <h1 className="font-playfair text-3xl font-bold text-[#180331]">System Settings</h1>
            <div className="bg-[#ffffff] p-6 rounded-2xl border border-[#ccc4cf]/40 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={localSettings.institutionName}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      institutionName: e.target.value,
                    }))
                  }
                  className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#4a454e] mb-1">
                  Event Theme Title
                </label>
                <input
                  type="text"
                  value={localSettings.heroTitle}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      heroTitle: e.target.value,
                    }))
                  }
                  className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-4 py-2.5 text-sm"
                />
              </div>
              <div className="pt-2">
                <button
                  onClick={handleSaveAppearance}
                  className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SLIDE-OVER DRAWER: ADD / EDIT DEPARTMENT                                  */}
      {/* ========================================================================= */}
      {isDeptDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsDeptDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#ffffff] shadow-2xl border-l border-[#ccc4cf]/40 flex flex-col justify-between overflow-y-auto animate-fade-in-up">
              <div className="p-6 border-b border-[#efeded] flex items-center justify-between">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-[#180331]">
                    {editingDeptId ? 'Edit Department' : 'Add New Department'}
                  </h2>
                  <p className="text-xs text-[#7b757f] mt-0.5">
                    {editingDeptId
                      ? 'Update department name, code, HOD, and description.'
                      : 'Create a new academic department for faculty members.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsDeptDrawerOpen(false)}
                  className="text-[#7b757f] hover:text-[#180331] p-1.5 rounded-full hover:bg-[#efeded] transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveDepartment} className="p-6 space-y-5 flex-1">
                {deptFormError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{deptFormError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Artificial Intelligence & Data Science"
                    value={deptFormName}
                    onChange={(e) => setDeptFormName(e.target.value)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#180331] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                    Department Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI-DS or CSE"
                    value={deptFormCode}
                    onChange={(e) => setDeptFormCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-sm font-mono focus:border-[#180331] outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                    Head of Department (HOD)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ramesh Gupta"
                    value={deptFormHOD}
                    onChange={(e) => setDeptFormHOD(e.target.value)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#180331] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                    Department Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe the department curriculum, labs, research focus, and student achievements..."
                    value={deptFormDescription}
                    onChange={(e) => setDeptFormDescription(e.target.value)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl p-3 text-xs focus:border-[#180331] outline-none resize-none"
                  />
                </div>

                <div className="pt-6 border-t border-[#efeded] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDeptDrawerOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-[#ccc4cf] text-xs font-semibold uppercase tracking-wider text-[#4a454e] hover:bg-[#efeded] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeptSubmitting}
                    className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg flex items-center gap-1.5"
                  >
                    <Check size={16} />
                    {isDeptSubmitting ? 'Saving...' : editingDeptId ? 'Save Changes' : 'Create Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER DRAWER: ADD / EDIT GALLERY ITEM                                */}
      {/* ========================================================================= */}
      {isGalleryDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsGalleryDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#ffffff] shadow-2xl border-l border-[#ccc4cf]/40 flex flex-col justify-between overflow-y-auto animate-fade-in-up">
              <div className="p-6 border-b border-[#efeded] flex items-center justify-between">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-[#180331]">
                    {editingGalleryId ? 'Edit Gallery Photo' : 'Add Image to Gallery'}
                  </h2>
                  <p className="text-xs text-[#7b757f] mt-0.5">
                    Paste Image URL, click Preview to verify, and Save to publish.
                  </p>
                </div>
                <button
                  onClick={() => setIsGalleryDrawerOpen(false)}
                  className="text-[#7b757f] hover:text-[#180331] p-1.5 rounded-full hover:bg-[#efeded] transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveGalleryItem} className="p-6 space-y-5 flex-1">
                {galleryFormError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{galleryFormError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                    Image URL *
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="url"
                      required
                      placeholder="Paste image URL (https://...)"
                      value={galleryFormImageUrl}
                      onChange={(e) => {
                        setGalleryFormImageUrl(e.target.value);
                        setImageLoadStatus('idle');
                      }}
                      className="flex-1 bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2 text-xs focus:border-[#180331] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleTestPreviewImage}
                      className="px-3.5 py-2 bg-[#180331] text-[#ffe088] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#2e1a47] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Preview this Image URL"
                    >
                      <Eye size={14} />
                      Preview
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#7b757f] mb-3">
                    <span>Or upload image from your device:</span>
                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="text-[#180331] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Upload size={12} />
                      Choose File
                    </button>
                    <input
                      ref={galleryFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'gallery')}
                    />
                  </div>

                  <div className="rounded-2xl border-2 border-dashed border-[#ccc4cf] p-2 bg-[#fbf9f8] relative overflow-hidden min-h-[170px] flex flex-col items-center justify-center">
                    {galleryFormImageUrl ? (
                      <div className="w-full relative rounded-xl overflow-hidden bg-[#000000] max-h-48 flex items-center justify-center">
                        <img
                          src={galleryFormImageUrl}
                          alt="Live Preview"
                          className="w-full max-h-48 object-cover rounded-xl"
                          onLoad={() => setImageLoadStatus('success')}
                          onError={() => setImageLoadStatus('error')}
                        />
                        <div className="absolute top-2 left-2 bg-[#180331]/90 text-[#ffe088] px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1">
                          <CheckCircle size={10} />
                          Live Preview Loaded
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 text-[#7b757f]">
                        <FileImage size={32} className="mx-auto text-[#ccc4cf] mb-1.5" />
                        <p className="text-xs font-medium text-[#180331]">No image loaded yet</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                    Memory Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Annual Faculty Award Gala"
                    value={galleryFormTitle}
                    onChange={(e) => setGalleryFormTitle(e.target.value)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#180331] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                      Category *
                    </label>
                    <select
                      value={galleryFormCategory}
                      onChange={(e) => setGalleryFormCategory(e.target.value as any)}
                      className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs focus:border-[#180331] outline-none cursor-pointer"
                    >
                      <option value="Events">Events</option>
                      <option value="Celebrations">Celebrations</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Classroom">Classroom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                      Date Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. September 2026"
                      value={galleryFormDate}
                      onChange={(e) => setGalleryFormDate(e.target.value)}
                      className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs focus:border-[#180331] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                    Description &amp; Caption
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe the occasion, mentors present, and students participating..."
                    value={galleryFormDescription}
                    onChange={(e) => setGalleryFormDescription(e.target.value)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl p-3 text-xs focus:border-[#180331] outline-none resize-none"
                  />
                </div>

                <div className="pt-6 border-t border-[#efeded] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsGalleryDrawerOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-[#ccc4cf] text-xs font-semibold uppercase tracking-wider text-[#4a454e] hover:bg-[#efeded] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGallerySubmitting || !galleryFormImageUrl}
                    className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg flex items-center gap-1.5"
                  >
                    <Check size={16} />
                    {isGallerySubmitting ? 'Saving...' : editingGalleryId ? 'Update & Save Image' : 'Save Image'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER DRAWER: ADD / EDIT TEACHER                                     */}
      {/* ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#ffffff] shadow-2xl border-l border-[#ccc4cf]/40 flex flex-col justify-between overflow-y-auto animate-fade-in-up">
              <div className="p-6 border-b border-[#efeded] flex items-center justify-between">
                <div>
                  <h2 className="font-playfair text-2xl font-bold text-[#180331]">
                    {editingTeacherId ? 'Edit Faculty Profile' : 'Add New Teacher'}
                  </h2>
                  <p className="text-xs text-[#7b757f] mt-0.5">
                    {editingTeacherId
                      ? 'Update faculty credentials and celebration invitation.'
                      : 'Add a new faculty member to the Teachers’ Day celebration portal.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-[#7b757f] hover:text-[#180331] p-1.5 rounded-full hover:bg-[#efeded] transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveTeacher} className="p-6 space-y-5 flex-1">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {formError}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e]">
                      Profile Photo
                    </label>
                    <button
                      type="button"
                      onClick={() => teacherFileInputRef.current?.click()}
                      className="text-xs text-[#180331] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Upload size={12} />
                      Upload File
                    </button>
                    <input
                      ref={teacherFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'teacher')}
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <img
                      src={formPhotoUrl || presetPhotos[0].url}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#ffe088] shadow-xs"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[#180331] mb-1">
                        Select Preset or Paste URL
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {presetPhotos.slice(0, 4).map((p, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setFormPhotoUrl(p.url)}
                            className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                              formPhotoUrl === p.url
                                ? 'bg-[#180331] text-[#ffffff] border-[#180331]'
                                : 'bg-[#f5f3f3] text-[#4a454e] border-[#ccc4cf]'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formPhotoUrl}
                    onChange={(e) => setFormPhotoUrl(e.target.value)}
                    className="w-full mt-2.5 bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs focus:border-[#180331] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Arvind Kumar"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#180331] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Professor of Advanced Physics"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#180331] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                    Department *
                  </label>
                  <select
                    value={formDeptId}
                    onChange={(e) => setFormDeptId(e.target.value)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#180331] outline-none cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] mb-1.5">
                    Subjects Taught
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="e.g. Quantum Mechanics"
                      value={currentTagInput}
                      onChange={(e) => setCurrentTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubjectTag();
                        }
                      }}
                      className="flex-1 bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs focus:border-[#180331] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubjectTag}
                      className="px-3 py-2 bg-[#180331] text-[#ffffff] rounded-xl text-xs font-semibold hover:bg-[#2e1a47] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-[#f5f3f3] rounded-xl border border-[#efeded]">
                    {formSubjects.map((tag) => (
                      <span
                        key={tag}
                        className="bg-[#fed65b]/30 text-[#180331] px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border border-[#fed65b]/50"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveSubjectTag(tag)}
                          className="hover:text-red-700 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e]">
                      Special Appreciation Message
                    </label>
                    <span className="text-[11px] text-[#7b757f]">
                      {formQuote.length} / 300
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={300}
                    placeholder="Thank you for being more than a teacher..."
                    value={formQuote}
                    onChange={(e) => setFormQuote(e.target.value)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl p-3 text-xs focus:border-[#180331] outline-none resize-none font-serif"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#7b757f] mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="faculty@eit.edu"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs focus:border-[#180331] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#7b757f] mb-1">
                      Office / Room
                    </label>
                    <input
                      type="text"
                      placeholder="Block 3, Room 402"
                      value={formOffice}
                      onChange={(e) => setFormOffice(e.target.value)}
                      className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs focus:border-[#180331] outline-none"
                    />
                  </div>
                </div>

                {/* 🎁 Gift & Appreciation Images for Book Page Viewer */}
                <div className="p-4 bg-[#fffdf5] rounded-2xl border-2 border-[#e8d8b0] space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#fed65b]/30 text-[#9a4b00]">
                        <Gift size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#180331] uppercase tracking-wider">
                          Gift & Appreciation Book Pages
                        </h4>
                        <p className="text-[11px] text-[#7b757f]">
                          Images shown as pages in the teacher's interactive book scroll viewer
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#9a4b00] bg-[#fed65b]/30 px-2 py-0.5 rounded-full">
                      {formGiftImages.length} {formGiftImages.length === 1 ? 'Page' : 'Pages'}
                    </span>
                  </div>

                  {/* Preset Gift Templates for Quick Adding */}
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7b757f] mb-1.5">
                      Quick Add Celebration Presets:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {DEFAULT_GIFT_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!formGiftImages.includes(preset.url)) {
                              setFormGiftImages([...formGiftImages, preset.url]);
                              setNotification(`Added "${preset.label}" to gift book! 🎁`);
                            }
                          }}
                          className="flex items-center gap-2 p-1.5 bg-[#ffffff] border border-[#e8d8b0] hover:border-[#9a4b00] rounded-xl text-left text-[11px] hover:bg-[#fff9e6] transition-colors cursor-pointer"
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-7 h-7 rounded-lg object-cover border border-[#e8d8b0]"
                          />
                          <span className="truncate font-medium text-[#180331]">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Add by URL input */}
                  <div>
                    <label className="block text-[11px] font-semibold text-[#4a454e] mb-1">
                      Add Custom Gift Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://... image URL (gift, certificate, scroll)"
                        value={giftImageUrlInput}
                        onChange={(e) => setGiftImageUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddGiftImageUrl();
                          }
                        }}
                        className="flex-grow bg-[#ffffff] border border-[#ccc4cf] rounded-xl px-3 py-2 text-xs focus:border-[#180331] outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddGiftImageUrl}
                        className="px-4 py-2 bg-[#180331] text-[#ffe088] rounded-xl text-xs font-semibold hover:bg-[#2e1a47] cursor-pointer whitespace-nowrap"
                      >
                        Add Page
                      </button>
                    </div>
                  </div>

                  {/* Upload Image Button */}
                  <div>
                    <input
                      type="file"
                      ref={giftFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'gift')}
                    />
                    <button
                      type="button"
                      onClick={() => giftFileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-dashed border-[#b89f70] hover:border-[#180331] rounded-xl text-xs font-semibold text-[#180331] bg-[#ffffff] hover:bg-[#faf5eb] transition-colors cursor-pointer"
                    >
                      <Upload size={14} className="text-[#9a4b00]" />
                      <span>Upload Gift / Certificate Image File</span>
                    </button>
                  </div>

                  {/* List of currently added gift pages */}
                  {formGiftImages.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7b757f]">
                        Book Pages ({formGiftImages.length}):
                      </span>
                      <div className="flex flex-wrap gap-2 p-2 bg-[#ffffff] rounded-xl border border-[#e8d8b0] max-h-40 overflow-y-auto">
                        {formGiftImages.map((url, idx) => (
                          <div
                            key={idx}
                            className="relative group rounded-lg overflow-hidden border border-[#e8d8b0] bg-[#fdfaf2] shadow-2xs"
                            style={{ width: '68px', height: '88px' }}
                          >
                            <img
                              src={url}
                              alt={`Gift page ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded font-mono">
                              p.{idx + 1}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveGiftImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                              title="Remove this page"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-[#efeded] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-[#ccc4cf] text-xs font-semibold uppercase tracking-wider text-[#4a454e] hover:bg-[#efeded] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : editingTeacherId ? 'Save Changes' : 'Save Teacher'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in-up">
          <div className="relative max-w-3xl w-full bg-[#ffffff] rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 text-[#ffffff] p-2 rounded-full hover:bg-black/80 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <img src={lightboxItem.imageUrl} alt={lightboxItem.title} className="w-full max-h-[65vh] object-cover" />
            <div className="p-6 bg-[#ffffff]">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#735c00] bg-[#fed65b]/20 px-2.5 py-1 rounded">
                  {lightboxItem.category}
                </span>
                <span className="text-xs text-[#7b757f] flex items-center gap-1">
                  <Calendar size={12} />
                  {lightboxItem.date}
                </span>
              </div>
              <h3 className="font-playfair text-2xl font-bold text-[#180331]">{lightboxItem.title}</h3>
              {lightboxItem.description && (
                <p className="text-xs text-[#4a454e] mt-2 leading-relaxed">{lightboxItem.description}</p>
              )}

              <div className="mt-5 pt-4 border-t border-[#efeded] flex items-center justify-between">
                <button
                  onClick={() => handleDownloadPhoto(lightboxItem)}
                  className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Download size={15} />
                  Download Full-Res Photo
                </button>
                <button
                  onClick={() => setLightboxItem(null)}
                  className="px-4 py-2 border border-[#ccc4cf] rounded-xl text-xs font-semibold text-[#4a454e] hover:bg-[#efeded] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
