/**
 * Ring utilities implemented with React Native outline styles.
 */

import type { StyleObject } from "../types";
import { COLORS, applyOpacity, parseColorValue } from "../utils/colorUtils";

export const DEFAULT_RING_WIDTH = 3;
export const DEFAULT_RING_COLOR = applyOpacity(COLORS["blue-500"], 50);

const NUMBER_PATTERN = String.raw`(?:\d+(?:\.\d*)?|\.\d+)`;

function parseRingWidth(value: string): number | null {
  const arbitraryMatch = value.match(new RegExp(`^\\[(${NUMBER_PATTERN})(?:px)?\\]$`));
  if (arbitraryMatch) {
    return Number.parseFloat(arbitraryMatch[1]);
  }

  if (new RegExp(`^${NUMBER_PATTERN}$`).test(value)) {
    return Number.parseFloat(value);
  }

  return null;
}

function defaultRingStyle(): StyleObject {
  return {
    outlineWidth: DEFAULT_RING_WIDTH,
    outlineStyle: "solid",
    outlineColor: DEFAULT_RING_COLOR,
  };
}

function ringWidthStyle(outlineWidth: number): StyleObject {
  return { outlineWidth, outlineStyle: "solid" };
}

/**
 * Parse ring width, color, and offset classes.
 * @param cls - The class name to parse
 * @param customColors - Optional custom colors from tailwind.config
 */
export function parseRing(cls: string, customColors?: Record<string, string>): StyleObject | null {
  if (cls === "ring") {
    return defaultRingStyle();
  }

  if (cls.startsWith("ring-offset-")) {
    const offset = parseRingWidth(cls.substring(12));
    return offset === null ? null : { outlineOffset: offset };
  }

  if (!cls.startsWith("ring-")) {
    return null;
  }

  const value = cls.substring(5);
  const width = parseRingWidth(value);
  if (width !== null) {
    return ringWidthStyle(width);
  }

  const color = parseColorValue(value, customColors);
  return color === null ? null : { outlineColor: color };
}
