import React, { useEffect, useState } from 'react';
import { Machine, QueueEntry, IssueReport, UserRole, MachineStatus } from './types';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { StudentView } from './components/StudentView';
import { ManagerView } from './components/ManagerView';
import { DashboardHeader } from './components/DashboardHeader';
import { ProfilePage } from './components/ProfilePage';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { toast, Toaster } from 'sonner';
import logoImage from './assets/LOGO.png';

type Page = 'home' | 'login' | 'signup' | 'dashboard' | 'profile';

function AppContent() {
  const { user, isLoading, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  
  const [machines, setMachines] = useState<Machine[]>([
    {
      id: '1',
      name: 'Washer 1',
      location: 'Floor 2 - Room 205',
      status: 'can-use'
    },
    {
      id: '2',
      name: 'Washer 2',
      location: 'Floor 2 - Room 205',
      status: 'can-use'
    },
    {
      id: '3',
      name: 'Dryer 1',
      location: 'Floor 2 - Room 205',
      status: 'can-use'
    },
    {
      id: '4',
      name: 'Dryer 2',
      location: 'Floor 3 - Room 301',
      status: 'cannot-use'
    }
  ]);

  const [queues, setQueues] = useState<QueueEntry[]>([
    {
      id: 'q1',
      machineId: '1',
      studentId: 'S12345',
      roomNumber: '201',
      timestamp: new Date()
    }
  ]);

  const [issueReports, setIssueReports] = useState<IssueReport[]>([
    {
      id: 'i1',
      machineId: '4',
      studentId: 'S67890',
      issueType: 'Machine leaking',
      description: 'Water pooling under the machine',
      timestamp: new Date(),
      status: 'pending'
    }
  ]);



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



  const handleJoinQueue = (machineId: string, studentId: string, roomNumber: string) => {
    const newEntry: QueueEntry = {
      id: `q${Date.now()}`,
      machineId,
      studentId,
      roomNumber,
      timestamp: new Date()
    };
    setQueues([...queues, newEntry]);

    toast.success('Successfully joined the queue!');
  };

  const handleReportIssue = (machineId: string, studentId: string, issueType: string, description: string) => {
    const newReport: IssueReport = {
      id: `i${Date.now()}`,
      machineId,
      studentId,
      issueType,
      description,
      timestamp: new Date(),
      status: 'pending'
    };
    setIssueReports([...issueReports, newReport]);
    toast.success('Issue reported successfully!');
  };

  const handleAddMachine = (name: string, location: string) => {
    const newMachine: Machine = {
      id: `m${Date.now()}`,
      name,
      location,
      status: 'can-use'
    };
    setMachines([...machines, newMachine]);
    toast.success('Machine added successfully!');
  };

  const handleEditMachine = (id: string, name: string, location: string) => {
    setMachines(machines.map(m => 
      m.id === id ? { ...m, name, location } : m
    ));
    toast.success('Machine updated successfully!');
  };

  const handleDeleteMachine = (id: string) => {
    setMachines(machines.filter(m => m.id !== id));
    setQueues(queues.filter(q => q.machineId !== id));
    setIssueReports(issueReports.filter(r => r.machineId !== id));
    toast.success('Machine deleted successfully!');
  };

  const handleUpdateMachineStatus = (id: string, status: MachineStatus) => {
    setMachines(machines.map(m => 
      m.id === id ? { ...m, status } : m
    ));
    if (status === 'cannot-use') {
      setQueues(queues.filter(q => q.machineId !== id));
    }
    toast.success(`Machine status updated to ${status === 'can-use' ? 'Can Use' : 'Cannot Use'}`);
  };

  const handleResolveIssue = (id: string) => {
    setIssueReports(issueReports.map(r => 
      r.id === id ? { ...r, status: 'resolved' as const } : r
    ));
    toast.success('Issue marked as resolved!');
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
            {user.role === 'student' ? (
              <StudentView
                machines={machines}
                queues={queues}
                onJoinQueue={handleJoinQueue}
                onReportIssue={handleReportIssue}
                currentStudentId={user.id}
              />
            ) : (
              <ManagerView
                machines={machines}
                issueReports={issueReports}
                onAddMachine={handleAddMachine}
                onEditMachine={handleEditMachine}
                onDeleteMachine={handleDeleteMachine}
                onUpdateMachineStatus={handleUpdateMachineStatus}
                onResolveIssue={handleResolveIssue}
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
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--primary)]"></div>
            <p className="mt-4 text-[var(--text)]">Loading...</p>
          </div>
        </div>
      )}
      

      
      {/* Fallback for when user exists but on auth pages */}
      {user && !isLoading && (currentPage === 'login' || currentPage === 'signup') && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-[var(--text)] mb-4">Redirecting to dashboard...</p>
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="bg-[var(--primary)] text-white px-4 py-2 rounded"
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;