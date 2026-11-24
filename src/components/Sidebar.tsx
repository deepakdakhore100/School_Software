import React from 'react';
import {
  Building2,
  Users,
  FlaskConical,
  GraduationCap,
  UserPlus,
  Bus,
  CreditCard,
  Banknote,
  BookOpen,
  CalendarDays,
  Sparkles,
  AlertCircle,
  RotateCcw,
  UserCheck,
  Award,
} from 'lucide-react';
import { useSchool } from '../context/SchoolContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { substitutionsList, resetDemoData, staffList } = useSchool();
  const pendingSubs = substitutionsList.filter((s) => s.status === 'Pending Timetable In-charge Approval');
  const absentStaffCount = staffList.filter((s) => s.attendanceToday === 'Absent' || s.attendanceToday === 'On Leave').length;

  const navItems = [
    {
      id: 'profile',
      label: 'School & Affiliation',
      icon: Building2,
      subtitle: 'CBSE / Board, Grants & Licenses',
    },
    {
      id: 'staff',
      label: 'Staff & Skill Matrix',
      icon: Users,
      subtitle: 'Skills, Roles, Onboarding & Attendance',
      badge: absentStaffCount > 0 ? `${absentStaffCount} Absent` : undefined,
      badgeColor: 'text-amber-700 bg-amber-50',
    },
    {
      id: 'attendance',
      label: 'Student Attendance',
      icon: UserCheck,
      subtitle: 'Present, Absent, Late & Logs',
    },
    {
      id: 'exams',
      label: 'Exams & Report Cards',
      icon: Award,
      subtitle: 'Assessments, Marks & CBSE Cards',
    },
    {
      id: 'labs',
      label: 'Labs & Practical Classes',
      icon: FlaskConical,
      subtitle: 'Physics, Chem, Bio, Computer, AI',
    },
    {
      id: 'grades',
      label: 'Grades & Sections',
      icon: GraduationCap,
      subtitle: 'Nursery to 12 · Sections A, B, C, D',
    },
    {
      id: 'students',
      label: 'Student Registration',
      icon: UserPlus,
      subtitle: 'Directory, Transport & Fee Plan',
    },
    {
      id: 'buses',
      label: 'Bus Fleet & Routes',
      icon: Bus,
      subtitle: 'Drivers, Assistants & Passenger Stops',
    },
    {
      id: 'fees',
      label: 'Fees & Repayment Slabs',
      icon: CreditCard,
      subtitle: 'Annual, Quarterly & Monthly Slabs',
    },
    {
      id: 'payroll',
      label: 'Payroll System',
      icon: Banknote,
      subtitle: 'Scales for 290+ School Personnel',
    },
    {
      id: 'subjects',
      label: 'Subject Definitions',
      icon: BookOpen,
      subtitle: 'English, Hindi, Marathi, Science, EVS',
    },
    {
      id: 'timetable',
      label: 'Smart Timetable Engine',
      icon: CalendarDays,
      subtitle: 'Auto-Allocation & Incharge Approval',
      badge: pendingSubs.length > 0 ? `${pendingSubs.length} Pending` : undefined,
      badgeColor: 'text-amber-800 bg-amber-100',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 min-h-[calc(100vh-61px)]">
      <div className="p-4 space-y-6">
        <div>
          <div className="px-3 py-1.5 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            School Administration
          </div>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer group ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                      }`}
                    />
                    <div className="min-w-0 truncate">
                      <div className="truncate text-xs leading-tight">{item.label}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? 'text-indigo-200' : 'text-slate-500'
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-sm whitespace-nowrap ml-2 ${
                        isActive ? 'bg-white text-indigo-700' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Substitution Live Status Card */}
        <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Smart Timetable Engine
            </span>
            <span className="text-[10px] font-mono text-emerald-400">ONLINE</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Attendance changes auto-generate substitution recommendations for the Timetable In-charge.
          </p>
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700">
            <span>Pending Approvals:</span>
            <span className="font-semibold text-amber-400 font-mono">{pendingSubs.length}</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Action */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={resetDemoData}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Reset to default seeded demo records"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo System Data</span>
        </button>
        <div className="mt-2 text-center text-[10px] text-slate-500">
          Academic Year 2026–2027 · Production ERP
        </div>
      </div>
    </aside>
  );
};
