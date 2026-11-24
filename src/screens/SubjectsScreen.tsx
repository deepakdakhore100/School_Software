import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { ALL_GRADES } from '../data/initialData';
import { SubjectDefinition, SubjectCategory, StandardGrade, LabType } from '../types';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const SubjectsScreen: React.FC = () => {
  const { subjectsList, addSubject, updateSubject, staffList } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories: SubjectCategory[] = [
    'Language',
    'Core Academic',
    'Natural Science',
    'Social Studies',
    'Technology & AI',
    'Sports & Physical Ed',
    'Performing & Fine Arts',
  ];

  const facultyOptions = staffList.filter((s) => s.role.includes('Teacher') || s.role === 'Timetable In-charge');

  // Form State
  const [formData, setFormData] = useState<Omit<SubjectDefinition, 'id'>>({
    code: 'SAN-114',
    name: 'Sanskrit',
    category: 'Language',
    weeklyPeriodsRequired: 3,
    applicableGrades: ['6', '7', '8', '9', '10'],
    requiresLab: false,
    departmentHeadId: facultyOptions[0]?.id || 'STAFF-004',
    departmentHeadName: facultyOptions[0]?.name || 'Dr. Rajesh Tripathi',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const faculty = staffList.find((s) => s.id === formData.departmentHeadId);
    addSubject({
      ...formData,
      departmentHeadName: faculty ? faculty.name : formData.departmentHeadName,
    });
    setShowAddModal(false);
  };

  const filteredSubjects = subjectsList.filter((sub) => {
    const matchesSearch =
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.departmentHeadName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'All' || sub.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Curriculum &amp; Subject Definition
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure primary languages (English, Hindi, Marathi), core sciences (Physics, Chemistry, Biology, EVS), social studies, and weekly period quotas
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Define New Subject</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subject title, code, HOD..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500">Category:</span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <option value="All">All Categories ({subjectsList.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSubjects.map((sub) => (
          <div
            key={sub.id}
            className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 hover:border-indigo-400 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                    {sub.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">{sub.name}</h3>
                  <div className="text-[11px] text-slate-500">{sub.category}</div>
                </div>

                {sub.requiresLab && (
                  <span
                    className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm"
                    title={`Requires ${sub.labType || 'Lab Facility'}`}
                  >
                    <FlaskConical className="w-3 h-3" />
                    <span>Lab Practical</span>
                  </span>
                )}
              </div>

              <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Weekly Classes:</span>
                  <span className="font-mono font-semibold text-indigo-700">
                    {sub.weeklyPeriodsRequired} Periods / week
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Department Lead:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[150px]">{sub.departmentHeadName}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 block mb-1">Applicable Standards:</span>
              <div className="flex flex-wrap gap-1">
                {sub.applicableGrades.slice(0, 6).map((g) => (
                  <span key={g} className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded-xs text-slate-700">
                    {g}
                  </span>
                ))}
                {sub.applicableGrades.length > 6 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded-xs text-slate-500">
                    +{sub.applicableGrades.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Define New Subject</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="e.g. Sanskrit"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as SubjectCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Weekly Periods Needed</label>
                  <input
                    type="number"
                    value={formData.weeklyPeriodsRequired}
                    onChange={(e) => setFormData({ ...formData, weeklyPeriodsRequired: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    min={1}
                    max={10}
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Department Head / Senior Teacher</label>
                <select
                  value={formData.departmentHeadId}
                  onChange={(e) => setFormData({ ...formData, departmentHeadId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {facultyOptions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.role} · {f.primarySkill})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reqLab"
                    checked={formData.requiresLab}
                    onChange={(e) => setFormData({ ...formData, requiresLab: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                  <label htmlFor="reqLab" className="font-medium text-slate-800 cursor-pointer">
                    Requires Laboratory Session (Physics/Chem/Bio/Computer/AI)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
