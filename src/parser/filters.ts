/**
 * Filter utilities supported by React Native's filter style property.
 */

import type { StyleObject } from "../types";

const NUMBER_PATTERN = String.raw`(?:\d+(?:\.\d*)?|\.\d+)`;

/**
 * Parse a Tailwind brightness amount.
 * Named numeric utilities are percentages (brightness-101 -> 1.01), while
 * bracketed numbers are raw React Native amounts (brightness-[1.01] -> 1.01).
 */
function parseBrightnessAmount(value: string): number | null {
  const arbitraryMatch = value.match(new RegExp(`^\\[(${NUMBER_PATTERN})(%)?\\]$`));
  if (arbitraryMatch) {
    const amount = Number.parseFloat(arbitraryMatch[1]);
    return arbitraryMatch[2] === "%" ? amount / 100 : amount;
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    /* v8 ignore next 5 */
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Invalid arbitrary brightness value: ${value}. Only non-negative numbers and percentages are supported (e.g., [1.01], [80%]).`,
      );
    }
    return null;
  }

  if (new RegExp(`^${NUMBER_PATTERN}$`).test(value)) {
    return Number.parseFloat(value) / 100;
  }

  return null;
}

/**
 * Parse filter classes.
 * @param cls - The class name to parse
 */
export function parseFilter(cls: string): StyleObject | null {
  if (cls.startsWith("brightness-")) {
    const amount = parseBrightnessAmount(cls.substring(11));
    if (amount !== null) {
      return { filter: [{ brightness: amount }] };
    }
  }

  return null;
}
