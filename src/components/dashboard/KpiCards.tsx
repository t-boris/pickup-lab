/**
 * KpiCards Component
 *
 * Display key computed values as metric cards.
 * Shows L, Rdc, Cp, f₀, Q, B@string, and Output Index.
 */

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCoilStore, useMagnetStore, useLoadStore, useTransformerStore, useUIStore } from '@/store'
import { formatSISplit } from '@/lib/formatters'
import { ToneGuide } from './ToneGuide'
import { PickupMessages } from './PickupMessages'
import { computeLoadedResonanceAndQ, computeCoilImpedance, magnitude } from '@/engine/impedance'

/**
 * Format sensitivity with smart units (mV/mm, µV/mm, nV/mm)
 */
const formatSensitivity = (value: number): { value: string; unit: string } => {
  if (value >= 0.01) {
    // Normal range: show in mV/mm
    return { value: value.toFixed(2), unit: 'mV/mm' }
  } else if (value >= 0.00001) {
    // Small: show in µV/mm
    return { value: (value * 1000).toFixed(2), unit: 'µV/mm' }
  } else if (value > 0) {
    // Very small: show in nV/mm
    return { value: (value * 1000000).toFixed(2), unit: 'nV/mm' }
  } else {
    return { value: '0', unit: 'mV/mm' }
  }
}

