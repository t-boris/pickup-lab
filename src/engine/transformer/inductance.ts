/**
 * Primary Inductance Calculations
 *
 * Inductance and effective permeability with air gap.
 */

import { mmToM, mm2ToM2 } from '@/domain/units'
import { PHYSICS } from '@/lib/calibration'

/**
 * Calculate primary winding inductance
 * L_p = μ₀ × μ_eff × Np² × Ae / le
 *
 * @param primaryTurns Number of primary turns
 * @param effectiveArea Effective core area in mm²
 * @param effectiveLength Effective magnetic path length in mm
 * @param effectivePermeability Effective relative permeability
 * @returns Primary inductance in Henry
 */
export const computePrimaryInductance = (
  primaryTurns: number,
  effectiveArea: number,
  effectiveLength: number,
  effectivePermeability: number
): number => {
  const Ae = mm2ToM2(effectiveArea)
  const le = mmToM(effectiveLength)

  return PHYSICS.MU_0 * effectivePermeability * primaryTurns * primaryTurns * Ae / le
}

/**
 * Calculate magnetizing inductance considering air gap
 *
 * The effective permeability with gap:
 * μ_eff = μ_core / (1 + (μ_core × lg / le))
 *
 * @param corePermeability Core material permeability
 * @param airGap Air gap length in mm
 * @param effectiveLength Effective magnetic path length in mm
 * @returns Effective permeability with gap
 */
export const computeEffectivePermeabilityWithGap = (
  corePermeability: number,
  airGap: number,
  effectiveLength: number
): number => {
  if (airGap <= 0) return corePermeability

  const gapRatio = airGap / effectiveLength
  return corePermeability / (1 + corePermeability * gapRatio)
}
