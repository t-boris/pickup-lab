/**
 * Series/Parallel Wiring Module
 *
 * Pure functions for calculating:
 * - Series coil combination
 * - Parallel coil combination
 * - Phase effects
 */

import type { CoilComputedResults, WiringConfig, PhaseConfig } from '@/domain/types'
import { getKMutual } from '@/lib/calibration'

// ============================================================================
// MUTUAL INDUCTANCE
// ============================================================================

/**
 * Calculate mutual inductance between two coils
 * M = k × √(L₁ × L₂)
 *
 * @param L1 Inductance of first coil in Henry
 * @param L2 Inductance of second coil in Henry
 * @param couplingCoefficient Coupling coefficient k (0 to 1)
 * @returns Mutual inductance in Henry
 */
export const computeMutualInductance = (
  L1: number,
  L2: number,
  couplingCoefficient: number
): number => {
  return couplingCoefficient * Math.sqrt(L1 * L2)
}

// ============================================================================
// SERIES COIL COMBINATION
// ============================================================================

/**
 * Calculate series combination of two identical coils
 *
 * R_series = R₁ + R₂
 * L_series = L₁ + L₂ + 2M (in-phase) or L₁ + L₂ - 2M (out-of-phase)
 * C_series = (C₁ × C₂) / (C₁ + C₂) for capacitors in series effect
 *
 * @param coil1 First coil computed results
 * @param coil2 Second coil computed results
 * @param mutualCoupling Mutual coupling coefficient key or value
 * @param phase Phase configuration
 * @returns Combined coil results
 */
export const computeSeriesCoils = (
  coil1: CoilComputedResults,
  coil2: CoilComputedResults,
  mutualCoupling: keyof typeof import('@/lib/calibration').K_MUTUAL | number = 'humbucker_side',
  phase: PhaseConfig = 'in_phase'
): CoilComputedResults => {
  // Get coupling coefficient
  const k = typeof mutualCoupling === 'number'
    ? mutualCoupling
    : getKMutual(mutualCoupling)

  // Calculate mutual inductance
  const M = computeMutualInductance(coil1.inductance, coil2.inductance, k)

  // Series resistance (always additive)
  const dcResistance = coil1.dcResistance + coil2.dcResistance

  // Series inductance (depends on phase)
  let inductance: number
  if (phase === 'in_phase') {
    // Fluxes add: L = L₁ + L₂ + 2M
    inductance = coil1.inductance + coil2.inductance + 2 * M
  } else {
    // Fluxes subtract: L = L₁ + L₂ - 2M
    inductance = coil1.inductance + coil2.inductance - 2 * M
    // Ensure non-negative
    inductance = Math.max(inductance, 0)
  }

  // Capacitance: for pickups, it's approximately additive
  // (distributed capacitance of both coils contribute)
  const capacitance = coil1.capacitance + coil2.capacitance

  // Recalculate derived values
  const resonantFrequency = inductance > 0 && capacitance > 0
    ? 1 / (2 * Math.PI * Math.sqrt(inductance * capacitance))
    : 0

  const qualityFactor = dcResistance > 0 && resonantFrequency > 0
    ? (2 * Math.PI * resonantFrequency * inductance) / dcResistance
    : 0

  // Wire length and volume are additive
  const totalWireLength = coil1.totalWireLength + coil2.totalWireLength
  const coilVolume = coil1.coilVolume + coil2.coilVolume

  // Mean turn length: average of both
  const meanTurnLength = (coil1.meanTurnLength + coil2.meanTurnLength) / 2

  // Max turns: not directly additive (depends on geometry)
  const maxTurns = Math.min(coil1.maxTurns, coil2.maxTurns)

  // Computed outer radius: use max of both coils
  const computedOuterRadius = Math.max(coil1.computedOuterRadius, coil2.computedOuterRadius)

  return {
    meanTurnLength,
    totalWireLength,
    coilVolume,
    dcResistance,
    inductance,
    capacitance,
    resonantFrequency,
    qualityFactor,
    maxTurns,
    computedOuterRadius,
  }
}

// ============================================================================
// PARALLEL COIL COMBINATION
// ============================================================================

/**
 * Calculate parallel combination of two coils
 *
 * R_parallel = (R₁ × R₂) / (R₁ + R₂)
 * L_parallel: complex calculation considering mutual inductance
 * C_parallel = C₁ + C₂
 *
 * @param coil1 First coil computed results
 * @param coil2 Second coil computed results
 * @param mutualCoupling Mutual coupling coefficient key or value
 * @param phase Phase configuration
 * @returns Combined coil results
 */
