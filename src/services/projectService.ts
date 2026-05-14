import { getStorageDriver } from '../drivers/driverFactory'

export interface Project {
  id: string
  nazwa: string
  opis: string
}

const COLLECTION = 'projects'
const ACTIVE_PROJECT_ID_KEY = 'activeProjectId'
const LEGACY_ACTIVE_PROJECT_KEY = 'activeProject'

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const projectService = {
  async getAll(): Promise<Project[]> {
    const driver = getStorageDriver()
    return driver.getAll<Project>(COLLECTION)
  },

  async create(nazwa: string, opis: string): Promise<Project> {
    const driver = getStorageDriver()
    const newProject: Project = {
      id: createId(),
      nazwa,
      opis,
    }

    await driver.create(COLLECTION, newProject.id, newProject)
    return newProject
  },

  async delete(id: string): Promise<void> {
    const driver = getStorageDriver()
    await driver.remove(COLLECTION, id)

    if (localStorage.getItem(ACTIVE_PROJECT_ID_KEY) === id) {
      localStorage.removeItem(ACTIVE_PROJECT_ID_KEY)
    }
  },

  async update(id: string, newNazwa: string, newOpis: string): Promise<void> {
    const driver = getStorageDriver()
    await driver.update(COLLECTION, id, { nazwa: newNazwa, opis: newOpis })
  },

  async setActiveProject(id: string): Promise<void> {
    localStorage.setItem(ACTIVE_PROJECT_ID_KEY, id)
    localStorage.removeItem(LEGACY_ACTIVE_PROJECT_KEY)
  },

  getActiveProjectId(): string | null {
    const activeProjectId = localStorage.getItem(ACTIVE_PROJECT_ID_KEY)

    if (activeProjectId) {
      return activeProjectId
    }

    // Migracja ze starego formatu
    const legacy = localStorage.getItem(LEGACY_ACTIVE_PROJECT_KEY)
    if (!legacy) {
      return null
    }

    try {
      const parsed = JSON.parse(legacy) as Project
      if (parsed?.id) {
        localStorage.setItem(ACTIVE_PROJECT_ID_KEY, parsed.id)
        localStorage.removeItem(LEGACY_ACTIVE_PROJECT_KEY)
        return parsed.id
      }
    } catch {
      localStorage.removeItem(LEGACY_ACTIVE_PROJECT_KEY)
    }

    return null
  },

  async getActiveProject(): Promise<Project | null> {
    const activeProjectId = this.getActiveProjectId()

    if (!activeProjectId) {
      return null
    }

    const driver = getStorageDriver()
    const project = await driver.getById<Project>(COLLECTION, activeProjectId)
    return project
  },
}
