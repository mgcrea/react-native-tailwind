/**
 * Color utilities (background, text, border colors)
 */

import type { StyleObject } from "../types";
import { COLORS, applyOpacity, parseArbitraryColor, parseColorOpacityModifier } from "../utils/colorUtils";

// Re-export COLORS for backward compatibility and tests
export { COLORS };

/**
 * Parse color classes (background, text, border)
 * Supports opacity modifier: bg-blue-500/50, text-black/80, border-red-500/30
 */
export function parseColor(cls: string, customColors?: Record<string, string>): StyleObject | null {
  // Helper to get color with custom override (custom colors take precedence)
  const getColor = (key: string): string | undefined => {
    return customColors?.[key] ?? COLORS[key];
  };

  // Helper to parse color with optional opacity modifier
  // Uses internal implementation to preserve warnings for invalid arbitrary colors
  const parseColorWithOpacity = (colorKey: string): string | null => {
    // Check for opacity modifier: blue-500/50, blue-500/[.5], blue-500/[50%]
    const opacityModifier = parseColorOpacityModifier(colorKey);
    if (opacityModifier) {
      const { baseColorKey, opacity } = opacityModifier;
      if (opacity === null) {
        /* v8 ignore next 5 */
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[react-native-tailwind] Invalid opacity modifier: ${opacityModifier.suffix}. ` +
              "Use an integer percentage from 0 to 100, a raw arbitrary alpha from 0 to 1, or an arbitrary percentage.",
          );
        }
        return null;
      }

      // Try arbitrary color first: bg-[#ff0000]/50
      const arbitraryColor = parseArbitraryColor(baseColorKey);
      if (arbitraryColor !== null) {
        return applyOpacity(arbitraryColor, opacity);
      }

      // Try preset/custom colors: bg-blue-500/50
      const color = getColor(baseColorKey);
      if (color) {
        return applyOpacity(color, opacity);
      }

      return null;
    }

    // No opacity modifier - try normal color parsing
    // Try arbitrary value first
    const arbitraryColor = parseArbitraryColor(colorKey);
    if (arbitraryColor !== null) {
      return arbitraryColor;
    }

    // Check for unsupported arbitrary format and warn
    if (colorKey.startsWith("[") && colorKey.endsWith("]")) {
      /* v8 ignore next 5 */
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[react-native-tailwind] Unsupported arbitrary color value: ${colorKey}. Only hex colors are supported (e.g., [#ff0000], [#f00], or [#ff0000aa]).`,
        );
      }
      return null;
    }

    // Try preset/custom colors
    return getColor(colorKey) ?? null;
  };

  // Background color: bg-blue-500, bg-blue-500/50, bg-[#ff0000]/80
  // Only parse arbitrary values that look like colors (start with #)
  if (cls.startsWith("bg-")) {
    const colorKey = cls.substring(3);
    // Skip arbitrary values that don't look like colors (e.g., bg-[100%] is sizing)
    if (colorKey.startsWith("[") && !colorKey.startsWith("[#")) {
      return null;
    }
    const color = parseColorWithOpacity(colorKey);
    if (color) {
      return { backgroundColor: color };
    }
  }

  // Text color: text-blue-500, text-blue-500/50, text-[#ff0000]/80
  // Only parse arbitrary values that look like colors (start with #)
  if (cls.startsWith("text-")) {
    const colorKey = cls.substring(5);
    // Skip arbitrary values that don't look like colors (e.g., text-[13px] is font size)
    if (colorKey.startsWith("[") && !colorKey.startsWith("[#")) {
      return null;
    }
    const color = parseColorWithOpacity(colorKey);
    if (color) {
      return { color: color };
    }
  }

  // Border color: border-blue-500, border-blue-500/50, border-[#ff0000]/80
  if (cls.startsWith("border-") && !cls.match(/^border-[0-9]/)) {
    const colorKey = cls.substring(7);
    // Skip arbitrary values that don't look like colors (e.g., border-[3px] is width)
    if (colorKey.startsWith("[") && !colorKey.startsWith("[#")) {
      return null;
    }
    const color = parseColorWithOpacity(colorKey);
    if (color) {
      return { borderColor: color };
    }
  }

  // Outline color: outline-blue-500, outline-blue-500/50, outline-[#ff0000]/80
  if (cls.startsWith("outline-") && !cls.match(/^outline-[0-9]/) && !cls.startsWith("outline-offset-")) {
    const colorKey = cls.substring(8); // "outline-".length = 8

    // Skip outline-style values
    if (["solid", "dashed", "dotted", "none"].includes(colorKey)) {
      return null;
    }

    // Skip arbitrary values that don't look like colors (e.g., outline-[3px] is width)
    if (colorKey.startsWith("[") && !colorKey.startsWith("[#")) {
      return null;
    }
    const color = parseColorWithOpacity(colorKey);
    if (color) {
      return { outlineColor: color };
    }
  }

  // Directional border colors: border-t-red-500, border-l-blue-500/50, border-r-[#ff0000]
  const dirBorderMatch = cls.match(/^border-([trblxy])-(.+)$/);
  if (dirBorderMatch) {
    const dir = dirBorderMatch[1];
    const colorKey = dirBorderMatch[2];

    // Skip arbitrary values that don't look like colors (e.g., border-t-[3px] is width)
    if (colorKey.startsWith("[") && !colorKey.startsWith("[#")) {
      return null;
    }

    const color = parseColorWithOpacity(colorKey);
    if (color) {
      // Map direction to React Native property/properties
      // x and y apply to multiple sides (RN doesn't have borderHorizontalColor/borderVerticalColor)
      if (dir === "x") {
        return {
          borderLeftColor: color,
          borderRightColor: color,
        };
      }
      if (dir === "y") {
        return {
          borderTopColor: color,
          borderBottomColor: color,
        };
      }

      const propMap: Record<string, string> = {
        t: "borderTopColor",
        r: "borderRightColor",
        b: "borderBottomColor",
        l: "borderLeftColor",
      };
      return { [propMap[dir]]: color };
    }
  }

  return null;
}
