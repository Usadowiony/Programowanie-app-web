import { useEffect, useState } from 'react'
import { userService, User, UserRole } from '../services/userService'
import { useAuth } from '../auth/AuthContext'

const roleOptions: UserRole[] = ['guest', 'developer', 'devops', 'admin']

function UsersAdmin() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadUsers = async () => {
    setIsLoading(true)
    const allUsers = await userService.fetchAllUsersFromDb()
    setUsers(allUsers)
    setIsLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleRoleChange = async (userId: string, role: UserRole) => {
    await userService.updateUserRole(userId, role)
    await loadUsers()
  }

  const handleToggleBlocked = async (userId: string, blocked: boolean) => {
    await userService.setBlocked(userId, blocked)
    await loadUsers()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 pb-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Uzytkownicy</h1>

        {isLoading ? (
          <div className="bg-white rounded-lg p-6 shadow text-gray-600">Ladowanie...</div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => {
              const isCurrentUser = currentUser?.id === user.id

              return (
              <div key={user.id} className="bg-white rounded-lg p-5 shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {user.firstName} {user.lastName || ''}
                    </h2>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Utworzono: {new Date(user.createdAt).toLocaleString('pl-PL')}
                    </p>
                  </div>

                  {isCurrentUser ? (
                    <div className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-2 rounded">
                      Twoje konto
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(event) => handleRoleChange(user.id, event.target.value as UserRole)}
                        className="px-3 py-2 border rounded"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => handleToggleBlocked(user.id, !user.blocked)}
                        className={`px-4 py-2 text-white rounded ${
                          user.blocked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {user.blocked ? 'Odblokuj' : 'Zablokuj'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )})}

            {users.length === 0 && (
              <div className="bg-white rounded-lg p-6 shadow text-gray-600">Brak uzytkownikow.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersAdmin
