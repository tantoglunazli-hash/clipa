export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Book {
  id: string
  user_id: string
  title: string
  author: string | null
  cover_url: string | null
  created_at: string
  quote_count?: number
}

export interface Quote {
  id: string
  user_id: string
  book_id: string
  text: string
  page_number: number | null
  image_url: string | null
  tags: string[]
  created_at: string
  book?: Book
}

export interface UserStats {
  total_books: number
  total_quotes: number
}
