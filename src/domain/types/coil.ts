/**
 * Coil Types
 *
 * Coil geometry, wire, and winding parameter interfaces.
 */

import type {
  CoilForm,
  WireMaterial,
  CopperGrade,
  StrandType,
  InsulationType,
  InsulationClass,
  WindingStyle,
  WiringConfig,
  PhaseConfig,
} from './enums'

/** Coil geometry parameters */
export interface CoilGeometry {
  /** Coil form type */
  form: CoilForm

  /** Inner radius in mm (cylindrical) or inner width (rectangular/flatwork) */
  innerRadius: number

  /** Outer radius in mm (cylindrical) or outer width (rectangular/flatwork) */
  outerRadius: number

  /** Coil height in mm */
  height: number

  /** Coil length in mm (for rectangular/flatwork) */
  length?: number

  /** Bobbin wall thickness in mm (optional) */
  bobbinThickness?: number
}

/** Wire and winding parameters */
export interface WireParams {
  /** Wire material */
  material: WireMaterial

  /** Copper grade/purity (affects resistivity) */
  copperGrade: CopperGrade

  /** Strand configuration */
  strandType: StrandType

  /** Number of strands (for stranded/litz wire) */
  strandCount?: number

  /** Bare wire diameter in mm */
  wireDiameter: number

  /** Insulation type */
  insulation: InsulationType

  /** Insulation temperature class */
  insulationClass: InsulationClass

  /** Number of turns */
  turns: number

  /** Winding style */
  windingStyle: WindingStyle

  /** Packing factor (0.5 to 0.9) */
  packingFactor: number

  /** Operating temperature in Celsius */
  temperature: number
}

/** Complete coil parameters */
export interface CoilParams {
  geometry: CoilGeometry
  wire: WireParams

  /** Coupling factor with magnetic field (0 to 1) */
  couplingFactor: number

  /** Wiring configuration for multi-coil setups */
  wiringConfig: WiringConfig

  /** Phase configuration */
  phaseConfig: PhaseConfig
}
