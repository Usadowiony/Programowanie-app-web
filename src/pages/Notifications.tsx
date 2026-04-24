import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCurrentUser } from '../services/userService'
import { notificationService, Notification } from '../services/notificationService'

const priorityClass: Record<Notification['priority'], string> = {
  low: 'border-gray-400',
  medium: 'border-yellow-500',
  high: 'border-red-500',
}

function Notifications() {
  const currentUser = getCurrentUser()
  const [notifications, setNotifications] = useState<Notification[]>([])

  const reloadNotifications = async () => {
    if (!currentUser) {
      setNotifications([])
      return
    }

    const items = await notificationService.getByRecipient(currentUser.id, currentUser.email)
    setNotifications(items)
  }

  useEffect(() => {
    void reloadNotifications()

    const unsubscribe = notificationService.subscribeToChanges(() => {
      void reloadNotifications()
    })

    return unsubscribe
  }, [])

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h1 className="text-2xl text-gray-700">Brak zalogowanego użytkownika</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Powiadomienia</h1>
          <p className="text-gray-600">Nieprzeczytane: {unreadCount}</p>
        </div>

        {notifications.length === 0 && (
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600">Brak powiadomien.</p>
          </div>
        )}

        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg p-5 shadow border-l-4 ${priorityClass[notification.priority]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{notification.title}</h2>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notification.date).toLocaleString('pl-PL')} | Priorytet: {notification.priority}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!notification.isRead && (
                    <button
                      type="button"
                      onClick={async () => {
                        await notificationService.markAsRead(notification.id)
                        await reloadNotifications()
                      }}
                      className="px-3 py-1 rounded bg-blue-500 text-white text-sm hover:bg-blue-600 cursor-pointer"
                    >
                      Oznacz jako przeczytane
                    </button>
                  )}

                  <Link
                    to={`/notifications/${notification.id}`}
                    className="px-3 py-1 rounded bg-gray-700 text-white text-sm hover:bg-gray-800"
                  >
                    Szczegoly
                  </Link>
                </div>
              </div>

              {!notification.isRead && (
                <p className="text-xs mt-3 font-semibold text-blue-600">Nowe</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Notifications
