/**
 * Magnetic Field Module
 *
 * Pure functions for calculating:
 * - Magnetic field vs distance (axial approximation)
 * - Field gradient
 * - Output/sensitivity index
 * - String pull index
 */

import type {
  MagnetParams,
  PositioningParams,
  MagnetComputedResults,
  FieldPoint,
  OutputPoint,
} from '@/domain/types'
import { mmToM, tToMT } from '@/domain/units'
import {
  getMagnetProperties,
  STRING_PULL_EXPONENT,
  STRING_PULL_THRESHOLDS,
} from '@/lib/calibration'

// ============================================================================
// MAGNETIC FIELD CALCULATIONS
// ============================================================================

/**
 * Calculate axial magnetic field for a cylindrical magnet
 *
 * B(z) ≈ (Br/2) × [(z+t)/√((z+t)² + R²) - z/√(z² + R²)]
 *
 * where:
 * - Br = remanent flux density
 * - R = magnet radius
 * - t = magnet thickness/length
 * - z = distance from magnet surface
 *
 * @param magnetType Magnet material type
 * @param radius Magnet radius in mm
 * @param thickness Magnet thickness/length in mm
 * @param distance Distance from magnet surface in mm
 * @param magnetization Magnetization level (0 to 1)
 * @returns B-field in Tesla
 */
export const computeBFieldCylinder = (
  magnetType: MagnetParams['type'],
  radius: number,
  thickness: number,
  distance: number,
  magnetization: number
): number => {
  const props = getMagnetProperties(magnetType)
  const Br = props.Br * magnetization

  // Convert to meters
  const R = mmToM(radius)
  const t = mmToM(thickness)
  const z = mmToM(distance)

  // Avoid division by zero
  if (R <= 0) return 0

  // Axial field formula
  const term1 = (z + t) / Math.sqrt((z + t) * (z + t) + R * R)
  const term2 = z / Math.sqrt(z * z + R * R)

  return (Br / 2) * (term1 - term2)
}

/**
 * Calculate axial magnetic field for a bar magnet
 *
 * For bar magnets in pickups, the magnet typically sits below the coil
 * with pole pieces (steel screws/slugs) conducting flux to the strings.
 *
 * Model: Equivalent cylinder approximation with distance correction
 * The field is computed at the pole tip, accounting for magnetic circuit.
 *
 * @param magnetType Magnet material type
 * @param width Bar width in mm
 * @param length Bar length in mm
 * @param height Bar height in mm
 * @param distance Distance from pole tip to string in mm
 * @param magnetization Magnetization level (0 to 1)
 * @param hasPolepieces Whether flux goes through steel pole pieces
 * @returns B-field in Tesla
 */
export const computeBFieldBar = (
  magnetType: MagnetParams['type'],
  width: number,
  length: number,
  height: number,
  distance: number,
  magnetization: number,
  hasPolepieces: boolean = true
): number => {
  const props = getMagnetProperties(magnetType)
  const Br = props.Br * magnetization

  // Bar magnet geometry:
  // - width: across strings (e.g., 12mm)
  // - length: along strings (e.g., 50mm)
  // - height: vertical, magnetization direction (e.g., 5mm)
  //
  // For axial field formula:
  // - t (thickness) = height (magnetization direction)
  // - R (radius) = equivalent radius from cross-section (width × length)

  // For bar magnets with pole pieces, field concentrates at pole tips
  // Typical pole piece: 5mm diameter slug/screw
  const poleRadius = hasPolepieces ? 2.5 : Math.sqrt((width * length) / Math.PI)

  // Convert to meters
  const R = mmToM(poleRadius)
  const t = mmToM(height) // height is the magnetization direction
  const z = mmToM(distance)

  if (R <= 0) return 0

  // Axial field formula (same as cylinder)
  const term1 = (z + t) / Math.sqrt((z + t) * (z + t) + R * R)
  const term2 = z / Math.sqrt(z * z + R * R)
  let B = (Br / 2) * (term1 - term2)

  // Pole pieces increase reluctance of magnetic circuit
  // Reduces effective field by ~30-50%
  if (hasPolepieces) {
    B *= 0.6
  }

  return B
}

