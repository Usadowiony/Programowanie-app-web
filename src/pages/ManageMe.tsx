import { useState } from 'react'
import { useEffect } from 'react'
import { projectService } from '../services/projectService'

function ManageMe() {
    const [projects, setProjects] = useState(projectService.getAll())
    const [nazwa, setNazwa] = useState('')
    const [opis, setOpis] = useState('')

    useEffect(() => {
        setProjects(projectService.getAll())
    }, [])

    const projectAdd = () => {
        if (nazwa.trim() === '') {
            alert('Nazwa nie może być pusta!')
            return
        }
        if (opis.trim() === '') {
            alert('Opis nie może być pusty!')
            return
        }
        projectService.create(nazwa, opis)
        setProjects(projectService.getAll())
        setNazwa('')
        setOpis('')
    }

    const projectDelete = (id: string) => {
        projectService.delete(id)
        setProjects(projectService.getAll())
    }

    const projectEdit = (id: string) => {
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
    
    projectService.update(id, newNazwa, newOpis)
    setProjects(projectService.getAll())
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
          </div>
        ))}
      </div>
    </div>
    )
}

export default ManageMe