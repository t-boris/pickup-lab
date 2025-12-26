/**
 * Parasitic Parameter Calculations
 *
 * Leakage inductance, winding capacitance, and winding resistance estimates.
 */

import type { TransformerParams, TransformerParasitics, ConductorMaterial } from '@/domain/types'
import { getAwgSpec, COPPER } from '@/lib/awg-table'

/**
 * Estimate leakage inductance
 *
 * Leakage inductance depends on winding geometry and coupling.
 * For interleaved windings: Llk ≈ 0.5-2% of Lp
 * For non-interleaved: Llk ≈ 3-10% of Lp
 *
 * @param primaryInductance Primary inductance in H
 * @param windingStyle Winding arrangement
 * @param shielding Whether electrostatic shield is present
 * @returns Leakage inductance in H
 */
export const computeLeakageInductance = (
  primaryInductance: number,
  windingStyle: 'interleaved' | 'non_interleaved',
  shielding: boolean
): number => {
  // Base leakage factor
  let leakageFactor = windingStyle === 'interleaved' ? 0.015 : 0.06

  // Shielding slightly increases leakage due to spacing
  if (shielding) {
    leakageFactor *= 1.2
  }

  return primaryInductance * leakageFactor
}

/**
 * Estimate interwinding capacitance
 *
 * Ciw depends on winding area, spacing, conductor types, and insulation.
 * Typical values: 10-100 pF for audio transformers
 * Plate primary increases capacitance significantly
 *
 * @param transformer Transformer parameters
 * @returns Interwinding capacitance in Farads
 */
export const computeInterwindingCapacitance = (
  transformer: TransformerParams
): number => {
  const { winding, core } = transformer
  const { primaryTurns, secondaryTurns, primaryConductor, windingStyle, shielding } = winding

  // Base capacitance scales with winding overlap area
  // Use geometric mean of turns as proxy for overlap
  const turnsFactor = Math.sqrt(primaryTurns * secondaryTurns)

  // Area factor (normalize to typical ~50mm² core)
  const areaFactor = core.effectiveArea / 50

  // Base value in pF
  let baseCap = 5 * Math.sqrt(areaFactor) * Math.sqrt(turnsFactor / 100)

  // Primary conductor type affects overlap area with secondary
  if (primaryConductor.type === 'plate') {
    // Plate has much larger surface area facing secondary winding
    const width = primaryConductor.plateWidth || 5  // mm
    // Wider plate = more overlap with secondary
    const plateFactor = 1.5 + (width / 10)
    baseCap *= Math.min(4, plateFactor)
  }

  // Interleaved has more layer-to-layer contact
  if (windingStyle === 'interleaved') {
    baseCap *= 2.5
  }

  // Shielding adds significant capacitance to ground
  if (shielding) {
    baseCap *= 0.3 // Effective interwinding drops due to shield
  }

  // Convert to Farads, clamp to reasonable range (5-300 pF for plate)
  const maxCap = primaryConductor.type === 'plate' ? 300e-12 : 200e-12
  return Math.max(5e-12, Math.min(maxCap, baseCap * 1e-12))
}

/**
 * Estimate primary winding capacitance
 *
 * Layer-to-layer capacitance in primary winding
 * Depends on conductor type: plate has more surface area than wire
 *
 * @param transformer Transformer parameters
 * @returns Primary capacitance in Farads
 */
export const computePrimaryCapacitance = (
  transformer: TransformerParams
): number => {
  const { winding } = transformer
  const { primaryTurns, primaryConductor, windingStyle } = winding

  // Base capacitance scales with turns^0.5
  let baseCap = 3 * Math.sqrt(primaryTurns / 100)

  // Conductor type factor
  if (primaryConductor.type === 'plate') {
    // Plate/strip has much larger surface area per turn
    // Capacitance scales with width and inversely with thickness (spacing)
    const width = primaryConductor.plateWidth || 5  // mm
    const thickness = primaryConductor.plateThickness || 0.1  // mm

    // Wider plate = more capacitance
    // Thinner plate = layers closer together = more capacitance
    const plateFactor = (width / 5) * Math.sqrt(0.5 / thickness)
    baseCap *= Math.max(1.5, Math.min(5, plateFactor))
  } else {
    // Wire: thicker wire (lower AWG) has more surface area
    const awg = primaryConductor.wireAwg || 38
    // AWG 30 = factor ~1.5, AWG 42 = factor ~0.8
    const wireFactor = 1.0 + (38 - awg) * 0.05
    baseCap *= Math.max(0.5, Math.min(2, wireFactor))
  }

  // Interleaved spreads primary across more layers
  const styleFactor = windingStyle === 'interleaved' ? 1.5 : 1.0

  // Convert to Farads, clamp (3-100 pF for plate)
  const maxCap = primaryConductor.type === 'plate' ? 100e-12 : 50e-12
  return Math.max(3e-12, Math.min(maxCap, baseCap * styleFactor * 1e-12))
}

/**
 * Estimate secondary winding capacitance
 *
 * Higher turn count = more capacitance
 * Thicker wire (lower AWG) = more surface area = higher capacitance
 *
 * @param transformer Transformer parameters
 * @returns Secondary capacitance in Farads
 */
