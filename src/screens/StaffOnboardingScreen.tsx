import React, { useMemo, useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  StaffMember,
  StaffRole,
  SkillProficiency,
  SkillDomain,
} from '../types';
import {
  SKILL_CATALOG,
  ALL_CATALOG_SKILLS,
  LAB_EXPERTISE_OPTIONS,
  ELIGIBLE_ROLES_OPTIONS,
  ADDITIONAL_COMPETENCY_OPTIONS,
  getStaffSkillCellStatus,
  getStaffSkillCoverage,
  getStaffActiveAssignments,
} from '../utils/skillMatrix';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Sparkles,
  Phone,
  Edit3,
  Grid3X3,
  AlertTriangle,
  FlaskConical,
  Briefcase,
} from 'lucide-react';

type ViewMode = 'directory' | 'matrix';

const ALL_ROLES: StaffRole[] = [
  'Principal',
  'Vice Principal',
  'Senior Teacher',
  'Junior Teacher',
  'Special Teacher',
  'Timetable In-charge',
  'Staff',
  'Lab Assistant',
  'Bus Driver',
  'Bus Assistant',
  'Security Guard',
];

const PROFICIENCY_OPTIONS: SkillProficiency[] = ['Expert', 'Proficient', 'Foundational'];

const createDefaultFormData = (): Omit<StaffMember, 'id' | 'employeeCode'> => ({
  name: '',
  role: 'Senior Teacher',
  primarySkill: 'Mathematics',
  secondarySkill: 'Science',
  primarySkillProficiency: 'Expert',
  secondarySkillProficiency: 'Proficient',
  labExpertise: [],
  additionalSkills: [],
  eligibleRoles: ['Subject Teacher', 'Substitute Teacher'],
  qualification: 'M.Sc., B.Ed.',
  experienceYears: 5,
  phone: '+91 ',
  email: '',
  joiningDate: new Date().toISOString().split('T')[0],
  assignedLabOrBus: '',
  attendanceToday: 'Present',
  basicSalary: 62000,
  pfApplicable: true,
});

