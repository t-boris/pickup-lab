/**
 * Coil Section Constants
 *
 * Option arrays and template lists for coil configuration.
 */

import type {
  CoilForm,
  WindingStyle,
  InsulationType,
  CopperGrade,
  StrandType,
  InsulationClass,
} from '@/domain/types'
import { getTemplatesByCategory } from '@/lib/wireTemplates'

export const coilForms: { value: CoilForm; label: string }[] = [
  { value: 'cylindrical', label: 'Cylindrical' },
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'flatwork', label: 'Flatwork' },
]

export const windingStyles: { value: WindingStyle; label: string }[] = [
  { value: 'scatter', label: 'Scatter' },
  { value: 'random', label: 'Random' },
  { value: 'layered', label: 'Layered' },
]

export const insulationTypes: { value: InsulationType; label: string }[] = [
  { value: 'plain_enamel', label: 'Plain Enamel (PE)' },
  { value: 'heavy_formvar', label: 'Heavy Formvar (HF)' },
  { value: 'poly', label: 'Polyurethane' },
  { value: 'poly_nylon', label: 'Poly-Nylon (SPN)' },
  { value: 'solderable', label: 'Solderable' },
]

export const copperGrades: { value: CopperGrade; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard', description: '99.9%' },
  { value: 'ofc', label: 'OFC', description: '99.99%' },
  { value: 'occ', label: 'OCC', description: '99.9999%' },
]

export const strandTypes: { value: StrandType; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'stranded', label: 'Stranded' },
  { value: 'litz', label: 'Litz' },
]

export const insulationClasses: { value: InsulationClass; label: string }[] = [
  { value: 'A', label: 'A (105°C)' },
  { value: 'B', label: 'B (130°C)' },
  { value: 'F', label: 'F (155°C)' },
  { value: 'H', label: 'H (180°C)' },
  { value: 'N', label: 'N (200°C)' },
]

export const pickupTemplates = getTemplatesByCategory('pickup')
export const transformerTemplates = getTemplatesByCategory('transformer')
export const premiumTemplates = getTemplatesByCategory('premium')
