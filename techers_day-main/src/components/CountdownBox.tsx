import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, PartyPopper, Star } from 'lucide-react';
import { calculateTimeLeft, TimeLeft } from '../utils/countdownUtils';

interface CountdownBoxProps {
  targetDate?: string;
  title?: string;
  subtitle?: string;
  isDark?: boolean;
  className?: string;
}

export const CountdownBox: React.FC<CountdownBoxProps> = ({
  targetDate,
  title = 'Coming Soon: Something Big!',
  subtitle = "Teachers' Day Grand Ceremony & Faculty Celebration",
  isDark = false,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetDate));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const padZero = (n: number) => n.toString().padStart(2, '0');

  const units = [
    { label: 'Days', value: padZero(timeLeft.days), accent: false },
    { label: 'Hours', value: padZero(timeLeft.hours), accent: false },
    { label: 'Mins', value: padZero(timeLeft.minutes), accent: false },
    { label: 'Secs', value: padZero(timeLeft.seconds), accent: true },
  ];

  return (
    <div
      className={`w-full max-w-2xl mx-auto rounded-3xl relative overflow-hidden transition-all duration-500 ${className}`}
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #180331 0%, #1a0a2e 50%, #0d0020 100%)'
          : 'linear-gradient(135deg, #fffdf5 0%, #fff8e7 50%, #fffaee 100%)',
        border: isDark ? '1.5px solid rgba(255,224,136,0.25)' : '1.5px solid #ddc98a',
        boxShadow: isDark
          ? '0 25px 60px rgba(0,0,0,0.55), 0 0 50px rgba(255,224,136,0.1), inset 0 1px 0 rgba(255,224,136,0.08)'
          : '0 20px 50px rgba(24,3,49,0.10), 0 0 40px rgba(254,214,91,0.30), inset 0 1px 0 rgba(255,255,255,0.8)',
        padding: '2rem 1.75rem',
      }}
    >
      {/* ── Corner Accent Lines ── */}
      <div
        className="absolute top-4 left-4 w-10 h-10 pointer-events-none"
        style={{
          borderTop: `2px solid ${isDark ? 'rgba(255,224,136,0.4)' : '#ddc98a'}`,
          borderLeft: `2px solid ${isDark ? 'rgba(255,224,136,0.4)' : '#ddc98a'}`,
          borderRadius: '6px 0 0 0',
        }}
      />
      <div
        className="absolute top-4 right-4 w-10 h-10 pointer-events-none"
        style={{
          borderTop: `2px solid ${isDark ? 'rgba(255,224,136,0.4)' : '#ddc98a'}`,
          borderRight: `2px solid ${isDark ? 'rgba(255,224,136,0.4)' : '#ddc98a'}`,
          borderRadius: '0 6px 0 0',
        }}
      />
      <div
        className="absolute bottom-4 left-4 w-10 h-10 pointer-events-none"
        style={{
          borderBottom: `2px solid ${isDark ? 'rgba(255,224,136,0.4)' : '#ddc98a'}`,
          borderLeft: `2px solid ${isDark ? 'rgba(255,224,136,0.4)' : '#ddc98a'}`,
          borderRadius: '0 0 0 6px',
        }}
      />
      <div
        className="absolute bottom-4 right-4 w-10 h-10 pointer-events-none"
        style={{
          borderBottom: `2px solid ${isDark ? 'rgba(255,224,136,0.4)' : '#ddc98a'}`,
          borderRight: `2px solid ${isDark ? 'rgba(255,224,136,0.4)' : '#ddc98a'}`,
          borderRadius: '0 0 6px 0',
        }}
      />

      {/* ── Decorative Glow Blobs ── */}
      <div
        className="absolute -top-10 -right-10 w-44 h-44 rounded-full pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(254,214,91,0.18) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(254,214,91,0.35) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(103,80,164,0.25) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(254,214,91,0.20) 0%, transparent 70%)',
          filter: 'blur(24px)',
        }}
      />

      {/* ── Decorative Stars ── */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-6 pointer-events-none">
        {[0, 1, 2].map((i) => (
          <Star
            key={i}
            size={i === 1 ? 11 : 7}
            className={isDark ? 'text-[#ffe088]/20' : 'text-[#ddc98a]/40'}
            fill="currentColor"
            style={{ animation: `twinkle ${2 + i}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        {/* Top Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest"
          style={{
            background: isDark ? 'rgba(255,224,136,0.12)' : 'rgba(254,214,91,0.20)',
            border: `1px solid ${isDark ? 'rgba(255,224,136,0.30)' : '#ddc98a'}`,
            color: isDark ? '#ffe088' : '#735c00',
          }}
        >
          <Sparkles size={13} className="animate-pulse" />
          <span>Coming Soon • Something Big</span>
          <Sparkles size={13} className="animate-pulse" />
        </div>

        {/* Icon */}
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xl"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(255,224,136,0.2), rgba(254,214,91,0.1))'
              : 'linear-gradient(135deg, #ffe088, #fcd34d)',
            border: `2px solid ${isDark ? 'rgba(255,224,136,0.3)' : '#ddc98a'}`,
            animation: 'float 3s ease-in-out infinite',
          }}
        >
          <Sparkles size={28} className={isDark ? 'text-[#ffe088]' : 'text-[#241a00]'} />
        </div>

        {/* Title */}
        <h3
          className="font-bold tracking-tight leading-tight"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(1.4rem, 4vw, 2.1rem)',
            color: isDark ? '#ffffff' : '#180331',
          }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="text-xs sm:text-sm max-w-md leading-relaxed"
            style={{ color: isDark ? 'rgba(255,255,255,0.55)' : '#7b757f' }}
          >
            {subtitle}
          </p>
        )}

        {/* Countdown Numbers or "Live" State */}
        {!timeLeft.isExpired ? (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-sm mt-1">
            {units.map(({ label, value, accent }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-2xl relative overflow-hidden"
                style={{
                  padding: '14px 8px 10px',
                  background: isDark
                    ? accent
                      ? 'linear-gradient(135deg, rgba(255,200,80,0.15), rgba(255,224,136,0.08))'
                      : 'rgba(255,255,255,0.05)'
                    : accent
                    ? 'linear-gradient(135deg, #fff8e7, #fffaee)'
                    : 'linear-gradient(135deg, #ffffff, #fffdf5)',
                  border: accent
                    ? `2px solid ${isDark ? 'rgba(255,200,80,0.45)' : '#f59e0b'}`
                    : `1.5px solid ${isDark ? 'rgba(255,224,136,0.15)' : '#ddc98a60'}`,
                  boxShadow: accent
                    ? isDark
                      ? '0 4px 20px rgba(255,200,80,0.15)'
                      : '0 4px 20px rgba(245,158,11,0.20)'
                    : '0 2px 10px rgba(0,0,0,0.06)',
                }}
              >
                {/* Top gleam */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: isDark
                      ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                  }}
                />
                <span
                  className="tabular-nums font-extrabold leading-none mb-1.5"
                  style={{
                    fontSize: 'clamp(1.4rem, 5vw, 2rem)',
                    color: accent ? (isDark ? '#fcd34d' : '#9a4b00') : isDark ? '#ffffff' : '#180331',
                    animation: accent ? 'pulse 1.5s ease-in-out infinite' : 'none',
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {value}
                </span>
                <span
                  className="font-bold uppercase tracking-widest"
                  style={{
                    fontSize: '9px',
                    color: accent ? (isDark ? '#fcd34d' : '#9a4b00') : isDark ? 'rgba(255,224,136,0.6)' : '#735c00',
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Expired / Unlocked State */
          <div
            className="w-full max-w-sm flex flex-col sm:flex-row items-center gap-4 rounded-2xl p-4"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(255,224,136,0.12), rgba(252,211,77,0.06))'
                : 'linear-gradient(135deg, rgba(254,214,91,0.25), rgba(255,224,136,0.15))',
              border: `2px solid ${isDark ? 'rgba(255,224,136,0.35)' : '#ddc98a'}`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: isDark ? '#180331' : '#180331' }}
            >
              <PartyPopper size={20} className="text-[#ffe088]" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-bold text-sm" style={{ color: isDark ? '#ffffff' : '#180331' }}>
                The Moment Has Arrived! 🎉
              </p>
              <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.55)' : '#7b757f' }}>
                Grand celebration &amp; faculty honors are underway now.
              </p>
            </div>
          </div>
        )}

        {/* Footer Clock Label */}
        <div
          className="flex items-center gap-1.5 text-[11px] font-semibold"
          style={{ color: isDark ? 'rgba(255,224,136,0.5)' : '#9b8770' }}
        >
          <Clock size={12} />
          <span>Scheduled Grand Celebration &amp; Faculty Honors</span>
        </div>
      </div>

      {/* Inline animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};
