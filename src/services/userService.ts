import { User as FirebaseAuthUser } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, updateDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export type UserRole = 'guest' | 'admin' | 'devops' | 'developer'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  blocked: boolean
  createdAt: string
}

const CURRENT_USER_KEY = 'currentUserProfile'
const USERS_CACHE_KEY = 'usersCache'

const usersCollection = collection(db, 'users')

const getSuperAdminEmail = () => (import.meta.env.VITE_SUPER_ADMIN_EMAIL || '').toLowerCase().trim()

const splitDisplayName = (displayName: string | null): { firstName: string; lastName: string } => {
  if (!displayName || displayName.trim() === '') {
    return { firstName: 'Uzytkownik', lastName: '' }
  }

  const [firstName, ...rest] = displayName.trim().split(' ')
  return {
    firstName,
    lastName: rest.join(' '),
  }
}

const mapDocToUser = (id: string, data: Partial<User>): User => {
  return {
    id,
    email: data.email || '',
    firstName: data.firstName || 'Uzytkownik',
    lastName: data.lastName || '',
    role: (data.role as UserRole) || 'guest',
    blocked: Boolean(data.blocked),
    createdAt: data.createdAt || new Date().toISOString(),
  }
}

const saveCurrentUser = (user: User | null) => {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY)
    return
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

const saveUsersCache = (users: User[]) => {
  localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(users))
}

export const userService = {
  getCurrentUser(): User | null {
    const data = localStorage.getItem(CURRENT_USER_KEY)
    return data ? JSON.parse(data) as User : null
  },

  getAllUsers(): User[] {
    const data = localStorage.getItem(USERS_CACHE_KEY)
    return data ? JSON.parse(data) as User[] : []
  },

  getUserById(id: string): User | undefined {
    return this.getAllUsers().find((user) => user.id === id)
  },

  setCurrentUserCache(user: User | null): void {
    saveCurrentUser(user)
  },

  async fetchAllUsersFromDb(): Promise<User[]> {
    const snapshot = await getDocs(usersCollection)
    const users = snapshot.docs.map((item) => mapDocToUser(item.id, item.data() as Partial<User>))
    saveUsersCache(users)
    return users
  },

  async fetchAdminsIds(): Promise<string[]> {
    const users = await this.fetchAllUsersFromDb()
    return users.filter((user) => user.role === 'admin').map((user) => user.id)
  },

  async ensureUserProfile(firebaseUser: FirebaseAuthUser): Promise<{ profile: User; isNew: boolean }> {
    const userRef = doc(db, 'users', firebaseUser.uid)
    const snapshot = await getDoc(userRef)

    const { firstName, lastName } = splitDisplayName(firebaseUser.displayName)
    const email = firebaseUser.email || ''
    const superAdminEmail = getSuperAdminEmail()
    const shouldBeAdmin = superAdminEmail !== '' && email.toLowerCase() === superAdminEmail

    if (!snapshot.exists()) {
      const newUser: User = {
        id: firebaseUser.uid,
        email,
        firstName,
        lastName,
        role: shouldBeAdmin ? 'admin' : 'guest',
        blocked: false,
        createdAt: new Date().toISOString(),
      }

      await setDoc(userRef, newUser)
      saveCurrentUser(newUser)
      await this.fetchAllUsersFromDb()
      return { profile: newUser, isNew: true }
    }

    const existing = mapDocToUser(firebaseUser.uid, snapshot.data() as Partial<User>)

    if (shouldBeAdmin && existing.role !== 'admin') {
      existing.role = 'admin'
      await updateDoc(userRef, { role: 'admin' })
    }

    const patchedName: Partial<User> = {}
    if (!existing.firstName || existing.firstName === 'Uzytkownik') {
      patchedName.firstName = firstName
    }
    if (!existing.lastName && lastName) {
      patchedName.lastName = lastName
    }
    if (!existing.email && email) {
      patchedName.email = email
    }

    if (Object.keys(patchedName).length > 0) {
      await updateDoc(userRef, patchedName)
      Object.assign(existing, patchedName)
    }

    saveCurrentUser(existing)
    await this.fetchAllUsersFromDb()
    return { profile: existing, isNew: false }
  },

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { role })
    await this.fetchAllUsersFromDb()

    const current = this.getCurrentUser()
    if (current && current.id === userId) {
      this.setCurrentUserCache({ ...current, role })
    }
  },

  async setBlocked(userId: string, blocked: boolean): Promise<void> {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, { blocked })
    await this.fetchAllUsersFromDb()

    const current = this.getCurrentUser()
    if (current && current.id === userId) {
      this.setCurrentUserCache({ ...current, blocked })
    }
  },
}

export const getCurrentUser = (): User | null => userService.getCurrentUser()
export const getAllUsers = (): User[] => userService.getAllUsers()
export const getUserById = (id: string): User | undefined => userService.getUserById(id)
