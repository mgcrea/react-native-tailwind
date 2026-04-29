/**
 * Utility functions for processing class modifiers (active:, hover:, focus:, etc.)
 */

import type * as BabelTypes from "@babel/types";

import type { CustomTheme, ModifierType, ParsedModifier } from "../../parser/index.js";
import type { StyleObject } from "../../types/core.js";
import { getStatePropertyForModifier } from "./componentSupport.js";
import { hasRuntimeDimensions } from "./windowDimensionsProcessing.js";

/**
 * Plugin state interface (subset needed for modifier processing)
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface ModifierProcessingState {
  styleRegistry: Map<string, StyleObject>;
  customTheme: CustomTheme;
  stylesIdentifier: string;
}

/**
 * Process a static className string that contains modifiers
 * Returns a style function expression for Pressable components
 */
export function processStaticClassNameWithModifiers(
  className: string,
  state: ModifierProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  generateStyleKey: (className: string) => string,
  splitModifierClasses: (className: string) => { baseClasses: string[]; modifierClasses: ParsedModifier[] },
  t: typeof BabelTypes,
) {
  const { baseClasses, modifierClasses } = splitModifierClasses(className);

  // Parse and register base classes
  let baseStyleExpression: BabelTypes.Node | null = null;
  if (baseClasses.length > 0) {
    const baseClassName = baseClasses.join(" ");
    const baseStyleObject = parseClassName(baseClassName, state.customTheme);

    // Check for runtime dimensions (w-screen, h-screen) in base classes
    if (hasRuntimeDimensions(baseStyleObject)) {
      throw new Error(
        `w-screen and h-screen cannot be combined with state modifiers (active:, hover:, focus:, etc.) or platform modifiers (ios:, android:, web:). ` +
          `Found in: "${baseClassName}". ` +
          `Use w-screen/h-screen without modifiers instead.`,
      );
    }

    const baseStyleKey = generateStyleKey(baseClassName);
    state.styleRegistry.set(baseStyleKey, baseStyleObject);
    baseStyleExpression = t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(baseStyleKey));
  }

  // Parse and register modifier classes
  // Group by modifier type for better organization
  const modifiersByType = new Map<ModifierType, ParsedModifier[]>();
  for (const mod of modifierClasses) {
    if (!modifiersByType.has(mod.modifier)) {
      modifiersByType.set(mod.modifier, []);
    }
    const modGroup = modifiersByType.get(mod.modifier);
    if (modGroup) {
      modGroup.push(mod);
    }
  }

  // Build style function: ({ pressed }) => [baseStyle, pressed && modifierStyle]
  const styleArrayElements: BabelTypes.Expression[] = [];

  // Add base style first
  if (baseStyleExpression) {
    styleArrayElements.push(baseStyleExpression);
  }

  // Add conditional styles for each modifier type
  for (const [modifierType, modifiers] of modifiersByType) {
    // Parse all modifier classes together
    const modifierClassNames = modifiers.map((m) => m.baseClass).join(" ");
    const modifierStyleObject = parseClassName(modifierClassNames, state.customTheme);

    // Check for runtime dimensions (w-screen, h-screen) in modifier classes
    if (hasRuntimeDimensions(modifierStyleObject)) {
      throw new Error(
        `w-screen and h-screen cannot be combined with state modifiers (active:, hover:, focus:, etc.) or platform modifiers (ios:, android:, web:). ` +
          `Found in: "${modifierType}:${modifierClassNames}". ` +
          `Use w-screen/h-screen without modifiers instead.`,
      );
    }

    const modifierStyleKey = generateStyleKey(`${modifierType}_${modifierClassNames}`);
    state.styleRegistry.set(modifierStyleKey, modifierStyleObject);

    // Create conditional: pressed && styles._active_bg_blue_700
    const stateProperty = getStatePropertyForModifier(modifierType);
    const conditionalExpression = t.logicalExpression(
      "&&",
      t.identifier(stateProperty),
      t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(modifierStyleKey)),
    );

    styleArrayElements.push(conditionalExpression);
  }

  // If only base style, return it directly; otherwise return array
  if (styleArrayElements.length === 1) {
    return styleArrayElements[0];
  }

  return t.arrayExpression(styleArrayElements);
}

/**
 * Create a style function for Pressable: ({ pressed }) => styleExpression
 */
export function createStyleFunction(
  styleExpression: BabelTypes.Expression,
  modifierTypes: ModifierType[],
  t: typeof BabelTypes,
) {
  // Build parameter object: { pressed, hovered, focused }
  const paramProperties: BabelTypes.ObjectProperty[] = [];
  const usedStateProps = new Set<string>();

  for (const modifierType of modifierTypes) {
    const stateProperty = getStatePropertyForModifier(modifierType);
    if (!usedStateProps.has(stateProperty)) {
      usedStateProps.add(stateProperty);
      paramProperties.push(
        t.objectProperty(t.identifier(stateProperty), t.identifier(stateProperty), false, true),
      );
    }
  }

  const param = t.objectPattern(paramProperties);

  // Create arrow function: ({ pressed }) => styleExpression
  return t.arrowFunctionExpression([param], styleExpression);
}
