import type { ConditionState, UserRole, RoomType } from './common'

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          name: string
          street_number: string | null
          street_name: string
          suburb: string
          city: string
          province: string
          postal_code: string
          latitude: number
          longitude: number
          gps_accuracy: number | null
          gps_timestamp: string
          user_role: UserRole
          description: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          name: string
          street_number?: string | null
          street_name: string
          suburb: string
          city: string
          province: string
          postal_code: string
          latitude: number
          longitude: number
          gps_accuracy?: number | null
          gps_timestamp: string
          user_role: UserRole
          description?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          name?: string
          street_number?: string | null
          street_name?: string
          suburb?: string
          city?: string
          province?: string
          postal_code?: string
          latitude?: number
          longitude?: number
          gps_accuracy?: number | null
          gps_timestamp?: string
          user_role?: UserRole
          description?: string | null
          is_active?: boolean
        }
      }
      reports: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          property_id: string
          title: string
          status: 'draft' | 'completed' | 'paid'
          pdf_url: string | null
          payment_reference: string | null
          generated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          property_id: string
          title: string
          status?: 'draft' | 'completed' | 'paid'
          pdf_url?: string | null
          payment_reference?: string | null
          generated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          property_id?: string
          title?: string
          status?: 'draft' | 'completed' | 'paid'
          pdf_url?: string | null
          payment_reference?: string | null
          generated_at?: string | null
        }
      }
      rooms: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          report_id: string
          name: string
          type: RoomType
          order_index: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          report_id: string
          name: string
          type: RoomType
          order_index?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          report_id?: string
          name?: string
          type?: RoomType
          order_index?: number
        }
      }
      inspection_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          room_id: string
          category_id: string
          condition: ConditionState
          notes: string | null
          photos: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          room_id: string
          category_id: string
          condition: ConditionState
          notes?: string | null
          photos?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          room_id?: string
          category_id?: string
          condition?: ConditionState
          notes?: string | null
          photos?: string[]
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
      user_role: UserRole
      condition_state: ConditionState
      room_type: RoomType
    }
  }
}