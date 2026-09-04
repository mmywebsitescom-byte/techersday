export interface Teacher {
  id: string;
  name: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  subjects: string[];
  photoUrl: string;
  appreciationQuote: string;
  bio?: string;
  dateAdded: string;
  email?: string;
  officeLocation?: string;
  giftImages?: string[]; // Admin-added gift/appreciation image URLs shown in book-page scroll viewer
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headOfDepartment: string;
  teacherCount: number;
}

export type GalleryCategory = 'All' | 'Events' | 'Classroom' | 'Faculty' | 'Celebrations';

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Events' | 'Classroom' | 'Faculty' | 'Celebrations';
  imageUrl: string;
  date: string;
  description?: string;
}

export interface RSVPRecord {
  id: string;
  teacherId?: string;
  teacherName?: string;
  guestName: string;
  email: string;
  department: string;
  attending: 'Yes' | 'No' | 'Maybe';
  guestCount: number;
  dietaryNeeds?: string;
  wishesNote?: string;
  submittedAt: string;
}

export interface CelebrationEvent {
  title: string;
  date: string;
  time: string;
  venue: string;
  year: string;
  invitationNote: string;
  invitationHeading?: string;
  rsvpButtonText?: string;
  showRsvpButton?: boolean;
  accentTheme?: 'indigo-gold' | 'royal-burgundy' | 'emerald-gold' | 'midnight-dark';
}

export type CrestType = 'default-crest' | 'custom-image' | 'academic-cap' | 'golden-trophy' | 'torch-of-wisdom' | 'star-crest' | 'book-open';
export type BadgeIconType = 'sparkles' | 'star' | 'trophy' | 'heart' | 'award' | 'graduation-cap' | 'flame';

export interface SiteSettings {
  // Institutional & Text Customization
  institutionName: string;
  heroTagline: string;
  heroTitle: string;
  heroQuote: string;
  heroQuoteAuthor?: string;

  // Icon / Crest Customization
  crestType: CrestType;
  customCrestImageUrl: string;
  badgeIcon: BadgeIconType;
  showSparkleBadge: boolean;
  crestBorderGlow: 'gold' | 'purple' | 'subtle' | 'none';
  crestSize: 'small' | 'medium' | 'large';

  // Home Background & Transparency
  backgroundMode: 'gradient' | 'image' | 'pattern';
  bgImageUrl: string;
  bgImageOpacity: number; // 0 to 100
  bgBlur: number; // 0 to 20 px
  bgOverlayColor: string;
  bgOverlayOpacity: number; // 0 to 100
  bgGradientStyle: 'subtle-purple' | 'golden-warmth' | 'regal-twilight' | 'classic-cream' | 'dark-luxury';

  // Buttons & Navigation
  galleryButtonText: string;
  galleryButtonVisible: boolean;
  departmentsButtonText: string;
  departmentsButtonVisible: boolean;
  rsvpButtonText: string;
  rsvpButtonVisible: boolean;

  // Browser Tab Icon & Title (Favicon)
  faviconUrl?: string;
  siteTabTitle?: string;

  // Global Gifts & Reveal System (Applies to all teachers simultaneously)
  giftImages?: string[]; // Global shared gift images for all teachers
  giftRevealDateTime?: string; // ISO or local datetime string e.g. "2026-09-05T10:00"
  giftIsRevealed?: boolean; // Admin override: true to reveal immediately, false to lock until countdown
  giftLockedMessage?: string; // Message shown while locked e.g. "A surprise gift is arriving for all teachers!"

  // Home Page Countdown Box ("Coming soon something big")
  showCountdownBox?: boolean;
  countdownTitle?: string; // e.g. "Coming Soon: Something Big!"
  countdownSubtitle?: string; // e.g. "Teachers' Day Grand Celebration & Exclusive Gifts"
  countdownTargetDate?: string; // Target date for countdown e.g. "2026-09-05T10:00"
}

