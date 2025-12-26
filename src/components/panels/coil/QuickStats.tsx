/**
 * Quick Stats Component
 *
 * Displays computed coil parameters (DCR, L, C, f0).
 */

import { useCoilStore } from '@/store'
import { formatSI } from '@/lib/formatters'

export const QuickStats: React.FC = () => {
  const { computed } = useCoilStore()

  if (!computed) return null

  return (
    <div className="rounded-lg border bg-muted/50 p-3">
      <h4 className="mb-2 text-sm font-medium">Quick Stats</h4>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">R_dc:</span>{' '}
          {formatSI(computed.dcResistance, 'Ω')}
        </div>
        <div>
          <span className="text-muted-foreground">L:</span>{' '}
          {formatSI(computed.inductance, 'H')}
        </div>
        <div>
          <span className="text-muted-foreground">C_p:</span>{' '}
          {formatSI(computed.capacitance, 'F')}
        </div>
        <div>
          <span className="text-muted-foreground">f₀:</span>{' '}
          {formatSI(computed.resonantFrequency, 'Hz')}
        </div>
      </div>
    </div>
  )
}
