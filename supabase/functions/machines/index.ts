import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Types (inline for Edge Function compatibility)
type MachineStatus = 'can_use' | 'broken' | 'maintenance'
type AvailabilityStatus = 'free' | 'in_use' | 'booked'

interface MachineRow {
  id: string
  name: string
  location: string
  operation_status: MachineStatus | null
  available_status: AvailabilityStatus | null
  dorm_name: string
  last_updated: string | null
}

interface Machine {
  id: string
  name: string
  location: string
  operation_status: MachineStatus
  available_status: AvailabilityStatus
  dorm_name: string
  last_updated?: string
}

const mapMachine = (row: MachineRow): Machine => ({
  id: row.id,
  name: row.name,
  location: row.location,
  operation_status: row.operation_status ?? 'can_use',
  available_status: row.available_status ?? 'free',
  dorm_name: row.dorm_name,
  last_updated: row.last_updated ?? undefined,
})

// Main handler
serve(async (req) => {
  // Parse URL and method
  const url = new URL(req.url)
  const pathParts = url.pathname.split('/').filter(Boolean)
  const resourceId = pathParts[1] // /machines/{id} → id is first part after base

  // Authorization (require Authorization: Bearer <token>)
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const jwt = authHeader.split(' ')[1]

  // Initialize Supabase client with SERVICE role key (for full DB access)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // ⚠️ Use service role key in Edge Functions
  )

  // Optional: Verify user role if needed (e.g., only managers can mutate)
  // For simplicity, we assume caller is authorized (you can add role check via auth admin API)

  try {
    // === GET /machines ===
    if (req.method === 'GET' && !resourceId) {
      const dorm = url.searchParams.get('dorm_name')
      let query = supabase
        .from('machines')
        .select('id, name, location, operation_status, available_status, dorm_name, last_updated')
        .order('name', { ascending: true })

      if (dorm) {
        query = query.eq('dorm_name', dorm)
      }

      const { data, error } = await query
      if (error) throw error

      const machines = (data || []).map(mapMachine)
      return new Response(JSON.stringify(machines), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // === POST /machines ===
    if (req.method === 'POST') {
      const body: { name: string; location: string; dorm_name: string } = await req.json()
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('machines')
        .insert([
          {
            name: body.name,
            location: body.location,
            dorm_name: body.dorm_name,
            operation_status: 'can_use',
            available_status: 'free',
            last_updated: now,
          },
        ])
        .select('id, name, location, operation_status, available_status, dorm_name, last_updated')
        .single()

      if (error || !data) {
        return new Response(JSON.stringify({ error: error?.message || 'Insert failed' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify(mapMachine(data)), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // === PUT /machines/:id ===
    if (req.method === 'PUT' && resourceId) {
      const body: { name: string; location: string } = await req.json()
      const now = new Date().toISOString()

      const { data, error } = await supabase
        .from('machines')
        .update({
          name: body.name,
          location: body.location,
          last_updated: now,
        })
        .eq('id', resourceId)
        .select('id, name, location, operation_status, available_status, dorm_name, last_updated')
        .single()

      if (error || !data) {
        return new Response(JSON.stringify({ error: error?.message || 'Update failed' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify(mapMachine(data)), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // === DELETE /machines/:id ===
    if (req.method === 'DELETE' && resourceId) {
      const { error } = await supabase.from('machines').delete().eq('id', resourceId)
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return new Response(null, { status: 204 })
    }

    // Method/Route not allowed
    return new Response(JSON.stringify({ error: 'Not found or method not allowed' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})