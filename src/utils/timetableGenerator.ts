import {
  StandardGrade,
  SectionCode,
  TimetableClassEntry,
  TimetablePeriodSlot,
  StaffMember,
  TimetableSubstitution,
} from '../types';
import { matchStaffSkillForRequirement, SkillMatchResult } from './skillMatrix';

export const PERIOD_SLOTS: TimetablePeriodSlot[] = [
  { periodNumber: 1, startTime: '08:15 AM', endTime: '09:00 AM' },
  { periodNumber: 2, startTime: '09:00 AM', endTime: '09:45 AM' },
  { periodNumber: 3, startTime: '09:45 AM', endTime: '10:30 AM' },
  // Short Recess: 10:30 - 10:45
  { periodNumber: 4, startTime: '10:45 AM', endTime: '11:30 AM' },
  { periodNumber: 5, startTime: '11:30 AM', endTime: '12:15 PM' },
  // Lunch Recess: 12:15 - 12:55
  { periodNumber: 6, startTime: '12:55 PM', endTime: '01:35 PM' },
  { periodNumber: 7, startTime: '01:35 PM', endTime: '02:15 PM' },
  { periodNumber: 8, startTime: '02:15 PM', endTime: '02:45 PM' },
];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

/**
 * Deterministically generates a balanced weekly schedule for a grade & section
 * guaranteeing:
 * - Weekly 1 Sports period (Wednesday Period 6)
 * - Weekly 1 Swimming session (Friday Period 7)
 * - Weekly 1 Computer Lab session (Tuesday Period 4)
 * - Core subjects (English, Hindi, Marathi, Science/EVS, Social Studies, Maths, AI/Robotics) distributed across periods
 */
export function generateWeeklyTimetable(
  grade: StandardGrade,
  section: SectionCode,
  staffList: StaffMember[]
): TimetableClassEntry[] {
  const entries: TimetableClassEntry[] = [];

  const academicStaff = staffList.filter(
    (s) => s.role.includes('Teacher') || s.role === 'Timetable In-charge' || s.role === 'Vice Principal'
  );
  const pool = academicStaff.length > 0 ? academicStaff : staffList;

  // Helper to find best teacher using full Skill Matrix (Primary, Secondary, Lab Expertise, Additional)
  const getTeacher = (subjectName: string, fallbackRole?: string): StaffMember => {
    let best = pool[0];
    let bestScore = -1;

    for (const candidate of pool) {
      const match = matchStaffSkillForRequirement(candidate, subjectName);
      const roleTieBreaker = candidate.role === 'Senior Teacher' ? 1 : 0;
      const total = match.score + roleTieBreaker;
      if (total > bestScore) {
        bestScore = total;
        best = candidate;
      }
    }

    if (bestScore >= 50) return best;

    if (fallbackRole) {
      const roleMatch = pool.find((s) => s.role === fallbackRole);
      if (roleMatch) return roleMatch;
    }

    return staffList[2] || pool[0];
  };

  const isJunior = grade === 'Nursery' || grade === 'KG1' || grade === 'KG2' || Number(grade) <= 4;
  const isHighSchool = Number(grade) >= 9;

  DAYS_OF_WEEK.forEach((day, dayIndex) => {
    for (let period = 1; period <= 8; period++) {
      let subjectCode = 'ENG-101';
      let subjectName = 'English';
      let roomOrLab = `Classroom Gr.${grade}-${section}`;
      let isLabSession = false;
      let isSports = false;
      let isSwimming = false;
      let isComputerLab = false;
      let assignedTeacher = getTeacher('English');

      // Rule 1: Weekly 1 Sports guaranteed (Wednesday Period 6)
      if (day === 'Wednesday' && period === 6) {
        subjectCode = 'SPT-110';
        subjectName = 'Sports & Athletics';
        roomOrLab = 'Main Athletics Grounds';
        isSports = true;
        assignedTeacher = getTeacher('Sports', 'Special Teacher');
      }
      // Rule 2: Weekly 1 Swimming guaranteed (Friday Period 7)
      else if (day === 'Friday' && period === 7) {
        subjectCode = 'SWM-111';
        subjectName = 'Swimming Session';
        roomOrLab = 'Aquatic Center Pool 1';
        isSwimming = true;
        assignedTeacher = getTeacher('Swimming', 'Special Teacher');
      }
      // Rule 3: Weekly 1 Computer Lab guaranteed (Tuesday Period 4)
      else if (day === 'Tuesday' && period === 4) {
        subjectCode = 'CMP-108';
        subjectName = 'Computer Lab';
        roomOrLab = 'Computer Lab (Tech Block B-101)';
        isComputerLab = true;
        isLabSession = true;
        assignedTeacher = getTeacher('Computer Lab', 'Senior Teacher');
      }
      // Rule 4: AI & Robotics Lab for Grade 4+ (Thursday Period 5)
      else if (!isJunior && day === 'Thursday' && period === 5) {
        subjectCode = 'AIR-109';
        subjectName = 'AI & Robotics';
        roomOrLab = 'AI & Robotics Lab (Hub B-102)';
        isLabSession = true;
        assignedTeacher = getTeacher('AI & Robotics', 'Special Teacher');
      }
      // Rule 5: Science Practical for Grade 8+ (Monday Period 3)
      else if (isHighSchool && day === 'Monday' && period === 3) {
        subjectCode = 'SCI-105';
        subjectName = 'Science (Physics / Chem Lab)';
        roomOrLab = 'Physics Lab A-201';
        isLabSession = true;
        assignedTeacher = getTeacher('Physics Lab', 'Senior Teacher');
      }
      // General Core Academic distribution across remainder
      else {
        const slotHash = (dayIndex * 8 + period + section.charCodeAt(0)) % 7;
        switch (slotHash) {
          case 0:
            subjectCode = 'MAT-104';
            subjectName = 'Mathematics';
            assignedTeacher = getTeacher('Mathematics');
            break;
          case 1:
            subjectCode = isJunior ? 'EVS-106' : 'SCI-105';
            subjectName = isJunior ? 'Environment Science (EVS)' : 'Science';
            assignedTeacher = isJunior ? getTeacher('Environment Science (EVS)') : getTeacher('Science');
            break;
          case 2:
            subjectCode = 'ENG-101';
            subjectName = 'English';
            assignedTeacher = getTeacher('English');
            break;
          case 3:
            subjectCode = isJunior ? 'ART-112' : 'SST-107';
            subjectName = isJunior ? 'Fine Arts & Craft' : 'Social Studies';
            assignedTeacher = isJunior ? getTeacher('Fine Arts & Craft') : getTeacher('Social Studies');
            break;
          case 4:
            subjectCode = 'HIN-102';
            subjectName = 'Hindi';
            assignedTeacher = getTeacher('Hindi');
            break;
          case 5:
            subjectCode = 'MAR-103';
            subjectName = 'Marathi';
            assignedTeacher = getTeacher('Marathi');
            break;
          case 6:
          default:
            subjectCode = 'MAT-104';
            subjectName = 'Mathematics (Problem Solving)';
            assignedTeacher = getTeacher('Mathematics');
            break;
        }
      }

      entries.push({
        id: `TT-${grade}-${section}-${day}-${period}`,
        grade,
        section,
        day,
        period,
        subjectCode,
        subjectName,
        teacherId: assignedTeacher.id,
        teacherName: assignedTeacher.name,
        roomOrLab,
        isLabSession,
        isSports,
        isSwimming,
        isComputerLab,
      });
    }
  });

  return entries;
}

