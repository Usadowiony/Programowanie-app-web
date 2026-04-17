export type NotificationPriority = 'low' | 'medium' | 'high'

export type ISOString = string
export type UserID = string

export type Notification = {
  id: string
  title: string
  message: string
  date: ISOString
  priority: NotificationPriority
  isRead: boolean
  recipientId: UserID
  recipientEmail?: string
}

type NotificationInput = {
  title: string
  message: string
  priority: NotificationPriority
  recipientIds?: UserID[]
  recipientEmails?: string[]
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

const uniqueRecipientEmails = (emails: string[]): string[] => {
  const normalized = emails
    .map((email) => email.toLowerCase().trim())
    .filter((email) => email !== '')

  return [...new Set(normalized)]
}

export const notificationService = {
  getAll(): Notification[] {
    return getSavedNotifications()
  },

  getByRecipient(recipientId: UserID, recipientEmail?: string): Notification[] {
    const normalizedEmail = recipientEmail?.toLowerCase().trim()

    return this.getAll()
      .filter((notification) => {
        if (notification.recipientId === recipientId) {
          return true
        }

        if (!normalizedEmail || !notification.recipientEmail) {
          return false
        }

        return notification.recipientEmail.toLowerCase() === normalizedEmail
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  getById(id: string): Notification | null {
    const notification = this.getAll().find((item) => item.id === id)
    return notification ?? null
  },

  getUnreadCount(recipientId: UserID, recipientEmail?: string): number {
    return this.getByRecipient(recipientId, recipientEmail).filter((notification) => !notification.isRead).length
  },

  createForRecipients(input: NotificationInput): Notification[] {
    const notifications = this.getAll()
    const recipientIds = uniqueRecipientIds(input.recipientIds || [])
    const recipientEmails = uniqueRecipientEmails(input.recipientEmails || [])

    const byIds = recipientIds.map((recipientId) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: input.title,
      message: input.message,
      date: new Date().toISOString(),
      priority: input.priority,
      isRead: false,
      recipientId,
    }))

    const byEmails = recipientEmails.map((recipientEmail) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: input.title,
      message: input.message,
      date: new Date().toISOString(),
      priority: input.priority,
      isRead: false,
      recipientId: '',
      recipientEmail,
    }))

    const created = [...byIds, ...byEmails]

    if (created.length === 0) {
      return []
    }

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
