Ниже — подробное ТЗ (техническое задание) для Single Page Application (SPA) на React, которая интерактивно моделирует катушку звукоснимателя + магнитную систему + (опционально) трансформатор, считает ключевые электрические/магнитные параметры и рисует современные графики.

⸻

Техническое задание: Pickup Physics Lab (React SPA)

1) Цель и назначение

Сделать веб-приложение, в котором пользователь (разработчик звукоснимателей) задаёт геометрию и материалы катушки, магнитов, и трансформатора, а приложение в реальном времени:
	1.	рассчитывает электрическую эквивалентную модель (R, L, C, Q, резонанс),
	2.	оценивает связь с магнитной системой (B в зоне струны/катушки, градиент, чувствительность),
	3.	строит графики: импеданс/фаза, АЧХ/ФЧХ, резонанс, зависимости (L vs N, R vs AWG, B vs distance, output vs distance),
	4.	позволяет сохранять/сравнивать пресеты и экспортировать результаты.

Важно: это инженерный калькулятор с явно заданными допущениями (не FEM-симулятор). Точность улучшается по мере добавления моделей.

⸻

2) Область моделирования и допущения (v1)

v1 (MVP) модели
	•	Катушка: Rdc по длине провода + L по приближённой геометрической формуле/аппроксимации + Cp по упрощённой модели (зависит от типа намотки/изоляции/packing).
	•	Магниты: приближённая модель поля B vs distance и простая оценка коэффициента “как хорошо поле прошивает катушку” (coupling factor 0..1).
	•	Трансформатор: идеальный коэффициент трансформации + добавочные паразитики (leakage L, interwinding C) как параметры/оценка.
	•	Нагрузка: потенциометры/кабели/вход усилителя как типовые пресеты (R_load, C_cable).

Требование к UI

В интерфейсе везде показывать:
	•	единицы измерения
	•	диапазоны ползунков
	•	подсказки по смыслу параметров
	•	предупреждения, если пользователь выходит за разумные физические пределы.

⸻

3) Пользовательские сценарии
	1.	Пользователь выбирает тип звукоснимателя (single coil / humbucker-half / stacked) → получает стартовый пресет.
	2.	Крутит ползунки (N, AWG, размеры bobbin, расстояния до струны, тип магнита) → графики обновляются без лагов.
	3.	Включает трансформатор → меняет Np/Ns, сердечник, паразитики → видит отражённую нагрузку на катушку и изменение АЧХ.
	4.	Сохраняет конфигурацию как “Preset”, сравнивает 2–4 пресета на одном графике.
	5.	Экспортирует результат в JSON + PNG/SVG графиков + короткий отчёт (таблица параметров).

⸻

4) Структура приложения и экраны

Layout (SPA)
	•	Верхняя панель: название проекта, переключатель “v1/v2 (будущее)”, экспорт, пресеты.
	•	Левая колонка: панель параметров (аккордеоны/вкладки).
	•	Правая часть: дашборд результатов (карточки + графики).
	•	Нижняя панель (опционально): “Assumptions / Notes / Warnings”.

Основные вкладки/секции параметров
	1.	Pickup Coil
	2.	Magnets & Geometry
	3.	Transformer (optional)
	4.	Load & Wiring
	5.	Advanced / Model knobs (коэффициенты аппроксимаций, если включено)

⸻

5) Детализация: Inputs / Outputs / Графики по секциям

5.1 Pickup Coil — Геометрия катушки

Inputs
	•	Coil form: cylindrical | rectangular | flatwork
	•	rin (мм), rout (мм) или width/length для rectangular
	•	height (мм)
	•	bobbin wall thickness (мм) (опционально)
	•	winding window (авто/ручной режим)

Outputs
	•	Mean turn length (мм)
	•	Coil volume (мм³)
	•	Estimated max turns at chosen wire+packing

Графики
	•	2D schematic cross-section (не FEM, просто SVG/Canvas)
	•	L vs dimensions (мини-график зависимости при фиксированных N/AWG)

⸻

5.2 Pickup Coil — Провод и намотка

Inputs
	•	Wire material: Copper | Silver (v1 можно только Cu, но UI готов)
	•	Gauge: AWG selector + отображение диаметра (мм)
	•	Insulation type: Plain enamel | Heavy Formvar | Poly
	•	Turns N
	•	Winding style: scatter | layered | random
	•	Packing factor (0.5–0.9)
	•	Temperature (°C) (влияет на Rdc)

