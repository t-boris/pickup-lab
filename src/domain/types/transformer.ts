/**
 * Transformer Types
 *
 * Transformer core, winding, and parasitic parameter interfaces.
 */

import type {
  CoreShape,
  CoreMaterial,
  PrimaryWindingType,
  ConductorMaterial,
} from './enums'

/** Toroid geometry (for dimension-based input) */
export interface ToroidGeometry {
  /** Inner diameter in mm */
  innerDiameter: number
  /** Outer diameter in mm */
  outerDiameter: number
  /** Core height in mm */
  height: number
  /** For oval: straight section length in mm (0 for round) */
  straightLength?: number
}

/** Transformer core parameters */
export interface TransformerCoreParams {
  /** Core shape */
  shape: CoreShape

  /** Core material with variant */
  material: CoreMaterial

  /** Toroid dimensions (if shape is toroid_*) */
  toroidGeometry?: ToroidGeometry

  /** Effective cross-sectional area Ae in mm² (auto-calculated or manual) */
  effectiveArea: number

  /** Effective magnetic path length Le in mm (auto-calculated or manual) */
  effectiveLength: number

  /** Air gap in mm (0 for closed core) */
  airGap: number
}

/** Primary winding conductor parameters */
export interface PrimaryWindingConductor {
  /** Conductor type */
  type: PrimaryWindingType

  /** Conductor material (copper grade matters for both wire and plate) */
  material: ConductorMaterial

  /** Wire gauge AWG (if type is 'wire') */
  wireAwg?: number

  /** Plate thickness in mm (if type is 'plate') */
  plateThickness?: number

  /** Plate width in mm (if type is 'plate') */
  plateWidth?: number
}

/** Transformer winding parameters */
export interface TransformerWindingParams {
  /** Number of primary turns */
  primaryTurns: number

  /** Primary conductor specification */
  primaryConductor: PrimaryWindingConductor

  /** Number of secondary turns */
  secondaryTurns: number

  /** Secondary wire gauge (AWG) */
  secondaryAwg: number

  /** Secondary wire material */
  secondaryMaterial: ConductorMaterial

  /** Winding style */
  windingStyle: 'interleaved' | 'non_interleaved'

  /** Electrostatic shielding between windings */
  shielding: boolean
}

/** Computed parasitic parameters (auto-calculated from geometry) */
export interface TransformerParasitics {
  /** Leakage inductance in Henry */
  leakageInductance: number

  /** Interwinding capacitance in Farads */
  interwindingCapacitance: number

  /** Primary winding capacitance in Farads */
  primaryCapacitance: number

  /** Secondary winding capacitance in Farads */
  secondaryCapacitance: number

  /** Primary winding DC resistance in Ohms */
  primaryResistance: number

  /** Secondary winding DC resistance in Ohms */
  secondaryResistance: number
}

/** Complete transformer parameters */
export interface TransformerParams {
  /** Transformer enabled/disabled */
  enabled: boolean

  /** Core parameters */
  core: TransformerCoreParams

  /** Winding parameters */
  winding: TransformerWindingParams
}
