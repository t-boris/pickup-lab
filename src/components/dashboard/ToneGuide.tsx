/**
 * ToneGuide Component
 *
 * Visual EQ-style display showing pickup tonal characteristics
 * based on loaded resonant frequency, Q factor, and magnet type.
 */

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLoadStore, useMagnetStore, useCoilStore, useTransformerStore, useUIStore } from '@/store'
import { computeToneRatings, getToneDescriptor } from '@/engine/tone'
import { computeLoadedResonanceAndQ } from '@/engine/impedance'
import { cn } from '@/lib/utils'
import type { PolePieceMaterial, CoverType } from '@/domain/types'

interface ToneBarProps {
  label: string
  value: number
  color: string
}

const ToneBar: React.FC<ToneBarProps> = ({ label, value, color }) => {
  // Convert 0-10 scale to percentage
  const heightPercent = (value / 10) * 100

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Bar container */}
      <div className="relative h-24 w-8 bg-muted rounded-sm overflow-hidden">
        {/* Filled portion */}
        <div
          className={cn('absolute bottom-0 left-0 right-0 transition-all duration-300', color)}
          style={{ height: `${heightPercent}%` }}
        />
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-px bg-border/50" />
          ))}
        </div>
      </div>
      {/* Label */}
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      {/* Value */}
      <span className="text-xs font-mono">{value.toFixed(1)}</span>
    </div>
  )
}

export const ToneGuide: React.FC = () => {
  const loadComputed = useLoadStore((s) => s.computed)
  const load = useLoadStore((s) => s.load)
  const coilComputed = useCoilStore((s) => s.computed)
  const magnetType = useMagnetStore((s) => s.magnet.type)
  const polePieceMaterial = useMagnetStore((s) => s.magnet.polePieceMaterial) as PolePieceMaterial | undefined
  const coverType = useMagnetStore((s) => s.magnet.coverType) as CoverType | undefined
  const insulationType = useCoilStore((s) => s.coil.wire.insulation)
  const transformer = useTransformerStore((s) => s.transformer)
  const setSelectedElement = useUIStore((s) => s.setSelectedElement)

  // Compute transformer-adjusted loaded resonance and Q
  const { loadedResonance, loadedQ } = useMemo(() => {
    if (!coilComputed || !loadComputed) {
      return { loadedResonance: 0, loadedQ: 0 }
    }

    // Use transformer-adjusted values when transformer is enabled
    if (transformer.enabled) {
      return computeLoadedResonanceAndQ(
        coilComputed.dcResistance,
        coilComputed.inductance,
        coilComputed.capacitance,
        load,
        transformer
      )
    }

    // Without transformer, use pre-computed values
    return {
      loadedResonance: loadComputed.loadedResonance,
      loadedQ: loadComputed.loadedQ,
    }
  }, [coilComputed, loadComputed, load, transformer])

  // Need loaded values for tone calculation
  if (!coilComputed || !loadComputed || loadedResonance === 0) {
    return (
      <Card className="cursor-pointer hover:border-primary/50 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tone Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure load parameters to see tone analysis
          </p>
        </CardContent>
      </Card>
    )
  }

  // Compute tone ratings with magnet, wire, and eddy current influence
  const ratings = computeToneRatings(loadedResonance, loadedQ, magnetType, insulationType, polePieceMaterial, coverType)
  const descriptor = getToneDescriptor(ratings, loadedResonance, loadedQ, magnetType, insulationType, polePieceMaterial, coverType)

  const handleClick = () => {
    setSelectedElement({ type: 'kpi', id: 'kpi.toneGuide' })
  }

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tone Guide
          </CardTitle>
          <span className="text-xs font-medium text-primary">
            {descriptor.character}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* EQ Bars */}
        <div className="flex justify-between items-end gap-2">
          <ToneBar
            label="Bass"
            value={ratings.bass}
            color="bg-amber-500"
          />
          <ToneBar
            label="Low"
            value={ratings.lowMid}
            color="bg-orange-500"
          />
          <ToneBar
            label="Mid"
            value={ratings.highMid}
            color="bg-rose-500"
          />
          <ToneBar
            label="Treble"
            value={ratings.treble}
            color="bg-violet-500"
          />
        </div>

        {/* Suggestions (optional, show first one if exists) */}
        {descriptor.suggestions.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground border-t pt-2">
            {descriptor.suggestions[0]}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
