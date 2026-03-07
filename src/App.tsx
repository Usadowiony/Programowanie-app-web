import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ManageMe from './pages/ManageMe'
import User from './pages/User'
import Stories from './pages/Stories'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/manageme" element={<ManageMe />} />
        <Route path="/user" element={<User />} />
        <Route path="/stories" element={<Stories />} />
      </Routes>
    </Router>
  )
}

export default App
