/**
 * Load Store
 *
 * Zustand store for load parameters (pots, cable, amp input).
 * Handles signal chain loading effects on pickup response.
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { LoadParams, LoadComputedResults } from '@/domain/types'

// ============================================================================
// DEFAULT VALUES
// ============================================================================

/** Default load parameters (typical guitar setup) */
const DEFAULT_LOAD: LoadParams = {
  volumePot: 250000, // 250k volume pot
  volumePosition: 1, // Full volume
  tonePot: 250000, // 250k tone pot
  toneCapacitor: 22e-9, // 22nF tone cap
  tonePosition: 0, // Full treble (no rolloff)
  cableCapacitancePerMeter: 100e-12, // 100pF/m cable
  cableLength: 5, // 5 meters
  ampInputImpedance: 1e6, // 1M amp input
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface LoadStore {
  // State
  load: LoadParams
  computed: LoadComputedResults | null
  isComputing: boolean

  // Actions - Individual parameters
  setVolumePot: (value: number) => void
  setVolumePosition: (value: number) => void
  setTonePot: (value: number) => void
  setToneCapacitor: (value: number) => void
  setTonePosition: (value: number) => void
  setCableCapacitance: (value: number) => void
  setCableLength: (value: number) => void
  setAmpInputImpedance: (value: number) => void

  // Actions - Batch updates
  setLoad: (load: Partial<LoadParams>) => void
  resetToDefault: () => void

  // Actions - Common presets
  setVintageLoad: () => void
  setModernLoad: () => void
  setHighImpedanceLoad: () => void

  // Compute action
  compute: (
    coilInductance: number,
    coilCapacitance: number,
    coilResistance: number
  ) => void
}

// ============================================================================
// COMPUTED VALUES HELPER
// ============================================================================

/**
 * Calculate load-related computed values
 */
const computeLoadResults = (
  load: LoadParams,
  coilInductance: number,
  coilCapacitance: number,
  coilResistance: number
): LoadComputedResults => {
  // Total cable capacitance
  const totalCableCapacitance =
    load.cableCapacitancePerMeter * load.cableLength

  // Volume pot effect on loading:
  // When volume is rolled down, the lower portion of the pot shunts the signal.
  // At volumePosition = 1 (full): pickup sees volumePot || ampInput
  // At volumePosition = 0 (off): pickup is shunted through low resistance (~1k wiper contact)
  //
  // Simplified model: effective pot value decreases as volume is rolled down
  // This causes darker tone (lower Q, potentially lower f₀)
  const MIN_WIPER_RESISTANCE = 1000 // ohms - minimum resistance at volume = 0
  const effectiveVolumePot =
    load.volumePot * load.volumePosition +
    MIN_WIPER_RESISTANCE * (1 - load.volumePosition)

  // Effective load resistance (parallel combination of effective volume pot and amp input)
  const effectiveLoadResistance =
    1 / (1 / effectiveVolumePot + 1 / load.ampInputImpedance)

  // Total capacitance including cable
  const totalCapacitance = coilCapacitance + totalCableCapacitance

  // Tone circuit contribution (when tone rolled off)
  // At tonePosition = 0, tone cap is effectively out of circuit
  // At tonePosition = 1, tone cap is fully in parallel
  const toneContribution = load.toneCapacitor * load.tonePosition
  const effectiveCapacitance = totalCapacitance + toneContribution

  // Loaded resonance frequency
  // f0_loaded = 1 / (2π√(L × C_total))
  const loadedResonance =
    coilInductance > 0 && effectiveCapacitance > 0
      ? 1 / (2 * Math.PI * Math.sqrt(coilInductance * effectiveCapacitance))
      : 0

  // Loaded Q factor
  // Q_loaded = R_load / (ω0 × L) at resonance
  const omega0 = 2 * Math.PI * loadedResonance
  const loadedQ =
    loadedResonance > 0 && coilInductance > 0
      ? effectiveLoadResistance / (omega0 * coilInductance)
      : 0

  // Output at 1kHz (relative, simplified model)
  // Based on voltage divider effect
  const omega1k = 2 * Math.PI * 1000
  const coilImpedance1k = Math.sqrt(
    coilResistance * coilResistance +
      Math.pow(omega1k * coilInductance, 2)
  )
  const outputAt1kHz = effectiveLoadResistance /
    (effectiveLoadResistance + coilImpedance1k)

  // Brightness index (higher resonance = brighter)
  // Normalized to typical range 2kHz - 10kHz
  const brightnessIndex = Math.min(
    1,
    Math.max(0, (loadedResonance - 2000) / 8000)
  )

  return {
    totalCableCapacitance,
    effectiveLoadResistance,
    loadedResonance,
    loadedQ,
    outputAt1kHz,
    brightnessIndex,
  }
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useLoadStore = create<LoadStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      load: DEFAULT_LOAD,
      computed: null,
      isComputing: false,

      // Individual parameter actions
      setVolumePot: (volumePot) => {
        set(
          (state) => ({
            load: { ...state.load, volumePot },
          }),
          false,
          'setVolumePot'
        )
      },

      setVolumePosition: (volumePosition) => {
        set(
          (state) => ({
            load: { ...state.load, volumePosition },
          }),
          false,
          'setVolumePosition'
        )
      },

      setTonePot: (tonePot) => {
        set(
          (state) => ({
            load: { ...state.load, tonePot },
          }),
          false,
          'setTonePot'
        )
      },

      setToneCapacitor: (toneCapacitor) => {
        set(
          (state) => ({
            load: { ...state.load, toneCapacitor },
          }),
          false,
          'setToneCapacitor'
        )
      },

      setTonePosition: (tonePosition) => {
        set(
          (state) => ({
            load: { ...state.load, tonePosition },
          }),
          false,
          'setTonePosition'
        )
      },

      setCableCapacitance: (cableCapacitancePerMeter) => {
        set(
          (state) => ({
            load: { ...state.load, cableCapacitancePerMeter },
          }),
          false,
          'setCableCapacitance'
        )
      },

      setCableLength: (cableLength) => {
        set(
          (state) => ({
            load: { ...state.load, cableLength },
          }),
          false,
          'setCableLength'
        )
      },

      setAmpInputImpedance: (ampInputImpedance) => {
        set(
          (state) => ({
            load: { ...state.load, ampInputImpedance },
          }),
          false,
          'setAmpInputImpedance'
        )
      },

      // Batch update action
      setLoad: (load) => {
        set(
          (state) => ({
            load: { ...state.load, ...load },
          }),
          false,
          'setLoad'
        )
      },

      resetToDefault: () => {
        set({ load: DEFAULT_LOAD }, false, 'resetToDefault')
      },

      // Common presets
      setVintageLoad: () => {
        set(
          {
            load: {
              volumePot: 250000,
              volumePosition: 1,
              tonePot: 250000,
              toneCapacitor: 47e-9, // 47nF vintage
              tonePosition: 0,
              cableCapacitancePerMeter: 150e-12, // Higher cable capacitance
              cableLength: 6,
              ampInputImpedance: 1e6,
            },
          },
          false,
          'setVintageLoad'
        )
      },

      setModernLoad: () => {
        set(
          {
            load: {
              volumePot: 500000,
              volumePosition: 1,
              tonePot: 500000,
              toneCapacitor: 22e-9,
              tonePosition: 0,
              cableCapacitancePerMeter: 50e-12, // Low capacitance cable
              cableLength: 3,
              ampInputImpedance: 1e6,
            },
          },
          false,
          'setModernLoad'
        )
      },

      setHighImpedanceLoad: () => {
        set(
          {
            load: {
              volumePot: 1e6, // 1M pot (or no pot)
              volumePosition: 1,
              tonePot: 1e6,
              toneCapacitor: 10e-9,
              tonePosition: 0,
              cableCapacitancePerMeter: 30e-12, // Very low capacitance
              cableLength: 2,
              ampInputImpedance: 10e6, // High-Z input
            },
          },
          false,
          'setHighImpedanceLoad'
        )
      },

      // Compute action
      compute: (coilInductance, coilCapacitance, coilResistance) => {
        const { load } = get()
        set({ isComputing: true }, false, 'compute/start')

        try {
          const computed = computeLoadResults(
            load,
            coilInductance,
            coilCapacitance,
            coilResistance
          )
          set({ computed, isComputing: false }, false, 'compute/success')
        } catch (error) {
          console.error('Load computation error:', error)
          set({ isComputing: false }, false, 'compute/error')
        }
      },
    }),
    { name: 'load-store' }
  )
)

// Export default values for preset creation
export { DEFAULT_LOAD }