/**
 * Calculate magnetic field for blade/rail pickup
 *
 * The blade transfers flux from bar magnet(s) to the strings.
 * The steel blade acts as a flux guide/concentrator.
 *
 * Physical model:
 * 1. Bar magnet(s) create source flux
 * 2. Steel blade conducts flux through the coil
 * 3. Blade tip presents field to strings
 * 4. Field at string = blade tip flux / air gap reluctance
 *
 * @param magnetType Magnet material type
 * @param magnetWidth Bar magnet width in mm
 * @param magnetLength Bar magnet length in mm (along strings)
 * @param magnetHeight Bar magnet height in mm (magnetization direction)
 * @param bladeThickness Blade thickness in mm
 * @param bladeLength Total blade length (coil height + protrusion) in mm
 * @param magnetCount Number of bar magnets (1 or 2)
 * @param distance Distance from blade tip to string in mm
 * @param magnetization Magnetization level (0 to 1)
 * @returns B-field in Tesla
 */
export const computeBFieldBlade = (
  magnetType: MagnetParams['type'],
  magnetWidth: number,
  magnetLength: number,
  magnetHeight: number,
  bladeThickness: number,
  bladeLength: number,
  magnetCount: number,
  distance: number,
  magnetization: number
): number => {
  // Model blade as a thin pole piece with rectangular cross-section
  // The blade/rail extends across strings, but field per string depends on:
  // - Blade cross-section area at the tip
  // - Source magnet dimensions (more volume = more flux)
  // - Magnetic circuit efficiency (magnet → blade → air gap)

  // Effective pole radius from blade cross-section
  // For a 3mm thick × 8mm effective width blade tip
  const effectiveBladeWidth = 8 // mm interaction width per string
  const crossSectionArea = bladeThickness * effectiveBladeWidth // mm²
  const equivalentRadius = Math.sqrt(crossSectionArea / Math.PI)

  // Magnet volume factor - larger magnets provide more flux
  // Reference: 12mm × 50mm × 3mm = 1800 mm³
  const magnetVolume = magnetWidth * magnetLength * magnetHeight
  const referenceVolume = 12 * 50 * 3 // mm³
  const volumeFactor = Math.sqrt(magnetVolume / referenceVolume) // sqrt for diminishing returns

  // Blade magnetic circuit has significant reluctance:
  // 1. Air gap between magnet and blade (if any)
  // 2. Blade material reluctance (stainless steel μr ≈ 100-500)
  // 3. Leakage flux along blade length
  // 4. Air gap from blade tip to string
  //
  // Net effect: field at blade tip is ~15-25% of what a direct
  // magnet of same size would produce
  const magnetCircuitEfficiency = 0.18

  // Two magnets sandwich the blade, providing more flux
  const magnetCountFactor = magnetCount === 2 ? 1.35 : 1.0

  // Compute base field as if blade tip were a cylinder magnet
  const baseField = computeBFieldCylinder(
    magnetType,
    equivalentRadius,
    bladeLength, // blade length as effective "magnet thickness"
    distance,
    magnetization
  )

  return baseField * magnetCircuitEfficiency * magnetCountFactor * volumeFactor
}

/**
 * Calculate magnetic field at a given distance
 *
 * @param magnet Magnet parameters
 * @param distance Distance in mm
 * @param coilHeight Coil height in mm (needed for blade geometry)
 * @returns B-field in Tesla
 */
