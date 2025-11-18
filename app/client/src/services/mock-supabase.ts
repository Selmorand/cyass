import { mockStorage, mockUser, mockProperty } from './mock-data'
import type { Property, Report, Room, InspectionItem } from '../types'
import { generateUUID } from '../utils/uuid'

// Mock Supabase client
export const supabase = {
  auth: {
    getUser: async () => ({
      data: { user: mockUser },
      error: null
    }),
    signUp: async ({ email, password }: any) => ({
      data: { user: mockUser, session: { access_token: 'mock-token' } },
      error: null
    }),
    signInWithPassword: async ({ email, password }: any) => ({
      data: { user: mockUser, session: { access_token: 'mock-token' } },
      error: null
    }),
    signOut: async () => ({
      error: null
    }),
    onAuthStateChange: (callback: any) => {
      callback('SIGNED_IN', { user: mockUser })
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  },
  
  from: (table: string) => {
    const mockData = {
      properties: () => {
        const props = Array.from(mockStorage.properties.values())
          .filter(p => p.user_id === mockUser.id)
        return props
      },
      reports: () => {
        const reps = Array.from(mockStorage.reports.values())
          .filter(r => r.user_id === mockUser.id)
        return reps
      },
      rooms: () => Array.from(mockStorage.rooms.values()),
      inspection_items: () => Array.from(mockStorage.inspectionItems.values())
    }
    
    return {
      select: (query?: string) => ({
        eq: (field: string, value: any) => ({
          order: (orderField: string, options?: any) => ({
            data: mockData[table as keyof typeof mockData]?.() || [],
            error: null
          }),
          single: () => {
            const data = mockData[table as keyof typeof mockData]?.()
            return {
              data: Array.isArray(data) ? data[0] : data,
              error: data ? null : { code: 'PGRST116' }
            }
          },
          data: mockData[table as keyof typeof mockData]?.() || [],
          error: null
        }),
        order: (orderField: string, options?: any) => ({
          data: mockData[table as keyof typeof mockData]?.() || [],
          error: null
        }),
        single: () => ({
          data: mockData[table as keyof typeof mockData]?.()?.[0] || null,
          error: null
        }),
        limit: (count: number) => ({
          data: mockData[table as keyof typeof mockData]?.().slice(0, count) || [],
          error: null
        }),
        data: mockData[table as keyof typeof mockData]?.() || [],
        error: null
      }),
      
      insert: (data: any) => ({
        select: () => ({
          single: () => {
            const id = generateUUID()
            const newItem = {
              ...data,
              id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            
            if (table === 'properties') {
              mockStorage.properties.set(id, newItem as Property)
            } else if (table === 'reports') {
              mockStorage.reports.set(id, newItem as Report)
            } else if (table === 'rooms') {
              mockStorage.rooms.set(id, newItem as Room)
            } else if (table === 'inspection_items') {
              mockStorage.inspectionItems.set(id, newItem as InspectionItem)
            }
            
            return { data: newItem, error: null }
          }
        })
      }),
      
      update: (data: any) => ({
        eq: (field: string, value: any) => ({
          select: (query?: string) => ({
            single: () => {
              const items = mockData[table as keyof typeof mockData]?.() || []
              const item = items.find((i: any) => i[field] === value)
              if (item) {
                Object.assign(item, data, { updated_at: new Date().toISOString() })
              }
              return { data: item, error: null }
            }
          }),
          data: null,
          error: null
        })
      }),
      
      delete: () => ({
        eq: (field: string, value: any) => ({
          data: null,
          error: null
        })
      })
    }
  }
}

// Test connection function
export const testConnection = async () => {
  return { 
    success: true, 
    message: 'Using mock data - Supabase not configured' 
  }
}