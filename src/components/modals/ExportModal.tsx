/**
 * ExportModal Component
 *
 * Modal for exporting configuration data as JSON.
 * Supports exporting current config with or without graph data.
 */

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  useUIStore,
  useCoilStore,
  useMagnetStore,
  useTransformerStore,
  useLoadStore,
} from '@/store'
import { MODEL_VERSION } from '@/lib/calibration'
import { computeSystemResponse, generateLogFrequencies } from '@/engine/impedance'
import { generateFieldVsDistance, generateOutputVsDistance } from '@/engine/magnetic'
import type { ExportData, GraphData, PickupConfig } from '@/domain/types'

// Icons
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" x2="12" y1="15" y2="3"/>
  </svg>
)

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
)

export const ExportModal: React.FC = () => {
  const { exportModalOpen, setExportModalOpen } = useUIStore()

  const coil = useCoilStore((s) => s.coil)
  const coilComputed = useCoilStore((s) => s.computed)
  const magnet = useMagnetStore((s) => s.magnet)
  const positioning = useMagnetStore((s) => s.positioning)
  const magnetComputed = useMagnetStore((s) => s.computed)
  const transformer = useTransformerStore((s) => s.transformer)
  const transformerComputed = useTransformerStore((s) => s.computed)
  const load = useLoadStore((s) => s.load)
  const loadComputed = useLoadStore((s) => s.computed)

  const [includeGraphData, setIncludeGraphData] = useState(false)
  const [copied, setCopied] = useState(false)

  // Generate export data
  const generateExportData = (): ExportData | null => {
    if (!coilComputed || !magnetComputed || !loadComputed) return null

    const config: PickupConfig = {
      id: `export_${Date.now()}`,
      name: 'Exported Configuration',
      modelVersion: MODEL_VERSION,
      timestamp: Date.now(),
      coil,
      magnet,
      positioning,
      transformer,
      load,
    }

    const results = {
      coil: coilComputed,
      magnet: magnetComputed,
      transformer: transformer.enabled && transformerComputed ? transformerComputed : undefined,
      load: loadComputed,
      outputIndex: magnetComputed.sensitivityIndex,
    }

    let graphData: GraphData | undefined

    if (includeGraphData) {
      const frequencies = generateLogFrequencies(20, 50000, 200)
      const frequencyResponse = computeSystemResponse(
        coilComputed.dcResistance,
        coilComputed.inductance,
        coilComputed.capacitance,
        load,
        frequencies
      )

      const fieldVsDistance = generateFieldVsDistance(magnet, 0.5, 15, 50)

      const meanRadius =
        (coil.geometry.innerRadius + coil.geometry.outerRadius) / 2
      const effectiveArea = Math.PI * (meanRadius / 1000) ** 2
      const outputVsDistance = generateOutputVsDistance(
        magnet,
        coil.wire.turns,
        effectiveArea,
        coil.couplingFactor,
        1,
        10,
        50
      )

      graphData = {
        frequencyResponse,
        impedance: [], // Would need to compute separately
        fieldVsDistance,
        outputVsDistance,
      }
    }

    return {
      config,
      results,
      graphData,
    }
  }

  const exportData = generateExportData()
  const jsonString = exportData ? JSON.stringify(exportData, null, 2) : ''

  // Copy to clipboard
  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Download as file
  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pickup-config-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Configuration</DialogTitle>
          <DialogDescription>
            Export your current pickup configuration as JSON.
          </DialogDescription>
        </DialogHeader>

        {/* Options */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Include Graph Data</Label>
            <p className="text-xs text-muted-foreground">
              Adds frequency response and field data arrays
            </p>
          </div>
          <Switch
            checked={includeGraphData}
            onCheckedChange={setIncludeGraphData}
          />
        </div>

        <Separator />

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="relative">
            <pre className="max-h-[300px] overflow-auto rounded-lg bg-muted p-4 text-xs">
              {jsonString.slice(0, 2000)}
              {jsonString.length > 2000 && '\n... (truncated)'}
            </pre>
          </div>
          <p className="text-xs text-muted-foreground">
            Size: {(jsonString.length / 1024).toFixed(1)} KB
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCopy}>
            <CopyIcon />
            <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
          </Button>
          <Button onClick={handleDownload}>
            <DownloadIcon />
            <span className="ml-2">Download JSON</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
