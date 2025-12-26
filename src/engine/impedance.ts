/**
 * Impedance and Frequency Response Module
 *
 * Pure functions for calculating:
 * - Complex impedance of RLC circuits
 * - Load impedance (pots, cables, amp input)
 * - System frequency response (magnitude and phase)
 */

import type {
  Complex,
  FrequencyPoint,
  ImpedancePoint,
  LoadParams,
  TransformerParams,
} from '@/domain/types'
import { computePrimaryInductance, computeEffectivePermeabilityWithGap, computeParasitics } from './transformer'
import { getCoreMaterialProperties } from '@/lib/calibration'

// Re-export complex utilities for backward compatibility
export {
  complex,
  addComplex,
  multiplyComplex,
  divideComplex,
  magnitude,
  phase,
  phaseDeg,
  reciprocal,
  parallelImpedance,
} from './complex'

import {
  addComplex,
  divideComplex,
  magnitude,
  parallelImpedance,
  phaseDeg,
} from './complex'

// ============================================================================
// COIL IMPEDANCE MODEL
// ============================================================================

/**
 * Calculate impedance of series RL (resistor + inductor)
 * Z_RL = R + jωL
 *
 * @param resistance DC resistance in Ohms
 * @param inductance Inductance in Henry
 * @param frequency Frequency in Hz
 * @returns Complex impedance
 */
export const computeSeriesRL = (
  resistance: number,
  inductance: number,
  frequency: number
): Complex => {
  const omega = 2 * Math.PI * frequency
  return {
    real: resistance,
    imag: omega * inductance,
  }
}

/**
 * Calculate impedance of capacitor
 * Z_C = 1 / jωC = -j / ωC
 *
 * @param capacitance Capacitance in Farads
 * @param frequency Frequency in Hz
 * @returns Complex impedance
 */
export const computeCapacitorImpedance = (
  capacitance: number,
  frequency: number
): Complex => {
  if (capacitance <= 0 || frequency <= 0) {
    return { real: Infinity, imag: 0 }
  }
  const omega = 2 * Math.PI * frequency
  return {
    real: 0,
    imag: -1 / (omega * capacitance),
  }
}

/**
 * Calculate coil impedance using RLC parallel-series model
 *
 * Model: R and L in series, then Cp in parallel with the series combination
 * Z_coil = (Z_RL × Z_C) / (Z_RL + Z_C)
 *
 * @param resistance DC resistance in Ohms
 * @param inductance Inductance in Henry
 * @param capacitance Parasitic capacitance in Farads
 * @param frequency Frequency in Hz
 * @returns Complex impedance
 */
export const computeCoilImpedance = (
  resistance: number,
  inductance: number,
  capacitance: number,
  frequency: number
): Complex => {
  // Series RL
  const zRL = computeSeriesRL(resistance, inductance, frequency)

  // Parallel capacitor
  const zC = computeCapacitorImpedance(capacitance, frequency)

  // Parallel combination
  return parallelImpedance(zRL, zC)
}

// ============================================================================
// LOAD IMPEDANCE MODEL
// ============================================================================

/**
 * Calculate load impedance
 * Z_load = R_load ∥ (1/jωC_cable)
 *
 * @param load Load parameters
 * @param frequency Frequency in Hz
 * @returns Complex impedance
 */
export const computeLoadImpedance = (load: LoadParams, frequency: number): Complex => {
  // Total cable capacitance
  const cableCapacitance = load.cableCapacitancePerMeter * load.cableLength

  // Effective load resistance (volume pot parallel with amp input)
  const effectiveResistance = (load.volumePot * load.ampInputImpedance) /
    (load.volumePot + load.ampInputImpedance)

  // Resistive part
  const zR: Complex = { real: effectiveResistance, imag: 0 }

  // Capacitive part (cable)
  const zCable = computeCapacitorImpedance(cableCapacitance, frequency)

  // Parallel combination
  return parallelImpedance(zR, zCable)
}

