
export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  department: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  department: string;
  attachmentUrl?: string;
  attachmentType?: string;
  attachmentName?: string;
  postingDate: string;
}

export interface ExamSchedule {
  id: string;
  examName: string;
  date: string;
  time: string;
  notes: string;
}

export const DEPARTMENTS = [
  'Computer Science',
  'Mechanical Engineering',
  'Electrical Engineering',
  'Civil Engineering',
  'Physics',
  'Chemistry',
  'Mathematics'
];
