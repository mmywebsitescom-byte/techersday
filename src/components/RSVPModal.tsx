import React, { useState } from 'react';
import { X, CheckCircle, Calendar, Clock, MapPin, Sparkles, Heart } from 'lucide-react';
import { Teacher, CelebrationEvent, Department } from '../types';

interface RSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTeacher?: Teacher | null;
  allTeachers: Teacher[];
  departments: Department[];
  eventInfo: CelebrationEvent;
  onConfirmRSVP: (rsvpData: any) => Promise<void>;
}

export const RSVPModal: React.FC<RSVPModalProps> = ({
  isOpen,
  onClose,
  selectedTeacher,
  allTeachers,
  departments,
  eventInfo,
  onConfirmRSVP,
}) => {
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(
    selectedTeacher?.departmentName || departments[0]?.name || 'Science & Humanities'
  );
  const [targetTeacherId, setTargetTeacherId] = useState(selectedTeacher?.id || 'all');
  const [attending, setAttending] = useState<'Yes' | 'No' | 'Maybe'>('Yes');
  const [guestCount, setGuestCount] = useState(1);
  const [dietaryNeeds, setDietaryNeeds] = useState('Standard');
  const [wishesNote, setWishesNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !email) return;

    setIsSubmitting(true);
    try {
      const chosenTeacher = allTeachers.find((t) => t.id === targetTeacherId);
      await onConfirmRSVP({
        teacherId: chosenTeacher ? chosenTeacher.id : undefined,
        teacherName: chosenTeacher ? chosenTeacher.name : 'General Celebration',
        guestName,
        email,
        department,
        attending,
        guestCount,
        dietaryNeeds,
        wishesNote,
      });
      setIsSuccess(true);
    } catch (err) {
      alert('Failed to submit RSVP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in-up">
      <div className="bg-[#ffffff] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#ccc4cf]/40 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#7b757f] hover:text-[#180331] p-1.5 rounded-full hover:bg-[#efeded] transition-colors"
        >
          <X size={20} />
        </button>

        {!isSuccess ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#ffe088]/40 text-[#735c00] rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles size={24} />
              </div>
              <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#180331]">
                RSVP Confirmation
              </h2>
              <p className="font-inter text-xs text-[#7b757f] uppercase tracking-wider mt-1">
                {eventInfo.title} • {eventInfo.venue}
              </p>
            </div>

            {/* Event Summary Banner */}
            <div className="bg-[#f5f3f3] p-3.5 rounded-xl text-xs text-[#180331] flex justify-around mb-6 border border-[#efeded]">
              <div className="flex items-center gap-1.5 font-medium">
                <Calendar size={14} className="text-[#735c00]" />
                <span>{eventInfo.date}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Clock size={14} className="text-[#735c00]" />
                <span>{eventInfo.time}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin size={14} className="text-[#735c00]" />
                <span>{eventInfo.venue}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-inter">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#4a454e] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#180331] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4a454e] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@eit.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3.5 py-2.5 text-sm focus:border-[#180331] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4a454e] mb-1">
                    Your Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2.5 text-sm focus:border-[#180331] outline-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#4a454e] mb-1">
                  Specially Honoring (Faculty Member)
                </label>
                <select
                  value={targetTeacherId}
                  onChange={(e) => setTargetTeacherId(e.target.value)}
                  className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2.5 text-sm focus:border-[#180331] outline-none"
                >
                  <option value="all">All Faculty &amp; Mentors</option>
                  {allTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.departmentName.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4a454e] mb-1">
                    Attendance Status
                  </label>
                  <select
                    value={attending}
                    onChange={(e) => setAttending(e.target.value as any)}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2.5 text-sm focus:border-[#180331] outline-none"
                  >
                    <option value="Yes">Attending in Person</option>
                    <option value="Maybe">Tentative</option>
                    <option value="No">Sending Wishes Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#4a454e] mb-1">
                    Seats / Guests
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl px-3 py-2.5 text-sm focus:border-[#180331] outline-none"
                  >
                    <option value={1}>1 Seat</option>
                    <option value={2}>2 Seats</option>
                    <option value={3}>3 Seats</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#4a454e] mb-1">
                  Message of Gratitude / Tribute
                </label>
                <textarea
                  rows={2}
                  placeholder="Share a heartfelt message for your teachers..."
                  value={wishesNote}
                  onChange={(e) => setWishesNote(e.target.value)}
                  className="w-full bg-[#fbf9f8] border border-[#ccc4cf] rounded-xl p-3 text-xs focus:border-[#180331] outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle size={16} />
                  {isSubmitting ? 'Confirming...' : 'Submit RSVP Confirmation'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6 animate-fade-in-up">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-300">
              <CheckCircle size={32} />
            </div>

            <h2 className="font-playfair text-3xl font-bold text-[#180331] mb-2">
              RSVP Confirmed!
            </h2>
            <p className="text-xs text-[#4a454e] max-w-sm mx-auto mb-6">
              Thank you, <strong className="text-[#180331]">{guestName}</strong>. Your invitation reservation for {eventInfo.title} has been logged in the ceremonial register.
            </p>

            <div className="bg-[#f5f3f3] p-4 rounded-xl border border-[#ccc4cf]/40 text-left text-xs space-y-1.5 mb-6">
              <p><span className="font-semibold text-[#180331]">Auditorium Entry:</span> {eventInfo.date}, {eventInfo.time}</p>
              <p><span className="font-semibold text-[#180331]">Reserved Seats:</span> {guestCount} Attendee(s)</p>
              <p><span className="font-semibold text-[#180331]">Confirmation Email:</span> {email}</p>
            </div>

            <button
              onClick={handleReset}
              className="btn-primary px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
