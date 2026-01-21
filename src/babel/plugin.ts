/**
 * Babel plugin for react-native-tailwind
 * Transforms className props to style props at compile time
 */

import type { PluginObj } from "@babel/core";
import * as BabelTypes from "@babel/types";
import type { PluginOptions, PluginState } from "./plugin/state.js";
import { createInitialState } from "./plugin/state.js";
import { jsxAttributeVisitor } from "./plugin/visitors/className.js";
import { importDeclarationVisitor } from "./plugin/visitors/imports.js";
import { programEnter, programExit } from "./plugin/visitors/program.js";
import { callExpressionVisitor, taggedTemplateVisitor } from "./plugin/visitors/tw.js";
import {
  variantCallVisitor,
  variantDefinitionVisitor,
  variantImportVisitor,
} from "./plugin/visitors/variants.js";

// Re-export PluginOptions for external use
export type { PluginOptions };

export default function reactNativeTailwindBabelPlugin(
  { types: t }: { types: typeof BabelTypes },
  options?: PluginOptions,
): PluginObj<PluginState> {
  // Color scheme hook configuration from plugin options
  const colorSchemeImportSource = options?.colorScheme?.importFrom ?? "react-native";
  const colorSchemeHookName = options?.colorScheme?.importName ?? "useColorScheme";

  // Scheme modifier configuration from plugin options
  const schemeModifierConfig = {
    darkSuffix: options?.schemeModifier?.darkSuffix ?? "-dark",
    lightSuffix: options?.schemeModifier?.lightSuffix ?? "-light",
  };

  return {
    name: "react-native-tailwind",

    visitor: {
      Program: {
        enter(path, state) {
          // Initialize state for this file
          const initialState = createInitialState(
            options,
            state.file.opts.filename ?? "",
            colorSchemeImportSource,
            colorSchemeHookName,
            schemeModifierConfig,
          );
          Object.assign(state, initialState);

          // Call programEnter (currently a no-op, but kept for consistency)
          programEnter(path, state);
        },

        exit(path, state) {
          programExit(path, state, t);
        },
      },

      ImportDeclaration(path, state) {
        importDeclarationVisitor(path, state, t);
        // Also track variant imports (tv/cva)
        variantImportVisitor(path, state, t);
      },

      VariableDeclarator(path, state) {
        // Process variant function definitions (const button = tv({...}))
        variantDefinitionVisitor(path, state, t);
      },

      TaggedTemplateExpression(path, state) {
        taggedTemplateVisitor(path, state, t);
      },

      CallExpression(path, state) {
        // First check if this is a variant function call
        variantCallVisitor(path, state, t);
        // Then check for tw/twStyle calls
        callExpressionVisitor(path, state, t);
      },

      JSXAttribute(path, state) {
        jsxAttributeVisitor(path, state, t);
      },
    },
  };
}
