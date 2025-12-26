/**
 * Complex Number Operations
 *
 * Pure functions for complex arithmetic used in impedance calculations.
 */

import type { Complex } from '@/domain/types'

/**
 * Create a complex number
 */
export const complex = (real: number, imag: number): Complex => ({ real, imag })

/**
 * Add two complex numbers
 */
export const addComplex = (a: Complex, b: Complex): Complex => ({
  real: a.real + b.real,
  imag: a.imag + b.imag,
})

/**
 * Multiply two complex numbers
 */
export const multiplyComplex = (a: Complex, b: Complex): Complex => ({
  real: a.real * b.real - a.imag * b.imag,
  imag: a.real * b.imag + a.imag * b.real,
})

/**
 * Divide two complex numbers
 */
export const divideComplex = (a: Complex, b: Complex): Complex => {
  const denom = b.real * b.real + b.imag * b.imag
  if (denom === 0) {
    return { real: Infinity, imag: 0 }
  }
  return {
    real: (a.real * b.real + a.imag * b.imag) / denom,
    imag: (a.imag * b.real - a.real * b.imag) / denom,
  }
}

/**
 * Calculate magnitude of complex number
 */
export const magnitude = (z: Complex): number => {
  return Math.sqrt(z.real * z.real + z.imag * z.imag)
}

/**
 * Calculate phase of complex number in radians
 */
export const phase = (z: Complex): number => {
  return Math.atan2(z.imag, z.real)
}

/**
 * Calculate phase in degrees
 */
export const phaseDeg = (z: Complex): number => {
  return phase(z) * (180 / Math.PI)
}

/**
 * Calculate reciprocal of complex number (1/z)
 */
export const reciprocal = (z: Complex): Complex => {
  const denom = z.real * z.real + z.imag * z.imag
  if (denom === 0) {
    return { real: Infinity, imag: 0 }
  }
  return {
    real: z.real / denom,
    imag: -z.imag / denom,
  }
}

/**
 * Calculate parallel combination of two impedances
 * Z_parallel = (Z1 × Z2) / (Z1 + Z2)
 */
export const parallelImpedance = (z1: Complex, z2: Complex): Complex => {
  const sum = addComplex(z1, z2)
  const product = multiplyComplex(z1, z2)
  return divideComplex(product, sum)
}