export const computeParallelCoils = (
  coil1: CoilComputedResults,
  coil2: CoilComputedResults,
  mutualCoupling: keyof typeof import('@/lib/calibration').K_MUTUAL | number = 'humbucker_side',
  phase: PhaseConfig = 'in_phase'
): CoilComputedResults => {
  // Get coupling coefficient
  const k = typeof mutualCoupling === 'number'
    ? mutualCoupling
    : getKMutual(mutualCoupling)

  // Calculate mutual inductance
  const M = computeMutualInductance(coil1.inductance, coil2.inductance, k)

  // Parallel resistance
  const dcResistance = (coil1.dcResistance * coil2.dcResistance) /
    (coil1.dcResistance + coil2.dcResistance)

  // Parallel inductance with mutual coupling
  // For two inductors in parallel with mutual inductance:
  // L_parallel = (L₁L₂ - M²) / (L₁ + L₂ - 2M) for in-phase
  // L_parallel = (L₁L₂ - M²) / (L₁ + L₂ + 2M) for out-of-phase
  const L1 = coil1.inductance
  const L2 = coil2.inductance
  const numerator = L1 * L2 - M * M

  let denominator: number
  if (phase === 'in_phase') {
    denominator = L1 + L2 - 2 * M
  } else {
    denominator = L1 + L2 + 2 * M
  }

  const inductance = denominator > 0 ? numerator / denominator : 0

  // Capacitance: additive in parallel
  const capacitance = coil1.capacitance + coil2.capacitance

  // Recalculate derived values
  const resonantFrequency = inductance > 0 && capacitance > 0
    ? 1 / (2 * Math.PI * Math.sqrt(inductance * capacitance))
    : 0

  const qualityFactor = dcResistance > 0 && resonantFrequency > 0
    ? (2 * Math.PI * resonantFrequency * inductance) / dcResistance
    : 0

  // Wire length and volume: same as combined
  const totalWireLength = coil1.totalWireLength + coil2.totalWireLength
  const coilVolume = coil1.coilVolume + coil2.coilVolume
  const meanTurnLength = (coil1.meanTurnLength + coil2.meanTurnLength) / 2
  const maxTurns = Math.min(coil1.maxTurns, coil2.maxTurns)

  // Computed outer radius: use max of both coils
  const computedOuterRadius = Math.max(coil1.computedOuterRadius, coil2.computedOuterRadius)

  return {
    meanTurnLength,
    totalWireLength,
    coilVolume,
    dcResistance,
    inductance,
    capacitance,
    resonantFrequency,
    qualityFactor,
    maxTurns,
    computedOuterRadius,
  }
}

// ============================================================================
// COMBINED COIL CALCULATION
// ============================================================================

/**
 * Calculate combined coil based on wiring configuration
 *
 * @param coil1 First coil computed results
 * @param coil2 Second coil computed results (optional for single)
 * @param wiringConfig Wiring configuration
 * @param phase Phase configuration
 * @param mutualCoupling Mutual coupling coefficient
 * @returns Combined coil results
 */
export const computeCombinedCoil = (
  coil1: CoilComputedResults,
  coil2: CoilComputedResults | null,
  wiringConfig: WiringConfig,
  phase: PhaseConfig = 'in_phase',
  mutualCoupling: keyof typeof import('@/lib/calibration').K_MUTUAL | number = 'humbucker_side'
): CoilComputedResults => {
  // Single coil: return as-is
  if (wiringConfig === 'single' || coil2 === null) {
    return coil1
  }

  // Series combination
  if (wiringConfig === 'series') {
    return computeSeriesCoils(coil1, coil2, mutualCoupling, phase)
  }

  // Parallel combination
  if (wiringConfig === 'parallel') {
    return computeParallelCoils(coil1, coil2, mutualCoupling, phase)
  }

  return coil1
}

// ============================================================================
// OUTPUT EFFECT OF PHASE
// ============================================================================

/**
 * Calculate effective output multiplier based on wiring and phase
 *
 * In-phase series: outputs add (×2 for identical coils)
 * Out-of-phase series: outputs partially cancel
 * Parallel: current capability increases
 *
 * @param wiringConfig Wiring configuration
 * @param phase Phase configuration
 * @returns Output multiplier (relative to single coil)
 */
export const computeOutputMultiplier = (
  wiringConfig: WiringConfig,
  phase: PhaseConfig
): number => {
  if (wiringConfig === 'single') {
    return 1.0
  }

  if (wiringConfig === 'series') {
    if (phase === 'in_phase') {
      return 2.0 // Voltages add
    } else {
      return 0.3 // Partial cancellation, "quacky" tone
    }
  }

  if (wiringConfig === 'parallel') {
    if (phase === 'in_phase') {
      return 1.0 // Same voltage, double current capability
    } else {
      return 0.5 // Partial cancellation
    }
  }

  return 1.0
}
