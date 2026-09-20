import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import { Mail, Send, X, ExternalLink, CheckCircle, Trash2, KeyRound, BookOpen, Clock, Shield, Check } from 'lucide-react';
import { EmailNotificationItem } from '../../types';

interface EmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({ isOpen, onClose }) => {
  const {
    emailNotifications,
    markEmailAsRead,
    deleteEmail,
    setIsPasswordSetupModalOpen,
    setTargetPasswordStudentId,
    activateStudentAccount,
    switchRole,
    openClassroom,
    usersDirectory
  } = useLms();

  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentEmail = emailNotifications.find(e => e.id === selectedEmailId) || emailNotifications[0] || null;

  const handleSelectEmail = (email: EmailNotificationItem) => {
    setSelectedEmailId(email.id);
    if (!email.isRead) {
      markEmailAsRead(email.id);
    }
  };

  const handlePasswordSetup = (studentId?: string) => {
    if (!studentId) return;
    setTargetPasswordStudentId(studentId);
    setIsPasswordSetupModalOpen(true);
    onClose();
  };

  const handleAccessDashboard = (studentId?: string) => {
    if (studentId) {
      activateStudentAccount(studentId);
      const student = usersDirectory.find(u => u.id === studentId || u.studentId === studentId);
      switchRole('student');
      if (student?.selectedCourseId) {
        openClassroom(student.selectedCourseId);
      }
    } else {
      switchRole('student');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl h-[85vh] max-h-[750px] flex flex-col overflow-hidden text-slate-800 dark:text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">LIPA Notification Mailbox</h3>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                  {emailNotifications.length} Sent
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated student registration, password reset links, and enrollment activation notices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {emailNotifications.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No Dispatched Emails Yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              When administrators enroll a student or confirm a payment, automated notifications with password configuration links and course access are dispatched here.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left list */}
            <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-800 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/40">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Dispatched Outbox ({emailNotifications.length})
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {emailNotifications.map(email => {
                  const isSelected = (currentEmail?.id === email.id);
                  return (
                    <button
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-red-50 dark:bg-red-950/30 border-l-4 border-red-600'
                          : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold truncate ${isSelected ? 'text-red-700 dark:text-red-300' : 'text-slate-800 dark:text-slate-200'}`}>
                          {email.recipientName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                          {email.timestamp}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                        {email.subject}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          email.type === 'registration_password_setup'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}>
                          {email.type === 'registration_password_setup' ? 'Password Setup' : 'Activated'}
                        </span>
                        {!email.isRead && (
                          <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right preview */}
            {currentEmail && (
              <div className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-slate-900 p-6">
                {/* Email Envelope Details */}
                <div className="pb-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {currentEmail.subject}
                      </h4>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        From: <span className="font-semibold text-slate-700 dark:text-slate-300">LIPA Academic Admissions &amp; Bursar</span> &lt;notifications@lipa.edu.lr&gt;
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        To: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentEmail.recipientName}</span> &lt;{currentEmail.recipientEmail}&gt;
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400 flex items-center font-mono">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {currentEmail.timestamp}
                      </span>
                      <button
                        onClick={() => deleteEmail(currentEmail.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Delete notification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email Body & Letterhead */}
                <div className="py-6 flex-1 space-y-5">
                  {/* Institutional Header Card */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm tracking-wider">
                      LIPA
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                        Liberian Institute of Public Administration
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Official Academic Registrar &amp; eLearning Notification
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-sans">
                    {currentEmail.content}
                  </div>

                  {/* Temporary Password Box */}
                  {currentEmail.tempPassword && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <KeyRound className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <div>
                          <div className="text-xs font-bold text-amber-900 dark:text-amber-300">
                            System Generated Default Password
                          </div>
                          <div className="text-xs text-amber-700 dark:text-amber-400">
                            Use this temporary credential or change it to your permanent password below.
                          </div>
                        </div>
                      </div>
                      <code className="px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-300 dark:border-amber-700 font-mono text-sm font-bold text-amber-700 dark:text-amber-300 shadow-xs">
                        {currentEmail.tempPassword}
                      </code>
                    </div>
                  )}

                  {/* Primary Action Button */}
                  <div className="pt-2">
                    {currentEmail.type === 'registration_password_setup' ? (
                      <button
                        onClick={() => handlePasswordSetup(currentEmail.studentId)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-transform active:scale-95"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Change Password &amp; Access Dashboard</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAccessDashboard(currentEmail.studentId)}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center justify-center space-x-2 cursor-pointer transition-transform active:scale-95"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Access Dashboard &amp; Course Materials</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Footer disclaimer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
                  This is an automated institutional message from the LIPA Academic Information System. Please do not reply directly to this email.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
