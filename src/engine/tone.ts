/**
 * Tone Guide Calculations
 *
 * Converts pickup electrical characteristics (f₀, Q) and magnet type into
 * intuitive tone ratings for different frequency bands.
 *
 * Uses loaded values since that's what the player actually hears.
 * Magnet type affects perceived dynamics and harmonic content.
 */

import type { MagnetType, InsulationType, PolePieceMaterial, CoverType } from '@/domain/types'

// ============================================================================
// TYPES
// ============================================================================

export interface ToneRatings {
  /** Bass content (60-250 Hz region) - 0 to 10 scale */
  bass: number
  /** Low-mid content (250-800 Hz region) - 0 to 10 scale */
  lowMid: number
  /** High-mid content (800-3kHz region) - 0 to 10 scale */
  highMid: number
  /** Treble content (3kHz+ region) - 0 to 10 scale */
  treble: number
}

export interface ToneDescriptor {
  /** Short tone character description */
  character: string
  /** Tonal suggestions */
  suggestions: string[]
}

/** Magnet influence on tone perception */
interface MagnetModifier {
  bass: number
  lowMid: number
  highMid: number
  treble: number
  character: string
}

// ============================================================================
// MAGNET CHARACTER MODIFIERS
// ============================================================================

/**
 * Magnet type influences perceived tone character.
 * These modifiers adjust the EQ ratings based on magnet properties:
 * - Weaker magnets (AlNiCo 2/3): softer attack, more compression, warmer
 * - Stronger magnets (AlNiCo 5/8): more dynamics, punchier, brighter
 * - Ceramic/Neodymium: aggressive, tight low end, extended highs
 */
const MAGNET_MODIFIERS: Record<MagnetType, MagnetModifier> = {
  alnico2: {
    bass: +0.5,
    lowMid: +0.3,
    highMid: -0.3,
    treble: -0.5,
    character: 'soft',
  },
  alnico3: {
    bass: +0.3,
    lowMid: +0.2,
    highMid: -0.2,
    treble: -0.3,
    character: 'mellow',
  },
  alnico5: {
    bass: -0.2,
    lowMid: 0,
    highMid: +0.3,
    treble: +0.4,
    character: 'punchy',
  },
  alnico8: {
    bass: -0.4,
    lowMid: -0.2,
    highMid: +0.5,
    treble: +0.3,
    character: 'hot',
  },
  ferrite: {
    bass: -0.6,
    lowMid: -0.3,
    highMid: +0.6,
    treble: +0.7,
    character: 'aggressive',
  },
  neodymium: {
    bass: -0.4,
    lowMid: -0.2,
    highMid: +0.4,
    treble: +0.8,
    character: 'modern',
  },
}

/**
 * Get magnet modifier for a given magnet type
 */
export const getMagnetModifier = (magnetType: MagnetType): MagnetModifier => {
  return MAGNET_MODIFIERS[magnetType] ?? MAGNET_MODIFIERS.alnico5
}

// ============================================================================
// WIRE INSULATION MODIFIERS
// ============================================================================

/** Wire insulation influence on tone perception */
interface WireModifier {
  bass: number
  lowMid: number
  highMid: number
  treble: number
  character: string
}

/**
 * Wire insulation type influences perceived tone character.
 * Based on real-world observations from GuitarNutz and pickup builders:
 *
 * - Plain enamel: thinner coating, more mid emphasis, classic "bite"
 * - Heavy formvar: thicker coating, scooped mids, glassy highs/lows
 * - Poly: modern, consistent, neutral-bright
 * - Poly-nylon: solder-strippable, slightly warmer than poly
 */
const WIRE_MODIFIERS: Record<InsulationType, WireModifier> = {
  plain_enamel: {
    bass: -0.2,
    lowMid: +0.2,
    highMid: +0.4,  // More "bite" and mid presence
    treble: -0.2,
    character: 'biting',
  },
  heavy_formvar: {
    bass: +0.3,
    lowMid: -0.3,   // Scooped mids
    highMid: -0.2,
    treble: +0.3,   // Glassy highs
    character: 'glassy',
  },
  poly: {
    bass: 0,
    lowMid: 0,
    highMid: +0.1,
    treble: +0.2,
    character: 'modern',
  },
  poly_nylon: {
    bass: +0.1,
    lowMid: +0.1,
    highMid: 0,
    treble: 0,
    character: 'smooth',
  },
  solderable: {
    bass: 0,
    lowMid: 0,
    highMid: +0.2,
    treble: 0,
    character: 'neutral',
  },
}

