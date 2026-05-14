export interface StorageDriver {
  getAll<T>(collection: string): Promise<T[]>

  getById<T>(collection: string, id: string): Promise<T | null>

  create<T>(collection: string, id: string, data: T): Promise<void>

  update(collection: string, id: string, data: Record<string, unknown>): Promise<void>

  remove(collection: string, id: string): Promise<void>
}
