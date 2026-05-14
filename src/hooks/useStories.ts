import { useState, useEffect } from 'react'
import { storyService, Story } from '../services/storyService'
import { getCurrentUser } from '../services/userService'
import { taskService } from '../services/taskService'
import { notificationService } from '../services/notificationService'
import { useActiveProject } from './useActiveProject'
import { safeAsync } from '../errors/errorHandler'

export function useStories() {
  const [stories, setStories] = useState<Story[]>([])
  const [nazwa, setNazwa] = useState('')
  const [opis, setOpis] = useState('')
  const [priorytet, setPriorytet] = useState<'niski' | 'sredni' | 'wysoki'>('niski')

  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'niski' | 'sredni' | 'wysoki'>('niski')
  const [newTaskTime, setNewTaskTime] = useState('')
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null)

  const { project: activeProject, isLoading: isProjectLoading } = useActiveProject()
  const user = getCurrentUser()

  const loadStories = async () => {
    if (!activeProject) {
      setStories([])
      return
    }

    const projectStories = await storyService.getByProject(activeProject.id)
    setStories(projectStories)
  }

  useEffect(() => {
    void loadStories()
  }, [activeProject?.id])

  const addStory = async () => {
    if (!activeProject) {
      alert('Najpierw wybierz aktywny projekt!')
      return
    }

    if (!user) {
      alert('Brak zalogowanego użytkownika!')
      return
    }

    if (nazwa.trim() === '') {
      alert('Nazwa nie może być pusta!')
      return
    }

    if (opis.trim() === '') {
      alert('Opis nie może być pusty!')
      return
    }

    const newStory = await safeAsync(
      () => storyService.create(nazwa, opis, priorytet, activeProject.id, user.id),
      { operation: 'Dodawanie historyjki' },
    )

    if (!newStory) {
      return
    }

    await safeAsync(
      () => notificationService.createForRecipients({
        title: 'Przypisanie do historyjki',
        message: `Jestes wlascicielem historyjki: ${newStory.nazwa}`,
        priority: 'high',
        recipientIds: [newStory.wlascicielId],
      }),
      { operation: 'Wysylanie powiadomienia', silent: true },
    )

    setNazwa('')
    setOpis('')
    setPriorytet('niski')
    await loadStories()
  }

  const deleteStory = async (id: string) => {
    await safeAsync(
      () => storyService.delete(id),
      { operation: 'Usuwanie historyjki' },
    )
    await loadStories()
  }

  const editStory = async (story: Story) => {
    const newNazwa = prompt('Podaj nową nazwę:', story.nazwa)
    if (!newNazwa || newNazwa.trim() === '') {
      alert('Nazwa nie może być pusta!')
      return
    }
    const newOpis = prompt('Podaj nowy opis:', story.opis)
    if (!newOpis || newOpis.trim() === '') {
      alert('Opis nie może być pusty!')
      return
    }
    const newPriorytet = prompt('Podaj priorytet (niski/sredni/wysoki):', story.priorytet) as 'niski' | 'sredni' | 'wysoki'
    if (!['niski', 'sredni', 'wysoki'].includes(newPriorytet)) {
      alert('Nieprawidłowy priorytet!')
      return
    }

    await safeAsync(
      () => storyService.update(story.id, newNazwa, newOpis, newPriorytet, story.stan),
      { operation: 'Edycja historyjki' },
    )
    await loadStories()
  }

  const changeStoryStatus = async (id: string, stan: 'todo' | 'doing' | 'done') => {
    await safeAsync(
      () => storyService.changeStatus(id, stan),
      { operation: 'Zmiana statusu historyjki' },
    )
    await loadStories()
  }

  const addTask = async (storyId: string) => {
    if (newTaskName.trim() === '') {
      alert('Nazwa zadania nie może być pusta!')
      return
    }
    if (newTaskDesc.trim() === '') {
      alert('Opis zadania nie może być pusty!')
      return
    }

    const newTask = await safeAsync(
      () => taskService.create(newTaskName, newTaskDesc, newTaskPriority, storyId, newTaskTime),
      { operation: 'Dodawanie zadania' },
    )

    if (!newTask) {
      return
    }

    const allStories = await storyService.getAll()
    const story = allStories.find((item) => item.id === storyId)
    if (story) {
      await safeAsync(
        () => notificationService.createForRecipients({
          title: 'Nowe zadanie w historyjce',
          message: `Dodano zadanie: ${newTask.nazwa}`,
          priority: 'medium',
          recipientIds: [story.wlascicielId],
        }),
        { operation: 'Wysylanie powiadomienia', silent: true },
      )
    }

    setNewTaskName('')
    setNewTaskDesc('')
    setNewTaskPriority('niski')
    setNewTaskTime('')
    setExpandedStoryId(null)
    await loadStories()
  }

  const todoStories = stories.filter(s => s.stan === 'todo')
  const doingStories = stories.filter(s => s.stan === 'doing')
  const doneStories = stories.filter(s => s.stan === 'done')

  return {
    // Stan ogólny
    user,
    activeProject,
    isProjectLoading,
    stories,
    todoStories,
    doingStories,
    doneStories,

    // Formularz historyjki
    nazwa,
    setNazwa,
    opis,
    setOpis,
    priorytet,
    setPriorytet,

    // Formularz zadania
    newTaskName,
    setNewTaskName,
    newTaskDesc,
    setNewTaskDesc,
    newTaskPriority,
    setNewTaskPriority,
    newTaskTime,
    setNewTaskTime,
    expandedStoryId,
    setExpandedStoryId,

    // Akcje
    addStory,
    deleteStory,
    editStory,
    changeStoryStatus,
    addTask,
  }
}