/**
 * Get wire modifier for a given insulation type
 */
export const getWireModifier = (insulationType: InsulationType): WireModifier => {
  return WIRE_MODIFIERS[insulationType] ?? WIRE_MODIFIERS.plain_enamel
}

// ============================================================================
// EDDY CURRENT MODIFIERS
// ============================================================================

/**
 * Eddy current effects on tone.
 * Eddy currents in conductive materials cause:
 * - Energy loss (reduced Q factor)
 * - High frequency roll-off (reduced treble)
 * - Slightly warmer tone overall
 */
interface EddyModifier {
  /** Q factor reduction (multiplier, 1.0 = no effect) */
  qFactor: number
  /** Treble reduction */
  treble: number
  /** High-mid reduction (milder than treble) */
  highMid: number
  /** Description */
  character: string
}

/**
 * Pole piece material eddy current effects.
 * AlNiCo rod magnets have minimal eddy losses (rod = pole).
 * Steel slugs/screws have significant eddy losses.
 * Plated steel has even more due to conductive plating.
 */
const POLE_PIECE_MODIFIERS: Record<PolePieceMaterial, EddyModifier> = {
  alnico: {
    qFactor: 1.0,      // No eddy loss - AlNiCo is resistive
    treble: 0,
    highMid: 0,
    character: 'open',
  },
  steel: {
    qFactor: 0.85,     // ~15% Q reduction
    treble: -0.5,      // Steel slugs reduce highs
    highMid: -0.2,
    character: 'focused',
  },
  steel_plated: {
    qFactor: 0.75,     // ~25% Q reduction - plating adds more loss
    treble: -0.8,      // More HF roll-off
    highMid: -0.4,
    character: 'smooth',
  },
}

/**
 * Cover type eddy current effects.
 * Metal covers create eddy currents that reduce high frequencies.
 * German silver (nickel silver) is common for humbuckers.
 * Chrome plated covers have more loss.
 */
const COVER_MODIFIERS: Record<CoverType, EddyModifier> = {
  none: {
    qFactor: 1.0,      // No cover = no loss
    treble: 0,
    highMid: 0,
    character: 'bright',
  },
  plastic: {
    qFactor: 0.98,     // Negligible effect
    treble: -0.1,      // Slight damping
    highMid: 0,
    character: 'neutral',
  },
  nickel_silver: {
    qFactor: 0.85,     // ~15% Q reduction
    treble: -0.6,      // Typical "covered humbucker" roll-off (~2-3 dB)
    highMid: -0.3,
    character: 'warm',
  },
  chrome: {
    qFactor: 0.75,     // ~25% Q reduction - more conductive
    treble: -1.0,      // Significant HF loss
    highMid: -0.5,
    character: 'dark',
  },
}

/**
 * Get pole piece modifier
 */
export const getPolePieceModifier = (material: PolePieceMaterial): EddyModifier => {
  return POLE_PIECE_MODIFIERS[material] ?? POLE_PIECE_MODIFIERS.alnico
}

/**
 * Get cover modifier
 */
export const getCoverModifier = (coverType: CoverType): EddyModifier => {
  return COVER_MODIFIERS[coverType] ?? COVER_MODIFIERS.none
}

// ============================================================================
// REFERENCE VALUES
// ============================================================================

/**
 * Reference resonant frequency for "neutral" pickup
 * Loaded f₀ around 3.5 kHz is considered neutral/balanced
 */
const F0_REF = 3500 // Hz

/**
 * Reference Q factor for "neutral" pickup
 * Q around 3.0 is typical for loaded guitar pickup
 */
const Q_REF = 3.0

// ============================================================================
// TONE CALCULATION
// ============================================================================

