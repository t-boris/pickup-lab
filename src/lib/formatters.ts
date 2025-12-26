/**
 * Formatting Utilities
 *
 * Helper functions for displaying values with appropriate SI prefixes.
 */

/**
 * Format value with SI prefix (auto-scales to appropriate range)
 * @param value The numeric value to format
 * @param unit The base unit (e.g., 'H', 'Ω', 'F', 'Hz')
 * @param decimals Number of decimal places (default 2)
 * @returns Formatted string with appropriate SI prefix
 */
export const formatSI = (value: number, unit: string, decimals = 2): string => {
  if (value === 0 || !isFinite(value)) return `0 ${unit}`

  const prefixes = [
    { threshold: 1e12, prefix: 'T', divisor: 1e12 },
    { threshold: 1e9, prefix: 'G', divisor: 1e9 },
    { threshold: 1e6, prefix: 'M', divisor: 1e6 },
    { threshold: 1e3, prefix: 'k', divisor: 1e3 },
    { threshold: 1, prefix: '', divisor: 1 },
    { threshold: 1e-3, prefix: 'm', divisor: 1e-3 },
    { threshold: 1e-6, prefix: 'µ', divisor: 1e-6 },
    { threshold: 1e-9, prefix: 'n', divisor: 1e-9 },
    { threshold: 1e-12, prefix: 'p', divisor: 1e-12 },
    { threshold: 1e-15, prefix: 'f', divisor: 1e-15 },
  ]

  const absValue = Math.abs(value)
  for (const { threshold, prefix, divisor } of prefixes) {
    if (absValue >= threshold) {
      return `${(value / divisor).toFixed(decimals)} ${prefix}${unit}`
    }
  }
  return `${value.toExponential(decimals)} ${unit}`
}

/**
 * Format value with SI prefix, returning value and unit separately
 * Useful for KPI cards where value and unit are displayed separately
 */
export const formatSISplit = (
  value: number,
  unit: string,
  decimals = 2
): { value: string; unit: string } => {
  if (value === 0 || !isFinite(value)) return { value: '0', unit }

  const prefixes = [
    { threshold: 1e12, prefix: 'T', divisor: 1e12 },
    { threshold: 1e9, prefix: 'G', divisor: 1e9 },
    { threshold: 1e6, prefix: 'M', divisor: 1e6 },
    { threshold: 1e3, prefix: 'k', divisor: 1e3 },
    { threshold: 1, prefix: '', divisor: 1 },
    { threshold: 1e-3, prefix: 'm', divisor: 1e-3 },
    { threshold: 1e-6, prefix: 'µ', divisor: 1e-6 },
    { threshold: 1e-9, prefix: 'n', divisor: 1e-9 },
    { threshold: 1e-12, prefix: 'p', divisor: 1e-12 },
    { threshold: 1e-15, prefix: 'f', divisor: 1e-15 },
  ]

  const absValue = Math.abs(value)
  for (const { threshold, prefix, divisor } of prefixes) {
    if (absValue >= threshold) {
      return {
        value: (value / divisor).toFixed(decimals),
        unit: `${prefix}${unit}`,
      }
    }
  }
  return { value: value.toExponential(decimals), unit }
}
