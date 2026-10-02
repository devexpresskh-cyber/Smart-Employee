import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  KeyRound,
  Clock,
  Building,
  MapPin,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Radio,
  RefreshCw,
  Search,
  Activity,
  Server,
  Lock,
  ChevronRight,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { Language, AppState } from '../types';
import { translations } from '../i18n/translations';
import {
  fetchAdminOverviewAPI,
  fetchAuditLogsAPI,
  fetchAccountsAPI,
  createAdminAccountAPI,
  updateAdminAccountAPI,
  deleteAdminAccountAPI,
  updateAccountPasswordAPI,
  deleteAttendanceAPI,
  bulkApproveAttendanceAPI,
  addManualAttendanceAPI,
  updateAttendanceAPI,
  createShiftAPI,
  deleteShiftAPI,
  createDepartmentAPI,
  deleteDepartmentAPI,
  createLocationAPI,
  deleteLocationAPI,
  broadcastAnnouncementAPI
} from '../api/client';

interface AdminManagementHubProps {
  appState: AppState;
  onRefreshState: () => void;
  lang?: Language;
}

export const AdminManagementHub: React.FC<AdminManagementHubProps> = ({
  appState,
  onRefreshState,
  lang = 'en'
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'attendance' | 'shifts' | 'departments' | 'audits'>('overview');

  // Backend Overview & Audit State
  const [overview, setOverview] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Sub-forms
  const [isNewAccountOpen, setIsNewAccountOpen] = useState(false);
  const [isManualPunchOpen, setIsManualPunchOpen] = useState(false);
  const [isNewShiftOpen, setIsNewShiftOpen] = useState(false);
  const [isNewDeptOpen, setIsNewDeptOpen] = useState(false);
  const [isNewLocationOpen, setIsNewLocationOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [resetPassAccount, setResetPassAccount] = useState<any | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);

  // New Account Form State
  const [accName, setAccName] = useState('');
  const [accPhone, setAccPhone] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accEmail, setAccEmail] = useState('');
  const [accRole, setAccRole] = useState<'employee' | 'admin'>('employee');
  const [accDept, setAccDept] = useState('Marketing');
  const [accRate, setAccRate] = useState(50);

  // Manual Punch Form State
  const [punchEmpId, setPunchEmpId] = useState('emp_cian');
  const [punchDate, setPunchDate] = useState(new Date().toISOString().split('T')[0]);
  const [punchClockIn, setPunchClockIn] = useState('09:00 AM');
  const [punchClockOut, setPunchClockOut] = useState('05:00 PM');
  const [punchLocation, setPunchLocation] = useState('Marketing Landmark HQ (ភ្នំពេញ)');
  const [punchStatus, setPunchStatus] = useState<'on_time' | 'late' | 'overtime'>('on_time');

  // New Shift Form State
  const [shiftEmpId, setShiftEmpId] = useState('emp_cian');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [shiftDay, setShiftDay] = useState('Mon');
  const [shiftStart, setShiftStart] = useState('9:00 AM');
  const [shiftEnd, setShiftEnd] = useState('5:00 PM');
  const [shiftLoc, setShiftLoc] = useState('Marketing Landmark HQ (ភ្នំពេញ)');

  // New Dept Form State
  const [deptName, setDeptName] = useState('');
  const [deptBudget, setDeptBudget] = useState(60000);
  const [deptLead, setDeptLead] = useState('');

  // New Location Form State
  const [locName, setLocName] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [locRadius, setLocRadius] = useState(150);

  // Broadcast Message State
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const loadData = async () => {
    try {
      const [over, logs, accs] = await Promise.all([
        fetchAdminOverviewAPI().catch(() => null),
        fetchAuditLogsAPI().catch(() => ({ logs: [] })),
        fetchAccountsAPI().catch(() => ({ accounts: [] }))
      ]);
      if (over) setOverview(over);
      if (logs) setAuditLogs(logs.logs || []);
      if (accs) setAccounts(accs.accounts || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerNotice = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Handlers
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAdminAccountAPI({
        name: accName,
        phone: accPhone,
        password: accPassword,
        role: accRole,
        email: accEmail,
        department: accDept,
        hourlyRate: accRate
      });
      triggerNotice('success', `Created account for ${accName}`);
      setIsNewAccountOpen(false);
      setAccName('');
      setAccPhone('');
      setAccPassword('');
      setAccEmail('');
      loadData();
      onRefreshState();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the account for ${name}?`)) return;
    try {
      await deleteAdminAccountAPI(id);
      triggerNotice('success', `Deleted account for ${name}`);
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to delete account');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassAccount) return;
    try {
      await updateAccountPasswordAPI(resetPassAccount.id, newPasswordVal);
      triggerNotice('success', `Password for ${resetPassAccount.name} successfully updated!`);
      setResetPassAccount(null);
      setNewPasswordVal('');
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to update password');
    }
  };

  const handleManualPunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const emp = appState.employees.find(e => e.id === punchEmpId);
      await addManualAttendanceAPI({
        employeeId: punchEmpId,
        employeeName: emp?.name || 'Staff',
        date: punchDate,
        clockIn: punchClockIn,
        clockOut: punchClockOut,
        location: punchLocation,
        status: punchStatus,
        notes: `Admin manual punch on ${punchDate}`
      });
      triggerNotice('success', `Logged manual attendance for ${emp?.name}`);
      setIsManualPunchOpen(false);
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to add attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttendance = async (id: string) => {
    if (!window.confirm('Delete this attendance punch record?')) return;
    try {
      await deleteAttendanceAPI(id);
      triggerNotice('success', 'Attendance record deleted');
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to delete attendance');
    }
  };

  const handleBulkApprove = async () => {
    try {
      const res = await bulkApproveAttendanceAPI();
      triggerNotice('success', `Bulk approved ${res.approvedCount} completed time records!`);
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to bulk approve');
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShiftAPI({
        employeeId: shiftEmpId,
        date: shiftDate,
        dayName: shiftDay,
        startTime: shiftStart,
        endTime: shiftEnd,
        location: shiftLoc
      });
      triggerNotice('success', 'New shift scheduled successfully');
      setIsNewShiftOpen(false);
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to create shift');
    }
  };

  const handleDeleteShift = async (id: string) => {
    if (!window.confirm('Delete this scheduled shift?')) return;
    try {
      await deleteShiftAPI(id);
      triggerNotice('success', 'Shift deleted');
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to delete shift');
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDepartmentAPI({
        name: deptName,
        budget: deptBudget,
        lead: deptLead || 'Department Lead'
      });
      triggerNotice('success', `Created department ${deptName}`);
      setIsNewDeptOpen(false);
      setDeptName('');
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to create department');
    }
  };

  const handleDeleteDept = async (name: string) => {
    if (!window.confirm(`Delete department ${name}?`)) return;
    try {
      await deleteDepartmentAPI(name);
      triggerNotice('success', `Deleted department ${name}`);
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to delete department');
    }
  };

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLocationAPI({
        name: locName,
        address: locAddress,
        radiusMeters: locRadius
      });
      triggerNotice('success', `Added location ${locName}`);
      setIsNewLocationOpen(false);
      setLocName('');
      setLocAddress('');
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to add location');
    }
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    if (!window.confirm(`Delete office site ${name}?`)) return;
    try {
      await deleteLocationAPI(id);
      triggerNotice('success', `Deleted location ${name}`);
      onRefreshState();
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to delete location');
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    try {
      await broadcastAnnouncementAPI(broadcastMsg, 'high');
      triggerNotice('success', 'Broadcast notice sent to all team members!');
      setIsBroadcastOpen(false);
      setBroadcastMsg('');
      loadData();
    } catch (err: any) {
      triggerNotice('error', err.message || 'Failed to broadcast');
    }
  };

  const filteredAccounts = accounts.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.phone.includes(searchQuery) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-5 pb-24 max-w-7xl mx-auto w-full select-none">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t.adminHub}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Engine</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Full administrative operations, credentials management, attendance corrections, and system audit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBroadcastOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>{lang === 'km' ? 'ផ្សព្វផ្សាយសារ' : 'Broadcast Notice'}</span>
          </button>

          <button
            onClick={() => {
              loadData();
              onRefreshState();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 active:scale-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lang === 'km' ? 'ធ្វើបច្ចុប្បន្នភាព' : 'Sync All'}</span>
          </button>
        </div>
      </div>

      {/* Notice Alert */}
      {feedback && (
        <div className={`mb-5 p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
          feedback.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'overview'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{lang === 'km' ? 'ទិដ្ឋភាពប្រព័ន្ធ' : 'System Overview'}</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'accounts'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>{lang === 'km' ? 'គណនី និងពាក្យសម្ងាត់' : 'Accounts & Passwords'}</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'attendance'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{lang === 'km' ? 'កែសម្រួលវត្តមាន' : 'Attendance Logs'}</span>
        </button>

        <button
          onClick={() => setActiveTab('shifts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'shifts'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>{lang === 'km' ? 'រៀបចំវេនការងារ' : 'Shift Allocation'}</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'departments'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>{lang === 'km' ? 'នាយកដ្ឋាន និងទីតាំង' : 'Dept & Locations'}</span>
        </button>

        <button
          onClick={() => setActiveTab('audits')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeTab === 'audits'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>{lang === 'km' ? 'កំណត់ហេតុសវនកម្ម' : 'Audit Logs'}</span>
        </button>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Server Engine Health Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Server Health
              </div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <span>Healthy 100%</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Uptime: {overview?.system?.uptime || 'Active'}
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Node Environment
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                {overview?.system?.nodeVersion || 'v22.x'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                RAM: {overview?.system?.memoryUsageMb || '45'} MB used
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Total Registered Accounts
              </div>
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                {overview?.counts?.totalAccounts || accounts.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {overview?.counts?.adminCount || 1} Admins · {overview?.counts?.staffCount || 1} Staff
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Attendance Records
              </div>
              <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
                {appState.attendanceRecords.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {appState.metrics.workingNow} currently on shift
              </div>
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20">
            <div className="max-w-xl">
              <h3 className="text-base font-extrabold mb-1">
                {lang === 'km' ? 'ផ្ទាំងបញ្ជាប្រតិបត្តិការរហ័សរបស់អ្នកគ្រប់គ្រង' : 'Administrator Quick Action Console'}
              </h3>
              <p className="text-xs text-blue-100 mb-4">
                Execute workforce changes, verify employee attendance records, reset staff passwords, or assign new shift hours instantly.
              </p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setIsNewAccountOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? 'បង្កើតគណនីបុគ្គលិកថ្មី' : 'Create Staff Account'}</span>
                </button>

                <button
                  onClick={() => setIsManualPunchOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-500/30 hover:bg-blue-500/50 text-white border border-white/20 text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? 'កត់ត្រាវត្តមានដោយដៃ' : 'Log Manual Punch'}</span>
                </button>

                <button
                  onClick={handleBulkApprove}
                  className="px-3.5 py-2 rounded-xl bg-blue-500/30 hover:bg-blue-500/50 text-white border border-white/20 text-xs font-bold active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{lang === 'km' ? 'អនុម័តវត្តមានទាំងអស់' : 'Bulk Approve Records'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER ACCOUNTS & PASSWORDS */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder={lang === 'km' ? 'ស្វែងរកគណនី...' : 'Search accounts by name or phone...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </div>

            <button
              onClick={() => setIsNewAccountOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'km' ? 'បង្កើតគណនីថ្មី' : 'Add New Account'}</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-700/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{lang === 'km' ? 'ឈ្មោះ' : 'Name'}</th>
                    <th className="py-3 px-4">{lang === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone'}</th>
                    <th className="py-3 px-4">{lang === 'km' ? 'អ៊ីមែល' : 'Email'}</th>
                    <th className="py-3 px-4">{lang === 'km' ? 'តួនាទី' : 'Role'}</th>
                    <th className="py-3 px-4 text-right">{lang === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredAccounts.map(acc => (
                    <tr key={acc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {acc.name.charAt(0)}
                          </div>
                          <span>{acc.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {acc.phone}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        {acc.email}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          acc.role === 'admin'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                        }`}>
                          {acc.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setResetPassAccount(acc);
                              setNewPasswordVal('');
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAccount(acc.id, acc.name)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE CORRECTIONS */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'km' ? 'បញ្ជីវត្តមាន និងការកែសម្រួល' : 'Attendance Log Management'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'km' ? 'គ្រប់គ្រងម៉ោងចូល/ចេញ និងកែសម្រួលស្ថានភាពវត្តមាន' : 'Inspect, correct timestamps, or remove punches'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkApprove}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Bulk Approve</span>
              </button>
              <button
                onClick={() => setIsManualPunchOpen(true)}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manual Punch</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-700/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{lang === 'km' ? 'បុគ្គលិក' : 'Employee'}</th>
                    <th className="py-3 px-4">{lang === 'km' ? 'កាលបរិច្ឆេទ' : 'Date'}</th>
                    <th className="py-3 px-4">{lang === 'km' ? 'ម៉ោងចូល / ចេញ' : 'In / Out'}</th>
                    <th className="py-3 px-4">{lang === 'km' ? 'ម៉ោងសរុប' : 'Total Hours'}</th>
                    <th className="py-3 px-4">{lang === 'km' ? 'ស្ថានភាព' : 'Status'}</th>
                    <th className="py-3 px-4 text-right">{lang === 'km' ? 'សកម្មភាព' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appState.attendanceRecords.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {r.employeeName}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {r.date}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {r.clockIn} → {r.clockOut || (
                          <span className="text-emerald-500 font-bold">Active</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {(r.totalMinutes / 60).toFixed(1)} hrs
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          r.status === 'on_time'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : r.status === 'late'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                        }`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteAttendance(r.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete punch record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SHIFT SCHEDULER */}
      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {lang === 'km' ? 'កាលវិភាគវេនការងារ' : 'Weekly Shifts & Allocation'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'km' ? 'ចាត់ចែងម៉ោងចូលធ្វើការសម្រាប់បុគ្គលិក' : 'Allocate shifts and working times across the team'}
              </p>
            </div>

            <button
              onClick={() => setIsNewShiftOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === 'km' ? 'បន្ថែមវេនការងារ' : 'Add Shift'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {appState.weeklyShifts.map(s => {
              const emp = appState.employees.find(e => e.id === s.employeeId);
              return (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
                        {s.dayName} · {s.date}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {s.hours} Hours
                      </span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {emp?.name || 'Staff Member'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.startTime} - {s.endTime}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.location}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex justify-end">
                    <button
                      onClick={() => handleDeleteShift(s.id)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: DEPARTMENTS & LOCATIONS */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Departments Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span>{lang === 'km' ? 'នាយកដ្ឋាន' : 'Departments'}</span>
              </h3>
              <button
                onClick={() => setIsNewDeptOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Dept</span>
              </button>
            </div>

            <div className="space-y-2">
              {appState.departments.map(d => (
                <div
                  key={d.name}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between shadow-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      {d.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Lead: {d.lead} · Budget: ${d.budget.toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDept(d.name)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Locations Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'km' ? 'ទីតាំងការងារ (Geofence)' : 'Work Locations & Geofence'}</span>
              </h3>
              <button
                onClick={() => setIsNewLocationOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Location</span>
              </button>
            </div>

            <div className="space-y-2">
              {appState.locations.map(loc => (
                <div
                  key={loc.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between shadow-xs"
                >
                  <div className="min-w-0 flex-1 mr-2">
                    <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {loc.address} · Radius: {loc.radiusMeters}m
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteLocation(loc.id, loc.name)}
                    className="p-1 text-slate-400 hover:text-rose-500 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {activeTab === 'audits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {lang === 'km' ? 'កំណត់ហេតុសវនកម្មប្រព័ន្ធ' : 'Real-time System Audit Trail'}
            </h3>
            <span className="text-xs text-slate-400">
              Showing recent administrative events
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-700/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{lang === 'km' ? 'ពេលវេលា' : 'Timestamp'}</th>
                    <th className="py-3 px-4">{lang === 'km' ? 'សកម្មភាព' : 'Action'}</th>
                    <th className="py-3 px-4">{lang === 'km' ? 'អនុវត្តដោយ' : 'Performed By'}</th>
                    <th className="py-3 px-4">{lang === 'km' ? 'ព័ត៌មានលម្អិត' : 'Details'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-sans font-semibold">
                        {log.performedBy}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-sans">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ACCOUNT */}
      {isNewAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {lang === 'km' ? 'បង្កើតគណនីបុគ្គលិកថ្មី' : 'Create Staff User Account'}
            </h3>
            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samnang Tech"
                  value={accName}
                  onChange={e => setAccName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Phone Number (Login ID)</label>
                <input
                  type="tel"
                  required
                  placeholder="+855 12 333 444"
                  value={accPhone}
                  onChange={e => setAccPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Account Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 4 characters"
                  value={accPassword}
                  onChange={e => setAccPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Role</label>
                  <select
                    value={accRole}
                    onChange={e => setAccRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="employee">Staff</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Department</label>
                  <select
                    value={accDept}
                    onChange={e => setAccDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewAccountOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/25"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {resetPassAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Reset Password for {resetPassAccount.name}
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">{resetPassAccount.phone}</p>
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div className="relative">
                <input
                  type={showPasswordText ? 'text' : 'password'}
                  required
                  placeholder="Enter new password (min 4 chars)"
                  value={newPasswordVal}
                  onChange={e => setNewPasswordVal(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordText(!showPasswordText)}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetPassAccount(null)}
                  className="px-3 py-1.5 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL PUNCH */}
      {isManualPunchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Add Manual Attendance Punch
            </h3>
            <form onSubmit={handleManualPunch} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Select Employee</label>
                <select
                  value={punchEmpId}
                  onChange={e => setPunchEmpId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                >
                  {appState.employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={punchDate}
                    onChange={e => setPunchDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select
                    value={punchStatus}
                    onChange={e => setPunchStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="on_time">ON TIME</option>
                    <option value="late">LATE</option>
                    <option value="overtime">OVERTIME</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Clock In Time</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 AM"
                    value={punchClockIn}
                    onChange={e => setPunchClockIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Clock Out Time</label>
                  <input
                    type="text"
                    placeholder="05:00 PM"
                    value={punchClockOut}
                    onChange={e => setPunchClockOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsManualPunchOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  Save Punch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BROADCAST ANNOUNCEMENT */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-500" />
              <span>Broadcast Notice to Staff</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Sends a high-priority announcement to all employees across the mobile app and dashboard.
            </p>
            <form onSubmit={handleBroadcast} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="e.g. Mandatory all-hands meeting scheduled for tomorrow at 10:00 AM..."
                value={broadcastMsg}
                onChange={e => setBroadcastMsg(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SHIFT */}
      {isNewShiftOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Allocate Shift Schedule
            </h3>
            <form onSubmit={handleCreateShift} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Employee</label>
                <select
                  value={shiftEmpId}
                  onChange={e => setShiftEmpId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold"
                >
                  {appState.employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Day Name</label>
                  <select
                    value={shiftDay}
                    onChange={e => setShiftDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Mon">Monday</option>
                    <option value="Tue">Tuesday</option>
                    <option value="Wed">Wednesday</option>
                    <option value="Thu">Thursday</option>
                    <option value="Fri">Friday</option>
                    <option value="Sat">Saturday</option>
                    <option value="Sun">Sunday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={shiftDate}
                    onChange={e => setShiftDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    placeholder="9:00 AM"
                    value={shiftStart}
                    onChange={e => setShiftStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    placeholder="5:00 PM"
                    value={shiftEnd}
                    onChange={e => setShiftEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewShiftOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  Allocate Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DEPARTMENT */}
      {isNewDeptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Add Department</h3>
            <form onSubmit={handleCreateDept} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Dept Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Public Relations"
                  value={deptName}
                  onChange={e => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Budget ($)</label>
                <input
                  type="number"
                  required
                  value={deptBudget}
                  onChange={e => setDeptBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewDeptOpen(false)}
                  className="px-3 py-1.5 rounded-xl border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD LOCATION */}
      {isNewLocationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Add Work Site / Geofence</h3>
            <form onSubmit={handleCreateLocation} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Site Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Branch Siem Reap"
                  value={locName}
                  onChange={e => setLocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street / City"
                  value={locAddress}
                  onChange={e => setLocAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Geofence Radius (meters)</label>
                <input
                  type="number"
                  required
                  value={locRadius}
                  onChange={e => setLocRadius(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewLocationOpen(false)}
                  className="px-3 py-1.5 rounded-xl border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Save Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
