import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { SchoolProfile, SchoolBoard, GrantType } from '../types';
import {
  Building2,
  FileCheck2,
  Award,
  ShieldAlert,
  Clock,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Edit3,
  Printer,
  Sparkles,
  Save,
  Undo2,
} from 'lucide-react';

export const SchoolProfileScreen: React.FC = () => {
  const { schoolProfile, updateSchoolProfile } = useSchool();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<SchoolProfile>(schoolProfile);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const boards: SchoolBoard[] = ['CBSE', 'STATE', 'ICSE', 'International (IB/Cambridge)'];
  const grantTypes: GrantType[] = [
    'Government Grant-in-aid',
    'Unaided Private',
    'Minority Trust',
    'CSR Foundation Funded',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(formData);
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCancel = () => {
    setFormData(schoolProfile);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-white shadow-xs">
        <div className="relative h-44 w-full overflow-hidden">
          <img
            src="/src/assets/images/school_campus_exterior_1794050056330.jpg"
            alt="School Campus Exterior"
            className="w-full h-full object-cover opacity-45"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        <div className="p-6 -mt-16 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-white p-1 shadow-md border-2 border-indigo-400 overflow-hidden shrink-0">
              <img
                src="/src/assets/images/school_crest_emblem_1794050056518.jpg"
                alt="School Emblem"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
                <span>{schoolProfile.board} Affiliated Institution</span>
                <span aria-hidden="true">·</span>
                <span>Est. {schoolProfile.establishmentYear}</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-400">Govt. Recognized</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
                {schoolProfile.name}
              </h1>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                {schoolProfile.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCertificateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Affiliation Certificate</span>
            </button>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile &amp; Grants</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>School Profile and Affiliation details updated successfully and persisted to state.</span>
        </div>
      )}

      {/* Main Form or View Grid */}
      {isEditing ? (
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Edit School Profile &amp; Board Affiliation</h2>
              <p className="text-xs text-slate-500">Update school identity, regulatory licenses, grants and infrastructure parameters</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">School Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Tagline / Motto</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Education Board</label>
              <select
                value={formData.board}
                onChange={(e) => setFormData({ ...formData, board: e.target.value as SchoolBoard })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                {boards.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Affiliation Number</label>
              <input
                type="text"
                value={formData.affiliationNumber}
                onChange={(e) => setFormData({ ...formData, affiliationNumber: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Affiliation Valid Until</label>
              <input
                type="date"
                value={formData.affiliationValidUntil}
                onChange={(e) => setFormData({ ...formData, affiliationValidUntil: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Grant Type</label>
              <select
                value={formData.grantType}
                onChange={(e) => setFormData({ ...formData, grantType: e.target.value as GrantType })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                {grantTypes.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">School Code (Board)</label>
              <input
                type="text"
                value={formData.schoolCode}
                onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">U-DISE+ Code</label>
              <input
                type="text"
                value={formData.udiseCode}
                onChange={(e) => setFormData({ ...formData, udiseCode: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Govt. Registration No.</label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Grant Sanction Order</label>
              <input
                type="text"
                value={formData.grantSanctionOrder}
                onChange={(e) => setFormData({ ...formData, grantSanctionOrder: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Principal Name</label>
              <input
                type="text"
                value={formData.principalName}
                onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Vice Principal Name</label>
              <input
                type="text"
                value={formData.vicePrincipalName}
                onChange={(e) => setFormData({ ...formData, vicePrincipalName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Timetable In-charge Name</label>
              <input
                type="text"
                value={formData.timetableInchargeName}
                onChange={(e) => setFormData({ ...formData, timetableInchargeName: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fire Safety Clearance Valid Until</label>
              <input
                type="date"
                value={formData.fireSafetyValidUntil}
                onChange={(e) => setFormData({ ...formData, fireSafetyValidUntil: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Building Safety Certificate Until</label>
              <input
                type="date"
                value={formData.buildingSafetyValidUntil}
                onChange={(e) => setFormData({ ...formData, buildingSafetyValidUntil: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">School Timings</label>
              <input
                type="text"
                value={formData.schoolTimings}
                onChange={(e) => setFormData({ ...formData, schoolTimings: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Campus Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone / Helpline</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Board & Accreditation Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                Affiliation &amp; Board
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-700">
                {schoolProfile.board}
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Affiliation Number:</span>
                <span className="font-mono font-medium text-slate-800">{schoolProfile.affiliationNumber}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Affiliation Validity:</span>
                <span className="font-mono text-slate-800">{schoolProfile.affiliationValidUntil}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Board School Code:</span>
                <span className="font-mono text-slate-800">{schoolProfile.schoolCode}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Grant Status:</span>
                <span className="font-medium text-emerald-700">{schoolProfile.grantType}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Sanction Order:</span>
                <span className="font-mono text-[11px] text-slate-700">{schoolProfile.grantSanctionOrder}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Registration No:</span>
                <span className="font-mono text-slate-800">{schoolProfile.registrationNumber}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Government & Safety Licenses */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                Statutory Licenses &amp; Safety
              </h3>
              <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Compliant
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">U-DISE+ National Code:</span>
                <span className="font-mono font-semibold text-slate-900">{schoolProfile.udiseCode}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Fire Safety NOC:</span>
                <span className="font-mono text-emerald-800">Valid until {schoolProfile.fireSafetyValidUntil}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Building Structural Safety:</span>
                <span className="font-mono text-slate-800">Valid until {schoolProfile.buildingSafetyValidUntil}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Sanitation Certificate:</span>
                <span className="font-mono text-[11px] text-slate-700">{schoolProfile.sanitationCertificate}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Campus Area:</span>
                <span className="font-medium text-slate-800">{schoolProfile.totalCampusAreaAcres} Acres</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Operational Classrooms:</span>
                <span className="font-medium text-slate-800">{schoolProfile.totalClassrooms} Rooms</span>
              </div>
            </div>
          </div>

          {/* Card 3: Key Personnel & Timings */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Administration &amp; Operations
              </h3>
            </div>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="pt-2">
                <span className="text-slate-500 block">Principal:</span>
                <span className="font-semibold text-slate-900">{schoolProfile.principalName}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block">Vice Principal:</span>
                <span className="font-medium text-slate-800">{schoolProfile.vicePrincipalName}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block">Timetable In-charge:</span>
                <span className="font-medium text-indigo-700">{schoolProfile.timetableInchargeName}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block">Daily School Timings:</span>
                <span className="font-medium text-slate-800">{schoolProfile.schoolTimings}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block">Address:</span>
                <span className="text-slate-700">{schoolProfile.address}, {schoolProfile.city}, {schoolProfile.state} - {schoolProfile.pinCode}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 space-y-6 border-4 border-amber-600/30 shadow-2xl relative">
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-700 no-print cursor-pointer"
            >
              ✕ Close
            </button>

            <div className="text-center space-y-2 border-b-2 border-amber-500/40 pb-6">
              <div className="w-16 h-16 mx-auto rounded-full overflow-hidden shadow-sm">
                <img
                  src="/src/assets/images/school_crest_emblem_1794050056518.jpg"
                  alt="Emblem"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs uppercase tracking-widest text-amber-700 font-bold">
                Certificate of Board Affiliation &amp; Recognition
              </div>
              <h2 className="text-xl font-bold text-slate-900">{schoolProfile.name}</h2>
              <p className="text-xs text-slate-600 italic">
                Affiliated to Central Board of Secondary Education ({schoolProfile.board}), New Delhi
              </p>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <p>
                This is to officially certify that <strong className="text-slate-900">{schoolProfile.name}</strong>, situated at {schoolProfile.address}, {schoolProfile.city}, {schoolProfile.state} is granted affiliation under registration code <strong className="font-mono text-slate-900">{schoolProfile.affiliationNumber}</strong> with U-DISE+ code <strong className="font-mono text-slate-900">{schoolProfile.udiseCode}</strong>.
              </p>
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg font-mono text-[11px] border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Grant Category:</span>
                  <span className="font-semibold text-slate-800">{schoolProfile.grantType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sanction Order:</span>
                  <span className="font-semibold text-slate-800">{schoolProfile.grantSanctionOrder}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Validity Tenure:</span>
                  <span className="font-semibold text-slate-800">Valid up to {schoolProfile.affiliationValidUntil}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Principal in Charge:</span>
                  <span className="font-semibold text-slate-800">{schoolProfile.principalName}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-between items-end border-t border-slate-200 text-xs">
              <div>
                <div className="font-mono text-[10px] text-slate-400">Date of Attestation: {new Date().toLocaleDateString()}</div>
                <div className="font-mono text-[10px] text-slate-400">Govt. Registration: {schoolProfile.registrationNumber}</div>
              </div>
              <div className="text-right">
                <div className="h-8 border-b border-slate-400 w-36 mb-1"></div>
                <div className="font-semibold text-slate-800">{schoolProfile.principalName}</div>
                <div className="text-slate-500 text-[10px]">Head of Institution</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Print Official Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