export interface RankedTeacherCandidate {
  teacher: StaffMember;
  match: SkillMatchResult;
  isFree: boolean;
  busyClassLabel?: string;
}

/**
 * Ranks all present academic staff for a specific timetable slot using the Skill Matrix,
 * flagging whether each teacher is free or already assigned during (day, period).
 */
export function getRankedTeachersForSlot(
  day: DayOfWeek,
  period: number,
  subjectName: string,
  staffList: StaffMember[],
  allTimetableEntries: TimetableClassEntry[],
  excludeTeacherId?: string
): RankedTeacherCandidate[] {
  const presentAcademic = staffList.filter(
    (s) =>
      s.attendanceToday === 'Present' &&
      (s.role.includes('Teacher') || s.role === 'Timetable In-charge' || s.role === 'Vice Principal') &&
      s.id !== excludeTeacherId
  );

  const busyMap = new Map<string, string>();
  for (const entry of allTimetableEntries) {
    if (entry.day === day && entry.period === period) {
      busyMap.set(entry.teacherId, `Class ${entry.grade}-${entry.section} (${entry.subjectCode})`);
    }
  }

  return presentAcademic
    .map((teacher) => {
      const match = matchStaffSkillForRequirement(teacher, subjectName);
      const busyClassLabel = busyMap.get(teacher.id);
      return {
        teacher,
        match,
        isFree: !busyClassLabel,
        busyClassLabel,
      };
    })
    .sort((a, b) => {
      // Free teachers first, then highest skill match score
      if (a.isFree !== b.isFree) return a.isFree ? -1 : 1;
      return b.match.score - a.match.score;
    });
}

/**
 * Smart substitution engine:
 * When teacher attendance changes on a day:
 * Scans for all absent teachers.
 * Detects affected timetable periods.
 * Finds free teachers using the Skill Matrix (Primary, Secondary, Lab Expertise, Additional Skills).
 * Prepares substitution proposals for Timetable In-charge approval!
 */
