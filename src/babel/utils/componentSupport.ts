/**
 * Utility functions for determining component modifier support
 */

import type * as BabelTypes from "@babel/types";

import type { ModifierType } from "../../parser/index.js";

/**
 * Check if a JSX element supports modifiers and determine which modifiers are supported
 * Returns an object with component info and supported modifiers
 */
export function getComponentModifierSupport(
  jsxElement: BabelTypes.Node,
  t: typeof BabelTypes,
): { component: string; supportedModifiers: ModifierType[] } | null {
  if (!t.isJSXOpeningElement(jsxElement)) {
    return null;
  }

  const name = jsxElement.name;
  let componentName: string | null = null;

  // Handle simple identifier: <Pressable>
  if (t.isJSXIdentifier(name)) {
    componentName = name.name;
  }

  // Handle member expression: <ReactNative.Pressable>
  if (t.isJSXMemberExpression(name)) {
    const property = name.property;
    if (t.isJSXIdentifier(property)) {
      componentName = property.name;
    }
  }

  if (!componentName) {
    return null;
  }

  // Map components to their supported modifiers
  switch (componentName) {
    case "Pressable":
      return { component: "Pressable", supportedModifiers: ["active", "hover", "focus", "disabled"] };
    case "TouchableOpacity":
      return { component: "TouchableOpacity", supportedModifiers: ["active", "disabled"] };
    case "TextInput":
      return { component: "TextInput", supportedModifiers: ["focus", "disabled", "placeholder"] };
    default:
      return null;
  }
}

/**
 * Get the state property name for a modifier type
 * Maps modifier types to component state parameter properties
 */
export function getStatePropertyForModifier(modifier: ModifierType): string {
  switch (modifier) {
    case "active":
      return "pressed";
    case "hover":
      return "hovered";
    case "focus":
      return "focused";
    case "disabled":
      return "disabled";
    default:
      return "pressed"; // fallback
  }
}
