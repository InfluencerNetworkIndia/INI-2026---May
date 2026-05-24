import { Home, UtensilsCrossed, History, User, Bell } from 'lucide-react'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/log', icon: UtensilsCrossed, label: 'Log Food' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFFDF9' }}>
      {/* Top header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b" style={{ backgroundColor: '#FFFDF9', borderColor: '#F0EDE8' }}>
        <span className="text-xl font-bold" style={{ color: '#D4537E' }}>GarbhaMitra</span>
        <button aria-label="Notifications" className="p-2 rounded-full hover:bg-rose-50 transition-colors">
          <Bell size={20} style={{ color: '#9B9590' }} />
        </button>
      </header>

      {/* Main content — padded so it doesn't hide behind bottom nav */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t" style={{ backgroundColor: '#FFFDF9', borderColor: '#F0EDE8' }}>
        <div className="flex">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors hover:opacity-80"
              style={{ color: '#9B9590' }}
            >
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