export const computeBField = (
  magnet: MagnetParams,
  distance: number,
  coilHeight?: number
): number => {
  if (magnet.geometry === 'rod') {
    return computeBFieldCylinder(
      magnet.type,
      (magnet.diameter ?? 5) / 2, // radius from diameter
      magnet.magnetLength,
      distance,
      magnet.magnetization
    )
  } else if (magnet.geometry === 'blade') {
    // Blade total length = coil height + protrusion + some depth into magnet
    const bladeProtrusion = magnet.bladeHeight ?? 2
    const magnetContactDepth = (magnet.magnetHeight ?? 3) * 0.5
    const bladeLength = (coilHeight ?? 10) + bladeProtrusion + magnetContactDepth

    return computeBFieldBlade(
      magnet.type,
      magnet.width ?? 12,
      magnet.magnetLength,
      magnet.magnetHeight ?? 3,
      magnet.bladeThickness ?? 3,
      bladeLength,
      magnet.magnetCount ?? 1,
      distance,
      magnet.magnetization
    )
  } else {
    // bar geometry
    return computeBFieldBar(
      magnet.type,
      magnet.width ?? 12,
      magnet.magnetLength,
      magnet.magnetHeight ?? 5,
      distance,
      magnet.magnetization,
      magnet.polePieces ?? true
    )
  }
}

/**
 * Calculate field gradient (dB/dz) numerically
 *
 * @param magnet Magnet parameters
 * @param distance Distance in mm
 * @param delta Step size for numerical differentiation in mm
 * @param coilHeight Coil height in mm (needed for blade geometry)
 * @returns Field gradient in T/m
 */
export const computeFieldGradient = (
  magnet: MagnetParams,
  distance: number,
  delta: number = 0.1,
  coilHeight?: number
): number => {
  const B1 = computeBField(magnet, distance - delta, coilHeight)
  const B2 = computeBField(magnet, distance + delta, coilHeight)

  // Gradient in T/mm, convert to T/m
  const gradientPerMm = (B2 - B1) / (2 * delta)
  return gradientPerMm * 1000 // T/mm → T/m
}

// ============================================================================
// OUTPUT INDEX CALCULATION
// ============================================================================

/**
 * Calculate output/sensitivity index
 *
 * Based on Faraday's law: e = -N × dΦ/dt
 *
 * E_peak ≈ N × A_eff × k_coupling × |dB/dx| × ω × x₀
 *
 * Simplified for relative comparison, normalized output at 1kHz with
 * typical string amplitude.
 *
 * @param turns Number of coil turns
 * @param effectiveArea Effective coil area in m²
 * @param couplingFactor Coupling factor (0 to 1)
 * @param fieldGradient Field gradient in T/m
 * @param frequency Reference frequency in Hz (default 1000)
 * @param stringAmplitude String amplitude in mm (default 0.5)
 * @returns Output index in mV (approximate)
 */
export const computeOutputIndex = (
  turns: number,
  effectiveArea: number,
  couplingFactor: number,
  fieldGradient: number,
  frequency: number = 1000,
  stringAmplitude: number = 0.5
): number => {
  const omega = 2 * Math.PI * frequency
  const x0 = mmToM(stringAmplitude)

  // E_peak in volts
  const ePeak = turns * effectiveArea * couplingFactor * Math.abs(fieldGradient) * omega * x0

  // Convert to mV
  return ePeak * 1000
}

/**
 * Sensitivity calibration factor
 *
 * The theoretical Faraday's law model overestimates pickup sensitivity because
 * it treats the entire pole area as the effective flux linkage area.
 * In reality, the vibrating string only modulates a small fraction of the flux.
 *
 * Real pickup sensitivity values:
 * - Low output (vintage SC): 0.1-0.3 mV/mm
 * - Medium output (PAF): 0.3-0.6 mV/mm
 * - High output (hot humbucker): 0.6-1.2 mV/mm
 *
 * This factor is empirically derived to match real measurements.
 * Adjusted to account for:
 * - String only modulates ~1-5% of total flux
 * - Magnetic circuit losses
 * - Eddy current damping in pole pieces
 */
