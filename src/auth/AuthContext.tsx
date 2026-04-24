import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'
import { notificationService } from '../services/notificationService'
import { User, userService } from '../services/userService'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
  status: AuthStatus
  user: User | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshCurrentUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(userService.getCurrentUser())
  const superAdminEmail = (import.meta.env.VITE_SUPER_ADMIN_EMAIL || '').toLowerCase().trim()

  const refreshCurrentUser = async () => {
    const cached = userService.getCurrentUser()
    setUser(cached)
  }

  useEffect(() => {
    const unsubscribe = authService.onAuthChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        userService.setCurrentUserCache(null)
        setUser(null)
        setStatus('unauthenticated')
        return
      }

      const { profile, isNew } = await userService.ensureUserProfile(firebaseUser)
      setUser(profile)
      setStatus('authenticated')

      if (isNew) {
        const adminIds = await userService.fetchAdminsIds()
        const recipientIds = adminIds.filter((id) => id !== profile.id)
        const shouldUseEmailFallback = recipientIds.length === 0
          && superAdminEmail !== ''
          && profile.email.toLowerCase() !== superAdminEmail

        if (recipientIds.length > 0 || shouldUseEmailFallback) {
          await notificationService.createForRecipients({
            title: 'Nowe konto w systemie',
            message: `Zalogowal sie nowy uzytkownik: ${profile.firstName} ${profile.lastName} (${profile.email})`,
            priority: 'high',
            recipientIds,
            recipientEmails: shouldUseEmailFallback ? [superAdminEmail] : [],
          })
        }
      }
    })

    return unsubscribe
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    return {
      status,
      user,
      async signInWithGoogle() {
        await authService.signInWithGoogle()
      },
      async signOut() {
        await authService.signOut()
      },
      refreshCurrentUser,
    }
  }, [status, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
