/**
 * TransformerSection Component
 *
 * Parameter input panel for optional transformer modeling.
 * Includes enable toggle, core selection with material variants,
 * toroid geometry, and winding parameters with conductor type.
 */

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useTransformerStore, useUIStore } from '@/store'
import type {
  CoreShape,
  CoreMaterial,
  CoreMaterialBase,
  NanocrystallineType,
  AmorphousType,
  FerriteType,
  PrimaryWindingType,
  ConductorMaterial,
} from '@/domain/types'
import { getCoreMaterialName } from '@/lib/calibration'
import { formatSISplit } from '@/lib/formatters'
import { getAwgSpec } from '@/lib/awg-table'

// Helper to set selected element on focus
const useInfoFocus = () => {
  const setSelectedElement = useUIStore((s) => s.setSelectedElement)
  return (id: string) => () => setSelectedElement({ type: 'input', id })
}

// Core shape options
const coreShapes: { value: CoreShape; label: string }[] = [
  { value: 'toroid_round', label: 'Toroid (Round)' },
  { value: 'toroid_oval', label: 'Toroid (Oval)' },
  { value: 'c_core', label: 'C-Core' },
  { value: 'ei_core', label: 'EI-Core' },
]

// Material base options with their variants
interface MaterialOption {
  base: CoreMaterialBase
  label: string
  variants?: { value: string; label: string }[]
}

const materialOptions: MaterialOption[] = [
  {
    base: 'nanocrystalline',
    label: 'Nanocrystalline',
    variants: [
      { value: 'nc_iron', label: 'Fe-based (Finemet/Vitroperm)' },
      { value: 'nc_cobalt', label: 'Co-based (High-µ)' },
    ],
  },
  {
    base: 'amorphous',
    label: 'Amorphous',
    variants: [
      { value: 'am_iron', label: 'Fe-based (Metglas 2605)' },
      { value: 'am_cobalt', label: 'Co-based (Metglas 2714)' },
    ],
  },
  {
    base: 'ferrite',
    label: 'Ferrite',
    variants: [
      { value: 'ferrite_mnzn', label: 'MnZn (Low freq)' },
      { value: 'ferrite_nizn', label: 'NiZn (High freq)' },
    ],
  },
  {
    base: 'silicon_steel',
    label: 'Silicon Steel (GOSS)',
  },
]

// Conductor materials
const conductorMaterials: { value: ConductorMaterial; label: string }[] = [
  { value: 'copper', label: 'Copper' },
  { value: 'ofc_copper', label: 'OFC Copper' },
  { value: 'silver', label: 'Silver' },
  { value: 'aluminum', label: 'Aluminum' },
  { value: 'brass', label: 'Brass' },
]

const windingStyles: { value: 'interleaved' | 'non_interleaved'; label: string }[] = [
  { value: 'interleaved', label: 'Interleaved' },
  { value: 'non_interleaved', label: 'Non-Interleaved' },
]

// Helper to get material key for select
const getMaterialKey = (material: CoreMaterial): string => {
  if (material.base === 'silicon_steel') {
    return 'silicon_steel'
  }
  return `${material.base}:${material.variant}`
}

// Helper to parse material key
const parseMaterialKey = (key: string): CoreMaterial => {
  if (key === 'silicon_steel') {
    return { base: 'silicon_steel' }
  }
  const [base, variant] = key.split(':')
  if (base === 'nanocrystalline') {
    return { base, variant: variant as NanocrystallineType }
  } else if (base === 'amorphous') {
    return { base, variant: variant as AmorphousType }
  } else if (base === 'ferrite') {
    return { base, variant: variant as FerriteType }
  }
  return { base: 'silicon_steel' }
}

