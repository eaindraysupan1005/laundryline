import { supabase } from './supabase'
import type { IssueReport } from '../types'

interface IssueRow {
  id: string
  machine_id: string
  reporter_id: string
  description: string | null
  status: string | null
  created_at: string
  modified_at: string | null
}

interface IssueMetaPayload {
  type?: string
  description?: string
  reporterDisplayId?: string
}

const ISSUE_DEFAULT_TYPE = 'Laundry Issue'

const normalizeIssueStatus = (status?: string | null): IssueReport['status'] => {
  if (status === 'in_progress' || status === 'resolved') {
    return status
  }
  return 'open'
}

function parseIssuePayload(raw: string | null): IssueMetaPayload | null {
  if (!raw) {
    return null
  }

  const trimmed = raw.trim()
  if (!trimmed) {
    return null
  }

  try {
    return JSON.parse(trimmed) as IssueMetaPayload
  } catch (error) {
    return { description: raw }
  }
}

function serializeIssuePayload(payload: IssueMetaPayload): string {
  return JSON.stringify(payload)
}

function mapIssueRow(row: IssueRow): IssueReport {
  const payload = parseIssuePayload(row.description)
  const issueType = payload?.type?.trim() || ISSUE_DEFAULT_TYPE
  const description = payload?.description ?? ''
  const reporterDisplayId = payload?.reporterDisplayId

  return {
    id: row.id,
    machineId: row.machine_id,
    studentId: reporterDisplayId ?? row.reporter_id,
    issueType,
    description,
    timestamp: new Date(row.created_at),
    status: normalizeIssueStatus(row.status),
  }
}

export async function getIssuesForMachines(machineIds: string[]): Promise<{ data: IssueReport[]; error?: string }> {
  if (!machineIds.length) {
    return { data: [] }
  }

  const { data, error } = await supabase
    .from('issues')
    .select('id, machine_id, reporter_id, description, status, created_at, modified_at')
    .in('machine_id', machineIds)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data ?? []).map(mapIssueRow) }
}

export async function createIssueReport(
  machineId: string,
  reporterId: string,
  issueType: string,
  description: string,
  reporterDisplayId?: string
): Promise<{ data?: IssueReport; error?: string }> {
  const payload = serializeIssuePayload({
    type: issueType,
    description,
    reporterDisplayId,
  })

  const { data, error } = await supabase
    .from('issues')
    .insert([
      {
        machine_id: machineId,
        reporter_id: reporterId,
        description: payload,
        status: 'open',
      },
    ])
    .select('id, machine_id, reporter_id, description, status, created_at, modified_at')
    .single()

  if (error || !data) {
    return { error: error?.message ?? 'Failed to create issue report' }
  }

  return { data: mapIssueRow(data as IssueRow) }
}

export async function resolveIssueReport(issueId: string): Promise<{ data?: IssueReport; error?: string }> {
  const { data, error } = await supabase
    .from('issues')
    .update({ status: 'resolved', modified_at: new Date().toISOString() })
    .eq('id', issueId)
    .select('id, machine_id, reporter_id, description, status, created_at, modified_at')
    .single()

  if (error || !data) {
    return { error: error?.message ?? 'Failed to resolve issue' }
  }

  return { data: mapIssueRow(data as IssueRow) }
}

export async function markIssueInProgress(issueId: string): Promise<{ data?: IssueReport; error?: string }> {
  const { data, error } = await supabase
    .from('issues')
    .update({ status: 'in_progress', modified_at: new Date().toISOString() })
    .eq('id', issueId)
    .select('id, machine_id, reporter_id, description, status, created_at, modified_at')
    .single()

  if (error || !data) {
    return { error: error?.message ?? 'Failed to update issue status' }
  }

  return { data: mapIssueRow(data as IssueRow) }
}
