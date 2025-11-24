import React, { useState } from 'react';
import { Machine, IssueReport, MachineStatus } from '../types';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ManagerViewProps {
  machines: Machine[];
  issueReports: IssueReport[];
  onAddMachine: (name: string, location: string) => void;
  onEditMachine: (id: string, name: string, location: string) => void;
  onDeleteMachine: (id: string) => void;
  onUpdateMachineStatus: (id: string, status: MachineStatus) => void;
  onResolveIssue: (id: string) => void;
}

export function ManagerView({
  machines,
  issueReports,
  onAddMachine,
  onEditMachine,
  onDeleteMachine,
  onUpdateMachineStatus,
  onResolveIssue
}: ManagerViewProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [machineName, setMachineName] = useState('');
  const [machineLocation, setMachineLocation] = useState('');

  const handleAddMachine = () => {
    if (machineName && machineLocation) {
      onAddMachine(machineName, machineLocation);
      setShowAddDialog(false);
      setMachineName('');
      setMachineLocation('');
    }
  };

  const handleEditMachine = () => {
    if (editingMachine && machineName && machineLocation) {
      onEditMachine(editingMachine.id, machineName, machineLocation);
      setShowEditDialog(false);
      setEditingMachine(null);
      setMachineName('');
      setMachineLocation('');
    }
  };

  const openEditDialog = (machine: Machine) => {
    setEditingMachine(machine);
    setMachineName(machine.name);
    setMachineLocation(machine.location);
    setShowEditDialog(true);
  };

  const pendingReports = issueReports.filter(r => r.status === 'pending');
  const resolvedReports = issueReports.filter(r => r.status === 'resolved');

  return (
    <div>
      <Tabs defaultValue="machines" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="machines">Machines</TabsTrigger>
          <TabsTrigger value="issues">
            Issue Reports
            {pendingReports.length > 0 && (
              <Badge className="ml-2 bg-[var(--accent)]">{pendingReports.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="machines">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-[var(--text)]">Machine Management</h2>
              <p className="text-sm text-gray-600">Add, edit, and manage laundry machines</p>
            </div>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--text)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Machine
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {machines.map(machine => (
              <Card key={machine.id} className="border-2 border-[var(--primary)]">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{machine.name}</CardTitle>
                      <CardDescription>{machine.location}</CardDescription>
                    </div>
                    {machine.status === 'can-use' ? (
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Can Use
                      </Badge>
                    ) : (
                      <Badge className="bg-[var(--accent)]">
                        <XCircle className="w-3 h-3 mr-1" />
                        Cannot Use
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Status</Label>
                    <Select
                      value={machine.status}
                      onValueChange={(value) => onUpdateMachineStatus(machine.id, value as MachineStatus)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="can-use">Can Use</SelectItem>
                        <SelectItem value="cannot-use">Cannot Use</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openEditDialog(machine)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => onDeleteMachine(machine.id)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {machines.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No machines registered yet
            </div>
          )}
        </TabsContent>

        <TabsContent value="issues">
          <div className="space-y-6">
            <div>
              <h2 className="text-[var(--text)] mb-4">Pending Issues</h2>
              <div className="space-y-3">
                {pendingReports.map(report => {
                  const machine = machines.find(m => m.id === report.machineId);
                  return (
                    <Card key={report.id} className="border-l-4 border-l-[var(--accent)]">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-5 h-5 text-[var(--accent)]" />
                              <h3 className="text-[var(--text)]">{report.issueType}</h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Machine: {machine?.name || 'Unknown'} ({machine?.location})
                            </p>
                            {report.description && (
                              <p className="text-sm text-gray-700 mb-2">{report.description}</p>
                            )}
                            <div className="flex gap-4 text-xs text-gray-500">
                              <span>Reported by: {report.studentId}</span>
                              <span>{new Date(report.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => onResolveIssue(report.id)}
                            className="bg-green-500 hover:bg-green-600"
                            size="sm"
                          >
                            Mark Resolved
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {pendingReports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending issues
                  </div>
                )}
              </div>
            </div>

            {resolvedReports.length > 0 && (
              <div>
                <h2 className="text-[var(--text)] mb-4">Resolved Issues</h2>
                <div className="space-y-3">
                  {resolvedReports.map(report => {
                    const machine = machines.find(m => m.id === report.machineId);
                    return (
                      <Card key={report.id} className="border-l-4 border-l-green-500 opacity-60">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                            <div className="flex-1">
                              <h3 className="text-[var(--text)] mb-1">{report.issueType}</h3>
                              <p className="text-sm text-gray-600 mb-1">
                                Machine: {machine?.name || 'Unknown'} ({machine?.location})
                              </p>
                              <div className="flex gap-4 text-xs text-gray-500">
                                <span>Reported by: {report.studentId}</span>
                                <span>{new Date(report.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Machine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="machineName">Machine Name</Label>
              <Input
                id="machineName"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                placeholder="e.g., Washer 1"
              />
            </div>
            <div>
              <Label htmlFor="machineLocation">Location</Label>
              <Input
                id="machineLocation"
                value={machineLocation}
                onChange={(e) => setMachineLocation(e.target.value)}
                placeholder="e.g., Floor 2 - Room 205"
              />
            </div>
            <Button 
              onClick={handleAddMachine}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--text)]"
            >
              Add Machine
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Machine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editMachineName">Machine Name</Label>
              <Input
                id="editMachineName"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                placeholder="e.g., Washer 1"
              />
            </div>
            <div>
              <Label htmlFor="editMachineLocation">Location</Label>
              <Input
                id="editMachineLocation"
                value={machineLocation}
                onChange={(e) => setMachineLocation(e.target.value)}
                placeholder="e.g., Floor 2 - Room 205"
              />
            </div>
            <Button 
              onClick={handleEditMachine}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--text)]"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
