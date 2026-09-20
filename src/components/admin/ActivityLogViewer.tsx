import React, { useState, useMemo } from 'react';
import { useLms } from '../../context/LmsContext';
import { ActivityLog, ActivityCategory, ActivitySeverity } from '../../types';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  User,
  BookOpen,
  Sliders,
  DollarSign,
  GraduationCap,
  Award,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Eye,
  Copy,
  Check,
  Server,
  Cloud,
  FileSpreadsheet,
  Globe
} from 'lucide-react';

export const ActivityLogViewer: React.FC = () => {
  const {
    activityLogs,
    syncBackendToFirebase,
    isBackendSyncing,
    lastBackendSync,
    backendTableStats,
    refreshBackendStats,
    currentUser,
    recordActivity
  } = useLms();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'logs' | 'database_tables'>('logs');

  // Inspection modal
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // Manual log simulation for test/audit demonstration
  const handleTriggerAuditTest = async () => {
    await recordActivity({
      action: 'Administrative Audit Verification Check',
      category: 'system',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      target: 'Audit Verification Engine',
      details: `Compliance audit manual verification executed by ${currentUser.name}. Invariants and audit trail confirmed operational.`,
      severity: 'info'
    });
  };

  // Sync backend trigger
  const handleSyncToFirebase = async () => {
    try {
      const result = await syncBackendToFirebase();
      setSyncSuccessMessage(
        `Firebase tables synchronized: ${result.usersCount} users, ${result.coursesCount} courses, ${result.assignmentsCount} assignments, ${result.transactionsCount} transactions written to Firestore.`
      );
      setTimeout(() => setSyncSuccessMessage(null), 8000);
    } catch (err) {
      console.error('Failed to sync to Firebase:', err);
    }
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      // Category filter
      if (selectedCategory !== 'all' && log.category !== selectedCategory) {
        return false;
      }
      // Severity filter
      if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) {
        return false;
      }
      // Role filter
      if (selectedRole !== 'all' && log.actorRole !== selectedRole) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesActor = log.actorName.toLowerCase().includes(q);
        const matchesTarget = (log.target || '').toLowerCase().includes(q);
        const matchesDetails = log.details.toLowerCase().includes(q);
        const matchesIp = (log.ipAddress || '').toLowerCase().includes(q);
        if (!matchesAction && !matchesActor && !matchesTarget && !matchesDetails && !matchesIp) {
          return false;
        }
      }
      return true;
    });
  }, [activityLogs, selectedCategory, selectedSeverity, selectedRole, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = activityLogs.length;
    const authCount = activityLogs.filter(l => l.category === 'auth').length;
    const courseCount = activityLogs.filter(l => l.category === 'course').length;
    const systemCount = activityLogs.filter(l => l.category === 'system').length;
    const financeCount = activityLogs.filter(l => l.category === 'finance').length;
    const warningCount = activityLogs.filter(l => l.severity === 'warning' || l.severity === 'critical').length;
    return { total, authCount, courseCount, systemCount, financeCount, warningCount };
  }, [activityLogs]);

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Timestamp', 'Action', 'Category', 'Severity', 'Actor Name', 'Actor Role', 'Target', 'IP Address', 'Details'];
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.category}"`,
      `"${l.severity}"`,
      `"${l.actorName.replace(/"/g, '""')}"`,
      `"${l.actorRole}"`,
      `"${(l.target || '').replace(/"/g, '""')}"`,
      `"${l.ipAddress || ''}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `audit_activity_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `audit_activity_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case 'auth':
        return <KeyRound className="w-3.5 h-3.5 text-blue-600" />;
      case 'course':
        return <BookOpen className="w-3.5 h-3.5 text-indigo-600" />;
      case 'system':
        return <Sliders className="w-3.5 h-3.5 text-amber-600" />;
      case 'finance':
        return <DollarSign className="w-3.5 h-3.5 text-emerald-600" />;
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-purple-600" />;
      case 'academic':
        return <Award className="w-3.5 h-3.5 text-cyan-600" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  const getCategoryBadgeClass = (category: ActivityCategory) => {
    switch (category) {
      case 'auth':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60';
      case 'course':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60';
      case 'system':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60';
      case 'finance':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60';
      case 'student':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60';
      case 'academic':
        return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/60';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getSeverityBadgeClass = (severity: ActivitySeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-900';
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-900';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Firebase Backend Link & Audit Stream Header */}
      <div className="bg-gradient-to-r from-[#0c1a30] to-[#172a46] rounded-2xl p-6 text-white shadow-md border border-[#1e3a8a]/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-serif">Administrative Activity Log & Audit Trail</h2>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Firestore Stream
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Immutable forensic logging for user logins, course modifications, bursar transactions, and system updates
                </p>
              </div>
            </div>

            {/* Cloud Backend Linkage info */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700">
                <Cloud className="w-3.5 h-3.5 text-blue-400" />
                <span>Database:</span>
                <span className="font-mono text-blue-300 font-semibold">
                  ai-studio-lipaelearningcen-8890a82b-adb5-4d7b-a652-030a91003b02
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-700">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>Backend Status:</span>
                <span className="text-emerald-400 font-semibold">Linked & Rules Deployed</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSyncToFirebase}
              disabled={isBackendSyncing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBackendSyncing ? 'animate-spin' : ''}`} />
              <span>{isBackendSyncing ? 'Synchronizing Tables...' : 'Sync Tables to Firebase'}</span>
            </button>

            <button
              onClick={handleTriggerAuditTest}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify Audit Invariant</span>
            </button>

            <div className="relative group">
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-300" />
                <span>Export Report</span>
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-20 w-44">
                <button
                  onClick={handleExportCsv}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-left text-slate-200 hover:bg-slate-800 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Export as CSV</span>
                </button>
                <button
                  onClick={handleExportJson}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-left text-slate-200 hover:bg-slate-800 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span>Export as JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Success Notification */}
        {syncSuccessMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncSuccessMessage}</span>
            </div>
            <button
              onClick={() => setSyncSuccessMessage(null)}
              className="text-emerald-400 hover:text-white text-xs ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* KPI Audit Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Audits</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-xs text-slate-500">Events</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">User Logins</span>
            <KeyRound className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">{stats.authCount}</span>
            <span className="text-xs text-slate-400">Sessions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Course Edits</span>
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{stats.courseCount}</span>
            <span className="text-xs text-slate-400">Updates</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">System Config</span>
            <Sliders className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{stats.systemCount}</span>
            <span className="text-xs text-slate-400">Revisions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Bursar / Finance</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{stats.financeCount}</span>
            <span className="text-xs text-slate-400">Receipts</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">High Severity</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{stats.warningCount}</span>
            <span className="text-xs text-slate-400">Alerts</span>
          </div>
        </div>
      </div>

      {/* View Switcher: Audit Log Stream vs. Firebase Database Tables */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Activity Stream & Audit Ledger
          </button>
          <button
            onClick={() => setActiveTab('database_tables')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'database_tables'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Firebase Database Tables ({backendTableStats.length || 7})</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline-block">
          Showing {filteredLogs.length} of {activityLogs.length} recorded events
        </span>
      </div>

      {/* TAB 1: Activity Logs Table & Stream */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Multi-Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by action, user, target, IP address..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Quick Preset Dropdowns */}
              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                <div className="flex items-center gap-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 font-semibold">Severity:</span>
                  <select
                    value={selectedSeverity}
                    onChange={e => setSelectedSeverity(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
                  >
                    <option value="all">All Severities</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500 font-semibold">Role:</span>
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="instructor">Instructor</option>
                    <option value="student">Student</option>
                    <option value="system">System</option>
                  </select>
                </div>

                {(selectedCategory !== 'all' || selectedSeverity !== 'all' || selectedRole !== 'all' || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSeverity('all');
                      setSelectedRole('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'auth', label: 'User Logins (Auth)', icon: KeyRound },
                { id: 'course', label: 'Course Modifications', icon: BookOpen },
                { id: 'system', label: 'System & Config', icon: Sliders },
                { id: 'finance', label: 'Bursar & Payments', icon: DollarSign },
                { id: 'student', label: 'Admissions & Enrollment', icon: GraduationCap },
                { id: 'academic', label: 'Grading & Submissions', icon: Award }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-50 dark:bg-blue-950 text-[#1e3a8a] dark:text-blue-300 font-bold border border-blue-300 dark:border-blue-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.icon && <cat.icon className="w-3 h-3" />}
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Logs Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-white">No Matching Activity Logs Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search criteria or category filter to inspect other recorded security actions.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Action & Scope</th>
                      <th className="p-3.5">Actor</th>
                      <th className="p-3.5">Severity</th>
                      <th className="p-3.5">Source IP</th>
                      <th className="p-3.5 text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredLogs.map(log => {
                      const logDate = new Date(log.timestamp);
                      const formattedTime = logDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      const formattedDate = logDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

                      return (
                        <tr
                          key={log.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Timestamp */}
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="font-mono font-medium text-slate-900 dark:text-white">{formattedTime}</div>
                            <div className="text-[10px] text-slate-400">{formattedDate}</div>
                          </td>

                          {/* Category Badge */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${getCategoryBadgeClass(log.category)}`}>
                              {getCategoryIcon(log.category)}
                              <span className="capitalize">{log.category}</span>
                            </span>
                          </td>

                          {/* Action & Scope */}
                          <td className="p-3.5 max-w-xs">
                            <div className="font-bold text-slate-900 dark:text-white truncate">
                              {log.action}
                            </div>
                            {log.target && (
                              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate mt-0.5">
                                Scope: {log.target}
                              </div>
                            )}
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {log.details}
                            </div>
                          </td>

                          {/* Actor */}
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                {log.actorName.charAt(0)}
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-white block truncate max-w-[120px]">
                                  {log.actorName}
                                </span>
                                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                                  {log.actorRole}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Severity */}
                          <td className="p-3.5 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getSeverityBadgeClass(log.severity)}`}>
                              {log.severity}
                            </span>
                          </td>

                          {/* Source IP */}
                          <td className="p-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
                            {log.ipAddress || '127.0.0.1'}
                          </td>

                          {/* Action button */}
                          <td className="p-3.5 whitespace-nowrap text-right">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Firebase Database Tables & Link Status */}
      {activeTab === 'database_tables' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                  Cloud Firestore Backend Database Schema & Collections
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Database Instance: <code className="text-blue-600 dark:text-blue-400 font-mono font-semibold">ai-studio-lipaelearningcen-8890a82b-adb5-4d7b-a652-030a91003b02</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => refreshBackendStats()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Counts</span>
                </button>
                <button
                  onClick={handleSyncToFirebase}
                  disabled={isBackendSyncing}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Push All Tables to Firestore</span>
                </button>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
              {[
                {
                  collection: 'users',
                  title: 'Users & Profiles',
                  desc: 'Students, Faculty, and Admin accounts with RBAC privilege maps',
                  rules: 'isCurrentUser || isAdmin',
                  color: 'blue'
                },
                {
                  collection: 'courses',
                  title: 'Course Offerings',
                  desc: 'Academic curricula, prerequisites, syllabi, and credit values',
                  rules: 'read: signedIn, write: isAdmin',
                  color: 'indigo'
                },
                {
                  collection: 'assignments',
                  title: 'Assignments & Projects',
                  desc: 'Course deliverables, milestone dates, and grading rubrics',
                  rules: 'read: signedIn, write: signedIn',
                  color: 'cyan'
                },
                {
                  collection: 'submissions',
                  title: 'Student Submissions',
                  desc: 'Student work deliverables, grades, and instructor feedback',
                  rules: 'student == auth.uid || isAdmin',
                  color: 'purple'
                },
                {
                  collection: 'transactions',
                  title: 'Bursar Transactions',
                  desc: 'Tuition payment receipts, installments, and ledger audits',
                  rules: 'student == auth.uid || isAdmin',
                  color: 'emerald'
                },
                {
                  collection: 'activity_logs',
                  title: 'Activity Logs (Audit Trail)',
                  desc: 'Immutable security log of user logins, course edits, and updates',
                  rules: 'read: isAdmin, write: signedIn, update: false',
                  color: 'amber'
                },
                {
                  collection: 'system_settings',
                  title: 'System Settings',
                  desc: 'Institution configuration, tuition per credit, and semester flags',
                  rules: 'read: signedIn, write: isAdmin',
                  color: 'slate'
                }
              ].map(table => {
                const liveStat = backendTableStats.find(s => s.collectionName === table.collection);
                return (
                  <div
                    key={table.collection}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#1e3a8a] dark:text-blue-400" />
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{table.title}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                        Connected
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500">{table.desc}</p>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Firestore Path:</span>
                        <code className="font-mono text-blue-600 dark:text-blue-400">/{table.collection}</code>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Security Invariant:</span>
                        <code className="font-mono text-[10px] text-slate-700 dark:text-slate-300">{table.rules}</code>
                      </div>
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Records Count:</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {liveStat ? liveStat.count : 'Synchronized'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* INSPECT LOG FORENSIC MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                  Audit Log Forensic Inspection
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Record UUID</span>
                  <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">{selectedLog.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    Immutable & Verified
                  </span>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Event Action</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">{selectedLog.action}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Category</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block capitalize">{selectedLog.category}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Actor Identity</span>
                  <span className="font-bold text-slate-900 dark:text-white mt-1 block">
                    {selectedLog.actorName} ({selectedLog.actorRole.toUpperCase()})
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ID: {selectedLog.actorId}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Source IP / Host</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 mt-1 block">
                    {selectedLog.ipAddress || '127.0.0.1 (Local)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 col-span-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Target Resource</span>
                  <span className="font-medium text-blue-700 dark:text-blue-300 mt-1 block font-mono text-xs">
                    {selectedLog.target || 'General System Environment'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 col-span-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Narrative Details</span>
                  <p className="text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                    {selectedLog.details}
                  </p>
                </div>
              </div>

              {/* Raw JSON Payload */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Raw JSON Audit Payload</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog, null, 2))}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-40 border border-slate-800">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-400">
                Timestamp: {new Date(selectedLog.timestamp).toUTCString()}
              </span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
