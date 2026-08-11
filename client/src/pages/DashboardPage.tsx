import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { attendanceApi, leaveApi, holidayApi, taskApi } from '../services/api';
import { Attendance, Leave, Holiday, Task } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Gift,
  Palmtree,
  Clock,
  CheckSquare,
  Square,
  Users,
  Briefcase,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useUserStore();

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });

  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [currentWeekStart, currentUser]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [attData, leaveData, holData, taskData] = await Promise.all([
        attendanceApi.getAll(),
        leaveApi.getAll(),
        holidayApi.getAll(),
        taskApi.getAll(),
      ]);

      setAttendance(attData);
      setLeaves(leaveData);
      setHolidays(holData);
      setTasks(taskData);
    } catch (err) {
      console.error('Failed to load dashboard records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
      await taskApi.updateStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error('Failed to toggle task status:', err);
    }
  };

  const weekDays = [0, 1, 2, 3, 4].map((offset) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + offset);
    return d;
  });

  const formatDateShort = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const isSameDay = (d1: Date, d2Str: string | Date | undefined) => {
    if (!d2Str) return false;
    const d2 = new Date(d2Str);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const nextStart = new Date(currentWeekStart);
    nextStart.setDate(nextStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(nextStart);
  };

  const todayStr = new Date();
  const todayAttendance = attendance.find(
    (a) => a.user_id === currentUser?.id && isSameDay(todayStr, a.date)
  );
  const pendingLeavesCount = leaves.filter((l) => l.status === 'PENDING').length;
  const myTasksCount = tasks.filter(
    (t) => t.user_id === currentUser?.id && t.status === 'TODO'
  ).length;

  return (
    <div className="space-y-6">
      {/* Executive Hero Banner Card */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 p-6 md:p-8 text-white shadow-xl shadow-blue-600/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-bold mb-3 backdrop-blur-xs">
              <TrendingUp className="w-3.5 h-3.5 text-blue-200" />
              <span>Unified Workforce Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Welcome back, {currentUser?.full_name || 'Team Member'} 👋
            </h1>
            <p className="text-sm text-blue-100/90 mt-1 font-medium max-w-xl">
              Master Calendar view tracking shift attendance, leave requests, upcoming holidays, and team task deliverables.
            </p>
          </div>

          {/* Quick Metrics Pills */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center">
              <div className="text-xs text-blue-200 font-bold">Shift Status</div>
              <div className="text-sm font-extrabold mt-0.5 text-white">
                {todayAttendance ? (
                  <span className="text-emerald-300">Clocked In</span>
                ) : (
                  <span className="text-amber-200">Not Checked In</span>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center">
              <div className="text-xs text-blue-200 font-bold">Open Tasks</div>
              <div className="text-lg font-black mt-0.5 text-white">{myTasksCount}</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center">
              <div className="text-xs text-blue-200 font-bold">Pending Approvals</div>
              <div className="text-lg font-black mt-0.5 text-amber-200">{pendingLeavesCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigator Bar */}
      <div className="teamnest-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">
              Week of {formatDateShort(weekDays[0])} – {formatDateShort(weekDays[4])}, {currentWeekStart.getFullYear()}
            </h2>
            <p className="text-xs text-slate-500 font-semibold">5-Day Workforce Operational Schedule</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Week
          </button>

          <button
            onClick={() => setCurrentWeekStart(new Date())}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-xs transition-colors border border-blue-200/80"
          >
            Current Week
          </button>

          <button
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1 text-xs"
          >
            Next Week <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Master Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {weekDays.map((dayDate, idx) => {
          const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });

          const dayHolidays = holidays.filter((h) => isSameDay(dayDate, h.date));
          const dayLeaves = leaves.filter(
            (l) =>
              l.user_id === currentUser?.id &&
              l.status === 'APPROVED' &&
              new Date(dayDate) >= new Date(l.start_date) &&
              new Date(dayDate) <= new Date(l.end_date)
          );
          const dayAttendance = attendance.filter((a) => isSameDay(dayDate, a.date));
          const dayTasks = tasks.filter(
            (t) => t.user_id === currentUser?.id && isSameDay(dayDate, t.due_date)
          );

          const isTodayDay = isSameDay(todayStr, dayDate);

          return (
            <div
              key={idx}
              className={`teamnest-card p-4 flex flex-col justify-between space-y-4 ${
                isTodayDay ? 'ring-2 ring-blue-600 bg-blue-50/20 border-blue-200' : ''
              }`}
            >
              {/* Day Header */}
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    {dayName}
                  </span>
                  <div className="text-lg font-black text-slate-900">
                    {formatDateShort(dayDate)}
                  </div>
                </div>

                {isTodayDay && (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wide">
                    Today
                  </span>
                )}
              </div>

              {/* Day Contents */}
              <div className="space-y-2.5 flex-1 min-h-[140px]">
                {dayHolidays.map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-xl bg-sky-100 border border-sky-300 text-sky-900 flex items-center gap-2 text-xs font-extrabold shadow-xs"
                  >
                    <Gift className="w-4 h-4 text-sky-700 shrink-0" />
                    <span className="truncate">{h.name}</span>
                  </div>
                ))}

                {dayLeaves.map((l) => (
                  <div
                    key={l.id}
                    className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center gap-2 text-xs font-extrabold shadow-xs"
                  >
                    <Palmtree className="w-4 h-4 text-amber-700 shrink-0" />
                    <span className="truncate">{l.leave_type} Leave</span>
                  </div>
                ))}

                {dayAttendance.map((a) => {
                  const clockInTime = a.clock_in
                    ? new Date(a.clock_in).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--';
                  const isUserClockIn = a.user_id === currentUser?.id;

                  return (
                    <div
                      key={a.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-extrabold shadow-xs ${
                        isUserClockIn
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                          : 'bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Clock className={`w-4 h-4 ${isUserClockIn ? 'text-emerald-700' : 'text-slate-500'} shrink-0`} />
                        <span className="truncate">In: {clockInTime}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold truncate ml-1">
                        {a.user?.full_name ? a.user.full_name.split(' ')[0] : ''}
                      </span>
                    </div>
                  );
                })}

                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTask(t.id, t.status)}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2 text-xs transition-all ${
                      t.status === 'DONE'
                        ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                        : 'bg-white hover:bg-blue-50/50 border-slate-200 hover:border-blue-200 text-slate-900 font-bold shadow-xs'
                    }`}
                  >
                    {t.status === 'DONE' ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-snug">{t.title}</span>
                  </div>
                ))}

                {dayHolidays.length === 0 &&
                  dayLeaves.length === 0 &&
                  dayAttendance.length === 0 &&
                  dayTasks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400 italic py-8 border border-dashed border-slate-200 rounded-xl">
                      No scheduled events
                    </div>
                  )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span>{dayName.slice(0, 3)}</span>
                <span>{dayTasks.length} tasks</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
