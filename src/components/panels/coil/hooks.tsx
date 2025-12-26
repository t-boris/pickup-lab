/**
 * Coil Section Hooks
 *
 * Shared hooks for coil components.
 */

import { useUIStore } from '@/store'
import { Label } from '@/components/ui/label'

export const useInfoFocus = () => {
  const setSelectedElement = useUIStore((s) => s.setSelectedElement)
  return (id: string) => () => setSelectedElement({ type: 'input', id })
}

export const useInfoClick = () => {
  const setSelectedElement = useUIStore((s) => s.setSelectedElement)
  return (id: string) => () => setSelectedElement({ type: 'input', id })
}

/**
 * Label with description - shows field name and brief explanation
 */
interface LabelWithDescProps {
  label: string
  desc?: string
  htmlFor?: string
}

export const LabelWithDesc: React.FC<LabelWithDescProps> = ({ label, desc, htmlFor }) => (
  <div className="space-y-0.5">
    <Label htmlFor={htmlFor}>{label}</Label>
    {desc && <p className="text-[10px] leading-tight text-muted-foreground">{desc}</p>}
  </div>
)

/**
 * Clickable stat item for wire properties display
 */
interface ClickableStatProps {
  label: string
  value: React.ReactNode
  infoId: string
}

export const ClickableStat: React.FC<ClickableStatProps> = ({ label, value, infoId }) => {
  const setSelectedElement = useUIStore((s) => s.setSelectedElement)
  return (
    <div
      className="cursor-pointer hover:text-primary transition-colors"
      onClick={() => setSelectedElement({ type: 'input', id: infoId })}
    >
      <span className="text-muted-foreground">{label}:</span>{' '}
      <span className="font-medium">{value}</span>
    </div>
  )
}
