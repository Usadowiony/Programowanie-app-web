import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { isFirebaseMode } from '../config/dataStorage'
import { db } from './firebase'
import { storyService } from './storyService'

export interface Task {
  id: string
  nazwa: string
  opis: string
  priorytet: 'niski' | 'sredni' | 'wysoki'
  storyId: string
  przewidywanyCzas: string
  stan: 'todo' | 'doing' | 'done'
  dataDodania: string
  dataStart: string | null
  dataKonca: string | null
  uzytkownikId: string | null
}

const TASKS_KEY = 'tasks'

const getLocalTasks = (): Task[] => {
  const data = localStorage.getItem(TASKS_KEY)
  return data ? JSON.parse(data) as Task[] : []
}

const saveLocalTasks = (tasks: Task[]) => {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const taskService = {
  async getAll(): Promise<Task[]> {
    if (!isFirebaseMode) {
      return getLocalTasks()
    }

    const snapshot = await getDocs(collection(db, 'tasks'))
    return snapshot.docs.map((item) => {
      const data = item.data() as Omit<Task, 'id'> & Partial<Pick<Task, 'id'>>
      return {
        id: data.id || item.id,
        nazwa: data.nazwa,
        opis: data.opis,
        priorytet: data.priorytet,
        storyId: data.storyId,
        przewidywanyCzas: data.przewidywanyCzas,
        stan: data.stan,
        dataDodania: data.dataDodania,
        dataStart: data.dataStart || null,
        dataKonca: data.dataKonca || null,
        uzytkownikId: data.uzytkownikId || null,
      }
    })
  },

  async getByStory(storyId: string): Promise<Task[]> {
    const allTasks = await this.getAll()
    return allTasks.filter((task) => task.storyId === storyId)
  },

  async create(
    nazwa: string,
    opis: string,
    priorytet: 'niski' | 'sredni' | 'wysoki',
    storyId: string,
    przewidywanyCzas: string,
  ): Promise<Task> {
    const newTask: Task = {
      id: createId(),
      nazwa,
      opis,
      priorytet,
      storyId,
      przewidywanyCzas,
      stan: 'todo',
      dataDodania: new Date().toISOString(),
      dataStart: null,
      dataKonca: null,
      uzytkownikId: null,
    }

    if (!isFirebaseMode) {
      const tasks = getLocalTasks()
      tasks.push(newTask)
      saveLocalTasks(tasks)
      return newTask
    }

    await setDoc(doc(db, 'tasks', newTask.id), newTask)
    return newTask
  },

  async update(
    id: string,
    nazwa: string,
    opis: string,
    priorytet: 'niski' | 'sredni' | 'wysoki',
  ): Promise<void> {
    if (!isFirebaseMode) {
      const tasks = getLocalTasks()
      const index = tasks.findIndex((item) => item.id === id)
      if (index !== -1) {
        tasks[index].nazwa = nazwa
        tasks[index].opis = opis
        tasks[index].priorytet = priorytet
        saveLocalTasks(tasks)
      }
      return
    }

    await updateDoc(doc(db, 'tasks', id), { nazwa, opis, priorytet })
  },

  async delete(id: string): Promise<void> {
    if (!isFirebaseMode) {
      const tasks = getLocalTasks()
      const filtered = tasks.filter((item) => item.id !== id)
      saveLocalTasks(filtered)
      return
    }

    await deleteDoc(doc(db, 'tasks', id))
  },

  async assignUser(taskId: string, userId: string): Promise<void> {
    const tasks = await this.getAll()
    const taskIndex = tasks.findIndex((item) => item.id === taskId)

    if (taskIndex === -1) {
      return
    }

    const dataStart = new Date().toISOString()
    const targetTask = {
      ...tasks[taskIndex],
      stan: 'doing' as const,
      dataStart,
      uzytkownikId: userId,
    }

    if (!isFirebaseMode) {
      tasks[taskIndex] = targetTask
      saveLocalTasks(tasks)
    } else {
      await updateDoc(doc(db, 'tasks', taskId), {
        stan: 'doing',
        dataStart,
        uzytkownikId: userId,
      })
    }

    const stories = await storyService.getAll()
    const story = stories.find((item) => item.id === targetTask.storyId)
    if (story && story.stan === 'todo') {
      await storyService.changeStatus(story.id, 'doing')
    }
  },

  async completeTask(taskId: string): Promise<void> {
    const tasks = await this.getAll()
    const taskIndex = tasks.findIndex((item) => item.id === taskId)

    if (taskIndex === -1) {
      return
    }

    const dataKonca = new Date().toISOString()
    const targetTask = {
      ...tasks[taskIndex],
      stan: 'done' as const,
      dataKonca,
    }

    if (!isFirebaseMode) {
      tasks[taskIndex] = targetTask
      saveLocalTasks(tasks)
    } else {
      await updateDoc(doc(db, 'tasks', taskId), {
        stan: 'done',
        dataKonca,
      })
    }

    const tasksForStory = (await this.getAll()).filter((task) => task.storyId === targetTask.storyId)
    const allDone = tasksForStory.every((task) => task.stan === 'done')

    if (allDone) {
      await storyService.changeStatus(targetTask.storyId, 'done')
    }
  },
}
