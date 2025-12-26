/**
 * Pickup Physics Lab - Main Application
 *
 * Guitar pickup coil modeling tool for exploring electrical
 * and magnetic parameters with interactive visualizations.
 */

import { useEffect } from 'react'
import { AppShell } from '@/components/layout'
import { KpiCards, ChartGrid } from '@/components/dashboard'
import { PresetModal } from '@/components/modals/PresetModal'
import { ExportModal } from '@/components/modals/ExportModal'
import { AssumptionsDrawer } from '@/components/modals/AssumptionsDrawer'
import { ContactModal } from '@/components/modals/ContactModal'
import {
  useCoilStore,
  useMagnetStore,
  useLoadStore,
  useTransformerStore,
  useUIStore,
} from '@/store'
import './App.css'

function App() {
  const coil = useCoilStore((s) => s.coil)
  const coilComputed = useCoilStore((s) => s.computed)
  const computeCoil = useCoilStore((s) => s.compute)

  const magnet = useMagnetStore((s) => s.magnet)
  const positioning = useMagnetStore((s) => s.positioning)
  const computeMagnet = useMagnetStore((s) => s.compute)

  const load = useLoadStore((s) => s.load)
  const computeLoad = useLoadStore((s) => s.compute)

  const transformer = useTransformerStore((s) => s.transformer)
  const computeTransformer = useTransformerStore((s) => s.compute)

  const { isMobileView, mobileActiveTab } = useUIStore()

  // Initial computation
  useEffect(() => {
    computeCoil()
  }, [])

  // Recompute magnet when coil changes
  useEffect(() => {
    if (coilComputed) {
      // For sensitivity calculation, use the pole piece area (not winding area)
      // This is where the magnetic flux is concentrated and interacts with the string
      let effectiveArea: number

      if (magnet.geometry === 'blade') {
        // Blade: rectangular pole area = thickness × effective width per string
        const bladeThickness = magnet.bladeThickness ?? 3 // mm
        const effectiveWidth = 8 // mm - interaction width per string position
        effectiveArea = (bladeThickness / 1000) * (effectiveWidth / 1000) // m²
      } else {
        // Rod/Bar: circular pole area = π × r²
        // For flatwork: innerRadius = pole diameter, so area = π × (d/2)²
        // For cylindrical: innerRadius = actual inner radius
        const poleRadius = coil.geometry.innerRadius / 2 // radius from diameter
        effectiveArea = Math.PI * (poleRadius / 1000) ** 2 // m²
      }

      // Pass coil height for blade geometry calculations
      computeMagnet(coil.wire.turns, effectiveArea, coil.couplingFactor, coil.geometry.height)
    }
  }, [coilComputed, coil, positioning, magnet, computeMagnet])

  // Recompute load when coil changes
  useEffect(() => {
    if (coilComputed) {
      computeLoad(
        coilComputed.inductance,
        coilComputed.capacitance,
        coilComputed.dcResistance
      )
    }
  }, [coilComputed, load, computeLoad])

  // Recompute transformer when enabled and load changes
  useEffect(() => {
    if (transformer.enabled) {
      computeTransformer(load)
    }
  }, [transformer, load, computeTransformer])

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Section Header */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-sky-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Outputs
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Mobile: Show content based on active tab */}
        {isMobileView ? (
          <>
            {mobileActiveTab === 'results' && <KpiCards />}
            {mobileActiveTab === 'charts' && <ChartGrid />}
          </>
        ) : (
          /* Desktop: Show both KPIs and charts */
          <>
            <KpiCards />
            <ChartGrid />
          </>
        )}
      </div>

      {/* Modals */}
      <PresetModal />
      <ExportModal />
      <AssumptionsDrawer />
      <ContactModal />
    </AppShell>
  )
}

export default App
