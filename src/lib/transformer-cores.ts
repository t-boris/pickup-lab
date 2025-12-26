/**
 * Transformer Core Database
 * Curated list of transformer cores suitable for pickup transformers
 *
 * All dimensions in SI units (mm², mm, Tesla)
 */

import type { CoreShape, CoreMaterial, CoreMaterialBase } from '@/domain/types'

/** Transformer core specification */
export interface CoreSpec {
  /** Unique identifier */
  id: string

  /** Display name */
  name: string

  /** Core shape */
  shape: CoreShape

  /** Core material */
  material: CoreMaterial

  /** Effective cross-sectional area in mm² */
  effectiveArea: number

  /** Effective magnetic path length in mm */
  effectiveLength: number

  /** Saturation flux density in Tesla */
  saturationFlux: number

  /** Typical effective permeability range [min, max] */
  permeabilityRange: [number, number]

  /** Recommended permeability for calculations */
  typicalPermeability: number

  /** Core loss grade (qualitative) */
  lossGrade: 'low' | 'medium' | 'high'

  /** Description */
  description: string
}

/**
 * Curated transformer core database
 * Focused on cores suitable for audio/pickup transformer applications
 */
export const TRANSFORMER_CORES: CoreSpec[] = [
  // Nanocrystalline Toroids
  {
    id: 'nano_toroid_small',
    name: 'Nanocrystalline Toroid (Small)',
    shape: 'toroid_round',
    material: { base: 'nanocrystalline', variant: 'nc_iron' },
    effectiveArea: 25, // mm²
    effectiveLength: 40, // mm
    saturationFlux: 1.2, // T
    permeabilityRange: [15000, 80000],
    typicalPermeability: 30000,
    lossGrade: 'low',
    description: 'Compact high-permeability core for low-power applications',
  },
  {
    id: 'nano_toroid_medium',
    name: 'Nanocrystalline Toroid (Medium)',
    shape: 'toroid_round',
    material: { base: 'nanocrystalline', variant: 'nc_iron' },
    effectiveArea: 52, // mm²
    effectiveLength: 62, // mm
    saturationFlux: 1.2, // T
    permeabilityRange: [20000, 100000],
    typicalPermeability: 50000,
    lossGrade: 'low',
    description: 'Standard size for pickup transformers, excellent audio performance',
  },
  {
    id: 'nano_toroid_large',
    name: 'Nanocrystalline Toroid (Large)',
    shape: 'toroid_round',
    material: { base: 'nanocrystalline', variant: 'nc_iron' },
    effectiveArea: 100, // mm²
    effectiveLength: 85, // mm
    saturationFlux: 1.2, // T
    permeabilityRange: [30000, 150000],
    typicalPermeability: 80000,
    lossGrade: 'low',
    description: 'Large core for higher power or lower frequency extension',
  },

  // Amorphous Cores
  {
    id: 'amorphous_c_small',
    name: 'Amorphous C-Core (Small)',
    shape: 'c_core',
    material: { base: 'amorphous', variant: 'am_iron' },
    effectiveArea: 30, // mm²
    effectiveLength: 50, // mm
    saturationFlux: 1.56, // T
    permeabilityRange: [1000, 10000],
    typicalPermeability: 5000,
    lossGrade: 'low',
    description: 'Good balance of saturation and permeability',
  },
  {
    id: 'amorphous_c_medium',
    name: 'Amorphous C-Core (Medium)',
    shape: 'c_core',
    material: { base: 'amorphous', variant: 'am_iron' },
    effectiveArea: 65, // mm²
    effectiveLength: 75, // mm
    saturationFlux: 1.56, // T
    permeabilityRange: [1500, 15000],
    typicalPermeability: 8000,
    lossGrade: 'low',
    description: 'Versatile core for various transformer designs',
  },

  // Ferrite Cores
  {
    id: 'ferrite_toroid_small',
    name: 'NiZn Ferrite Toroid (Small)',
    shape: 'toroid_round',
    material: { base: 'ferrite', variant: 'ferrite_nizn' },
    effectiveArea: 20, // mm²
    effectiveLength: 35, // mm
    saturationFlux: 0.35, // T
    permeabilityRange: [125, 850],
    typicalPermeability: 400,
    lossGrade: 'medium',
    description: 'Compact ferrite for high-frequency applications',
  },
  {
    id: 'ferrite_toroid_medium',
    name: 'MnZn Ferrite Toroid (Medium)',
    shape: 'toroid_round',
    material: { base: 'ferrite', variant: 'ferrite_mnzn' },
    effectiveArea: 45, // mm²
    effectiveLength: 55, // mm
    saturationFlux: 0.45, // T
    permeabilityRange: [2000, 5000],
    typicalPermeability: 3000,
    lossGrade: 'medium',
    description: 'Standard ferrite for audio frequency range',
  },
  {
    id: 'ferrite_ei_small',
    name: 'Ferrite EI Core (Small)',
    shape: 'ei_core',
    material: { base: 'ferrite', variant: 'ferrite_mnzn' },
    effectiveArea: 35, // mm²
    effectiveLength: 45, // mm
    saturationFlux: 0.4, // T
    permeabilityRange: [1500, 4000],
    typicalPermeability: 2500,
    lossGrade: 'medium',
    description: 'EI shape for easy winding',
  },

  // Steel Laminated Cores (for reference/comparison)
  {
    id: 'steel_ei_small',
    name: 'Silicon Steel EI (Small)',
    shape: 'ei_core',
    material: { base: 'silicon_steel' },
    effectiveArea: 40, // mm²
    effectiveLength: 60, // mm
    saturationFlux: 1.5, // T
    permeabilityRange: [2000, 8000],
    typicalPermeability: 4000,
    lossGrade: 'high',
    description: 'Traditional laminated steel core',
  },
]

