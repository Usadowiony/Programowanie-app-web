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
  }
}