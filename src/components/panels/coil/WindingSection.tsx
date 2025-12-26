/**
 * Winding Section Component
 *
 * Turns count, winding style, and packing factor inputs.
 */

import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCoilStore } from '@/store'
import type { WindingStyle } from '@/domain/types'
import { windingStyles } from './constants'
import { useInfoFocus, LabelWithDesc } from './hooks'

export const WindingSection: React.FC = () => {
  const { coil, setWire } = useCoilStore()
  const { wire } = coil
  const onFocus = useInfoFocus()

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-muted-foreground">Winding</h4>

      <div className="space-y-2">
        <LabelWithDesc label="Turns" desc="Number of wire loops around bobbin" />
        <Input
          type="number"
          min={1}
          max={20000}
          step={1}
          value={wire.turns}
          onChange={(e) => setWire({ turns: Math.max(1, Math.round(e.target.valueAsNumber) || 1) })}
          onFocus={onFocus('coil.wire.turns')}
        />
        <Slider
          value={[wire.turns]}
          onValueChange={([v]) => setWire({ turns: v })}
          min={1}
          max={15000}
          step={1}
          onFocus={onFocus('coil.wire.turns')}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1</span>
          <span>15,000</span>
        </div>
      </div>

      <div className="space-y-2">
        <LabelWithDesc label="Winding Style" desc="Pattern affects capacitance & tone" />
        <Select
          value={wire.windingStyle}
          onValueChange={(v) => setWire({ windingStyle: v as WindingStyle })}
        >
          <SelectTrigger onFocus={onFocus('coil.wire.windingStyle')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {windingStyles.map((style) => (
              <SelectItem key={style.value} value={style.value}>
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={`space-y-2 ${wire.turns <= 1 ? 'opacity-50' : ''}`}>
        <LabelWithDesc
          label={`Packing Factor: ${wire.packingFactor.toFixed(2)}`}
          desc="Wire density in bobbin (0.5=loose, 0.9=tight)"
        />
        <Slider
          value={[wire.packingFactor]}
          onValueChange={([v]) => setWire({ packingFactor: v })}
          min={0.5}
          max={0.9}
          step={0.01}
          disabled={wire.turns <= 1}
          onFocus={onFocus('coil.wire.packingFactor')}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {wire.turns <= 1 ? (
            <span>N/A for single turn</span>
          ) : (
            <>
              <span>0.50 (loose)</span>
              <span>0.90 (tight)</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
