import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import { useNotificationStore } from './stores/notificationStore'
import { supabase } from './lib/supabase'

// Layout
import AppLayout from './components/layout/AppLayout'

// Pages
import Dashboard from './pages/Dashboard'
import Knowledge from './pages/Knowledge'
import Bugs from './pages/Bugs'
import Features from './pages/Features'
import Time from './pages/Time'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import Login from './pages/Login'

// Loading component
import LoadingSpinner from './components/common/LoadingSpinner'

function App() {
  const { user, loading, setUser, setLoading } = useAuthStore()
  const { subscribeToNotifications } = useNotificationStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setLoading])

  useEffect(() => {
    // Subscribe to notifications when user is logged in
    if (user) {
      subscribeToNotifications(user.id)
    }
  }, [user, subscribeToNotifications])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/knowledge" element={<Knowledge />} />
        <Route path="/bugs" element={<Bugs />} />
        <Route path="/features" element={<Features />} />
        <Route path="/time" element={<Time />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  )
}

export default App
