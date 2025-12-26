/**
 * Unit Tests for Coil Calculations
 *
 * Note: This is a simplified engineering model, not FEM simulation.
 * Expected values are based on the model's formulas, not real-world measurements.
 * The model produces consistent, physically meaningful trends.
 */

import { describe, it, expect } from 'vitest'
import {
  computeMeanTurnLengthCylindrical,
  computeTotalWireLength,
  computeRdc,
  computeInductance,
  computeCapacitance,
  computeResonance,
  computeQ,
  computeCoilResults,
} from './coil'
import type { CoilGeometry, WireParams } from '@/domain/types'

describe('Coil Calculations', () => {
  describe('computeMeanTurnLengthCylindrical', () => {
    it('should calculate mean turn length correctly', () => {
      // Inner radius 3.5mm, outer radius 7mm -> mean radius 5.25mm
      const result = computeMeanTurnLengthCylindrical(3.5, 7)
      // 2π × 5.25mm = ~33mm = 0.033m
      expect(result).toBeCloseTo(0.033, 2)
    })

    it('should return 0 for zero dimensions', () => {
      const result = computeMeanTurnLengthCylindrical(0, 0)
      expect(result).toBe(0)
    })
  })

  describe('computeTotalWireLength', () => {
    it('should calculate total wire length for typical pickup', () => {
      const geometry: CoilGeometry = {
        form: 'cylindrical',
        innerRadius: 3.5,
        outerRadius: 7,
        height: 11,
      }

      // 7600 turns, ~33mm per turn, with 1.03 correction
      const result = computeTotalWireLength(geometry, 7600)
      // Expected: 7600 × 0.033 × 1.03 ≈ 258m
      expect(result).toBeGreaterThan(200)
      expect(result).toBeLessThan(300)
    })
  })

  describe('computeRdc', () => {
    it('should calculate DC resistance at 20°C', () => {
      // 250m of 0.0635mm (AWG 42) wire at 20°C
      const result = computeRdc(250, 0.0635, 20)
      // Model produces consistent resistance based on wire length
      expect(result).toBeGreaterThan(1000)
      expect(result).toBeLessThan(2000)
    })

    it('should increase resistance with temperature', () => {
      const r20 = computeRdc(100, 0.0635, 20)
      const r50 = computeRdc(100, 0.0635, 50)
      expect(r50).toBeGreaterThan(r20)
    })

    it('should throw for invalid wire diameter', () => {
      expect(() => computeRdc(100, 0, 20)).toThrow()
    })

    it('should scale linearly with wire length', () => {
      const r100 = computeRdc(100, 0.0635, 20)
      const r200 = computeRdc(200, 0.0635, 20)
      expect(r200 / r100).toBeCloseTo(2, 1)
    })
  })

  describe('computeInductance', () => {
    it('should calculate inductance using Wheeler formula', () => {
      const geometry: CoilGeometry = {
        form: 'cylindrical',
        innerRadius: 3.5,
        outerRadius: 7,
        height: 11,
      }

      // Wheeler formula gives ~0.4H for this geometry
      const result = computeInductance(geometry, 7600)
      expect(result).toBeGreaterThan(0.1)
      expect(result).toBeLessThan(1.0)
    })

    it('should scale with N²', () => {
      const geometry: CoilGeometry = {
        form: 'cylindrical',
        innerRadius: 3.5,
        outerRadius: 7,
        height: 11,
      }

      const L1 = computeInductance(geometry, 1000)
      const L2 = computeInductance(geometry, 2000)

      // L should be approximately 4× for 2× turns
      expect(L2 / L1).toBeCloseTo(4, 0)
    })

    it('should increase with larger radius', () => {
      const geomSmall: CoilGeometry = {
        form: 'cylindrical',
        innerRadius: 3,
        outerRadius: 5,
        height: 10,
      }

      const geomLarge: CoilGeometry = {
        form: 'cylindrical',
        innerRadius: 5,
        outerRadius: 10,
        height: 10,
      }

      const LSmall = computeInductance(geomSmall, 5000)
      const LLarge = computeInductance(geomLarge, 5000)

      expect(LLarge).toBeGreaterThan(LSmall)
    })
  })

  describe('computeCapacitance', () => {
    it('should calculate parasitic capacitance proportional to turns', () => {
      const wire: WireParams = {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,  // AWG 42
        insulation: 'plain_enamel',
        insulationClass: 'A',
        turns: 7600,
        windingStyle: 'scatter',
        packingFactor: 0.72,
        temperature: 20,
      }

      const result = computeCapacitance(wire)
      // Model produces capacitance proportional to N
      expect(result).toBeGreaterThan(0)
    })

    it('should increase with more turns (sub-linear scaling)', () => {
      const wireBase: Omit<WireParams, 'turns'> = {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,  // AWG 42
        insulation: 'plain_enamel',
        insulationClass: 'A',
        windingStyle: 'scatter',
        packingFactor: 0.72,
        temperature: 20,
      }

      const C1 = computeCapacitance({ ...wireBase, turns: 5000 })
      const C2 = computeCapacitance({ ...wireBase, turns: 10000 })

      expect(C2).toBeGreaterThan(C1)
      // Sub-linear scaling: C ∝ N^0.35, so 2x turns → ~1.27x capacitance
      // (not 2x like old linear model)
      expect(C2 / C1).toBeCloseTo(1.27, 1)
    })

    it('should increase with layered winding', () => {
      const wireScatter: WireParams = {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,  // AWG 42
        insulation: 'plain_enamel',
        insulationClass: 'A',
        turns: 7600,
        windingStyle: 'scatter',
        packingFactor: 0.72,
        temperature: 20,
      }

      const wireLayered: WireParams = {
        ...wireScatter,
        windingStyle: 'layered',
      }

      const CScatter = computeCapacitance(wireScatter)
      const CLayered = computeCapacitance(wireLayered)

      expect(CLayered).toBeGreaterThan(CScatter)
    })

    it('should increase with higher packing factor', () => {
      const wireLow: WireParams = {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,  // AWG 42
        insulation: 'plain_enamel',
        insulationClass: 'A',
        turns: 7600,
        windingStyle: 'scatter',
        packingFactor: 0.5,
        temperature: 20,
      }

      const wireHigh: WireParams = {
        ...wireLow,
        packingFactor: 0.9,
      }

      const CLow = computeCapacitance(wireLow)
      const CHigh = computeCapacitance(wireHigh)

      expect(CHigh).toBeGreaterThan(CLow)
    })
  })

  describe('computeResonance', () => {
    it('should calculate resonant frequency', () => {
      // L = 3H, C = 100pF
      const L = 3
      const C = 100e-12

      const result = computeResonance(L, C)

      // f = 1/(2π√LC) ≈ 9.2 kHz
      expect(result).toBeGreaterThan(8000)
      expect(result).toBeLessThan(10000)
    })

    it('should decrease with higher inductance', () => {
      const C = 100e-12
      const f1 = computeResonance(2, C)
      const f2 = computeResonance(4, C)

      expect(f2).toBeLessThan(f1)
    })

    it('should decrease with higher capacitance', () => {
      const L = 3
      const f1 = computeResonance(L, 50e-12)
      const f2 = computeResonance(L, 200e-12)

      expect(f2).toBeLessThan(f1)
    })

    it('should return 0 for invalid values', () => {
      expect(computeResonance(0, 100e-12)).toBe(0)
      expect(computeResonance(3, 0)).toBe(0)
    })
  })

  describe('computeQ', () => {
    it('should calculate quality factor', () => {
      const f0 = 9000 // Hz
      const L = 3 // H
      const R = 6000 // Ohms

      const result = computeQ(f0, L, R)

      // Q = ω₀L/R = 2π×9000×3/6000 ≈ 28
      expect(result).toBeGreaterThan(20)
      expect(result).toBeLessThan(40)
    })

    it('should increase with lower resistance', () => {
      const f0 = 9000
      const L = 3

      const Q1 = computeQ(f0, L, 6000)
      const Q2 = computeQ(f0, L, 3000)

      expect(Q2).toBeGreaterThan(Q1)
    })
  })

  describe('computeCoilResults', () => {
    it('should compute complete coil results', () => {
      const geometry: CoilGeometry = {
        form: 'cylindrical',
        innerRadius: 3.5,
        outerRadius: 7,
        height: 11,
      }

      const wire: WireParams = {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,  // AWG 42
        insulation: 'plain_enamel',
        insulationClass: 'A',
        turns: 7600,
        windingStyle: 'scatter',
        packingFactor: 0.72,
        temperature: 20,
      }

      const result = computeCoilResults(geometry, wire)

      // Verify all outputs are computed
      expect(result.dcResistance).toBeGreaterThan(0)
      expect(result.inductance).toBeGreaterThan(0)
      expect(result.capacitance).toBeGreaterThan(0)
      expect(result.resonantFrequency).toBeGreaterThan(0)
      expect(result.qualityFactor).toBeGreaterThan(0)
      expect(result.totalWireLength).toBeGreaterThan(200)
      expect(result.meanTurnLength).toBeGreaterThan(0)
      expect(result.coilVolume).toBeGreaterThan(0)
    })

    it('should show more turns = higher R, L, C and lower f0', () => {
      const geometry: CoilGeometry = {
        form: 'cylindrical',
        innerRadius: 3.5,
        outerRadius: 7.5,
        height: 11,
      }

      const wireLow: WireParams = {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,  // AWG 42
        insulation: 'plain_enamel',
        insulationClass: 'A',
        turns: 5000,
        windingStyle: 'scatter',
        packingFactor: 0.72,
        temperature: 20,
      }

      const wireHigh: WireParams = {
        ...wireLow,
        turns: 10000,
      }

      const resultLow = computeCoilResults(geometry, wireLow)
      const resultHigh = computeCoilResults(geometry, wireHigh)

      // More turns should increase R, L, C
      expect(resultHigh.dcResistance).toBeGreaterThan(resultLow.dcResistance)
      expect(resultHigh.inductance).toBeGreaterThan(resultLow.inductance)
      expect(resultHigh.capacitance).toBeGreaterThan(resultLow.capacitance)

      // More turns should decrease f0 (darker tone)
      expect(resultHigh.resonantFrequency).toBeLessThan(resultLow.resonantFrequency)
    })
  })
})
