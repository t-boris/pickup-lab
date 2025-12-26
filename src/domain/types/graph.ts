/**
 * Graph and Frequency Response Types
 *
 * Interfaces for complex numbers, frequency response, and graph data.
 */

/** Complex number representation */
export interface Complex {
  real: number
  imag: number
}

/** Frequency response point */
export interface FrequencyPoint {
  /** Frequency in Hz */
  frequency: number

  /** Magnitude (linear) */
  magnitude: number

  /** Magnitude in dB */
  magnitudeDb: number

  /** Phase in degrees */
  phaseDeg: number
}

/** Impedance data point */
export interface ImpedancePoint {
  /** Frequency in Hz */
  frequency: number

  /** Impedance magnitude in Ohms */
  magnitude: number

  /** Phase in degrees */
  phaseDeg: number
}

/** Field vs distance point */
export interface FieldPoint {
  /** Distance in mm */
  distance: number

  /** B-field in mT */
  field: number
}

/** Output vs distance point */
export interface OutputPoint {
  /** Distance in mm */
  distance: number

  /** Output index (relative) */
  output: number
}

/** Complete graph data for a configuration */
export interface GraphData {
  /** Frequency response data */
  frequencyResponse: FrequencyPoint[]

  /** Impedance vs frequency */
  impedance: ImpedancePoint[]

  /** B-field vs distance */
  fieldVsDistance: FieldPoint[]

  /** Output vs distance */
  outputVsDistance: OutputPoint[]
}
