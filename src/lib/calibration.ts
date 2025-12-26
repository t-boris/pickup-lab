/**
 * Calibration Coefficients and Model Parameters
 *
 * These coefficients are used in the v1 physics model for parameters
 * that cannot be calculated analytically without FEM simulation.
 *
 * Values are empirically derived defaults that produce reasonable results.
 * They can be calibrated against measurements in v2.
 */

import type {
  WindingStyle,
  InsulationType,
  MagnetType,
  CoreMaterial,
  NanocrystallineType,
  AmorphousType,
  FerriteType,
} from '@/domain/types'

// ============================================================================
// CAPACITANCE MODEL COEFFICIENTS
// ============================================================================

/**
 * Capacitance model calibrated against real pickup measurements.
 *
 * OLD (incorrect): C_p ≈ C_base × N (linear scaling - produces ~5000 pF!)
 * NEW (calibrated): C_p ≈ C_base × N^α (sub-linear scaling - produces ~100 pF)
 *
 * Real pickup capacitance values:
 * - Fender single-coil (7500-8200 turns): 80-120 pF
 * - P90 (9500-10500 turns): 100-150 pF
 * - PAF humbucker (5000-5500 turns): 90-130 pF
 *
 * The sub-linear scaling reflects that only adjacent turns contribute
 * significantly to inter-turn capacitance, and voltage gradients matter
 * more than total turn count.
 *
 * C_p ≈ C_BASE × N^C_EXPONENT × k_wind × k_pack × k_ins
 */
export const C_CAPACITANCE_BASE = 8.0 // pF - base coefficient
export const C_CAPACITANCE_EXPONENT = 0.35 // sub-linear scaling exponent

/**
 * @deprecated Use C_CAPACITANCE_BASE instead
 */
export const C_TURN_BASE = C_CAPACITANCE_BASE

/**
 * Winding style coefficients for capacitance calculation
 * Affects how much inter-turn capacitance is generated
 *
 * - scatter: Less organized, fewer adjacent contacts
 * - random: Somewhat organized, moderate contacts
 * - layered: Highly organized, many adjacent contacts
 */
export const K_WIND: Record<WindingStyle, { min: number; max: number; typical: number }> = {
  scatter: { min: 0.6, max: 0.85, typical: 0.75 },
  random: { min: 0.85, max: 1.05, typical: 0.95 },
  layered: { min: 1.1, max: 1.4, typical: 1.25 },
}

/**
 * Get k_wind coefficient for a winding style
 * @param style Winding style
 * @returns Typical k_wind value
 */
export const getKWind = (style: WindingStyle): number => K_WIND[style].typical

/**
 * Insulation type coefficients for capacitance calculation
 * Thicker insulation = lower capacitance
 */
export const K_INS: Record<InsulationType, number> = {
  plain_enamel: 1.0,
  heavy_formvar: 0.9,   // Thicker insulation reduces Cp
  poly: 0.95,
  poly_nylon: 0.93,     // Thicker than poly, solder-strippable
  solderable: 0.98,     // Similar to plain enamel
}

/**
 * Get k_ins coefficient for insulation type
 * @param insulation Insulation type
 * @returns k_ins value
 */
export const getKIns = (insulation: InsulationType): number => K_INS[insulation]

/**
 * Calculate packing factor coefficient for capacitance
 * Higher packing = more contact = higher capacitance
 *
 * k_pack = 0.7 + 1.0 × (packing - 0.5)
 * Range: 0.7 (at packing=0.5) to 1.1 (at packing=0.9)
 *
 * @param packingFactor Packing factor (0.5 to 0.9)
 * @returns k_pack coefficient
 */
export const getKPack = (packingFactor: number): number => {
  return 0.7 + 1.0 * (packingFactor - 0.5)
}

// ============================================================================
// COUPLING FACTOR COEFFICIENTS
// ============================================================================

/**
 * Magnetic coupling factor ranges by pickup configuration
 * Represents how effectively the magnetic field couples with the coil
 *
 * This is highly dependent on geometry and is best calibrated against measurements.
 */
export interface CouplingRange {
  min: number
  max: number
  typical: number
  description: string
}

