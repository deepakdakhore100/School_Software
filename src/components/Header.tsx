import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { ShieldCheck, CalendarClock, School } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingApprovalsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  pendingApprovalsCount,
}) => {
  const { schoolProfile } = useSchool();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200">
      {/* Zone 1: Single text element wordmark with school crest */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-indigo-950 flex items-center justify-center text-amber-400 overflow-hidden shadow-xs">
          <img
            src="/src/assets/images/school_crest_emblem_1794050056518.jpg"
            alt="School Crest"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            {schoolProfile.name}
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Board: {schoolProfile.board}</span>
            <span aria-hidden="true">·</span>
            <span>U-DISE: {schoolProfile.udiseCode}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Affiliated &amp; Active</span>
          </div>
        </div>
      </div>

      {/* Zone 2: 4–5 concise single-line nav links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => setCurrentTab('timetable')}
          className={`hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
            currentTab === 'timetable' ? 'text-indigo-600 font-semibold' : ''
          }`}
        >
          Timetable
        </button>
        <button
          onClick={() => setCurrentTab('attendance')}
          className={`hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
            currentTab === 'attendance' ? 'text-indigo-600 font-semibold' : ''
          }`}
        >
          Student Attendance
        </button>
        <button
          onClick={() => setCurrentTab('exams')}
          className={`hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
            currentTab === 'exams' ? 'text-indigo-600 font-semibold' : ''
          }`}
        >
          Exams &amp; Reports
        </button>
        <button
          onClick={() => setCurrentTab('students')}
          className={`hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
            currentTab === 'students' ? 'text-indigo-600 font-semibold' : ''
          }`}
        >
          Students &amp; Fees
        </button>
        <button
          onClick={() => setCurrentTab('staff')}
          className={`hover:text-indigo-600 transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${
            currentTab === 'staff' ? 'text-indigo-600 font-semibold' : ''
          }`}
        >
          Staff &amp; Payroll
        </button>
      </nav>

      {/* Zone 3: 1 primary action button */}
      <div className="flex items-center gap-3 shrink-0">
        {pendingApprovalsCount > 0 ? (
          <button
            onClick={() => setCurrentTab('timetable')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <CalendarClock className="w-4 h-4" />
            <span>Review {pendingApprovalsCount} Substitution Approvals</span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentTab('timetable')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <CalendarClock className="w-4 h-4" />
            <span>Digital Timetable &amp; Schedule</span>
          </button>
        )}
      </div>
    </header>
  );
};
