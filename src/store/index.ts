/**
 * Store Index
 *
 * Central export for all Zustand stores.
 * Also provides a combined hook for accessing all stores.
 */

// Export individual stores
export { useCoilStore, DEFAULT_COIL, DEFAULT_GEOMETRY, DEFAULT_WIRE } from './coilStore'
export { useMagnetStore, DEFAULT_MAGNET, DEFAULT_POSITIONING } from './magnetStore'
export { useTransformerStore, DEFAULT_TRANSFORMER, DEFAULT_CORE, DEFAULT_WINDING } from './transformerStore'
export { useLoadStore, DEFAULT_LOAD } from './loadStore'
export { usePresetsStore, BUILTIN_PRESETS, COMPARISON_COLORS } from './presetsStore'
export { useUIStore } from './uiStore'

// Export types from UI store
export type { Theme, ChartType, ChartLayout, SidebarPanel } from './uiStore'
