import { supabase } from './supabase'
import type { Dorm } from '../types'

export async function getDorms(): Promise<{ data: Dorm[]; error?: string }> {
  const { data, error } = await supabase
    .from('dorms')
    .select('id, name, created_at')
    .order('name', { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data as Dorm[]) ?? [] }
}

export async function createDorm(name: string): Promise<{ data?: Dorm; error?: string }> {
  const trimmed = name.trim()

  if (!trimmed) {
    return { error: 'Dorm name is required' }
  }

  const { data, error } = await supabase
    .from('dorms')
    .insert([{ name: trimmed }])
    .select('id, name, created_at')
    .single()

  if (error || !data) {
    return { error: error?.message ?? 'Failed to create dorm' }
  }

  return { data: data as Dorm }
}
