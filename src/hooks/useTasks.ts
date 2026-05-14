import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { taskService, Task } from '../services/taskService'
import { storyService, Story } from '../services/storyService'
import { useActiveProject } from './useActiveProject'

export function useTasks() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stories, setStories] = useState<Story[]>([])

  const { project: activeProject, isLoading: isProjectLoading } = useActiveProject()

  const loadTasks = async () => {
    if (!activeProject) {
      setTasks([])
      setStories([])
      return
    }

    const [allTasks, allStories] = await Promise.all([
      taskService.getAll(),
      storyService.getAll(),
    ])

    setStories(allStories)

    const filteredTasks = allTasks.filter((task) => {
      const story = allStories.find((item) => item.id === task.storyId)
      return story && story.projektId === activeProject.id
    })

    setTasks(filteredTasks)
  }

  useEffect(() => {
    void loadTasks()
  }, [activeProject?.id])

  const todoTasks = tasks.filter(t => t.stan === 'todo')
  const doingTasks = tasks.filter(t => t.stan === 'doing')
  const doneTasks = tasks.filter(t => t.stan === 'done')

  return {
    activeProject,
    isProjectLoading,
    tasks,
    stories,
    todoTasks,
    doingTasks,
    doneTasks,
    navigate,
  }
}