/**
 * Calculate tone control effect
 * Models tone pot + capacitor as frequency-dependent shunt
 *
 * @param toneCapacitance Tone capacitor value in Farads
 * @param toneResistance Tone pot value in Ohms
 * @param tonePosition Tone control position (0 = full treble, 1 = full bass cut)
 * @param frequency Frequency in Hz
 * @returns Complex impedance of tone control to ground
 */
export const computeToneControlImpedance = (
  toneCapacitance: number,
  toneResistance: number,
  tonePosition: number,
  frequency: number
): Complex => {
  // Effective resistance based on pot position
  // At position 0, infinite resistance (no effect)
  // At position 1, minimum resistance
  const effectiveResistance = toneResistance * (1 - tonePosition) + 1 // Min 1 ohm

  // Capacitor impedance
  const zC = computeCapacitorImpedance(toneCapacitance, frequency)

  // Series combination of pot section and capacitor
  const zTone: Complex = {
    real: effectiveResistance + zC.real,
    imag: zC.imag,
  }

  return zTone
}

// ============================================================================
// SYSTEM RESPONSE
// ============================================================================

/**
 * Generate logarithmically spaced frequency array
 *
 * @param fMin Minimum frequency in Hz
 * @param fMax Maximum frequency in Hz
 * @param numPoints Number of points
 * @returns Array of frequencies
 */
export const generateLogFrequencies = (
  fMin: number,
  fMax: number,
  numPoints: number
): number[] => {
  const logMin = Math.log10(fMin)
  const logMax = Math.log10(fMax)
  const step = (logMax - logMin) / (numPoints - 1)

  const frequencies: number[] = []
  for (let i = 0; i < numPoints; i++) {
    frequencies.push(Math.pow(10, logMin + i * step))
  }
  return frequencies
}

/**
 * Compute complete system impedance
 * Coil impedance with load in parallel
 *
 * @param coilZ Coil impedance
 * @param loadZ Load impedance
 * @returns System impedance
 */
export const computeSystemImpedance = (coilZ: Complex, loadZ: Complex): Complex => {
  return parallelImpedance(coilZ, loadZ)
}

/**
 * Compute frequency response as voltage transfer function
 * Treats coil as voltage source with impedance, driving the load
 *
 * V_out / V_in = Z_load / (Z_coil + Z_load)
 *
 * @param coilZ Coil impedance
 * @param loadZ Load impedance
 * @returns Complex transfer function
 */
export const computeTransferFunction = (coilZ: Complex, loadZ: Complex): Complex => {
  const zTotal = addComplex(coilZ, loadZ)
  return divideComplex(loadZ, zTotal)
}

/**
 * Compute impedance vs frequency data
 *
 * @param resistance DC resistance in Ohms
 * @param inductance Inductance in Henry
 * @param capacitance Capacitance in Farads
 * @param frequencies Array of frequencies in Hz
 * @returns Array of impedance points
 */
export const computeImpedanceResponse = (
  resistance: number,
  inductance: number,
  capacitance: number,
  frequencies: number[]
): ImpedancePoint[] => {
  return frequencies.map((frequency) => {
    const z = computeCoilImpedance(resistance, inductance, capacitance, frequency)
    return {
      frequency,
      magnitude: magnitude(z),
      phaseDeg: phaseDeg(z),
    }
  })
}

/**
 * Compute tone control filter effect
 * The tone control forms a low-pass filter: tone pot + tone cap to ground
 * Volume pot and amp input are in parallel as the load
 *
 * @param load Load parameters
 * @param frequency Frequency in Hz
 * @returns Filter magnitude (0-1)
 */
