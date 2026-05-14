import type { StorageDriver } from './StorageDriver'

export class LocalStorageDriver implements StorageDriver {
  private read<T>(collection: string): T[] {
    const raw = localStorage.getItem(collection)
    return raw ? (JSON.parse(raw) as T[]) : []
  }

  private write<T>(collection: string, items: T[]): void {
    localStorage.setItem(collection, JSON.stringify(items))
  }

  async getAll<T>(collection: string): Promise<T[]> {
    return this.read<T>(collection)
  }

  async getById<T>(collection: string, id: string): Promise<T | null> {
    const items = this.read<T & { id: string }>(collection)
    return items.find((item) => item.id === id) as T ?? null
  }

  async create<T>(collection: string, id: string, data: T): Promise<void> {
    const items = this.read<T>(collection)
    items.push(data)
    this.write(collection, items)
  }

  async update(collection: string, id: string, data: Record<string, unknown>): Promise<void> {
    const items = this.read<Record<string, unknown>>(collection)
    const index = items.findIndex((item) => item.id === id)

    if (index === -1) {
      return
    }

    items[index] = { ...items[index], ...data }
    this.write(collection, items)
  }

  async remove(collection: string, id: string): Promise<void> {
    const items = this.read<Record<string, unknown>>(collection)
    const filtered = items.filter((item) => item.id !== id)
    this.write(collection, filtered)
  }
}
