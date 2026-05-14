import { getStorageDriver } from '../drivers/driverFactory'

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

const COLLECTION = 'stories'

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const storyService = {
  async getAll(): Promise<Story[]> {
    const driver = getStorageDriver()
    return driver.getAll<Story>(COLLECTION)
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
    const driver = getStorageDriver()
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

    await driver.create(COLLECTION, newStory.id, newStory)
    return newStory
  },

  async update(
    id: string,
    nazwa: string,
    opis: string,
    priorytet: 'niski' | 'sredni' | 'wysoki',
    stan: 'todo' | 'doing' | 'done',
  ): Promise<void> {
    const driver = getStorageDriver()
    await driver.update(COLLECTION, id, { nazwa, opis, priorytet, stan })
  },

  async delete(id: string): Promise<void> {
    const driver = getStorageDriver()
    await driver.remove(COLLECTION, id)
  },

  async changeStatus(id: string, stan: 'todo' | 'doing' | 'done'): Promise<void> {
    const driver = getStorageDriver()
    await driver.update(COLLECTION, id, { stan })
  },
}
