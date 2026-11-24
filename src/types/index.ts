export type SchoolBoard = 'CBSE' | 'STATE' | 'ICSE' | 'International (IB/Cambridge)';
export type GrantType = 'Government Grant-in-aid' | 'Unaided Private' | 'Minority Trust' | 'CSR Foundation Funded';

export interface SchoolProfile {
  name: string;
  tagline: string;
  board: SchoolBoard;
  affiliationNumber: string;
  affiliationValidUntil: string;
  schoolCode: string;
  udiseCode: string;
  registrationNumber: string;
  grantType: GrantType;
  grantSanctionOrder: string;
  establishmentYear: number;
  principalName: string;
  vicePrincipalName: string;
  timetableInchargeName: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  email: string;
  website: string;
  schoolTimings: string;
  fireSafetyValidUntil: string;
  buildingSafetyValidUntil: string;
  sanitationCertificate: string;
  totalCampusAreaAcres: number;
  totalClassrooms: number;
}

export type StaffRole =
  | 'Principal'
  | 'Vice Principal'
  | 'Senior Teacher'
  | 'Junior Teacher'
  | 'Special Teacher'
  | 'Staff'
  | 'Lab Assistant'
  | 'Bus Driver'
  | 'Bus Assistant'
  | 'Security Guard'
  | 'Timetable In-charge';

export type AttendanceStatus = 'Present' | 'Absent' | 'On Leave' | 'On Duty';

export type SkillProficiency = 'Expert' | 'Proficient' | 'Foundational';

export type SkillDomain =
  | 'Academic Subjects'
  | 'Lab & Technical Expertise'
  | 'Co-Curricular & Sports'
  | 'Transport & Fleet'
  | 'Safety & Administration';

export interface StaffMember {
  id: string;
  employeeCode: string;
  name: string;
  role: StaffRole;
  primarySkill: string;
  secondarySkill: string;
  primarySkillProficiency?: SkillProficiency;
  secondarySkillProficiency?: SkillProficiency;
  labExpertise?: string[];
  additionalSkills?: string[];
  eligibleRoles?: string[];
  qualification: string;
  experienceYears: number;
  phone: string;
  email: string;
  joiningDate: string;
  assignedGrade?: string;
  assignedSection?: string;
  assignedLabOrBus?: string;
  attendanceToday: AttendanceStatus;
  basicSalary: number;
  pfApplicable: boolean;
  avatarSeed?: string;
}

export type LabType = 'Physics Lab' | 'Chemistry Lab' | 'Biology Lab' | 'Computer Lab' | 'AI & Robotics Lab';

export interface LabFacility {
  id: string;
  name: LabType;
  roomNo: string;
  inchargeStaffId: string;
  inchargeStaffName: string;
  labAssistantId: string;
  labAssistantName: string;
  maxCapacity: number;
  equipmentCount: number;
  keyEquipment: string[];
  safetyCertificationDate: string;
  weeklyScheduleEligibleGrades: string[];
  status: 'Operational' | 'Maintenance';
}

export type StandardGrade =
  | 'Nursery'
  | 'KG1'
  | 'KG2'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12';

export type SectionCode = 'A' | 'B' | 'C' | 'D';

export interface GradeSectionUnit {
  id: string;
  grade: StandardGrade;
  section: SectionCode;
  roomNumber: string;
  floor: string;
  classTeacherId: string;
  classTeacherName: string;
  studentCapacity: number;
  enrolledStudentsCount: number;
}

export interface Student {
  id: string;
  admissionNo: string;
  rollNo: number;
  fullName: string;
  grade: StandardGrade;
  section: SectionCode;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  parentName: string;
  parentRelation: string;
  parentPhone: string;
  parentEmail: string;
  residentialAddress: string;
  emergencyContact: string;
  busServiceOpted: boolean;
  busRouteId?: string;
  busStop?: string;
  feeRepaymentPlan: 'One-Time Annual' | 'Quarterly' | 'Monthly';
  annualFeeAmount: number;
  totalFeePaid: number;
  feeStatus: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  admissionDate: string;
  healthRemarks?: string;
}

export interface BusStop {
  id: string;
  stopName: string;
  morningPickupTime: string;
  afternoonDropTime: string;
}

export interface BusFleet {
  id: string;
  busNumber: string; // e.g. "Bus 01", "Bus 02"
  plateNumber: string;
  seatingCapacity: number;
  gpsDeviceId: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  assistantId: string;
  assistantName: string;
  assistantPhone: string;
  routeName: string;
  routeCode: string;
  stops: BusStop[];
  assignedStudentsCount: number;
  fuelType: 'CNG' | 'Diesel' | 'Electric';
  fitnessValidUntil: string;
  insuranceValidUntil: string;
  status: 'On Route' | 'At Depot' | 'Maintenance';
}

export type SubjectCategory =
  | 'Language'
  | 'Core Academic'
  | 'Natural Science'
  | 'Social Studies'
  | 'Technology & AI'
  | 'Sports & Physical Ed'
  | 'Performing & Fine Arts';

export interface SubjectDefinition {
  id: string;
  code: string;
  name: string;
  category: SubjectCategory;
  weeklyPeriodsRequired: number;
  applicableGrades: StandardGrade[];
  requiresLab: boolean;
  labType?: LabType;
  departmentHeadId: string;
  departmentHeadName: string;
  syllabusCoveredPercent?: number;
}

