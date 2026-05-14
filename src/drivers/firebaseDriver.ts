import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import type { StorageDriver } from './StorageDriver'

export class FirebaseDriver implements StorageDriver {
  async getAll<T>(collectionName: string): Promise<T[]> {
    const snapshot = await getDocs(collection(db, collectionName))
    return snapshot.docs.map((item) => {
      const data = item.data() as Record<string, unknown>
      return { id: item.id, ...data } as T
    })
  }

  async getById<T>(collectionName: string, id: string): Promise<T | null> {
    const snapshot = await getDoc(doc(db, collectionName, id))

    if (!snapshot.exists()) {
      return null
    }

    const data = snapshot.data() as Record<string, unknown>
    return { id: snapshot.id, ...data } as T
  }

  async create<T>(collectionName: string, id: string, data: T): Promise<void> {
    await setDoc(doc(db, collectionName, id), data as Record<string, unknown>)
  }

  async update(collectionName: string, id: string, data: Record<string, unknown>): Promise<void> {
    await updateDoc(doc(db, collectionName, id), data)
  }

  async remove(collectionName: string, id: string): Promise<void> {
    await deleteDoc(doc(db, collectionName, id))
  }

}
