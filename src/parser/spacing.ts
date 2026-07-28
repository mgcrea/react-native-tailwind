/**
 * Spacing utilities (margin, padding, gap)
 */

import type { StyleObject } from "../types";

// Tailwind spacing scale (in pixels, converted to React Native units)
export const SPACING_SCALE: Record<string, number> = {
  px: 1,
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
};

/**
 * Parse arbitrary spacing value: [16px], [20], [4.5px], [16.75]
 * Returns number for px values (including decimals), null for unsupported formats
 */
function parseArbitrarySpacing(value: string): number | null {
  // Match: [16px], [16], [4.5px], [4.5] (pixels, including decimals)
  const pxMatch = value.match(/^\[(-?\d+(?:\.\d+)?)(?:px)?\]$/);
  if (pxMatch) {
    return parseFloat(pxMatch[1]);
  }

  // Warn about unsupported formats
  if (value.startsWith("[") && value.endsWith("]")) {
    /* v8 ignore next 5 */
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Unsupported arbitrary spacing value: ${value}. Only px values are supported (e.g., [16px], [16], [4.5px], [4.5]).`,
      );
    }
    return null;
  }

  return null;
}

/**
 * Parse spacing classes (margin, padding, gap)
 * Examples: m-4, mx-2, mt-8, p-4, px-2, pt-8, gap-4, gap-x-2, gap-y-1.5, m-[16px], pl-[4.5px], -m-4, -mt-[10px], ms-4, pe-2, mx-auto
 * @param cls - The class name to parse
 * @param customSpacing - Optional custom spacing values from tailwind.config
 */
export function parseSpacing(cls: string, customSpacing?: Record<string, number>): StyleObject | null {
  // Merge custom spacing with defaults (custom takes precedence)
  const spacingMap = customSpacing ? { ...SPACING_SCALE, ...customSpacing } : SPACING_SCALE;

  // Auto margins: m-auto, mx-auto, my-auto, mt-auto, mr-auto, mb-auto, ml-auto, ms-auto, me-auto
  // Note: Only margins support auto values (not padding or gap)
  const autoMarginMatch = cls.match(/^m([xytrblse]?)-auto$/);
  if (autoMarginMatch) {
    const dir = autoMarginMatch[1];
    return getMarginStyle(dir, "auto");
  }

  // Margin: m-4, mx-2, mt-8, ms-4, me-2, m-[16px], -m-4, -mt-2, etc.
  // Supports negative values for margins (but not padding or gap)
  // s = start (RTL-aware), e = end (RTL-aware)
  const marginMatch = cls.match(/^(-?)m([xytrblse]?)-(.+)$/);
  if (marginMatch) {
    const [, negativePrefix, dir, valueStr] = marginMatch;
    const isNegative = negativePrefix === "-";

    // Try arbitrary value first (highest priority)
    const arbitraryValue = parseArbitrarySpacing(valueStr);
    if (arbitraryValue !== null) {
      const finalValue = isNegative ? -arbitraryValue : arbitraryValue;
      return getMarginStyle(dir, finalValue);
    }

    // Try spacing scale (includes custom spacing)
    const scaleValue = spacingMap[valueStr];
    if (scaleValue !== undefined) {
      const finalValue = isNegative ? -scaleValue : scaleValue;
      return getMarginStyle(dir, finalValue);
    }
  }

  // Padding: p-4, px-2, pt-8, ps-4, pe-2, p-[16px], etc.
  // s = start (RTL-aware), e = end (RTL-aware)
  const paddingMatch = cls.match(/^p([xytrblse]?)-(.+)$/);
  if (paddingMatch) {
    const [, dir, valueStr] = paddingMatch;

    // Try arbitrary value first (highest priority)
    const arbitraryValue = parseArbitrarySpacing(valueStr);
    if (arbitraryValue !== null) {
      return getPaddingStyle(dir, arbitraryValue);
    }

    // Try spacing scale (includes custom spacing)
    const scaleValue = spacingMap[valueStr];
    if (scaleValue !== undefined) {
      return getPaddingStyle(dir, scaleValue);
    }
  }

  // Gap: gap-4, gap-x-2, gap-y-1.5, gap-[16px]
  const gapMatch = cls.match(/^gap(?:-([xy]))?-(.+)$/);
  if (gapMatch) {
    const [, direction = "", valueStr] = gapMatch;

    // Try arbitrary value first (highest priority)
    const arbitraryValue = parseArbitrarySpacing(valueStr);
    if (arbitraryValue !== null) {
      return getGapStyle(direction, arbitraryValue);
    }

    // Try spacing scale (includes custom spacing)
    const scaleValue = spacingMap[valueStr];
    if (scaleValue !== undefined) {
      return getGapStyle(direction, scaleValue);
    }
  }

  return null;
}

/**
 * Get gap style object based on Tailwind's gap direction.
 * gap-x controls spacing between columns; gap-y controls spacing between rows.
 */
function getGapStyle(direction: string, value: number): StyleObject {
  if (direction === "x") return { columnGap: value };
  if (direction === "y") return { rowGap: value };
  return { gap: value };
}

/**
 * Get margin style object based on direction
 */
function getMarginStyle(dir: string, value: number | "auto"): StyleObject {
  switch (dir) {
    case "":
      return { margin: value };
    case "x":
      return { marginHorizontal: value };
    case "y":
      return { marginVertical: value };
    case "t":
      return { marginTop: value };
    case "r":
      return { marginRight: value };
    case "b":
      return { marginBottom: value };
    case "l":
      return { marginLeft: value };
    case "s":
      return { marginStart: value };
    case "e":
      return { marginEnd: value };
    default:
      return {};
  }
}

/**
 * Get padding style object based on direction
 */
function getPaddingStyle(dir: string, value: number): StyleObject {
  switch (dir) {
    case "":
      return { padding: value };
    case "x":
      return { paddingHorizontal: value };
    case "y":
      return { paddingVertical: value };
    case "t":
      return { paddingTop: value };
    case "r":
      return { paddingRight: value };
    case "b":
      return { paddingBottom: value };
    case "l":
      return { paddingLeft: value };
    case "s":
      return { paddingStart: value };
    case "e":
      return { paddingEnd: value };
    default:
      return {};
  }
}