/**
 * Compute tone ratings from loaded pickup parameters, magnet and wire type
 *
 * The model shows RELATIVE tonal emphasis, not absolute presence.
 * A bright pickup still has bass - it's just not emphasized.
 * Ratings stay in a realistic 3-8 range for most pickups.
 *
 * Higher f₀ → brighter (more treble emphasis, less bass emphasis)
 * Lower f₀ → darker (more bass emphasis, less treble emphasis)
 * Higher Q → sharper resonance peak (more high-mid presence)
 * Lower Q → flatter response (more even across bands)
 * Magnet type → affects dynamics and harmonic perception
 * Wire type → affects tonal character (enamel = bite, formvar = glassy)
 *
 * @param loadedF0 Loaded resonant frequency in Hz
 * @param loadedQ Loaded Q factor
 * @param magnetType Optional magnet type for tonal modifier
 * @param insulationType Optional wire insulation type for tonal modifier
 * @param polePieceMaterial Optional pole piece material for eddy current effects
 * @param coverType Optional cover type for eddy current effects
 * @returns Tone ratings for each band (0-10 scale)
 */
export const computeToneRatings = (
  loadedF0: number,
  loadedQ: number,
  magnetType?: MagnetType,
  insulationType?: InsulationType,
  polePieceMaterial?: PolePieceMaterial,
  coverType?: CoverType
): ToneRatings => {
  // Use logarithmic scaling for more natural perception
  // log2(f0/ref) gives: -1 for half freq, 0 for ref, +1 for double freq
  const rawBrightnessLog = Math.log2(loadedF0 / F0_REF)

  // Heavy soft-compress extreme brightness values for very smooth response
  // tanh smoothly limits to ±1.5 octaves from reference (tighter compression)
  const brightnessLog = Math.tanh(rawBrightnessLog / 1.5) * 1.5

  // Get modifiers (defaults to alnico5 and plain_enamel = neutral-ish)
  const magnet = magnetType ? getMagnetModifier(magnetType) : getMagnetModifier('alnico5')
  const wire = insulationType ? getWireModifier(insulationType) : getWireModifier('plain_enamel')
  const polePiece = polePieceMaterial ? getPolePieceModifier(polePieceMaterial) : getPolePieceModifier('alnico')
  const cover = coverType ? getCoverModifier(coverType) : getCoverModifier('none')

  // Apply eddy current Q modification
  // Eddy currents reduce Q by dissipating energy in conductive materials
  const effectiveQ = loadedQ * polePiece.qFactor * cover.qFactor

  // Q scaling with heavy compression for extreme values
  const rawPeakFactor = (effectiveQ - Q_REF) / Q_REF
  const peakFactor = Math.tanh(rawPeakFactor / 2) * 2

  // Presence band boost: resonance in 2.5-4.5 kHz range emphasizes upper mids
  // Very wide Gaussian for smooth transitions across all frequencies
  const presenceCenterHz = 3500
  const presenceWidth = 1.5 // octaves (half-width) - very wide for ultra-smooth response
  const presenceDistance = Math.abs(Math.log2(loadedF0 / presenceCenterHz))
  const presenceBoost = Math.exp(-(presenceDistance * presenceDistance) / (2 * presenceWidth * presenceWidth))
  // Gentler boost factor
  const presenceFactor = presenceBoost * 0.8

  // Calculate ratings centered at 5.0
  // Very gentle coefficients for ultra-smooth transitions
  // Range stays in 3.5-6.5 for most pickups

  // Bass: inversely proportional to brightness (log scale)
  let bass = 5.0 - brightnessLog * 0.8 + magnet.bass + wire.bass

  // Low-mid: slightly reduced by brightness, slightly by high Q
  let lowMid = 5.0 - brightnessLog * 0.5 - peakFactor * 0.15 - presenceFactor * 0.15 + magnet.lowMid + wire.lowMid

  // High-mid: the "presence" band
  let highMid = 5.0 + brightnessLog * 0.6 + peakFactor * 0.5 + presenceFactor * 0.8 + magnet.highMid + wire.highMid + polePiece.highMid + cover.highMid

  // Treble: proportional to brightness
  let treble = 5.0 + brightnessLog * 1.0 + peakFactor * 0.2 + magnet.treble + wire.treble + polePiece.treble + cover.treble

  // Extra-soft clamp with higher softness parameter
  bass = softClamp(bass, 1, 9, 3)
  lowMid = softClamp(lowMid, 1, 9, 3)
  highMid = softClamp(highMid, 1, 9, 3)
  treble = softClamp(treble, 1, 9, 3)

  return { bass, lowMid, highMid, treble }
}