const computeToneFilterEffect = (load: LoadParams, frequency: number): number => {
  const omega = 2 * Math.PI * frequency

  // Tone control: pot + cap in series, acting as variable low-pass
  // tonePosition = 0 → tone knob at 10 (bright, cap bypassed)
  // tonePosition = 1 → tone knob at 0 (dark, cap fully engaged)
  const toneEngagement = load.tonePosition

  if (toneEngagement < 0.01) {
    // Tone fully bright - no filtering
    return 1.0
  }

  // Effective tone pot resistance (varies with position)
  const toneResistance = load.tonePot * (1 - toneEngagement * 0.9)

  // Tone cap impedance
  const capImpedance = 1 / (omega * load.toneCapacitor)

  // Load is volume pot || amp input
  const loadResistance = (load.volumePot * load.ampInputImpedance) /
    (load.volumePot + load.ampInputImpedance)

  // Simple low-pass filter model: output = load / (load + tone_series)
  // But tone cap only shunts when engaged
  const shuntImpedance = capImpedance / toneEngagement
  const effectiveShunt = (shuntImpedance * loadResistance) / (shuntImpedance + loadResistance)

  // Calculate attenuation from the tone filter
  const totalZ = Math.sqrt(effectiveShunt * effectiveShunt + toneResistance * toneResistance)
  const filterMag = effectiveShunt / totalZ

  return Math.max(0.1, Math.min(1.0, filterMag))
}

/**
 * Compute complete system frequency response
 *
 * @param resistance DC resistance in Ohms
 * @param inductance Inductance in Henry
 * @param capacitance Capacitance in Farads
 * @param load Load parameters
 * @param frequencies Array of frequencies in Hz
 * @returns Array of frequency response points
 */
export const computeSystemResponse = (
  resistance: number,
  inductance: number,
  capacitance: number,
  load: LoadParams,
  frequencies: number[]
): FrequencyPoint[] => {
  // Find reference level at 1kHz for normalization
  const refFreq = 1000
  const refCoilZ = computeCoilImpedance(resistance, inductance, capacitance, refFreq)
  const refLoadZ = computeLoadImpedance(load, refFreq)
  const refTransfer = computeTransferFunction(refCoilZ, refLoadZ)
  const refToneFilter = computeToneFilterEffect(load, refFreq)
  const refMagnitude = magnitude(refTransfer) * refToneFilter

  return frequencies.map((frequency) => {
    const coilZ = computeCoilImpedance(resistance, inductance, capacitance, frequency)
    const loadZ = computeLoadImpedance(load, frequency)
    const transfer = computeTransferFunction(coilZ, loadZ)

    // Apply tone control filtering
    const toneFilter = computeToneFilterEffect(load, frequency)
    const mag = magnitude(transfer) * toneFilter
    const normalizedMag = refMagnitude > 0 ? mag / refMagnitude : mag

    return {
      frequency,
      magnitude: normalizedMag,
      magnitudeDb: 20 * Math.log10(normalizedMag || 1e-10),
      phaseDeg: phaseDeg(transfer),
    }
  })
}

/**
 * Calculate loaded resonance frequency
 * Finds the frequency where magnitude peaks
 *
 * @param resistance DC resistance in Ohms
 * @param inductance Inductance in Henry
 * @param capacitance Capacitance in Farads
 * @param load Load parameters
 * @returns Loaded resonance frequency in Hz
 */
export const computeLoadedResonance = (
  resistance: number,
  inductance: number,
  capacitance: number,
  _load: LoadParams
): number => {
  // Search for peak in the typical pickup frequency range
  const frequencies = generateLogFrequencies(100, 50000, 500)
  let maxMagnitude = 0
  let resonanceFreq = 0

  for (const freq of frequencies) {
    const coilZ = computeCoilImpedance(resistance, inductance, capacitance, freq)
    const mag = magnitude(coilZ)

    if (mag > maxMagnitude) {
      maxMagnitude = mag
      resonanceFreq = freq
    }
  }

  return resonanceFreq
}

