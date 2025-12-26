/**
 * LoadSection Component
 *
 * Parameter input panel for load parameters including pots, tone control,
 * cable, and amplifier input impedance.
 */

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLoadStore, useUIStore } from '@/store'

// Helper to set selected element on focus
const useInfoFocus = () => {
  const setSelectedElement = useUIStore((s) => s.setSelectedElement)
  return (id: string) => () => setSelectedElement({ type: 'input', id })
}

const potValues = [
  { value: 10000, label: '10k' },
  { value: 25000, label: '25k' },
  { value: 50000, label: '50k' },
  { value: 100000, label: '100k' },
  { value: 250000, label: '250k' },
  { value: 300000, label: '300k' },
  { value: 500000, label: '500k' },
  { value: 1000000, label: '1M' },
  { value: 2000000, label: '2M' },
]

/** Check if value is in preset list */
const isPresetValue = (value: number): boolean => {
  return potValues.some((p) => p.value === value)
}

const toneCapValues = [
  { value: 1e-9, label: '1nF' },
  { value: 2.2e-9, label: '2.2nF' },
  { value: 4.7e-9, label: '4.7nF' },
  { value: 10e-9, label: '10nF' },
  { value: 22e-9, label: '22nF' },
  { value: 33e-9, label: '33nF' },
  { value: 47e-9, label: '47nF' },
  { value: 68e-9, label: '68nF' },
  { value: 100e-9, label: '100nF' },
  { value: 220e-9, label: '220nF' },
  { value: 470e-9, label: '470nF' },
]

/** Check if cap value is in preset list */
const isPresetCapValue = (value: number): boolean => {
  return toneCapValues.some((c) => Math.abs(c.value - value) < 1e-12)
}

const ampImpedanceValues = [
  { value: 10000, label: '10k' },
  { value: 22000, label: '22k' },
  { value: 47000, label: '47k' },
  { value: 100000, label: '100k' },
  { value: 220000, label: '220k (Fender)' },
  { value: 470000, label: '470k' },
  { value: 1000000, label: '1M (Standard)' },
  { value: 2200000, label: '2.2M' },
  { value: 4700000, label: '4.7M' },
  { value: 10000000, label: '10M (Hi-Z)' },
  { value: 22000000, label: '22M' },
]

/** Check if amp impedance is in preset list */
const isPresetAmpValue = (value: number): boolean => {
  return ampImpedanceValues.some((a) => a.value === value)
}

