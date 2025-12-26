/**
 * Transformer Module Index
 *
 * Re-exports all transformer calculation functions.
 */

// Basic calculations
export {
  computeTurnsRatio,
  computeVoltageRatio,
  computeReflectedLoad,
  computeReflectedLoadMagnitude,
} from './basics'

// Primary inductance
export {
  computePrimaryInductance,
  computeEffectivePermeabilityWithGap,
} from './inductance'

// Saturation margin
export {
  computePeakFluxDensity,
  computeSaturationMargin,
  estimateCoreLoss,
} from './saturation'

// Parasitic parameters
export {
  computeLeakageInductance,
  computeInterwindingCapacitance,
  computePrimaryCapacitance,
  computeSecondaryCapacitance,
  computeParasitics,
} from './parasitics'

// Response calculations
export {
  computeTransformerImpedance,
  computeTransformerResponse,
  computeTransformerBandwidth,
} from './response'

// Main result computation
export { computeTransformerResults } from './results'
