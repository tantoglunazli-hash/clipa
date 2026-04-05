import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useLibraryStore } from '../stores/libraryStore'

export default function AddBook() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addBook } = useLibraryStore()
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError('')
    setLoading(true)
    const { data, error } = await supabase
      .from('books')
      .insert({ user_id: user.id, title, author: author || null })
      .select()
      .single()
    setLoading(false)
    if (error) {
      setError('Kitap eklenemedi.')
    } else {
      addBook({ ...data, quote_count: 0 })
      navigate(`/library/${data.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <TopBar back title="Kitap Ekle" />
      <div className="pt-24 px-6 max-w-sm mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-1.5">
              Kitap Adı *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-surface-low border border-outline-variant rounded-md px-4 py-3 font-body text-sm outline-none focus:border-primary"
              placeholder="Kitabın adı"
            />
          </div>
          <div>
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-1.5">
              Yazar
            </label>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-surface-low border border-outline-variant rounded-md px-4 py-3 font-body text-sm outline-none focus:border-primary"
              placeholder="Yazarın adı"
            />
          </div>

          {error && <p className="font-label text-xs text-error">{error}</p>}

          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full bg-primary text-white font-label font-bold text-sm uppercase tracking-widest py-3.5 rounded-md disabled:opacity-50 mt-4"
          >
            {loading ? 'Ekleniyor...' : 'Kitap Ekle'}
          </button>
        </form>
      </div>
    </div>
  )
}
