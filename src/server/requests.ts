import { createServerFn } from '@tanstack/react-start'
import { createServiceClient } from '@/lib/supabase-server'
import type { ReliefRequest, Profile } from '@/types/database'

interface RequestWithProfile extends ReliefRequest {
  profiles: { full_name: string }
}

export const getReliefRequests = createServerFn({ method: 'GET' })
  .handler(async () => {
    const supabase = createServiceClient()
    
    const { data: requests, error } = await supabase
      .from('relief_requests')
      .select('*, profiles!relief_requests_citizen_id_fkey(full_name)')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return requests as unknown as RequestWithProfile[]
  })

export const getReliefRequestById = createServerFn({ method: 'GET' })
  .handler(async (ctx) => {
    const supabase = createServiceClient()
    const data = ctx.data as unknown as { id: string }
    
    const { data: request, error } = await supabase
      .from('relief_requests')
      .select('*, profiles!relief_requests_citizen_id_fkey(full_name)')
      .eq('id', data.id)
      .single()

    if (error) throw new Error(error.message)
    return request as unknown as RequestWithProfile
  })

export const createReliefRequest = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const supabase = createServiceClient()
    const data = ctx.data as unknown as Record<string, unknown>
    
    const { data: request, error } = await supabase
      .from('relief_requests')
      .insert(data as never)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return request as ReliefRequest
  })

export const updateReliefRequest = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const supabase = createServiceClient()
    const data = ctx.data as unknown as Record<string, unknown>
    const { id, ...updateData } = data

    const { data: request, error } = await supabase
      .from('relief_requests')
      .update(updateData as never)
      .eq('id', id as string)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return request as ReliefRequest
  })

export const getRequestStats = createServerFn({ method: 'GET' })
  .handler(async () => {
    const supabase = createServiceClient()
    
    const { data: requests, error } = await supabase
      .from('relief_requests')
      .select('status, priority, disaster_type, created_at')

    if (error) throw new Error(error.message)

    const items = requests as Array<{ status: string; priority: string; disaster_type: string; created_at: string }>

    return {
      total: items.length,
      pending: items.filter(r => r.status === 'pending').length,
      approved: items.filter(r => r.status === 'approved').length,
      assigned: items.filter(r => r.status === 'assigned').length,
      resolved: items.filter(r => r.status === 'resolved').length,
      critical: items.filter(r => r.priority === 'critical').length,
      high: items.filter(r => r.priority === 'high').length,
      medium: items.filter(r => r.priority === 'medium').length,
      low: items.filter(r => r.priority === 'low').length,
      byDisasterType: {
        flood: items.filter(r => r.disaster_type === 'flood').length,
        earthquake: items.filter(r => r.disaster_type === 'earthquake').length,
        landslide: items.filter(r => r.disaster_type === 'landslide').length,
        fire: items.filter(r => r.disaster_type === 'fire').length,
      },
    }
  })

export const getProfile = createServerFn({ method: 'GET' })
  .handler(async (ctx) => {
    const supabase = createServiceClient()
    const data = ctx.data as unknown as { id: string }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.id)
      .single()

    if (error) throw new Error(error.message)
    return profile as Profile
  })
