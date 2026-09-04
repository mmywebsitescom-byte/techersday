import React from 'react';
import {
  Sparkles,
  GraduationCap,
  Trophy,
  Award,
  Heart,
  Star,
  Flame,
  BookOpen,
  Shield,
} from 'lucide-react';
import { SiteSettings, BadgeIconType } from '../types';

interface CrestRendererProps {
  settings: SiteSettings;
  className?: string;
  sizeOverride?: 'small' | 'medium' | 'large';
}

export const CrestRenderer: React.FC<CrestRendererProps> = ({
  settings,
  className = '',
  sizeOverride,
}) => {
  const size = sizeOverride || settings.crestSize || 'medium';

  // Sizing definitions
  const sizeClasses = {
    small: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32',
    medium: 'w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44',
    large: 'w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52',
  };

  const iconSizes = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const badgeIconSizes = {
    small: 12,
    medium: 15,
    large: 18,
  };

  // Border glow styles
  const glowClasses = {
    gold: 'border-[#ffe088] shadow-[0_0_30px_rgba(255,224,136,0.45)]',
    purple: 'border-[#6750a4] shadow-[0_0_30px_rgba(103,80,164,0.35)]',
    subtle: 'border-[#ccc4cf]/60 shadow-sm',
    none: 'border-transparent shadow-none',
  };

  const currentGlow = glowClasses[settings.crestBorderGlow] || glowClasses.gold;

  // Render Badge Icon
  const renderBadgeIcon = (iconType: BadgeIconType) => {
    const bSize = badgeIconSizes[size] || 15;
    switch (iconType) {
      case 'star':
        return <Star size={bSize} fill="currentColor" />;
      case 'trophy':
        return <Trophy size={bSize} />;
      case 'heart':
        return <Heart size={bSize} fill="currentColor" />;
      case 'award':
        return <Award size={bSize} />;
      case 'graduation-cap':
        return <GraduationCap size={bSize} />;
      case 'flame':
        return <Flame size={bSize} fill="currentColor" />;
      case 'sparkles':
      default:
        return <Sparkles size={bSize} />;
    }
  };

  return (
    <div
      className={`${sizeClasses[size]} mb-8 rounded-full overflow-visible flex items-center justify-center relative group transition-all duration-300 ${className}`}
    >
      {/* Outer Shell Ring — clear circle with glow */}
      <div
        className={`w-full h-full rounded-full border-4 ${currentGlow} overflow-hidden flex items-center justify-center shadow-xl transition-all duration-300`}
        style={{ background: '#ffffff' }}
      >
        {/* Inner Content — fills the circle completely for custom image, or padded for icons */}
        <div
          className={`w-full h-full rounded-full flex items-center justify-center overflow-hidden relative ${
            settings.crestType === 'custom-image' ? '' : 'bg-gradient-to-b from-[#fbf9f8] to-[#eedbff]/40 p-4'
          }`}
          style={settings.crestType !== 'custom-image' ? { border: '1px solid rgba(255,224,136,0.5)' } : undefined}
        >
          {/* 1. Custom Image — fills the full circle, no padding */}
          {settings.crestType === 'custom-image' && (
            <img
              src={
                settings.customCrestImageUrl ||
                'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80'
              }
              alt="Custom Logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80';
              }}
            />
          )}

          {/* 2. Default SVG Institutional Crest */}
          {settings.crestType === 'default-crest' && (
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full text-[#180331]"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="50" cy="50" r="45" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="50" cy="50" r="40" strokeWidth="1" />
              <path d="M50 20 L78 34 L50 48 L22 34 Z" fill="#180331" />
              <path
                d="M32 44 L32 64 C32 74 68 74 68 64 L68 44"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path d="M78 36 L78 58" strokeWidth="2" strokeLinecap="round" />
              <circle cx="78" cy="60" r="2" fill="#735c00" />
              <path d="M30 76 C40 84 60 84 70 76" strokeWidth="1.5" stroke="#735c00" />
              <circle cx="50" cy="74" r="1.5" fill="#735c00" />
              <circle cx="43" cy="76" r="1.2" fill="#735c00" />
              <circle cx="57" cy="76" r="1.2" fill="#735c00" />
            </svg>
          )}

          {/* 3. Academic Cap */}
          {settings.crestType === 'academic-cap' && (
            <div className="flex flex-col items-center justify-center text-[#180331]">
              <GraduationCap size={iconSizes[size]} className="drop-shadow-sm" />
              <div className="w-8 h-1 bg-[#ffe088] rounded-full mt-1.5" />
            </div>
          )}

          {/* 4. Golden Trophy */}
          {settings.crestType === 'golden-trophy' && (
            <div className="flex flex-col items-center justify-center text-[#735c00]">
              <Trophy size={iconSizes[size]} className="drop-shadow-sm" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#180331] mt-1">
                Excellence
              </span>
            </div>
          )}

          {/* 5. Torch of Wisdom / Flame */}
          {settings.crestType === 'torch-of-wisdom' && (
            <div className="flex flex-col items-center justify-center text-[#9a4b00]">
              <Flame size={iconSizes[size]} className="drop-shadow-sm" fill="#ffe088" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#180331] mt-1">
                Wisdom
              </span>
            </div>
          )}

          {/* 6. Star Crest */}
          {settings.crestType === 'star-crest' && (
            <div className="flex flex-col items-center justify-center text-[#735c00]">
              <Star size={iconSizes[size]} className="drop-shadow-sm" fill="#fed65b" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#180331] mt-1">
                Honor
              </span>
            </div>
          )}

          {/* 7. Open Book */}
          {settings.crestType === 'book-open' && (
            <div className="flex flex-col items-center justify-center text-[#180331]">
              <BookOpen size={iconSizes[size]} className="drop-shadow-sm" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#735c00] mt-1">
                Scholar
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Badge Icon in bottom-right corner */}
      {settings.showSparkleBadge && (
        <div className="absolute -bottom-1 -right-1 bg-[#180331] text-[#ffe088] p-2 rounded-full shadow-lg border border-[#ffe088]/40 animate-pulse">
          {renderBadgeIcon(settings.badgeIcon)}
        </div>
      )}
    </div>
  );
};
