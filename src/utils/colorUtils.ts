/**
 * Shared color utilities for parsing and manipulating colors
 */

import { TAILWIND_COLORS } from "../config/tailwind";
import { flattenColors } from "./flattenColors";

/**
 * Tailwind color palette (flattened from config) with basic colors
 */
export const COLORS: Record<string, string> = {
  ...flattenColors(TAILWIND_COLORS),
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
};

/**
 * Apply opacity to a hex color. Existing alpha is multiplied, matching
 * Tailwind's color-mix-with-transparent semantics.
 * @param hex - Hex color string (e.g., "#ff0000", "#f00", "#ff000080", or "transparent")
 * @param opacity - Opacity value 0-100 (e.g., 50 for 50%)
 * @returns 8-digit hex with alpha (e.g., "#FF000080") or transparent
 */
export function applyOpacity(hex: string, opacity: number): string {
  if (hex === "transparent") {
    return "transparent";
  }

  const cleanHex = hex.replace(/^#/, "");
  const normalizedHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((char) => char + char)
          .join("")
      : cleanHex;

  const rgbHex = normalizedHex.slice(0, 6);
  const existingAlpha = normalizedHex.length === 8 ? Number.parseInt(normalizedHex.slice(6), 16) : 255;
  const alpha = Math.round((opacity / 100) * existingAlpha);
  const alphaHex = alpha.toString(16).padStart(2, "0").toUpperCase();

  return `#${rgbHex.toUpperCase()}${alphaHex}`;
}

export type ColorOpacityModifier = {
  baseColorKey: string;
  opacity: number | null;
  suffix: string;
};

const COLOR_OPACITY_MODIFIER_PATTERN = /^(.+)\/(\d+|\[((?:\d+(?:\.\d*)?|\.\d+)(?:%)?)\])$/;

/**
 * Split and parse a Tailwind color opacity modifier.
 * Named values are percentages (`/50`), while arbitrary values accept a raw
 * alpha (`/[.5]`) or an explicit percentage (`/[50%]`).
 */
export function parseColorOpacityModifier(colorKey: string): ColorOpacityModifier | null {
  const match = colorKey.match(COLOR_OPACITY_MODIFIER_PATTERN);
  if (!match) {
    return null;
  }

  const [, baseColorKey, modifier, arbitraryValue] = match;
  let opacity: number;

  if (arbitraryValue === undefined) {
    opacity = Number.parseInt(modifier, 10);
  } else if (arbitraryValue.endsWith("%")) {
    opacity = Number.parseFloat(arbitraryValue.slice(0, -1));
  } else {
    opacity = Number.parseFloat(arbitraryValue) * 100;
  }

  return {
    baseColorKey,
    opacity: Number.isFinite(opacity) && opacity >= 0 && opacity <= 100 ? opacity : null,
    suffix: `/${modifier}`,
  };
}

/**
 * Parse arbitrary color value: [#ff0000], [#f00], [#FF0000AA]
 * Supports 3-digit, 6-digit, and 8-digit (with alpha) hex colors
 * @param value - Arbitrary value string like "[#ff0000]"
 * @returns Hex string if valid, null otherwise (preserves input case)
 */
export function parseArbitraryColor(value: string): string | null {
  const hexMatch = value.match(/^\[#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\]$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      // Expand 3-digit hex to 6-digit: #abc -> #aabbcc (preserve case)
      const expanded = hex
        .split("")
        .map((char) => char + char)
        .join("");
      return `#${expanded}`;
    }
    return `#${hex}`;
  }
  return null;
}

/**
 * Parse a color value with optional opacity modifier
 * Handles preset colors, custom colors, arbitrary hex values, and opacity modifiers
 *
 * @param colorKey - Color key like "red-500", "red-500/50", "[#ff0000]", "[#ff0000]/80"
 * @param customColors - Optional custom colors from tailwind.config
 * @returns Hex color string or null if invalid
 */
export function parseColorValue(colorKey: string, customColors?: Record<string, string>): string | null {
  const getColor = (key: string): string | undefined => {
    return customColors?.[key] ?? COLORS[key];
  };

  // Check for opacity modifier: red-500/50, red-500/[.5], [#ff0000]/[50%]
  const opacityModifier = parseColorOpacityModifier(colorKey);
  if (opacityModifier) {
    const { baseColorKey, opacity } = opacityModifier;
    if (opacity === null) {
      return null;
    }

    // Try arbitrary color first: [#ff0000]/50
    const arbitraryColor = parseArbitraryColor(baseColorKey);
    if (arbitraryColor !== null) {
      return applyOpacity(arbitraryColor, opacity);
    }

    // Try preset/custom colors: red-500/50
    const color = getColor(baseColorKey);
    if (color) {
      return applyOpacity(color, opacity);
    }

    return null;
  }

  // No opacity modifier
  // Try arbitrary value first: [#ff0000]
  const arbitraryColor = parseArbitraryColor(colorKey);
  if (arbitraryColor !== null) {
    return arbitraryColor;
  }

  // Try preset/custom colors: red-500
  return getColor(colorKey) ?? null;
}
