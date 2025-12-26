/**
 * Wire Templates Database
 *
 * Common commercial magnet wire specifications for guitar pickups and transformers.
 * Users can select a template to auto-fill wire parameters.
 */

import type {
  WireMaterial,
  CopperGrade,
  StrandType,
  InsulationType,
  InsulationClass,
} from '@/domain/types'

/** Wire template specification */
export interface WireTemplate {
  /** Unique template ID */
  id: string

  /** Display name */
  name: string

  /** Description */
  description: string

  /** Category for grouping */
  category: 'pickup' | 'transformer' | 'premium'

  // Physical properties
  /** AWG gauge (for reference) */
  awg: number

  /** Bare conductor diameter in mm */
  bareDiameter: number

  /** Strand configuration */
  strandType: StrandType

  /** Number of strands (for stranded/litz) */
  strandCount?: number

  // Material
  /** Conductor material */
  material: WireMaterial

  /** Copper grade/purity */
  copperGrade: CopperGrade

  // Insulation
  /** Insulation type */
  insulation: InsulationType

  /** Insulation thickness per side in mm */
  insulationThickness: number

  /** Temperature class */
  insulationClass: InsulationClass

  // Computed values
  /** Total diameter (bare + 2×insulation) in mm */
  totalDiameter: number

  /** Resistance per meter at 20°C in Ω/m */
  resistancePerMeter: number
}

/**
 * Wire templates database
 */
