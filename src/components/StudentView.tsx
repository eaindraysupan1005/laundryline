import React, { useState, useEffect } from 'react';
import { Machine, QueueEntry } from '../types';
import { MachineCard } from './MachineCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface StudentViewProps {
  machines: Machine[];
  queues: QueueEntry[];
  onJoinQueue: (machineId: string, studentId: string, roomNumber: string) => void;
  onReportIssue: (machineId: string, studentId: string, issueType: string, description: string) => void;
  currentStudentId?: string;
}

export function StudentView({ machines, queues, onJoinQueue, onReportIssue, currentStudentId }: StudentViewProps) {
  const [showQueueDialog, setShowQueueDialog] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [showTurnAlert, setShowTurnAlert] = useState(false);
  const [turnMachineName, setTurnMachineName] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [studentId, setStudentId] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [issueType, setIssueType] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [notifiedQueues, setNotifiedQueues] = useState<Set<string>>(new Set());

  // Check if it's the student's turn in any queue
  useEffect(() => {
    if (!currentStudentId) return;

    queues.forEach(queueEntry => {
      // Get all queue entries for this machine, sorted by timestamp
      const machineQueue = queues
        .filter(q => q.machineId === queueEntry.machineId)
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      // Check if this student is first in queue
      const firstInQueue = machineQueue[0];
      if (firstInQueue && 
          firstInQueue.studentId === currentStudentId && 
          !notifiedQueues.has(firstInQueue.id)) {
        const machine = machines.find(m => m.id === queueEntry.machineId);
        if (machine) {
          setTurnMachineName(machine.name);
          setShowTurnAlert(true);
          setNotifiedQueues(prev => new Set(prev).add(firstInQueue.id));
        }
      }
    });
  }, [queues, currentStudentId, machines, notifiedQueues]);

  const handleJoinQueue = (machineId: string) => {
    setSelectedMachineId(machineId);
    setShowQueueDialog(true);
  };

  const handleReportIssue = (machineId: string) => {
    setSelectedMachineId(machineId);
    setShowIssueDialog(true);
  };

  const submitQueue = () => {
    if (studentId && roomNumber) {
      onJoinQueue(selectedMachineId, studentId, roomNumber);
      setShowQueueDialog(false);
      setStudentId('');
      setRoomNumber('');
    }
  };

  const submitIssue = () => {
    if (studentId && issueType) {
      onReportIssue(selectedMachineId, studentId, issueType, issueDescription);
      setShowIssueDialog(false);
      setStudentId('');
      setIssueType('');
      setIssueDescription('');
    }
  };

  const availableMachines = machines.filter(m => m.status === 'can-use');

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-[var(--text)] mb-2">Available Machines</h2>
        <p className="text-gray-600">View real-time availability and join queues</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableMachines.map(machine => (
          <MachineCard
            key={machine.id}
            machine={machine}
            queue={queues.filter(q => q.machineId === machine.id)}
            onJoinQueue={handleJoinQueue}
            onReportIssue={handleReportIssue}
            userRole="student"
          />
        ))}
      </div>

      {availableMachines.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No machines available at the moment
        </div>
      )}

      <Dialog open={showQueueDialog} onOpenChange={setShowQueueDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Queue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g., S12345"
              />
            </div>
            <div>
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g., 205"
              />
            </div>
            <Button 
              onClick={submitQueue}
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
              <Label htmlFor="reportStudentId">Student ID</Label>
              <Input
                id="reportStudentId"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g., S12345"
              />
            </div>
            <div>
              <Label htmlFor="issueType">Issue Type</Label>
              <Input
                id="issueType"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                placeholder="e.g., Machine leaking, Won't spin"
              />
            </div>
            <div>
              <Label htmlFor="issueDescription">Description (Optional)</Label>
              <Textarea
                id="issueDescription"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="Additional details..."
                rows={3}
              />
            </div>
            <Button 
              onClick={submitIssue}
              className="w-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
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
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}