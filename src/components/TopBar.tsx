import { useNavigate } from 'react-router-dom'

interface TopBarProps {
  title?: string
  logo?: boolean
  back?: boolean
  right?: React.ReactNode
}

export default function TopBar({ title, logo, back, right }: TopBarProps) {
  const navigate = useNavigate()
  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 dark:bg-dark-background/80 backdrop-blur-md flex items-center justify-between px-5 h-16 border-b border-primary/5">
      <div className="w-10">
        {back && (
          <button onClick={() => navigate(-1)} className="text-primary dark:text-dark-primary">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
      </div>
      <div className="flex-1 text-center">
        {logo ? (
          <span className="font-headline italic text-2xl text-primary dark:text-dark-primary tracking-tight">
            Clipa
          </span>
        ) : (
          <span className="font-label font-semibold text-sm tracking-wide text-primary dark:text-dark-primary uppercase">
            {title}
          </span>
        )}
      </div>
      <div className="w-10 flex justify-end">{right}</div>
    </header>
  )
}
