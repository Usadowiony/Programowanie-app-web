import { getStorageDriver } from '../drivers/driverFactory'
import { shouldStoryMoveToDoing, shouldStoryMoveToDone } from '../domain/businessRules'
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

const COLLECTION = 'tasks'

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const taskService = {
  async getAll(): Promise<Task[]> {
    const driver = getStorageDriver()
    return driver.getAll<Task>(COLLECTION)
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
    const driver = getStorageDriver()
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

    await driver.create(COLLECTION, newTask.id, newTask)
    return newTask
  },

  async update(
    id: string,
    nazwa: string,
    opis: string,
    priorytet: 'niski' | 'sredni' | 'wysoki',
  ): Promise<void> {
    const driver = getStorageDriver()
    await driver.update(COLLECTION, id, { nazwa, opis, priorytet })
  },

  async delete(id: string): Promise<void> {
    const driver = getStorageDriver()
    await driver.remove(COLLECTION, id)
  },

  async assignUser(taskId: string, userId: string): Promise<void> {
    const driver = getStorageDriver()
    const dataStart = new Date().toISOString()

    await driver.update(COLLECTION, taskId, {
      stan: 'doing',
      dataStart,
      uzytkownikId: userId,
    })

    const task = await driver.getById<Task>(COLLECTION, taskId)
    if (!task) {
      return
    }

    const stories = await storyService.getAll()
    const story = stories.find((item) => item.id === task.storyId)

    if (story && shouldStoryMoveToDoing(story)) {
      await storyService.changeStatus(story.id, 'doing')
    }
  },

  async completeTask(taskId: string): Promise<void> {
    const driver = getStorageDriver()
    const dataKonca = new Date().toISOString()

    await driver.update(COLLECTION, taskId, {
      stan: 'done',
      dataKonca,
    })

    const task = await driver.getById<Task>(COLLECTION, taskId)
    if (!task) {
      return
    }

    const tasksForStory = await this.getByStory(task.storyId)

    if (shouldStoryMoveToDone(tasksForStory)) {
      await storyService.changeStatus(task.storyId, 'done')
    }
  },
}
