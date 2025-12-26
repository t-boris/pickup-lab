/**
 * Info Content - Charts
 */

import type { InfoContentRecord } from './types'

export const CHARTS_INFO: InfoContentRecord = {
// CHARTS

  'chart.frequency': {
    title: 'Frequency Response',
    description: 'Shows how the pickup responds across the audio spectrum.',
    details:
      'This Bode plot displays magnitude (dB) vs frequency (Hz) on logarithmic scales. The peak indicates the resonant frequency where the pickup is most sensitive.',
    examples: [
      'Flat response until peak = consistent mids',
      'High peak = pronounced resonance, vocal quality',
      'Wide peak = more even response, hi-fi character',
    ],
    impact:
      'The resonant peak frequency largely determines the "character" - lower peak = warmer, higher = brighter.',
  },

  'chart.impedance': {
    title: 'Impedance vs Frequency',
    description: 'Shows how the pickup impedance varies with frequency.',
    details:
      'At low frequencies, impedance is dominated by DC resistance. At resonance, impedance peaks dramatically. Above resonance, it rolls off.',
    examples: [
      'Low frequency: ~10kΩ (DC resistance)',
      'At resonance: Can exceed 100kΩ',
      'High frequency: Drops as capacitance dominates',
    ],
    impact:
      'High impedance at resonance means the pickup is very sensitive there. Loading effects are strongest here.',
  },

  'chart.phase': {
    title: 'Phase Response',
    description: 'Shows phase shift introduced at different frequencies.',
    details:
      'The pickup acts as a resonant filter, introducing phase shifts. At resonance, there is a rapid phase transition.',
    examples: [
      'Below resonance: Leading phase (+)',
      'At resonance: Phase crosses zero',
      'Above resonance: Lagging phase (-)',
    ],
    impact: 'Phase is important for combining multiple pickups and effects.',
  },

  'chart.bfield': {
    title: 'Magnetic Field vs Distance',
    description: 'Shows how magnetic field strength decays with distance from pole.',
    details:
      'Field strength drops rapidly with distance (approximately inverse cube law for dipoles). The marker shows where the string sits.',
    examples: [
      'Close to pole: Strong field, high sensitivity',
      'At string: Actual operating point',
      'Further: Rapid decay, low sensitivity',
    ],
    impact:
      'Understanding field decay helps optimize pickup height for best balance of output and string pull.',
  },

  'chart.output': {
    title: 'Relative Output vs Distance',
    description: 'Shows how pickup output varies with string distance.',
    details:
      'Combines magnetic field strength with coupling factor to show expected relative output at different heights.',
    examples: [
      'Very close (1-2mm): Maximum output but risk of problems',
      'Optimal (2.5-4mm): Good balance of output and clarity',
      'Far (5mm+): Clean but reduced output',
    ],
    impact:
      'Use this to find the optimal pickup height for your playing style and magnet type.',
  },
}
