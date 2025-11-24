import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LogOut, User, UserCog } from 'lucide-react';
import { UserRole } from '../types';

export interface ProfileData {
  name: string;
  studentId?: string;
  staffId?: string;
  dormitoryNumber: string;
  roomNumber?: string;
}

interface ProfilePageProps {
  userRole: UserRole;
  initialData?: ProfileData;
  isFirstTime: boolean;
  onSaveProfile: (data: ProfileData) => void;
  onLogout: () => void;
  onBack: () => void;
}

export function ProfilePage({ userRole, initialData, isFirstTime, onSaveProfile, onLogout, onBack }: ProfilePageProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [studentId, setStudentId] = useState(initialData?.studentId || '');
  const [staffId, setStaffId] = useState(initialData?.staffId || '');
  const [dormitoryNumber, setDormitoryNumber] = useState(initialData?.dormitoryNumber || '');
  const [roomNumber, setRoomNumber] = useState(initialData?.roomNumber || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const profileData: ProfileData = {
      name,
      dormitoryNumber,
      ...(userRole === 'student' ? { studentId, roomNumber } : { staffId })
    };

    // Validate all required fields
    if (userRole === 'student') {
      if (!name || !studentId || !dormitoryNumber || !roomNumber) {
        return;
      }
    } else {
      if (!name || !staffId || !dormitoryNumber) {
        return;
      }
    }

    onSaveProfile(profileData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {!isFirstTime && (
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-6"
          >
            ← Back to Dashboard
          </Button>
        )}

        <Card className="border-2 border-[var(--primary)] shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                userRole === 'student' ? 'bg-[var(--primary)]' : 'bg-[var(--secondary)]'
              }`}>
                {userRole === 'student' ? (
                  <User className="w-10 h-10 text-white" />
                ) : (
                  <UserCog className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
            <CardTitle className="text-[var(--text)]">
              {isFirstTime ? 'Complete Your Profile' : 'My Profile'}
            </CardTitle>
            <CardDescription>
              {isFirstTime 
                ? 'Please fill in all required information to continue'
                : 'View and update your profile information'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="mb-2 block">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              {userRole === 'student' ? (
                <>
                  <div>
                    <Label htmlFor="studentId" className="mb-2 block">Student ID</Label>
                    <Input
                      id="studentId"
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="S12345"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="dormitoryNumber" className="mb-2 block">Dormitory Number</Label>
                    <Input
                      id="dormitoryNumber"
                      type="text"
                      value={dormitoryNumber}
                      onChange={(e) => setDormitoryNumber(e.target.value)}
                      placeholder="Building A"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="roomNumber" className="mb-2 block">Room Number</Label>
                    <Input
                      id="roomNumber"
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="205"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="staffId" className="mb-2 block">Staff ID</Label>
                    <Input
                      id="staffId"
                      type="text"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      placeholder="M12345"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="dormitoryNumber" className="mb-2 block">Dormitory Number</Label>
                    <Input
                      id="dormitoryNumber"
                      type="text"
                      value={dormitoryNumber}
                      onChange={(e) => setDormitoryNumber(e.target.value)}
                      placeholder="Building A"
                      required
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className={`w-full ${
                  userRole === 'student' 
                    ? 'bg-[var(--primary)] hover:bg-[var(--primary)]/90' 
                    : 'bg-[var(--secondary)] hover:bg-[var(--secondary)]/90'
                } text-white`}
              >
                {isFirstTime ? 'Save & Continue' : 'Update Profile'}
              </Button>
            </form>

            {!isFirstTime && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={onLogout}
                  variant="outline"
                  className="w-full border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
