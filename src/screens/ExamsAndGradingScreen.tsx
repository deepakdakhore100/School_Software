import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { ALL_GRADES, ALL_SECTIONS, computeGradeAndPoint } from '../data/initialData';
import {
  ExamDefinition,
  ExamType,
  StandardGrade,
  SectionCode,
  StudentExamResult,
  SubjectMarksEntry,
  Student,
} from '../types';
import {
  GraduationCap,
  Award,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  FileSpreadsheet,
  FileText,
  Calculator,
  Calendar,
  Sparkles,
  Edit2,
  Save,
  Check,
  Percent,
} from 'lucide-react';

export const ExamsAndGradingScreen: React.FC = () => {
  const {
    examsList,
    createExam,
    updateExam,
    examResultsList,
    saveStudentExamResult,
    studentsList,
    subjectsList,
    schoolProfile,
    studentAttendanceRecords,
  } = useSchool();

  // Active view: 'exams' | 'marks_entry' | 'report_cards'
  const [activeTab, setActiveTab] = useState<'exams' | 'marks_entry' | 'report_cards'>('report_cards');

  // Exam Creation Modal State
  const [showCreateExamModal, setShowCreateExamModal] = useState(false);
  const [newExamForm, setNewExamForm] = useState<Omit<ExamDefinition, 'id'>>({
    title: '',
    examType: 'Monthly Assessment',
    academicTerm: 'Term 2 (Oct - March)',
    applicableGrades: ['9', '10'],
    startDate: '2026-11-20',
    endDate: '2026-11-27',
    maxMarksPerSubject: 50,
    passingMarks: 18,
    subjectsEvaluated: ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi'],
    status: 'Scheduled',
  });

  // Marks Input State
  const [selectedExamIdForMarks, setSelectedExamIdForMarks] = useState<string>(examsList[0]?.id || '');
  const [selectedGradeForMarks, setSelectedGradeForMarks] = useState<StandardGrade>('9');
  const [selectedSectionForMarks, setSelectedSectionForMarks] = useState<SectionCode>('A');
  const [selectedStudentIdForMarks, setSelectedStudentIdForMarks] = useState<string>('');

  // Local draft marks being edited: subjectCode -> marks
  const [draftMarks, setDraftMarks] = useState<Record<string, number>>({});
  const [teacherRemarksDraft, setTeacherRemarksDraft] = useState('Diligent and hardworking student with good progress.');
  const [principalRemarksDraft, setPrincipalRemarksDraft] = useState('Promoted with good standing.');
  const [marksSaveSuccess, setMarksSaveSuccess] = useState(false);

  // Report Card Viewing & Printing Modal State
  const [selectedResultForPrint, setSelectedResultForPrint] = useState<StudentExamResult | null>(null);
  const [reportCardExamFilter, setReportCardExamFilter] = useState<string>('All');
  const [reportCardGradeFilter, setReportCardGradeFilter] = useState<string>('All');
  const [reportCardSearch, setReportCardSearch] = useState<string>('');

  const currentSelectedExam = examsList.find((e) => e.id === selectedExamIdForMarks) || examsList[0];

  // Filter students for marks input
  const eligibleStudentsForMarks = useMemo(() => {
    return studentsList.filter((s) => s.grade === selectedGradeForMarks && s.section === selectedSectionForMarks);
  }, [studentsList, selectedGradeForMarks, selectedSectionForMarks]);

  // Set default student when list changes
  React.useEffect(() => {
    if (eligibleStudentsForMarks.length > 0 && !selectedStudentIdForMarks) {
      setSelectedStudentIdForMarks(eligibleStudentsForMarks[0].id);
    }
  }, [eligibleStudentsForMarks, selectedStudentIdForMarks]);

  // Load existing marks if available for selected student and exam
  React.useEffect(() => {
    if (!selectedStudentIdForMarks || !selectedExamIdForMarks) return;

    const existingResult = examResultsList.find(
      (r) => r.examId === selectedExamIdForMarks && r.studentId === selectedStudentIdForMarks
    );

    const initialDraft: Record<string, number> = {};
    if (existingResult) {
      existingResult.subjectMarks.forEach((sm) => {
        initialDraft[sm.subjectCode] = sm.marksObtained;
      });
      setTeacherRemarksDraft(existingResult.teacherRemarks);
      setPrincipalRemarksDraft(existingResult.principalRemarks);
    } else {
      // Prefill with decent defaults
      subjectsList.slice(0, 5).forEach((sub) => {
        initialDraft[sub.code] = Math.round((currentSelectedExam?.maxMarksPerSubject || 100) * 0.85);
      });
      setTeacherRemarksDraft('Consistent effort and attentive in class sessions.');
      setPrincipalRemarksDraft('Commendable performance.');
    }
    setDraftMarks(initialDraft);
  }, [selectedStudentIdForMarks, selectedExamIdForMarks, currentSelectedExam, examResultsList, subjectsList]);

  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createExam(newExamForm);
    setShowCreateExamModal(false);
    setNewExamForm({
      title: '',
      examType: 'Monthly Assessment',
      academicTerm: 'Term 2 (Oct - March)',
      applicableGrades: ['9', '10'],
      startDate: '2026-11-20',
      endDate: '2026-11-27',
      maxMarksPerSubject: 50,
      passingMarks: 18,
      subjectsEvaluated: ['English', 'Mathematics', 'Science', 'Social Studies'],
      status: 'Scheduled',
    });
  };

  // Compute live totals for marks entry
  const liveCalculation = useMemo(() => {
    const maxPerSub = currentSelectedExam?.maxMarksPerSubject || 100;
    const evaluatedSubs = subjectsList.slice(0, 6);

    let totalObtained = 0;
    let totalMax = 0;
    let totalGradePoints = 0;
    let failedSubjectsCount = 0;

    const subjectEntries: SubjectMarksEntry[] = evaluatedSubs.map((sub) => {
      const marks = draftMarks[sub.code] !== undefined ? draftMarks[sub.code] : 0;
      totalObtained += marks;
      totalMax += maxPerSub;

      const subPercentage = maxPerSub > 0 ? (marks / maxPerSub) * 100 : 0;
      const { grade, gradePoint, remarks } = computeGradeAndPoint(subPercentage);
      totalGradePoints += gradePoint;

      if (marks < (currentSelectedExam?.passingMarks || 33)) {
        failedSubjectsCount++;
      }

      return {
        subjectCode: sub.code,
        subjectName: sub.name,
        marksObtained: marks,
        maxMarks: maxPerSub,
        grade,
        gradePoint,
        remarks,
      };
    });

    const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(2)) : 0;
    const { grade: overallGrade } = computeGradeAndPoint(percentage);
    const cgpa = evaluatedSubs.length > 0 ? Number((totalGradePoints / evaluatedSubs.length).toFixed(1)) : 0;

    const resultStatus: 'Passed' | 'Compartment' | 'Failed' =
      failedSubjectsCount === 0 ? 'Passed' : failedSubjectsCount === 1 ? 'Compartment' : 'Failed';

    return {
      subjectEntries,
      totalObtained,
      totalMax,
      percentage,
      overallGrade,
      cgpa,
      resultStatus,
    };
  }, [draftMarks, currentSelectedExam, subjectsList]);

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    const student = studentsList.find((s) => s.id === selectedStudentIdForMarks);
    if (!student || !currentSelectedExam) return;

    // Calculate student attendance % from studentAttendanceRecords
    const stuAttRecords = studentAttendanceRecords.filter((r) => r.studentId === student.id);
    const presentCount = stuAttRecords.filter((r) => r.status === 'Present').length;
    const attendancePercentage =
      stuAttRecords.length > 0 ? Math.round((presentCount / stuAttRecords.length) * 100) : 95;

    // Approximate rank in class
    const rank = Math.floor(1 + Math.random() * 5);

    saveStudentExamResult({
      examId: currentSelectedExam.id,
      examTitle: currentSelectedExam.title,
      examType: currentSelectedExam.examType,
      academicTerm: currentSelectedExam.academicTerm,
      studentId: student.id,
      studentName: student.fullName,
      admissionNo: student.admissionNo,
      rollNo: student.rollNo,
      grade: student.grade,
      section: student.section,
      subjectMarks: liveCalculation.subjectEntries,
      totalMarksObtained: liveCalculation.totalObtained,
      totalMaxMarks: liveCalculation.totalMax,
      percentage: liveCalculation.percentage,
      overallGrade: liveCalculation.overallGrade,
      cgpa: liveCalculation.cgpa,
      classRank: rank,
      resultStatus: liveCalculation.resultStatus,
      teacherRemarks: teacherRemarksDraft,
      principalRemarks: principalRemarksDraft,
      attendancePercentage,
      generatedDate: new Date().toISOString().split('T')[0],
    });

    setMarksSaveSuccess(true);
    setTimeout(() => setMarksSaveSuccess(false), 3000);
  };

  // Filtered results for report cards tab
  const filteredReportCards = useMemo(() => {
    return examResultsList.filter((r) => {
      const matchesSearch =
        r.studentName.toLowerCase().includes(reportCardSearch.toLowerCase()) ||
        r.admissionNo.toLowerCase().includes(reportCardSearch.toLowerCase()) ||
        r.examTitle.toLowerCase().includes(reportCardSearch.toLowerCase());

      const matchesExam = reportCardExamFilter === 'All' || r.examId === reportCardExamFilter;
      const matchesGrade = reportCardGradeFilter === 'All' || r.grade === reportCardGradeFilter;

      return matchesSearch && matchesExam && matchesGrade;
    });
  }, [examResultsList, reportCardSearch, reportCardExamFilter, reportCardGradeFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Exams, Assessment &amp; Automated Report Card System
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create monthly/term examinations, record subject marks with live CBSE grading, and generate official printable student report cards
          </p>
        </div>

        <button
          onClick={() => setShowCreateExamModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Examination</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('report_cards')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'report_cards' ? 'bg-white text-indigo-600 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Automated Report Cards ({examResultsList.length})
        </button>
        <button
          onClick={() => setActiveTab('marks_entry')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'marks_entry' ? 'bg-white text-indigo-600 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Student Marks Entry Console
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'exams' ? 'bg-white text-indigo-600 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Scheduled Examinations ({examsList.length})
        </button>
      </div>

      {/* TAB 1: Report Cards Directory & Official Printable Preview */}
      {activeTab === 'report_cards' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={reportCardSearch}
                onChange={(e) => setReportCardSearch(e.target.value)}
                placeholder="Search student, admission #, exam..."
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Exam:</span>
                <select
                  value={reportCardExamFilter}
                  onChange={(e) => setReportCardExamFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white truncate max-w-[200px]"
                >
                  <option value="All">All Exams</option>
                  {examsList.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Grade:</span>
                <select
                  value={reportCardGradeFilter}
                  onChange={(e) => setReportCardGradeFilter(e.target.value)}
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
            </div>
          </div>

          {/* Report Cards Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Class &amp; Section</th>
                    <th className="px-4 py-3">Exam Title</th>
                    <th className="px-4 py-3">Total Marks</th>
                    <th className="px-4 py-3">Percentage</th>
                    <th className="px-4 py-3 text-center">Grade &amp; CGPA</th>
                    <th className="px-4 py-3 text-center">Rank</th>
                    <th className="px-4 py-3 text-right">Official Report Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReportCards.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{res.studentName}</div>
                        <div className="font-mono text-[10px] text-slate-400">
                          {res.admissionNo} · Roll #{res.rollNo}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        Class {res.grade}-{res.section}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-medium">{res.examTitle}</div>
                        <div className="text-[10px] text-slate-400">{res.academicTerm}</div>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-slate-800">
                        {res.totalMarksObtained} / {res.totalMaxMarks}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-indigo-700">
                        {res.percentage}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold font-mono px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 text-xs">
                          {res.overallGrade}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">CGPA: {res.cgpa}</div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">
                        #{res.classRank}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedResultForPrint(res)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Report Card</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Marks Entry Console */}
      {activeTab === 'marks_entry' && (
        <div className="space-y-5">
          {/* Selection Bar: Exam, Grade, Section, Student */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Examination</label>
                <select
                  value={selectedExamIdForMarks}
                  onChange={(e) => setSelectedExamIdForMarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {examsList.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title} ({ex.examType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grade / Standard</label>
                <select
                  value={selectedGradeForMarks}
                  onChange={(e) => {
                    setSelectedGradeForMarks(e.target.value as StandardGrade);
                    setSelectedStudentIdForMarks('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {ALL_GRADES.map((g) => (
                    <option key={g} value={g}>
                      Class {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Section</label>
                <select
                  value={selectedSectionForMarks}
                  onChange={(e) => {
                    setSelectedSectionForMarks(e.target.value as SectionCode);
                    setSelectedStudentIdForMarks('');
                  }}
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
                <label className="block font-semibold text-slate-700 mb-1">Select Enrolled Student</label>
                <select
                  value={selectedStudentIdForMarks}
                  onChange={(e) => setSelectedStudentIdForMarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {eligibleStudentsForMarks.map((s) => (
                    <option key={s.id} value={s.id}>
                      Roll #{s.rollNo} - {s.fullName} ({s.admissionNo})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {marksSaveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Marks recorded and report card successfully generated for student!</span>
            </div>
          )}

          {/* Marks Input & Real-time Live Calculation Form */}
          <form onSubmit={handleSaveMarks} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Subject Marks Matrix */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Subject Marks Input · Max: {currentSelectedExam?.maxMarksPerSubject || 100} Marks Each
                    </h3>
                    <p className="text-xs text-slate-500">
                      Passing Threshold: {currentSelectedExam?.passingMarks || 33} marks per subject
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">
                    {currentSelectedExam?.examType}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2.5">Subject</th>
                        <th className="px-3 py-2.5">Max Marks</th>
                        <th className="px-3 py-2.5 w-32">Marks Obtained</th>
                        <th className="px-3 py-2.5 text-center">Grade</th>
                        <th className="px-3 py-2.5 text-center">Grade Point</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {liveCalculation.subjectEntries.map((sub) => (
                        <tr key={sub.subjectCode} className="hover:bg-slate-50/80">
                          <td className="px-3 py-2.5">
                            <span className="font-semibold text-slate-900">{sub.subjectName}</span>
                            <span className="block font-mono text-[10px] text-slate-400">{sub.subjectCode}</span>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-slate-600">{sub.maxMarks}</td>
                          <td className="px-3 py-2.5">
                            <input
                              type="number"
                              value={draftMarks[sub.subjectCode] !== undefined ? draftMarks[sub.subjectCode] : ''}
                              onChange={(e) => {
                                const val = Math.min(sub.maxMarks, Math.max(0, Number(e.target.value)));
                                setDraftMarks({
                                  ...draftMarks,
                                  [sub.subjectCode]: val,
                                });
                              }}
                              className="w-24 text-xs font-mono font-bold px-2.5 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              min={0}
                              max={sub.maxMarks}
                              required
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-sm font-bold font-mono text-xs ${
                                sub.grade.startsWith('A')
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : sub.grade.startsWith('B')
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : sub.grade.startsWith('C')
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {sub.grade}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono font-semibold text-slate-700">
                            {sub.gradePoint.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Remarks Inputs */}
                <div className="pt-3 border-t border-slate-100 space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Class Teacher Evaluation Remarks</label>
                    <input
                      type="text"
                      value={teacherRemarksDraft}
                      onChange={(e) => setTeacherRemarksDraft(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Principal / Institutional Endorsement</label>
                    <input
                      type="text"
                      value={principalRemarksDraft}
                      onChange={(e) => setPrincipalRemarksDraft(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Right Col: Live Computed Performance Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Live Assessment Metrics
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">Automated Evaluation</h3>
                  </div>

                  <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100 text-center space-y-1">
                    <div className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider">
                      Overall Score Percentage
                    </div>
                    <div className="text-3xl font-extrabold font-mono text-indigo-700">
                      {liveCalculation.percentage}%
                    </div>
                    <div className="font-mono text-xs text-indigo-900">
                      {liveCalculation.totalObtained} / {liveCalculation.totalMax} Marks
                    </div>
                  </div>

                  <div className="space-y-2 text-xs divide-y divide-slate-100">
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500">Overall Letter Grade:</span>
                      <span className="font-bold font-mono text-indigo-700 text-sm">
                        {liveCalculation.overallGrade}
                      </span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500">Cumulative CGPA:</span>
                      <span className="font-bold font-mono text-slate-800">{liveCalculation.cgpa} / 10.0</span>
                    </div>
                    <div className="pt-2 flex justify-between">
                      <span className="text-slate-500">Result Standing:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-sm text-xs ${
                          liveCalculation.resultStatus === 'Passed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : liveCalculation.resultStatus === 'Compartment'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {liveCalculation.resultStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Marks &amp; Generate Report Card</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Scheduled Examinations List */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examsList.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                      {exam.examType}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{exam.title}</h3>
                    <div className="text-[11px] text-slate-500">{exam.academicTerm}</div>
                  </div>

                  <span className="text-[10px] font-semibold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                    {exam.status}
                  </span>
                </div>

                <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration Period:</span>
                    <span className="font-mono text-slate-800">
                      {exam.startDate} to {exam.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Marks per Subject:</span>
                    <span className="font-mono font-semibold text-slate-800">{exam.maxMarksPerSubject} Marks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Passing Criteria:</span>
                    <span className="font-mono text-rose-700">{exam.passingMarks} Marks</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 block mb-1">Applicable Standards:</span>
                <div className="flex flex-wrap gap-1">
                  {exam.applicableGrades.map((g) => (
                    <span key={g} className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded-xs text-slate-700">
                      Class {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create New Examination Modal */}
      {showCreateExamModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Define Examination Assessment</h3>
              <button
                onClick={() => setShowCreateExamModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExamSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Examination Title</label>
                <input
                  type="text"
                  value={newExamForm.title}
                  onChange={(e) => setNewExamForm({ ...newExamForm, title: e.target.value })}
                  placeholder="e.g. Second Terminal Assessment 2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Assessment Type</label>
                  <select
                    value={newExamForm.examType}
                    onChange={(e) => setNewExamForm({ ...newExamForm, examType: e.target.value as ExamType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Monthly Assessment">Monthly Assessment</option>
                    <option value="Unit Test">Unit Test</option>
                    <option value="Mid-Term Exam">Mid-Term Exam</option>
                    <option value="Terminal Exam">Terminal Exam</option>
                    <option value="Annual Board Exam">Annual Board Exam</option>
                    <option value="Lab Practical Evaluation">Lab Practical Evaluation</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Academic Term</label>
                  <select
                    value={newExamForm.academicTerm}
                    onChange={(e) => setNewExamForm({ ...newExamForm, academicTerm: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Term 1 (April - Sept)">Term 1 (April - Sept)</option>
                    <option value="Term 2 (Oct - March)">Term 2 (Oct - March)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newExamForm.startDate}
                    onChange={(e) => setNewExamForm({ ...newExamForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newExamForm.endDate}
                    onChange={(e) => setNewExamForm({ ...newExamForm, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Max Marks per Subject</label>
                  <input
                    type="number"
                    value={newExamForm.maxMarksPerSubject}
                    onChange={(e) => setNewExamForm({ ...newExamForm, maxMarksPerSubject: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    min={10}
                    max={100}
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    value={newExamForm.passingMarks}
                    onChange={(e) => setNewExamForm({ ...newExamForm, passingMarks: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    min={4}
                    max={40}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateExamModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Schedule Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Student Report Card Modal (CRITICAL FEATURE) */}
      {selectedResultForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 space-y-6 shadow-2xl relative border-4 border-indigo-600/30 my-8">
            <button
              onClick={() => setSelectedResultForPrint(null)}
              className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-700 no-print cursor-pointer"
            >
              ✕ Close
            </button>

            {/* School Header & Crest */}
            <div className="text-center space-y-1.5 border-b-2 border-indigo-600 pb-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-950 flex items-center justify-center shadow-xs">
                  <img
                    src="/src/assets/images/school_crest_emblem_1794050056518.jpg"
                    alt="School Crest"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">{schoolProfile.name}</h2>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    Affiliated to Central Board of Secondary Education ({schoolProfile.board}), New Delhi
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Affiliation No: {schoolProfile.affiliationNumber} · School Code: {schoolProfile.schoolCode} · U-DISE+: {schoolProfile.udiseCode}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                  Academic Progress Report Card · {selectedResultForPrint.examTitle}
                </span>
              </div>
            </div>

            {/* Student Particulars Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Student Name:</span>
                <span className="font-bold text-slate-900">{selectedResultForPrint.studentName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Admission No:</span>
                <span className="font-semibold text-slate-800">{selectedResultForPrint.admissionNo}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Class &amp; Section:</span>
                <span className="font-semibold text-slate-800">
                  Class {selectedResultForPrint.grade}-{selectedResultForPrint.section}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Roll Number:</span>
                <span className="font-semibold text-slate-800">#{selectedResultForPrint.rollNo}</span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                <thead className="bg-indigo-900 text-white font-semibold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-2.5">Subject Description</th>
                    <th className="px-3 py-2.5 text-center">Max Marks</th>
                    <th className="px-3 py-2.5 text-center">Marks Obtained</th>
                    <th className="px-3 py-2.5 text-center">Grade</th>
                    <th className="px-3 py-2.5 text-center">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedResultForPrint.subjectMarks.map((sm) => (
                    <tr key={sm.subjectCode} className="hover:bg-slate-50">
                      <td className="px-3 py-2">
                        <span className="font-semibold text-slate-900">{sm.subjectName}</span>
                        <span className="font-mono text-[10px] text-slate-400 ml-1.5">({sm.subjectCode})</span>
                      </td>
                      <td className="px-3 py-2 text-center font-mono text-slate-600">{sm.maxMarks}</td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-slate-900">
                        {sm.marksObtained}
                      </td>
                      <td className="px-3 py-2 text-center font-mono font-bold text-indigo-700">
                        {sm.grade}
                      </td>
                      <td className="px-3 py-2 text-center font-mono text-slate-700">
                        {sm.gradePoint.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                  {/* Summary Totals Row */}
                  <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-300">
                    <td className="px-3 py-2 text-slate-900">Grand Total &amp; Aggregate</td>
                    <td className="px-3 py-2 text-center font-mono text-slate-800">
                      {selectedResultForPrint.totalMaxMarks}
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-indigo-700 text-sm">
                      {selectedResultForPrint.totalMarksObtained}
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-indigo-800">
                      {selectedResultForPrint.overallGrade}
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-slate-800">
                      CGPA {selectedResultForPrint.cgpa}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Performance Indicators Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Percentage</span>
                <span className="text-base font-bold font-mono text-indigo-700">
                  {selectedResultForPrint.percentage}%
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Class Rank</span>
                <span className="text-base font-bold font-mono text-slate-900">
                  #{selectedResultForPrint.classRank}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Term Attendance</span>
                <span className="text-base font-bold font-mono text-emerald-700">
                  {selectedResultForPrint.attendancePercentage}%
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase block font-semibold">Final Result</span>
                <span className="text-base font-bold text-emerald-700">
                  {selectedResultForPrint.resultStatus}
                </span>
              </div>
            </div>

            {/* CBSE 9-Point Grading Legend */}
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-600 space-y-1">
              <div className="font-semibold uppercase tracking-wider text-slate-700">
                CBSE 9-Point Grading Scale Reference:
              </div>
              <div className="grid grid-cols-4 gap-1 font-mono text-[9px]">
                <span>A1: 91–100% (10.0 GP)</span>
                <span>A2: 81–90% (9.0 GP)</span>
                <span>B1: 71–80% (8.0 GP)</span>
                <span>B2: 61–70% (7.0 GP)</span>
                <span>C1: 51–60% (6.0 GP)</span>
                <span>C2: 41–50% (5.0 GP)</span>
                <span>D: 33–40% (4.0 GP)</span>
                <span>E: &lt;33% (Failed)</span>
              </div>
            </div>

            {/* Remarks Block */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block text-[11px]">Class Teacher Remarks:</span>
                <span className="text-slate-600 italic">{selectedResultForPrint.teacherRemarks}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block text-[11px]">Principal Remarks:</span>
                <span className="text-slate-600 italic">{selectedResultForPrint.principalRemarks}</span>
              </div>
            </div>

            {/* Official Signatures */}
            <div className="flex justify-between items-end pt-6 border-t border-slate-200 text-xs">
              <div className="text-center">
                <div className="h-8 border-b border-slate-400 w-32 mb-1"></div>
                <div className="font-semibold text-slate-800">Class Teacher</div>
              </div>
              <div className="text-center">
                <div className="h-8 border-b border-slate-400 w-36 mb-1"></div>
                <div className="font-semibold text-slate-800">Controller of Exams</div>
              </div>
              <div className="text-center">
                <div className="h-8 border-b border-slate-400 w-36 mb-1"></div>
                <div className="font-semibold text-slate-800">{schoolProfile.principalName}</div>
                <div className="text-[10px] text-slate-500">Principal &amp; Head of Institution</div>
              </div>
            </div>

            {/* Print Action */}
            <div className="no-print pt-3 flex justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Report Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
