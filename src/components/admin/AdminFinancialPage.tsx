import React, { useState, useEffect, useRef } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  CreditCard,
  DollarSign,
  Search,
  CheckCircle2,
  Receipt,
  Download,
  Filter,
  Clock,
  AlertCircle,
  Printer,
  FileText,
  X,
  ShieldCheck,
  GraduationCap,
  Award,
  Users,
  Smartphone,
  Banknote,
  Percent,
  Check,
  UserCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
  PlusCircle,
  History,
  RotateCcw,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { AllowedPaymentMethod, PaymentTransaction, UserProfile } from '../../types';
import { LipaLogo } from '../common/LipaLogo';
import { UserAvatar } from '../common/UserAvatar';

interface AdminFinancialPageProps {
  onNavigateToEnrollment?: () => void;
}

export const AdminFinancialPage: React.FC<AdminFinancialPageProps> = ({ onNavigateToEnrollment }) => {
  const {
    analytics,
    usersDirectory,
    transactions,
    courses,
    settings,
    updateStudentFinancials,
    openReceiptModal
  } = useLms();

  const students = usersDirectory.filter(u => u.role === 'student');

  // Search & Filter State
  const [studentIdSearch, setStudentIdSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<'all' | 'pending' | 'partial' | 'complete' | 'scholarship'>('all');

  // Workspace Mode: Continuous Installment vs Direct Adjustment
  const [paymentMode, setPaymentMode] = useState<'installment' | 'direct'>('installment');

  // Installment State
  const [installmentAmount, setInstallmentAmount] = useState<string>('');

  // Direct Adjustment State
  const [directPaidInput, setDirectPaidInput] = useState<string>('');
  const [directBalanceInput, setDirectBalanceInput] = useState<string>('');

  // Common payment attributes
  const [chosenPaymentMethod, setChosenPaymentMethod] = useState<'Mobile Money' | 'Visa Card' | 'Direct Cash'>('Mobile Money');
  const [transactionNote, setTransactionNote] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Form reference for auto-scroll
  const formRef = useRef<HTMLDivElement>(null);

  // Initialize selection if students exist and none selected yet
  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  // Find currently selected student
  const activeStudent: UserProfile | undefined = students.find(
    s => s.id === selectedStudentId || s.studentId === selectedStudentId
  ) || students[0];

  // Resolve active student's registered course
  const registeredCourse = activeStudent
    ? courses.find(c => c.id === activeStudent.selectedCourseId || c.id === activeStudent.assignedCourseIds?.[0])
    : undefined;

  // Calculate assessed tuition for selected student
  const defaultFeePerCredit = settings.tuitionFeePerCredit || 1150;
  const courseBaseTuition = registeredCourse?.tuitionFee ?? (registeredCourse ? registeredCourse.credits * defaultFeePerCredit : 0);
  const assessedTotalDue = activeStudent?.totalDue !== undefined && activeStudent.totalDue > 0
    ? activeStudent.totalDue
    : (courseBaseTuition > 0 ? courseBaseTuition : 1000);

  const currentPaid = activeStudent?.paidAmount || 0;
  const currentBalance = activeStudent?.balanceOwed !== undefined
    ? activeStudent.balanceOwed
    : Math.max(0, assessedTotalDue - currentPaid);

  // Synchronize inputs when selected student changes
  useEffect(() => {
    if (activeStudent) {
      setDirectPaidInput(currentPaid > 0 ? String(currentPaid) : '');
      setDirectBalanceInput(String(currentBalance));
      setInstallmentAmount('');
      setTransactionNote(`Tuition installment settlement for ${activeStudent.name}`);
    }
  }, [activeStudent?.id, currentPaid, currentBalance]);

  // Handle live Student ID search
  const handleStudentIdSearchChange = (val: string) => {
    setStudentIdSearch(val);
    const query = val.trim().toLowerCase();
    if (!query) return;

    const matched = students.find(
      s => (s.studentId && s.studentId.toLowerCase().includes(query)) || s.name.toLowerCase().includes(query)
    );
    if (matched) {
      setSelectedStudentId(matched.id);
    }
  };

  // Direct manual calculation handlers
  const handleDirectPaidChange = (paidVal: string) => {
    setDirectPaidInput(paidVal);
    const paidNum = parseFloat(paidVal) || 0;
    const computedBal = Math.max(0, assessedTotalDue - paidNum);
    setDirectBalanceInput(String(computedBal));
  };

  const handleDirectBalanceChange = (balVal: string) => {
    setDirectBalanceInput(balVal);
    const balNum = parseFloat(balVal) || 0;
    const computedPaid = Math.max(0, assessedTotalDue - balNum);
    setDirectPaidInput(computedPaid > 0 ? String(computedPaid) : '0');
  };

  // =========================================================================
  // TOP 4 KPI CARDS: Total Generated, Total Balance, Total Registered, Total Scholarship
  // =========================================================================
  // 1. Total Amount Generated (Sum of all cleared tuition across students)
  const totalAmountGenerated = students.reduce((acc, s) => acc + (s.paidAmount || 0), 0) ||
    transactions.reduce((acc, t) => acc + (t.amount || 0), 0);

  // 2. Total Balance (Sum of outstanding balances)
  const totalBalance = students.reduce((acc, s) => {
    const bal = s.balanceOwed !== undefined ? s.balanceOwed : Math.max(0, (s.totalDue || 0) - (s.paidAmount || 0));
    return acc + bal;
  }, 0);

  // 3. Total Students Registered
  const totalStudentsRegistered = students.length;

  // 4. Total Scholarship Students
  const totalScholarshipStudents = students.filter(s => s.isScholarship || (s.scholarshipPercentage && s.scholarshipPercentage > 0)).length;

  // Active student stats
  const numericInstallment = parseFloat(installmentAmount) || 0;
  const projectedPaid = currentPaid + numericInstallment;
  const projectedBalance = Math.max(0, currentBalance - numericInstallment);
  const activePercentComplete = assessedTotalDue > 0
    ? Math.min(100, Math.round((currentPaid / assessedTotalDue) * 100))
    : 0;

  // Submissions for selected student
  const studentTransactions = transactions.filter(
    t =>
      t.studentId === activeStudent?.id ||
      t.studentId === activeStudent?.studentId ||
      (t.studentEmail && activeStudent?.email && t.studentEmail.toLowerCase() === activeStudent.email.toLowerCase())
  );

  // Submit Handler: Process partial installment payment
  const handleProcessInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;
    if (numericInstallment <= 0) return;

    const newTotalPaid = currentPaid + numericInstallment;
    const newBalanceOwed = Math.max(0, currentBalance - numericInstallment);

    const createdTx = updateStudentFinancials({
      studentId: activeStudent.studentId || activeStudent.id,
      amountPaid: newTotalPaid,
      balanceOwed: newBalanceOwed,
      totalDue: assessedTotalDue,
      paymentMethod: chosenPaymentMethod,
      description: transactionNote || `Installment payment of $${numericInstallment.toLocaleString()} via ${chosenPaymentMethod}`,
      installmentAmount: numericInstallment
    });

    setSuccessMessage(
      `Installment payment of $${numericInstallment.toLocaleString()} recorded for ${activeStudent.name}! New Total Paid: $${newTotalPaid.toLocaleString()} • Remaining Balance: $${newBalanceOwed.toLocaleString()}. Receipt #${createdTx.receiptNumber} issued.`
    );

    setInstallmentAmount('');
    openReceiptModal(createdTx);
    setTimeout(() => setSuccessMessage(null), 8000);
  };

  // Submit Handler: Process direct balance adjustment
  const handleProcessDirectAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent) return;

    const paid = parseFloat(directPaidInput) || 0;
    const balance = parseFloat(directBalanceInput) || 0;

    const createdTx = updateStudentFinancials({
      studentId: activeStudent.studentId || activeStudent.id,
      amountPaid: paid,
      balanceOwed: balance,
      totalDue: assessedTotalDue,
      paymentMethod: chosenPaymentMethod,
      description: transactionNote || `Financial balance direct reconciliation via ${chosenPaymentMethod}`
    });

    setSuccessMessage(
      `Financial record updated for ${activeStudent.name}! Total Paid: $${paid.toLocaleString()} • Balance Owed: $${balance.toLocaleString()}. Receipt #${createdTx.receiptNumber}`
    );

    openReceiptModal(createdTx);
    setTimeout(() => setSuccessMessage(null), 8000);
  };

  // Select student from table and scroll to payment form
  const handleSelectStudentForUpdate = (student: UserProfile, preferInstallment: boolean = true) => {
    setSelectedStudentId(student.id);
    if (student.studentId) setStudentIdSearch(student.studentId);
    if (preferInstallment) setPaymentMode('installment');
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filtered Students Ledger
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      (student.studentId && student.studentId.toLowerCase().includes(ledgerSearch.toLowerCase())) ||
      (student.email && student.email.toLowerCase().includes(ledgerSearch.toLowerCase())) ||
      (student.selectedCourseName && student.selectedCourseName.toLowerCase().includes(ledgerSearch.toLowerCase()));

    if (!matchesSearch) return false;

    const bal = student.balanceOwed !== undefined ? student.balanceOwed : Math.max(0, (student.totalDue || 0) - (student.paidAmount || 0));
    const paid = student.paidAmount || 0;

    if (ledgerStatusFilter === 'scholarship') return !!student.isScholarship;
    if (ledgerStatusFilter === 'complete') return bal <= 0 && (paid > 0 || student.isScholarship);
    if (ledgerStatusFilter === 'partial') return paid > 0 && bal > 0;
    if (ledgerStatusFilter === 'pending') return paid === 0 && !student.isScholarship;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <h1 className="text-xl font-bold font-serif text-slate-900">
              Financial Record &amp; Bursar Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Continuous tuition settlement, partial installment tracking, dynamic bursar balances, and official statements.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {onNavigateToEnrollment && (
            <button
              onClick={onNavigateToEnrollment}
              id="financial-nav-enrollment-btn"
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-xs cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <span>Enroll New Student</span>
            </button>
          )}

          <button
            onClick={() => setShowExportModal(true)}
            id="financial-export-statement-btn"
            className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors shadow-xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            <span>Export Official Statement</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP 4 KPI CARDS: Total Generated, Total Balance, Total Registered, Total Scholarship */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="financial-kpi-summary-section">
        {/* KPI 1: Total Amount Generated */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden" id="kpi-amount-generated">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Total Amount Generated
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-extrabold text-emerald-700 mt-2">
            ${totalAmountGenerated.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Cleared bursar revenue collected
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>

        {/* KPI 2: Total Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden" id="kpi-total-balance">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Total Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center border border-red-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-extrabold text-red-700 mt-2">
            ${totalBalance.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Pending institutional receivables
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500"></div>
        </div>

        {/* KPI 3: Total Students Registered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden" id="kpi-total-registered">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Total Students Registered
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-extrabold text-slate-900 mt-2">
            {totalStudentsRegistered}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Enrolled academic student roster
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800"></div>
        </div>

        {/* KPI 4: Total Scholarship Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden" id="kpi-total-scholarship">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
              Total Scholarship Students
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-mono font-extrabold text-amber-700 mt-2">
            {totalScholarshipStudents}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Full &amp; partial tuition beneficiaries
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION: CONTINUOUS PAYMENT SETTLEMENT & STUDENT WORKSPACE */}
      {/* ========================================================================= */}
      {students.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4 shadow-xs" id="empty-financial-records">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">No Students Registered in System</h3>
            <p className="text-xs text-slate-500">
              Financial records and continuous partial payment updates require at least one registered student in the academic directory.
            </p>
          </div>
          {onNavigateToEnrollment && (
            <button
              onClick={onNavigateToEnrollment}
              id="empty-state-register-student-btn"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Go to Registration &amp; Enrollment</span>
            </button>
          )}
        </div>
      ) : (
        <div ref={formRef} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Student Selection & Continuous Partial Payment Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5" id="student-payment-workspace">
            <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-red-600" />
                  <span>Continuous Payment &amp; Partial Settlement</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Update financial records incrementally when students make partial payments over time.
                </p>
              </div>

              {/* Workspace Mode Switch: Installment vs Direct */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMode('installment')}
                  id="tab-mode-installment-btn"
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    paymentMode === 'installment'
                      ? 'bg-white text-red-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>Add Partial Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('direct')}
                  id="tab-mode-direct-btn"
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    paymentMode === 'direct'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Direct Balance Adjust</span>
                </button>
              </div>
            </div>

            {/* Dual Selection Mode: Search by Student ID OR Choose from List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              {/* 1. Search via Student ID */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Search via Student ID or Name
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. STU-2026-..."
                    value={studentIdSearch}
                    onChange={e => handleStudentIdSearchChange(e.target.value)}
                    id="search-student-id-input"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden bg-white font-mono"
                  />
                </div>
              </div>

              {/* 2. Choose from List */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Or Choose from Registered Students *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={e => {
                    setSelectedStudentId(e.target.value);
                    const found = students.find(s => s.id === e.target.value);
                    if (found?.studentId) setStudentIdSearch(found.studentId);
                  }}
                  id="select-student-dropdown"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden bg-white font-medium cursor-pointer"
                >
                  {students.map(st => {
                    const bal = st.balanceOwed !== undefined ? st.balanceOwed : Math.max(0, (st.totalDue || 0) - (st.paidAmount || 0));
                    const isFullyPaid = bal <= 0 && (st.paidAmount || 0) > 0;
                    return (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.studentId || 'No ID'}) &bull; {st.isScholarship ? '★ Scholarship' : isFullyPaid ? '✓ Paid' : `Bal: $${bal.toLocaleString()}`}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Auto-Populated Course Enrollment Details */}
            {activeStudent && (
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-red-600" />
                    Enrolled Curriculum Details
                  </span>
                  {activeStudent.isScholarship && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {activeStudent.scholarshipType || 'Scholarship Recipient'} ({activeStudent.scholarshipPercentage || 100}%)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Registered Course</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {registeredCourse?.title || activeStudent.selectedCourseName || activeStudent.major || 'Curriculum Course'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Code: {registeredCourse?.code || 'CRS-GEN'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Classroom / Location</span>
                    <span className="font-semibold text-slate-800 block truncate">
                      {registeredCourse?.classroom || registeredCourse?.department || activeStudent.department || 'Executive Hall'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {registeredCourse?.location || activeStudent.learnType || 'On-site'} Mode
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Assessed Course Tuition</span>
                    <span className="font-mono font-extrabold text-red-700 text-sm block">
                      ${assessedTotalDue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Status: {currentBalance <= 0 ? 'Fully Cleared' : 'Balance Pending'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* WORKSPACE MODE 1: RECORD CONTINUOUS PARTIAL PAYMENT INSTALLMENT */}
            {/* ========================================================================= */}
            {paymentMode === 'installment' && (
              <form onSubmit={handleProcessInstallment} className="space-y-4 text-xs" id="installment-payment-form">
                {/* Current Financial Status Callout */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wide block">
                      Current Account Standing
                    </span>
                    <div className="flex items-center gap-4 mt-1 text-xs">
                      <span>Total Paid so far: <strong className="font-mono font-bold text-emerald-700">${currentPaid.toLocaleString()}</strong></span>
                      <span>•</span>
                      <span>Outstanding Balance: <strong className="font-mono font-bold text-red-700">${currentBalance.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white border border-blue-300 text-blue-800 font-mono">
                    {activePercentComplete}% Settled
                  </span>
                </div>

                {/* Installment Amount Input Field */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    New Partial Payment Installment ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min="1"
                      max={currentBalance > 0 ? currentBalance : undefined}
                      step="any"
                      required
                      placeholder="e.g. 200.00"
                      value={installmentAmount}
                      onChange={e => setInstallmentAmount(e.target.value)}
                      id="input-installment-amount"
                      className="w-full pl-7 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden font-mono font-bold text-slate-900 bg-white"
                    />
                  </div>

                  {/* Quick Preset Buttons for Partial Payments */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Quick Add:</span>
                    {[50, 100, 200, 500].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setInstallmentAmount(String(amt))}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        +${amt}
                      </button>
                    ))}
                    {currentBalance > 0 && (
                      <button
                        type="button"
                        onClick={() => setInstallmentAmount(String(currentBalance))}
                        className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-mono text-[11px] font-bold transition-colors cursor-pointer border border-red-200"
                      >
                        Pay Full Balance (${currentBalance.toLocaleString()})
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Real-Time Projection Box */}
                {numericInstallment > 0 && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wide block">
                      Live Installment Impact Calculation
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">New Total Paid</span>
                        <span className="font-mono font-bold text-emerald-700 text-sm">
                          ${projectedPaid.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          (${currentPaid} + ${numericInstallment})
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-emerald-100">
                        <span className="text-[10px] text-slate-500 block">New Remaining Balance</span>
                        <span className="font-mono font-bold text-red-700 text-sm">
                          ${projectedBalance.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          (${currentBalance} - ${numericInstallment})
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method Selection: Mobile Money, Visa Card, Direct Cash */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Mobile Money */}
                    <button
                      type="button"
                      onClick={() => setChosenPaymentMethod('Mobile Money')}
                      id="method-mobile-money-btn"
                      className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                        chosenPaymentMethod === 'Mobile Money'
                          ? 'border-red-600 bg-red-50/50 shadow-xs ring-1 ring-red-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        chosenPaymentMethod === 'Mobile Money' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-slate-900 text-xs">Mobile Money</div>
                        <div className="text-[10px] text-slate-500">Lonestar / Orange</div>
                      </div>
                    </button>

                    {/* Visa Card */}
                    <button
                      type="button"
                      onClick={() => setChosenPaymentMethod('Visa Card')}
                      id="method-visa-card-btn"
                      className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                        chosenPaymentMethod === 'Visa Card'
                          ? 'border-red-600 bg-red-50/50 shadow-xs ring-1 ring-red-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        chosenPaymentMethod === 'Visa Card' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-slate-900 text-xs">Visa Card</div>
                        <div className="text-[10px] text-slate-500">Debit / Credit</div>
                      </div>
                    </button>

                    {/* Direct Cash */}
                    <button
                      type="button"
                      onClick={() => setChosenPaymentMethod('Direct Cash')}
                      id="method-direct-cash-btn"
                      className={`p-3 rounded-xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                        chosenPaymentMethod === 'Direct Cash'
                          ? 'border-red-600 bg-red-50/50 shadow-xs ring-1 ring-red-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        chosenPaymentMethod === 'Direct Cash' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-slate-900 text-xs">Direct Cash</div>
                        <div className="text-[10px] text-slate-500">Bursar Cash Window</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Transaction Note */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Installment Reference / Receipt Description
                  </label>
                  <input
                    type="text"
                    value={transactionNote}
                    onChange={e => setTransactionNote(e.target.value)}
                    placeholder="e.g. 2nd partial tuition payment verified via bursar"
                    id="input-transaction-note"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden bg-white"
                  />
                </div>

                {/* Submit Trigger */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dispatches official payment receipt and updates balance continuously.</span>
                  </div>

                  <button
                    type="submit"
                    id="confirm-installment-btn"
                    disabled={numericInstallment <= 0}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-all ${
                      numericInstallment > 0
                        ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Post Installment &amp; Issue Receipt</span>
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================================= */}
            {/* WORKSPACE MODE 2: DIRECT MANUAL BALANCE ADJUSTMENT */}
            {/* ========================================================================= */}
            {paymentMode === 'direct' && (
              <form onSubmit={handleProcessDirectAdjustment} className="space-y-4 text-xs" id="direct-adjust-form">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Direct Balance &amp; Tuition Reconciliation
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Directly modify total paid and balance owed for special adjustments, fee waivers, or direct ledger balancing.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Total Amount Paid ($) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="0.00"
                        value={directPaidInput}
                        onChange={e => handleDirectPaidChange(e.target.value)}
                        id="input-direct-amount-paid"
                        className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden font-mono font-bold text-emerald-700 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Balance Owed ($) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="0.00"
                        value={directBalanceInput}
                        onChange={e => handleDirectBalanceChange(e.target.value)}
                        id="input-direct-balance-owed"
                        className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden font-mono font-bold text-red-700 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Settlement Method <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Mobile Money', 'Visa Card', 'Direct Cash'] as const).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setChosenPaymentMethod(m)}
                        className={`p-2 rounded-lg border text-center text-xs font-semibold cursor-pointer transition-all ${
                          chosenPaymentMethod === m
                            ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transaction Note */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Reason / Adjustment Note
                  </label>
                  <input
                    type="text"
                    value={transactionNote}
                    onChange={e => setTransactionNote(e.target.value)}
                    placeholder="e.g. Administrative balance adjustment"
                    id="input-direct-transaction-note"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-hidden bg-white"
                  />
                </div>

                {/* Submit Trigger */}
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    id="save-direct-adjustment-btn"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Apply Balance Adjustment</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT COLUMN: Live Student Status & Installment History Log (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Student Profile Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4" id="student-financial-profile-card">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-red-600" />
                  Student Financial Status
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  activeStudent?.portalActive || currentBalance <= 0 || activeStudent?.isScholarship
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {activeStudent?.portalActive || currentBalance <= 0 || activeStudent?.isScholarship
                    ? 'Portal Activated'
                    : 'Portal Pending'}
                </span>
              </div>

              {activeStudent && (
                <div className="space-y-3.5">
                  <div className="flex items-center space-x-3">
                    <UserAvatar
                      avatar={activeStudent.avatar}
                      name={activeStudent.name}
                      role="student"
                      size="md"
                    />
                    <div className="truncate">
                      <h5 className="text-sm font-bold text-slate-900 truncate">{activeStudent.name}</h5>
                      <p className="text-[11px] font-mono text-slate-500">ID: {activeStudent.studentId || activeStudent.id}</p>
                      <p className="text-[10px] text-slate-500 truncate">{activeStudent.email}</p>
                    </div>
                  </div>

                  {/* Financial Status Indicator */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Tuition Fulfillment</span>
                      {currentBalance <= 0 || activePercentComplete >= 100 ? (
                        <span className="font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          100% Cleared
                        </span>
                      ) : currentPaid > 0 ? (
                        <span className="font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-300 flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          {activePercentComplete}% Paid • {100 - activePercentComplete}% Balance
                        </span>
                      ) : (
                        <span className="font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending Initial Payment
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          activePercentComplete >= 100
                            ? 'bg-emerald-600'
                            : activePercentComplete > 0
                            ? 'bg-blue-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${activePercentComplete}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Paid: <strong className="text-emerald-700 font-mono">${currentPaid.toLocaleString()}</strong></span>
                      <span>Balance: <strong className="text-red-600 font-mono">${currentBalance.toLocaleString()}</strong></span>
                      <span>Total: <strong className="font-mono">${assessedTotalDue.toLocaleString()}</strong></span>
                    </div>
                  </div>

                  {/* Enrollment Status */}
                  <div className="p-3 rounded-xl border border-slate-100 bg-white flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Enrollment Confirmation:</span>
                    <span className={`font-bold flex items-center gap-1 ${
                      activeStudent.enrollmentConfirmed || activePercentComplete >= 100 || activeStudent.isScholarship
                        ? 'text-emerald-700'
                        : 'text-amber-700'
                    }`}>
                      {activeStudent.enrollmentConfirmed || activePercentComplete >= 100 || activeStudent.isScholarship ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Confirmed &amp; Active</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Pending Payment</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Continuous Payment History Log for Active Student */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3" id="student-installment-history">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-600" />
                  Installment Payment History ({studentTransactions.length})
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeStudent?.studentId}
                </span>
              </div>

              {studentTransactions.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl space-y-1 text-xs">
                  <Clock className="w-5 h-5 text-slate-300 mx-auto" />
                  <p className="font-semibold text-slate-700">No Payment Installments Logged Yet</p>
                  <p className="text-[11px] text-slate-400">
                    Use the form on the left to post the student's first tuition installment.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {studentTransactions.map(tx => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/60 transition-colors flex items-center justify-between text-xs gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 font-mono">${tx.amount.toLocaleString()}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                            {tx.method}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {tx.receiptNumber} &bull; {tx.date}
                        </p>
                        {tx.description && (
                          <p className="text-[10px] text-slate-600 line-clamp-1">{tx.description}</p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openReceiptModal(tx)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[11px] font-semibold flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
                        title="View & Print Official Receipt"
                      >
                        <Receipt className="w-3 h-3 text-red-600" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION: ALL REGISTERED STUDENTS FINANCIAL LEDGER TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="financial-ledger-table-container">
        {/* Table Header & Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-red-600" />
              <span>Registered Students Financial Ledger</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live account balancing, course enrollment verification, and continuous installment updates across all students.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setLedgerStatusFilter('all')}
                id="filter-all-btn"
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  ledgerStatusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({students.length})
              </button>
              <button
                onClick={() => setLedgerStatusFilter('pending')}
                id="filter-pending-btn"
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  ledgerStatusFilter === 'pending' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setLedgerStatusFilter('partial')}
                id="filter-partial-btn"
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  ledgerStatusFilter === 'partial' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Partial
              </button>
              <button
                onClick={() => setLedgerStatusFilter('complete')}
                id="filter-complete-btn"
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  ledgerStatusFilter === 'complete' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                100% Cleared
              </button>
              <button
                onClick={() => setLedgerStatusFilter('scholarship')}
                id="filter-scholarship-btn"
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  ledgerStatusFilter === 'scholarship' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Scholarship
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ledger..."
                value={ledgerSearch}
                onChange={e => setLedgerSearch(e.target.value)}
                id="search-ledger-input"
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-hidden bg-slate-50 w-44"
              />
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="py-3 px-4">Student Name &amp; ID</th>
                <th className="py-3 px-4">Registered Course &amp; Classroom</th>
                <th className="py-3 px-4">Course Fee</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Balance Owed</th>
                <th className="py-3 px-4">Tuition Progress</th>
                <th className="py-3 px-4">Portal Status</th>
                <th className="py-3 px-4 text-right">Continuous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No student records matching current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(st => {
                  const course = courses.find(c => c.id === st.selectedCourseId || c.id === st.assignedCourseIds?.[0]);
                  const fee = st.totalDue !== undefined && st.totalDue > 0
                    ? st.totalDue
                    : (course?.tuitionFee ?? (course ? course.credits * (settings.tuitionFeePerCredit || 1150) : 1000));
                  const paid = st.paidAmount || 0;
                  const bal = st.balanceOwed !== undefined ? st.balanceOwed : Math.max(0, fee - paid);
                  const isFullyPaid = bal <= 0 && (paid > 0 || st.isScholarship);
                  const isPartial = paid > 0 && bal > 0;
                  const pct = fee > 0 ? Math.min(100, Math.round((paid / fee) * 100)) : 0;
                  const isSelected = activeStudent?.id === st.id;

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2.5">
                          <UserAvatar
                            avatar={st.avatar}
                            name={st.name}
                            role="student"
                            size="sm"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{st.name}</div>
                            <div className="text-[10px] font-mono text-slate-500">{st.studentId || 'No ID'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Registered Course & Classroom */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 truncate max-w-[200px]">
                          {course?.title || st.selectedCourseName || st.major || 'Academic Course'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {course?.code || 'CRS-GEN'} &bull; {course?.classroom || course?.department || st.department} ({course?.location || st.learnType || 'On-site'})
                        </div>
                      </td>

                      {/* Course Fee */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        ${fee.toLocaleString()}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                        ${paid.toLocaleString()}
                      </td>

                      {/* Balance Owed */}
                      <td className="py-3 px-4 font-mono font-bold text-red-700">
                        ${bal.toLocaleString()}
                      </td>

                      {/* Status Badge & Micro Progress */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {st.isScholarship ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              ★ Scholarship ({st.scholarshipPercentage || 100}%)
                            </span>
                          ) : isFullyPaid ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Check className="w-3 h-3 mr-1" />
                              100% Cleared
                            </span>
                          ) : isPartial ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              {pct}% Paid (${paid}/${fee})
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              Pending Initial
                            </span>
                          )}

                          <div className="w-20 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                isFullyPaid ? 'bg-emerald-600' : isPartial ? 'bg-blue-600' : 'bg-amber-400'
                              }`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      {/* Portal Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.portalActive || isFullyPaid || st.isScholarship
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {st.portalActive || isFullyPaid || st.isScholarship ? 'Active' : 'Pending'}
                        </span>
                      </td>

                      {/* Continuous Action Button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleSelectStudentForUpdate(st, true)}
                          id={`update-payment-row-${st.id}`}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1 ${
                            isSelected
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-800 hover:bg-red-50 hover:text-red-700 border border-slate-200'
                          }`}
                          title="Update student payment record with new partial payment installment"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>{isSelected ? 'Active Student' : 'Update Payment'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EXPORT OFFICIAL FINANCIAL STATEMENT MODAL */}
      {/* ========================================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <LipaLogo className="w-7 h-7 text-red-500" />
                <div>
                  <h3 className="text-sm font-bold">Official Institutional Financial Statement</h3>
                  <p className="text-[11px] text-slate-300">Republic of Liberia • LIPA Academic Bursar Office</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Statement Content */}
            <div className="p-6 space-y-5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Reporting Period</span>
                  <strong className="text-slate-900">{settings.currentTerm || 'Fall 2026'} Academic Term</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Generated Date</span>
                  <strong className="text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                </div>
              </div>

              {/* Summary Numbers */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Generated</span>
                  <strong className="text-sm font-mono text-emerald-900">${totalAmountGenerated.toLocaleString()}</strong>
                </div>
                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                  <span className="text-[10px] text-red-800 uppercase font-bold block">Total Balance</span>
                  <strong className="text-sm font-mono text-red-900">${totalBalance.toLocaleString()}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-600 uppercase font-bold block">Registered</span>
                  <strong className="text-sm font-mono text-slate-900">{totalStudentsRegistered} Students</strong>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-amber-800 uppercase font-bold block">Scholarships</span>
                  <strong className="text-sm font-mono text-amber-900">{totalScholarshipStudents} Awardees</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                This official certified statement validates that the academic tuition generated, outstanding receivable balances, and individual payment reconciliations detailed above reflect the certified Bursar records of the Liberia Institute of Public Administration (LIPA).
              </p>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Authorized Bursar Electronic Seal</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  id="print-statement-now-btn"
                  className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF Statement</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