/**
 * Calculate loaded Q factor
 * Q = f_resonance / bandwidth_3dB
 *
 * @param resistance DC resistance in Ohms
 * @param inductance Inductance in Henry
 * @param capacitance Capacitance in Farads
 * @param load Load parameters
 * @param resonanceFreq Resonance frequency in Hz
 * @returns Loaded Q factor
 */
export const computeLoadedQ = (
  resistance: number,
  inductance: number,
  capacitance: number,
  load: LoadParams,
  resonanceFreq: number
): number => {
  // Get impedance at resonance
  const frequencies = generateLogFrequencies(20, 50000, 1000)
  const response = computeSystemResponse(resistance, inductance, capacitance, load, frequencies)

  // Find the peak
  let peakIdx = 0
  let peakMag = 0
  for (let i = 0; i < response.length; i++) {
    if (response[i].magnitude > peakMag) {
      peakMag = response[i].magnitude
      peakIdx = i
    }
  }

  // Find -3dB points
  const target = peakMag / Math.sqrt(2) // -3dB

  // Search for lower -3dB point
  let lowerFreq = response[0].frequency
  for (let i = peakIdx; i >= 0; i--) {
    if (response[i].magnitude < target) {
      lowerFreq = response[i].frequency
      break
    }
  }

  // Search for upper -3dB point
  let upperFreq = response[response.length - 1].frequency
  for (let i = peakIdx; i < response.length; i++) {
    if (response[i].magnitude < target) {
      upperFreq = response[i].frequency
      break
    }
  }

  const bandwidth = upperFreq - lowerFreq
  if (bandwidth <= 0) return 0

  return resonanceFreq / bandwidth
}

// ============================================================================
// SYSTEM RESPONSE WITH TRANSFORMER
// ============================================================================

/**
 * Compute transformer primary impedance at a given frequency
 *
 * Model: The transformer primary sees:
 * - Magnetizing inductance (Lm) in parallel
 * - Leakage inductance (Llk) in series with reflected load
 * - Interwinding capacitance (Ciw) in parallel with the whole secondary circuit
 *
 * @param transformer Transformer parameters
 * @param loadZ Complex load impedance
 * @param frequency Frequency in Hz
 * @returns Complex impedance seen at transformer primary
 */
export const computeTransformerPrimaryImpedance = (
  transformer: TransformerParams,
  loadZ: Complex,
  frequency: number
): Complex => {
  const omega = 2 * Math.PI * frequency
  const n = transformer.winding.secondaryTurns / transformer.winding.primaryTurns
  const nSquared = n * n

  // Reflected load impedance: Z_load / n²
  const zReflected: Complex = {
    real: loadZ.real / nSquared,
    imag: loadZ.imag / nSquared,
  }

  // Get core material properties
  const materialProps = getCoreMaterialProperties(transformer.core.material)

  // Compute effective permeability and primary inductance
  const effectivePerm = computeEffectivePermeabilityWithGap(
    materialProps.permeability,
    transformer.core.airGap,
    transformer.core.effectiveLength
  )
  const Lm = computePrimaryInductance(
    transformer.winding.primaryTurns,
    transformer.core.effectiveArea,
    transformer.core.effectiveLength,
    effectivePerm
  )

  // Compute parasitics from transformer params and primary inductance
  const parasitics = computeParasitics(transformer, Lm)

  // Secondary resistance reflected to primary: Rs/n²
  const rsReflected = parasitics.secondaryResistance / nSquared

  // Leakage inductance + secondary resistance in series with reflected load
  const zLlk: Complex = { real: 0, imag: omega * parasitics.leakageInductance }
  const zRsReflected: Complex = { real: rsReflected, imag: 0 }
  const zSecondary = addComplex(zLlk, addComplex(zRsReflected, zReflected))

  // Magnetizing inductance
  const zLm: Complex = { real: 0, imag: omega * Lm }

  // Magnetizing inductance in parallel with secondary circuit
  const zMagParallel = parallelImpedance(zLm, zSecondary)

  // Interwinding capacitance in parallel with everything
  const zCiw = computeCapacitorImpedance(parasitics.interwindingCapacitance, frequency)
  const zParallel = parallelImpedance(zMagParallel, zCiw)

  // Primary resistance in series with the whole transformer
  const zRp: Complex = { real: parasitics.primaryResistance, imag: 0 }
  return addComplex(zRp, zParallel)
}

