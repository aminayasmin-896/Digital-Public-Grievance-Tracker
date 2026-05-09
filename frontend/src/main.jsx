import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/socketContext'   // 👈 ADD THIS
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>   {/* 👈 ADD HERE */}
          <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)