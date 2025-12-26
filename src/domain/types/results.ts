/**
 * Computed Results Types
 *
 * Interfaces for computed values from coil, magnet, transformer, and load.
 */

import type { TransformerParasitics } from './transformer'

/** Coil computed values */
export interface CoilComputedResults {
  /** Mean turn length in meters */
  meanTurnLength: number

  /** Total wire length in meters */
  totalWireLength: number

  /** Coil volume in mm³ */
  coilVolume: number

  /** DC resistance in Ohms */
  dcResistance: number

  /** Inductance in Henry */
  inductance: number

  /** Parasitic capacitance in Farads */
  capacitance: number

  /** Self-resonant frequency in Hz */
  resonantFrequency: number

  /** Quality factor at resonance */
  qualityFactor: number

  /** Maximum estimated turns at current wire + packing */
  maxTurns: number

  /** Computed outer radius/width in mm (based on turns and wire) */
  computedOuterRadius: number
}

/** Magnetic field computed values */
export interface MagnetComputedResults {
  /** B-field at string position in Tesla */
  fieldAtString: number

  /** B-field at coil region in Tesla */
  fieldAtCoil: number

  /** Field gradient in Tesla/meter */
  fieldGradient: number

  /** Sensitivity index (mV/mm) */
  sensitivityIndex: number

  /** String pull index (0 to 1, qualitative) */
  stringPullIndex: number

  /** String pull warning level */
  stringPullWarning: 'safe' | 'caution' | 'danger'
}

/** Transformer computed values */
export interface TransformerComputedResults {
  /** Turns ratio (Ns/Np) */
  turnsRatio: number

  /** Voltage ratio */
  voltageRatio: number

  /** Reflected load impedance at 1kHz */
  reflectedLoad: number

  /** Primary inductance in Henry */
  primaryInductance: number

  /** Effective permeability (considering air gap) */
  effectivePermeability: number

  /** Computed parasitic parameters */
  parasitics: TransformerParasitics

  /** Estimated bandwidth (-3dB) in Hz */
  bandwidth: number

  /** Saturation margin (0 to 1) */
  saturationMargin: number

  /** Core loss estimate */
  coreLossEstimate: 'low' | 'medium' | 'high'

  /** Saturation flux density Bsat in Tesla */
  saturationFlux: number
}

/** Load computed values */
export interface LoadComputedResults {
  /** Total cable capacitance in Farads */
  totalCableCapacitance: number

  /** Effective load resistance in Ohms */
  effectiveLoadResistance: number

  /** Loaded resonance frequency in Hz */
  loadedResonance: number

  /** Loaded Q factor */
  loadedQ: number

  /** Output at 1kHz (relative, 0-1) */
  outputAt1kHz: number

  /** Brightness index (0 to 1) */
  brightnessIndex: number
}

/** Complete system computed results */
export interface ComputedResults {
  coil: CoilComputedResults
  magnet: MagnetComputedResults
  transformer?: TransformerComputedResults
  load: LoadComputedResults

  /** Overall output index (mV RMS, approximate) */
  outputIndex: number
}
