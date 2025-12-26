/**
 * Info Content - Coil
 */

import type { InfoContentRecord } from './types'

export const COIL_INFO: InfoContentRecord = {
// COIL SECTION - Geometry

  'coil.geometry.form': {
    title: 'Coil Form',
    description: 'The physical shape of the pickup coil bobbin.',
    details:
      'Different coil shapes affect inductance calculation and winding behavior. Cylindrical is most common for single-coils, rectangular for humbuckers. Flatwork refers to pickups wound on two flat fiber plates (top and bottom) connected by poles or spacers - the coil is wide and shallow like a pancake rather than tall.',
    examples: [
      'Cylindrical: Fender Stratocaster, Telecaster - wire wound around pole pieces',
      'Rectangular: Gibson PAF humbuckers, P-90s - tall bobbins with plastic forms',
      'Flatwork: Fender Jazzmaster, Jaguar - wide shallow coils on vulcanized fiber plates, lower inductance, brighter tone',
    ],
    impact: 'Shape affects magnetic field distribution and overall tone. Flatwork designs typically have lower inductance and brighter tone due to the shallow, spread-out winding.',
  },

  'coil.geometry.innerRadius': {
    title: 'Inner Radius',
    description: 'The distance from center to the innermost wire layer.',
    details:
      'This is typically determined by the bobbin or pole piece dimensions. Larger inner radius means more wire needed per turn.',
    range: { min: 2, max: 15, unit: 'mm', typical: '3-6mm' },
    impact: 'Affects inductance and total wire length. Larger = lower inductance per turn.',
  },

  'coil.geometry.poleDiameter': {
    title: 'Pole Piece Diameter',
    description: 'Diameter of the cylindrical pole pieces (AlNiCo rods).',
    details:
      'Standard Fender pole pieces are 0.195" (4.95mm). The coil is wound directly around the poles with minimal clearance.',
    examples: [
      '4.8mm (0.187"): Vintage spec',
      '5.0mm (0.195"): Standard Fender',
      '6.0mm: Overwound/larger poles',
    ],
    range: { min: 4, max: 8, unit: 'mm', typical: '5mm' },
    impact: 'Larger poles = more magnetic flux but less winding space.',
  },

  'coil.geometry.outerRadius': {
    title: 'Outer Radius',
    description: 'The maximum radius of the wound coil.',
    details:
      'Limited by bobbin flanges or cover dimensions. The difference between outer and inner radius determines winding window width.',
    range: { min: 5, max: 25, unit: 'mm', typical: '8-15mm' },
    impact: 'Larger outer radius allows more turns and higher output.',
  },

  'coil.geometry.height': {
    title: 'Coil Height',
    description: 'The axial length of the winding window.',
    details:
      'Taller coils can accommodate more turns in a layered winding. Also affects capacitance between layers.',
    range: { min: 3, max: 20, unit: 'mm', typical: '6-12mm' },
    impact: 'Taller coils have more capacitance, potentially lower resonant frequency.',
  },

  'coil.geometry.length': {
    title: 'Coil Length (Edge-to-Edge)',
    description: 'Total length of the pickup measured from edge to edge.',
    details:
      'This is the edge-to-edge measurement of the pickup, NOT center-to-center of the rounded ends. For a racetrack/stadium shape, the perimeter formula uses: P = 2L + W(π - 2), where L is this edge-to-edge length and W is the magnet width.',
    examples: [
      'Fender Strat: ~70mm edge-to-edge',
      'Fender Tele neck: ~65mm edge-to-edge',
      'P90: ~80mm edge-to-edge',
    ],
    range: { min: 50, max: 90, unit: 'mm', typical: '65-75mm' },
    impact: 'Longer coils capture more string area but increase wire length and resistance.',
  },

  'coil.geometry.width': {
    title: 'Coil Width',
    description: 'The width of the bobbin perpendicular to strings.',
    details:
      'For rectangular bobbins (humbuckers), this is the narrow dimension. For flatwork, this defines how wide the flat plates are.',
    range: { min: 10, max: 40, unit: 'mm', typical: '15-20mm for humbuckers, 25-35mm for flatwork' },
    impact: 'Wider coils have more winding area and can accommodate more turns.',
  },

  'coil.geometry.bobbinThickness': {
    title: 'Bobbin Wall Thickness',
    description: 'Thickness of the plastic bobbin walls.',
    details:
      'The walls that hold the coil in place. Thicker walls reduce winding area but increase durability.',
    range: { min: 0.5, max: 3, unit: 'mm', typical: '1-2mm' },
    impact: 'Thicker walls slightly reduce available winding space.',
  },

  'coil.geometry.plateThickness': {
    title: 'Flatwork Plate Thickness',
    description: 'Thickness of the top and bottom fiber plates.',
    details:
      'Traditional flatwork uses vulcanized fiber plates. The thickness affects rigidity and pole piece mounting.',
    examples: [
      '1.5mm (0.060"): Standard top plate',
      '2.4mm (0.093"): Standard bottom plate',
    ],
    range: { min: 1, max: 3, unit: 'mm', typical: '1.5-2.5mm' },
    impact: 'Thicker plates are more rigid but add to overall pickup height.',
  },

  'coil.geometry.bobbinWidth': {
    title: 'Bobbin Width',
    description: 'Inner width of the rectangular bobbin winding area.',
    details:
      'This is the space between the bobbin walls where wire is wound. The actual coil width grows as wire is added.',
    range: { min: 8, max: 20, unit: 'mm', typical: '10-15mm' },
    impact: 'Wider bobbin allows more turns per layer but increases mean turn length.',
  },

  'coil.geometry.magnetWidth': {
    title: 'Magnet Width',
    description: 'Width of the magnetic area measured across strings (perpendicular to neck).',
    details:
      'For flatwork pickups, this is the width of the bar magnet, blade, or pole arrangement that the coil wraps around. Measured perpendicular to the string direction.',
    examples: [
      'Jazzmaster bar: ~12-15mm',
      'Jaguar bar: ~10-12mm',
      'Blade pickup: 3-6mm',
    ],
    range: { min: 5, max: 20, unit: 'mm', typical: '10-15mm' },
    impact: 'Wider magnet = more wire per turn, affects mean turn length and inductance.',
  },

  // COIL SECTION - Wire

  'coil.wire.template': {
    title: 'Wire Template',
    description: 'Pre-configured wire specifications based on common magnet wire types.',
    details:
      'Selecting a template auto-fills wire diameter, insulation type, copper grade, and other properties. You can then customize individual values.',
    examples: [
      'AWG 42 Plain Enamel: Classic humbucker wire',
      'AWG 42 Heavy Formvar: 50s-60s Fender style',
      'AWG 43 Plain Enamel: Hot-wound pickups',
      'Litz 42×7: Low-loss transformer wire',
    ],
    impact: 'Templates ensure consistent, real-world wire specifications.',
  },

  'coil.wire.copperGrade': {
    title: 'Copper Grade',
    description: 'The purity level of the copper conductor.',
    details:
      'Standard electrolytic copper (99.9%) is used in most applications. OFC (Oxygen-Free Copper, 99.99%) and OCC (Ohno Continuous Cast, 99.9999%) offer slightly lower resistance and are marketed for audio applications.',
    examples: [
      'Standard: 99.9% purity, most common',
      'OFC: 99.99%, oxygen-free, ~0.5% lower resistance',
      'OCC: 99.9999%, single crystal, ~1% lower resistance',
    ],
    impact: 'Higher purity copper has marginally lower DC resistance.',
  },

  'coil.wire.strandType': {
    title: 'Wire Structure',
    description: 'Whether the conductor is solid or made of multiple strands.',
    details:
      'Solid wire is standard for pickup coils. Stranded wire is more flexible. Litz wire (multiple individually insulated strands) reduces skin effect losses at high frequencies and is used in hi-fi transformers.',
    examples: [
      'Solid: Single conductor, standard for pickups',
      'Stranded: Multiple parallel strands, flexible',
      'Litz: Insulated strands, low HF losses',
    ],
    impact: 'Litz wire reduces high-frequency losses in transformer applications.',
  },

  'coil.wire.strandCount': {
    title: 'Strand Count',
    description: 'Number of individual strands in stranded or Litz wire.',
    details:
      'Common values are 7, 19, or 42 strands. More strands reduce skin effect losses but increase complexity and bundle diameter.',
    range: { min: 2, max: 100, typical: '7-42' },
    impact: 'More strands = lower high-frequency losses but larger bundle diameter.',
  },

  'coil.wire.insulationClass': {
    title: 'Temperature Class',
    description: 'The NEMA temperature rating of the wire insulation.',
    details:
      'Indicates maximum safe operating temperature. Class A (105°C) is standard for room-temperature applications. Higher classes are used in transformers or high-power applications.',
    examples: [
      'Class A: 105°C - Standard pickup wire',
      'Class B: 130°C - General purpose',
      'Class F: 155°C - Higher temperature',
      'Class H: 180°C - High performance',
    ],
    impact: 'Higher class allows operation at elevated temperatures without insulation breakdown.',
  },

  'coil.wire.wireDiameter': {
    title: 'Wire Thickness (Bare Diameter)',
    description: 'The bare copper wire diameter in millimeters, before insulation.',
    details:
      'Pickup wire ranges from ~0.04mm (AWG 46, very thin) to ~1mm (AWG 18, thick). Standard pickups use 0.05-0.10mm. Thinner wire allows more turns but has higher resistance. Thicker wire is used for transformers and low-impedance pickups.',
    examples: [
      'AWG 42 (0.0635mm): Standard Fender single-coil',
      'AWG 43 (0.0559mm): Hot-wound pickups',
      'AWG 30 (0.255mm): Transformer primary',
      'AWG 22 (0.644mm): Low-impedance designs',
    ],
    range: { min: 0.04, max: 1.0, unit: 'mm', typical: '0.05-0.07mm (AWG 42-44)' },
    impact:
      'Thinner wire = more turns possible = higher output but more treble roll-off and higher resistance.',
  },

  'coil.wire.insulation': {
    title: 'Wire Insulation',
    description: 'The enamel coating type on the magnet wire.',
    details:
      'Insulation affects wire diameter and capacitance between turns. Thicker insulation reduces packing density but increases reliability. Different materials have varying dielectric constants that affect parasitic capacitance.',
    examples: [
      'Plain Enamel (PE): Thinnest (0.005mm), vintage-style, variable consistency',
      'Heavy Formvar (HF): Thicker (0.010mm), 50s-60s Fender, bright tone',
      'Polyurethane: Modern standard, consistent quality',
      'Poly-Nylon (SPN): Solder-strippable, production-friendly',
      'Solderable: Self-fluxing, easy connections',
    ],
    impact: 'Thicker insulation reduces capacitance but slightly reduces packing density.',
  },

  // COIL SECTION - Winding

  'coil.wire.turns': {
    title: 'Number of Turns',
    description: 'Total wire turns wound on the bobbin.',
    details:
      'The primary factor determining output level. More turns = more voltage induced by string vibration, but also more resistance and capacitance.',
    examples: [
      '5000-6000: Low-output vintage (Fender 50s)',
      '7500-8500: Standard output (Fender 60s)',
      '9000-10000: Hot output (custom)',
      '12000+: Very high output (active territory)',
    ],
    range: { min: 1000, max: 15000, typical: '7000-9000' },
    impact: 'More turns = higher output, darker tone, lower resonant frequency.',
  },

  'coil.wire.windingStyle': {
    title: 'Winding Style',
    description: 'How the wire is organized during winding.',
    details:
      'Affects parasitic capacitance and consistency. Scatter-wound has lower capacitance but less consistent. Machine-wound is more uniform.',
    examples: [
      'Scatter: Hand-guided random, lower capacitance, "airy" tone',
      'Random: Machine random, moderate capacitance',
      'Layered: Precise layers, highest capacitance, predictable',
    ],
    impact:
      'Scatter winding typically sounds more open and detailed due to lower capacitance.',
  },

  'coil.wire.packingFactor': {
    title: 'Packing Factor',
    description: 'How tightly the wire is packed (fill ratio).',
    details:
      'Ratio of wire cross-section to total winding area. Hand-wound typically 0.55-0.65, machine-wound up to 0.75. Perfect packing would be ~0.91.',
    range: { min: 0.5, max: 0.9, typical: '0.6-0.7' },
    impact:
      'Higher packing = more turns in same space = potentially higher output.',
  },

  'coil.couplingFactor': {
    title: 'Coupling Factor',
    description: 'How effectively the coil captures magnetic flux changes from string vibration.',
    details:
      'The coupling factor (k) represents the fraction of magnetic flux change that actually links with (passes through) the coil windings. A vibrating string modulates the magnetic field, but not all of this change is "seen" by every turn of wire. Factors affecting coupling:\n\n' +
      '• Coil geometry: Tighter winding around pole = better coupling\n' +
      '• Pole piece design: Focused field = higher coupling\n' +
      '• Winding pattern: Scatter-wound may have slightly lower coupling\n' +
      '• String position: Strings directly over poles = maximum coupling\n\n' +
      'This is NOT the same as magnetic field strength - a pickup can have strong magnets but poor coupling if the coil is far from the flux path.',
    range: { min: 0.2, max: 0.95, typical: '0.6-0.85' },
    examples: [
      'Low (0.3-0.5): Loose winding, coil far from poles, poor geometry',
      'Medium (0.5-0.7): Typical single coils, reasonable geometry',
      'High (0.7-0.9): Tight winding close to poles, optimized design',
    ],
    impact:
      'Directly multiplies output. Coupling 0.7 vs 0.35 = 2× the sensitivity. Most significant "hidden" factor in pickup output.',
  },
}
