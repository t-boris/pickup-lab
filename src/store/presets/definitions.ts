/**
 * Built-in Preset Definitions
 *
 * Classic pickup configurations for reference and comparison.
 * Each preset represents a real-world pickup design with accurate specs.
 */

import type { PickupConfig } from '@/domain/types'
import { MODEL_VERSION } from '@/lib/calibration'

/**
 * Generate unique ID for presets
 */
export const generateId = (): string => {
  return `preset_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Built-in presets based on classic pickup designs
 */
export const BUILTIN_PRESETS: PickupConfig[] = [
  // ============================================================================
  // SINGLE COILS
  // ============================================================================

  // 1. 60's Strat - Vintage bright, glassy tone
  {
    id: 'builtin_60s_strat',
    name: "60's Strat",
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'flatwork',
        innerRadius: 4.76,    // 3/16" pole pieces
        outerRadius: 16,      // Wider winding area
        height: 7,            // Taller for capacity
        length: 68,           // Strat bobbin length
      },
      wire: {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,         // AWG 42
        insulation: 'heavy_formvar',  // 60s used Formvar
        insulationClass: 'A',
        turns: 7800,                  // Typical 60s bridge
        windingStyle: 'scatter',
        packingFactor: 0.62,          // Hand-wound scatter
        temperature: 20,
      },
      couplingFactor: 0.50,           // Better coupling
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'alnico5',
      geometry: 'rod',
      diameter: 4.76,
      magnetLength: 17,
      magnetization: 0.92,    // Strong vintage
      polePieces: false,
      polePieceMaterial: 'alnico',
      coverType: 'none',
    },
    positioning: {
      stringToPoleDistance: 2.5,      // Closer for better output
      coilToStringDistance: 2.8,
      poleSpacing: 10.4,
      stringDiameter: 0.43,
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: false,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 50,
        effectiveLength: 60,
        airGap: 0,
      },
      winding: {
        primaryTurns: 200,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 38 },
        secondaryTurns: 2000,
        secondaryAwg: 42,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: false,
      },
    },
    load: {
      volumePot: 250000,
      volumePosition: 1,
      tonePot: 250000,
      toneCapacitor: 47e-9,       // 47nF - darker vintage tone
      tonePosition: 0,
      cableCapacitancePerMeter: 100e-12,
      cableLength: 6,             // Longer vintage cable
      ampInputImpedance: 1e6,
    },
  },

  // 2. 50's Tele Bridge - Twangy, aggressive
  {
    id: 'builtin_50s_tele',
    name: "50's Tele Bridge",
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'flatwork',
        innerRadius: 4.76,
        outerRadius: 15,              // Wider bobbin
        height: 6,                    // Taller for capacity
        length: 72,                   // Tele is slightly longer
      },
      wire: {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,
        insulation: 'plain_enamel',   // 50s used plain enamel
        insulationClass: 'A',
        turns: 7200,                  // 50s Tele bridge
        windingStyle: 'scatter',
        packingFactor: 0.60,
        temperature: 20,
      },
      couplingFactor: 0.48,           // Better coupling
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'alnico5',
      geometry: 'rod',
      diameter: 4.76,
      magnetLength: 16,
      magnetization: 0.90,    // Strong vintage
      polePieces: false,
      polePieceMaterial: 'alnico',
      coverType: 'none',
    },
    positioning: {
      stringToPoleDistance: 2.5,      // Closer for output
      coilToStringDistance: 2.8,
      poleSpacing: 10.8,              // Slightly wider Tele spacing
      stringDiameter: 0.43,
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: false,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 50,
        effectiveLength: 60,
        airGap: 0,
      },
      winding: {
        primaryTurns: 200,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 38 },
        secondaryTurns: 2000,
        secondaryAwg: 42,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: false,
      },
    },
    load: {
      volumePot: 250000,
      volumePosition: 1,
      tonePot: 1000000,           // 1M tone pot - brighter!
      toneCapacitor: 22e-9,       // 22nF - less treble cut
      tonePosition: 0,
      cableCapacitancePerMeter: 80e-12,   // Lower cap cable
      cableLength: 4,
      ampInputImpedance: 1e6,
    },
  },

  // 3. Texas Hot - Overwound, mid-focused
  {
    id: 'builtin_texas_hot',
    name: 'Texas Hot',
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'flatwork',
        innerRadius: 4.76,
        outerRadius: 17,      // Wider for more turns
        height: 8,            // Taller for 10k+ turns
        length: 68,
      },
      wire: {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0559,         // AWG 43 for more turns
        insulation: 'poly',           // Modern poly
        insulationClass: 'B',
        turns: 10500,                 // Heavily overwound
        windingStyle: 'scatter',
        packingFactor: 0.65,
        temperature: 20,
      },
      couplingFactor: 0.52,           // Better coupling
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'alnico5',
      geometry: 'rod',
      diameter: 4.76,
      magnetLength: 18,
      magnetization: 0.92,    // Slightly demagnetized to reduce string pull
      polePieces: false,
      polePieceMaterial: 'alnico',
      coverType: 'none',
    },
    positioning: {
      stringToPoleDistance: 2.8,  // Safer distance to avoid string pull
      coilToStringDistance: 3.0,
      poleSpacing: 10.4,
      stringDiameter: 0.43,
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: false,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 50,
        effectiveLength: 60,
        airGap: 0,
      },
      winding: {
        primaryTurns: 200,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 38 },
        secondaryTurns: 2000,
        secondaryAwg: 42,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: false,
      },
    },
    load: {
      volumePot: 250000,
      volumePosition: 1,
      tonePot: 250000,
      toneCapacitor: 22e-9,
      tonePosition: 0,
      cableCapacitancePerMeter: 80e-12,   // Lower cap cable for brightness
      cableLength: 4,                      // Shorter cable
      ampInputImpedance: 1e6,
    },
  },

  // ============================================================================
  // P-90 STYLE
  // ============================================================================

  // 4. P-90 Soapbar - Fat, gritty, bluesy
  {
    id: 'builtin_p90',
    name: 'P-90 Soapbar',
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'rectangular',
        innerRadius: 6,       // Wide bobbin
        outerRadius: 16,      // ~10mm winding width per side
        height: 11,           // Tall coil
        length: 84,           // P-90 length
      },
      wire: {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,         // AWG 42
        insulation: 'plain_enamel',
        insulationClass: 'A',
        turns: 9800,                  // Typical P-90
        windingStyle: 'scatter',
        packingFactor: 0.60,          // P-90s are loosely wound
        temperature: 20,
      },
      couplingFactor: 0.55,
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'alnico5',
      geometry: 'bar',
      width: 12,
      magnetLength: 76,
      magnetHeight: 6,
      magnetization: 0.90,
      polePieces: true,
      polePieceMaterial: 'steel',
      coverType: 'none',
    },
    positioning: {
      stringToPoleDistance: 3.0,
      coilToStringDistance: 3.5,
      poleSpacing: 11.3,
      stringDiameter: 0.43,
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: false,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 50,
        effectiveLength: 60,
        airGap: 0,
      },
      winding: {
        primaryTurns: 200,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 38 },
        secondaryTurns: 2000,
        secondaryAwg: 42,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: false,
      },
    },
    load: {
      volumePot: 500000,          // P-90 uses 500k
      volumePosition: 1,
      tonePot: 500000,
      toneCapacitor: 22e-9,
      tonePosition: 0,
      cableCapacitancePerMeter: 100e-12,
      cableLength: 5,
      ampInputImpedance: 1e6,
    },
  },

  // ============================================================================
  // HUMBUCKERS
  // ============================================================================

  // 5. PAF (single coil) - Warm, smooth, vintage
  {
    id: 'builtin_paf_coil',
    name: 'PAF Coil',
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'rectangular',
        innerRadius: 4,
        outerRadius: 8,       // 4mm winding width
        height: 13,           // PAF height
        length: 34,           // Single coil width
      },
      wire: {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,
        insulation: 'plain_enamel',
        insulationClass: 'A',
        turns: 4800,                  // Classic PAF per coil
        windingStyle: 'scatter',
        packingFactor: 0.65,
        temperature: 20,
      },
      couplingFactor: 0.65,
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'alnico2',        // PAF used A2 for warmth
      geometry: 'bar',
      width: 14,
      magnetLength: 68,
      magnetHeight: 2.5,
      magnetization: 0.85,
      polePieces: true,
      polePieceMaterial: 'steel',
      coverType: 'nickel_silver',
    },
    positioning: {
      stringToPoleDistance: 2.0,
      coilToStringDistance: 2.5,
      poleSpacing: 10.0,
      stringDiameter: 0.43,
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: false,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 50,
        effectiveLength: 60,
        airGap: 0,
      },
      winding: {
        primaryTurns: 200,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 38 },
        secondaryTurns: 2000,
        secondaryAwg: 42,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: false,
      },
    },
    load: {
      volumePot: 500000,
      volumePosition: 1,
      tonePot: 500000,
      toneCapacitor: 22e-9,
      tonePosition: 0,
      cableCapacitancePerMeter: 120e-12,
      cableLength: 6,             // Gibson usually longer cables
      ampInputImpedance: 1e6,
    },
  },

  // 6. Hot Humbucker Coil - Modern, aggressive
  {
    id: 'builtin_hot_hb',
    name: 'Hot HB Coil',
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'rectangular',
        innerRadius: 4,
        outerRadius: 9,       // Slightly wider
        height: 14,           // Taller
        length: 35,
      },
      wire: {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0559,         // AWG 43 for more turns
        insulation: 'poly',
        insulationClass: 'B',
        turns: 6200,                  // Hot wound
        windingStyle: 'layered',      // Machine wound
        packingFactor: 0.75,
        temperature: 20,
      },
      couplingFactor: 0.68,
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'alnico5',        // A5 for punch
      geometry: 'bar',
      width: 14,
      magnetLength: 68,
      magnetHeight: 3,
      magnetization: 1.0,
      polePieces: true,
      polePieceMaterial: 'steel',
      coverType: 'none',          // Open for brightness
    },
    positioning: {
      stringToPoleDistance: 1.8,  // Very close
      coilToStringDistance: 2.2,
      poleSpacing: 10.0,
      stringDiameter: 0.43,
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: false,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 50,
        effectiveLength: 60,
        airGap: 0,
      },
      winding: {
        primaryTurns: 200,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 38 },
        secondaryTurns: 2000,
        secondaryAwg: 42,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: false,
      },
    },
    load: {
      volumePot: 500000,
      volumePosition: 1,
      tonePot: 500000,
      toneCapacitor: 15e-9,       // 15nF - less treble cut
      tonePosition: 0,
      cableCapacitancePerMeter: 80e-12,   // Low cap cable
      cableLength: 4,
      ampInputImpedance: 1e6,
    },
  },

  // ============================================================================
  // MODERN / EXPERIMENTAL
  // ============================================================================

  // 7. Jazzmaster - Bright, chimey, wide
  {
    id: 'builtin_jazzmaster',
    name: 'Jazzmaster',
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'flatwork',
        innerRadius: 5,
        outerRadius: 19,      // Very wide JM bobbin
        height: 6,            // Taller for capacity
        length: 90,           // Long JM bobbin
      },
      wire: {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,
        insulation: 'heavy_formvar',
        insulationClass: 'A',
        turns: 8200,
        windingStyle: 'scatter',
        packingFactor: 0.58,
        temperature: 20,
      },
      couplingFactor: 0.50,       // Better coupling for output
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'alnico5',
      geometry: 'rod',
      diameter: 4.76,
      magnetLength: 17,
      magnetization: 0.95,        // Strong for output
      polePieces: false,
      polePieceMaterial: 'alnico',
      coverType: 'none',
    },
    positioning: {
      stringToPoleDistance: 2.5,  // Closer for output
      coilToStringDistance: 2.8,
      poleSpacing: 11.5,          // Wider JM spacing
      stringDiameter: 0.43,
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: false,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 50,
        effectiveLength: 60,
        airGap: 0,
      },
      winding: {
        primaryTurns: 200,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 38 },
        secondaryTurns: 2000,
        secondaryAwg: 42,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: false,
      },
    },
    load: {
      volumePot: 1000000,         // 1M pots on JM!
      volumePosition: 1,
      tonePot: 1000000,
      toneCapacitor: 33e-9,
      tonePosition: 0,
      cableCapacitancePerMeter: 80e-12,   // Lower cap cable
      cableLength: 4,                      // Shorter cable for brightness
      ampInputImpedance: 1e6,
    },
  },

  // 8. Low-Z + Transformer - Hi-Fi, modern
  {
    id: 'builtin_low_z_tx',
    name: 'Low-Z + TX',
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'cylindrical',
        innerRadius: 4,
        outerRadius: 8,
        height: 10,
      },
      wire: {
        material: 'copper',
        copperGrade: 'ofc',
        strandType: 'solid',
        wireDiameter: 0.127,          // AWG 36 - thick wire
        insulation: 'poly',
        insulationClass: 'B',
        turns: 250,                   // Very few turns
        windingStyle: 'layered',
        packingFactor: 0.82,
        temperature: 20,
      },
      couplingFactor: 0.50,
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'neodymium',      // Strong magnets for low-turn coil
      geometry: 'bar',
      width: 10,
      magnetLength: 50,
      magnetHeight: 3,
      magnetization: 0.75,    // Demagnetized to reduce string pull
      polePieces: true,
      polePieceMaterial: 'steel',
      coverType: 'none',
    },
    positioning: {
      stringToPoleDistance: 4.0,  // Far to avoid string pull
      coilToStringDistance: 4.5,
      poleSpacing: 10.5,
      stringDiameter: 0.43,
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: true,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 40,
        effectiveLength: 50,
        airGap: 0.1,
      },
      winding: {
        primaryTurns: 50,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 32 },
        secondaryTurns: 1500,         // 1:30 ratio
        secondaryAwg: 40,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: true,
      },
    },
    load: {
      volumePot: 500000,
      volumePosition: 1,
      tonePot: 500000,
      toneCapacitor: 10e-9,       // 10nF - subtle tone control
      tonePosition: 0,
      cableCapacitancePerMeter: 50e-12,   // Low cap cable matters less
      cableLength: 3,
      ampInputImpedance: 1e6,
    },
  },

  // ============================================================================
  // BASS GUITAR PICKUPS
  // ============================================================================

  // 9. Precision Bass (single coil half) - Deep, punchy, fundamental
  {
    id: 'builtin_p_bass',
    name: 'Precision Bass',
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'rectangular',
        innerRadius: 5,
        outerRadius: 15,      // Wide bass coil
        height: 16,           // P-Bass coil height
        length: 44,           // Half of split coil
      },
      wire: {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,         // AWG 42
        insulation: 'heavy_formvar',
        insulationClass: 'A',
        turns: 5200,                  // Per half (~10k total for both halves)
        windingStyle: 'scatter',
        packingFactor: 0.62,
        temperature: 20,
      },
      couplingFactor: 0.60,           // Good coupling for bass
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'alnico5',
      geometry: 'rod',
      diameter: 4.76,
      magnetLength: 19,
      magnetization: 0.95,            // Strong
      polePieces: false,
      polePieceMaterial: 'alnico',
      coverType: 'none',
    },
    positioning: {
      stringToPoleDistance: 3.0,      // Closer for better output
      coilToStringDistance: 3.5,
      poleSpacing: 19.0,              // Bass string spacing
      stringDiameter: 1.07,           // .042" bass G string
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: false,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 50,
        effectiveLength: 60,
        airGap: 0,
      },
      winding: {
        primaryTurns: 200,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 38 },
        secondaryTurns: 2000,
        secondaryAwg: 42,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: false,
      },
    },
    load: {
      volumePot: 250000,              // Bass uses 250k
      volumePosition: 1,
      tonePot: 250000,
      toneCapacitor: 47e-9,           // 47nF - roll off highs
      tonePosition: 0,
      cableCapacitancePerMeter: 100e-12,
      cableLength: 5,
      ampInputImpedance: 1e6,
    },
  },

  // 10. Jazz Bass Bridge - Bright, growly, articulate
  {
    id: 'builtin_j_bass',
    name: 'Jazz Bass Bridge',
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'flatwork',
        innerRadius: 4,
        outerRadius: 14,              // Wider winding area
        height: 10,                   // Taller for more capacity
        length: 92,                   // Long narrow J pickup
      },
      wire: {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,
        insulation: 'plain_enamel',
        insulationClass: 'A',
        turns: 7600,                  // Typical J-Bass bridge
        windingStyle: 'scatter',
        packingFactor: 0.60,
        temperature: 20,
      },
      couplingFactor: 0.45,           // Better coupling
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'alnico5',
      geometry: 'rod',
      diameter: 4.76,
      magnetLength: 18,               // Longer magnets
      magnetization: 0.95,            // Stronger
      polePieces: false,
      polePieceMaterial: 'alnico',
      coverType: 'none',
    },
    positioning: {
      stringToPoleDistance: 2.8,      // Closer for more output
      coilToStringDistance: 3.2,
      poleSpacing: 19.0,
      stringDiameter: 1.07,
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: false,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 50,
        effectiveLength: 60,
        airGap: 0,
      },
      winding: {
        primaryTurns: 200,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 38 },
        secondaryTurns: 2000,
        secondaryAwg: 42,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: false,
      },
    },
    load: {
      volumePot: 250000,
      volumePosition: 1,
      tonePot: 250000,
      toneCapacitor: 33e-9,           // Smaller cap = brighter
      tonePosition: 0,
      cableCapacitancePerMeter: 80e-12,
      cableLength: 4,
      ampInputImpedance: 1e6,
    },
  },

  // ============================================================================
  // TREBLE-FOCUSED
  // ============================================================================

  // 11. Bright Tele Neck - Clear, chimey, articulate
  {
    id: 'builtin_bright_tele',
    name: 'Bright Tele Neck',
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'flatwork',
        innerRadius: 4.76,
        outerRadius: 12,
        height: 4,                    // Short neck pickup
        length: 62,                   // Narrower Tele neck
      },
      wire: {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.071,          // AWG 41 - thicker = less inductance
        insulation: 'plain_enamel',
        insulationClass: 'A',
        turns: 5500,                  // Underwound for brightness
        windingStyle: 'scatter',
        packingFactor: 0.60,
        temperature: 20,
      },
      couplingFactor: 0.30,
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'alnico5',
      geometry: 'rod',
      diameter: 4.76,
      magnetLength: 14,
      magnetization: 0.95,            // Strong for brightness
      polePieces: false,
      polePieceMaterial: 'alnico',
      coverType: 'none',
    },
    positioning: {
      stringToPoleDistance: 3.8,
      coilToStringDistance: 4.0,
      poleSpacing: 10.6,
      stringDiameter: 0.43,
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: false,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 50,
        effectiveLength: 60,
        airGap: 0,
      },
      winding: {
        primaryTurns: 200,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 38 },
        secondaryTurns: 2000,
        secondaryAwg: 42,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: false,
      },
    },
    load: {
      volumePot: 1000000,             // 1M pot for max brightness
      volumePosition: 1,
      tonePot: 1000000,
      toneCapacitor: 10e-9,           // 10nF - minimal treble cut
      tonePosition: 0,
      cableCapacitancePerMeter: 50e-12,   // Low cap cable
      cableLength: 3,                     // Short cable
      ampInputImpedance: 1e6,
    },
  },

  // 12. Rickenbacker Style - Extremely bright, jangly
  {
    id: 'builtin_ric_bright',
    name: 'Ric Hi-Gain',
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'rectangular',
        innerRadius: 4,
        outerRadius: 7,               // Narrow coil
        height: 7,
        length: 38,
      },
      wire: {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,
        insulation: 'plain_enamel',
        insulationClass: 'A',
        turns: 6800,                  // Moderate turns
        windingStyle: 'layered',      // Tight machine wind
        packingFactor: 0.75,
        temperature: 20,
      },
      couplingFactor: 0.55,
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'alnico5',
      geometry: 'bar',
      width: 8,
      magnetLength: 35,
      magnetHeight: 3,
      magnetization: 1.0,             // Full strength
      polePieces: true,
      polePieceMaterial: 'steel',
      coverType: 'chrome',            // Chrome cover adds character
    },
    positioning: {
      stringToPoleDistance: 2.2,
      coilToStringDistance: 2.5,
      poleSpacing: 10.2,
      stringDiameter: 0.43,
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: false,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 50,
        effectiveLength: 60,
        airGap: 0,
      },
      winding: {
        primaryTurns: 200,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 38 },
        secondaryTurns: 2000,
        secondaryAwg: 42,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: false,
      },
    },
    load: {
      volumePot: 500000,
      volumePosition: 1,
      tonePot: 500000,
      toneCapacitor: 15e-9,
      tonePosition: 0,
      cableCapacitancePerMeter: 70e-12,
      cableLength: 4,
      ampInputImpedance: 1e6,
    },
  },

  // ============================================================================
  // BASS-FOCUSED (WARM/DARK)
  // ============================================================================

  // 13. Jazz Neck HB - Warm, smooth, no bite
  {
    id: 'builtin_jazz_neck',
    name: 'Jazz Neck HB',
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'rectangular',
        innerRadius: 4,
        outerRadius: 9,
        height: 14,                   // Tall coil
        length: 36,
      },
      wire: {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0635,
        insulation: 'plain_enamel',
        insulationClass: 'A',
        turns: 5200,                  // Moderate - not too hot
        windingStyle: 'scatter',
        packingFactor: 0.62,
        temperature: 20,
      },
      couplingFactor: 0.68,
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'alnico2',                // A2 for smooth, less attack
      geometry: 'bar',
      width: 14,
      magnetLength: 68,
      magnetHeight: 2.5,
      magnetization: 0.78,            // Weakened for warmth
      polePieces: true,
      polePieceMaterial: 'steel',
      coverType: 'nickel_silver',     // Cover adds warmth
    },
    positioning: {
      stringToPoleDistance: 2.5,
      coilToStringDistance: 3.0,
      poleSpacing: 10.0,
      stringDiameter: 0.43,
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: false,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 50,
        effectiveLength: 60,
        airGap: 0,
      },
      winding: {
        primaryTurns: 200,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 38 },
        secondaryTurns: 2000,
        secondaryAwg: 42,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: false,
      },
    },
    load: {
      volumePot: 300000,              // 300k for extra warmth
      volumePosition: 1,
      tonePot: 250000,                // Low tone pot
      toneCapacitor: 47e-9,           // Big cap = more bass focus
      tonePosition: 0.2,              // Slight treble roll-off
      cableCapacitancePerMeter: 150e-12,  // High cap cable
      cableLength: 8,                     // Long cable = darker
      ampInputImpedance: 1e6,
    },
  },

  // 14. Dark P-90 - Thick, woolly, vintage
  {
    id: 'builtin_dark_p90',
    name: 'Dark P-90',
    modelVersion: MODEL_VERSION,
    timestamp: 0,
    coil: {
      geometry: {
        form: 'rectangular',
        innerRadius: 6,
        outerRadius: 17,              // Extra wide
        height: 12,
        length: 84,
      },
      wire: {
        material: 'copper',
        copperGrade: 'standard',
        strandType: 'solid',
        wireDiameter: 0.0559,         // AWG 43 for more turns
        insulation: 'heavy_formvar',  // Thicker insulation
        insulationClass: 'A',
        turns: 10200,                 // Hot wound
        windingStyle: 'scatter',
        packingFactor: 0.58,
        temperature: 20,
      },
      couplingFactor: 0.52,
      wiringConfig: 'single',
      phaseConfig: 'in_phase',
    },
    magnet: {
      type: 'alnico3',                // A3 - between A2 and A5, balanced warm
      geometry: 'bar',
      width: 12,
      magnetLength: 76,
      magnetHeight: 6,
      magnetization: 0.80,
      polePieces: true,
      polePieceMaterial: 'steel',
      coverType: 'none',
    },
    positioning: {
      stringToPoleDistance: 3.5,
      coilToStringDistance: 4.0,
      poleSpacing: 11.3,
      stringDiameter: 0.43,
      stringMaterial: 'nickel',
    },
    transformer: {
      enabled: false,
      core: {
        shape: 'toroid_round',
        material: { base: 'nanocrystalline', variant: 'nc_iron' },
        effectiveArea: 50,
        effectiveLength: 60,
        airGap: 0,
      },
      winding: {
        primaryTurns: 200,
        primaryConductor: { type: 'wire', material: 'copper', wireAwg: 38 },
        secondaryTurns: 2000,
        secondaryAwg: 42,
        secondaryMaterial: 'copper',
        windingStyle: 'interleaved',
        shielding: false,
      },
    },
    load: {
      volumePot: 250000,              // 250k for warmth
      volumePosition: 1,
      tonePot: 250000,
      toneCapacitor: 100e-9,          // 100nF - very dark tone control
      tonePosition: 0,
      cableCapacitancePerMeter: 120e-12,
      cableLength: 7,
      ampInputImpedance: 1e6,
    },
  },
]

/**
 * Comparison chart colors for overlay mode
 */
export const COMPARISON_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]
