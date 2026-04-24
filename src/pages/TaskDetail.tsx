import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { taskService, Task } from '../services/taskService'
import { storyService, Story } from '../services/storyService'
import { getAllUsers, getUserById } from '../services/userService'
import { notificationService } from '../services/notificationService'

function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>()
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

      if (foundTask.uzytkownikId) {
        setSelectedUserId(foundTask.uzytkownikId)
      } else {
        setSelectedUserId(null)
      }
    }

    void loadDetails()
  }, [taskId])

  const handleAssignUser = async () => {
    if (!selectedUserId || !taskId) {
      alert('Wybierz osobę!')
      return
    }
    
    await taskService.assignUser(taskId, selectedUserId)

    if (task) {
      await notificationService.createForRecipients({
        title: 'Przypisanie do zadania',
        message: `Zostales przypisany do zadania: ${task.nazwa}`,
        priority: 'high',
        recipientIds: [selectedUserId],
      })

      if (story) {
        await notificationService.createForRecipients({
          title: 'Zmiana statusu zadania',
          message: `Zadanie ${task.nazwa} ma status doing`,
          priority: 'low',
          recipientIds: [story.wlascicielId],
        })
      }
    }
    
    const updatedTask = (await taskService.getAll()).find((item) => item.id === taskId)
    if (updatedTask) {
      setTask(updatedTask)
    }
    
    alert('Osoba przypisana!')
  }

  const handleCompleteTask = async () => {
    if (!taskId) return
    
    await taskService.completeTask(taskId)

    if (task && story) {
      await notificationService.createForRecipients({
        title: 'Zmiana statusu zadania',
        message: `Zadanie ${task.nazwa} ma status done`,
        priority: 'medium',
        recipientIds: [story.wlascicielId],
      })
    }
    
    const updatedTask = (await taskService.getAll()).find((item) => item.id === taskId)
    if (updatedTask) {
      setTask(updatedTask)
    }
    
    alert('Zadanie zamknięte!')
  }

  const handleDeleteTask = async () => {
    if (!taskId || !task) {
      return
    }

    const shouldDelete = window.confirm('Czy na pewno usunac to zadanie?')
    if (!shouldDelete) {
      return
    }

    await taskService.delete(taskId)

    if (story) {
      await notificationService.createForRecipients({
        title: 'Usuniecie zadania z historyjki',
        message: `Usunieto zadanie: ${task.nazwa}`,
        priority: 'medium',
        recipientIds: [story.wlascicielId],
      })
    }

    alert('Zadanie usuniete!')
    navigate('/tasks')
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h1 className="text-2xl">Ładowanie...</h1>
      </div>
    )
  }

  const assignedUser = task.uzytkownikId ? getUserById(task.uzytkownikId) : null

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        
        <h1 className="text-4xl font-bold mb-2">{task.nazwa}</h1>
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-500 hover:underline cursor-pointer"
        >
          ← Wróć
        </button>

        <div className="mb-6 bg-gray-50 p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Informacje o zadaniu</h2>
          
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Opis:</span>
              <p className="text-gray-700">{task.opis}</p>
            </div>

            <div>
              <span className="font-semibold">Priorytet:</span>
              <p className="text-gray-700">{task.priorytet}</p>
            </div>

            <div>
              <span className="font-semibold">Przewidywany czas:</span>
              <p className="text-gray-700">{task.przewidywanyCzas}</p>
            </div>

            <div>
              <span className="font-semibold">Stan:</span>
              <p className={`text-gray-700 font-bold ${
                task.stan === 'done' ? 'text-green-600' :
                task.stan === 'doing' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {task.stan.toUpperCase()}
              </p>
            </div>

            <div>
              <span className="font-semibold">Data dodania:</span>
              <p className="text-gray-700">{new Date(task.dataDodania).toLocaleDateString('pl-PL')}</p>
            </div>

            {task.dataStart && (
              <div>
                <span className="font-semibold">Data startu:</span>
                <p className="text-gray-700">{new Date(task.dataStart).toLocaleDateString('pl-PL')}</p>
              </div>
            )}

            {task.dataKonca && (
              <div>
                <span className="font-semibold">Data końca:</span>
                <p className="text-gray-700">{new Date(task.dataKonca).toLocaleDateString('pl-PL')}</p>
              </div>
            )}
          </div>
        </div>

        {story && (
          <div className="mb-6 bg-blue-50 p-4 rounded border-l-4 border-blue-500">
            <h2 className="text-xl font-bold mb-2">Przypisana historyjka</h2>
            <p className="font-semibold">{story.nazwa}</p>
            <p className="text-gray-700">{story.opis}</p>
          </div>
        )}

        {assignedUser && (
          <div className="mb-6 bg-green-50 p-4 rounded border-l-4 border-green-500">
            <h2 className="text-xl font-bold mb-2">Przypisana osoba</h2>
            <p className="text-gray-700">{assignedUser.firstName} {assignedUser.lastName}</p>
            <p className="text-sm text-gray-600">Rola: {assignedUser.role}</p>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-500">
          <h2 className="text-xl font-bold mb-4">Akcje</h2>

          {task.stan === 'todo' && (
            <div className="mb-6">
              <label className="block font-semibold mb-2">Przypisz osobę:</label>
              <div className="flex gap-2">
                <select
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(e.target.value || null)}
                  className="flex-1 px-4 py-2 border rounded"
                >
                  <option value="">-- Wybierz osobę --</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.role})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignUser}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer font-semibold"
                >
                  Przypisz
                </button>
              </div>
            </div>
          )}

          {task.stan === 'doing' && (
            <button
              onClick={handleCompleteTask}
              className="w-full px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer font-semibold text-lg"
            >
              Zamknij zadanie
            </button>
          )}

          {task.stan === 'done' && (
            <p className="text-green-600 font-bold text-lg">✅ Zadanie jest zamknięte</p>
          )}

          <button
            type="button"
            onClick={handleDeleteTask}
            className="w-full mt-4 px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer font-semibold"
          >
            Usun zadanie
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskDetail