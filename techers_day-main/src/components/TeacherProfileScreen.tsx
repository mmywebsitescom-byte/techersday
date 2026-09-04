import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  Quote,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Mail,
  MapPinned,
  Download,
  Gift,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Lock,
  Timer,
  PartyPopper,
} from 'lucide-react';
import { Teacher, CelebrationEvent, SiteSettings } from '../types';
import { Footer } from './Footer';
import { downloadImageFile } from '../utils/downloadUtils';
import { calculateTimeLeft, TimeLeft } from '../utils/countdownUtils';

interface TeacherProfileScreenProps {
  teacher: Teacher;
  allTeachers: Teacher[];
  eventInfo: CelebrationEvent;
  settings?: SiteSettings;
  onNavigate: (screen: 'home' | 'departments' | 'department-teachers' | 'teacher' | 'gallery' | 'admin') => void;
  onSelectTeacher: (teacher: Teacher) => void;
  onOpenRSVP: (teacher?: Teacher) => void;
  onBackToDepartment?: () => void;
}

// ─── Book Page Flip Viewer ──────────────────────────────────────────────────
interface GiftBookViewerProps {
  images: string[];
  teacherName: string;
  onClose: () => void;
}

const GiftBookViewer: React.FC<GiftBookViewerProps> = ({ images, teacherName, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');

  const goToPage = (dir: 'next' | 'prev') => {
    if (isFlipping) return;
    if (dir === 'next' && currentPage >= images.length - 1) return;
    if (dir === 'prev' && currentPage <= 0) return;
    setFlipDirection(dir);
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage((p) => (dir === 'next' ? p + 1 : p - 1));
      setIsFlipping(false);
    }, 420);
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToPage('next');
      if (e.key === 'ArrowLeft') goToPage('prev');
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPage, isFlipping]);

  const currentImage = images[currentPage];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40 text-white p-2.5 rounded-full transition-colors cursor-pointer border border-white/30"
      >
        <X size={22} />
      </button>

      {/* Book Container */}
      <div className="relative max-w-2xl w-full flex flex-col items-center gap-4">
        {/* Page Counter */}
        <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
          <Sparkles size={14} className="text-[#ffe088]" />
          <span>Gift for <strong className="text-[#ffe088]">{teacherName}</strong></span>
          <span className="text-white/50 mx-2">•</span>
          <span>{currentPage + 1} / {images.length}</span>
        </div>

        {/* Book / Page */}
        <div className="relative w-full" style={{ perspective: '1200px' }}>
          {/* Book spine shadow */}
          <div className="absolute left-1/2 top-0 bottom-0 w-4 -translate-x-1/2 z-10 pointer-events-none"
            style={{ boxShadow: '0 0 20px 6px rgba(0,0,0,0.45)', borderRadius: '2px' }} />

          {/* Page card with flip animation */}
          <div
            className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipping
                ? flipDirection === 'next'
                  ? 'rotateY(-15deg) scale(0.97)'
                  : 'rotateY(15deg) scale(0.97)'
                : 'rotateY(0deg) scale(1)',
              transition: 'transform 0.42s cubic-bezier(0.4, 0, 0.2, 1)',
              background: '#fffdf5',
              border: '3px solid #e8d8b0',
            }}
          >
            {/* Paper texture top stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 z-10"
              style={{ background: 'linear-gradient(90deg, #e8d8b0 0%, #f5e8c0 50%, #e8d8b0 100%)' }} />

            {/* Page lines texture */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-15"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 30px, #9b8770 30px, #9b8770 31px)',
                backgroundPosition: '0 46px',
              }} />

            {/* Main Image */}
            <div className="relative z-5 flex items-center justify-center min-h-[50vh] max-h-[65vh] bg-[#fffdf5] p-2">
              <img
                src={currentImage}
                alt={`Gift image ${currentPage + 1} for ${teacherName}`}
                className="max-h-[62vh] w-auto max-w-full object-contain rounded-xl shadow-md select-none"
                style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&auto=format&fit=crop&q=80';
                }}
              />
            </div>

            {/* Page number bottom */}
            <div className="absolute bottom-3 right-4 z-10 text-[#9b8770] text-xs font-medium italic">
              Page {currentPage + 1}
            </div>
            <div className="absolute bottom-3 left-4 z-10 text-[#9b8770] text-[11px] italic font-medium truncate max-w-[60%]">
              🎁 A gift for {teacherName}
            </div>

            {/* Bottom paper texture strip */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 z-10"
              style={{ background: 'linear-gradient(90deg, #e8d8b0 0%, #f5e8c0 50%, #e8d8b0 100%)' }} />
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-6 mt-2">
          <button
            onClick={() => goToPage('prev')}
            disabled={currentPage === 0 || isFlipping}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              currentPage === 0
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-[#ffe088] text-[#241a00] hover:bg-[#fed65b] hover:scale-105 shadow-md'
            }`}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!isFlipping) {
                    setFlipDirection(idx > currentPage ? 'next' : 'prev');
                    setCurrentPage(idx);
                  }
                }}
                className={`rounded-full transition-all cursor-pointer ${
                  idx === currentPage
                    ? 'w-5 h-2 bg-[#ffe088]'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => goToPage('next')}
            disabled={currentPage >= images.length - 1 || isFlipping}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              currentPage >= images.length - 1
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-[#ffe088] text-[#241a00] hover:bg-[#fed65b] hover:scale-105 shadow-md'
            }`}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Teacher Profile Screen ────────────────────────────────────────────
export const TeacherProfileScreen: React.FC<TeacherProfileScreenProps> = ({
  teacher,
  allTeachers,
  eventInfo,
  settings,
  onNavigate,
  onSelectTeacher,
  onOpenRSVP,
  onBackToDepartment,
}) => {
  const [isGiftViewerOpen, setIsGiftViewerOpen] = useState(false);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  // Find current teacher index for next/prev navigation
  const currentIndex = allTeachers.findIndex((t) => t.id === teacher.id);
  const prevTeacher = currentIndex > 0 ? allTeachers[currentIndex - 1] : allTeachers[allTeachers.length - 1];
  const nextTeacher = currentIndex < allTeachers.length - 1 ? allTeachers[currentIndex + 1] : allTeachers[0];

  // Shared Gifts: Priority = custom teacher gifts > global settings gifts > default presets
  const globalGifts = (settings?.giftImages || []).filter((url) => url && url.trim() !== '');
  const customGifts = (teacher.giftImages || []).filter((url) => url && url.trim() !== '');
  const defaultGiftUrls = [
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1000&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&auto=format&fit=crop&q=80',
  ];
  const displayGiftImages =
    customGifts.length > 0 ? customGifts : globalGifts.length > 0 ? globalGifts : defaultGiftUrls;

  // Reveal Schedule & Timer Logic
  const revealTargetDate = settings?.giftRevealDateTime || '2026-09-05T10:00';
  const [revealTimeLeft, setRevealTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(revealTargetDate));

  useEffect(() => {
    setRevealTimeLeft(calculateTimeLeft(revealTargetDate));
    const timer = setInterval(() => {
      setRevealTimeLeft(calculateTimeLeft(revealTargetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [revealTargetDate]);

  // Is revealed if admin explicitly unlocked (settings.giftIsRevealed !== false) OR if target time has arrived
  const isGiftRevealed = settings?.giftIsRevealed === true || revealTimeLeft.isExpired;

  // Card Theme Presets
  const themeStyles = {
    'indigo-gold': {
      cardBg: 'bg-[#180331]',
      border: 'border-[#2e1a47]',
      titleText: 'text-[#eedbff]',
      accentColor: 'text-[#ffe088]',
      btnBg: 'bg-[#ffe088]',
      btnText: 'text-[#241a00]',
      glow: 'rgba(255, 224, 136, 0.14)',
      boxBg: 'bg-[#ffffff]/10',
      boxBorder: 'border-[#ffffff]/10',
    },
    'royal-burgundy': {
      cardBg: 'bg-[#300714]',
      border: 'border-[#501026]',
      titleText: 'text-[#ffe4e6]',
      accentColor: 'text-[#fecdd3]',
      btnBg: 'bg-[#fecdd3]',
      btnText: 'text-[#4c0519]',
      glow: 'rgba(254, 205, 211, 0.16)',
      boxBg: 'bg-[#ffffff]/10',
      boxBorder: 'border-[#ffffff]/10',
    },
    'emerald-gold': {
      cardBg: 'bg-[#052e16]',
      border: 'border-[#14532d]',
      titleText: 'text-[#dcfce7]',
      accentColor: 'text-[#86efac]',
      btnBg: 'bg-[#86efac]',
      btnText: 'text-[#022c22]',
      glow: 'rgba(134, 239, 172, 0.16)',
      boxBg: 'bg-[#ffffff]/10',
      boxBorder: 'border-[#ffffff]/10',
    },
    'midnight-dark': {
      cardBg: 'bg-[#090d16]',
      border: 'border-[#1e293b]',
      titleText: 'text-[#e2e8f0]',
      accentColor: 'text-[#38bdf8]',
      btnBg: 'bg-[#38bdf8]',
      btnText: 'text-[#082f49]',
      glow: 'rgba(56, 189, 248, 0.16)',
      boxBg: 'bg-[#ffffff]/10',
      boxBorder: 'border-[#ffffff]/10',
    },
  };

  const currentTheme = themeStyles[eventInfo.accentTheme || 'indigo-gold'] || themeStyles['indigo-gold'];

  const rawHeading = eventInfo.invitationHeading || `You are Specially Invited to the ${eventInfo.title || "Teachers' Day Celebration 2026"}`;
  const formattedHeading = rawHeading.replace(/{teacherName}/g, teacher.name);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fbf9f8] text-[#1b1c1c]">
      {/* Gift Book Viewer Overlay */}
      {isGiftViewerOpen && displayGiftImages.length > 0 && (
        <GiftBookViewer
          images={displayGiftImages}
          teacherName={teacher.name}
          onClose={() => setIsGiftViewerOpen(false)}
        />
      )}

      {/* 🔒 Locked Gift Countdown Modal (Shown when clicked before reveal time) */}
      {isLockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#ffffff] max-w-md w-full rounded-3xl p-6 sm:p-8 relative shadow-2xl border-2 border-[#ffe088] text-center">
            <button
              onClick={() => setIsLockModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#7b757f] hover:text-[#180331] rounded-full hover:bg-[#f5f3f3] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#fed65b]/20 border-2 border-[#ffe088] flex items-center justify-center mx-auto mb-4 text-[#9a4b00] shadow-sm animate-pulse">
              <Lock size={30} />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9a4b00] bg-[#fed65b]/30 px-3 py-1 rounded-full border border-[#ffe088]/60 inline-block mb-3">
              Special Gift Locked
            </span>

            <h3 className="font-playfair text-2xl font-bold text-[#180331] mb-2">
              A Special Surprise Awaits!
            </h3>

            <p className="text-xs text-[#7b757f] mb-6 max-w-xs mx-auto leading-relaxed">
              {settings?.giftLockedMessage ||
                'A special gift and appreciation book is being prepared for all teachers! It will automatically reveal at the exact scheduled celebration time.'}
            </p>

            {/* Live Ticking Countdown */}
            <div className="grid grid-cols-4 gap-2 mb-5 p-3 rounded-2xl bg-[#fffdf5] border border-[#e8d8b0]">
              <div className="flex flex-col items-center">
                <span className="font-playfair text-xl font-bold text-[#180331] tabular-nums">
                  {revealTimeLeft.days.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase text-[#735c00] font-semibold">Days</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-playfair text-xl font-bold text-[#180331] tabular-nums">
                  {revealTimeLeft.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase text-[#735c00] font-semibold">Hours</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-playfair text-xl font-bold text-[#180331] tabular-nums">
                  {revealTimeLeft.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase text-[#735c00] font-semibold">Mins</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-playfair text-xl font-bold text-[#9a4b00] tabular-nums animate-pulse">
                  {revealTimeLeft.seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase text-[#9a4b00] font-semibold">Secs</span>
              </div>
            </div>

            <div className="text-[11px] text-[#735c00] font-medium flex items-center justify-center gap-1.5 mb-5">
              <Clock size={13} />
              <span>
                Exact Reveal Time: {new Date(revealTargetDate).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <button
              onClick={() => setIsLockModalOpen(false)}
              className="w-full py-3 bg-[#180331] text-[#ffe088] font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-[#2e1a47] transition-all cursor-pointer shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow pt-24 sm:pt-28 pb-20 px-5 md:px-8 max-w-[1200px] mx-auto w-full">
        {/* Navigation Breadcrumb / Teacher Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-[#ccc4cf]/30">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDepartment ? onBackToDepartment : () => onNavigate('departments')}
              className="inline-flex items-center gap-1.5 text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] hover:text-[#180331] transition-colors cursor-pointer group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to {teacher.departmentName} Faculty</span>
            </button>
            <span className="text-[#ccc4cf] text-xs">•</span>
            <button
              onClick={() => onNavigate('departments')}
              className="text-xs font-inter font-medium text-[#7b757f] hover:text-[#180331] transition-colors"
            >
              All Departments
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#7b757f] hidden sm:inline">
              Honoring Faculty {currentIndex + 1} of {allTeachers.length}
            </span>
            <button
              onClick={() => onSelectTeacher(prevTeacher)}
              className="p-2 rounded-full border border-[#ccc4cf]/50 hover:bg-[#efeded] text-[#180331] transition-colors cursor-pointer"
              title={`Previous: ${prevTeacher.name}`}
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => onSelectTeacher(nextTeacher)}
              className="p-2 rounded-full border border-[#ccc4cf]/50 hover:bg-[#efeded] text-[#180331] transition-colors cursor-pointer"
              title={`Next: ${nextTeacher.name}`}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Top Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center py-6 md:py-10 animate-fade-in-up">
          {/* Left Column: Image */}
          <div className="md:col-span-5 md:col-start-2 flex justify-center md:justify-end">
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-88 md:h-88 lg:w-96 lg:h-96 rounded-full overflow-hidden shadow-xl border-4 border-[#ffffff] ring-1 ring-[#ccc4cf]/40 bg-[#f5f3f3]">
              <img
                src={teacher.photoUrl}
                alt={teacher.name}
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80';
                }}
              />
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="md:col-span-5 flex flex-col justify-center space-y-6 text-center md:text-left">
            <div>
              <h1 className="font-playfair text-4xl sm:text-5xl md:text-5xl lg:text-6xl text-[#180331] font-bold mb-2 tracking-tight leading-tight">
                {teacher.name}
              </h1>
              <p className="font-playfair text-xl sm:text-2xl text-[#735c00] font-semibold italic">
                {teacher.designation}
              </p>
              <p className="text-xs text-[#7b757f] uppercase tracking-widest mt-1">
                {teacher.departmentName}
              </p>
            </div>

            {/* Subjects Taught */}
            <div>
              <h3 className="font-inter text-xs font-semibold text-[#4a454e] mb-3 uppercase tracking-wider">
                Subjects Taught
              </h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {teacher.subjects.map((subj, idx) => (
                  <span
                    key={idx}
                    className="bg-[#fed65b]/20 text-[#180331] px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-[#fed65b]/40 shadow-2xs"
                  >
                    {subj}
                  </span>
                ))}
              </div>
            </div>

            {/* Contact / Location Meta */}
            <div className="pt-2 flex flex-wrap items-center gap-3 justify-center md:justify-start text-xs text-[#7b757f]">
              {teacher.email && (
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-[#180331]" />
                  {teacher.email}
                </span>
              )}
              {teacher.officeLocation && (
                <span className="flex items-center gap-1.5">
                  <MapPinned size={14} className="text-[#180331]" />
                  {teacher.officeLocation}
                </span>
              )}
            </div>

            {/* Action Buttons: Download Portrait & View Gift */}
            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start pt-2">
              {/* 🎁 "View Gift" Button — Unlocked or Locked Countdown */}
              {isGiftRevealed ? (
                <button
                  type="button"
                  id="view-gift-button"
                  onClick={() => setIsGiftViewerOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#fed65b] via-[#ffe088] to-[#fcd34d] hover:from-[#fcd34d] hover:to-[#fed65b] text-[#241a00] rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#f59e0b]/50 group"
                  title="View Gift for Faculty Member"
                >
                  <Gift size={16} className="text-[#9a4b00] group-hover:rotate-12 transition-transform duration-300" />
                  <span>View Gift</span>
                  <span className="bg-[#241a00]/10 text-[#241a00] text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {displayGiftImages.length}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  id="view-gift-button"
                  onClick={() => setIsLockModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#fff8e7] to-[#fed65b]/30 hover:from-[#fed65b]/40 hover:to-[#fff8e7] text-[#180331] rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-[#ffe088] group"
                  title="Gift locked until scheduled ceremony time"
                >
                  <Lock size={15} className="text-[#9a4b00] animate-bounce-short" />
                  <span>
                    Locked • Reveals in {revealTimeLeft.days > 0 ? `${revealTimeLeft.days}d ` : ''}
                    {revealTimeLeft.hours.toString().padStart(2, '0')}:{revealTimeLeft.minutes.toString().padStart(2, '0')}:{revealTimeLeft.seconds.toString().padStart(2, '0')}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => downloadImageFile(teacher.photoUrl, `${teacher.name.replace(/\s+/g, '-')}-portrait.jpg`)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#ffffff] border border-[#ccc4cf] hover:border-[#180331] text-[#180331] rounded-xl text-xs font-semibold shadow-2xs hover:bg-[#f5f3f3] transition-colors cursor-pointer"
                title="Download Faculty Portrait"
              >
                <Download size={13} />
                Download Portrait
              </button>
            </div>
          </div>
        </div>

        {/* Special Appreciation Quote Section */}
        <div className="mt-16 md:mt-20 flex justify-center animate-fade-in-up">
          <div className="max-w-3xl w-full text-center bg-[#f5f3f3]/90 p-8 sm:p-12 md:p-14 rounded-2xl border border-[#ccc4cf]/40 relative shadow-2xs">
            <Quote
              className="absolute top-4 left-4 text-[#180331]/20 w-8 h-8 md:w-10 md:h-10"
              strokeWidth={1.5}
            />
            <p className="font-playfair text-xl sm:text-2xl md:text-3xl text-[#180331] relative z-10 italic font-semibold leading-relaxed px-4">
              "{teacher.appreciationQuote}"
            </p>
            <Quote
              className="absolute bottom-4 right-4 text-[#180331]/20 w-8 h-8 md:w-10 md:h-10 rotate-180"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* 🎁 Gift Section (Always shown with interactive paper-scroll look) */}
        {displayGiftImages.length > 0 && (
          <div className="mt-14 md:mt-16 animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#fed65b]/25 text-[#180331] shadow-2xs border border-[#ffe088]/50">
                  {isGiftRevealed ? <Gift size={20} className="text-[#9a4b00]" /> : <Lock size={20} className="text-[#9a4b00]" />}
                </div>
                <div>
                  <h2 className="font-playfair text-2xl sm:text-3xl text-[#180331] font-bold">
                    Gift &amp; Appreciation Book
                  </h2>
                  <p className="text-xs text-[#7b757f] mt-0.5">
                    {isGiftRevealed
                      ? `${displayGiftImages.length} page${displayGiftImages.length === 1 ? '' : 's'} honoring ${teacher.name} — click to open the page scroll`
                      : `A surprise gift collection is arriving for all teachers! Unlocks at exact ceremony time.`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => (isGiftRevealed ? setIsGiftViewerOpen(true) : setIsLockModalOpen(true))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                  isGiftRevealed
                    ? 'bg-[#180331] text-[#ffe088] hover:bg-[#2e1a47]'
                    : 'bg-[#fff8e7] text-[#9a4b00] border border-[#ffe088]'
                }`}
              >
                {isGiftRevealed ? <Gift size={14} /> : <Timer size={14} />}
                {isGiftRevealed ? 'Open Book' : 'View Countdown'}
              </button>
            </div>

            {/* Horizontal scroll thumbnail strip of gift images */}
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory pt-1"
                style={{ scrollbarWidth: 'thin', scrollbarColor: '#ffe088 #f0e8ff' }}>
                {displayGiftImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (isGiftRevealed) {
                        setIsGiftViewerOpen(true);
                      } else {
                        setIsLockModalOpen(true);
                      }
                    }}
                    className="flex-shrink-0 snap-start relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group"
                    style={{
                      width: '180px',
                      height: '240px',
                      background: '#fffdf5',
                      border: '2.5px solid #e8d8b0',
                    }}
                    title={isGiftRevealed ? `Gift page ${idx + 1} — click to open` : `Locked — click to view countdown timer`}
                  >
                    {/* Paper lines */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 z-0"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 18px, #9b8770 18px, #9b8770 19px)',
                        backgroundPosition: '0 28px',
                      }} />
                    {/* Top border stripe */}
                    <div className="absolute top-0 left-0 right-0 h-1 z-10"
                      style={{ background: 'linear-gradient(90deg, #e8d8b0, #f5e8c0, #e8d8b0)' }} />

                    <img
                      src={imgUrl}
                      alt={`Gift ${idx + 1}`}
                      className={`w-full h-full object-cover relative z-5 transition-all duration-300 ${
                        !isGiftRevealed ? 'blur-xs scale-105' : ''
                      }`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&auto=format&fit=crop&q=80';
                      }}
                    />

                    {/* Lock overlay if not revealed */}
                    {!isGiftRevealed && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-15 flex flex-col items-center justify-center text-white p-2">
                        <Lock size={24} className="text-[#ffe088] mb-1.5 drop-shadow" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffe088] text-center">
                          Secret Gift
                        </span>
                        <span className="text-[9px] text-white/80 text-center mt-0.5">
                          Reveals at ceremony
                        </span>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-[#180331]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                      <span className="text-[#ffe088] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        {isGiftRevealed ? <Gift size={14} /> : <Lock size={14} />}
                        {isGiftRevealed ? 'Open Gift' : 'View Timer'}
                      </span>
                    </div>

                    {/* Page number */}
                    <div className="absolute bottom-1.5 right-2.5 z-10 text-[#9b8770] text-[10px] italic">
                      p.{idx + 1}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 z-10"
                      style={{ background: 'linear-gradient(90deg, #e8d8b0, #f5e8c0, #e8d8b0)' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Invitation Section */}
        <div className="mt-16 md:mt-20 flex justify-center animate-fade-in-up">
          <div className={`w-full max-w-4xl ${currentTheme.cardBg} text-[#ffffff] rounded-2xl p-8 md:p-12 text-center shadow-xl relative overflow-hidden border ${currentTheme.border}`}>
            {/* Subtle background radial glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${currentTheme.glow}, transparent 70%)`
              }}
            />

            <h2 className={`font-playfair text-2xl sm:text-3xl md:text-4xl font-bold mb-8 ${currentTheme.titleText} tracking-tight relative z-10 leading-snug`}>
              {formattedHeading}
            </h2>

            {/* 3 Bento Date / Time / Venue Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10 relative z-10">
              <div className={`flex flex-col items-center p-5 ${currentTheme.boxBg} backdrop-blur-xs rounded-xl border ${currentTheme.boxBorder} hover:bg-[#ffffff]/15 transition-colors`}>
                <Calendar className={`w-7 h-7 mb-2.5 ${currentTheme.accentColor}`} />
                <p className="font-inter text-sm text-[#ccc4cf] uppercase tracking-wider text-[11px] mb-0.5">Date</p>
                <p className="font-inter text-lg md:text-xl font-semibold text-[#ffffff]">{eventInfo.date || '5 Sept 2026'}</p>
              </div>

              <div className={`flex flex-col items-center p-5 ${currentTheme.boxBg} backdrop-blur-xs rounded-xl border ${currentTheme.boxBorder} hover:bg-[#ffffff]/15 transition-colors`}>
                <Clock className={`w-7 h-7 mb-2.5 ${currentTheme.accentColor}`} />
                <p className="font-inter text-sm text-[#ccc4cf] uppercase tracking-wider text-[11px] mb-0.5">Time</p>
                <p className="font-inter text-lg md:text-xl font-semibold text-[#ffffff]">{eventInfo.time || '10:00 AM'}</p>
              </div>

              <div className={`flex flex-col items-center p-5 ${currentTheme.boxBg} backdrop-blur-xs rounded-xl border ${currentTheme.boxBorder} hover:bg-[#ffffff]/15 transition-colors`}>
                <MapPin className={`w-7 h-7 mb-2.5 ${currentTheme.accentColor}`} />
                <p className="font-inter text-sm text-[#ccc4cf] uppercase tracking-wider text-[11px] mb-0.5">Venue</p>
                <p className="font-inter text-lg md:text-xl font-semibold text-[#ffffff]">{eventInfo.venue || 'College Auditorium'}</p>
              </div>
            </div>

            {eventInfo.invitationNote && (
              <p className="text-xs sm:text-sm text-[#ffffff]/80 max-w-xl mx-auto mb-8 font-inter italic relative z-10">
                "{eventInfo.invitationNote}"
              </p>
            )}

            {eventInfo.showRsvpButton !== false && (
              <div className="relative z-10 flex justify-center">
                <button
                  onClick={() => onOpenRSVP(teacher)}
                  className={`${currentTheme.btnBg} ${currentTheme.btnText} px-8 py-3.5 rounded-xl font-inter text-xs font-bold tracking-wider uppercase hover:scale-[1.03] active:scale-[0.98] transition-transform shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer`}
                >
                  <CheckCircle size={16} />
                  {eventInfo.rsvpButtonText || 'RSVP CONFIRMATION'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action */}
        <div className="mt-14 flex justify-center">
          <button
            onClick={() => onNavigate('gallery')}
            className="flex items-center gap-2 text-[#180331] font-inter text-xs font-semibold tracking-wider uppercase border border-[#180331] px-7 py-3.5 rounded-xl hover:bg-[#180331]/5 transition-colors cursor-pointer"
          >
            <ImageIcon size={18} />
            VIEW MEMORIES
          </button>
        </div>
      </main>
    </div>
  );
};
