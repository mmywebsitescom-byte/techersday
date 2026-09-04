import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Search, UserCheck, Mail, Quote, GraduationCap, Link as LinkIcon, Check } from 'lucide-react';
import { Department, Teacher, CelebrationEvent } from '../types';
import { Footer } from './Footer';

interface DepartmentFacultyScreenProps {
  department: Department;
  teachers: Teacher[];
  allDepartments?: Department[];
  eventInfo?: CelebrationEvent;
  onSelectDepartment?: (deptId: string) => void;
  onSelectTeacher: (teacher: Teacher) => void;
  onBackToDepartments?: () => void;
  onNavigate?: (screen: 'home' | 'departments' | 'department-teachers' | 'teacher' | 'gallery' | 'admin') => void;
  onOpenRSVP: (teacher?: Teacher) => void;
}

export const DepartmentFacultyScreen: React.FC<DepartmentFacultyScreenProps> = ({
  department,
  teachers,
  allDepartments = [],
  eventInfo,
  onSelectDepartment,
  onSelectTeacher,
  onBackToDepartments,
  onNavigate,
  onOpenRSVP,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter teachers for this department
  const deptTeachers = teachers.filter(
    (t) => t.departmentId.toLowerCase() === department.id.toLowerCase()
  );

  // Filter by search query
  const filteredTeachers = deptTeachers.filter((teacher) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(q) ||
      teacher.designation.toLowerCase().includes(q) ||
      teacher.subjects.some((s) => s.toLowerCase().includes(q))
    );
  });

  const handleCopyLink = async (e: React.MouseEvent, teacher: Teacher) => {
    e.stopPropagation();
    const url = `${window.location.origin}/teacher/${teacher.id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedId(teacher.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fbf9f8] text-[#1b1c1c]">
      <main className="flex-grow pt-24 sm:pt-28 pb-20 px-5 md:px-8 max-w-[1200px] mx-auto w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 pb-4 border-b border-[#ccc4cf]/30">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDepartments ? onBackToDepartments : () => onNavigate && onNavigate('departments')}
              className="inline-flex items-center gap-1.5 text-xs font-inter font-semibold uppercase tracking-wider text-[#4a454e] hover:text-[#180331] transition-colors cursor-pointer group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>All Departments</span>
            </button>
            <span className="text-[#ccc4cf] text-xs">•</span>
            <span className="text-xs font-inter font-bold text-[#180331]">
              {department.name} ({deptTeachers.length} Faculty)
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-4xl mx-auto mb-10">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7b757f]"
              />
              <input
                type="text"
                placeholder={`Search ${department.name} faculty by name or topic...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#ffffff] border border-[#ccc4cf]/60 focus:border-[#180331] rounded-xl text-xs font-inter outline-none shadow-xs transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Teachers Grid - Spacious 2-Column Layout */}
        {filteredTeachers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                onClick={() => onSelectTeacher(teacher)}
                className="bg-[#ffffff] rounded-3xl border border-[#ccc4cf]/40 hover:border-[#180331]/30 p-7 sm:p-8 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Accent top gold indicator */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#180331] via-[#fed65b] to-[#180331] opacity-0 group-hover:opacity-100 transition-opacity" />

                <div>
                  {/* Photo & Header */}
                  <div className="flex items-start sm:items-center gap-4 sm:gap-5 mb-5">
                    <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden shrink-0 border-2 border-[#ffffff] shadow-md ring-2 ring-[#ccc4cf]/40 group-hover:ring-[#180331] transition-all bg-[#f5f3f3]">
                      <img
                        src={teacher.photoUrl}
                        alt={teacher.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>

                    <div className="flex flex-col flex-1 min-w-0">
                      <h2 className="font-playfair text-2xl sm:text-[26px] font-bold text-[#180331] group-hover:text-[#2e1a47] transition-colors leading-tight">
                        {teacher.name}
                      </h2>
                      <span className="font-playfair text-sm sm:text-base font-semibold text-[#735c00] mt-1">
                        {teacher.designation}
                      </span>
                      <span className="font-inter text-xs text-[#7b757f] flex items-center gap-1.5 mt-1.5">
                        <Mail size={13} className="shrink-0 text-[#7b757f]" />
                        <span>{teacher.email || 'faculty@eit.edu'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Appreciation Quote / Student Message with Gold Quote */}
                  {teacher.appreciationQuote && (
                    <div className="bg-[#fbf9f8] p-4 sm:p-5 rounded-2xl border border-[#efeded] text-xs sm:text-sm font-inter italic text-[#4a454e] relative">
                      <Quote size={16} className="text-[#fed65b] fill-[#fed65b] mb-1.5" />
                      <p className="leading-relaxed text-[#4a454e]">
                        "{teacher.appreciationQuote}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Action Card Buttons */}
                <div className="pt-4 border-t border-[#efeded] flex items-center justify-between mt-5 gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleCopyLink(e, teacher)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        copiedId === teacher.id
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-[#f5f3f3] hover:bg-[#180331] hover:text-[#ffe088] text-[#4a454e]'
                      }`}
                      title="Copy this teacher's personal invitation URL"
                    >
                      {copiedId === teacher.id ? <Check size={13} /> : <LinkIcon size={13} />}
                      <span>{copiedId === teacher.id ? 'URL Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-inter font-bold text-[#180331] group-hover:text-[#735c00] transition-colors">
                    <span>View Tribute</span>
                    <div className="w-8 h-8 rounded-full bg-[#f5f3f3] group-hover:bg-[#180331] group-hover:text-[#ffe088] text-[#180331] flex items-center justify-center transition-all group-hover:translate-x-1 shadow-2xs">
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#ffffff] rounded-2xl border border-[#ccc4cf]/40 max-w-md mx-auto p-8 shadow-sm">
            <BookOpen size={40} className="mx-auto text-[#7b757f] mb-3" />
            <h3 className="font-playfair text-xl font-bold text-[#180331] mb-1">
              No Faculty Found
            </h3>
            <p className="text-xs text-[#7b757f] mb-4">
              No teachers in this department matched your search "{searchQuery}".
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
