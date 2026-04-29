/**
 * Utility functions for processing directional modifiers (rtl:, ltr:)
 */

import type * as BabelTypes from "@babel/types";

import type { CustomTheme, DirectionalModifierType, ParsedModifier } from "../../parser/index.js";
import type { StyleObject } from "../../types/core.js";
import { hasRuntimeDimensions } from "./windowDimensionsProcessing.js";

/**
 * Plugin state interface (subset needed for directional modifier processing)
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface DirectionalModifierProcessingState {
  styleRegistry: Map<string, StyleObject>;
  customTheme: CustomTheme;
  stylesIdentifier: string;
  needsI18nManagerImport: boolean;
  i18nManagerVariableName: string;
}

/**
 * Process directional modifiers and generate conditional style expressions
 *
 * @param directionalModifiers - Array of parsed directional modifiers
 * @param state - Plugin state
 * @param parseClassName - Function to parse class names into style objects
 * @param generateStyleKey - Function to generate unique style keys
 * @param t - Babel types
 * @returns Array of AST nodes for conditional expressions
 *
 * @example
 * Input: [{ modifier: "rtl", baseClass: "mr-4" }, { modifier: "ltr", baseClass: "ml-4" }]
 * Output: [
 *   _twIsRTL && styles._rtl_mr_4,
 *   !_twIsRTL && styles._ltr_ml_4
 * ]
 */
export function processDirectionalModifiers(
  directionalModifiers: ParsedModifier[],
  state: DirectionalModifierProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  generateStyleKey: (className: string) => string,
  t: typeof BabelTypes,
): BabelTypes.Expression[] {
  // Mark that we need I18nManager import
  state.needsI18nManagerImport = true;

  // Group modifiers by direction (rtl, ltr)
  const modifiersByDirection = new Map<DirectionalModifierType, ParsedModifier[]>();

  for (const mod of directionalModifiers) {
    const direction = mod.modifier as DirectionalModifierType;
    if (!modifiersByDirection.has(direction)) {
      modifiersByDirection.set(direction, []);
    }
    const directionGroup = modifiersByDirection.get(direction);
    if (directionGroup) {
      directionGroup.push(mod);
    }
  }

  // Build conditional expressions for each direction
  const conditionalExpressions: BabelTypes.Expression[] = [];

  for (const [direction, modifiers] of modifiersByDirection) {
    // Parse all classes for this direction together
    const classNames = modifiers.map((m) => m.baseClass).join(" ");
    const styleObject = parseClassName(classNames, state.customTheme);

    // Check for runtime dimensions (w-screen, h-screen)
    if (hasRuntimeDimensions(styleObject)) {
      throw new Error(
        `w-screen and h-screen cannot be combined with directional modifiers (rtl:, ltr:). ` +
          `Found in: "${direction}:${classNames}". ` +
          `Use w-screen/h-screen without modifiers instead.`,
      );
    }

    const styleKey = generateStyleKey(`${direction}_${classNames}`);

    // Register style in the registry
    state.styleRegistry.set(styleKey, styleObject);

    // Create conditional:
    // - For rtl: _twIsRTL && styles._rtl_...
    // - For ltr: !_twIsRTL && styles._ltr_...
    const rtlVariable = t.identifier(state.i18nManagerVariableName);
    const directionCheck = direction === "rtl" ? rtlVariable : t.unaryExpression("!", rtlVariable);

    const styleReference = t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(styleKey));

    const conditionalExpression = t.logicalExpression("&&", directionCheck, styleReference);

    conditionalExpressions.push(conditionalExpression);
  }

  return conditionalExpressions;
}
