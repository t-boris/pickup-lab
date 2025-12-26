/**
 * AssumptionsDrawer Component
 *
 * Sheet/drawer displaying model assumptions and limitations.
 * Helps users understand the physics model's constraints.
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useUIStore } from '@/store'
import { MODEL_VERSION } from '@/lib/calibration'

export const AssumptionsDrawer: React.FC = () => {
  const { assumptionsDrawerOpen, setAssumptionsDrawerOpen } = useUIStore()

  return (
    <Sheet open={assumptionsDrawerOpen} onOpenChange={setAssumptionsDrawerOpen}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Model Assumptions
            <Badge variant="secondary">{MODEL_VERSION}</Badge>
          </SheetTitle>
          <SheetDescription>
            Understand the limitations and assumptions of this physics model.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-6 h-[calc(100vh-200px)]">
          <div className="space-y-6 pr-4">
            {/* Inductance */}
            <section>
              <h3 className="font-semibold text-primary">Inductance Model</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Uses the Wheeler formula for short solenoids. This is an approximation
                valid for coils where length ≈ diameter. For very flat or very tall coils,
                accuracy may decrease.
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                <li>Assumes uniform winding density</li>
                <li>Neglects proximity effects between turns</li>
                <li>Rectangular coils use equivalent circular radius</li>
              </ul>
            </section>

            <Separator />

            {/* Capacitance */}
            <section>
              <h3 className="font-semibold text-primary">Capacitance Model</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Uses a simplified turn-to-turn capacitance model with calibration
                coefficients. Real parasitic capacitance depends on many factors
                that cannot be analytically calculated without FEM simulation.
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                <li>Coefficients are empirically derived</li>
                <li>Winding style has significant impact</li>
                <li>Potting/shielding effects not modeled</li>
              </ul>
            </section>

            <Separator />

            {/* Magnetic Field */}
            <section>
              <h3 className="font-semibold text-primary">Magnetic Field</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Uses the axial field formula for cylindrical magnets. This gives the
                field along the magnet axis only. Off-axis field and fringe effects
                are not calculated.
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                <li>Assumes uniform magnetization</li>
                <li>Pole piece focusing not accurately modeled</li>
                <li>Bar magnets use equivalent cylinder approximation</li>
              </ul>
            </section>

            <Separator />

            {/* Transformer */}
            <section>
              <h3 className="font-semibold text-primary">Transformer Model</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Uses ideal transformer equations with added parasitic elements
                (leakage inductance, interwinding capacitance). Core losses are
                estimated qualitatively.
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                <li>Ideal voltage ratio (no winding losses)</li>
                <li>Saturation margin is approximate</li>
                <li>Frequency-dependent core loss not calculated</li>
              </ul>
            </section>

            <Separator />

            {/* String Pull */}
            <section>
              <h3 className="font-semibold text-primary">String Pull Index</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The string pull index is a qualitative heuristic based on B² / distance^n.
                It indicates relative risk of excessive magnetic attraction affecting
                string vibration ("stratitis").
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                <li>Not a physical force calculation</li>
                <li>Thresholds based on typical values</li>
                <li>String material affects actual interaction</li>
              </ul>
            </section>

            <Separator />

            {/* General */}
            <section>
              <h3 className="font-semibold text-primary">General Limitations</h3>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                <li>No eddy current losses in magnet or poles</li>
                <li>No temperature-dependent permeability</li>
                <li>No skin effect at high frequencies</li>
                <li>Coupling factor must be estimated or measured</li>
                <li>Wiring parasitic capacitance not included</li>
              </ul>
            </section>

            <Separator />

            {/* Usage Notes */}
            <section>
              <h3 className="font-semibold text-primary">Best Used For</h3>
              <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                <li>Comparing different coil configurations</li>
                <li>Understanding parameter trade-offs</li>
                <li>Educational exploration of pickup physics</li>
                <li>Initial design parameter selection</li>
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                For production designs, always validate with measurements.
              </p>
            </section>

            <Separator />

            {/* Calibration Note */}
            <section>
              <h3 className="font-semibold text-primary">Calibration (v2)</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                A future version will support calibration mode where measured values
                can be used to auto-fit the model coefficients for improved accuracy.
              </p>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
