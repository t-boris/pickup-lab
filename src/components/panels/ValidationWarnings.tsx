/**
 * ValidationWarnings Component
 *
 * Display validation warnings for current configuration.
 * Shows info, warning, and danger level alerts.
 */

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { useCoilStore, useMagnetStore, useLoadStore } from '@/store'
import { checkWarnings, type ValidationWarning } from '@/lib/validation'

// Icons
const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
)

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>
)

const DangerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m15 9-6 6"/>
    <path d="m9 9 6 6"/>
  </svg>
)

const warningStyles: Record<ValidationWarning['level'], { bg: string; border: string; icon: React.FC }> = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: InfoIcon,
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: WarningIcon,
  },
  danger: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: DangerIcon,
  },
}

export const ValidationWarnings: React.FC = () => {
  const coil = useCoilStore((s) => s.coil)
  const magnet = useMagnetStore((s) => s.magnet)
  const positioning = useMagnetStore((s) => s.positioning)
  const load = useLoadStore((s) => s.load)

  const warnings = useMemo(() => {
    try {
      return checkWarnings({ coil, magnet, positioning, load })
    } catch {
      return []
    }
  }, [coil, magnet, positioning, load])

  if (warnings.length === 0) return null

  // Count by level
  const dangerCount = warnings.filter((w) => w.level === 'danger').length
  const warningCount = warnings.filter((w) => w.level === 'warning').length

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Warnings</span>
        <div className="flex gap-1">
          {dangerCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {dangerCount} critical
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-500">
              {warningCount} warnings
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        {warnings.map((warning, index) => {
          const style = warningStyles[warning.level]
          const Icon = style.icon

          return (
            <div
              key={index}
              className={`flex items-start gap-2 rounded-md border p-2 text-xs ${style.bg} ${style.border}`}
            >
              <span className="mt-0.5 shrink-0">
                <Icon />
              </span>
              <span>{warning.message}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
