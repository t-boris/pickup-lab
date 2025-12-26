/**
 * Coil Calculations Module
 *
 * Pure functions for calculating pickup coil electrical properties:
 * - Wire length and geometry
 * - DC resistance with temperature correction
 * - Inductance (Wheeler formula)
 * - Parasitic capacitance
 * - Resonance frequency and Q factor
 */

import type { CoilGeometry, WireParams, CoilComputedResults, CopperGrade } from '@/domain/types'
import { mmToM, pFToF, mm2ToM2 } from '@/domain/units'
import { getCopperResistivity, getWireAreaFromDiameter, getTotalWireDiameter } from '@/lib/awg-table'
import { C_CAPACITANCE_BASE, C_CAPACITANCE_EXPONENT, getKWind, getKIns, getKPack, PHYSICS } from '@/lib/calibration'

// ============================================================================
// WIRE LENGTH CALCULATIONS
// ============================================================================

/**
 * Calculate mean turn length for cylindrical coil
 * l_turn = 2π × r_mean
 *
 * @param innerRadius Inner radius in mm
 * @param outerRadius Outer radius in mm
 * @returns Mean turn length in meters
 */
export const computeMeanTurnLengthCylindrical = (
  innerRadius: number,
  outerRadius: number
): number => {
  const rMean = (innerRadius + outerRadius) / 2
  return 2 * Math.PI * mmToM(rMean)
}

/**
 * Calculate mean turn length for rectangular coil
 * l_turn ≈ 2 × (width + length)
 *
 * @param width Coil width in mm
 * @param length Coil length in mm
 * @returns Mean turn length in meters
 */
export const computeMeanTurnLengthRectangular = (
  width: number,
  length: number
): number => {
  return 2 * mmToM(width + length)
}

/**
 * Calculate mean turn length for flatwork coil (Fender-style)
 * Uses racetrack/stadium shape: two straight sides + two semicircular ends
 *
 * Length is measured edge-to-edge (total bobbin length)
 * But winding doesn't extend to the very edges - typically ~90% of bobbin length
 * Perimeter = 2(L_eff - W) + πW = 2L_eff + W(π - 2)
 *
 * Calibration note: Real Strat pickups with 68mm bobbins, 8000 turns, AWG 42
 * have R_dc ≈ 6.0 kΩ, which implies mean turn ≈ 134mm. The 0.92 factor
 * accounts for winding not reaching bobbin edges.
 *
 * @param innerWidth Inner magnet width in mm
 * @param outerWidth Outer winding width in mm
 * @param length Total coil length edge-to-edge in mm
 * @returns Mean turn length in meters
 */
export const computeMeanTurnLengthFlatwork = (
  innerWidth: number,
  outerWidth: number,
  length: number
): number => {
  // Effective winding length is ~92% of bobbin length
  // (winding doesn't extend to the very edges)
  const effectiveLength = length * 0.92

  // Racetrack perimeter with effective length:
  // P = 2(L_eff - W) + πW = 2L_eff + W(π - 2)
  const meanWidth = (innerWidth + outerWidth) / 2
  return mmToM(2 * effectiveLength + meanWidth * (Math.PI - 2))
}

/**
 * Calculate mean turn length based on coil geometry
 *
 * @param geometry Coil geometry parameters
 * @returns Mean turn length in meters
 */
export const computeMeanTurnLength = (geometry: CoilGeometry): number => {
  switch (geometry.form) {
    case 'cylindrical':
      return computeMeanTurnLengthCylindrical(geometry.innerRadius, geometry.outerRadius)

    case 'rectangular':
      return computeMeanTurnLengthRectangular(
        geometry.outerRadius - geometry.innerRadius, // width
        geometry.length ?? geometry.height // length
      )

    case 'flatwork':
      return computeMeanTurnLengthFlatwork(
        geometry.innerRadius, // inner pole spacing
        geometry.outerRadius, // outer winding width
        geometry.length ?? 80 // typical pickup length
      )

    default:
      return computeMeanTurnLengthCylindrical(geometry.innerRadius, geometry.outerRadius)
  }
}

/**
 * Calculate total wire length
 * L_wire = N × l_turn × correction_factor
 *
 * @param geometry Coil geometry
 * @param turns Number of turns
 * @returns Total wire length in meters
 */
export const computeTotalWireLength = (geometry: CoilGeometry, turns: number): number => {
  const meanTurnLength = computeMeanTurnLength(geometry)

  // Apply small correction for layer buildup (1.02-1.05 typical)
  const correctionFactor = 1.03

  return turns * meanTurnLength * correctionFactor
}

// ============================================================================
// DC RESISTANCE CALCULATION
// ============================================================================

