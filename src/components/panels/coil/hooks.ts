/**
 * Coil Section Hooks
 *
 * Shared hooks for coil components.
 */

import { useUIStore } from '@/store'

export const useInfoFocus = () => {
  const setSelectedElement = useUIStore((s) => s.setSelectedElement)
  return (id: string) => () => setSelectedElement({ type: 'input', id })
}