Outputs
	•	Total wire length (м)
	•	Rdc (Ом)
	•	Estimated Cp (пФ)
	•	Estimated self-resonant f0 (Гц)
	•	Q at reference freq (например 1 кГц / 5 кГц)

Графики
	•	Rdc vs N
	•	L vs N
	•	Cp vs packing
	•	f0 vs N (очень наглядно для “почему звук темнеет”)

⸻

5.3 Pickup Coil — Эквивалентная модель

Inputs
	•	Loss model toggles: copper only / copper+dielectric
	•	Coupling factor with field (0..1) — “как хорошо поле прошивает катушку”
	•	Optional series/parallel wiring (для humbucker/stack)

Outputs
	•	RLC parameters: R, L, C
	•	Impedance magnitude at 100 Hz / 1 kHz / 5 kHz
	•	Resonant peak gain estimate (условный)

Графики
	•	|Z| vs f (20 Hz–50 kHz)
	•	phase(Z) vs f
	•	“Resonance view” (zoom around f0)

⸻

5.4 Magnets & Geometry — Магниты

Inputs
	•	Magnet type: AlNiCo2/3/5/8 | Ferrite | NdFeB
	•	Magnet geometry:
	•	bar: length/width/height (мм)
	•	rod: diameter/length (мм)
	•	Magnetization level (нормированный 0..1) или Br (если режим “expert”)
	•	Pole pieces present? (on/off, материал: steel/none)

Outputs
	•	B-field at string point (мТл) — для заданного расстояния
	•	B-field at coil region (мТл)
	•	Field gradient estimate (мТл/мм)

Графики
	•	B vs distance (0–20 мм)
	•	(опционально) 2D heatmap approximation (если сделаете быстрый рендер)

⸻

5.5 Magnets & Geometry — Расположение “струна–магнит–катушка”

Inputs
	•	String-to-pole distance (мм)
	•	Coil-to-string distance (мм)
	•	Pole spacing (мм)
	•	String diameter (мм) + material preset (nickel/steel)

Outputs
	•	Sensitivity index (условн. мВ/мм при заданном “strum amplitude”)
	•	String pull index (предупреждение при слишком сильном поле/слишком близко)

Графики
	•	Output vs distance
	•	String pull vs distance (с красной зоной риска)

⸻

5.6 Transformer — Сердечник (опционально)

Inputs
	•	Enable transformer (toggle)
	•	Core type: toroid | C-core | EI
	•	Core material: nanocrystalline | amorphous | ferrite | steel
	•	Ae, le (мм², мм) или выбор стандартного сердечника из базы
	•	Air gap (мм)
	•	Bsat (Т) (expert)

Outputs
	•	μ_eff (оценка)
	•	Saturation margin (relative)
	•	Core loss estimate (qualitative: low/med/high в v1)

Графики
	•	Saturation margin vs output level
	•	Loss vs frequency (если есть простая модель/таблица)

⸻

5.7 Transformer — Обмотки и паразитики

Inputs
	•	Np, Ns
	•	Wire gauge primary/secondary
	•	Winding style: interleaved | non-interleaved
	•	Leakage inductance (ввод вручную или “estimate”)
	•	Interwinding capacitance (пФ)
	•	Shielding (on/off)

Outputs
	•	Turns ratio, voltage ratio
	•	Reflected load to pickup
	•	Estimated bandwidth (-3 dB)

Графики
	•	Bode magnitude (system response) с/без трансформатора
	•	Phase response

⸻

5.8 Load & Wiring — Нагрузка и кабель

Inputs
	•	Pot values: 250k/500k/1M (или manual)
	•	Tone cap (нФ)
	•	Cable capacitance (пФ/м) и длина (м)
	•	Input impedance of preamp/amp (МОм)

Outputs
	•	Loaded resonance frequency and Q
	•	Output at 1 kHz (условный)
	•	“Brightness index” (простая метрика: energy above 3 kHz)

Графики
	•	Frequency response with load
	•	Compare: different pot/cable presets overlay

⸻

6) “Главная панель результатов” (Dashboard)

Сверху — KPI карточки (как приборная панель):
	•	L (H), Rdc (Ω), Cp (pF), f0 (Hz), Q, B@string (mT), Output index (mV RMS условно)

