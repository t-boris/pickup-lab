/**
 * AWG Wire Gauge Table
 * Standard American Wire Gauge specifications for pickup coil wire
 *
 * Contains bare conductor diameter and insulation thickness for various types
 * All dimensions in millimeters
 */

import type { InsulationType, CopperGrade } from '@/domain/types'

/** AWG wire specification */
export interface AwgSpec {
  /** AWG number */
  awg: number

  /** Bare conductor diameter in mm */
  bareDiameter: number

  /** Cross-sectional area in mm² */
  area: number

  /** Resistance per meter at 20°C in Ohms/m (copper) */
  resistancePerMeter: number
}

/** Insulation thickness per type (added to diameter on each side) */
export interface InsulationSpec {
  /** Insulation type */
  type: InsulationType

  /** Additional thickness per side in mm */
  thickness: number

  /** Dielectric constant (affects Cp) */
  dielectricConstant: number

  /** Display name */
  name: string
}

/**
 * Standard AWG specifications (AWG 18-46)
 * Based on ASTM B 258 standard
 * Formula: d = 0.127 × 92^((36-n)/39) mm
 * Area = π × (d/2)²
 * Resistance = ρ / A (copper ρ = 1.724e-8 Ω·m at 20°C)
 */
export const AWG_TABLE: AwgSpec[] = [
  // Thicker wire (for transformers, low-turn coils)
  { awg: 18, bareDiameter: 1.024, area: 0.823, resistancePerMeter: 0.0209 },
  { awg: 19, bareDiameter: 0.912, area: 0.653, resistancePerMeter: 0.0264 },
  { awg: 20, bareDiameter: 0.812, area: 0.518, resistancePerMeter: 0.0333 },
  { awg: 21, bareDiameter: 0.723, area: 0.411, resistancePerMeter: 0.0420 },
  { awg: 22, bareDiameter: 0.644, area: 0.326, resistancePerMeter: 0.0530 },
  { awg: 23, bareDiameter: 0.573, area: 0.258, resistancePerMeter: 0.0668 },
  { awg: 24, bareDiameter: 0.511, area: 0.205, resistancePerMeter: 0.0842 },
  { awg: 25, bareDiameter: 0.455, area: 0.162, resistancePerMeter: 0.106 },
  { awg: 26, bareDiameter: 0.405, area: 0.129, resistancePerMeter: 0.134 },
  { awg: 27, bareDiameter: 0.361, area: 0.102, resistancePerMeter: 0.169 },
  { awg: 28, bareDiameter: 0.321, area: 0.0810, resistancePerMeter: 0.213 },
  { awg: 29, bareDiameter: 0.286, area: 0.0642, resistancePerMeter: 0.268 },
  { awg: 30, bareDiameter: 0.255, area: 0.0510, resistancePerMeter: 0.338 },
  { awg: 31, bareDiameter: 0.227, area: 0.0404, resistancePerMeter: 0.426 },
  { awg: 32, bareDiameter: 0.202, area: 0.0320, resistancePerMeter: 0.538 },
  { awg: 33, bareDiameter: 0.180, area: 0.0254, resistancePerMeter: 0.679 },
  { awg: 34, bareDiameter: 0.160, area: 0.0201, resistancePerMeter: 0.856 },
  { awg: 35, bareDiameter: 0.143, area: 0.0160, resistancePerMeter: 1.08 },
  { awg: 36, bareDiameter: 0.127, area: 0.0127, resistancePerMeter: 1.36 },
  { awg: 37, bareDiameter: 0.113, area: 0.0100, resistancePerMeter: 1.72 },
  // Standard pickup wire
  { awg: 38, bareDiameter: 0.1016, area: 0.00811, resistancePerMeter: 2.127 },
  { awg: 39, bareDiameter: 0.0897, area: 0.00632, resistancePerMeter: 2.729 },
  { awg: 40, bareDiameter: 0.0787, area: 0.00487, resistancePerMeter: 3.543 },
  { awg: 41, bareDiameter: 0.0711, area: 0.00397, resistancePerMeter: 4.345 },
  { awg: 42, bareDiameter: 0.0635, area: 0.00317, resistancePerMeter: 5.443 },
  { awg: 43, bareDiameter: 0.0559, area: 0.00245, resistancePerMeter: 7.035 },
  { awg: 44, bareDiameter: 0.0508, area: 0.00203, resistancePerMeter: 8.498 },
  { awg: 45, bareDiameter: 0.0445, area: 0.00156, resistancePerMeter: 11.07 },
  { awg: 46, bareDiameter: 0.0396, area: 0.00123, resistancePerMeter: 14.00 },
]

/**
 * Insulation specifications
 * Thickness values are per side (total increase = 2 × thickness)
 */
