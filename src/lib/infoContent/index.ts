/**
 * Info Panel Content Database
 *
 * Contextual help content for all interactive elements.
 * Used by InfoPanel to display descriptions when elements are focused/selected.
 */

export type { InfoContentItem, InfoContentRecord } from './types'

import { COIL_INFO } from './coil'
import { MAGNET_INFO } from './magnet'
import { TRANSFORMER_INFO } from './transformer'
import { LOAD_INFO } from './load'
import { CHARTS_INFO } from './charts'
import { KPI_INFO } from './kpi'
import { DEFAULTS_INFO } from './defaults'
import type { InfoContentItem } from './types'

/**
 * Combined info content from all sections
 */
export const INFO_CONTENT: Record<string, InfoContentItem> = {
  ...COIL_INFO,
  ...MAGNET_INFO,
  ...TRANSFORMER_INFO,
  ...LOAD_INFO,
  ...CHARTS_INFO,
  ...KPI_INFO,
  ...DEFAULTS_INFO,
}

/**
 * Get info content for an element, with fallback to default
 */
export const getInfoContent = (elementId: string | null): InfoContentItem => {
  if (!elementId || !INFO_CONTENT[elementId]) {
    return INFO_CONTENT['default']
  }
  return INFO_CONTENT[elementId]
}

// Re-export section constants for direct access if needed
export { COIL_INFO, MAGNET_INFO, TRANSFORMER_INFO, LOAD_INFO, CHARTS_INFO, KPI_INFO, DEFAULTS_INFO }
