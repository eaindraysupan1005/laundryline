import { supabase } from './supabase'
import type { Machine, MachineStatus, AvailabilityStatus } from '../types'

interface MachineRow {
  id: string
  name: string
  location: string
  operation_status: MachineStatus | null
  available_status: AvailabilityStatus | null
  dorm_name: string
  last_updated?: string | null
}

const mapMachine = (row: MachineRow): Machine => ({
  id: row.id,
  name: row.name,
  location: row.location,
  operation_status: (row.operation_status ?? 'can_use') as MachineStatus,
  available_status: (row.available_status ?? 'free') as AvailabilityStatus,
  dorm_name: row.dorm_name,
  last_updated: row.last_updated ?? undefined
})

export async function getMachinesByDorm(dormName: string): Promise<{ data: Machine[]; error?: string }> {
  const { data, error } = await supabase
    .from('machines')
    .select('id, name, location, operation_status, available_status, dorm_name, last_updated')
    .eq('dorm_name', dormName)
    .order('name')

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data ?? []).map(mapMachine) }
}

export async function createMachineForDorm(payload: { name: string; location: string; dorm_name: string }): Promise<{ data?: Machine; error?: string }> {
  const { data, error } = await supabase
    .from('machines')
    .insert([
      {
        name: payload.name,
        location: payload.location,
        dorm_name: payload.dorm_name,
        operation_status: 'can_use',
        available_status: 'free',
        last_updated: new Date().toISOString()
      }
    ])
    .select('id, name, location, operation_status, available_status, dorm_name, last_updated')
    .single()

  if (error || !data) {
    return { error: error?.message ?? 'Unable to create machine' }
  }

  return { data: mapMachine(data as MachineRow) }
}

export async function updateMachineDetails(id: string, updates: { name: string; location: string }): Promise<{ data?: Machine; error?: string }> {
  const { data, error } = await supabase
    .from('machines')
    .update({
      name: updates.name,
      location: updates.location,
      last_updated: new Date().toISOString()
    })
    .eq('id', id)
    .select('id, name, location, operation_status, available_status, dorm_name, last_updated')
    .single()

  if (error || !data) {
    return { error: error?.message ?? 'Unable to update machine' }
  }

  return { data: mapMachine(data as MachineRow) }
}

export async function updateMachineStatus(id: string, status: MachineStatus): Promise<{ data?: Machine; error?: string }> {
  const { data, error } = await supabase
    .from('machines')
    .update({
      operation_status: status,
      last_updated: new Date().toISOString()
    })
    .eq('id', id)
    .select('id, name, location, operation_status, available_status, dorm_name, last_updated')
    .single()

  if (error || !data) {
    return { error: error?.message ?? 'Unable to update machine status' }
  }

  return { data: mapMachine(data as MachineRow) }
}

export async function deleteMachineById(id: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .from('machines')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  return {}
}
