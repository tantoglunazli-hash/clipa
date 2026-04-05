import { useNavigate } from 'react-router-dom'
import type { Quote } from '../types'

interface QuoteCardProps {
  quote: Quote
  onDelete?: (id: string) => void
}

export default function QuoteCard({ quote, onDelete }: QuoteCardProps) {
  const navigate = useNavigate()
  return (
    <div className="bg-surface-low dark:bg-dark-surface-container rounded-md p-4 group relative">
      <button
        onClick={() => navigate(`/quote/${quote.id}`)}
        className="w-full text-left"
      >
        <p className="font-body italic text-on-surface dark:text-dark-on-surface text-base leading-relaxed line-clamp-3">
          "{quote.text}"
        </p>
        <div className="flex items-center gap-3 mt-2">
          {quote.page_number && (
            <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-wide">
              s. {quote.page_number}
            </span>
          )}
          {quote.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {quote.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="font-label text-[9px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary font-semibold uppercase tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>
      {onDelete && (
        <button
          onClick={() => onDelete(quote.id)}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-error"
        >
          <span className="material-symbols-outlined text-base">delete</span>
        </button>
      )}
    </div>
  )
}
