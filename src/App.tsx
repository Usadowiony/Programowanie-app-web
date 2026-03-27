import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import ManageMe from './pages/ManageMe'
import User from './pages/User'
import Stories from './pages/Stories'
import TaskDetail from './pages/TaskDetail'
import Tasks from './pages/Tasks'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/manageme', label: 'Manage Me' },
  { to: '/user', label: 'Uzytkownik' },
  { to: '/stories', label: 'Stories' },
  { to: '/tasks', label: 'Zadania' },
]

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setIsDarkMode(shouldUseDark)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('theme-dark')
      localStorage.setItem('theme', 'dark')
      return
    }

    root.classList.remove('theme-dark')
    localStorage.setItem('theme', 'light')
  }, [isDarkMode])

  return (
    <Router>
      <div className="app-shell min-h-screen">
        <nav className="app-nav">
          <div className="app-nav-links">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `app-nav-link ${isActive ? 'is-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsDarkMode((prev) => !prev)}
            className="theme-toggle"
            aria-label={isDarkMode ? 'Przelacz na jasny motyw' : 'Przelacz na ciemny motyw'}
            title={isDarkMode ? 'Jasny motyw' : 'Ciemny motyw'}
          >
            {isDarkMode ? (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.75 15.5A9.75 9.75 0 1 1 8.5 2.25a.75.75 0 0 1 .89.96 8.25 8.25 0 0 0 11.4 11.4.75.75 0 0 1 .96.89Z"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 3a.75.75 0 0 1 .75.75V5a.75.75 0 0 1-1.5 0V3.75A.75.75 0 0 1 12 3Zm0 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm8.25-5a.75.75 0 0 1 .75.75.75.75 0 0 1-.75.75H19a.75.75 0 0 1 0-1.5h1.25ZM5 12a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1 0-1.5H5Zm12.303 5.803a.75.75 0 0 1 1.06 1.06l-.884.884a.75.75 0 1 1-1.06-1.06l.884-.884Zm-9.782-.53a.75.75 0 0 1 0 1.06l-.884.884a.75.75 0 0 1-1.06-1.06l.884-.884a.75.75 0 0 1 1.06 0Zm11.018-11.02a.75.75 0 0 1 0 1.061l-.884.884a.75.75 0 1 1-1.06-1.06l.884-.885a.75.75 0 0 1 1.06 0ZM7.52 6.98a.75.75 0 0 1-1.06 0l-.884-.885a.75.75 0 0 1 1.06-1.06l.884.884a.75.75 0 0 1 0 1.06ZM12 19a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-1.25A.75.75 0 0 1 12 19Z"
                />
              </svg>
            )}
          </button>
        </nav>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/manageme" element={<ManageMe />} />
            <Route path="/user" element={<User />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/task/:taskId" element={<TaskDetail />} />
            <Route path="/tasks" element={<Tasks />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
