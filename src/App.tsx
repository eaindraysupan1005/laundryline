import React, { useEffect, useState } from 'react';
import { Machine, QueueEntry, IssueReport, UserRole, MachineStatus } from './types';
import { HomePage } from './components/HomePage';
import { AuthPage } from './components/AuthPage';
import { StudentView } from './components/StudentView';
import { ManagerView } from './components/ManagerView';
import { DashboardHeader } from './components/DashboardHeader';
import { ProfilePage, ProfileData } from './components/ProfilePage';
import { toast, Toaster } from 'sonner';
import logoImage from './assets/LOGO.png';

type Page = 'home' | 'login' | 'signup' | 'dashboard' | 'profile';

interface User {
  email: string;
  name: string;
  role: UserRole;
  profileComplete?: boolean;
}

interface DemoUser {
  password: string;
  name: string;
  role: UserRole;
  profile: ProfileData;
}

// Demo users for testing
const DEMO_USERS: Record<string, DemoUser> = {
  'student@demo.com': {
    password: 'password',
    name: 'Alex Student',
    role: 'student',
    profile: {
      name: 'Alex Student',
      studentId: 'S12345',
      dormitoryNumber: 'Building A',
      roomNumber: '205'
    }
  },
  'manager@demo.com': {
    password: 'password',
    name: 'Jordan Manager',
    role: 'manager',
    profile: {
      name: 'Jordan Manager',
      staffId: 'M12345',
      dormitoryNumber: 'Building A'
    }
  }
};

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  
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

  const [currentStudentId, setCurrentStudentId] = useState<string>('');

  const handleAuth = (email: string, password: string, role: UserRole, name?: string) => {
    // Check demo users first
    const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS];
    if (demoUser && demoUser.password === password) {
      setUser({
        email,
        name: demoUser.name,
        role: demoUser.role,
        profileComplete: true
      });
      setUserProfile(demoUser.profile);
      
      // Set student ID for demo student user
      if (demoUser.role === 'student' && demoUser.profile.studentId) {
        setCurrentStudentId(demoUser.profile.studentId);
      }
      
      setCurrentPage('dashboard');
      toast.success(`Welcome back, ${demoUser.name}!`);
      return;
    }

    // For new signups or other logins
    if (currentPage === 'signup' && name) {
      setUser({ email, name, role });
      setCurrentPage('dashboard');
      toast.success(`Welcome, ${name}!`);
    } else if (currentPage === 'login') {
      // Simulate login for any credentials
      setUser({ email, name: name || 'User', role });
      setCurrentPage('dashboard');
      toast.success('Successfully logged in!');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserProfile(null);
    setCurrentStudentId('');
    setCurrentPage('home');
    toast.success('Successfully logged out!');
  };

  const handleNavigate = (page: 'home' | 'login' | 'signup') => {
    setCurrentPage(page);
  };

  const handleSaveProfile = (profileData: ProfileData) => {
    setUserProfile(profileData);
    setUser(user ? { ...user, name: profileData.name, profileComplete: true } : null);
    
    // Set student ID if it's a student
    if (user?.role === 'student' && profileData.studentId) {
      setCurrentStudentId(profileData.studentId);
    }
    
    setCurrentPage('dashboard');
    toast.success('Profile saved successfully!');
  };

  const handleGoToProfile = () => {
    setCurrentPage('profile');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  // Check if user needs to complete profile
  const needsProfileCompletion = user && !user.profileComplete;

  const handleJoinQueue = (machineId: string, studentId: string, roomNumber: string) => {
    const newEntry: QueueEntry = {
      id: `q${Date.now()}`,
      machineId,
      studentId,
      roomNumber,
      timestamp: new Date()
    };
    setQueues([...queues, newEntry]);
    setCurrentStudentId(studentId); // Track the current student ID
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

      {(currentPage === 'login' || currentPage === 'signup') && (
        <AuthPage
          mode={currentPage}
          onAuth={handleAuth}
          onNavigate={handleNavigate}
        />
      )}

      {currentPage === 'dashboard' && user && (
        <>
          {needsProfileCompletion ? (
            <ProfilePage
              userRole={user.role}
              initialData={userProfile || undefined}
              isFirstTime={true}
              onSaveProfile={handleSaveProfile}
              onLogout={handleLogout}
              onBack={handleBackToDashboard}
            />
          ) : (
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
                    currentStudentId={currentStudentId}
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
        </>
      )}

      {currentPage === 'profile' && user && (
        <ProfilePage
          userRole={user.role}
          initialData={userProfile || undefined}
          isFirstTime={false}
          onSaveProfile={handleSaveProfile}
          onLogout={handleLogout}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
}

export default App;