/**
 * Get tone character description based on ratings
 *
 * @param ratings Tone ratings
 * @param loadedF0 Loaded resonant frequency in Hz
 * @param loadedQ Loaded Q factor
 * @param magnetType Optional magnet type for character description
 * @param insulationType Optional wire insulation type for character description
 * @param polePieceMaterial Optional pole piece material for eddy current character
 * @param coverType Optional cover type for eddy current character
 * @returns Character description and suggestions
 */
export const getToneDescriptor = (
  ratings: ToneRatings,
  loadedF0: number,
  loadedQ: number,
  magnetType?: MagnetType,
  insulationType?: InsulationType,
  polePieceMaterial?: PolePieceMaterial,
  coverType?: CoverType
): ToneDescriptor => {
  const { bass, lowMid, highMid, treble } = ratings

  const characteristics: string[] = []
  const suggestions: string[] = []

  // Add magnet character first if provided
  if (magnetType) {
    const magnet = getMagnetModifier(magnetType)
    characteristics.push(magnet.character)
  }

  // Add wire character if distinct from default
  if (insulationType && insulationType !== 'plain_enamel') {
    const wire = getWireModifier(insulationType)
    if (wire.character !== 'biting') {  // Don't add default
      characteristics.push(wire.character)
    }
  }

  // Add pole piece character if steel (noticeable tonal effect)
  if (polePieceMaterial && polePieceMaterial !== 'alnico') {
    const pole = getPolePieceModifier(polePieceMaterial)
    characteristics.push(pole.character)
  }

  // Add cover character if metal cover is present (significant tonal effect)
  if (coverType && coverType !== 'none' && coverType !== 'plastic') {
    const cover = getCoverModifier(coverType)
    characteristics.push(cover.character)
  }

  // Analyze bass/treble balance (using gentler thresholds)
  if (treble > bass + 1.5) {
    characteristics.push('bright')
  } else if (bass > treble + 1.5) {
    characteristics.push('warm')
  } else {
    characteristics.push('balanced')
  }

  // Analyze mid presence
  if (highMid > 6) {
    characteristics.push('present')
  } else if (highMid < 4.5) {
    characteristics.push('smooth')
  }

  // Analyze low-mid for body
  if (lowMid > 5.5) {
    characteristics.push('full')
  } else if (lowMid < 4) {
    characteristics.push('tight')
  }

  // Genre/style suggestions based on f₀
  if (loadedF0 < 3000) {
    suggestions.push('Warm voicing - jazz, blues, neck position')
  } else if (loadedF0 > 6000) {
    suggestions.push('Bright voicing - country, funk, bridge position')
  } else if (loadedF0 >= 3500 && loadedF0 <= 5000) {
    suggestions.push('Versatile voicing - rock, pop, all positions')
  }

  // Q-based suggestions
  if (loadedQ > 5) {
    suggestions.push('Pronounced peak - articulate attack')
  } else if (loadedQ < 2) {
    suggestions.push('Damped response - smooth, compressed feel')
  }

  // Build character string (max 2 descriptors)
  const character = characteristics.slice(0, 2).join(', ') || 'neutral'

  return {
    character: character.charAt(0).toUpperCase() + character.slice(1),
    suggestions: suggestions.slice(0, 1), // Only show most relevant
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Soft clamp using sigmoid-like function
 * Provides smooth transition at boundaries instead of hard cutoff
 *
 * @param value Input value
 * @param min Minimum output
 * @param max Maximum output
 * @param softness How gradual the transition is (higher = softer)
 */
const softClamp = (value: number, min: number, max: number, softness: number = 2): number => {
  const center = (min + max) / 2
  const range = (max - min) / 2

  // Normalize to -1 to 1 range
  const normalized = (value - center) / range

  // Apply soft sigmoid-like compression
  // tanh provides smooth S-curve that asymptotes at ±1
  const compressed = Math.tanh(normalized / softness) * softness

  // Scale back to min-max range
  return center + compressed * range / softness
}
