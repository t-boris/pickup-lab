/**
 * Basic Transformer Calculations
 *
 * Turns ratio, voltage ratio, and reflected load calculations.
 */

import type { Complex, LoadParams } from '@/domain/types'
import { magnitude } from '../complex'
import { computeLoadImpedance } from '../impedance'

/**
 * Calculate turns ratio
 * n = Ns / Np
 *
 * @param primaryTurns Number of primary turns
 * @param secondaryTurns Number of secondary turns
 * @returns Turns ratio
 */
export const computeTurnsRatio = (primaryTurns: number, secondaryTurns: number): number => {
  if (primaryTurns <= 0) return 0
  return secondaryTurns / primaryTurns
}

/**
 * Calculate voltage ratio (same as turns ratio for ideal transformer)
 *
 * @param turnsRatio Turns ratio
 * @returns Voltage ratio Vs/Vp
 */
export const computeVoltageRatio = (turnsRatio: number): number => {
  return turnsRatio
}

/**
 * Calculate reflected load impedance to primary
 * Z_ref = (Np/Ns)² × Z_load = Z_load / n²
 *
 * @param loadImpedance Load impedance (complex)
 * @param turnsRatio Turns ratio (Ns/Np)
 * @returns Reflected load impedance
 */
export const computeReflectedLoad = (
  loadImpedance: Complex,
  turnsRatio: number
): Complex => {
  if (turnsRatio === 0) {
    return { real: Infinity, imag: 0 }
  }
  const nSquared = turnsRatio * turnsRatio
  return {
    real: loadImpedance.real / nSquared,
    imag: loadImpedance.imag / nSquared,
  }
}

/**
 * Calculate reflected load at specific frequency (magnitude only)
 *
 * @param load Load parameters
 * @param turnsRatio Turns ratio
 * @param frequency Frequency in Hz
 * @returns Reflected load magnitude in Ohms
 */
export const computeReflectedLoadMagnitude = (
  load: LoadParams,
  turnsRatio: number,
  frequency: number
): number => {
  const loadZ = computeLoadImpedance(load, frequency)
  const reflectedZ = computeReflectedLoad(loadZ, turnsRatio)
  return magnitude(reflectedZ)
}
