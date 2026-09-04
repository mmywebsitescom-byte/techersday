import React from 'react';
import { Image as ImageIcon, ArrowRight } from 'lucide-react';
import { SiteSettings } from '../types';
import { CrestRenderer } from './CrestRenderer';
import { CountdownBox } from './CountdownBox';

interface HomeScreenProps {
  settings: SiteSettings;
  onNavigate: (screen: 'home' | 'departments' | 'department-teachers' | 'teacher' | 'gallery' | 'admin' | 'gift') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ settings, onNavigate }) => {
  // Transparent Gradient maps so they never wash out or obscure the background image
  const gradientStyles: Record<string, string> = {
    'subtle-purple': 'radial-gradient(circle at 50% 35%, rgba(238, 219, 255, 0.35) 0%, rgba(238, 219, 255, 0.05) 50%, transparent 75%)',
    'golden-warmth': 'radial-gradient(circle at 50% 35%, rgba(254, 214, 91, 0.30) 0%, rgba(254, 214, 91, 0.05) 50%, transparent 75%)',
    'regal-twilight': 'radial-gradient(circle at 50% 30%, rgba(103, 80, 164, 0.35) 0%, rgba(24, 3, 49, 0.15) 55%, transparent 85%)',
    'classic-cream': 'linear-gradient(180deg, rgba(251, 249, 248, 0.2) 0%, rgba(243, 238, 232, 0.1) 100%)',
    'dark-luxury': 'radial-gradient(circle at 50% 40%, rgba(35, 8, 62, 0.70) 0%, rgba(15, 2, 30, 0.85) 85%)',
    'none': 'none',
  };

  const isDark = settings.bgGradientStyle === 'dark-luxury';
  const textColorClass = isDark ? 'text-[#ffffff]' : 'text-[#1b1c1c]';
  const headingColorClass = isDark ? 'text-[#ffe088]' : 'text-[#180331]';
  const subtextColorClass = isDark ? 'text-[#d0c6d6]' : 'text-[#4a454e]';

  const currentGradient = gradientStyles[settings.bgGradientStyle] || gradientStyles['subtle-purple'];

  const bgImageOpacityVal = (settings.bgImageOpacity !== undefined ? settings.bgImageOpacity : 80) / 100;
  const bgOverlayOpacityVal = (settings.bgOverlayOpacity !== undefined ? settings.bgOverlayOpacity : 20) / 100;
  const bgBlurVal = settings.bgBlur !== undefined ? settings.bgBlur : 0;

  return (
    <div className={`min-h-screen flex flex-col justify-between relative ${textColorClass} overflow-hidden transition-colors duration-500`}>
      {/* Background Base Color Layer */}
      <div
        className="absolute inset-0 z-0 transition-all duration-300"
        style={{
          backgroundColor: isDark ? '#0f021e' : (settings.bgOverlayColor || '#fbf9f8'),
        }}
      />

      {/* Background Image Layer (100% Solid & Crystal Clear when set to 100%) */}
      {settings.bgImageUrl && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-300 pointer-events-none"
          style={{
            backgroundImage: `url(${settings.bgImageUrl})`,
            opacity: bgImageOpacityVal,
            filter: bgBlurVal > 0 ? `blur(${bgBlurVal}px)` : 'none',
            transform: bgBlurVal > 0 ? 'scale(1.03)' : 'none', // Prevents blurred edges from showing white border
          }}
        />
      )}

      {/* Optional Tint / Dimming Overlay (Controlled independently by user) */}
      {bgOverlayOpacityVal > 0 && (
        <div
          className="absolute inset-0 z-0 transition-all duration-300 pointer-events-none"
          style={{
            backgroundColor: settings.bgOverlayColor || '#fbf9f8',
            opacity: bgOverlayOpacityVal,
          }}
        />
      )}

      {/* Atmospheric Radial Gradient Glow (Uses transparent stops so it never blocks the background) */}
      {currentGradient !== 'none' && (
        <div
          className="absolute inset-0 z-0 pointer-events-none transition-all duration-300"
          style={{
            background: currentGradient,
          }}
        />
      )}

      {/* Main Center Content */}
      <main className="flex-grow flex items-center justify-center relative z-10 pt-24 sm:pt-28 pb-16 px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto w-full animate-fade-in-up">
          {/* Institutional Crest / Icon / Logo (Controlled by Admin) */}
          <CrestRenderer settings={settings} />

          {/* College / Institution Name */}
          <h2 className={`font-inter text-xs md:text-sm ${subtextColorClass} font-semibold mb-3 uppercase tracking-[0.2em]`}>
            {settings.institutionName || 'Excellence Institute of Technology'}
          </h2>

          {/* Hero Tagline / Subtitle */}
          {settings.heroTagline && (
            <span className="text-[11px] md:text-xs font-semibold tracking-wider uppercase text-[#735c00] bg-[#fed65b]/25 px-3.5 py-1 rounded-full border border-[#ffe088]/40 mb-4 inline-block shadow-xs backdrop-blur-xs">
              {settings.heroTagline}
            </span>
          )}

          {/* Main Hero Title */}
          <h1 className={`font-playfair text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-bold ${headingColorClass} mb-6 tracking-tight leading-[1.1] max-w-3xl drop-shadow-md`}>
            {settings.heroTitle || "Happy Teachers' Day"}
          </h1>

          {/* Appreciation Quote */}
          <p className={`font-inter text-base sm:text-lg md:text-xl ${subtextColorClass} mb-8 max-w-2xl italic font-normal leading-relaxed ${isDark ? 'drop-shadow-sm' : ''}`}>
            "{settings.heroQuote || 'To the world, you may be just a teacher, but to your students, you are a hero.'}"
          </p>

          {/* ⏳ Home Page Countdown Box ("Coming Soon: Something Big!") */}
          {settings.showCountdownBox !== false && (
            <div className="w-full mb-10">
              <CountdownBox
                targetDate={settings.countdownTargetDate || settings.giftRevealDateTime || '2026-09-05T10:00'}
                title={settings.countdownTitle || 'Coming Soon: Something Big!'}
                subtitle={settings.countdownSubtitle || "Teachers' Day Grand Celebration & Exclusive Gifts Reveal"}
                isDark={isDark}
                onExploreGifts={() => onNavigate('gift')}
              />
            </div>
          )}

          {/* Action Buttons (Controlled by Admin) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {settings.galleryButtonVisible !== false && (
              <button
                onClick={() => onNavigate('gallery')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-[#180331]/20 bg-[#ffffff]/90 hover:bg-[#ffffff] text-[#180331] font-inter text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs hover:scale-105 active:scale-95"
              >
                <ImageIcon size={16} />
                <span>{settings.galleryButtonText || 'GALLERY'}</span>
              </button>
            )}

            {settings.departmentsButtonVisible !== false && (
              <button
                onClick={() => onNavigate('departments')}
                className="w-full sm:w-auto btn-primary px-8 py-3.5 rounded-xl font-inter text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>{settings.departmentsButtonText || 'SELECT YOUR DEPARTMENT'}</span>
                <ArrowRight size={16} />
              </button>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};
