import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { ALL_GRADES, ALL_SECTIONS } from '../data/initialData';
import { StandardGrade, SectionCode, StudentAttendanceStatus, StudentAttendanceRecord } from '../types';
import { PERIOD_SLOTS } from '../utils/timetableGenerator';
import {
  UserCheck,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Sparkles,
  ArrowUpDown,
  AlertTriangle,
  Save,
  Users,
  Check,
} from 'lucide-react';

export const StudentAttendanceScreen: React.FC = () => {
  const {
    studentsList,
    staffList,
    studentAttendanceRecords,
    markBatchAttendance,
    updateAttendanceRecord,
    subjectsList,
    schoolProfile,
  } = useSchool();

  // Active view: 'marking' | 'history' | 'analytics'
  const [activeTab, setActiveTab] = useState<'marking' | 'history' | 'analytics'>('marking');

  // Attendance Marking Parameters
  const [markingGrade, setMarkingGrade] = useState<StandardGrade>('9');
  const [markingSection, setMarkingSection] = useState<SectionCode>('A');
  const [markingDate, setMarkingDate] = useState<string>('2026-11-09');
  const [sessionType, setSessionType] = useState<'Daily Morning Roll Call' | 'Period Session'>('Daily Morning Roll Call');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [selectedSubject, setSelectedSubject] = useState<string>('Science');
  const [markingTeacher, setMarkingTeacher] = useState<string>('Mrs. Ananya Sharma (Class Teacher)');

  // Local state for the current roster being marked
  const rosterStudents = useMemo(() => {
    return studentsList.filter((s) => s.grade === markingGrade && s.section === markingSection);
  }, [studentsList, markingGrade, markingSection]);

  // Current session draft statuses map: studentId -> { status, remarks }
  const [sessionDraft, setSessionDraft] = useState<Record<string, { status: StudentAttendanceStatus; remarks: string }>>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Initialize draft when grade/section or date/session changes
  React.useEffect(() => {
    const initialMap: Record<string, { status: StudentAttendanceStatus; remarks: string }> = {};
    rosterStudents.forEach((stu) => {
      // Check if already recorded in studentAttendanceRecords
      const existing = studentAttendanceRecords.find(
        (r) =>
          r.studentId === stu.id &&
          r.date === markingDate &&
          r.sessionType === sessionType &&
          (sessionType === 'Daily Morning Roll Call' || r.periodNumber === selectedPeriod)
      );

      initialMap[stu.id] = {
        status: existing ? existing.status : 'Present',
        remarks: existing?.remarks || '',
      };
    });
    setSessionDraft(initialMap);
  }, [rosterStudents, markingDate, sessionType, selectedPeriod, studentAttendanceRecords]);

  // History filtering and sorting
  const [historySearch, setHistorySearch] = useState('');
  const [historyGradeFilter, setHistoryGradeFilter] = useState<string>('All');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'date' | 'grade' | 'rollNo' | 'studentName' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleStatusChange = (studentId: string, status: StudentAttendanceStatus) => {
    setSessionDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setSessionDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status: StudentAttendanceStatus) => {
    const updated: Record<string, { status: StudentAttendanceStatus; remarks: string }> = {};
    rosterStudents.forEach((stu) => {
      updated[stu.id] = {
        status,
        remarks: sessionDraft[stu.id]?.remarks || '',
      };
    });
    setSessionDraft(updated);
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const recordsToSave: Omit<StudentAttendanceRecord, 'id'>[] = rosterStudents.map((stu) => ({
      date: markingDate,
      grade: markingGrade,
      section: markingSection,
      sessionType,
      periodNumber: sessionType === 'Period Session' ? selectedPeriod : undefined,
      subjectName: sessionType === 'Period Session' ? selectedSubject : undefined,
      studentId: stu.id,
      studentName: stu.fullName,
      admissionNo: stu.admissionNo,
      rollNo: stu.rollNo,
      status: sessionDraft[stu.id]?.status || 'Present',
      markedBy: markingTeacher,
      remarks: sessionDraft[stu.id]?.remarks || undefined,
    }));

    markBatchAttendance(recordsToSave);
    setSaveSuccessMsg(`Attendance recorded successfully for Class ${markingGrade}-${markingSection} (${recordsToSave.length} students).`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Sort and filter historical records
  const sortedAndFilteredHistory = useMemo(() => {
    return studentAttendanceRecords
      .filter((r) => {
        const matchesSearch =
          r.studentName.toLowerCase().includes(historySearch.toLowerCase()) ||
          r.admissionNo.toLowerCase().includes(historySearch.toLowerCase()) ||
          (r.subjectName && r.subjectName.toLowerCase().includes(historySearch.toLowerCase()));

        const matchesGrade = historyGradeFilter === 'All' || r.grade === historyGradeFilter;
        const matchesStatus = historyStatusFilter === 'All' || r.status === historyStatusFilter;

        return matchesSearch && matchesGrade && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'date') {
          comparison = a.date.localeCompare(b.date);
        } else if (sortField === 'grade') {
          comparison = a.grade.localeCompare(b.grade) || a.section.localeCompare(b.section);
        } else if (sortField === 'rollNo') {
          comparison = a.rollNo - b.rollNo;
        } else if (sortField === 'studentName') {
          comparison = a.studentName.localeCompare(b.studentName);
        } else if (sortField === 'status') {
          comparison = a.status.localeCompare(b.status);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [studentAttendanceRecords, historySearch, historyGradeFilter, historyStatusFilter, sortField, sortOrder]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Student Attendance Statistics
  const studentStats = useMemo(() => {
    const stats: Record<
      string,
      { student: (typeof studentsList)[0]; totalSessions: number; present: number; late: number; absent: number; percentage: number }
    > = {};

    studentsList.forEach((stu) => {
      const records = studentAttendanceRecords.filter((r) => r.studentId === stu.id);
      const total = records.length;
      const present = records.filter((r) => r.status === 'Present').length;
      const late = records.filter((r) => r.status === 'Late').length;
      const absent = records.filter((r) => r.status === 'Absent').length;
      // In CBSE standards, Late counts as 0.5 attendance or 1 attendance with tardiness mark. Here: (present + 0.75 * late) / total
      const effectivePresent = present + late * 0.8;
      const percentage = total > 0 ? Math.round((effectivePresent / total) * 100) : 100;

      stats[stu.id] = {
        student: stu,
        totalSessions: total,
        present,
        late,
        absent,
        percentage,
      };
    });

    return Object.values(stats);
  }, [studentsList, studentAttendanceRecords]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            Student Attendance Tracking System
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mark students Present, Absent, or Late for class sessions with historical session logs sortable by date and class
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Attendance Register</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('marking')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'marking' ? 'bg-white text-indigo-600 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Session Attendance Marker
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'history' ? 'bg-white text-indigo-600 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sortable Attendance Records ({studentAttendanceRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'analytics' ? 'bg-white text-indigo-600 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          CBSE Attendance Thresholds &amp; Analytics
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: Attendance Marking Interface */}
      {activeTab === 'marking' && (
        <div className="space-y-5">
          {/* Controls Bar: Class, Section, Date, Session Type */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Standard / Grade</label>
                <select
                  value={markingGrade}
                  onChange={(e) => setMarkingGrade(e.target.value as StandardGrade)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {ALL_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g === 'Nursery' || g === 'KG1' || g === 'KG2' ? g : `Class ${g}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section</label>
                <select
                  value={markingSection}
                  onChange={(e) => setMarkingSection(e.target.value as SectionCode)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {ALL_SECTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Date</label>
                <input
                  type="date"
                  value={markingDate}
                  onChange={(e) => setMarkingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Session Category</label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Daily Morning Roll Call">Daily Morning Roll Call</option>
                  <option value="Period Session">Period Class Session (1 - 8)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Marking Faculty / In-charge</label>
                <select
                  value={markingTeacher}
                  onChange={(e) => setMarkingTeacher(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white truncate focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {staffList
                    .filter((s) => s.role.includes('Teacher') || s.role === 'Timetable In-charge')
                    .map((t) => (
                      <option key={t.id} value={`${t.name} (${t.role})`}>
                        {t.name} ({t.primarySkill})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* If Period Session chosen, select Period & Subject */}
            {sessionType === 'Period Session' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Period Slot</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {PERIOD_SLOTS.map((p) => (
                      <option key={p.periodNumber} value={p.periodNumber}>
                        Period {p.periodNumber} ({p.startTime} - {p.endTime})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject / Session Topic</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {subjectsList.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Roster Marking Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-900">
                  Roster: Class {markingGrade}-{markingSection} ({rosterStudents.length} Enrolled Students)
                </span>
                <span className="text-[10px] text-slate-500 font-mono">· Date: {markingDate}</span>
              </div>

              {/* Bulk Action Buttons */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleMarkAll('Present')}
                  className="px-2.5 py-1 font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('Absent')}
                  className="px-2.5 py-1 font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
                >
                  Mark All Absent
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('Late')}
                  className="px-2.5 py-1 font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors cursor-pointer"
                >
                  Mark All Late
                </button>
              </div>
            </div>

            {rosterStudents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No students enrolled in Class {markingGrade} - Section {markingSection}. Go to &quot;Student Registration&quot; to admit students into this section.
              </div>
            ) : (
              <form onSubmit={handleSaveAttendance}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 w-16">Roll #</th>
                        <th className="px-4 py-3">Student Name</th>
                        <th className="px-4 py-3">Admission No</th>
                        <th className="px-4 py-3 text-center w-72">Attendance Status</th>
                        <th className="px-4 py-3">Remarks / Reason (Optional)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rosterStudents.map((stu) => {
                        const currentStatus = sessionDraft[stu.id]?.status || 'Present';
                        const currentRemarks = sessionDraft[stu.id]?.remarks || '';
                        return (
                          <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-slate-700">#{stu.rollNo}</td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-slate-900">{stu.fullName}</span>
                              <span className="block text-[10px] text-slate-400">Parent: {stu.parentName}</span>
                            </td>
                            <td className="px-4 py-3 font-mono text-slate-600">{stu.admissionNo}</td>
                            <td className="px-4 py-3 text-center">
                              {/* Segmented Present, Absent, Late Button Group */}
                              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(stu.id, 'Present')}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                                    currentStatus === 'Present'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(stu.id, 'Late')}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                                    currentStatus === 'Late'
                                      ? 'bg-amber-600 text-white shadow-xs'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  Late
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(stu.id, 'Absent')}
                                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                                    currentStatus === 'Absent'
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  Absent
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={currentRemarks}
                                onChange={(e) => handleRemarksChange(stu.id, e.target.value)}
                                placeholder="e.g. Bus delayed, Medical note, Early release..."
                                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                  <div className="text-xs text-slate-500">
                    Signing Faculty: <strong className="text-slate-800">{markingTeacher}</strong>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Session Attendance</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Sortable Attendance Historical Records */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Search, Filter & Sort Controls */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search student, admission #, subject..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Grade:</span>
                <select
                  value={historyGradeFilter}
                  onChange={(e) => setHistoryGradeFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="All">All Grades</option>
                  {ALL_GRADES.map((g) => (
                    <option key={g} value={g}>
                      Class {g}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Status:</span>
                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present Only</option>
                  <option value="Late">Late Only</option>
                  <option value="Absent">Absent Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sortable Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th
                      onClick={() => toggleSort('date')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleSort('grade')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Class &amp; Section</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleSort('studentName')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Student Name</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-3">Session Type</th>
                    <th
                      onClick={() => toggleSort('status')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-center"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Attendance Status</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-3">Faculty In-charge</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedAndFilteredHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-slate-800">{rec.date}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        Class {rec.grade}-{rec.section}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{rec.studentName}</div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {rec.admissionNo} · Roll #{rec.rollNo}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{rec.sessionType}</div>
                        {rec.periodNumber && (
                          <div className="text-[10px] font-mono text-indigo-700">
                            Period {rec.periodNumber} ({rec.subjectName})
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-sm font-bold text-[11px] ${
                            rec.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-700'
                              : rec.status === 'Late'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-[11px]">{rec.markedBy}</td>
                      <td className="px-4 py-3 text-slate-500 text-[11px] italic">
                        {rec.remarks || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CBSE 75% Attendance Compliance & Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-900">
              <strong>Mandatory CBSE 75% Attendance Compliance Rule:</strong> Students with overall attendance below 75% are ineligible to sit for final Board and Term examinations unless medical exemptions are sanctioned by the Principal.
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3 font-mono">Total Recorded Sessions</th>
                  <th className="px-4 py-3 font-mono text-emerald-700">Present</th>
                  <th className="px-4 py-3 font-mono text-amber-700">Late</th>
                  <th className="px-4 py-3 font-mono text-rose-700">Absent</th>
                  <th className="px-4 py-3 font-mono">Attendance Rate</th>
                  <th className="px-4 py-3">CBSE Board Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentStats.map((item) => {
                  const isShortage = item.percentage < 75;
                  return (
                    <tr key={item.student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {item.student.fullName}
                        <span className="block font-mono text-[10px] text-slate-400 font-normal">
                          {item.student.admissionNo}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        Class {item.student.grade}-{item.student.section}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">{item.totalSessions}</td>
                      <td className="px-4 py-3 font-mono text-emerald-700">{item.present}</td>
                      <td className="px-4 py-3 font-mono text-amber-700">{item.late}</td>
                      <td className="px-4 py-3 font-mono text-rose-700 font-bold">{item.absent}</td>
                      <td className="px-4 py-3 font-mono font-bold text-sm">
                        <span className={isShortage ? 'text-rose-600' : 'text-emerald-700'}>
                          {item.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isShortage ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-sm">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Shortage Notice Issued</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Eligible for Exams</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
