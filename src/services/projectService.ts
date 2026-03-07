interface Project {
  id: string
  nazwa: string
  opis: string
}

export const projectService = {
  getAll(): Project[] {
    const data = localStorage.getItem('projects')
    return data ? JSON.parse(data) : []
  },

  create(nazwa: string, opis: string): Project {
    const projects = this.getAll()
    const newProject: Project = {
      id: Date.now().toString(),
      nazwa,
      opis
    }
    projects.push(newProject)
    localStorage.setItem('projects', JSON.stringify(projects))
    return newProject
  },

  delete(id: string): void {
    const projects = this.getAll()
    const filtered = projects.filter(p => p.id !== id)
    localStorage.setItem('projects', JSON.stringify(filtered))
  },

  update(id: string, newNazwa: string, newOpis: string): void {
    const projects = this.getAll()
    const index = projects.findIndex(p => p.id === id)
    if (index !== -1) {
      projects[index].nazwa = newNazwa
      projects[index].opis = newOpis
      localStorage.setItem('projects', JSON.stringify(projects))
    }
  },

  setActiveProject(id: string){
      const projects = this.getAll()
      const index = projects.findIndex(p => p.id === id)
      if (index !== -1) {
        const activeProject = projects[index]
        localStorage.setItem('activeProject', JSON.stringify(activeProject))
      }
  },

  getActiveProject(): Project | null {
    const data = localStorage.getItem('activeProject')
    return data ? JSON.parse(data) : null
  }
  
}