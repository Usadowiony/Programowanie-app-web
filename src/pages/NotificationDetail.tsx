import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCurrentUser } from '../services/userService'
import { Notification, notificationService } from '../services/notificationService'

function NotificationDetail() {
  const { notificationId } = useParams<{ notificationId: string }>()
  const currentUser = getCurrentUser()
  const [notification, setNotification] = useState<Notification | null>(null)

  useEffect(() => {
    if (!currentUser) {
      setNotification(null)
      return
    }

    if (!notificationId) {
      setNotification(null)
      return
    }

    const found = notificationService.getById(notificationId)

    if (!found || found.recipientId !== currentUser.id) {
      setNotification(null)
      return
    }

    if (!found.isRead) {
      notificationService.markAsRead(found.id)
      const updated = notificationService.getById(found.id)
      setNotification(updated)
      return
    }

    setNotification(found)
  }, [notificationId, currentUser?.id])

  if (!notification) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Brak powiadomienia</h1>
          <Link to="/notifications" className="text-blue-600 hover:underline">
            Wroc do listy powiadomien
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">{notification.title}</h1>
          <span className="text-sm px-3 py-1 rounded bg-gray-200 text-gray-700">
            {notification.priority}
          </span>
        </div>

        <p className="text-gray-700 mb-6">{notification.message}</p>

        <div className="text-sm text-gray-500 mb-6">
          Data: {new Date(notification.date).toLocaleString('pl-PL')}
        </div>

        <div className="flex items-center gap-3">
          {!notification.isRead && (
            <button
              type="button"
              onClick={() => {
                notificationService.markAsRead(notification.id)
                const updated = notificationService.getById(notification.id)
                setNotification(updated)
              }}
              className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
            >
              Oznacz jako przeczytane
            </button>
          )}

          <Link to="/notifications" className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800">
            Wroc do listy
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotificationDetail
