import React, { useMemo, useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { matchStaffSkillForRequirement } from '../utils/skillMatrix';
import {
  FlaskConical,
  Cpu,
  Monitor,
  Dna,
  Atom,
  CheckCircle2,
  Calendar,
  Users,
  Plus,
  Wrench,
  Edit3,
} from 'lucide-react';

export const LabsScreen: React.FC = () => {
  const { labsList, updateLabFacility, staffList } = useSchool();
  const [selectedLabId, setSelectedLabId] = useState<string>(labsList[0].id);
  const [newEquipName, setNewEquipName] = useState('');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [draftInchargeId, setDraftInchargeId] = useState('');
  const [draftAssistantId, setDraftAssistantId] = useState('');

  const selectedLab = labsList.find((l) => l.id === selectedLabId) || labsList[0];

  const currentIncharge = staffList.find((s) => s.id === selectedLab.inchargeStaffId);
  const currentAssistant = staffList.find((s) => s.id === selectedLab.labAssistantId);

  const rankedInchargeCandidates = useMemo(() => {
    return staffList
      .filter(
        (s) =>
          s.role.includes('Teacher') ||
          s.role === 'Timetable In-charge' ||
          s.role === 'Vice Principal'
      )
      .map((staff) => ({
        staff,
        match: matchStaffSkillForRequirement(staff, selectedLab.name),
      }))
      .sort((a, b) => b.match.score - a.match.score);
  }, [staffList, selectedLab.name]);

  const rankedAssistantCandidates = useMemo(() => {
    return staffList
      .filter((s) => s.role === 'Lab Assistant' || (s.labExpertise || []).includes(selectedLab.name))
      .map((staff) => ({
        staff,
        match: matchStaffSkillForRequirement(staff, selectedLab.name),
      }))
      .sort((a, b) => b.match.score - a.match.score);
  }, [staffList, selectedLab.name]);

  const openReassignModal = () => {
    setDraftInchargeId(selectedLab.inchargeStaffId);
    setDraftAssistantId(selectedLab.labAssistantId);
    setShowReassignModal(true);
  };

  const handleSavePersonnel = (e: React.FormEvent) => {
    e.preventDefault();
    const incharge = staffList.find((s) => s.id === draftInchargeId);
    const assistant = staffList.find((s) => s.id === draftAssistantId);
    updateLabFacility(selectedLab.id, {
      inchargeStaffId: incharge ? incharge.id : selectedLab.inchargeStaffId,
      inchargeStaffName: incharge ? incharge.name : selectedLab.inchargeStaffName,
      labAssistantId: assistant ? assistant.id : selectedLab.labAssistantId,
      labAssistantName: assistant ? assistant.name : selectedLab.labAssistantName,
    });
    setShowReassignModal(false);
  };

  const getLabIcon = (name: string) => {
    switch (name) {
      case 'Physics Lab':
        return Atom;
      case 'Chemistry Lab':
        return FlaskConical;
      case 'Biology Lab':
        return Dna;
      case 'Computer Lab':
        return Monitor;
      case 'AI & Robotics Lab':
        return Cpu;
      default:
        return FlaskConical;
    }
  };

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquipName.trim()) return;
    const updatedEquip = [...selectedLab.keyEquipment, newEquipName.trim()];
    updateLabFacility(selectedLab.id, {
      keyEquipment: updatedEquip,
      equipmentCount: selectedLab.equipmentCount + 1,
    });
    setNewEquipName('');
  };

  const handleRemoveEquipment = (index: number) => {
    const updated = selectedLab.keyEquipment.filter((_, i) => i !== index);
    updateLabFacility(selectedLab.id, {
      keyEquipment: updated,
      equipmentCount: Math.max(0, selectedLab.equipmentCount - 1),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
            Specialized Laboratories &amp; Practical Classes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Physics, Chemistry, Biology, Computer, and AI &amp; Robotics labs with Skill-Matrix-matched Faculty In-charges &amp; Lab Assistants
          </p>
        </div>
      </div>

      {/* Lab Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {labsList.map((lab) => {
          const Icon = getLabIcon(lab.name);
          const isSelected = selectedLab.id === lab.id;
          return (
            <button
              key={lab.id}
              type="button"
              onClick={() => setSelectedLabId(lab.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{lab.roomNo.split(' ')[0]}</span>
              </div>
              <div className="mt-2">
                <div className="text-xs font-semibold text-slate-900 truncate">{lab.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{lab.maxCapacity} Workstations</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Lab Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personnel & Compliance */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Lab Personnel</span>
              </h3>
              <button
                type="button"
                onClick={openReassignModal}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>Reassign (Skill Matrix)</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-[11px] text-slate-500 uppercase font-semibold">Faculty In-charge</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedLab.inchargeStaffName}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {currentIncharge
                    ? `${currentIncharge.primarySkill} · ${currentIncharge.secondarySkill}`
                    : 'HOD & Curriculum Mentor'}
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100">
                <div className="text-[11px] text-indigo-700 uppercase font-semibold">Assigned Lab Assistant</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedLab.labAssistantName}</div>
                <div className="text-slate-600 text-[11px] mt-0.5">
                  {currentAssistant
                    ? `${currentAssistant.primarySkill}${(currentAssistant.labExpertise || []).length > 0 ? ` · Certified: ${(currentAssistant.labExpertise || []).join(', ')}` : ''}`
                    : 'Technical Prep, Safety & Inventory Manager'}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800">{selectedLab.roomNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max Batch Capacity:</span>
                <span className="font-semibold text-slate-800">{selectedLab.maxCapacity} Students</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Safety Clearance:</span>
                <span className="font-mono text-emerald-700 font-medium">{selectedLab.safetyCertificationDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Status:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedLab.status}
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Grades Covered */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              Eligible Grades for Weekly Practicals
            </h3>
            <p className="text-xs text-slate-500">
              Each section of these standards receives a reserved weekly lab slot in the digital timetable.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedLab.weeklyScheduleEligibleGrades.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-100 text-slate-800 border border-slate-200"
                >
                  Grade {g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Equipment Catalog & Weekly Timetable Schedule Slots */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Equipment & Apparatus */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-indigo-600" />
                  Key Equipment &amp; Apparatus Inventory ({selectedLab.keyEquipment.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Certified laboratory instruments and student testing kits
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedLab.keyEquipment.map((equip, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs"
                >
                  <span className="font-medium text-slate-800">{equip}</span>
                  <button
                    onClick={() => handleRemoveEquipment(idx)}
                    className="text-slate-400 hover:text-rose-600 text-[11px] cursor-pointer ml-2"
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Add Equipment form */}
            <form onSubmit={handleAddEquipment} className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={newEquipName}
                onChange={(e) => setNewEquipName(e.target.value)}
                placeholder="Add instrument / hardware kit to inventory..."
                className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </form>
          </div>

          {/* Weekly Lab Schedule Grid for this Lab */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Weekly Slot Allocation Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Automatic slot occupancy for {selectedLab.name} across academic days
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="px-3 py-2">Day</th>
                    <th className="px-3 py-2">Period &amp; Time</th>
                    <th className="px-3 py-2">Assigned Grade / Section</th>
                    <th className="px-3 py-2">Supervising Faculty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-900">Monday</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">Period 3 (09:45 - 10:30 AM)</td>
                    <td className="px-3 py-2.5">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                        Grade 9-A &amp; 9-B
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{selectedLab.inchargeStaffName}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-900">Tuesday</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">Period 4 (10:45 - 11:30 AM)</td>
                    <td className="px-3 py-2.5">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                        Grade 10-A &amp; 10-B
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{selectedLab.inchargeStaffName}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-900">Wednesday</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">Period 2 (09:00 - 09:45 AM)</td>
                    <td className="px-3 py-2.5">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                        Grade 11-A (Sci)
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{selectedLab.inchargeStaffName}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-900">Thursday</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">Period 5 (11:30 AM - 12:15 PM)</td>
                    <td className="px-3 py-2.5">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                        Grade 8-A &amp; 8-B
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{selectedLab.inchargeStaffName}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-3 py-2.5 font-medium text-slate-900">Friday</td>
                    <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">Period 6 (12:55 - 01:35 PM)</td>
                    <td className="px-3 py-2.5">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                        Grade 12-A (Sci)
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{selectedLab.inchargeStaffName}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Reassign Lab Personnel Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Assign Lab Personnel via Skill Matrix · {selectedLab.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Candidates ranked by certified lab expertise, primary skill, and secondary skill
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReassignModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePersonnel} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Faculty In-charge (Ranked by {selectedLab.name} Match)
                </label>
                <select
                  value={draftInchargeId}
                  onChange={(e) => setDraftInchargeId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {rankedInchargeCandidates.map(({ staff, match }) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} · {match.score >= 50 ? `${match.tier}: ${match.matchedSkill}` : staff.primarySkill}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Lab Assistant (Ranked by {selectedLab.name} Match)
                </label>
                <select
                  value={draftAssistantId}
                  onChange={(e) => setDraftAssistantId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {rankedAssistantCandidates.map(({ staff, match }) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} · {match.score >= 50 ? `${match.tier}: ${match.matchedSkill}` : staff.primarySkill}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowReassignModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold cursor-pointer"
                >
                  Save Lab Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
