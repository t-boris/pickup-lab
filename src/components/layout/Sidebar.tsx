/**
 * Sidebar Component
 *
 * Collapsible sidebar containing parameter input panels.
 * Uses accordion layout for organization.
 */

import { useMemo } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { useUIStore } from '@/store'
import { CoilSection } from '@/components/panels/CoilSection'
import { MagnetSection } from '@/components/panels/MagnetSection'
import { TransformerSection } from '@/components/panels/TransformerSection'
import { LoadSection } from '@/components/panels/LoadSection'
import { ValidationWarnings } from '@/components/panels/ValidationWarnings'

/**
 * Check if transformer section should be shown.
 * Looks for cookie 'showTransformer=true'
 */
const isTransformerEnabled = (): boolean => {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((c) => c.trim() === 'showTransformer=true')
}

// Icons for panel headers
const CoilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v4"/>
    <path d="M12 18v4"/>
    <path d="m4.93 4.93 2.83 2.83"/>
    <path d="m16.24 16.24 2.83 2.83"/>
    <path d="M2 12h4"/>
    <path d="M18 12h4"/>
    <path d="m4.93 19.07 2.83-2.83"/>
    <path d="m16.24 7.76 2.83-2.83"/>
  </svg>
)

const MagnetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15"/>
    <path d="m5 8 4 4"/>
    <path d="m12 15 4 4"/>
  </svg>
)

const TransformerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4v16"/>
    <path d="M20 4v16"/>
    <path d="M8 4c0 4 2 6 4 6s4-2 4-6"/>
    <path d="M8 20c0-4 2-6 4-6s4 2 4 6"/>
    <path d="M8 12h8"/>
  </svg>
)

const LoadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 22 1-1h3l9-9"/>
    <path d="M3 21v-3l9-9"/>
    <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/>
  </svg>
)

interface PanelInfo {
  id: 'coil' | 'magnet' | 'transformer' | 'load'
  label: string
  icon: React.ReactNode
  component: React.ReactNode
}

const allPanels: PanelInfo[] = [
  {
    id: 'coil',
    label: 'Coil',
    icon: <CoilIcon />,
    component: <CoilSection />,
  },
  {
    id: 'magnet',
    label: 'Magnet',
    icon: <MagnetIcon />,
    component: <MagnetSection />,
  },
  {
    id: 'transformer',
    label: 'Transformer',
    icon: <TransformerIcon />,
    component: <TransformerSection />,
  },
  {
    id: 'load',
    label: 'Load',
    icon: <LoadIcon />,
    component: <LoadSection />,
  },
]

export const Sidebar: React.FC = () => {
  const { expandedPanels, togglePanel } = useUIStore()

  // Filter panels based on cookie - transformer only shown if cookie set
  const panels = useMemo(() => {
    const showTransformer = isTransformerEnabled()
    return showTransformer ? allPanels : allPanels.filter((p) => p.id !== 'transformer')
  }, [])

  return (
    <div className="p-4 space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2 px-1">
        <div className="h-2 w-2 rounded-full bg-amber-500" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Inputs
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Validation Warnings */}
      <ValidationWarnings />

      <Accordion
        type="multiple"
        value={expandedPanels}
        onValueChange={(value) => {
          // Find the panel that was toggled and toggle it
          const currentSet = new Set(expandedPanels)
          const newSet = new Set(value)

          // Find added items
          value.forEach((v) => {
            if (!currentSet.has(v as 'coil' | 'magnet' | 'transformer' | 'load')) {
              togglePanel(v as 'coil' | 'magnet' | 'transformer' | 'load')
            }
          })

          // Find removed items
          expandedPanels.forEach((p) => {
            if (!newSet.has(p)) {
              togglePanel(p)
            }
          })
        }}
        className="space-y-2"
      >
        {panels.map((panel) => (
          <AccordionItem
            key={panel.id}
            value={panel.id}
            className="rounded-lg border bg-card"
          >
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{panel.icon}</span>
                <span className="font-medium">{panel.label}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {panel.component}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
