/**
 * PickupMessages Component
 *
 * Displays analysis messages about the pickup configuration:
 * problems, warnings, recommendations, and descriptions.
 */

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCoilStore, useMagnetStore, useLoadStore, useTransformerStore, useUIStore } from '@/store'
import { analyzePickup, type MessageLevel } from '@/engine/analyzer'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  ChevronRight,
} from 'lucide-react'

const levelConfig: Record<
  MessageLevel,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  danger: {
    icon: AlertCircle,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
  info: {
    icon: Info,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  success: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
  },
}

export const PickupMessages: React.FC = () => {
  const coil = useCoilStore((s) => s.coil)
  const coilComputed = useCoilStore((s) => s.computed)
  const magnet = useMagnetStore((s) => s.magnet)
  const positioning = useMagnetStore((s) => s.positioning)
  const magnetComputed = useMagnetStore((s) => s.computed)
  const load = useLoadStore((s) => s.load)
  const loadComputed = useLoadStore((s) => s.computed)
  const transformer = useTransformerStore((s) => s.transformer)
  const setSelectedElement = useUIStore((s) => s.setSelectedElement)

  const analysis = useMemo(() => {
    if (!coilComputed) return null
    return analyzePickup(
      coil,
      coilComputed,
      magnet,
      positioning,
      magnetComputed ?? undefined,
      load,
      loadComputed ?? undefined,
      transformer.enabled ? transformer : undefined
    )
  }, [coil, coilComputed, magnet, positioning, magnetComputed, load, loadComputed, transformer])

  const handleClick = () => {
    setSelectedElement({ type: 'kpi', id: 'kpi.analysis' })
  }

  if (!analysis) {
    return (
      <Card className="col-span-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pickup Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure parameters to see analysis
          </p>
        </CardContent>
      </Card>
    )
  }

  const { messages } = analysis

  // Count by level
  const dangerCount = messages.filter((m) => m.level === 'danger').length
  const warningCount = messages.filter((m) => m.level === 'warning').length
  const infoCount = messages.filter((m) => m.level === 'info').length

  // Determine card variant based on most severe message
  const cardVariant =
    dangerCount > 0
      ? 'border-red-500/50 bg-red-500/5'
      : warningCount > 0
        ? 'border-yellow-500/50 bg-yellow-500/5'
        : 'border-border'

  return (
    <Card
      className={cn(
        'col-span-full cursor-pointer hover:border-primary/50 transition-colors',
        cardVariant
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            {dangerCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" />
                {dangerCount}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-yellow-500">
                <AlertTriangle className="h-3 w-3" />
                {warningCount}
              </span>
            )}
            {infoCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-blue-500">
                <Info className="h-3 w-3" />
                {infoCount}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Messages */}
        {messages.length > 0 && (
          <div className="space-y-2">
            {messages.slice(0, 6).map((message, index) => {
              const config = levelConfig[message.level]
              const Icon = config.icon
              return (
                <div
                  key={index}
                  className={cn(
                    'rounded-md border p-2',
                    config.bg,
                    config.border
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', config.color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{message.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {message.description}
                      </p>
                      {message.suggestion && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <ChevronRight className="h-3 w-3" />
                          {message.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {messages.length > 6 && (
              <p className="text-xs text-muted-foreground text-center">
                +{messages.length - 6} more
              </p>
            )}
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">No issues found</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
