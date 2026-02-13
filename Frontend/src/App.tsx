import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import { WorkflowProvider } from './lib/WorkflowContext'

function App() {
  return (
    // Wrap the entire app with WorkflowProvider
    // This gives all components access to the workflow state
    <WorkflowProvider>
      <Router>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Landing />} />
          
          {/* Main app page */}
          <Route path="/app" element={<Home />} />
        </Routes>
      </Router>
    </WorkflowProvider>
  )
}

export default App
