/**
 * Magnet Store
 *
 * Zustand store for magnet parameters, positioning, and computed results.
 * Handles magnetic field calculations and string pull index.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  MagnetParams,
  PositioningParams,
  MagnetComputedResults,
  MagnetType,
  MagnetGeometry,
} from '@/domain/types'
import { computeMagnetResults } from '@/engine/magnetic'

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/** Default magnet parameters (AlNiCo 5 rod magnets - Strat style) */
const DEFAULT_MAGNET: MagnetParams = {
  type: 'alnico5',
  geometry: 'rod',
  diameter: 5,
  magnetLength: 18,
  magnetization: 1.0,
  polePieces: false,
  polePieceMaterial: 'alnico',  // Rod magnets act as poles - minimal eddy
  coverType: 'none',            // Open coil
}

/** Default positioning parameters */
const DEFAULT_POSITIONING: PositioningParams = {
  stringToPoleDistance: 2.5,
  coilToStringDistance: 3,
  poleSpacing: 10.5,
  stringDiameter: 0.43,
  stringMaterial: 'nickel',
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface MagnetStore {
  // State
  magnet: MagnetParams
  positioning: PositioningParams
  computed: MagnetComputedResults | null
  isComputing: boolean

  // Actions - Magnet
  setMagnet: (magnet: Partial<MagnetParams>) => void
  setMagnetType: (type: MagnetType) => void
  setMagnetGeometry: (geometry: MagnetGeometry) => void
  setMagnetization: (level: number) => void
  setPolePieces: (enabled: boolean) => void

  // Actions - Positioning
  setPositioning: (positioning: Partial<PositioningParams>) => void
  setStringToPoleDistance: (distance: number) => void
  setCoilToStringDistance: (distance: number) => void
  setPoleSpacing: (spacing: number) => void

  // Actions - Full state
  setAll: (magnet: MagnetParams, positioning: PositioningParams) => void
  resetToDefault: () => void

  // Compute action
  compute: (
    turns: number,
    effectiveArea: number,
    couplingFactor: number,
    coilHeight?: number
  ) => void
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useMagnetStore = create<MagnetStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      magnet: DEFAULT_MAGNET,
      positioning: DEFAULT_POSITIONING,
      computed: null,
      isComputing: false,

      // Magnet actions
      setMagnet: (magnet) => {
        set(
          (state) => ({
            magnet: { ...state.magnet, ...magnet },
          }),
          false,
          'setMagnet'
        )
      },

      setMagnetType: (type) => {
        set(
          (state) => ({
            magnet: { ...state.magnet, type },
          }),
          false,
          'setMagnetType'
        )
      },

      setMagnetGeometry: (geometry) => {
        set(
          (state) => ({
            magnet: {
              ...state.magnet,
              geometry,
              // Reset geometry-specific fields when changing type
              ...(geometry === 'rod'
                ? { diameter: 5, width: undefined, magnetHeight: undefined }
                : { width: 12, magnetHeight: 5, diameter: undefined }),
            },
          }),
          false,
          'setMagnetGeometry'
        )
      },

      setMagnetization: (magnetization) => {
        set(
          (state) => ({
            magnet: { ...state.magnet, magnetization },
          }),
          false,
          'setMagnetization'
        )
      },

      setPolePieces: (polePieces) => {
        set(
          (state) => ({
            magnet: {
              ...state.magnet,
              polePieces,
              // When polePieces=false (rod magnets), the AlNiCo rods ARE the poles
              // When polePieces=true (bar magnet + slugs), default to steel
              polePieceMaterial: polePieces ? 'steel' : 'alnico',
            },
          }),
          false,
          'setPolePieces'
        )
      },

      // Positioning actions
      setPositioning: (positioning) => {
        set(
          (state) => ({
            positioning: { ...state.positioning, ...positioning },
          }),
          false,
          'setPositioning'
        )
      },

      setStringToPoleDistance: (stringToPoleDistance) => {
        set(
          (state) => ({
            positioning: { ...state.positioning, stringToPoleDistance },
          }),
          false,
          'setStringToPoleDistance'
        )
      },

      setCoilToStringDistance: (coilToStringDistance) => {
        set(
          (state) => ({
            positioning: { ...state.positioning, coilToStringDistance },
          }),
          false,
          'setCoilToStringDistance'
        )
      },

      setPoleSpacing: (poleSpacing) => {
        set(
          (state) => ({
            positioning: { ...state.positioning, poleSpacing },
          }),
          false,
          'setPoleSpacing'
        )
      },

      // Full state actions
      setAll: (magnet, positioning) => {
        set({ magnet, positioning }, false, 'setAll')
      },

      resetToDefault: () => {
        set(
          { magnet: DEFAULT_MAGNET, positioning: DEFAULT_POSITIONING },
          false,
          'resetToDefault'
        )
      },

      // Compute action
      compute: (turns, effectiveArea, couplingFactor, coilHeight) => {
        const { magnet, positioning } = get()
        set({ isComputing: true }, false, 'compute/start')

        try {
          const computed = computeMagnetResults(
            magnet,
            positioning,
            turns,
            effectiveArea,
            couplingFactor,
            coilHeight
          )
          set({ computed, isComputing: false }, false, 'compute/success')
        } catch (error) {
          console.error('Magnet computation error:', error)
          set({ isComputing: false }, false, 'compute/error')
        }
      },
    }),
    { name: 'magnet-store' }
  )
)

// Export default values for preset creation
export { DEFAULT_MAGNET, DEFAULT_POSITIONING }
