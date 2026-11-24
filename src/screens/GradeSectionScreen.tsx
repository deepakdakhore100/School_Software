import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { ALL_GRADES, ALL_SECTIONS } from '../data/initialData';
import { StandardGrade, SectionCode, GradeSectionUnit } from '../types';
import {
  GraduationCap,
  DoorOpen,
  Users,
  Search,
  Filter,
  CheckCircle,
  Calendar,
  Edit2,
  Sparkles,
} from 'lucide-react';

interface GradeSectionScreenProps {
  onNavigateToTimetable?: (grade: StandardGrade, section: SectionCode) => void;
}

export const GradeSectionScreen: React.FC<GradeSectionScreenProps> = ({ onNavigateToTimetable }) => {
  const { gradeSections, updateGradeSection, staffList, setSelectedGrade, setSelectedSection } = useSchool();
  const [selectedGradeTab, setSelectedGradeTab] = useState<StandardGrade | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUnit, setEditingUnit] = useState<GradeSectionUnit | null>(null);

  const teacherOptions = [...staffList]
    .filter((s) => s.role.includes('Teacher') || s.role === 'Timetable In-charge')
    .sort((a, b) => {
      const aEligible = (a.eligibleRoles || []).includes('Class Teacher') ? 1 : 0;
      const bEligible = (b.eligibleRoles || []).includes('Class Teacher') ? 1 : 0;
      return bEligible - aEligible;
    });

  const gradeCategories = [
    { label: 'All Standards (60 Sections)', value: 'All' },
    { label: 'Pre-Primary (Nursery, KG1, KG2)', value: 'Pre-Primary', grades: ['Nursery', 'KG1', 'KG2'] },
    { label: 'Primary (Classes 1 to 5)', value: 'Primary', grades: ['1', '2', '3', '4', '5'] },
    { label: 'Middle School (Classes 6 to 8)', value: 'Middle', grades: ['6', '7', '8'] },
    { label: 'Secondary (Classes 9 & 10)', value: 'Secondary', grades: ['9', '10'] },
    { label: 'Senior Secondary (Classes 11 & 12)', value: 'Senior', grades: ['11', '12'] },
  ];

  const filteredUnits = gradeSections.filter((unit) => {
    const matchesGrade = selectedGradeTab === 'All' || unit.grade === selectedGradeTab;

    let matchesCategory = true;
    if (selectedCategory !== 'All') {
      const cat = gradeCategories.find((c) => c.value === selectedCategory);
      if (cat && cat.grades) {
        matchesCategory = cat.grades.includes(unit.grade);
      }
    }

    const matchesSearch =
      unit.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.classTeacherName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesGrade && matchesCategory && matchesSearch;
  });

  const totalEnrolled = gradeSections.reduce((acc, curr) => acc + curr.enrolledStudentsCount, 0);
  const totalCapacity = gradeSections.reduce((acc, curr) => acc + curr.studentCapacity, 0);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUnit) {
      updateGradeSection(editingUnit.id, editingUnit);
      setEditingUnit(null);
    }
  };

  const handleSelectTimetable = (grade: StandardGrade, section: SectionCode) => {
    setSelectedGrade(grade);
    setSelectedSection(section);
    if (onNavigateToTimetable) {
      onNavigateToTimetable(grade, section);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            Standard Grades &amp; Sections Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configured 15 Grades (Nursery, KG1, KG2, 1 through 12) with 4 Sections each (A, B, C, D) — Total 60 Units
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500">Total Sections:</span>{' '}
            <strong className="font-mono text-slate-900">{gradeSections.length}</strong>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500">Student Enrolment:</span>{' '}
            <strong className="font-mono text-indigo-600">{totalEnrolled} / {totalCapacity}</strong>
          </div>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {gradeCategories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setSelectedCategory(cat.value);
                setSelectedGradeTab('All');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search room, teacher, grade..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Quick Grade Filter Bar */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
          Jump to Grade:
        </span>
        <button
          onClick={() => setSelectedGradeTab('All')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            selectedGradeTab === 'All'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          All
        </button>
        {ALL_GRADES.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGradeTab(g)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              selectedGradeTab === g
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {g === 'Nursery' || g === 'KG1' || g === 'KG2' ? g : `Class ${g}`}
          </button>
        ))}
      </div>

      {/* Grid of Section Units */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredUnits.map((unit) => {
          const occupancy = Math.round((unit.enrolledStudentsCount / unit.studentCapacity) * 100);
          const teacherProfile = staffList.find((s) => s.id === unit.classTeacherId || s.name === unit.classTeacherName);
          return (
            <div
              key={unit.id}
              className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 hover:border-indigo-400 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">
                      {unit.grade === 'Nursery' || unit.grade === 'KG1' || unit.grade === 'KG2'
                        ? unit.grade
                        : `Class ${unit.grade}`}
                    </span>
                    <span className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                      {unit.section}
                    </span>
                  </div>
                  <button
                    onClick={() => setEditingUnit(unit)}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Edit Classroom or Assign Class Teacher via Skill Matrix"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 mt-3 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1">
                      <DoorOpen className="w-3.5 h-3.5" /> Room:
                    </span>
                    <span className="font-mono text-slate-800">{unit.roomNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Floor:</span>
                    <span className="text-slate-700">{unit.floor}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Class Teacher:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[130px]" title={unit.classTeacherName}>
                      {unit.classTeacherName}
                    </span>
                  </div>
                  {teacherProfile && (
                    <div className="text-[10px] text-slate-400 text-right truncate">
                      {teacherProfile.primarySkill} · {teacherProfile.secondarySkill}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Enrolled Strength:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {unit.enrolledStudentsCount} / {unit.studentCapacity} ({occupancy}%)
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${occupancy}%` }}
                  />
                </div>

                <button
                  onClick={() => handleSelectTimetable(unit.grade, unit.section)}
                  className="w-full mt-2 py-1.5 px-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>View Section Timetable</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Section Modal */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-semibold text-slate-900">
                Edit Grade {editingUnit.grade} - Section {editingUnit.section}
              </h3>
              <button
                onClick={() => setEditingUnit(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Room Number</label>
                <input
                  type="text"
                  value={editingUnit.roomNumber}
                  onChange={(e) => setEditingUnit({ ...editingUnit, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Floor Level</label>
                <input
                  type="text"
                  value={editingUnit.floor}
                  onChange={(e) => setEditingUnit({ ...editingUnit, floor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Assigned Class Teacher (Ranked by Skill Matrix Eligibility)
                </label>
                <select
                  value={editingUnit.classTeacherName}
                  onChange={(e) => {
                    const teacher = teacherOptions.find((t) => t.name === e.target.value);
                    setEditingUnit({
                      ...editingUnit,
                      classTeacherName: e.target.value,
                      classTeacherId: teacher ? teacher.id : editingUnit.classTeacherId,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {teacherOptions.map((t) => {
                    const isEligible = (t.eligibleRoles || []).includes('Class Teacher');
                    return (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.primarySkill} · {t.secondarySkill}{isEligible ? ' · Class Teacher Eligible' : ''})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Student Capacity</label>
                <input
                  type="number"
                  value={editingUnit.studentCapacity}
                  onChange={(e) => setEditingUnit({ ...editingUnit, studentCapacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  min={20}
                  max={50}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingUnit(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
