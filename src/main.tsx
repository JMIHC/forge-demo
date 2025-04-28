import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/ThemeToggle'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ThemeToggle />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
