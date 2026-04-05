import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/library', icon: 'local_library', label: 'Kitaplık' },
  { to: '/camera', icon: 'photo_camera', label: 'Kamera' },
  { to: '/profile', icon: 'person', label: 'Profil' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-20 pb-safe bg-background dark:bg-dark-background border-t border-primary/10 z-50">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 px-4 transition-colors ${
              isActive ? 'text-secondary' : 'text-on-surface-variant'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined text-[26px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className="font-label text-[10px] font-semibold uppercase tracking-widest">
                {tab.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
