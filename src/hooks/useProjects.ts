import { useState, useEffect } from 'react'
import { projectService, Project } from '../services/projectService'
import { getAllUsers } from '../services/userService'
import { notificationService } from '../services/notificationService'
import { safeAsync } from '../errors/errorHandler'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [nazwa, setNazwa] = useState('')
  const [opis, setOpis] = useState('')
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  const loadProjects = async () => {
    const allProjects = await projectService.getAll()
    setProjects(allProjects)

    const active = await projectService.getActiveProject()
    setActiveProjectId(active ? active.id : null)
  }

  useEffect(() => {
    void loadProjects()
  }, [])

  const addProject = async () => {
    if (nazwa.trim() === '') {
      alert('Nazwa nie może być pusta!')
      return
    }
    if (opis.trim() === '') {
      alert('Opis nie może być pusty!')
      return
    }

    const project = await safeAsync(
      () => projectService.create(nazwa, opis),
      { operation: 'Tworzenie projektu' },
    )

    if (!project) {
      return
    }

    const adminIds = getAllUsers()
      .filter((user) => user.role === 'admin')
      .map((user) => user.id)

    if (adminIds.length > 0) {
      await safeAsync(
        () => notificationService.createForRecipients({
          title: 'Utworzono nowy projekt',
          message: `Powstal projekt: ${project.nazwa}`,
          priority: 'high',
          recipientIds: adminIds,
        }),
        { operation: 'Wysylanie powiadomienia', silent: true },
      )
    }

    await loadProjects()
    setNazwa('')
    setOpis('')
  }

  const deleteProject = async (id: string) => {
    await safeAsync(
      () => projectService.delete(id),
      { operation: 'Usuwanie projektu' },
    )
    await loadProjects()
  }

  const editProject = async (id: string) => {
    const newNazwa = prompt('Podaj nową nazwę projektu:')
    if (!newNazwa || newNazwa.trim() === '') {
      alert('Nazwa nie może być pusta!')
      return
    }

    const newOpis = prompt('Podaj nowy opis projektu:')
    if (!newOpis || newOpis.trim() === '') {
      alert('Opis nie może być pusty!')
      return
    }

    await safeAsync(
      () => projectService.update(id, newNazwa, newOpis),
      { operation: 'Edycja projektu' },
    )
    await loadProjects()
  }

  const setActiveProject = async (id: string) => {
    await projectService.setActiveProject(id)
    setActiveProjectId(id)
  }

  return {
    projects,
    nazwa,
    setNazwa,
    opis,
    setOpis,
    activeProjectId,
    addProject,
    deleteProject,
    editProject,
    setActiveProject,
  }
}
