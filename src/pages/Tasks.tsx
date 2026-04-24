import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { taskService, Task } from '../services/taskService'
import { storyService, Story } from '../services/storyService'
import { projectService, Project } from '../services/projectService'
import { getUserById } from '../services/userService'

function Tasks() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [activeProject, setActiveProject] = useState<Project | null>(null)

  useEffect(() => {
    void loadTasks()
  }, [])

  const loadTasks = async () => {
    const currentProject = await projectService.getActiveProject()
    setActiveProject(currentProject)

    if (!currentProject) {
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
      return story && story.projektId === currentProject.id
    })

    setTasks(filteredTasks)
  }

  const todoTasks = tasks.filter(t => t.stan === 'todo')
  const doingTasks = tasks.filter(t => t.stan === 'doing')
  const doneTasks = tasks.filter(t => t.stan === 'done')

  const TaskCard = ({ task }: { task: Task }) => {
    const assignedUser = task.uzytkownikId ? getUserById(task.uzytkownikId) : null
    const story = stories.find((item) => item.id === task.storyId)
    
    const getPriorityColor = (priorytet: string) => {
      switch (priorytet) {
        case 'wysoki': return 'border-red-500 bg-red-50'
        case 'sredni': return 'border-yellow-500 bg-yellow-50'
        case 'niski': return 'border-green-500 bg-green-50'
        default: return 'border-gray-500 bg-gray-50'
      }
    }

    return (
      <div
        onClick={() => navigate(`/task/${task.id}`)}
        className={`p-4 rounded-lg shadow cursor-pointer hover:shadow-lg transition border-l-4 ${getPriorityColor(task.priorytet)}`}
      >
        <h3 className="font-bold mb-2">{task.nazwa}</h3>
        <p className="text-sm text-gray-600 mb-3">{task.opis}</p>

        {story && (
          <p className="text-xs bg-white px-2 py-1 rounded mb-2 inline-block">
            📖 {story.nazwa}
          </p>
        )}

        {assignedUser && (
          <p className="text-xs text-gray-700 mb-2">
            👤 {assignedUser.firstName} {assignedUser.lastName}
          </p>
        )}

        <div className="text-xs text-gray-500">
          ⏱️ {task.przewidywanyCzas}
        </div>
      </div>
    )
  }

  const KanbanColumn = ({
    title,
    tasks,
    color
  }: {
    title: string
    tasks: Task[]
    color: string
  }) => {
    return (
      <div className="flex-1 bg-gray-100 p-4 rounded-lg">
        <h2 className={`text-xl font-bold mb-4 ${color}`}>
          {title} ({tasks.length})
        </h2>
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <p className="text-gray-500 text-center py-8">Brak zadań</p>
          )}
        </div>
      </div>
    )
  }

  if (!activeProject) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Zadanie</h1>
          <p className="text-xl text-gray-600">Najpierw wybierz aktywny projekt w Manage Me</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 pb-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Zadania</h1>
        <p className="text-gray-600 mb-8">Projekt: {activeProject.nazwa}</p>

        <div className="grid grid-cols-3 gap-6">
          <KanbanColumn
            title="TODO"
            tasks={todoTasks}
            color="text-gray-700"
          />
          <KanbanColumn
            title="DOING"
            tasks={doingTasks}
            color="text-blue-700"
          />
          <KanbanColumn
            title="DONE"
            tasks={doneTasks}
            color="text-green-700"
          />
        </div>
      </div>
    </div>
  )
}

export default Tasks