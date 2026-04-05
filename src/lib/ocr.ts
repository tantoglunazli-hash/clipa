import { createWorker } from 'tesseract.js'

export interface OcrResult {
  fullText: string
  underlinedSegments: string[]
}

// Basic OCR (kullanılan yerler için geriye dönük uyumluluk)
export async function extractText(
  imageData: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const result = await extractWithUnderlines(imageData, onProgress)
  return result.fullText
}

// Gelişmiş OCR: tam metin + altı çizili segmentler
export async function extractWithUnderlines(
  imageData: string,
  onProgress?: (pct: number) => void
): Promise<OcrResult> {
  const worker = await createWorker('tur+eng', 1, {
    logger: (m: { status: string; progress: number }) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100))
      }
    },
  })

  await worker.setParameters({
    tessedit_pageseg_mode: '6' as any, // tek blok metin
    preserve_interword_spaces: '1' as any,
  })

  const { data } = await worker.recognize(imageData)
  await worker.terminate()

  const fullText = data.text.trim()
  const underlinedSegments = await detectUnderlinedSegments(imageData, (data as any).words ?? [])

  return { fullText, underlinedSegments }
}

// ─── Altı çizili metin tespiti ────────────────────────────────────────────────

interface TesseractWord {
  text: string
  bbox: { x0: number; y0: number; x1: number; y1: number }
  confidence: number
}

async function detectUnderlinedSegments(
  imageData: string,
  words: TesseractWord[]
): Promise<string[]> {
  if (words.length === 0) return []

  const img = await loadImage(imageData)
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)

  // Her kelime için alt çizgi kontrolü
  const underlinedWords: Array<{ text: string; lineGroup: number }> = []

  for (const word of words) {
    const text = word.text.trim()
    if (!text || word.confidence < 40) continue
    if (isUnderlined(pixels, word.bbox, canvas.width, canvas.height)) {
      // Satır grubu: y0 koordinatını ~30px bantlara yuvarla
      const lineGroup = Math.round(word.bbox.y0 / 30)
      underlinedWords.push({ text, lineGroup })
    }
  }

  if (underlinedWords.length === 0) return []

  // Yakın satırlardaki kelimeleri segment olarak birleştir
  const segments: string[] = []
  let current: string[] = []
  let lastGroup = -999

  for (const { text, lineGroup } of underlinedWords) {
    if (current.length === 0 || lineGroup - lastGroup <= 2) {
      current.push(text)
    } else {
      const segment = current.join(' ').trim()
      if (segment.length > 3) segments.push(segment)
      current = [text]
    }
    lastGroup = lineGroup
  }

  if (current.length > 0) {
    const segment = current.join(' ').trim()
    if (segment.length > 3) segments.push(segment)
  }

  return segments
}

function isUnderlined(
  pixels: ImageData,
  bbox: { x0: number; y0: number; x1: number; y1: number },
  imgWidth: number,
  imgHeight: number
): boolean {
  const { x0, x1, y1 } = bbox
  const wordWidth = x1 - x0
  if (wordWidth < 10) return false

  // Kelime altından 1–5 piksel aşağıyı tara
  const scanStartY = y1 + 1
  const scanEndY = Math.min(y1 + 6, imgHeight - 1)

  let darkPixels = 0
  let total = 0

  for (let y = scanStartY; y <= scanEndY; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = (y * imgWidth + x) * 4
      const r = pixels.data[idx]
      const g = pixels.data[idx + 1]
      const b = pixels.data[idx + 2]
      const brightness = (r + g + b) / 3
      if (brightness < 90) darkPixels++
      total++
    }
  }

  // Yüzde 45'ten fazlası koyu piksel ise altı çizili
  return total > 0 && darkPixels / total > 0.45
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
