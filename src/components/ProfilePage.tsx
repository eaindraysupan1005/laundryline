import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { LogOut, User, UserCog, AlertCircle, ArrowLeft, Save, X } from 'lucide-react';
import type { AuthUser } from '../lib/auth'
import { useAuth } from '../lib/AuthContext';

interface ProfilePageProps {
  user: AuthUser;
  onLogout: () => void;
  onBack: () => void;
}

export function ProfilePage({ user, onLogout, onBack }: ProfilePageProps) {
  console.log('ProfilePage rendered for user:', user.email);
  const { user: contextUser, updateUserProfile, signOut: contextSignOut } = useAuth(); // Get user and update function from context
  const currentUser = contextUser || user; // Use context user if available
  
  const [name, setName] = useState(currentUser.name);
  const [dormName, setDormName] = useState(currentUser.dorm_name);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Update form fields when user data changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setDormName(currentUser.dorm_name);
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    // Validate input
    if (!name.trim()) {
      setError('Name is required');
      setIsLoading(false);
      return;
    }
    
    if (!dormName.trim()) {
      setError('Dormitory name is required');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Updating profile for user:', currentUser.id);
      const result = await updateUserProfile(currentUser.id, {
        name: name.trim(),
        dorm_name: dormName.trim()
      });

      if (result.error) {
        console.error('Profile update error:', result.error);
        setError(result.error);
      } else if (result.success) {
        console.log('Profile updated successfully via context');
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Profile update exception:', error);
      setError('An unexpected error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    const result = await contextSignOut();
    if (!result.success && result.error) {
      setError(result.error);
    } else if (result.success) {
      onLogout();
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-2 border-[var(--primary)] shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                user.role === 'student' ? 'bg-[var(--primary)]' : 'bg-[var(--secondary)]'
              }`}>
                {user.role === 'student' ? (
                  <User className="w-10 h-10 text-white" />
                ) : (
                  <UserCog className="w-10 h-10 text-white" />
                )}
              </div>
            </div>
            <CardTitle className="text-[var(--text)]">
              My Profile
            </CardTitle>
            <CardDescription>
              {isEditing ? 'Update your profile information' : 'View your profile information'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {successMessage && (
              <Alert className="mb-4">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Display Mode */}
            {!isEditing && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <div className="mt-1 text-sm font-medium">{currentUser.email}</div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <div className="mt-1 text-sm font-medium">{currentUser.name}</div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Role</Label>
                  <div className="mt-1 text-sm font-medium capitalize">{currentUser.role}</div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Dormitory</Label>
                  <div className="mt-1 text-sm font-medium">{currentUser.dorm_name}</div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary)]/90"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoading ? 'Logging out...' : 'Logout'}
                  </Button>
                </div>
              </div>
            )}

            {/* Edit Mode */}
            {isEditing && (
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
                
                <div>
                  <Label htmlFor="dormName" className="mb-2 block">Dormitory Name</Label>
                  <Input
                    id="dormName"
                    type="text"
                    value={dormName}
                    onChange={(e) => setDormName(e.target.value)}
                    placeholder="East Hall, West Wing, etc."
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-600">{currentUser.email} (cannot be changed)</div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Role</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-600 capitalize">{currentUser.role} (cannot be changed)</div>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary)]/90"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setName(currentUser.name);
                      setDormName(currentUser.dorm_name);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
