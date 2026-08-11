export type UserRole = 'ADMIN' | 'EMPLOYEE';
export type AttendanceStatus = 'PRESENT' | 'ABSENT';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TaskStatus = 'TODO' | 'DONE';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Attendance {
  id: string;
  user_id: string;
  user?: User;
  date: string;
  clock_in?: string | null;
  clock_out?: string | null;
  check_in_lat?: number | null;
  check_in_lng?: number | null;
  status: AttendanceStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Leave {
  id: string;
  user_id: string;
  user?: User;
  start_date: string;
  end_date: string;
  leave_type: string;
  comments?: string | null;
  status: LeaveStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  user?: User;
  date: string;
  amount: number;
  category: string;
  receipt_url?: string;
  status: ExpenseStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  user_id: string;
  user?: User;
  due_date: string;
  title: string;
  status: TaskStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}
