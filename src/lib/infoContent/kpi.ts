/**
 * Info Content - Kpi
 */

import type { InfoContentRecord } from './types'

export const KPI_INFO: InfoContentRecord = {
// KPI CARDS

  'kpi.inductance': {
    title: 'Inductance (L)',
    description: 'The coil inductance in millihenries.',
    details:
      'Inductance is proportional to turns squared and affected by core geometry. It determines the low-frequency cutoff of the resonance.',
    examples: [
      '2-3H: Low-output vintage single-coil',
      '4-5H: Hot single-coil or P-90',
      '6-8H: Humbucker',
    ],
    impact: 'Higher inductance = lower resonant frequency = darker tone.',
  },

  'kpi.dcResistance': {
    title: 'DC Resistance (Rdc)',
    description: 'The DC resistance of the coil wire.',
    details:
      'Determined by wire gauge, turns, and temperature. Often used as a rough indicator of output level, though inductance matters more.',
    examples: [
      '5-6kΩ: Low-output single-coil',
      '7-8kΩ: Standard single-coil',
      '9-12kΩ: Hot single-coil or humbucker coil',
    ],
    impact:
      'Higher resistance correlates with more turns and output, but also more noise and treble loss.',
  },

  'kpi.capacitance': {
    title: 'Parasitic Capacitance (Cp)',
    description: 'Self-capacitance of the coil in picofarads.',
    details:
      'Caused by capacitance between adjacent turns and layers. Combined with inductance, it sets the resonant frequency.',
    examples: [
      '80-100pF: Scatter-wound, open tone',
      '100-150pF: Standard winding',
      '150-200pF: Tightly wound, darker tone',
    ],
    impact: 'Higher capacitance = lower resonant frequency = darker, warmer tone.',
  },

  'kpi.resonance': {
    title: 'Resonant Frequency (f₀)',
    description: 'The natural resonant frequency of the pickup.',
    details:
      'f₀ = 1/(2π√LC). This is where the pickup is most sensitive and where the impedance peaks.',
    examples: [
      '8-10kHz: Bright, clear, articulate',
      '5-7kHz: Balanced, full range',
      '3-5kHz: Warm, smooth, vintage',
    ],
    impact: 'Lower resonance = warmer/darker, higher = brighter/more cutting.',
  },

  'kpi.wireLength': {
    title: 'Wire Length',
    description: 'Total length of wire in the coil.',
    details: 'Calculated from turns, mean turn length, and geometry.',
    impact: 'Longer wire = more resistance, more material cost.',
  },

  'kpi.qualityFactor': {
    title: 'Quality Factor (Q)',
    description: 'Sharpness of the resonant peak.',
    details:
      'Q = ω₀L/R. Higher Q means a sharper, more pronounced peak. Lower Q is more rounded.',
    examples: [
      'Q < 2: Very damped, smooth response',
      'Q 2-4: Normal pickup range',
      'Q > 5: Sharp peak, very vocal',
    ],
    impact: 'Higher Q = more pronounced resonant character, more "quack" or "honk".',
  },

  'kpi.bAtString': {
    title: 'B-Field at String',
    description: 'Magnetic field strength at the string position.',
    details:
      'Measured in millitesla (mT). Higher field means more output but also more string pull.',
    examples: [
      '20-40mT: Low string pull, vintage tone',
      '40-60mT: Standard range',
      '60-100mT: High output, watch for string pull',
    ],
    impact: 'Higher field = more output but potential sustain/intonation issues.',
  },

  'kpi.sensitivity': {
    title: 'Sensitivity',
    description: 'Output voltage per mm of string displacement.',
    details: 'Combines magnetic field and coil properties into a single figure of merit.',
    impact: 'Higher sensitivity = louder output for the same playing dynamics.',
  },

  'kpi.loadedResonance': {
    title: 'Loaded Resonance',
    description: 'Resonant frequency with the full signal chain connected.',
    details:
      'Cable capacitance and pot/amp loading lower the resonant frequency from the unloaded value.',
    impact:
      'This is the actual resonance you hear, typically 20-40% lower than unloaded.',
  },

  'kpi.loadedQ': {
    title: 'Loaded Q Factor',
    description: 'Quality factor with loading applied.',
    details: 'Loading reduces Q, making the peak broader and less pronounced.',
    impact: 'Loaded Q is typically 1-3, much lower than unloaded Q.',
  },

  'kpi.impedance1khz': {
    title: 'Output Impedance @ 1kHz',
    description: 'Source impedance of the pickup at 1kHz - determined only by the coil.',
    details:
      'This is the impedance the load (pots, cable, amp) "sees" looking back into the pickup. It depends ONLY on the coil properties (L, R, C), NOT on the pots or cable.\n\n' +
      'At 1kHz: Z ≈ √(R² + (2πfL)²)\n\n' +
      'Changing pots or cable does NOT change this value - those are the LOAD, not the source. However, higher output impedance means the pickup is MORE SENSITIVE to loading effects (cable capacitance lowers resonance more, pots dampen the peak more).\n\n' +
      'With a transformer enabled, the output impedance is multiplied by n² (turns ratio squared).',
    examples: [
      '5-10kΩ: Low-impedance pickup or with step-down transformer',
      '10-30kΩ: Typical single-coil or humbucker',
      '50-200kΩ: With step-up transformer (1:3 to 1:10 ratio)',
    ],
    impact:
      'Higher output impedance = more affected by cable and pot loading. Very high-Z pickups benefit from a buffer to preserve highs.',
  },

  'kpi.brightness': {
    title: 'Brightness Index',
    description: 'Relative indicator of high-frequency content.',
    details:
      'Calculated from resonant frequency and Q. Higher percentage = brighter overall character.',
    impact: 'Use this as a quick comparison between different configurations.',
  },

  'kpi.toneGuide': {
    title: 'Tone Guide',
    description: 'Visual EQ-style representation of pickup tonal character.',
    details:
      'Shows estimated energy distribution across four frequency bands: Bass (60-250 Hz), Low-Mid (250-800 Hz), High-Mid (800-3 kHz), and Treble (3+ kHz). Values are based on loaded resonant frequency and Q factor.',
    impact:
      'Higher f₀ shifts energy toward treble (brighter tone). Higher Q creates a sharper peak in the high-mids (more "presence"). Use this as a visual guide for comparing pickup voicing.',
    warning:
      'These ratings are relative to the pickup\'s own frequency response, not absolute values. A "balanced" bass pickup (like J-Bass) will show similar bar heights even though it sounds very different from a guitar pickup. Compare pickups of the same type for meaningful results.',
  },

  'kpi.voltageGain': {
    title: 'Voltage Gain',
    description: 'Transformer voltage amplification ratio.',
    details: 'Equal to the turns ratio Ns/Np. A 1:10 ratio gives 10x voltage gain.',
    impact: 'More gain = louder output, but also higher output impedance.',
  },

  'kpi.effectiveSensitivity': {
    title: 'Effective Sensitivity',
    description: 'Output sensitivity after transformer amplification.',
    details:
      'Coil sensitivity × transformer turns ratio. This is the actual output level you get after the transformer boosts the signal.\n\n' +
      'Example: 1-turn coil with 27 µV/mm + 1:100 transformer = 2.7 mV/mm effective sensitivity (same as a normal pickup!).\n\n' +
      'This is how low-impedance pickup designs work: fewer turns for lower noise and impedance, then transformer or preamp to boost the signal.',
    impact: 'This is your real-world output level after the transformer.',
  },

  'kpi.txBandwidth': {
    title: 'Transformer Bandwidth',
    description: 'Usable frequency range of the transformer.',
    details:
      'Limited by core inductance (low end) and leakage inductance (high end).',
    impact: 'Narrower bandwidth = more coloration, potentially cutting highs or lows.',
  },

  'kpi.analysis': {
    title: 'Pickup Analysis',
    description: 'Automated analysis of your pickup configuration.',
    details:
      'The analyzer checks your pickup parameters against known design guidelines and best practices. It identifies potential problems, warnings, and suggestions for improvement.\n\n' +
      'Messages are sorted by severity: danger (red), warning (yellow), info (blue), success (green).',
    impact: 'Use these messages as guidance to refine your pickup design.',
  },
}
