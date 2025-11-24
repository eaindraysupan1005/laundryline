import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Waves, ArrowLeft } from 'lucide-react';
import { UserRole } from '../types';
import authLogo from '../assets/logo.png';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onAuth: (email: string, password: string, role: UserRole, name?: string) => void;
  onNavigate: (page: 'home' | 'login' | 'signup') => void;
}

export function AuthPage({ mode, onAuth, onNavigate }: AuthPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && (mode === 'login' || name)) {
      onAuth(email, password, role, name);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--background)] to-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Button
          onClick={() => onNavigate('home')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-2 border-[var(--primary)] shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={authLogo} alt="LaundryLine" className="w-32 h-auto" />
            </div>
            <CardTitle className="text-[var(--text)]">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? 'Log in to access your LaundryLine account'
                : 'Sign up to start managing your laundry'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
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
              )}

              <div>
                <Label htmlFor="email" className="mb-2 block">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" className="mb-2 block">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <Label htmlFor="role" className="mb-2 block">Account Type</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="manager">Dorm Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--text)]"
              >
                {mode === 'login' ? 'Log In' : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              {mode === 'login' ? (
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => onNavigate('signup')}
                    className="text-[var(--primary)] hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => onNavigate('login')}
                    className="text-[var(--primary)] hover:underline"
                  >
                    Log in
                  </button>
                </p>
              )}
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Demo Credentials:</p>
              <div className="text-xs text-gray-700 space-y-1">
                <p><strong>Student:</strong> student@demo.com / password</p>
                <p><strong>Manager:</strong> manager@demo.com / password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}