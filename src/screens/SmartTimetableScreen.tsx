import React, { useMemo, useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { ALL_GRADES, ALL_SECTIONS } from '../data/initialData';
import {
  PERIOD_SLOTS,
  DAYS_OF_WEEK,
  DayOfWeek,
  generateWeeklyTimetable,
  getRankedTeachersForSlot,
} from '../utils/timetableGenerator';
import {
  StandardGrade,
  SectionCode,
  TimetableSubstitution,
  TimetableClassEntry,
} from '../types';
import {
  CalendarDays,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Printer,
  RotateCcw,
  Award,
  Check,
  Shuffle,
  SlidersHorizontal,
} from 'lucide-react';

export const SmartTimetableScreen: React.FC = () => {
  const {
    selectedGrade,
    setSelectedGrade,
    selectedSection,
    setSelectedSection,
    activeSimulationDay,
    setActiveSimulationDay,
    simulationDate,
    currentTimetable,
    substitutionsList,
    approveSubstitution,
    approveAllSubstitutions,
    rejectSubstitution,
    manualOverrideSubstitution,
    manualTimetableAdjustments,
    adjustTimetableSlotTeacher,
    clearTimetableSlotAdjustment,
    staffList,
    toggleStaffAttendance,
    schoolProfile,
  } = useSchool();

  const [overrideModalSub, setOverrideModalSub] = useState<TimetableSubstitution | null>(null);
  const [selectedOverrideTeacherId, setSelectedOverrideTeacherId] = useState('');

  const [slotAdjustTarget, setSlotAdjustTarget] = useState<TimetableClassEntry | null>(null);
  const [selectedSlotTeacherId, setSelectedSlotTeacherId] = useState('');

  const [showDailyNoticeModal, setShowDailyNoticeModal] = useState(false);

  // Representative cross-school timetable pool for conflict/free-period detection
  const schoolTimetablePool = useMemo(() => {
    const all: TimetableClassEntry[] = [];
    const sampleGrades: StandardGrade[] = ['Nursery', '1', '5', '9', '10', '12'];
    sampleGrades.forEach((g) => {
      (['A', 'B'] as SectionCode[]).forEach((s) => {
        all.push(...generateWeeklyTimetable(g, s, staffList));
      });
    });
    return all;
  }, [staffList]);

  const rankedOverrideCandidates = useMemo(() => {
    if (!overrideModalSub) return [];
    return getRankedTeachersForSlot(
      overrideModalSub.day,
      overrideModalSub.period,
      overrideModalSub.subjectName,
      staffList,
      schoolTimetablePool,
      overrideModalSub.originalTeacherId
    );
  }, [overrideModalSub, staffList, schoolTimetablePool]);

  const rankedSlotCandidates = useMemo(() => {
    if (!slotAdjustTarget) return [];
    return getRankedTeachersForSlot(
      slotAdjustTarget.day,
      slotAdjustTarget.period,
      slotAdjustTarget.subjectName,
      staffList,
      schoolTimetablePool
    );
  }, [slotAdjustTarget, staffList, schoolTimetablePool]);

  const pendingSubstitutions = substitutionsList.filter(
    (s) => s.status === 'Pending Timetable In-charge Approval' && s.day === activeSimulationDay
  );

  const approvedSubstitutions = substitutionsList.filter(
    (s) => s.status === 'Approved' && s.day === activeSimulationDay
  );

  const handleOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalSub || !selectedOverrideTeacherId) return;

    const teacher = staffList.find((s) => s.id === selectedOverrideTeacherId);
    if (teacher) {
      manualOverrideSubstitution(overrideModalSub.id, teacher.id, teacher.name);
    }
    setOverrideModalSub(null);
  };

  const openSlotAdjustModal = (entry: TimetableClassEntry) => {
    setSlotAdjustTarget(entry);
    setSelectedSlotTeacherId(entry.teacherId);
  };

  const handleSlotAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotAdjustTarget || !selectedSlotTeacherId) return;

    const matchCandidate = rankedSlotCandidates.find(
      (c) => c.teacher.id === selectedSlotTeacherId
    );
    const teacher = matchCandidate?.teacher || staffList.find((s) => s.id === selectedSlotTeacherId);
    if (teacher) {
      const note = matchCandidate
        ? `${matchCandidate.match.tier} (${matchCandidate.match.matchedSkill})`
        : `Skill Matrix (${teacher.primarySkill})`;
      adjustTimetableSlotTeacher(slotAdjustTarget.id, teacher.id, teacher.name, note);
    }
    setSlotAdjustTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" />
            Smart Digital Timetable &amp; Dynamic Substitution System
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-allocated subject schedules powered by the Staff Skill Matrix, with guaranteed weekly Sports, Swimming, Computer Lab, and Timetable In-charge approval
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDailyNoticeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Daily Substitution Notice</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print Grade Timetable</span>
          </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Grade / Standard (15 Standards)
            </label>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value as StandardGrade)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {ALL_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g === 'Nursery' || g === 'KG1' || g === 'KG2' ? g : `Class ${g} Standard`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Section (A, B, C, D)
            </label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value as SectionCode)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {ALL_SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  Section {sec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Simulated Day for Live Attendance
            </label>
            <select
              value={activeSimulationDay}
              onChange={(e) => setActiveSimulationDay(e.target.value as DayOfWeek)}
              className="w-full px-3 py-2 border border-indigo-300 bg-indigo-50/50 rounded-lg font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d} (Live School Day)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
            System Guarantees:
          </span>
          <span className="flex items-center gap-1 font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            Weekly 1 Sports (Wed P6)
          </span>
          <span className="flex items-center gap-1 font-medium text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200">
            <Award className="w-3.5 h-3.5 text-cyan-600" />
            Weekly 1 Swimming (Fri P7)
          </span>
          <span className="flex items-center gap-1 font-medium text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            Weekly 1 Computer Lab (Tue P4)
          </span>
          <span className="text-slate-500 text-xs ml-auto">
            Viewing: <strong className="text-slate-800">Grade {selectedGrade}-{selectedSection}</strong> · Click any period to adjust via Skill Matrix
          </span>
        </div>
      </div>

      {/* Live Teacher Attendance Quick Bar */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Live Teacher Attendance Testing Bar ({activeSimulationDay})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Toggle any teacher to <span className="font-semibold text-rose-600">Absent</span> to test Skill-Matrix substitution matching
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {staffList
            .filter((s) => s.role.includes('Teacher') || s.role === 'Timetable In-charge')
            .slice(0, 6)
            .map((teacher) => {
              const isAbsent =
                teacher.attendanceToday === 'Absent' || teacher.attendanceToday === 'On Leave';
              return (
                <div
                  key={teacher.id}
                  className={`p-2.5 rounded-lg border text-xs transition-all flex flex-col justify-between ${
                    isAbsent
                      ? 'bg-rose-50/80 border-rose-300 ring-1 ring-rose-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-900 truncate" title={teacher.name}>
                      {teacher.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {teacher.primarySkill} · {teacher.secondarySkill}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400">
                      {isAbsent ? 'Absent' : 'Present'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        toggleStaffAttendance(teacher.id, isAbsent ? 'Present' : 'Absent')
                      }
                      className={`text-[10px] px-2 py-0.5 rounded-sm font-semibold transition-colors cursor-pointer ${
                        isAbsent
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                      }`}
                    >
                      {isAbsent ? 'Mark Present' : 'Set Absent'}
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Timetable In-charge Approval Queue */}
      {pendingSubstitutions.length > 0 && (
        <div className="bg-amber-50/80 border-2 border-amber-300 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  Timetable In-charge Substitution Approval Queue ({pendingSubstitutions.length} Pending)
                </h3>
                <p className="text-xs text-amber-800">
                  Teacher absences on {activeSimulationDay} detected. System matched free teachers across Primary, Secondary, and Lab skills. Approval required before timetable goes live.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={approveAllSubstitutions}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors shadow-xs whitespace-nowrap cursor-pointer shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve All Substitutions</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {pendingSubstitutions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white p-4 rounded-xl border border-amber-200 space-y-3 shadow-xs"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-900">
                      Class {sub.grade}-{sub.section} · Period {sub.period} ({sub.periodTime})
                    </span>
                    <div className="text-xs font-medium text-indigo-700 mt-0.5">
                      Subject: {sub.subjectName}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800">
                    Awaiting Approval
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-2.5 bg-slate-50 rounded-lg font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Absent Teacher:</span>
                    <span className="font-semibold text-rose-700 line-through">
                      {sub.originalTeacherName}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-sans">Absent Today</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-600 font-sans block font-semibold">
                      Proposed Substitute:
                    </span>
                    <span className="font-bold text-emerald-700">{sub.proposedTeacherName}</span>
                    <span className="text-[10px] text-slate-500 block font-sans">
                      {sub.matchCriteria} · {sub.matchedSkill}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setOverrideModalSub(sub);
                      setSelectedOverrideTeacherId(sub.proposedTeacherId);
                    }}
                    className="text-slate-600 hover:text-indigo-600 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Override via Skill Matrix</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => rejectSubstitution(sub.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => approveSubstitution(sub.id)}
                      className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Digital Timetable Weekly Grid View */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Weekly Digital Master Schedule · Class {selectedGrade} - Section {selectedSection}
            </h2>
            <p className="text-xs text-slate-500">
              Academic Year 2026–27 · Click any period cell to reassign faculty using the Skill Matrix
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Room:</span>
            <span className="font-mono font-semibold text-slate-800">
              {selectedGrade === 'Nursery' || selectedGrade === 'KG1' || selectedGrade === 'KG2'
                ? `EarlyBlock-0${selectedSection}`
                : `Block-Gr${selectedGrade}-${selectedSection}`}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-3 py-3 w-28 text-left bg-slate-200/70 border-r border-slate-200">
                  Day / Period
                </th>
                {PERIOD_SLOTS.map((slot) => (
                  <th key={slot.periodNumber} className="px-2 py-2 border-r border-slate-200 min-w-[135px]">
                    <div className="font-bold text-slate-900">Period {slot.periodNumber}</div>
                    <div className="font-mono text-[10px] text-slate-500 font-normal">
                      {slot.startTime} - {slot.endTime}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {DAYS_OF_WEEK.map((day) => {
                const isCurrentSimulatedDay = day === activeSimulationDay;
                return (
                  <tr
                    key={day}
                    className={`transition-colors ${
                      isCurrentSimulatedDay ? 'bg-indigo-50/30' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="px-3 py-3 text-left font-bold text-slate-900 border-r border-slate-200 bg-slate-50/70">
                      <div>{day}</div>
                      {isCurrentSimulatedDay && (
                        <span className="text-[10px] font-semibold font-mono text-indigo-700 bg-indigo-100/70 px-1.5 py-0.2 rounded-xs">
                          Active Today
                        </span>
                      )}
                    </td>

                    {PERIOD_SLOTS.map((slot) => {
                      const entry = currentTimetable.find(
                        (e) => e.day === day && e.period === slot.periodNumber
                      );

                      if (!entry) {
                        return (
                          <td key={slot.periodNumber} className="px-2 py-3 border-r border-slate-200 text-slate-400">
                            -
                          </td>
                        );
                      }

                      const isSubstituted = entry.isSubstituted;
                      const isManuallyAdjusted = Boolean(manualTimetableAdjustments[entry.id]);

                      return (
                        <td
                          key={slot.periodNumber}
                          onClick={() => openSlotAdjustModal(entry)}
                          className={`px-2 py-2 border-r border-slate-200 text-left align-top transition-colors cursor-pointer group hover:ring-1 hover:ring-inset hover:ring-indigo-400 ${
                            entry.isSports
                              ? 'bg-amber-50/80 border-amber-200'
                              : entry.isSwimming
                              ? 'bg-cyan-50/80 border-cyan-200'
                              : entry.isComputerLab
                              ? 'bg-indigo-50/80 border-indigo-200'
                              : entry.isLabSession
                              ? 'bg-emerald-50/50'
                              : ''
                          }`}
                          title="Click to adjust teacher via Skill Matrix"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-[10px] font-mono font-semibold px-1 py-0.2 rounded-xs ${
                                  entry.isSports
                                    ? 'bg-amber-200/80 text-amber-900'
                                    : entry.isSwimming
                                    ? 'bg-cyan-200/80 text-cyan-900'
                                    : entry.isComputerLab
                                    ? 'bg-indigo-200/80 text-indigo-900'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {entry.subjectCode}
                              </span>
                              <span className="text-[9px] text-slate-400 group-hover:text-indigo-600 inline-flex items-center gap-0.5 no-print">
                                <SlidersHorizontal className="w-2.5 h-2.5" />
                              </span>
                            </div>

                            <div className="font-semibold text-slate-900 text-[11px] leading-tight">
                              {entry.subjectName}
                            </div>

                            <div className="text-[10px] text-slate-600 flex items-center justify-between pt-0.5 border-t border-slate-100">
                              <span className="truncate" title={entry.teacherName}>
                                {entry.teacherName}
                              </span>
                            </div>

                            {isSubstituted && (
                              <div
                                className={`mt-1 p-1 rounded-sm text-[9px] font-bold flex items-center gap-1 border ${
                                  isManuallyAdjusted
                                    ? 'bg-indigo-100 border-indigo-300 text-indigo-900'
                                    : 'bg-amber-100 border-amber-300 text-amber-900'
                                }`}
                              >
                                <Sparkles className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">
                                  {isManuallyAdjusted ? 'Skill-Matrix Adjusted' : 'Substituted (Approved)'}
                                </span>
                              </div>
                            )}

                            <div className="text-[9px] text-slate-400 font-mono truncate">{entry.roomOrLab}</div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Skill-Matrix Ranked Substitution Override Modal */}
      {overrideModalSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Override Substitute via Skill Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Class {overrideModalSub.grade}-{overrideModalSub.section} · {overrideModalSub.day} Period {overrideModalSub.period} · {overrideModalSub.subjectName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOverrideModalSub(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOverrideSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                Absent Faculty: <strong className="text-rose-700">{overrideModalSub.originalTeacherName}</strong> · Candidates ranked by Skill Matrix fit and Period {overrideModalSub.period} availability
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {rankedOverrideCandidates.map(({ teacher, match, isFree, busyClassLabel }) => {
                  const isSelected = selectedOverrideTeacherId === teacher.id;
                  const labs = teacher.labExpertise || [];
                  return (
                    <label
                      key={teacher.id}
                      className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="overrideTeacher"
                            checked={isSelected}
                            onChange={() => setSelectedOverrideTeacherId(teacher.id)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">
                              {teacher.name} <span className="font-normal text-slate-500">({teacher.role})</span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              Primary: {teacher.primarySkill} · Secondary: {teacher.secondarySkill}
                              {labs.length > 0 ? ` · Labs: ${labs.join(', ')}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`text-[10px] font-bold ${
                              match.score >= 75
                                ? 'text-emerald-700'
                                : match.score >= 50
                                ? 'text-indigo-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {match.tier}
                          </div>
                          <div
                            className={`text-[10px] font-mono ${
                              isFree ? 'text-emerald-600' : 'text-amber-700'
                            }`}
                          >
                            {isFree ? `Free in P${overrideModalSub.period}` : `Busy: ${busyClassLabel}`}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setOverrideModalSub(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold cursor-pointer"
                >
                  Confirm &amp; Approve Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timetable Slot Adjustment Modal (Skill Matrix Driven) */}
      {slotAdjustTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Adjust Timetable Slot via Skill Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Class {slotAdjustTarget.grade}-{slotAdjustTarget.section} · {slotAdjustTarget.day} Period {slotAdjustTarget.period} · {slotAdjustTarget.subjectName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSlotAdjustTarget(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSlotAdjustSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Current Teacher: </span>
                  <strong className="text-slate-900">{slotAdjustTarget.teacherName}</strong>
                  <span className="text-slate-400"> · {slotAdjustTarget.roomOrLab}</span>
                </div>
                {manualTimetableAdjustments[slotAdjustTarget.id] && (
                  <button
                    type="button"
                    onClick={() => {
                      clearTimetableSlotAdjustment(slotAdjustTarget.id);
                      setSlotAdjustTarget(null);
                    }}
                    className="inline-flex items-center gap-1 text-indigo-700 hover:text-indigo-900 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Revert to Auto-Scheduled</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {rankedSlotCandidates.map(({ teacher, match, isFree, busyClassLabel }) => {
                  const isSelected = selectedSlotTeacherId === teacher.id;
                  const labs = teacher.labExpertise || [];
                  return (
                    <label
                      key={teacher.id}
                      className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="slotTeacher"
                            checked={isSelected}
                            onChange={() => setSelectedSlotTeacherId(teacher.id)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">
                              {teacher.name} <span className="font-normal text-slate-500">({teacher.role})</span>
                            </div>
                            <div className="text-[11px] text-slate-600 mt-0.5">
                              Primary: {teacher.primarySkill} · Secondary: {teacher.secondarySkill}
                              {labs.length > 0 ? ` · Labs: ${labs.join(', ')}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`text-[10px] font-bold ${
                              match.score >= 75
                                ? 'text-emerald-700'
                                : match.score >= 50
                                ? 'text-indigo-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {match.tier}
                          </div>
                          <div
                            className={`text-[10px] font-mono ${
                              isFree ? 'text-emerald-600' : 'text-amber-700'
                            }`}
                          >
                            {isFree ? `Free in P${slotAdjustTarget.period}` : `Busy: ${busyClassLabel}`}
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSlotAdjustTarget(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold cursor-pointer"
                >
                  Apply Skill-Matrix Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Substitution Notice Modal */}
      {showDailyNoticeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative border-2 border-indigo-600">
            <button
              type="button"
              onClick={() => setShowDailyNoticeModal(false)}
              className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-700 no-print cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-1 border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">{schoolProfile.name}</h2>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Daily Faculty Substitution Notice Sheet · {activeSimulationDay}, {simulationDate}
              </div>
              <p className="text-xs text-indigo-700 font-medium">
                Approved by Timetable In-charge: {schoolProfile.timetableInchargeName}
              </p>
            </div>

            {approvedSubstitutions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg">
                No substitutions currently approved for {activeSimulationDay}. Once the In-charge approves pending substitutions, they will appear here on the official notice sheet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-2">Period &amp; Time</th>
                      <th className="px-3 py-2">Class</th>
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Regular Teacher (Absent)</th>
                      <th className="px-3 py-2">Substituted Faculty</th>
                      <th className="px-3 py-2">Remarks / Skill Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {approvedSubstitutions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">
                          Period {sub.period} ({sub.periodTime})
                        </td>
                        <td className="px-3 py-2.5 font-bold text-slate-800">
                          Class {sub.grade}-{sub.section}
                        </td>
                        <td className="px-3 py-2.5 font-medium text-slate-900">{sub.subjectName}</td>
                        <td className="px-3 py-2.5 text-rose-700 line-through">{sub.originalTeacherName}</td>
                        <td className="px-3 py-2.5 font-bold text-emerald-700">{sub.proposedTeacherName}</td>
                        <td className="px-3 py-2.5 text-[11px] text-slate-500">
                          {sub.matchCriteria} ({sub.matchedSkill})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between items-end pt-4 border-t border-slate-100 text-[10px]">
              <div>
                <div className="text-slate-400">Timetable In-charge Signature:</div>
                <div className="font-semibold text-slate-700">{schoolProfile.timetableInchargeName}</div>
              </div>
              <div className="text-right">
                <div className="h-6 border-b border-slate-400 w-32 mb-1"></div>
                <div className="font-medium text-slate-600">Principal Office Counter-Sign</div>
              </div>
            </div>

            <div className="no-print pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Daily Notice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
