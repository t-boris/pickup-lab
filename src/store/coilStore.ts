/**
 * Coil Store
 *
 * Zustand store for coil geometry, wire parameters, and computed results.
 * Integrates with the physics engine to compute coil properties.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  CoilGeometry,
  WireParams,
  CoilParams,
  CoilComputedResults,
  WiringConfig,
  PhaseConfig,
} from '@/domain/types'
import { computeCoilResults } from '@/engine/coil'

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/** Default coil geometry (Fender-style flatwork Strat) */
const DEFAULT_GEOMETRY: CoilGeometry = {
  form: 'flatwork',
  innerRadius: 4.76,  // pole diameter (Strat: 0.187")
  outerRadius: 14,    // computed from winding
  height: 11,         // winding height
  length: 68,         // bobbin length (Strat: ~68mm)
}

/** Default wire parameters (AWG 42 Plain Enamel, Strat-style) */
const DEFAULT_WIRE: WireParams = {
  material: 'copper',
  copperGrade: 'standard',
  strandType: 'solid',
  wireDiameter: 0.0635,  // AWG 42
  insulation: 'plain_enamel',
  insulationClass: 'A',
  turns: 8000,           // Vintage 60s Strat: 7900-8100
  windingStyle: 'scatter',
  packingFactor: 0.72,
  temperature: 20,
}

/** Default coil parameters */
const DEFAULT_COIL: CoilParams = {
  geometry: DEFAULT_GEOMETRY,
  wire: DEFAULT_WIRE,
  couplingFactor: 0.7,  // Typical for well-wound single coil
  wiringConfig: 'single',
  phaseConfig: 'in_phase',
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface CoilStore {
  // State
  coil: CoilParams
  computed: CoilComputedResults | null
  isComputing: boolean

  // Actions - Geometry
  setGeometry: (geometry: Partial<CoilGeometry>) => void
  setForm: (form: CoilGeometry['form']) => void

  // Actions - Wire
  setWire: (wire: Partial<WireParams>) => void
  setWireDiameter: (diameter: number) => void
  setTurns: (turns: number) => void
  setWindingStyle: (style: WireParams['windingStyle']) => void
  setPackingFactor: (factor: number) => void
  setTemperature: (temp: number) => void

  // Actions - Coupling
  setCouplingFactor: (factor: number) => void

  // Actions - Wiring
  setWiringConfig: (config: WiringConfig) => void
  setPhaseConfig: (config: PhaseConfig) => void

  // Actions - Full state
  setCoil: (coil: CoilParams) => void
  resetToDefault: () => void
  compute: () => void
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useCoilStore = create<CoilStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      coil: DEFAULT_COIL,
      computed: null,
      isComputing: false,

      // Geometry actions
      setGeometry: (geometry) => {
        set(
          (state) => ({
            coil: {
              ...state.coil,
              geometry: { ...state.coil.geometry, ...geometry },
            },
          }),
          false,
          'setGeometry'
        )
        get().compute()
      },

      setForm: (form) => {
        set(
          (state) => ({
            coil: {
              ...state.coil,
              geometry: { ...state.coil.geometry, form },
            },
          }),
          false,
          'setForm'
        )
        get().compute()
      },

      // Wire actions
      setWire: (wire) => {
        set(
          (state) => ({
            coil: {
              ...state.coil,
              wire: { ...state.coil.wire, ...wire },
            },
          }),
          false,
          'setWire'
        )
        get().compute()
      },

      setWireDiameter: (wireDiameter) => {
        set(
          (state) => ({
            coil: {
              ...state.coil,
              wire: { ...state.coil.wire, wireDiameter },
            },
          }),
          false,
          'setWireDiameter'
        )
        get().compute()
      },

      setTurns: (turns) => {
        set(
          (state) => ({
            coil: {
              ...state.coil,
              wire: { ...state.coil.wire, turns },
            },
          }),
          false,
          'setTurns'
        )
        get().compute()
      },

      setWindingStyle: (windingStyle) => {
        set(
          (state) => ({
            coil: {
              ...state.coil,
              wire: { ...state.coil.wire, windingStyle },
            },
          }),
          false,
          'setWindingStyle'
        )
        get().compute()
      },

      setPackingFactor: (packingFactor) => {
        set(
          (state) => ({
            coil: {
              ...state.coil,
              wire: { ...state.coil.wire, packingFactor },
            },
          }),
          false,
          'setPackingFactor'
        )
        get().compute()
      },

      setTemperature: (temperature) => {
        set(
          (state) => ({
            coil: {
              ...state.coil,
              wire: { ...state.coil.wire, temperature },
            },
          }),
          false,
          'setTemperature'
        )
        get().compute()
      },

      // Coupling action
      setCouplingFactor: (couplingFactor) => {
        set(
          (state) => ({
            coil: { ...state.coil, couplingFactor },
          }),
          false,
          'setCouplingFactor'
        )
      },

      // Wiring actions
      setWiringConfig: (wiringConfig) => {
        set(
          (state) => ({
            coil: { ...state.coil, wiringConfig },
          }),
          false,
          'setWiringConfig'
        )
        get().compute()
      },

      setPhaseConfig: (phaseConfig) => {
        set(
          (state) => ({
            coil: { ...state.coil, phaseConfig },
          }),
          false,
          'setPhaseConfig'
        )
        get().compute()
      },

      // Full state actions
      setCoil: (coil) => {
        set({ coil }, false, 'setCoil')
        get().compute()
      },

      resetToDefault: () => {
        set({ coil: DEFAULT_COIL }, false, 'resetToDefault')
        get().compute()
      },

      // Compute action
      compute: () => {
        const { coil } = get()
        set({ isComputing: true }, false, 'compute/start')

        try {
          const computed = computeCoilResults(coil.geometry, coil.wire)
          set({ computed, isComputing: false }, false, 'compute/success')
        } catch (error) {
          console.error('Coil computation error:', error)
          set({ isComputing: false }, false, 'compute/error')
        }
      },
    }),
    { name: 'coil-store' }
  )
)

// Export default values for preset creation
export { DEFAULT_COIL, DEFAULT_GEOMETRY, DEFAULT_WIRE }
