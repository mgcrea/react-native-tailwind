/**
 * Utility functions for processing class utility calls (tv, cva, twMerge)
 * Uses the actual libraries at compile time to resolve class strings
 */

import type { NodePath } from "@babel/core";
import type * as BabelTypes from "@babel/types";
import { cva, cx } from "class-variance-authority";
import { twJoin, twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";
import type { CustomTheme } from "../../parser/index.js";
import type { StyleObject } from "../../types/core.js";

/**
 * Variant function registry entry
 */
export type VariantFunctionEntry = {
  type: "tv" | "cva";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variantFn: (...args: any[]) => string;
  config: VariantConfig;
  // Pre-computed styles for each variant combination
  // Key format: "color:primary|size:sm" -> styleKey
  precomputedStyles: Map<string, string>;
};

/**
 * Extracted variant configuration
 */
export type VariantConfig = {
  base?: string;
  variants?: Record<string, Record<string, string | string[] | null>>;
  compoundVariants?: Array<Record<string, unknown>>;
  defaultVariants?: Record<string, string | boolean>;
  // For slots (tailwind-variants only)
  slots?: Record<string, string>;
};

/**
 * Tracked class utility import info (matches state.ts)
 */
export type TrackedClassUtility = {
  type: "tv" | "cva" | "twMerge" | "twJoin" | "cx";
  originalName: string;
};

/**
 * Plugin state interface for class utility processing
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface VariantProcessingState {
  styleRegistry: Map<string, StyleObject>;
  customTheme: CustomTheme;
  stylesIdentifier: string;
  // Track variant function definitions
  variantFunctions: Map<string, VariantFunctionEntry>;
  // Unified map of all tracked class utility imports
  classUtilityImports: Map<string, TrackedClassUtility>;
}

/**
 * Extract a JavaScript value from an AST node
 * Only supports static/literal values
 */
export function extractStaticValue(node: BabelTypes.Node, t: typeof BabelTypes): unknown {
  if (t.isStringLiteral(node)) {
    return node.value;
  }
  if (t.isNumericLiteral(node)) {
    return node.value;
  }
  if (t.isBooleanLiteral(node)) {
    return node.value;
  }
  if (t.isNullLiteral(node)) {
    return null;
  }
  if (t.isArrayExpression(node)) {
    const elements: unknown[] = [];
    for (const element of node.elements) {
      if (element === null) {
        elements.push(null);
      } else if (t.isSpreadElement(element)) {
        // Can't handle spread at compile time
        return undefined;
      } else {
        const value = extractStaticValue(element, t);
        if (value === undefined) return undefined;
        elements.push(value);
      }
    }
    return elements;
  }
  if (t.isObjectExpression(node)) {
    const obj: Record<string, unknown> = {};
    for (const prop of node.properties) {
      if (t.isSpreadElement(prop)) {
        // Can't handle spread at compile time
        return undefined;
      }
      if (t.isObjectProperty(prop)) {
        let key: string;
        if (t.isIdentifier(prop.key)) {
          key = prop.key.name;
        } else if (t.isStringLiteral(prop.key)) {
          key = prop.key.value;
        } else {
          // Computed key - can't handle at compile time
          return undefined;
        }
        const value = extractStaticValue(prop.value, t);
        if (value === undefined) return undefined;
        obj[key] = value;
      }
    }
    return obj;
  }
  // Unsupported node type - return undefined to signal dynamic value
  return undefined;
}

/**
 * Extract variant config from a tv() call
 */
export function extractTvConfig(
  args: BabelTypes.CallExpression["arguments"],
  t: typeof BabelTypes,
): VariantConfig | null {
  if (args.length === 0) return null;

  const configArg = args[0];
  if (!t.isObjectExpression(configArg)) return null;

  const config = extractStaticValue(configArg, t) as VariantConfig | undefined;
  return config ?? null;
}

/**
 * Extract variant config from a cva() call
 * cva(base, { variants, ... })
 */
export function extractCvaConfig(
  args: BabelTypes.CallExpression["arguments"],
  t: typeof BabelTypes,
): VariantConfig | null {
  if (args.length === 0) return null;

  // First arg is base classes
  const baseArg = args[0];
  const base = extractStaticValue(baseArg, t);
  if (base === undefined) return null;

  const config: VariantConfig = {
    base: Array.isArray(base) ? (base as string[]).join(" ") : typeof base === "string" ? base : "",
  };

  // Second arg is optional config object
  if (args.length > 1 && t.isObjectExpression(args[1])) {
    const configObj = extractStaticValue(args[1], t) as Partial<VariantConfig> | undefined;
    if (configObj) {
      Object.assign(config, configObj);
    }
  }

  return config;
}

/**
 * Generate all possible variant combinations
 * Returns array of objects like { color: 'primary', size: 'sm' }
 */
export function generateVariantCombinations(
  variants: Record<string, Record<string, unknown>> | undefined,
): Array<Record<string, string | boolean>> {
  if (!variants || Object.keys(variants).length === 0) {
    return [{}];
  }

  // Create local reference to satisfy TypeScript in nested function
  const variantsMap = variants;
  const variantNames = Object.keys(variantsMap);
  const combinations: Array<Record<string, string | boolean>> = [];

  function generate(index: number, current: Record<string, string | boolean>): void {
    if (index === variantNames.length) {
      combinations.push({ ...current });
      return;
    }

    const variantName = variantNames[index];
    const options = Object.keys(variantsMap[variantName]);

    for (const option of options) {
      // Convert "true"/"false" strings to booleans for boolean variants
      const value = option === "true" ? true : option === "false" ? false : option;
      current[variantName] = value;
      generate(index + 1, current);
    }
  }

  generate(0, {});
  return combinations;
}

/**
 * Create a unique key for a variant combination
 */
export function createVariantKey(props: Record<string, string | boolean>): string {
  const sortedEntries = Object.entries(props).sort(([a], [b]) => a.localeCompare(b));
  return sortedEntries.map(([k, v]) => `${k}:${String(v)}`).join("|");
}

/**
 * Create a style key from variant function name and props
 */
export function createVariantStyleKey(variantName: string, props: Record<string, string | boolean>): string {
  const propsKey = createVariantKey(props);
  // Make a valid JS identifier
  const sanitized = `${variantName}_${propsKey}`.replace(/[:|]/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
  return `_${sanitized}`;
}

/**
 * Process a tv() or cva() variable declaration
 * Creates the variant function and pre-computes all style combinations
 */
export function processVariantDefinition(
  variableName: string,
  type: "tv" | "cva",
  config: VariantConfig,
  state: VariantProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  _generateStyleKey: (className: string) => string,
): void {
  // Create the actual variant function using the real library
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let variantFn: (...args: any[]) => string;

  if (type === "tv") {
    // Handle slots case - not fully supported yet
    if (config.slots) {
      // For slots, we'd need more complex handling
      // For now, skip pre-computation for slotted variants
      console.warn(
        `[react-native-tailwind] Slots in tv() are not yet fully supported for compile-time transformation. ` +
          `Consider using compound variants instead.`,
      );
      return;
    }

    const tvConfig = {
      base: config.base,
      variants: config.variants,
      compoundVariants: config.compoundVariants,
      defaultVariants: config.defaultVariants,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    variantFn = tv(tvConfig as any) as (...args: any[]) => string;
  } else {
    // CVA
    const cvaConfig = {
      variants: config.variants,
      compoundVariants: config.compoundVariants,
      defaultVariants: config.defaultVariants,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    variantFn = cva(config.base ?? "", cvaConfig as any) as (...args: any[]) => string;
  }

  // Pre-compute styles for all variant combinations
  const precomputedStyles = new Map<string, string>();
  const combinations = generateVariantCombinations(config.variants);

  for (const props of combinations) {
    // Call the variant function to get the class string
    const className = variantFn(props);
    if (className) {
      // Parse to RN style
      const styleObject = parseClassName(className, state.customTheme);
      const styleKey = createVariantStyleKey(variableName, props);

      // Register the style
      state.styleRegistry.set(styleKey, styleObject);

      // Store the mapping
      const propsKey = createVariantKey(props);
      precomputedStyles.set(propsKey, styleKey);
    }
  }

  // Also compute the default case (no props or empty props)
  const defaultClassName = variantFn({});
  if (defaultClassName) {
    const defaultStyleObject = parseClassName(defaultClassName, state.customTheme);
    const defaultStyleKey = createVariantStyleKey(variableName, {});
    state.styleRegistry.set(defaultStyleKey, defaultStyleObject);
    precomputedStyles.set("", defaultStyleKey);
  }

  // Register the variant function
  state.variantFunctions.set(variableName, {
    type,
    variantFn,
    config,
    precomputedStyles,
  });
}

/**
 * Process a variant function call site
 * e.g., button({ color: 'primary' }) or className={button({ color: 'primary' })}
 */
export function processVariantCallSite(
  path: NodePath<BabelTypes.CallExpression>,
  variableName: string,
  entry: VariantFunctionEntry,
  state: VariantProcessingState,
  t: typeof BabelTypes,
): boolean {
  const args = path.node.arguments;

  // Extract props from the call
  let props: Record<string, string | boolean> | null = null;

  if (args.length === 0) {
    // No args - use defaults
    props = {};
  } else if (args.length === 1 && t.isObjectExpression(args[0])) {
    // Static props object
    const extracted = extractStaticValue(args[0], t) as Record<string, unknown> | undefined;
    if (extracted) {
      // Filter to only variant props (not class/className)
      props = {};
      for (const [key, value] of Object.entries(extracted)) {
        if (key !== "class" && key !== "className") {
          props[key] = value as string | boolean;
        }
      }
    }
  }

  if (props === null) {
    // Dynamic props - can't resolve at compile time
    // TODO: Generate runtime conditional expressions
    return false;
  }

  // Look up the pre-computed style
  const propsKey = createVariantKey(props);
  const styleKey = entry.precomputedStyles.get(propsKey);

  if (!styleKey) {
    // This combination wasn't pre-computed (shouldn't happen if we enumerated all)
    // Fall back to computing it now
    const className = entry.variantFn(props);
    if (!className) return false;

    // We'd need parseClassName here, but we don't have it in this context
    // For now, return false to skip transformation
    return false;
  }

  // Replace the call with a style reference
  // e.g., button({ color: 'primary' }) -> _twStyles._button_color_primary
  path.replaceWith(t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(styleKey)));

  return true;
}

/**
 * Generate runtime conditional for dynamic variant props
 * This creates code like:
 * [
 *   styles._button_base,
 *   color === 'primary' && styles._button_color_primary,
 *   color === 'secondary' && styles._button_color_secondary,
 *   size === 'sm' && styles._button_size_sm,
 *   size === 'lg' && styles._button_size_lg,
 * ]
 */
export function generateDynamicVariantExpression(
  variableName: string,
  entry: VariantFunctionEntry,
  propsExpression: BabelTypes.ObjectExpression,
  state: VariantProcessingState,
  t: typeof BabelTypes,
): BabelTypes.ArrayExpression | null {
  const { config, precomputedStyles } = entry;
  const variants = config.variants;

  if (!variants) {
    // No variants - just return base style
    const baseStyleKey = precomputedStyles.get("");
    if (baseStyleKey) {
      return t.arrayExpression([
        t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(baseStyleKey)),
      ]);
    }
    return null;
  }

  const elements: BabelTypes.Expression[] = [];

  // Add base style (default with no variant-specific props)
  const baseStyleKey = precomputedStyles.get("");
  if (baseStyleKey) {
    elements.push(t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(baseStyleKey)));
  }

  // Extract prop expressions from the call
  const propExpressions = new Map<string, BabelTypes.Expression>();
  for (const prop of propsExpression.properties) {
    if (t.isObjectProperty(prop)) {
      let key: string | null = null;
      if (t.isIdentifier(prop.key)) {
        key = prop.key.name;
      } else if (t.isStringLiteral(prop.key)) {
        key = prop.key.value;
      }
      if (key && key !== "class" && key !== "className" && t.isExpression(prop.value)) {
        propExpressions.set(key, prop.value);
      }
    }
  }

  // Generate conditionals for each variant
  for (const [variantName, variantOptions] of Object.entries(variants)) {
    const propExpr = propExpressions.get(variantName);
    if (!propExpr) {
      // This variant prop wasn't provided - use default if available
      const defaultValue = config.defaultVariants?.[variantName];
      if (defaultValue !== undefined) {
        // Add the default style unconditionally
        const props = { [variantName]: defaultValue };
        const propsKey = createVariantKey(props as Record<string, string | boolean>);
        const styleKey = precomputedStyles.get(propsKey);
        if (styleKey) {
          elements.push(t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(styleKey)));
        }
      }
      continue;
    }

    // Generate conditional for each option
    for (const optionKey of Object.keys(variantOptions)) {
      const props = { [variantName]: optionKey === "true" ? true : optionKey === "false" ? false : optionKey };
      const propsKey = createVariantKey(props as Record<string, string | boolean>);
      const styleKey = precomputedStyles.get(propsKey);

      if (styleKey) {
        // Generate: propExpr === 'optionKey' && styles._styleKey
        let condition: BabelTypes.Expression;
        if (optionKey === "true") {
          condition = propExpr;
        } else if (optionKey === "false") {
          condition = t.unaryExpression("!", propExpr);
        } else {
          condition = t.binaryExpression("===", propExpr, t.stringLiteral(optionKey));
        }

        elements.push(
          t.logicalExpression(
            "&&",
            condition,
            t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(styleKey)),
          ),
        );
      }
    }
  }

  return t.arrayExpression(elements);
}