export const StaffOnboardingScreen: React.FC = () => {
  const {
    staffList,
    addStaffMember,
    toggleStaffAttendance,
    updateStaffMember,
    gradeSections,
    labsList,
    busFleet,
    subjectsList,
  } = useSchool();

  const [viewMode, setViewMode] = useState<ViewMode>('directory');
  const [selectedDomain, setSelectedDomain] = useState<SkillDomain>('Academic Subjects');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [skillFilter, setSkillFilter] = useState<string>('All');

  // Modal state for both Onboard New Staff and Edit Existing Staff Skills
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<StaffMember, 'id' | 'employeeCode'>>(
    createDefaultFormData
  );

  const openOnboardModal = () => {
    setEditingStaffId(null);
    setFormData(createDefaultFormData());
    setModalOpen(true);
  };

  const openEditModal = (staff: StaffMember) => {
    setEditingStaffId(staff.id);
    setFormData({
      name: staff.name,
      role: staff.role,
      primarySkill: staff.primarySkill,
      secondarySkill: staff.secondarySkill,
      primarySkillProficiency: staff.primarySkillProficiency || 'Expert',
      secondarySkillProficiency: staff.secondarySkillProficiency || 'Proficient',
      labExpertise: staff.labExpertise || [],
      additionalSkills: staff.additionalSkills || [],
      eligibleRoles: staff.eligibleRoles || [],
      qualification: staff.qualification,
      experienceYears: staff.experienceYears,
      phone: staff.phone,
      email: staff.email,
      joiningDate: staff.joiningDate,
      assignedLabOrBus: staff.assignedLabOrBus || '',
      attendanceToday: staff.attendanceToday,
      basicSalary: staff.basicSalary,
      pfApplicable: staff.pfApplicable,
    });
    setModalOpen(true);
  };

  const toggleArrayField = (
    field: 'labExpertise' | 'additionalSkills' | 'eligibleRoles',
    value: string
  ) => {
    const current = formData[field] || [];
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: next });
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStaffId) {
      updateStaffMember(editingStaffId, formData);
    } else {
      addStaffMember(formData);
    }
    setModalOpen(false);
    setEditingStaffId(null);
    setFormData(createDefaultFormData());
  };

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return staffList.filter((staff) => {
      const labs = (staff.labExpertise || []).join(' ').toLowerCase();
      const extra = (staff.additionalSkills || []).join(' ').toLowerCase();
      const matchesSearch =
        !q ||
        staff.name.toLowerCase().includes(q) ||
        staff.employeeCode.toLowerCase().includes(q) ||
        staff.primarySkill.toLowerCase().includes(q) ||
        staff.secondarySkill.toLowerCase().includes(q) ||
        labs.includes(q) ||
        extra.includes(q);

      const matchesRole = selectedRoleFilter === 'All' || staff.role === selectedRoleFilter;
      const matchesSkill =
        skillFilter === 'All' || getStaffSkillCellStatus(staff, skillFilter) !== null;

      return matchesSearch && matchesRole && matchesSkill;
    });
  }, [staffList, searchQuery, selectedRoleFilter, skillFilter]);

  const activeDomainSkills = useMemo(() => {
    return SKILL_CATALOG.find((g) => g.domain === selectedDomain)?.skills || [];
  }, [selectedDomain]);

  const domainCoverage = useMemo(() => {
    return activeDomainSkills.map((skill) => getStaffSkillCoverage(staffList, skill));
  }, [activeDomainSkills, staffList]);

  const gapAlerts = useMemo(() => {
    return domainCoverage.filter((c) => c.status !== 'Healthy');
  }, [domainCoverage]);

  const presentCount = staffList.filter((s) => s.attendanceToday === 'Present').length;
  const absentCount = staffList.filter(
    (s) => s.attendanceToday === 'Absent' || s.attendanceToday === 'On Leave'
  ).length;
  const labQualifiedCount = staffList.filter(
    (s) => (s.labExpertise || []).length > 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Staff Onboarding &amp; Skill Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record primary/secondary skills, lab expertise, and eligible roles for automated timetable substitution and campus role assignments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'directory'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Directory &amp; Attendance</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Skill Matrix &amp; Role Readiness</span>
            </button>
          </div>

          <button
            type="button"
            onClick={openOnboardModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard New Staff</span>
          </button>
        </div>
      </div>

      {/* Live Daily Attendance & Skill Matrix Readiness Strip */}
      <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900">
              Live Attendance Linked to Skill Matrix &amp; Role Assignments
            </div>
            <div className="text-[11px] text-slate-600">
              Primary skills, secondary skills, and lab expertise recorded here directly drive Smart Timetable substitutions, Lab In-charge assignments, Class Teacher allocations, and Fleet Crew rosters.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium shrink-0 tabular-nums">
          <div className="flex items-center gap-1.5 text-emerald-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Present: <strong>{presentCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <XCircle className="w-4 h-4 text-rose-500" />
            <span>Absent / Leave: <strong>{absentCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <FlaskConical className="w-4 h-4 text-indigo-500" />
            <span>Lab Certified: <strong>{labQualifiedCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, skill, lab expertise, code..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="text-xs py-1.5 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Roles ({staffList.length})</option>
            {ALL_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="text-xs py-1.5 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Skills &amp; Labs</option>
            {ALL_CATALOG_SKILLS.map((sk) => (
              <option key={sk} value={sk}>
                {sk}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW 1: Directory & Attendance */}
      {viewMode === 'directory' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Role &amp; Active Assignments</th>
                  <th className="px-4 py-3">Primary Skill</th>
                  <th className="px-4 py-3">Secondary &amp; Lab Expertise</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-center">Today&apos;s Attendance</th>
                  <th className="px-4 py-3 text-right">Skill Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((staff) => {
                  const assignments = getStaffActiveAssignments(
                    staff.id,
                    gradeSections,
                    labsList,
                    busFleet,
                    subjectsList
                  );
                  const labs = staff.labExpertise || [];
                  const primaryProf = staff.primarySkillProficiency || 'Expert';
                  const secondaryProf = staff.secondarySkillProficiency || 'Proficient';

                  return (
                    <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{staff.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {staff.employeeCode} · {staff.experienceYears} yrs
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{staff.role}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {assignments.length > 0
                            ? assignments.map((a) => `${a.type}: ${a.label}`).join(' · ')
                            : staff.assignedLabOrBus
                            ? `Assigned: ${staff.assignedLabOrBus}`
                            : 'Unassigned pool'}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-indigo-700">{staff.primarySkill}</div>
                        <div className="text-[10px] text-slate-500">
                          Primary · {primaryProf}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{staff.secondarySkill}</div>
                        <div className="text-[10px] text-slate-500">
                          Secondary · {secondaryProf}
                          {labs.length > 0 && ` · Labs: ${labs.join(', ')}`}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {staff.phone}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {staff.email}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
                          <button
                            type="button"
                            onClick={() => toggleStaffAttendance(staff.id, 'Present')}
                            className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors cursor-pointer ${
                              staff.attendanceToday === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Mark Present"
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStaffAttendance(staff.id, 'Absent')}
                            className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors cursor-pointer ${
                              staff.attendanceToday === 'Absent'
                                ? 'bg-rose-600 text-white shadow-xs font-semibold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Mark Absent (Triggers Substitution)"
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStaffAttendance(staff.id, 'On Leave')}
                            className={`px-2 py-1 text-[10px] font-medium rounded-md transition-colors cursor-pointer ${
                              staff.attendanceToday === 'On Leave'
                                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            title="Mark On Leave"
                          >
                            Leave
                          </button>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEditModal(staff)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit Skills</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: 2D Skill Matrix & Role Readiness */}
      {viewMode === 'matrix' && (
        <div className="space-y-4">
          {/* Domain Selector Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {SKILL_CATALOG.map((group) => {
                const isActive = selectedDomain === group.domain;
                return (
                  <button
                    key={group.domain}
                    type="button"
                    onClick={() => setSelectedDomain(group.domain)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {group.domain}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-sm bg-indigo-600 text-white font-bold inline-flex items-center justify-center text-[10px]">
                  P
                </span>
                Primary
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-sm bg-emerald-600 text-white font-bold inline-flex items-center justify-center text-[10px]">
                  S
                </span>
                Secondary
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-sm bg-amber-600 text-white font-bold inline-flex items-center justify-center text-[10px]">
                  L
                </span>
                Lab Expertise
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-5 h-5 rounded-sm bg-slate-200 text-slate-700 font-bold inline-flex items-center justify-center text-[10px]">
                  +
                </span>
                Additional
              </span>
            </div>
          </div>

          {/* Coverage Gap / Single Point of Failure Alert */}
          {gapAlerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-start sm:items-center gap-2.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <span className="font-semibold">Skill Coverage Watch ({selectedDomain}): </span>
                  <span className="text-amber-800">
                    {gapAlerts
                      .map(
                        (g) =>
                          `${g.skillName} (${g.totalCount === 0 ? 'Uncovered' : '1 qualified staff'})`
                      )
                      .join(' · ')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={openOnboardModal}
                className="text-[11px] font-semibold text-amber-900 underline hover:text-amber-700 whitespace-nowrap shrink-0 cursor-pointer text-left"
              >
                Onboard / Cross-train Staff
              </button>
            </div>
          )}

          {/* 2D Skill Matrix Grid */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="px-4 py-3 font-semibold sticky left-0 bg-slate-50 border-r border-slate-200 min-w-[230px] z-10">
                      Personnel &amp; Active Roles
                    </th>
                    {activeDomainSkills.map((skill) => (
                      <th
                        key={skill}
                        className="px-2.5 py-3 font-semibold text-center border-r border-slate-200 min-w-[105px]"
                        title={skill}
                      >
                        <div className="line-clamp-2 leading-tight">{skill}</div>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-right font-semibold min-w-[90px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((staff) => {
                    const assignments = getStaffActiveAssignments(
                      staff.id,
                      gradeSections,
                      labsList,
                      busFleet,
                      subjectsList
                    );
                    const isAbsent =
                      staff.attendanceToday === 'Absent' || staff.attendanceToday === 'On Leave';

                    return (
                      <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-2.5 sticky left-0 bg-white border-r border-slate-200 z-10">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900 truncate">
                              {staff.name}
                            </span>
                            <span
                              className={`text-[10px] font-semibold shrink-0 ${
                                isAbsent ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {staff.attendanceToday}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                            {staff.role}
                            {assignments.length > 0
                              ? ` · ${assignments.map((a) => a.label).join(', ')}`
                              : ''}
                          </div>
                        </td>

                        {activeDomainSkills.map((skill) => {
                          const cell = getStaffSkillCellStatus(staff, skill);
                          return (
                            <td
                              key={skill}
                              className="px-2 py-2.5 text-center border-r border-slate-100"
                            >
                              {cell === 'primary' && (
                                <span
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-600 text-white font-bold text-[11px]"
                                  title={`Primary Skill (${staff.primarySkillProficiency || 'Expert'})`}
                                >
                                  P
                                </span>
                              )}
                              {cell === 'secondary' && (
                                <span
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-600 text-white font-bold text-[11px]"
                                  title={`Secondary Skill (${staff.secondarySkillProficiency || 'Proficient'})`}
                                >
                                  S
                                </span>
                              )}
                              {cell === 'lab' && (
                                <span
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-600 text-white font-bold text-[11px]"
                                  title="Certified Lab Expertise"
                                >
                                  L
                                </span>
                              )}
                              {cell === 'additional' && (
                                <span
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-200 text-slate-800 font-bold text-[11px]"
                                  title="Additional Competency"
                                >
                                  +
                                </span>
                              )}
                              {cell === null && (
                                <span className="text-slate-300 text-[11px]">·</span>
                              )}
                            </td>
                          );
                        })}

                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => openEditModal(staff)}
                            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer whitespace-nowrap"
                          >
                            Edit Skills
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 text-[11px] font-semibold text-slate-700 tabular-nums">
                  <tr>
                    <td className="px-4 py-2.5 sticky left-0 bg-slate-50 border-r border-slate-200 z-10">
                      Present / Qualified Coverage
                    </td>
                    {domainCoverage.map((cov) => (
                      <td
                        key={cov.skillName}
                        className={`px-2 py-2.5 text-center border-r border-slate-200 font-mono ${
                          cov.status === 'Uncovered'
                            ? 'text-rose-700 bg-rose-50/70'
                            : cov.status === 'Single Point of Failure'
                            ? 'text-amber-700 bg-amber-50/70'
                            : 'text-emerald-700'
                        }`}
                        title={`${cov.presentCount} present today out of ${cov.totalCount} total qualified`}
                      >
                        {cov.presentCount}/{cov.totalCount}
                      </td>
                    ))}
                    <td className="px-3 py-2.5" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Unified Onboard / Edit Skill Matrix Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {editingStaffId
                    ? `Edit Skill Matrix & Roles · ${formData.name}`
                    : 'Onboard New Staff Member & Skill Profile'}
                </h3>
                <p className="text-xs text-slate-500">
                  Record primary &amp; secondary skills, proficiency levels, lab expertise, and eligible school roles
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Mrs. Priya Sharma"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Designation / Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as StaffRole })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    {ALL_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Primary & Secondary Skills + Proficiency */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Primary &amp; Secondary Skill Mapping</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">
                      Primary Skill / Subject
                    </label>
                    <input
                      type="text"
                      list="skills-catalog-list"
                      value={formData.primarySkill}
                      onChange={(e) => setFormData({ ...formData, primarySkill: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g. Science"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Proficiency</label>
                    <select
                      value={formData.primarySkillProficiency || 'Expert'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          primarySkillProficiency: e.target.value as SkillProficiency,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {PROFICIENCY_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">
                      Secondary Skill / Subject
                    </label>
                    <input
                      type="text"
                      list="skills-catalog-list"
                      value={formData.secondarySkill}
                      onChange={(e) => setFormData({ ...formData, secondarySkill: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="e.g. Environment Science (EVS)"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Proficiency</label>
                    <select
                      value={formData.secondarySkillProficiency || 'Proficient'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          secondarySkillProficiency: e.target.value as SkillProficiency,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      {PROFICIENCY_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <datalist id="skills-catalog-list">
                  {ALL_CATALOG_SKILLS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              {/* Lab Expertise Checkboxes */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Certified Lab Expertise (Used for Lab In-charge / Lab Assistant &amp; Practical Substitutions)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LAB_EXPERTISE_OPTIONS.map((lab) => {
                    const checked = (formData.labExpertise || []).includes(lab);
                    return (
                      <label
                        key={lab}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          checked
                            ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArrayField('labExpertise', lab)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="truncate">{lab}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Eligible School Roles */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Eligible Role Assignments
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ELIGIBLE_ROLES_OPTIONS.map((roleOpt) => {
                    const checked = (formData.eligibleRoles || []).includes(roleOpt);
                    return (
                      <label
                        key={roleOpt}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          checked
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArrayField('eligibleRoles', roleOpt)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="truncate">{roleOpt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Additional Competencies */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">
                  Additional Cross-Functional Competencies
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ADDITIONAL_COMPETENCY_OPTIONS.map((comp) => {
                    const checked = (formData.additionalSkills || []).includes(comp);
                    return (
                      <label
                        key={comp}
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                          checked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleArrayField('additionalSkills', comp)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="truncate">{comp}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Qualifications, Contact & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. M.Sc. Physics, B.Ed."
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experienceYears}
                    onChange={(e) =>
                      setFormData({ ...formData, experienceYears: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    min={0}
                    max={45}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="staff@vidyasetu.edu.in"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Base Monthly Salary (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) =>
                      setFormData({ ...formData, basicSalary: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    min={15000}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Assigned Lab / Bus / Gate (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.assignedLabOrBus || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedLabOrBus: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Physics Lab / Bus 01"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-xs cursor-pointer"
                >
                  {editingStaffId ? 'Save Skill Profile' : 'Confirm & Onboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
