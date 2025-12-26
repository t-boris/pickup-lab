/**
 * Pickup Analyzer
 *
 * Analyzes pickup configuration and computed results to generate
 * problems, warnings, recommendations, and descriptions.
 */

import type {
  CoilParams,
  MagnetParams,
  PositioningParams,
  LoadParams,
  TransformerParams,
  CoilComputedResults,
  MagnetComputedResults,
  LoadComputedResults,
} from '@/domain/types'
import { computeLoadedResonanceAndQ } from './impedance'

// ============================================================================
// TYPES
// ============================================================================

export type MessageLevel = 'danger' | 'warning' | 'info' | 'success'

export interface AnalysisMessage {
  level: MessageLevel
  title: string
  description: string
  suggestion?: string
}

export interface PickupAnalysis {
  /** Messages sorted by severity */
  messages: AnalysisMessage[]
}


// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Analyze coil parameters for issues
 */
const analyzeCoil = (
  coil: CoilParams,
  computed: CoilComputedResults
): AnalysisMessage[] => {
  const messages: AnalysisMessage[] = []
  const dcr = computed.dcResistance / 1000 // kΩ

  // Check DCR
  if (dcr > 20) {
    messages.push({
      level: 'danger',
      title: 'Extremely High DCR',
      description: `DC resistance of ${dcr.toFixed(1)}kΩ is extremely high. Signal will be very weak and noisy.`,
      suggestion: 'Use thicker wire (lower AWG) or reduce turns significantly.',
    })
  } else if (dcr > 15) {
    messages.push({
      level: 'warning',
      title: 'Very High DCR',
      description: `DC resistance of ${dcr.toFixed(1)}kΩ may cause signal loss and noise issues.`,
      suggestion: 'Consider using thicker wire or fewer turns.',
    })
  } else if (dcr > 12) {
    messages.push({
      level: 'info',
      title: 'High DCR',
      description: `DC resistance of ${dcr.toFixed(1)}kΩ is on the high side. Output will be hot but may lose some highs.`,
    })
  }

  // Check resonance
  if (computed.resonantFrequency < 1500) {
    messages.push({
      level: 'warning',
      title: 'Very Low Resonance',
      description: `Self-resonance at ${(computed.resonantFrequency / 1000).toFixed(1)}kHz is very low. Tone will be muddy.`,
      suggestion: 'Reduce turns or use wire with thinner insulation.',
    })
  }

  // Check Q factor
  if (computed.qualityFactor < 1.5) {
    messages.push({
      level: 'warning',
      title: 'Very Low Q Factor',
      description: `Q of ${computed.qualityFactor.toFixed(1)} means heavily damped response. No resonance peak audible.`,
      suggestion: 'This may be intentional for very smooth tone, or indicates excessive losses.',
    })
  }

  // Check turns vs capacity
  if (coil.wire.turns > computed.maxTurns * 0.95) {
    messages.push({
      level: 'warning',
      title: 'Bobbin Nearly Full',
      description: `${coil.wire.turns} turns is ${((coil.wire.turns / computed.maxTurns) * 100).toFixed(0)}% of estimated capacity.`,
      suggestion: 'Coil may overflow bobbin. Use scatter winding or larger bobbin.',
    })
  } else if (coil.wire.turns > computed.maxTurns) {
    messages.push({
      level: 'danger',
      title: 'Bobbin Overflow',
      description: `${coil.wire.turns} turns exceeds estimated capacity of ${computed.maxTurns}.`,
      suggestion: 'Reduce turns, use thinner wire, or increase bobbin size.',
    })
  }

  // Check packing factor
  if (coil.wire.packingFactor > 0.85 && coil.wire.windingStyle !== 'layered') {
    messages.push({
      level: 'info',
      title: 'High Packing Factor',
      description: `Packing factor of ${(coil.wire.packingFactor * 100).toFixed(0)}% is optimistic for ${coil.wire.windingStyle} winding.`,
      suggestion: 'Consider using 0.6-0.7 for scatter, 0.7-0.8 for random winding.',
    })
  }

  return messages
}

