/**
 * Info Content - Load
 */

import type { InfoContentRecord } from './types'

export const LOAD_INFO: InfoContentRecord = {
// LOAD SECTION

  'load.volumePot': {
    title: 'Volume Pot',
    description: 'The volume control potentiometer resistance.',
    details:
      'This resistor is in parallel with the pickup, loading it. Higher values preserve more high frequencies.',
    examples: [
      '250k: Standard for single-coils (Fender)',
      '500k: Standard for humbuckers (Gibson)',
      '1M: No-load or high-impedance setups',
    ],
    range: { min: 100, max: 1000, unit: 'kΩ', typical: '250-500kΩ' },
    impact: 'Lower resistance = more treble loss, darker tone.',
  },

  'load.volumePosition': {
    title: 'Volume Position',
    description: 'Position of the volume knob (0-10).',
    details:
      'When volume is rolled down, the effective load resistance decreases. This causes the pickup to see a lower impedance, reducing Q and making the tone darker. This is why many guitars have "treble bleed" circuits.',
    examples: [
      '10: Full volume, normal tone',
      '5: Half volume, slightly darker',
      '0-2: Very dark, muffled tone',
    ],
    range: { min: 0, max: 10, unit: '', typical: '10' },
    impact: 'Lower position = lower effective load = darker tone.',
  },

  'load.tonePot': {
    title: 'Tone Pot',
    description: 'The tone control potentiometer resistance.',
    details:
      'Works with the tone capacitor to create a variable low-pass filter.',
    range: { min: 100, max: 1000, unit: 'kΩ', typical: '250-500kΩ' },
    impact: 'Affects how the tone control interacts with the tone cap.',
  },

  'load.toneCapacitor': {
    title: 'Tone Capacitor',
    description: 'Capacitor in the tone control circuit.',
    details:
      'Larger values cut more treble when tone is rolled off. Smaller values are more subtle.',
    examples: [
      '10nF (0.01µF): Subtle, more usable range',
      '22nF (0.022µF): Classic Fender value',
      '47nF (0.047µF): More dramatic effect',
      '100nF (0.1µF): Woman tone territory',
    ],
    range: { min: 10, max: 100, unit: 'nF', typical: '22-47nF' },
    impact: 'Larger cap = more bass-heavy when tone is down.',
  },

  'load.tonePosition': {
    title: 'Tone Position',
    description: 'Current setting of the tone control (0-100%).',
    details:
      '0% = full treble (tone cap bypassed), 100% = full bass (maximum filtering).',
    range: { min: 0, max: 100, unit: '%', typical: '0-50%' },
    impact: 'Higher = more treble cut.',
  },

  'load.cableCapacitance': {
    title: 'Cable Capacitance',
    description: 'Capacitance per meter of the instrument cable.',
    details:
      'All cables have parasitic capacitance. High-quality cables typically have lower capacitance.',
    examples: [
      '30-50 pF/m: Low-capacitance premium cables',
      '80-100 pF/m: Standard quality cables',
      '150-200 pF/m: Coiled cables, long runs',
    ],
    range: { min: 30, max: 200, unit: 'pF/m', typical: '50-100 pF/m' },
    impact: 'Higher capacitance = more treble loss, lower resonant peak.',
  },

  'load.cableLength': {
    title: 'Cable Length',
    description: 'Length of the instrument cable.',
    details:
      'Total cable capacitance = capacitance per meter × length. Long cables significantly affect tone.',
    examples: [
      '1-3m: Minimal effect on tone',
      '5-6m: Noticeable, often preferred',
      '10m+: Significant treble loss',
    ],
    range: { min: 1, max: 10, unit: 'm', typical: '3-6m' },
    impact: 'Longer cable = more treble loss, potentially desired warmth.',
  },

  'load.ampInputImpedance': {
    title: 'Amp Input Impedance',
    description: 'Input impedance of the amplifier or next device.',
    details:
      'Higher impedance loads the pickup less, preserving more highs. Buffers typically have very high input impedance.',
    examples: [
      '220kΩ: Vintage Fender amps',
      '470kΩ: Modern Fender amps',
      '1MΩ: Standard high-impedance input',
      '10MΩ: Active/buffered input',
    ],
    range: { min: 200, max: 10000, unit: 'kΩ', typical: '500-1000kΩ' },
    impact: 'Lower impedance = more loading, darker tone.',
  },
}
