import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dataStorageMode } from '../config/dataStorage'
import logoUrl from '../assets/images/logo.webp'
import logoDarkUrl from '../assets/images/logo-dark.webp'

const STORAGE_KEY = 'VITE_DATA_STORAGE_MODE_OVERRIDE'

/**
 * Czyta aktualny tryb przechowywania danych.
 * Priorytet: ręczne nadpisanie w localStorage > zmienna .env
 */
function getCurrentMode(): 'localStorage' | 'firebase' {
  const override = localStorage.getItem(STORAGE_KEY)
  if (override === 'firebase' || override === 'localStorage') {
    return override
  }
  return dataStorageMode
}

function Home() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'localStorage' | 'firebase'>(getCurrentMode)
  const [switched, setSwitched] = useState(false)

  const handleToggle = () => {
    const next = mode === 'firebase' ? 'localStorage' : 'firebase'
    localStorage.setItem(STORAGE_KEY, next)
    setMode(next)
    setSwitched(true)
    // Przeładowanie strony żeby driverFactory odczytał nową wartość
    setTimeout(() => window.location.reload(), 800)
  }

  const isFirebase = mode === 'firebase'

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center max-w-lg w-full px-4">
        <div className="flex justify-center mb-10">
          <img src={logoUrl} alt="Logo" className="app-logo-light h-16 md:h-20 w-auto object-contain" />
          <img src={logoDarkUrl} alt="Logo" className="app-logo-dark h-16 md:h-20 w-auto object-contain" />
        </div>

        <div className="flex flex-col space-y-3 mb-10">
          <button
            onClick={() => navigate('/projects')}
            className="w-full cursor-pointer bg-blue-500 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-blue-600 transition"
          >
            Projekty
          </button>
          <button
            onClick={() => navigate('/stories')}
            className="w-full cursor-pointer bg-blue-500 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-blue-600 transition"
          >
            Historyjki
          </button>
          <button
            onClick={() => navigate('/tasks')}
            className="w-full cursor-pointer bg-blue-500 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-blue-600 transition"
          >
            Zadania
          </button>
        </div>

        {/* Przełącznik trybu przechowywania danych */}
        <div className="bg-white rounded-xl shadow p-5 border border-gray-200">
          <h2 className="text-base font-bold mb-3 text-gray-800">Tryb przechowywania danych</h2>

          <div className="flex items-center justify-center gap-4 mb-4">
            <span className={`text-sm font-semibold ${!isFirebase ? 'text-blue-600' : 'text-gray-400'}`}>
              💾 localStorage
            </span>

            <button
              type="button"
              onClick={handleToggle}
              disabled={switched}
              className="storage-toggle-btn"
              aria-pressed={isFirebase}
              aria-label="Przelacz tryb przechowywania"
            >
              <span className={`storage-toggle-thumb ${isFirebase ? 'storage-toggle-thumb-right' : ''}`} />
            </button>

            <span className={`text-sm font-semibold ${isFirebase ? 'text-orange-500' : 'text-gray-400'}`}>
              Firebase 🔥
            </span>
          </div>

          <div className={`text-xs px-3 py-2 rounded-lg font-medium ${isFirebase
            ? 'bg-orange-50 text-orange-700 border border-orange-200'
            : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
            {isFirebase
              ? 'Aktywny: Firebase – dane synchronizowane z chmurą'
              : 'Aktywny: localStorage – dane zapisywane lokalnie w przeglądarce'}
          </div>

          {switched && (
            <p className="text-xs text-gray-500 mt-3 animate-pulse">Przeładowywanie strony...</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home