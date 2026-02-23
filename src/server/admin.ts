import { createServerFn } from '@tanstack/react-start'
import { createServiceClient } from '@/lib/supabase-server'
import type { Profile } from '@/types/database'

export const checkAdminExists = createServerFn({ method: 'GET' })
  .handler(async () => {
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (error) {
      return false
    }

    return (data?.length ?? 0) > 0
  })

export const getAllUsers = createServerFn({ method: 'GET' })
  .handler(async () => {
    const supabase = createServiceClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data as Profile[]
  })

export const promoteToAdmin = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const supabase = createServiceClient()
    const payload = ctx.data as unknown as { 
      targetUserId: string
      requestUserId: string 
    }

    const adminExists = await checkAdminExists()

    if (adminExists) {
      const { data: requesterProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', payload.requestUserId)
        .single()

      const role = (requesterProfile as unknown as { role: string } | null)?.role
      if (!requesterProfile || role !== 'admin') {
        throw new Error('Only existing admins can promote users')
      }
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' } as never)
      .eq('id', payload.targetUserId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return { success: true }
  })

export const demoteToCitizen = createServerFn({ method: 'POST' })
  .handler(async (ctx) => {
    const supabase = createServiceClient()
    const payload = ctx.data as unknown as { 
      targetUserId: string
      requestUserId: string 
    }

    const { data: requesterProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', payload.requestUserId)
      .single()

    const role = (requesterProfile as unknown as { role: string } | null)?.role
    if (!requesterProfile || role !== 'admin') {
      throw new Error('Only admins can demote users')
    }

    const { data: adminCount } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')

    if ((adminCount?.length ?? 0) <= 1) {
      throw new Error('Cannot demote the last admin')
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'citizen' } as never)
      .eq('id', payload.targetUserId)

    if (updateError) {
      throw new Error(updateError.message)
    }

    return { success: true }
  })
