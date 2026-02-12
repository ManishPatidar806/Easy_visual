// This is the ENTRY POINT of the entire app - it starts everything!
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'    // Our main App component
import './index.css'            // Global styles

// This connects our React app to the HTML page
// It finds the element with id="root" and puts our app inside it
ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode: Helps us find bugs during development
  <React.StrictMode>
    <App />  {/* This loads our entire application */}
  </React.StrictMode>,
)
