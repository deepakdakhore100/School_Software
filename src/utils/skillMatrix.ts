import {
  StaffMember,
  SkillDomain,
  SkillProficiency,
  GradeSectionUnit,
  LabFacility,
  BusFleet,
  SubjectDefinition,
} from '../types';

export interface SkillCatalogGroup {
  domain: SkillDomain;
  skills: string[];
}

export const LAB_EXPERTISE_OPTIONS = [
  'Physics Lab',
  'Chemistry Lab',
  'Biology Lab',
  'Computer Lab',
  'AI & Robotics Lab',
] as const;

export const ELIGIBLE_ROLES_OPTIONS = [
  'Subject Teacher',
  'Substitute Teacher',
  'Class Teacher',
  'Lab In-charge',
  'Lab Assistant',
  'Department Head',
  'Exam Invigilator',
  'Bus Driver',
  'Bus Escort / Assistant',
  'Campus Security',
] as const;

export const ADDITIONAL_COMPETENCY_OPTIONS = [
  'Class Teacher Mentorship',
  'Exam Invigilation',
  'STEM Olympiad Coaching',
  'First Aid Safety',
  'Lab Safety & Calibration',
  'Remedial Coaching',
  'Timetable Coordination',
  'Student Bus Escort',
  'Fire Evacuation & Drill Lead',
] as const;

export const SKILL_CATALOG: SkillCatalogGroup[] = [
  {
    domain: 'Academic Subjects',
    skills: [
      'Mathematics',
      'Science',
      'Physics',
      'Chemistry',
      'Biology',
      'English',
      'Hindi',
      'Marathi',
      'Sanskrit',
      'Social Studies',
      'Environment Science (EVS)',
    ],
  },
  {
    domain: 'Lab & Technical Expertise',
    skills: [
      'Physics Lab',
      'Chemistry Lab',
      'Biology Lab',
      'Computer Lab',
      'AI & Robotics',
      'Physics Lab Apparatus & Calibration',
      'Chemical Reagents & Safety',
      'Microscope Slides & Specimen Care',
      'Computer Lab LAN & OS Deployment',
      'Robotics Sensors & 3D Print Setup',
    ],
  },
  {
    domain: 'Co-Curricular & Sports',
    skills: [
      'Sports & Athletics',
      'Swimming Session',
      'Fine Arts & Craft',
    ],
  },
  {
    domain: 'Transport & Fleet',
    skills: [
      'Heavy Vehicle Commercial Driving (HCV)',
      'Heavy Passenger Vehicle (HPV)',
      'Student Bus Boarding & Safety Protocol',
      'Primary Child Escort & Roster Checking',
      'Defensive Driving & First Aid',
      'Vehicle Mechanical Maintenance',
    ],
  },
  {
    domain: 'Safety & Administration',
    skills: [
      'Institutional Leadership',
      'Curriculum & Administration',
      'Gate Security & Visitor Verification',
      'Perimeter Patrol & CCTV Monitoring',
      'Accounts & Fee Ledger Processing',
      'Student Admissions & CBSE Registry',
    ],
  },
];

export const ALL_CATALOG_SKILLS: string[] = Array.from(
  new Set(SKILL_CATALOG.flatMap((group) => group.skills))
);

const SKILL_ALIASES: Record<string, string[]> = {
  mathematics: ['math', 'maths', 'problem solving'],
  science: ['physics', 'chemistry', 'biology', 'physics lab', 'chemistry lab', 'biology lab', 'science kit'],
  physics: ['science', 'physics lab', 'physics lab apparatus'],
  chemistry: ['science', 'chemistry lab', 'chemical reagents'],
  biology: ['science', 'biology lab', 'botany', 'microscope'],
  'environment science (evs)': ['evs', 'environment', 'science'],
  'computer lab': ['computer', 'lan', 'os deployment', 'computer hardware'],
  'ai & robotics': ['robotics', 'ai', 'ai & robotics lab', '3d print', 'sensors'],
  'ai & robotics lab': ['ai & robotics', 'robotics', 'sensors', '3d print'],
  'physics lab': ['physics', 'science', 'physics lab apparatus'],
  'chemistry lab': ['chemistry', 'science', 'chemical reagents'],
  'biology lab': ['biology', 'science', 'microscope'],
  'sports & athletics': ['sports', 'athletics', 'p.ed'],
  'swimming session': ['swimming', 'lifeguard', 'aquatic'],
  'fine arts & craft': ['arts', 'craft', 'fine arts'],
  english: ['english literature'],
  'heavy vehicle commercial driving (hcv)': ['driver', 'driving', 'hmv', 'hcv', 'hpv'],
  'heavy passenger vehicle (hpv)': ['driver', 'driving', 'hmv', 'hpv', 'hcv'],
  'student bus boarding & safety protocol': ['bus assistant', 'escort', 'boarding', 'roster'],
  'primary child escort & roster checking': ['bus assistant', 'escort', 'child care'],
};

function matchesToken(skillText: string, requirementText: string): boolean {
  const s = skillText.trim().toLowerCase();
  const r = requirementText.trim().toLowerCase();
  if (!s || !r) return false;
  if (s === r || s.includes(r) || r.includes(s)) return true;

  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    const reqMatchesCanonical =
      r === canonical || r.includes(canonical) || aliases.some((a) => r.includes(a));
    if (reqMatchesCanonical) {
      if (s === canonical || s.includes(canonical) || aliases.some((a) => s.includes(a))) {
        return true;
      }
    }
  }
  return false;
}