/**
 * Calculate DC resistance of coil
 * R_dc = ρ(T, grade) × L_wire / A_wire
 *
 * @param wireLength Total wire length in meters
 * @param wireDiameter Bare wire diameter in mm
 * @param temperature Operating temperature in Celsius
 * @param copperGrade Copper purity grade (affects resistivity)
 * @returns DC resistance in Ohms
 */
export const computeRdc = (
  wireLength: number,
  wireDiameter: number,
  temperature: number,
  copperGrade: CopperGrade = 'standard'
): number => {
  if (wireDiameter <= 0) {
    throw new Error(`Invalid wire diameter: ${wireDiameter}`)
  }

  // Get resistivity at temperature and grade
  const resistivity = getCopperResistivity(temperature, copperGrade)

  // Cross-sectional area in m² (from diameter in mm)
  const areaMm2 = getWireAreaFromDiameter(wireDiameter)
  const areaM2 = mm2ToM2(areaMm2)

  return resistivity * wireLength / areaM2
}

// ============================================================================
// INDUCTANCE CALCULATION
// ============================================================================

/**
 * Calculate equivalent radius for non-circular coils
 * r_eq = √(A / π)
 *
 * @param area Cross-sectional area in mm²
 * @returns Equivalent radius in mm
 */
export const computeEquivalentRadius = (area: number): number => {
  return Math.sqrt(area / Math.PI)
}

/**
 * Calculate coil winding cross-section area
 *
 * @param geometry Coil geometry
 * @returns Winding area in mm²
 */
export const computeWindingArea = (geometry: CoilGeometry): number => {
  switch (geometry.form) {
    case 'cylindrical': {
      // Annular cross-section
      const rOut = geometry.outerRadius
      const rIn = geometry.innerRadius
      return Math.PI * (rOut * rOut - rIn * rIn)
    }

    case 'rectangular':
    case 'flatwork': {
      // Rectangular cross-section
      const width = geometry.outerRadius - geometry.innerRadius
      const length = geometry.length ?? geometry.height
      return width * length
    }

    default:
      return Math.PI * geometry.outerRadius * geometry.outerRadius
  }
}

/**
 * Calculate inductance using Wheeler formula
 * L(μH) ≈ r² × N² / (9r + 10l)
 * where r = mean radius (inches), l = winding height (inches)
 *
 * For flatwork pickups, the Wheeler formula (designed for solenoids) needs
 * a calibration factor due to different geometry. Real Strat pickups with
 * 8000 turns have L ≈ 2.2-2.4 H. The 1.12 factor is empirically derived.
 *
 * @param geometry Coil geometry
 * @param turns Number of turns
 * @returns Inductance in Henry
 */
export const computeInductance = (geometry: CoilGeometry, turns: number): number => {
  // Calculate mean radius in mm
  let meanRadiusMm: number
  let calibrationFactor = 1.0

  if (geometry.form === 'cylindrical') {
    meanRadiusMm = (geometry.innerRadius + geometry.outerRadius) / 2
  } else if (geometry.form === 'flatwork') {
    // For flatwork, use equivalent radius from winding area
    const area = computeWindingArea(geometry)
    meanRadiusMm = computeEquivalentRadius(area)
    // Calibration factor for flatwork geometry
    // (Wheeler formula underestimates L for flat/wide coils)
    calibrationFactor = 1.12
  } else {
    // For rectangular, use equivalent radius
    const area = computeWindingArea(geometry)
    meanRadiusMm = computeEquivalentRadius(area)
  }

  // Convert to inches for Wheeler formula
  const rInch = meanRadiusMm / 25.4
  const lInch = geometry.height / 25.4

  // Wheeler formula gives result in μH
  const inductanceMuH = (rInch * rInch * turns * turns) / (9 * rInch + 10 * lInch)

  // Convert to Henry and apply calibration
  return inductanceMuH * 1e-6 * calibrationFactor
}

/**
 * Alternative: Solenoid inductance formula for comparison
 * L = μ₀ × N² × A / l
 *
 * @param geometry Coil geometry
 * @param turns Number of turns
 * @returns Inductance in Henry
 */
export const computeInductanceSolenoid = (geometry: CoilGeometry, turns: number): number => {
  const area = computeWindingArea(geometry)
  const areaM2 = mm2ToM2(area)
  const heightM = mmToM(geometry.height)

  return PHYSICS.MU_0 * turns * turns * areaM2 / heightM
}

// ============================================================================
// CAPACITANCE CALCULATION
// ============================================================================

