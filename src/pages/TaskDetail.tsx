import { useParams } from 'react-router-dom'
import { useTaskDetail } from '../hooks/useTaskDetail'

function TaskDetail() {
  const { taskId } = useParams<{ taskId: string }>()

  const {
    task,
    story,
    assignedUser,
    selectedUserId,
    setSelectedUserId,
    availableUsers,
    assignUser,
    completeTask,
    deleteTask,
    navigate,
  } = useTaskDetail(taskId)

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <h1 className="text-2xl">Ładowanie...</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="w-full max-w-2xl mx-auto bg-white p-5 md:p-8 rounded-lg shadow">
        
        <h1 className="text-3xl md:text-4xl font-bold mb-2 break-words">{task.nazwa}</h1>
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-500 hover:underline cursor-pointer"
        >
          ← Wróć
        </button>

        <div className="mb-6 bg-gray-50 p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Informacje o zadaniu</h2>
          
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Opis:</span>
              <p className="text-gray-700">{task.opis}</p>
            </div>

            <div>
              <span className="font-semibold">Priorytet:</span>
              <p className="text-gray-700">{task.priorytet}</p>
            </div>

            <div>
              <span className="font-semibold">Przewidywany czas:</span>
              <p className="text-gray-700">{task.przewidywanyCzas}</p>
            </div>

            <div>
              <span className="font-semibold">Stan:</span>
              <p className={`text-gray-700 font-bold ${
                task.stan === 'done' ? 'text-green-600' :
                task.stan === 'doing' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {task.stan.toUpperCase()}
              </p>
            </div>

            <div>
              <span className="font-semibold">Data dodania:</span>
              <p className="text-gray-700">{new Date(task.dataDodania).toLocaleDateString('pl-PL')}</p>
            </div>

            {task.dataStart && (
              <div>
                <span className="font-semibold">Data startu:</span>
                <p className="text-gray-700">{new Date(task.dataStart).toLocaleDateString('pl-PL')}</p>
              </div>
            )}

            {task.dataKonca && (
              <div>
                <span className="font-semibold">Data końca:</span>
                <p className="text-gray-700">{new Date(task.dataKonca).toLocaleDateString('pl-PL')}</p>
              </div>
            )}
          </div>
        </div>

        {story && (
          <div className="mb-6 bg-blue-50 p-4 rounded border-l-4 border-blue-500">
            <h2 className="text-xl font-bold mb-2">Przypisana historyjka</h2>
            <p className="font-semibold">{story.nazwa}</p>
            <p className="text-gray-700">{story.opis}</p>
          </div>
        )}

        {assignedUser && (
          <div className="mb-6 bg-green-50 p-4 rounded border-l-4 border-green-500">
            <h2 className="text-xl font-bold mb-2">Przypisana osoba</h2>
            <p className="text-gray-700">{assignedUser.firstName} {assignedUser.lastName}</p>
            <p className="text-sm text-gray-600">Rola: {assignedUser.role}</p>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-500">
          <h2 className="text-xl font-bold mb-4">Akcje</h2>

          {task.stan === 'todo' && (
            <div className="mb-6">
              <label className="block font-semibold mb-2">Przypisz osobę:</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(e.target.value || null)}
                  className="flex-1 px-4 py-2 border rounded"
                >
                  <option value="">-- Wybierz osobę --</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.role})
                    </option>
                  ))}
                </select>
                <button
                  onClick={assignUser}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer font-semibold"
                >
                  Przypisz
                </button>
              </div>
            </div>
          )}

          {task.stan === 'doing' && (
            <button
              onClick={completeTask}
              className="w-full px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer font-semibold text-lg"
            >
              Zamknij zadanie
            </button>
          )}

          {task.stan === 'done' && (
            <p className="text-green-600 font-bold text-lg">✅ Zadanie jest zamknięte</p>
          )}

          <button
            type="button"
            onClick={deleteTask}
            className="w-full mt-4 px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer font-semibold"
          >
            Usun zadanie
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaskDetail