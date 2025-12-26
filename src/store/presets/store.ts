/**
 * Presets Store Implementation
 *
 * Zustand store for managing pickup presets.
 * Includes built-in presets and user-defined presets.
 * Supports save, load, delete, and comparison features.
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  PickupConfig,
  PresetWithResults,
  ComputedResults,
  GraphData,
} from '@/domain/types'
import { MODEL_VERSION } from '@/lib/calibration'
import { BUILTIN_PRESETS, COMPARISON_COLORS, generateId } from './definitions'

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface PresetsStore {
  // State
  builtinPresets: PickupConfig[]
  userPresets: PickupConfig[]
  comparisonPresets: PresetWithResults[]
  activePresetId: string | null

  // Actions - Load/Save
  loadPreset: (id: string) => PickupConfig | null
  savePreset: (name: string, config: Omit<PickupConfig, 'id' | 'modelVersion' | 'timestamp' | 'name'>) => string
  updatePreset: (id: string, config: Partial<PickupConfig>) => void
  deletePreset: (id: string) => void
  duplicatePreset: (id: string, newName: string) => string | null
  renamePreset: (id: string, newName: string) => void

  // Actions - Comparison
  addToComparison: (
    config: PickupConfig,
    results: ComputedResults,
    graphData: GraphData
  ) => void
  removeFromComparison: (id: string) => void
  clearComparison: () => void
  setComparisonColor: (id: string, color: string) => void

  // Actions - Active preset
  setActivePresetId: (id: string | null) => void

  // Actions - Import/Export
  exportPreset: (id: string) => string | null
  importPreset: (jsonString: string) => string | null
  exportAllUserPresets: () => string

  // Getters
  getPresetById: (id: string) => PickupConfig | undefined
  getAllPresets: () => PickupConfig[]
  isBuiltinPreset: (id: string) => boolean
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const usePresetsStore = create<PresetsStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        builtinPresets: BUILTIN_PRESETS,
        userPresets: [],
        comparisonPresets: [],
        activePresetId: null,

        // Load preset by ID
        loadPreset: (id) => {
          const preset = get().getPresetById(id)
          if (preset) {
            set({ activePresetId: id }, false, 'loadPreset')
          }
          return preset ?? null
        },

        // Save new preset
        savePreset: (name, config) => {
          const id = generateId()
          const newPreset: PickupConfig = {
            ...config,
            id,
            name,
            modelVersion: MODEL_VERSION,
            timestamp: Date.now(),
          }

          set(
            (state) => ({
              userPresets: [...state.userPresets, newPreset],
              activePresetId: id,
            }),
            false,
            'savePreset'
          )

          return id
        },

        // Update existing preset
        updatePreset: (id, config) => {
          if (get().isBuiltinPreset(id)) {
            console.warn('Cannot modify built-in presets')
            return
          }

          set(
            (state) => ({
              userPresets: state.userPresets.map((p) =>
                p.id === id
                  ? { ...p, ...config, timestamp: Date.now() }
                  : p
              ),
            }),
            false,
            'updatePreset'
          )
        },

        // Delete preset
        deletePreset: (id) => {
          if (get().isBuiltinPreset(id)) {
            console.warn('Cannot delete built-in presets')
            return
          }

          set(
            (state) => ({
              userPresets: state.userPresets.filter((p) => p.id !== id),
              activePresetId:
                state.activePresetId === id ? null : state.activePresetId,
              comparisonPresets: state.comparisonPresets.filter(
                (p) => p.config.id !== id
              ),
            }),
            false,
            'deletePreset'
          )
        },

        // Duplicate preset
        duplicatePreset: (id, newName) => {
          const original = get().getPresetById(id)
          if (!original) return null

          const newId = generateId()
          const duplicate: PickupConfig = {
            ...original,
            id: newId,
            name: newName,
            timestamp: Date.now(),
          }

          set(
            (state) => ({
              userPresets: [...state.userPresets, duplicate],
            }),
            false,
            'duplicatePreset'
          )

          return newId
        },

        // Rename preset
        renamePreset: (id, newName) => {
          if (get().isBuiltinPreset(id)) {
            console.warn('Cannot rename built-in presets')
            return
          }

          set(
            (state) => ({
              userPresets: state.userPresets.map((p) =>
                p.id === id ? { ...p, name: newName } : p
              ),
            }),
            false,
            'renamePreset'
          )
        },

        // Add to comparison
        addToComparison: (config, results, graphData) => {
          const { comparisonPresets } = get()

          // Check if already in comparison
          if (comparisonPresets.some((p) => p.config.id === config.id)) {
            return
          }

          // Assign next available color
          const usedColors = new Set(comparisonPresets.map((p) => p.color))
          const color =
            COMPARISON_COLORS.find((c) => !usedColors.has(c)) ??
            COMPARISON_COLORS[comparisonPresets.length % COMPARISON_COLORS.length]

          const presetWithResults: PresetWithResults = {
            config,
            results,
            graphData,
            color,
          }

          set(
            (state) => ({
              comparisonPresets: [...state.comparisonPresets, presetWithResults],
            }),
            false,
            'addToComparison'
          )
        },

        // Remove from comparison
        removeFromComparison: (id) => {
          set(
            (state) => ({
              comparisonPresets: state.comparisonPresets.filter(
                (p) => p.config.id !== id
              ),
            }),
            false,
            'removeFromComparison'
          )
        },

        // Clear comparison
        clearComparison: () => {
          set({ comparisonPresets: [] }, false, 'clearComparison')
        },

        // Set comparison color
        setComparisonColor: (id, color) => {
          set(
            (state) => ({
              comparisonPresets: state.comparisonPresets.map((p) =>
                p.config.id === id ? { ...p, color } : p
              ),
            }),
            false,
            'setComparisonColor'
          )
        },

        // Set active preset
        setActivePresetId: (id) => {
          set({ activePresetId: id }, false, 'setActivePresetId')
        },

        // Export preset as JSON
        exportPreset: (id) => {
          const preset = get().getPresetById(id)
          if (!preset) return null

          return JSON.stringify(preset, null, 2)
        },

        // Import preset from JSON
        importPreset: (jsonString) => {
          try {
            const imported = JSON.parse(jsonString) as PickupConfig

            // Validate required fields
            if (!imported.coil || !imported.magnet || !imported.load) {
              console.error('Invalid preset format')
              return null
            }

            // Generate new ID and update metadata
            const id = generateId()
            const preset: PickupConfig = {
              ...imported,
              id,
              name: imported.name || 'Imported Preset',
              modelVersion: MODEL_VERSION,
              timestamp: Date.now(),
            }

            set(
              (state) => ({
                userPresets: [...state.userPresets, preset],
              }),
              false,
              'importPreset'
            )

            return id
          } catch (error) {
            console.error('Failed to import preset:', error)
            return null
          }
        },

        // Export all user presets
        exportAllUserPresets: () => {
          const { userPresets } = get()
          return JSON.stringify(userPresets, null, 2)
        },

        // Get preset by ID
        getPresetById: (id) => {
          const { builtinPresets, userPresets } = get()
          return (
            builtinPresets.find((p) => p.id === id) ??
            userPresets.find((p) => p.id === id)
          )
        },

        // Get all presets (built-in + user)
        getAllPresets: () => {
          const { builtinPresets, userPresets } = get()
          return [...builtinPresets, ...userPresets]
        },

        // Check if preset is built-in
        isBuiltinPreset: (id) => {
          return get().builtinPresets.some((p) => p.id === id)
        },
      }),
      {
        name: 'pickup-lab-presets',
        // Only persist user presets, not built-in or comparison
        partialize: (state) => ({
          userPresets: state.userPresets,
        }),
      }
    ),
    { name: 'presets-store' }
  )
)
