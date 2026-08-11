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
      {/* High-Contrast Executive Banner */}
      <div className="rounded-2xl bg-blue-700 p-6 md:p-8 text-white shadow-lg border border-blue-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black mb-3">
              <TrendingUp className="w-4 h-4 text-white stroke-[2.5]" />
              <span>Master Workforce Calendar</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Welcome back, {currentUser?.full_name || 'Team Member'} 👋
            </h1>
            <p className="text-sm text-blue-100 font-bold mt-1.5 max-w-xl">
              Track attendance shifts, leave applications, company holidays, and team task deliverables.
            </p>
          </div>

          {/* Metrics Pills with High Contrast */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white p-3 rounded-xl border border-blue-200 text-center shadow-xs">
              <div className="text-xs text-gray-700 font-extrabold">Shift Status</div>
              <div className="text-sm font-black mt-1">
                {todayAttendance ? (
                  <span className="text-emerald-700 font-black">Clocked In</span>
                ) : (
                  <span className="text-amber-800 font-black">Not Checked In</span>
                )}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-blue-200 text-center shadow-xs">
              <div className="text-xs text-gray-700 font-extrabold">Open Tasks</div>
              <div className="text-xl font-black mt-0.5 text-gray-900">{myTasksCount}</div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-blue-200 text-center shadow-xs">
              <div className="text-xs text-gray-700 font-extrabold">Pending Approvals</div>
              <div className="text-xl font-black mt-0.5 text-amber-800">{pendingLeavesCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigator Bar */}
      <div className="teamnest-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <CalendarIcon className="w-6 h-6 text-blue-800 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-black text-lg text-gray-900 tracking-tight">
              Week of {formatDateShort(weekDays[0])} – {formatDateShort(weekDays[4])}, {currentWeekStart.getFullYear()}
            </h2>
            <p className="text-xs text-gray-700 font-extrabold">5-Day Operational Workforce Schedule</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold border border-gray-300 transition-colors flex items-center gap-1 text-xs"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" /> Previous Week
          </button>

          <button
            onClick={() => setCurrentWeekStart(new Date())}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-colors shadow-sm"
          >
            Current Week
          </button>

          <button
            onClick={() => navigateWeek('next')}
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold border border-gray-300 transition-colors flex items-center gap-1 text-xs"
          >
            Next Week <ChevronRight className="w-4 h-4 stroke-[2.5]" />
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
                isTodayDay ? 'ring-2 ring-blue-600 bg-blue-50/50 border-blue-400' : ''
              }`}
            >
              {/* Day Header */}
              <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-gray-700">
                    {dayName}
                  </span>
                  <div className="text-lg font-black text-gray-900">
                    {formatDateShort(dayDate)}
                  </div>
                </div>

                {isTodayDay && (
                  <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider">
                    Today
                  </span>
                )}
              </div>

              {/* Day Contents / Pill Items */}
              <div className="space-y-2.5 flex-1 min-h-[140px]">
                {/* 1. Holidays Pill */}
                {dayHolidays.map((h) => (
                  <div
                    key={h.id}
                    className="p-2.5 rounded-xl bg-sky-100 border border-sky-300 text-sky-950 flex items-center gap-2 text-xs font-black shadow-xs"
                  >
                    <Gift className="w-4 h-4 text-sky-800 shrink-0 stroke-[2.5]" />
                    <span className="truncate">{h.name}</span>
                  </div>
                ))}

                {/* 2. Approved Leaves Pill */}
                {dayLeaves.map((l) => (
                  <div
                    key={l.id}
                    className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 flex items-center gap-2 text-xs font-black shadow-xs"
                  >
                    <Palmtree className="w-4 h-4 text-amber-800 shrink-0 stroke-[2.5]" />
                    <span className="truncate">{l.leave_type} Leave</span>
                  </div>
                ))}

                {/* 3. Attendance Clock-in Pill */}
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
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-black shadow-xs ${
                        isUserClockIn
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-950'
                          : 'bg-gray-100 border-gray-300 text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Clock className={`w-4 h-4 ${isUserClockIn ? 'text-emerald-800' : 'text-gray-700'} shrink-0 stroke-[2.5]`} />
                        <span className="truncate">In: {clockInTime}</span>
                      </div>
                      <span className="text-xs text-gray-700 font-extrabold truncate ml-1">
                        {a.user?.full_name ? a.user.full_name.split(' ')[0] : ''}
                      </span>
                    </div>
                  );
                })}

                {/* 4. Interactive Tasks */}
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => handleToggleTask(t.id, t.status)}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-start gap-2 text-xs transition-all ${
                      t.status === 'DONE'
                        ? 'bg-gray-100 border-gray-300 text-gray-700 line-through font-bold'
                        : 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-400 text-gray-900 font-extrabold shadow-xs'
                    }`}
                  >
                    {t.status === 'DONE' ? (
                      <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 stroke-[2.5]" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-700 shrink-0 mt-0.5 stroke-[2.5]" />
                    )}
                    <span className="leading-snug">{t.title}</span>
                  </div>
                ))}

                {/* Empty State */}
                {dayHolidays.length === 0 &&
                  dayLeaves.length === 0 &&
                  dayAttendance.length === 0 &&
                  dayTasks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-gray-600 font-bold italic py-8 border border-dashed border-gray-300 rounded-xl">
                      No scheduled events
                    </div>
                  )}
              </div>

              {/* Day Footer */}
              <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs font-extrabold text-gray-700">
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