function proficiencyBonus(proficiency?: SkillProficiency): number {
  if (proficiency === 'Expert') return 15;
  if (proficiency === 'Proficient') return 8;
  if (proficiency === 'Foundational') return 2;
  return 10; // Default legacy staff
}

export type SkillMatchTier =
  | 'Primary Skill Match'
  | 'Secondary Skill Match'
  | 'Lab Expertise Match'
  | 'Additional Competency Match'
  | 'Available Free Teacher';

export interface SkillMatchResult {
  tier: SkillMatchTier;
  score: number;
  matchedSkill: string;
}

export function matchStaffSkillForRequirement(
  staff: StaffMember,
  requirement: string
): SkillMatchResult {
  if (matchesToken(staff.primarySkill || '', requirement)) {
    return {
      tier: 'Primary Skill Match',
      score: 100 + proficiencyBonus(staff.primarySkillProficiency),
      matchedSkill: staff.primarySkill,
    };
  }

  if (matchesToken(staff.secondarySkill || '', requirement)) {
    return {
      tier: 'Secondary Skill Match',
      score: 75 + proficiencyBonus(staff.secondarySkillProficiency),
      matchedSkill: staff.secondarySkill,
    };
  }

  const labHit = (staff.labExpertise || []).find((lab) => matchesToken(lab, requirement));
  if (labHit) {
    return {
      tier: 'Lab Expertise Match',
      score: 65,
      matchedSkill: labHit,
    };
  }

  const extraHit = (staff.additionalSkills || []).find((sk) => matchesToken(sk, requirement));
  if (extraHit) {
    return {
      tier: 'Additional Competency Match',
      score: 50,
      matchedSkill: extraHit,
    };
  }

  return {
    tier: 'Available Free Teacher',
    score: staff.role === 'Senior Teacher' ? 20 : 10,
    matchedSkill: staff.primarySkill || staff.role,
  };
}

export type MatrixCellLevel = 'primary' | 'secondary' | 'lab' | 'additional' | null;

export function getStaffSkillCellStatus(staff: StaffMember, skillName: string): MatrixCellLevel {
  const target = skillName.trim().toLowerCase();
  if ((staff.primarySkill || '').trim().toLowerCase() === target) return 'primary';
  if ((staff.secondarySkill || '').trim().toLowerCase() === target) return 'secondary';
  if ((staff.labExpertise || []).some((l) => l.trim().toLowerCase() === target)) return 'lab';
  if ((staff.additionalSkills || []).some((a) => a.trim().toLowerCase() === target)) return 'additional';
  return null;
}

export interface SkillCoverageSummary {
  skillName: string;
  totalCount: number;
  primaryCount: number;
  secondaryCount: number;
  labCount: number;
  additionalCount: number;
  presentCount: number;
  status: 'Healthy' | 'Single Point of Failure' | 'Uncovered';
}

export function getStaffSkillCoverage(
  staffList: StaffMember[],
  skillName: string
): SkillCoverageSummary {
  let primaryCount = 0;
  let secondaryCount = 0;
  let labCount = 0;
  let additionalCount = 0;
  let presentCount = 0;

  for (const staff of staffList) {
    const level = getStaffSkillCellStatus(staff, skillName);
    if (!level) continue;
    if (level === 'primary') primaryCount++;
    else if (level === 'secondary') secondaryCount++;
    else if (level === 'lab') labCount++;
    else if (level === 'additional') additionalCount++;
    if (staff.attendanceToday === 'Present') presentCount++;
  }

  const totalCount = primaryCount + secondaryCount + labCount + additionalCount;
  const status: SkillCoverageSummary['status'] =
    totalCount === 0 ? 'Uncovered' : totalCount === 1 ? 'Single Point of Failure' : 'Healthy';

  return {
    skillName,
    totalCount,
    primaryCount,
    secondaryCount,
    labCount,
    additionalCount,
    presentCount,
    status,
  };
}

export interface StaffActiveAssignment {
  type:
    | 'Class Teacher'
    | 'Lab In-charge'
    | 'Lab Assistant'
    | 'Bus Driver'
    | 'Bus Assistant'
    | 'Dept Head';
  label: string;
}

export function getStaffActiveAssignments(
  staffId: string,
  gradeSections: GradeSectionUnit[],
  labsList: LabFacility[],
  busFleet: BusFleet[],
  subjectsList: SubjectDefinition[]
): StaffActiveAssignment[] {
  const assignments: StaffActiveAssignment[] = [];

  const classSections = gradeSections.filter((gs) => gs.classTeacherId === staffId);
  if (classSections.length > 0) {
    const summary =
      classSections.length <= 2
        ? classSections.map((gs) => `${gs.grade}-${gs.section}`).join(', ')
        : `${classSections[0].grade}-${classSections[0].section} (+${classSections.length - 1} more)`;
    assignments.push({
      type: 'Class Teacher',
      label: `Class ${summary}`,
    });
  }

  for (const lab of labsList) {
    if (lab.inchargeStaffId === staffId) {
      assignments.push({ type: 'Lab In-charge', label: lab.name });
    }
    if (lab.labAssistantId === staffId) {
      assignments.push({ type: 'Lab Assistant', label: lab.name });
    }
  }

  for (const bus of busFleet) {
    if (bus.driverId === staffId) {
      assignments.push({ type: 'Bus Driver', label: bus.busNumber });
    }
    if (bus.assistantId === staffId) {
      assignments.push({ type: 'Bus Assistant', label: bus.busNumber });
    }
  }

  for (const sub of subjectsList) {
    if (sub.departmentHeadId === staffId) {
      assignments.push({ type: 'Dept Head', label: sub.name });
    }
  }

  return assignments;
}
