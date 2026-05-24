import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateDailySummary } from '@/lib/nutrition/updateSummary'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const date =
      request.nextUrl.searchParams.get('date') ??
      new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('food_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', `${date}T00:00:00.000Z`)
      .lte('logged_at', `${date}T23:59:59.999Z`)
      .order('logged_at', { ascending: false })

    if (error) throw error

    return Response.json(data ?? [])
  } catch (err) {
    console.error('GET /api/logs error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { logId } = await request.json() as { logId: string }
    if (!logId) {
      return Response.json({ error: 'logId is required' }, { status: 400 })
    }

    // Fetch log to get its date before deleting
    const { data: log, error: fetchError } = await supabase
      .from('food_logs')
      .select('logged_at')
      .eq('id', logId)
      .eq('user_id', user.id) // RLS guard
      .single()

    if (fetchError || !log) {
      return Response.json({ error: 'Log not found' }, { status: 404 })
    }

    const { error: deleteError } = await supabase
      .from('food_logs')
      .delete()
      .eq('id', logId)
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    // Recalculate daily summary after deletion
    const date = (log.logged_at as string).split('T')[0]
    const updatedSummary = await updateDailySummary(user.id, date)

    return Response.json({ success: true, updated_summary: updatedSummary })
  } catch (err) {
    console.error('DELETE /api/logs error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
