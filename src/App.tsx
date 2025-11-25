import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SwaggerUIComponent from './components/SwaggerUIComponent';
import { Machine, QueueEntry, IssueReport, MachineStatus } from './types';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { StudentView } from './components/StudentView';
import { ManagerView } from './components/ManagerView';
import { DashboardHeader } from './components/DashboardHeader';
import { ProfilePage } from './components/ProfilePage';
import { AuthProvider, useAuth } from './lib/AuthContext';
import {
  getMachinesByDorm,
  createMachineForDorm,
  updateMachineDetails,
  updateMachineStatus as persistMachineStatus,
  deleteMachineById
} from './lib/machines';
import { getQueuesForMachines, enqueueStudentToMachine, cancelQueueEntry } from './lib/queues';
import { getIssuesForMachines, createIssueReport, resolveIssueReport, markIssueInProgress } from './lib/issues';
import { toast, Toaster } from 'sonner';
import logoImage from './assets/laundryline.png';

const sortMachinesByName = (items: Machine[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

const sortQueueEntries = (entries: QueueEntry[]) =>
  [...entries].sort((a, b) =>
    a.machineId === b.machineId
      ? a.position - b.position
      : a.machineId.localeCompare(b.machineId)
  );

const sortIssueReports = (entries: IssueReport[]) =>
  [...entries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

const MACHINE_STATUS_LABELS: Record<MachineStatus, string> = {
  can_use: 'Can Use',
  cannot_use: 'Cannot Use',
  in_maintenance: 'In Maintenance'
};

type Page = 'home' | 'login' | 'signup' | 'dashboard' | 'profile';

function AppContent() {
  const { user, isLoading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machinesLoading, setMachinesLoading] = useState(false);

  const [queues, setQueues] = useState<QueueEntry[]>([]);

  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);



  const handleAuthSuccess = () => {
    console.log('Auth success handler called');
    // Don't set page here - let the useEffect handle it when user state updates
    toast.success('Successfully authenticated!');
  };

  const handleLogout = async () => {
    console.log('🚪 App handleLogout starting...')
    try {
      const result = await signOut();
      console.log('🚪 SignOut result in App:', result)
      if (result.error) {
        console.error('❌ Logout failed:', result.error)
        toast.error(`Logout failed: ${result.error}`);
        return;
      }
      console.log('✅ Logout successful, navigating to home')
      setCurrentPage('home');
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('💥 Logout exception:', error)
      toast.error('Logout failed');
    }
  };
  
  // Redirect to dashboard if user is logged in and on auth pages
  useEffect(() => {
    console.log('🔄 App navigation effect triggered - user:', !!user, 'currentPage:', currentPage, 'isLoading:', isLoading);
    if (user) {
      console.log('👤 User details:', { name: user.name, email: user.email, role: user.role });
    }
    if (user && !isLoading && (currentPage === 'home' || currentPage === 'login' || currentPage === 'signup')) {
      console.log('✅ User exists and on auth page, redirecting to dashboard');
      setCurrentPage('dashboard');
    }
  }, [user, currentPage, isLoading]);

  useEffect(() => {
    if (!user) {
      setMachines([]);
      setQueues([]);
      setIssueReports([]);
      setMachinesLoading(false);
      return;
    }

    let isMounted = true;
    setMachinesLoading(true);

    void getMachinesByDorm(user.dorm_name)
      .then(async ({ data, error }) => {
        if (!isMounted) {
          return;
        }

        if (error) {
          console.error('Failed to load machines:', error);
          setMachines([]);
          setQueues([]);
          toast.error(`Failed to load machines: ${error}`);
          return;
        }

        setMachines(sortMachinesByName(data));

        const machineIds = data.map((machine) => machine.id);
        if (machineIds.length === 0) {
          setQueues([]);
          setIssueReports([]);
          return;
        }

        const { data: queueData, error: queueError } = await getQueuesForMachines(machineIds);

        if (!isMounted) {
          return;
        }

        if (queueError) {
          console.error('Failed to load queues:', queueError);
          toast.error(`Failed to load queues: ${queueError}`);
          setQueues([]);
          return;
        }

        setQueues(sortQueueEntries(queueData));

        const { data: issueData, error: issueError } = await getIssuesForMachines(machineIds);

        if (!isMounted) {
          return;
        }

        if (issueError) {
          console.error('Failed to load issues:', issueError);
          toast.error(`Failed to load issues: ${issueError}`);
        } else {
          setIssueReports(sortIssueReports(issueData));
        }
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        console.error('Unexpected error loading machines:', error);
        setMachines([]);
        setQueues([]);
        toast.error('Failed to load machines. Please try again.');
      })
      .finally(() => {
        if (isMounted) {
          setMachinesLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.dorm_name, user?.role]);

  const handleNavigate = (page: 'home' | 'login' | 'signup') => {
    setCurrentPage(page);
  };



  const handleGoToProfile = () => {
    console.log('Going to profile page');
    setCurrentPage('profile');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };



  const handleJoinQueue = async (machineId: string, studentId: string): Promise<boolean> => {
    if (!studentId) {
      toast.error('Student ID is required to join the queue.');
      return false;
    }

    const existingEntry = queues.find((entry) => entry.userId === studentId);
    if (existingEntry) {
      if (existingEntry.machineId === machineId) {
        toast('You are already in this machine\'s queue.');
      } else {
        toast.error('You are already queued for another machine. Please cancel that queue first.');
      }
      return false;
    }

    try {
      const { data, error } = await enqueueStudentToMachine(machineId, studentId);

      if (error || !data) {
        console.error('Failed to join queue:', error);
        toast.error(error ? `Failed to join queue: ${error}` : 'Failed to join queue.');
        return false;
      }

      setQueues((prev) => sortQueueEntries([...prev, data]));
      toast.success('Successfully joined the queue!');
      return true;
    } catch (error) {
      console.error('Unexpected error joining queue:', error);
      toast.error('Failed to join queue. Please try again.');
      return false;
    }
  };

  const handleLeaveQueue = async (machineId: string, studentId: string): Promise<boolean> => {
    try {
      const { removedPosition, error } = await cancelQueueEntry(machineId, studentId);

      if (error) {
        toast.error(`Failed to leave queue: ${error}`);
        return false;
      }

      setQueues((prev) => {
        const filtered = prev.filter((entry) => !(entry.machineId === machineId && entry.userId === studentId));

        if (removedPosition == null) {
          return sortQueueEntries(filtered);
        }

        const adjusted = filtered.map((entry) => {
          if (entry.machineId === machineId && entry.position > removedPosition) {
            return { ...entry, position: entry.position - 1 };
          }
          return entry;
        });

        return sortQueueEntries(adjusted);
      });

      toast.success('You have left the queue.');
      return true;
    } catch (error) {
      console.error('Unexpected error leaving queue:', error);
      toast.error('Failed to leave queue. Please try again.');
      return false;
    }
  };

  const handleReportIssue = async (
    machineId: string,
    reporterId: string,
    issueType: string,
    description: string,
    reporterDisplayId?: string
  ): Promise<boolean> => {
    if (!reporterId) {
      toast.error('Unable to submit issue without a valid user.');
      return false;
    }

    try {
      const { data, error } = await createIssueReport(
        machineId,
        reporterId,
        issueType,
        description,
        reporterDisplayId
      );

      if (error || !data) {
        console.error('Failed to submit issue report:', error);
        toast.error(error ? `Failed to submit issue: ${error}` : 'Failed to submit issue.');
        return false;
      }

      setIssueReports((prev) => sortIssueReports([...prev, data]));
      toast.success('Issue reported successfully!');
      return true;
    } catch (error) {
      console.error('Unexpected error submitting issue:', error);
      toast.error('Failed to submit issue. Please try again.');
      return false;
    }
  };

  const handleAddMachine = async (name: string, location: string) => {
    if (!user) {
      toast.error('You must be signed in to manage machines.');
      return;
    }

    try {
      const { data, error } = await createMachineForDorm({
        name,
        location,
        dorm_name: user.dorm_name
      });

      if (error || !data) {
        console.error('Failed to add machine:', error);
        toast.error(error ? `Failed to add machine: ${error}` : 'Failed to add machine.');
        return;
      }

      setMachines((prev) => sortMachinesByName([...prev, data]));
      toast.success('Machine added successfully!');
    } catch (error) {
      console.error('Unexpected error adding machine:', error);
      toast.error('Failed to add machine. Please try again.');
    }
  };

  const handleEditMachine = async (id: string, name: string, location: string) => {
    try {
      const { data, error } = await updateMachineDetails(id, { name, location });

      if (error || !data) {
        console.error('Failed to update machine:', error);
        toast.error(error ? `Failed to update machine: ${error}` : 'Failed to update machine.');
        return;
      }

      setMachines((prev) =>
        sortMachinesByName(prev.map((machine) => (machine.id === id ? data : machine)))
      );
      toast.success('Machine updated successfully!');
    } catch (error) {
      console.error('Unexpected error updating machine:', error);
      toast.error('Failed to update machine. Please try again.');
    }
  };

  const handleDeleteMachine = async (id: string) => {
    try {
      const { error } = await deleteMachineById(id);

      if (error) {
        console.error('Failed to delete machine:', error);
        toast.error(error ? `Failed to delete machine: ${error}` : 'Failed to delete machine.');
        return;
      }

      setMachines((prev) => prev.filter((machine) => machine.id !== id));
      setQueues((prev) => sortQueueEntries(prev.filter((q) => q.machineId !== id)));
      setIssueReports((prev) => prev.filter((r) => r.machineId !== id));
      toast.success('Machine deleted successfully!');
    } catch (error) {
      console.error('Unexpected error deleting machine:', error);
      toast.error('Failed to delete machine. Please try again.');
    }
  };

  const handleUpdateMachineStatus = async (id: string, status: MachineStatus) => {
    try {
      const { data, error } = await persistMachineStatus(id, status);

      if (error || !data) {
        console.error('Failed to update machine status:', error);
        toast.error(
          error ? `Failed to update machine status: ${error}` : 'Failed to update machine status.'
        );
        return;
      }

      setMachines((prev) => sortMachinesByName(prev.map((machine) => (machine.id === id ? data : machine))));

      if (status !== 'can_use') {
        setQueues((prev) => sortQueueEntries(prev.filter((q) => q.machineId !== id)));
      }

      toast.success(`Machine status updated to ${MACHINE_STATUS_LABELS[status]}`);
    } catch (error) {
      console.error('Unexpected error updating machine status:', error);
      toast.error('Failed to update machine status. Please try again.');
    }
  };

  const handleResolveIssue = async (id: string) => {
    try {
      const { data, error } = await resolveIssueReport(id);

      if (error || !data) {
        console.error('Failed to resolve issue:', error);
        toast.error(error ? `Failed to resolve issue: ${error}` : 'Failed to resolve issue.');
        return;
      }

      setIssueReports((prev) =>
        prev.map((report) => (report.id === id ? { ...report, status: data.status } : report))
      );

      toast.success('Issue marked as resolved!');
    } catch (error) {
      console.error('Unexpected error resolving issue:', error);
      toast.error('Failed to resolve issue. Please try again.');
    }
  };

  const handleMarkIssueInProgress = async (id: string) => {
    try {
      const { data, error } = await markIssueInProgress(id);

      if (error || !data) {
        console.error('Failed to update issue status:', error);
        toast.error(error ? `Failed to update issue status: ${error}` : 'Failed to update issue status.');
        return;
      }

      setIssueReports((prev) =>
        prev.map((report) => (report.id === id ? { ...report, status: data.status } : report))
      );

      toast.success('Issue marked as in progress.');
    } catch (error) {
      console.error('Unexpected error updating issue status:', error);
      toast.error('Failed to update issue status. Please try again.');
    }
  };

  useEffect(() => {
    // Ensure favicon reflects the app's logo for better branding in the tab bar
    let favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");

    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }

    favicon.type = 'image/png';
    favicon.href = logoImage;
  }, []);

  return (
    <div className="min-h-screen bg-(--background)">
      <Toaster position="top-right" />
      
      {currentPage === 'home' && (
        <HomePage onNavigate={handleNavigate} />
      )}

      {(currentPage === 'login' || currentPage === 'signup') && !user && (
        <AuthPage
          mode={currentPage}
          onAuthSuccess={handleAuthSuccess}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'dashboard' && user && (
        <>
          <DashboardHeader
            userRole={user.role}
            userName={user.name}
            logoImage={logoImage}
            onProfileClick={handleGoToProfile}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {machinesLoading ? (
              <div className="py-12 text-center text-gray-500">Loading machines...</div>
            ) : user.role === 'student' ? (
              <StudentView
                machines={machines}
                queues={queues}
                issueReports={issueReports}
                onJoinQueue={handleJoinQueue}
                onLeaveQueue={handleLeaveQueue}
                onReportIssue={handleReportIssue}
                currentStudentId={user.id_no ?? ''}
                currentUserId={user.id}
              />
            ) : (
              <ManagerView
                machines={machines}
                issueReports={issueReports}
                onAddMachine={handleAddMachine}
                onEditMachine={handleEditMachine}
                onDeleteMachine={handleDeleteMachine}
                onUpdateMachineStatus={handleUpdateMachineStatus}
                onMarkIssueInProgress={handleMarkIssueInProgress}
                onResolveIssue={handleResolveIssue}
                dormName={user.dorm_name}
              />
            )}
          </main>
        </>
      )}

      {currentPage === 'profile' && user && (
        <ProfilePage
          user={user}
          onLogout={handleLogout}
          onBack={handleBackToDashboard}
        />
      )}
      
      {isLoading && user && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-(--primary)"></div>
            <p className="mt-4 text-(--text)">Loading...</p>
          </div>
        </div>
      )}
      

      
      {/* Fallback for when user exists but on auth pages */}
      {user && !isLoading && (currentPage === 'login' || currentPage === 'signup') && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-(--text) mb-4">Redirecting to dashboard...</p>
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="bg-(--primary) text-white px-4 py-2 rounded"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        } />
        <Route path="/docs" element={<SwaggerUIComponent />} />
      </Routes>
    </Router>
  );
}

export default App;