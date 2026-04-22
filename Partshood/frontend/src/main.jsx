import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // pulling in our global styles and tailwind directives
import App from './App.jsx'

// grabbing the root div from index.html and mounting our entire react application inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
