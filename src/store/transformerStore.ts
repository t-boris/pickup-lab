/**
 * Transformer Store
 *
 * Zustand store for transformer parameters and computed results.
 * Includes enable/disable toggle for optional transformer modeling.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  TransformerParams,
  TransformerCoreParams,
  TransformerWindingParams,
  TransformerComputedResults,
  LoadParams,
  CoreShape,
  CoreMaterial,
  PrimaryWindingConductor,
  ToroidGeometry,
} from '@/domain/types'
import { computeTransformerResults } from '@/engine/transformer'

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/** Default toroid geometry (small audio transformer) */
const DEFAULT_TOROID_GEOMETRY: ToroidGeometry = {
  innerDiameter: 10,  // mm
  outerDiameter: 20,  // mm
  height: 8,          // mm
  straightLength: 0,  // round toroid
}

/** Default transformer core (nanocrystalline toroid) */
const DEFAULT_CORE: TransformerCoreParams = {
  shape: 'toroid_round',
  material: { base: 'nanocrystalline', variant: 'nc_iron' },
  toroidGeometry: DEFAULT_TOROID_GEOMETRY,
  effectiveArea: 40,    // mm² (calculated from geometry)
  effectiveLength: 47,  // mm (calculated from geometry)
  airGap: 0,            // closed core
}

/** Default primary conductor (wire) */
const DEFAULT_PRIMARY_CONDUCTOR: PrimaryWindingConductor = {
  type: 'wire',
  material: 'copper',
  wireAwg: 38,
}

/** Default transformer winding */
const DEFAULT_WINDING: TransformerWindingParams = {
  primaryTurns: 200,
  secondaryTurns: 2000, // 1:10 step-up
  primaryConductor: DEFAULT_PRIMARY_CONDUCTOR,
  secondaryAwg: 42,
  secondaryMaterial: 'copper',
  windingStyle: 'interleaved',
  shielding: false,
}

