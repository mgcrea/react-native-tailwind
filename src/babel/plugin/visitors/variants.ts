/**
 * Visitors for class utility transformations (tv, cva, twMerge)
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
  processClassJoinerCall,
  processVariantCallSite,
  processVariantDefinition,
} from "../../utils/variantProcessing.js";
import type { PluginState } from "../state.js";
import { CLASS_UTILITY_CONFIG } from "../state.js";

/**
 * Track class utility imports (tv, cva, twMerge)
 * Uses unified config to detect and track all supported utilities
 */
export function classUtilityImportVisitor(
  path: NodePath<BabelTypes.ImportDeclaration>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  const source = path.node.source.value;
  const packageConfig = CLASS_UTILITY_CONFIG[source];

  if (!packageConfig) return;

  for (const spec of path.node.specifiers) {
    if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
      const utilityType = packageConfig[spec.imported.name];
      if (utilityType) {
        state.classUtilityImports.set(spec.local.name, {
          type: utilityType,
          originalName: spec.imported.name,
        });
      }
    }
  }
}

/**
 * Process variant function definitions (const button = tv({...}))
 * Only processes tv and cva - twMerge is handled at call sites
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

  const utility = state.classUtilityImports.get(calleeName);
  // Only process tv and cva definitions (twMerge doesn't create variant functions)
  if (!utility || (utility.type !== "tv" && utility.type !== "cva")) return;

  // Extract the config
  const config =
    utility.type === "tv" ? extractTvConfig(callExpr.arguments, t) : extractCvaConfig(callExpr.arguments, t);

  if (!config) {
    // Config couldn't be extracted statically
    // Leave the code as-is for runtime processing
    return;
  }

  // Process the variant definition
  processVariantDefinition(variableName, utility.type, config, state, parseClassName, generateStyleKey);

  // Mark that we have transformations
  state.hasClassUtilityTransformations = true;
}

/**
 * Process class utility call sites
 * Handles both variant functions (tv/cva) and direct calls (twMerge)
 */
export function classUtilityCallVisitor(
  path: NodePath<BabelTypes.CallExpression>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  if (!t.isIdentifier(path.node.callee)) return;

  const calleeName = path.node.callee.name;

  // First check if this is a call to a tracked variant function (tv/cva result)
  const variantEntry = state.variantFunctions.get(calleeName);
  if (variantEntry) {
    // Try to process with static props
    const success = processVariantCallSite(path, calleeName, variantEntry, state, t);

    if (!success) {
      // Couldn't resolve statically - try dynamic transformation
      const args = path.node.arguments;

      if (args.length === 1 && t.isObjectExpression(args[0])) {
        // Generate dynamic conditional expression
        const dynamicExpr = generateDynamicVariantExpression(calleeName, variantEntry, args[0], state, t);

        if (dynamicExpr) {
          path.replaceWith(dynamicExpr);
          state.hasClassUtilityTransformations = true;
        }
      }
    } else {
      state.hasClassUtilityTransformations = true;
    }
    return;
  }

  // Check if this is a class joiner call (twMerge, twJoin, cx)
  const utility = state.classUtilityImports.get(calleeName);
  if (utility && (utility.type === "twMerge" || utility.type === "twJoin" || utility.type === "cx")) {
    const success = processClassJoinerCall(path, utility.type, state, parseClassName, generateStyleKey, t);
    if (success) {
      state.hasClassUtilityTransformations = true;
    }
  }
}

/**
 * Remove class utility imports after transformation
 * Uses unified config to know which packages to check
 */
export function removeClassUtilityImports(
  path: NodePath<BabelTypes.Program>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  if (!state.hasClassUtilityTransformations) return;

  const trackedPackages = Object.keys(CLASS_UTILITY_CONFIG);

  path.traverse({
    ImportDeclaration(importPath) {
      const source = importPath.node.source.value;

      if (trackedPackages.includes(source)) {
        const packageConfig = CLASS_UTILITY_CONFIG[source];

        // Check if all specifiers are utilities we've tracked
        const remainingSpecifiers = importPath.node.specifiers.filter((spec) => {
          if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
            const importName = spec.imported.name;
            const localName = spec.local.name;

            // Remove if this is a tracked utility import
            if (packageConfig[importName] && state.classUtilityImports.has(localName)) {
              return false;
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
  if (!state.hasClassUtilityTransformations) return;

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

// Export aliases for backward compatibility
export {
  removeClassUtilityImports as removeVariantImports,
  classUtilityCallVisitor as variantCallVisitor,
  classUtilityImportVisitor as variantImportVisitor,
};
