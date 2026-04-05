import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/library')
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-headline italic text-5xl text-primary dark:text-dark-primary mb-2">Clipa</h1>
          <p className="font-label text-sm text-on-surface-variant tracking-wide">Hesap Oluştur</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {[
            { label: 'Ad Soyad', value: fullName, onChange: setFullName, type: 'text', placeholder: 'Adınız' },
            { label: 'E-posta', value: email, onChange: setEmail, type: 'email', placeholder: 'ornek@eposta.com' },
            { label: 'Şifre', value: password, onChange: setPassword, type: 'password', placeholder: '••••••••' },
          ].map((field) => (
            <div key={field.label}>
              <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-1.5">
                {field.label}
              </label>
              <input
                type={field.type}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                required
                className="w-full bg-surface-low dark:bg-dark-surface-container border border-outline-variant rounded-md px-4 py-3 font-body text-sm text-on-surface dark:text-dark-on-surface outline-none focus:border-primary transition-colors"
                placeholder={field.placeholder}
              />
            </div>
          ))}

          {error && <p className="font-label text-xs text-error text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-label font-bold text-sm uppercase tracking-widest py-3.5 rounded-md disabled:opacity-50"
          >
            {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="font-label text-sm text-secondary">
            Zaten hesabım var, <span className="font-bold">giriş yap</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
