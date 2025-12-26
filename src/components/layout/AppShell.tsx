/**
 * AppShell Component
 *
 * Main application layout with responsive sidebar, header, and main content area.
 * Adapts to mobile and desktop viewports.
 */

import { useEffect } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { useUIStore } from '@/store'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { InfoPanel } from '@/components/panels/InfoPanel'

interface AppShellProps {
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const {
    sidebarOpen,
    setSidebarOpen,
    sidebarWidth: storedWidth,
    setSidebarWidth,
    isMobileView,
    setIsMobileView,
    resolvedTheme,
  } = useUIStore()

  // Ensure sidebar width is within reasonable bounds (30-60%)
  const sidebarWidth = Math.max(30, Math.min(60, storedWidth || 43))

  // Handle responsive breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsMobileView])

  // Apply theme class to document
  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(resolvedTheme)
  }, [resolvedTheme])

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar (Sheet) */}
        {isMobileView && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-80 p-0">
              <ScrollArea className="h-full">
                <Sidebar />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        )}

        {/* Desktop: Resizable panels or full width when sidebar hidden */}
        {!isMobileView ? (
          sidebarOpen ? (
            <ResizablePanelGroup
              orientation="horizontal"
              className="flex-1"
              defaultLayout={{ sidebar: sidebarWidth, main: 100 - sidebarWidth }}
              onLayoutChange={(layout) => {
                if (layout.sidebar !== undefined) {
                  setSidebarWidth(layout.sidebar)
                }
              }}
            >
              {/* Sidebar Panel */}
              <ResizablePanel
                id="sidebar"
                minSize="30%"
                maxSize="60%"
                className="bg-amber-500/5"
              >
                <ScrollArea className="h-full">
                  <Sidebar />
                </ScrollArea>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Main content */}
              <ResizablePanel id="main" minSize="40%" className="bg-sky-500/5">
                <main className="h-full overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="container mx-auto p-4 lg:p-6">
                      {children}
                    </div>
                  </ScrollArea>
                </main>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            /* Sidebar hidden - full width content */
            <main className="flex-1 overflow-hidden bg-sky-500/5">
              <ScrollArea className="h-full">
                <div className="container mx-auto p-4 lg:p-6">
                  {children}
                </div>
              </ScrollArea>
            </main>
          )
        ) : (
          /* Mobile: Simple flex layout */
          <main className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="container mx-auto p-4 lg:p-6">
                {children}
              </div>
            </ScrollArea>
          </main>
        )}

        {/* Info Panel (desktop: right sidebar, mobile: FAB + sheet) */}
        <InfoPanel />
      </div>

      {/* Mobile bottom navigation */}
      {isMobileView && <MobileNav />}
    </div>
  )
}
