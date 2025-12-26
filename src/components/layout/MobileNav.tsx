/**
 * MobileNav Component
 *
 * Bottom navigation bar for mobile devices.
 * Provides tab switching between parameters, results, and charts.
 */

import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store'

// Icons for navigation
const ParamsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const ResultsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2"/>
    <path d="M3 9h18"/>
    <path d="M9 21V9"/>
  </svg>
)

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/>
    <path d="m19 9-5 5-4-4-3 3"/>
  </svg>
)

interface NavItem {
  id: 'params' | 'results' | 'charts'
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { id: 'params', label: 'Parameters', icon: <ParamsIcon /> },
  { id: 'results', label: 'Results', icon: <ResultsIcon /> },
  { id: 'charts', label: 'Charts', icon: <ChartIcon /> },
]

export const MobileNav: React.FC = () => {
  const { mobileActiveTab, setMobileActiveTab, setSidebarOpen } = useUIStore()

  const handleTabChange = (tab: 'params' | 'results' | 'charts') => {
    setMobileActiveTab(tab)
    if (tab === 'params') {
      setSidebarOpen(true)
    } else {
      setSidebarOpen(false)
    }
  }

  return (
    <nav className="flex h-16 items-center justify-around border-t border-border bg-card px-2">
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          className={`
            flex h-12 flex-1 flex-col items-center gap-1 rounded-lg
            ${mobileActiveTab === item.id ? 'bg-accent text-accent-foreground' : ''}
          `}
          onClick={() => handleTabChange(item.id)}
        >
          {item.icon}
          <span className="text-xs">{item.label}</span>
        </Button>
      ))}
    </nav>
  )
}
