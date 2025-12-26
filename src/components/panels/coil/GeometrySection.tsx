/**
 * Geometry Section Component
 *
 * Coil form selection and dimension inputs.
 */

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCoilStore } from '@/store'
import type { CoilForm } from '@/domain/types'
import { coilForms } from './constants'
import { useInfoFocus, LabelWithDesc } from './hooks'

export const GeometrySection: React.FC = () => {
  const { coil, setGeometry, setForm, computed } = useCoilStore()
  const { geometry } = coil
  const onFocus = useInfoFocus()

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-muted-foreground">Geometry</h4>

      <div className="space-y-2">
        <LabelWithDesc label="Bobbin Form" desc="Shape of the coil winding area" />
        <Select value={geometry.form} onValueChange={(v) => setForm(v as CoilForm)}>
          <SelectTrigger onFocus={onFocus('coil.geometry.form')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {coilForms.map((form) => (
              <SelectItem key={form.value} value={form.value}>
                {form.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cylindrical form: radial parameters */}
      {geometry.form === 'cylindrical' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <LabelWithDesc label="Pole Diameter" desc="Core/magnet width" />
            <LabelWithDesc label="Height" desc="Winding window depth" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              step="0.1"
              value={geometry.innerRadius * 2}
              onChange={(e) => setGeometry({ innerRadius: (e.target.valueAsNumber || 0) / 2 })}
              onFocus={onFocus('coil.geometry.poleDiameter')}
            />
            <Input
              type="number"
              step="0.1"
              value={geometry.height}
              onChange={(e) => setGeometry({ height: e.target.valueAsNumber || 0 })}
              onFocus={onFocus('coil.geometry.height')}
            />
          </div>

          {/* Computed outer diameter */}
          {computed && (
            <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/30 p-2 text-sm">
              <div>
                <span className="text-muted-foreground">Coil Diameter:</span>
                <span className="font-mono font-medium ml-1">{(computed.computedOuterRadius * 2).toFixed(1)} mm</span>
              </div>
              <div>
                <span className="text-muted-foreground">Winding:</span>
                <span className="font-mono font-medium ml-1">{((computed.computedOuterRadius - geometry.innerRadius) * 2).toFixed(1)} mm</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Rectangular form: box parameters with tall height */}
      {geometry.form === 'rectangular' && (
        <>
          {/* Row 1: Width & Length */}
          <div className="grid grid-cols-2 gap-3">
            <LabelWithDesc label="Bobbin Width" desc="Inner winding area width" />
            <LabelWithDesc label="Length" desc="Along strings direction" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              step="0.1"
              value={geometry.innerRadius}
              onChange={(e) => setGeometry({ innerRadius: e.target.valueAsNumber || 0 })}
              onFocus={onFocus('coil.geometry.bobbinWidth')}
            />
            <Input
              type="number"
              step="0.1"
              value={geometry.length || 0}
              onChange={(e) => setGeometry({ length: e.target.valueAsNumber || 0 })}
              onFocus={onFocus('coil.geometry.length')}
            />
          </div>

          {/* Row 2: Height & Wall */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <LabelWithDesc label="Winding Height" desc="Vertical space for wire" />
            <LabelWithDesc label="Wall Thickness" desc="Bobbin side wall" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              step="0.1"
              value={geometry.height}
              onChange={(e) => setGeometry({ height: e.target.valueAsNumber || 0 })}
              onFocus={onFocus('coil.geometry.height')}
            />
            <Input
              type="number"
              step="0.1"
              value={geometry.bobbinThickness || 1.5}
              onChange={(e) => setGeometry({ bobbinThickness: e.target.valueAsNumber || 0 })}
              onFocus={onFocus('coil.geometry.bobbinThickness')}
            />
          </div>

          {/* Computed total width */}
          {computed && (
            <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/30 p-2 text-sm mt-2">
              <div>
                <span className="text-muted-foreground">Total Width:</span>
                <span className="font-mono font-medium ml-1">{computed.computedOuterRadius.toFixed(1)} mm</span>
              </div>
              <div>
                <span className="text-muted-foreground">Buildup:</span>
                <span className="font-mono font-medium ml-1">{(computed.computedOuterRadius - geometry.innerRadius).toFixed(1)} mm</span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Flatwork form: wide shallow parameters */}
      {geometry.form === 'flatwork' && (
        <>
          {/* Row 1: Pole Diameter & Bobbin Length */}
          <div className="grid grid-cols-2 gap-3">
            <LabelWithDesc label="Pole Diameter" desc="Magnet/core rod width" />
            <LabelWithDesc label="Bobbin Length" desc="Along strings (Strat: 68mm)" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              step="0.1"
              value={geometry.innerRadius}
              onChange={(e) => setGeometry({ innerRadius: e.target.valueAsNumber || 0 })}
              onFocus={onFocus('coil.geometry.magnetWidth')}
            />
            <Input
              type="number"
              step="0.1"
              value={geometry.length || 0}
              onChange={(e) => setGeometry({ length: e.target.valueAsNumber || 0 })}
              onFocus={onFocus('coil.geometry.length')}
            />
          </div>

          {/* Row 2: Height */}
          <div className="mt-2">
            <LabelWithDesc label="Coil Height" desc="Shallow 3-6mm typical" />
          </div>
          <div>
            <Input
              type="number"
              step="0.1"
              value={geometry.height}
              onChange={(e) => setGeometry({ height: e.target.valueAsNumber || 0 })}
              onFocus={onFocus('coil.geometry.height')}
            />
          </div>

          {/* Computed values */}
          {computed && (
            <div className="grid grid-cols-2 gap-3 rounded-md border bg-muted/30 p-2 text-sm mt-2">
              <div>
                <span className="text-muted-foreground">Total Width:</span>
                <span className="font-mono font-medium ml-1">{computed.computedOuterRadius.toFixed(1)} mm</span>
              </div>
              <div>
                <span className="text-muted-foreground">Buildup:</span>
                <span className="font-mono font-medium ml-1">{(computed.computedOuterRadius - geometry.innerRadius).toFixed(1)} mm</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
