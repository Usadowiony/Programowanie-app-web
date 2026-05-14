import { useEffect, useState } from 'react'
import { getCurrentUser } from '../services/userService'
import { notificationService, Notification } from '../services/notificationService'

export function useNotifications() {
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

  const markAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId)
    await reloadNotifications()
  }

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  return {
    currentUser,
    notifications,
    unreadCount,
    markAsRead,
  }
}
