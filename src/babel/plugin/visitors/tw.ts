/**
 * tw and twStyle visitors - handles compile-time tw tagged templates and twStyle calls
 */

import type { NodePath } from "@babel/core";
import type * as BabelTypes from "@babel/types";

import { parseClassName, splitModifierClasses } from "../../../parser/index.js";
import { generateStyleKey } from "../../../utils/styleKey.js";
import { processTwCall } from "../../utils/twProcessing.js";
import { findComponentScope } from "../componentScope.js";
import type { PluginState } from "../state.js";

/**
 * TaggedTemplateExpression visitor
 * Handles tw`...` tagged template expressions
 */
export function taggedTemplateVisitor(
  path: NodePath<BabelTypes.TaggedTemplateExpression>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  const node = path.node;

  // Check if the tag is a tracked tw import
  if (!t.isIdentifier(node.tag)) {
    return;
  }

  const tagName = node.tag.name;
  if (!state.twImportNames.has(tagName)) {
    return;
  }

  // Extract static className from template literal
  const quasi = node.quasi;
  if (!t.isTemplateLiteral(quasi)) {
    return;
  }

  // Only support static strings (no interpolations)
  if (quasi.expressions.length > 0) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Dynamic tw\`...\` with interpolations is not supported at ${state.file.opts.filename ?? "unknown"}. ` +
          `Use style prop for dynamic values.`,
      );
    }
    return;
  }

  // Get the static className string
  const className = quasi.quasis[0]?.value.cooked?.trim() ?? "";
  if (!className) {
    // Replace with empty object
    path.replaceWith(t.objectExpression([t.objectProperty(t.identifier("style"), t.objectExpression([]))]));
    // Mark as successfully transformed (even if empty)
    state.hasTwImport = true;
    return;
  }

  state.hasClassNames = true;

  // Process the className with modifiers
  processTwCall(
    className,
    path,
    state,
    parseClassName,
    generateStyleKey,
    splitModifierClasses,
    findComponentScope,
    t,
  );

  // Mark as successfully transformed
  state.hasTwImport = true;
}

/**
 * CallExpression visitor
 * Handles twStyle('...') call expressions
 */
export function callExpressionVisitor(
  path: NodePath<BabelTypes.CallExpression>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  const node = path.node;

  // Check if the callee is a tracked twStyle import
  if (!t.isIdentifier(node.callee)) {
    return;
  }

  const calleeName = node.callee.name;
  if (state.useTwStyleImportNames.has(calleeName)) {
    if (node.arguments.length !== 1) {
      throw path.buildCodeFrameError(
        "[react-native-tailwind] useTwStyle() expects exactly one compiled tw/twStyle object.",
      );
    }

    const componentScope = findComponentScope(path, t);
    if (!componentScope) {
      throw path.buildCodeFrameError(
        "[react-native-tailwind] useTwStyle() must be called unconditionally inside a React function component.",
      );
    }

    state.functionComponentsNeedingColorScheme.add(componentScope);
    state.needsColorSchemeImport = true;
    node.arguments.push(t.identifier(state.colorSchemeVariableName));
    return;
  }

  if (!state.twImportNames.has(calleeName)) {
    return;
  }

  // Must have exactly one argument
  if (node.arguments.length !== 1) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] twStyle() expects exactly one argument at ${state.file.opts.filename ?? "unknown"}`,
      );
    }
    return;
  }

  const arg = node.arguments[0];

  // Only support static string literals
  if (!t.isStringLiteral(arg)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] twStyle() only supports static string literals at ${state.file.opts.filename ?? "unknown"}. ` +
          `Use style prop for dynamic values.`,
      );
    }
    return;
  }

  const className = arg.value.trim();
  if (!className) {
    // Replace with undefined
    path.replaceWith(t.identifier("undefined"));
    // Mark as successfully transformed (even if empty)
    state.hasTwImport = true;
    return;
  }

  state.hasClassNames = true;

  // Process the className with modifiers
  processTwCall(
    className,
    path,
    state,
    parseClassName,
    generateStyleKey,
    splitModifierClasses,
    findComponentScope,
    t,
  );

  // Mark as successfully transformed
  state.hasTwImport = true;
}
