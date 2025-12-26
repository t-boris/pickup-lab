/**
 * Info Content - Defaults
 */

import type { InfoContentRecord } from './types'

export const DEFAULTS_INFO: InfoContentRecord = {
  default: {
    title: 'Pickup Physics Lab',
    description: 'Interactive coil modeling and design tool.',
    details:
      'Click on any parameter, chart, or metric to see detailed information. Adjust sliders and inputs to see real-time changes in the frequency response and computed values.',
    examples: [
      'Click on a slider to learn what it controls',
      'Hover over charts to see specific values',
      'Click on KPI cards to understand the metrics',
    ],
    impact: 'Select any element to see its description and how it affects the pickup tone.',
  },
}
