import { useAuth } from '../auth/AuthContext'

function WaitingApproval() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Oczekiwanie na zatwierdzenie konta</h1>
        <p className="text-gray-600 mb-6">
          {user?.email || 'To konto'} zostalo utworzone jako gosc. Administrator musi nadac role,
          zanim uzyskasz dostep do aplikacji.
        </p>

        <button
          type="button"
          onClick={() => signOut()}
          className="px-5 py-2 rounded bg-gray-700 text-white hover:bg-gray-800"
        >
          Wyloguj
        </button>
      </div>
    </div>
  )
}

export default WaitingApproval
