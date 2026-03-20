import { useState, useEffect } from 'react'
import { storyService, Story } from '../services/storyService'
import { projectService } from '../services/projectService'
import { getCurrentUser } from '../services/userService'
import { taskService } from '../services/taskService'

function Stories() {
  const [stories, setStories] = useState<Story[]>([])
  const [nazwa, setNazwa] = useState('')
  const [opis, setOpis] = useState('')
  const [priorytet, setPriorytet] = useState<'niski' | 'sredni' | 'wysoki'>('niski')
  
  // Nowe state dla zadań
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'niski' | 'sredni' | 'wysoki'>('niski')
  const [newTaskTime, setNewTaskTime] = useState('')
  const [expandedStoryId, setExpandedStoryId] = useState<string | null>(null)
  
  const activeProject = projectService.getActiveProject()

  const user = getCurrentUser()

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = () => {
    if (activeProject) {
      setStories(storyService.getByProject(activeProject.id))
    } else {
      setStories([])
    }
  }

  const handleAdd = () => {
    if (!activeProject) {
      alert('Najpierw wybierz aktywny projekt!')
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
    storyService.create(nazwa, opis, priorytet, activeProject.id, user.id)
    setNazwa('')
    setOpis('')
    setPriorytet('niski')
    loadStories()
  }

  const handleDelete = (id: string) => {
    storyService.delete(id)
    loadStories()
  }

  const handleEdit = (story: Story) => {
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
    storyService.update(story.id, newNazwa, newOpis, newPriorytet, story.stan)
    loadStories()
  }

  const handleChangeStatus = (id: string, stan: 'todo' | 'doing' | 'done') => {
    storyService.changeStatus(id, stan)
    loadStories()
  }

  const handleAddTask = (storyId: string) => {
    if (newTaskName.trim() === '') {
      alert('Nazwa zadania nie może być pusta!')
      return
    }
    if (newTaskDesc.trim() === '') {
      alert('Opis zadania nie może być pusty!')
      return
    }
    taskService.create(newTaskName, newTaskDesc, newTaskPriority, storyId, newTaskTime)
    setNewTaskName('')
    setNewTaskDesc('')
    setNewTaskPriority('niski')
    setNewTaskTime('')
    setExpandedStoryId(null)
    loadStories()
  }

  const getPriorityColor = (priorytet: string) => {
    switch (priorytet) {
      case 'wysoki': return 'text-red-600 font-bold'
      case 'sredni': return 'text-yellow-600 font-semibold'
      case 'niski': return 'text-green-600'
      default: return ''
    }
  }

  const todoStories = stories.filter(s => s.stan === 'todo')
  const doingStories = stories.filter(s => s.stan === 'doing')
  const doneStories = stories.filter(s => s.stan === 'done')

  if (!activeProject) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Historyjki</h1>
          <p className="text-xl text-gray-600">Najpierw wybierz aktywny projekt w Manage Me</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 pb-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Historyjki</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Dodaj nową historyjkę</h2>
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input
                value={nazwa}
                onChange={e => setNazwa(e.target.value)}
                placeholder="Nazwa"
                className="flex-1 px-4 py-2 border rounded"
              />
              <select
                value={priorytet}
                onChange={e => setPriorytet(e.target.value as 'niski' | 'sredni' | 'wysoki')}
                className="px-4 py-2 border rounded"
              >
                <option value="niski">Niski</option>
                <option value="sredni">Średni</option>
                <option value="wysoki">Wysoki</option>
              </select>
            </div>
            <textarea
              value={opis}
              onChange={e => setOpis(e.target.value)}
              placeholder="Opis"
              className="w-full px-4 py-2 border rounded"
              rows={3}
            />
            <button
              onClick={handleAdd}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 cursor-pointer"
            >
              Dodaj historyjke
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-700">TODO</h2>
            <div className="space-y-4">
              {todoStories.map(story => (
                <div key={story.id} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="font-bold mb-2">{story.nazwa}</h3>
                  <p className="text-sm text-gray-600 mb-2">{story.opis}</p>
                  <p className={`text-sm mb-3 ${getPriorityColor(story.priorytet)}`}>
                    Priorytet: {story.priorytet}
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleChangeStatus(story.id, 'doing')}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 cursor-pointer"
                    >
                      → Doing
                    </button>
                    <button
                      onClick={() => handleEdit(story)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 cursor-pointer"
                    >
                      Edytuj
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 cursor-pointer"
                    >
                      Usuń
                    </button>
                    <button
                      onClick={() => setExpandedStoryId(expandedStoryId === story.id ? null : story.id)}
                      className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 cursor-pointer"
                    >
                      {expandedStoryId === story.id ? '✕ Anuluj' : '+ Dodaj zadanie'}
                    </button>
                  </div>
                  {expandedStoryId === story.id && (
                    <div className="mt-4 p-4 border-t border-gray-200">
                      <input
                        type="text"
                        value={newTaskName}
                        onChange={e => setNewTaskName(e.target.value)}
                        placeholder="Nazwa zadania"
                        className="w-full px-3 py-2 border rounded mb-2"
                      />
                      <textarea
                        value={newTaskDesc}
                        onChange={e => setNewTaskDesc(e.target.value)}
                        placeholder="Opis zadania"
                        className="w-full px-3 py-2 border rounded mb-2"
                        rows={2}
                      />
                      <div className="flex gap-2 mb-2">
                        <select
                          value={newTaskPriority}
                          onChange={e => setNewTaskPriority(e.target.value as 'niski' | 'sredni' | 'wysoki')}
                          className="flex-1 px-3 py-2 border rounded"
                        >
                          <option value="niski">Niski</option>
                          <option value="sredni">Średni</option>
                          <option value="wysoki">Wysoki</option>
                        </select>
                        <input
                          type="text"
                          value={newTaskTime}
                          onChange={e => setNewTaskTime(e.target.value)}
                          placeholder="Czas (np. 8h)"
                          className="flex-1 px-3 py-2 border rounded"
                        />
                      </div>
                      <button
                        onClick={() => handleAddTask(story.id)}
                        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 cursor-pointer w-full"
                      >
                        Dodaj zadanie
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">DOING</h2>
            <div className="space-y-4">
              {doingStories.map(story => (
                <div key={story.id} className="bg-blue-50 p-6 rounded-lg shadow border-l-4 border-blue-500">
                  <h3 className="font-bold mb-2">{story.nazwa}</h3>
                  <p className="text-sm text-gray-600 mb-2">{story.opis}</p>
                  <p className={`text-sm mb-3 ${getPriorityColor(story.priorytet)}`}>
                    Priorytet: {story.priorytet}
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleChangeStatus(story.id, 'todo')}
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 cursor-pointer"
                    >
                      ← TODO
                    </button>
                    <button
                      onClick={() => handleChangeStatus(story.id, 'done')}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 cursor-pointer"
                    >
                      → Done
                    </button>
                    <button
                      onClick={() => handleEdit(story)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 cursor-pointer"
                    >
                      Edytuj
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 cursor-pointer"
                    >
                      Usuń
                    </button>
                    <button
                      onClick={() => setExpandedStoryId(expandedStoryId === story.id ? null : story.id)}
                      className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 cursor-pointer"
                    >
                      {expandedStoryId === story.id ? '✕ Anuluj' : '+ Dodaj zadanie'}
                    </button>
                  </div>
                  {expandedStoryId === story.id && (
                    <div className="mt-4 p-4 border-t border-gray-200">
                      <input
                        type="text"
                        value={newTaskName}
                        onChange={e => setNewTaskName(e.target.value)}
                        placeholder="Nazwa zadania"
                        className="w-full px-3 py-2 border rounded mb-2"
                      />
                      <textarea
                        value={newTaskDesc}
                        onChange={e => setNewTaskDesc(e.target.value)}
                        placeholder="Opis zadania"
                        className="w-full px-3 py-2 border rounded mb-2"
                        rows={2}
                      />
                      <div className="flex gap-2 mb-2">
                        <select
                          value={newTaskPriority}
                          onChange={e => setNewTaskPriority(e.target.value as 'niski' | 'sredni' | 'wysoki')}
                          className="flex-1 px-3 py-2 border rounded"
                        >
                          <option value="niski">Niski</option>
                          <option value="sredni">Średni</option>
                          <option value="wysoki">Wysoki</option>
                        </select>
                        <input
                          type="text"
                          value={newTaskTime}
                          onChange={e => setNewTaskTime(e.target.value)}
                          placeholder="Czas (np. 8h)"
                          className="flex-1 px-3 py-2 border rounded"
                        />
                      </div>
                      <button
                        onClick={() => handleAddTask(story.id)}
                        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 cursor-pointer w-full"
                      >
                        Dodaj zadanie
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-700">DONE</h2>
            <div className="space-y-4">
              {doneStories.map(story => (
                <div key={story.id} className="bg-green-50 p-6 rounded-lg shadow border-l-4 border-green-500">
                  <h3 className="font-bold mb-2">{story.nazwa}</h3>
                  <p className="text-sm text-gray-600 mb-2">{story.opis}</p>
                  <p className={`text-sm mb-3 ${getPriorityColor(story.priorytet)}`}>
                    Priorytet: {story.priorytet}
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleChangeStatus(story.id, 'doing')}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 cursor-pointer"
                    >
                      ← Doing
                    </button>
                    <button
                      onClick={() => handleEdit(story)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 cursor-pointer"
                    >
                      Edytuj
                    </button>
                    <button
                      onClick={() => handleDelete(story.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 cursor-pointer"
                    >
                      Usuń
                    </button>
                    <button
                      onClick={() => setExpandedStoryId(expandedStoryId === story.id ? null : story.id)}
                      className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 cursor-pointer"
                    >
                      {expandedStoryId === story.id ? '✕ Anuluj' : '+ Dodaj zadanie'}
                    </button>
                  </div>
                  {expandedStoryId === story.id && (
                    <div className="mt-4 p-4 border-t border-gray-200">
                      <input
                        type="text"
                        value={newTaskName}
                        onChange={e => setNewTaskName(e.target.value)}
                        placeholder="Nazwa zadania"
                        className="w-full px-3 py-2 border rounded mb-2"
                      />
                      <textarea
                        value={newTaskDesc}
                        onChange={e => setNewTaskDesc(e.target.value)}
                        placeholder="Opis zadania"
                        className="w-full px-3 py-2 border rounded mb-2"
                        rows={2}
                      />
                      <div className="flex gap-2 mb-2">
                        <select
                          value={newTaskPriority}
                          onChange={e => setNewTaskPriority(e.target.value as 'niski' | 'sredni' | 'wysoki')}
                          className="flex-1 px-3 py-2 border rounded"
                        >
                          <option value="niski">Niski</option>
                          <option value="sredni">Średni</option>
                          <option value="wysoki">Wysoki</option>
                        </select>
                        <input
                          type="text"
                          value={newTaskTime}
                          onChange={e => setNewTaskTime(e.target.value)}
                          placeholder="Czas (np. 8h)"
                          className="flex-1 px-3 py-2 border rounded"
                        />
                      </div>
                      <button
                        onClick={() => handleAddTask(story.id)}
                        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 cursor-pointer w-full"
                      >
                        Dodaj zadanie
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stories
