/**
 * Utility functions for transforming and merging style attributes
 */

import type { NodePath } from "@babel/core";
import type * as BabelTypes from "@babel/types";

import type { DynamicExpressionResult } from "./dynamicProcessing.js";

/**
 * Helper to extract expression from JSX attribute value
 * Returns null if not a valid expression container or if empty
 */
function getStyleExpression(
  styleAttribute: BabelTypes.JSXAttribute,
  t: typeof BabelTypes,
): BabelTypes.Expression | null {
  const value = styleAttribute.value;
  if (!t.isJSXExpressionContainer(value)) return null;
  const expression = value.expression;
  if (t.isJSXEmptyExpression(expression)) return null;
  return expression;
}

/**
 * Helper to find existing style attribute on parent JSX element
 */
export function findStyleAttribute(
  path: NodePath,
  targetStyleProp: string,
  t: typeof BabelTypes,
): BabelTypes.JSXAttribute | undefined {
  const parent = path.parent as BabelTypes.JSXOpeningElement;
  return parent.attributes.find(
    (attr) => t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name) && attr.name.name === targetStyleProp,
  ) as BabelTypes.JSXAttribute | undefined;
}

/**
 * Replace className with style attribute
 */
export function replaceWithStyleAttribute(
  classNamePath: NodePath,
  styleKey: string,
  targetStyleProp: string,
  stylesIdentifier: string,
  t: typeof BabelTypes,
): void {
  const styleAttribute = t.jsxAttribute(
    t.jsxIdentifier(targetStyleProp),
    t.jsxExpressionContainer(t.memberExpression(t.identifier(stylesIdentifier), t.identifier(styleKey))),
  );

  classNamePath.replaceWith(styleAttribute);
}

/**
 * Merge className styles with existing style prop
 */
export function mergeStyleAttribute(
  classNamePath: NodePath,
  styleAttribute: BabelTypes.JSXAttribute,
  styleKey: string,
  stylesIdentifier: string,
  t: typeof BabelTypes,
): void {
  const existingStyle = getStyleExpression(styleAttribute, t);
  if (!existingStyle) return;

  // Check if existing style is definitely a function expression (inline)
  if (t.isArrowFunctionExpression(existingStyle) || t.isFunctionExpression(existingStyle)) {
    // Existing style is a function - create wrapper that calls it and merges results
    // (_state) => [styles._key, existingStyleFn(_state)]
    const paramIdentifier = t.identifier("_state");
    const functionCall = t.callExpression(existingStyle, [paramIdentifier]);

    const mergedArray = t.arrayExpression([
      t.memberExpression(t.identifier(stylesIdentifier), t.identifier(styleKey)),
      functionCall,
    ]);
    const wrapperFunction = t.arrowFunctionExpression([paramIdentifier], mergedArray);

    styleAttribute.value = t.jsxExpressionContainer(wrapperFunction);
  } else {
    // For identifiers, member expressions, and other static values:
    // Always use simple array merge - don't generate function wrappers
    // React Native components (except Pressable) don't accept style functions,
    // and even for Pressable, if the user passes a variable, we should trust
    // their type and merge it as-is rather than wrapping in a runtime check.
    //
    // This fixes the issue where `style={myStyle}` would be incorrectly wrapped
    // in a function when used with className.
    const styleArray = t.arrayExpression([
      t.memberExpression(t.identifier(stylesIdentifier), t.identifier(styleKey)),
      existingStyle,
    ]);

    styleAttribute.value = t.jsxExpressionContainer(styleArray);
  }

  // Remove the className attribute
  classNamePath.remove();
}

/**
 * Replace className with dynamic style attribute
 */
export function replaceDynamicWithStyleAttribute(
  classNamePath: NodePath,
  result: DynamicExpressionResult,
  targetStyleProp: string,
  t: typeof BabelTypes,
): void {
  const styleAttribute = t.jsxAttribute(
    t.jsxIdentifier(targetStyleProp),
    t.jsxExpressionContainer(result.expression),
  );

  classNamePath.replaceWith(styleAttribute);
}

/**
 * Merge dynamic className styles with existing style prop
 */
