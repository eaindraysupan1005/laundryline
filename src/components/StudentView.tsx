import React, { useEffect, useMemo, useState } from 'react';
import { Machine, QueueEntry, IssueReport } from '../types';
import { MachineCard } from './MachineCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface StudentViewProps {
  machines: Machine[];
  queues: QueueEntry[];
  issueReports: IssueReport[];
  onJoinQueue: (machineId: string, studentIdentifier: string) => Promise<boolean>;
  onLeaveQueue: (machineId: string, studentIdentifier: string) => Promise<boolean>;
  onReportIssue: (
    machineId: string,
    reporterIdentifier: string,
    issueType: string,
    description: string,
    reporterDisplayId?: string
  ) => Promise<boolean>;
  currentStudentId?: string;
  currentUserId?: string;
}

export function StudentView({
  machines,
  queues,
  onJoinQueue,
  onLeaveQueue,
  issueReports,
  onReportIssue,
  currentStudentId,
  currentUserId
}: StudentViewProps) {
  const [showQueueDialog, setShowQueueDialog] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [showTurnAlert, setShowTurnAlert] = useState(false);
  const [turnMachineName, setTurnMachineName] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [studentId, setStudentId] = useState(currentStudentId ?? '');
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [notifiedQueues, setNotifiedQueues] = useState<Set<string>>(new Set());

  // Keep the visible student ID in sync with the profile value
  useEffect(() => {
    if (currentStudentId) {
      setStudentId(currentStudentId);
    }
  }, [currentStudentId]);

  const queueUserKey = currentUserId ?? currentStudentId ?? '';
  const userQueueEntries = queueUserKey ? queues.filter((entry) => entry.userId === queueUserKey) : [];
  const activeQueueMachineIds = new Set(userQueueEntries.map((entry) => entry.machineId));

  const activeIssueByMachine = useMemo(() => {
    const map = new Map<string, IssueReport>();

    issueReports.forEach((issue) => {
      if (issue.status === 'resolved') {
        return;
      }

      const existing = map.get(issue.machineId);
      if (!existing || issue.timestamp > existing.timestamp) {
        map.set(issue.machineId, issue);
      }
    });

    return map;
  }, [issueReports]);

  // Surface an alert when the current user reaches the front of a queue
  useEffect(() => {
    if (!queueUserKey) {
      return;
    }

    queues.forEach((queueEntry) => {
      const machineQueue = queues
        .filter((q) => q.machineId === queueEntry.machineId)
        .sort((a, b) => a.position - b.position);

      const firstInQueue = machineQueue[0];
      if (
        firstInQueue &&
        firstInQueue.userId === queueUserKey &&
        !notifiedQueues.has(firstInQueue.id)
      ) {
          const machine = machines.find((m) => m.id === queueEntry.machineId);
        if (machine) {
          setTurnMachineName(machine.name);
          setShowTurnAlert(true);
          setNotifiedQueues((prev) => {
            const updated = new Set(prev);
            updated.add(firstInQueue.id);
            return updated;
          });
        }
      }
    });
  }, [machines, notifiedQueues, queueUserKey, queues]);

  const handleJoinQueue = (machineId: string) => {
    if (activeQueueMachineIds.size > 0 && !activeQueueMachineIds.has(machineId)) {
      return;
    }
    setSelectedMachineId(machineId);
    setShowQueueDialog(true);
  };

  const handleReportIssue = (machineId: string) => {
    setSelectedMachineId(machineId);
    setShowIssueDialog(true);
  };

  const handleCancelQueue = async (machineId: string) => {
    if (!queueUserKey) {
      return;
    }

    const success = await onLeaveQueue(machineId, queueUserKey);
    if (success) {
      setNotifiedQueues((prev) => {
        const updated = new Set(prev);
        userQueueEntries
          .filter((entry) => entry.machineId === machineId)
          .forEach((entry) => updated.delete(entry.id));
        return updated;
      });
    }
  };

  const submitQueue = async () => {
    const queueIdentifier = currentUserId ?? studentId;
    if (!selectedMachineId || !queueIdentifier) {
      return;
    }

    if (activeQueueMachineIds.size > 0 && !activeQueueMachineIds.has(selectedMachineId)) {
      return;
    }

    const success = await onJoinQueue(selectedMachineId, queueIdentifier);
    if (success) {
      setShowQueueDialog(false);
      setSelectedMachineId('');
    }
  };

  const submitIssue = async () => {
    const reporterId = currentUserId ?? '';

    if (!selectedMachineId || !reporterId || !studentId) {
      return;
    }

    const success = await onReportIssue(
      selectedMachineId,
      reporterId,
      issueType,
      issueDescription,
      studentId
    );

    if (success) {
      setShowIssueDialog(false);
      setIssueType('');
      setIssueDescription('');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[var(--text)] mb-2">Dorm Machines</h2>
        <p className="text-gray-600">View current status, queue details, and report issues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map((machine) => {
          const machineQueue = queues
            .filter((queue) => queue.machineId === machine.id)
            .sort((a, b) => a.position - b.position);

          const isQueuedHere = activeQueueMachineIds.has(machine.id);
          const isJoinDisabled = activeQueueMachineIds.size > 0 && !isQueuedHere;
          const activeIssue = activeIssueByMachine.get(machine.id);

          return (
            <MachineCard
              key={machine.id}
              machine={machine}
              queue={machineQueue}
              onJoinQueue={handleJoinQueue}
              onCancelQueue={handleCancelQueue}
              onReportIssue={handleReportIssue}
              isQueuedByCurrentUser={isQueuedHere}
              joinDisabled={isJoinDisabled}
              userRole="student"
              issueStatus={activeIssue?.status}
            />
          );
        })}
      </div>

      {machines.length === 0 && (
        <div className="text-center py-12 text-gray-500">No machines registered yet</div>
      )}

      <Dialog open={showQueueDialog} onOpenChange={setShowQueueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Queue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-4" htmlFor="studentId">
                Student ID
              </Label>
              <Input
                id="studentId"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                placeholder="e.g., S12345"
                disabled={!!currentStudentId}
              />
            </div>
            <Button
              onClick={submitQueue}
              disabled={activeQueueMachineIds.size > 0 && !activeQueueMachineIds.has(selectedMachineId)}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--text)]"
            >
              Join Queue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-4" htmlFor="reportStudentId">
                Student ID
              </Label>
              <Input
                id="reportStudentId"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                placeholder="e.g., S12345"
              />
            </div>
            <div>
              <Label className="mb-4" htmlFor="issueType">
                Issue Type
              </Label>
              <Input
                id="issueType"
                value={issueType}
                onChange={(event) => setIssueType(event.target.value)}
                placeholder="e.g., Machine leaking, Won't spin"
              />
            </div>
            <div>
              <Label className="mb-4" htmlFor="issueDescription">
                Description (Optional)
              </Label>
              <Textarea
                id="issueDescription"
                value={issueDescription}
                onChange={(event) => setIssueDescription(event.target.value)}
                placeholder="Additional details..."
                rows={3}
              />
            </div>
            <Button
              onClick={submitIssue}
              className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
              disabled={!currentUserId}
            >
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showTurnAlert} onOpenChange={setShowTurnAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your Turn!</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            You are next in line for {turnMachineName}. Please proceed to the machine.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowTurnAlert(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
