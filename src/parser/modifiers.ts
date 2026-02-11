/**
 * Modifier parsing utilities for state-based, platform-specific, color scheme, and directional class names
 * - State modifiers: active:, hover:, focus:, disabled:, placeholder:
 * - Platform modifiers: ios:, android:, web:
 * - Color scheme modifiers: dark:, light:
 * - Directional modifiers: rtl:, ltr: (RTL-aware styling)
 */

import { parseColorOpacityModifier } from "../utils/colorUtils";

export type StateModifierType = "active" | "hover" | "focus" | "disabled" | "placeholder";
export type PlatformModifierType = "ios" | "android" | "web";
export type ColorSchemeModifierType = "dark" | "light";
export type SchemeModifierType = "scheme";
export type DirectionalModifierType = "rtl" | "ltr";
export type ModifierType =
  | StateModifierType
  | PlatformModifierType
  | ColorSchemeModifierType
  | SchemeModifierType
  | DirectionalModifierType;

export type ParsedModifier = {
  modifier: ModifierType;
  baseClass: string;
};

/**
 * Supported state modifiers that map to component states or pseudo-elements
 */
const STATE_MODIFIERS: readonly StateModifierType[] = [
  "active",
  "hover",
  "focus",
  "disabled",
  "placeholder",
] as const;

/**
 * Supported platform modifiers that map to Platform.OS values
 */
const PLATFORM_MODIFIERS: readonly PlatformModifierType[] = ["ios", "android", "web"] as const;

/**
 * Supported color scheme modifiers that map to Appearance.colorScheme values
 */
const COLOR_SCHEME_MODIFIERS: readonly ColorSchemeModifierType[] = ["dark", "light"] as const;

/**
 * Scheme modifier that expands to both dark: and light: modifiers
 */
const SCHEME_MODIFIERS: readonly SchemeModifierType[] = ["scheme"] as const;

/**
 * Supported directional modifiers that map to I18nManager.isRTL values
 */
const DIRECTIONAL_MODIFIERS: readonly DirectionalModifierType[] = ["rtl", "ltr"] as const;

/**
 * All supported modifiers (state + platform + color scheme + scheme + directional)
 */
const SUPPORTED_MODIFIERS: readonly ModifierType[] = [
  ...STATE_MODIFIERS,
  ...PLATFORM_MODIFIERS,
  ...COLOR_SCHEME_MODIFIERS,
  ...SCHEME_MODIFIERS,
  ...DIRECTIONAL_MODIFIERS,
] as const;

/**
 * Parse a class name to detect and extract modifiers
 *
 * @param cls - Class name to parse (e.g., "active:bg-blue-500")
 * @returns ParsedModifier if modifier found, null otherwise
 *
 * @example
 * parseModifier("active:bg-blue-500") // { modifier: "active", baseClass: "bg-blue-500" }
 * parseModifier("bg-blue-500") // null
 * parseModifier("hover:focus:bg-blue-500") // null (nested modifiers not supported)
 */
export function parseModifier(cls: string): ParsedModifier | null {
  const colonIndex = cls.indexOf(":");

  // No colon means no modifier
  if (colonIndex === -1) {
    return null;
  }

  const potentialModifier = cls.slice(0, colonIndex);
  const baseClass = cls.slice(colonIndex + 1);

  // Check if it's a supported modifier
  if (!SUPPORTED_MODIFIERS.includes(potentialModifier as ModifierType)) {
    return null;
  }

  // Check for nested modifiers (not currently supported)
  if (baseClass.includes(":")) {
    return null;
  }

  // Base class must not be empty
  if (!baseClass) {
    return null;
  }

  return {
    modifier: potentialModifier as ModifierType,
    baseClass,
  };
}

/**
 * Check if a class name contains a modifier
 *
 * @param cls - Class name to check
 * @returns true if class has a supported modifier prefix
 */
export function hasModifier(cls: string): boolean {
  return parseModifier(cls) !== null;
}

/**
 * Check if a modifier is a state modifier (active, hover, focus, disabled, placeholder)
 *
 * @param modifier - Modifier type to check
 * @returns true if modifier is a state modifier
 */
