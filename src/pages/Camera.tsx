import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { extractWithUnderlines } from '../lib/ocr'

export default function Camera() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [streaming, setStreaming] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'ocr' | 'underline'>('ocr')
  const [error, setError] = useState('')
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setStreaming(true)
      }
    } catch {
      setError('Kamera izni verilmedi. Galeriden fotoğraf seçebilirsin.')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }

  async function processImage(imageData: string) {
    setProcessing(true)
    setProgress(0)
    setPhase('ocr')
    setError('')
    try {
      const result = await extractWithUnderlines(imageData, (pct) => {
        setProgress(pct)
        if (pct >= 100) setPhase('underline')
      })
      stopCamera()
      navigate('/add-quote', {
        state: {
          text: result.fullText,
          image: imageData,
          underlinedSegments: result.underlinedSegments,
        },
      })
    } catch {
      setError('Metin okunamadı. Tekrar dene.')
      setProcessing(false)
    }
  }

  async function capture() {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg', 0.92)
    await processImage(imageData)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const imageData = ev.target?.result as string
      await processImage(imageData)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Çerçeve overlay */}
        {streaming && !processing && (
          <>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-4/5 h-56 border-2 border-white/60 rounded-md relative">
                <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-md" />
                <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-md" />
                <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-md" />
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-md" />
              </div>
            </div>
            <p className="absolute top-4 left-0 right-0 text-center font-label text-white/70 text-xs uppercase tracking-widest">
              Sayfayı çerçeve içine al
            </p>
          </>
        )}

        {/* Kamera izni yok — galeri butonu */}
        {!streaming && !processing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <span className="material-symbols-outlined text-5xl text-white/40">no_photography</span>
            <p className="font-label text-white/60 text-sm text-center px-8">
              Kamera izni verilmedi
            </p>
          </div>
        )}

        {/* İşleniyor */}
        {processing && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-4 px-8">
            <span className="material-symbols-outlined text-5xl text-white animate-pulse">
              {phase === 'ocr' ? 'auto_read_play' : 'format_underlined'}
            </span>
            <p className="font-label text-white text-sm uppercase tracking-widest text-center">
              {phase === 'ocr' ? 'Metin okunuyor...' : 'Altı çizili bölümler aranıyor...'}
            </p>
            <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${phase === 'underline' ? 100 : progress}%` }}
              />
            </div>
            {phase === 'ocr' && (
              <p className="font-label text-white/60 text-xs">{progress}%</p>
            )}
          </div>
        )}

        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white rounded-md p-3 text-center">
            <p className="font-label text-sm">{error}</p>
            <button
              onClick={() => { setError(''); startCamera() }}
              className="font-label text-xs underline mt-1"
            >
              Tekrar dene
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-8 py-6 bg-black">
        {/* Geri */}
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Çek veya Galeri */}
        {streaming ? (
          <button
            onClick={capture}
            disabled={processing}
            className="w-20 h-20 rounded-full bg-red-500 border-4 border-white flex items-center justify-center disabled:opacity-40 active:scale-90 transition-transform shadow-lg"
          >
            <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
          </button>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-white text-3xl">photo_library</span>
          </button>
        )}

        {/* Manuel giriş */}
        <button
          onClick={() => navigate('/add-quote')}
          className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white"
        >
          <span className="material-symbols-outlined">edit</span>
        </button>
      </div>
    </div>
  )
}
