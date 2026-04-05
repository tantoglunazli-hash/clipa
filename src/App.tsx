import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'
import { applyTheme } from './stores/settingsStore'

import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Library from './pages/Library'
import BookDetail from './pages/BookDetail'
import AddBook from './pages/AddBook'
import Camera from './pages/Camera'
import AddQuote from './pages/AddQuote'
import QuoteDetail from './pages/QuoteDetail'
import Profile from './pages/Profile'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const { setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = (localStorage.getItem('clipa_theme') as any) || 'system'
    applyTheme(saved)

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="font-headline italic text-4xl text-primary animate-pulse">Clipa</span>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Navigate to="/library" replace />} />
        <Route path="/library" element={<RequireAuth><Library /></RequireAuth>} />
        <Route path="/library/:bookId" element={<RequireAuth><BookDetail /></RequireAuth>} />
        <Route path="/add-book" element={<RequireAuth><AddBook /></RequireAuth>} />
        <Route path="/camera" element={<RequireAuth><Camera /></RequireAuth>} />
        <Route path="/add-quote" element={<RequireAuth><AddQuote /></RequireAuth>} />
        <Route path="/quote/:quoteId" element={<RequireAuth><QuoteDetail /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}