export interface GradeFeeSlab {
  gradeCategory: string; // e.g. "Pre-Primary (Nursery, KG1, KG2)", "Primary (1 to 5)", etc.
  grades: StandardGrade[];
  annualTuition: number;
  developmentFee: number;
  laboratoryAndAIFee: number;
  sportsAndSwimmingFee: number;
  examinationFee: number;
  totalAnnualFee: number;
  oneTimeDiscountPercent: number; // e.g., 5% discount if paid annual one-time
  oneTimePayable: number;
  quarterlySlabAmount: number; // Total / 4
  monthlySlabAmount: number; // Total / 10 or 12
}

export interface FeeTransaction {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  grade: StandardGrade;
  section: SectionCode;
  amountPaid: number;
  paymentDate: string;
  paymentMode: 'UPI / QR' | 'Credit / Debit Card' | 'Net Banking' | 'Demand Draft / Cheque' | 'Cash Deposit';
  paymentPlan: 'One-Time Annual' | 'Quarterly' | 'Monthly';
  installmentName: string; // e.g. "Q1 (April - June)", "Month 3 (June)"
  transactionRefNo: string;
  collectedBy: string;
  status: 'Successful' | 'Pending Clearance';
}

export interface PayrollScaleConfig {
  role: StaffRole;
  approxStaffCount: number; // Principal (1), Vice Principal (1), Senior (40), Junior (60), Special (10) => ~100 Teachers; Staff (120), Lab Assistant (30), Bus Driver (30), Security (10)
  basicPayRange: string;
  averageBasic: number;
  hraPercent: number; // 24%
  daPercent: number; // 18%
  specialAllowance: number;
  pfDeductionPercent: number; // 12%
  professionalTax: number; // 200
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  role: StaffRole;
  month: string;
  year: number;
  workingDays: number;
  presentDays: number;
  basicPay: number;
  hra: number;
  da: number;
  specialAllowance: number;
  grossSalary: number;
  pfDeduction: number;
  taxDeduction: number;
  netPayable: number;
  paymentStatus: 'Paid' | 'Processing' | 'Generated';
  paymentDate?: string;
  bankAccountLast4: string;
}

export interface TimetablePeriodSlot {
  periodNumber: number; // 1 to 8
  startTime: string;
  endTime: string;
  isBreak?: boolean;
  breakTitle?: string;
}

export interface TimetableClassEntry {
  id: string;
  grade: StandardGrade;
  section: SectionCode;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number;
  subjectCode: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  roomOrLab: string;
  isLabSession: boolean;
  isSports: boolean;
  isSwimming: boolean;
  isComputerLab: boolean;
  isSubstituted?: boolean;
  substitutionId?: string;
}

export interface TimetableSubstitution {
  id: string;
  date: string;
  grade: StandardGrade;
  section: SectionCode;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number;
  periodTime: string;
  originalTeacherId: string;
  originalTeacherName: string;
  originalTeacherRole: StaffRole;
  subjectName: string;
  proposedTeacherId: string;
  proposedTeacherName: string;
  proposedTeacherRole: StaffRole;
  matchCriteria:
    | 'Primary Skill Match'
    | 'Secondary Skill Match'
    | 'Lab Expertise Match'
    | 'Additional Competency Match'
    | 'Available Free Teacher';
  matchedSkill: string;
  status: 'Pending Timetable In-charge Approval' | 'Approved' | 'Rejected' | 'Manual Override';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export type StudentAttendanceStatus = 'Present' | 'Absent' | 'Late';

export interface StudentAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  grade: StandardGrade;
  section: SectionCode;
  sessionType: 'Daily Morning Roll Call' | 'Period Session';
  periodNumber?: number; // 1 to 8 if period session
  subjectName?: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  rollNo: number;
  status: StudentAttendanceStatus;
  markedBy: string;
  remarks?: string;
}

export type ExamType =
  | 'Monthly Assessment'
  | 'Unit Test'
  | 'Mid-Term Exam'
  | 'Terminal Exam'
  | 'Annual Board Exam'
  | 'Lab Practical Evaluation';

export interface ExamDefinition {
  id: string;
  title: string;
  examType: ExamType;
  academicTerm: 'Term 1 (April - Sept)' | 'Term 2 (Oct - March)';
  applicableGrades: StandardGrade[];
  startDate: string;
  endDate: string;
  maxMarksPerSubject: number;
  passingMarks: number;
  subjectsEvaluated: string[];
  status: 'Scheduled' | 'In Progress' | 'Grading Completed' | 'Results Published';
}

export interface SubjectMarksEntry {
  subjectCode: string;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  grade: string; // A1, A2, B1, B2, C1, C2, D, E
  gradePoint: number;
  remarks?: string;
}

export interface StudentExamResult {
  id: string;
  examId: string;
  examTitle: string;
  examType: ExamType;
  academicTerm: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  rollNo: number;
  grade: StandardGrade;
  section: SectionCode;
  subjectMarks: SubjectMarksEntry[];
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  overallGrade: string;
  cgpa: number;
  classRank: number;
  resultStatus: 'Passed' | 'Compartment' | 'Failed';
  teacherRemarks: string;
  principalRemarks: string;
  attendancePercentage: number;
  generatedDate: string;
}
