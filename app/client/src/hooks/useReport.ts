import { useState, useCallback } from 'react'
import { reportsService } from '../services/reports'
import type { Report, CreateReportInput, UpdateReportInput, Room, InspectionItem, RoomType } from '../types'

interface UseReportReturn {
  reports: Report[]
  currentReport: Report | null
  loading: boolean
  error: string | null
  createReport: (input: CreateReportInput) => Promise<Report>
  getReports: (propertyId?: string) => Promise<void>
  getReport: (id: string) => Promise<void>
  updateReport: (id: string, input: UpdateReportInput) => Promise<void>
  addRoom: (reportId: string, name: string, type: RoomType) => Promise<Room>
  updateRoom: (roomId: string, name: string) => Promise<void>
  deleteRoom: (roomId: string) => Promise<void>
  addInspectionItem: (roomId: string, item: Omit<InspectionItem, 'id' | 'created_at'>) => Promise<InspectionItem>
  updateInspectionItem: (itemId: string, updates: Partial<InspectionItem>) => Promise<void>
  deleteInspectionItem: (itemId: string) => Promise<void>
  clearError: () => void
}

export function useReport(): UseReportReturn {
  const [reports, setReports] = useState<Report[]>([])
  const [currentReport, setCurrentReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createReport = useCallback(async (input: CreateReportInput): Promise<Report> => {
    setLoading(true)
    setError(null)

    try {
      const report = await reportsService.createReport(input)
      setReports(prev => [report, ...prev])
      return report
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create report'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getReports = useCallback(async (propertyId?: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const fetchedReports = await reportsService.getReports(propertyId)
      setReports(fetchedReports)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reports'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getReport = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const report = await reportsService.getReport(id)
      setCurrentReport(report)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch report'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateReport = useCallback(async (id: string, input: UpdateReportInput): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const updatedReport = await reportsService.updateReport(id, input)
      
      setReports(prev => 
        prev.map(report => report.id === id ? updatedReport : report)
      )

      if (currentReport?.id === id) {
        setCurrentReport(updatedReport)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update report'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [currentReport])

  const addRoom = useCallback(async (reportId: string, name: string, type: RoomType): Promise<Room> => {
    setError(null)

    try {
      const room = await reportsService.createRoom(reportId, name, type)
      
      if (currentReport?.id === reportId) {
        setCurrentReport(prev => prev ? {
          ...prev,
          rooms: [...prev.rooms, room]
        } : null)
      }

      return room
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add room'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [currentReport])

  const updateRoom = useCallback(async (roomId: string, name: string): Promise<void> => {
    setError(null)

    try {
      await reportsService.updateRoom(roomId, name)
      
      if (currentReport) {
        setCurrentReport(prev => prev ? {
          ...prev,
          rooms: prev.rooms.map(room => 
            room.id === roomId ? { ...room, name } : room
          )
        } : null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update room'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [currentReport])

  const deleteRoom = useCallback(async (roomId: string): Promise<void> => {
    setError(null)

    try {
      await reportsService.deleteRoom(roomId)
      
      if (currentReport) {
        setCurrentReport(prev => prev ? {
          ...prev,
          rooms: prev.rooms.filter(room => room.id !== roomId)
        } : null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete room'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [currentReport])

  const addInspectionItem = useCallback(async (roomId: string, item: Omit<InspectionItem, 'id' | 'created_at'>): Promise<InspectionItem> => {
    setError(null)

    try {
      const newItem = await reportsService.createInspectionItem(roomId, item)
      
      if (currentReport) {
        setCurrentReport(prev => prev ? {
          ...prev,
          rooms: prev.rooms.map(room => 
            room.id === roomId ? {
              ...room,
              items: [...room.items, newItem]
            } : room
          )
        } : null)
      }

      return newItem
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add inspection item'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [currentReport])

  const updateInspectionItem = useCallback(async (itemId: string, updates: Partial<InspectionItem>): Promise<void> => {
    setError(null)

    try {
      const updatedItem = await reportsService.updateInspectionItem(itemId, updates)
      
      if (currentReport) {
        setCurrentReport(prev => prev ? {
          ...prev,
          rooms: prev.rooms.map(room => ({
            ...room,
            items: room.items.map(item => 
              item.id === itemId ? updatedItem : item
            )
          }))
        } : null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update inspection item'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [currentReport])

  const deleteInspectionItem = useCallback(async (itemId: string): Promise<void> => {
    setError(null)

    try {
      await reportsService.deleteInspectionItem(itemId)
      
      if (currentReport) {
        setCurrentReport(prev => prev ? {
          ...prev,
          rooms: prev.rooms.map(room => ({
            ...room,
            items: room.items.filter(item => item.id !== itemId)
          }))
        } : null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete inspection item'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [currentReport])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    reports,
    currentReport,
    loading,
    error,
    createReport,
    getReports,
    getReport,
    updateReport,
    addRoom,
    updateRoom,
    deleteRoom,
    addInspectionItem,
    updateInspectionItem,
    deleteInspectionItem,
    clearError
  }
}