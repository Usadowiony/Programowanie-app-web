import { useProjects } from '../hooks/useProjects'

function Projects() {
  const {
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
  } = useProjects()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 md:p-8">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800 text-center mb-8">Projekty</h1>
      
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-3 mb-8">
        <input 
          value={nazwa} 
          onChange={e => setNazwa(e.target.value)} 
          placeholder="Nazwa" 
          className="flex-1 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
        />
        <input 
          value={opis} 
          onChange={e => setOpis(e.target.value)} 
          placeholder="Opis" 
          className="flex-1 px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400" 
        />
        <button 
          onClick={addProject} 
          className="cursor-pointer px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded shadow transition-colors"
        >
          Dodaj projekt
        </button>
      </div>

      <div className="w-full max-w-3xl space-y-4">
        {projects.map((project) => (
          <div key={project.id} className='w-full bg-white p-5 rounded-lg shadow-md border border-gray-100'>
            <h3 className="text-xl font-bold mb-2 text-gray-800 break-words">{project.nazwa}</h3>
            <p className="mb-4 text-gray-600 break-words">{project.opis}</p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => deleteProject(project.id)} 
                className="cursor-pointer px-4 py-2 bg-red-500 hover:bg-red-600 transition-colors text-white text-sm font-medium rounded flex-1 md:flex-none"
              >
                Usuń
              </button>
              <button 
                onClick={() => editProject(project.id)} 
                className="cursor-pointer px-4 py-2 bg-yellow-500 hover:bg-yellow-600 transition-colors text-white text-sm font-medium rounded flex-1 md:flex-none"
              >
                Edytuj
              </button>
              <button 
                onClick={() => setActiveProject(project.id)} 
                disabled={activeProjectId === project.id}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors w-full md:w-auto md:ml-auto ${
                  activeProjectId === project.id 
                    ? 'bg-green-500 text-white opacity-80 cursor-not-allowed' 
                    : 'bg-gray-500 text-white cursor-pointer hover:bg-gray-600'
                }`}
              >
                {activeProjectId === project.id ? 'Aktywny' : 'Ustaw jako główny'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Projects