/**
 * Type Enums and Aliases
 *
 * Simple type definitions and string union types.
 */

/** Coil geometry form types */
export type CoilForm = 'cylindrical' | 'rectangular' | 'flatwork'

/** Wire material types */
export type WireMaterial = 'copper' | 'silver'

/** Copper grade/purity */
export type CopperGrade = 'standard' | 'ofc' | 'occ'
// standard: Regular electrolytic copper (99.9%)
// ofc: Oxygen-Free Copper (99.99%)
// occ: Ohno Continuous Cast (99.9999%, single crystal)

/** Strand configuration */
export type StrandType = 'solid' | 'stranded' | 'litz'

/** Wire insulation types */
export type InsulationType =
  | 'plain_enamel'   // PE, vintage, 0.005mm
  | 'heavy_formvar'  // HF, vintage 50s-60s, 0.010mm
  | 'poly'           // Polyurethane, modern
  | 'poly_nylon'     // SPN, solder-strippable
  | 'solderable'     // Bondable enamel

/** Insulation temperature class (NEMA) */
export type InsulationClass = 'A' | 'B' | 'F' | 'H' | 'N'
// A: 105°C, B: 130°C, F: 155°C, H: 180°C, N: 200°C

/** Winding style types */
export type WindingStyle = 'scatter' | 'random' | 'layered'

/** Magnet material types */
export type MagnetType = 'alnico2' | 'alnico3' | 'alnico5' | 'alnico8' | 'ferrite' | 'neodymium'

/** Magnet geometry types */
export type MagnetGeometry = 'rod' | 'bar' | 'blade'

/** Blade/rail material types */
export type BladeMaterial =
  | 'steel'       // Carbon steel - high permeability, some eddy losses
  | 'ss430'       // Stainless Steel 430 (ferritic) - magnetic, corrosion resistant
  | 'ss420'       // Stainless Steel 420 - harder, less permeable

/** Pole piece material types - affects eddy current losses */
export type PolePieceMaterial =
  | 'alnico'      // AlNiCo rod magnets - minimal eddy currents
  | 'steel'       // Steel slugs/screws - significant eddy losses
  | 'steel_plated' // Chrome/nickel plated steel - more losses

/** Pickup cover types - affects high frequency response */
export type CoverType =
  | 'none'           // Open coil - no cover losses
  | 'nickel_silver'  // German silver - moderate HF loss (~2-3dB)
  | 'chrome'         // Chrome plated - more HF loss
  | 'plastic'        // Plastic cover - minimal effect

/** String material types */
export type StringMaterial = 'nickel' | 'steel'

/** Transformer core shape types */
export type CoreShape =
  | 'toroid_round'    // Circular toroid
  | 'toroid_oval'     // Oval/racetrack toroid
  | 'c_core'          // C-core / Sector
  | 'ei_core'         // EI laminated core

/** Transformer core material base types */
export type CoreMaterialBase =
  | 'nanocrystalline'  // Nanocrystalline alloy
  | 'amorphous'        // Amorphous metal
  | 'ferrite'          // Ferrite ceramic
  | 'silicon_steel'    // Grain-oriented silicon steel

/** Nanocrystalline alloy variants */
export type NanocrystallineType = 'nc_iron' | 'nc_cobalt'
// nc_iron: Fe-based (Finemet, Vitroperm) - µr ~80,000-150,000, Bsat ~1.2T
// nc_cobalt: Co-based - µr ~100,000-200,000, Bsat ~0.8T

/** Amorphous alloy variants */
export type AmorphousType = 'am_iron' | 'am_cobalt'
// am_iron: Fe-based (Metglas 2605) - µr ~10,000-50,000, Bsat ~1.56T
// am_cobalt: Co-based (Metglas 2714) - µr ~80,000-150,000, Bsat ~0.57T

/** Ferrite material variants */
export type FerriteType = 'ferrite_mnzn' | 'ferrite_nizn'
// MnZn: Low frequency (<2MHz), µr ~2,000-10,000
// NiZn: High frequency (>1MHz), µr ~100-1,000

/** Combined core material type with variant */
export type CoreMaterial =
  | { base: 'nanocrystalline'; variant: NanocrystallineType }
  | { base: 'amorphous'; variant: AmorphousType }
  | { base: 'ferrite'; variant: FerriteType }
  | { base: 'silicon_steel' }

/** Primary winding conductor type */
export type PrimaryWindingType = 'wire' | 'plate'
// wire: Standard magnet wire
// plate: Metal strip/plate (common in some pickup transformers)

/** Coil wiring configuration */
export type WiringConfig = 'single' | 'series' | 'parallel'

/** Phase configuration for multi-coil setups */
export type PhaseConfig = 'in_phase' | 'out_of_phase'

/** Unit system for display */
export type UnitSystem = 'metric' | 'imperial'

/** Conductor material for transformer windings */
export type ConductorMaterial = 'copper' | 'ofc_copper' | 'silver' | 'aluminum' | 'brass'