/**
 * Analyze magnet and positioning for issues
 */
const analyzeMagnet = (
  magnet: MagnetParams,
  positioning: PositioningParams,
  computed: MagnetComputedResults
): AnalysisMessage[] => {
  const messages: AnalysisMessage[] = []

  // String pull
  if (computed.stringPullWarning === 'danger') {
    messages.push({
      level: 'danger',
      title: 'Severe String Pull',
      description: 'Magnetic pull is very strong. Will cause pitch wobble (wolf tones) and intonation problems.',
      suggestion: 'Increase string distance, use weaker magnets, or demagnetize slightly.',
    })
  } else if (computed.stringPullWarning === 'caution') {
    messages.push({
      level: 'warning',
      title: 'Moderate String Pull',
      description: 'Magnetic pull may affect sustain and intonation on wound strings.',
      suggestion: 'Monitor for wolf tones. Consider increasing string distance.',
    })
  }

  // String distance
  if (positioning.stringToPoleDistance < 1.5) {
    messages.push({
      level: 'warning',
      title: 'String Very Close',
      description: `${positioning.stringToPoleDistance}mm clearance risks string hitting poles during hard playing.`,
      suggestion: 'Increase distance to at least 2mm for safety.',
    })
  } else if (positioning.stringToPoleDistance > 5) {
    messages.push({
      level: 'info',
      title: 'String Distance High',
      description: `${positioning.stringToPoleDistance}mm distance will reduce output and sensitivity.`,
      suggestion: 'Closer distance gives more output, but watch for string pull.',
    })
  }

  // Neodymium warning
  if (magnet.type === 'neodymium') {
    messages.push({
      level: 'info',
      title: 'Neodymium Magnets',
      description: 'Very strong field. Great for active pickups but may cause string pull in passive designs.',
      suggestion: 'Keep string distance generous (3-4mm) to avoid wolf tones.',
    })
  }

  // Cover effect
  if (magnet.coverType === 'chrome') {
    messages.push({
      level: 'info',
      title: 'Chrome Cover',
      description: 'Chrome plating causes significant treble roll-off due to eddy currents.',
      suggestion: 'Consider nickel silver for less treble loss, or remove cover for brightest tone.',
    })
  }

  return messages
}

/**
 * Analyze load and final response
 */
