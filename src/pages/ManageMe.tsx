import { useState } from 'react'
import { useEffect } from 'react'
import { projectService, Project } from '../services/projectService'
import { getAllUsers } from '../services/userService'
import { notificationService } from '../services/notificationService'

function ManageMe() {
  const [projects, setProjects] = useState<Project[]>([])
    const [nazwa, setNazwa] = useState('')
    const [opis, setOpis] = useState('')
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null)

  const loadProjects = async () => {
    const allProjects = await projectService.getAll()
    setProjects(allProjects)

    const active = await projectService.getActiveProject()
    if (active) {
      setActiveProjectId(active.id)
      return
    }

    setActiveProjectId(null)
  }

    useEffect(() => {
    void loadProjects()
    }, [])

  const projectAdd = async () => {
        if (nazwa.trim() === '') {
            alert('Nazwa nie może być pusta!')
            return
        }
        if (opis.trim() === '') {
            alert('Opis nie może być pusty!')
            return
        }
        const project = await projectService.create(nazwa, opis)

        const adminIds = getAllUsers()
          .filter((user) => user.role === 'admin')
          .map((user) => user.id)

        if (adminIds.length > 0) {
          await notificationService.createForRecipients({
            title: 'Utworzono nowy projekt',
            message: `Powstal projekt: ${project.nazwa}`,
            priority: 'high',
            recipientIds: adminIds,
          })
        }

        await loadProjects()
        setNazwa('')
        setOpis('')
    }

    const projectDelete = async (id: string) => {
        await projectService.delete(id)
        await loadProjects()
    }

    const projectEdit = async (id: string) => {
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
    
    await projectService.update(id, newNazwa, newOpis)
    await loadProjects()
  }

const projectSetActive = async (id: string) => {
  await projectService.setActiveProject(id)
  setActiveProjectId(id)
}

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-5xl font-bold text-gray-800">Manage Me</h1>
      <div className="mt-8">
        <input value={nazwa} onChange={e => setNazwa(e.target.value)} placeholder="Nazwa" className="px-4 py-2 border rounded mr-2" />
        <input value={opis} onChange={e => setOpis(e.target.value)} placeholder="Opis" className="px-4 py-2 border rounded mr-2" />
        <button onClick={projectAdd} className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded">Dodaj projekt</button>
      </div>
      <div className="mt-8">
        {projects.map((project) => (
          <div key={project.id} className='min-w-lg bg-white p-4 rounded mb-2'>
            <h3 className="font-bold mb-3">{project.nazwa}</h3>
            <p className="mb-3">{project.opis}</p>
            <button onClick={() => projectDelete(project.id)} className="cursor-pointer px-4 py-2 bg-red-500 text-white rounded">Usuń</button>
            <button onClick={() => projectEdit(project.id)} className="ml-2 cursor-pointer px-4 py-2 bg-yellow-500 text-white rounded">Edytuj</button>
            <button 
              onClick={() => projectSetActive(project.id)} 
              disabled={activeProjectId === project.id}
              className={`ml-2 px-4 py-2 rounded ${
                activeProjectId === project.id 
                  ? 'bg-green-500 text-white opacity-50 cursor-not-allowed' 
                  : 'bg-gray-500 text-white cursor-pointer hover:bg-gray-600'
              }`}
            >
              {activeProjectId === project.id ? 'Aktywny' : 'Ustaw jako główny'}
            </button>
          </div>
        ))}
      </div>
    </div>
    )
}

export default ManageMe