export const K_COUPLING: Record<string, CouplingRange> = {
  /** Single coil with rod magnets (Fender-style) */
  sc_rod: {
    min: 0.25,
    max: 0.45,
    typical: 0.35,
    description: 'Single coil with rod magnets',
  },

  /** Single coil with bar magnet and steel poles (P90-style) */
  sc_bar_poles: {
    min: 0.35,
    max: 0.6,
    typical: 0.48,
    description: 'Single coil with bar magnet and steel pole pieces',
  },

  /** Humbucker half (PAF-style) */
  humbucker: {
    min: 0.45,
    max: 0.75,
    typical: 0.6,
    description: 'Humbucker coil with concentrated flux',
  },

  /** Stacked coil design */
  stacked: {
    min: 0.3,
    max: 0.55,
    typical: 0.42,
    description: 'Stacked coil design',
  },

  /** Default/custom */
  custom: {
    min: 0.2,
    max: 0.8,
    typical: 0.4,
    description: 'Custom configuration',
  },
}

/**
 * Get coupling factor for a configuration
 * @param config Configuration key
 * @returns Typical coupling factor
 */
export const getKCoupling = (config: keyof typeof K_COUPLING): number => {
  return K_COUPLING[config].typical
}

// ============================================================================
// MUTUAL INDUCTANCE COEFFICIENTS
// ============================================================================

/**
 * Mutual inductance coupling factor for multi-coil configurations
 * Used in M = k × √(L₁ × L₂)
 */
export const K_MUTUAL: Record<string, { min: number; max: number; typical: number }> = {
  /** Humbucker side-by-side coils */
  humbucker_side: {
    min: 0.6,
    max: 0.9,
    typical: 0.75,
  },

  /** Stacked coils (top/bottom) */
  stacked: {
    min: 0.85,
    max: 0.98,
    typical: 0.92,
  },

  /** Widely spaced coils */
  spaced: {
    min: 0.1,
    max: 0.4,
    typical: 0.25,
  },
}

/**
 * Get mutual inductance coefficient
 * @param config Configuration key
 * @returns Typical k_mutual value
 */
export const getKMutual = (config: keyof typeof K_MUTUAL): number => {
  return K_MUTUAL[config].typical
}

// ============================================================================
// MAGNET PROPERTIES
// ============================================================================

/**
 * Magnet material properties
 * Br = remanent flux density (typical, in Tesla)
 */
export interface MagnetProperties {
  /** Remanent flux density in Tesla */
  Br: number

  /** Display name */
  name: string

  /** Description */
  description: string
}

export const MAGNET_PROPERTIES: Record<MagnetType, MagnetProperties> = {
  alnico2: {
    Br: 0.72,
    name: 'AlNiCo 2',
    description: 'Softer, warmer tone, lower output',
  },
  alnico3: {
    Br: 0.70,
    name: 'AlNiCo 3',
    description: 'Mellow tone, vintage character',
  },
  alnico5: {
    Br: 1.28,
    name: 'AlNiCo 5',
    description: 'Strong, bright, classic rock tone',
  },
  alnico8: {
    Br: 0.92,
    name: 'AlNiCo 8',
    description: 'High output, aggressive tone',
  },
  ferrite: {
    Br: 0.42,
    name: 'Ceramic/Ferrite',
    description: 'Bright, percussive, high output',
  },
  neodymium: {
    Br: 1.35,
    name: 'Neodymium',
    description: 'Very strong, modern high-output',
  },
}

/**
 * Get magnet properties
 * @param type Magnet type
 * @returns Magnet properties
 */
export const getMagnetProperties = (type: MagnetType): MagnetProperties => {
  return MAGNET_PROPERTIES[type]
}

// ============================================================================
// STRING PULL INDEX PARAMETERS
// ============================================================================

/**
 * String pull index exponent for distance scaling
 * SPI ∝ B² / distance^n
 */
export const STRING_PULL_EXPONENT = 2.5

/**
 * String pull warning thresholds
 * Based on normalized SPI (0 to 1 scale)
 */
export const STRING_PULL_THRESHOLDS = {
  /** Below this is safe (green zone) */
  safe: 0.4,

  /** Above this is danger (red zone) */
  danger: 0.7,
} as const

// ============================================================================
// PHYSICAL CONSTANTS
// ============================================================================

