import { supabase, type AuthUser } from './supabase'
import type { UserRole } from '../types'

// Re-export AuthUser for easier imports
export type { AuthUser }

export interface SignUpData {
  email: string
  password: string
  name: string
  role: UserRole
  dorm_name: string
  id_no: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResponse {
  user: AuthUser | null
  error: string | null
}
interface ProfileRow {
  id: string
  email: string
  name: string
  role: UserRole
  dorm_name: string
  id_no: string | null
}

const mapProfile = (profile: ProfileRow): AuthUser => ({
  id: profile.id,
  email: profile.email,
  name: profile.name,
  role: profile.role,
  dorm_name: profile.dorm_name,
  id_no: profile.id_no
})

async function signUp(userData: SignUpData): Promise<AuthResponse> {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      emailRedirectTo: undefined
    }
  })

  if (signUpError) {
    return { user: null, error: signUpError.message }
  }

  const userId = signUpData?.user?.id
  if (!userId) {
    return { user: null, error: 'Unable to register user' }
  }

  const profilePayload = {
    id: userId,
    email: userData.email,
    name: userData.name,
    role: userData.role,
    dorm_name: userData.dorm_name,
    id_no: userData.id_no
  }

  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .insert([profilePayload])
    .select()
    .single()

  if (profileError) {
    await supabase.auth.signOut()
    return { user: null, error: `Profile creation failed: ${profileError.message}` }
  }

  return {
    user: mapProfile(profileData as ProfileRow),
    error: null
  }
}

async function signIn(credentials: SignInData): Promise<AuthResponse> {
  console.log('[AuthService.signIn] Starting Supabase auth request')
  const pendingWarning = setTimeout(() => {
    console.warn('[AuthService.signIn] Still waiting for Supabase response...')
  }, 5000)

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
  })

  clearTimeout(pendingWarning)

  console.log('[AuthService.signIn] Auth response received', {
    hasUser: !!authData?.user,
    hasError: !!authError,
    errorMessage: authError?.message
  })

  if (authError) {
    if (authError.message.includes('Email not confirmed')) {
      return {
        user: null,
        error: 'Email confirmation required. Please disable email confirmation in your Supabase dashboard for this demo app.'
      }
    }
    if (authError.message.includes('Invalid login credentials')) {
      return {
        user: null,
        error: 'Invalid email or password. Please check your credentials or sign up first.'
      }
    }
    return { user: null, error: `Authentication failed: ${authError.message}` }
  }

  const authUser = authData?.user
  if (!authUser) {
    console.warn('[AuthService.signIn] Auth data missing user payload')
    return { user: null, error: 'Sign in failed' }
  }

  console.log('[AuthService.signIn] Fetching profile for user', authUser.id)
  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (profileError) {
    console.error('[AuthService.signIn] Profile fetch error', profileError)
  } else {
    console.log('[AuthService.signIn] Profile fetch succeeded')
  }

  if (profileError) {
    return { user: null, error: `Failed to load profile: ${profileError.message}` }
  }

  if (!profileData) {
    return { user: null, error: 'User profile not found' }
  }

  return {
    user: mapProfile(profileData as ProfileRow),
    error: null
  }
}

async function signOut(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut()
  return { error: error ? error.message : null }
}

async function logOut(): Promise<{ error: string | null }> {
  return signOut()
}

async function getCurrentUser(): Promise<AuthResponse> {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { user: null, error: userError.message }
  }

  if (!userData.user) {
    return { user: null, error: null }
  }

  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userData.user.id)
    .single()

  if (profileError) {
    return { user: null, error: `Failed to load profile: ${profileError.message}` }
  }

  return {
    user: mapProfile(profileData as ProfileRow),
    error: null
  }
}

async function updateProfile(userId: string, updates: Partial<Omit<AuthUser, 'id'>>): Promise<AuthResponse> {
  const cleanUpdates = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  )

  if (Object.keys(cleanUpdates).length === 0) {
    return getCurrentUser()
  }

  const { data: profileData, error: profileError } = await supabase
    .from('users')
    .update(cleanUpdates)
    .eq('id', userId)
    .select()
    .single()

  if (profileError) {
    return { user: null, error: `Failed to update profile: ${profileError.message}` }
  }

  return {
    user: mapProfile(profileData as ProfileRow),
    error: null
  }
}

function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log('[AuthService.onAuthStateChange] Event received', {
      event,
      hasSessionUser: !!session?.user
    })

    if (!session?.user) {
      callback(null)
      return
    }

    void getCurrentUser()
      .then(({ user, error }) => {
        if (error) {
          console.error('[AuthService.onAuthStateChange] Failed to refresh user profile', error)
        }
        callback(user ?? null)
      })
      .catch((error) => {
        console.error('[AuthService.onAuthStateChange] Unexpected error refreshing user profile', error)
      })
  })
}

export const AuthService = {
  signUp,
  signIn,
  signOut,
  logOut,
  getCurrentUser,
  updateProfile,
  onAuthStateChange
}

export { signUp, signIn, signOut, logOut, getCurrentUser, updateProfile, onAuthStateChange }