import { storyService } from './storyService'

interface Task {
  id: string
  nazwa: string
  opis: string
  priorytet: 'niski' | 'sredni' | 'wysoki'
  storyId: string
  przewidywanyCzas: string
  stan: 'todo' | 'doing' | 'done'
  dataDodania: string
  dataStart: string | null
  dataKonca: string | null
  uzytkownikId: number | null
}

export const taskService = {

  getAll(): Task[] {
    const data = localStorage.getItem('tasks')
    return data ? JSON.parse(data) : []
  },

  getByStory(storyId: string): Task[] {
    return this.getAll().filter(t => t.storyId === storyId)
  },

  create(
    nazwa: string, 
    opis: string, 
    priorytet: 'niski' | 'sredni' | 'wysoki', 
    storyId: string, 
    przewidywanyCzas: string
  ): Task {
    const tasks = this.getAll()
    const newTask: Task = {
      id: Date.now().toString(),
      nazwa,
      opis,
      priorytet,
      storyId,
      przewidywanyCzas,
      stan: 'todo',
      dataDodania: new Date().toISOString(),
      dataStart: null,
      dataKonca: null,
      uzytkownikId: null
    }
    tasks.push(newTask)
    localStorage.setItem('tasks', JSON.stringify(tasks))
    return newTask
  },

  update(
    id: string,
    nazwa: string,
    opis: string,
    priorytet: 'niski' | 'sredni' | 'wysoki'
  ): void {
    const tasks = this.getAll()
    const index = tasks.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks[index].nazwa = nazwa
      tasks[index].opis = opis
      tasks[index].priorytet = priorytet
      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  },

  delete(id: string): void {
    const tasks = this.getAll()
    const filtered = tasks.filter(t => t.id !== id)
    localStorage.setItem('tasks', JSON.stringify(filtered))
  },

  assignUser(taskId: string, userId: number): void {
    const tasks = this.getAll()
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    
    if (taskIndex !== -1) {
      tasks[taskIndex].stan = 'doing'
      tasks[taskIndex].dataStart = new Date().toISOString()
      tasks[taskIndex].uzytkownikId = userId

      const storyId = tasks[taskIndex].storyId
      const stories = storyService.getAll()
      const storyIndex = stories.findIndex(s => s.id === storyId)
      
      if (storyIndex !== -1 && stories[storyIndex].stan === 'todo') {
        stories[storyIndex].stan = 'doing'
        localStorage.setItem('stories', JSON.stringify(stories))
      }

      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  },

  completeTask(taskId: string): void {
    const tasks = this.getAll()
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    
    if (taskIndex !== -1) {

      tasks[taskIndex].stan = 'done'
      tasks[taskIndex].dataKonca = new Date().toISOString()

      const storyId = tasks[taskIndex].storyId
      const tasksForStory = tasks.filter(t => t.storyId === storyId)
      const allDone = tasksForStory.every(t => t.stan === 'done')

      if (allDone) {
        const stories = storyService.getAll()
        const storyIndex = stories.findIndex(s => s.id === storyId)
        if (storyIndex !== -1) {
          stories[storyIndex].stan = 'done'
          localStorage.setItem('stories', JSON.stringify(stories))
        }
      }

      localStorage.setItem('tasks', JSON.stringify(tasks))
    }
  }
}

export type { Task }