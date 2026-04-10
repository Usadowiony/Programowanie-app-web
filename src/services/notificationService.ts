export type NotificationPriority = 'low' | 'medium' | 'high'

export type ISOString = string
export type UserID = number

export type Notification = {
  id: string
  title: string
  message: string
  date: ISOString
  priority: NotificationPriority
  isRead: boolean
  recipientId: UserID
}

type NotificationInput = {
  title: string
  message: string
  priority: NotificationPriority
  recipientIds: UserID[]
}

type CreatedListener = (notification: Notification) => void
type ChangeListener = () => void

const STORAGE_KEY = 'notifications'

const createdListeners = new Set<CreatedListener>()
const changeListeners = new Set<ChangeListener>()

const emitCreated = (notification: Notification) => {
  createdListeners.forEach((listener) => listener(notification))
}

const emitChanged = () => {
  changeListeners.forEach((listener) => listener())
}

const getSavedNotifications = (): Notification[] => {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) as Notification[] : []
}

const saveNotifications = (notifications: Notification[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
}

const uniqueRecipientIds = (ids: UserID[]): UserID[] => {
  return [...new Set(ids)]
}

export const notificationService = {
  getAll(): Notification[] {
    return getSavedNotifications()
  },

  getByRecipient(recipientId: UserID): Notification[] {
    return this.getAll()
      .filter((notification) => notification.recipientId === recipientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  getById(id: string): Notification | null {
    const notification = this.getAll().find((item) => item.id === id)
    return notification ?? null
  },

  getUnreadCount(recipientId: UserID): number {
    return this.getByRecipient(recipientId).filter((notification) => !notification.isRead).length
  },

  createForRecipients(input: NotificationInput): Notification[] {
    const notifications = this.getAll()
    const recipientIds = uniqueRecipientIds(input.recipientIds)

    const created = recipientIds.map((recipientId) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: input.title,
      message: input.message,
      date: new Date().toISOString(),
      priority: input.priority,
      isRead: false,
      recipientId,
    }))

    saveNotifications([...notifications, ...created])
    created.forEach((notification) => emitCreated(notification))
    emitChanged()

    return created
  },

  markAsRead(id: string): void {
    const notifications = this.getAll()
    const index = notifications.findIndex((item) => item.id === id)

    if (index === -1 || notifications[index].isRead) {
      return
    }

    notifications[index].isRead = true
    saveNotifications(notifications)
    emitChanged()
  },

  subscribeToCreated(listener: CreatedListener): () => void {
    createdListeners.add(listener)
    return () => {
      createdListeners.delete(listener)
    }
  },

  subscribeToChanges(listener: ChangeListener): () => void {
    changeListeners.add(listener)
    return () => {
      changeListeners.delete(listener)
    }
  },
}
