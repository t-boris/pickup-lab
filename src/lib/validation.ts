/**
 * Validation Module
 *
 * Zod schemas for validating pickup parameters.
 * Includes warning thresholds for unsafe configurations.
 */

import { z } from 'zod'

// ============================================================================
// COIL VALIDATION
// ============================================================================

export const coilGeometrySchema = z.object({
  form: z.enum(['cylindrical', 'rectangular', 'flatwork']),
  innerRadius: z.number().min(0.5, 'Inner radius must be at least 0.5mm'),
  outerRadius: z.number().min(1, 'Outer radius must be at least 1mm'),
  height: z.number().min(1, 'Height must be at least 1mm'),
  length: z.number().optional(),
  bobbinThickness: z.number().min(0).optional(),
}).refine(
  (data) => data.outerRadius > data.innerRadius,
  { message: 'Outer radius must be greater than inner radius', path: ['outerRadius'] }
)

export const wireParamsSchema = z.object({
  material: z.enum(['copper', 'silver']),
  copperGrade: z.enum(['standard', 'ofc', 'occ']),
  strandType: z.enum(['solid', 'stranded', 'litz']),
  strandCount: z.number().int().min(2).max(100).optional(),
  wireDiameter: z.number().min(0.03, 'Wire diameter too small').max(1.1, 'Wire diameter too large'),
  insulation: z.enum(['plain_enamel', 'heavy_formvar', 'poly', 'poly_nylon', 'solderable']),
  insulationClass: z.enum(['A', 'B', 'F', 'H', 'N']),
  turns: z.number().int().min(1, 'Minimum 1 turn').max(20000, 'Maximum 20000 turns'),
  windingStyle: z.enum(['scatter', 'random', 'layered']),
  packingFactor: z.number().min(0.3, 'Packing factor too low').max(0.95, 'Packing factor too high'),
  temperature: z.number().min(-40).max(100),
})

export const coilParamsSchema = z.object({
  geometry: coilGeometrySchema,
  wire: wireParamsSchema,
  couplingFactor: z.number().min(0.1).max(1),
  wiringConfig: z.enum(['single', 'series', 'parallel']),
  phaseConfig: z.enum(['in_phase', 'out_of_phase']),
})

// ============================================================================
// MAGNET VALIDATION
// ============================================================================

export const magnetParamsSchema = z.object({
  type: z.enum(['alnico2', 'alnico3', 'alnico5', 'alnico8', 'ferrite', 'neodymium']),
  geometry: z.enum(['rod', 'bar', 'blade']),
  diameter: z.number().min(1).optional(),
  width: z.number().min(1).optional(),
  magnetLength: z.number().min(1, 'Magnet length must be at least 1mm'),
  magnetHeight: z.number().min(0.5).optional(),
  magnetization: z.number().min(0).max(1.2),
  polePieces: z.boolean(),
  polePieceMaterial: z.enum(['alnico', 'steel', 'steel_plated']),
  coverType: z.enum(['none', 'nickel_silver', 'chrome', 'plastic']),
  // Blade geometry fields
  bladeThickness: z.number().min(0.5).optional(),
  bladeHeight: z.number().min(0).optional(),
  bladeMaterial: z.enum(['steel', 'ss430', 'ss420']).optional(),
  magnetCount: z.number().int().min(1).max(2).optional(),
})

export const positioningParamsSchema = z.object({
  stringToPoleDistance: z.number().min(0.5, 'Distance too small - risk of string contact').max(15, 'Distance too large'),
  coilToStringDistance: z.number().min(0.5).max(15),
  poleSpacing: z.number().min(5).max(20),
  stringDiameter: z.number().min(0.2).max(1.5),
  stringMaterial: z.enum(['nickel', 'steel', 'bronze', 'nylon']),
})

// ============================================================================
// TRANSFORMER VALIDATION
// ============================================================================

export const transformerCoreSchema = z.object({
  shape: z.enum(['toroid', 'c_core', 'ei_core']),
  material: z.enum(['nanocrystalline', 'amorphous', 'ferrite', 'steel']),
  effectiveArea: z.number().min(10, 'Core area too small'),
  effectiveLength: z.number().min(10),
  airGap: z.number().min(0).max(2),
  saturationFlux: z.number().min(0.1).max(2),
  effectivePermeability: z.number().min(100).max(100000),
})

