/**
 * Unit Tests for Transformer Calculations
 */

import { describe, it, expect } from 'vitest'
import {
  computeTurnsRatio,
  computeVoltageRatio,
  computeReflectedLoad,
  computeReflectedLoadMagnitude,
  computePrimaryInductance,
  computeEffectivePermeabilityWithGap,
  computePeakFluxDensity,
  computeSaturationMargin,
  estimateCoreLoss,
  computeTransformerBandwidth,
  computeTransformerResults,
} from './transformer'
import { complex } from './impedance'
import type { TransformerParams, LoadParams } from '@/domain/types'

describe('Transformer Calculations', () => {
  describe('computeTurnsRatio', () => {
    it('should calculate turns ratio', () => {
      expect(computeTurnsRatio(200, 2000)).toBe(10)
      expect(computeTurnsRatio(100, 100)).toBe(1)
      expect(computeTurnsRatio(1000, 500)).toBe(0.5)
    })

    it('should handle zero primary turns', () => {
      expect(computeTurnsRatio(0, 100)).toBe(0)
    })
  })

  describe('computeVoltageRatio', () => {
    it('should equal turns ratio for ideal transformer', () => {
      const ratio = 10
      expect(computeVoltageRatio(ratio)).toBe(ratio)
    })
  })

  describe('computeReflectedLoad', () => {
    it('should calculate reflected load correctly', () => {
      const loadZ = complex(250000, 0) // 250k resistive
      const turnsRatio = 10 // 1:10 step up

      const reflected = computeReflectedLoad(loadZ, turnsRatio)

      // Z_ref = Z_load / n² = 250k / 100 = 2.5k
      expect(reflected.real).toBeCloseTo(2500, 0)
      expect(reflected.imag).toBeCloseTo(0, 5)
    })

    it('should handle complex load', () => {
      const loadZ = complex(100000, -50000) // Resistive + capacitive
      const turnsRatio = 5

      const reflected = computeReflectedLoad(loadZ, turnsRatio)

      // Both components should be divided by n²=25
      expect(reflected.real).toBeCloseTo(4000, 0)
      expect(reflected.imag).toBeCloseTo(-2000, 0)
    })
  })

  describe('computeReflectedLoadMagnitude', () => {
    it('should calculate reflected load at frequency', () => {
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

      const result = computeReflectedLoadMagnitude(load, 10, 1000)

      // With 1:10 ratio, load should be reflected as ~1/100 of original
      expect(result).toBeLessThan(5000)
      expect(result).toBeGreaterThan(500)
    })
  })

  describe('computePrimaryInductance', () => {
    it('should calculate primary inductance', () => {
      // Np = 200, Ae = 50mm², le = 60mm, μ_eff = 50000
      const result = computePrimaryInductance(200, 50, 60, 50000)

      // L = μ₀ × μ_eff × N² × Ae / le
      // Should be in Henry range for high-μ core
      expect(result).toBeGreaterThan(1)
      expect(result).toBeLessThan(100)
    })

    it('should scale with N²', () => {
      const L1 = computePrimaryInductance(100, 50, 60, 50000)
      const L2 = computePrimaryInductance(200, 50, 60, 50000)

      expect(L2 / L1).toBeCloseTo(4, 1)
    })
  })

  describe('computeEffectivePermeabilityWithGap', () => {
    it('should reduce permeability with air gap', () => {
      const muCore = 50000
      const muWithGap = computeEffectivePermeabilityWithGap(muCore, 0.1, 60)

      expect(muWithGap).toBeLessThan(muCore)
    })

    it('should return core permeability with zero gap', () => {
      const muCore = 50000
      const muNoGap = computeEffectivePermeabilityWithGap(muCore, 0, 60)

      expect(muNoGap).toBe(muCore)
    })
  })

  describe('computePeakFluxDensity', () => {
    it('should calculate peak flux density', () => {
      // V = 0.1V RMS, f = 1000 Hz, Np = 200, Ae = 50mm²
      const result = computePeakFluxDensity(0.1, 1000, 200, 50)

      // B should be very small for low voltage
      expect(result).toBeLessThan(0.01) // << saturation
    })

    it('should increase with voltage', () => {
      const B1 = computePeakFluxDensity(0.1, 1000, 200, 50)
      const B2 = computePeakFluxDensity(1.0, 1000, 200, 50)

      expect(B2).toBeGreaterThan(B1)
    })
  })

  describe('computeSaturationMargin', () => {
    it('should return high margin for low flux', () => {
      const margin = computeSaturationMargin(0.1, 1.2)
      expect(margin).toBeGreaterThan(0.9)
    })

    it('should return low margin near saturation', () => {
      const margin = computeSaturationMargin(1.0, 1.2)
      expect(margin).toBeLessThan(0.2)
    })

    it('should return 0 at or above saturation', () => {
      const margin = computeSaturationMargin(1.5, 1.2)
      expect(margin).toBe(0)
    })
  })

  describe('estimateCoreLoss', () => {
    it('should return low for nanocrystalline', () => {
      expect(estimateCoreLoss({ base: 'nanocrystalline', variant: 'nc_iron' }, 1000)).toBe('low')
    })

    it('should return higher for steel', () => {
      const nanoLoss = estimateCoreLoss({ base: 'nanocrystalline', variant: 'nc_iron' }, 1000)
      const steelLoss = estimateCoreLoss({ base: 'silicon_steel' }, 1000)

      const lossRank = { low: 0, medium: 1, high: 2 }
      expect(lossRank[steelLoss]).toBeGreaterThanOrEqual(lossRank[nanoLoss])
    })
  })

  describe('computeTransformerResults', () => {
    it('should compute complete transformer results', () => {
      const transformer: TransformerParams = {
        enabled: true,
        core: {
          shape: 'toroid_round',
          material: { base: 'nanocrystalline', variant: 'nc_iron' },
          effectiveArea: 50,
          effectiveLength: 60,
          airGap: 0,
        },
        winding: {
          primaryTurns: 200,
          secondaryTurns: 2000,
          primaryConductor: {
            type: 'wire',
            material: 'copper',
            wireAwg: 38,
          },
          secondaryAwg: 42,
          secondaryMaterial: 'copper',
          windingStyle: 'interleaved',
          shielding: false,
        },
      }

      const load: LoadParams = {
        volumePot: 500000,
        volumePosition: 1,
        tonePot: 500000,
        toneCapacitor: 22e-9,
        tonePosition: 0,
        cableCapacitancePerMeter: 100e-12,
        cableLength: 5,
        ampInputImpedance: 1e6,
      }

      const result = computeTransformerResults(transformer, load)

      expect(result.turnsRatio).toBe(10)
      expect(result.voltageRatio).toBe(10)
      expect(result.reflectedLoad).toBeGreaterThan(0)
      expect(result.primaryInductance).toBeGreaterThan(0)
      expect(result.bandwidth).toBeGreaterThan(0)
      expect(result.saturationMargin).toBeGreaterThan(0)
      expect(['low', 'medium', 'high']).toContain(result.coreLossEstimate)
    })
  })

  describe('computeTransformerBandwidth', () => {
    it('should calculate bandwidth', () => {
      const transformer: TransformerParams = {
        enabled: true,
        core: {
          shape: 'toroid_round',
          material: { base: 'nanocrystalline', variant: 'nc_iron' },
          effectiveArea: 50,
          effectiveLength: 60,
          airGap: 0,
        },
        winding: {
          primaryTurns: 200,
          secondaryTurns: 2000,
          primaryConductor: {
            type: 'wire',
            material: 'copper',
            wireAwg: 38,
          },
          secondaryAwg: 42,
          secondaryMaterial: 'copper',
          windingStyle: 'interleaved',
          shielding: false,
        },
      }

      const load: LoadParams = {
        volumePot: 500000,
        volumePosition: 1,
        tonePot: 500000,
        toneCapacitor: 22e-9,
        tonePosition: 0,
        cableCapacitancePerMeter: 100e-12,
        cableLength: 5,
        ampInputImpedance: 1e6,
      }

      const bandwidth = computeTransformerBandwidth(transformer, load)

      // Bandwidth depends on model parameters
      // Should be a positive value representing high-frequency rolloff
      expect(bandwidth).toBeGreaterThan(0)
    })
  })
})
