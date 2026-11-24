import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SchoolProfile,
  StaffMember,
  LabFacility,
  GradeSectionUnit,
  Student,
  BusFleet,
  SubjectDefinition,
  GradeFeeSlab,
  FeeTransaction,
  TimetableClassEntry,
  TimetableSubstitution,
  AttendanceStatus,
  StandardGrade,
  SectionCode,
  StudentAttendanceRecord,
  StudentAttendanceStatus,
  ExamDefinition,
  StudentExamResult,
} from '../types';
import {
  initialSchoolProfile,
  initialStaff,
  initialLabs,
  initialBuses,
  initialFeeSlabs,
  initialStudents,
  initialFeeTransactions,
  initialSubjects,
  generateAllGradeSections,
  initialStudentAttendance,
  initialExams,
  initialExamResults,
} from '../data/initialData';
import {
  generateWeeklyTimetable,
  generateSubstitutionsForDay,
  DayOfWeek,
  DAYS_OF_WEEK,
} from '../utils/timetableGenerator';
import { matchStaffSkillForRequirement } from '../utils/skillMatrix';

export interface ManualTimetableAdjustment {
  teacherId: string;
  teacherName: string;
  skillNote?: string;
}

interface SchoolContextType {
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;
  staffList: StaffMember[];
  addStaffMember: (staff: Omit<StaffMember, 'id' | 'employeeCode'>) => void;
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => void;
  toggleStaffAttendance: (staffId: string, status: AttendanceStatus) => void;
  labsList: LabFacility[];
  updateLabFacility: (id: string, updates: Partial<LabFacility>) => void;
  gradeSections: GradeSectionUnit[];
  updateGradeSection: (id: string, updates: Partial<GradeSectionUnit>) => void;
  studentsList: Student[];
  addStudent: (student: Omit<Student, 'id' | 'admissionNo' | 'totalFeePaid' | 'feeStatus'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  busFleet: BusFleet[];
  addBus: (bus: Omit<BusFleet, 'id'>) => void;
  updateBus: (id: string, updates: Partial<BusFleet>) => void;
  subjectsList: SubjectDefinition[];
  addSubject: (subject: Omit<SubjectDefinition, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<SubjectDefinition>) => void;
  feeSlabs: GradeFeeSlab[];
  updateFeeSlab: (index: number, slab: GradeFeeSlab) => void;
  feeTransactions: FeeTransaction[];
  recordFeePayment: (payment: Omit<FeeTransaction, 'id' | 'receiptNumber'>) => string;
  selectedGrade: StandardGrade;
  setSelectedGrade: (grade: StandardGrade) => void;
  selectedSection: SectionCode;
  setSelectedSection: (section: SectionCode) => void;
  activeSimulationDay: DayOfWeek;
  setActiveSimulationDay: (day: DayOfWeek) => void;
  simulationDate: string;
  substitutionsList: TimetableSubstitution[];
  approveSubstitution: (id: string, approvedBy?: string) => void;
  approveAllSubstitutions: () => void;
  rejectSubstitution: (id: string) => void;
  manualOverrideSubstitution: (id: string, newTeacherId: string, newTeacherName: string) => void;
  manualTimetableAdjustments: Record<string, ManualTimetableAdjustment>;
  adjustTimetableSlotTeacher: (slotId: string, teacherId: string, teacherName: string, skillNote?: string) => void;
  clearTimetableSlotAdjustment: (slotId: string) => void;
  currentTimetable: TimetableClassEntry[];
  studentAttendanceRecords: StudentAttendanceRecord[];
  markBatchAttendance: (records: Omit<StudentAttendanceRecord, 'id'>[]) => void;
  updateAttendanceRecord: (id: string, status: StudentAttendanceStatus, remarks?: string) => void;
  examsList: ExamDefinition[];
  createExam: (exam: Omit<ExamDefinition, 'id'>) => void;
  updateExam: (id: string, updates: Partial<ExamDefinition>) => void;
  examResultsList: StudentExamResult[];
  saveStudentExamResult: (result: Omit<StudentExamResult, 'id'>) => void;
  resetDemoData: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'vidyasetu_profile_v1',
  STAFF: 'vidyasetu_staff_v1',
  LABS: 'vidyasetu_labs_v1',
  GRADE_SECTIONS: 'vidyasetu_grade_sections_v1',
  STUDENTS: 'vidyasetu_students_v1',
  BUSES: 'vidyasetu_buses_v1',
  SUBJECTS: 'vidyasetu_subjects_v1',
  FEE_SLABS: 'vidyasetu_fee_slabs_v1',
  TRANSACTIONS: 'vidyasetu_transactions_v1',
  SUBSTITUTIONS: 'vidyasetu_substitutions_v1',
  TIMETABLE_ADJUSTMENTS: 'vidyasetu_timetable_adjustments_v1',
  STUDENT_ATTENDANCE: 'vidyasetu_student_attendance_v1',
  EXAMS: 'vidyasetu_exams_v1',
  EXAM_RESULTS: 'vidyasetu_exam_results_v1',
};

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. School Profile
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : initialSchoolProfile;
  });

  // 2. Staff
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    return saved ? JSON.parse(saved) : initialStaff;
  });

  // 3. Labs
  const [labsList, setLabsList] = useState<LabFacility[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LABS);
    return saved ? JSON.parse(saved) : initialLabs;
  });

  // 4. Grade Sections
  const [gradeSections, setGradeSections] = useState<GradeSectionUnit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GRADE_SECTIONS);
    return saved ? JSON.parse(saved) : generateAllGradeSections();
  });

  // 5. Students
  const [studentsList, setStudentsList] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : initialStudents;
  });

  // 6. Bus Fleet
  const [busFleet, setBusFleet] = useState<BusFleet[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BUSES);
    return saved ? JSON.parse(saved) : initialBuses;
  });

  // 7. Subjects
  const [subjectsList, setSubjectsList] = useState<SubjectDefinition[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  // 8. Fee Slabs
  const [feeSlabs, setFeeSlabs] = useState<GradeFeeSlab[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FEE_SLABS);
    return saved ? JSON.parse(saved) : initialFeeSlabs;
  });

  // 9. Fee Transactions
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : initialFeeTransactions;
  });

  // 10. Substitutions & Timetable state
  const [substitutionsList, setSubstitutionsList] = useState<TimetableSubstitution[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBSTITUTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [manualTimetableAdjustments, setManualTimetableAdjustments] = useState<
    Record<string, ManualTimetableAdjustment>
  >(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TIMETABLE_ADJUSTMENTS);
    return saved ? JSON.parse(saved) : {};
  });

  // 11. Student Attendance Records
  const [studentAttendanceRecords, setStudentAttendanceRecords] = useState<StudentAttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENT_ATTENDANCE);
    return saved ? JSON.parse(saved) : initialStudentAttendance;
  });

  // 12. Exams List
  const [examsList, setExamsList] = useState<ExamDefinition[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
    return saved ? JSON.parse(saved) : initialExams;
  });

  // 13. Exam Results List
  const [examResultsList, setExamResultsList] = useState<StudentExamResult[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXAM_RESULTS);
    return saved ? JSON.parse(saved) : initialExamResults;
  });

  const [selectedGrade, setSelectedGrade] = useState<StandardGrade>('9');
  const [selectedSection, setSelectedSection] = useState<SectionCode>('A');
  const [activeSimulationDay, setActiveSimulationDay] = useState<DayOfWeek>('Monday');
  const simulationDate = '2026-11-09'; // Standard active academic Monday

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENT_ATTENDANCE, JSON.stringify(studentAttendanceRecords));
  }, [studentAttendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(examsList));
  }, [examsList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(examResultsList));
  }, [examResultsList]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(schoolProfile));
  }, [schoolProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  }, [staffList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LABS, JSON.stringify(labsList));
  }, [labsList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GRADE_SECTIONS, JSON.stringify(gradeSections));
  }, [gradeSections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(studentsList));
  }, [studentsList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUSES, JSON.stringify(busFleet));
  }, [busFleet]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjectsList));
  }, [subjectsList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FEE_SLABS, JSON.stringify(feeSlabs));
  }, [feeSlabs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(feeTransactions));
  }, [feeTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBSTITUTIONS, JSON.stringify(substitutionsList));
  }, [substitutionsList]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.TIMETABLE_ADJUSTMENTS,
      JSON.stringify(manualTimetableAdjustments)
    );
  }, [manualTimetableAdjustments]);

  // Generate Base Timetable for selected Grade & Section
  const baseTimetable = generateWeeklyTimetable(selectedGrade, selectedSection, staffList);

  // Overlay manual timetable adjustments and approved substitutions onto timetable
  const currentTimetable = baseTimetable.map((slot) => {
    const manualAdj = manualTimetableAdjustments[slot.id];
    if (manualAdj) {
      return {
        ...slot,
        teacherId: manualAdj.teacherId,
        teacherName: `${manualAdj.teacherName} (Adjusted)`,
        isSubstituted: true,
        substitutionId: manualAdj.skillNote || 'Skill Matrix Adjustment',
      };
    }

    const matchingSub = substitutionsList.find(
      (sub) =>
        sub.day === slot.day &&
        sub.period === slot.period &&
        sub.grade === slot.grade &&
        sub.section === slot.section &&
        sub.status === 'Approved'
    );

    if (matchingSub) {
      return {
        ...slot,
        teacherId: matchingSub.proposedTeacherId,
        teacherName: `${matchingSub.proposedTeacherName} (Substituted)`,
        isSubstituted: true,
        substitutionId: matchingSub.id,
      };
    }
    return slot;
  });

  // Triggers substitution analysis whenever attendance or active day changes
  useEffect(() => {
    // Collect all classes across ALL sections for this day to analyze full collisions
    const allGradeTimetables: TimetableClassEntry[] = [];
    // Sampling representative active grades
    const sampleGrades: StandardGrade[] = ['Nursery', '1', '5', '9', '10', '12'];
    sampleGrades.forEach((g) => {
      (['A', 'B'] as SectionCode[]).forEach((s) => {
        allGradeTimetables.push(...generateWeeklyTimetable(g, s, staffList));
      });
    });

    const evaluatedSubs = generateSubstitutionsForDay(
      activeSimulationDay,
      simulationDate,
      staffList,
      allGradeTimetables,
      substitutionsList
    );

    // Merge without overriding existing decisions
    setSubstitutionsList((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const newlyAdded = evaluatedSubs.filter((s) => !existingIds.has(s.id));
      return [...prev, ...newlyAdded];
    });
  }, [staffList, activeSimulationDay]);

  const updateSchoolProfile = (updates: Partial<SchoolProfile>) => {
    setSchoolProfile((prev) => ({ ...prev, ...updates }));
  };

  const addStaffMember = (staff: Omit<StaffMember, 'id' | 'employeeCode'>) => {
    const count = staffList.length + 1;
    const newStaff: StaffMember = {
      ...staff,
      id: `STAFF-${String(count).padStart(3, '0')}`,
      employeeCode: `EMP-${staff.role.slice(0, 3).toUpperCase()}-${String(count).padStart(3, '0')}`,
    };
    setStaffList((prev) => [newStaff, ...prev]);
  };

  const updateStaffMember = (id: string, updates: Partial<StaffMember>) => {
    setStaffList((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const toggleStaffAttendance = (staffId: string, status: AttendanceStatus) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, attendanceToday: status } : s))
    );
  };

  const updateLabFacility = (id: string, updates: Partial<LabFacility>) => {
    setLabsList((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const updateGradeSection = (id: string, updates: Partial<GradeSectionUnit>) => {
    setGradeSections((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
  };

  const addStudent = (student: Omit<Student, 'id' | 'admissionNo' | 'totalFeePaid' | 'feeStatus'>) => {
    const count = studentsList.length + 1;
    const admNo = `VS-2026-${String(count + 500).padStart(4, '0')}`;
    const newStudent: Student = {
      ...student,
      id: `STU-${Date.now()}`,
      admissionNo: admNo,
      totalFeePaid: 0,
      feeStatus: 'Pending',
    };
    setStudentsList((prev) => [newStudent, ...prev]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudentsList((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const addBus = (bus: Omit<BusFleet, 'id'>) => {
    const count = busFleet.length + 1;
    const newBus: BusFleet = {
      ...bus,
      id: `BUS-${String(count).padStart(2, '0')}`,
    };
    setBusFleet((prev) => [...prev, newBus]);
  };

  const updateBus = (id: string, updates: Partial<BusFleet>) => {
    setBusFleet((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const addSubject = (subject: Omit<SubjectDefinition, 'id'>) => {
    const newSub: SubjectDefinition = {
      ...subject,
      id: `SUB-${Date.now()}`,
    };
    setSubjectsList((prev) => [...prev, newSub]);
  };

  const updateSubject = (id: string, updates: Partial<SubjectDefinition>) => {
    setSubjectsList((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const updateFeeSlab = (index: number, slab: GradeFeeSlab) => {
    setFeeSlabs((prev) => {
      const copy = [...prev];
      copy[index] = slab;
      return copy;
    });
  };

  const recordFeePayment = (payment: Omit<FeeTransaction, 'id' | 'receiptNumber'>): string => {
    const rcpNo = `RCP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTxn: FeeTransaction = {
      ...payment,
      id: `TXN-${Date.now()}`,
      receiptNumber: rcpNo,
    };

    setFeeTransactions((prev) => [newTxn, ...prev]);

    // Update Student paid amount and status
    setStudentsList((prev) =>
      prev.map((s) => {
        if (s.id === payment.studentId) {
          const newPaid = s.totalFeePaid + payment.amountPaid;
          const status =
            newPaid >= s.annualFeeAmount
              ? 'Paid'
              : newPaid > 0
              ? 'Partial'
              : 'Pending';
          return {
            ...s,
            totalFeePaid: newPaid,
            feeStatus: status,
          };
        }
        return s;
      })
    );

    return rcpNo;
  };

  const approveSubstitution = (id: string, approvedBy = schoolProfile.timetableInchargeName) => {
    setSubstitutionsList((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'Approved',
              reviewedBy: approvedBy,
              reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : s
      )
    );
  };

  const approveAllSubstitutions = () => {
    setSubstitutionsList((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'Approved',
        reviewedBy: schoolProfile.timetableInchargeName,
        reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }))
    );
  };

  const rejectSubstitution = (id: string) => {
    setSubstitutionsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Rejected' } : s))
    );
  };

  const manualOverrideSubstitution = (id: string, newTeacherId: string, newTeacherName: string) => {
    const teacher = staffList.find((s) => s.id === newTeacherId);
    setSubstitutionsList((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const skillMatch = teacher
          ? matchStaffSkillForRequirement(teacher, s.subjectName)
          : { tier: 'Available Free Teacher' as const, matchedSkill: 'Manual Override Assignment' };
        return {
          ...s,
          proposedTeacherId: newTeacherId,
          proposedTeacherName: newTeacherName,
          proposedTeacherRole: teacher ? teacher.role : 'Senior Teacher',
          matchCriteria: skillMatch.tier,
          matchedSkill: skillMatch.matchedSkill,
          status: 'Approved',
          reviewedBy: `${schoolProfile.timetableInchargeName} (Skill Matrix Override)`,
          reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );
  };

  const adjustTimetableSlotTeacher = (
    slotId: string,
    teacherId: string,
    teacherName: string,
    skillNote?: string
  ) => {
    setManualTimetableAdjustments((prev) => ({
      ...prev,
      [slotId]: { teacherId, teacherName, skillNote },
    }));
  };

  const clearTimetableSlotAdjustment = (slotId: string) => {
    setManualTimetableAdjustments((prev) => {
      const next = { ...prev };
      delete next[slotId];
      return next;
    });
  };

  const markBatchAttendance = (records: Omit<StudentAttendanceRecord, 'id'>[]) => {
    const newRecords: StudentAttendanceRecord[] = records.map((r, i) => ({
      ...r,
      id: `ATT-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
    }));
    setStudentAttendanceRecords((prev) => {
      const updatedKeys = new Set(
        newRecords.map((nr) => `${nr.studentId}_${nr.date}_${nr.sessionType}_${nr.periodNumber || 0}`)
      );
      const filteredOld = prev.filter(
        (old) => !updatedKeys.has(`${old.studentId}_${old.date}_${old.sessionType}_${old.periodNumber || 0}`)
      );
      return [...newRecords, ...filteredOld];
    });
  };

  const updateAttendanceRecord = (id: string, status: StudentAttendanceStatus, remarks?: string) => {
    setStudentAttendanceRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, remarks: remarks !== undefined ? remarks : r.remarks } : r))
    );
  };

  const createExam = (exam: Omit<ExamDefinition, 'id'>) => {
    const newExam: ExamDefinition = {
      ...exam,
      id: `EXAM-${Date.now()}`,
    };
    setExamsList((prev) => [newExam, ...prev]);
  };

  const updateExam = (id: string, updates: Partial<ExamDefinition>) => {
    setExamsList((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const saveStudentExamResult = (result: Omit<StudentExamResult, 'id'>) => {
    const newResult: StudentExamResult = {
      ...result,
      id: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setExamResultsList((prev) => {
      const filtered = prev.filter((r) => !(r.examId === result.examId && r.studentId === result.studentId));
      return [newResult, ...filtered];
    });
  };

  const resetDemoData = () => {
    localStorage.clear();
    setSchoolProfile(initialSchoolProfile);
    setStaffList(initialStaff);
    setLabsList(initialLabs);
    setGradeSections(generateAllGradeSections());
    setStudentsList(initialStudents);
    setBusFleet(initialBuses);
    setSubjectsList(initialSubjects);
    setFeeSlabs(initialFeeSlabs);
    setFeeTransactions(initialFeeTransactions);
    setSubstitutionsList([]);
    setManualTimetableAdjustments({});
    setStudentAttendanceRecords(initialStudentAttendance);
    setExamsList(initialExams);
    setExamResultsList(initialExamResults);
  };

  return (
    <SchoolContext.Provider
      value={{
        schoolProfile,
        updateSchoolProfile,
        staffList,
        addStaffMember,
        updateStaffMember,
        toggleStaffAttendance,
        labsList,
        updateLabFacility,
        gradeSections,
        updateGradeSection,
        studentsList,
        addStudent,
        updateStudent,
        busFleet,
        addBus,
        updateBus,
        subjectsList,
        addSubject,
        updateSubject,
        feeSlabs,
        updateFeeSlab,
        feeTransactions,
        recordFeePayment,
        selectedGrade,
        setSelectedGrade,
        selectedSection,
        setSelectedSection,
        activeSimulationDay,
        setActiveSimulationDay,
        simulationDate,
        substitutionsList,
        approveSubstitution,
        approveAllSubstitutions,
        rejectSubstitution,
        manualOverrideSubstitution,
        manualTimetableAdjustments,
        adjustTimetableSlotTeacher,
        clearTimetableSlotAdjustment,
        currentTimetable,
        studentAttendanceRecords,
        markBatchAttendance,
        updateAttendanceRecord,
        examsList,
        createExam,
        updateExam,
        examResultsList,
        saveStudentExamResult,
        resetDemoData,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
