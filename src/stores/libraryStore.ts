import { create } from 'zustand'
import type { Book, Quote } from '../types'

interface LibraryStore {
  books: Book[]
  quotes: Quote[]
  searchQuery: string
  setBooks: (books: Book[]) => void
  setQuotes: (quotes: Quote[]) => void
  setSearchQuery: (q: string) => void
  addBook: (book: Book) => void
  updateBook: (book: Book) => void
  removeBook: (id: string) => void
  addQuote: (quote: Quote) => void
  updateQuote: (quote: Quote) => void
  removeQuote: (id: string) => void
}

export const useLibraryStore = create<LibraryStore>((set) => ({
  books: [],
  quotes: [],
  searchQuery: '',
  setBooks: (books) => set({ books }),
  setQuotes: (quotes) => set({ quotes }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  addBook: (book) => set((s) => ({ books: [book, ...s.books] })),
  updateBook: (book) =>
    set((s) => ({ books: s.books.map((b) => (b.id === book.id ? book : b)) })),
  removeBook: (id) =>
    set((s) => ({
      books: s.books.filter((b) => b.id !== id),
      quotes: s.quotes.filter((q) => q.book_id !== id),
    })),
  addQuote: (quote) => set((s) => ({ quotes: [quote, ...s.quotes] })),
  updateQuote: (quote) =>
    set((s) => ({ quotes: s.quotes.map((q) => (q.id === quote.id ? quote : q)) })),
  removeQuote: (id) =>
    set((s) => ({ quotes: s.quotes.filter((q) => q.id !== id) })),
}))
