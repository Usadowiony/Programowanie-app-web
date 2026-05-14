import { useEffect, useState } from 'react'
import { projectService, Project } from '../services/projectService'

export function useActiveProject() {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      const active = await projectService.getActiveProject()

      if (!cancelled) {
        setProject(active)
        setIsLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  const refresh = async () => {
    setIsLoading(true)
    const active = await projectService.getActiveProject()
    setProject(active)
    setIsLoading(false)
  }

  return { project, isLoading, refresh }
}
