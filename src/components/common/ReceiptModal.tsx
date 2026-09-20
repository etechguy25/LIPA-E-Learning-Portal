import React from 'react';
import { useLms } from '../../context/LmsContext';
import { X, Printer, CheckCircle2, ShieldCheck } from 'lucide-react';
import { LipaLogo } from './LipaLogo';

export const ReceiptModal: React.FC = () => {
  const { activeReceipt, closeReceiptModal, currentUser, tuitionStatement, usersDirectory } = useLms();

  if (!activeReceipt) return null;

  const targetStudent = usersDirectory.find(
    u => (activeReceipt.studentId && (u.id === activeReceipt.studentId || u.studentId === activeReceipt.studentId)) ||
         u.name.toLowerCase() === activeReceipt.payerName.toLowerCase()
  );

  const studentIdDisplay = targetStudent?.studentId || activeReceipt.studentId || currentUser.studentId || 'STU-OFFICIAL';
  const studentDeptDisplay = targetStudent?.department || currentUser.department || 'Liberia Institute of Public Administration';
  const studentTotalDue = targetStudent?.totalDue ?? tuitionStatement?.totalTuition ?? tuitionStatement?.totalDue ?? 0;
  const studentCumulativePaid = targetStudent?.paidAmount ?? tuitionStatement?.totalPaid ?? 0;
  const studentBalanceOwed = targetStudent?.balanceOwed ?? tuitionStatement?.balanceDue ?? 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 max-h-[95vh] flex flex-col"
        id="receipt-modal-container"
      >
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Official Bursar Receipt
            </span>
            <span className="text-xs text-slate-500">ID: {activeReceipt.receiptNumber}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              id="print-receipt-btn"
              className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print Receipt
            </button>
            <button
              onClick={closeReceiptModal}
              id="close-receipt-modal-btn"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Official Receipt Printable Paper Area */}
        <div className="p-8 space-y-6 overflow-y-auto" id="printable-receipt-area">
          {/* Header Banner */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center space-x-4">
              <LipaLogo size="lg" variant="badge" />
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 font-serif">
                  LIPA ELEARNING CENTER
                </h2>
                <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                  Liberia Institute of Public Administration • Est. 1969
                </p>
                <p className="text-xs text-slate-400 italic">
                  &ldquo;Transforming Minds &amp; Institutions&rdquo; • bursar@lipa.edu.lr
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase font-mono text-slate-400 tracking-wider">Receipt No.</span>
              <p className="text-sm font-bold font-mono text-slate-900">{activeReceipt.receiptNumber}</p>
              <p className="text-xs text-slate-500 mt-1">Date: {activeReceipt.date}</p>
            </div>
          </div>

          {/* Student & Transaction Meta Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium uppercase tracking-wider block mb-1">Billed Student</span>
              <p className="font-semibold text-slate-900 text-sm">{activeReceipt.payerName}</p>
              <p className="text-slate-600 font-mono">Student ID: {studentIdDisplay}</p>
              <p className="text-slate-500">{studentDeptDisplay}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium uppercase tracking-wider block mb-1">Payment Verification</span>
              <p className="text-slate-700"><span className="font-semibold">Payment Method:</span> {activeReceipt.method}</p>
              <p className="text-slate-700"><span className="font-semibold">Term:</span> {activeReceipt.term}</p>
              <p className="font-mono text-slate-500 truncate" title={activeReceipt.referenceCode}>
                Ref: {activeReceipt.referenceCode}
              </p>
            </div>
          </div>

          {/* Itemized Line Items */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 font-semibold">Description</th>
                  <th className="py-2.5 font-semibold text-center">Category</th>
                  <th className="py-2.5 font-semibold text-center">Term</th>
                  <th className="py-2.5 font-semibold text-center">Status</th>
                  <th className="py-2.5 font-semibold text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 font-medium text-slate-900">
                    {activeReceipt.description}
                  </td>
                  <td className="py-3 text-center text-slate-600">{activeReceipt.category}</td>
                  <td className="py-3 text-center text-slate-600">{activeReceipt.term}</td>
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Settled
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold font-mono text-slate-900">
                    ${activeReceipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Student Account Balance Statement Breakdown */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Student Account Balance Summary
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center pt-1">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Total Due</span>
                <span className="text-sm font-bold font-mono text-slate-900">
                  ${(studentTotalDue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-[11px] text-emerald-700 block">Total Paid</span>
                <span className="text-sm font-bold font-mono text-emerald-700">
                  ${(studentCumulativePaid || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2.5 bg-red-50 rounded-lg border border-red-200">
                <span className="text-[11px] text-red-700 block">Balance Owed</span>
                <span className="text-sm font-bold font-mono text-red-700">
                  ${(studentBalanceOwed || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Totals and Verification */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="text-xs text-slate-500 max-w-xs space-y-1">
              <div className="flex items-center text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600 shrink-0" />
                Verified & Cryptographically Signed
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                This official receipt confirms educational remittance to LIPA eLearning Center. Keep this for institutional verification and official clearance.
              </p>
            </div>

            <div className="w-full sm:w-60 space-y-2 text-right text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Receipt Remittance:</span>
                <span className="font-semibold text-slate-900 font-mono">
                  ${(activeReceipt.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Remaining Balance:</span>
                <span className="font-semibold text-red-600 font-mono">
                  ${(studentBalanceOwed || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total Cleared:</span>
                <span className="text-base font-extrabold text-emerald-700 font-mono">
                  ${(activeReceipt.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0 print:hidden">
          <span>LIPA eLearning Center Bursar Portal • Official Student Receipt</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors cursor-pointer"
            >
              Print Receipt
            </button>
            <button
              onClick={closeReceiptModal}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
