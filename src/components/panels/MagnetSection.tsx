/**
 * MagnetSection Component
 *
 * Parameter input panel for magnet type, geometry, and positioning.
 */

import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useMagnetStore } from '@/store'
import { MAGNET_PROPERTIES } from '@/lib/calibration'
import type { MagnetType, MagnetGeometry, BladeMaterial } from '@/domain/types'
import { useInfoFocus, LabelWithDesc } from './shared'

const magnetTypes: { value: MagnetType; label: string }[] = [
  { value: 'alnico2', label: 'AlNiCo 2' },
  { value: 'alnico3', label: 'AlNiCo 3' },
  { value: 'alnico5', label: 'AlNiCo 5' },
  { value: 'alnico8', label: 'AlNiCo 8' },
  { value: 'ferrite', label: 'Ceramic/Ferrite' },
  { value: 'neodymium', label: 'Neodymium' },
]

const magnetGeometries: { value: MagnetGeometry; label: string }[] = [
  { value: 'rod', label: 'Rod (Strat-style)' },
  { value: 'bar', label: 'Bar (P90/HB-style)' },
  { value: 'blade', label: 'Blade (Rail pickup)' },
]

const bladeMaterials: { value: BladeMaterial; label: string }[] = [
  { value: 'steel', label: 'Carbon Steel' },
  { value: 'ss430', label: 'SS 430 (Ferritic)' },
  { value: 'ss420', label: 'SS 420' },
]

