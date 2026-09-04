import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Gift,
  Lock,
  Timer,
  Clock,
  PartyPopper,
  Heart,
  Star,
} from 'lucide-react';
import { SiteSettings, Teacher } from '../types';
import { calculateTimeLeft, TimeLeft } from '../utils/countdownUtils';

interface GiftPageProps {
  settings: SiteSettings;
  teachers: Teacher[];
  onNavigate: (screen: 'home' | 'departments' | 'department-teachers' | 'teacher' | 'gallery' | 'admin') => void;
}

// ── Floating Particles ────────────────────────────────────────────────────────
const FloatingParticles: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
    {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full opacity-30"
        style={{
          width: `${Math.random() * 6 + 2}px`,
          height: `${Math.random() * 6 + 2}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: i % 3 === 0 ? '#ffe088' : i % 3 === 1 ? '#fed65b' : '#fcd34d',
          animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 4}s`,
        }}
      />
    ))}
  </div>
);

// ── Page Flip Book Viewer ─────────────────────────────────────────────────────
interface PageViewerProps {
  images: string[];
  teacherName?: string;
}

const PageFlipViewer: React.FC<PageViewerProps> = ({ images, teacherName }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState<'next' | 'prev'>('next');
  const [isEntering, setIsEntering] = useState(false);

  const goTo = useCallback(
    (dir: 'next' | 'prev') => {
      if (isFlipping) return;
      if (dir === 'next' && currentPage >= images.length - 1) return;
      if (dir === 'prev' && currentPage <= 0) return;
      setFlipDir(dir);
      setIsFlipping(true);
      setIsEntering(true);
      setTimeout(() => {
        setCurrentPage((p) => (dir === 'next' ? p + 1 : p - 1));
        setIsFlipping(false);
        setTimeout(() => setIsEntering(false), 50);
      }, 450);
    },
    [currentPage, images.length, isFlipping]
  );

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo('next');
      if (e.key === 'ArrowLeft') goTo('prev');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo]);

  const img = images[currentPage];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      {/* Teacher / Gift Title */}
      {teacherName && (
        <div className="flex items-center gap-2 text-[#ffe088] text-sm font-semibold">
          <Heart size={15} className="fill-[#ffe088] text-[#ffe088]" />
          <span>
            Special Gift for{' '}
            <span className="text-[#fed65b] font-bold">{teacherName}</span>
          </span>
          <Heart size={15} className="fill-[#ffe088] text-[#ffe088]" />
        </div>
      )}

      {/* Book wrapper */}
      <div
        className="relative w-full rounded-2xl"
        style={{ perspective: '1400px' }}
      >
        {/* Spine shadow line */}
        <div
          className="absolute left-1/2 top-2 bottom-2 w-3 -translate-x-1/2 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(0,0,0,0.25), rgba(0,0,0,0.4), rgba(0,0,0,0.25), transparent)',
            borderRadius: '2px',
          }}
        />

        {/* Page card */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipping
              ? flipDir === 'next'
                ? 'rotateY(-18deg) scale(0.96)'
                : 'rotateY(18deg) scale(0.96)'
              : isEntering
              ? flipDir === 'next'
                ? 'rotateY(8deg) scale(0.98)'
                : 'rotateY(-8deg) scale(0.98)'
              : 'rotateY(0deg) scale(1)',
            transition: isFlipping
              ? 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)'
              : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            background: '#fffdf5',
            border: '3px solid #ddc98a',
            borderRadius: '18px',
            boxShadow:
              '0 30px 70px rgba(0,0,0,0.45), 0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          {/* Top paper stripe */}
          <div
            className="absolute top-0 left-0 right-0 h-2 z-10"
            style={{
              background:
                'linear-gradient(90deg, #c8a84b 0%, #e8d08a 25%, #f5e6b0 50%, #e8d08a 75%, #c8a84b 100%)',
            }}
          />

          {/* Ruled lines */}
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-8"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 36px, #9b877055 36px, #9b877055 37px)',
              backgroundPosition: '0 56px',
            }}
          />

          {/* Torn edge effect top right */}
          <div
            className="absolute top-2 right-0 w-8 h-full z-10 pointer-events-none"
            style={{
              background:
                'linear-gradient(270deg, rgba(200,165,80,0.08) 0%, transparent 100%)',
            }}
          />

          {/* Main image */}
          <div className="relative z-5 flex items-center justify-center min-h-[55vh] max-h-[70vh] bg-[#fffdf5] p-3">
            <img
              src={img}
              alt={`Gift page ${currentPage + 1}`}
              className="max-h-[66vh] w-auto max-w-full object-contain rounded-xl select-none"
              style={{
                filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.22))',
                transition: 'opacity 0.3s ease',
                opacity: isFlipping ? 0.4 : 1,
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          {/* Bottom meta */}
          <div className="absolute bottom-2.5 left-4 z-10 text-[#9b8770] text-[11px] italic font-medium">
            🎁 {teacherName ? `A gift for ${teacherName}` : "Teacher's Day Appreciation Gift"}
          </div>
          <div className="absolute bottom-2.5 right-4 z-10 text-[#9b8770] text-xs font-bold font-mono">
            {currentPage + 1}
          </div>

          {/* Bottom stripe */}
          <div
            className="absolute bottom-0 left-0 right-0 h-2 z-10"
            style={{
              background:
                'linear-gradient(90deg, #c8a84b 0%, #e8d08a 25%, #f5e6b0 50%, #e8d08a 75%, #c8a84b 100%)',
            }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-5">
        <button
          onClick={() => goTo('prev')}
          disabled={currentPage === 0 || isFlipping}
          className={`flex items-center gap-1.5 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
            currentPage === 0
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#ffe088] to-[#fed65b] text-[#241a00] hover:from-[#fed65b] hover:to-[#fcd34d] hover:scale-105 hover:shadow-xl active:scale-95'
          }`}
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (!isFlipping && idx !== currentPage) {
                  setFlipDir(idx > currentPage ? 'next' : 'prev');
                  setCurrentPage(idx);
                }
              }}
              className={`rounded-full transition-all cursor-pointer ${
                idx === currentPage
                  ? 'w-6 h-2.5 bg-[#ffe088] shadow-md shadow-[#ffe088]/40'
                  : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo('next')}
          disabled={currentPage >= images.length - 1 || isFlipping}
          className={`flex items-center gap-1.5 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
            currentPage >= images.length - 1
              ? 'bg-white/10 text-white/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#ffe088] to-[#fed65b] text-[#241a00] hover:from-[#fed65b] hover:to-[#fcd34d] hover:scale-105 hover:shadow-xl active:scale-95'
          }`}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Page counter */}
      <p className="text-white/50 text-[11px] tracking-widest uppercase">
        Page {currentPage + 1} of {images.length} &nbsp;•&nbsp; Use arrow keys to navigate
      </p>
    </div>
  );
};

// ── Teacher Card (Scroll List) ────────────────────────────────────────────────
interface TeacherGiftCardProps {
  teacher: Teacher;
  isRevealed: boolean;
  globalGiftImages: string[];
  defaultGifts: string[];
  onOpen: (teacher: Teacher, images: string[]) => void;
  index: number;
}

const TeacherGiftCard: React.FC<TeacherGiftCardProps> = ({
  teacher,
  isRevealed,
  globalGiftImages,
  defaultGifts,
  onOpen,
  index,
}) => {
  const customGifts = (teacher.giftImages || []).filter((u) => u.trim());
  const gifts =
    customGifts.length > 0 ? customGifts : globalGiftImages.length > 0 ? globalGiftImages : defaultGifts;

  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), index * 80);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className="relative group cursor-pointer"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)`,
      }}
      onClick={() => isRevealed && onOpen(teacher, gifts)}
    >
      <div
        className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
          isRevealed
            ? 'border-[#ddc98a]/60 hover:border-[#ffe088] hover:shadow-2xl hover:shadow-[#ffe088]/20 hover:-translate-y-1'
            : 'border-white/10 hover:border-white/20'
        }`}
        style={{
          background: isRevealed
            ? 'linear-gradient(135deg, #fffdf5 0%, #fff8e7 100%)'
            : 'rgba(255,255,255,0.05)',
        }}
      >
        {/* Paper line texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10 z-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 20px, #9b877044 20px, #9b877044 21px)',
            backgroundPosition: '0 32px',
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-1.5 z-10"
          style={{ background: 'linear-gradient(90deg, #c8a84b, #e8d08a, #c8a84b)' }}
        />

        {/* Preview thumbnail strip */}
        <div className="relative z-5 flex gap-1.5 p-2 pt-3.5">
          {gifts.slice(0, 3).map((url, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg flex-shrink-0"
              style={{ width: '62px', height: '72px' }}
            >
              <img
                src={url}
                alt=""
                className={`w-full h-full object-cover transition-all duration-300 ${
                  !isRevealed ? 'blur-sm scale-105' : 'group-hover:scale-105'
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&auto=format&fit=crop&q=80';
                }}
              />
              {!isRevealed && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Lock size={12} className="text-[#ffe088]" />
                </div>
              )}
            </div>
          ))}
          {gifts.length > 3 && (
            <div
              className="flex-shrink-0 rounded-lg bg-black/20 flex items-center justify-center"
              style={{ width: '62px', height: '72px' }}
            >
              <span className="text-white/60 font-bold text-xs">+{gifts.length - 3}</span>
            </div>
          )}
        </div>

        {/* Teacher info */}
        <div className="relative z-5 p-3 pb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#ddc98a] flex-shrink-0"
            >
              <img
                src={teacher.photoUrl}
                alt={teacher.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            <div className="min-w-0">
              <p
                className={`font-bold text-xs leading-tight truncate ${
                  isRevealed ? 'text-[#180331]' : 'text-white/80'
                }`}
              >
                {teacher.name}
              </p>
              <p className={`text-[10px] truncate ${isRevealed ? 'text-[#7b757f]' : 'text-white/50'}`}>
                {teacher.designation}
              </p>
            </div>
          </div>

          {/* CTA */}
          <div
            className={`mt-2.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider ${
              isRevealed ? 'text-[#9a4b00]' : 'text-white/40'
            }`}
          >
            <span className="flex items-center gap-1">
              {isRevealed ? (
                <>
                  <Gift size={11} />
                  {gifts.length} pages
                </>
              ) : (
                <>
                  <Lock size={11} />
                  Locked
                </>
              )}
            </span>
            {isRevealed && (
              <span className="flex items-center gap-0.5 text-[#9a4b00] group-hover:gap-1.5 transition-all">
                Open
                <ChevronRight size={11} />
              </span>
            )}
          </div>
        </div>

        {/* Bottom stripe */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1.5 z-10"
          style={{ background: 'linear-gradient(90deg, #c8a84b, #e8d08a, #c8a84b)' }}
        />

        {/* Hover glow */}
        {isRevealed && (
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(255,224,136,0.12), transparent 70%)',
            }}
          />
        )}
      </div>
    </div>
  );
};

