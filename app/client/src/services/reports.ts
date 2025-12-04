import { supabase } from './supabase'
import type { 
  Report, 
  CreateReportInput, 
  UpdateReportInput, 
  Room, 
  InspectionItem,
  RoomType
} from '../types'
import { logActivity } from './activity'

export const reportsService = {
  async createReport(input: CreateReportInput): Promise<Report> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        property_id: input.property_id,
        title: input.title,
        status: 'draft'
      })
      .select()
      .single()

    if (error) throw error

    // Log report creation activity
    logActivity('report_created', {
      report_id: data.id,
      property_id: input.property_id,
      title: input.title
    })

    return this.mapDatabaseRowToReport(data, [])
  },

  async getReports(propertyId?: string): Promise<Report[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Include nested rooms and inspection items for accurate counts
    let query = supabase
      .from('reports')
      .select(`
        *,
        rooms (
          *,
          inspection_items (*)
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }

    const { data, error } = await query

    if (error) throw error

    return data.map(row => this.mapDatabaseRowToReport(row, row.rooms || []))
  },

  async getReportsByProperty(propertyId: string): Promise<Report[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        rooms (
          *,
          inspection_items (*)
        )
      `)
      .eq('property_id', propertyId)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return data.map(row => this.mapDatabaseRowToReport(row, row.rooms || []))
  },

  async getReport(id: string): Promise<Report | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        rooms (
          *,
          inspection_items (*)
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return this.mapDatabaseRowToReport(data, data.rooms || [])
  },

  async getPublicReport(id: string): Promise<Report | null> {
    // Public report access - no user authentication required
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        rooms (
          *,
          inspection_items (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return this.mapDatabaseRowToReport(data, data.rooms || [])
  },

  async updateReport(id: string, input: UpdateReportInput): Promise<Report> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (input.title !== undefined) updateData.title = input.title
    if (input.status !== undefined) updateData.status = input.status
    if (input.pdf_url !== undefined) updateData.pdf_url = input.pdf_url
    if (input.payment_reference !== undefined) updateData.payment_reference = input.payment_reference

    if (input.status === 'completed' && !updateData.generated_at) {
      updateData.generated_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        rooms (
          *,
          inspection_items (*)
        )
      `)
      .single()

    if (error) throw error

    return this.mapDatabaseRowToReport(data, data.rooms || [])
  },

  async createRoom(reportId: string, name: string, type: RoomType): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        report_id: reportId,
        name,
        type
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating room:', error)
      throw new Error(`Database error: ${error.message} (Code: ${error.code})`)
    }

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      video_url: data.video_url || undefined,
      video_duration: data.video_duration || undefined,
      video_size: data.video_size || undefined,
      items: []
    }
  },

  async updateRoom(
    reportId: string,
    roomId: string,
    updates: {
      name?: string
      video_url?: string | null
      video_duration?: number | null
      video_size?: number | null
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', roomId)
      .eq('report_id', reportId)  // Extra safety check

    if (error) throw error
  },

  async deleteRoom(roomId: string): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId)

    if (error) throw error
  },

  async createInspectionItem(roomId: string, item: Omit<InspectionItem, 'id' | 'created_at'>): Promise<InspectionItem> {
    // Check auth first
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current user in createInspectionItem:', user?.id, user?.email)
    
    if (!user) {
      throw new Error('User not authenticated when creating inspection item')
    }
    
    const insertData = {
      room_id: roomId,
      category_id: item.category_id,
      condition: item.condition,
      notes: item.notes || null,
      photos: item.photos || []
    }
    
    console.log('Inserting inspection item with data:', insertData)
    
    const { data, error } = await supabase
      .from('inspection_items')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating inspection item:', error)
      throw error
    }

    console.log('Inspection item created successfully:', data)

    return {
      id: data.id,
      category_id: data.category_id,
      condition: data.condition,
      notes: data.notes || undefined,
      photos: data.photos || [],
      created_at: data.created_at
    }
  },

  async updateInspectionItem(itemId: string, updates: Partial<InspectionItem>): Promise<InspectionItem> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (updates.condition !== undefined) updateData.condition = updates.condition
    if (updates.notes !== undefined) updateData.notes = updates.notes || null
    if (updates.photos !== undefined) updateData.photos = updates.photos

    const { data, error } = await supabase
      .from('inspection_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      category_id: data.category_id,
      condition: data.condition,
      notes: data.notes || undefined,
      photos: data.photos || [],
      created_at: data.created_at
    }
  },

  async deleteInspectionItem(itemId: string): Promise<void> {
    const { error } = await supabase
      .from('inspection_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
  },

  async deleteReport(reportId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Verify the report belongs to this user first
    const { data: reportCheck } = await supabase
      .from('reports')
      .select('id, user_id')
      .eq('id', reportId)
      .single()

    if (!reportCheck) {
      throw new Error('Report not found')
    }

    if (reportCheck.user_id !== user.id) {
      throw new Error('You do not have permission to delete this report')
    }

    // Step 1: Get all rooms for this report
    const { data: rooms } = await supabase
      .from('rooms')
      .select('id')
      .eq('report_id', reportId)

    // Step 2: Delete all inspection items for each room
    if (rooms && rooms.length > 0) {
      for (const room of rooms) {
        const { error: itemsError } = await supabase
          .from('inspection_items')
          .delete()
          .eq('room_id', room.id)

        if (itemsError) {
          console.error('Error deleting inspection items:', itemsError)
        }
      }
    }

    // Step 3: Delete all rooms
    const { error: roomsError } = await supabase
      .from('rooms')
      .delete()
      .eq('report_id', reportId)

    if (roomsError) {
      console.error('Error deleting rooms:', roomsError)
      throw new Error(`Failed to delete rooms: ${roomsError.message}`)
    }

    // Step 4: Finally delete the report
    const { data: deletedReport, error: reportError } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .eq('user_id', user.id)
      .select()

    if (reportError) {
      console.error('Error deleting report:', reportError)
      throw new Error(`Failed to delete report: ${reportError.message}`)
    }

    if (!deletedReport || deletedReport.length === 0) {
      console.error('Report delete returned success but deleted 0 rows - check RLS policies')
      throw new Error('Failed to delete report - 0 rows affected')
    }

    // Optional: Log activity (non-critical)
    try {
      await logActivity('report_deleted', { report_id: reportId })
    } catch (logError) {
      console.warn('Failed to log delete activity (non-critical):', logError)
    }
  },

  mapDatabaseRowToReport(row: any, rooms: any[]): Report {
    const mappedRooms: Room[] = rooms.map(room => ({
      id: room.id,
      name: room.name,
      type: room.type,
      video_url: room.video_url || undefined,
      video_duration: room.video_duration || undefined,
      video_size: room.video_size || undefined,
      items: (room.inspection_items || []).map((item: any) => ({
        id: item.id,
        category_id: item.category_id,
        condition: item.condition,
        notes: item.notes || undefined,
        photos: item.photos || [],
        created_at: item.created_at
      }))
    }))

    return {
      id: row.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_id: row.user_id,
      property_id: row.property_id,
      title: row.title,
      rooms: mappedRooms,
      status: row.status,
      pdf_url: row.pdf_url || undefined,
      payment_reference: row.payment_reference || undefined,
      generated_at: row.generated_at || undefined
    }
  }
}

export const createReport = (input: CreateReportInput) => reportsService.createReport(input)
export const getReports = (propertyId?: string) => reportsService.getReports(propertyId)
export const getReport = (id: string) => reportsService.getReport(id)
export const getPublicReport = (id: string) => reportsService.getPublicReport(id)
export const updateReport = (id: string, input: UpdateReportInput) => reportsService.updateReport(id, input)
export const deleteReport = (id: string) => reportsService.deleteReport(id)