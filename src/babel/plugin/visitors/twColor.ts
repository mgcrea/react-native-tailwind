/** CallExpression visitor for compile-time raw color hooks. */

import type { NodePath } from "@babel/core";
import type * as BabelTypes from "@babel/types";

import {
  assertTwColorComponentScope,
  ensureTwColorSchemeHook,
  resolveTwColorToken,
  twColorTokenToExpression,
} from "../../utils/twColorProcessing.js";
import type { ResolvedTwColorToken } from "../../utils/twColorProcessing.js";
import type { PluginState } from "../state.js";

function invalidCall(path: NodePath<BabelTypes.CallExpression>, message: string): never {
  throw path.buildCodeFrameError(`[react-native-tailwind] ${message}`);
}

function invalidTag(path: NodePath<BabelTypes.TaggedTemplateExpression>, message: string): never {
  throw path.buildCodeFrameError(`[react-native-tailwind] ${message}`);
}

/** Compile static twColor`...` tokens to native color string literals. */
export function twColorTaggedTemplateVisitor(
  path: NodePath<BabelTypes.TaggedTemplateExpression>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  if (!t.isIdentifier(path.node.tag) || state.twColorImportNames.get(path.node.tag.name) !== "twColor") {
    return;
  }

  if (path.node.quasi.expressions.length > 0) {
    invalidTag(path, "twColor`...` only supports one static color token without interpolations.");
  }

  const tokenValue = path.node.quasi.quasis[0]?.value.cooked?.trim() ?? "";
  if (!tokenValue) {
    invalidTag(path, "twColor`...` requires one static color token.");
  }

  if (tokenValue.startsWith("scheme:")) {
    invalidTag(
      path,
      `twColor\`${tokenValue}\` cannot resolve a runtime color scheme. ` +
        `Use useTwColor("${tokenValue}") inside a function component.`,
    );
  }

  const token = resolveTwColorToken(tokenValue, state);
  if (!token || token.kind !== "static") {
    invalidTag(path, `Unknown or unsupported color token: "${tokenValue}".`);
  }

  path.replaceWith(t.stringLiteral(token.color));
  state.hasTwColorImport = true;
}

export function twColorCallExpressionVisitor(
  path: NodePath<BabelTypes.CallExpression>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  if (!t.isIdentifier(path.node.callee)) {
    return;
  }

  const helper = state.twColorImportNames.get(path.node.callee.name);
  if (!helper) {
    return;
  }

  if (helper === "twColor") {
    invalidCall(path, "twColor must be used as a tagged template: twColor`blue-500`.");
  }

  if (path.node.arguments.length !== 1) {
    invalidCall(path, `${helper}() expects exactly one argument.`);
  }

  assertTwColorComponentScope(path, t);

  const argument = path.node.arguments[0];
  let needsScheme = false;

  if (helper === "useTwColor") {
    if (!t.isStringLiteral(argument)) {
      invalidCall(path, "useTwColor() requires a static string literal.");
    }

    const token = resolveTwColorToken(argument.value, state);
    if (!token) {
      invalidCall(path, `Unknown or unsupported color token: "${argument.value}".`);
    }

    needsScheme = token.kind === "scheme";
    if (needsScheme) {
      ensureTwColorSchemeHook(path, state, t);
    }
    path.replaceWith(twColorTokenToExpression(token, state, t));
  } else {
    if (!t.isObjectExpression(argument)) {
      invalidCall(path, "useTwColors() requires an object literal of static color tokens.");
    }

    const properties: BabelTypes.ObjectProperty[] = [];
    const tokens: Array<{ property: BabelTypes.ObjectProperty; token: ResolvedTwColorToken }> = [];

    for (const property of argument.properties) {
      if (
        !t.isObjectProperty(property) ||
        property.computed ||
        (!t.isIdentifier(property.key) && !t.isStringLiteral(property.key)) ||
        !t.isStringLiteral(property.value)
      ) {
        invalidCall(path, "useTwColors() only supports plain object properties with static string values.");
      }

      const token = resolveTwColorToken(property.value.value, state);
      if (!token) {
        invalidCall(path, `Unknown or unsupported color token: "${property.value.value}".`);
      }
      needsScheme ||= token.kind === "scheme";
      tokens.push({ property, token });
    }

    if (needsScheme) {
      ensureTwColorSchemeHook(path, state, t);
    }

    for (const { property, token } of tokens) {
      properties.push(t.objectProperty(t.cloneNode(property.key), twColorTokenToExpression(token, state, t)));
    }
    path.replaceWith(t.objectExpression(properties));
  }

  state.hasTwColorImport = true;
}
