/**
 * UI Store
 *
 * Zustand store for UI state management.
 * Handles theme, units, active charts, sidebar state, and other UI preferences.
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UnitSystem } from '@/domain/types'

// ============================================================================
// TYPES
// ============================================================================

/** Theme options */
export type Theme = 'dark' | 'light' | 'system'

/** Available chart types */
export type ChartType =
  | 'frequency_response'
  | 'impedance'
  | 'phase'
  | 'b_field'
  | 'output'
  | 'impulse_response'

/** Chart layout options */
export type ChartLayout = '1x1' | '2x1' | '2x2' | '3x1'

/** Sidebar panel IDs */
export type SidebarPanel = 'coil' | 'magnet' | 'transformer' | 'load'

/** Selected element for info panel */
export type SelectedElementType = 'input' | 'chart' | 'kpi'

export interface SelectedElement {
  type: SelectedElementType
  id: string
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_ACTIVE_CHARTS: ChartType[] = [
  'frequency_response',
  'impedance',
  'phase',
  'b_field',
  'output',
  'impulse_response',
]

const DEFAULT_EXPANDED_PANELS: SidebarPanel[] = ['coil', 'magnet']

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface UIStore {
  // Theme
  theme: Theme
  resolvedTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void

  // Units
  unitSystem: UnitSystem
  setUnitSystem: (system: UnitSystem) => void
  toggleUnitSystem: () => void

  // Charts
  activeCharts: ChartType[]
  chartLayout: ChartLayout
  comparisonMode: boolean
  setActiveCharts: (charts: ChartType[]) => void
  toggleChart: (chart: ChartType) => void
  setChartLayout: (layout: ChartLayout) => void
  setComparisonMode: (enabled: boolean) => void
  toggleComparisonMode: () => void

  // Sidebar
  sidebarOpen: boolean
  sidebarWidth: number  // percentage (0-100)
  expandedPanels: SidebarPanel[]
  setSidebarOpen: (open: boolean) => void
  setSidebarWidth: (width: number) => void
  toggleSidebar: () => void
  togglePanel: (panel: SidebarPanel) => void
  expandAllPanels: () => void
  collapseAllPanels: () => void

  // Mobile
  isMobileView: boolean
  mobileActiveTab: 'params' | 'results' | 'charts'
  setIsMobileView: (isMobile: boolean) => void
  setMobileActiveTab: (tab: 'params' | 'results' | 'charts') => void

  // Modals
  presetModalOpen: boolean
  exportModalOpen: boolean
  settingsModalOpen: boolean
  assumptionsDrawerOpen: boolean
  contactModalOpen: boolean
  setPresetModalOpen: (open: boolean) => void
  setExportModalOpen: (open: boolean) => void
  setSettingsModalOpen: (open: boolean) => void
  setAssumptionsDrawerOpen: (open: boolean) => void
  setContactModalOpen: (open: boolean) => void

  // Tooltips & Help
  showTooltips: boolean
  setShowTooltips: (show: boolean) => void

  // Info Panel
  selectedElement: SelectedElement | null
  infoPanelOpen: boolean
  setSelectedElement: (element: SelectedElement | null) => void
  setInfoPanelOpen: (open: boolean) => void

  // Reset
  resetUIState: () => void
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Resolve theme based on system preference
 */
const resolveTheme = (theme: Theme): 'dark' | 'light' => {
  if (theme === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return 'dark' // Default to dark
  }
  return theme
}

/**
 * Apply theme to document
 */
const applyTheme = (resolvedTheme: 'dark' | 'light') => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(resolvedTheme)
  }
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        // Theme state
        theme: 'dark',
        resolvedTheme: 'dark',

        setTheme: (theme) => {
          const resolvedTheme = resolveTheme(theme)
          applyTheme(resolvedTheme)
          set({ theme, resolvedTheme }, false, 'setTheme')
        },

        // Units state
        unitSystem: 'metric',

        setUnitSystem: (unitSystem) => {
          set({ unitSystem }, false, 'setUnitSystem')
        },

        toggleUnitSystem: () => {
          set(
            (state) => ({
              unitSystem: state.unitSystem === 'metric' ? 'imperial' : 'metric',
            }),
            false,
            'toggleUnitSystem'
          )
        },

        // Charts state
        activeCharts: DEFAULT_ACTIVE_CHARTS,
        chartLayout: '2x1',
        comparisonMode: false,

        setActiveCharts: (activeCharts) => {
          set({ activeCharts }, false, 'setActiveCharts')
        },

        toggleChart: (chart) => {
          set(
            (state) => {
              const isActive = state.activeCharts.includes(chart)
              if (isActive) {
                // Don't remove if it's the last chart
                if (state.activeCharts.length <= 1) return state
                return {
                  activeCharts: state.activeCharts.filter((c) => c !== chart),
                }
              } else {
                return {
                  activeCharts: [...state.activeCharts, chart],
                }
              }
            },
            false,
            'toggleChart'
          )
        },

