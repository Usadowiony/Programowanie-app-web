import { dataStorageMode } from '../config/dataStorage'
import type { StorageDriver } from './StorageDriver'
import { FirebaseDriver } from './firebaseDriver'
import { LocalStorageDriver } from './localStorageDriver'

const OVERRIDE_KEY = 'VITE_DATA_STORAGE_MODE_OVERRIDE'

function resolveMode(): 'firebase' | 'localStorage' {
  const override = localStorage.getItem(OVERRIDE_KEY)
  if (override === 'firebase' || override === 'localStorage') {
    return override
  }
  return dataStorageMode
}

let driverInstance: StorageDriver | null = null

export function getStorageDriver(): StorageDriver {
  if (!driverInstance) {
    const mode = resolveMode()
    driverInstance = mode === 'firebase'
      ? new FirebaseDriver()
      : new LocalStorageDriver()
  }

  return driverInstance
}
