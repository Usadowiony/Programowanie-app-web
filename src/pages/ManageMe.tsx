function ManageMe() {
    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-5xl font-bold text-gray-800">Manage Me</h1>
      <div className="mt-8">
        <button className="cursor-pointer ml-4 bg-blue-500 text-white px-4 py-2 rounded">
            Add Project
        </button>
        <button className="cursor-pointer ml-4 bg-red-500 text-white px-4 py-2 rounded">
            Delete Project
        </button>
      </div>
    </div>
    )
}

export default ManageMe