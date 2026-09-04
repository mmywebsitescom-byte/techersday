import { Department, GalleryItem, Teacher, CelebrationEvent, SiteSettings } from '../types';

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  institutionName: "Excellence Institute of Technology",
  heroTagline: "Honoring the Architects of Our Future",
  heroTitle: "Happy Teachers' Day",
  heroQuote: "To the world, you may be just a teacher, but to your students, you are a hero.",
  heroQuoteAuthor: "Annual Ceremony 2026",

  // Icon / Crest Settings
  crestType: 'default-crest',
  customCrestImageUrl: '',
  badgeIcon: 'sparkles',
  showSparkleBadge: true,
  crestBorderGlow: 'gold',
  crestSize: 'medium',

  // Background & Transparency Settings
  backgroundMode: 'gradient',
  bgImageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80',
  bgImageOpacity: 85,
  bgBlur: 0,
  bgOverlayColor: '#fbf9f8',
  bgOverlayOpacity: 20,
  bgGradientStyle: 'subtle-purple',

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
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&auto=format&fit=crop&q=80',
  ],
  giftRevealDateTime: '2026-09-05T10:00',
  giftIsRevealed: false,
  giftLockedMessage: 'A Special Gift is arriving for all teachers! Unlocks at the exact scheduled celebration time.',

  // Home Page Countdown Box
  showCountdownBox: true,
  countdownTitle: 'Coming Soon: Something Big!',
  countdownSubtitle: "Teachers' Day Grand Ceremony & Secret Gift Reveal",
  countdownTargetDate: '2026-09-05T10:00',
};

export const PRESET_BACKGROUND_IMAGES = [
  {
    id: 'campus-library',
    name: 'Grand University Library',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80',
    category: 'Campus'
  },
  {
    id: 'academic-hall',
    name: 'Classic Academic Hall',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80',
    category: 'Campus'
  },
  {
    id: 'golden-celebration',
    name: 'Golden Festive Bokeh',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1600&auto=format&fit=crop&q=80',
    category: 'Celebration'
  },
  {
    id: 'books-warmth',
    name: 'Scholar Books & Warm Light',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&auto=format&fit=crop&q=80',
    category: 'Academic'
  },
  {
    id: 'graduation-dusk',
    name: 'Graduation & Twilight Sky',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80',
    category: 'Ceremony'
  },
  {
    id: 'marble-gold',
    name: 'Imperial Marble & Gold',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1600&auto=format&fit=crop&q=80',
    category: 'Luxury'
  }
];

export const PRESET_CREST_ICONS = [
  { id: 'default-crest', name: 'University Crest', icon: 'shield' },
  { id: 'academic-cap', name: 'Graduation Cap', icon: 'graduation-cap' },
  { id: 'golden-trophy', name: 'Excellence Trophy', icon: 'trophy' },
  { id: 'torch-of-wisdom', name: 'Torch of Wisdom', icon: 'flame' },
  { id: 'star-crest', name: 'Star of Honor', icon: 'star' },
  { id: 'book-open', name: 'Open Book of Knowledge', icon: 'book-open' },
  { id: 'custom-image', name: 'Custom Photo / Logo URL', icon: 'image' },
];

export const DEFAULT_GIFT_IMAGES: { label: string; url: string }[] = [
  {
    label: 'Golden Trophy of Honor',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Celebratory Gift Box & Wishes',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Scholar Books & Warm Light',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Graduation Ceremony & Joy',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_EVENT: CelebrationEvent = {
  title: "Teachers' Day Celebration 2026",
  date: "5 Sept 2026",
  time: "10:00 AM",
  venue: "College Auditorium",
  year: "2026",
  invitationNote: "Join us in celebrating the faculty mentors who shape tomorrow's innovators.",
  invitationHeading: "You are Specially Invited to the Teachers' Day Celebration 2026",
  rsvpButtonText: "RSVP CONFIRMATION",
  showRsvpButton: true,
  accentTheme: 'indigo-gold',
};

// Pure Supabase Data: All temporary and dummy records have been removed
export const INITIAL_DEPARTMENTS: Department[] = [];
export const INITIAL_TEACHERS: Teacher[] = [];
export const INITIAL_GALLERY: GalleryItem[] = [];
