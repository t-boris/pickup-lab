/**
 * Info Content - Magnet
 */

import type { InfoContentRecord } from './types'

export const MAGNET_INFO: InfoContentRecord = {
// MAGNET SECTION

  'magnet.type': {
    title: 'Magnet Material',
    description: 'The magnetic alloy used for the pickup magnets.',
    details:
      'Different materials have different magnetic strengths and tonal characteristics. Alnico types are numbered by alloy composition.',
    examples: [
      'AlNiCo 2: Weakest, warmest, vintage PAF character',
      'AlNiCo 3: Low output, sweet clean tones',
      'AlNiCo 5: Strong, bright, classic Fender/Gibson',
      'AlNiCo 8: Very strong, aggressive, modern',
      'Ceramic: Strongest, bright and percussive',
      'Neodymium: Extremely strong, very modern',
    ],
    impact:
      'Stronger magnets = more output, more string pull, potentially harsher highs.',
  },

  'magnet.geometry': {
    title: 'Magnet Geometry',
    description: 'The physical configuration of the magnetic system.',
    details:
      'ROD: Individual AlNiCo cylinders that ARE the pole pieces. Each rod is both magnet and pole. Classic Stratocaster design. BAR vs BLADE - key difference: In BAR design, the magnet is inside/beside the coil with optional steel pole pieces sitting ON TOP. In BLADE design, the magnet(s) are at the BOTTOM and a steel blade runs THROUGH the coil vertically, protruding toward strings. The blade transfers flux from distant magnet to strings.',
    examples: [
      'Rod (Strat): 6 AlNiCo rods through coil. Each rod = magnet + pole. Focused field, adjustable pole height.',
      'Bar (P-90/HB): Bar magnet inside assembly + steel pole pieces on top. Poles adjustable (screws) or fixed (slugs). Magnet is close to strings.',
      'Blade (Rail): Bar magnet(s) at bottom, steel blade runs through coil to strings. Blade is the pole piece. Uniform field, no dead spots between strings, but no per-string adjustment.',
    ],
    impact: 'Rod = classic tone, per-string focus. Bar = adjustable poles, warm tone. Blade = uniform response, modern clarity, string bending stays in the field.',
  },

  'magnet.diameter': {
    title: 'Magnet Diameter',
    description: 'Diameter of rod-style pole piece magnets.',
    range: { min: 3, max: 8, unit: 'mm', typical: '4.8-5mm (3/16")' },
    impact: 'Larger diameter = stronger field at string, more output.',
  },

  'magnet.width': {
    title: 'Bar Magnet Width',
    description: 'Width of bar-style magnets (perpendicular to strings).',
    details:
      'For bar magnets used in P-90s and humbuckers. Wider magnets create a broader magnetic field.',
    range: { min: 5, max: 20, unit: 'mm', typical: '12-15mm' },
    impact: 'Wider magnets sense more string vibration area.',
  },

  'magnet.magnetHeight': {
    title: 'Bar Magnet Height',
    description: 'Thickness of the bar magnet.',
    details:
      'The vertical dimension of bar magnets. Thicker magnets are generally stronger.',
    range: { min: 3, max: 10, unit: 'mm', typical: '5-6mm' },
    impact: 'Thicker magnets produce stronger field but add weight.',
  },

  'magnet.magnetLength': {
    title: 'Magnet Length',
    description: 'The length of the magnet (rod height or bar length).',
    range: { min: 10, max: 80, unit: 'mm', typical: '15-20mm for rods' },
    impact: 'Longer magnets generally produce stronger fields.',
  },

  'magnet.magnetization': {
    title: 'Magnetization Level',
    description: 'The current strength of the magnet relative to fully charged.',
    details:
      'Magnets lose strength over decades. Vintage pickups often have degraded magnets, which some players prefer for smoother tone.',
    examples: [
      '50-60%: Heavily aged vintage',
      '70-80%: Moderately aged',
      '90-100%: Fresh/recharged',
    ],
    range: { min: 0.5, max: 1, typical: '0.7-0.9' },
    impact: 'Lower magnetization = less output, less string pull, smoother tone.',
  },

  'magnet.polePieces': {
    title: 'Pole Pieces',
    description: 'Steel pole pieces that concentrate magnetic flux.',
    details:
      'Used with bar magnets to focus the field on each string. Common in P-90s and humbuckers. Not used with rod magnets.',
    impact:
      'Pole pieces increase sensitivity and can be adjusted for string balance.',
  },

  'magnet.bladeMaterial': {
    title: 'Blade Material',
    description: 'The steel alloy used for the blade/rail pole piece.',
    details:
      'The blade transfers magnetic flux from the bar magnet(s) to the strings. Material affects magnetic permeability and eddy current losses.',
    examples: [
      'Carbon Steel: High permeability, some eddy losses, can rust',
      'SS 430 (Ferritic): Magnetic stainless, corrosion resistant, common choice',
      'SS 420: Harder, less permeable, used for adjustable blades',
    ],
    impact: 'Higher permeability = stronger field at string. Stainless resists corrosion.',
  },

  'magnet.bladeThickness': {
    title: 'Blade Thickness',
    description: 'The width/thickness of the steel blade/rail.',
    details:
      'Thicker blades can carry more magnetic flux but may have more eddy current losses. Typical blades are 2-4mm thick.',
    range: { min: 1, max: 6, unit: 'mm', typical: '2-4mm' },
    impact: 'Thicker blade = more flux capacity, potentially more eddy losses.',
  },

  'magnet.bladeHeight': {
    title: 'Blade Protrusion',
    description: 'How far the blade extends above the coil top.',
    details:
      'The blade protrudes through the coil to get closer to the strings. More protrusion = closer to strings = more output.',
    range: { min: 0, max: 5, unit: 'mm', typical: '1-3mm' },
    impact: 'More protrusion brings the pole closer to strings, increasing output.',
  },

  'magnet.magnetCount': {
    title: 'Magnet Count',
    description: 'Number of bar magnets underneath the blade.',
    details:
      'Blade pickups can use 1 or 2 bar magnets. Two magnets (one on each side of blade) can provide a stronger, more focused field.',
    examples: [
      '1 magnet: Simpler, blade sits on top of magnet',
      '2 magnets: Blade sandwiched between or flanked by magnets',
    ],
    impact: 'Two magnets can provide stronger field but more complex construction.',
  },

  'positioning.stringToPoleDistance': {
    title: 'String to Pole Distance',
    description: 'Gap between the vibrating string and the magnetic pole.',
    details:
      'Critical parameter affecting both output and string pull. Too close causes "wolf tones" and intonation problems from magnetic drag.',
    examples: [
      '1.5-2mm: Very close, maximum output, risk of problems',
      '2.5-3mm: Standard setup, good balance',
      '4-5mm: Conservative, clean but lower output',
    ],
    range: { min: 1, max: 6, unit: 'mm', typical: '2.5-3.5mm' },
    impact:
      'Closer = more output but more string pull. Find the sweet spot for your magnet type.',
  },

  'positioning.poleSpacing': {
    title: 'Pole Spacing',
    description: 'Distance between adjacent pole pieces.',
    details:
      'Must match the string spacing at the pickup location. Different for bridge and neck positions.',
    examples: [
      '10.0-10.5mm: Vintage Fender spacing',
      '10.8mm: Modern Fender spacing',
      '11.3mm: Gibson bridge spacing',
    ],
    range: { min: 9, max: 12, unit: 'mm', typical: '10-11mm' },
    impact: 'Mismatched spacing causes uneven output between strings.',
  },
}
