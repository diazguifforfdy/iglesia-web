import React, { createContext, useContext, useState, useCallback } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning' | 'transmision'
  message: string
  title?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = { ...notification, id }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      const timer = setTimeout(
        () => removeNotification(id),
        notification.duration || 5000
      )
      return () => clearTimeout(timer)
    }
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider')
  }
  return context
}
