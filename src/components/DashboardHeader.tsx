import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { LogOut, User, UserCog } from 'lucide-react';
import { UserRole } from '../types';

interface DashboardHeaderProps {
  userRole: UserRole;
  userName: string;
  logoImage: string;
  onProfileClick: () => void;
}

export function DashboardHeader({ userRole, userName, logoImage, onProfileClick }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b-4 border-[var(--primary)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logoImage} alt="LaundryLine Logo" className="h-12 sm:h-16 md:h-20 w-auto" />
            <div className="hidden sm:block">
              <p className="text-xs sm:text-sm text-gray-600">Dorm Laundry Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              {userRole === 'student' ? (
                <User className="w-4 h-4 text-[var(--primary)]" />
              ) : (
                <UserCog className="w-4 h-4 text-[var(--secondary)]" />
              )}
              <div className="text-left">
                <p className="text-sm text-gray-600">
                  Logged in as {userRole === 'student' ? 'Student' : 'Dorm Manager'}
                </p>
              </div>
            </div>
            <Button
              onClick={onProfileClick}
              variant="outline"
              size="sm"
              className={`${
                userRole === 'student' 
                  ? 'border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]' 
                  : 'border-[var(--secondary)] text-[var(--secondary)] hover:bg-[var(--secondary)]'
              } hover:text-white`}
            >
              {userRole === 'student' ? (
                <User className="w-4 h-4 sm:mr-2" />
              ) : (
                <UserCog className="w-4 h-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}