import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { useLibraryStore } from '../stores/libraryStore'
import { generateAutoTags } from '../lib/autoTags'
import type { Book } from '../types'

export default function AddQuote() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { books, addQuote } = useLibraryStore()

  const stateText: string = (location.state as any)?.text ?? ''
  const stateImage: string | null = (location.state as any)?.image ?? null
  const stateUnderlined: string[] = (location.state as any)?.underlinedSegments ?? []
  const preselectedBookId: string = searchParams.get('bookId') ?? ''

  const [text, setText] = useState(stateText)
  const [pageNumber, setPageNumber] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [selectedBookId, setSelectedBookId] = useState(preselectedBookId)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [allBooks, setAllBooks] = useState<Book[]>(books)
  const [selectionText, setSelectionText] = useState('')
  const [showSelectionBtn, setShowSelectionBtn] = useState(false)
  const [imageExpanded, setImageExpanded] = useState(false)
  const sourceTextRef = useRef<HTMLDivElement>(null)

  // Kitapları yükle
  useEffect(() => {
    if (books.length > 0) {
      setAllBooks(books)
    } else if (user) {
      supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setAllBooks(data as Book[]) })
    }
  }, [user, books])

  // Otomatik tag üret — metin veya kitap değişince
  useEffect(() => {
    if (!text.trim()) return
    const book = allBooks.find(b => b.id === selectedBookId)
    const auto = generateAutoTags(text, book?.title)
    setSuggestedTags(auto.filter(t => !tags.includes(t)))
  }, [text, selectedBookId, allBooks])

  // İlk açılışta altı çizili segment varsa seç
  useEffect(() => {
    if (stateUnderlined.length > 0 && !stateText) {
      setText(stateUnderlined[0])
    }
  }, [])

  // Metin seçimi tespiti
  const handleSelectionChange = useCallback(() => {
    if (!sourceTextRef.current) return
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      setShowSelectionBtn(false)
      setSelectionText('')
      return
    }
    const selected = selection.toString().trim()
    if (selected.length > 3 && sourceTextRef.current.contains(selection.anchorNode)) {
      setSelectionText(selected)
      setShowSelectionBtn(true)
    } else {
      setShowSelectionBtn(false)
      setSelectionText('')
    }
  }, [])

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [handleSelectionChange])

  function applySelection() {
    setText(selectionText)
    setShowSelectionBtn(false)
    window.getSelection()?.removeAllRanges()
    document.querySelector<HTMLTextAreaElement>('textarea')?.focus()
  }

  function addTag(value?: string) {
    const t = (value ?? tagInput).trim().toLowerCase()
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    if (!value) setTagInput('')
  }

  function acceptSuggested(tag: string) {
    setTags(prev => [...prev, tag])
    setSuggestedTags(prev => prev.filter(t => t !== tag))
  }

  function removeTag(tag: string) {
    setTags(prev => prev.filter(t => t !== tag))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !selectedBookId) { setError('Bir kitap seç.'); return }
    if (!text.trim()) { setError('Alıntı metni boş olamaz.'); return }
    setLoading(true)

    const { data, error: err } = await supabase
      .from('quotes')
      .insert({
        user_id: user.id,
        book_id: selectedBookId,
        text: text.trim(),
        page_number: pageNumber ? parseInt(pageNumber) : null,
        tags,
        image_url: null,
      })
      .select()
      .single()

    setLoading(false)
    if (err) { setError('Alıntı kaydedilemedi.'); return }
    addQuote(data)
    navigate(`/library/${selectedBookId}`)
  }

  return (
    <div className="min-h-screen bg-background dark:bg-dark-background">
      <TopBar back title="Alıntı Ekle" />
      <div className="pt-20 px-5 pb-10 max-w-lg mx-auto space-y-5">

        {/* Tarama görseli */}
        {stateImage && (
          <div
            className="rounded-md overflow-hidden cursor-pointer"
            onClick={() => setImageExpanded(v => !v)}
          >
            <img
              src={stateImage}
              alt="Tarama"
              className={`w-full object-cover transition-all duration-300 ${imageExpanded ? 'max-h-96' : 'max-h-32'}`}
            />
            <p className="text-center font-label text-[10px] text-on-surface-variant py-1 bg-surface-low">
              {imageExpanded ? 'Küçült' : 'Büyüt'}
            </p>
          </div>
        )}

        {/* Altı çizili bölümler */}
        {stateUnderlined.length > 0 && (
          <div className="rounded-md border border-secondary/30 bg-secondary/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary text-lg">format_underlined</span>
              <p className="font-label text-xs uppercase tracking-widest text-secondary font-semibold">
                {stateUnderlined.length} altı çizili bölüm bulundu
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {stateUnderlined.map((seg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setText(seg)}
                  className={`text-left px-3 py-2.5 rounded border text-sm font-body italic transition-colors ${
                    text === seg
                      ? 'border-secondary bg-secondary/15 text-on-surface'
                      : 'border-outline-variant bg-surface text-on-surface-variant hover:border-secondary/50'
                  }`}
                >
                  <span className="line-clamp-2">"{seg}"</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* OCR tam metin — seçilebilir */}
        {stateText && (
          <div className="rounded-md border border-outline-variant bg-surface-low">
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                Tam Metin — Bölüm seç
              </p>
              <span className="material-symbols-outlined text-sm text-on-surface-variant">
                text_select_start
              </span>
            </div>
            <div
              ref={sourceTextRef}
              className="px-4 pb-4 font-body text-sm text-on-surface leading-relaxed select-text cursor-text max-h-48 overflow-y-auto"
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
            >
              {stateText}
            </div>

            {/* Seçim butonu */}
            {showSelectionBtn && (
              <div className="px-4 pb-3">
                <button
                  type="button"
                  onClick={applySelection}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded font-label text-sm font-semibold"
                >
                  <span className="material-symbols-outlined text-base">format_quote</span>
                  Bunu Alıntı Yap
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Alıntı metni */}
          <div>
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-1.5">
              Alıntı *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="w-full bg-surface-low border border-outline-variant rounded-md px-4 py-3 font-body italic text-base text-on-surface outline-none focus:border-primary resize-none"
              placeholder="Alıntı metni..."
            />
          </div>

          {/* Kitap seçimi */}
          <div>
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-1.5">
              Kitap *
            </label>
            {allBooks.length === 0 ? (
              <button
                type="button"
                onClick={() => navigate('/add-book')}
                className="w-full border-2 border-dashed border-outline-variant rounded-md py-3 font-label text-sm text-on-surface-variant"
              >
                + Önce kitap ekle
              </button>
            ) : (
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full bg-surface-low border border-outline-variant rounded-md px-4 py-3 font-body text-sm text-on-surface outline-none focus:border-primary"
              >
                <option value="">Kitap seç...</option>
                {allBooks.map((b) => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            )}
          </div>

          {/* Sayfa no */}
          <div>
            <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant block mb-1.5">
              Sayfa No
            </label>
            <input
              type="number"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              className="w-full bg-surface-low border border-outline-variant rounded-md px-4 py-3 font-body text-sm outline-none focus:border-primary"
              placeholder="Ör: 142"
            />
          </div>

          {/* Etiketler */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                Etiketler
              </label>
              {suggestedTags.length > 0 && (
                <span className="font-label text-[10px] text-secondary uppercase tracking-wide">
                  Öneriler
                </span>
              )}
            </div>

            {/* Otomatik önerilen etiketler */}
            {suggestedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => acceptSuggested(tag)}
                    className="flex items-center gap-1 font-label text-[11px] px-2.5 py-1 rounded-full border border-secondary/40 text-secondary bg-secondary/5 uppercase tracking-wide"
                  >
                    <span className="material-symbols-outlined text-[12px]">add</span>
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Manuel etiket girişi */}
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addTag() }
                }}
                className="flex-1 bg-surface-low border border-outline-variant rounded-md px-4 py-2.5 font-label text-sm outline-none focus:border-primary"
                placeholder="Etiket yaz, Enter'a bas"
              />
              <button
                type="button"
                onClick={() => addTag()}
                className="px-3 py-2.5 bg-surface-high rounded-md font-label text-sm text-on-surface-variant"
              >
                +
              </button>
            </div>

            {/* Seçili etiketler */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 font-label text-[11px] px-2 py-1 rounded bg-secondary/10 text-secondary font-semibold uppercase tracking-wide"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="font-label text-xs text-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-label font-bold text-sm uppercase tracking-widest py-3.5 rounded-md disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      </div>
    </div>
  )
}
