/**
 * Info Content Types
 */

export interface InfoContentItem {
  title: string
  description: string
  details?: string
  examples?: string[]
  impact?: string
  warning?: string
  range?: { min: number; max: number; unit?: string; typical?: string }
}

export type InfoContentRecord = Record<string, InfoContentItem>
