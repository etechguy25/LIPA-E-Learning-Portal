import React, { useState } from 'react';
import { useLms } from '../../context/LmsContext';
import {
  FileCheck,
  Clock,
  Award,
  Upload,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  FileText,
  Calendar,
  X,
  ExternalLink,
  Send,
  MessageSquare
} from 'lucide-react';
import { Assignment } from '../../types';

interface StudentAssignmentsTabProps {
  onOpenClassroom: (courseId: string) => void;
}

export const StudentAssignmentsTab: React.FC<StudentAssignmentsTabProps> = ({ onOpenClassroom }) => {
  const {
    currentUser,
    courses,
    assignments,
    submissions,
    submitAssignment
  } = useLms();

  const [activeFilter, setActiveFilter] = useState<'all' | 'projects' | 'assignments' | 'pending' | 'graded'>('all');
  const [selectedAsgForSubmit, setSelectedAsgForSubmit] = useState<Assignment | null>(null);
  const [submissionFileName, setSubmissionFileName] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Student assigned courses filter
  const assignedCourses = courses.filter(c =>
    (currentUser.assignedCourseIds && currentUser.assignedCourseIds.includes(c.id)) ||
    (currentUser.selectedCourseId === c.id)
  );
  const assignedCourseIds = assignedCourses.map(c => c.id);

  // Student assignments
  const studentAssignments = assignments.filter(a =>
    assignedCourseIds.length === 0 || assignedCourseIds.includes(a.courseId)
  );

  const getSubmissionForAsg = (asgId: string) => {
    return submissions.find(s => s.assignmentId === asgId && (s.studentId === currentUser.id || !s.studentId));
  };

  const filteredAssignments = studentAssignments.filter(asg => {
    const sub = getSubmissionForAsg(asg.id);
    if (activeFilter === 'projects') return asg.isProject;
    if (activeFilter === 'assignments') return !asg.isProject;
    if (activeFilter === 'pending') return !sub || sub.status === 'pending';
    if (activeFilter === 'graded') return sub && sub.status === 'graded';
    return true;
  });

  const totalAssigned = studentAssignments.length;
  const totalProjects = studentAssignments.filter(a => a.isProject).length;
  const totalPending = studentAssignments.filter(a => {
    const sub = getSubmissionForAsg(a.id);
    return !sub || sub.status === 'pending';
  }).length;
  const totalGraded = studentAssignments.filter(a => {
    const sub = getSubmissionForAsg(a.id);
    return sub && sub.status === 'graded';
  }).length;

  const handleSubmitDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsgForSubmit) return;

    setIsSubmitting(true);
    submitAssignment(
      selectedAsgForSubmit.id,
      submissionNote.trim(),
      submissionFileName.trim() || `${selectedAsgForSubmit.title.replace(/\s+/g, '_')}_solution.pdf`
    );

    setSuccessToast(`Successfully submitted deliverable for "${selectedAsgForSubmit.title}"!`);
    setIsSubmitting(false);
    setSelectedAsgForSubmit(null);
    setSubmissionFileName('');
    setSubmissionNote('');

    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Toast */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1a30] via-[#162a4d] to-[#0c1a30] text-white p-6 shadow-sm border border-[#1e3a64]/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600/20 text-red-300 border border-red-500/30">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Academic Deliverables Hub</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-white">
              Course Assignments &amp; Projects
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Submit your academic deliverables, review faculty guidelines, monitor evaluation status, and view instructor remarks.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveFilter('pending')}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center shadow-xs cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              <span>{totalPending} Due Deliverables</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">Total Workload</span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">{totalAssigned}</span>
          <span className="text-slate-500 text-[11px] mt-0.5 block">Course milestones</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">Major Projects</span>
          <span className="text-2xl font-extrabold font-mono text-indigo-600 mt-1 block">{totalProjects}</span>
          <span className="text-slate-500 text-[11px] mt-0.5 block">Capstone &amp; term papers</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">Pending Action</span>
          <span className="text-2xl font-extrabold font-mono text-amber-600 mt-1 block">{totalPending}</span>
          <span className="text-slate-500 text-[11px] mt-0.5 block">Requires submission</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider block">Graded &amp; Cleared</span>
          <span className="text-2xl font-extrabold font-mono text-emerald-600 mt-1 block">{totalGraded}</span>
          <span className="text-slate-500 text-[11px] mt-0.5 block">Assessed by faculty</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        {[
          { id: 'all', label: `All Deliverables (${totalAssigned})` },
          { id: 'projects', label: `Projects (${totalProjects})` },
          { id: 'assignments', label: `Assignments (${totalAssigned - totalProjects})` },
          { id: 'pending', label: `Pending Submission (${totalPending})` },
          { id: 'graded', label: `Graded & Evaluated (${totalGraded})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Assignments & Projects List */}
      {filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-200 space-y-3">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No Deliverables in this Filter</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently have no assignments or projects matching the selected status.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map(asg => {
            const sub = getSubmissionForAsg(asg.id);
            const isGraded = sub?.status === 'graded';
            const isSubmitted = Boolean(sub);

            return (
              <div
                key={asg.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                  asg.isProject
                    ? 'border-indigo-200/90 hover:border-indigo-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Column: Metadata & Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-50 text-[#1e3a8a] border border-blue-200">
                        {asg.courseCode}
                      </span>
                      {asg.isProject && (
                        <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          <FolderGit2 className="w-3 h-3" />
                          Major Project
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium">
                        {asg.courseTitle}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>{asg.title}</span>
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {asg.projectBrief || asg.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Due Date: <strong className="text-slate-800">{asg.dueDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>Total Points: <strong className="text-slate-800">{asg.totalPoints} pts</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Format: <strong className="text-slate-800">{asg.submissionType || 'File Upload'}</strong></span>
                      </div>
                    </div>

                    {/* Graded Feedback Box */}
                    {isGraded && sub && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-emerald-600" />
                            Faculty Evaluation: {sub.score} / {sub.maxScore} points
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white">
                            {Number(sub.score) >= 90 ? 'Grade A' : Number(sub.score) >= 80 ? 'Grade B' : 'Grade C'}
                          </span>
                        </div>
                        {sub.feedback && (
                          <p className="text-emerald-700/90 text-xs leading-relaxed flex items-start gap-1.5 pt-1">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
                            <span><strong>Remarks:</strong> {sub.feedback}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Pending review info */}
                    {!isGraded && isSubmitted && sub && (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          <span>Submitted on {sub.submittedDate} ({sub.fileAttachment || 'solution.pdf'}) • Awaiting instructor grading</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 shrink-0">
                    {!isSubmitted ? (
                      <button
                        onClick={() => setSelectedAsgForSubmit(asg)}
                        id={`btn-submit-${asg.id}`}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Solution</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedAsgForSubmit(asg)}
                        className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Resubmit Solution</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenClassroom(asg.courseId)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Course Classroom</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAsgForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden text-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-[#1e3a8a]">
                  {selectedAsgForSubmit.courseCode}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  Submit Deliverable: {selectedAsgForSubmit.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAsgForSubmit(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitDeliverable} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-800">Due Date:</span>
                  <span>{selectedAsgForSubmit.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-800">Max Points:</span>
                  <span>{selectedAsgForSubmit.totalPoints} pts</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Document / Solution File Name
                </label>
                <input
                  type="text"
                  value={submissionFileName}
                  onChange={e => setSubmissionFileName(e.target.value)}
                  placeholder={`e.g., ${currentUser.name.replace(/\s+/g, '_')}_${selectedAsgForSubmit.title.replace(/\s+/g, '_')}.pdf`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Acceptable formats: PDF, DOCX, XLSX, ZIP.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Submission Remarks or Cloud Solution Link
                </label>
                <textarea
                  rows={4}
                  value={submissionNote}
                  onChange={e => setSubmissionNote(e.target.value)}
                  placeholder="Provide executive summary, methodologies employed, or links to shared cloud repository / slides..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-red-500 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedAsgForSubmit(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit to Faculty</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
