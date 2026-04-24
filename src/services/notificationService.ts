import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { isFirebaseMode } from '../config/dataStorage'
import { db } from './firebase'

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

const uniqueRecipientIds = (ids: UserID[]): UserID[] => [...new Set(ids)]

const uniqueRecipientEmails = (emails: string[]): string[] => {
  const normalized = emails
    .map((email) => email.toLowerCase().trim())
    .filter((email) => email !== '')

  return [...new Set(normalized)]
}

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    if (!isFirebaseMode) {
      return getSavedNotifications()
    }

    const snapshot = await getDocs(collection(db, 'notifications'))
    return snapshot.docs
      .map((item) => {
        const data = item.data() as Omit<Notification, 'id'> & Partial<Pick<Notification, 'id'>>
        return {
          id: data.id || item.id,
          title: data.title,
          message: data.message,
          date: data.date,
          priority: data.priority,
          isRead: data.isRead,
          recipientId: data.recipientId || '',
          recipientEmail: data.recipientEmail,
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  async getByRecipient(recipientId: UserID, recipientEmail?: string): Promise<Notification[]> {
    const normalizedEmail = recipientEmail?.toLowerCase().trim()
    const all = await this.getAll()

    return all.filter((notification) => {
      if (notification.recipientId === recipientId) {
        return true
      }

      if (!normalizedEmail || !notification.recipientEmail) {
        return false
      }

      return notification.recipientEmail.toLowerCase() === normalizedEmail
    })
  },

  async getById(id: string): Promise<Notification | null> {
    if (!isFirebaseMode) {
      const notification = getSavedNotifications().find((item) => item.id === id)
      return notification ?? null
    }

    const snapshot = await getDoc(doc(db, 'notifications', id))
    if (!snapshot.exists()) {
      return null
    }

    const data = snapshot.data() as Omit<Notification, 'id'> & Partial<Pick<Notification, 'id'>>
    return {
      id: data.id || snapshot.id,
      title: data.title,
      message: data.message,
      date: data.date,
      priority: data.priority,
      isRead: data.isRead,
      recipientId: data.recipientId || '',
      recipientEmail: data.recipientEmail,
    }
  },

  async getUnreadCount(recipientId: UserID, recipientEmail?: string): Promise<number> {
    const list = await this.getByRecipient(recipientId, recipientEmail)
    return list.filter((notification) => !notification.isRead).length
  },

  async createForRecipients(input: NotificationInput): Promise<Notification[]> {
    const recipientIds = uniqueRecipientIds(input.recipientIds || [])
    const recipientEmails = uniqueRecipientEmails(input.recipientEmails || [])

    const byIds: Notification[] = recipientIds.map((recipientId) => ({
      id: createId(),
      title: input.title,
      message: input.message,
      date: new Date().toISOString(),
      priority: input.priority,
      isRead: false,
      recipientId,
    }))

    const byEmails: Notification[] = recipientEmails.map((recipientEmail) => ({
      id: createId(),
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

    if (!isFirebaseMode) {
      const current = getSavedNotifications()
      saveNotifications([...current, ...created])
    } else {
      await Promise.all(
        created.map((notification) => setDoc(doc(db, 'notifications', notification.id), notification)),
      )
    }

    created.forEach((notification) => emitCreated(notification))
    emitChanged()
    return created
  },

  async markAsRead(id: string): Promise<void> {
    if (!isFirebaseMode) {
      const notifications = getSavedNotifications()
      const index = notifications.findIndex((item) => item.id === id)
      if (index === -1 || notifications[index].isRead) {
        return
      }

      notifications[index].isRead = true
      saveNotifications(notifications)
      emitChanged()
      return
    }

    await updateDoc(doc(db, 'notifications', id), { isRead: true })
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