const SENSITIVITY_CALIBRATION = 1 / 100000

/**
 * Geometry-specific sensitivity correction factors
 *
 * Different magnet geometries have different flux coupling characteristics
 * that affect the final sensitivity beyond what the basic model captures.
 *
 * Rod: Direct pole-to-string path, but small magnet mass and high field
 *      concentration leads to overestimated sensitivity in the model.
 *      Real Strats are lower output than the field strength suggests.
 *
 * Bar: Reference geometry. Pole pieces spread flux effectively.
 *      Model matches real P-90 and PAF measurements well.
 *
 * Blade: Continuous rail spreads flux along string length.
 *        More uniform coupling but lower peak sensitivity.
 *        Model underestimates due to distributed flux interaction.
 */
const GEOMETRY_SENSITIVITY_FACTORS: Record<string, number> = {
  rod: 0.4,    // Rod magnets: model overestimates ~2.5x
  bar: 1.0,    // Bar magnets: reference (model is calibrated for this)
  blade: 1.8,  // Blade/rail: model underestimates ~1.8x
}

/**
 * Calculate sensitivity index (mV per mm of string movement)
 *
 * Based on Faraday's law with empirical calibration to match real pickups.
 * The raw formula overestimates because it doesn't account for:
 * - String only modulates a small fraction of the flux
 * - Magnetic circuit reluctance effects
 * - Eddy current losses in pole pieces
 *
 * @param turns Number of coil turns
 * @param effectiveArea Effective coil area in m²
 * @param couplingFactor Coupling factor (0 to 1)
 * @param fieldGradient Field gradient in T/m
 * @param geometry Magnet geometry type for correction factor
 * @param frequency Reference frequency in Hz
 * @returns Sensitivity in mV/mm
 */
export const computeSensitivityIndex = (
  turns: number,
  effectiveArea: number,
  couplingFactor: number,
  fieldGradient: number,
  geometry: 'rod' | 'bar' | 'blade' = 'bar',
  frequency: number = 1000
): number => {
  const omega = 2 * Math.PI * frequency

  // Theoretical sensitivity from Faraday's law
  const sensitivityVperM = turns * effectiveArea * couplingFactor * Math.abs(fieldGradient) * omega

  // Apply calibration and geometry-specific correction
  const geometryFactor = GEOMETRY_SENSITIVITY_FACTORS[geometry] ?? 1.0
  return sensitivityVperM * SENSITIVITY_CALIBRATION * geometryFactor
}

// ============================================================================
// STRING PULL INDEX
// ============================================================================

/**
 * Calculate string pull index (qualitative measure)
 *
 * SPI ∝ B² / distance^n
 * Normalized to 0-1 scale based on typical values
 *
 * @param fieldAtString B-field at string position in Tesla
 * @param distance String to pole distance in mm
 * @returns String pull index (0 to 1)
 */
export const computeStringPullIndex = (
  fieldAtString: number,
  distance: number
): number => {
  if (distance <= 0) return 1 // Maximum pull at zero distance

  // Calculate raw SPI
  const rawSpi = (fieldAtString * fieldAtString) / Math.pow(distance, STRING_PULL_EXPONENT)

  // Normalize: typical "safe" value around 0.001, "danger" around 0.01
  // Scale so that 0.01 → 1.0
  const normalized = rawSpi / 0.01

  return Math.min(normalized, 1)
}

/**
 * Get string pull warning level
 *
 * @param stringPullIndex String pull index (0 to 1)
 * @returns Warning level
 */
export const getStringPullWarning = (
  stringPullIndex: number
): 'safe' | 'caution' | 'danger' => {
  if (stringPullIndex < STRING_PULL_THRESHOLDS.safe) {
    return 'safe'
  } else if (stringPullIndex < STRING_PULL_THRESHOLDS.danger) {
    return 'caution'
  } else {
    return 'danger'
  }
}

