interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-8 gap-4">
      <span className="material-symbols-outlined text-5xl text-outline-variant">{icon}</span>
      <div>
        <p className="font-headline italic text-xl text-on-surface-variant">{title}</p>
        {description && (
          <p className="font-label text-sm text-on-surface-variant/60 mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