/**
 * Compute complete system frequency response WITH transformer
 *
 * Signal chain: Coil -> Transformer -> Load
 *
 * The coil drives the transformer primary, which sees:
 * - Transformer primary impedance (magnetizing + reflected load)
 * - Output is voltage-divided and then stepped up by turns ratio
 *
 * @param resistance DC resistance in Ohms
 * @param inductance Inductance in Henry
 * @param capacitance Capacitance in Farads
 * @param transformer Transformer parameters
 * @param load Load parameters
 * @param frequencies Array of frequencies in Hz
 * @returns Array of frequency response points
 */
export const computeSystemResponseWithTransformer = (
  resistance: number,
  inductance: number,
  capacitance: number,
  transformer: TransformerParams,
  load: LoadParams,
  frequencies: number[]
): FrequencyPoint[] => {
  const n = transformer.winding.secondaryTurns / transformer.winding.primaryTurns

  // Reference at 1kHz
  const refFreq = 1000
  const refCoilZ = computeCoilImpedance(resistance, inductance, capacitance, refFreq)
  const refLoadZ = computeLoadImpedance(load, refFreq)
  const refTransformerZ = computeTransformerPrimaryImpedance(transformer, refLoadZ, refFreq)
  const refTransfer = computeTransferFunction(refCoilZ, refTransformerZ)
  const refToneFilter = computeToneFilterEffect(load, refFreq)
  const refMagnitude = magnitude(refTransfer) * n * refToneFilter

  return frequencies.map((frequency) => {
    // Coil impedance
    const coilZ = computeCoilImpedance(resistance, inductance, capacitance, frequency)

    // Load impedance (after transformer secondary)
    const loadZ = computeLoadImpedance(load, frequency)

    // Transformer primary impedance (includes reflected load)
    const transformerZ = computeTransformerPrimaryImpedance(transformer, loadZ, frequency)

    // Voltage divider: V_primary / V_coil
    const transfer = computeTransferFunction(coilZ, transformerZ)

    // Apply tone filter effect on secondary side
    const toneFilter = computeToneFilterEffect(load, frequency)

    // Output voltage includes step-up ratio and tone filtering
    const outputMag = magnitude(transfer) * n * toneFilter
    const normalizedMag = refMagnitude > 0 ? outputMag / refMagnitude : outputMag

    return {
      frequency,
      magnitude: normalizedMag,
      magnitudeDb: 20 * Math.log10(normalizedMag || 1e-10),
      phaseDeg: phaseDeg(transfer),
    }
  })
}

/**
 * Compute system response - with or without transformer
 *
 * @param resistance DC resistance in Ohms
 * @param inductance Inductance in Henry
 * @param capacitance Capacitance in Farads
 * @param load Load parameters
 * @param frequencies Array of frequencies in Hz
 * @param transformer Optional transformer parameters
 * @returns Array of frequency response points
 */
export const computeFullSystemResponse = (
  resistance: number,
  inductance: number,
  capacitance: number,
  load: LoadParams,
  frequencies: number[],
  transformer?: TransformerParams
): FrequencyPoint[] => {
  if (transformer?.enabled) {
    return computeSystemResponseWithTransformer(
      resistance,
      inductance,
      capacitance,
      transformer,
      load,
      frequencies
    )
  }
  return computeSystemResponse(resistance, inductance, capacitance, load, frequencies)
}

/**
 * Compute theoretical resonance frequency
 * f₀ = 1 / (2π√LC)
 */
