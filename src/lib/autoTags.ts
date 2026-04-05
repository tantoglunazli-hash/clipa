// Alıntı içeriğine ve kitap adına göre otomatik etiket üretimi

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  motivasyon: [
    'başarı', 'hedef', 'hayat', 'çalış', 'emek', 'inanç', 'güç', 'kararlı',
    'azim', 'cesaret', 'başar', 'ilerleme', 'gelişim', 'umut', 'ilerle',
    'mücadele', 'pes etme', 'direniş', 'iradem', 'özgüven', 'motive',
  ],
  felsefe: [
    'varlık', 'anlam', 'bilinç', 'hakikat', 'özgürlük', 'akıl', 'düşünce',
    'gerçek', 'bilgi', 'varoluş', 'zaman', 'sonsuz', 'evren', 'mutlak',
    'ahlak', 'erdem', 'iyilik', 'kötülük', 'adalet', 'felsefe',
  ],
  aşk: [
    'sevgi', 'aşk', 'kalp', 'gönül', 'yürek', 'sevmek', 'özlem', 'hasret',
    'sevgili', 'tutku', 'duygu', 'hissett', 'bağlılık', 'sadakat', 'iki',
  ],
  'kişisel-gelişim': [
    'alışkanlık', 'disiplin', 'öğrenme', 'pratik', 'sistem', 'verimli',
    'odak', 'zihniyet', 'rutine', 'değişim', 'dönüşüm', 'büyüme', 'potansiyel',
    'beceri', 'gelişme', 'kendin', 'benlik',
  ],
  psikoloji: [
    'ego', 'kaygı', 'korku', 'psikoloji', 'bilinçdışı', 'travma', 'iyileşme',
    'duygusal', 'zihinsel', 'davranış', 'bağımlılık', 'özgüven', 'benlik saygısı',
  ],
  bilim: [
    'deney', 'teori', 'hipotez', 'araştırma', 'bilim', 'matematik', 'fizik',
    'kimya', 'biyoloji', 'veri', 'analiz', 'kanıt', 'evrim', 'keşif',
  ],
  tarih: [
    'tarih', 'savaş', 'imparatorluk', 'uygarlık', 'geçmiş', 'yüzyıl',
    'dönem', 'antik', 'modern', 'devrim', 'cumhuriyet', 'osmanlı', 'medeniye',
  ],
  edebiyat: [
    'roman', 'şiir', 'edebi', 'yazar', 'hikaye', 'karakter', 'anlatı',
    'dil', 'metafor', 'sembol', 'okur', 'sayfa', 'kitap', 'kelime',
  ],
  ekonomi: [
    'para', 'servet', 'yatırım', 'ekonomi', 'piyasa', 'değer', 'zenginlik',
    'risk', 'getiri', 'borsa', 'faiz', 'enflasyon', 'bütçe', 'tasarruf',
  ],
  doğa: [
    'doğa', 'ağaç', 'deniz', 'toprak', 'hava', 'su', 'orman', 'dağ',
    'ışık', 'güneş', 'ay', 'yıldız', 'evren', 'bitki', 'hayvan',
  ],
  spirituel: [
    'ruh', 'tanrı', 'din', 'ibadet', 'dua', 'inanç', 'ahiret', 'cennet',
    'cehennem', 'kader', 'tevekkül', 'şükür', 'sabır', 'tevazu', 'nefs',
  ],
}

export function generateAutoTags(quoteText: string, bookTitle?: string): string[] {
  const tags: string[] = []
  const lowerText = quoteText.toLowerCase()

  // 1) Kategori tespiti (en fazla 2 kategori)
  const matched: string[] = []
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => lowerText.includes(kw)).length
    if (score > 0) matched.push(category)
    if (matched.length === 2) break
  }
  tags.push(...matched)

  // 2) Kitap adından kısa etiket
  if (bookTitle) {
    const stopWords = new Set([
      'bir', 've', 'ile', 'ya', 'da', 'de', 'ya da', 'the', 'a', 'an',
      'of', 'in', 'on', 'to', 'üzerine', 'için', 'hakkında',
    ])
    const words = bookTitle.split(/\s+/)
    const keyword = words.find(
      w => w.length > 2 && !stopWords.has(w.toLowerCase())
    )
    if (keyword) {
      const slug = keyword
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9-]/g, '')
      if (slug.length > 1) tags.push(slug)
    }
  }

  // 3) Uzunluk etiketi
  const wordCount = quoteText.trim().split(/\s+/).length
  if (wordCount <= 12) tags.push('kısa')
  else if (wordCount >= 60) tags.push('uzun')

  return [...new Set(tags)].filter(t => t.length > 1)
}
