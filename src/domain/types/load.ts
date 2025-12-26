/**
 * Load Types
 *
 * Load and wiring parameter interfaces.
 */

/** Load and wiring parameters */
export interface LoadParams {
  /** Volume potentiometer value in Ohms */
  volumePot: number

  /** Volume pot position (0 = off, 1 = full) */
  volumePosition: number

  /** Tone potentiometer value in Ohms */
  tonePot: number

  /** Tone capacitor value in Farads */
  toneCapacitor: number

  /** Tone control position (0 to 1, 0 = full treble, 1 = full bass) */
  tonePosition: number

  /** Cable capacitance per meter in Farads/m */
  cableCapacitancePerMeter: number

  /** Cable length in meters */
  cableLength: number

  /** Amplifier input impedance in Ohms */
  ampInputImpedance: number
}
