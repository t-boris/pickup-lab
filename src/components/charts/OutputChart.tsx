/**
 * OutputChart Component
 *
 * Display relative output (sensitivity) vs string distance.
 * Helps visualize optimal pickup height for string interaction.
 */

import { useMemo, useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import type { PlotRelayoutEvent } from 'plotly.js'
import { useMagnetStore, useCoilStore, useUIStore } from '@/store'
import { generateOutputVsDistance } from '@/engine/magnetic'
import type { Data, Layout } from 'plotly.js'
import { ChartWrapper, CHART_EXPLANATIONS } from './ChartWrapper'

// Default ranges
const DEFAULT_X_RANGE: [number, number] = [1, 10]
const DEFAULT_Y_RANGE: [number, number] = [0, 110]

export const OutputChart: React.FC = () => {
  const magnet = useMagnetStore((s) => s.magnet)
  const positioning = useMagnetStore((s) => s.positioning)
  const coil = useCoilStore((s) => s.coil)
  const coilComputed = useCoilStore((s) => s.computed)
  const resolvedTheme = useUIStore((s) => s.resolvedTheme)

  // Zoom/pan state
  const [xRange, setXRange] = useState(DEFAULT_X_RANGE)
  const [yRange, setYRange] = useState(DEFAULT_Y_RANGE)

  // Revision counter for Plotly updates
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    setRevision((r) => r + 1)
  }, [magnet, positioning, coil, coilComputed, resolvedTheme, xRange, yRange])

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
    setXRange([Math.max(0, xMid - xSpan), xMid + xSpan])
    setYRange([Math.max(0, yMid - ySpan), yMid + ySpan])
  }, [xRange, yRange])

  const handleZoomOut = useCallback(() => {
    const xMid = (xRange[0] + xRange[1]) / 2
    const xSpan = (xRange[1] - xRange[0]) * 0.667
    const yMid = (yRange[0] + yRange[1]) / 2
    const ySpan = (yRange[1] - yRange[0]) * 0.667
    setXRange([Math.max(0, xMid - xSpan), xMid + xSpan])
    setYRange([Math.max(0, yMid - ySpan), yMid + ySpan])
  }, [xRange, yRange])

  // Generate output data
  const data = useMemo(() => {
    if (!coilComputed) return []

    // Estimate effective area from geometry
    const meanRadius =
      (coil.geometry.innerRadius + coil.geometry.outerRadius) / 2
    const effectiveArea = Math.PI * (meanRadius / 1000) ** 2 // Convert mm to m

    const outputData = generateOutputVsDistance(
      magnet,
      coil.wire.turns,
      effectiveArea,
      coil.couplingFactor,
      1,
      10,
      50
    )

    const traces: Data[] = [
      {
        x: outputData.map((p) => p.distance),
        y: outputData.map((p) => p.output * 100), // Convert to percentage
        type: 'scatter',
        mode: 'lines',
        name: 'Output',
        line: { color: '#ec4899', width: 2 },
        fill: 'tozeroy',
        fillcolor: 'rgba(236, 72, 153, 0.1)',
        hovertemplate: '%{x:.1f} mm<br>%{y:.0f}%<extra></extra>',
      },
      // Marker for string position
      {
        x: [positioning.stringToPoleDistance],
        y: [
          (outputData.find(
            (p) => Math.abs(p.distance - positioning.stringToPoleDistance) < 0.3
          )?.output || 0) * 100,
        ],
        type: 'scatter',
        mode: 'markers',
        name: 'String Position',
        marker: {
          color: '#ef4444',
          size: 10,
          symbol: 'diamond',
        },
        showlegend: true,
        hovertemplate: 'String: %{x:.1f} mm<br>%{y:.0f}%<extra></extra>',
      },
    ]

    return traces
  }, [
    magnet,
    coil,
    coilComputed,
    positioning.stringToPoleDistance,
  ])

  // Chart layout
  const layout: Partial<Layout> = useMemo(
    () => ({
      title: {
        text: 'Relative Output vs Distance',
        font: { size: 14 },
      },
      xaxis: {
        title: { text: 'Distance (mm)' },
        range: xRange,
        gridcolor: resolvedTheme === 'dark' ? '#333' : '#ddd',
        linecolor: resolvedTheme === 'dark' ? '#444' : '#ccc',
      },
      yaxis: {
        title: { text: 'Relative Output (%)' },
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
      showlegend: true,
      legend: {
        x: 1,
        y: 1,
        xanchor: 'right',
        bgcolor: 'transparent',
      },
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
      explanation={CHART_EXPLANATIONS.output}
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
