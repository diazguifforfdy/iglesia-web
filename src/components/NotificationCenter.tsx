import { useNotification, type Notification } from '../context/NotificationContext'

const notificationConfig = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-900 dark:text-emerald-100',
    icon: '✓'
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-900 dark:text-red-100',
    icon: '✕'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-900 dark:text-blue-100',
    icon: 'ℹ'
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-900 dark:text-amber-100',
    icon: '!'
  },
  transmision: {
    bg: 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-900 dark:text-purple-100',
    icon: '📡'
  }
}

function NotificationItem({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const config = notificationConfig[notification.type]

  return (
    <div
      className={`${config.bg} ${config.border} ${config.text} border rounded-lg p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-top-2 fade-in duration-300`}
      role="alert"
    >
      <div className="flex gap-3 items-start">
        <span className="text-xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1 min-w-0">
          {notification.title && <p className="font-semibold">{notification.title}</p>}
          <p className="text-sm">{notification.message}</p>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="text-sm font-semibold mt-2 opacity-75 hover:opacity-100"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-50 hover:opacity-100 transition"
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function NotificationCenter() {
  const { notifications, removeNotification } = useNotification()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
      {notifications.map(notification => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationItem
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  )
}