Ниже — 3–5 основных графиков (выбор пользователем):
	1.	System Frequency Response (главный)
	2.	Impedance Magnitude
	3.	Phase
	4.	B vs distance
	5.	Output vs distance

⸻

7) UI/UX требования (modern, clean)
	•	Стиль: минимализм, “lab instrument”.
	•	Компоненты:
	•	sliders с числовым input рядом
	•	dropdowns с пресетами
	•	toggles, segmented controls
	•	tooltips (пояснить физический смысл)
	•	Валидация:
	•	мгновенная (inline)
	•	“unsafe” значения подсвечиваются (например, rout < rin, packing > 0.95, слишком близко к струне)
	•	Единицы:
	•	пользователь может выбрать mm/inch (пересчёт)
	•	частота: Hz/kHz авто-форматирование

Рекомендуемые библиотеки:
	•	UI: MUI / Chakra / shadcn (если хотите Tailwind)
	•	Charts: Recharts / ECharts / Plotly (Plotly шикарен для Bode/zoom)
	•	State: Zustand или Redux Toolkit (Zustand часто проще)
	•	Forms/validation: react-hook-form + zod

⸻

8) Архитектура React (компоненты и слои)

Слои
	1.	UI Components (чистые, без логики физики)
	2.	Domain Model (типы данных, единицы, нормализация)
	3.	Physics Engine (чистые функции расчёта)
	4.	State Store (текущее состояние, пресеты, история)
	5.	Chart Adapters (готовят массивы точек для графиков)

Компоненты (пример)
	•	<AppShell />
	•	<ParameterPanel />
	•	<CoilSection />
	•	<MagnetSection />
	•	<TransformerSection />
	•	<LoadSection />
	•	<ResultsDashboard />
	•	<KpiCards />
	•	<ChartGrid />
	•	<BodeChart />
	•	<ImpedanceChart />
	•	<FieldChart />
	•	<PresetManager /> (save/load/compare)
	•	<AssumptionsDrawer /> (модели и допущения)

⸻

9) Модуль расчётов (Physics Engine)

Требования:
	•	Все расчёты — детерминированные чистые функции.
	•	Единицы — строго в SI внутри ядра (mm → m, pF → F).
	•	На выходе — объект ComputedResults + массивы точек для графиков.

API (пример)
	•	computeCoil(params): { L, Rdc, Cp, f0, Q, ... }
	•	computeMagnetField(params, distances[]): { B_at_points[], gradient[] }
	•	computeTransformer(params, sourceImpedance, load): { reflectedLoad, response[] }
	•	computeSystemResponse(coil, transformer?, load): { bode[], impedance[], phase[] }

⸻

10) Пресеты и экспорт

Presets
	•	Встроенные пресеты: “Vintage SC”, “Hot SC”, “P90-ish”, “Low-turn + transformer”, “Humbucker half”.
	•	Пользовательские пресеты сохраняются в localStorage (v1) + экспорт JSON.

Export
	•	Export config JSON
	•	Export charts PNG/SVG
	•	Export report (Markdown/PDF в v2; в v1 хотя бы Markdown)

⸻

11) Нефункциональные требования
	•	Производительность: обновление графиков ≤ 50–80 мс при изменении ползунка (debounce для тяжёлых графиков).
	•	Offline: работает локально без сервера.
	•	Тесты:
	•	unit tests для расчётов (Vitest/Jest)
	•	snapshot tests для графиков (опционально)
	•	Версионирование модели: modelVersion: "v1.0" в экспортируемых данных.

⸻

12) Definition of Done (готово, когда…)
	•	Пользователь может задать все параметры из 4 секций (coil/magnets/transformer/load).
	•	KPI и 4 ключевых графика обновляются корректно.
	•	Есть 5+ пресетов, сравнение минимум 2 конфигураций на одном графике.
	•	Экспорт JSON и PNG графиков работает.
	•	Есть страница/панель “Assumptions” с перечислением допущений и ограничений модели.

⸻

Если тебе подходит, следующий рациональный шаг — я сразу выдам:
	1.	структуру типов данных (TypeScript interfaces) для всех inputs/outputs,
	2.	первую версию формул/моделей v1, которые реально можно закодить без FEM,
	3.	и скелет React-проекта (папки, компоненты, стор, роутинг без роутов, чарты).
