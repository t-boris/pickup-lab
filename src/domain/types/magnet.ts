/**
 * Magnet Types
 *
 * Magnet and positioning parameter interfaces.
 */

import type {
  MagnetType,
  MagnetGeometry,
  BladeMaterial,
  PolePieceMaterial,
  CoverType,
  StringMaterial,
} from './enums'

/** Magnet parameters */
export interface MagnetParams {
  /** Magnet material type */
  type: MagnetType

  /** Magnet geometry shape */
  geometry: MagnetGeometry

  /** Magnet diameter in mm (for rod) */
  diameter?: number

  /** Magnet length in mm */
  magnetLength: number

  /** Magnet width in mm (for bar) */
  width?: number

  /** Magnet height/thickness in mm (for bar) */
  magnetHeight?: number

  /** Magnetization level (0 to 1, normalized) */
  magnetization: number

  /** Pole pieces present (separate from magnets) */
  polePieces: boolean

  /** Pole piece material - affects eddy current losses */
  polePieceMaterial: PolePieceMaterial

  /** Cover type - affects high frequency response */
  coverType: CoverType

  // === Blade geometry fields ===

  /** Blade thickness/width in mm (for blade) */
  bladeThickness?: number

  /** Blade height protrusion above coil in mm (for blade) */
  bladeHeight?: number

  /** Blade material (for blade) */
  bladeMaterial?: BladeMaterial

  /** Number of bar magnets under blade (1 or 2) */
  magnetCount?: number
}

/** String and positioning parameters */
export interface PositioningParams {
  /** Distance from string to pole in mm */
  stringToPoleDistance: number

  /** Distance from coil to string in mm */
  coilToStringDistance: number

  /** Pole spacing in mm */
  poleSpacing: number

  /** String diameter in mm */
  stringDiameter: number

  /** String material */
  stringMaterial: StringMaterial
}
