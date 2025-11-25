import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[supabase] Missing environment configuration', {
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey
  })
} else {
  console.log('[supabase] Client initialized')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on your schema
export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'manager'
  dorm_name: string
  id_no: string | null
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'student' | 'manager'
  dorm_name: string
  id_no: string | null
}