export const PHYSICS = {
  /** Permeability of free space (H/m) */
  MU_0: 4 * Math.PI * 1e-7,

  /** Speed of light (m/s) */
  C: 299792458,

  /** Reference temperature for resistivity (°C) */
  T_REF: 20,
} as const

// ============================================================================
// TRANSFORMER CORE MATERIAL PROPERTIES
// ============================================================================

/**
 * Core material electromagnetic properties
 */
export interface CoreMaterialProperties {
  /** Initial/maximum relative permeability µr */
  permeability: number

  /** Saturation flux density Bsat in Tesla */
  saturationFlux: number

  /** Core loss coefficient (relative, 1.0 = baseline) */
  lossCoefficient: number

  /** Display name */
  name: string

  /** Description */
  description: string
}

/**
 * Nanocrystalline material properties
 * High permeability, good for audio transformers
 */
export const NANOCRYSTALLINE_PROPERTIES: Record<NanocrystallineType, CoreMaterialProperties> = {
  nc_iron: {
    permeability: 80000,
    saturationFlux: 1.23,
    lossCoefficient: 0.3,
    name: 'Nanocrystalline Fe (Finemet/Vitroperm)',
    description: 'Iron-based nanocrystalline. Very high µr, excellent audio performance.',
  },
  nc_cobalt: {
    permeability: 150000,
    saturationFlux: 0.8,
    lossCoefficient: 0.25,
    name: 'Nanocrystalline Co',
    description: 'Cobalt-based nanocrystalline. Highest µr, lower Bsat.',
  },
}

/**
 * Amorphous metal properties
 * Good balance of properties, lower cost than nanocrystalline
 */
export const AMORPHOUS_PROPERTIES: Record<AmorphousType, CoreMaterialProperties> = {
  am_iron: {
    permeability: 30000,
    saturationFlux: 1.56,
    lossCoefficient: 0.5,
    name: 'Amorphous Fe (Metglas 2605)',
    description: 'Iron-based amorphous. High Bsat, good audio performance.',
  },
  am_cobalt: {
    permeability: 120000,
    saturationFlux: 0.57,
    lossCoefficient: 0.35,
    name: 'Amorphous Co (Metglas 2714)',
    description: 'Cobalt-based amorphous. Very high µr, low Bsat.',
  },
}

/**
 * Ferrite ceramic properties
 * Lower permeability but very low losses at high frequency
 */
export const FERRITE_PROPERTIES: Record<FerriteType, CoreMaterialProperties> = {
  ferrite_mnzn: {
    permeability: 5000,
    saturationFlux: 0.45,
    lossCoefficient: 0.8,
    name: 'MnZn Ferrite',
    description: 'Manganese-Zinc ferrite. Low frequency (<2MHz), moderate µr.',
  },
  ferrite_nizn: {
    permeability: 500,
    saturationFlux: 0.35,
    lossCoefficient: 0.6,
    name: 'NiZn Ferrite',
    description: 'Nickel-Zinc ferrite. High frequency (>1MHz), lower µr.',
  },
}

/**
 * Silicon steel properties
 * Traditional laminated core material
 */
export const SILICON_STEEL_PROPERTIES: CoreMaterialProperties = {
  permeability: 4000,
  saturationFlux: 1.8,
  lossCoefficient: 1.5,
  name: 'Grain-Oriented Silicon Steel',
  description: 'Traditional laminated steel. High Bsat, higher losses.',
}

/**
 * Get core material properties from CoreMaterial type
 */
export const getCoreMaterialProperties = (material: CoreMaterial): CoreMaterialProperties => {
  if (material.base === 'nanocrystalline') {
    return NANOCRYSTALLINE_PROPERTIES[material.variant]
  } else if (material.base === 'amorphous') {
    return AMORPHOUS_PROPERTIES[material.variant]
  } else if (material.base === 'ferrite') {
    return FERRITE_PROPERTIES[material.variant]
  } else {
    return SILICON_STEEL_PROPERTIES
  }
}

/**
 * Get display name for core material
 */
export const getCoreMaterialName = (material: CoreMaterial): string => {
  return getCoreMaterialProperties(material).name
}

// ============================================================================
// MODEL VERSION
// ============================================================================

export const MODEL_VERSION = 'v1.0'
