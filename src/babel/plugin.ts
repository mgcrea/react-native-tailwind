/**
 * Babel plugin for react-native-tailwind
 * Transforms className props to style props at compile time
 */

import type { PluginObj } from "@babel/core";
import * as BabelTypes from "@babel/types";

import { isComponentScope } from "./plugin/componentScope.js";
import type { PluginOptions, PluginState } from "./plugin/state.js";
import { createInitialState } from "./plugin/state.js";
import { jsxAttributeVisitor } from "./plugin/visitors/className.js";
import { importDeclarationVisitor } from "./plugin/visitors/imports.js";
import { programEnter, programExit } from "./plugin/visitors/program.js";
import { callExpressionVisitor, taggedTemplateVisitor } from "./plugin/visitors/tw.js";
import { scanForColorSchemeModifiers } from "./utils/preInjection.js";
import { injectColorSchemeHook } from "./utils/styleInjection.js";

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

          // Pre-traverse: inject color scheme hooks BEFORE React Compiler's
          // analysis phase. React Compiler captures reactive dependencies during
          // its Program.enter or Function.enter. By running path.traverse() here
          // (which completes synchronously), hooks are injected into the AST
          // before React Compiler ever sees the code.

          // First, detect imports needed for pre-traversal:
          // 1. Color scheme hook alias (e.g., `import { useTheme as alias }`)
          // 2. tw/twStyle imports (needed for scanning tw`dark:...` patterns)
          for (const stmt of path.node.body) {
            if (!t.isImportDeclaration(stmt) || stmt.importKind === "type") continue;

            if (stmt.source.value === state.colorSchemeImportSource) {
              for (const spec of stmt.specifiers) {
                if (
                  t.isImportSpecifier(spec) &&
                  t.isIdentifier(spec.imported) &&
                  spec.imported.name === state.colorSchemeHookName
                ) {
                  state.colorSchemeLocalIdentifier = spec.local.name;
                  break;
                }
              }
            }

            if (stmt.source.value === "@mgcrea/react-native-tailwind") {
              for (const spec of stmt.specifiers) {
                if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
                  const importedName = spec.imported.name;
                  if (importedName === "tw" || importedName === "twStyle") {
                    state.twImportNames.add(spec.local.name);
                  }
                }
              }
            }
          }

          // Now scan functions and inject hooks
          path.traverse({
            Function: {
              enter(funcPath) {
                if (!isComponentScope(funcPath, t)) return;

                const body = funcPath.node.body;
                if (
                  scanForColorSchemeModifiers(
                    t.isBlockStatement(body) ? body : (body as BabelTypes.Node),
                    state.supportedAttributes,
                    state.attributePatterns,
                    state.twImportNames,
                    t,
                  )
                ) {
                  injectColorSchemeHook(
                    funcPath,
                    state.colorSchemeVariableName,
                    state.colorSchemeHookName,
                    state.colorSchemeLocalIdentifier,
                    t,
                  );
                  state.needsColorSchemeImport = true;
                }
              },
            },
          });

          // Call programEnter (currently a no-op, but kept for consistency)
          programEnter(path, state);
        },

        exit(path, state) {
          programExit(path, state, t);
        },
      },

      ImportDeclaration(path, state) {
        importDeclarationVisitor(path, state, t);
      },

      TaggedTemplateExpression(path, state) {
        taggedTemplateVisitor(path, state, t);
      },

      CallExpression(path, state) {
        callExpressionVisitor(path, state, t);
      },

      JSXAttribute(path, state) {
        jsxAttributeVisitor(path, state, t);
      },
    },
  };
}
