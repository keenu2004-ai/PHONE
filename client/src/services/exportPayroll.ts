import { userApi, attendanceApi, leaveApi } from './api';

export const exportWeeklyPayroll = async (): Promise<void> => {
  // Fetch users, attendance, and leaves
  const [users, attendances, leaves] = await Promise.all([
    userApi.getAll(),
    attendanceApi.getAll(),
    leaveApi.getAll(),
  ]);

  // Calculate past 7 days range
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Filter records within past 7 days
  const recentAttendances = attendances.filter((a) => new Date(a.date) >= sevenDaysAgo);
  const recentApprovedLeaves = leaves.filter(
    (l) => l.status === 'APPROVED' && new Date(l.start_date) >= sevenDaysAgo
  );

  // Build CSV Header
  const csvRows = [
    ['Employee Name', 'Email', 'Role', 'Total Shifts Logged', 'Estimated Hours Worked', 'Approved Leave Days'],
  ];

  // Calculate metrics per user
  for (const user of users) {
    const userAtt = recentAttendances.filter((a) => a.user_id === user.id);
    const userLeaves = recentApprovedLeaves.filter((l) => l.user_id === user.id);

    // Calculate hours worked (estimate 8 hours per clock_in if clock_out missing, or exact diff)
    let totalHours = 0;
    for (const att of userAtt) {
      if (att.clock_in && att.clock_out) {
        const diffMs = new Date(att.clock_out).getTime() - new Date(att.clock_in).getTime();
        totalHours += diffMs / (1000 * 60 * 60);
      } else if (att.clock_in) {
        totalHours += 8; // standard shift default
      }
    }

    csvRows.push([
      `"${user.full_name}"`,
      `"${user.email}"`,
      `"${user.role}"`,
      userAtt.length.toString(),
      totalHours.toFixed(1),
      userLeaves.length.toString(),
    ]);
  }

  // Convert array to CSV string
  const csvContent = csvRows.map((e) => e.join(',')).join('\n');

  // Create Blob & trigger browser download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `teamnest_weekly_payroll_${now.toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
