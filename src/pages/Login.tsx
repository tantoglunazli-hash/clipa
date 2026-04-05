import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('E-posta veya şifre hatalı.')
    } else {
      navigate('/library')
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-headline italic text-5xl text-primary dark:text-dark-primary mb-2">Clipa</h1>
          <p className="font-label text-sm text-on-surface-variant tracking-wide">Okuduğun Sende Kalsın</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-1.5">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface-low dark:bg-dark-surface-container border border-outline-variant rounded-md px-4 py-3 font-body text-sm text-on-surface dark:text-dark-on-surface outline-none focus:border-primary dark:focus:border-dark-primary transition-colors"
              placeholder="ornek@eposta.com"
            />
          </div>
          <div>
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-1.5">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface-low dark:bg-dark-surface-container border border-outline-variant rounded-md px-4 py-3 font-body text-sm text-on-surface dark:text-dark-on-surface outline-none focus:border-primary dark:focus:border-dark-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="font-label text-xs text-error text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary dark:bg-dark-primary text-white dark:text-primary font-label font-bold text-sm uppercase tracking-widest py-3.5 rounded-md transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/register" className="font-label text-sm text-secondary block">
            Hesap yok mu? <span className="font-bold">Kayıt ol</span>
          </Link>
          <Link to="/forgot-password" className="font-label text-xs text-on-surface-variant block">
            Şifremi unuttum
          </Link>
        </div>
      </div>
    </div>
  )
}