const computeTheoreticalResonance = (inductance: number, capacitance: number): number => {
  if (inductance <= 0 || capacitance <= 0) return 0
  return 1 / (2 * Math.PI * Math.sqrt(inductance * capacitance))
}

/**
 * Compute theoretical Q factor
 * Q = (1/R) × √(L/C) for series RLC
 */
const computeTheoreticalQ = (resistance: number, inductance: number, capacitance: number): number => {
  if (resistance <= 0 || inductance <= 0 || capacitance <= 0) return 1
  return (1 / resistance) * Math.sqrt(inductance / capacitance)
}

/**
 * Compute loaded resonance and Q with optional transformer
 * Returns the frequency of peak response and the -3dB bandwidth Q
 *
 * @param resistance DC resistance in Ohms
 * @param inductance Inductance in Henry
 * @param capacitance Capacitance in Farads
 * @param load Load parameters
 * @param transformer Optional transformer parameters
 * @returns Object with loadedResonance and loadedQ
 */
export const computeLoadedResonanceAndQ = (
  resistance: number,
  inductance: number,
  capacitance: number,
  load: LoadParams,
  transformer?: TransformerParams
): { loadedResonance: number; loadedQ: number } => {
  const fMin = 20
  const fMax = 100000  // Extended to 100kHz for better high-frequency peak detection
  const frequencies = generateLogFrequencies(fMin, fMax, 500)
  const response = computeFullSystemResponse(
    resistance,
    inductance,
    capacitance,
    load,
    frequencies,
    transformer
  )

  // Find peak magnitude and index
  let peakIdx = 0
  let peakMag = response[0].magnitude

  for (let i = 1; i < response.length; i++) {
    if (response[i].magnitude > peakMag) {
      peakMag = response[i].magnitude
      peakIdx = i
    }
  }

  // Check if peak is at the very edge (last 3% of range) - indicates resonance above our range
  const upperEdgeThreshold = Math.floor(frequencies.length * 0.97)
  const peakAtUpperEdge = peakIdx >= upperEdgeThreshold

  // Check if response is essentially flat (no real peak)
  const minMag = Math.min(...response.map(r => r.magnitude))
  const peakToMinRatio = peakMag / (minMag || 1e-10)
  const isFlat = peakToMinRatio < 1.5  // Less than 3.5dB variation = flat

  // For flat response or peak at edge, use theoretical values
  if (isFlat || peakAtUpperEdge) {
    // Calculate total capacitance including cable
    const cableCapacitance = load.cableCapacitancePerMeter * load.cableLength
    const totalCapacitance = capacitance + cableCapacitance

    // Calculate loaded resistance (pots in parallel)
    const loadResistance = (load.volumePot * load.ampInputImpedance) /
      (load.volumePot + load.ampInputImpedance)

    // If transformer, adjust for reflected impedance
    let effectiveL = inductance
    let effectiveC = totalCapacitance
    let effectiveR = resistance

    if (transformer?.enabled) {
      const n = transformer.winding.secondaryTurns / transformer.winding.primaryTurns
      // With step-up transformer, load capacitance reflects as C × n²
      effectiveC = capacitance + cableCapacitance * n * n
      // Load resistance reflects as R / n²
      const reflectedLoadR = loadResistance / (n * n)
      effectiveR = resistance + reflectedLoadR
    }

    const theoreticalF0 = computeTheoreticalResonance(effectiveL, effectiveC)
    const theoreticalQ = computeTheoreticalQ(effectiveR, effectiveL, effectiveC)

    // For very high resonances, Q is typically low due to losses
    // Clamp to reasonable range
    const loadedQ = Math.max(0.5, Math.min(theoreticalQ, 10))

    return { loadedResonance: theoreticalF0, loadedQ }
  }

  const loadedResonance = response[peakIdx].frequency

  // Find -3dB points for Q calculation
  const target = peakMag / Math.sqrt(2)

  // Track whether we actually found -3dB points vs hitting boundaries
  let lowerFreq = response[0].frequency
  let foundLower = false
  for (let i = peakIdx; i >= 0; i--) {
    if (response[i].magnitude < target) {
      // Interpolate for more accurate frequency
      if (i < peakIdx) {
        const t = (target - response[i].magnitude) /
          (response[i + 1].magnitude - response[i].magnitude)
        lowerFreq = response[i].frequency + t * (response[i + 1].frequency - response[i].frequency)
      } else {
        lowerFreq = response[i].frequency
      }
      foundLower = true
      break
    }
  }

  let upperFreq = response[response.length - 1].frequency
  let foundUpper = false
  for (let i = peakIdx; i < response.length; i++) {
    if (response[i].magnitude < target) {
      // Interpolate for more accurate frequency
      if (i > peakIdx) {
        const t = (target - response[i - 1].magnitude) /
          (response[i].magnitude - response[i - 1].magnitude)
        upperFreq = response[i - 1].frequency + t * (response[i].frequency - response[i - 1].frequency)
      } else {
        upperFreq = response[i].frequency
      }
      foundUpper = true
      break
    }
  }

  // Calculate Q based on what we found
  let loadedQ: number

  if (foundLower && foundUpper) {
    // Both -3dB points found - normal calculation
    const bandwidth = upperFreq - lowerFreq
    loadedQ = bandwidth > 0 ? loadedResonance / bandwidth : 1
  } else if (foundLower && !foundUpper) {
    // Only lower found - estimate symmetric bandwidth
    const halfBandwidth = loadedResonance - lowerFreq
    loadedQ = halfBandwidth > 0 ? loadedResonance / (halfBandwidth * 2) : 1
  } else if (!foundLower && foundUpper) {
    // Only upper found - estimate symmetric bandwidth
    const halfBandwidth = upperFreq - loadedResonance
    loadedQ = halfBandwidth > 0 ? loadedResonance / (halfBandwidth * 2) : 1
  } else {
    // Neither found - use theoretical Q
    loadedQ = computeTheoreticalQ(resistance, inductance, capacitance)
  }

  // Clamp to reasonable range for loaded pickups (0.5 - 10)
  // Q > 10 is rare for loaded pickups
  // Q < 0.5 indicates essentially flat response
  loadedQ = Math.max(0.5, Math.min(loadedQ, 10))

  return { loadedResonance, loadedQ }
}

