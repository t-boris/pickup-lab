/**
 * InfoPanel Component
 *
 * Contextual help panel showing detailed information about focused/selected elements.
 * Desktop: Fixed right sidebar. Mobile: FAB button with bottom sheet.
 */

import { useUIStore } from '@/store'
import { getInfoContent } from '@/lib/infoContent'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import coilTypesImage from '@/assets/coil-types.png'

// Icons
const HelpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
)

const InputIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 7V4h16v3" />
    <path d="M9 20h6" />
    <path d="M12 4v16" />
  </svg>
)

const ChartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18" />
    <path d="m19 9-5 5-4-4-3 3" />
  </svg>
)

const MetricIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20v-6M6 20V10M18 20V4" />
  </svg>
)

/**
 * Info content display component
 */
const InfoContent: React.FC = () => {
  const selectedElement = useUIStore((s) => s.selectedElement)
  const content = getInfoContent(selectedElement?.id ?? null)

  const typeIcon = selectedElement?.type === 'input'
    ? <InputIcon />
    : selectedElement?.type === 'chart'
    ? <ChartIcon />
    : selectedElement?.type === 'kpi'
    ? <MetricIcon />
    : null

  const typeBadge = selectedElement?.type === 'input'
    ? 'Parameter'
    : selectedElement?.type === 'chart'
    ? 'Chart'
    : selectedElement?.type === 'kpi'
    ? 'Metric'
    : null

  return (
    <div className="space-y-4">
      {/* Header with type badge */}
      <div className="space-y-2">
        {typeBadge && (
          <Badge variant="outline" className="gap-1">
            {typeIcon}
            {typeBadge}
          </Badge>
        )}
        <h3 className="text-lg font-semibold">{content.title}</h3>
        <p className="text-sm text-muted-foreground">{content.description}</p>
      </div>

      {/* Details */}
      {content.details && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Details</h4>
          <p className="text-sm text-muted-foreground">{content.details}</p>
        </div>
      )}

      {/* Diagram for coil form */}
      {selectedElement?.id === 'coil.geometry.form' && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Visual Comparison</h4>
          <div className="rounded-md border bg-muted/20 p-2">
            <img
              src={coilTypesImage}
              alt="Coil bobbin types: Cylindrical, Rectangular, and Flatwork"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}

      {/* Range */}
      {content.range && (
        <div className="rounded-md border bg-muted/30 p-3 space-y-1">
          <h4 className="text-sm font-medium">Range</h4>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Min:</span>
            <span className="font-mono">{content.range.min}{content.range.unit ? ` ${content.range.unit}` : ''}</span>
            <span className="text-muted-foreground">Max:</span>
            <span className="font-mono">{content.range.max}{content.range.unit ? ` ${content.range.unit}` : ''}</span>
          </div>
          {content.range.typical && (
            <div className="text-sm">
              <span className="text-muted-foreground">Typical: </span>
              <span className="font-mono">{content.range.typical}</span>
            </div>
          )}
        </div>
      )}

      {/* Examples */}
      {content.examples && content.examples.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Examples</h4>
          <ul className="space-y-1">
            {content.examples.map((example, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-1">-</span>
                <span>{example}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Impact on tone */}
      {content.impact && (
        <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-3 space-y-1">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            Impact on Tone
          </h4>
          <p className="text-sm text-muted-foreground">{content.impact}</p>
        </div>
      )}

      {/* Warning note */}
      {content.warning && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
          <h4 className="text-sm font-medium flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
            Note
          </h4>
          <p className="text-sm text-muted-foreground">{content.warning}</p>
        </div>
      )}
    </div>
  )
}

/**
 * Desktop panel component
 */
export const InfoPanelDesktop: React.FC = () => {
  return (
    <aside className="hidden lg:flex w-80 flex-col border-l bg-card">
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <HelpIcon />
        <h2 className="font-semibold">Context Help</h2>
      </header>
      <ScrollArea className="flex-1 p-4">
        <InfoContent />
      </ScrollArea>
    </aside>
  )
}

/**
 * Mobile FAB + Sheet component
 */
export const InfoPanelMobile: React.FC = () => {
  const infoPanelOpen = useUIStore((s) => s.infoPanelOpen)
  const setInfoPanelOpen = useUIStore((s) => s.setInfoPanelOpen)

  return (
    <Sheet open={infoPanelOpen} onOpenChange={setInfoPanelOpen}>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="fixed bottom-20 right-4 z-50 lg:hidden h-12 w-12 rounded-full shadow-lg"
        >
          <HelpIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <HelpIcon />
            Context Help
          </SheetTitle>
          <SheetDescription className="sr-only">
            Detailed information about the selected parameter, chart, or metric
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full pr-4 mt-4">
          <InfoContent />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Combined InfoPanel that renders both desktop and mobile versions
 */
export const InfoPanel: React.FC = () => {
  return (
    <>
      <InfoPanelDesktop />
      <InfoPanelMobile />
    </>
  )
}
