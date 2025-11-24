export type MachineStatus = 'can-use' | 'cannot-use';
export type AvailabilityStatus = 'free' | 'in-use';

export interface Machine {
  id: string;
  name: string;
  location: string;
  status: MachineStatus;
}

export interface QueueEntry {
  id: string;
  machineId: string;
  studentId: string;
  roomNumber: string;
  timestamp: Date;
}

export interface IssueReport {
  id: string;
  machineId: string;
  studentId: string;
  issueType: string;
  description: string;
  timestamp: Date;
  status: 'pending' | 'resolved';
}

export type UserRole = 'student' | 'manager';

// User profile data for forms
export interface ProfileData {
  name: string;
  dorm_name: string;
  role: UserRole;
}