const analyzeLoad = (
  coilComputed: CoilComputedResults,
  loadComputed: LoadComputedResults,
  load: LoadParams,
  transformer?: TransformerParams
): AnalysisMessage[] => {
  const messages: AnalysisMessage[] = []

  // Get actual loaded resonance/Q (with transformer if enabled)
  const actualLoaded = transformer?.enabled
    ? computeLoadedResonanceAndQ(
        coilComputed.dcResistance,
        coilComputed.inductance,
        coilComputed.capacitance,
        load,
        transformer
      )
    : { loadedResonance: loadComputed.loadedResonance, loadedQ: loadComputed.loadedQ }

  // Loaded resonance analysis
  // Audio range is 20Hz-20kHz, resonance above 20kHz means flat response in audio band
  // Skip analysis if resonance is invalid (0 or below minimum frequency)
  if (actualLoaded.loadedResonance >= 100 && actualLoaded.loadedResonance < 2000) {
    messages.push({
      level: 'warning',
      title: 'Muddy Response',
      description: `Loaded resonance at ${(actualLoaded.loadedResonance / 1000).toFixed(1)}kHz is very low. Tone will lack clarity.`,
      suggestion: 'Use shorter cable, higher value pots, or reduce pickup capacitance.',
    })
  } else if (actualLoaded.loadedResonance > 20000) {
    // Resonance above audio range = flat response, ideal for hi-fi/transparent sound
    messages.push({
      level: 'success',
      title: 'Flat Audio Response',
      description: `Resonance at ${(actualLoaded.loadedResonance / 1000).toFixed(1)}kHz is above audio range. Response is flat across 20Hz-20kHz.`,
      suggestion: 'Ideal for transparent, hi-fi sound. No coloration from resonance peak.',
    })
  } else if (actualLoaded.loadedResonance > 10000) {
    // 10-20 kHz: bright but still within audio range
    messages.push({
      level: 'info',
      title: 'Bright Response',
      description: `Loaded resonance at ${(actualLoaded.loadedResonance / 1000).toFixed(1)}kHz emphasizes upper treble.`,
      suggestion: 'May want longer cable for warmer tone, or enjoy the sparkle.',
    })
  }

  // Cable capacitance
  const totalCablePf = loadComputed.totalCableCapacitance * 1e12
  if (totalCablePf > 1500) {
    messages.push({
      level: 'warning',
      title: 'High Cable Capacitance',
      description: `${totalCablePf.toFixed(0)}pF total cable capacitance is pulling resonance down significantly.`,
      suggestion: 'Use shorter cable or low-capacitance cable (<50pF/ft).',
    })
  }

  // Loaded Q
  if (actualLoaded.loadedQ < 1) {
    messages.push({
      level: 'info',
      title: 'Heavily Damped',
      description: `Loaded Q of ${actualLoaded.loadedQ.toFixed(1)} means very flat response with no resonance peak.`,
      suggestion: 'Use higher value pots (500k/1M) for more presence.',
    })
  }

  // Pot values
  if (load.volumePot < 250000 && coilComputed.inductance > 3) {
    messages.push({
      level: 'info',
      title: 'Low Value Pots',
      description: '250k pots with high-inductance pickup will sound dark.',
      suggestion: 'Consider 500k pots for brighter response.',
    })
  }

  return messages
}

/**
 * Generate recommendations based on overall analysis
 * Focus on things that could be improved, not "optimal" ranges
 */
