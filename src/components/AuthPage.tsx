import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../lib/AuthContext';
import authLogo from '../assets/logo.png';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onAuthSuccess: () => void;
  onNavigate: (page: 'home' | 'login' | 'signup') => void;
}

export function AuthPage({ mode, onAuthSuccess, onNavigate }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [dormName, setDormName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);
  const successTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔄 AuthPage handleSubmit called for mode:', mode);
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        console.log('🔐 Starting login for:', email);
        const result = await signIn(email, password);
        console.log('🔐 Login result:', result);
        if (result.error) {
          console.error('❌ Login error:', result.error);
          setError(result.error);
        } else if (result.success) {
          console.log('✅ Login successful, calling onAuthSuccess');
          onAuthSuccess();
        }
      } else {
        // Sign up mode
        if (!name.trim() || !dormName.trim() || !idNumber.trim()) {
          setError('Please fill in all required fields');
          setIsLoading(false);
          return;
        }
        
        const result = await signUp({
          email,
          password,
          name: name.trim(),
          role,
          dorm_name: dormName.trim(),
          id_no: idNumber.trim()
        });
        
        if (result.error) {
          setError(result.error);
        } else if (result.success) {
          setShowSignupSuccess(true);
          if (successTimerRef.current) {
            window.clearTimeout(successTimerRef.current);
          }
          successTimerRef.current = window.setTimeout(() => {
            setShowSignupSuccess(false);
            onNavigate('login');
          }, 3000);

          setEmail('');
          setPassword('');
          setName('');
          setDormName('');
          setIdNumber('');
          setRole('student');
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
            {mode === 'signup' && showSignupSuccess && (
              <div className="mb-4 flex items-center justify-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className='text-green-400'>Account created successfully! Redirecting to login...</span>
              </div>
            )}
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
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
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
                    <Label htmlFor="idNumber" className="mb-2 block">{role === 'student' ? 'Student ID' : 'Staff ID'}</Label>
                    <Input
                      id="idNumber"
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder={role === 'student' ? 'e.g., S12345' : 'e.g., ST-001'}
                      required
                    />
                  </div>
                </>
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
                disabled={isLoading}
                className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--text)]"
              >
                {isLoading ? 'Please wait...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
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
    </>
  );
}