// ── Locked State Screen ───────────────────────────────────────────────────────
const LockedScreen: React.FC<{
  timeLeft: TimeLeft;
  revealDate: string;
  lockedMessage?: string;
}> = ({ timeLeft, revealDate, lockedMessage }) => {
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 gap-8">
      {/* Lock icon with pulse animation */}
      <div className="relative">
        <div
          className="w-28 h-28 rounded-full border-4 border-[#ffe088]/40 flex items-center justify-center"
          style={{
            background: 'radial-gradient(circle, rgba(255,224,136,0.15) 0%, transparent 70%)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          <div
            className="w-20 h-20 rounded-full border-2 border-[#ffe088]/60 flex items-center justify-center"
            style={{ background: 'rgba(255,224,136,0.1)' }}
          >
            <Lock size={36} className="text-[#ffe088]" />
          </div>
        </div>
        {/* Orbiting star */}
        <div
          className="absolute top-0 right-0 w-6 h-6 rounded-full bg-[#ffe088] flex items-center justify-center shadow-lg"
          style={{ animation: 'spin 4s linear infinite' }}
        >
          <Star size={12} className="text-[#241a00] fill-[#241a00]" />
        </div>
      </div>

      <div>
        <p className="text-[#ffe088] text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
          <Sparkles size={14} />
          Special Surprise Gift — Locked
          <Sparkles size={14} />
        </p>
        <h2 className="text-white font-bold text-3xl sm:text-4xl mb-3">A Gift is Coming!</h2>
        <p className="text-white/60 text-sm max-w-md leading-relaxed">
          {lockedMessage ||
            'A very special appreciation gift book is being prepared for all teachers. It will automatically unlock at the exact ceremony moment!'}
        </p>
      </div>

      {/* Countdown */}
      <div className="grid grid-cols-4 gap-3 sm:gap-5 w-full max-w-sm">
        {[
          { label: 'Days', value: pad(timeLeft.days) },
          { label: 'Hours', value: pad(timeLeft.hours) },
          { label: 'Mins', value: pad(timeLeft.minutes) },
          { label: 'Secs', value: pad(timeLeft.seconds) },
        ].map(({ label, value }, i) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-2xl p-3 sm:p-4 border border-[#ffe088]/30"
            style={{
              background: 'rgba(255,224,136,0.08)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            <span
              className="font-bold tabular-nums leading-none mb-1"
              style={{
                fontSize: 'clamp(1.5rem, 5vw, 2.25rem)',
                color: i === 3 ? '#fed65b' : '#ffffff',
                animation: i === 3 ? 'pulse 1s ease-in-out infinite' : 'none',
              }}
            >
              {value}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#ffe088]/70">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-white/40 text-xs">
        <Clock size={13} />
        <span>
          Reveals:{' '}
          {new Date(revealDate).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

// ── Main Gift Page ────────────────────────────────────────────────────────────
const DEFAULT_GIFTS = [
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
];

export const GiftPage: React.FC<GiftPageProps> = ({ settings, teachers, onNavigate }) => {
  const revealDate = settings.giftRevealDateTime || '2026-09-05T10:00';
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(revealDate));
  const isRevealed = settings.giftIsRevealed === true || timeLeft.isExpired;

  const globalGifts = (settings.giftImages || []).filter((u) => u.trim());

  // Currently open gift viewer
  const [viewerTeacher, setViewerTeacher] = useState<Teacher | null>(null);
  const [viewerImages, setViewerImages] = useState<string[]>([]);
  const [viewerOpen, setViewerOpen] = useState(false);

  // Open global book (no specific teacher)
  const [globalViewerOpen, setGlobalViewerOpen] = useState(false);
  const globalGiftImages = globalGifts.length > 0 ? globalGifts : DEFAULT_GIFTS;

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(revealDate)), 1000);
    return () => clearInterval(timer);
  }, [revealDate]);

  const openTeacherGift = (teacher: Teacher, images: string[]) => {
    setViewerTeacher(teacher);
    setViewerImages(images);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerTeacher(null);
    setViewerImages([]);
  };

  // Prevent body scroll when viewer is open
  useEffect(() => {
    if (viewerOpen || globalViewerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [viewerOpen, globalViewerOpen]);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: 'linear-gradient(135deg, #0b0118 0%, #180331 40%, #1a0a2e 70%, #0d0020 100%)',
      }}
    >
      <FloatingParticles />

      {/* ── Full-Screen Book Viewer Overlay ───────────────────────── */}
      {(viewerOpen || globalViewerOpen) && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, #0b0118ee 0%, #180331f0 50%, #0b0118ee 100%)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeIn 0.35s ease',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => (viewerOpen ? closeViewer() : setGlobalViewerOpen(false))}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20 hover:scale-110 active:scale-95 shadow-lg"
          >
            <X size={20} />
          </button>

          <div className="w-full max-w-3xl overflow-y-auto max-h-full py-4">
            <PageFlipViewer
              images={viewerOpen ? viewerImages : globalGiftImages}
              teacherName={viewerOpen ? viewerTeacher?.name : undefined}
            />
          </div>
        </div>
      )}

      {/* ── Page Content ──────────────────────────────────────────── */}
      <div className="relative z-10">
        {/* Hero Header */}
        <div className="pt-28 sm:pt-32 pb-10 sm:pb-14 px-6 text-center" style={{ animation: 'fadeInUp 0.8s ease' }}>
          {/* Back button */}
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-[#ffe088]/70 hover:text-[#ffe088] text-xs font-semibold uppercase tracking-wider mb-8 transition-colors cursor-pointer group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </button>

          {/* Title Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#ffe088]/40 bg-[#ffe088]/10 text-[#ffe088] text-xs font-bold uppercase tracking-widest mb-5">
            <Sparkles size={13} className="animate-pulse" />
            <span>Teachers' Day</span>
            <Sparkles size={13} className="animate-pulse" />
          </div>

          <h1
            className="text-white font-bold mb-4 tracking-tight leading-tight"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(2.5rem, 7vw, 5rem)',
            }}
          >
            Gift &amp;{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #ffe088 0%, #fcd34d 50%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Appreciation
            </span>{' '}
            Book
          </h1>

          <p className="text-white/60 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {isRevealed
              ? 'A beautiful collection of appreciation and celebration images — created with love for every teacher.'
              : 'Something very special is being prepared for all teachers. The gift book will unlock at the exact ceremony time!'}
          </p>
        </div>

        {/* ── Locked State ──────────────────────────────────────────── */}
        {!isRevealed ? (
          <div className="px-6 pb-20">
            <LockedScreen
              timeLeft={timeLeft}
              revealDate={revealDate}
              lockedMessage={settings.giftLockedMessage}
            />
          </div>
        ) : (
          <>
            {/* ── Global Gift Book CTA ──────────────────────────────── */}
            <div className="px-6 mb-12 flex justify-center" style={{ animation: 'fadeInUp 0.8s 0.2s ease both' }}>
              <div
                className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 text-center border border-[#ffe088]/30 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,224,136,0.08), rgba(252,211,77,0.05))',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(255,224,136,0.08)',
                }}
              >
                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#ffe088]/30 rounded-tl-xl pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#ffe088]/30 rounded-br-xl pointer-events-none" />

                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#ffe088] to-[#f59e0b] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-[#ffe088]/25">
                    <Gift size={30} className="text-[#241a00]" />
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-400/15 border border-green-400/30 text-green-400 text-[10px] font-bold uppercase tracking-widest mb-4">
                    <PartyPopper size={11} />
                    Unlocked — {globalGiftImages.length} Pages
                  </div>

                  <h2 className="text-white font-bold text-xl sm:text-2xl mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    Open the Shared Gift Book
                  </h2>
                  <p className="text-white/50 text-xs sm:text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                    A beautiful book of appreciation and celebration images for all faculty members.
                  </p>

                  <button
                    onClick={() => setGlobalViewerOpen(true)}
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-2xl hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #ffe088 0%, #fcd34d 50%, #f59e0b 100%)',
                      color: '#241a00',
                      boxShadow: '0 8px 30px rgba(255,224,136,0.35)',
                    }}
                  >
                    <Gift size={18} />
                    Open Gift Book
                    <Sparkles size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Divider ─────────────────────────────────────────── */}
            {teachers.length > 0 && (
              <>
                <div className="px-6 mb-8 text-center" style={{ animation: 'fadeInUp 0.8s 0.3s ease both' }}>
                  <div className="flex items-center gap-4 max-w-2xl mx-auto">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#ffe088]/30" />
                    <span className="text-[#ffe088]/60 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                      Individual Faculty Gifts
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#ffe088]/30" />
                  </div>
                </div>

                {/* ── Teacher Cards Grid ─────────────────────────── */}
                <div className="px-6 pb-20 max-w-6xl mx-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {teachers.map((t, i) => (
                      <TeacherGiftCard
                        key={t.id}
                        teacher={t}
                        isRevealed={isRevealed}
                        globalGiftImages={globalGifts}
                        defaultGifts={DEFAULT_GIFTS}
                        onOpen={openTeacherGift}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Inline Animations ──────────────────────────────────────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(5deg); }
          66% { transform: translateY(-6px) rotate(-3deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg) translateX(38px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(38px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
};
