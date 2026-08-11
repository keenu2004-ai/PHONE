import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { attendanceApi } from '../services/api';
import { Attendance } from '../types';
import { useToast } from '../components/toast/ToastContext';
import { offlineSync } from '../services/offlineSync';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Navigation
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { currentUser } = useUserStore();
  const { showSuccess, showError } = useToast();

  const [todayRecord, setTodayRecord] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [history, setHistory] = useState<Attendance[]>([]);

  useEffect(() => {
    loadAttendanceData();
  }, [currentUser]);

  const loadAttendanceData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const records = await attendanceApi.getAll(currentUser.id);
      setHistory(records);

      const todayStr = new Date().toDateString();
      const activeToday = records.find(
        (r: Attendance) => r.date && new Date(r.date).toDateString() === todayStr && !r.clock_out
      );

      setTodayRecord(activeToday || null);
    } catch (err: any) {
      console.warn('Could not load attendance records:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceClick = () => {
    setActionLoading(true);

    if (!navigator.geolocation) {
      showError('Geolocation is not supported by your browser', 'GPS Error');
      setActionLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          if (!todayRecord) {
            // Check In Flow
            if (!navigator.onLine) {
              offlineSync.queueCheckIn(currentUser?.id || '', latitude, longitude);
              showSuccess(
                'Internet unavailable. Check-in saved offline & will auto-sync when online!',
                'Offline Check-In Saved'
              );
            } else {
              const newRecord = await attendanceApi.clockIn({
                lat: latitude,
                lng: longitude,
              });
              setTodayRecord(newRecord);
              showSuccess('Successfully clocked in for today!', 'Check-In Success');
            }
          } else {
            // Check Out Flow
            await attendanceApi.clockOut({
              attendance_id: todayRecord.id,
            });
            setTodayRecord(null);
            showSuccess('Successfully clocked out! Have a great evening.', 'Check-Out Success');
          }
          await loadAttendanceData();
        } catch (err: any) {
          showError(err.message || 'Failed to submit attendance request', 'Action Failed');
        } finally {
          setActionLoading(false);
        }
      },
      (geoError) => {
        setActionLoading(false);
        showError(
          `GPS Location acquisition failed: ${geoError.message}. Please enable location permissions.`,
          'GPS Location Required'
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const isClockedIn = Boolean(todayRecord);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-blue-600" /> Attendance Action Module
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Mobile-first GPS clock-in dial for recording verified shift timestamp & location.
          </p>
        </div>
      </div>

      {/* Main Massive Circular Action Button Section */}
      <div className="teamnest-card p-8 md:p-12 text-center flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-blue-600" /> Verified Geolocation System
        </div>

        {/* Large Centered Circular Action Button */}
        <div className="relative my-4">
          <div
            className={`absolute -inset-4 rounded-full opacity-30 animate-pulse blur-xl transition-all ${
              isClockedIn ? 'bg-red-500' : 'bg-emerald-500'
            }`}
          />

          <button
            onClick={handleAttendanceClick}
            disabled={actionLoading || loading}
            className={`relative w-48 h-48 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center text-white font-black transition-all transform active:scale-95 disabled:opacity-50 shadow-2xl ${
              isClockedIn
                ? 'bg-gradient-to-br from-red-500 via-red-600 to-rose-700 shadow-red-600/40 hover:from-red-600 hover:to-red-800'
                : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-emerald-600/40 hover:from-emerald-600 hover:to-teal-800'
            }`}
          >
            {actionLoading ? (
              <RefreshCw className="w-12 h-12 animate-spin text-white mb-2" />
            ) : isClockedIn ? (
              <LogOut className="w-12 h-12 text-white mb-2" />
            ) : (
              <CheckCircle2 className="w-12 h-12 text-white mb-2" />
            )}

            <span className="text-xl md:text-2xl font-black tracking-tight">
              {actionLoading
                ? 'Acquiring GPS...'
                : isClockedIn
                ? 'Check Out'
                : 'Check In'}
            </span>

            <span className="text-[11px] font-bold text-white/80 mt-1">
              {isClockedIn ? 'End Active Shift' : 'Start Today Shift'}
            </span>
          </button>
        </div>

        {/* Status Callout Card */}
        <div className="max-w-sm w-full p-4 rounded-xl border bg-slate-50 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-500">Current Shift Status:</span>
          {isClockedIn && todayRecord?.clock_in ? (
            <span className="badge badge-present px-3 py-1 rounded-full text-xs">
              Clocked In ({new Date(todayRecord.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </span>
          ) : (
            <span className="badge badge-pending px-3 py-1 rounded-full text-xs">
              Not Clocked In Today
            </span>
          )}
        </div>
      </div>

      {/* History Log Table */}
      <div className="teamnest-card p-6">
        <h3 className="font-black text-base text-slate-900 mb-4">Recent Shift Logs</h3>
        {loading ? (
          <div className="py-8 flex justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-xs text-slate-400 py-6 text-center">No attendance logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-black text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Clock In</th>
                  <th className="p-3">Clock Out</th>
                  <th className="p-3">Location Coordinates</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {history.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      {r.date ? new Date(r.date).toLocaleDateString() : '--'}
                    </td>
                    <td className="p-3 text-emerald-700 font-mono">
                      {r.clock_in
                        ? new Date(r.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '--'}
                    </td>
                    <td className="p-3 text-slate-600 font-mono">
                      {r.clock_out
                        ? new Date(r.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Active Shift'}
                    </td>
                    <td className="p-3 text-slate-500 font-mono flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      {r.check_in_lat?.toFixed(4)}, {r.check_in_lng?.toFixed(4)}
                    </td>
                    <td className="p-3 text-right">
                      <span className="badge badge-present text-[10px] px-2.5 py-0.5 rounded-full">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
