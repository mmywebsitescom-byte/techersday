import React, { useState } from 'react';
import { ShieldCheck, Mail, Globe, X } from 'lucide-react';

interface FooterProps {
  variant?: 'minimal' | 'full';
  onNavigate?: (screen: 'home' | 'departments' | 'teacher' | 'gallery' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ variant = 'full', onNavigate }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'support' | 'college' | null>(null);

  if (variant === 'minimal') {
    return (
      <footer className="w-full py-8 px-5 md:px-6 flex flex-col items-center justify-center text-center z-10 border-t border-[#ccc4cf]/30 bg-[#f5f3f3]/40">
        <p className="font-inter text-sm text-[#4a454e]">
          © 2024 Excellence in Education. Honoring our mentors.
        </p>
      </footer>
    );
  }

  return (
    <>
      <footer className="w-full py-16 px-5 md:px-8 bg-[#e4e2e2]/60 border-t border-[#ccc4cf]/30 mt-auto">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-playfair text-xl font-semibold text-[#180331]">
            Honoring Mentors
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8 items-center text-sm font-inter text-[#4a454e]">
            <button 
              onClick={() => setActiveModal('privacy')}
              className="hover:text-[#180331] transition-colors"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => setActiveModal('support')}
              className="hover:text-[#180331] transition-colors"
            >
              Contact Support
            </button>
            <button 
              onClick={() => setActiveModal('college')}
              className="hover:text-[#180331] transition-colors"
            >
              College Home
            </button>
          </div>

          <div className="text-sm font-inter text-[#4a454e]">
            © 2024 Excellence in Education. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Info Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in-up">
          <div className="bg-[#ffffff] rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-[#ccc4cf]/30 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-[#7b757f] hover:text-[#180331] p-1.5 rounded-full hover:bg-[#efeded] transition-colors"
            >
              <X size={20} />
            </button>

            {activeModal === 'privacy' && (
              <div>
                <div className="flex items-center gap-3 mb-4 text-[#180331]">
                  <ShieldCheck size={28} />
                  <h3 className="font-playfair text-2xl font-bold">Privacy & Data Policy</h3>
                </div>
                <p className="text-[#4a454e] text-sm leading-relaxed mb-4">
                  The Excellence Institute of Technology Teachers' Day portal values the privacy of our faculty, students, and alumni. Contact details and RSVPs collected through this system are used exclusively for institutional ceremonial communications.
                </p>
                <div className="bg-[#f5f3f3] p-4 rounded-xl text-xs text-[#4a454e] space-y-2">
                  <p>• Data is encrypted and securely maintained in institutional servers.</p>
                  <p>• Photos are submitted with honorary consent for the institution's archive.</p>
                </div>
              </div>
            )}

            {activeModal === 'support' && (
              <div>
                <div className="flex items-center gap-3 mb-4 text-[#180331]">
                  <Mail size={28} />
                  <h3 className="font-playfair text-2xl font-bold">Contact Ceremony Support</h3>
                </div>
                <p className="text-[#4a454e] text-sm leading-relaxed mb-4">
                  For inquiries regarding invitation seatings, faculty submissions, or ceremonial schedules, contact the Organizing Committee:
                </p>
                <div className="space-y-2 text-sm text-[#1b1c1c] bg-[#f5f3f3] p-4 rounded-xl">
                  <p><span className="font-semibold text-[#180331]">Email:</span> teachersday@eit.edu</p>
                  <p><span className="font-semibold text-[#180331]">Helpdesk:</span> +1 (555) 019-2834</p>
                  <p><span className="font-semibold text-[#180331]">Auditorium Desk:</span> Block A, Admin Wing 102</p>
                </div>
              </div>
            )}

            {activeModal === 'college' && (
              <div>
                <div className="flex items-center gap-3 mb-4 text-[#180331]">
                  <Globe size={28} />
                  <h3 className="font-playfair text-2xl font-bold">Excellence Institute of Technology</h3>
                </div>
                <p className="text-[#4a454e] text-sm leading-relaxed mb-4">
                  Established in 1978, Excellence Institute of Technology is dedicated to nurturing technical brilliance, human compassion, and scientific inquiry through world-class mentorship.
                </p>
                <div className="bg-[#f5f3f3] p-4 rounded-xl text-xs text-[#4a454e] flex justify-between items-center">
                  <span>Main Campus • Central Avenue, University Park</span>
                  <span className="font-semibold text-[#180331]">Est. 1978</span>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-[#180331] text-[#ffffff] px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-[#2e1a47] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
