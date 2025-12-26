/**
 * Wire Section Component
 *
 * Wire template selection, properties display, and wire inputs.
 */

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCoilStore } from '@/store'
import { AWG_TABLE, getAwgFromDiameter, getTotalWireDiameter } from '@/lib/awg-table'
import {
  getTemplateById,
  findMatchingTemplate,
  getInsulationClassTemp,
} from '@/lib/wireTemplates'
import type {
  InsulationType,
  CopperGrade,
  StrandType,
  InsulationClass,
} from '@/domain/types'
import {
  insulationTypes,
  copperGrades,
  strandTypes,
  insulationClasses,
  pickupTemplates,
  transformerTemplates,
  premiumTemplates,
} from './constants'
import { useInfoFocus, LabelWithDesc, ClickableStat } from './hooks'

export const WireSection: React.FC = () => {
  const { coil, setWire } = useCoilStore()
  const { wire } = coil
  const onFocus = useInfoFocus()

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-muted-foreground">Wire</h4>

      {/* Wire Template Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Wire Template</Label>
          {!findMatchingTemplate(
            wire.wireDiameter,
            wire.insulation,
            wire.copperGrade,
            wire.strandType
          ) && (
            <span className="text-xs font-medium text-muted-foreground">Custom</span>
          )}
        </div>
        <Select
          value={
            findMatchingTemplate(
              wire.wireDiameter,
              wire.insulation,
              wire.copperGrade,
              wire.strandType
            )?.id || ''
          }
          onValueChange={(templateId) => {
            const template = getTemplateById(templateId)
            if (template) {
              setWire({
                wireDiameter: template.bareDiameter,
                insulation: template.insulation,
                copperGrade: template.copperGrade,
                strandType: template.strandType,
                strandCount: template.strandCount,
                insulationClass: template.insulationClass,
              })
            }
          }}
        >
          <SelectTrigger onFocus={onFocus('coil.wire.template')}>
            <SelectValue placeholder="Select wire type..." />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pickup Wire</SelectLabel>
              {pickupTemplates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Transformer Wire</SelectLabel>
              {transformerTemplates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Premium</SelectLabel>
              {premiumTemplates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {(() => {
          const template = findMatchingTemplate(
            wire.wireDiameter,
            wire.insulation,
            wire.copperGrade,
            wire.strandType
          )
          return template ? (
            <p className="text-xs text-muted-foreground">{template.description}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Manual configuration - modify values below</p>
          )
        })()}
      </div>

      {/* Wire Properties - Always Visible, Clickable */}
      <div className="rounded-md border bg-muted/30 p-3 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <ClickableStat
            label="Copper"
            value={copperGrades.find((g) => g.value === wire.copperGrade)?.label || 'Standard'}
            infoId="coil.wire.copperGrade"
          />
          <ClickableStat
            label="Structure"
            value={
              <>
                {strandTypes.find((s) => s.value === wire.strandType)?.label || 'Solid'}
                {wire.strandType !== 'solid' && wire.strandCount ? ` (${wire.strandCount})` : ''}
              </>
            }
            infoId="coil.wire.strandType"
          />
          <ClickableStat
            label="Insulation"
            value={insulationTypes.find((i) => i.value === wire.insulation)?.label || wire.insulation}
            infoId="coil.wire.insulation"
          />
          <ClickableStat
            label="Temp Class"
            value={`${wire.insulationClass} (${getInsulationClassTemp(wire.insulationClass)}°C)`}
            infoId="coil.wire.insulationClass"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm border-t pt-2">
          <ClickableStat
            label="Bare Ø"
            value={
              <>
                <span className="font-mono">{wire.wireDiameter.toFixed(4)} mm</span>
                {(() => {
                  const awg = getAwgFromDiameter(wire.wireDiameter)
                  return awg ? <span className="text-primary ml-1">AWG {awg}</span> : null
                })()}
              </>
            }
            infoId="coil.wire.wireDiameter"
          />
          <ClickableStat
            label="Total Ø"
            value={
              <span className="font-mono">
                {getTotalWireDiameter(wire.wireDiameter, wire.insulation).toFixed(4)} mm
              </span>
            }
            infoId="coil.wire.totalDiameter"
          />
        </div>
      </div>

      {/* Wire Diameter Input */}
      <div className="space-y-2">
        <LabelWithDesc label="Wire Gauge" desc="Bare conductor diameter (without insulation)" />
        <Input
          type="number"
          step="0.001"
          min="0.03"
          max="1.1"
          value={wire.wireDiameter}
          onChange={(e) => setWire({ wireDiameter: e.target.valueAsNumber || 0.0635 })}
          onFocus={onFocus('coil.wire.wireDiameter')}
        />
        {/* AWG Quick Buttons */}
        <div className="flex gap-1 flex-wrap">
          {AWG_TABLE.filter((s) => s.awg >= 40 && s.awg <= 44).map((spec) => (
            <button
              key={spec.awg}
              type="button"
              onClick={() => setWire({ wireDiameter: spec.bareDiameter })}
              className={`px-1.5 py-0.5 text-xs rounded border transition-colors ${
                Math.abs(wire.wireDiameter - spec.bareDiameter) < 0.002
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 hover:bg-muted border-border'
              }`}
            >
              {spec.awg}
            </button>
          ))}
        </div>
      </div>

      {/* Material Properties */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <LabelWithDesc label="Copper Grade" desc="Purity affects resistance" />
          <Select
            value={wire.copperGrade}
            onValueChange={(v) => setWire({ copperGrade: v as CopperGrade })}
          >
            <SelectTrigger onFocus={onFocus('coil.wire.copperGrade')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {copperGrades.map((g) => (
                <SelectItem key={g.value} value={g.value}>
                  {g.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <LabelWithDesc label="Structure" desc="Solid, stranded, or litz" />
          <Select
            value={wire.strandType}
            onValueChange={(v) => setWire({ strandType: v as StrandType })}
          >
            <SelectTrigger onFocus={onFocus('coil.wire.strandType')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {strandTypes.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Strand Count (for stranded/litz) */}
      {wire.strandType !== 'solid' && (
        <div className="space-y-2">
          <LabelWithDesc label="Strand Count" desc="Number of individual wires in bundle" />
          <Input
            type="number"
            min={2}
            max={100}
            step={1}
            value={wire.strandCount || 7}
            onChange={(e) => setWire({ strandCount: Math.round(e.target.valueAsNumber) || 7 })}
            onFocus={onFocus('coil.wire.strandCount')}
          />
        </div>
      )}

      {/* Insulation */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <LabelWithDesc label="Insulation" desc="Coating type, affects buildup" />
          <Select
            value={wire.insulation}
            onValueChange={(v) => setWire({ insulation: v as InsulationType })}
          >
            <SelectTrigger onFocus={onFocus('coil.wire.insulation')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {insulationTypes.map((ins) => (
                <SelectItem key={ins.value} value={ins.value}>
                  {ins.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <LabelWithDesc label="Temp Class" desc="Max operating temperature" />
          <Select
            value={wire.insulationClass}
            onValueChange={(v) => setWire({ insulationClass: v as InsulationClass })}
          >
            <SelectTrigger onFocus={onFocus('coil.wire.insulationClass')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {insulationClasses.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
