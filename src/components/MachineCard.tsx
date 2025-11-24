import React from 'react';
import { Machine, QueueEntry } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Users } from 'lucide-react';

interface MachineCardProps {
  machine: Machine;
  queue: QueueEntry[];
  onJoinQueue: (machineId: string) => void;
  onReportIssue: (machineId: string) => void;
  userRole: 'student' | 'manager';
}

export function MachineCard({ machine, queue, onJoinQueue, onReportIssue, userRole }: MachineCardProps) {
  const isAvailable = queue.length === 0;
  const canUse = machine.status === 'can-use';

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-[var(--primary)] transition-all hover:shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[var(--text)] mb-1">{machine.name}</h3>
          <p className="text-sm text-gray-600">{machine.location}</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {canUse ? (
            <Badge className="bg-green-500 hover:bg-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Can Use
            </Badge>
          ) : (
            <Badge className="bg-[var(--accent)] hover:bg-[var(--accent)]">
              <AlertCircle className="w-3 h-3 mr-1" />
              Cannot Use
            </Badge>
          )}
          {canUse && (
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

      {canUse && queue.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[var(--secondary)]" />
            <span className="text-sm">Queue ({queue.length})</span>
          </div>
          <div className="space-y-1">
            {queue.slice(0, 3).map((entry, index) => (
              <div key={entry.id} className="text-sm text-gray-600">
                {index + 1}. Room {entry.roomNumber} (ID: {entry.studentId})
              </div>
            ))}
            {queue.length > 3 && (
              <div className="text-sm text-gray-500">
                +{queue.length - 3} more...
              </div>
            )}
          </div>
        </div>
      )}

      {userRole === 'student' && canUse && (
        <div className="flex gap-2">
          <Button
            onClick={() => onJoinQueue(machine.id)}
            className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--text)]"
          >
            Join Queue
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
