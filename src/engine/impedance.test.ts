/**
 * Unit Tests for Impedance Calculations
 */

import { describe, it, expect } from 'vitest'
import {
  complex,
  addComplex,
  multiplyComplex,
  divideComplex,
  magnitude,
  phaseDeg,
  computeSeriesRL,
  computeCapacitorImpedance,
  computeCoilImpedance,
  computeLoadImpedance,
  generateLogFrequencies,
  computeSystemResponse,
  computeLoadedResonance,
} from './impedance'
import type { LoadParams } from '@/domain/types'

describe('Impedance Calculations', () => {
  describe('Complex number operations', () => {
    it('should add complex numbers', () => {
      const a = complex(3, 4)
      const b = complex(1, 2)
      const result = addComplex(a, b)
      expect(result.real).toBe(4)
      expect(result.imag).toBe(6)
    })

    it('should multiply complex numbers', () => {
      const a = complex(3, 4)
      const b = complex(1, 2)
      const result = multiplyComplex(a, b)
      // (3+4i)(1+2i) = 3 + 6i + 4i + 8i² = 3 + 10i - 8 = -5 + 10i
      expect(result.real).toBe(-5)
      expect(result.imag).toBe(10)
    })

    it('should divide complex numbers', () => {
      const a = complex(3, 4)
      const b = complex(1, 2)
      const result = divideComplex(a, b)
      // (3+4i)/(1+2i) = (3+4i)(1-2i)/5 = (3-6i+4i+8)/5 = (11-2i)/5
      expect(result.real).toBeCloseTo(2.2, 5)
      expect(result.imag).toBeCloseTo(-.4, 5)
    })

    it('should calculate magnitude', () => {
      const z = complex(3, 4)
      expect(magnitude(z)).toBe(5)
    })

    it('should calculate phase in degrees', () => {
      const z = complex(1, 1)
      expect(phaseDeg(z)).toBeCloseTo(45, 5)
    })
  })

  describe('computeSeriesRL', () => {
    it('should calculate series RL impedance', () => {
      const R = 1000 // Ohms
      const L = 3 // Henry
      const f = 1000 // Hz

      const result = computeSeriesRL(R, L, f)

      expect(result.real).toBe(R)
      // ωL = 2π × 1000 × 3 ≈ 18850
      expect(result.imag).toBeCloseTo(2 * Math.PI * 1000 * 3, 0)
    })
  })

  describe('computeCapacitorImpedance', () => {
    it('should calculate capacitor impedance', () => {
      const C = 100e-12 // 100 pF
      const f = 1000 // Hz

      const result = computeCapacitorImpedance(C, f)

      expect(result.real).toBe(0)
      // -1/ωC = -1/(2π × 1000 × 100e-12) ≈ -1.59 MΩ
      expect(result.imag).toBeCloseTo(-1 / (2 * Math.PI * f * C), 0)
    })

    it('should handle zero frequency', () => {
      const C = 100e-12
      const result = computeCapacitorImpedance(C, 0)
      expect(result.real).toBe(Infinity)
    })
  })

  describe('computeCoilImpedance', () => {
    it('should show resonance behavior', () => {
      const R = 6000 // Ohms
      const L = 3 // Henry
      const C = 100e-12 // 100 pF

      // Calculate resonant frequency
      const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C)) // ~9.2 kHz

      // Impedance should peak near resonance
      const zLow = magnitude(computeCoilImpedance(R, L, C, 100))
      const zRes = magnitude(computeCoilImpedance(R, L, C, f0))
      const zHigh = magnitude(computeCoilImpedance(R, L, C, 50000))

      expect(zRes).toBeGreaterThan(zLow)
      expect(zRes).toBeGreaterThan(zHigh)
    })

    it('should approach R at low frequency', () => {
      const R = 6000
      const L = 3
      const C = 100e-12

      const zLow = computeCoilImpedance(R, L, C, 10)

      // At very low frequency, Z ≈ R
      expect(magnitude(zLow)).toBeCloseTo(R, -2) // Within order of magnitude
    })
  })

  describe('computeLoadImpedance', () => {
    it('should calculate load impedance', () => {
      const load: LoadParams = {
        volumePot: 250000,
        volumePosition: 1,
        tonePot: 250000,
        toneCapacitor: 22e-9,
        tonePosition: 0,
        cableCapacitancePerMeter: 100e-12,
        cableLength: 5,
        ampInputImpedance: 1e6,
      }

      const result = computeLoadImpedance(load, 1000)

      // Effective R = 250k || 1M = 200k
      // Cable C = 500pF, at 1kHz Z_C ≈ 318k
      // Combined should be < 200k (parallel with capacitor)
      expect(magnitude(result)).toBeLessThan(250000)
      expect(magnitude(result)).toBeGreaterThan(100000)
    })
  })

  describe('generateLogFrequencies', () => {
    it('should generate logarithmically spaced frequencies', () => {
      const freqs = generateLogFrequencies(20, 20000, 4)

      expect(freqs).toHaveLength(4)
      expect(freqs[0]).toBeCloseTo(20, 0)
      expect(freqs[3]).toBeCloseTo(20000, 0)

      // Check logarithmic spacing
      const ratio1 = freqs[1] / freqs[0]
      const ratio2 = freqs[2] / freqs[1]
      expect(ratio1).toBeCloseTo(ratio2, 1)
    })
  })

  describe('computeSystemResponse', () => {
    it('should compute frequency response', () => {
      const R = 6000
      const L = 3
      const C = 100e-12
      const load: LoadParams = {
        volumePot: 250000,
        volumePosition: 1,
        tonePot: 250000,
        toneCapacitor: 22e-9,
        tonePosition: 0,
        cableCapacitancePerMeter: 100e-12,
        cableLength: 5,
        ampInputImpedance: 1e6,
      }

      const freqs = generateLogFrequencies(20, 20000, 100)
      const response = computeSystemResponse(R, L, C, load, freqs)

      expect(response).toHaveLength(100)

      // Should have magnitude and phase
      expect(response[0].magnitude).toBeGreaterThan(0)
      expect(typeof response[0].magnitudeDb).toBe('number')
      expect(typeof response[0].phaseDeg).toBe('number')

      // Should show resonance peak
      let maxMag = 0
      let peakIdx = 0
      for (let i = 0; i < response.length; i++) {
        if (response[i].magnitude > maxMag) {
          maxMag = response[i].magnitude
          peakIdx = i
        }
      }

      // Peak should be somewhere in the middle, not at edges
      expect(peakIdx).toBeGreaterThan(10)
      expect(peakIdx).toBeLessThan(90)
    })
  })

  describe('computeLoadedResonance', () => {
    it('should find loaded resonance frequency', () => {
      const R = 6000
      const L = 3
      const C = 100e-12

      const load: LoadParams = {
        volumePot: 250000,
        volumePosition: 1,
        tonePot: 250000,
        toneCapacitor: 22e-9,
        tonePosition: 0,
        cableCapacitancePerMeter: 100e-12,
        cableLength: 5,
        ampInputImpedance: 1e6,
      }

      const f0 = computeLoadedResonance(R, L, C, load)

      // Unloaded f0 ≈ 9.2 kHz
      // With cable capacitance, should be lower
      expect(f0).toBeGreaterThan(3000)
      expect(f0).toBeLessThan(10000)
    })
  })
})