export const MagnetSection: React.FC = () => {
  const { magnet, positioning, setMagnet, setPositioning, computed } = useMagnetStore()
  const onFocus = useInfoFocus()

  const magnetInfo = MAGNET_PROPERTIES[magnet.type]

  return (
    <div className="space-y-6">
      {/* Magnet Type Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Magnet</h4>

        <div className="space-y-2">
          <LabelWithDesc label="Material" desc="Magnet alloy type" />
          <Select
            value={magnet.type}
            onValueChange={(v) => setMagnet({ type: v as MagnetType })}
          >
            <SelectTrigger onFocus={onFocus('magnet.type')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {magnetTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{magnetInfo.description}</p>
        </div>

        <div className="space-y-2">
          <LabelWithDesc label="Geometry" desc="Pole piece shape" />
          <Select
            value={magnet.geometry}
            onValueChange={(v) => setMagnet({ geometry: v as MagnetGeometry })}
          >
            <SelectTrigger onFocus={onFocus('magnet.geometry')}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {magnetGeometries.map((geom) => (
                <SelectItem key={geom.value} value={geom.value}>
                  {geom.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rod geometry fields */}
        {magnet.geometry === 'rod' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <LabelWithDesc label="Diameter" desc="Rod magnet width" />
              <Input
                type="number"
                step="0.1"
                value={magnet.diameter ?? 5}
                onChange={(e) => {
                  const val = e.target.valueAsNumber
                  if (!isNaN(val)) setMagnet({ diameter: val })
                }}
                onFocus={onFocus('magnet.diameter')}
              />
            </div>
            <div className="space-y-2">
              <LabelWithDesc label="Length" desc="Rod height/depth" />
              <Input
                type="number"
                step="0.1"
                value={magnet.magnetLength}
                onChange={(e) => {
                  const val = e.target.valueAsNumber
                  if (!isNaN(val)) setMagnet({ magnetLength: val })
                }}
                onFocus={onFocus('magnet.magnetLength')}
              />
            </div>
          </div>
        )}

        {/* Bar geometry fields */}
        {magnet.geometry === 'bar' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <LabelWithDesc label="Width" desc="Bar magnet width" />
                <Input
                  type="number"
                  step="0.1"
                  value={magnet.width ?? 12}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber
                    if (!isNaN(val)) setMagnet({ width: val })
                  }}
                  onFocus={onFocus('magnet.width')}
                />
              </div>
              <div className="space-y-2">
                <LabelWithDesc label="Length" desc="Along strings" />
                <Input
                  type="number"
                  step="0.1"
                  value={magnet.magnetLength}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber
                    if (!isNaN(val)) setMagnet({ magnetLength: val })
                  }}
                  onFocus={onFocus('magnet.magnetLength')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <LabelWithDesc label="Height" desc="Bar magnet thickness" />
              <Input
                type="number"
                step="0.1"
                value={magnet.magnetHeight ?? 5}
                onChange={(e) => {
                  const val = e.target.valueAsNumber
                  if (!isNaN(val)) setMagnet({ magnetHeight: val })
                }}
                onFocus={onFocus('magnet.magnetHeight')}
              />
            </div>
          </>
        )}

        {/* Blade geometry fields */}
        {magnet.geometry === 'blade' && (
          <>
            <p className="text-xs text-muted-foreground">
              Steel blade/rail with bar magnet(s) underneath
            </p>

            {/* Blade parameters */}
            <div className="space-y-2">
              <LabelWithDesc label="Blade Material" desc="Steel alloy type" />
              <Select
                value={magnet.bladeMaterial || 'ss430'}
                onValueChange={(v) => setMagnet({ bladeMaterial: v as BladeMaterial })}
              >
                <SelectTrigger onFocus={onFocus('magnet.bladeMaterial')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bladeMaterials.map((mat) => (
                    <SelectItem key={mat.value} value={mat.value}>
                      {mat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <LabelWithDesc label="Blade Thickness" desc="Rail width" />
                <Input
                  type="number"
                  step="0.1"
                  value={magnet.bladeThickness ?? 3}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber
                    if (!isNaN(val)) setMagnet({ bladeThickness: val })
                  }}
                  onFocus={onFocus('magnet.bladeThickness')}
                />
              </div>
              <div className="space-y-2">
                <LabelWithDesc label="Protrusion" desc="Above bobbin" />
                <Input
                  type="number"
                  step="0.1"
                  value={magnet.bladeHeight ?? 2}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber
                    if (!isNaN(val)) setMagnet({ bladeHeight: val })
                  }}
                  onFocus={onFocus('magnet.bladeHeight')}
                />
              </div>
            </div>

            {/* Bar magnet(s) under the blade */}
            <h5 className="text-xs font-medium text-muted-foreground pt-2">Bar Magnet(s)</h5>

            <div className="space-y-2">
              <LabelWithDesc label="Magnet Count" desc="1 or 2 bar magnets" />
              <Select
                value={(magnet.magnetCount || 1).toString()}
                onValueChange={(v) => setMagnet({ magnetCount: parseInt(v, 10) })}
              >
                <SelectTrigger onFocus={onFocus('magnet.magnetCount')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 magnet</SelectItem>
                  <SelectItem value="2">2 magnets</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <LabelWithDesc label="Width" desc="Bar width" />
                <Input
                  type="number"
                  step="0.1"
                  value={magnet.width ?? 12}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber
                    if (!isNaN(val)) setMagnet({ width: val })
                  }}
                  onFocus={onFocus('magnet.width')}
                />
              </div>
              <div className="space-y-2">
                <LabelWithDesc label="Length" desc="Along strings" />
                <Input
                  type="number"
                  step="0.1"
                  value={magnet.magnetLength}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber
                    if (!isNaN(val)) setMagnet({ magnetLength: val })
                  }}
                  onFocus={onFocus('magnet.magnetLength')}
                />
              </div>
              <div className="space-y-2">
                <LabelWithDesc label="Height" desc="Bar thickness" />
                <Input
                  type="number"
                  step="0.1"
                  value={magnet.magnetHeight ?? 3}
                  onChange={(e) => {
                    const val = e.target.valueAsNumber
                    if (!isNaN(val)) setMagnet({ magnetHeight: val })
                  }}
                  onFocus={onFocus('magnet.magnetHeight')}
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <LabelWithDesc
            label={`Magnetization: ${(magnet.magnetization * 100).toFixed(0)}%`}
            desc="Strength relative to fully charged"
          />
          <Slider
            value={[magnet.magnetization]}
            onValueChange={([v]) => setMagnet({ magnetization: v })}
            min={0.5}
            max={1}
            step={0.01}
            onFocus={onFocus('magnet.magnetization')}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>50% (aged)</span>
            <span>100% (fresh)</span>
          </div>
        </div>

        {/* Pole Pieces toggle - only for bar geometry (blade IS the pole piece) */}
        {magnet.geometry === 'bar' && (
          <div className="flex items-center justify-between" onFocus={onFocus('magnet.polePieces')}>
            <LabelWithDesc label="Pole Pieces" desc="Steel slugs/screws on bar" />
            <Switch
              checked={magnet.polePieces}
              onCheckedChange={(checked) => setMagnet({ polePieces: checked })}
            />
          </div>
        )}
      </div>

      {/* Positioning Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">Positioning</h4>

        <div className="space-y-2">
          <LabelWithDesc
            label={`String Distance: ${positioning.stringToPoleDistance.toFixed(1)} mm`}
            desc="Gap between string and pole top"
          />
          <Slider
            value={[positioning.stringToPoleDistance]}
            onValueChange={([v]) => setPositioning({ stringToPoleDistance: v })}
            min={1}
            max={6}
            step={0.1}
            onFocus={onFocus('positioning.stringToPoleDistance')}
          />
        </div>

        {/* Pole Spacing - only for rod/bar with individual poles, not for blade */}
        {magnet.geometry !== 'blade' && (
          <div className="space-y-2">
            <LabelWithDesc label="Pole Spacing" desc="Distance between pole centers" />
            <Input
              type="number"
              step="0.1"
              value={positioning.poleSpacing}
              onChange={(e) =>
                setPositioning({ poleSpacing: e.target.valueAsNumber || 0 })
              }
              onFocus={onFocus('positioning.poleSpacing')}
            />
          </div>
        )}
      </div>

      {/* String Pull Warning */}
      {computed && (
        <div className="rounded-lg border bg-muted/50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">String Pull</span>
            <Badge
              variant={
                computed.stringPullWarning === 'safe'
                  ? 'default'
                  : computed.stringPullWarning === 'caution'
                  ? 'secondary'
                  : 'destructive'
              }
              className={
                computed.stringPullWarning === 'safe'
                  ? 'bg-green-600'
                  : computed.stringPullWarning === 'caution'
                  ? 'bg-yellow-600'
                  : ''
              }
            >
              {computed.stringPullWarning.toUpperCase()}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Index: {(computed.stringPullIndex * 100).toFixed(0)}%
          </p>
        </div>
      )}
    </div>
  )
}
