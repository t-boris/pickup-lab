/**
 * PhaseChart Component
 *
 * Display phase response vs frequency.
 * Shows the phase shift introduced by the pickup circuit.
 */

import { useMemo, useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import type { PlotRelayoutEvent } from 'plotly.js'
import { useCoilStore, useLoadStore, useTransformerStore, useUIStore } from '@/store'
import { computeFullSystemResponse, generateLogFrequencies } from '@/engine/impedance'
import type { Data, Layout } from 'plotly.js'
import { ChartWrapper, CHART_EXPLANATIONS } from './ChartWrapper'

// Default ranges
const DEFAULT_X_RANGE: [number, number] = [Math.log10(20), Math.log10(50000)]
const DEFAULT_Y_RANGE: [number, number] = [-90, 90]

export const PhaseChart: React.FC = () => {
  const coilComputed = useCoilStore((s) => s.computed)
  const load = useLoadStore((s) => s.load)
  const transformer = useTransformerStore((s) => s.transformer)
  const resolvedTheme = useUIStore((s) => s.resolvedTheme)

  // Zoom/pan state
  const [xRange, setXRange] = useState(DEFAULT_X_RANGE)
  const [yRange, setYRange] = useState(DEFAULT_Y_RANGE)

  // Revision counter for Plotly updates
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    setRevision((r) => r + 1)
  }, [coilComputed, load, transformer, resolvedTheme, xRange, yRange])

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
      setYRange(DEFAULT_Y_RANGE)
    }
  }, [])

  // Control handlers
  const handleReset = useCallback(() => {
    setXRange(DEFAULT_X_RANGE)
    setYRange(DEFAULT_Y_RANGE)
  }, [])

  const handleZoomIn = useCallback(() => {
    const xMid = (xRange[0] + xRange[1]) / 2
    const xSpan = (xRange[1] - xRange[0]) * 0.375
    const yMid = (yRange[0] + yRange[1]) / 2
    const ySpan = (yRange[1] - yRange[0]) * 0.375
    setXRange([xMid - xSpan, xMid + xSpan])
    setYRange([yMid - ySpan, yMid + ySpan])
  }, [xRange, yRange])

  const handleZoomOut = useCallback(() => {
    const xMid = (xRange[0] + xRange[1]) / 2
    const xSpan = (xRange[1] - xRange[0]) * 0.667
    const yMid = (yRange[0] + yRange[1]) / 2
    const ySpan = (yRange[1] - yRange[0]) * 0.667
    setXRange([xMid - xSpan, xMid + xSpan])
    setYRange([yMid - ySpan, yMid + ySpan])
  }, [xRange, yRange])

  // Generate phase data
  const data = useMemo(() => {
    if (!coilComputed) return []

    const frequencies = generateLogFrequencies(20, 50000, 200)
    const response = computeFullSystemResponse(
      coilComputed.dcResistance,
      coilComputed.inductance,
      coilComputed.capacitance,
      load,
      frequencies,
      transformer
    )

    const traces: Data[] = [
      {
        x: response.map((p) => p.frequency),
        y: response.map((p) => p.phaseDeg),
        type: 'scatter',
        mode: 'lines',
        name: transformer.enabled ? 'With Transformer' : 'Phase',
        line: { color: '#f59e0b', width: 2 },
        hovertemplate: '%{x:.0f} Hz<br>%{y:.1f}°<extra></extra>',
      },
    ]

    return traces
  }, [coilComputed, load, transformer])

  // Chart layout
  const layout: Partial<Layout> = useMemo(
    () => ({
      title: {
        text: 'Phase Response',
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
        title: { text: 'Phase (degrees)' },
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
      explanation={CHART_EXPLANATIONS.phase}
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