export const transformerWindingSchema = z.object({
  primaryTurns: z.number().int().min(10, 'Minimum 10 primary turns'),
  secondaryTurns: z.number().int().min(10, 'Minimum 10 secondary turns'),
  primaryAwg: z.number().int().min(30).max(46),
  secondaryAwg: z.number().int().min(30).max(46),
  windingStyle: z.enum(['interleaved', 'non_interleaved']),
  leakageInductance: z.number().min(0).max(0.1),
  interwindingCapacitance: z.number().min(0).max(1e-9),
  shielding: z.boolean(),
})

export const transformerParamsSchema = z.object({
  enabled: z.boolean(),
  core: transformerCoreSchema,
  winding: transformerWindingSchema,
})

// ============================================================================
// LOAD VALIDATION
// ============================================================================

export const loadParamsSchema = z.object({
  volumePot: z.number().min(10000).max(2000000),
  tonePot: z.number().min(10000).max(2000000),
  toneCapacitor: z.number().min(1e-12).max(1e-6),
  tonePosition: z.number().min(0).max(1),
  cableCapacitancePerMeter: z.number().min(10e-12).max(500e-12),
  cableLength: z.number().min(0.1).max(30),
  ampInputImpedance: z.number().min(10000).max(100000000),
})

// ============================================================================
// WARNING THRESHOLDS
// ============================================================================

export interface ValidationWarning {
  field: string
  level: 'info' | 'warning' | 'danger'
  message: string
}

/**
 * Check for unsafe or unusual configurations
 */
export const checkWarnings = (params: {
  coil: z.infer<typeof coilParamsSchema>
  magnet: z.infer<typeof magnetParamsSchema>
  positioning: z.infer<typeof positioningParamsSchema>
  load: z.infer<typeof loadParamsSchema>
}): ValidationWarning[] => {
  const warnings: ValidationWarning[] = []

  // Coil warnings
  const windingWidth = params.coil.geometry.outerRadius - params.coil.geometry.innerRadius
  if (windingWidth < 2) {
    warnings.push({
      field: 'coil.geometry',
      level: 'warning',
      message: 'Very narrow winding window - may be difficult to wind',
    })
  }

  if (params.coil.wire.packingFactor > 0.85) {
    warnings.push({
      field: 'coil.wire.packingFactor',
      level: 'warning',
      message: 'High packing factor may be unrealistic for hand-wound coils',
    })
  }

  if (params.coil.wire.turns > 12000) {
    warnings.push({
      field: 'coil.wire.turns',
      level: 'info',
      message: 'Very high turn count - expect high impedance and reduced treble',
    })
  }

  // Positioning warnings
  if (params.positioning.stringToPoleDistance < 1.5) {
    warnings.push({
      field: 'positioning.stringToPoleDistance',
      level: 'danger',
      message: 'String too close to pole - risk of string pull and buzz',
    })
  }

  if (params.positioning.stringToPoleDistance > 6) {
    warnings.push({
      field: 'positioning.stringToPoleDistance',
      level: 'info',
      message: 'String far from pole - output will be reduced',
    })
  }

  // Magnet warnings
  if (params.magnet.type === 'neodymium' && params.positioning.stringToPoleDistance < 2) {
    warnings.push({
      field: 'magnet',
      level: 'danger',
      message: 'Neodymium magnets with close string spacing cause excessive string pull',
    })
  }

  // Load warnings
  const totalCableCap = params.load.cableCapacitancePerMeter * params.load.cableLength
  if (totalCableCap > 1e-9) {
    warnings.push({
      field: 'load.cable',
      level: 'warning',
      message: 'High cable capacitance will significantly reduce treble response',
    })
  }

  return warnings
}

/**
 * Validate coil parameters
 */
export const validateCoilParams = (params: unknown) => {
  return coilParamsSchema.safeParse(params)
}

/**
 * Validate magnet parameters
 */
export const validateMagnetParams = (params: unknown) => {
  return magnetParamsSchema.safeParse(params)
}

/**
 * Validate positioning parameters
 */
export const validatePositioningParams = (params: unknown) => {
  return positioningParamsSchema.safeParse(params)
}

/**
 * Validate load parameters
 */
export const validateLoadParams = (params: unknown) => {
  return loadParamsSchema.safeParse(params)
}

/**
 * Validate transformer parameters
 */
export const validateTransformerParams = (params: unknown) => {
  return transformerParamsSchema.safeParse(params)
}
