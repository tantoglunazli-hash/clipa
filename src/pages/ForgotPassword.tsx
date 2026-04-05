import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TopBar from '../components/TopBar'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <TopBar back title="Şifremi Unuttum" />
      <div className="pt-24 px-6 max-w-sm mx-auto">
        {sent ? (
          <div className="text-center py-10">
            <span className="material-symbols-outlined text-5xl text-secondary">mark_email_read</span>
            <p className="font-headline italic text-2xl text-primary mt-4">E-posta gönderildi</p>
            <p className="font-label text-sm text-on-surface-variant mt-2">
              {email} adresine şifre sıfırlama bağlantısı gönderildi.
            </p>
            <Link to="/login" className="font-label text-sm text-secondary block mt-6 font-bold">
              Giriş sayfasına dön
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="font-label text-sm text-on-surface-variant">
              E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
            </p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface-low border border-outline-variant rounded-md px-4 py-3 font-body text-sm outline-none focus:border-primary"
              placeholder="ornek@eposta.com"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-label font-bold text-sm uppercase tracking-widest py-3.5 rounded-md disabled:opacity-50"
            >
              {loading ? 'Gönderiliyor...' : 'Bağlantı Gönder'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
