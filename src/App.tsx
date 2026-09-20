import React, { useState, useEffect } from 'react';
import { LmsProvider, useLms } from './context/LmsContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { StudentDashboard } from './components/student/StudentDashboard';
import { InstructorDashboard } from './components/instructor/InstructorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PaymentModal } from './components/common/PaymentModal';
import { ReceiptModal } from './components/common/ReceiptModal';
import { EmailNotificationModal } from './components/common/EmailNotificationModal';
import { PasswordSetupModal } from './components/common/PasswordSetupModal';
import { CourseClassroom } from './components/classroom/CourseClassroom';
import { Bell, Info, X } from 'lucide-react';

const LmsAppContent: React.FC = () => {
  const { currentRole, settings, activeClassroomId, closeClassroom, activeEmailModal, setActiveEmailModal } = useLms();

  // Active tab state
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showBanner, setShowBanner] = useState<boolean>(true);

  // Modals for Header action buttons
  const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState<boolean>(false);
  const [isCreateCourseModalOpen, setIsCreateCourseModalOpen] = useState<boolean>(false);

  // When role changes, switch active tab to default for that role
  useEffect(() => {
    if (currentRole === 'student') {
      setActiveTab('overview');
    } else if (currentRole === 'instructor') {
      setActiveTab('overview');
    } else if (currentRole === 'admin') {
      setActiveTab('analytics');
    }
  }, [currentRole]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-red-600 selection:text-white transition-colors duration-200">
      {/* Top Academic Broadcast Announcement Banner */}
      {showBanner && settings.announcementBanner && (
        <div className="bg-[#091528] text-slate-300 text-xs px-4 py-2 flex items-center justify-between border-b border-[#172a46]">
          <div className="flex items-center space-x-2 truncate mx-auto max-w-5xl">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-600/20 text-red-300 border border-red-500/30 shrink-0 uppercase tracking-wider">
              Official Bulletin
            </span>
            <span className="truncate text-[11px] text-slate-300 font-medium">
              {settings.announcementBanner}
            </span>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors ml-2 shrink-0 cursor-pointer"
            aria-label="Dismiss Announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Institutional Header with Role Switcher */}
      <Header
        onOpenNewLesson={() => setIsCreateLessonModalOpen(true)}
        onOpenNewCourse={() => setIsCreateCourseModalOpen(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Adaptive Sidebar Navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Content Surface */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeClassroomId ? (
            <CourseClassroom courseId={activeClassroomId} onBack={closeClassroom} />
          ) : (
            <>
              {currentRole === 'student' && (
                <StudentDashboard activeTab={activeTab} setActiveTab={setActiveTab} />
              )}

              {currentRole === 'instructor' && (
                <InstructorDashboard
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isCreateLessonModalOpen={isCreateLessonModalOpen}
                  setIsCreateLessonModalOpen={setIsCreateLessonModalOpen}
                />
              )}

              {currentRole === 'admin' && (
                <AdminDashboard
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  isCreateCourseModalOpen={isCreateCourseModalOpen}
                  setIsCreateCourseModalOpen={setIsCreateCourseModalOpen}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Universal Bursar Modals */}
      <PaymentModal />
      <ReceiptModal />
      
      {/* Official Email Notification Dispatcher Modal */}
      <EmailNotificationModal
        isOpen={activeEmailModal}
        onClose={() => setActiveEmailModal(false)}
      />

      {/* Mandatory Password Activation Modal for newly enrolled/registered students */}
      <PasswordSetupModal />
    </div>
  );
};

export default function App() {
  return (
    <LmsProvider>
      <LmsAppContent />
    </LmsProvider>
  );
}