        setChartLayout: (chartLayout) => {
          set({ chartLayout }, false, 'setChartLayout')
        },

        setComparisonMode: (comparisonMode) => {
          set({ comparisonMode }, false, 'setComparisonMode')
        },

        toggleComparisonMode: () => {
          set(
            (state) => ({ comparisonMode: !state.comparisonMode }),
            false,
            'toggleComparisonMode'
          )
        },

        // Sidebar state
        sidebarOpen: true,
        sidebarWidth: 43, // Default 43% of viewport
        expandedPanels: DEFAULT_EXPANDED_PANELS,

        setSidebarOpen: (sidebarOpen) => {
          set({ sidebarOpen }, false, 'setSidebarOpen')
        },

        setSidebarWidth: (sidebarWidth) => {
          set({ sidebarWidth }, false, 'setSidebarWidth')
        },

        toggleSidebar: () => {
          set(
            (state) => ({ sidebarOpen: !state.sidebarOpen }),
            false,
            'toggleSidebar'
          )
        },

        togglePanel: (panel) => {
          set(
            (state) => {
              const isExpanded = state.expandedPanels.includes(panel)
              if (isExpanded) {
                return {
                  expandedPanels: state.expandedPanels.filter((p) => p !== panel),
                }
              } else {
                return {
                  expandedPanels: [...state.expandedPanels, panel],
                }
              }
            },
            false,
            'togglePanel'
          )
        },

        expandAllPanels: () => {
          set(
            { expandedPanels: ['coil', 'magnet', 'transformer', 'load'] },
            false,
            'expandAllPanels'
          )
        },

        collapseAllPanels: () => {
          set({ expandedPanels: [] }, false, 'collapseAllPanels')
        },

        // Mobile state
        isMobileView: false,
        mobileActiveTab: 'params',

        setIsMobileView: (isMobileView) => {
          set({ isMobileView }, false, 'setIsMobileView')
        },

        setMobileActiveTab: (mobileActiveTab) => {
          set({ mobileActiveTab }, false, 'setMobileActiveTab')
        },

        // Modal state
        presetModalOpen: false,
        exportModalOpen: false,
        settingsModalOpen: false,
        assumptionsDrawerOpen: false,
        contactModalOpen: false,

        setPresetModalOpen: (presetModalOpen) => {
          set({ presetModalOpen }, false, 'setPresetModalOpen')
        },

        setExportModalOpen: (exportModalOpen) => {
          set({ exportModalOpen }, false, 'setExportModalOpen')
        },

        setSettingsModalOpen: (settingsModalOpen) => {
          set({ settingsModalOpen }, false, 'setSettingsModalOpen')
        },

        setAssumptionsDrawerOpen: (assumptionsDrawerOpen) => {
          set({ assumptionsDrawerOpen }, false, 'setAssumptionsDrawerOpen')
        },

        setContactModalOpen: (contactModalOpen) => {
          set({ contactModalOpen }, false, 'setContactModalOpen')
        },

        // Tooltips
        showTooltips: true,

        setShowTooltips: (showTooltips) => {
          set({ showTooltips }, false, 'setShowTooltips')
        },

        // Info Panel
        selectedElement: null,
        infoPanelOpen: false,

        setSelectedElement: (selectedElement) => {
          set({ selectedElement }, false, 'setSelectedElement')
        },

        setInfoPanelOpen: (infoPanelOpen) => {
          set({ infoPanelOpen }, false, 'setInfoPanelOpen')
        },

        // Reset
        resetUIState: () => {
          set(
            {
              activeCharts: DEFAULT_ACTIVE_CHARTS,
              chartLayout: '2x1',
              comparisonMode: false,
              expandedPanels: DEFAULT_EXPANDED_PANELS,
              sidebarOpen: true,
              sidebarWidth: 43,
            },
            false,
            'resetUIState'
          )
        },
      }),
      {
        name: 'pickup-lab-ui',
        partialize: (state) => ({
          theme: state.theme,
          unitSystem: state.unitSystem,
          activeCharts: state.activeCharts,
          chartLayout: state.chartLayout,
          showTooltips: state.showTooltips,
          sidebarWidth: state.sidebarWidth,
        }),
        onRehydrateStorage: () => (state) => {
          // Apply theme on rehydration
          if (state) {
            const resolvedTheme = resolveTheme(state.theme)
            state.resolvedTheme = resolvedTheme
            applyTheme(resolvedTheme)
          }
        },
      }
    ),
    { name: 'ui-store' }
  )
)

// Initialize theme listener for system preference changes
if (typeof window !== 'undefined') {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      const state = useUIStore.getState()
      if (state.theme === 'system') {
        const resolvedTheme = e.matches ? 'dark' : 'light'
        useUIStore.setState({ resolvedTheme })
        applyTheme(resolvedTheme)
      }
    })
}
