import React, { useState, useEffect } from 'react';
import {
  AppState,
  ActiveTab,
  UserRoleMode,
  CianPunchState,
  Project,
  Task,
  LeaveRequest,
  Employee,
  Deal,
  Language
} from './types';
import {
  fetchAppState,
  clockInAPI,
  clockOutAPI,
  toggleBreakAPI,
  createProjectAPI,
  createTaskAPI,
  toggleTaskCompleteAPI,
  logTaskTimeAPI,
  setTaskTimeAPI,
  createLeaveAPI,
  updateLeaveStatusAPI,
  createEmployeeAPI,
  createDealAPI,
  updateDealStageAPI,
  updateAttendanceAPI,
  addManualAttendanceAPI
} from './api/client';
import { Header } from './components/Header';
import { SidebarDrawer } from './components/SidebarDrawer';
import { DesktopSidebar } from './components/DesktopSidebar';
import { BottomNav } from './components/BottomNav';
import { ClockInOutScreen } from './components/ClockInOutScreen';
import { ShiftSchedulesScreen } from './components/ShiftSchedulesScreen';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProjectsTasksScreen } from './components/ProjectsTasksScreen';
import { SalesScreen } from './components/SalesScreen';
import { ExportReportsScreen } from './components/ExportReportsScreen';
import { EmployeesScreen } from './components/EmployeesScreen';
import { AttendanceScreen } from './components/AttendanceScreen';
import { DepartmentsScreen } from './components/DepartmentsScreen';
import { LeaveScreen } from './components/LeaveScreen';
import { LocationsScreen } from './components/LocationsScreen';
import { LoginScreen } from './components/LoginScreen';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { translations } from './i18n/translations';
import { Mic, Sparkles } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [roleMode, setRoleMode] = useState<UserRoleMode>('employee');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>('light');
  const [lang, setLang] = useState<Language>('en');

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        if (parsed.role === 'admin') setRoleMode('admin');
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Handle dark mode class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // Handle language and Khmer font on HTML root and body
  useEffect(() => {
    document.documentElement.lang = lang;
    if (lang === 'km') {
      document.documentElement.classList.add('font-khmer');
      document.body.classList.add('font-khmer');
    } else {
      document.documentElement.classList.remove('font-khmer');
      document.body.classList.remove('font-khmer');
    }
  }, [lang]);

  // Load state from backend on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAppState();
        setAppState(data);
      } catch (err) {
        console.error('Failed to load initial state:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Handlers for Clock In / Out
  const handleClockIn = async (location: string, notes: string) => {
    try {
      const res = await clockInAPI(location, notes);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cianPunchState: res.cianPunchState,
          attendanceRecords: [res.record, ...prev.attendanceRecords],
          metrics: {
            ...prev.metrics,
            workingNow: prev.metrics.workingNow + 1,
            presentToday: prev.metrics.presentToday + 1
          }
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleClockOut = async (notes: string) => {
    try {
      const res = await clockOutAPI(notes);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cianPunchState: res.cianPunchState,
          attendanceRecords: prev.attendanceRecords.map(r =>
            r.employeeId === 'emp_cian' && !r.clockOut ? res.record : r
          ),
          metrics: {
            ...prev.metrics,
            workingNow: Math.max(0, prev.metrics.workingNow - 1)
          }
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBreak = async (type: 'short' | 'lunch') => {
    try {
      const res = await toggleBreakAPI(type);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          cianPunchState: res.cianPunchState
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAttendance = async (id: string, data: any) => {
    try {
      const res = await updateAttendanceAPI(id, data);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          attendanceRecords: prev.attendanceRecords.map(r => (r.id === id ? res.record : r))
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddManualAttendance = async (data: any) => {
    try {
      const res = await addManualAttendanceAPI(data);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          attendanceRecords: [res.record, ...prev.attendanceRecords]
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Projects & Tasks Handlers
  const handleCreateProject = async (projData: Partial<Project>) => {
    try {
      const res = await createProjectAPI(projData);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          projects: [res.project, ...prev.projects]
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const res = await createTaskAPI(taskData);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: [res.task, ...prev.tasks]
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTaskComplete = async (taskId: string) => {
    try {
      const res = await toggleTaskCompleteAPI(taskId);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t => (t.id === taskId ? res.task : t))
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogTaskTime = async (taskId: string, minutes: number) => {
    try {
      const res = await logTaskTimeAPI(taskId, minutes);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t => (t.id === taskId ? res.task : t))
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetTaskTime = async (taskId: string, loggedMinutes: number) => {
    try {
      const res = await setTaskTimeAPI(taskId, loggedMinutes);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t => (t.id === taskId ? res.task : t))
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Sales Handlers
  const handleCreateDeal = async (dealData: Partial<Deal>) => {
    try {
      const res = await createDealAPI(dealData);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          salesDeals: res.deals || [res.deal, ...prev.salesDeals]
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateDealStage = async (dealId: string, stage: Deal['stage']) => {
    try {
      const res = await updateDealStageAPI(dealId, stage);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          salesDeals: prev.salesDeals.map(d => (d.id === dealId ? { ...d, stage } : d))
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Leave Handlers
  const handleCreateLeave = async (leaveData: Partial<LeaveRequest>) => {
    try {
      const res = await createLeaveAPI(leaveData);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          leaveRequests: [res.leave, ...prev.leaveRequests]
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLeaveStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await updateLeaveStatusAPI(id, status);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          leaveRequests: prev.leaveRequests.map(l => (l.id === id ? res.leave : l))
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Employees Handler
  const handleCreateEmployee = async (empData: Partial<Employee>) => {
    try {
      const res = await createEmployeeAPI(empData);
      setAppState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          employees: [...prev.employees, res.employee],
          metrics: {
            ...prev.metrics,
            totalEmployees: prev.metrics.totalEmployees + 1
          }
        };
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Sign out handler
  const handleSignOut = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
  };

  const toggleLanguage = () => {
    setLang(l => (l === 'en' ? 'km' : 'en'));
  };

  if (loading || !appState) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center animate-pulse">
            <span className="text-white font-extrabold text-lg">ML</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">Marketing Landmark</p>
          <p className="text-xs text-slate-400">Loading Workforce, Sales & AI Engine...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show LoginScreen
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'admin') setRoleMode('admin');
        }}
        lang={lang}
        onToggleLang={toggleLanguage}
      />
    );
  }

  const t = translations[lang];

  // Derive Screen Title
  let screenTitle = t.dashboard;
  if (activeTab === 'clock') screenTitle = t.clockInOut;
  else if (activeTab === 'shifts') screenTitle = t.shiftSchedules;
  else if (activeTab === 'projects') screenTitle = t.projectsTasks;
  else if (activeTab === 'sales') screenTitle = t.salesManagement;
  else if (activeTab === 'reports') screenTitle = t.exportReports;
  else if (activeTab === 'employees') screenTitle = t.employees;
  else if (activeTab === 'attendance') screenTitle = t.attendance;
  else if (activeTab === 'departments') screenTitle = t.departments;
  else if (activeTab === 'leave') screenTitle = t.leave;
  else if (activeTab === 'locations') screenTitle = t.locations;

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return roleMode === 'admin' ? (
          <AdminDashboard
            metrics={appState.metrics}
            recentAttendance={appState.attendanceRecords}
            onNavigateTab={setActiveTab}
            lang={lang}
          />
        ) : (
          <EmployeeDashboard
            punchState={appState.cianPunchState}
            onNavigateTab={setActiveTab}
            onRequestLeave={() => setActiveTab('leave')}
            lang={lang}
          />
        );
      case 'clock':
        return (
          <ClockInOutScreen
            punchState={appState.cianPunchState}
            attendanceHistory={appState.attendanceRecords}
            locations={appState.locations}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            onToggleBreak={handleToggleBreak}
            onUpdateAttendance={handleUpdateAttendance}
            lang={lang}
          />
        );
      case 'shifts':
        return (
          <ShiftSchedulesScreen
            shifts={appState.weeklyShifts}
            onBackToDashboard={() => setActiveTab('dashboard')}
            lang={lang}
          />
        );
      case 'projects':
        return (
          <ProjectsTasksScreen
            projects={appState.projects}
            tasks={appState.tasks}
            employees={appState.employees}
            onCreateProject={handleCreateProject}
            onCreateTask={handleCreateTask}
            onToggleTaskComplete={handleToggleTaskComplete}
            onLogTaskTime={handleLogTaskTime}
            onSetTaskTime={handleSetTaskTime}
            lang={lang}
          />
        );
      case 'sales':
        return (
          <SalesScreen
            deals={appState.salesDeals || []}
            lang={lang}
            onCreateDeal={handleCreateDeal}
            onUpdateStage={handleUpdateDealStage}
          />
        );
      case 'reports':
        return <ExportReportsScreen lang={lang} />;
      case 'employees':
        return (
          <EmployeesScreen
            employees={appState.employees}
            onCreateEmployee={handleCreateEmployee}
            lang={lang}
          />
        );
      case 'attendance':
        return (
          <AttendanceScreen
            records={appState.attendanceRecords}
            onUpdateRecord={handleUpdateAttendance}
            onAddRecord={handleAddManualAttendance}
            lang={lang}
          />
        );
      case 'departments':
        return <DepartmentsScreen departments={appState.departments} lang={lang} />;
      case 'leave':
        return (
          <LeaveScreen
            requests={appState.leaveRequests}
            roleMode={roleMode}
            onRequestLeave={handleCreateLeave}
            onUpdateStatus={handleUpdateLeaveStatus}
            lang={lang}
          />
        );
      case 'locations':
        return <LocationsScreen locations={appState.locations} lang={lang} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col antialiased">
      {/* Permanent Fixed Desktop Sidebar for Full Width View */}
      <DesktopSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        roleMode={roleMode}
        onToggleRoleMode={() => setRoleMode(roleMode === 'admin' ? 'employee' : 'admin')}
        theme={theme}
        onSetTheme={setTheme}
        lang={lang}
        onToggleLang={toggleLanguage}
        onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
        onSignOut={handleSignOut}
        currentUser={currentUser}
      />

      {/* Main Content Area (Spans full width, indented on desktop) */}
      <div className="lg:pl-72 flex-1 flex flex-col w-full min-h-screen">
        {/* Global App Header */}
        <Header
          title={screenTitle}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          roleMode={roleMode}
          onToggleRoleMode={() => setRoleMode(roleMode === 'admin' ? 'employee' : 'admin')}
          lang={lang}
          onToggleLang={toggleLanguage}
          onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
          onSignOut={handleSignOut}
          currentUser={currentUser}
        />

        {/* Slide-out Menu Drawer for Mobile / Small screens */}
        <SidebarDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          roleMode={roleMode}
          onToggleRoleMode={() => setRoleMode(roleMode === 'admin' ? 'employee' : 'admin')}
          theme={theme}
          onSetTheme={setTheme}
          lang={lang}
          onToggleLang={toggleLanguage}
          onOpenVoiceAssistant={() => setIsVoiceOpen(true)}
          onSignOut={handleSignOut}
        />

        {/* Screen Viewport with Full Width Content Layout */}
        <main className="flex-1 w-full bg-slate-50 dark:bg-slate-950 transition-colors">
          {renderActiveScreen()}
        </main>

        {/* Bottom Persistent Navigation Bar (Mobile only) */}
        <div className="lg:hidden">
          <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} lang={lang} />
        </div>
      </div>

      {/* Floating Action Button for Voice Assistant (Quick Access) */}
      <div className="fixed bottom-20 sm:bottom-8 right-6 z-40">
        <button
          onClick={() => setIsVoiceOpen(true)}
          aria-label="Open Voice Assistant"
          className="w-13 h-13 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/35 hover:scale-105 active:scale-95 flex items-center justify-center transition-all group"
          title={t.voiceAssistant}
        >
          <Mic className="w-6 h-6 animate-pulse" />
          <span className="sr-only">{t.voiceAssistant}</span>
        </button>
      </div>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        lang={lang}
        onStateUpdated={(projects, tasks) => {
          setAppState(prev => (prev ? { ...prev, projects, tasks } : prev));
        }}
      />
    </div>
  );
}
