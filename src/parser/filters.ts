/**
 * Filter utilities supported by React Native's filter style property.
 */

import type { StyleObject } from "../types";
import type { DropShadowStyle, FilterStyle } from "../types/core";
import { COLORS, applyOpacity, parseColorValue } from "../utils/colorUtils";

const NUMBER_PATTERN = String.raw`(?:\d+(?:\.\d*)?|\.\d+)`;

export const BLUR_SCALE: Record<string, number> = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 40,
  "3xl": 64,
};

export const DROP_SHADOW_SCALE: Record<string, DropShadowStyle> = {
  xs: { offsetX: 0, offsetY: 1, standardDeviation: 1, color: applyOpacity(COLORS.black, 5) },
  sm: { offsetX: 0, offsetY: 1, standardDeviation: 2, color: applyOpacity(COLORS.black, 15) },
  md: { offsetX: 0, offsetY: 3, standardDeviation: 3, color: applyOpacity(COLORS.black, 12) },
  lg: { offsetX: 0, offsetY: 4, standardDeviation: 4, color: applyOpacity(COLORS.black, 15) },
  xl: { offsetX: 0, offsetY: 9, standardDeviation: 7, color: applyOpacity(COLORS.black, 10) },
  "2xl": { offsetX: 0, offsetY: 25, standardDeviation: 25, color: applyOpacity(COLORS.black, 15) },
  none: { offsetX: 0, offsetY: 0, standardDeviation: 0, color: "transparent" },
};

type PercentageFilterName = "brightness" | "contrast" | "grayscale" | "invert" | "saturate" | "sepia";

/**
 * Parse a Tailwind percentage-based filter amount.
 * Named numeric utilities are percentages (contrast-125 -> 1.25), while
 * bracketed numbers are raw React Native amounts (contrast-[1.25] -> 1.25).
 */
function parsePercentageAmount(value: string, filterName: PercentageFilterName): number | null {
  const arbitraryMatch = value.match(new RegExp(`^\\[(${NUMBER_PATTERN})(%)?\\]$`));
  if (arbitraryMatch) {
    const amount = Number.parseFloat(arbitraryMatch[1]);
    return arbitraryMatch[2] === "%" ? amount / 100 : amount;
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    /* v8 ignore next 5 */
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Invalid arbitrary ${filterName} value: ${value}. Only non-negative numbers and percentages are supported (e.g., [1.01], [80%]).`,
      );
    }
    return null;
  }

  if (new RegExp(`^${NUMBER_PATTERN}$`).test(value)) {
    return Number.parseFloat(value) / 100;
  }

  return null;
}

function parseBlurAmount(value: string): number | null {
  const scaleValue = BLUR_SCALE[value];
  if (scaleValue !== undefined) {
    return scaleValue;
  }

  const arbitraryMatch = value.match(new RegExp(`^\\[(${NUMBER_PATTERN})(?:px)?\\]$`));
  if (arbitraryMatch) {
    return Number.parseFloat(arbitraryMatch[1]);
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    /* v8 ignore next 5 */
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Invalid arbitrary blur value: ${value}. Only non-negative pixel values are supported (e.g., [2px], [2.5]).`,
      );
    }
  }

  return null;
}

