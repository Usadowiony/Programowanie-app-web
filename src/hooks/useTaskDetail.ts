import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { taskService, Task } from '../services/taskService'
import { storyService, Story } from '../services/storyService'
import { getAllUsers, getUserById } from '../services/userService'
import { notificationService } from '../services/notificationService'
import { safeAsync } from '../errors/errorHandler'

export function useTaskDetail(taskId: string | undefined) {
  const navigate = useNavigate()

  const [task, setTask] = useState<Task | null>(null)
  const [story, setStory] = useState<Story | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const availableUsers = getAllUsers().filter(u => u.role === 'developer' || u.role === 'devops')

  useEffect(() => {
    const loadDetails = async () => {
      if (!taskId) {
        return
      }

      const allTasks = await taskService.getAll()
      const foundTask = allTasks.find((item) => item.id === taskId)

      if (!foundTask) {
        setTask(null)
        setStory(null)
        setSelectedUserId(null)
        return
      }

      setTask(foundTask)

      const allStories = await storyService.getAll()
      const foundStory = allStories.find((item) => item.id === foundTask.storyId)
      setStory(foundStory || null)

      setSelectedUserId(foundTask.uzytkownikId || null)
    }

    void loadDetails()
  }, [taskId])

  const reloadTask = async () => {
    if (!taskId) return
    const updatedTask = (await taskService.getAll()).find((item) => item.id === taskId)
    if (updatedTask) {
      setTask(updatedTask)
    }
  }

  const assignUser = async () => {
    if (!selectedUserId || !taskId) {
      alert('Wybierz osobę!')
      return
    }

    await safeAsync(
      () => taskService.assignUser(taskId, selectedUserId),
      { operation: 'Przypisanie uzytkownika' },
    )

    if (task) {
      await safeAsync(
        () => notificationService.createForRecipients({
          title: 'Przypisanie do zadania',
          message: `Zostales przypisany do zadania: ${task.nazwa}`,
          priority: 'high',
          recipientIds: [selectedUserId],
        }),
        { operation: 'Wysylanie powiadomienia', silent: true },
      )

      if (story) {
        await safeAsync(
          () => notificationService.createForRecipients({
            title: 'Zmiana statusu zadania',
            message: `Zadanie ${task.nazwa} ma status doing`,
            priority: 'low',
            recipientIds: [story.wlascicielId],
          }),
          { operation: 'Wysylanie powiadomienia', silent: true },
        )
      }
    }

    await reloadTask()
    alert('Osoba przypisana!')
  }

  const completeTask = async () => {
    if (!taskId) return

    await safeAsync(
      () => taskService.completeTask(taskId),
      { operation: 'Zamykanie zadania' },
    )

    if (task && story) {
      await safeAsync(
        () => notificationService.createForRecipients({
          title: 'Zmiana statusu zadania',
          message: `Zadanie ${task.nazwa} ma status done`,
          priority: 'medium',
          recipientIds: [story.wlascicielId],
        }),
        { operation: 'Wysylanie powiadomienia', silent: true },
      )
    }

    await reloadTask()
    alert('Zadanie zamknięte!')
  }

  const deleteTask = async () => {
    if (!taskId || !task) {
      return
    }

    const shouldDelete = window.confirm('Czy na pewno usunac to zadanie?')
    if (!shouldDelete) {
      return
    }

    await safeAsync(
      () => taskService.delete(taskId),
      { operation: 'Usuwanie zadania' },
    )

    if (story) {
      await safeAsync(
        () => notificationService.createForRecipients({
          title: 'Usuniecie zadania z historyjki',
          message: `Usunieto zadanie: ${task.nazwa}`,
          priority: 'medium',
          recipientIds: [story.wlascicielId],
        }),
        { operation: 'Wysylanie powiadomienia', silent: true },
      )
    }

    alert('Zadanie usuniete!')
    navigate('/tasks')
  }

  const assignedUser = task?.uzytkownikId ? getUserById(task.uzytkownikId) : null

  return {
    task,
    story,
    assignedUser,
    selectedUserId,
    setSelectedUserId,
    availableUsers,
    assignUser,
    completeTask,
    deleteTask,
    navigate,
  }
}