/**
 * Calculate parasitic capacitance of coil
 *
 * Uses calibrated sub-linear model based on real pickup measurements:
 * C_p ≈ C_base × N^α × k_wind × k_pack × k_ins
 *
 * Where α ≈ 0.35 (not 1.0!) because:
 * - Only adjacent turns contribute significantly to inter-turn capacitance
 * - Voltage gradient across layers matters more than total turn count
 * - Layer-to-layer capacitance dominates, not turn-by-turn
 *
 * Calibrated to produce realistic values:
 * - 5000 turns → ~90 pF
 * - 7900 turns → ~110 pF
 * - 10000 turns → ~120 pF
 *
 * @param wire Wire parameters
 * @returns Parasitic capacitance in Farads
 */
export const computeCapacitance = (wire: WireParams): number => {
  const kWind = getKWind(wire.windingStyle)
  const kPack = getKPack(wire.packingFactor)
  const kIns = getKIns(wire.insulation)

  // Sub-linear scaling: C ∝ N^0.35 (not N!)
  // This matches real pickup measurements much better
  const turnsFactor = Math.pow(wire.turns, C_CAPACITANCE_EXPONENT)

  // Calculate capacitance in pF, then convert to Farads
  const capacitancePf = C_CAPACITANCE_BASE * turnsFactor * kWind * kPack * kIns

  return pFToF(capacitancePf)
}

// ============================================================================
// RESONANCE AND Q FACTOR
// ============================================================================

/**
 * Calculate self-resonant frequency
 * f₀ = 1 / (2π√LC)
 *
 * @param inductance Inductance in Henry
 * @param capacitance Capacitance in Farads
 * @returns Resonant frequency in Hz
 */
export const computeResonance = (inductance: number, capacitance: number): number => {
  if (inductance <= 0 || capacitance <= 0) {
    return 0
  }
  return 1 / (2 * Math.PI * Math.sqrt(inductance * capacitance))
}

/**
 * Calculate quality factor at resonance
 * Q = ω₀L / R
 *
 * @param resonantFreq Resonant frequency in Hz
 * @param inductance Inductance in Henry
 * @param resistance DC resistance in Ohms
 * @returns Quality factor (dimensionless)
 */
export const computeQ = (
  resonantFreq: number,
  inductance: number,
  resistance: number
): number => {
  if (resistance <= 0) {
    return Infinity
  }
  const omega0 = 2 * Math.PI * resonantFreq
  return (omega0 * inductance) / resistance
}

// ============================================================================
// MAXIMUM TURNS CALCULATION
// ============================================================================

/**
 * Calculate maximum number of turns that fit in the winding window
 *
 * @param geometry Coil geometry
 * @param wireDiameter Bare wire diameter in mm
 * @param insulation Insulation type
 * @param packingFactor Packing factor (0.5 to 0.9)
 * @returns Maximum estimated turns
 */
export const computeMaxTurns = (
  geometry: CoilGeometry,
  wireDiameter: number,
  insulation: WireParams['insulation'],
  packingFactor: number
): number => {
  // Get total wire diameter with insulation
  const totalDiameter = getTotalWireDiameter(wireDiameter, insulation)
  if (totalDiameter <= 0) return 0

  // Calculate winding window area
  const windingWidth = geometry.outerRadius - geometry.innerRadius
  const windingHeight = geometry.height

  // Reduce by bobbin thickness if specified
  const effectiveWidth = windingWidth - 2 * (geometry.bobbinThickness ?? 0)
  const effectiveHeight = windingHeight - 2 * (geometry.bobbinThickness ?? 0)

  if (effectiveWidth <= 0 || effectiveHeight <= 0) return 0

  // Window area in mm²
  const windowArea = effectiveWidth * effectiveHeight

  // Single wire cross-section area in mm² (including insulation)
  const wireArea = Math.PI * (totalDiameter / 2) * (totalDiameter / 2)

  // Maximum turns = (window area × packing factor) / wire area
  return Math.floor((windowArea * packingFactor) / wireArea)
}

// ============================================================================
// OUTER RADIUS CALCULATION (from turns)
// ============================================================================

/**
 * Calculate outer radius based on number of turns and wire parameters
 * This computes how far the winding extends from the inner radius
 *
 * For cylindrical coils:
 *   Area = π(r_out² - r_in²) = N × A_wire / packing_factor
 *   r_out = √(r_in² + N × A_wire / (π × packing_factor × height / wire_diameter))
 *
 * Simplified approach using layer buildup:
 *   layers = height / wire_diameter × packing_factor (turns per layer)
 *   radial_layers = turns / turns_per_layer
 *   r_out = r_in + radial_layers × wire_diameter / packing_factor
 *
 * @param innerRadius Inner radius in mm
 * @param height Winding height in mm
 * @param turns Number of turns
 * @param bareDiameter Bare wire diameter in mm
 * @param insulation Insulation type
 * @param packingFactor Packing factor (0.5 to 0.9)
 * @returns Computed outer radius in mm
 */
