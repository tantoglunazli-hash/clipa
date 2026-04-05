import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useSettingsStore, applyTheme } from '../stores/settingsStore'
import type { UserStats } from '../types'

export default function Profile() {
  const navigate = useNavigate()
  const { user, profile, setUser, setProfile } = useAuthStore()
  const { theme, setTheme } = useSettingsStore()
  const [stats, setStats] = useState<UserStats>({ total_books: 0, total_quotes: 0 })
  const [showAppearance, setShowAppearance] = useState(false)

  useEffect(() => {
    applyTheme(theme)
  }, [])

  useEffect(() => {
    if (!user) return
    supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setStats({ total_books: Number(data.total_books), total_quotes: Number(data.total_quotes) })
      })
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [user])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    navigate('/login')
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Kullanıcı'

  const themeOptions = [
    { value: 'system', label: 'Sistem' },
    { value: 'light', label: 'Açık' },
    { value: 'dark', label: 'Koyu' },
  ] as const

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background pb-24">
      <TopBar logo />
      <main className="pt-24 px-6 max-w-2xl mx-auto">
        {/* Profil */}
        <section className="mb-10 text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto ring-offset-4 ring-2 ring-secondary/20 mb-4 bg-surface-highest flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-headline italic text-3xl text-primary/40">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h2 className="font-headline text-2xl font-semibold text-primary dark:text-dark-primary">{displayName}</h2>
          <p className="font-label text-sm text-on-surface-variant mt-0.5">{user?.email}</p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4 mb-10">
          {[
            { label: 'Toplam Alıntı', value: stats.total_quotes },
            { label: 'Toplam Kitap', value: stats.total_books },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-low dark:bg-dark-surface-container p-6 rounded-xl text-center">
              <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant block mb-1">
                {stat.label}
              </span>
              <span className="font-headline italic text-4xl text-secondary">{stat.value}</span>
            </div>
          ))}
        </section>

        {/* Ayarlar */}
        <section className="space-y-3 mb-10">
          <p className="font-label text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant px-1 mb-3">
            Ayarlar
          </p>

          {/* Görünüm */}
          <div className="bg-surface-low dark:bg-dark-surface-container rounded-lg overflow-hidden">
            <button
              onClick={() => setShowAppearance(!showAppearance)}
              className="w-full flex items-center justify-between p-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-white/50 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">palette</span>
                </div>
                <span className="font-label text-sm font-medium">Görünüm</span>
              </div>
              <span className="material-symbols-outlined text-outline-variant">
                {showAppearance ? 'expand_less' : 'expand_more'}
              </span>
            </button>
            {showAppearance && (
              <div className="px-5 pb-4 flex gap-2 border-t border-outline-variant/20 pt-3">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setTheme(opt.value); applyTheme(opt.value) }}
                    className={`flex-1 py-2 rounded-md font-label text-xs font-bold uppercase tracking-wide transition-colors ${
                      theme === opt.value
                        ? 'bg-primary text-white'
                        : 'bg-surface-highest text-on-surface-variant'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hakkında */}
          <div className="bg-surface-low dark:bg-dark-surface-container rounded-lg p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-white/50 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">info</span>
            </div>
            <div>
              <p className="font-label text-sm font-medium text-on-surface dark:text-dark-on-surface">Hakkında</p>
              <p className="font-label text-xs text-on-surface-variant">Clipa v1.0.0 · Okuduğun Sende Kalsın</p>
            </div>
          </div>
        </section>

        {/* Çıkış */}
        <section className="flex justify-center mt-4">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-8 py-3 rounded border border-error/20 text-error font-label text-xs font-bold uppercase tracking-widest hover:bg-error/5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Oturumu Kapat
          </button>
        </section>
      </main>
      <BottomNav />
    </div>
  )
}
