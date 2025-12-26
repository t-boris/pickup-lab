/**
 * Domain Types Index
 *
 * Re-exports all type definitions from split modules.
 */

// Enums and type aliases
export type {
  CoilForm,
  WireMaterial,
  CopperGrade,
  StrandType,
  InsulationType,
  InsulationClass,
  WindingStyle,
  MagnetType,
  MagnetGeometry,
  BladeMaterial,
  PolePieceMaterial,
  CoverType,
  StringMaterial,
  CoreShape,
  CoreMaterialBase,
  NanocrystallineType,
  AmorphousType,
  FerriteType,
  CoreMaterial,
  PrimaryWindingType,
  WiringConfig,
  PhaseConfig,
  UnitSystem,
  ConductorMaterial,
} from './enums'

// Coil types
export type { CoilGeometry, WireParams, CoilParams } from './coil'

// Magnet types
export type { MagnetParams, PositioningParams } from './magnet'

// Transformer types
export type {
  ToroidGeometry,
  TransformerCoreParams,
  PrimaryWindingConductor,
  TransformerWindingParams,
  TransformerParasitics,
  TransformerParams,
} from './transformer'

// Load types
export type { LoadParams } from './load'

// Results types
export type {
  CoilComputedResults,
  MagnetComputedResults,
  TransformerComputedResults,
  LoadComputedResults,
  ComputedResults,
} from './results'

// Graph types
export type {
  Complex,
  FrequencyPoint,
  ImpedancePoint,
  FieldPoint,
  OutputPoint,
  GraphData,
} from './graph'

// Preset types
export type { PickupConfig, ExportData, PresetWithResults } from './preset'
