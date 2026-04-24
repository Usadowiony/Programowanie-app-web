export type DataStorageMode = 'localStorage' | 'firebase'

const configuredMode = (import.meta.env.VITE_DATA_STORAGE_MODE || 'localStorage') as DataStorageMode

export const dataStorageMode: DataStorageMode = configuredMode === 'firebase' ? 'firebase' : 'localStorage'

export const isFirebaseMode = dataStorageMode === 'firebase'
