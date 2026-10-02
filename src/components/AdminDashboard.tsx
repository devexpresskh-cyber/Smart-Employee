import React from 'react';
import {
  Users,
  CheckCircle2,
  BarChart3,
  Umbrella,
  ArrowUpRight,
  Clock,
  Sparkles,
  TrendingUp,
  Building,
  FileSpreadsheet,
  ChevronRight,
  Shield
} from 'lucide-react';
import { AppMetrics, ActiveTab, AttendanceRecord, Language } from '../types';
import { translations } from '../i18n/translations';

interface AdminDashboardProps {
  metrics: AppMetrics;
  recentAttendance: AttendanceRecord[];
  onNavigateTab: (tab: ActiveTab) => void;
  lang?: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  metrics,
  recentAttendance,
  onNavigateTab,
  lang = 'en'
}) => {
  const t = translations[lang];

  const weeklyTrendData = [
    { day: t.mon, percent: 92, count: 8 },
    { day: t.tue, percent: 89, count: 8 },
    { day: t.wed, percent: 95, count: 9 },
    { day: t.thu, percent: 88, count: 8 },
    { day: t.fri, percent: 82, count: 7 },
    { day: t.sat, percent: 30, count: 2 },
    { day: t.sun, percent: 10, count: 1 }
  ];

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-5 pb-24 max-w-6xl mx-auto w-full">
      {/* Header Greeting matching screenshot 6 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-blue-500/20">
          M
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>{t.goodAfternoon}</span>
            <span>👋</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
            {t.companyName}
          </h2>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
            {t.companyName} · {lang === 'km' ? 'អ្នកគ្រប់គ្រងប្រព័ន្ធ' : 'Company Admin'}
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('admin_hub')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0"
        >
          <Shield className="w-4 h-4 text-amber-200" />
          <span>{lang === 'km' ? 'មជ្ឈមណ្ឌលគ្រប់គ្រង Back-End' : 'Admin Back-End Control'}</span>
        </button>
      </div>

      {/* 4-col Metric KPI Grid matching screenshot 6 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Card 1: Total Employees */}
        <div
          onClick={() => onNavigateTab('employees')}
          className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs cursor-pointer hover:border-blue-200 transition-colors"
        >
          <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
            {metrics.totalEmployees}
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
            {t.totalEmployees}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {metrics.workingNow} {t.workingNow}
          </div>
        </div>

        {/* Card 2: Present Today */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs cursor-pointer hover:border-emerald-200 transition-colors"
        >
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
            {metrics.presentToday}
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
            {t.presentToday}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            + {metrics.lateToday} {t.late}
          </div>
        </div>

        {/* Card 3: Attendance Rate */}
        <div
          onClick={() => onNavigateTab('attendance')}
          className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs cursor-pointer hover:border-amber-200 transition-colors"
        >
          <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-3">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
            {metrics.attendanceRate}
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
            {t.attendanceRate}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {lang === 'km' ? 'អត្រាថ្ងៃនេះ' : 'Today\'s rate'}
          </div>
        </div>

        {/* Card 4: On Leave */}
        <div
          onClick={() => onNavigateTab('leave')}
          className="p-4 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs cursor-pointer hover:border-yellow-200 transition-colors"
        >
          <div className="w-9 h-9 rounded-2xl bg-amber-100/50 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-300 mb-3">
            <Umbrella className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
            {metrics.onLeaveToday}
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
            {t.onLeave}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {metrics.attendanceBreakdown.absent} {t.absent}
          </div>
        </div>
      </div>

      {/* Today's Attendance Breakdown matching screenshot 6 */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.todaysAttendance}</h3>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
          >
            <span>{t.viewAll}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3.5">
          {/* Present Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-600 dark:text-slate-400">{t.present}</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {metrics.attendanceBreakdown.present}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (metrics.attendanceBreakdown.present / metrics.totalEmployees) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Late Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-600 dark:text-slate-400">{t.late}</span>
              <span className="font-bold font-mono text-amber-600 dark:text-amber-400">
                {metrics.attendanceBreakdown.late}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (metrics.attendanceBreakdown.late / metrics.totalEmployees) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Absent Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-600 dark:text-slate-400">{t.absent}</span>
              <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
                {metrics.attendanceBreakdown.absent}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (metrics.attendanceBreakdown.absent / metrics.totalEmployees) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* On Leave Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-600 dark:text-slate-400">{t.onLeave}</span>
              <span className="font-bold font-mono text-amber-500 dark:text-amber-400">
                {metrics.attendanceBreakdown.onLeave}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (metrics.attendanceBreakdown.onLeave / metrics.totalEmployees) * 100)}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trend Chart matching screenshot 6 */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 shadow-xs mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.weeklyTrend}</h4>
            <p className="text-[11px] text-slate-400">{lang === 'km' ? 'វត្តមានក្រុមជាមធ្យម ៨៨.៤%' : 'Average team presence 88.4%'}</p>
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>

        <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4 pb-2 border-b border-slate-100 dark:border-slate-700">
          {weeklyTrendData.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-[10px] font-mono text-slate-400">{d.percent}%</span>
              <div
                className="w-full max-w-[20px] bg-blue-500/80 dark:bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600"
                style={{ height: `${d.percent}%` }}
              />
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {d.day}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Operations Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onNavigateTab('reports')}
          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.exportReports}</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        <button
          onClick={() => onNavigateTab('projects')}
          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.projectsTasks}</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
