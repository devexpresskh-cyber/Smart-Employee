import React, { useState } from 'react';
import {
  CalendarCheck,
  MapPin,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock4,
  Pencil,
  Plus,
  X,
  RotateCcw,
  Check
} from 'lucide-react';
import { AttendanceRecord, Language } from '../types';
import { translations } from '../i18n/translations';

interface AttendanceScreenProps {
  records: AttendanceRecord[];
  lang?: Language;
  onUpdateRecord?: (recordId: string, data: Partial<AttendanceRecord>) => Promise<void>;
  onAddRecord?: (data: Partial<AttendanceRecord>) => Promise<void>;
}

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  records,
  lang = 'en',
  onUpdateRecord,
  onAddRecord
}) => {
  const t = translations[lang];
  const [filter, setFilter] = useState<'all' | 'on_time' | 'late' | 'overtime'>('all');
  const [search, setSearch] = useState('');

  // Editing attendance record state
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editClockIn, setEditClockIn] = useState('');
  const [editClockOut, setEditClockOut] = useState('');
  const [editHours, setEditHours] = useState('8');
  const [editMinutes, setEditMinutes] = useState('0');
  const [editStatus, setEditStatus] = useState<'on_time' | 'late' | 'overtime'>('on_time');
  const [editNotes, setEditNotes] = useState('');

  // Manual record modal state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualName, setManualName] = useState('Cian');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualClockIn, setManualClockIn] = useState('09:00 AM');
  const [manualClockOut, setManualClockOut] = useState('05:00 PM');
  const [manualHours, setManualHours] = useState('8');
  const [manualMinutes, setManualMinutes] = useState('0');
  const [manualNotes, setManualNotes] = useState('');

  const filtered = records.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false;
    if (
      search &&
      !r.employeeName.toLowerCase().includes(search.toLowerCase()) &&
      !r.location.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleOpenEdit = (rec: AttendanceRecord) => {
    setEditingRecord(rec);
    setEditClockIn(rec.clockIn || '09:00 AM');
    setEditClockOut(rec.clockOut || '05:00 PM');
    const h = Math.floor(rec.totalMinutes / 60);
    const m = rec.totalMinutes % 60;
    setEditHours(String(h > 0 ? h : 8));
    setEditMinutes(String(m));
    setEditStatus(rec.status || 'on_time');
    setEditNotes(rec.notes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !onUpdateRecord) return;
    const h = Math.max(0, parseInt(editHours, 10) || 0);
    const m = Math.max(0, Math.min(59, parseInt(editMinutes, 10) || 0));
    const totalMins = h * 60 + m;

    await onUpdateRecord(editingRecord.id, {
      clockIn: editClockIn,
      clockOut: editClockOut,
      totalMinutes: totalMins,
      status: editStatus,
      notes: editNotes
    });
    setEditingRecord(null);
  };

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddRecord) return;
    const h = Math.max(0, parseInt(manualHours, 10) || 0);
    const m = Math.max(0, Math.min(59, parseInt(manualMinutes, 10) || 0));
    const totalMins = h * 60 + m;

    await onAddRecord({
      employeeName: manualName,
      date: manualDate,
      clockIn: manualClockIn,
      clockOut: manualClockOut,
      totalMinutes: totalMins,
      notes: manualNotes,
      status: 'on_time'
    });
    setShowManualModal(false);
  };

  const adjustEditTime = (deltaMins: number) => {
    const current = (parseInt(editHours, 10) || 0) * 60 + (parseInt(editMinutes, 10) || 0);
    const nextVal = Math.max(0, current + deltaMins);
    setEditHours(String(Math.floor(nextVal / 60)));
    setEditMinutes(String(nextVal % 60));
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'on_time':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            {t.onTimeStatus}
          </span>
        );
      case 'late':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3 h-3" />
            {t.lateStatus}
          </span>
        );
      case 'overtime':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800">
            <Clock4 className="w-3 h-3" />
            {t.overtimeStatus}
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
            {t.inProgress}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-full px-4 sm:px-8 py-5 pb-24 max-w-6xl mx-auto w-full">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.attendanceLedger}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.realtimeWorkforceLogs}
          </p>
        </div>

        {onAddRecord && (
          <button
            onClick={() => setShowManualModal(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.manualAttendanceRecord}</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.all} ({records.length})
          </button>
          <button
            onClick={() => setFilter('on_time')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter === 'on_time'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.onTimeStatus}
          </button>
          <button
            onClick={() => setFilter('late')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter === 'late'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.lateStatus}
          </button>
          <button
            onClick={() => setFilter('overtime')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filter === 'overtime'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t.overtimeStatus}
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.searchAttendance}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
          />
        </div>
      </div>

      {/* Attendance Ledger List / Table */}
      <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
          {filtered.map(rec => (
            <div
              key={rec.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-extrabold text-sm flex items-center justify-center shrink-0">
                  {rec.employeeName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {rec.employeeName}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {rec.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{rec.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/60">
                <div className="text-left sm:text-right">
                  <div className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200">
                    <span className="text-slate-400 font-normal mr-1">{t.clockInTime}:</span>
                    {rec.clockIn}
                    {rec.clockOut ? (
                      <>
                        <span className="text-slate-400 font-normal mx-1">-</span>
                        <span className="text-slate-400 font-normal mr-1">{t.clockOutTime}:</span>
                        {rec.clockOut}
                      </>
                    ) : (
                      <span className="ml-1 text-emerald-500 font-sans font-bold text-[11px] animate-pulse">
                        ({t.inProgress})
                      </span>
                    )}
                  </div>
                  {rec.totalMinutes > 0 && (
                    <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                      {t.totalHoursWorked}: {(rec.totalMinutes / 60).toFixed(1)} hrs ({rec.totalMinutes}m)
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="shrink-0">{getStatusBadge(rec.status)}</div>

                  {/* Edit Hours & Minutes Button */}
                  {onUpdateRecord && (
                    <button
                      onClick={() => handleOpenEdit(rec)}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors"
                      title={t.editAttendanceRecord}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-sm">
              {t.noAttendanceFound}
            </div>
          )}
        </div>
      </div>

      {/* Edit Attendance Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.editAttendanceRecord}
                  </h3>
                  <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                    {editingRecord.employeeName} · {editingRecord.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              {/* Clock In & Clock Out Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t.clockInTime}
                  </label>
                  <input
                    type="text"
                    value={editClockIn}
                    onChange={e => setEditClockIn(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t.clockOutTime}
                  </label>
                  <input
                    type="text"
                    value={editClockOut}
                    onChange={e => setEditClockOut(e.target.value)}
                    placeholder="05:00 PM"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Total Hours & Minutes Stepper */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {t.editHoursMinutes}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Hours */}
                  <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-1">
                    <button
                      type="button"
                      onClick={() => adjustEditTime(-60)}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center justify-center shadow-xs"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={editHours}
                      onChange={e => setEditHours(e.target.value)}
                      className="w-full text-center bg-transparent font-mono font-bold text-sm text-slate-800 dark:text-white focus:outline-none"
                    />
                    <span className="text-[11px] font-bold text-slate-400 mr-2">{t.hoursLabel}</span>
                    <button
                      type="button"
                      onClick={() => adjustEditTime(60)}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center justify-center shadow-xs"
                    >
                      +
                    </button>
                  </div>

                  {/* Minutes */}
                  <div className="flex items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-1">
                    <button
                      type="button"
                      onClick={() => adjustEditTime(-5)}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center justify-center shadow-xs"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={editMinutes}
                      onChange={e => setEditMinutes(e.target.value)}
                      className="w-full text-center bg-transparent font-mono font-bold text-sm text-slate-800 dark:text-white focus:outline-none"
                    />
                    <span className="text-[11px] font-bold text-slate-400 mr-2">{t.minutesLabel}</span>
                    <button
                      type="button"
                      onClick={() => adjustEditTime(5)}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center justify-center shadow-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Status and Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={e => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="on_time">{t.onTimeStatus}</option>
                  <option value="late">{t.lateStatus}</option>
                  <option value="overtime">{t.overtimeStatus}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t.shiftNotes}
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
                >
                  {t.saveAttendance}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Attendance Record Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.manualAttendanceRecord}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Record work hours and minutes directly
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManual} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Employee
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={manualDate}
                  onChange={e => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t.clockInTime}
                  </label>
                  <input
                    type="text"
                    value={manualClockIn}
                    onChange={e => setManualClockIn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {t.clockOutTime}
                  </label>
                  <input
                    type="text"
                    value={manualClockOut}
                    onChange={e => setManualClockOut(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Hours & Minutes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t.totalHoursWorked} ({t.hoursLabel} & {t.minutesLabel})
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={manualHours}
                      onChange={e => setManualHours(e.target.value)}
                      className="w-full bg-transparent text-xs font-mono font-bold"
                    />
                    <span className="text-[11px] text-slate-400 font-bold ml-1">{t.hoursLabel}</span>
                  </div>
                  <div className="flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={manualMinutes}
                      onChange={e => setManualMinutes(e.target.value)}
                      className="w-full bg-transparent text-xs font-mono font-bold"
                    />
                    <span className="text-[11px] text-slate-400 font-bold ml-1">{t.minutesLabel}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                  {t.shiftNotes}
                </label>
                <input
                  type="text"
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  placeholder="e.g. Off-site client photography session"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
                >
                  {t.saveAttendance}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
