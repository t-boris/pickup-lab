/**
 * Unit Tests for Magnetic Field Calculations
 */

import { describe, it, expect } from 'vitest'
import {
  computeBFieldCylinder,
  computeBField,
  computeFieldGradient,
  computeStringPullIndex,
  getStringPullWarning,
  generateFieldVsDistance,
  computeMagnetResults,
} from './magnetic'
import type { MagnetParams, PositioningParams } from '@/domain/types'

describe('Magnetic Field Calculations', () => {
  describe('computeBFieldCylinder', () => {
    it('should calculate B-field for AlNiCo5 rod magnet', () => {
      // Typical pickup magnet: 5mm diameter, 18mm long
      const result = computeBFieldCylinder('alnico5', 2.5, 18, 2.5, 1.0)

      // Expect field in range 50-200 mT at 2.5mm
      const resultMT = result * 1000
      expect(resultMT).toBeGreaterThan(30)
      expect(resultMT).toBeLessThan(300)
    })

    it('should decrease with distance', () => {
      const B1 = computeBFieldCylinder('alnico5', 2.5, 18, 1, 1.0)
      const B2 = computeBFieldCylinder('alnico5', 2.5, 18, 5, 1.0)
      const B3 = computeBFieldCylinder('alnico5', 2.5, 18, 10, 1.0)

      expect(B1).toBeGreaterThan(B2)
      expect(B2).toBeGreaterThan(B3)
    })

    it('should scale with magnetization', () => {
      const BFull = computeBFieldCylinder('alnico5', 2.5, 18, 2.5, 1.0)
      const BHalf = computeBFieldCylinder('alnico5', 2.5, 18, 2.5, 0.5)

      expect(BHalf).toBeCloseTo(BFull / 2, 5)
    })

    it('should differ between magnet types', () => {
      const BAlnico5 = computeBFieldCylinder('alnico5', 2.5, 18, 2.5, 1.0)
      const BAlnico2 = computeBFieldCylinder('alnico2', 2.5, 18, 2.5, 1.0)
      const BNeodymium = computeBFieldCylinder('neodymium', 2.5, 18, 2.5, 1.0)

      // AlNiCo5 is stronger than AlNiCo2
      expect(BAlnico5).toBeGreaterThan(BAlnico2)
      // Neodymium is strongest
      expect(BNeodymium).toBeGreaterThan(BAlnico5)
    })
  })

  describe('computeBField', () => {
    it('should work for rod magnets', () => {
      const magnet: MagnetParams = {
        type: 'alnico5',
        geometry: 'rod',
        diameter: 5,
        magnetLength: 18,
        magnetization: 1.0,
        polePieces: false,
        polePieceMaterial: 'alnico',
        coverType: 'none',
      }

      const result = computeBField(magnet, 2.5)
      expect(result).toBeGreaterThan(0)
    })

    it('should work for bar magnets', () => {
      const magnet: MagnetParams = {
        type: 'alnico5',
        geometry: 'bar',
        width: 12,
        magnetLength: 60,
        magnetHeight: 5,
        magnetization: 1.0,
        polePieces: true,
        polePieceMaterial: 'steel',
        coverType: 'none',
      }

      const result = computeBField(magnet, 2.5)
      expect(result).toBeGreaterThan(0)
    })
  })

  describe('computeFieldGradient', () => {
    it('should calculate field gradient', () => {
      const magnet: MagnetParams = {
        type: 'alnico5',
        geometry: 'rod',
        diameter: 5,
        magnetLength: 18,
        magnetization: 1.0,
        polePieces: false,
        polePieceMaterial: 'alnico',
        coverType: 'none',
      }

      const gradient = computeFieldGradient(magnet, 2.5)

      // Gradient should be negative (field decreases with distance)
      expect(gradient).toBeLessThan(0)
    })

    it('should be steeper closer to magnet', () => {
      const magnet: MagnetParams = {
        type: 'alnico5',
        geometry: 'rod',
        diameter: 5,
        magnetLength: 18,
        magnetization: 1.0,
        polePieces: false,
        polePieceMaterial: 'alnico',
        coverType: 'none',
      }

      const gradientClose = Math.abs(computeFieldGradient(magnet, 1.5))
      const gradientFar = Math.abs(computeFieldGradient(magnet, 5))

      expect(gradientClose).toBeGreaterThan(gradientFar)
    })
  })

  describe('computeStringPullIndex', () => {
    it('should calculate string pull index', () => {
      const B = 0.1 // 100 mT
      const distance = 2.5

      const result = computeStringPullIndex(B, distance)

      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(1)
    })

    it('should increase with stronger field', () => {
      const spi1 = computeStringPullIndex(0.05, 2.5)
      const spi2 = computeStringPullIndex(0.1, 2.5)

      expect(spi2).toBeGreaterThan(spi1)
    })

    it('should increase with closer distance', () => {
      const spi1 = computeStringPullIndex(0.1, 5)
      const spi2 = computeStringPullIndex(0.1, 2)

      expect(spi2).toBeGreaterThan(spi1)
    })
  })

  describe('getStringPullWarning', () => {
    it('should return safe for low index', () => {
      expect(getStringPullWarning(0.2)).toBe('safe')
    })

    it('should return caution for medium index', () => {
      expect(getStringPullWarning(0.5)).toBe('caution')
    })

    it('should return danger for high index', () => {
      expect(getStringPullWarning(0.8)).toBe('danger')
    })
  })

  describe('generateFieldVsDistance', () => {
    it('should generate field vs distance data', () => {
      const magnet: MagnetParams = {
        type: 'alnico5',
        geometry: 'rod',
        diameter: 5,
        magnetLength: 18,
        magnetization: 1.0,
        polePieces: false,
        polePieceMaterial: 'alnico',
        coverType: 'none',
      }

      const result = generateFieldVsDistance(magnet, 0.5, 20, 20)

      expect(result).toHaveLength(20)
      expect(result[0].distance).toBeCloseTo(0.5, 1)
      expect(result[19].distance).toBeCloseTo(20, 1)

      // Field should decrease with distance
      expect(result[0].field).toBeGreaterThan(result[19].field)
    })
  })

  describe('computeMagnetResults', () => {
    it('should compute complete magnet results', () => {
      const magnet: MagnetParams = {
        type: 'alnico5',
        geometry: 'rod',
        diameter: 5,
        magnetLength: 18,
        magnetization: 1.0,
        polePieces: false,
        polePieceMaterial: 'alnico',
        coverType: 'none',
      }

      const positioning: PositioningParams = {
        stringToPoleDistance: 2.5,
        coilToStringDistance: 3,
        poleSpacing: 10.5,
        stringDiameter: 0.43,
        stringMaterial: 'nickel',
      }

      const result = computeMagnetResults(
        magnet,
        positioning,
        7600, // turns
        0.0001, // effective area (m²)
        0.35 // coupling factor
      )

      expect(result.fieldAtString).toBeGreaterThan(0)
      expect(result.fieldGradient).toBeLessThan(0)
      expect(result.sensitivityIndex).toBeGreaterThan(0)
      expect(result.stringPullIndex).toBeGreaterThanOrEqual(0)
      expect(['safe', 'caution', 'danger']).toContain(result.stringPullWarning)
    })
  })
})
