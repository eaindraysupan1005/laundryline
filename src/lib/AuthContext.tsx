import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthService, type AuthUser } from '../lib/auth'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (userData: { email: string; password: string; name: string; role: 'student' | 'manager'; dorm_name: string }) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  updateUserProfile: (userId: string, updates: Partial<Omit<AuthUser, 'id'>>) => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkUser = async () => {
      try {
        const { user } = await AuthService.getCurrentUser()
        setUser(user)
      } catch (error) {
        console.error('Error checking user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    // Listen for auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange(setUser)

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
      console.log('🔄 AuthContext signIn starting for:', email)
      setIsLoading(true)
      try {
        console.log('🔄 AuthContext calling AuthService.signIn...')
        const { user, error } = await AuthService.signIn({ email, password })
        console.log('🔄 AuthContext received result from AuthService:', { user: !!user, error: !!error })
        
        if (error) {
        console.error('❌ AuthContext SignIn error:', error)
        return { success: false, error }
      }
      
      console.log('✅ AuthContext SignIn successful, setting user:', user?.email)
      setUser(user)
      console.log('✅ User state updated in AuthContext')
      return { success: true }
    } catch (error) {
      console.error('💥 AuthContext SignIn exception:', error)
      return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
    } finally {
      console.log('🔄 AuthContext signIn completed, setting loading to false')
      setIsLoading(false)
    }
  }

  const signUp = async (userData: { email: string; password: string; name: string; role: 'student' | 'manager'; dorm_name: string }) => {
    setIsLoading(true)
    try {
      const { user, error } = await AuthService.signUp(userData)
      if (error) {
        console.error('SignUp error:', error)
        return { success: false, error }
      }
      console.log('SignUp successful, setting user:', user)
      setUser(user)
      return { success: true }
    } catch (error) {
      console.error('SignUp exception:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    console.log('🚪 AuthContext signOut starting...')
    setIsLoading(true)
    try {
      const result = await AuthService.logOut()
      console.log('🚪 AuthService signOut result:', result)
      if (result.error) {
        console.error('❌ SignOut error:', result.error)
        return { success: false, error: result.error }
      }
      console.log('✅ SignOut successful, clearing user state')
      setUser(null)
      return { success: true }
    } catch (error) {
      console.error('💥 SignOut exception:', error)
      return { success: false, error: 'Failed to sign out' }
    } finally {
      console.log('🚪 SignOut completed, setting loading to false')
      setIsLoading(false)
    }
  }

  const updateUserProfile = async (userId: string, updates: Partial<Omit<AuthUser, 'id'>>) => {
    setIsLoading(true)
    try {
      const { user, error } = await AuthService.updateProfile(userId, updates)
      if (error) {
        console.error('Profile update error:', error)
        return { success: false, error }
      }
      
      // Update the user in context with the new data
      setUser(user)
      console.log('User profile updated in context:', user)
      return { success: true }
    } catch (error) {
      console.error('Profile update exception:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    if (!user) return
    
    try {
      const { user: refreshedUser, error } = await AuthService.getCurrentUser()
      if (refreshedUser && !error) {
        setUser(refreshedUser)
        console.log('User refreshed in context:', refreshedUser)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}