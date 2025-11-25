import React from 'react';
import { Machine, QueueEntry, MachineStatus, IssueReport } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Users, Wrench } from 'lucide-react';

interface MachineCardProps {
  machine: Machine;
  queue: QueueEntry[];
  onJoinQueue: (machineId: string) => void;
  onCancelQueue?: (machineId: string) => void;
  onReportIssue: (machineId: string) => void;
  isQueuedByCurrentUser?: boolean;
  joinDisabled?: boolean;
  userRole: 'student' | 'manager';
  issueStatus?: IssueReport['status'];
}

export function MachineCard({
  machine,
  queue,
  onJoinQueue,
  onCancelQueue,
  onReportIssue,
  isQueuedByCurrentUser = false,
  joinDisabled = false,
  userRole,
  issueStatus
}: MachineCardProps) {
  const statusConfig: Record<MachineStatus, { label: string; BadgeIcon: typeof CheckCircle; className: string }> = {
    can_use: {
      label: 'Can Use',
      BadgeIcon: CheckCircle,
      className: 'bg-green-500 hover:bg-green-600'
    },
    cannot_use: {
      label: 'Cannot Use',
      BadgeIcon: AlertCircle,
      className: 'bg-[var(--accent)] hover:bg-[var(--accent)]'
    },
    in_maintenance: {
      label: 'In Maintenance',
      BadgeIcon: Wrench,
      className: 'bg-yellow-500 text-black hover:bg-yellow-500'
    }
  };

  const issueStatusConfig: Record<
    IssueReport['status'],
    {
      badgeLabel: string;
      badgeClass: string;
      bannerText: string;
      bannerClass: string;
    }
  > = {
    open: {
      badgeLabel: 'Reported Issue_Pending',
      badgeClass: 'bg-[var(--accent)] text-white',
      bannerText: 'A student reported an issue with this machine. Please review before use.',
      bannerClass: 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
    },
    in_progress: {
      badgeLabel: 'Reported Issue_In Progress',
      badgeClass: 'bg-yellow-500 text-black',
      bannerText: 'Maintenance is in progress for this machine.',
      bannerClass: 'border-yellow-500 bg-yellow-100 text-yellow-800'
    },
    resolved: {
      badgeLabel: 'Reported Issue_Resolved',
      badgeClass: 'bg-green-500 text-white',
      bannerText: 'Latest reported issue has been resolved.',
      bannerClass: 'border-green-500 bg-green-100 text-green-800'
    }
  };

  const { label: statusLabel, BadgeIcon, className: statusBadgeClass } = statusConfig[machine.operation_status];
  const isOperational = machine.operation_status === 'can_use';
  const isAvailable = machine.available_status === 'free' && queue.length === 0;
  const issueMeta = issueStatus ? issueStatusConfig[issueStatus] : undefined;
  const hasActiveIssue = issueStatus === 'open' || issueStatus === 'in_progress';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[var(--primary)] transition-all hover:shadow-lg">
      {issueMeta && (
        <div className={`mb-4 rounded-md border-l-4 px-3 py-2 text-sm ${issueMeta.bannerClass}`}>
          {issueMeta.bannerText}
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[var(--text)] mb-1">{machine.name}</h3>
          <p className="text-sm text-gray-600">{machine.location}</p>
          <p className="text-xs text-gray-500 mt-1">Dorm: {machine.dorm_name}</p>
          {hasActiveIssue && issueMeta && (
            <Badge className={`mt-2 ${issueMeta.badgeClass}`}>
              {issueMeta.badgeLabel}
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-2 items-end">
          <Badge className={statusBadgeClass}>
            <BadgeIcon className="w-3 h-3 mr-1" />
            {statusLabel}
          </Badge>
          {isOperational && (
            <Badge 
              className={isAvailable 
                ? "bg-[var(--primary)] hover:bg-[var(--primary)]" 
                : "bg-gray-400 hover:bg-gray-500"
              }
            >
              {isAvailable ? 'Free' : 'In Use'}
            </Badge>
          )}
        </div>
      </div>

      {isOperational && queue.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[var(--secondary)]" />
            <span className="text-sm">Queue ({queue.length})</span>
          </div>
          <div className="space-y-1">
            {queue.slice(0, 3).map((entry) => {
              const displayName = entry.studentName || 'Student'
              const displayId = entry.studentIdNo || entry.userId

              return (
                <div key={entry.id} className="text-sm text-gray-600">
                  #{entry.position} – {displayName} (ID: {displayId}) ({entry.status})
                </div>
              )
            })}
            {queue.length > 3 && (
              <div className="text-sm text-gray-500">
                +{queue.length - 3} more...
              </div>
            )}
          </div>
        </div>
      )}

      {userRole === 'student' && isOperational && (
        <div className="flex gap-2">
          <Button
            onClick={() =>
              isQueuedByCurrentUser
                ? onCancelQueue?.(machine.id)
                : onJoinQueue(machine.id)
            }
            disabled={!isQueuedByCurrentUser && joinDisabled}
            variant={isQueuedByCurrentUser ? 'outline' : undefined}
            className={
              isQueuedByCurrentUser
                ? 'flex-1 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'
                : 'flex-1 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--text)]'
            }
          >
            {isQueuedByCurrentUser ? 'Cancel Queue' : 'Join Queue'}
          </Button>
          <Button
            onClick={() => onReportIssue(machine.id)}
            variant="outline"
            className="border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
          >
            Report Issue
          </Button>
        </div>
      )}
    </div>
  );
}
