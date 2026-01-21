/**
 * Visitors for tv() and cva() variant transformations
 * Transforms variant function calls to pre-computed StyleSheet references
 */

import type { NodePath } from "@babel/core";
import type * as BabelTypes from "@babel/types";
import { parseClassName } from "../../../parser/index.js";
import { generateStyleKey } from "../../../utils/styleKey.js";
import {
  extractCvaConfig,
  extractTvConfig,
  generateDynamicVariantExpression,
  processVariantCallSite,
  processVariantDefinition,
} from "../../utils/variantProcessing.js";
import type { PluginState } from "../state.js";

/**
 * Track tv/cva imports
 */
export function variantImportVisitor(
  path: NodePath<BabelTypes.ImportDeclaration>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  const source = path.node.source.value;

  // Track tailwind-variants imports
  if (source === "tailwind-variants") {
    for (const spec of path.node.specifiers) {
      if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
        if (spec.imported.name === "tv") {
          state.tvImportNames.add(spec.local.name);
        }
      }
    }
  }

  // Track class-variance-authority imports
  if (source === "class-variance-authority") {
    for (const spec of path.node.specifiers) {
      if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
        if (spec.imported.name === "cva") {
          state.cvaImportNames.add(spec.local.name);
        }
      }
    }
  }
}

/**
 * Process variant function definitions (const button = tv({...}))
 */
export function variantDefinitionVisitor(
  path: NodePath<BabelTypes.VariableDeclarator>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  // Check if this is a variant function definition
  // e.g., const button = tv({...}) or const button = cva('base', {...})
  if (!t.isIdentifier(path.node.id)) return;
  if (!t.isCallExpression(path.node.init)) return;

  const variableName = path.node.id.name;
  const callExpr = path.node.init;

  // Check if callee is a tracked tv/cva import
  if (!t.isIdentifier(callExpr.callee)) return;
  const calleeName = callExpr.callee.name;

  let type: "tv" | "cva" | null = null;
  if (state.tvImportNames.has(calleeName)) {
    type = "tv";
  } else if (state.cvaImportNames.has(calleeName)) {
    type = "cva";
  }

  if (!type) return;

  // Extract the config
  const config =
    type === "tv" ? extractTvConfig(callExpr.arguments, t) : extractCvaConfig(callExpr.arguments, t);

  if (!config) {
    // Config couldn't be extracted statically
    // Leave the code as-is for runtime processing
    return;
  }

  // Process the variant definition
  processVariantDefinition(variableName, type, config, state, parseClassName, generateStyleKey);

  // Mark that we have variant definitions
  state.hasVariantDefinitions = true;
}

/**
 * Process variant function call sites
 * e.g., button({ color: 'primary' }) or className={button({ color: 'primary' })}
 */
export function variantCallVisitor(
  path: NodePath<BabelTypes.CallExpression>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  // Check if this is a call to a tracked variant function
  if (!t.isIdentifier(path.node.callee)) return;

  const calleeName = path.node.callee.name;
  const entry = state.variantFunctions.get(calleeName);

  if (!entry) return;

  // Try to process with static props
  const success = processVariantCallSite(path, calleeName, entry, state, t);

  if (!success) {
    // Couldn't resolve statically - try dynamic transformation
    const args = path.node.arguments;

    if (args.length === 1 && t.isObjectExpression(args[0])) {
      // Generate dynamic conditional expression
      const dynamicExpr = generateDynamicVariantExpression(calleeName, entry, args[0], state, t);

      if (dynamicExpr) {
        path.replaceWith(dynamicExpr);
        return;
      }
    }

    // Fall back: can't transform, leave as-is
    // This will require runtime processing
  }
}

/**
 * Remove tv/cva imports after transformation
 * (Only if all usages were successfully transformed)
 */
export function removeVariantImports(
  path: NodePath<BabelTypes.Program>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  // Only remove if we have transformed variant definitions
  if (!state.hasVariantDefinitions) return;

  path.traverse({
    ImportDeclaration(importPath) {
      const source = importPath.node.source.value;

      if (source === "tailwind-variants" || source === "class-variance-authority") {
        // Check if all specifiers are tv/cva that we've processed
        const remainingSpecifiers = importPath.node.specifiers.filter((spec) => {
          if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
            const name = spec.imported.name;
            // Keep if it's not tv/cva or if we didn't process this import
            if (name === "tv" && state.tvImportNames.has(spec.local.name)) {
              return false; // Remove
            }
            if (name === "cva" && state.cvaImportNames.has(spec.local.name)) {
              return false; // Remove
            }
          }
          return true; // Keep
        });

        if (remainingSpecifiers.length === 0) {
          importPath.remove();
        } else if (remainingSpecifiers.length < importPath.node.specifiers.length) {
          importPath.node.specifiers = remainingSpecifiers;
        }
      }
    },
  });
}

/**
 * Remove variant function definitions after transformation
 * (The const button = tv({...}) declarations are no longer needed)
 */
export function removeVariantDefinitions(
  path: NodePath<BabelTypes.Program>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  if (!state.hasVariantDefinitions) return;

  path.traverse({
    VariableDeclaration(varDeclPath) {
      const declarators = varDeclPath.node.declarations;
      const remainingDeclarators = declarators.filter((decl) => {
        if (t.isIdentifier(decl.id)) {
          const name = decl.id.name;
          // Remove if this is a variant function we processed
          if (state.variantFunctions.has(name)) {
            return false;
          }
        }
        return true;
      });

      if (remainingDeclarators.length === 0) {
        varDeclPath.remove();
      } else if (remainingDeclarators.length < declarators.length) {
        varDeclPath.node.declarations = remainingDeclarators;
      }
    },
  });
}
