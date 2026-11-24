import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { GradeFeeSlab, Student, FeeTransaction } from '../types';
import {
  CreditCard,
  Banknote,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  Plus,
  Receipt,
  FileCheck,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const FeesManagementScreen: React.FC = () => {
  const {
    feeSlabs,
    updateFeeSlab,
    studentsList,
    feeTransactions,
    recordFeePayment,
    schoolProfile,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'slabs' | 'ledger' | 'transactions'>('slabs');
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState<Student | null>(null);
  const [receiptToPrint, setReceiptToPrint] = useState<FeeTransaction | null>(null);

  // Payment Form State
  const [paymentData, setPaymentData] = useState({
    amountPaid: 19000,
    paymentMode: 'UPI / QR' as FeeTransaction['paymentMode'],
    installmentName: 'Quarter 2 (July - Sept)',
    transactionRefNo: 'TXN-REF-77889',
    remarks: 'Payment via UPI QR at school cashier',
  });

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForPayment) return;

    const receiptNo = recordFeePayment({
      studentId: selectedStudentForPayment.id,
      studentName: selectedStudentForPayment.fullName,
      admissionNo: selectedStudentForPayment.admissionNo,
      grade: selectedStudentForPayment.grade,
      section: selectedStudentForPayment.section,
      amountPaid: Number(paymentData.amountPaid),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: paymentData.paymentMode,
      paymentPlan: selectedStudentForPayment.feeRepaymentPlan,
      installmentName: paymentData.installmentName,
      transactionRefNo: paymentData.transactionRefNo || `REF-${Date.now()}`,
      collectedBy: 'Mr. Milind Sahasrabuddhe (Accounts Officer)',
      status: 'Successful',
    });

    // Create printable receipt preview
    const newTxn: FeeTransaction = {
      id: `TXN-${Date.now()}`,
      receiptNumber: receiptNo,
      studentId: selectedStudentForPayment.id,
      studentName: selectedStudentForPayment.fullName,
      admissionNo: selectedStudentForPayment.admissionNo,
      grade: selectedStudentForPayment.grade,
      section: selectedStudentForPayment.section,
      amountPaid: Number(paymentData.amountPaid),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: paymentData.paymentMode,
      paymentPlan: selectedStudentForPayment.feeRepaymentPlan,
      installmentName: paymentData.installmentName,
      transactionRefNo: paymentData.transactionRefNo,
      collectedBy: 'Mr. Milind Sahasrabuddhe (Accounts Officer)',
      status: 'Successful',
    };

    setSelectedStudentForPayment(null);
    setReceiptToPrint(newTxn);
  };

  const filteredStudents = studentsList.filter((s) => {
    return (
      s.fullName.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchStudentQuery.toLowerCase())
    );
  });

  const totalFeeCollected = feeTransactions.reduce((acc, curr) => acc + curr.amountPaid, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Fees Management &amp; Repayment Slab Structure
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Grade-wise annual fees partitioned into One-Time (with 5% rebate), Quarterly (4 slabs), and Monthly (10 slabs) repayment schedules
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500">Total Collected:</span>{' '}
            <strong className="font-mono text-emerald-600">₹{totalFeeCollected.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('slabs')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'slabs' ? 'bg-white text-indigo-600 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Grade-wise Slabs &amp; Repayment Schedules
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'ledger' ? 'bg-white text-indigo-600 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Student Fee Ledger &amp; Collection
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'transactions' ? 'bg-white text-indigo-600 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Payment Transactions ({feeTransactions.length})
        </button>
      </div>

      {/* TAB 1: Slabs Definition & Breakdown */}
      {activeTab === 'slabs' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feeSlabs.map((slab, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
                      Standard Category {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{slab.gradeCategory}</h3>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Applicable Standards: <strong>{slab.grades.join(', ')}</strong>
                    </div>
                  </div>

                  {/* Component Breakdown */}
                  <div className="py-3 space-y-1.5 text-xs border-b border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>Annual Tuition Fee:</span>
                      <span className="font-mono text-slate-800">₹{slab.annualTuition.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Development &amp; Library Fee:</span>
                      <span className="font-mono text-slate-800">₹{slab.developmentFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Lab &amp; AI / Computer Charges:</span>
                      <span className="font-mono text-slate-800">₹{slab.laboratoryAndAIFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Sports &amp; Swimming Pool:</span>
                      <span className="font-mono text-slate-800">₹{slab.sportsAndSwimmingFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Examination &amp; Assessment:</span>
                      <span className="font-mono text-slate-800">₹{slab.examinationFee.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Total Annual */}
                  <div className="pt-2 flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-900">Total Defined Annual Fee:</span>
                    <span className="font-mono font-bold text-base text-indigo-700">
                      ₹{slab.totalAnnualFee.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Repayment Slabs Grid */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Repayment Slabs Options:
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    {/* Option 1: One-time */}
                    <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="text-[10px] text-emerald-800 font-semibold">1-Time Annual</div>
                      <div className="font-mono font-bold text-emerald-700 text-xs mt-0.5">
                        ₹{slab.oneTimePayable.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-emerald-600 font-medium">5% Rebate</div>
                    </div>

                    {/* Option 2: Quarterly */}
                    <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                      <div className="text-[10px] text-indigo-800 font-semibold">Quarterly (x4)</div>
                      <div className="font-mono font-bold text-indigo-700 text-xs mt-0.5">
                        ₹{slab.quarterlySlabAmount.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-indigo-600">Per Quarter</div>
                    </div>

                    {/* Option 3: Monthly */}
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="text-[10px] text-amber-800 font-semibold">Monthly (x10)</div>
                      <div className="font-mono font-bold text-amber-700 text-xs mt-0.5">
                        ₹{slab.monthlySlabAmount.toLocaleString()}
                      </div>
                      <div className="text-[9px] text-amber-600">Per Month</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Student Fee Ledger & Payment Action */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchStudentQuery}
              onChange={(e) => setSearchStudentQuery(e.target.value)}
              placeholder="Search student ledger..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Standard</th>
                  <th className="px-4 py-3">Selected Plan</th>
                  <th className="px-4 py-3">Total Annual Fee</th>
                  <th className="px-4 py-3">Amount Paid</th>
                  <th className="px-4 py-3">Balance Due</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Collect Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((stu) => {
                  const balanceDue = Math.max(0, stu.annualFeeAmount - stu.totalFeePaid);
                  return (
                    <tr key={stu.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{stu.fullName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{stu.admissionNo}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        Class {stu.grade}-{stu.section}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{stu.feeRepaymentPlan}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                        ₹{stu.annualFeeAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-700 font-medium">
                        ₹{stu.totalFeePaid.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-rose-700 font-medium">
                        ₹{balanceDue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-sm font-semibold text-[10px] ${
                            stu.feeStatus === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : stu.feeStatus === 'Partial'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {stu.feeStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {stu.feeStatus !== 'Paid' ? (
                          <button
                            onClick={() => {
                              setSelectedStudentForPayment(stu);
                              // Auto-calculate suggested installment amount
                              const slab = feeSlabs.find((s) => s.grades.includes(stu.grade));
                              const suggested =
                                stu.feeRepaymentPlan === 'Quarterly'
                                  ? slab?.quarterlySlabAmount || 19000
                                  : stu.feeRepaymentPlan === 'Monthly'
                                  ? slab?.monthlySlabAmount || 7600
                                  : balanceDue;
                              setPaymentData((prev) => ({
                                ...prev,
                                amountPaid: Math.min(balanceDue, suggested),
                              }));
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                          >
                            Collect Slab
                          </button>
                        ) : (
                          <span className="text-emerald-600 text-[11px] font-medium flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Transactions History */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Official Fee Receipts &amp; Transaction Log
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total Recorded: ₹{totalFeeCollected.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Receipt No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Standard</th>
                  <th className="px-4 py-3">Installment / Slab</th>
                  <th className="px-4 py-3">Payment Mode</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right">Print Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feeTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-700">{txn.receiptNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{txn.studentName}</div>
                      <div className="font-mono text-[10px] text-slate-400">{txn.admissionNo}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      Class {txn.grade}-{txn.section}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{txn.installmentName}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-slate-700">{txn.paymentMode}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{txn.paymentDate}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      ₹{txn.amountPaid.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setReceiptToPrint(txn)}
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3 text-slate-500" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Collect Fee Payment Modal */}
      {selectedStudentForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Record Fee Installment</h3>
                <p className="text-xs text-slate-500">
                  {selectedStudentForPayment.fullName} ({selectedStudentForPayment.admissionNo})
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForPayment(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Plan:</span>
                  <span className="font-semibold text-slate-800">{selectedStudentForPayment.feeRepaymentPlan}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Annual:</span>
                  <span className="font-semibold text-slate-800">₹{selectedStudentForPayment.annualFeeAmount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Balance Due:</span>
                  <span className="font-semibold text-rose-700">
                    ₹{(selectedStudentForPayment.annualFeeAmount - selectedStudentForPayment.totalFeePaid).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Installment Slab Label</label>
                <input
                  type="text"
                  value={paymentData.installmentName}
                  onChange={(e) => setPaymentData({ ...paymentData, installmentName: e.target.value })}
                  placeholder="e.g. Quarter 2 (July - September)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Amount to Collect (₹)</label>
                  <input
                    type="number"
                    value={paymentData.amountPaid}
                    onChange={(e) => setPaymentData({ ...paymentData, amountPaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    min={500}
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Mode</label>
                  <select
                    value={paymentData.paymentMode}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMode: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="UPI / QR">UPI / QR</option>
                    <option value="Credit / Debit Card">Credit / Debit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Demand Draft / Cheque">Demand Draft / Cheque</option>
                    <option value="Cash Deposit">Cash Deposit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Transaction Ref / Cheque No.</label>
                <input
                  type="text"
                  value={paymentData.transactionRefNo}
                  onChange={(e) => setPaymentData({ ...paymentData, transactionRefNo: e.target.value })}
                  placeholder="Bank UTR or Cheque Number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForPayment(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Generate Receipt &amp; Collect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Fee Receipt Modal (Printable) */}
      {receiptToPrint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative border-2 border-indigo-600">
            <button
              onClick={() => setReceiptToPrint(null)}
              className="absolute top-4 right-4 text-xs font-semibold text-slate-400 hover:text-slate-700 no-print cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-1 border-b border-slate-200 pb-3">
              <h2 className="text-base font-bold text-slate-900">{schoolProfile.name}</h2>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Official Fee Payment Receipt · {schoolProfile.board} Affiliated
              </div>
              <div className="font-mono text-xs text-indigo-700 font-bold">
                Receipt #{receiptToPrint.receiptNumber}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono py-1">
              <div>
                <span className="text-slate-500 block text-[10px]">Student Name:</span>
                <span className="font-bold text-slate-900">{receiptToPrint.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Admission No:</span>
                <span className="font-semibold text-slate-800">{receiptToPrint.admissionNo}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Grade &amp; Section:</span>
                <span className="font-semibold text-slate-800">
                  Class {receiptToPrint.grade}-{receiptToPrint.section}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Date of Payment:</span>
                <span className="font-semibold text-slate-800">{receiptToPrint.paymentDate}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Installment Particulars:</span>
                <span className="font-semibold text-slate-900">{receiptToPrint.installmentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Mode:</span>
                <span className="font-mono text-slate-800">{receiptToPrint.paymentMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Transaction Reference:</span>
                <span className="font-mono text-slate-800">{receiptToPrint.transactionRefNo}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-900">Amount Paid:</span>
                <span className="font-mono font-bold text-lg text-emerald-700">
                  ₹{receiptToPrint.amountPaid.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end pt-4 border-t border-slate-100 text-[10px]">
              <div>
                <div className="text-slate-400">Cashier / Collected By:</div>
                <div className="font-semibold text-slate-700">{receiptToPrint.collectedBy}</div>
              </div>
              <div className="text-right">
                <div className="h-6 border-b border-slate-400 w-28 mb-1"></div>
                <div className="font-medium text-slate-600">Accounts Department</div>
              </div>
            </div>

            <div className="no-print pt-2 flex justify-end">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
