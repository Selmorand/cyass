import React, { useEffect, useState } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationToastProps {
  message: string
  type: NotificationType
  isVisible: boolean
  onClose: () => void
  duration?: number
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const getToastStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      top: '20px',
      right: '20px',
      zIndex: 9999,
      minWidth: '320px',
      maxWidth: '500px',
      padding: '16px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      animation: 'slideInRight 0.3s ease-out',
    }

    const typeStyles = {
      success: {
        backgroundColor: '#88cb11',
        color: 'white',
        border: '1px solid #7ab60f'
      },
      error: {
        backgroundColor: '#c62121',
        color: 'white', 
        border: '1px solid #a01c1c'
      },
      warning: {
        backgroundColor: '#f5a409',
        color: 'white',
        border: '1px solid #d18c07'
      },
      info: {
        backgroundColor: '#0c0e43',
        color: 'white',
        border: '1px solid #090b36'
      }
    }

    return { ...baseStyles, ...typeStyles[type] }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '●'
      case 'error':
        return '●'
      case 'warning':
        return '●'
      case 'info':
        return '●'
      default:
        return '●'
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={getToastStyles()}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <span style={{ marginRight: '12px', fontSize: '16px' }}>
            {getIcon()}
          </span>
          <span>{message}</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: '18px',
            cursor: 'pointer',
            marginLeft: '16px',
            padding: '4px',
            opacity: 0.8
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          ×
        </button>
      </div>
    </>
  )
}

export default NotificationToast