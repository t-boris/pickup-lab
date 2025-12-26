/**
 * ImpulseResponseChart Component
 *
 * Time-domain visualization of pickup transient response.
 * Shows how the pickup "rings" after a string pluck.
 */

import { useMemo, useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import type { PlotRelayoutEvent } from 'plotly.js'
import { useCoilStore, useLoadStore, useTransformerStore, useUIStore } from '@/store'
import {
  computeLoadedResonanceAndQ,
  computeImpulseResponse,
  computeTransientCharacteristics,
} from '@/engine/impedance'
import type { Data, Layout } from 'plotly.js'
import { ChartWrapper, CHART_EXPLANATIONS } from './ChartWrapper'

// Default ranges (time in ms, amplitude normalized)
const DEFAULT_X_RANGE: [number, number] = [0, 5]
const DEFAULT_Y_RANGE: [number, number] = [-1.1, 1.1]

export const ImpulseResponseChart: React.FC = () => {
  const coilComputed = useCoilStore((s) => s.computed)
  const load = useLoadStore((s) => s.load)
  const loadComputed = useLoadStore((s) => s.computed)
  const transformer = useTransformerStore((s) => s.transformer)
  const resolvedTheme = useUIStore((s) => s.resolvedTheme)

  // Zoom/pan state
  const [xRange, setXRange] = useState(DEFAULT_X_RANGE)
  const [yRange, setYRange] = useState(DEFAULT_Y_RANGE)

  // Revision counter for Plotly updates
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    setRevision((r) => r + 1)
  }, [coilComputed, load, loadComputed, transformer, resolvedTheme, xRange, yRange])

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

  // Compute loaded resonance and Q, then impulse response
  const { impulseData, transientInfo } = useMemo(() => {
    if (!coilComputed || !loadComputed) {
      return { impulseData: [], transientInfo: null }
    }

    // Get loaded values (with transformer if enabled)
    const { loadedResonance, loadedQ } = computeLoadedResonanceAndQ(
      coilComputed.dcResistance,
      coilComputed.inductance,
      coilComputed.capacitance,
      load,
      transformer.enabled ? transformer : undefined
    )

    // Skip if invalid resonance
    if (loadedResonance < 100) {
      return { impulseData: [], transientInfo: null }
    }

    // Compute impulse response (duration based on decay time)
    const characteristics = computeTransientCharacteristics(loadedResonance, loadedQ)
    const duration = Math.min(Math.max(characteristics.decayTime * 2, 2), 20) // 2-20ms

    const impulse = computeImpulseResponse(loadedResonance, loadedQ, duration, 500)

    return {
      impulseData: impulse,
      transientInfo: characteristics,
    }
  }, [coilComputed, loadComputed, load, transformer])

  // Generate chart data
  const data = useMemo(() => {
    if (impulseData.length === 0) return []

    const traces: Data[] = [
      {
        x: impulseData.map((p) => p.time),
        y: impulseData.map((p) => p.amplitude),
        type: 'scatter',
        mode: 'lines',
        name: 'Impulse Response',
        line: { color: '#10b981', width: 2 },
        hovertemplate: '%{x:.2f} ms<br>%{y:.2f}<extra></extra>',
      },
    ]

    // Add envelope curves
    if (impulseData.length > 0 && transientInfo) {
      const envelopePos = impulseData.map((p) => ({
        x: p.time,
        y: Math.exp(-p.time / (transientInfo.decayTime / Math.log(10))),
      }))
      const envelopeNeg = impulseData.map((p) => ({
        x: p.time,
        y: -Math.exp(-p.time / (transientInfo.decayTime / Math.log(10))),
      }))

      traces.push({
        x: envelopePos.map((p) => p.x),
        y: envelopePos.map((p) => p.y),
        type: 'scatter',
        mode: 'lines',
        name: 'Envelope',
        line: { color: '#10b981', width: 1, dash: 'dot' },
        hoverinfo: 'skip',
        showlegend: false,
      })
      traces.push({
        x: envelopeNeg.map((p) => p.x),
        y: envelopeNeg.map((p) => p.y),
        type: 'scatter',
        mode: 'lines',
        name: 'Envelope',
        line: { color: '#10b981', width: 1, dash: 'dot' },
        hoverinfo: 'skip',
        showlegend: false,
      })
    }

    return traces
  }, [impulseData, transientInfo])

  // Chart layout
  const layout: Partial<Layout> = useMemo(
    () => ({
      title: {
        text: transientInfo
          ? `Impulse Response (${transientInfo.attackSpeed})`
          : 'Impulse Response',
        font: { size: 14 },
      },
      xaxis: {
        title: { text: 'Time (ms)' },
        range: xRange,
        gridcolor: resolvedTheme === 'dark' ? '#333' : '#ddd',
        linecolor: resolvedTheme === 'dark' ? '#444' : '#ccc',
        zeroline: true,
        zerolinecolor: resolvedTheme === 'dark' ? '#555' : '#aaa',
      },
      yaxis: {
        title: { text: 'Amplitude' },
        range: yRange,
        gridcolor: resolvedTheme === 'dark' ? '#333' : '#ddd',
        linecolor: resolvedTheme === 'dark' ? '#444' : '#ccc',
        zeroline: true,
        zerolinecolor: resolvedTheme === 'dark' ? '#555' : '#aaa',
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
      annotations: transientInfo
        ? [
            {
              x: 0.98,
              y: 0.98,
              xref: 'paper',
              yref: 'paper',
              text: `τ = ${transientInfo.decayTime.toFixed(2)} ms<br>${transientInfo.ringCycles.toFixed(1)} cycles`,
              showarrow: false,
              font: {
                size: 10,
                color: resolvedTheme === 'dark' ? '#888' : '#666',
              },
              align: 'right',
              xanchor: 'right',
              yanchor: 'top',
            },
          ]
        : [],
    }),
    [resolvedTheme, xRange, yRange, transientInfo]
  )

  if (!coilComputed || !loadComputed) {
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
      explanation={CHART_EXPLANATIONS.impulseResponse}
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
