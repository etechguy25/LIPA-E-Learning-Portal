import React, { useState, useEffect } from 'react';
import { useLms } from '../../context/LmsContext';
import { Lock, CheckCircle2, ShieldCheck, Eye, EyeOff, KeyRound, ArrowRight, X } from 'lucide-react';

export const PasswordSetupModal: React.FC = () => {
  const {
    isPasswordSetupModalOpen,
    setIsPasswordSetupModalOpen,
    targetPasswordStudentId,
    setTargetPasswordStudentId,
    usersDirectory,
    setStudentPasswordById,
    activateStudentAccount,
    switchRole,
    openClassroom,
    courses
  } = useLms();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Find target student
  const student = usersDirectory.find(
    u => u.id === targetPasswordStudentId || u.studentId === targetPasswordStudentId || u.email === targetPasswordStudentId
  );

  useEffect(() => {
    if (student?.defaultPassword) {
      // Don't auto-fill new password, but clear state
      setPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess(false);
    }
  }, [student, isPasswordSetupModalOpen]);

  if (!isPasswordSetupModalOpen || !student) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setStudentPasswordById(student.id, password);
    activateStudentAccount(student.id);
    setSuccess(true);
  };

  const handleLoginAsStudent = () => {
    setIsPasswordSetupModalOpen(false);
    setTargetPasswordStudentId(null);
    switchRole('student');
    if (student.selectedCourseId) {
      openClassroom(student.selectedCourseId);
    }
  };

  const handleClose = () => {
    setIsPasswordSetupModalOpen(false);
    setTargetPasswordStudentId(null);
    setSuccess(false);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden text-slate-800 dark:text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account Password Setup</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">LIPA Student Portal Security</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Password Configured!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Your credentials for <strong className="text-slate-800 dark:text-slate-200">{student.name}</strong> ({student.email}) have been updated. You can now log in and access your academic dashboard.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLoginAsStudent}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                >
                  <span>Log In to Student Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Student Identification Banner */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Student Name:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{student.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Email:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{student.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Student ID:</span>
                  <span className="font-mono text-red-600 dark:text-red-400 font-semibold">{student.studentId || student.id}</span>
                </div>
                {student.defaultPassword && (
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400">Temporary Default:</span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded text-[11px]">
                      {student.defaultPassword}
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-xl">
                  {error}
                </div>
              )}

              {/* Password Fields */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Permanent Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full pl-3 pr-10 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Permanent Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  required
                />
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Set &amp; Activate</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
