type TaskStatus = 'todo' | 'doing' | 'done'
type StoryStatus = 'todo' | 'doing' | 'done'

interface TaskStatusInfo {
  stan: TaskStatus
}

interface StoryStatusInfo {
  stan: StoryStatus
}

export function shouldStoryMoveToDoing(story: StoryStatusInfo): boolean {
  return story.stan === 'todo'
}

export function shouldStoryMoveToDone(tasks: TaskStatusInfo[]): boolean {
  if (tasks.length === 0) {
    return false
  }

  return tasks.every((task) => task.stan === 'done')
}