interface KpiCardProps {
  title: string
  value: string
  unit?: string
  description?: string
  variant?: 'default' | 'warning' | 'success' | 'danger'
  infoId?: string
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  description,
  variant = 'default',
  infoId,
}) => {
  const setSelectedElement = useUIStore((s) => s.setSelectedElement)

  const variantStyles = {
    default: 'border-border',
    warning: 'border-yellow-500/50 bg-yellow-500/5',
    success: 'border-green-500/50 bg-green-500/5',
    danger: 'border-red-500/50 bg-red-500/5',
  }

  const handleClick = () => {
    if (infoId) {
      setSelectedElement({ type: 'kpi', id: infoId })
    }
  }

  return (
    <Card
      className={`${variantStyles[variant]} ${infoId ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{value}</span>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

export const KpiCards: React.FC = () => {
  const coilComputed = useCoilStore((s) => s.computed)
  const magnetComputed = useMagnetStore((s) => s.computed)
  const load = useLoadStore((s) => s.load)
  const transformer = useTransformerStore((s) => s.transformer)
  const transformerComputed = useTransformerStore((s) => s.computed)
  const transformerEnabled = transformer.enabled

  // Compute actual loaded resonance and Q (with transformer if enabled)
  const loadedStats = useMemo(() => {
    if (!coilComputed) return null
    return computeLoadedResonanceAndQ(
      coilComputed.dcResistance,
      coilComputed.inductance,
      coilComputed.capacitance,
      load,
      transformer.enabled ? transformer : undefined
    )
  }, [coilComputed, load, transformer])

  // Compute output impedance at 1kHz
  const outputImpedance1kHz = useMemo(() => {
    if (!coilComputed) return null
    const z = computeCoilImpedance(
      coilComputed.dcResistance,
      coilComputed.inductance,
      coilComputed.capacitance,
      1000
    )
    let mag = magnitude(z)
    // If transformer enabled, output impedance is reflected by n²
    if (transformer.enabled) {
      const n = transformer.winding.secondaryTurns / transformer.winding.primaryTurns
      mag = mag * n * n
    }
    return mag
  }, [coilComputed, transformer])

  // Default values if not computed yet
  if (!coilComputed) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Inductance" value="--" unit="H" />
        <KpiCard title="DC Resistance" value="--" unit="Ω" />
        <KpiCard title="Capacitance" value="--" unit="pF" />
        <KpiCard title="Resonance" value="--" unit="kHz" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Primary Coil Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(() => {
          const L = formatSISplit(coilComputed.inductance, 'H')
          return (
            <KpiCard
              title="Inductance (L)"
              value={L.value}
              unit={L.unit}
              infoId="kpi.inductance"
            />
          )
        })()}
        {(() => {
          const R = formatSISplit(coilComputed.dcResistance, 'Ω')
          return (
            <KpiCard
              title="DC Resistance (Rdc)"
              value={R.value}
              unit={R.unit}
              infoId="kpi.dcResistance"
            />
          )
        })()}
        {(() => {
          const C = formatSISplit(coilComputed.capacitance, 'F')
          return (
            <KpiCard
              title="Capacitance (Cp)"
              value={C.value}
              unit={C.unit}
              description="Parasitic"
              infoId="kpi.capacitance"
            />
          )
        })()}
        {(() => {
          const f = formatSISplit(coilComputed.resonantFrequency, 'Hz')
          return (
            <KpiCard
              title="Resonance (f₀)"
              value={f.value}
              unit={f.unit}
              description={`Q = ${coilComputed.qualityFactor.toFixed(1)}`}
              infoId="kpi.resonance"
            />
          )
        })()}
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Wire Length"
          value={coilComputed.totalWireLength.toFixed(0)}
          unit="m"
          description={`~${(coilComputed.totalWireLength / 0.3048).toFixed(0)} ft`}
          infoId="kpi.wireLength"
        />
        <KpiCard
          title="Quality Factor (Q)"
          value={coilComputed.qualityFactor.toFixed(1)}
          description="At resonance"
          infoId="kpi.qualityFactor"
        />

        {/* Magnetic Field */}
        {magnetComputed && (
          <KpiCard
            title="B @ String"
            value={(magnetComputed.fieldAtString * 1000).toFixed(1)}
            unit="mT"
            variant={
              magnetComputed.stringPullWarning === 'caution'
                ? 'warning'
                : magnetComputed.stringPullWarning === 'danger'
                ? 'danger'
                : 'default'
            }
            description={`String pull: ${magnetComputed.stringPullWarning}`}
            infoId="kpi.bAtString"
          />
        )}

        {/* Sensitivity */}
        {magnetComputed && (() => {
          const sens = formatSensitivity(magnetComputed.sensitivityIndex)
          return (
            <KpiCard
              title="Sensitivity"
              value={sens.value}
              unit={sens.unit}
              description="@ 1kHz"
              infoId="kpi.sensitivity"
            />
          )
        })()}
      </div>

      {/* Load & Transformer Metrics */}
      {(loadedStats || transformerEnabled) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loadedStats && (
            <>
              {(() => {
                const f = formatSISplit(loadedStats.loadedResonance, 'Hz')
                return (
                  <KpiCard
                    title={transformerEnabled ? "Loaded f₀ (w/TX)" : "Loaded f₀"}
                    value={f.value}
                    unit={f.unit}
                    description={`Q = ${loadedStats.loadedQ.toFixed(1)}`}
                    infoId="kpi.loadedResonance"
                  />
                )
              })()}
              <ToneGuide />
            </>
          )}

          {/* Output Impedance at 1kHz */}
          {outputImpedance1kHz && (
            (() => {
              const z = formatSISplit(outputImpedance1kHz, 'Ω')
              return (
                <KpiCard
                  title={transformerEnabled ? "Z_out @ 1kHz (w/TX)" : "Z @ 1kHz"}
                  value={z.value}
                  unit={z.unit}
                  description="Source impedance"
                  infoId="kpi.impedance1khz"
                />
              )
            })()
          )}

          {transformerEnabled && transformerComputed && (
            <>
              <KpiCard
                title="Voltage Gain"
                value={transformerComputed.voltageRatio.toFixed(1)}
                unit="x"
                description={`1:${transformerComputed.turnsRatio.toFixed(0)} ratio`}
                infoId="kpi.voltageGain"
              />
              {/* Effective Sensitivity with transformer */}
              {magnetComputed && (() => {
                const effectiveSens = magnetComputed.sensitivityIndex * transformerComputed.turnsRatio
                const sens = formatSensitivity(effectiveSens)
                return (
                  <KpiCard
                    title="Effective Sens."
                    value={sens.value}
                    unit={sens.unit}
                    description="After TX boost"
                    infoId="kpi.effectiveSensitivity"
                  />
                )
              })()}
              {(() => {
                const bw = formatSISplit(transformerComputed.bandwidth, 'Hz')
                return (
                  <KpiCard
                    title="TX Bandwidth"
                    value={bw.value}
                    unit={bw.unit}
                    variant={transformerComputed.bandwidth > 10000 ? 'success' : 'warning'}
                    description="-3dB point"
                    infoId="kpi.txBandwidth"
                  />
                )
              })()}
            </>
          )}
        </div>
      )}

      {/* Pickup Analysis Messages */}
      <div className="grid gap-4">
        <PickupMessages />
      </div>
    </div>
  )
}
