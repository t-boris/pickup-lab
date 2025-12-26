/**
 * Info Content - Transformer
 */

import type { InfoContentRecord } from './types'

export const TRANSFORMER_INFO: InfoContentRecord = {
// TRANSFORMER SECTION

  'transformer.enabled': {
    title: 'Enable Transformer',
    description: 'Add a step-up transformer to boost the pickup signal.',
    details:
      'Transformers can increase voltage (and impedance) for preamp matching or tonal coloration. Common in low-impedance pickup designs where a small coil is boosted by a step-up transformer.',
    impact:
      'Adds voltage gain but also increases output impedance by n². May affect frequency response.',
  },

  'transformer.core.shape': {
    title: 'Core Shape',
    description: 'The physical geometry of the transformer core.',
    details:
      'Core shape affects magnetic efficiency, noise pickup, and construction complexity. Toroids have the best performance but are harder to wind.',
    examples: [
      'Toroid (Round): Circular ring, lowest external field, quietest, best coupling',
      'Toroid (Oval): Racetrack shape, easier winding than round',
      'C-Core: Two C-shaped halves, good shielding, industry standard',
      'EI-Core: Classic E+I laminations, economical, easy to wind',
    ],
    impact: 'Toroid is quietest and most efficient. EI is cheapest and easiest to manufacture.',
  },

  'transformer.core.material': {
    title: 'Core Material',
    description: 'The magnetic alloy used in the transformer core.',
    details:
      'Core material determines permeability (inductance per turn), saturation flux density (headroom), and frequency-dependent losses. Each material family has variants optimized for different applications.',
    examples: [
      'Nanocrystalline Fe: µr ~80,000, Bsat 1.23T, lowest losses, premium audio',
      'Nanocrystalline Co: µr ~150,000, Bsat 0.8T, highest permeability',
      'Amorphous Fe: µr ~30,000, Bsat 1.56T, highest saturation',
      'Amorphous Co: µr ~120,000, Bsat 0.57T, very high µ',
      'MnZn Ferrite: µr ~5,000, Bsat 0.45T, good for low frequency',
      'NiZn Ferrite: µr ~500, Bsat 0.35T, best for high frequency',
      'Silicon Steel: µr ~4,000, Bsat 1.8T, traditional, higher losses',
    ],
    impact: 'Higher permeability = more inductance = better low-frequency response. Higher Bsat = more headroom before saturation.',
  },

  'transformer.core.toroidGeometry.innerDiameter': {
    title: 'Toroid Inner Diameter',
    description: 'The inside diameter of the toroid ring.',
    details:
      'This is the winding window. Wire must pass through this opening. Too small makes winding difficult.',
    range: { min: 5, max: 50, unit: 'mm', typical: '8-15mm' },
    impact: 'Larger inner diameter = easier winding but lower effective area.',
  },

  'transformer.core.toroidGeometry.outerDiameter': {
    title: 'Toroid Outer Diameter',
    description: 'The outside diameter of the toroid ring.',
    details:
      'Determines the overall size and core cross-section. Effective area ≈ (OD - ID)/2 × height.',
    range: { min: 10, max: 80, unit: 'mm', typical: '15-30mm' },
    impact: 'Larger OD = more core area = higher inductance and saturation margin.',
  },

  'transformer.core.toroidGeometry.height': {
    title: 'Toroid Height',
    description: 'The axial height (thickness) of the toroid core.',
    details:
      'Along with radial width (OD-ID)/2, determines the effective cross-sectional area.',
    range: { min: 3, max: 30, unit: 'mm', typical: '5-15mm' },
    impact: 'More height = more core area = better performance.',
  },

  'transformer.core.toroidGeometry.straightLength': {
    title: 'Oval Straight Section',
    description: 'Length of the straight section for oval/racetrack toroids.',
    details:
      'An oval toroid has two straight sides connected by semicircular ends. This parameter specifies the length of the straight section. Set to 0 for a round toroid.',
    range: { min: 0, max: 50, unit: 'mm', typical: '10-30mm' },
    impact: 'Longer straight section = more winding window, easier to wind.',
  },

  'transformer.core.effectiveArea': {
    title: 'Effective Core Area (Ae)',
    description: 'Cross-sectional area of the magnetic core.',
    details:
      'For toroids, Ae ≈ (OD - ID)/2 × height. This determines how much magnetic flux the core can carry before saturating.',
    range: { min: 10, max: 200, unit: 'mm²', typical: '20-60mm² for audio' },
    impact: 'Larger area = more flux capacity = less saturation, higher inductance.',
  },

  'transformer.core.effectiveLength': {
    title: 'Effective Path Length (le)',
    description: 'Average length of magnetic flux path through core.',
    details:
      'For toroids, le ≈ π × (OD + ID)/2. Shorter path means higher inductance for the same number of turns.',
    range: { min: 20, max: 150, unit: 'mm', typical: '40-80mm' },
    impact: 'Shorter path = higher inductance per turn = better low-frequency response.',
  },

  'transformer.core.airGap': {
    title: 'Air Gap',
    description: 'Gap in the magnetic core to prevent saturation.',
    details:
      'A small air gap reduces effective permeability dramatically (µeff = µr / (1 + µr × lg/le)) but increases DC handling capability and linearity. Most audio transformers use closed cores (no gap).',
    range: { min: 0, max: 0.5, unit: 'mm', typical: '0mm for audio' },
    impact: 'Any gap dramatically reduces inductance. Only use for DC-coupled applications.',
  },

  'transformer.winding.primaryConductor.type': {
    title: 'Primary Conductor Type',
    description: 'Wire or plate/strip for the primary winding.',
    details:
      'Standard magnet wire is most common. Copper or silver plate/strip is sometimes used for very low DC resistance in single-turn or few-turn primaries.',
    examples: [
      'Wire: Standard magnet wire, any turn count',
      'Plate/Strip: Metal foil, typically 1-10 turns, very low DCR',
    ],
    impact: 'Plate winding has lowest resistance but limited turn count.',
  },

  'transformer.winding.primaryConductor.material': {
    title: 'Primary Conductor Material',
    description: 'The metal used for the primary winding.',
    details:
      'Copper is standard. OFC (Oxygen-Free Copper) has marginally lower resistance. Silver has lowest resistance but highest cost. Aluminum is lighter and cheaper but higher resistance.',
    examples: [
      'Copper: Standard, good conductivity, economical',
      'OFC Copper: ~0.5% lower resistance, premium',
      'Silver: ~5% lower resistance, very expensive',
      'Aluminum: Lighter, higher resistance, used in large power transformers',
    ],
    impact: 'Lower resistance = less loss, but differences are small for audio transformers.',
  },

  'transformer.winding.primaryConductor.wireAwg': {
    title: 'Primary Wire AWG',
    description: 'American Wire Gauge of the primary winding wire.',
    details:
      'Thicker wire (lower AWG number) has lower resistance but takes more space. For step-up transformers with few primary turns, thicker wire is common.',
    examples: [
      'AWG 30-34: Fine wire for many-turn windings',
      'AWG 36-40: Standard magnet wire range',
      'AWG 42-44: Very fine for compact designs',
    ],
    range: { min: 20, max: 46, typical: 'AWG 34-42' },
    impact: 'Thicker wire = lower DCR but less turns fit in the window.',
  },

  'transformer.winding.primaryConductor.plateThickness': {
    title: 'Plate Thickness',
    description: 'Thickness of copper or silver plate for plate winding.',
    details:
      'Plate winding uses thin metal foil wound in a spiral. Thicker plate has lower resistance but may not fit in the winding window.',
    range: { min: 0.05, max: 1.0, unit: 'mm', typical: '0.1-0.3mm' },
    impact: 'Thicker plate = lower resistance but harder to wind.',
  },

  'transformer.winding.primaryConductor.plateWidth': {
    title: 'Plate Width',
    description: 'Width of the metal plate for plate winding.',
    details:
      'The plate width determines the winding height coverage. Typically sized to span the full core height minus insulation clearance.',
    range: { min: 2, max: 30, unit: 'mm', typical: '5-15mm' },
    impact: 'Wider plate = better fill factor and lower resistance.',
  },

  'transformer.winding.primaryTurns': {
    title: 'Primary Turns',
    description: 'Number of turns on the input (pickup) side.',
    details:
      'For step-up transformers, fewer primary turns means higher turns ratio and more gain. Primary inductance must be high enough to avoid low-frequency rolloff.',
    range: { min: 10, max: 2000, typical: '50-500' },
    impact: 'Fewer turns = higher step-up ratio but lower primary inductance.',
  },

  'transformer.winding.secondaryTurns': {
    title: 'Secondary Turns',
    description: 'Number of turns on the output side.',
    details:
      'Turns ratio n = Ns/Np determines voltage gain. Output impedance increases by n². For a 1:10 ratio, 10 kΩ source becomes 1 MΩ output.',
    range: { min: 100, max: 5000, typical: '500-3000' },
    impact: 'More turns = higher gain but higher output impedance.',
  },

  'transformer.winding.secondaryAwg': {
    title: 'Secondary Wire AWG',
    description: 'Wire gauge for the secondary winding.',
    details:
      'Secondary has many more turns, so finer wire is common. Must balance between resistance and fit in the winding window.',
    range: { min: 30, max: 48, typical: 'AWG 40-44' },
    impact: 'Finer wire allows more turns but increases resistance.',
  },

  'transformer.winding.secondaryMaterial': {
    title: 'Secondary Wire Material',
    description: 'Conductor material for the secondary winding.',
    details:
      'Same options as primary. Copper is standard for cost reasons. Silver secondaries are rare due to the large amount of wire needed.',
    impact: 'Material affects resistance and cost.',
  },

  'transformer.winding.windingStyle': {
    title: 'Winding Style',
    description: 'How primary and secondary are wound relative to each other.',
    details:
      'Interleaved winding alternates primary and secondary layers (P-S-P-S...) for better coupling and lower leakage inductance. Non-interleaved keeps them separate (all P, then all S), simpler but more leakage.',
    examples: [
      'Interleaved: 1-2% leakage, best high-frequency response',
      'Non-Interleaved: 3-10% leakage, simpler construction',
    ],
    impact: 'Interleaved dramatically improves bandwidth and coupling.',
  },

  'transformer.winding.shielding': {
    title: 'Electrostatic Shielding',
    description: 'Faraday shield between primary and secondary windings.',
    details:
      'A thin copper foil or wire layer between windings that blocks capacitive (electrostatic) coupling while allowing magnetic coupling. Connected to ground/chassis.',
    examples: [
      'Enabled: Reduces common-mode noise, blocks capacitive feedthrough',
      'Disabled: Simpler, higher interwinding capacitance',
    ],
    impact: 'Shielding improves noise rejection and reduces high-frequency feedthrough.',
  },

  'transformer.parasitics.leakageInductance': {
    title: 'Leakage Inductance',
    description: 'Inductance not coupled between primary and secondary.',
    details:
      'Caused by magnetic flux that links one winding but not the other. Acts as a series inductance that limits high-frequency response. Interleaved winding and tight coupling minimize leakage.',
    range: { min: 0.01, max: 50, unit: 'mH', typical: '0.1-2mH' },
    impact: 'High leakage creates a low-pass filter, limiting bandwidth.',
  },

  'transformer.parasitics.interwindingCapacitance': {
    title: 'Interwinding Capacitance (Ciw)',
    description: 'Parasitic capacitance between primary and secondary.',
    details:
      'Capacitance between adjacent primary and secondary turns. Allows high-frequency signals to bypass the magnetic coupling. Shielding reduces this effect.',
    range: { min: 5, max: 200, unit: 'pF', typical: '10-50pF' },
    impact: 'Higher Ciw = more high-frequency feedthrough, potentially more noise.',
  },

  'transformer.parasitics.primaryCapacitance': {
    title: 'Primary Capacitance (Cpri)',
    description: 'Self-capacitance of the primary winding.',
    details:
      'Capacitance between turns within the primary winding. Affects the primary resonant frequency.',
    range: { min: 3, max: 50, unit: 'pF', typical: '5-20pF' },
    impact: 'Contributes to high-frequency rolloff.',
  },

  'transformer.parasitics.secondaryCapacitance': {
    title: 'Secondary Capacitance (Csec)',
    description: 'Self-capacitance of the secondary winding.',
    details:
      'Capacitance between turns in the secondary. More significant than primary due to more turns and higher voltage per turn.',
    range: { min: 5, max: 150, unit: 'pF', typical: '10-50pF' },
    impact: 'Sets the secondary self-resonant frequency, limiting bandwidth.',
  },
}
