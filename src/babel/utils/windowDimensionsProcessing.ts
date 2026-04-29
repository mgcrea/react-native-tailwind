/**
 * Utility functions for processing window dimensions (w-screen, h-screen)
 */

import type * as BabelTypes from "@babel/types";

import { RUNTIME_DIMENSIONS_MARKER } from "../../config/markers.js";
import type { StyleObject } from "../../types/core.js";

/**
 * Plugin state interface (subset needed for window dimensions processing)
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface WindowDimensionsProcessingState {
  needsWindowDimensionsImport: boolean;
  windowDimensionsVariableName: string;
}

/**
 * Check if a style object contains runtime dimension markers
 *
 * @param styleObject - Style object to check
 * @returns true if the style object contains runtime dimension markers
 *
 * @example
 * hasRuntimeDimensions({ width: "{{RUNTIME:dimensions.width}}" }) // true
 * hasRuntimeDimensions({ width: 100 }) // false
 */
export function hasRuntimeDimensions(styleObject: StyleObject): boolean {
  return Object.values(styleObject).some(
    (value) => typeof value === "string" && value.startsWith(RUNTIME_DIMENSIONS_MARKER),
  );
}

/**
 * Create an inline style object with runtime dimension access
 *
 * Converts runtime markers like "{{RUNTIME:dimensions.width}}" to
 * AST nodes like: { width: _twDimensions.width }
 *
 * @param styleObject - Style object with runtime markers
 * @param state - Plugin state
 * @param t - Babel types
 * @returns AST object expression for inline style
 *
 * @example
 * Input: { width: "{{RUNTIME:dimensions.width}}", height: "{{RUNTIME:dimensions.height}}" }
 * Output: { width: _twDimensions.width, height: _twDimensions.height }
 */
export function createRuntimeDimensionObject(
  styleObject: StyleObject,
  state: WindowDimensionsProcessingState,
  t: typeof BabelTypes,
): BabelTypes.ObjectExpression {
  // Mark that we need useWindowDimensions import and hook injection
  state.needsWindowDimensionsImport = true;

  const properties: BabelTypes.ObjectProperty[] = [];

  for (const [key, value] of Object.entries(styleObject)) {
    let valueNode: BabelTypes.Expression;

    if (typeof value === "string" && value.startsWith(RUNTIME_DIMENSIONS_MARKER)) {
      // Extract property name: "{{RUNTIME:dimensions.width}}" -> "width"
      const match = value.match(/dimensions\.(\w+)/);
      const prop = match?.[1];

      if (prop) {
        // Generate: _twDimensions.width or _twDimensions.height
        valueNode = t.memberExpression(t.identifier(state.windowDimensionsVariableName), t.identifier(prop));
      } else {
        // Fallback: shouldn't happen, but handle gracefully
        valueNode = t.stringLiteral(value);
      }
    } else if (typeof value === "number") {
      valueNode = t.numericLiteral(value);
    } else if (typeof value === "string") {
      valueNode = t.stringLiteral(value);
    } else if (typeof value === "object" && value !== null) {
      // Handle nested objects (e.g., transform arrays)
      valueNode = t.valueToNode(value);
    } else {
      // Handle other types
      valueNode = t.valueToNode(value);
    }

    properties.push(t.objectProperty(t.identifier(key), valueNode));
  }

  return t.objectExpression(properties);
}

/**
 * Split a style object into static and runtime parts
 *
 * @param styleObject - Style object to split
 * @returns Object with static and runtime style objects
 *
 * @example
 * Input: { width: "{{RUNTIME:dimensions.width}}", padding: 16, backgroundColor: "#fff" }
 * Output: {
 *   static: { padding: 16, backgroundColor: "#fff" },
 *   runtime: { width: "{{RUNTIME:dimensions.width}}" }
 * }
 */
export function splitStaticAndRuntimeStyles(styleObject: StyleObject): {
  static: StyleObject;
  runtime: StyleObject;
} {
  const staticStyles: StyleObject = {};
  const runtimeStyles: StyleObject = {};

  for (const [key, value] of Object.entries(styleObject)) {
    if (typeof value === "string" && value.startsWith(RUNTIME_DIMENSIONS_MARKER)) {
      runtimeStyles[key] = value;
    } else {
      staticStyles[key] = value;
    }
  }

  return { static: staticStyles, runtime: runtimeStyles };
}