export const computeSecondaryCapacitance = (
  transformer: TransformerParams
): number => {
  const { winding } = transformer
  const { secondaryTurns, secondaryAwg, windingStyle } = winding

  // Secondary typically has more turns, more layers
  let baseCap = 5 * Math.sqrt(secondaryTurns / 500)

  // AWG factor: thicker wire = more surface area
  // AWG 30 = factor ~1.4, AWG 42 = factor ~0.9, AWG 46 = factor ~0.7
  const awgFactor = 1.0 + (40 - secondaryAwg) * 0.04
  baseCap *= Math.max(0.5, Math.min(2, awgFactor))

  const styleFactor = windingStyle === 'interleaved' ? 1.3 : 1.0

  // Convert to Farads, clamp (5-150 pF typical)
  return Math.max(5e-12, Math.min(150e-12, baseCap * styleFactor * 1e-12))
}

/**
 * Get resistivity factor for conductor material
 * Relative to standard copper (1.724e-8 Ω·m)
 */
const getConductorResistivityFactor = (material: ConductorMaterial): number => {
  switch (material) {
    case 'ofc_copper':
      return 0.995  // OFC ~0.5% better conductivity
    case 'silver':
      return 0.95   // Silver ~5% better than copper
    case 'aluminum':
      return 1.64   // Aluminum ~64% higher resistivity
    case 'brass':
      return 3.8    // Brass ~3.8x copper resistivity
    case 'copper':
    default:
      return 1.0
  }
}

/**
 * Calculate mean turn length for toroid core
 * MLT ≈ π × (ID + OD) / 2 for round toroid
 * For oval: add straight sections
 *
 * @param core Core parameters
 * @returns Mean turn length in mm
 */
const computeMeanTurnLength = (core: TransformerParams['core']): number => {
  if (core.toroidGeometry) {
    const { innerDiameter, outerDiameter, straightLength = 0 } = core.toroidGeometry
    // Mean diameter
    const meanDiameter = (innerDiameter + outerDiameter) / 2
    // For round toroid: MLT = π × mean_diameter
    // For oval: add 2 × straight sections
    return Math.PI * meanDiameter + 2 * straightLength
  }
  // Fallback: estimate from effective length (rough approximation)
  // Assume roughly square core window
  return core.effectiveLength * 0.4
}

/**
 * Calculate primary winding resistance
 *
 * For wire: R = ρ × L / A where L = turns × MLT
 * For plate/strip: R = ρ × L / (thickness × width)
 *
 * @param transformer Transformer parameters
 * @returns Primary DC resistance in Ohms
 */
export const computePrimaryResistance = (
  transformer: TransformerParams
): number => {
  const { winding, core } = transformer
  const { primaryConductor, primaryTurns } = winding

  // Mean turn length in meters
  const mlt = computeMeanTurnLength(core) / 1000

  // Total wire length
  const totalLength = primaryTurns * mlt

  // Base resistivity with material factor
  const resistivityFactor = getConductorResistivityFactor(primaryConductor.material)
  const resistivity = COPPER.resistivity20C * resistivityFactor

  if (primaryConductor.type === 'plate') {
    // Plate/strip: cross-section = thickness × width
    const thickness = (primaryConductor.plateThickness || 0.1) / 1000  // mm to m
    const width = (primaryConductor.plateWidth || 5) / 1000  // mm to m
    const area = thickness * width  // m²

    if (area <= 0) return 0
    return resistivity * totalLength / area
  } else {
    // Wire: use AWG table
    const awg = primaryConductor.wireAwg || 38
    const awgSpec = getAwgSpec(awg)

    if (!awgSpec) {
      // Fallback calculation
      const diameter = 0.127 * Math.pow(92, (36 - awg) / 39) / 1000  // m
      const area = Math.PI * (diameter / 2) ** 2
      return resistivity * totalLength / area
    }

    // Use table resistance, adjusted for material
    return awgSpec.resistancePerMeter * totalLength * resistivityFactor
  }
}

/**
 * Calculate secondary winding resistance
 *
 * @param transformer Transformer parameters
 * @returns Secondary DC resistance in Ohms
 */
export const computeSecondaryResistance = (
  transformer: TransformerParams
): number => {
  const { winding, core } = transformer
  const { secondaryTurns, secondaryAwg, secondaryMaterial } = winding

  // Mean turn length in meters
  const mlt = computeMeanTurnLength(core) / 1000

  // Total wire length
  const totalLength = secondaryTurns * mlt

  // Material factor
  const resistivityFactor = getConductorResistivityFactor(secondaryMaterial)

  // Get AWG spec
  const awgSpec = getAwgSpec(secondaryAwg)

  if (!awgSpec) {
    // Fallback calculation
    const resistivity = COPPER.resistivity20C * resistivityFactor
    const diameter = 0.127 * Math.pow(92, (36 - secondaryAwg) / 39) / 1000  // m
    const area = Math.PI * (diameter / 2) ** 2
    return resistivity * totalLength / area
  }

  // Use table resistance, adjusted for material
  return awgSpec.resistancePerMeter * totalLength * resistivityFactor
}

/**
 * Compute all parasitic parameters for a transformer
 *
 * @param transformer Transformer parameters
 * @param primaryInductance Computed primary inductance
 * @returns Complete parasitic parameters
 */
export const computeParasitics = (
  transformer: TransformerParams,
  primaryInductance: number
): TransformerParasitics => {
  const { winding } = transformer

  return {
    leakageInductance: computeLeakageInductance(
      primaryInductance,
      winding.windingStyle,
      winding.shielding
    ),
    interwindingCapacitance: computeInterwindingCapacitance(transformer),
    primaryCapacitance: computePrimaryCapacitance(transformer),
    secondaryCapacitance: computeSecondaryCapacitance(transformer),
    primaryResistance: computePrimaryResistance(transformer),
    secondaryResistance: computeSecondaryResistance(transformer),
  }
}
