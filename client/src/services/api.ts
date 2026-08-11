import { Attendance, Expense, Holiday, Leave, Task, User } from '../types';

const API_BASE = '/api';

// Helper to make fetch requests with JSON headers and error handling
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

// Global helper to extract current user_id from store or fallback parameter
let currentUserIdGetter: () => string | null = () => null;

export const setUserIdGetter = (getter: () => string | null) => {
  currentUserIdGetter = getter;
};

const getActiveUserId = (explicitUserId?: string): string => {
  const id = explicitUserId || currentUserIdGetter();
  if (!id) {
    throw new Error('No active user selected. Please select a team member.');
  }
  return id;
};

// ==================== USERS API ====================
export const userApi = {
  getAll: () => request<User[]>('/users'),
  getById: (id: string) => request<User>(`/users/${id}`),
  create: (data: Partial<User>) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ==================== ATTENDANCE API ====================
export const attendanceApi = {
  getAll: (userId?: string) => {
    const activeId = userId || currentUserIdGetter();
    const query = activeId ? `?user_id=${activeId}` : '';
    return request<Attendance[]>(`/attendance${query}`);
  },
  clockIn: (data?: { lat?: number; lng?: number; user_id?: string }) => {
    const user_id = getActiveUserId(data?.user_id);
    return request<Attendance>('/attendance/clock-in', {
      method: 'POST',
      body: JSON.stringify({
        user_id,
        check_in_lat: data?.lat,
        check_in_lng: data?.lng,
      }),
    });
  },
  clockOut: (data?: { attendance_id?: string; user_id?: string }) => {
    const user_id = getActiveUserId(data?.user_id);
    return request<Attendance>('/attendance/clock-out', {
      method: 'POST',
      body: JSON.stringify({
        user_id,
        attendance_id: data?.attendance_id,
      }),
    });
  },
};

// ==================== LEAVES API ====================
export const leaveApi = {
  getAll: (userId?: string) => {
    const activeId = userId || currentUserIdGetter();
    const query = activeId ? `?user_id=${activeId}` : '';
    return request<Leave[]>(`/leaves${query}`);
  },
  create: (data: { start_date: string; end_date: string; leave_type: string; comments?: string; user_id?: string }) => {
    const user_id = getActiveUserId(data.user_id);
    return request<Leave>('/leaves', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        user_id,
      }),
    });
  },
  updateStatus: (id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING', adminUserId?: string) => {
    const admin_user_id = adminUserId || currentUserIdGetter();
    return request<Leave>(`/leaves/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_user_id }),
    });
  },
};

// ==================== EXPENSES API ====================
export const expenseApi = {
  getAll: (userId?: string) => {
    const activeId = userId || currentUserIdGetter();
    const query = activeId ? `?user_id=${activeId}` : '';
    return request<Expense[]>(`/expenses${query}`);
  },
  create: (data: { amount: number; category: string; receipt_url?: string; date?: string; user_id?: string }) => {
    const user_id = getActiveUserId(data.user_id);
    return request<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        user_id,
      }),
    });
  },
  updateStatus: (id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') =>
    request<Expense>(`/expenses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ==================== TASKS API ====================
export const taskApi = {
  getAll: (userId?: string) => {
    const activeId = userId || currentUserIdGetter();
    const query = activeId ? `?user_id=${activeId}` : '';
    return request<Task[]>(`/tasks${query}`);
  },
  create: (data: { title: string; due_date: string; user_id?: string }) => {
    const user_id = getActiveUserId(data.user_id);
    return request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        user_id,
      }),
    });
  },
  updateStatus: (id: string, status: 'TODO' | 'DONE') =>
    request<Task>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};

// ==================== HOLIDAYS API ====================
export const holidayApi = {
  getAll: () => request<Holiday[]>('/holidays'),
  create: (data: { name: string; date: string }) =>
    request<Holiday>('/holidays', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