/**
 * Get core specification by ID
 * @param id Core ID
 * @returns Core specification or undefined
 */
export const getCoreSpec = (id: string): CoreSpec | undefined => {
  return TRANSFORMER_CORES.find((core) => core.id === id)
}

/**
 * Get cores by material base type
 * @param materialBase Core material base type (e.g., 'nanocrystalline')
 * @returns Array of matching cores
 */
export const getCoresByMaterial = (materialBase: CoreMaterialBase): CoreSpec[] => {
  return TRANSFORMER_CORES.filter((core) => core.material.base === materialBase)
}

/**
 * Get cores by shape
 * @param shape Core shape type
 * @returns Array of matching cores
 */
export const getCoresByShape = (shape: CoreShape): CoreSpec[] => {
  return TRANSFORMER_CORES.filter((core) => core.shape === shape)
}

/**
 * Get core options for UI select
 */
export const CORE_OPTIONS = TRANSFORMER_CORES.map((core) => ({
  value: core.id,
  label: core.name,
  material: core.material,
  shape: core.shape,
}))

/**
 * Material base display names
 */
export const MATERIAL_NAMES: Record<CoreMaterialBase, string> = {
  nanocrystalline: 'Nanocrystalline',
  amorphous: 'Amorphous',
  ferrite: 'Ferrite',
  silicon_steel: 'Silicon Steel',
}

/**
 * Shape display names
 */
export const SHAPE_NAMES: Record<CoreShape, string> = {
  toroid_round: 'Toroid (Round)',
  toroid_oval: 'Toroid (Oval)',
  c_core: 'C-Core',
  ei_core: 'EI Core',
}

/**
 * Default custom core values for manual entry
 */
export const DEFAULT_CUSTOM_CORE: Omit<CoreSpec, 'id' | 'name' | 'description'> = {
  shape: 'toroid_round',
  material: { base: 'nanocrystalline', variant: 'nc_iron' },
  effectiveArea: 50,
  effectiveLength: 60,
  saturationFlux: 1.2,
  permeabilityRange: [20000, 100000],
  typicalPermeability: 50000,
  lossGrade: 'low',
}
