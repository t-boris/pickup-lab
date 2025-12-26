/**
 * PresetModal Component
 *
 * Modal for managing presets: save, load, delete.
 * Shows both built-in and user presets.
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  useUIStore,
  usePresetsStore,
  useCoilStore,
  useMagnetStore,
  useTransformerStore,
  useLoadStore,
} from '@/store'
import { getAwgFromDiameter } from '@/lib/awg-table'
import type { PickupConfig } from '@/domain/types'

// Icons
const LoadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" x2="12" y1="3" y2="15"/>
  </svg>
)

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
)

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
)

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
)

export const PresetModal: React.FC = () => {
  const { presetModalOpen, setPresetModalOpen } = useUIStore()
  const {
    builtinPresets,
    userPresets,
    activePresetId,
    loadPreset,
    savePreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    isBuiltinPreset,
  } = usePresetsStore()

  const setCoil = useCoilStore((s) => s.setCoil)
  const setMagnetAll = useMagnetStore((s) => s.setAll)
  const setTransformer = useTransformerStore((s) => s.setTransformer)
  const setLoad = useLoadStore((s) => s.setLoad)

  const coil = useCoilStore((s) => s.coil)
  const magnet = useMagnetStore((s) => s.magnet)
  const positioning = useMagnetStore((s) => s.positioning)
  const transformer = useTransformerStore((s) => s.transformer)
  const load = useLoadStore((s) => s.load)

  const [newPresetName, setNewPresetName] = useState('')
  const [activeTab, setActiveTab] = useState('builtin')

  // Load a preset into the stores
  const handleLoadPreset = (preset: PickupConfig) => {
    setCoil(preset.coil)
    setMagnetAll(preset.magnet, preset.positioning)
    setTransformer(preset.transformer)
    setLoad(preset.load)
    loadPreset(preset.id)
    setPresetModalOpen(false)
  }

  // Save current settings as new preset
  const handleSavePreset = () => {
    if (!newPresetName.trim()) return

    savePreset(newPresetName.trim(), {
      coil,
      magnet,
      positioning,
      transformer,
      load,
    })

    setNewPresetName('')
    setActiveTab('user')
  }

  // Duplicate a preset
  const handleDuplicate = (id: string, name: string) => {
    duplicatePreset(id, `${name} (Copy)`)
    setActiveTab('user')
  }

  // Overwrite existing preset with current settings
  const handleOverwritePreset = (id: string) => {
    updatePreset(id, {
      coil,
      magnet,
      positioning,
      transformer,
      load,
    })
  }

  const PresetCard: React.FC<{ preset: PickupConfig }> = ({ preset }) => {
    const isActive = activePresetId === preset.id
    const isBuiltin = isBuiltinPreset(preset.id)

    return (
      <div
        className={`
          rounded-lg border p-3 transition-colors
          ${isActive ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
        `}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{preset.name}</span>
              {isBuiltin && (
                <Badge variant="secondary" className="text-xs">
                  Built-in
                </Badge>
              )}
              {isActive && (
                <Badge variant="default" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {preset.coil.wire.turns.toLocaleString()} turns |{' '}
              {(() => {
                const awg = getAwgFromDiameter(preset.coil.wire.wireDiameter)
                return awg ? `AWG ${awg}` : `${preset.coil.wire.wireDiameter.toFixed(3)}mm`
              })()}
              {' | '}{preset.magnet.type.toUpperCase()}
              {preset.transformer.enabled && ' | +TX'}
            </div>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDuplicate(preset.id, preset.name)}
              title="Duplicate"
            >
              <CopyIcon />
            </Button>
            {!isBuiltin && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOverwritePreset(preset.id)}
                  title="Overwrite with current settings"
                >
                  <SaveIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePreset(preset.id)}
                  title="Delete"
                  className="text-destructive hover:text-destructive"
                >
                  <TrashIcon />
                </Button>
              </>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={() => handleLoadPreset(preset)}
            >
              <LoadIcon />
              <span className="ml-1">Load</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={presetModalOpen} onOpenChange={setPresetModalOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Presets</DialogTitle>
          <DialogDescription>
            Load built-in presets or save your own configurations.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builtin">
              Built-in ({builtinPresets.length})
            </TabsTrigger>
            <TabsTrigger value="user">
              My Presets ({userPresets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builtin" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {builtinPresets.map((preset) => (
                  <PresetCard key={preset.id} preset={preset} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="user" className="mt-4">
            {userPresets.length > 0 ? (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {userPresets.map((preset) => (
                    <PresetCard key={preset.id} preset={preset} />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-center">
                <div>
                  <p className="text-muted-foreground">No saved presets yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Save your current configuration below.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Save New Preset */}
        <div className="space-y-2">
          <Label>Save Current Configuration</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Preset name..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
            />
            <Button onClick={handleSavePreset} disabled={!newPresetName.trim()}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
