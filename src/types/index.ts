export type MachineStatus = 'can_use' | 'cannot_use' | 'in_maintenance';
export type AvailabilityStatus = 'free' | 'in_use';

export interface Machine {
  id: string;
  name: string;
  location: string;
  operation_status: MachineStatus;
  available_status: AvailabilityStatus;
  dorm_name: string;
  last_updated?: string;
}

export type QueueStatus = 'waiting' | 'notified' | 'in_progress' | 'completed' | 'cancelled';

export interface QueueEntry {
  id: string;
  machineId: string;
  userId: string;
  position: number;
  joinedAt: string;
  status: QueueStatus;
  studentName?: string | null;
  studentIdNo?: string | null;
}

export interface IssueReport {
  id: string;
  machineId: string;
  studentId: string;
  issueType: string;
  description: string;
  timestamp: Date;
  status: 'open' | 'in_progress' | 'resolved';
}

export type UserRole = 'student' | 'manager';

// User profile data for forms
export interface ProfileData {
  name: string;
  dorm_name: string;
  role: UserRole;
}
