import { useParams, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { supabase } from '../lib/supabase'
import { useLibraryStore } from '../stores/libraryStore'

export default function QuoteDetail() {
  const { quoteId } = useParams<{ quoteId: string }>()
  const navigate = useNavigate()
  const { quotes, books, removeQuote } = useLibraryStore()

  const quote = quotes.find((q) => q.id === quoteId)
  const book = books.find((b) => b.id === quote?.book_id)

  if (!quote) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-label text-on-surface-variant">Alıntı bulunamadı.</p>
      </div>
    )
  }

  async function handleDelete() {
    if (!confirm('Bu alıntıyı silmek istiyor musun?')) return
    await supabase.from('quotes').delete().eq('id', quoteId)
    removeQuote(quoteId!)
    navigate(-1)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(quote!.text)
    alert('Alıntı kopyalandı!')
  }

  async function handleShare() {
    const shareData = {
      title: book?.title ?? 'Clipa',
      text: `"${quote!.text}"\n\n— ${book?.author ?? ''}, ${book?.title ?? ''}`,
    }
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(shareData.text)
      alert('Alıntı panoya kopyalandı!')
    }
  }

  const date = new Date(quote.created_at).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <TopBar back title="Alıntı" />
      <div className="pt-20 px-6 pb-10 max-w-lg mx-auto">
        <blockquote className="font-headline italic text-2xl text-primary dark:text-dark-primary leading-relaxed mt-6 mb-6">
          "{quote.text}"
        </blockquote>

        {book && (
          <button
            onClick={() => navigate(`/library/${book.id}`)}
            className="flex flex-col text-left mb-4"
          >
            <span className="font-label font-bold text-sm text-on-surface dark:text-dark-on-surface">{book.title}</span>
            {book.author && (
              <span className="font-label text-xs text-on-surface-variant">{book.author}</span>
            )}
          </button>
        )}

        <div className="flex items-center gap-4 text-on-surface-variant mb-4">
          {quote.page_number && (
            <span className="font-label text-xs uppercase tracking-wide">s. {quote.page_number}</span>
          )}
          <span className="font-label text-xs">{date}</span>
        </div>

        {quote.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {quote.tags.map((tag) => (
              <span key={tag} className="font-label text-[10px] px-2 py-1 rounded bg-secondary/10 text-secondary font-semibold uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3 border-t border-outline-variant/30 pt-6">
          {[
            { icon: 'content_copy', label: 'Kopyala', onClick: handleCopy },
            { icon: 'share', label: 'Paylaş', onClick: handleShare },
            { icon: 'delete', label: 'Sil', onClick: handleDelete, danger: true },
          ].map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-md ${
                action.danger
                  ? 'text-error bg-error-container/30'
                  : 'text-on-surface-variant bg-surface-low'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{action.icon}</span>
              <span className="font-label text-[10px] uppercase tracking-wide">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
