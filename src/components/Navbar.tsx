import React, { useState, useEffect, useRef } from 'react';
import { Home, Image as ImageIcon, Building2, ArrowLeft, Gift } from 'lucide-react';

type Screen = 'home' | 'departments' | 'department-teachers' | 'teacher' | 'gallery' | 'admin' | 'gift';

interface NavbarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

// Back navigation target & label mapping
const backMap: Partial<Record<Screen, { label: string; target: Screen }>> = {
  departments:           { label: 'Home', target: 'home' },
  'department-teachers': { label: 'Departments', target: 'departments' },
  teacher:               { label: 'Faculty', target: 'department-teachers' },
  gallery:               { label: 'Home', target: 'home' },
  gift:                  { label: 'Home', target: 'home' },
};

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, onNavigate }) => {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY <= 10 || currentY < lastScrollY.current) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 8) {
        setVisible(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide on admin screen
  if (currentScreen === 'admin') return null;

  const back = backMap[currentScreen];

  return (
    <div
      className="fixed top-4 sm:top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300 ease-out"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(-180%)',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Floating Centered Pill Bar */}
      <nav
        className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-[#ffffff]/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full border border-[#180331]/12 shadow-xl shadow-[#180331]/10 mx-auto"
        aria-label="Main Navigation"
      >
        {/* Back Button (Shown when not on Home) */}
        {back && (
          <>
            <button
              onClick={() => onNavigate(back.target)}
              className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full font-inter text-xs font-semibold text-[#180331] bg-[#efeded] hover:bg-[#180331] hover:text-[#ffffff] transition-all cursor-pointer group"
              title={`Back to ${back.label}`}
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-[#ccc4cf]/60 mx-0.5" />
          </>
        )}

        {/* Home Button */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-inter text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            currentScreen === 'home'
              ? 'bg-[#180331] text-[#ffffff] shadow-xs'
              : 'text-[#4a454e] hover:text-[#180331] hover:bg-[#efeded]'
          }`}
          title="Go to Home"
        >
          <Home size={14} />
          <span>Home</span>
        </button>

        {/* Departments Button */}
        <button
          onClick={() => onNavigate('departments')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-inter text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            currentScreen === 'departments' ||
            currentScreen === 'department-teachers' ||
            currentScreen === 'teacher'
              ? 'bg-[#180331] text-[#ffffff] shadow-xs'
              : 'text-[#4a454e] hover:text-[#180331] hover:bg-[#efeded]'
          }`}
          title="View Departments"
        >
          <Building2 size={14} />
          <span>Departments</span>
        </button>

        {/* Gallery Button */}
        <button
          onClick={() => onNavigate('gallery')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-inter text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            currentScreen === 'gallery'
              ? 'bg-[#180331] text-[#ffffff] shadow-xs'
              : 'text-[#4a454e] hover:text-[#180331] hover:bg-[#efeded]'
          }`}
          title="View Gallery Memories"
        >
          <ImageIcon size={14} />
          <span>Gallery</span>
        </button>

        {/* Gift Page Button */}
        <button
          onClick={() => onNavigate('gift')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-inter text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            currentScreen === 'gift'
              ? 'bg-gradient-to-r from-[#ffe088] to-[#fed65b] text-[#241a00] shadow-sm'
              : 'text-[#735c00] hover:text-[#241a00] hover:bg-[#fed65b]/20'
          }`}
          title="View Gift Book"
        >
          <Gift size={14} />
          <span>Gifts</span>
        </button>
      </nav>
    </div>
  );
};
