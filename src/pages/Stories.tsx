import { Story } from '../services/storyService'
import { useStories } from '../hooks/useStories'

const getPriorityColor = (priorytet: string) => {
  switch (priorytet) {
    case 'wysoki': return 'text-red-600 font-bold'
    case 'sredni': return 'text-yellow-600 font-semibold'
    case 'niski': return 'text-green-600'
    default: return ''
  }
}

function Stories() {
  const {
    user,
    activeProject,
    isProjectLoading,
    todoStories,
    doingStories,
    doneStories,

    nazwa,
    setNazwa,
    opis,
    setOpis,
    priorytet,
    setPriorytet,

    newTaskName,
    setNewTaskName,
    newTaskDesc,
    setNewTaskDesc,
    newTaskPriority,
    setNewTaskPriority,
    newTaskTime,
    setNewTaskTime,
    expandedStoryId,
    setExpandedStoryId,

    addStory,
    deleteStory,
    editStory,
    changeStoryStatus,
    addTask,
  } = useStories()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h1 className="text-2xl text-gray-700">Brak zalogowanego użytkownika</h1>
      </div>
    )
  }

  if (isProjectLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Ladowanie projektu...</p>
      </div>
    )
  }

  if (!activeProject) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Historyjki</h1>
          <p className="text-xl text-gray-600">Najpierw wybierz aktywny projekt w sekcji Projekty</p>
        </div>
      </div>
    )
  }

  const renderAddTaskForm = (storyId: string) => (
    <div className="mt-4 p-4 border-t border-gray-200">
      <input
        type="text"
        value={newTaskName}
        onChange={e => setNewTaskName(e.target.value)}
        placeholder="Nazwa zadania"
        className="w-full px-3 py-2 border rounded mb-2"
      />
      <textarea
        value={newTaskDesc}
        onChange={e => setNewTaskDesc(e.target.value)}
        placeholder="Opis zadania"
        className="w-full px-3 py-2 border rounded mb-2"
        rows={2}
      />
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <select
          value={newTaskPriority}
          onChange={e => setNewTaskPriority(e.target.value as 'niski' | 'sredni' | 'wysoki')}
          className="flex-1 px-3 py-2 border rounded"
        >
          <option value="niski">Niski</option>
          <option value="sredni">Średni</option>
          <option value="wysoki">Wysoki</option>
        </select>
        <input
          type="text"
          value={newTaskTime}
          onChange={e => setNewTaskTime(e.target.value)}
          placeholder="Czas (np. 8h)"
          className="flex-1 px-3 py-2 border rounded"
        />
      </div>
      <button
        onClick={() => addTask(storyId)}
        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 cursor-pointer w-full"
      >
        Dodaj zadanie
      </button>
    </div>
  )

  const renderStoryCard = (story: Story, statusButtons: React.ReactNode, cardClass: string) => (
    <div key={story.id} className={cardClass}>
      <h3 className="font-bold mb-2">{story.nazwa}</h3>
      <p className="text-sm text-gray-600 mb-2">{story.opis}</p>
      <p className={`text-sm mb-3 ${getPriorityColor(story.priorytet)}`}>
        Priorytet: {story.priorytet}
      </p>
      <div className="flex flex-wrap gap-2">
        {statusButtons}
        <button
          onClick={() => editStory(story)}
          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 cursor-pointer"
        >
          Edytuj
        </button>
        <button
          onClick={() => deleteStory(story.id)}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 cursor-pointer"
        >
          Usuń
        </button>
        <button
          onClick={() => setExpandedStoryId(expandedStoryId === story.id ? null : story.id)}
          className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 cursor-pointer"
        >
          {expandedStoryId === story.id ? '✕ Anuluj' : '+ Dodaj zadanie'}
        </button>
      </div>
      {expandedStoryId === story.id && renderAddTaskForm(story.id)}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100 pb-16 p-4 md:p-8">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Historyjki</h1>

        <div className="bg-white p-6 rounded-lg shadow mb-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Dodaj nową historyjkę</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={nazwa}
                onChange={e => setNazwa(e.target.value)}
                placeholder="Nazwa"
                className="flex-1 px-4 py-2 border rounded"
              />
              <select
                value={priorytet}
                onChange={e => setPriorytet(e.target.value as 'niski' | 'sredni' | 'wysoki')}
                className="px-4 py-2 border rounded"
              >
                <option value="niski">Niski</option>
                <option value="sredni">Średni</option>
                <option value="wysoki">Wysoki</option>
              </select>
            </div>
            <textarea
              value={opis}
              onChange={e => setOpis(e.target.value)}
              placeholder="Opis"
              className="w-full px-4 py-2 border rounded"
              rows={3}
            />
            <button
              onClick={addStory}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 cursor-pointer"
            >
              Dodaj historyjke
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* TODO */}
          <div>
            <h2 className="text-center text-2xl font-bold mb-4 text-gray-700 border-b-2">TODO</h2>
            <div className="space-y-4">
              {todoStories.map(story => renderStoryCard(
                story,
                <button
                  onClick={() => changeStoryStatus(story.id, 'doing')}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 cursor-pointer"
                >
                  → Doing
                </button>,
                'bg-white p-6 rounded-lg shadow',
              ))}
            </div>
          </div>

          {/* DOING */}
          <div>
            <h2 className="text-center text-2xl font-bold mb-4 text-blue-700 border-b-2">DOING</h2>
            <div className="space-y-4">
              {doingStories.map(story => renderStoryCard(
                story,
                <>
                  <button
                    onClick={() => changeStoryStatus(story.id, 'todo')}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 cursor-pointer"
                  >
                    ← TODO
                  </button>
                  <button
                    onClick={() => changeStoryStatus(story.id, 'done')}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 cursor-pointer"
                  >
                    → Done
                  </button>
                </>,
                'bg-blue-50 p-6 rounded-lg shadow border-l-4 border-blue-500',
              ))}
            </div>
          </div>

          {/* DONE */}
          <div>
            <h2 className="text-center text-2xl font-bold mb-4 text-green-700 border-b-2">DONE</h2>
            <div className="space-y-4">
              {doneStories.map(story => renderStoryCard(
                story,
                <button
                  onClick={() => changeStoryStatus(story.id, 'doing')}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 cursor-pointer"
                >
                  ← Doing
                </button>,
                'bg-green-50 p-6 rounded-lg shadow border-l-4 border-green-500',
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stories
