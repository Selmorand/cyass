import { supabase } from './supabase'

interface ActivityLog {
  id: string
  user_id: string
  activity_type: 'login' | 'report_created' | 'report_viewed' | 'property_created' | 'heartbeat' | 'inspection_started'
  metadata?: Record<string, any>
  created_at: string
}

class ActivityService {
  private heartbeatInterval: NodeJS.Timeout | null = null

  // Start heartbeat to keep database active
  startHeartbeat() {
    // Ping database every 30 minutes
    this.heartbeatInterval = setInterval(() => {
      this.logActivity('heartbeat', { timestamp: new Date().toISOString() })
    }, 30 * 60 * 1000) // 30 minutes
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  async logActivity(
    type: ActivityLog['activity_type'], 
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // If no user, still log heartbeat for system activity
      const activity = {
        user_id: user?.id || 'system',
        activity_type: type,
        metadata: metadata || {},
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('activity_logs')
        .insert([activity])

      if (error && error.code !== '42P01') { // Ignore if table doesn't exist
        console.warn('Failed to log activity:', error.message)
      }
    } catch (error) {
      // Silently fail - activity logging shouldn't break the app
      console.warn('Activity logging error:', error)
    }
  }

  // Cleanup old activity logs (keep last 1000 entries)
  async cleanupOldLogs(): Promise<void> {
    try {
      const { data: logs } = await supabase
        .from('activity_logs')
        .select('id')
        .order('created_at', { ascending: false })
        .range(1000, 2000)

      if (logs && logs.length > 0) {
        const idsToDelete = logs.map(log => log.id)
        await supabase
          .from('activity_logs')
          .delete()
          .in('id', idsToDelete)
      }
    } catch (error) {
      console.warn('Failed to cleanup old logs:', error)
    }
  }

  // Get recent activity for admin dashboard
  async getRecentActivity(limit = 50): Promise<ActivityLog[]> {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.warn('Failed to fetch activity:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.warn('Activity fetch error:', error)
      return []
    }
  }
}

export const activityService = new ActivityService()

// Export helper functions for easy use
export const logActivity = (type: ActivityLog['activity_type'], metadata?: Record<string, any>) => 
  activityService.logActivity(type, metadata)

export const startActivityTracking = () => activityService.startHeartbeat()
export const stopActivityTracking = () => activityService.stopHeartbeat()