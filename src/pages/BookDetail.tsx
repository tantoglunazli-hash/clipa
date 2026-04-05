import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import BottomNav from '../components/BottomNav'
import QuoteCard from '../components/QuoteCard'
import EmptyState from '../components/EmptyState'
import { supabase } from '../lib/supabase'
import { useLibraryStore } from '../stores/libraryStore'
import type { Book, Quote } from '../types'

export default function BookDetail() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const { books, quotes, setQuotes, removeQuote, removeBook } = useLibraryStore()
  const [loading, setLoading] = useState(true)

  const book: Book | undefined = books.find((b) => b.id === bookId)
  const bookQuotes = quotes.filter((q) => q.book_id === bookId)

  useEffect(() => {
    if (!bookId) return
    supabase
      .from('quotes')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const existing = quotes.filter((q) => q.book_id !== bookId)
          setQuotes([...existing, ...(data as Quote[])])
        }
        setLoading(false)
      })
  }, [bookId])

  async function handleDeleteQuote(id: string) {
    if (!confirm('Bu alıntıyı silmek istiyor musun?')) return
    await supabase.from('quotes').delete().eq('id', id)
    removeQuote(id)
  }

  async function handleDeleteBook() {
    if (!confirm(`"${book?.title}" kitabını ve tüm alıntılarını silmek istiyor musun?`)) return
    await supabase.from('books').delete().eq('id', bookId)
    removeBook(bookId!)
    navigate('/library')
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background pb-24">
      <TopBar
        back
        title={book?.title ?? ''}
        right={
          <button onClick={handleDeleteBook} className="text-error">
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        }
      />
      <main className="pt-20 px-4">
        {book && (
          <div className="px-2 py-4 border-b border-outline-variant/30 mb-4">
            <p className="font-headline italic text-2xl text-primary dark:text-dark-primary leading-tight">
              {book.title}
            </p>
            {book.author && (
              <p className="font-label text-sm text-on-surface-variant mt-1">{book.author}</p>
            )}
            <p className="font-label text-xs text-secondary mt-1 font-semibold">
              {bookQuotes.length} alıntı
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <span className="material-symbols-outlined text-4xl text-outline-variant animate-spin">progress_activity</span>
          </div>
        ) : bookQuotes.length === 0 ? (
          <EmptyState
            icon="format_quote"
            title="Henüz alıntı yok"
            description="Kamera ile bir sayfa tara"
          />
        ) : (
          <div className="space-y-3 px-2">
            {bookQuotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} onDelete={handleDeleteQuote} />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => navigate(`/add-quote?bookId=${bookId}`)}
        className="fixed bottom-24 right-5 w-14 h-14 bg-secondary text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      <BottomNav />
    </div>
  )
}
