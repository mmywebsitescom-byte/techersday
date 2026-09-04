import React from 'react';

interface SkeletonProps {
  screen?: 'home' | 'departments' | 'department-teachers' | 'teacher' | 'gallery' | 'admin';
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ screen = 'home' }) => {
  return (
    <div className="min-h-screen bg-[#fbf9f8] flex flex-col justify-between relative overflow-hidden select-none animate-fade-in-up">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(238, 219, 255, 0.5) 0%, rgba(238, 219, 255, 0.1) 60%, transparent 80%)',
        }}
      />

      {/* ── Top Navbar Skeleton ────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/70 backdrop-blur-md border-b border-[#eedbff]/50 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full skeleton-shimmer" />
            <div className="flex flex-col gap-1.5">
              <div className="w-32 h-4 rounded-md skeleton-shimmer" />
              <div className="w-20 h-2.5 rounded-md skeleton-shimmer" />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <div className="w-16 h-4 rounded-md skeleton-shimmer" />
            <div className="w-24 h-4 rounded-md skeleton-shimmer" />
            <div className="w-16 h-4 rounded-md skeleton-shimmer" />
            <div className="w-28 h-9 rounded-full skeleton-shimmer" />
          </div>
        </div>
      </header>

      {/* ── Main Body Content Skeleton ─────────────────────────────────────── */}
      <main className="flex-grow flex flex-col items-center justify-center relative z-10 pt-28 pb-16 px-6 max-w-5xl mx-auto w-full">
        {screen === 'home' && (
          <div className="flex flex-col items-center text-center w-full max-w-3xl mx-auto">
            {/* Crest Badge */}
            <div className="w-20 h-20 rounded-full skeleton-shimmer shadow-lg mb-6" />

            {/* Sparkle Tagline */}
            <div className="w-64 h-6 rounded-full skeleton-shimmer mb-6" />

            {/* Hero Main Heading */}
            <div className="w-full max-w-lg h-12 rounded-xl skeleton-shimmer mb-3" />
            <div className="w-72 h-10 rounded-xl skeleton-shimmer mb-8" />

            {/* Quote Box Shimmer */}
            <div className="w-full max-w-xl p-6 rounded-2xl bg-white/80 border border-[#eedbff]/70 shadow-sm mb-8 flex flex-col items-center gap-3">
              <div className="w-full h-4 rounded-md skeleton-shimmer" />
              <div className="w-4/5 h-4 rounded-md skeleton-shimmer" />
              <div className="w-36 h-3 rounded-md skeleton-shimmer mt-2" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10">
              <div className="w-48 h-12 rounded-full skeleton-shimmer" />
              <div className="w-56 h-12 rounded-full skeleton-shimmer" />
            </div>

            {/* Countdown Box Shimmer */}
            <div className="w-full max-w-xl p-6 rounded-2xl bg-white/90 border border-[#eedbff] shadow-md flex flex-col items-center">
              <div className="w-48 h-5 rounded-md skeleton-shimmer mb-2" />
              <div className="w-64 h-3.5 rounded-md skeleton-shimmer mb-6" />
              <div className="grid grid-cols-4 gap-3 w-full max-w-md">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center p-3 rounded-xl bg-[#f5f3f3] gap-2">
                    <div className="w-10 h-8 rounded-md skeleton-shimmer" />
                    <div className="w-12 h-3 rounded-md skeleton-shimmer" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(screen === 'departments' || screen === 'department-teachers') && (
          <div className="w-full">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-48 h-8 rounded-xl skeleton-shimmer mb-3" />
              <div className="w-80 h-4 rounded-md skeleton-shimmer" />
            </div>

            {/* Grid of Department Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/80 border border-[#eedbff] shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl skeleton-shimmer" />
                    <div className="w-20 h-6 rounded-full skeleton-shimmer" />
                  </div>
                  <div className="w-40 h-5 rounded-md skeleton-shimmer" />
                  <div className="w-full h-3.5 rounded-md skeleton-shimmer" />
                  <div className="w-4/5 h-3.5 rounded-md skeleton-shimmer" />
                  <div className="w-full h-10 rounded-xl skeleton-shimmer mt-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {screen === 'teacher' && (
          <div className="w-full max-w-3xl bg-white/90 rounded-3xl p-8 border border-[#eedbff] shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="w-48 h-48 rounded-2xl skeleton-shimmer shrink-0" />
            <div className="flex flex-col gap-4 w-full">
              <div className="w-64 h-8 rounded-xl skeleton-shimmer" />
              <div className="w-40 h-4 rounded-md skeleton-shimmer" />
              <div className="w-48 h-4 rounded-md skeleton-shimmer" />
              <div className="flex gap-2 mt-2">
                <div className="w-20 h-7 rounded-full skeleton-shimmer" />
                <div className="w-24 h-7 rounded-full skeleton-shimmer" />
                <div className="w-20 h-7 rounded-full skeleton-shimmer" />
              </div>
              <div className="w-full h-20 rounded-xl skeleton-shimmer mt-4" />
            </div>
          </div>
        )}

        {screen === 'gallery' && (
          <div className="w-full">
            <div className="flex justify-center gap-3 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-24 h-9 rounded-full skeleton-shimmer" />
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-4/3 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer Skeleton ────────────────────────────────────────────────── */}
      <footer className="w-full border-t border-[#eedbff]/50 py-6 px-6 text-center bg-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-48 h-4 rounded-md skeleton-shimmer" />
          <div className="w-32 h-4 rounded-md skeleton-shimmer" />
        </div>
      </footer>
    </div>
  );
};
