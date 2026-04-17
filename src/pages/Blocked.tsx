import { useAuth } from '../auth/AuthContext'

function Blocked() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold text-red-700 mb-3">Konto zablokowane</h1>
        <p className="text-gray-700 mb-6">
          Twoje konto zostalo zablokowane. Skontaktuj sie z administratorem.
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

export default Blocked
