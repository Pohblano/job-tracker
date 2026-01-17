// Supabase type definitions for SVB; keeps client/server Supabase usage consistent with the database schema.
export type JobStatus = 'RECEIVED' | 'QUOTED' | 'IN_PROGRESS' | 'COMPLETED'
export type JobPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          job_number: string
          part_number: string
          total_pieces: number
          pieces_completed: number
          status: JobStatus
          eta_text: string | null
          date_received: string
          priority: JobPriority | null
          shop_area: string | null
          machine: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_number: string
          part_number: string
          total_pieces: number
          pieces_completed?: number
          status?: JobStatus
          eta_text?: string | null
          date_received?: string
          priority?: JobPriority | null
          shop_area?: string | null
          machine?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {
      job_status: JobStatus
      job_priority: JobPriority
    }
    CompositeTypes: {}
  }
}
