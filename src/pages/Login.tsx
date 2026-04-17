import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'

function Login() {
  const { signInWithGoogle } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async () => {
    try {
      setIsSubmitting(true)
      setErrorMessage('')
      await signInWithGoogle()
    } catch (error) {
      setErrorMessage('Nie udalo sie zalogowac przez Google. Sprobuj ponownie.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Logowanie</h1>
        <p className="text-gray-600 mb-6">Zaloguj sie kontem Google.</p>

        <button
          type="button"
          onClick={handleLogin}
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Logowanie...' : 'Zaloguj przez Google'}
        </button>

        {errorMessage && (
          <p className="text-sm text-red-600 mt-4">{errorMessage}</p>
        )}
      </div>
    </div>
  )
}

export default Login