export function isStateModifier(modifier: ModifierType): modifier is StateModifierType {
  return STATE_MODIFIERS.includes(modifier as StateModifierType);
}

/**
 * Check if a modifier is a platform modifier (ios, android, web)
 *
 * @param modifier - Modifier type to check
 * @returns true if modifier is a platform modifier
 */
export function isPlatformModifier(modifier: ModifierType): modifier is PlatformModifierType {
  return PLATFORM_MODIFIERS.includes(modifier as PlatformModifierType);
}

/**
 * Check if a modifier is a color scheme modifier (dark, light)
 *
 * @param modifier - Modifier type to check
 * @returns true if modifier is a color scheme modifier
 */
export function isColorSchemeModifier(modifier: ModifierType): modifier is ColorSchemeModifierType {
  return COLOR_SCHEME_MODIFIERS.includes(modifier as ColorSchemeModifierType);
}

/**
 * Check if a modifier is a scheme modifier (scheme)
 *
 * @param modifier - Modifier type to check
 * @returns true if modifier is a scheme modifier
 */
export function isSchemeModifier(modifier: ModifierType): modifier is SchemeModifierType {
  return SCHEME_MODIFIERS.includes(modifier as SchemeModifierType);
}

/**
 * Check if a modifier is a directional modifier (rtl, ltr)
 *
 * @param modifier - Modifier type to check
 * @returns true if modifier is a directional modifier
 */
export function isDirectionalModifier(modifier: ModifierType): modifier is DirectionalModifierType {
  return DIRECTIONAL_MODIFIERS.includes(modifier as DirectionalModifierType);
}

/**
 * Check if a class name is a color-based utility class
 *
 * @param className - Class name to check
 * @returns true if class is color-based (text-*, bg-*, border-*, outline-*)
 */
export function isColorClass(className: string): boolean {
  if (className.startsWith("outline-")) {
    const value = className.substring(8);
    const isStyle = ["solid", "dashed", "dotted", "none", "hidden"].includes(value);
    const isWidthOrOffset = /^\d/.test(value) || value.startsWith("offset-");
    const isNonColorArbitrary = value.startsWith("[") && !value.startsWith("[#");

    return !isStyle && !isWidthOrOffset && !isNonColorArbitrary;
  }

  return className.startsWith("text-") || className.startsWith("bg-") || className.startsWith("border-");
}

/**
 * Expand scheme modifier into dark and light modifiers
 *
 * @param schemeModifier - Parsed scheme modifier
 * @param customColors - Custom colors from config
 * @param darkSuffix - Suffix for dark variant (default: "-dark")
 * @param lightSuffix - Suffix for light variant (default: "-light")
 * @returns Array of expanded modifiers (dark: and light:), or empty array if validation fails
 *
 * @example
 * expandSchemeModifier(
 *   { modifier: "scheme", baseClass: "text-systemGray" },
 *   { "systemGray-dark": "#333", "systemGray-light": "#ccc" },
 *   "-dark",
 *   "-light"
 * )
 * // Returns: [
 * //   { modifier: "dark", baseClass: "text-systemGray-dark" },
 * //   { modifier: "light", baseClass: "text-systemGray-light" }
 * // ]
 */