export function mergeDynamicStyleAttribute(
  classNamePath: NodePath,
  styleAttribute: BabelTypes.JSXAttribute,
  result: DynamicExpressionResult,
  t: typeof BabelTypes,
): void {
  const existingStyle = getStyleExpression(styleAttribute, t);
  if (!existingStyle) return;

  // Check if existing style is definitely a function expression (inline)
  if (t.isArrowFunctionExpression(existingStyle) || t.isFunctionExpression(existingStyle)) {
    // Existing style is a function - create wrapper that calls it and merges results
    // (_state) => [dynamicStyles, existingStyleFn(_state)]
    const paramIdentifier = t.identifier("_state");
    const functionCall = t.callExpression(existingStyle, [paramIdentifier]);

    const mergedArray = t.arrayExpression([result.expression, functionCall]);
    const wrapperFunction = t.arrowFunctionExpression([paramIdentifier], mergedArray);

    styleAttribute.value = t.jsxExpressionContainer(wrapperFunction);
  } else {
    // For identifiers, member expressions, and other values:
    // Always use simple array merge - don't generate function wrappers
    // This matches the behavior of mergeStyleAttribute for consistency
    let styleArray;
    if (t.isArrayExpression(existingStyle)) {
      // Prepend dynamic styles to existing array
      styleArray = t.arrayExpression([result.expression, ...existingStyle.elements]);
    } else {
      // Create new array with dynamic styles first, then existing
      styleArray = t.arrayExpression([result.expression, existingStyle]);
    }

    styleAttribute.value = t.jsxExpressionContainer(styleArray);
  }

  // Remove the className attribute
  classNamePath.remove();
}

/**
 * Replace className with style function attribute (for Pressable with modifiers)
 */
export function replaceWithStyleFunctionAttribute(
  classNamePath: NodePath,
  styleFunctionExpression: BabelTypes.Expression,
  targetStyleProp: string,
  t: typeof BabelTypes,
): void {
  const styleAttribute = t.jsxAttribute(
    t.jsxIdentifier(targetStyleProp),
    t.jsxExpressionContainer(styleFunctionExpression),
  );

  classNamePath.replaceWith(styleAttribute);
}

/**
 * Merge className style function with existing style prop (for Pressable with modifiers)
 */
export function mergeStyleFunctionAttribute(
  classNamePath: NodePath,
  styleAttribute: BabelTypes.JSXAttribute,
  styleFunctionExpression: BabelTypes.Expression,
  t: typeof BabelTypes,
): void {
  const existingStyle = getStyleExpression(styleAttribute, t);
  if (!existingStyle) return;

  // Create a wrapper function that merges both styles
  // ({ pressed }) => [styleFunctionResult, existingStyle]
  // We need to call the style function and merge results

  // If existing is already a function, we need to handle it specially
  if (t.isArrowFunctionExpression(existingStyle) || t.isFunctionExpression(existingStyle)) {
    // Both are functions - create wrapper that calls both
    // (_state) => [newStyleFn(_state), existingStyleFn(_state)]
    // Create an identifier for the parameter to pass to the function calls
    const paramIdentifier = t.identifier("_state");

    const newFunctionCall = t.callExpression(styleFunctionExpression, [paramIdentifier]);
    const existingFunctionCall = t.callExpression(existingStyle, [paramIdentifier]);

    const mergedArray = t.arrayExpression([newFunctionCall, existingFunctionCall]);
    const wrapperFunction = t.arrowFunctionExpression([paramIdentifier], mergedArray);

    styleAttribute.value = t.jsxExpressionContainer(wrapperFunction);
  } else {
    // Existing is static - create function that returns array
    // (_state) => [styleFunctionResult, existingStyle]
    // Create an identifier for the parameter to pass to the function call
    const paramIdentifier = t.identifier("_state");

    const functionCall = t.callExpression(styleFunctionExpression, [paramIdentifier]);
    const mergedArray = t.arrayExpression([functionCall, existingStyle]);
    const wrapperFunction = t.arrowFunctionExpression([paramIdentifier], mergedArray);

    styleAttribute.value = t.jsxExpressionContainer(wrapperFunction);
  }

  // Remove the className attribute
  classNamePath.remove();
}

/**
 * Add or merge placeholderTextColor prop on a JSX element
 * Handles merging with existing placeholderTextColor if present
 */
export function addOrMergePlaceholderTextColorProp(
  jsxOpeningElement: BabelTypes.JSXOpeningElement,
  color: string,
  t: typeof BabelTypes,
): void {
  // Check if element already has placeholderTextColor prop
  const existingProp = jsxOpeningElement.attributes.find(
    (attr) => t.isJSXAttribute(attr) && attr.name.name === "placeholderTextColor",
  );

  if (existingProp) {
    // If explicit prop exists, don't override it (explicit props take precedence)
    // This matches the behavior of style prop precedence
    /* v8 ignore next 5 */
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] placeholderTextColor prop will be overridden by className placeholder: modifier. ` +
          `Remove the explicit prop or the placeholder: modifier to avoid confusion.`,
      );
    }
    // Override the existing prop value
    (existingProp as BabelTypes.JSXAttribute).value = t.stringLiteral(color);
  } else {
    // Add new placeholderTextColor prop
    const newProp = t.jsxAttribute(t.jsxIdentifier("placeholderTextColor"), t.stringLiteral(color));
    jsxOpeningElement.attributes.push(newProp);
  }
}