// ============================================================================
// IMPULSE RESPONSE (TRANSIENT ANALYSIS)
// ============================================================================

export interface ImpulsePoint {
  time: number        // Time in milliseconds
  amplitude: number   // Normalized amplitude (-1 to 1)
}

/**
 * Compute impulse response of the pickup system
 *
 * For a second-order bandpass system (RLC), the impulse response is:
 * h(t) = A × e^(-πf₀t/Q) × sin(2πf₀t)
 *
 * This shows how the pickup "rings" after a sudden string displacement.
 *
 * @param resonanceFreq Loaded resonance frequency in Hz
 * @param q Loaded Q factor
 * @param duration Duration in milliseconds (default 10ms)
 * @param numPoints Number of sample points (default 500)
 * @returns Array of time-domain impulse response points
 */
export const computeImpulseResponse = (
  resonanceFreq: number,
  q: number,
  duration: number = 10,
  numPoints: number = 500
): ImpulsePoint[] => {
  const points: ImpulsePoint[] = []

  // Convert duration to seconds
  const durationSec = duration / 1000
  const dt = durationSec / numPoints

  // Decay time constant: τ = Q / (π × f₀)
  const tau = q / (Math.PI * resonanceFreq)

  // Angular frequency
  const omega = 2 * Math.PI * resonanceFreq

  // Find peak for normalization
  let maxAmp = 0
  const rawPoints: { time: number; amp: number }[] = []

  for (let i = 0; i < numPoints; i++) {
    const t = i * dt

    // Damped sinusoid: h(t) = e^(-t/τ) × sin(ωt)
    const envelope = Math.exp(-t / tau)
    const oscillation = Math.sin(omega * t)
    const amp = envelope * oscillation

    rawPoints.push({ time: t * 1000, amp }) // Convert to ms
    maxAmp = Math.max(maxAmp, Math.abs(amp))
  }

  // Normalize to -1 to 1 range
  for (const p of rawPoints) {
    points.push({
      time: p.time,
      amplitude: maxAmp > 0 ? p.amp / maxAmp : 0,
    })
  }

  return points
}