function parseHueRotateAmount(value: string, isNegative: boolean): string | null {
  const arbitraryMatch = value.match(new RegExp(`^\\[(-?${NUMBER_PATTERN})(deg|rad)\\]$`));
  if (arbitraryMatch) {
    const amount = Number.parseFloat(arbitraryMatch[1]);
    return `${isNegative ? -amount : amount}${arbitraryMatch[2]}`;
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    /* v8 ignore next 5 */
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Invalid arbitrary hue-rotate value: ${value}. Only deg and rad angles are supported (e.g., [45deg], [0.5rad]).`,
      );
    }
    return null;
  }

  if (new RegExp(`^${NUMBER_PATTERN}$`).test(value)) {
    const amount = Number.parseFloat(value);
    return `${isNegative ? -amount : amount}deg`;
  }

  return null;
}

function parseDropShadowLength(value: string, allowNegative: boolean): number | null {
  const match = value.match(new RegExp(`^(${allowNegative ? "-?" : ""}${NUMBER_PATTERN})(?:px)?$`));
  return match ? Number.parseFloat(match[1]) : null;
}

function parseDropShadowAmount(value: string, customColors?: Record<string, string>): DropShadowStyle | null {
  const opacityMatch = value.match(/^(.+)\/(\d+)$/);
  if (opacityMatch) {
    const preset = DROP_SHADOW_SCALE[opacityMatch[1]];
    const opacity = Number.parseInt(opacityMatch[2], 10);
    if (preset && opacity >= 0 && opacity <= 100) {
      return { ...preset, color: applyOpacity(COLORS.black, opacity) };
    }
    return null;
  }

  const preset = DROP_SHADOW_SCALE[value];
  if (preset) {
    return preset;
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    const parts = value.slice(1, -1).split("_");
    if (parts.length === 3 || parts.length === 4) {
      const offsetX = parseDropShadowLength(parts[0], true);
      const offsetY = parseDropShadowLength(parts[1], true);
      const hasDeviation = parts.length === 4;
      const standardDeviation = hasDeviation ? parseDropShadowLength(parts[2], false) : undefined;
      const colorToken = parts[parts.length - 1];
      const colorKey = colorToken.startsWith("#") ? `[${colorToken}]` : colorToken;
      const color = parseColorValue(colorKey, customColors);

      if (
        offsetX !== null &&
        offsetY !== null &&
        (!hasDeviation || standardDeviation !== null) &&
        color !== null
      ) {
        return { offsetX, offsetY, standardDeviation: standardDeviation ?? undefined, color };
      }
    }

    /* v8 ignore next 5 */
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Invalid arbitrary drop-shadow value: ${value}. Use [offsetX_offsetY_blur_color] with pixel lengths and a supported color (e.g., [0_4px_4px_#00000080]).`,
      );
    }
  }

  return null;
}

function percentageFilterStyle(filterName: PercentageFilterName, amount: number): StyleObject {
  return { filter: [{ [filterName]: amount } as FilterStyle] };
}

/**
 * Parse filter classes.
 * @param cls - The class name to parse
 */
export function parseFilter(cls: string, customColors?: Record<string, string>): StyleObject | null {
  if (cls === "filter-none") {
    return { filter: [] };
  }

  if (cls.startsWith("blur-")) {
    const amount = parseBlurAmount(cls.substring(5));
    if (amount !== null) {
      return { filter: [{ blur: amount }] };
    }
  }

  if (cls.startsWith("drop-shadow-")) {
    const dropShadow = parseDropShadowAmount(cls.substring(12), customColors);
    if (dropShadow !== null) {
      return { filter: [{ dropShadow }] };
    }
  }

  const hueRotateMatch = cls.match(/^(-?)hue-rotate-(.+)$/);
  if (hueRotateMatch) {
    const amount = parseHueRotateAmount(hueRotateMatch[2], hueRotateMatch[1] === "-");
    if (amount !== null) {
      return { filter: [{ hueRotate: amount }] };
    }
  }

  if (cls === "grayscale" || cls === "invert" || cls === "sepia") {
    return percentageFilterStyle(cls, 1);
  }

  const percentageFilterMatch = cls.match(/^(brightness|contrast|grayscale|invert|saturate|sepia)-(.+)$/);
  if (percentageFilterMatch) {
    const filterName = percentageFilterMatch[1] as PercentageFilterName;
    const amount = parsePercentageAmount(percentageFilterMatch[2], filterName);
    if (amount !== null) {
      return percentageFilterStyle(filterName, amount);
    }
  }

  return null;
}
