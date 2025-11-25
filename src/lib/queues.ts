import { supabase } from './supabase'
import type { QueueEntry, QueueStatus } from '../types'

interface QueueRow {
  id: string
  machine_id: string
  user_id: string
  position: number | null
  joined_at: string
  status: string | null
}

interface ProfileRow {
  id: string
  name: string | null
  id_no: string | null
}

const mapQueueRow = (row: QueueRow): QueueEntry => ({
  id: row.id,
  machineId: row.machine_id,
  userId: row.user_id,
  position: row.position ?? 0,
  joinedAt: row.joined_at,
  status: (row.status ?? 'waiting') as QueueStatus,
  studentName: null,
  studentIdNo: null
})

export async function getQueuesForMachines(machineIds: string[]): Promise<{ data: QueueEntry[]; error?: string }> {
  if (!machineIds.length) {
    return { data: [] }
  }

  const { data, error } = await supabase
    .from('queues')
    .select('id, machine_id, user_id, position, joined_at, status')
    .in('machine_id', machineIds)
    .order('position', { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  let entries = (data ?? []).map(mapQueueRow)

  if (entries.length === 0) {
    return { data: entries }
  }

  const profileIds = Array.from(new Set(entries.map((entry) => entry.userId))).filter(Boolean)
  if (profileIds.length === 0) {
    return { data: entries }
  }

  const { data: profilesData, error: profilesError } = await supabase
    .from('users')
    .select('id, name, id_no')
    .in('id', profileIds)

  if (!profilesError && profilesData) {
    const profileMap = new Map<string, ProfileRow>(profilesData.map((profile) => [profile.id, profile]))
    entries = entries.map((entry) => {
      const profile = profileMap.get(entry.userId)
      if (!profile) {
        return entry
      }
      return {
        ...entry,
        studentName: profile.name,
        studentIdNo: profile.id_no
      }
    })
  }

  return { data: entries, error: profilesError?.message }
}

export async function enqueueStudentToMachine(machineId: string, userId: string): Promise<{ data?: QueueEntry; error?: string }> {
  const { data: latestEntry, error: fetchError } = await supabase
    .from('queues')
    .select('position')
    .eq('machine_id', machineId)
    .order('position', { ascending: false })
    .limit(1)

  if (fetchError) {
    return { error: fetchError.message }
  }

  const nextPosition = (latestEntry?.[0]?.position ?? 0) + 1

  const { data, error } = await supabase
    .from('queues')
    .insert([
      {
        machine_id: machineId,
        user_id: userId,
        position: nextPosition,
        joined_at: new Date().toISOString(),
        status: 'waiting'
      }
    ])
    .select('id, machine_id, user_id, position, joined_at, status')
    .single()

  if (error || !data) {
    return { error: error?.message ?? 'Unable to join queue' }
  }

  const entry = mapQueueRow(data as QueueRow)

  const { data: profileData } = await supabase
    .from('users')
    .select('name, id_no')
    .eq('id', userId)
    .maybeSingle()

  if (profileData) {
    entry.studentName = profileData.name
    entry.studentIdNo = profileData.id_no
  }

  return { data: entry }
}

export async function cancelQueueEntry(machineId: string, userId: string): Promise<{ removedPosition?: number | null; error?: string }> {
  const { data, error } = await supabase
    .from('queues')
    .delete()
    .eq('machine_id', machineId)
    .eq('user_id', userId)
    .select('position')
    .maybeSingle()

  if (error) {
    return { error: error.message }
  }

  if (!data) {
    return { error: 'Queue entry not found' }
  }

  const removedPosition = data.position ?? null

  if (data.position != null) {
    const { data: subsequentRows, error: subsequentError } = await supabase
      .from('queues')
      .select('id, position')
      .eq('machine_id', machineId)
      .gt('position', data.position)
      .order('position', { ascending: true })

    if (!subsequentError && subsequentRows && subsequentRows.length > 0) {
      const updates = await Promise.all(
        subsequentRows.map((row) =>
          supabase
            .from('queues')
            .update({ position: (row.position ?? 1) - 1 })
            .eq('id', row.id)
        )
      )

      updates.forEach((result) => {
        if (result.error) {
          console.error('Failed to reindex queue position', result.error)
        }
      })
    } else if (subsequentError) {
      console.error('Failed to fetch queue positions for reindexing', subsequentError)
    }
  }

  return { removedPosition }
}
