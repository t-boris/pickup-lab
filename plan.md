# Pickup Physics Lab — Implementation Plan

**Progress: 97%** (68/70 tasks)

---

## Phase 1: Project Foundation

- [x] **1.1 Project Setup**
  - [x] Init Vite + React + TypeScript
  - [x] Configure Tailwind CSS
  - [x] Install shadcn/ui + configure components
  - [x] Install dependencies (zustand, react-hook-form, zod, react-plotly.js, plotly.js)
  - [x] Configure Vitest
  - [x] Setup folder structure (`components/`, `domain/`, `engine/`, `store/`, `charts/`, `lib/`)

- [x] **1.2 Domain Layer**
  - [x] Define TypeScript interfaces (CoilParams, MagnetParams, TransformerParams, LoadParams, ComputedResults)
  - [x] Create unit conversion utilities (mm↔m, pF↔F, Hz↔kHz)
  - [x] Create AWG table (38-46, bare diameter + insulation thickness per type)
  - [x] Create transformer cores database (nanocrystalline, ferrite, amorphous)
  - [x] Define calibration coefficients defaults (k_wind, k_pack, k_ins, k_coupling, k_mutual)

---

## Phase 2: Physics Engine

- [x] **2.1 Coil Calculations**
  - [x] `computeWireLength()` — mean turn length × N (cylindrical, rectangular, flatwork)
  - [x] `computeRdc()` — ρ(T) × L_wire / A_wire with temperature correction
  - [x] `computeInductance()` — Wheeler formula (+ equivalent radius for non-circular)
  - [x] `computeCapacitance()` — C_turn × N × k_wind × k_pack × k_ins
  - [x] `computeResonance()` — f₀ = 1/(2π√LC)
  - [x] `computeQ()` — ω₀L / R

- [x] **2.2 Impedance & Frequency Response**
  - [x] `computeCoilImpedance(f)` — RLC parallel-series model
  - [x] `computeLoadImpedance(f)` — R_load ∥ C_cable
  - [x] `computeSystemResponse(freqs[])` — magnitude + phase arrays

- [x] **2.3 Magnetic Field**
  - [x] `computeBField(z)` — axial field approximation (cylinder/bar)
  - [x] `computeFieldGradient(z)` — numerical dB/dz
  - [x] `computeOutputIndex()` — E_peak formula

- [x] **2.4 Transformer**
  - [x] `computeReflectedLoad()` — (Np/Ns)² × Z_load
  - [x] `computePrimaryInductance()` — μ₀μ_eff × Np² × Ae / le
  - [x] `computeSaturationMargin()` — B_peak vs B_sat
  - [x] `computeTransformerResponse()` — with leakage L and interwinding C

- [x] **2.5 Series/Parallel Wiring**
  - [x] `computeSeriesCoils()` — L₁ + L₂ + 2M, R₁ + R₂
  - [x] `computeParallelCoils()` — parallel formulas
  - [x] Phase option (in-phase / out-of-phase)

- [x] **2.6 String Pull Index**
  - [x] `computeStringPull()` — qualitative B²/distance^n heuristic

- [x] **2.7 Unit Tests**
  - [x] Tests for coil calculations (Rdc, L, Cp, f₀)
  - [x] Tests for impedance calculations
  - [x] Tests for magnetic field
  - [x] Tests for transformer calculations

---

## Phase 3: State Management

- [x] **3.1 Zustand Stores**
  - [x] `useCoilStore` — coil parameters + computed results
  - [x] `useMagnetStore` — magnet parameters
  - [x] `useTransformerStore` — transformer parameters + enabled toggle
  - [x] `useLoadStore` — load/wiring parameters
  - [x] `usePresetsStore` — save/load/compare presets
  - [x] `useUIStore` — theme, units (mm/inch), active charts

---

## Phase 4: UI Components

- [x] **4.1 Layout**
  - [x] `<AppShell />` — header, sidebar, main area, footer
  - [x] Responsive layout (mobile-friendly)
  - [x] Dark/Light theme toggle (default dark)

- [x] **4.2 Parameter Panels**
  - [x] `<CoilSection />` — geometry + wire + winding + model knobs
  - [x] `<MagnetSection />` — magnet type, geometry, positioning
  - [x] `<TransformerSection />` — enable toggle, core, windings, parasitics
  - [x] `<LoadSection />` — pots, tone cap, cable, amp input

- [x] **4.3 Dashboard**
  - [x] `<KpiCards />` — L, Rdc, Cp, f₀, Q, B@string, Output index
  - [x] `<ChartGrid />` — selectable charts layout

- [x] **4.4 Charts (Plotly)**
  - [x] `<FrequencyResponseChart />` — Bode magnitude (log-log)
  - [x] `<ImpedanceChart />` — |Z| vs f
  - [x] `<PhaseChart />` — phase vs f
  - [x] `<BFieldChart />` — B vs distance
  - [x] `<OutputChart />` — output vs distance
  - [x] Comparison overlay mode (multiple presets)

- [x] **4.5 Presets & Export**
  - [x] `<PresetManager />` — save/load/delete/compare
  - [x] 5 built-in presets (Vintage SC, Hot SC, P90-ish, Low-turn+transformer, HB half)
  - [x] Export JSON (config + outputs, optional graph data)
  - [x] Export PNG (charts) — hover camera icon on each chart

- [x] **4.6 Validation & Warnings**
  - [x] Inline validation (zod schemas)
  - [x] Unsafe value warnings (e.g., rout < rin, packing > 0.95)
  - [x] String pull warning zones (green/yellow/red)
  - [x] `<AssumptionsDrawer />` — model limitations disclosure

---

## Phase 5: Polish & Deploy

- [x] **5.1 Final Integration**
  - [x] Wire all components together
  - [x] Performance optimization (useMemo in charts, efficient state updates)
  - [ ] Unit toggle (mm/inch) — deferred to v2

- [ ] **5.2 Firebase Deploy** (optional, user-configured)
  - [ ] Configure Firebase Hosting
  - [ ] Build & deploy

---

## Notes

- **v2 (deferred):** Calibration mode (measured values → auto-fit coefficients)
- **Model version:** All exports include `modelVersion: "v1.0"`
