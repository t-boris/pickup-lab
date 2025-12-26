# Pickup Lab

Interactive guitar and bass pickup physics simulator. Explore how coil geometry, magnet properties, wire specifications, and load circuits shape your pickup's frequency response, impedance, and transient behavior.

## What Is This?

Pickup Lab is an educational tool for understanding the electrical and magnetic properties of guitar pickups. It models the pickup as an RLC circuit and calculates how different physical parameters affect the sound characteristics.

Whether you're a pickup winder experimenting with designs, a guitarist curious about why your gear sounds the way it does, or an engineer interested in the physics, this simulator provides real-time visualization of pickup behavior.

## Features

### Coil Modeling

Configure the physical coil parameters including bobbin geometry (cylindrical, rectangular, or flatwork), wire gauge from AWG 38 to AWG 46, insulation type (plain enamel, heavy formvar, poly-nylon), number of turns, and winding style. The simulator calculates DC resistance, inductance, and distributed capacitance based on these inputs.

### Magnet Configuration

Set up magnet properties including material (Alnico 2 through 5, Ceramic 8, Neodymium), pole piece dimensions, magnetization strength, and string-to-pole distance. The magnetic field visualization shows how field strength decreases with distance and how this affects string pull and output sensitivity.

### Load Circuit Simulation

Model the complete signal chain from pickup to amplifier. Configure volume and tone potentiometer values, tone capacitor size, cable capacitance and length, and amplifier input impedance. See how each component affects the loaded resonance frequency and Q factor.

### Transformer Section

Optional output transformer modeling for active pickup designs or impedance matching scenarios. Includes core material selection, turns ratio, and frequency response effects.

### Visualization Charts

Six interactive charts provide different perspectives on pickup behavior:

**Frequency Response** shows the pickup's natural EQ curve as a Bode plot. The resonant peak determines the pickup's voice - its position affects brightness while its height and width affect the tonal character from neutral to vocal.

**Impedance** displays how the pickup's electrical resistance varies with frequency. The sharp peak at resonance explains why pickups act as bandpass filters and why cable capacitance matters so much.

**Phase Response** reveals the time delay between input and output at each frequency. This affects the attack character and playing feel - steep phase transitions create snappy response while gradual curves feel more organic.

**Magnetic Field** plots field strength versus distance from the pole piece. This helps understand the relationship between pickup height adjustment, output level, and string pull.

**Output vs Distance** shows the optimal string height for maximum sensitivity while avoiding excessive magnetic interference with string vibration.

**Impulse Response** visualizes the transient behavior - how the pickup rings after a string pluck. High Q pickups ring longer with more cycles while low Q pickups respond quickly and tightly.

### Preset Library

Explore classic pickup designs with the built-in preset library including vintage single coils like 50s and 60s Stratocaster and Telecaster pickups, classic humbuckers like PAF and hot-rodded variants, P-90s, Jazzmaster, Jaguar, and bass pickups like Precision and Jazz Bass.

### Analysis and Recommendations

The analyzer evaluates your pickup design and provides feedback on potential issues like bobbin capacity, sensitivity levels, string pull concerns, and resonance characteristics. Recommendations help guide adjustments for optimal performance.

### Tone Guide

A qualitative assessment translates the numerical results into musical terms, rating bass response, low-mid warmth, midrange presence, upper-mid cut, treble clarity, and overall brightness on intuitive scales.

## The Physics

A guitar pickup is fundamentally an inductor created by winding wire around a magnetic core. When a ferromagnetic string vibrates in the magnetic field, it creates a changing magnetic flux through the coil, inducing a voltage according to Faraday's law.

The coil's inductance combines with its distributed capacitance (from wire-to-wire coupling) and the external load capacitance (cable, tone circuit) to form a resonant RLC circuit. This creates a characteristic frequency response with a peak at the resonance frequency.

The resonance frequency is determined by the formula f = 1 / (2π√LC) where L is the inductance and C is the total capacitance. The Q factor, which determines the peak height and width, depends on the resistance relative to the reactive components.

Higher inductance (more turns, larger core) lowers the resonance for a darker sound. Higher capacitance (longer cables, larger tone caps engaged) also lowers resonance. Lower resistance loads (volume pot turned down, low amplifier input impedance) reduce Q for a flatter, less peaky response.

## Getting Started

Visit the live application or run locally:

1. Clone the repository
2. Install dependencies with npm install
3. Start the development server with npm run dev
4. Open your browser to the local address shown

## Technology

Built with React and TypeScript using Vite for fast development. State management with Zustand, charts with Plotly.js, and UI components from shadcn/ui. All physics calculations run client-side with no backend required.

## License

MIT License - feel free to use, modify, and distribute.

## Contributing

Contributions welcome. Please open an issue to discuss proposed changes before submitting pull requests.
