interface Story {
  id: string
  nazwa: string
  opis: string
  priorytet: 'niski' | 'sredni' | 'wysoki'
  projektId: string
  dataUtworzenia: string
  stan: 'todo' | 'doing' | 'done'
  wlascicielId: string
}

export const storyService = {
  getAll(): Story[] {
    const data = localStorage.getItem('stories')
    return data ? JSON.parse(data) : []
  },

  getByProject(projektId: string): Story[] {
    const all = this.getAll()
    return all.filter(s => s.projektId === projektId)
  },

  create(nazwa: string, opis: string, priorytet: 'niski' | 'sredni' | 'wysoki', projektId: string, wlascicielId: string): Story {
    const stories = this.getAll()
    const newStory: Story = {
      id: Date.now().toString(),
      nazwa,
      opis,
      priorytet,
      projektId,
      dataUtworzenia: new Date().toISOString(),
      stan: 'todo',
      wlascicielId
    }
    stories.push(newStory)
    localStorage.setItem('stories', JSON.stringify(stories))
    return newStory
  },

  update(id: string, nazwa: string, opis: string, priorytet: 'niski' | 'sredni' | 'wysoki', stan: 'todo' | 'doing' | 'done'): void {
    const stories = this.getAll()
    const index = stories.findIndex(s => s.id === id)
    if (index !== -1) {
      stories[index].nazwa = nazwa
      stories[index].opis = opis
      stories[index].priorytet = priorytet
      stories[index].stan = stan
      localStorage.setItem('stories', JSON.stringify(stories))
    }
  },

  delete(id: string): void {
    const stories = this.getAll()
    const filtered = stories.filter(s => s.id !== id)
    localStorage.setItem('stories', JSON.stringify(filtered))
  },

  changeStatus(id: string, stan: 'todo' | 'doing' | 'done'): void {
    const stories = this.getAll()
    const index = stories.findIndex(s => s.id === id)
    if (index !== -1) {
      stories[index].stan = stan
      localStorage.setItem('stories', JSON.stringify(stories))
    }
  }
}

export type { Story }
