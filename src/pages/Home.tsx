import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="flex-col text-4xl font-bold mb-6">Home Page</h1>
        <div className='flex flex-col space-y-4'>
          <button
            onClick={() => navigate('/manageme')}
            className="w-full cursor-pointer bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
          >
            Przejdź do Manage Me
          </button>
          <button
            onClick={() => navigate('/user')}
            className="w-full cursor-pointer bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
          >
            Przejdź do użytkownika
          </button>
          <button
            onClick={() => navigate('/stories')}
            className="w-full cursor-pointer bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
          >
            Przejdź do Historyjek
          </button>
          <button
            onClick={() => navigate('/tasks')}
            className="w-full cursor-pointer bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
          >
            Przejdź do Zadań
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home