import React, { createContext, useContext, useState, useCallback } from 'react'
import NotificationToast from '../components/ui/NotificationToast'
import type { NotificationType } from '../components/ui/NotificationToast'

interface Notification {
  id: string
  message: string
  type: NotificationType
  duration?: number
}

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType, duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const showNotification = useCallback((message: string, type: NotificationType, duration?: number) => {
    const id = Math.random().toString(36).substring(7)
    const newNotification: Notification = {
      id,
      message,
      type,
      duration
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remove after duration
    const timeoutDuration = duration || 4000
    if (timeoutDuration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, timeoutDuration)
    }
  }, [])

  const showSuccess = useCallback((message: string, duration?: number) => {
    showNotification(message, 'success', duration)
  }, [showNotification])

  const showError = useCallback((message: string, duration?: number) => {
    showNotification(message, 'error', duration)
  }, [showNotification])

  const showWarning = useCallback((message: string, duration?: number) => {
    showNotification(message, 'warning', duration)
  }, [showNotification])

  const showInfo = useCallback((message: string, duration?: number) => {
    showNotification(message, 'info', duration)
  }, [showNotification])

  const handleClose = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const contextValue: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Render notifications */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
        {notifications.map((notification, index) => (
          <div key={notification.id} style={{ marginBottom: index > 0 ? '12px' : '0' }}>
            <NotificationToast
              message={notification.message}
              type={notification.type}
              isVisible={true}
              onClose={() => handleClose(notification.id)}
              duration={0} // Disable auto-close in toast since we handle it here
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export default NotificationProvider