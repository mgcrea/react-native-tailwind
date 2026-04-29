/**
 * Utility functions for processing platform modifiers (ios:, android:, web:)
 */

import type * as BabelTypes from "@babel/types";

import type { CustomTheme, ParsedModifier, PlatformModifierType } from "../../parser/index.js";
import type { StyleObject } from "../../types/core.js";
import { hasRuntimeDimensions } from "./windowDimensionsProcessing.js";

/**
 * Plugin state interface (subset needed for platform modifier processing)
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface PlatformModifierProcessingState {
  styleRegistry: Map<string, StyleObject>;
  customTheme: CustomTheme;
  stylesIdentifier: string;
  needsPlatformImport: boolean;
}

/**
 * Process platform modifiers and generate Platform.select() expression
 *
 * @param platformModifiers - Array of parsed platform modifiers
 * @param state - Plugin state
 * @param parseClassName - Function to parse class names into style objects
 * @param generateStyleKey - Function to generate unique style keys
 * @param t - Babel types
 * @returns AST node for Platform.select() call
 *
 * @example
 * Input: [{ modifier: "ios", baseClass: "shadow-lg" }, { modifier: "android", baseClass: "elevation-4" }]
 * Output: Platform.select({ ios: styles._ios_shadow_lg, android: styles._android_elevation_4 })
 */
export function processPlatformModifiers(
  platformModifiers: ParsedModifier[],
  state: PlatformModifierProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  generateStyleKey: (className: string) => string,
  t: typeof BabelTypes,
): BabelTypes.Expression {
  // Mark that we need Platform import
  state.needsPlatformImport = true;

  // Group modifiers by platform
  const modifiersByPlatform = new Map<PlatformModifierType, ParsedModifier[]>();

  for (const mod of platformModifiers) {
    const platform = mod.modifier as PlatformModifierType;
    if (!modifiersByPlatform.has(platform)) {
      modifiersByPlatform.set(platform, []);
    }
    const platformGroup = modifiersByPlatform.get(platform);
    if (platformGroup) {
      platformGroup.push(mod);
    }
  }

  // Build Platform.select() object properties
  const selectProperties: BabelTypes.ObjectProperty[] = [];

  for (const [platform, modifiers] of modifiersByPlatform) {
    // Parse all classes for this platform together
    const classNames = modifiers.map((m) => m.baseClass).join(" ");
    const styleObject = parseClassName(classNames, state.customTheme);

    // Check for runtime dimensions (w-screen, h-screen)
    if (hasRuntimeDimensions(styleObject)) {
      throw new Error(
        `w-screen and h-screen cannot be combined with platform modifiers (ios:, android:, web:). ` +
          `Found in: "${platform}:${classNames}". ` +
          `Use w-screen/h-screen without modifiers instead.`,
      );
    }

    const styleKey = generateStyleKey(`${platform}_${classNames}`);

    // Register style in the registry
    state.styleRegistry.set(styleKey, styleObject);

    // Create property: ios: styles._ios_shadow_lg
    const styleReference = t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(styleKey));

    selectProperties.push(t.objectProperty(t.identifier(platform), styleReference));
  }

  // Create Platform.select({ ios: ..., android: ... })
  return t.callExpression(t.memberExpression(t.identifier("Platform"), t.identifier("select")), [
    t.objectExpression(selectProperties),
  ]);
}
