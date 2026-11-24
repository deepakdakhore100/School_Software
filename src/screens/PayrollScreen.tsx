import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { initialPayrollScales } from '../data/initialData';
import { PayrollScaleConfig, PayrollRecord, StaffMember } from '../types';
import {
  Banknote,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Printer,
  Calendar,
  FileSpreadsheet,
  PieChart,
  ArrowUpRight,
} from 'lucide-react';

export const PayrollScreen: React.FC = () => {
  const { staffList, schoolProfile } = useSchool();
  const [selectedMonth, setSelectedMonth] = useState('October 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [selectedStaffForSlip, setSelectedStaffForSlip] = useState<StaffMember | null>(null);

  // Compute calculated payroll for a staff member based on rules
  const calculateSalarySlip = (staff: StaffMember) => {
    const scale =
      initialPayrollScales.find((s) => s.role === staff.role) || initialPayrollScales[2];

    const basic = staff.basicSalary || scale.averageBasic;
    const hra = Math.round((basic * scale.hraPercent) / 100);
    const da = Math.round((basic * scale.daPercent) / 100);
    const allowance = scale.specialAllowance;
    const gross = basic + hra + da + allowance;

    const pf = staff.pfApplicable ? Math.round((basic * scale.pfDeductionPercent) / 100) : 0;
    const tax = scale.professionalTax;
    const totalDeductions = pf + tax;
    const net = gross - totalDeductions;

    return {
      basic,
      hra,
      da,
      allowance,
      gross,
      pf,
      tax,
      totalDeductions,
      net,
    };
  };

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRoleFilter === 'All' || s.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Calculate institutional monthly estimated payout across all quotas:
  // Teachers (100), Staff (120), Lab Assistants (30), Bus Drivers (30), Security (10)
  const totalInstitutionalMonthlyBudget = initialPayrollScales.reduce((acc, curr) => {
    const basic = curr.averageBasic;
    const hra = (basic * curr.hraPercent) / 100;
    const da = (basic * curr.daPercent) / 100;
    const gross = basic + hra + da + curr.specialAllowance;
    const pf = (basic * curr.pfDeductionPercent) / 100;
    const net = gross - (pf + curr.professionalTax);
    return acc + net * curr.approxStaffCount;
  }, 0);

  const totalPersonnelCount = initialPayrollScales.reduce(
    (acc, curr) => acc + curr.approxStaffCount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-indigo-600" />
            School Staff Payroll &amp; Compensation System
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Scales configured for Principal, Vice Principal, 100 Teachers, 120 Administrative Staff, 30 Lab Assistants, 30 Bus Drivers, and 10 Security Guards
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500">Pay Period:</span>{' '}
            <strong className="font-semibold text-slate-900">{selectedMonth}</strong>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500">Total Sanctioned Posts:</span>{' '}
            <strong className="font-mono text-indigo-600">{totalPersonnelCount} Personnel</strong>
          </div>
        </div>
      </div>

      {/* Role Quotas & Scaled Salary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Teachers Pool (100) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">
              Faculty Quota
            </span>
            <span className="font-mono font-bold text-slate-900 bg-indigo-50 px-2 py-0.5 rounded-sm">
              100 Teachers
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">Senior, Junior &amp; Special</h3>
          <p className="text-[11px] text-slate-500">
            Principal (1), Vice Principal (1), Senior (45), Junior (43), Special Coaches (10)
          </p>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Avg. Net Pay:</span>
            <span className="font-mono font-semibold text-indigo-700">₹62,500 / mo</span>
          </div>
        </div>

        {/* Card 2: Administrative Staff (120) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
              Administration Quota
            </span>
            <span className="font-mono font-bold text-slate-900 bg-emerald-50 px-2 py-0.5 rounded-sm">
              120 Staff
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">Clerical, Accounts &amp; Admin</h3>
          <p className="text-[11px] text-slate-500">
            Admissions, Finance, Library, Maintenance &amp; Office Clerks
          </p>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Avg. Net Pay:</span>
            <span className="font-mono font-semibold text-emerald-700">₹44,800 / mo</span>
          </div>
        </div>

        {/* Card 3: Lab Assistants (30) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
              Technical Quota
            </span>
            <span className="font-mono font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded-sm">
              30 Lab Assistants
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">Physics, Chem, Bio &amp; AI</h3>
          <p className="text-[11px] text-slate-500">
            Apparatus calibration, reagent storage, workstation maintenance
          </p>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Avg. Net Pay:</span>
            <span className="font-mono font-semibold text-amber-700">₹36,100 / mo</span>
          </div>
        </div>

        {/* Card 4: Bus Drivers & Security (40) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">
              Transport &amp; Guard Quota
            </span>
            <span className="font-mono font-bold text-slate-900 bg-rose-50 px-2 py-0.5 rounded-sm">
              30 Drivers · 10 Guards
            </span>
          </div>
          <h3 className="text-sm font-bold text-slate-900">Fleet Operations &amp; Safety</h3>
          <p className="text-[11px] text-slate-500">
            Commercial HCV drivers, assistants, perimeter and main gate guards
          </p>
          <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
            <span className="text-slate-500">Avg. Net Pay:</span>
            <span className="font-mono font-semibold text-rose-700">₹31,400 / mo</span>
          </div>
        </div>
      </div>

      {/* Institutional Budget Strip */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-semibold text-amber-300 tracking-wider">
            Consolidated Monthly Institutional Payroll
          </div>
          <div className="text-2xl font-bold font-mono mt-0.5 text-white">
            ₹{Math.round(totalInstitutionalMonthlyBudget).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">
            Including Basic, HRA (24%), DA (18%), Special Allowance, minus PF (12%) &amp; PT (₹200) across 292 posts
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Master Payroll Sheet</span>
          </button>
        </div>
      </div>

      {/* Staff Payroll Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search staff employee code, name..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Filter Role:</span>
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
            >
              <option value="All">All Personnel ({staffList.length})</option>
              {initialPayrollScales.map((scale) => (
                <option key={scale.role} value={scale.role}>
                  {scale.role} ({scale.approxStaffCount})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Basic Pay</th>
                <th className="px-4 py-3">HRA + DA</th>
                <th className="px-4 py-3">Gross Salary</th>
                <th className="px-4 py-3">PF &amp; Tax Deductions</th>
                <th className="px-4 py-3">Net Take-Home</th>
                <th className="px-4 py-3 text-right">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((staff) => {
                const salary = calculateSalarySlip(staff);
                return (
                  <tr key={staff.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{staff.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{staff.employeeCode}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{staff.role}</td>
                    <td className="px-4 py-3 font-mono text-slate-800">₹{salary.basic.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      ₹{(salary.hra + salary.da).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-800">₹{salary.gross.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-rose-700">
                      -₹{salary.totalDeductions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      ₹{salary.net.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedStaffForSlip(staff)}
                        className="px-2.5 py-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Payslip</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Slip Modal */}
      {selectedStaffForSlip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border-2 border-indigo-600">
            <button
              onClick={() => setSelectedStaffForSlip(null)}
              className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-700 no-print cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-1 border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">{schoolProfile.name}</h2>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Monthly Staff Salary Slip · Pay Period: {selectedMonth}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono py-1">
              <div>
                <span className="text-slate-500 block text-[10px]">Employee Name:</span>
                <span className="font-bold text-slate-900">{selectedStaffForSlip.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Employee Code:</span>
                <span className="font-semibold text-slate-800">{selectedStaffForSlip.employeeCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Designation / Role:</span>
                <span className="font-semibold text-slate-800">{selectedStaffForSlip.role}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Primary Skill:</span>
                <span className="font-semibold text-indigo-700">{selectedStaffForSlip.primarySkill}</span>
              </div>
            </div>

            {/* Earnings and Deductions Table */}
            {(() => {
              const salary = calculateSalarySlip(selectedStaffForSlip);
              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Earnings */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="text-[10px] font-semibold uppercase text-emerald-800 tracking-wider border-b border-slate-200 pb-1">
                        Earnings (A)
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Basic Pay:</span>
                        <span className="font-medium text-slate-800">₹{salary.basic.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">HRA (24%):</span>
                        <span className="font-medium text-slate-800">₹{salary.hra.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">DA (18%):</span>
                        <span className="font-medium text-slate-800">₹{salary.da.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Special Allowance:</span>
                        <span className="font-medium text-slate-800">₹{salary.allowance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-mono font-bold text-slate-900 pt-1 border-t border-slate-200">
                        <span>Gross Salary:</span>
                        <span>₹{salary.gross.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                      <div className="text-[10px] font-semibold uppercase text-rose-800 tracking-wider border-b border-slate-200 pb-1">
                        Deductions (B)
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Provident Fund (12%):</span>
                        <span className="font-medium text-slate-800">₹{salary.pf.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-slate-500">Professional Tax:</span>
                        <span className="font-medium text-slate-800">₹{salary.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-mono font-bold text-rose-700 pt-4 border-t border-slate-200">
                        <span>Total Deductions:</span>
                        <span>₹{salary.totalDeductions.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay Card */}
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex justify-between items-center text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-indigo-900 tracking-wider">
                        Net Take-Home Salary (A - B)
                      </div>
                      <div className="text-[11px] text-indigo-700">Bank Transfer / Direct Credit</div>
                    </div>
                    <div className="text-xl font-bold font-mono text-indigo-800">
                      ₹{salary.net.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex justify-between items-end pt-4 border-t border-slate-100 text-[10px]">
              <div>
                <div className="text-slate-400">Authorized Signatory:</div>
                <div className="font-semibold text-slate-700">{schoolProfile.principalName}</div>
              </div>
              <div className="text-right">
                <div className="h-6 border-b border-slate-400 w-28 mb-1"></div>
                <div className="font-medium text-slate-600">Finance &amp; Accounts</div>
              </div>
            </div>

            <div className="no-print pt-2 flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Payslip</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
