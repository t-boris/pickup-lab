/**
 * Preset and Export Types
 *
 * Interfaces for configuration presets and export data.
 */

import type { CoilParams } from './coil'
import type { MagnetParams, PositioningParams } from './magnet'
import type { TransformerParams } from './transformer'
import type { LoadParams } from './load'
import type { ComputedResults } from './results'
import type { GraphData } from './graph'

/** Complete pickup configuration */
export interface PickupConfig {
  /** Configuration name */
  name: string

  /** Configuration ID */
  id: string

  /** Model version */
  modelVersion: string

  /** Timestamp */
  timestamp: number

  /** Coil parameters */
  coil: CoilParams

  /** Magnet parameters */
  magnet: MagnetParams

  /** Positioning parameters */
  positioning: PositioningParams

  /** Transformer parameters */
  transformer: TransformerParams

  /** Load parameters */
  load: LoadParams
}

/** Export data structure */
export interface ExportData {
  config: PickupConfig
  results: ComputedResults
  graphData?: GraphData
}

/** Preset with computed results for comparison */
export interface PresetWithResults {
  config: PickupConfig
  results: ComputedResults
  graphData: GraphData
  color: string
}
