import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { ALL_GRADES, ALL_SECTIONS } from '../data/initialData';
import { Student, StandardGrade, SectionCode } from '../types';
import {
  UserPlus,
  Search,
  Filter,
  CreditCard,
  Bus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Phone,
  Mail,
  MapPin,
  IdCard,
} from 'lucide-react';

export const StudentRegistrationScreen: React.FC = () => {
  const { studentsList, addStudent, busFleet, feeSlabs } = useSchool();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('All');
  const [selectedFeeFilter, setSelectedFeeFilter] = useState<string>('All');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    rollNo: 1,
    fullName: '',
    grade: '9' as StandardGrade,
    section: 'A' as SectionCode,
    dob: '2012-05-15',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    bloodGroup: 'B+',
    parentName: '',
    parentRelation: 'Father',
    parentPhone: '+91 ',
    parentEmail: '',
    residentialAddress: '',
    emergencyContact: '+91 ',
    busServiceOpted: true,
    busRouteId: busFleet[0]?.id || 'BUS-01',
    busStop: busFleet[0]?.stops[0]?.stopName || 'Kalyani Nagar Joggers Park',
    feeRepaymentPlan: 'Quarterly' as 'One-Time Annual' | 'Quarterly' | 'Monthly',
    annualFeeAmount: 76000,
    admissionDate: new Date().toISOString().split('T')[0],
  });

  // Automatically update annual fee when grade changes
  const handleGradeChange = (newGrade: StandardGrade) => {
    const slab = feeSlabs.find((s) => s.grades.includes(newGrade)) || feeSlabs[0];
    setFormData((prev) => ({
      ...prev,
      grade: newGrade,
      annualFeeAmount: slab.totalAnnualFee,
    }));
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent({
      rollNo: Number(formData.rollNo),
      fullName: formData.fullName,
      grade: formData.grade,
      section: formData.section,
      dob: formData.dob,
      gender: formData.gender,
      bloodGroup: formData.bloodGroup,
      parentName: formData.parentName,
      parentRelation: formData.parentRelation,
      parentPhone: formData.parentPhone,
      parentEmail: formData.parentEmail,
      residentialAddress: formData.residentialAddress,
      emergencyContact: formData.emergencyContact,
      busServiceOpted: formData.busServiceOpted,
      busRouteId: formData.busServiceOpted ? formData.busRouteId : undefined,
      busStop: formData.busServiceOpted ? formData.busStop : undefined,
      feeRepaymentPlan: formData.feeRepaymentPlan,
      annualFeeAmount: formData.annualFeeAmount,
      admissionDate: formData.admissionDate,
    });

    setShowRegisterModal(false);
    // Reset form
    setFormData({
      rollNo: studentsList.length + 2,
      fullName: '',
      grade: '9',
      section: 'A',
      dob: '2012-05-15',
      gender: 'Male',
      bloodGroup: 'B+',
      parentName: '',
      parentRelation: 'Father',
      parentPhone: '+91 ',
      parentEmail: '',
      residentialAddress: '',
      emergencyContact: '+91 ',
      busServiceOpted: false,
      busRouteId: busFleet[0]?.id || 'BUS-01',
      busStop: '',
      feeRepaymentPlan: 'Quarterly',
      annualFeeAmount: 76000,
      admissionDate: new Date().toISOString().split('T')[0],
    });
  };

  const filteredStudents = studentsList.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.parentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGrade = selectedGradeFilter === 'All' || s.grade === selectedGradeFilter;
    const matchesFee = selectedFeeFilter === 'All' || s.feeStatus === selectedFeeFilter;

    return matchesSearch && matchesGrade && matchesFee;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-600" />
            Student Admission &amp; Registration Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register new students across 15 grades, manage bus transport allocations, guardian contacts, and fee repayment slabs
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Student Admission</span>
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
            placeholder="Search admission no, student name, parent..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Grade:</span>
            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="text-xs py-1.5 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Grades</option>
              {ALL_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g === 'Nursery' || g === 'KG1' || g === 'KG2' ? g : `Grade ${g}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Fee Status:</span>
            <select
              value={selectedFeeFilter}
              onChange={(e) => setSelectedFeeFilter(e.target.value)}
              className="text-xs py-1.5 px-3 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Fully Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Standard &amp; Section</th>
                <th className="px-4 py-3">Parent / Guardian</th>
                <th className="px-4 py-3">Bus Transport</th>
                <th className="px-4 py-3">Fee Plan &amp; Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((stu) => {
                const bus = stu.busRouteId ? busFleet.find((b) => b.id === stu.busRouteId) : null;
                return (
                  <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{stu.fullName}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                        <span>{stu.admissionNo}</span>
                        <span aria-hidden="true">·</span>
                        <span>Roll #{stu.rollNo}</span>
                        <span aria-hidden="true">·</span>
                        <span>{stu.gender}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-rose-600 font-semibold">{stu.bloodGroup}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {stu.grade === 'Nursery' || stu.grade === 'KG1' || stu.grade === 'KG2'
                          ? stu.grade
                          : `Class ${stu.grade}`}{' '}
                        - Section {stu.section}
                      </div>
                      <div className="text-[10px] text-slate-400">DOB: {stu.dob}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 font-medium">{stu.parentName}</div>
                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                        <Phone className="w-2.5 h-2.5 text-slate-400" />
                        {stu.parentPhone}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {stu.busServiceOpted ? (
                        <div>
                          <div className="flex items-center gap-1 text-emerald-700 font-medium">
                            <Bus className="w-3 h-3 text-emerald-600" />
                            <span>{bus ? bus.busNumber : 'Bus Service'}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[150px]" title={stu.busStop}>
                            Stop: {stu.busStop || 'Designated Stop'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Self Transport</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-700">{stu.feeRepaymentPlan}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded-xs font-semibold text-[10px] ${
                            stu.feeStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : stu.feeStatus === 'Partial'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {stu.feeStatus}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        ₹{stu.totalFeePaid.toLocaleString()} / ₹{stu.annualFeeAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedStudentForIdCard(stu)}
                        className="px-2.5 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <IdCard className="w-3 h-3" />
                        <span>ID Card</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Student Admission Registration</h3>
                <p className="text-xs text-slate-500">Enter student details, bus transport requirements and fee repayment selection</p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              {/* Section 1: Student Demographics */}
              <div className="space-y-3">
                <div className="text-[11px] font-semibold uppercase text-indigo-600 tracking-wider">
                  1. Student Demographic Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">Student Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Advait Sachin Tendulkar"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Grade / Standard</label>
                    <select
                      value={formData.grade}
                      onChange={(e) => handleGradeChange(e.target.value as StandardGrade)}
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
                    <label className="block font-medium text-slate-700 mb-1">Section</label>
                    <select
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value as SectionCode })}
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
                    <label className="block font-medium text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Parent & Emergency Contact */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="text-[11px] font-semibold uppercase text-indigo-600 tracking-wider">
                  2. Parent &amp; Residential Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-slate-700 mb-1">Parent / Guardian Name</label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Relationship</label>
                    <select
                      value={formData.parentRelation}
                      onChange={(e) => setFormData({ ...formData, parentRelation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Primary Phone</label>
                    <input
                      type="text"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Emergency Phone</label>
                    <input
                      type="text"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="parent@domain.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={formData.residentialAddress}
                    onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="House/Flat No, Society, Landmark, Area"
                    required
                  />
                </div>
              </div>

              {/* Section 3: Bus Transport & Fee Repayment Plan */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="text-[11px] font-semibold uppercase text-indigo-600 tracking-wider">
                  3. Transport &amp; Fee Repayment Slabs
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="busOpted"
                      checked={formData.busServiceOpted}
                      onChange={(e) => setFormData({ ...formData, busServiceOpted: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500"
                    />
                    <label htmlFor="busOpted" className="font-medium text-slate-900 cursor-pointer">
                      Avail School Bus Transport Service
                    </label>
                  </div>

                  {formData.busServiceOpted && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Select Bus &amp; Route</label>
                        <select
                          value={formData.busRouteId}
                          onChange={(e) => {
                            const b = busFleet.find((item) => item.id === e.target.value);
                            setFormData({
                              ...formData,
                              busRouteId: e.target.value,
                              busStop: b?.stops[0]?.stopName || '',
                            });
                          }}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                        >
                          {busFleet.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.busNumber} — {b.routeName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-1">Designated Pickup/Drop Stop</label>
                        <select
                          value={formData.busStop}
                          onChange={(e) => setFormData({ ...formData, busStop: e.target.value })}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                        >
                          {busFleet
                            .find((b) => b.id === formData.busRouteId)
                            ?.stops.map((s) => (
                              <option key={s.id} value={s.stopName}>
                                {s.stopName} ({s.morningPickupTime})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Fee Repayment Option
                    </label>
                    <select
                      value={formData.feeRepaymentPlan}
                      onChange={(e) => setFormData({ ...formData, feeRepaymentPlan: e.target.value as any })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs"
                    >
                      <option value="One-Time Annual">One-Time Annual (5% Early Discount)</option>
                      <option value="Quarterly">Quarterly (4 Equal Installments)</option>
                      <option value="Monthly">Monthly (10 Installment Slabs)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Calculated Annual Fee (₹)</label>
                    <input
                      type="number"
                      value={formData.annualFeeAmount}
                      readOnly
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-100 rounded-lg font-mono text-slate-700 font-semibold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-xs"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Identity Card Preview Modal */}
      {selectedStudentForIdCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 relative text-center">
            <button
              onClick={() => setSelectedStudentForIdCard(null)}
              className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-700 no-print cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-950 flex items-center justify-center">
                <img
                  src="/src/assets/images/school_crest_emblem_1794050056518.jpg"
                  alt="Crest"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">VidyaSetu School</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Student Identity Card</div>
              </div>
            </div>

            <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 border-2 border-indigo-600 flex items-center justify-center font-bold text-2xl text-indigo-700">
              {selectedStudentForIdCard.fullName.charAt(0)}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{selectedStudentForIdCard.fullName}</h3>
              <p className="text-xs font-semibold text-indigo-600 font-mono">
                {selectedStudentForIdCard.grade === 'Nursery' || selectedStudentForIdCard.grade === 'KG1' || selectedStudentForIdCard.grade === 'KG2'
                  ? selectedStudentForIdCard.grade
                  : `Class ${selectedStudentForIdCard.grade}`}{' '}
                - Section {selectedStudentForIdCard.section} · Roll #{selectedStudentForIdCard.rollNo}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Admission No:</span>
                <span className="font-semibold text-slate-800">{selectedStudentForIdCard.admissionNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-bold text-rose-600">{selectedStudentForIdCard.bloodGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency Phone:</span>
                <span className="text-slate-800">{selectedStudentForIdCard.emergencyContact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bus Transport:</span>
                <span className="text-emerald-700 font-sans font-medium">
                  {selectedStudentForIdCard.busServiceOpted ? 'Yes (School Bus)' : 'No'}
                </span>
              </div>
            </div>

            <div className="no-print pt-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Student Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
