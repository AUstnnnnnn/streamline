import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Settings } from 'lucide-react'

const NAV = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  const cls = (to) =>
    pathname === to
      ? 'text-accent'
      : 'text-gray-500 hover:text-gray-200'

  return (
    <>
      {/* Mobile: fixed bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex bg-gray-900/95 backdrop-blur border-t border-gray-800 md:hidden safe-area-bottom">
        {NAV.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-1 flex-col items-center gap-0.5 py-3 transition-colors ${cls(to)}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop: top bar */}
      <header className="hidden md:flex sticky top-0 z-40 items-center gap-8 px-6 py-4 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <Link to="/" className="text-xl font-bold text-accent tracking-tight">
          Streamline
        </Link>
        <nav className="flex items-center gap-6">
          {NAV.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${cls(to)}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  )
}
