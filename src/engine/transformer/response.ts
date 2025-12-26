/**
 * Transformer Response Calculations
 *
 * Impedance model and frequency response with parasitics.
 */

import type { Complex, TransformerParams, LoadParams, FrequencyPoint } from '@/domain/types'
import { getCoreMaterialProperties } from '@/lib/calibration'
import {
  addComplex,
  divideComplex,
  magnitude,
  phaseDeg,
  parallelImpedance,
} from '../complex'
import { computeCapacitorImpedance, generateLogFrequencies, computeLoadImpedance } from '../impedance'
import { computeTurnsRatio, computeReflectedLoad } from './basics'
import { computePrimaryInductance, computeEffectivePermeabilityWithGap } from './inductance'
import { computeParasitics } from './parasitics'

/**
 * Calculate transformer impedance model
 *
 * Model includes:
 * - Primary winding resistance (Rp) in series
 * - Leakage inductance (Llk) in series
 * - Magnetizing inductance (Lm) in parallel
 * - Interwinding capacitance (Ciw) in parallel
 * - Secondary resistance reflected to primary (Rs/n²) in series with load
 *
 * @param primaryInductance Primary/magnetizing inductance in H
 * @param leakageInductance Leakage inductance in H
 * @param interwindingCapacitance Interwinding capacitance in F
 * @param primaryResistance Primary winding DC resistance in Ohms
 * @param frequency Frequency in Hz
 * @returns Transformer impedance as seen from primary
 */
export const computeTransformerImpedance = (
  primaryInductance: number,
  leakageInductance: number,
  interwindingCapacitance: number,
  primaryResistance: number,
  frequency: number
): Complex => {
  const omega = 2 * Math.PI * frequency

  // Primary resistance (series)
  const zRp: Complex = { real: primaryResistance, imag: 0 }

  // Magnetizing inductance impedance (parallel)
  const zLm: Complex = { real: 0, imag: omega * primaryInductance }

  // Leakage inductance impedance (series)
  const zLlk: Complex = { real: 0, imag: omega * leakageInductance }

  // Interwinding capacitance impedance (parallel)
  const zCiw = computeCapacitorImpedance(interwindingCapacitance, frequency)

  // Combine: Lm || Ciw, then series with Llk, then series with Rp
  const zParallel = parallelImpedance(zLm, zCiw)
  const zWithLeakage = addComplex(zLlk, zParallel)
  return addComplex(zRp, zWithLeakage)
}

/**
 * Compute transformer frequency response
 *
 * @param transformer Transformer parameters
 * @param load Load parameters
 * @param frequencies Array of frequencies
 * @returns Array of frequency response points
 */
export const computeTransformerResponse = (
  transformer: TransformerParams,
  load: LoadParams,
  frequencies: number[]
): FrequencyPoint[] => {
  const turnsRatio = computeTurnsRatio(
    transformer.winding.primaryTurns,
    transformer.winding.secondaryTurns
  )

  // Get material properties
  const materialProps = getCoreMaterialProperties(transformer.core.material)

  // Calculate primary inductance with effective permeability
  const effectivePermeability = computeEffectivePermeabilityWithGap(
    materialProps.permeability,
    transformer.core.airGap,
    transformer.core.effectiveLength
  )

  const primaryInductance = computePrimaryInductance(
    transformer.winding.primaryTurns,
    transformer.core.effectiveArea,
    transformer.core.effectiveLength,
    effectivePermeability
  )

  // Compute parasitics (now includes winding resistances)
  const parasitics = computeParasitics(transformer, primaryInductance)

  // Secondary resistance reflected to primary: Rs_reflected = Rs / n²
  const secondaryResistanceReflected = parasitics.secondaryResistance / (turnsRatio * turnsRatio)

  // Reference at 1kHz
  const refFreq = 1000
  const refLoadZ = computeLoadImpedance(load, refFreq)
  // Add reflected secondary resistance to load
  const refReflectedZ = computeReflectedLoad(refLoadZ, turnsRatio)
  const refReflectedWithRs = addComplex(refReflectedZ, { real: secondaryResistanceReflected, imag: 0 })
  const refTransformerZ = computeTransformerImpedance(
    primaryInductance,
    parasitics.leakageInductance,
    parasitics.interwindingCapacitance,
    parasitics.primaryResistance,
    refFreq
  )
  const refTotalZ = addComplex(refTransformerZ, refReflectedWithRs)
  const refTransfer = divideComplex(refReflectedWithRs, refTotalZ)
  const refMagnitude = magnitude(refTransfer)

  return frequencies.map((frequency) => {
    // Load impedance reflected to primary
    const loadZ = computeLoadImpedance(load, frequency)
    const reflectedZ = computeReflectedLoad(loadZ, turnsRatio)
    // Add reflected secondary resistance
    const reflectedWithRs = addComplex(reflectedZ, { real: secondaryResistanceReflected, imag: 0 })

    // Transformer impedance (includes primary resistance)
    const transformerZ = computeTransformerImpedance(
      primaryInductance,
      parasitics.leakageInductance,
      parasitics.interwindingCapacitance,
      parasitics.primaryResistance,
      frequency
    )

    // Total impedance seen from source
    const totalZ = addComplex(transformerZ, reflectedWithRs)

    // Transfer function (voltage divider)
    const transfer = divideComplex(reflectedWithRs, totalZ)
    const mag = magnitude(transfer)

    // Include turns ratio in output
    const outputMag = mag * turnsRatio
    const normalizedMag = refMagnitude > 0 ? outputMag / (refMagnitude * turnsRatio) : outputMag

    return {
      frequency,
      magnitude: normalizedMag,
      magnitudeDb: 20 * Math.log10(normalizedMag || 1e-10),
      phaseDeg: phaseDeg(transfer),
    }
  })
}

/**
 * Estimate bandwidth (-3dB) of transformer
 *
 * @param transformer Transformer parameters
 * @param load Load parameters
 * @returns Bandwidth in Hz (upper -3dB frequency)
 */
export const computeTransformerBandwidth = (
  transformer: TransformerParams,
  load: LoadParams
): number => {
  const frequencies = generateLogFrequencies(20, 100000, 500)
  const response = computeTransformerResponse(transformer, load, frequencies)

  // Find -3dB point from peak
  let peakMag = 0
  for (const point of response) {
    if (point.magnitude > peakMag) peakMag = point.magnitude
  }

  const target = peakMag * 0.707 // -3dB

  // Find upper cutoff
  let foundPeak = false
  for (const point of response) {
    if (point.magnitude >= peakMag * 0.99) foundPeak = true
    if (foundPeak && point.magnitude < target) {
      return point.frequency
    }
  }

  return frequencies[frequencies.length - 1]
}