export const WIRE_TEMPLATES: WireTemplate[] = [
  // ============================================================================
  // PICKUP WIRE (AWG 40-46, thin, solid)
  // ============================================================================

  // AWG 42 variants - most common
  {
    id: 'pe42',
    name: 'AWG 42 Plain Enamel',
    description: 'Classic humbucker wire, vintage PAF tone',
    category: 'pickup',
    awg: 42,
    bareDiameter: 0.0635,
    strandType: 'solid',
    material: 'copper',
    copperGrade: 'standard',
    insulation: 'plain_enamel',
    insulationThickness: 0.005,
    insulationClass: 'A',
    totalDiameter: 0.0735,
    resistancePerMeter: 5.443,
  },
  {
    id: 'hf42',
    name: 'AWG 42 Heavy Formvar',
    description: '50s-60s Fender style, bright & clear',
    category: 'pickup',
    awg: 42,
    bareDiameter: 0.0635,
    strandType: 'solid',
    material: 'copper',
    copperGrade: 'standard',
    insulation: 'heavy_formvar',
    insulationThickness: 0.010,
    insulationClass: 'A',
    totalDiameter: 0.0835,
    resistancePerMeter: 5.443,
  },
  {
    id: 'spn42',
    name: 'AWG 42 Poly-Nylon',
    description: 'Modern consistent, solder-strippable',
    category: 'pickup',
    awg: 42,
    bareDiameter: 0.0635,
    strandType: 'solid',
    material: 'copper',
    copperGrade: 'standard',
    insulation: 'poly_nylon',
    insulationThickness: 0.007,
    insulationClass: 'B',
    totalDiameter: 0.0775,
    resistancePerMeter: 5.443,
  },
  {
    id: 'poly42',
    name: 'AWG 42 Polyurethane',
    description: 'Modern standard, low capacitance',
    category: 'pickup',
    awg: 42,
    bareDiameter: 0.0635,
    strandType: 'solid',
    material: 'copper',
    copperGrade: 'standard',
    insulation: 'poly',
    insulationThickness: 0.007,
    insulationClass: 'B',
    totalDiameter: 0.0775,
    resistancePerMeter: 5.443,
  },

  // AWG 43 - hot wound
  {
    id: 'pe43',
    name: 'AWG 43 Plain Enamel',
    description: 'Hot wound pickups, Tele neck',
    category: 'pickup',
    awg: 43,
    bareDiameter: 0.0559,
    strandType: 'solid',
    material: 'copper',
    copperGrade: 'standard',
    insulation: 'plain_enamel',
    insulationThickness: 0.005,
    insulationClass: 'A',
    totalDiameter: 0.0659,
    resistancePerMeter: 7.035,
  },
  {
    id: 'hf43',
    name: 'AWG 43 Heavy Formvar',
    description: 'Vintage Strat bridge, articulate',
    category: 'pickup',
    awg: 43,
    bareDiameter: 0.0559,
    strandType: 'solid',
    material: 'copper',
    copperGrade: 'standard',
    insulation: 'heavy_formvar',
    insulationThickness: 0.010,
    insulationClass: 'A',
    totalDiameter: 0.0759,
    resistancePerMeter: 7.035,
  },

  // AWG 44 - compact coils
  {
    id: 'pe44',
    name: 'AWG 44 Plain Enamel',
    description: 'Compact high-turn coils, mini humbuckers',
    category: 'pickup',
    awg: 44,
    bareDiameter: 0.0508,
    strandType: 'solid',
    material: 'copper',
    copperGrade: 'standard',
    insulation: 'plain_enamel',
    insulationThickness: 0.005,
    insulationClass: 'A',
    totalDiameter: 0.0608,
    resistancePerMeter: 8.498,
  },

  // AWG 41 - lower DCR
  {
    id: 'pe41',
    name: 'AWG 41 Plain Enamel',
    description: 'Lower DCR, cleaner tone',
    category: 'pickup',
    awg: 41,
    bareDiameter: 0.0711,
    strandType: 'solid',
    material: 'copper',
    copperGrade: 'standard',
    insulation: 'plain_enamel',
    insulationThickness: 0.005,
    insulationClass: 'A',
    totalDiameter: 0.0811,
    resistancePerMeter: 4.345,
  },

  // ============================================================================
  // TRANSFORMER WIRE (AWG 24-38, thicker, solid/litz)
  // ============================================================================

  {
    id: 'hf26',
    name: 'AWG 26 Heavy Formvar',
    description: 'Output transformer primary',
    category: 'transformer',
    awg: 26,
    bareDiameter: 0.405,
    strandType: 'solid',
    material: 'copper',
    copperGrade: 'standard',
    insulation: 'heavy_formvar',
    insulationThickness: 0.010,
    insulationClass: 'A',
    totalDiameter: 0.425,
    resistancePerMeter: 0.134,
  },
  {
    id: 'hf30',
    name: 'AWG 30 Heavy Formvar',
    description: 'Output transformer secondary',
    category: 'transformer',
    awg: 30,
    bareDiameter: 0.255,
    strandType: 'solid',
    material: 'copper',
    copperGrade: 'standard',
    insulation: 'heavy_formvar',
    insulationThickness: 0.010,
    insulationClass: 'A',
    totalDiameter: 0.275,
    resistancePerMeter: 0.338,
  },
  {
    id: 'hf34',
    name: 'AWG 34 Heavy Formvar',
    description: 'Medium power transformer',
    category: 'transformer',
    awg: 34,
    bareDiameter: 0.160,
    strandType: 'solid',
    material: 'copper',
    copperGrade: 'standard',
    insulation: 'heavy_formvar',
    insulationThickness: 0.010,
    insulationClass: 'A',
    totalDiameter: 0.180,
    resistancePerMeter: 0.856,
  },

  // Litz wire
  {
    id: 'litz42x7',
    name: 'Litz 42 AWG × 7',
    description: 'Low HF losses, hi-fi transformers',
    category: 'transformer',
    awg: 42,
    bareDiameter: 0.190, // Bundle diameter approx
    strandType: 'litz',
    strandCount: 7,
    material: 'copper',
    copperGrade: 'standard',
    insulation: 'poly_nylon',
    insulationThickness: 0.015,
    insulationClass: 'B',
    totalDiameter: 0.220,
    resistancePerMeter: 0.778, // 5.443 / 7
  },
  {
    id: 'litz44x19',
    name: 'Litz 44 AWG × 19',
    description: 'Ultra-low loss, premium transformers',
    category: 'transformer',
    awg: 44,
    bareDiameter: 0.250, // Bundle diameter approx
    strandType: 'litz',
    strandCount: 19,
    material: 'copper',
    copperGrade: 'standard',
    insulation: 'poly_nylon',
    insulationThickness: 0.020,
    insulationClass: 'B',
    totalDiameter: 0.290,
    resistancePerMeter: 0.447, // 8.498 / 19
  },

  // ============================================================================
  // PREMIUM / SPECIAL
  // ============================================================================

  {
    id: 'ofc42pe',
    name: 'AWG 42 OFC Plain Enamel',
    description: 'Oxygen-free copper, premium clarity',
    category: 'premium',
    awg: 42,
    bareDiameter: 0.0635,
    strandType: 'solid',
    material: 'copper',
    copperGrade: 'ofc',
    insulation: 'plain_enamel',
    insulationThickness: 0.005,
    insulationClass: 'A',
    totalDiameter: 0.0735,
    resistancePerMeter: 5.416, // ~0.5% lower
  },
  {
    id: 'occ42pe',
    name: 'AWG 42 OCC Plain Enamel',
    description: 'Single crystal copper, ultimate purity',
    category: 'premium',
    awg: 42,
    bareDiameter: 0.0635,
    strandType: 'solid',
    material: 'copper',
    copperGrade: 'occ',
    insulation: 'plain_enamel',
    insulationThickness: 0.005,
    insulationClass: 'A',
    totalDiameter: 0.0735,
    resistancePerMeter: 5.389, // ~1% lower
  },
]

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: WireTemplate['category']): WireTemplate[] => {
  return WIRE_TEMPLATES.filter((t) => t.category === category)
}

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): WireTemplate | undefined => {
  return WIRE_TEMPLATES.find((t) => t.id === id)
}

/**
 * Find matching template for current wire parameters
 */
export const findMatchingTemplate = (
  wireDiameter: number,
  insulation: InsulationType,
  copperGrade: CopperGrade,
  strandType: StrandType,
  tolerance = 0.002
): WireTemplate | undefined => {
  return WIRE_TEMPLATES.find(
    (t) =>
      Math.abs(t.bareDiameter - wireDiameter) <= tolerance &&
      t.insulation === insulation &&
      t.copperGrade === copperGrade &&
      t.strandType === strandType
  )
}

/**
 * Temperature class ratings (NEMA)
 */
export const INSULATION_CLASS_TEMPS: Record<InsulationClass, number> = {
  A: 105,
  B: 130,
  F: 155,
  H: 180,
  N: 200,
}

/**
 * Get temperature rating for insulation class
 */
export const getInsulationClassTemp = (insulationClass: InsulationClass): number => {
  return INSULATION_CLASS_TEMPS[insulationClass]
}

/**
 * Copper grade resistivity multipliers (relative to standard)
 */
export const COPPER_GRADE_FACTORS: Record<CopperGrade, number> = {
  standard: 1.0,
  ofc: 0.995, // ~0.5% lower resistivity
  occ: 0.99,  // ~1% lower resistivity
}