export const TransformerSection: React.FC = () => {
  const {
    transformer,
    setEnabled,
    setCore,
    setCoreShape,
    setCoreMaterial,
    setToroidGeometry,
    setWinding,
    setPrimaryConductor,
    computed,
  } = useTransformerStore()
  const { enabled, core, winding } = transformer
  const onFocus = useInfoFocus()

  const isToroid = core.shape === 'toroid_round' || core.shape === 'toroid_oval'
  const isOval = core.shape === 'toroid_oval'

  return (
    <div className="space-y-6">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-3" onFocus={onFocus('transformer.enabled')}>
        <div>
          <Label className="text-base font-medium">Enable Transformer</Label>
          <p className="text-xs text-muted-foreground">
            Internal step-up transformer (before cable/pots)
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {enabled && (
        <>
          {/* Core Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Core</h4>

            <div className="space-y-2">
              <Label>Shape</Label>
              <Select
                value={core.shape}
                onValueChange={(v) => setCoreShape(v as CoreShape)}
              >
                <SelectTrigger onFocus={onFocus('transformer.core.shape')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {coreShapes.map((shape) => (
                    <SelectItem key={shape.value} value={shape.value}>
                      {shape.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Material</Label>
              <Select
                value={getMaterialKey(core.material)}
                onValueChange={(v) => setCoreMaterial(parseMaterialKey(v))}
              >
                <SelectTrigger onFocus={onFocus('transformer.core.material')}>
                  <SelectValue>
                    {getCoreMaterialName(core.material)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {materialOptions.map((mat) => (
                    mat.variants ? (
                      <SelectGroup key={mat.base}>
                        <SelectLabel>{mat.label}</SelectLabel>
                        {mat.variants.map((variant) => (
                          <SelectItem
                            key={`${mat.base}:${variant.value}`}
                            value={`${mat.base}:${variant.value}`}
                          >
                            {variant.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : (
                      <SelectItem key={mat.base} value={mat.base}>
                        {mat.label}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Toroid Geometry (if toroid shape selected) */}
            {isToroid && core.toroidGeometry && (
              <div className="space-y-3 rounded-lg border p-3">
                <Label className="text-xs text-muted-foreground">Toroid Dimensions</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Inner Ø (mm)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={core.toroidGeometry.innerDiameter}
                      onChange={(e) =>
                        setToroidGeometry({ innerDiameter: e.target.valueAsNumber || 0 })
                      }
                      onFocus={onFocus('transformer.core.toroidGeometry.innerDiameter')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Outer Ø (mm)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={core.toroidGeometry.outerDiameter}
                      onChange={(e) =>
                        setToroidGeometry({ outerDiameter: e.target.valueAsNumber || 0 })
                      }
                      onFocus={onFocus('transformer.core.toroidGeometry.outerDiameter')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Height (mm)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={core.toroidGeometry.height}
                      onChange={(e) =>
                        setToroidGeometry({ height: e.target.valueAsNumber || 0 })
                      }
                      onFocus={onFocus('transformer.core.toroidGeometry.height')}
                    />
                  </div>
                  {isOval && (
                    <div className="space-y-2">
                      <Label className="text-xs">Straight (mm)</Label>
                      <Input
                        type="number"
                        step="1"
                        value={core.toroidGeometry.straightLength ?? 0}
                        onChange={(e) =>
                          setToroidGeometry({ straightLength: e.target.valueAsNumber || 0 })
                        }
                        onFocus={onFocus('transformer.core.toroidGeometry.straightLength')}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ae and le - auto-calculated for toroids, manual for other shapes */}
            {isToroid ? (
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Ae (calculated)</Label>
                  <div className="text-sm font-medium" translate="no">
                    {core.effectiveArea.toFixed(1)} mm²
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">le (calculated)</Label>
                  <div className="text-sm font-medium" translate="no">
                    {core.effectiveLength.toFixed(1)} mm
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Ae (mm²)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={core.effectiveArea}
                    onChange={(e) =>
                      setCore({ effectiveArea: e.target.valueAsNumber || 0 })
                    }
                    onFocus={onFocus('transformer.core.effectiveArea')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>le (mm)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={core.effectiveLength}
                    onChange={(e) =>
                      setCore({ effectiveLength: e.target.valueAsNumber || 0 })
                    }
                    onFocus={onFocus('transformer.core.effectiveLength')}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Air Gap: <span translate="no">{core.airGap.toFixed(2)} mm</span></Label>
              <Slider
                value={[core.airGap]}
                onValueChange={([v]) => setCore({ airGap: v })}
                min={0}
                max={0.5}
                step={0.01}
                onFocus={onFocus('transformer.core.airGap')}
              />
            </div>
          </div>

          {/* Winding Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Winding</h4>

            {/* Primary Conductor */}
            <div className="space-y-3 rounded-lg border p-3">
              <Label className="text-xs text-muted-foreground">Primary Conductor</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={winding.primaryConductor.type}
                    onValueChange={(v) =>
                      setPrimaryConductor({ type: v as PrimaryWindingType })
                    }
                  >
                    <SelectTrigger onFocus={onFocus('transformer.winding.primaryConductor.type')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wire">Wire</SelectItem>
                      <SelectItem value="plate">Plate/Strip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Material</Label>
                  <Select
                    value={winding.primaryConductor.material}
                    onValueChange={(v) =>
                      setPrimaryConductor({ material: v as ConductorMaterial })
                    }
                  >
                    <SelectTrigger onFocus={onFocus('transformer.winding.primaryConductor.material')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conductorMaterials.map((mat) => (
                        <SelectItem key={mat.value} value={mat.value}>
                          {mat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {winding.primaryConductor.type === 'wire' ? (
                <div className="space-y-2">
                  <Label className="text-xs">Wire AWG</Label>
                  <Input
                    type="number"
                    step="1"
                    value={winding.primaryConductor.wireAwg ?? 38}
                    onChange={(e) =>
                      setPrimaryConductor({ wireAwg: Math.round(e.target.valueAsNumber) || 38 })
                    }
                    onFocus={onFocus('transformer.winding.primaryConductor.wireAwg')}
                  />
                  <p className="text-xs text-muted-foreground" translate="no">
                    Ø {getAwgSpec(winding.primaryConductor.wireAwg ?? 38)?.bareDiameter.toFixed(3) ?? '?'} mm
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Thickness (mm)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={winding.primaryConductor.plateThickness ?? 0.1}
                      onChange={(e) =>
                        setPrimaryConductor({ plateThickness: e.target.valueAsNumber || 0.1 })
                      }
                      onFocus={onFocus('transformer.winding.primaryConductor.plateThickness')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Width (mm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={winding.primaryConductor.plateWidth ?? 5}
                      onChange={(e) =>
                        setPrimaryConductor({ plateWidth: e.target.valueAsNumber || 5 })
                      }
                      onFocus={onFocus('transformer.winding.primaryConductor.plateWidth')}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Primary Turns</Label>
                <Input
                  type="number"
                  step="10"
                  value={winding.primaryTurns}
                  onChange={(e) =>
                    setWinding({ primaryTurns: Math.round(e.target.valueAsNumber) || 0 })
                  }
                  onFocus={onFocus('transformer.winding.primaryTurns')}
                />
              </div>
              <div className="space-y-2">
                <Label>Secondary Turns</Label>
                <Input
                  type="number"
                  step="100"
                  value={winding.secondaryTurns}
                  onChange={(e) =>
                    setWinding({ secondaryTurns: Math.round(e.target.valueAsNumber) || 0 })
                  }
                  onFocus={onFocus('transformer.winding.secondaryTurns')}
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-2 text-center text-sm">
              Turns Ratio: 1:{(winding.secondaryTurns / winding.primaryTurns).toFixed(1)}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Secondary AWG</Label>
                <Input
                  type="number"
                  step="1"
                  value={winding.secondaryAwg}
                  onChange={(e) =>
                    setWinding({ secondaryAwg: Math.round(e.target.valueAsNumber) || 42 })
                  }
                  onFocus={onFocus('transformer.winding.secondaryAwg')}
                />
                <p className="text-xs text-muted-foreground" translate="no">
                  Ø {getAwgSpec(winding.secondaryAwg)?.bareDiameter.toFixed(3) ?? '?'} mm
                </p>
              </div>
              <div className="space-y-2">
                <Label>Secondary Material</Label>
                <Select
                  value={winding.secondaryMaterial}
                  onValueChange={(v) =>
                    setWinding({ secondaryMaterial: v as ConductorMaterial })
                  }
                >
                  <SelectTrigger onFocus={onFocus('transformer.winding.secondaryMaterial')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conductorMaterials.map((mat) => (
                      <SelectItem key={mat.value} value={mat.value}>
                        {mat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Winding Style</Label>
              <Select
                value={winding.windingStyle}
                onValueChange={(v) =>
                  setWinding({ windingStyle: v as 'interleaved' | 'non_interleaved' })
                }
              >
                <SelectTrigger onFocus={onFocus('transformer.winding.windingStyle')}>
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

            <div className="flex items-center justify-between" onFocus={onFocus('transformer.winding.shielding')}>
              <Label>Electrostatic Shielding</Label>
              <Switch
                checked={winding.shielding}
                onCheckedChange={(checked) => setWinding({ shielding: checked })}
              />
            </div>
          </div>

          {/* Computed Results */}
          {computed && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-3">
                <h4 className="mb-2 text-sm font-medium">Transformer Stats</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Voltage Gain:</span>{' '}
                    {computed.voltageRatio.toFixed(1)}x
                  </div>
                  <div>
                    <span className="text-muted-foreground">L_pri:</span>{' '}
                    {(() => {
                      const { value, unit } = formatSISplit(computed.primaryInductance, 'H')
                      return `${value} ${unit}`
                    })()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">µ_eff:</span>{' '}
                    {computed.effectivePermeability.toFixed(0)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bsat:</span>{' '}
                    {computed.saturationFlux.toFixed(2)} T
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bandwidth:</span>{' '}
                    {(computed.bandwidth / 1000).toFixed(1)} kHz
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Sat. Margin:</span>
                    <Badge
                      variant={computed.saturationMargin > 0.5 ? 'default' : 'destructive'}
                      className={computed.saturationMargin > 0.5 ? 'bg-green-600' : ''}
                    >
                      {(computed.saturationMargin * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Auto-calculated Parasitics */}
              <div className="rounded-lg border p-3">
                <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                  Computed Parasitics
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Leakage L:</span>{' '}
                    {(() => {
                      const l = formatSISplit(computed.parasitics.leakageInductance, 'H')
                      return `${l.value} ${l.unit}`
                    })()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ciw:</span>{' '}
                    {(computed.parasitics.interwindingCapacitance * 1e12).toFixed(1)} pF
                  </div>
                  <div>
                    <span className="text-muted-foreground">C_pri:</span>{' '}
                    {(computed.parasitics.primaryCapacitance * 1e12).toFixed(1)} pF
                  </div>
                  <div>
                    <span className="text-muted-foreground">C_sec:</span>{' '}
                    {(computed.parasitics.secondaryCapacitance * 1e12).toFixed(1)} pF
                  </div>
                  <div>
                    <span className="text-muted-foreground">R_pri:</span>{' '}
                    {computed.parasitics.primaryResistance < 0.01
                      ? `${(computed.parasitics.primaryResistance * 1000).toFixed(2)} mΩ`
                      : `${computed.parasitics.primaryResistance.toFixed(3)} Ω`}
                  </div>
                  <div>
                    <span className="text-muted-foreground">R_sec:</span>{' '}
                    {computed.parasitics.secondaryResistance < 1
                      ? `${(computed.parasitics.secondaryResistance * 1000).toFixed(1)} mΩ`
                      : computed.parasitics.secondaryResistance < 1000
                        ? `${computed.parasitics.secondaryResistance.toFixed(1)} Ω`
                        : `${(computed.parasitics.secondaryResistance / 1000).toFixed(2)} kΩ`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
