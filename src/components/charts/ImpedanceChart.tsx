/**
 * ImpedanceChart Component
 *
 * Display coil impedance magnitude vs frequency.
 * Shows the resonance peak characteristic of the pickup.
 */

import { useMemo, useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import type { PlotRelayoutEvent } from 'plotly.js'
import { useCoilStore, useUIStore } from '@/store'
import { computeCoilImpedance, generateLogFrequencies, magnitude } from '@/engine/impedance'
import type { Data, Layout } from 'plotly.js'
import { ChartWrapper, CHART_EXPLANATIONS } from './ChartWrapper'

// Default ranges
const DEFAULT_X_RANGE: [number, number] = [Math.log10(20), Math.log10(50000)]
const DEFAULT_Y_RANGE: [number, number] = [0, 100]

export const ImpedanceChart: React.FC = () => {
  const coilComputed = useCoilStore((s) => s.computed)
  const resolvedTheme = useUIStore((s) => s.resolvedTheme)

  // Zoom/pan state
  const [xRange, setXRange] = useState(DEFAULT_X_RANGE)
  const [yRange, setYRange] = useState(DEFAULT_Y_RANGE)

  // Revision counter for Plotly updates
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    setRevision((r) => r + 1)
  }, [coilComputed, resolvedTheme, xRange, yRange])

  // Calculate dynamic Y range based on data
  const dynamicYMax = useMemo(() => {
    if (!coilComputed) return 100
    const frequencies = generateLogFrequencies(20, 50000, 200)
    const impedances = frequencies.map((f) =>
      computeCoilImpedance(
        coilComputed.dcResistance,
        coilComputed.inductance,
        coilComputed.capacitance,
        f
      )
    )
    const maxZ = Math.max(...impedances.map((z) => magnitude(z) / 1000))
    return Math.ceil(maxZ * 1.2) // 20% headroom
  }, [coilComputed])

  // Update Y range when data changes
  useEffect(() => {
    setYRange([0, dynamicYMax])
  }, [dynamicYMax])

  // Handle zoom/pan events from Plotly
  const handleRelayout = useCallback((event: PlotRelayoutEvent) => {
    if (event['xaxis.range[0]'] !== undefined && event['xaxis.range[1]'] !== undefined) {
      setXRange([event['xaxis.range[0]'] as number, event['xaxis.range[1]'] as number])
    }
    if (event['yaxis.range[0]'] !== undefined && event['yaxis.range[1]'] !== undefined) {
      setYRange([event['yaxis.range[0]'] as number, event['yaxis.range[1]'] as number])
    }
    if (event['xaxis.autorange'] === true) {
      setXRange(DEFAULT_X_RANGE)
    }
    if (event['yaxis.autorange'] === true) {
      setYRange([0, dynamicYMax])
    }
  }, [dynamicYMax])

  // Control handlers
  const handleReset = useCallback(() => {
    setXRange(DEFAULT_X_RANGE)
    setYRange([0, dynamicYMax])
  }, [dynamicYMax])

  const handleZoomIn = useCallback(() => {
    const xMid = (xRange[0] + xRange[1]) / 2
    const xSpan = (xRange[1] - xRange[0]) * 0.375
    const yMid = (yRange[0] + yRange[1]) / 2
    const ySpan = (yRange[1] - yRange[0]) * 0.375
    setXRange([xMid - xSpan, xMid + xSpan])
    setYRange([Math.max(0, yMid - ySpan), yMid + ySpan])
  }, [xRange, yRange])

  const handleZoomOut = useCallback(() => {
    const xMid = (xRange[0] + xRange[1]) / 2
    const xSpan = (xRange[1] - xRange[0]) * 0.667
    const yMid = (yRange[0] + yRange[1]) / 2
    const ySpan = (yRange[1] - yRange[0]) * 0.667
    setXRange([xMid - xSpan, xMid + xSpan])
    setYRange([Math.max(0, yMid - ySpan), yMid + ySpan])
  }, [xRange, yRange])

  // Generate impedance data
  const data = useMemo(() => {
    if (!coilComputed) return []

    const frequencies = generateLogFrequencies(20, 50000, 200)
    const impedances = frequencies.map((f) =>
      computeCoilImpedance(
        coilComputed.dcResistance,
        coilComputed.inductance,
        coilComputed.capacitance,
        f
      )
    )

    const traces: Data[] = [
      {
        x: frequencies,
        y: impedances.map((z) => magnitude(z) / 1000), // Convert to kOhm
        type: 'scatter',
        mode: 'lines',
        name: 'Impedance',
        line: { color: '#10b981', width: 2 },
        hovertemplate: '%{x:.0f} Hz<br>%{y:.1f} kΩ<extra></extra>',
      },
    ]

    return traces
  }, [coilComputed])

  // Chart layout
  const layout: Partial<Layout> = useMemo(
    () => ({
      title: {
        text: 'Impedance |Z|',
        font: { size: 14 },
      },
      xaxis: {
        title: { text: 'Frequency (Hz)' },
        type: 'log',
        range: xRange,
        gridcolor: resolvedTheme === 'dark' ? '#333' : '#ddd',
        linecolor: resolvedTheme === 'dark' ? '#444' : '#ccc',
      },
      yaxis: {
        title: { text: 'Impedance (kΩ)' },
        range: yRange,
        gridcolor: resolvedTheme === 'dark' ? '#333' : '#ddd',
        linecolor: resolvedTheme === 'dark' ? '#444' : '#ccc',
      },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: {
        color: resolvedTheme === 'dark' ? '#e5e5e5' : '#1a1a1a',
        size: 11,
      },
      margin: { t: 40, r: 20, b: 50, l: 60 },
      showlegend: false,
      autosize: true,
      dragmode: 'pan',
    }),
    [resolvedTheme, xRange, yRange]
  )

  if (!coilComputed) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Loading...
      </div>
    )
  }

  return (
    <ChartWrapper
      onReset={handleReset}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      explanation={CHART_EXPLANATIONS.impedance}
    >
      <Plot
        data={data}
        layout={layout}
        revision={revision}
        onRelayout={handleRelayout}
        useResizeHandler
        config={{
          responsive: true,
          displayModeBar: false,
          scrollZoom: true,
        }}
        style={{ width: '100%', height: '100%', minHeight: 280 }}
      />
    </ChartWrapper>
  )
}