export const LoadSection: React.FC = () => {
  const {
    load,
    setVolumePot,
    setVolumePosition,
    setTonePot,
    setToneCapacitor,
    setTonePosition,
    setCableCapacitance,
    setCableLength,
    setAmpInputImpedance,
    setVintageLoad,
    setModernLoad,
    setHighImpedanceLoad,
    computed,
  } = useLoadStore()
  const onFocus = useInfoFocus()

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="space-y-2">
        <Label className="text-muted-foreground">Quick Presets</Label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={setVintageLoad} className="flex-1">
            Vintage
          </Button>
          <Button variant="outline" size="sm" onClick={setModernLoad} className="flex-1">
            Modern
          </Button>
          <Button variant="outline" size="sm" onClick={setHighImpedanceLoad} className="flex-1">
            Hi-Z
          </Button>
        </div>
      </div>

      {/* Pots Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Potentiometers</h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Volume Pot</Label>
            <div className="flex gap-1">
              <Input
                type="number"
                value={Math.round(load.volumePot / 1000)}
                onChange={(e) => {
                  const kOhms = e.target.valueAsNumber
                  if (!isNaN(kOhms) && kOhms > 0) {
                    setVolumePot(Math.round(kOhms * 1000))
                  }
                }}
                onFocus={onFocus('load.volumePot')}
                className="w-20"
                min={1}
                max={10000}
              />
              <span className="flex items-center text-sm text-muted-foreground">kΩ</span>
              <Select
                value={isPresetValue(load.volumePot) ? load.volumePot.toString() : ''}
                onValueChange={(v) => setVolumePot(parseInt(v, 10))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="..." />
                </SelectTrigger>
                <SelectContent>
                  {potValues.map((pot) => (
                    <SelectItem key={pot.value} value={pot.value.toString()}>
                      {pot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tone Pot</Label>
            <div className="flex gap-1">
              <Input
                type="number"
                value={Math.round(load.tonePot / 1000)}
                onChange={(e) => {
                  const kOhms = e.target.valueAsNumber
                  if (!isNaN(kOhms) && kOhms > 0) {
                    setTonePot(Math.round(kOhms * 1000))
                  }
                }}
                onFocus={onFocus('load.tonePot')}
                className="w-20"
                min={1}
                max={10000}
              />
              <span className="flex items-center text-sm text-muted-foreground">kΩ</span>
              <Select
                value={isPresetValue(load.tonePot) ? load.tonePot.toString() : ''}
                onValueChange={(v) => setTonePot(parseInt(v, 10))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue placeholder="..." />
                </SelectTrigger>
                <SelectContent>
                  {potValues.map((pot) => (
                    <SelectItem key={pot.value} value={pot.value.toString()}>
                      {pot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Volume Position: <span translate="no">{load.volumePosition === 1 ? '10 (Full)' :
              load.volumePosition === 0 ? '0 (Off)' :
              (load.volumePosition * 10).toFixed(0)}</span>
          </Label>
          <Slider
            value={[load.volumePosition]}
            onValueChange={([v]) => setVolumePosition(v)}
            min={0}
            max={1}
            step={0.1}
            onFocus={onFocus('load.volumePosition')}
          />
          <p className="text-xs text-muted-foreground">
            Rolling down volume affects tone (darker when lower)
          </p>
        </div>
      </div>

      {/* Tone Control Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Tone Control</h4>

        <div className="space-y-2">
          <Label>Tone Capacitor</Label>
          <div className="flex gap-1">
            <Input
              type="number"
              value={parseFloat((load.toneCapacitor * 1e9).toPrecision(3))}
              onChange={(e) => {
                const nF = e.target.valueAsNumber
                if (!isNaN(nF) && nF > 0) {
                  setToneCapacitor(nF * 1e-9)
                }
              }}
              onFocus={onFocus('load.toneCapacitor')}
              className="w-20"
              min={0.1}
              max={1000}
              step={0.1}
            />
            <span className="flex items-center text-sm text-muted-foreground">nF</span>
            <Select
              value={isPresetCapValue(load.toneCapacitor) ? load.toneCapacitor.toString() : ''}
              onValueChange={(v) => setToneCapacitor(parseFloat(v))}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="..." />
              </SelectTrigger>
              <SelectContent>
                {toneCapValues.map((cap) => (
                  <SelectItem key={cap.value} value={cap.value.toString()}>
                    {cap.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>
            Tone: <span translate="no">{load.tonePosition === 0 ? 'Bypass' :
              load.tonePosition === 1 ? '0 (Full)' :
              (10 - load.tonePosition * 10).toFixed(0)}</span>
          </Label>
          <Slider
            value={[load.tonePosition]}
            onValueChange={([v]) => setTonePosition(v)}
            min={0}
            max={1}
            step={0.1}
            onFocus={onFocus('load.tonePosition')}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Bypass</span>
            <span>0 (Dark)</span>
          </div>
        </div>
      </div>

      {/* Cable Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Cable</h4>

        <div className="space-y-2">
          <Label>Capacitance: <span translate="no">{(load.cableCapacitancePerMeter * 1e12).toFixed(0)} pF/m</span></Label>
          <Slider
            value={[load.cableCapacitancePerMeter * 1e12]}
            onValueChange={([v]) => setCableCapacitance(v * 1e-12)}
            min={30}
            max={200}
            step={5}
            onFocus={onFocus('load.cableCapacitance')}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>30 pF/m (low-cap)</span>
            <span>200 pF/m (coiled)</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Length: <span translate="no">{load.cableLength} m</span></Label>
          <Slider
            value={[load.cableLength]}
            onValueChange={([v]) => setCableLength(v)}
            min={1}
            max={10}
            step={0.5}
            onFocus={onFocus('load.cableLength')}
          />
        </div>
      </div>

      {/* Amp Input Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Amplifier</h4>

        <div className="space-y-2">
          <Label>Input Impedance</Label>
          <div className="flex gap-1">
            <Input
              type="number"
              value={load.ampInputImpedance >= 1000000
                ? parseFloat((load.ampInputImpedance / 1000000).toPrecision(3))
                : Math.round(load.ampInputImpedance / 1000)}
              onChange={(e) => {
                const val = e.target.valueAsNumber
                if (!isNaN(val) && val > 0) {
                  // If current value is in M range, interpret as M, else as k
                  if (load.ampInputImpedance >= 1000000) {
                    setAmpInputImpedance(val * 1000000)
                  } else {
                    setAmpInputImpedance(val * 1000)
                  }
                }
              }}
              onFocus={onFocus('load.ampInputImpedance')}
              className="w-20"
              min={1}
            />
            <Select
              value={load.ampInputImpedance >= 1000000 ? 'M' : 'k'}
              onValueChange={(v) => {
                if (v === 'M' && load.ampInputImpedance < 1000000) {
                  setAmpInputImpedance(load.ampInputImpedance * 1000)
                } else if (v === 'k' && load.ampInputImpedance >= 1000000) {
                  setAmpInputImpedance(load.ampInputImpedance / 1000)
                }
              }}
            >
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="k">kΩ</SelectItem>
                <SelectItem value="M">MΩ</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={isPresetAmpValue(load.ampInputImpedance) ? load.ampInputImpedance.toString() : ''}
              onValueChange={(v) => setAmpInputImpedance(parseFloat(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Presets..." />
              </SelectTrigger>
              <SelectContent>
                {ampImpedanceValues.map((amp) => (
                  <SelectItem key={amp.value} value={amp.value.toString()}>
                    {amp.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Computed Results */}
      {computed && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <h4 className="mb-2 text-sm font-medium">Load Stats</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Cable C:</span>{' '}
              {(computed.totalCableCapacitance * 1e12).toFixed(0)} pF
            </div>
            <div>
              <span className="text-muted-foreground">R_eff:</span>{' '}
              {(computed.effectiveLoadResistance / 1000).toFixed(0)}k
            </div>
            <div>
              <span className="text-muted-foreground">f₀ loaded:</span>{' '}
              {(computed.loadedResonance / 1000).toFixed(1)} kHz
            </div>
            <div>
              <span className="text-muted-foreground">Q loaded:</span>{' '}
              {computed.loadedQ.toFixed(1)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