const generateRecommendations = (
  coilComputed: CoilComputedResults,
  positioning: PositioningParams,
  magnetComputed?: MagnetComputedResults,
  loadComputed?: LoadComputedResults,
  load?: LoadParams,
  transformer?: TransformerParams
): AnalysisMessage[] => {
  const messages: AnalysisMessage[] = []
  const dcr = coilComputed.dcResistance / 1000

  // Detect bass pickup by string diameter (bass strings > 0.8mm)
  const isBassPickup = positioning.stringDiameter > 0.8

  // DCR tradeoffs - lower is always better for signal, but affects output
  if (dcr > 6) {
    messages.push({
      level: 'info',
      title: 'DCR Tradeoff',
      description: `${dcr.toFixed(1)}kΩ DCR increases output but also noise and signal loss.`,
      suggestion: 'Lower DCR = cleaner signal. Higher DCR = more output but muddier.',
    })
  }

  // Resonance analysis - use transformer-adjusted values if available
  if (loadComputed && load) {
    const actualLoaded = transformer?.enabled
      ? computeLoadedResonanceAndQ(
          coilComputed.dcResistance,
          coilComputed.inductance,
          coilComputed.capacitance,
          load,
          transformer
        )
      : { loadedResonance: loadComputed.loadedResonance, loadedQ: loadComputed.loadedQ }

    const f0 = actualLoaded.loadedResonance
    const q = actualLoaded.loadedQ

    // Skip analysis if resonance is invalid (0 or below minimum frequency)
    if (f0 < 100) {
      return messages
    }

    // Resonance thresholds differ for bass vs guitar
    // Bass pickups have lower usable range (40Hz-5kHz vs 80Hz-12kHz for guitar)
    const lowResonanceThreshold = isBassPickup ? 1500 : 3000
    const highResonanceThreshold = isBassPickup ? 4000 : 6000

    // Only analyze resonance within audio range (< 20 kHz)
    // Above 20 kHz = flat response in audio band = good
    if (f0 < lowResonanceThreshold) {
      messages.push({
        level: 'warning',
        title: 'Low Resonance',
        description: `${(f0 / 1000).toFixed(1)}kHz resonance may sound dark/muddy.`,
        suggestion: 'Reduce cable length or use higher value pots for brighter tone.',
      })
    } else if (f0 > highResonanceThreshold && f0 <= 20000) {
      messages.push({
        level: 'info',
        title: 'High Resonance',
        description: `${(f0 / 1000).toFixed(1)}kHz resonance - bright, sparkly tone.`,
        suggestion: 'Add cable capacitance or use 250k pots if too bright.',
      })
    }
    // f0 > 20kHz: no message needed, flat response is fine

    // Q analysis only relevant if resonance is in audio range
    if (f0 <= 20000) {
      if (q < 2) {
        messages.push({
          level: 'info',
          title: 'Low Q Factor',
          description: `Q of ${q.toFixed(1)} - flat response, no resonance peak audible.`,
          suggestion: 'Use higher value pots or reduce cable length for more presence.',
        })
      } else if (q > 6) {
        messages.push({
          level: 'info',
          title: 'High Q Factor',
          description: `Q of ${q.toFixed(1)} - pronounced resonance peak, characterful tone.`,
        })
      }
    }
  }

  // Sensitivity analysis - multiply by transformer ratio if enabled
  // Bass pickups naturally have lower mV/mm due to larger string amplitude
  if (magnetComputed) {
    const effectiveSensitivity = transformer?.enabled
      ? magnetComputed.sensitivityIndex * (transformer.winding.secondaryTurns / transformer.winding.primaryTurns)
      : magnetComputed.sensitivityIndex

    // Bass pickups: strings move more, so lower mV/mm is normal
    // Guitar: 0.15-1.2 mV/mm typical
    // Bass: 0.05-0.4 mV/mm typical (strings have ~3x amplitude)
    const lowSensitivityThreshold = isBassPickup ? 0.04 : 0.15
    const highSensitivityThreshold = isBassPickup ? 0.5 : 1.2

    if (effectiveSensitivity < lowSensitivityThreshold) {
      messages.push({
        level: 'warning',
        title: 'Low Sensitivity',
        description: `${effectiveSensitivity.toFixed(2)} mV/mm - weak output.`,
        suggestion: 'Move strings closer to poles or use stronger magnets.',
      })
    } else if (effectiveSensitivity > highSensitivityThreshold) {
      messages.push({
        level: 'info',
        title: 'Very High Sensitivity',
        description: `${effectiveSensitivity.toFixed(2)} mV/mm - may cause clipping.`,
        suggestion: 'Watch for input overload on clean amp settings.',
      })
    }
  }

  return messages
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Perform complete pickup analysis
 * Returns only issues and recommendations - no classification/naming
 */
export const analyzePickup = (
  coil: CoilParams,
  coilComputed: CoilComputedResults,
  magnet: MagnetParams,
  positioning: PositioningParams,
  magnetComputed?: MagnetComputedResults,
  load?: LoadParams,
  loadComputed?: LoadComputedResults,
  transformer?: TransformerParams
): PickupAnalysis => {
  const messages: AnalysisMessage[] = []

  // Gather all messages
  messages.push(...analyzeCoil(coil, coilComputed))

  if (magnetComputed) {
    messages.push(...analyzeMagnet(magnet, positioning, magnetComputed))
  }

  if (load && loadComputed) {
    messages.push(...analyzeLoad(coilComputed, loadComputed, load, transformer))
  }

  messages.push(...generateRecommendations(coilComputed, positioning, magnetComputed, loadComputed, load, transformer))

  // Sort by severity: danger > warning > info > success
  const levelOrder: Record<MessageLevel, number> = {
    danger: 0,
    warning: 1,
    info: 2,
    success: 3,
  }

  messages.sort((a, b) => levelOrder[a.level] - levelOrder[b.level])

  return { messages }
}
