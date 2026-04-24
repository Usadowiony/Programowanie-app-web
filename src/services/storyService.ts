import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { isFirebaseMode } from '../config/dataStorage'
import { db } from './firebase'

export interface Story {
  id: string
  nazwa: string
  opis: string
  priorytet: 'niski' | 'sredni' | 'wysoki'
  projektId: string
  dataUtworzenia: string
  stan: 'todo' | 'doing' | 'done'
  wlascicielId: string
}

const STORIES_KEY = 'stories'

const getLocalStories = (): Story[] => {
  const data = localStorage.getItem(STORIES_KEY)
  return data ? JSON.parse(data) as Story[] : []
}

const saveLocalStories = (stories: Story[]) => {
  localStorage.setItem(STORIES_KEY, JSON.stringify(stories))
}

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const storyService = {
  async getAll(): Promise<Story[]> {
    if (!isFirebaseMode) {
      return getLocalStories()
    }

    const snapshot = await getDocs(collection(db, 'stories'))
    return snapshot.docs.map((item) => {
      const data = item.data() as Omit<Story, 'id'> & Partial<Pick<Story, 'id'>>
      return {
        id: data.id || item.id,
        nazwa: data.nazwa,
        opis: data.opis,
        priorytet: data.priorytet,
        projektId: data.projektId,
        dataUtworzenia: data.dataUtworzenia,
        stan: data.stan,
        wlascicielId: data.wlascicielId,
      }
    })
  },

  async getByProject(projektId: string): Promise<Story[]> {
    const allStories = await this.getAll()
    return allStories.filter((story) => story.projektId === projektId)
  },

  async create(
    nazwa: string,
    opis: string,
    priorytet: 'niski' | 'sredni' | 'wysoki',
    projektId: string,
    wlascicielId: string,
  ): Promise<Story> {
    const newStory: Story = {
      id: createId(),
      nazwa,
      opis,
      priorytet,
      projektId,
      dataUtworzenia: new Date().toISOString(),
      stan: 'todo',
      wlascicielId,
    }

    if (!isFirebaseMode) {
      const stories = getLocalStories()
      stories.push(newStory)
      saveLocalStories(stories)
      return newStory
    }

    await setDoc(doc(db, 'stories', newStory.id), newStory)
    return newStory
  },

  async update(
    id: string,
    nazwa: string,
    opis: string,
    priorytet: 'niski' | 'sredni' | 'wysoki',
    stan: 'todo' | 'doing' | 'done',
  ): Promise<void> {
    if (!isFirebaseMode) {
      const stories = getLocalStories()
      const index = stories.findIndex((item) => item.id === id)
      if (index !== -1) {
        stories[index].nazwa = nazwa
        stories[index].opis = opis
        stories[index].priorytet = priorytet
        stories[index].stan = stan
        saveLocalStories(stories)
      }
      return
    }

    await updateDoc(doc(db, 'stories', id), { nazwa, opis, priorytet, stan })
  },

  async delete(id: string): Promise<void> {
    if (!isFirebaseMode) {
      const stories = getLocalStories()
      const filtered = stories.filter((item) => item.id !== id)
      saveLocalStories(filtered)
      return
    }

    await deleteDoc(doc(db, 'stories', id))
  },

  async changeStatus(id: string, stan: 'todo' | 'doing' | 'done'): Promise<void> {
    if (!isFirebaseMode) {
      const stories = getLocalStories()
      const index = stories.findIndex((item) => item.id === id)
      if (index !== -1) {
        stories[index].stan = stan
        saveLocalStories(stories)
      }
      return
    }

    await updateDoc(doc(db, 'stories', id), { stan })
  },
}
