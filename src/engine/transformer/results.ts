/**
 * Main Transformer Computation Function
 *
 * Computes all transformer-related results.
 */

import type { TransformerParams, LoadParams, TransformerComputedResults } from '@/domain/types'
import { getCoreMaterialProperties } from '@/lib/calibration'
import { computeTurnsRatio, computeVoltageRatio, computeReflectedLoadMagnitude } from './basics'
import { computePrimaryInductance, computeEffectivePermeabilityWithGap } from './inductance'
import { computePeakFluxDensity, computeSaturationMargin, estimateCoreLoss } from './saturation'
import { computeParasitics } from './parasitics'
import { computeTransformerBandwidth } from './response'

/**
 * Compute all transformer-related results
 *
 * @param transformer Transformer parameters
 * @param load Load parameters
 * @param sourceVoltageRms Typical source voltage RMS (for saturation calc)
 * @param operatingFrequency Operating frequency for saturation calc
 * @returns Complete transformer computation results
 */
export const computeTransformerResults = (
  transformer: TransformerParams,
  load: LoadParams,
  sourceVoltageRms: number = 0.1, // 100mV typical pickup output
  operatingFrequency: number = 1000
): TransformerComputedResults => {
  const turnsRatio = computeTurnsRatio(
    transformer.winding.primaryTurns,
    transformer.winding.secondaryTurns
  )
  const voltageRatio = computeVoltageRatio(turnsRatio)

  // Get material properties
  const materialProps = getCoreMaterialProperties(transformer.core.material)

  // Reflected load at 1kHz
  const reflectedLoad = computeReflectedLoadMagnitude(load, turnsRatio, 1000)

  // Primary inductance with effective permeability (considering air gap)
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

  // Compute parasitics
  const parasitics = computeParasitics(transformer, primaryInductance)

  // Bandwidth
  const bandwidth = computeTransformerBandwidth(transformer, load)

  // Saturation margin
  const peakFlux = computePeakFluxDensity(
    sourceVoltageRms,
    operatingFrequency,
    transformer.winding.primaryTurns,
    transformer.core.effectiveArea
  )
  const saturationMargin = computeSaturationMargin(peakFlux, materialProps.saturationFlux)

  // Core loss estimate
  const coreLossEstimate = estimateCoreLoss(transformer.core.material, operatingFrequency)

  return {
    turnsRatio,
    voltageRatio,
    reflectedLoad,
    primaryInductance,
    effectivePermeability,
    parasitics,
    bandwidth,
    saturationMargin,
    saturationFlux: materialProps.saturationFlux,
    coreLossEstimate,
  }
}
