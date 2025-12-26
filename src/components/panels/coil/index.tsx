/**
 * Coil Section Module
 *
 * Re-exports the main CoilSection component and sub-components.
 */

import { GeometrySection } from './GeometrySection'
import { WireSection } from './WireSection'
import { WindingSection } from './WindingSection'
import { QuickStats } from './QuickStats'

export const CoilSection: React.FC = () => {
  return (
    <div className="space-y-6">
      <GeometrySection />
      <WireSection />
      <WindingSection />
      <QuickStats />
    </div>
  )
}

export { GeometrySection, WireSection, WindingSection, QuickStats }
