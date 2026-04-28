import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import { WorkflowProvider } from './lib/WorkflowContext'

function App() {
  return (
    <WorkflowProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/app" element={<Home />} />
        </Routes>
      </Router>
    </WorkflowProvider>
  )
}

export default App
