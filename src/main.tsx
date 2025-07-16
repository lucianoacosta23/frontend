import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './static/css/index.css'
import App from './pages/mainPage/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