export function expandSchemeModifier(
  schemeModifier: ParsedModifier,
  customColors: Record<string, string>,
  darkSuffix = "-dark",
  lightSuffix = "-light",
): ParsedModifier[] {
  const { baseClass } = schemeModifier;

  // Only process color-based classes
  if (!isColorClass(baseClass)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] scheme: modifier only supports color classes (text-*, bg-*, border-*, outline-*). ` +
          `Found: "${baseClass}". This modifier will be ignored.`,
      );
    }
    return [];
  }

  // Extract the color name from the class
  // e.g., "text-systemGray" -> "systemGray"
  const match = baseClass.match(/^(text|bg|border|outline)-(.+)$/);
  if (!match) {
    return [];
  }

  const [, prefix, colorWithOpacity] = match;
  const opacityModifier = parseColorOpacityModifier(colorWithOpacity);
  const colorName = opacityModifier?.baseColorKey ?? colorWithOpacity;
  const opacitySuffix = opacityModifier?.suffix ?? "";

  // Build variant class names
  const darkColorName = `${colorName}${darkSuffix}`;
  const lightColorName = `${colorName}${lightSuffix}`;

  // Validate that both color variants exist
  const darkColorExists = customColors[darkColorName] !== undefined;
  const lightColorExists = customColors[lightColorName] !== undefined;

  if (!darkColorExists || !lightColorExists) {
    if (process.env.NODE_ENV !== "production") {
      const missing = [];
      if (!darkColorExists) missing.push(`${colorName}${darkSuffix}`);
      if (!lightColorExists) missing.push(`${colorName}${lightSuffix}`);
      console.warn(
        `[react-native-tailwind] scheme:${baseClass} requires both color variants to exist. ` +
          `Missing: ${missing.join(", ")}. This modifier will be ignored.`,
      );
    }
    return [];
  }

  // Expand to dark: and light: modifiers
  return [
    {
      modifier: "dark" as ColorSchemeModifierType,
      baseClass: `${prefix}-${darkColorName}${opacitySuffix}`,
    },
    {
      modifier: "light" as ColorSchemeModifierType,
      baseClass: `${prefix}-${lightColorName}${opacitySuffix}`,
    },
  ];
}

/**
 * Classes that expand to directional modifiers for true RTL support
 * text-start -> ltr:text-left rtl:text-right (start = left in LTR, right in RTL)
 * text-end -> ltr:text-right rtl:text-left (end = right in LTR, left in RTL)
 */
const DIRECTIONAL_TEXT_ALIGN_EXPANSIONS: Record<string, { ltr: string; rtl: string }> = {
  "text-start": { ltr: "text-left", rtl: "text-right" },
  "text-end": { ltr: "text-right", rtl: "text-left" },
};

/**
 * Check if a class should be expanded to directional modifiers
 *
 * @param cls - Class name to check
 * @returns Expansion object if class should expand, undefined otherwise
 */
export function getDirectionalExpansion(cls: string): { ltr: string; rtl: string } | undefined {
  return DIRECTIONAL_TEXT_ALIGN_EXPANSIONS[cls];
}

/**
 * Split a space-separated className string into base and modifier classes
 *
 * @param className - Space-separated class names
 * @returns Object with baseClasses and modifierClasses arrays
 *
 * @example
 * splitModifierClasses("bg-blue-500 active:bg-blue-700 p-4 active:p-6")
 * // {
 * //   baseClasses: ["bg-blue-500", "p-4"],
 * //   modifierClasses: [
 * //     { modifier: "active", baseClass: "bg-blue-700" },
 * //     { modifier: "active", baseClass: "p-6" }
 * //   ]
 * // }
 *
 * @example
 * // text-start/text-end auto-expand to directional modifiers for true RTL support
 * splitModifierClasses("text-start p-4")
 * // {
 * //   baseClasses: ["p-4"],
 * //   modifierClasses: [
 * //     { modifier: "ltr", baseClass: "text-left" },
 * //     { modifier: "rtl", baseClass: "text-right" }
 * //   ]
 * // }
 */
export function splitModifierClasses(className: string): {
  baseClasses: string[];
  modifierClasses: ParsedModifier[];
} {
  const classes = className.trim().split(/\s+/).filter(Boolean);
  const baseClasses: string[] = [];
  const modifierClasses: ParsedModifier[] = [];

  for (const cls of classes) {
    // Check for directional text alignment expansion (text-start, text-end)
    const directionalExpansion = getDirectionalExpansion(cls);
    if (directionalExpansion) {
      // Expand to ltr: and rtl: modifiers for true RTL support
      modifierClasses.push({ modifier: "ltr", baseClass: directionalExpansion.ltr });
      modifierClasses.push({ modifier: "rtl", baseClass: directionalExpansion.rtl });
      continue;
    }

    const parsed = parseModifier(cls);
    if (parsed) {
      modifierClasses.push(parsed);
    } else {
      baseClasses.push(cls);
    }
  }

  return { baseClasses, modifierClasses };
}