export function generateSubstitutionsForDay(
  day: DayOfWeek,
  dateStr: string,
  staffList: StaffMember[],
  allTimetableEntries: TimetableClassEntry[],
  existingSubstitutions: TimetableSubstitution[]
): TimetableSubstitution[] {
  const absentTeachers = staffList.filter(
    (s) =>
      (s.attendanceToday === 'Absent' || s.attendanceToday === 'On Leave') &&
      (s.role.includes('Teacher') || s.role === 'Timetable In-charge' || s.role === 'Vice Principal')
  );

  if (absentTeachers.length === 0) {
    return [];
  }

  const absentTeacherIds = new Set(absentTeachers.map((t) => t.id));

  // Find all classes on this day taught by any absent teacher
  const affectedEntries = allTimetableEntries.filter(
    (entry) => entry.day === day && absentTeacherIds.has(entry.teacherId)
  );

  const newSubstitutions: TimetableSubstitution[] = [];

  for (const entry of affectedEntries) {
    const existing = existingSubstitutions.find(
      (sub) =>
        sub.date === dateStr &&
        sub.day === day &&
        sub.period === entry.period &&
        sub.grade === entry.grade &&
        sub.section === entry.section
    );

    if (existing) {
      newSubstitutions.push(existing);
      continue;
    }

    const originalTeacher = staffList.find((s) => s.id === entry.teacherId);
    if (!originalTeacher) continue;

    const periodSlot = PERIOD_SLOTS.find((p) => p.periodNumber === entry.period);
    const periodTime = periodSlot ? `${periodSlot.startTime} - ${periodSlot.endTime}` : `Period ${entry.period}`;

    // Find teachers who are Present today and NOT teaching in period `entry.period` on `day`
    const busyTeacherIdsInPeriod = new Set(
      allTimetableEntries
        .filter((e) => e.day === day && e.period === entry.period && !absentTeacherIds.has(e.teacherId))
        .map((e) => e.teacherId)
    );

    const availableTeachers = staffList.filter(
      (s) =>
        s.attendanceToday === 'Present' &&
        (s.role.includes('Teacher') || s.role === 'Timetable In-charge' || s.role === 'Vice Principal') &&
        !busyTeacherIdsInPeriod.has(s.id) &&
        s.id !== originalTeacher.id
    );

    if (availableTeachers.length === 0) {
      const emergencyIncharge = staffList.find((s) => s.role === 'Timetable In-charge') || staffList[2];
      newSubstitutions.push({
        id: `SUB-${Date.now()}-${entry.id}`,
        date: dateStr,
        grade: entry.grade,
        section: entry.section,
        day,
        period: entry.period,
        periodTime,
        originalTeacherId: originalTeacher.id,
        originalTeacherName: originalTeacher.name,
        originalTeacherRole: originalTeacher.role,
        subjectName: entry.subjectName,
        proposedTeacherId: emergencyIncharge.id,
        proposedTeacherName: emergencyIncharge.name,
        proposedTeacherRole: emergencyIncharge.role,
        matchCriteria: 'Available Free Teacher',
        matchedSkill: emergencyIncharge.primarySkill,
        status: 'Pending Timetable In-charge Approval',
        notes: 'Emergency substitution - Timetable In-charge intervention requested.',
      });
      continue;
    }

    // Rank available teachers using full Skill Matrix matching
    let bestCandidate = availableTeachers[0];
    let bestMatch = matchStaffSkillForRequirement(availableTeachers[0], entry.subjectName);

    for (const candidate of availableTeachers.slice(1)) {
      const candidateMatch = matchStaffSkillForRequirement(candidate, entry.subjectName);
      if (candidateMatch.score > bestMatch.score) {
        bestMatch = candidateMatch;
        bestCandidate = candidate;
      }
    }

    newSubstitutions.push({
      id: `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      date: dateStr,
      grade: entry.grade,
      section: entry.section,
      day,
      period: entry.period,
      periodTime,
      originalTeacherId: originalTeacher.id,
      originalTeacherName: originalTeacher.name,
      originalTeacherRole: originalTeacher.role,
      subjectName: entry.subjectName,
      proposedTeacherId: bestCandidate.id,
      proposedTeacherName: bestCandidate.name,
      proposedTeacherRole: bestCandidate.role,
      matchCriteria: bestMatch.tier,
      matchedSkill: bestMatch.matchedSkill,
      status: 'Pending Timetable In-charge Approval',
      notes: `Matched via ${bestMatch.tier} (${bestMatch.matchedSkill}). Teacher is free in Period ${entry.period}.`,
    });
  }

  return newSubstitutions;
}
