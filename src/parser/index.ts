/**
 * Tailwind class parser for React Native
 * Converts Tailwind-like class names to React Native style objects
 */

import type { StyleObject } from "../types";
import { mergeStyles } from "../utils/mergeStyles";
import { parseAspectRatio } from "./aspectRatio";
import { parseBorder } from "./borders";
import { parseColor } from "./colors";
import { parseFilter } from "./filters";
import { parseLayout } from "./layout";
import { parseOutline } from "./outline";
import { parseShadow } from "./shadows";
import { parseSizing } from "./sizing";
import { parseSpacing } from "./spacing";
import { parseTransform } from "./transforms";
import { parseTypography } from "./typography";

/**
 * Custom theme configuration (subset of tailwind.config theme extensions)
 */
export type CustomTheme = {
  colors?: Record<string, string>;
  fontFamily?: Record<string, string>;
  fontSize?: Record<string, number>;
  spacing?: Record<string, number>;
};

/**
 * Parse a className string and return a React Native style object
 * @param className - Space-separated class names
 * @param customTheme - Optional custom theme from tailwind.config
 * @returns React Native style object
 */
export function parseClassName(className: string, customTheme?: CustomTheme): StyleObject {
  const classes = className.split(/\s+/).filter(Boolean);
  const style: StyleObject = {};

  for (const cls of classes) {
    const parsedStyle = parseClass(cls, customTheme);
    mergeStyles(style, parsedStyle);
  }

  // Tailwind emits filter-none after composable filter utilities, so it wins
  // regardless of the order of classes in markup.
  if (classes.includes("filter-none")) {
    style.filter = [];
  }

  return style;
}

/**
 * Parse a single class name
 * @param cls - Single class name
 * @param customTheme - Optional custom theme from tailwind.config
 * @returns React Native style object
 */
export function parseClass(cls: string, customTheme?: CustomTheme): StyleObject {
  // Try each parser in order
  // Note: parseBorder must come before parseColor to avoid border-[3px] being parsed as a color
  // Parsers receive relevant custom theme properties
  const parsers: Array<(cls: string) => StyleObject | null> = [
    (cls: string) => parseSpacing(cls, customTheme?.spacing),
    (cls: string) => parseBorder(cls, customTheme?.colors),
    parseOutline,
    (cls: string) => parseColor(cls, customTheme?.colors),
    (cls: string) => parseLayout(cls, customTheme?.spacing),
    (cls: string) => parseTypography(cls, customTheme?.fontFamily, customTheme?.fontSize),
    (cls: string) => parseSizing(cls, customTheme?.spacing),
    (cls: string) => parseShadow(cls, customTheme?.colors),
    (cls: string) => parseFilter(cls, customTheme?.colors),
    parseAspectRatio,
    (cls: string) => parseTransform(cls, customTheme?.spacing),
  ];

  for (const parser of parsers) {
    const result = parser(cls);
    if (result !== null) {
      return result;
    }
  }

  // Warn about unknown class in development
  /* v8 ignore next 3 */
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[react-native-tailwind] Unknown class: "${cls}"`);
  }

  return {};
}

// Re-export parsers for testing/advanced usage
export { parseAspectRatio } from "./aspectRatio";
export { parseBorder } from "./borders";
export { parseColor } from "./colors";
export { parseFilter } from "./filters";
export { parseLayout } from "./layout";
export { parseOutline } from "./outline";
export { parsePlaceholderClass, parsePlaceholderClasses } from "./placeholder";
export { parseShadow } from "./shadows";
export { parseSizing } from "./sizing";
export { parseSpacing } from "./spacing";
export { parseTransform } from "./transforms";
export { parseTypography } from "./typography";

// Re-export modifier utilities
export {
  expandSchemeModifier,
  hasModifier,
  isColorClass,
  isColorSchemeModifier,
  isDirectionalModifier,
  isPlatformModifier,
  isSchemeModifier,
  isStateModifier,
  parseModifier,
  splitModifierClasses,
} from "./modifiers";
export type {
  ColorSchemeModifierType,
  DirectionalModifierType,
  ModifierType,
  ParsedModifier,
  PlatformModifierType,
  SchemeModifierType,
  StateModifierType,
} from "./modifiers";
