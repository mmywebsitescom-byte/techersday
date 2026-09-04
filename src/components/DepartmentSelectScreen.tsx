import React, { useState } from 'react';
import { ArrowRight, BookOpen, Users, Sparkles, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { Department, Teacher } from '../types';
import { Footer } from './Footer';

interface DepartmentSelectScreenProps {
  departments: Department[];
  teachers: Teacher[];
  onSelectDepartment: (departmentId: string) => void;
  onSelectTeacher: (teacher: Teacher) => void;
  onNavigate?: (screen: 'home' | 'departments' | 'teacher' | 'gallery' | 'admin') => void;
}

export const DepartmentSelectScreen: React.FC<DepartmentSelectScreenProps> = ({
  departments,
  teachers,
  onSelectDepartment,
  onSelectTeacher,
  onNavigate,
}) => {
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);

  // Group teachers by department for preview
  const deptTeachers = selectedDeptId
    ? teachers.filter((t) => t.departmentId.toLowerCase() === selectedDeptId.toLowerCase())
    : [];

  const handleCardClick = (deptId: string) => {
    onSelectDepartment(deptId);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#fbf9f8] text-[#1b1c1c]">
      <main className="flex-grow pt-24 sm:pt-28 pb-20 px-5 md:px-8 max-w-[1200px] mx-auto w-full flex flex-col items-center">
        {/* Header Section */}
        <header className="text-center mb-10 md:mb-14 w-full animate-fade-in-up">
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-[56px] text-[#180331] font-bold mb-4 tracking-tight uppercase">
            SELECT YOUR DEPARTMENT
          </h1>
          <p className="font-inter text-base sm:text-lg text-[#4a454e] max-w-2xl mx-auto">
            Please select your department to continue.
          </p>
        </header>

        {/* Interactive Grid matching Screenshot 1 */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10">
          {departments.map((dept, index) => {
            const isLastOdd = index === departments.length - 1 && departments.length % 2 !== 0;
            const deptFaculty = teachers.filter((t) => t.departmentId.toLowerCase() === dept.id.toLowerCase());

            return (
              <div
                key={dept.id}
                className={`relative group ${isLastOdd ? 'md:col-span-2' : ''}`}
              >
                <button
                  onClick={() => handleCardClick(dept.id)}
                  className={`w-full min-h-[120px] md:min-h-[140px] rounded-2xl flex items-center justify-between px-7 md:px-9 py-6 border transition-all duration-300 text-left shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${
                    isLastOdd
                      ? 'bg-[#f5f3f3] border-[#ccc4cf]/40 hover:border-[#180331]/30'
                      : 'bg-[#ffffff] border-[#ccc4cf]/40 hover:border-[#180331]/30 hover:bg-[#fbf9f8]'
                  }`}
                >
                  <div className="relative z-10 flex flex-col gap-1.5 pr-4 flex-1">
                    <span className="font-playfair text-2xl md:text-[28px] font-bold text-[#180331] group-hover:text-[#2e1a47] transition-colors leading-tight">
                      {dept.name}
                    </span>
                    <span className="font-inter text-xs text-[#7b757f] flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[#4a454e]">{deptFaculty.length} Honored Faculty Members</span>
                      <span>•</span>
                      <span>HOD: <strong className="text-[#180331]">{dept.headOfDepartment}</strong></span>
                    </span>
                  </div>

                  <div className="relative z-10 shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-[#efeded] group-hover:bg-[#180331] group-hover:text-[#ffe088] text-[#7b757f] border border-[#ccc4cf]/30 group-hover:border-[#180331] transition-all duration-300 group-hover:translate-x-1 shadow-2xs">
                    <ArrowRight size={18} />
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick Teacher Directory Drawer / Preview */}
        <div className="w-full max-w-4xl mt-12 pt-8 border-t border-[#ccc4cf]/30 text-center">
          <p className="font-inter text-xs uppercase tracking-widest text-[#7b757f] mb-4">
            Direct Faculty Search &amp; Spotlight
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {teachers.map((teacher) => (
              <button
                key={teacher.id}
                onClick={() => onSelectTeacher(teacher)}
                className="flex items-center gap-2 bg-[#ffffff] hover:bg-[#180331] hover:text-[#ffffff] text-[#180331] px-4 py-2 rounded-full border border-[#180331]/15 text-xs font-medium transition-all shadow-xs group"
              >
                <img
                  src={teacher.photoUrl}
                  alt={teacher.name}
                  className="w-5 h-5 rounded-full object-cover border border-[#ffe088]"
                />
                <span>{teacher.name}</span>
                <span className="text-[10px] text-[#7b757f] group-hover:text-[#ffe088]">
                  ({teacher.departmentName.split(' ')[0]})
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
