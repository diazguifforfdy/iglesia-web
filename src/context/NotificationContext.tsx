import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface AppNotification {
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
  notifications: AppNotification[]
  // eslint-disable-next-line no-unused-vars
  addNotification: (notification: Omit<AppNotification, 'id'>) => void
  // eslint-disable-next-line no-unused-vars
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const addNotification = useCallback((notification: Omit<AppNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: AppNotification = { ...notification, id }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      const timer = setTimeout(
        () => removeNotification(id),
        notification.duration || 5000
      )
      return () => clearTimeout(timer)
    }
  }, [removeNotification])

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