/**
 * Compute step response of the pickup system
 *
 * Step response shows how the pickup responds to a sustained string displacement.
 * It's the integral of the impulse response.
 *
 * @param resonanceFreq Loaded resonance frequency in Hz
 * @param q Loaded Q factor
 * @param duration Duration in milliseconds (default 10ms)
 * @param numPoints Number of sample points (default 500)
 * @returns Array of time-domain step response points
 */
export const computeStepResponse = (
  resonanceFreq: number,
  q: number,
  duration: number = 10,
  numPoints: number = 500
): ImpulsePoint[] => {
  const points: ImpulsePoint[] = []

  const durationSec = duration / 1000
  const dt = durationSec / numPoints

  const tau = q / (Math.PI * resonanceFreq)
  const omega = 2 * Math.PI * resonanceFreq

  // For underdamped system, step response oscillates around final value
  // s(t) = 1 - e^(-t/τ) × (cos(ωt) + (1/(ωτ)) × sin(ωt))

  let maxDeviation = 0
  const rawPoints: { time: number; amp: number }[] = []

  for (let i = 0; i < numPoints; i++) {
    const t = i * dt

    const envelope = Math.exp(-t / tau)
    const damping = 1 / (omega * tau)
    const oscillation = Math.cos(omega * t) + damping * Math.sin(omega * t)
    const amp = 1 - envelope * oscillation

    rawPoints.push({ time: t * 1000, amp })
    maxDeviation = Math.max(maxDeviation, Math.abs(amp))
  }

  // Normalize
  for (const p of rawPoints) {
    points.push({
      time: p.time,
      amplitude: maxDeviation > 0 ? p.amp / maxDeviation : 0,
    })
  }

  return points
}

/**
 * Calculate transient characteristics
 *
 * @param resonanceFreq Loaded resonance frequency in Hz
 * @param q Loaded Q factor
 * @returns Transient timing characteristics
 */
export const computeTransientCharacteristics = (
  resonanceFreq: number,
  q: number
): {
  decayTime: number      // Time to decay to 10% (ms)
  ringPeriod: number     // Period of oscillation (ms)
  ringCycles: number     // Number of visible ring cycles
  attackSpeed: string    // Qualitative attack description
} => {
  // Decay time constant
  const tau = q / (Math.PI * resonanceFreq)

  // Time to decay to 10% (-20dB): t = τ × ln(10) ≈ 2.3τ
  const decayTime = tau * Math.log(10) * 1000 // in ms

  // Ring period
  const ringPeriod = (1 / resonanceFreq) * 1000 // in ms

  // Number of visible ring cycles before decay to 10%
  const ringCycles = decayTime / ringPeriod

  // Qualitative attack speed
  let attackSpeed: string
  if (q < 1.5) {
    attackSpeed = 'Very soft (overdamped)'
  } else if (q < 2.5) {
    attackSpeed = 'Soft (damped)'
  } else if (q < 4) {
    attackSpeed = 'Balanced'
  } else if (q < 6) {
    attackSpeed = 'Snappy'
  } else {
    attackSpeed = 'Glassy (ringing)'
  }

  return {
    decayTime,
    ringPeriod,
    ringCycles,
    attackSpeed,
  }
}
