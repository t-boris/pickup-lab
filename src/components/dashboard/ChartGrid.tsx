/**
 * ChartGrid Component
 *
 * Responsive grid layout for displaying multiple charts.
 * Supports different layout configurations and chart selection.
 */

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUIStore } from '@/store'
import type { ChartType, ChartLayout } from '@/store'
import { FrequencyResponseChart } from '@/components/charts/FrequencyResponseChart'
import { ImpedanceChart } from '@/components/charts/ImpedanceChart'
import { PhaseChart } from '@/components/charts/PhaseChart'
import { BFieldChart } from '@/components/charts/BFieldChart'
import { OutputChart } from '@/components/charts/OutputChart'
import { ImpulseResponseChart } from '@/components/charts/ImpulseResponseChart'

// Chart configuration
const chartConfig: Record<ChartType, { label: string; component: React.FC; infoId: string }> = {
  frequency_response: {
    label: 'Frequency Response',
    component: FrequencyResponseChart,
    infoId: 'chart.frequency',
  },
  impedance: {
    label: 'Impedance',
    component: ImpedanceChart,
    infoId: 'chart.impedance',
  },
  phase: {
    label: 'Phase',
    component: PhaseChart,
    infoId: 'chart.phase',
  },
  b_field: {
    label: 'B-Field vs Distance',
    component: BFieldChart,
    infoId: 'chart.bfield',
  },
  output: {
    label: 'Output vs Distance',
    component: OutputChart,
    infoId: 'chart.output',
  },
  impulse_response: {
    label: 'Impulse Response',
    component: ImpulseResponseChart,
    infoId: 'chart.impulse',
  },
}

// Layout grid classes
const layoutClasses: Record<ChartLayout, string> = {
  '1x1': 'grid-cols-1',
  '2x1': 'grid-cols-1 lg:grid-cols-2',
  '2x2': 'grid-cols-1 md:grid-cols-2',
  '3x1': 'grid-cols-1 lg:grid-cols-3',
}

// Icons
const LayoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="7" height="7" x="3" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="3" rx="1"/>
    <rect width="7" height="7" x="14" y="14" rx="1"/>
    <rect width="7" height="7" x="3" y="14" rx="1"/>
  </svg>
)

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/>
    <path d="m19 9-5 5-4-4-3 3"/>
  </svg>
)

export const ChartGrid: React.FC = () => {
  const {
    activeCharts,
    chartLayout,
    toggleChart,
    setChartLayout,
    setSelectedElement,
  } = useUIStore()

  const layouts: { value: ChartLayout; label: string }[] = [
    { value: '1x1', label: 'Single' },
    { value: '2x1', label: '2 Columns' },
    { value: '2x2', label: '2x2 Grid' },
    { value: '3x1', label: '3 Columns' },
  ]

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Charts</h2>

        <div className="flex items-center gap-2">
          {/* Chart Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ChartIcon />
                Charts ({activeCharts.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Select Charts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(chartConfig) as ChartType[]).map((chartType) => (
                <DropdownMenuCheckboxItem
                  key={chartType}
                  checked={activeCharts.includes(chartType)}
                  onCheckedChange={() => toggleChart(chartType)}
                >
                  {chartConfig[chartType].label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Layout Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <LayoutIcon />
                Layout
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Chart Layout</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {layouts.map((layout) => (
                <DropdownMenuCheckboxItem
                  key={layout.value}
                  checked={chartLayout === layout.value}
                  onCheckedChange={() => setChartLayout(layout.value)}
                >
                  {layout.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chart Grid */}
      <div className={`grid gap-4 ${layoutClasses[chartLayout]}`}>
        {activeCharts.map((chartType) => {
          const { component: ChartComponent, infoId } = chartConfig[chartType]
          return (
            <div
              key={chartType}
              className="min-h-[300px] rounded-lg border bg-card p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedElement({ type: 'chart', id: infoId })}
            >
              <ChartComponent />
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {activeCharts.length === 0 && (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <ChartIcon />
            <p className="mt-2 text-sm text-muted-foreground">
              No charts selected. Use the Charts dropdown to add charts.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
