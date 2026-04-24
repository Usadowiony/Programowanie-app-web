import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { isFirebaseMode } from '../config/dataStorage'
import { db } from './firebase'

export interface Project {
  id: string
  nazwa: string
  opis: string
}

const PROJECTS_KEY = 'projects'
const ACTIVE_PROJECT_ID_KEY = 'activeProjectId'
const LEGACY_ACTIVE_PROJECT_KEY = 'activeProject'

const getLocalProjects = (): Project[] => {
  const data = localStorage.getItem(PROJECTS_KEY)
  return data ? JSON.parse(data) as Project[] : []
}

const saveLocalProjects = (projects: Project[]) => {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const projectService = {
  async getAll(): Promise<Project[]> {
    if (!isFirebaseMode) {
      return getLocalProjects()
    }

    const projectsSnapshot = await getDocs(collection(db, 'projects'))
    return projectsSnapshot.docs.map((item) => {
      const data = item.data() as Omit<Project, 'id'> & Partial<Pick<Project, 'id'>>
      return {
        id: data.id || item.id,
        nazwa: data.nazwa,
        opis: data.opis,
      }
    })
  },

  async create(nazwa: string, opis: string): Promise<Project> {
    const newProject: Project = {
      id: createId(),
      nazwa,
      opis,
    }

    if (!isFirebaseMode) {
      const projects = getLocalProjects()
      projects.push(newProject)
      saveLocalProjects(projects)
      return newProject
    }

    await setDoc(doc(db, 'projects', newProject.id), newProject)
    return newProject
  },

  async delete(id: string): Promise<void> {
    if (!isFirebaseMode) {
      const projects = getLocalProjects()
      const filtered = projects.filter((item) => item.id !== id)
      saveLocalProjects(filtered)
    } else {
      await deleteDoc(doc(db, 'projects', id))
    }

    if (localStorage.getItem(ACTIVE_PROJECT_ID_KEY) === id) {
      localStorage.removeItem(ACTIVE_PROJECT_ID_KEY)
    }
  },

  async update(id: string, newNazwa: string, newOpis: string): Promise<void> {
    if (!isFirebaseMode) {
      const projects = getLocalProjects()
      const index = projects.findIndex((item) => item.id === id)
      if (index !== -1) {
        projects[index].nazwa = newNazwa
        projects[index].opis = newOpis
        saveLocalProjects(projects)
      }
      return
    }

    await updateDoc(doc(db, 'projects', id), { nazwa: newNazwa, opis: newOpis })
  },

  async setActiveProject(id: string): Promise<void> {
    localStorage.setItem(ACTIVE_PROJECT_ID_KEY, id)
    localStorage.removeItem(LEGACY_ACTIVE_PROJECT_KEY)
  },

  async getActiveProject(): Promise<Project | null> {
    const activeProjectId = localStorage.getItem(ACTIVE_PROJECT_ID_KEY)

    if (!activeProjectId) {
      const legacy = localStorage.getItem(LEGACY_ACTIVE_PROJECT_KEY)
      if (!legacy) {
        return null
      }

      try {
        const parsed = JSON.parse(legacy) as Project
        if (parsed?.id) {
          localStorage.setItem(ACTIVE_PROJECT_ID_KEY, parsed.id)
          localStorage.removeItem(LEGACY_ACTIVE_PROJECT_KEY)
          return parsed
        }
      } catch {
        localStorage.removeItem(LEGACY_ACTIVE_PROJECT_KEY)
      }

      return null
    }

    if (isFirebaseMode) {
      const snapshot = await getDoc(doc(db, 'projects', activeProjectId))
      if (!snapshot.exists()) {
        return null
      }

      const data = snapshot.data() as Omit<Project, 'id'> & Partial<Pick<Project, 'id'>>
      return {
        id: data.id || snapshot.id,
        nazwa: data.nazwa,
        opis: data.opis,
      }
    }

    const projects = await this.getAll()
    const found = projects.find((project) => project.id === activeProjectId)
    return found || null
  },
}