/**
 * Class joiner functions mapped by utility type
 * - twMerge: Merges with conflict resolution (later classes win)
 * - twJoin: Simple join without conflict resolution (faster)
 * - cx: Alias for clsx, simple concatenation
 */
const CLASS_JOINERS: Record<"twMerge" | "twJoin" | "cx", (...classes: string[]) => string> = {
  twMerge: (...classes) => twMerge(...classes),
  twJoin: (...classes) => twJoin(...classes),
  cx: (...classes) => cx(...classes),
};

/**
 * Process a class joiner call site (twMerge, twJoin, cx)
 * e.g., twMerge('px-2 py-1', 'p-4') -> _twStyles._merged_abc123
 *
 * Returns true if successful, false if dynamic/can't resolve
 */
export function processClassJoinerCall(
  path: NodePath<BabelTypes.CallExpression>,
  utilityType: "twMerge" | "twJoin" | "cx",
  state: VariantProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  generateStyleKey: (className: string) => string,
  t: typeof BabelTypes,
): boolean {
  const args = path.node.arguments;

  // Extract all string arguments
  const classStrings: string[] = [];

  for (const arg of args) {
    if (t.isStringLiteral(arg)) {
      classStrings.push(arg.value);
    } else if (t.isTemplateLiteral(arg) && arg.expressions.length === 0) {
      // Static template literal with no expressions
      classStrings.push(arg.quasis.map((q) => q.value.cooked ?? q.value.raw).join(""));
    } else {
      // Dynamic argument - can't resolve at compile time
      return false;
    }
  }

  if (classStrings.length === 0) {
    return false;
  }

  // Use the appropriate joiner function at compile time
  const joiner = CLASS_JOINERS[utilityType];
  const mergedClasses = joiner(...classStrings);

  if (!mergedClasses) {
    return false;
  }

  // Parse to RN style
  const styleObject = parseClassName(mergedClasses, state.customTheme);
  const styleKey = generateStyleKey(mergedClasses);

  // Register the style
  state.styleRegistry.set(styleKey, styleObject);

  // Replace the call with a style reference
  path.replaceWith(t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(styleKey)));

  return true;
}

// Backward compatibility alias
export const processTwMergeCall = (
  path: NodePath<BabelTypes.CallExpression>,
  state: VariantProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  generateStyleKey: (className: string) => string,
  t: typeof BabelTypes,
): boolean => processClassJoinerCall(path, "twMerge", state, parseClassName, generateStyleKey, t);
