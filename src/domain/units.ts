/**
 * Unit Conversion Utilities
 * All units are stored internally in SI (meters, Farads, Hz, etc.)
 * UI displays in more convenient units (mm, pF, kHz, etc.)
 */

// ============================================================================
// LENGTH CONVERSIONS
// ============================================================================

/** Convert millimeters to meters */
export const mmToM = (mm: number): number => mm * 1e-3

/** Convert meters to millimeters */
export const mToMm = (m: number): number => m * 1e3

/** Convert inches to meters */
export const inchToM = (inch: number): number => inch * 0.0254

/** Convert meters to inches */
export const mToInch = (m: number): number => m / 0.0254

/** Convert millimeters to inches */
export const mmToInch = (mm: number): number => mm / 25.4

/** Convert inches to millimeters */
export const inchToMm = (inch: number): number => inch * 25.4

// ============================================================================
// AREA CONVERSIONS
// ============================================================================

/** Convert mm² to m² */
export const mm2ToM2 = (mm2: number): number => mm2 * 1e-6

/** Convert m² to mm² */
export const m2ToMm2 = (m2: number): number => m2 * 1e6

// ============================================================================
// CAPACITANCE CONVERSIONS
// ============================================================================

/** Convert picofarads to farads */
export const pFToF = (pF: number): number => pF * 1e-12

/** Convert farads to picofarads */
export const fToPF = (f: number): number => f * 1e12

/** Convert nanofarads to farads */
export const nFToF = (nF: number): number => nF * 1e-9

/** Convert farads to nanofarads */
export const fToNF = (f: number): number => f * 1e9

/** Convert microfarads to farads */
export const uFToF = (uF: number): number => uF * 1e-6

/** Convert farads to microfarads */
export const fToUF = (f: number): number => f * 1e6

// ============================================================================
// INDUCTANCE CONVERSIONS
// ============================================================================

/** Convert microhenries to henries */
export const uHToH = (uH: number): number => uH * 1e-6

/** Convert henries to microhenries */
export const hToUH = (h: number): number => h * 1e6

/** Convert millihenries to henries */
export const mHToH = (mH: number): number => mH * 1e-3

/** Convert henries to millihenries */
export const hToMH = (h: number): number => h * 1e3

// ============================================================================
// RESISTANCE CONVERSIONS
// ============================================================================

/** Convert kilohms to ohms */
export const kOhmToOhm = (kOhm: number): number => kOhm * 1e3

/** Convert ohms to kilohms */
export const ohmToKOhm = (ohm: number): number => ohm * 1e-3

/** Convert megohms to ohms */
export const mOhmToOhm = (mOhm: number): number => mOhm * 1e6

/** Convert ohms to megohms */
export const ohmToMOhm = (ohm: number): number => ohm * 1e-6

// ============================================================================
// FREQUENCY CONVERSIONS
// ============================================================================

/** Convert kilohertz to hertz */
export const kHzToHz = (kHz: number): number => kHz * 1e3

/** Convert hertz to kilohertz */
export const hzToKHz = (hz: number): number => hz * 1e-3

// ============================================================================
// MAGNETIC FIELD CONVERSIONS
// ============================================================================

/** Convert millitesla to tesla */
export const mTToT = (mT: number): number => mT * 1e-3

/** Convert tesla to millitesla */
export const tToMT = (t: number): number => t * 1e3

/** Convert gauss to tesla */
export const gaussToT = (gauss: number): number => gauss * 1e-4

/** Convert tesla to gauss */
export const tToGauss = (t: number): number => t * 1e4

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format frequency for display with appropriate unit
 * @param hz Frequency in Hz
 * @returns Formatted string with unit
 */
export const formatFrequency = (hz: number): string => {
  if (hz >= 1e6) {
    return `${(hz / 1e6).toFixed(2)} MHz`
  }
  if (hz >= 1e3) {
    return `${(hz / 1e3).toFixed(2)} kHz`
  }
  return `${hz.toFixed(1)} Hz`
}

/**
 * Format resistance for display with appropriate unit
 * @param ohm Resistance in Ohms
 * @returns Formatted string with unit
 */
export const formatResistance = (ohm: number): string => {
  if (ohm >= 1e6) {
    return `${(ohm / 1e6).toFixed(2)} MΩ`
  }
  if (ohm >= 1e3) {
    return `${(ohm / 1e3).toFixed(2)} kΩ`
  }
  return `${ohm.toFixed(1)} Ω`
}

/**
 * Format inductance for display with appropriate unit
 * @param h Inductance in Henry
 * @returns Formatted string with unit
 */
export const formatInductance = (h: number): string => {
  if (h >= 1) {
    return `${h.toFixed(3)} H`
  }
  if (h >= 1e-3) {
    return `${(h * 1e3).toFixed(2)} mH`
  }
  if (h >= 1e-6) {
    return `${(h * 1e6).toFixed(2)} μH`
  }
  return `${(h * 1e9).toFixed(2)} nH`
}

/**
 * Format capacitance for display with appropriate unit
 * @param f Capacitance in Farads
 * @returns Formatted string with unit
 */
export const formatCapacitance = (f: number): string => {
  if (f >= 1e-6) {
    return `${(f * 1e6).toFixed(2)} μF`
  }
  if (f >= 1e-9) {
    return `${(f * 1e9).toFixed(2)} nF`
  }
  return `${(f * 1e12).toFixed(1)} pF`
}

/**
 * Format magnetic field for display
 * @param t Magnetic field in Tesla
 * @returns Formatted string with unit
 */
export const formatMagneticField = (t: number): string => {
  if (t >= 1) {
    return `${t.toFixed(2)} T`
  }
  return `${(t * 1e3).toFixed(2)} mT`
}

/**
 * Format length based on unit system
 * @param m Length in meters
 * @param system Unit system (metric or imperial)
 * @returns Formatted string with unit
 */
export const formatLength = (m: number, system: 'metric' | 'imperial'): string => {
  if (system === 'imperial') {
    return `${mToInch(m).toFixed(3)} in`
  }
  return `${mToMm(m).toFixed(2)} mm`
}

/**
 * Format dB value
 * @param db Decibel value
 * @returns Formatted string
 */
export const formatDb = (db: number): string => {
  return `${db.toFixed(1)} dB`
}

/**
 * Format phase angle
 * @param deg Phase in degrees
 * @returns Formatted string
 */
export const formatPhase = (deg: number): string => {
  return `${deg.toFixed(1)}°`
}
