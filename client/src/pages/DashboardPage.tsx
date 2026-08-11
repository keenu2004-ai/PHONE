import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { attendanceApi, leaveApi, holidayApi, taskApi } from '../services/api';
import { Attendance, Leave, Holiday, Task } from '../types';
import { Gift, Palmtree, Clock, CheckCircle2, Circle, Sparkles, RefreshCw, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useUserStore();

  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Week offset state (0 = current week, -1 = prev week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    loadDashboardData();
  }, [currentUser, weekOffset]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [attData, leaveData, holidayData, taskData] = await Promise.all([
        attendanceApi.getAll(currentUser?.id),
        leaveApi.getAll(currentUser?.id),
        holidayApi.getAll(),
        taskApi.getAll(currentUser?.id),
      ]);

      setAttendances(attData);
      setLeaves(leaveData.filter((l) => l.user_id === currentUser?.id));
      setHolidays(holidayData);
      setTasks(taskData.filter((t) => t.user_id === currentUser?.id));
    } catch (err) {
      console.error('Failed to load dashboard master calendar data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get Monday-to-Friday dates for current week offset
  const getWeekDays = (offset: number) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMonday = (dayOfWeek + 6) % 7;

    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday + offset * 7);
    monday.setHours(0, 0, 0, 0);

    const weekDays = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDays.push({
        name: dayNames[i],
        shortName: dayNames[i].substring(0, 3),
        date: date,
        dateString: date.toISOString().split('T')[0],
      });
    }

    return weekDays;
  };

  const weekDays = getWeekDays(weekOffset);

  // Task toggle handler
  const handleToggleTask = async (task: Task) => {
    const nextStatus = task.status === 'TODO' ? 'DONE' : 'TODO';
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
      );
      await taskApi.updateStatus(task.id, nextStatus);
    } catch (error) {
      // Rollback on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="teamnest-card bg-gradient-to-r from-brand-600 to-brand-700 text-white border-none p-6 md:p-8 shadow-lg shadow-brand-600/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-100 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" /> Master Calendar Dashboard
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Weekly Overview for {currentUser?.full_name}
            </h1>
            <p className="text-brand-100 text-sm mt-1 max-w-xl">
              Unified weekly schedule aggregating tasks, attendance check-ins, approved leaves, and company holidays.
            </p>
          </div>

          {/* Week Selector Controls */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs p-1.5 rounded-xl border border-white/20">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 rounded-lg bg-white/20 text-xs font-bold hover:bg-white/30 transition-colors"
            >
              This Week
            </button>
            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Unified Master Calendar Grid Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-brand-600" />
          <h2 className="font-extrabold text-lg text-gray-900">
            Week of {weekDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[4].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Aggregating schedule...
          </div>
        )}
      </div>

      {/* Master Weekly Calendar Component */}
      {/* Desktop View (>=768px): 5-Column Grid */}
      {/* Mobile View (<768px): Vertical Stack of Daily Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {weekDays.map((day) => {
          const isToday = new Date().toISOString().split('T')[0] === day.dateString;

          // 1. Attendance for this day
          const dayAttendance = attendances.find((a) => {
            const aDate = new Date(a.date).toISOString().split('T')[0];
            return aDate === day.dateString;
          });

          // 2. Company Holiday for this day
          const dayHoliday = holidays.find((h) => {
            const hDate = new Date(h.date).toISOString().split('T')[0];
            return hDate === day.dateString;
          });

          // 3. Approved Leave for this day
          const dayLeave = leaves.find((l) => {
            if (l.status !== 'APPROVED') return false;
            const startStr = new Date(l.start_date).toISOString().split('T')[0];
            const endStr = new Date(l.end_date).toISOString().split('T')[0];
            return day.dateString >= startStr && day.dateString <= endStr;
          });

          // 4. Tasks due on this day (or pending tasks assigned to user)
          const dayTasks = tasks.filter((t) => {
            const dueDateStr = new Date(t.due_date).toISOString().split('T')[0];
            return dueDateStr === day.dateString;
          });

          return (
            <div
              key={day.dateString}
              className={`teamnest-card p-4 flex flex-col justify-between min-h-[220px] transition-all ${
                isToday ? 'ring-2 ring-brand-600/40 bg-brand-50/10 shadow-md' : 'bg-white'
              }`}
            >
              {/* Day Header */}
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      {day.name}
                    </span>
                    <div className={`text-base font-extrabold tracking-tight ${isToday ? 'text-brand-600' : 'text-gray-900'}`}>
                      {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  {isToday && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                      Today
                    </span>
                  )}
                </div>

                {/* Day Content Stack (Enforce 8px / gap-2 spacing) */}
                <div className="space-y-2 flex-1">
                  {/* 1. Subtle Attendance Text String at Top */}
                  {dayAttendance && dayAttendance.clock_in && (
                    <div className="text-xs font-semibold text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200/60 flex items-center gap-1.5 mb-2">
                      <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>
                        In: {new Date(dayAttendance.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}

                  {/* 2. Holiday Pill (Full-width, solid light blue, Gift icon) */}
                  {dayHoliday && (
                    <div className="w-full bg-sky-100 border border-sky-200 text-sky-800 rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-2 shadow-xs">
                      <Gift className="w-4 h-4 text-sky-600 shrink-0" />
                      <span className="truncate">{dayHoliday.name}</span>
                    </div>
                  )}

                  {/* 3. Approved Leave Pill (Yellow/Orange, Palm Tree icon) */}
                  {dayLeave && (
                    <div className="w-full bg-amber-100 border border-amber-200 text-amber-900 rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-2 shadow-xs">
                      <Palmtree className="w-4 h-4 text-amber-700 shrink-0" />
                      <span className="truncate">{dayLeave.leave_type} (Approved)</span>
                    </div>
                  )}

                  {/* 4. Tasks Checkbox List */}
                  {dayTasks.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-0.5">Tasks</div>
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleToggleTask(t)}
                          className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100/80 border border-gray-200/70 cursor-pointer transition-colors group"
                        >
                          <button type="button" className="mt-0.5 text-gray-400 group-hover:text-brand-600 transition-colors shrink-0">
                            {t.status === 'DONE' ? (
                              <CheckCircle2 className="w-4 h-4 text-brand-600" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                          <span
                            className={`text-xs font-medium leading-tight ${
                              t.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900 font-semibold'
                            }`}
                          >
                            {t.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : !dayHoliday && !dayLeave && !dayAttendance && (
                    <div className="text-[11px] text-gray-400 italic pt-2">No scheduled events</div>
                  )}
                </div>
              </div>

              {/* Card Footer Info */}
              <div className="mt-4 pt-2 border-t border-gray-50 text-[10px] text-gray-400 font-mono flex items-center justify-between">
                <span>{day.shortName}</span>
                <span>{dayTasks.length} task{dayTasks.length === 1 ? '' : 's'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