export const computeOuterRadius = (
  innerRadius: number,
  height: number,
  turns: number,
  bareDiameter: number,
  insulation: WireParams['insulation'],
  packingFactor: number
): number => {
  const totalDiameter = getTotalWireDiameter(bareDiameter, insulation)
  if (totalDiameter <= 0 || height <= 0 || turns <= 0) return innerRadius

  // Turns per layer (at least 1 if wire is thicker than height)
  const turnsPerLayer = Math.max(1, Math.floor((height * packingFactor) / totalDiameter))

  // Number of radial layers needed
  const numLayers = Math.ceil(turns / turnsPerLayer)

  // Radial buildup - packing factor only affects multiple layers
  // Single layer = just wire diameter, multiple layers have gaps
  const radialBuildUp = numLayers === 1
    ? totalDiameter
    : numLayers * totalDiameter / Math.sqrt(packingFactor)

  return innerRadius + radialBuildUp
}

/**
 * Calculate outer width for rectangular/flatwork coils
 * Uses similar logic but for rectangular cross-section
 *
 * @param innerWidth Inner winding dimension in mm
 * @param height Winding height in mm
 * @param turns Number of turns
 * @param bareDiameter Bare wire diameter in mm
 * @param insulation Insulation type
 * @param packingFactor Packing factor
 * @returns Computed outer width in mm
 */
export const computeOuterWidth = (
  innerWidth: number,
  height: number,
  turns: number,
  bareDiameter: number,
  insulation: WireParams['insulation'],
  packingFactor: number
): number => {
  const totalDiameter = getTotalWireDiameter(bareDiameter, insulation)
  if (totalDiameter <= 0 || height <= 0 || turns <= 0) return innerWidth

  // Turns per layer in height direction (at least 1 if wire is thicker than height)
  const turnsPerLayer = Math.max(1, Math.floor((height * packingFactor) / totalDiameter))

  // Number of width layers needed
  const numLayers = Math.ceil(turns / turnsPerLayer)

  // Width buildup - packing factor only affects multiple layers
  // Single layer = just wire diameter, multiple layers have gaps
  const widthBuildUp = numLayers === 1
    ? totalDiameter
    : numLayers * totalDiameter / Math.sqrt(packingFactor)

  return innerWidth + widthBuildUp
}

// ============================================================================
// COIL VOLUME
// ============================================================================

/**
 * Calculate coil winding volume
 *
 * @param geometry Coil geometry
 * @returns Volume in mm³
 */
export const computeCoilVolume = (geometry: CoilGeometry): number => {
  switch (geometry.form) {
    case 'cylindrical': {
      // Hollow cylinder volume
      const rOut = geometry.outerRadius
      const rIn = geometry.innerRadius
      return Math.PI * (rOut * rOut - rIn * rIn) * geometry.height
    }

    case 'rectangular':
    case 'flatwork': {
      // Box volume
      const width = geometry.outerRadius - geometry.innerRadius
      const length = geometry.length ?? geometry.height
      return width * length * geometry.height
    }

    default:
      return 0
  }
}

// ============================================================================
// MAIN COMPUTATION FUNCTION
// ============================================================================

/**
 * Compute all coil electrical parameters
 *
 * @param geometry Coil geometry parameters
 * @param wire Wire and winding parameters
 * @returns Complete coil computation results
 */
export const computeCoilResults = (
  geometry: CoilGeometry,
  wire: WireParams
): CoilComputedResults => {
  // Geometry calculations
  const meanTurnLength = computeMeanTurnLength(geometry)
  const totalWireLength = computeTotalWireLength(geometry, wire.turns)
  const coilVolume = computeCoilVolume(geometry)

  // Electrical calculations
  const dcResistance = computeRdc(totalWireLength, wire.wireDiameter, wire.temperature, wire.copperGrade)
  const inductance = computeInductance(geometry, wire.turns)
  const capacitance = computeCapacitance(wire)
  const resonantFrequency = computeResonance(inductance, capacitance)
  const qualityFactor = computeQ(resonantFrequency, inductance, dcResistance)

  // Maximum turns
  const maxTurns = computeMaxTurns(geometry, wire.wireDiameter, wire.insulation, wire.packingFactor)

  // Computed outer radius based on actual turns
  const computedOuterRadius = geometry.form === 'cylindrical'
    ? computeOuterRadius(
        geometry.innerRadius,
        geometry.height,
        wire.turns,
        wire.wireDiameter,
        wire.insulation,
        wire.packingFactor
      )
    : computeOuterWidth(
        geometry.innerRadius, // used as inner width for rectangular/flatwork
        geometry.height,
        wire.turns,
        wire.wireDiameter,
        wire.insulation,
        wire.packingFactor
      )

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
