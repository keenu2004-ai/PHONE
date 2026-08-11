import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/useUserStore';
import { attendanceApi } from '../services/api';
import { Attendance } from '../types';
import { useToast } from '../components/toast/ToastContext';
import { offlineSync } from '../services/offlineSync';
import { Clock, MapPin, CheckCircle2, AlertCircle, RefreshCw, Navigation, WifiOff } from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const { currentUser } = useUserStore();
  const { showSuccess, showError } = useToast();

  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Geolocation & offline status
  const [locationStatus, setLocationStatus] = useState<string>('Ready for GPS check-in');

  useEffect(() => {
    if (!currentUser) return;
    loadAttendance();
  }, [currentUser]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await attendanceApi.getAll();
      setRecords(data);
    } catch (err: any) {
      showError(err.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const todayRecord = records.find((r) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const recDateStr = new Date(r.date).toISOString().split('T')[0];
    return recDateStr === todayStr && r.user_id === currentUser?.id;
  });

  const isClockedIn = Boolean(todayRecord && todayRecord.clock_in && !todayRecord.clock_out);

  const handleToggleClock = async () => {
    setActionLoading(true);
    setLocationStatus('Acquiring high-accuracy GPS coordinates...');

    // Offline Resilience Fallback Check
    if (!navigator.onLine) {
      if (!currentUser?.id) {
        showError('User session unavailable for offline check-in');
        setActionLoading(false);
        return;
      }
      // Store in localStorage queue
      offlineSync.queueCheckIn(currentUser.id, 37.7749, -122.4194);
      showSuccess(
        'Check-in saved offline! Will automatically sync to database when internet reconnects.',
        'Offline Mode Active'
      );
      setLocationStatus('Queued in offline storage');
      setActionLoading(false);
      return;
    }

    // Browser Geolocation API
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocationStatus(`GPS Locked: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          await executeClockAction(lat, lng);
        },
        async (error) => {
          showError(`GPS Notice: ${error.message}. Using default location.`, 'Location Permission');
          setLocationStatus('GPS Fallback (Base Location)');
          await executeClockAction(37.7749, -122.4194);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      showError('Geolocation is not supported by your browser', 'GPS Error');
      await executeClockAction(37.7749, -122.4194);
    }
  };

  const executeClockAction = async (lat: number, lng: number) => {
    try {
      if (isClockedIn) {
        await attendanceApi.clockOut({ attendance_id: todayRecord?.id });
        showSuccess(`Clocked out successfully at ${new Date().toLocaleTimeString()}`, 'Shift Ended');
      } else {
        await attendanceApi.clockIn({ lat, lng });
        showSuccess(`Clocked in successfully at ${new Date().toLocaleTimeString()}`, 'Check-In Recorded');
      }
      await loadAttendance();
    } catch (err: any) {
      // If network fails during request, trigger offline queue
      if (!navigator.onLine && currentUser?.id) {
        offlineSync.queueCheckIn(currentUser.id, lat, lng);
        showSuccess('Saved check-in to offline storage queue', 'Network Disconnected');
      } else {
        showError(err.message || 'Clock action failed', 'API Error');
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Attendance Check-In</h1>
        <p className="text-sm text-gray-500 mt-1">
          Mobile-first GPS & offline-resilient check-in for <span className="font-bold text-gray-900">{currentUser?.full_name}</span>
        </p>
      </div>

      {/* Big Circular Clock Button */}
      <div className="teamnest-card p-8 md:p-12 flex flex-col items-center justify-center text-center shadow-md">
        {/* GPS / Network Status Badge */}
        <div className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-bold text-gray-600">
          {!navigator.onLine ? (
            <WifiOff className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <Navigation className={`w-3.5 h-3.5 ${isClockedIn ? 'text-red-500 animate-pulse' : 'text-emerald-500'}`} />
          )}
          <span>{!navigator.onLine ? 'Offline Mode (Local Auto-Sync Active)' : locationStatus}</span>
        </div>

        {/* Circular Dial Button */}
        <button
          onClick={handleToggleClock}
          disabled={actionLoading}
          className={`group relative w-56 h-56 md:w-64 md:h-64 rounded-full flex flex-col items-center justify-center text-white transition-all transform active:scale-95 shadow-xl ${
            isClockedIn
              ? 'bg-gradient-to-tr from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-red-500/30 ring-8 ring-red-100'
              : 'bg-gradient-to-tr from-emerald-600 via-brand-600 to-brand-700 hover:from-emerald-700 hover:to-brand-800 shadow-brand-600/30 ring-8 ring-brand-100'
          } ${actionLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          <div className="absolute inset-2 rounded-full border-2 border-white/20 pointer-events-none" />

          {actionLoading ? (
            <RefreshCw className="w-12 h-12 animate-spin mb-2" />
          ) : (
            <Clock className="w-14 h-14 md:w-16 md:h-16 mb-2 group-hover:scale-110 transition-transform" />
          )}

          <span className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {actionLoading ? 'Processing...' : isClockedIn ? 'Check Out' : 'Check In'}
          </span>

          <span className="text-xs text-white/80 font-medium mt-1">
            {isClockedIn ? 'Tap to end shift' : 'Tap to record shift entry'}
          </span>
        </button>
      </div>

      {/* Attendance History Audit Log */}
      <div className="teamnest-card p-6">
        <h3 className="font-extrabold text-base text-gray-900 mb-4 flex items-center justify-between">
          <span>Recent Attendance Logs</span>
          <span className="text-xs font-mono text-gray-400">{records.length} Total Records</span>
        </h3>
        {loading ? (
          <div className="py-8 flex justify-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Clock In</th>
                  <th className="p-3.5">Clock Out</th>
                  <th className="p-3.5">GPS Location</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img src={r.user?.avatar_url || currentUser?.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                      <span className="font-bold text-gray-900">{r.user?.full_name || currentUser?.full_name}</span>
                    </td>
                    <td className="p-3.5 text-gray-600">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="p-3.5 font-bold text-emerald-600">
                      {r.clock_in ? new Date(r.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                    </td>
                    <td className="p-3.5 font-bold text-red-500">
                      {r.clock_out ? new Date(r.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                    </td>
                    <td className="p-3.5 text-xs text-gray-500 font-mono flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      {r.check_in_lat ? `${r.check_in_lat.toFixed(2)}, ${r.check_in_lng?.toFixed(2)}` : 'Office Base'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        r.status === 'PRESENT' ? 'badge-present' : 'badge-absent'
                      }`}>
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
