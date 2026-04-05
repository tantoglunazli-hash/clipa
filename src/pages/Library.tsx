import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import BookCard from '../components/BookCard'
import EmptyState from '../components/EmptyState'
import { supabase } from '../lib/supabase'
import { useLibraryStore } from '../stores/libraryStore'
import { useAuthStore } from '../stores/authStore'
import type { Book } from '../types'

export default function Library() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { books, setBooks, searchQuery, setSearchQuery } = useLibraryStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('books')
      .select('*, quotes(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const mapped: Book[] = data.map((b: any) => ({
            ...b,
            quote_count: b.quotes?.[0]?.count ?? 0,
          }))
          setBooks(mapped)
        }
        setLoading(false)
      })
  }, [user])

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.author ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background pb-24">
      <TopBar logo />
      <main className="pt-20 px-4">
        <div className="px-2 py-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Kitap veya yazar ara..."
              className="w-full bg-surface-low dark:bg-dark-surface-container border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 font-label text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="material-symbols-outlined text-4xl text-outline-variant animate-spin">progress_activity</span>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="local_library"
            title="Henüz kitap yok"
            description="İlk kitabını ekleyerek başla"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 px-2 py-2">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => navigate('/add-book')}
        className="fixed bottom-24 right-5 w-14 h-14 bg-secondary text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      <BottomNav />
    </div>
  )
}
