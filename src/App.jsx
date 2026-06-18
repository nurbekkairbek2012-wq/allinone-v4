import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Landing     from './pages/Landing'
import Register    from './pages/Register'
import Login       from './pages/Login'
import Dashboard   from './pages/Dashboard'
import Listening   from './pages/Listening'
import Reading     from './pages/Reading'
import Writing     from './pages/Writing'
import Speaking    from './pages/Speaking'
import Leaderboard from './pages/Leaderboard'
import Assistant   from './pages/Assistant'
import MockTest    from './pages/MockTest'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg-primary)' }}>
      <div style={{ width:36, height:36, border:'2px solid #7c5cfc', borderTopColor:'transparent', borderRadius:'50%', animation:'spinSlow 0.8s linear infinite' }}/>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function Guest({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/"            element={<Guest><Landing /></Guest>} />
          <Route path="/register"    element={<Guest><Register /></Guest>} />
          <Route path="/login"       element={<Guest><Login /></Guest>} />
          <Route path="/dashboard"   element={<Protected><Dashboard /></Protected>} />
          <Route path="/listening"   element={<Protected><Listening /></Protected>} />
          <Route path="/reading"     element={<Protected><Reading /></Protected>} />
          <Route path="/writing"     element={<Protected><Writing /></Protected>} />
          <Route path="/speaking"    element={<Protected><Speaking /></Protected>} />
          <Route path="/leaderboard" element={<Protected><Leaderboard /></Protected>} />
          <Route path="/assistant"   element={<Protected><Assistant /></Protected>} />
          <Route path="/mock"        element={<Protected><MockTest /></Protected>} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