export const INSULATION_TABLE: InsulationSpec[] = [
  {
    type: 'plain_enamel',
    thickness: 0.005,
    dielectricConstant: 3.5,
    name: 'Plain Enamel',
  },
  {
    type: 'heavy_formvar',
    thickness: 0.010,
    dielectricConstant: 3.2,
    name: 'Heavy Formvar',
  },
  {
    type: 'poly',
    thickness: 0.007,
    dielectricConstant: 2.3,
    name: 'Polyurethane',
  },
  {
    type: 'poly_nylon',
    thickness: 0.007,
    dielectricConstant: 2.5,
    name: 'Poly-Nylon',
  },
  {
    type: 'solderable',
    thickness: 0.005,
    dielectricConstant: 3.0,
    name: 'Solderable Enamel',
  },
]

/**
 * Get AWG specification by gauge number
 * @param awg AWG gauge number (38-46)
 * @returns AWG specification or undefined
 */
export const getAwgSpec = (awg: number): AwgSpec | undefined => {
  return AWG_TABLE.find((spec) => spec.awg === awg)
}

/**
 * Find matching AWG for a given bare wire diameter
 * @param diameter Bare wire diameter in mm
 * @param tolerance Tolerance for matching (default 0.002mm)
 * @returns Matching AWG number or null if no match
 */
export const getAwgFromDiameter = (diameter: number, tolerance = 0.002): number | null => {
  const match = AWG_TABLE.find(
    (spec) => Math.abs(spec.bareDiameter - diameter) <= tolerance
  )
  return match?.awg ?? null
}

/**
 * Calculate wire cross-sectional area from diameter
 * @param diameter Bare wire diameter in mm
 * @returns Area in mm²
 */
export const getWireAreaFromDiameter = (diameter: number): number => {
  return Math.PI * (diameter / 2) ** 2
}

/**
 * Get total wire diameter including insulation (from bare diameter)
 * @param bareDiameter Bare wire diameter in mm
 * @param insulation Insulation type
 * @returns Total diameter in mm
 */
export const getTotalWireDiameter = (bareDiameter: number, insulation: InsulationType): number => {
  const insSpec = getInsulationSpec(insulation)
  if (!insSpec) return bareDiameter
  return bareDiameter + 2 * insSpec.thickness
}

/**
 * Get insulation specification by type
 * @param type Insulation type
 * @returns Insulation specification or undefined
 */
export const getInsulationSpec = (type: InsulationType): InsulationSpec | undefined => {
  return INSULATION_TABLE.find((spec) => spec.type === type)
}

/**
 * Calculate total wire diameter including insulation
 * @param awg AWG gauge number
 * @param insulation Insulation type
 * @returns Total diameter in mm, or 0 if not found
 */
export const getWireDiameter = (awg: number, insulation: InsulationType): number => {
  const awgSpec = getAwgSpec(awg)
  const insSpec = getInsulationSpec(insulation)

  if (!awgSpec || !insSpec) return 0

  return awgSpec.bareDiameter + 2 * insSpec.thickness
}

/**
 * Get available AWG options for UI select
 */
export const AWG_OPTIONS = AWG_TABLE.map((spec) => ({
  value: spec.awg,
  label: `AWG ${spec.awg} (${spec.bareDiameter.toFixed(4)} mm)`,
}))

/**
 * Get available insulation options for UI select
 */
export const INSULATION_OPTIONS = INSULATION_TABLE.map((spec) => ({
  value: spec.type,
  label: spec.name,
}))

/**
 * Copper electrical properties
 */
export const COPPER = {
  /** Resistivity at 20°C in Ohm·m */
  resistivity20C: 1.724e-8,

  /** Temperature coefficient of resistance per °C */
  tempCoefficient: 0.00393,

  /** Reference temperature in °C */
  referenceTemp: 20,
} as const

/**
 * Copper grade resistivity factors (relative to standard)
 * Based on purity levels affecting conductivity
 */
export const COPPER_GRADE_FACTORS: Record<CopperGrade, number> = {
  standard: 1.0,    // Regular electrolytic copper (99.9%)
  ofc: 0.995,       // Oxygen-Free Copper (99.99%) - ~0.5% lower resistivity
  occ: 0.99,        // Ohno Continuous Cast (99.9999%) - ~1% lower resistivity
}

/**
 * Calculate copper resistivity at a given temperature and grade
 * @param temperature Temperature in Celsius
 * @param grade Copper grade (standard, ofc, occ)
 * @returns Resistivity in Ohm·m
 */
export const getCopperResistivity = (
  temperature: number,
  grade: CopperGrade = 'standard'
): number => {
  const baseResistivity = COPPER.resistivity20C * COPPER_GRADE_FACTORS[grade]
  return baseResistivity * (1 + COPPER.tempCoefficient * (temperature - COPPER.referenceTemp))
}
