export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: 'citizen' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: 'citizen' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'citizen' | 'admin'
          created_at?: string
        }
      }
      relief_requests: {
        Row: {
          id: string
          citizen_id: string
          disaster_type: 'flood' | 'earthquake' | 'landslide' | 'fire'
          ward_number: number
          location_details: string
          damage_description: string
          relief_type: 'food' | 'medical' | 'shelter' | 'evacuation'
          priority: 'low' | 'medium' | 'high' | 'critical'
          status: 'pending' | 'approved' | 'assigned' | 'resolved'
          assigned_team: string | null
          admin_remark: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          citizen_id: string
          disaster_type: 'flood' | 'earthquake' | 'landslide' | 'fire'
          ward_number: number
          location_details: string
          damage_description: string
          relief_type: 'food' | 'medical' | 'shelter' | 'evacuation'
          priority: 'low' | 'medium' | 'high' | 'critical'
          status?: 'pending' | 'approved' | 'assigned' | 'resolved'
          assigned_team?: string | null
          admin_remark?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          citizen_id?: string
          disaster_type?: 'flood' | 'earthquake' | 'landslide' | 'fire'
          ward_number?: number
          location_details?: string
          damage_description?: string
          relief_type?: 'food' | 'medical' | 'shelter' | 'evacuation'
          priority?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'pending' | 'approved' | 'assigned' | 'resolved'
          assigned_team?: string | null
          admin_remark?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ReliefRequest = Database['public']['Tables']['relief_requests']['Row']
export type ReliefRequestInsert = Database['public']['Tables']['relief_requests']['Insert']
export type ReliefRequestUpdate = Database['public']['Tables']['relief_requests']['Update']

export type DisasterType = 'flood' | 'earthquake' | 'landslide' | 'fire'
export type ReliefType = 'food' | 'medical' | 'shelter' | 'evacuation'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type Status = 'pending' | 'approved' | 'assigned' | 'resolved'
export type UserRole = 'citizen' | 'admin'
