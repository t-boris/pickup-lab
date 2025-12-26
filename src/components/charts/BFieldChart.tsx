/**
 * BFieldChart Component
 *
 * Display magnetic field strength vs distance from magnet.
 * Shows field decay curve characteristic of the magnet type.
 */

import { useMemo, useState, useEffect, useCallback } from 'react'
import Plot from 'react-plotly.js'
import type { PlotRelayoutEvent } from 'plotly.js'
import { useMagnetStore, useUIStore } from '@/store'
import { generateFieldVsDistance } from '@/engine/magnetic'
import type { Data, Layout } from 'plotly.js'
import { ChartWrapper, CHART_EXPLANATIONS } from './ChartWrapper'

// Default ranges
const DEFAULT_X_RANGE: [number, number] = [0, 15]
const DEFAULT_Y_RANGE: [number, number] = [0, 200]

export const BFieldChart: React.FC = () => {
  const magnet = useMagnetStore((s) => s.magnet)
  const positioning = useMagnetStore((s) => s.positioning)
  const resolvedTheme = useUIStore((s) => s.resolvedTheme)

  // Zoom/pan state
  const [xRange, setXRange] = useState(DEFAULT_X_RANGE)
  const [yRange, setYRange] = useState(DEFAULT_Y_RANGE)

  // Revision counter for Plotly updates
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    setRevision((r) => r + 1)
  }, [magnet, positioning, resolvedTheme, xRange, yRange])

  // Calculate dynamic Y range based on data
  const dynamicYMax = useMemo(() => {
    const fieldData = generateFieldVsDistance(magnet, 0.5, 15, 50)
    const maxField = Math.max(...fieldData.map((p) => p.field))
    return Math.ceil(maxField * 1.2) // 20% headroom
  }, [magnet])

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

  // Generate B-field data
  const data = useMemo(() => {
    const fieldData = generateFieldVsDistance(magnet, 0.5, 15, 50)

    const traces: Data[] = [
      {
        x: fieldData.map((p) => p.distance),
        y: fieldData.map((p) => p.field),
        type: 'scatter',
        mode: 'lines',
        name: 'B-Field',
        line: { color: '#8b5cf6', width: 2 },
        fill: 'tozeroy',
        fillcolor: 'rgba(139, 92, 246, 0.1)',
        hovertemplate: '%{x:.1f} mm<br>%{y:.1f} mT<extra></extra>',
      },
      // Marker for string position
      {
        x: [positioning.stringToPoleDistance],
        y: [
          fieldData.find(
            (p) => Math.abs(p.distance - positioning.stringToPoleDistance) < 0.5
          )?.field || 0,
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
        hovertemplate: 'String: %{x:.1f} mm<br>%{y:.1f} mT<extra></extra>',
      },
    ]

    return traces
  }, [magnet, positioning.stringToPoleDistance])

  // Chart layout
  const layout: Partial<Layout> = useMemo(
    () => ({
      title: {
        text: 'Magnetic Field vs Distance',
        font: { size: 14 },
      },
      xaxis: {
        title: { text: 'Distance (mm)' },
        range: xRange,
        gridcolor: resolvedTheme === 'dark' ? '#333' : '#ddd',
        linecolor: resolvedTheme === 'dark' ? '#444' : '#ccc',
      },
      yaxis: {
        title: { text: 'B-Field (mT)' },
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

  return (
    <ChartWrapper
      onReset={handleReset}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      explanation={CHART_EXPLANATIONS.bField}
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
