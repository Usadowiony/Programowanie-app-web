import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseAuthUser } from 'firebase/auth'
import { auth, googleProvider } from './firebase'

export const authService = {
  signInWithGoogle() {
    return signInWithPopup(auth, googleProvider)
  },

  signOut() {
    return signOut(auth)
  },

  onAuthChanged(listener: (user: FirebaseAuthUser | null) => void) {
    return onAuthStateChanged(auth, listener)
  },
}
