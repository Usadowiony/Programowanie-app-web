import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-6">Home Page</h1>
        <button
          onClick={() => navigate('/manageme')}
          className="cursor-pointer bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
        >
          Przejdź do Manage Me
        </button>
      </div>
    </div>
  )
}

export default Home