/** Default transformer parameters (disabled by default) */
const DEFAULT_TRANSFORMER: TransformerParams = {
  enabled: false,
  core: DEFAULT_CORE,
  winding: DEFAULT_WINDING,
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface TransformerStore {
  // State
  transformer: TransformerParams
  computed: TransformerComputedResults | null
  isComputing: boolean

  // Actions - Enable/Disable
  setEnabled: (enabled: boolean) => void
  toggle: () => void

  // Actions - Core
  setCore: (core: Partial<TransformerCoreParams>) => void
  setCoreShape: (shape: CoreShape) => void
  setCoreMaterial: (material: CoreMaterial) => void
  setToroidGeometry: (geometry: Partial<ToroidGeometry>) => void
  setAirGap: (gap: number) => void

  // Actions - Winding
  setWinding: (winding: Partial<TransformerWindingParams>) => void
  setPrimaryTurns: (turns: number) => void
  setSecondaryTurns: (turns: number) => void
  setPrimaryConductor: (conductor: Partial<PrimaryWindingConductor>) => void
  setWindingStyle: (style: TransformerWindingParams['windingStyle']) => void
  setShielding: (enabled: boolean) => void

  // Actions - Full state
  setTransformer: (transformer: TransformerParams) => void
  resetToDefault: () => void

  // Compute action
  compute: (load: LoadParams) => void
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useTransformerStore = create<TransformerStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      transformer: DEFAULT_TRANSFORMER,
      computed: null,
      isComputing: false,

      // Enable/Disable actions
      setEnabled: (enabled) => {
        set(
          (state) => ({
            transformer: { ...state.transformer, enabled },
          }),
          false,
          'setEnabled'
        )
      },

      toggle: () => {
        set(
          (state) => ({
            transformer: {
              ...state.transformer,
              enabled: !state.transformer.enabled,
            },
          }),
          false,
          'toggle'
        )
      },

      // Core actions
      setCore: (core) => {
        set(
          (state) => ({
            transformer: {
              ...state.transformer,
              core: { ...state.transformer.core, ...core },
            },
          }),
          false,
          'setCore'
        )
      },

      setCoreShape: (shape) => {
        set(
          (state) => ({
            transformer: {
              ...state.transformer,
              core: { ...state.transformer.core, shape },
            },
          }),
          false,
          'setCoreShape'
        )
      },

      setCoreMaterial: (material) => {
        set(
          (state) => ({
            transformer: {
              ...state.transformer,
              core: { ...state.transformer.core, material },
            },
          }),
          false,
          'setCoreMaterial'
        )
      },

      setToroidGeometry: (geometry) => {
        set(
          (state) => {
            const currentGeom = state.transformer.core.toroidGeometry
            const newGeom = {
              ...currentGeom,
              ...geometry,
            } as ToroidGeometry

            // Auto-calculate Ae and le from toroid dimensions
            const { innerDiameter, outerDiameter, height, straightLength = 0 } = newGeom

            // Ae = cross-sectional area = height × radial thickness
            const radialThickness = (outerDiameter - innerDiameter) / 2
            const effectiveArea = height * radialThickness // mm²

            // le = mean magnetic path length
            // For round toroid: π × mean diameter
            // For oval toroid: π × mean diameter + 2 × straightLength
            const meanDiameter = (outerDiameter + innerDiameter) / 2
            const effectiveLength = Math.PI * meanDiameter + 2 * straightLength // mm

            return {
              transformer: {
                ...state.transformer,
                core: {
                  ...state.transformer.core,
                  toroidGeometry: newGeom,
                  effectiveArea: Math.round(effectiveArea * 10) / 10,
                  effectiveLength: Math.round(effectiveLength * 10) / 10,
                },
              },
            }
          },
          false,
          'setToroidGeometry'
        )
      },

      setAirGap: (airGap) => {
        set(
          (state) => ({
            transformer: {
              ...state.transformer,
              core: { ...state.transformer.core, airGap },
            },
          }),
          false,
          'setAirGap'
        )
      },

      // Winding actions
      setWinding: (winding) => {
        set(
          (state) => ({
            transformer: {
              ...state.transformer,
              winding: { ...state.transformer.winding, ...winding },
            },
          }),
          false,
          'setWinding'
        )
      },

      setPrimaryTurns: (primaryTurns) => {
        set(
          (state) => ({
            transformer: {
              ...state.transformer,
              winding: { ...state.transformer.winding, primaryTurns },
            },
          }),
          false,
          'setPrimaryTurns'
        )
      },

      setSecondaryTurns: (secondaryTurns) => {
        set(
          (state) => ({
            transformer: {
              ...state.transformer,
              winding: { ...state.transformer.winding, secondaryTurns },
            },
          }),
          false,
          'setSecondaryTurns'
        )
      },

      setPrimaryConductor: (conductor) => {
        set(
          (state) => ({
            transformer: {
              ...state.transformer,
              winding: {
                ...state.transformer.winding,
                primaryConductor: {
                  ...state.transformer.winding.primaryConductor,
                  ...conductor,
                },
              },
            },
          }),
          false,
          'setPrimaryConductor'
        )
      },

      setWindingStyle: (windingStyle) => {
        set(
          (state) => ({
            transformer: {
              ...state.transformer,
              winding: { ...state.transformer.winding, windingStyle },
            },
          }),
          false,
          'setWindingStyle'
        )
      },

      setShielding: (shielding) => {
        set(
          (state) => ({
            transformer: {
              ...state.transformer,
              winding: { ...state.transformer.winding, shielding },
            },
          }),
          false,
          'setShielding'
        )
      },

      // Full state actions
      setTransformer: (transformer) => {
        set({ transformer }, false, 'setTransformer')
      },

      resetToDefault: () => {
        set({ transformer: DEFAULT_TRANSFORMER }, false, 'resetToDefault')
      },

      // Compute action
      compute: (load) => {
        const { transformer } = get()

        if (!transformer.enabled) {
          set({ computed: null }, false, 'compute/disabled')
          return
        }

        set({ isComputing: true }, false, 'compute/start')

        try {
          const computed = computeTransformerResults(transformer, load)
          set({ computed, isComputing: false }, false, 'compute/success')
        } catch (error) {
          console.error('Transformer computation error:', error)
          set({ isComputing: false }, false, 'compute/error')
        }
      },
    }),
    { name: 'transformer-store' }
  )
)

// Export default values for preset creation
export { DEFAULT_TRANSFORMER, DEFAULT_CORE, DEFAULT_WINDING }
