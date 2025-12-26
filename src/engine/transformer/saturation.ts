/**
 * Saturation Margin Calculations
 *
 * Flux density, saturation margin, and core loss estimates.
 */

import type { CoreMaterial } from '@/domain/types'
import { mm2ToM2 } from '@/domain/units'
import { getCoreMaterialProperties } from '@/lib/calibration'

/**
 * Calculate peak flux density for sinusoidal voltage
 * B_peak = V_rms / (4.44 × f × Np × Ae)
 *
 * @param voltageRms RMS voltage across primary
 * @param frequency Frequency in Hz
 * @param primaryTurns Number of primary turns
 * @param effectiveArea Effective core area in mm²
 * @returns Peak flux density in Tesla
 */
export const computePeakFluxDensity = (
  voltageRms: number,
  frequency: number,
  primaryTurns: number,
  effectiveArea: number
): number => {
  if (frequency <= 0 || primaryTurns <= 0 || effectiveArea <= 0) return 0

  const Ae = mm2ToM2(effectiveArea)
  return voltageRms / (4.44 * frequency * primaryTurns * Ae)
}

/**
 * Calculate saturation margin
 * Margin = 1 - (B_peak / B_sat)
 *
 * @param peakFluxDensity Peak flux density in Tesla
 * @param saturationFlux Saturation flux density in Tesla
 * @returns Saturation margin (0 to 1, higher is better)
 */
export const computeSaturationMargin = (
  peakFluxDensity: number,
  saturationFlux: number
): number => {
  if (saturationFlux <= 0) return 0
  const ratio = peakFluxDensity / saturationFlux
  return Math.max(0, 1 - ratio)
}

/**
 * Estimate core loss level (qualitative)
 *
 * Uses material properties to determine loss coefficient
 *
 * @param coreMaterial Core material with variant
 * @param frequency Operating frequency in Hz
 * @returns Loss estimate
 */
export const estimateCoreLoss = (
  coreMaterial: CoreMaterial,
  frequency: number
): 'low' | 'medium' | 'high' => {
  // Get loss coefficient from material properties
  const props = getCoreMaterialProperties(coreMaterial)
  const materialFactor = props.lossCoefficient

  // Higher frequency = higher losses
  const frequencyFactor = Math.log10(frequency / 100) / 3 // Normalized around audio range

  const lossFactor = materialFactor * (1 + frequencyFactor)

  if (lossFactor < 0.4) return 'low'
  if (lossFactor < 0.8) return 'medium'
  return 'high'
}
