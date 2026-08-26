/** Compile-time processing for raw Tailwind color tokens. */

import type { NodePath } from "@babel/core";
import type * as BabelTypes from "@babel/types";

import { COLORS, parseColor } from "../../parser/colors.js";
import { expandSchemeModifier } from "../../parser/modifiers.js";
import { findComponentScope } from "../plugin/componentScope.js";
import type { PluginState } from "../plugin/state.js";
import { injectColorSchemeHook } from "./styleInjection.js";

export type ResolvedTwColorToken =
  | { kind: "static"; color: string }
  | { kind: "scheme"; darkColor: string; lightColor: string };

const COLOR_UTILITY_PATTERN = /^(?:bg|text|border|outline)-/;

function normalizeColorUtility(token: string): string {
  return COLOR_UTILITY_PATTERN.test(token) ? token : `text-${token}`;
}

function extractNativeColor(style: ReturnType<typeof parseColor>): string | null {
  if (!style) {
    return null;
  }

  const colors = Object.entries(style)
    .filter(([key, value]) => key.toLowerCase().includes("color") && typeof value === "string")
    .map(([, value]) => value as string);
  const uniqueColors = [...new Set(colors)];
  return uniqueColors.length === 1 ? uniqueColors[0] : null;
}

function resolveUtilityColor(utility: string, state: PluginState): string | null {
  return extractNativeColor(parseColor(utility, state.customTheme.colors));
}

export function resolveTwColorToken(token: string, state: PluginState): ResolvedTwColorToken | null {
  const normalized = token.trim();
  if (!normalized || /\s/.test(normalized)) {
    return null;
  }

  if (normalized.startsWith("scheme:")) {
    const utility = normalizeColorUtility(normalized.slice(7));
    const availableColors = { ...COLORS, ...state.customTheme.colors };
    const variants = expandSchemeModifier(
      { modifier: "scheme", baseClass: utility },
      availableColors,
      state.schemeModifierConfig.darkSuffix,
      state.schemeModifierConfig.lightSuffix,
    );

    if (variants.length !== 2) {
      return null;
    }

    const darkColor = resolveUtilityColor(variants[0].baseClass, state);
    const lightColor = resolveUtilityColor(variants[1].baseClass, state);
    return darkColor && lightColor ? { kind: "scheme", darkColor, lightColor } : null;
  }

  if (normalized.includes(":")) {
    return null;
  }

  const color = resolveUtilityColor(normalizeColorUtility(normalized), state);
  return color ? { kind: "static", color } : null;
}

export function twColorTokenToExpression(
  token: ResolvedTwColorToken,
  state: PluginState,
  t: typeof BabelTypes,
): BabelTypes.Expression {
  if (token.kind === "static") {
    return t.stringLiteral(token.color);
  }

  return t.conditionalExpression(
    t.binaryExpression("===", t.identifier(state.colorSchemeVariableName), t.stringLiteral("dark")),
    t.stringLiteral(token.darkColor),
    t.stringLiteral(token.lightColor),
  );
}

export function ensureTwColorSchemeHook(
  path: NodePath<BabelTypes.CallExpression>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  const componentScope = findComponentScope(path, t);
  if (!componentScope) {
    throw path.buildCodeFrameError(
      "[react-native-tailwind] useTwColor/useTwColors must be called inside a React function component.",
    );
  }

  state.functionComponentsNeedingColorScheme.add(componentScope);
  state.needsColorSchemeImport = true;
  injectColorSchemeHook(
    componentScope,
    state.colorSchemeVariableName,
    state.colorSchemeHookName,
    state.colorSchemeLocalIdentifier,
    t,
  );
}

export function assertTwColorComponentScope(
  path: NodePath<BabelTypes.CallExpression>,
  t: typeof BabelTypes,
): void {
  if (!findComponentScope(path, t)) {
    throw path.buildCodeFrameError(
      "[react-native-tailwind] useTwColor/useTwColors must be called inside a React function component.",
    );
  }
}

export function removeTwColorImports(path: NodePath<BabelTypes.Program>, t: typeof BabelTypes): void {
  // Refresh bindings after call expressions have been replaced. If a helper is
  // also referenced as a runtime value, removing its import would leave an
  // unbound identifier in the generated module.
  path.scope.crawl();

  path.traverse({
    ImportDeclaration(importPath) {
      if (importPath.node.source.value !== "@mgcrea/react-native-tailwind") {
        return;
      }

      const remainingSpecifiers = importPath.node.specifiers.filter((specifier) => {
        if (t.isImportSpecifier(specifier) && t.isIdentifier(specifier.imported)) {
          const isTwColorHelper =
            specifier.imported.name === "twColor" ||
            specifier.imported.name === "useTwColor" ||
            specifier.imported.name === "useTwColors";
          if (!isTwColorHelper) {
            return true;
          }

          const binding = path.scope.getBinding(specifier.local.name);
          const remainingReference = binding?.referencePaths.find((referencePath) => !referencePath.removed);
          if (remainingReference) {
            throw remainingReference.buildCodeFrameError(
              `[react-native-tailwind] ${specifier.imported.name} must be called directly so it can be replaced at compile time.`,
            );
          }

          return false;
        }
        return true;
      });

      if (remainingSpecifiers.length === 0) {
        importPath.remove();
      } else if (remainingSpecifiers.length < importPath.node.specifiers.length) {
        importPath.node.specifiers = remainingSpecifiers;
      }
    },
  });
}
