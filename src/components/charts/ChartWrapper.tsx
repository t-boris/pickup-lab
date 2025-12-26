/**
 * Chart Wrapper Component
 *
 * Wraps Plotly charts with zoom/pan controls and explanations.
 */

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ChartWrapperProps {
  children: React.ReactNode
  onReset: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  explanation?: React.ReactNode
}

// Icons
const ZoomInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="11" y1="8" x2="11" y2="14"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
)

const ZoomOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>
)

const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
)

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
)

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  children,
  onReset,
  onZoomIn,
  onZoomOut,
  explanation,
}) => {
  return (
    <div className="relative flex flex-col h-full">
      {/* Controls overlay */}
      <div className="absolute top-1 right-1 z-10 flex gap-1">
        <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={onZoomIn}
            >
              <ZoomInIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Zoom In</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={onZoomOut}
            >
              <ZoomOutIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Zoom Out</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={onReset}
            >
              <ResetIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Reset View</TooltipContent>
        </Tooltip>

        {explanation && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <InfoIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              {explanation}
            </TooltipContent>
          </Tooltip>
        )}
        </TooltipProvider>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  )
}

/**
 * Chart explanations for each chart type
 */
export const CHART_EXPLANATIONS = {
  frequencyResponse: (
    <div className="space-y-3 text-sm max-w-sm">
      <p className="font-medium text-base">Frequency Response (Bode Plot)</p>
      <p>Shows how loud each frequency is relative to 1 kHz (0 dB reference). This is the "EQ curve" of your pickup.</p>

      <div className="space-y-1">
        <p className="font-medium text-primary">Top Peak (Resonance ~3-8 kHz):</p>
        <p>This is where L and C resonate together, creating maximum output. This peak gives the pickup its "voice":</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Higher frequency peak</strong> = brighter, more "presence" and cut</li>
          <li><strong>Lower frequency peak</strong> = warmer, darker, more "vintage"</li>
          <li><strong>Taller/sharper peak</strong> = more "quacky", honky, vocal quality</li>
          <li><strong>Shorter/wider peak</strong> = more neutral, hi-fi, transparent</li>
        </ul>
      </div>

      <div className="space-y-1">
        <p className="font-medium text-primary">Bottom Dip (Roll-off after resonance):</p>
        <p>Frequencies above resonance drop sharply - this is the natural low-pass filter behavior. The steep dip means:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>High harmonics (brightness, "air") are attenuated</li>
          <li>Steeper dip = more "vintage" dark character</li>
          <li>Higher cable capacitance makes this dip more severe</li>
        </ul>
      </div>

      <div className="space-y-1">
        <p className="font-medium text-primary">How This Affects Sound:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Peak position sets the "character frequency" - where the pickup speaks loudest</li>
          <li>Everything above the peak gets progressively quieter (filtered out)</li>
          <li>The pickup acts as a band-pass filter centered around resonance</li>
        </ul>
      </div>
    </div>
  ),
  impedance: (
    <div className="space-y-3 text-sm max-w-sm">
      <p className="font-medium text-base">Impedance vs Frequency</p>
      <p>Shows how much the pickup "resists" current flow at each frequency. This determines how the pickup interacts with cables and amps.</p>

      <div className="space-y-1">
        <p className="font-medium text-primary">Why Such a Sharp, High Peak?</p>
        <p>At resonance, something special happens - the inductance (L) and capacitance (C) are perfectly balanced:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>L wants to block high frequencies (inductive reactance rises with frequency)</li>
          <li>C wants to pass high frequencies (capacitive reactance falls with frequency)</li>
          <li>At exactly f = 1/(2π√LC), they cancel each other's reactive effects</li>
          <li>Only DCR remains... but the energy bounces between L and C, creating huge voltage!</li>
        </ul>
      </div>

      <div className="space-y-1">
        <p className="font-medium text-primary">What Happens at This Frequency:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>High impedance</strong> = very little current flows to the amp</li>
          <li><strong>But voltage is maximum</strong> = this creates the resonant peak in the sound</li>
          <li>The pickup "rings" at this frequency like a bell</li>
          <li>Q factor (peak sharpness) determines how long it rings</li>
        </ul>
      </div>

      <div className="space-y-1">
        <p className="font-medium text-primary">Regions of the Curve:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Low frequencies (flat)</strong>: Pure DCR dominates - just resistance</li>
          <li><strong>Rising slope</strong>: Inductance kicks in (Z = 2πfL)</li>
          <li><strong>Peak</strong>: LC resonance - maximum impedance</li>
          <li><strong>After peak</strong>: Capacitance takes over, impedance drops</li>
        </ul>
      </div>
    </div>
  ),
  phase: (
    <div className="space-y-3 text-sm max-w-sm">
      <p className="font-medium text-base">Phase Response</p>
      <p>Shows the time delay (as angle) between input and output at each frequency. This profoundly affects how the pickup "feels" to play.</p>

      <div className="space-y-1">
        <p className="font-medium text-primary">Why Such a Huge Drop (-90° to -180°)?</p>
        <p>At resonance, the pickup's behavior flips from inductive to capacitive:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Below resonance</strong>: Inductance dominates, current lags voltage (positive phase)</li>
          <li><strong>At resonance</strong>: Phase crosses through zero rapidly</li>
          <li><strong>Above resonance</strong>: Capacitance dominates, current leads voltage (negative phase)</li>
          <li>The steeper the transition, the higher the Q factor</li>
        </ul>
      </div>

      <div className="space-y-1">
        <p className="font-medium text-primary">What Phase Shift Means for Sound:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>-90°</strong> = signal delayed by 1/4 wavelength at that frequency</li>
          <li><strong>-180°</strong> = signal completely inverted (half wavelength delay)</li>
          <li>Different frequencies arrive at different times = affects transient attack</li>
          <li>Sharp phase transition = more "punchy" attack but less natural decay</li>
        </ul>
      </div>

      <div className="space-y-1">
        <p className="font-medium text-primary">Playing Feel:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Steep phase curve</strong>: More "compressed", controlled feel</li>
          <li><strong>Gentle phase curve</strong>: More "open", dynamic, responsive</li>
          <li>High-Q pickups have abrupt phase shifts - "snappy" attack</li>
          <li>Low-Q pickups have gradual phase shifts - more "organic" response</li>
        </ul>
      </div>
    </div>
  ),
  bField: (
    <div className="space-y-3 text-sm max-w-sm">
      <p className="font-medium text-base">Magnetic Field vs Distance</p>
      <p>Shows how magnetic field strength decreases as you move away from the pole piece.</p>

      <div className="space-y-1">
        <p className="font-medium text-primary">Key Points:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Close to pole</strong>: Strong field, more string pull, risk of "wolf tones" and intonation issues</li>
          <li><strong>Red marker</strong>: Current string-to-pole distance setting</li>
          <li><strong>Curve steepness</strong>: Steeper = more sensitive to string vibration = louder</li>
          <li><strong>Decay rate</strong>: Roughly 1/r³ for magnetic dipoles</li>
        </ul>
      </div>

      <div className="space-y-1">
        <p className="font-medium text-primary">Practical Implications:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Stronger magnets need greater string distance</li>
          <li>Weaker magnets can be set closer for more output</li>
          <li>The "sweet spot" balances output vs. string pull</li>
        </ul>
      </div>
    </div>
  ),
  output: (
    <div className="space-y-3 text-sm max-w-sm">
      <p className="font-medium text-base">Relative Output vs Distance</p>
      <p>Shows how pickup output changes with string height, accounting for both field strength and flux change rate.</p>

      <div className="space-y-1">
        <p className="font-medium text-primary">Key Points:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Peak</strong>: Optimal string height for maximum output</li>
          <li><strong>Too close</strong>: String pull issues, magnetic damping, possible clipping</li>
          <li><strong>Too far</strong>: Weak signal, noise becomes problematic</li>
          <li><strong>Red marker</strong>: Current string position - aim for 70-90% of peak</li>
        </ul>
      </div>

      <div className="space-y-1">
        <p className="font-medium text-primary">Setting String Height:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Higher output isn't always better - consider dynamics and clarity</li>
          <li>Bass strings often set higher than treble (more excursion)</li>
          <li>Adjust for playing style: hard attack needs more clearance</li>
        </ul>
      </div>
    </div>
  ),
  impulseResponse: (
    <div className="space-y-3 text-sm max-w-sm">
      <p className="font-medium text-base">Impulse Response (Transient)</p>
      <p>Shows how the pickup "rings" after a sudden string pluck. This is the time-domain view of the frequency response.</p>

      <div className="space-y-1">
        <p className="font-medium text-primary">What You're Seeing:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Damped oscillation</strong>: The pickup rings at its resonant frequency</li>
          <li><strong>Decay envelope</strong> (dotted): Shows how quickly the ringing dies out</li>
          <li><strong>τ (tau)</strong>: Time constant - how long it takes to decay to 37% of initial</li>
          <li><strong>Ring cycles</strong>: Number of oscillations before signal fades</li>
        </ul>
      </div>

      <div className="space-y-1">
        <p className="font-medium text-primary">How Q Affects Transients:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>High Q (tall peak)</strong>: Long decay, many ring cycles, "vocal/quacky" sustain</li>
          <li><strong>Low Q (wide peak)</strong>: Quick decay, few cycles, "tight/punchy" attack</li>
          <li>The pickup acts like a tuned bell at its resonance frequency</li>
        </ul>
      </div>

      <div className="space-y-1">
        <p className="font-medium text-primary">Attack Speed Categories:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Snappy</strong> (&lt;0.5ms): Very fast attack, tight feel</li>
          <li><strong>Quick</strong> (0.5-1ms): Responsive, good articulation</li>
          <li><strong>Moderate</strong> (1-2ms): Balanced attack and sustain</li>
          <li><strong>Smooth</strong> (&gt;2ms): Gradual attack, long ring</li>
        </ul>
      </div>
    </div>
  ),
}
