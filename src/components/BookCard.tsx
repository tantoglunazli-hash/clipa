import { useNavigate } from 'react-router-dom'
import type { Book } from '../types'

const COVER_COLORS = [
  'bg-[#002b5b]', 'bg-[#6e3900]', 'bg-[#00322d]',
  'bg-[#3b0040]', 'bg-[#1a1a00]', 'bg-[#003020]',
]

function colorForId(id: string) {
  const n = id.charCodeAt(0) % COVER_COLORS.length
  return COVER_COLORS[n]
}

interface BookCardProps {
  book: Book
}

export default function BookCard({ book }: BookCardProps) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(`/library/${book.id}`)}
      className="flex flex-col rounded-md overflow-hidden bg-surface-low dark:bg-dark-surface-container shadow-sm active:scale-95 transition-transform"
    >
      <div className={`w-full aspect-[3/4] flex items-center justify-center ${colorForId(book.id)} overflow-hidden`}>
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <span className="font-headline italic text-white/60 text-4xl px-2 text-center leading-tight">
            {book.title.slice(0, 2)}
          </span>
        )}
      </div>
      <div className="p-3 text-left">
        <p className="font-body font-semibold text-sm text-on-surface dark:text-dark-on-surface leading-tight line-clamp-2">
          {book.title}
        </p>
        {book.author && (
          <p className="font-label text-[11px] text-on-surface-variant mt-0.5 line-clamp-1">
            {book.author}
          </p>
        )}
        <p className="font-label text-[10px] text-secondary mt-1 font-semibold">
          {book.quote_count ?? 0} alıntı
        </p>
      </div>
    </button>
  )
}