// ============================================================================
// GRAPH DATA GENERATION
// ============================================================================

/**
 * Generate B-field vs distance data for graphing
 *
 * @param magnet Magnet parameters
 * @param minDistance Minimum distance in mm
 * @param maxDistance Maximum distance in mm
 * @param numPoints Number of data points
 * @returns Array of field points
 */
export const generateFieldVsDistance = (
  magnet: MagnetParams,
  minDistance: number = 0.5,
  maxDistance: number = 20,
  numPoints: number = 50
): FieldPoint[] => {
  const step = (maxDistance - minDistance) / (numPoints - 1)
  const points: FieldPoint[] = []

  for (let i = 0; i < numPoints; i++) {
    const distance = minDistance + i * step
    const field = computeBField(magnet, distance)

    points.push({
      distance,
      field: tToMT(field), // Convert to mT for display
    })
  }

  return points
}

/**
 * Generate output vs distance data for graphing
 *
 * @param magnet Magnet parameters
 * @param turns Number of coil turns
 * @param effectiveArea Effective coil area in m²
 * @param couplingFactor Coupling factor
 * @param minDistance Minimum distance in mm
 * @param maxDistance Maximum distance in mm
 * @param numPoints Number of data points
 * @returns Array of output points
 */
export const generateOutputVsDistance = (
  magnet: MagnetParams,
  turns: number,
  effectiveArea: number,
  couplingFactor: number,
  minDistance: number = 1,
  maxDistance: number = 10,
  numPoints: number = 50
): OutputPoint[] => {
  const step = (maxDistance - minDistance) / (numPoints - 1)
  const points: OutputPoint[] = []

  // Find maximum output for normalization
  let maxOutput = 0
  const rawOutputs: number[] = []

  for (let i = 0; i < numPoints; i++) {
    const distance = minDistance + i * step
    const gradient = computeFieldGradient(magnet, distance)
    const output = computeOutputIndex(turns, effectiveArea, couplingFactor, gradient)

    rawOutputs.push(output)
    if (output > maxOutput) maxOutput = output
  }

  // Normalize and create points
  for (let i = 0; i < numPoints; i++) {
    const distance = minDistance + i * step
    points.push({
      distance,
      output: maxOutput > 0 ? rawOutputs[i] / maxOutput : 0,
    })
  }

  return points
}

// ============================================================================
// MAIN COMPUTATION FUNCTION
// ============================================================================

/**
 * Compute all magnet-related results
 *
 * @param magnet Magnet parameters
 * @param positioning Positioning parameters
 * @param turns Number of coil turns
 * @param effectiveArea Effective coil area in m²
 * @param couplingFactor Coupling factor
 * @returns Complete magnet computation results
 */
export const computeMagnetResults = (
  magnet: MagnetParams,
  positioning: PositioningParams,
  turns: number,
  effectiveArea: number,
  couplingFactor: number,
  coilHeight?: number
): MagnetComputedResults => {
  // Field calculations
  const fieldAtString = computeBField(magnet, positioning.stringToPoleDistance, coilHeight)
  const fieldAtCoil = computeBField(magnet, positioning.coilToStringDistance, coilHeight)
  const fieldGradient = computeFieldGradient(magnet, positioning.stringToPoleDistance, 0.1, coilHeight)

  // Sensitivity (with geometry-specific correction factor)
  const sensitivityIndex = computeSensitivityIndex(
    turns,
    effectiveArea,
    couplingFactor,
    fieldGradient,
    magnet.geometry
  )

  // String pull
  const stringPullIndex = computeStringPullIndex(fieldAtString, positioning.stringToPoleDistance)
  const stringPullWarning = getStringPullWarning(stringPullIndex)

  return {
    fieldAtString,
    fieldAtCoil,
    fieldGradient,
    sensitivityIndex,
    stringPullIndex,
    stringPullWarning,
  }
}
