/**
 * Utility functions for processing dynamic className expressions
 */

import type { NodePath } from "@babel/core";
import type * as BabelTypes from "@babel/types";

import type { CustomTheme, ParsedModifier } from "../../parser/index.js";
import type { SchemeModifierConfig } from "../../types/config.js";
import type { StyleObject } from "../../types/core.js";
import { injectColorSchemeHook } from "./styleInjection.js";

/**
 * Plugin state interface (subset needed for dynamic processing)
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface DynamicProcessingState {
  styleRegistry: Map<string, StyleObject>;
  customTheme: CustomTheme;
  schemeModifierConfig: SchemeModifierConfig;
  stylesIdentifier: string;
  needsPlatformImport: boolean;
  needsColorSchemeImport: boolean;
  colorSchemeVariableName: string;
  colorSchemeHookName: string;
  colorSchemeLocalIdentifier?: string;
  functionComponentsNeedingColorScheme: Set<NodePath<BabelTypes.Function>>;
}

/**
 * Type for the splitModifierClasses function
 */
export type SplitModifierClassesFn = (className: string) => {
  baseClasses: string[];
  modifierClasses: ParsedModifier[];
};

/**
 * Type for the processPlatformModifiers function
 */
export type ProcessPlatformModifiersFn = (
  modifiers: ParsedModifier[],
  state: DynamicProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  generateStyleKey: (className: string) => string,
  t: typeof BabelTypes,
) => BabelTypes.Expression;

/**
 * Type for the processColorSchemeModifiers function
 */
export type ProcessColorSchemeModifiersFn = (
  modifiers: ParsedModifier[],
  state: DynamicProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  generateStyleKey: (className: string) => string,
  t: typeof BabelTypes,
) => BabelTypes.Expression[];

/**
 * Type for modifier type guard functions
 */
export type ModifierTypeGuardFn = (modifier: unknown) => boolean;

/**
 * Type for the expandSchemeModifier function
 */
export type ExpandSchemeModifierFn = (
  modifier: ParsedModifier,
  customColors: Record<string, string>,
  darkSuffix: string,
  lightSuffix: string,
) => ParsedModifier[];

/**
 * Result of processing a dynamic expression
 */
export type DynamicExpressionResult = {
  // The transformed expression to use in the style prop
  expression: BabelTypes.Expression;
  // Static parts that can be parsed at compile time (if any)
  staticParts?: string[];
};

/**
 * Process a dynamic className expression
 * Extracts static strings and transforms the expression to use pre-compiled styles
 */
export function processDynamicExpression(
  expression: BabelTypes.Expression,
  state: DynamicProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  generateStyleKey: (className: string) => string,
  splitModifierClasses: SplitModifierClassesFn,
  processPlatformModifiers: ProcessPlatformModifiersFn,
  processColorSchemeModifiers: ProcessColorSchemeModifiersFn,
  componentScope: NodePath<BabelTypes.Function> | null,
  isPlatformModifier: ModifierTypeGuardFn,
  isColorSchemeModifier: ModifierTypeGuardFn,
  isSchemeModifier: ModifierTypeGuardFn,
  expandSchemeModifier: ExpandSchemeModifierFn,
  t: typeof BabelTypes,
) {
  // Handle template literals: `m-4 ${condition ? "p-4" : "p-2"}`
  if (t.isTemplateLiteral(expression)) {
    return processTemplateLiteral(
      expression,
      state,
      parseClassName,
      generateStyleKey,
      splitModifierClasses,
      processPlatformModifiers,
      processColorSchemeModifiers,
      componentScope,
      isPlatformModifier,
      isColorSchemeModifier,
      isSchemeModifier,
      expandSchemeModifier,
      t,
    );
  }

  // Handle conditional expressions: condition ? "m-4" : "p-2"
  if (t.isConditionalExpression(expression)) {
    return processConditionalExpression(
      expression,
      state,
      parseClassName,
      generateStyleKey,
      splitModifierClasses,
      processPlatformModifiers,
      processColorSchemeModifiers,
      componentScope,
      isPlatformModifier,
      isColorSchemeModifier,
      isSchemeModifier,
      expandSchemeModifier,
      t,
    );
  }

  // Handle logical expressions: condition && "m-4"
  if (t.isLogicalExpression(expression)) {
    return processLogicalExpression(
      expression,
      state,
      parseClassName,
      generateStyleKey,
      splitModifierClasses,
      processPlatformModifiers,
      processColorSchemeModifiers,
      componentScope,
      isPlatformModifier,
      isColorSchemeModifier,
      isSchemeModifier,
      expandSchemeModifier,
      t,
    );
  }

  // Unsupported expression type
  return null;
}

/**
 * Process template literal: `static ${dynamic} more-static`
 */
function processTemplateLiteral(
  node: BabelTypes.TemplateLiteral,
  state: DynamicProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  generateStyleKey: (className: string) => string,
  splitModifierClasses: SplitModifierClassesFn,
  processPlatformModifiers: ProcessPlatformModifiersFn,
  processColorSchemeModifiers: ProcessColorSchemeModifiersFn,
  componentScope: NodePath<BabelTypes.Function> | null,
  isPlatformModifier: ModifierTypeGuardFn,
  isColorSchemeModifier: ModifierTypeGuardFn,
  isSchemeModifier: ModifierTypeGuardFn,
  expandSchemeModifier: ExpandSchemeModifierFn,
  t: typeof BabelTypes,
) {
  const parts: BabelTypes.Expression[] = [];
  const staticParts: string[] = [];

  // Process quasis (static parts) and expressions (dynamic parts)
  for (let i = 0; i < node.quasis.length; i++) {
    const quasi = node.quasis[i];
    const staticText = quasi.value.cooked?.trim();

    // Add static part if not empty
    if (staticText) {
      // Parse static classes with modifier support
      const processedExpression = processStringOrExpressionHelper(
        t.stringLiteral(staticText),
        state,
        parseClassName,
        generateStyleKey,
        splitModifierClasses,
        processPlatformModifiers,
        processColorSchemeModifiers,
        componentScope,
        isPlatformModifier,
        isColorSchemeModifier,
        isSchemeModifier,
        expandSchemeModifier,
        t,
      );

      if (processedExpression) {
        staticParts.push(staticText);
        // Handle array or single expression
        if (t.isArrayExpression(processedExpression)) {
          parts.push(...(processedExpression.elements as BabelTypes.Expression[]));
        } else {
          parts.push(processedExpression);
        }
      }
    }

    // Add dynamic expression if exists
    if (i < node.expressions.length) {
      const expr = node.expressions[i];

      // Recursively process nested dynamic expressions
      const result = processDynamicExpression(
        expr as BabelTypes.Expression,
        state,
        parseClassName,
        generateStyleKey,
        splitModifierClasses,
        processPlatformModifiers,
        processColorSchemeModifiers,
        componentScope,
        isPlatformModifier,
        isColorSchemeModifier,
        isSchemeModifier,
        expandSchemeModifier,
        t,
      );
      if (result) {
        parts.push(result.expression);
      } else {
        // For unsupported expressions, keep them as-is
        parts.push(expr as BabelTypes.Expression);
      }
    }
  }

  if (parts.length === 0) {
    return null;
  }

  // If single part, return it directly; otherwise return array
  const expression = parts.length === 1 ? parts[0] : t.arrayExpression(parts);

  return {
    expression,
    staticParts: staticParts.length > 0 ? staticParts : undefined,
  };
}

/**
 * Process conditional expression: condition ? "class-a" : "class-b"
 */
function processConditionalExpression(
  node: BabelTypes.ConditionalExpression,
  state: DynamicProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  generateStyleKey: (className: string) => string,
  splitModifierClasses: SplitModifierClassesFn,
  processPlatformModifiers: ProcessPlatformModifiersFn,
  processColorSchemeModifiers: ProcessColorSchemeModifiersFn,
  componentScope: NodePath<BabelTypes.Function> | null,
  isPlatformModifier: ModifierTypeGuardFn,
  isColorSchemeModifier: ModifierTypeGuardFn,
  isSchemeModifier: ModifierTypeGuardFn,
  expandSchemeModifier: ExpandSchemeModifierFn,
  t: typeof BabelTypes,
) {
  const consequent = processStringOrExpressionHelper(
    node.consequent,
    state,
    parseClassName,
    generateStyleKey,
    splitModifierClasses,
    processPlatformModifiers,
    processColorSchemeModifiers,
    componentScope,
    isPlatformModifier,
    isColorSchemeModifier,
    isSchemeModifier,
    expandSchemeModifier,
    t,
  );
  const alternate = processStringOrExpressionHelper(
    node.alternate,
    state,
    parseClassName,
    generateStyleKey,
    splitModifierClasses,
    processPlatformModifiers,
    processColorSchemeModifiers,
    componentScope,
    isPlatformModifier,
    isColorSchemeModifier,
    isSchemeModifier,
    expandSchemeModifier,
    t,
  );

  if (!consequent && !alternate) {
    return null;
  }

  // Build conditional: condition ? consequentStyle : alternateStyle
  const expression = t.conditionalExpression(
    node.test,
    consequent ?? t.nullLiteral(),
    alternate ?? t.nullLiteral(),
  );

  return { expression };
}

/**
 * Process logical expression: condition && "class-a"
 */
function processLogicalExpression(
  node: BabelTypes.LogicalExpression,
  state: DynamicProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  generateStyleKey: (className: string) => string,
  splitModifierClasses: SplitModifierClassesFn,
  processPlatformModifiers: ProcessPlatformModifiersFn,
  processColorSchemeModifiers: ProcessColorSchemeModifiersFn,
  componentScope: NodePath<BabelTypes.Function> | null,
  isPlatformModifier: ModifierTypeGuardFn,
  isColorSchemeModifier: ModifierTypeGuardFn,
  isSchemeModifier: ModifierTypeGuardFn,
  expandSchemeModifier: ExpandSchemeModifierFn,
  t: typeof BabelTypes,
) {
  // Only handle AND (&&) expressions
  if (node.operator !== "&&") {
    return null;
  }

  const right = processStringOrExpressionHelper(
    node.right,
    state,
    parseClassName,
    generateStyleKey,
    splitModifierClasses,
    processPlatformModifiers,
    processColorSchemeModifiers,
    componentScope,
    isPlatformModifier,
    isColorSchemeModifier,
    isSchemeModifier,
    expandSchemeModifier,
    t,
  );

  if (!right) {
    return null;
  }

  // Build logical: condition && style
  const expression = t.logicalExpression("&&", node.left, right);

  return { expression };
}

/**
 * Process a node that might be a string literal or another expression
 *
 * This helper is called by processStringOrExpression below
 */
function processStringOrExpressionHelper(
  node: BabelTypes.StringLiteral | BabelTypes.Expression,
  state: DynamicProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  generateStyleKey: (className: string) => string,
  splitModifierClasses: SplitModifierClassesFn,
  processPlatformModifiers: ProcessPlatformModifiersFn,
  processColorSchemeModifiers: ProcessColorSchemeModifiersFn,
  componentScope: NodePath<BabelTypes.Function> | null,
  isPlatformModifier: ModifierTypeGuardFn,
  isColorSchemeModifier: ModifierTypeGuardFn,
  isSchemeModifier: ModifierTypeGuardFn,
  expandSchemeModifier: ExpandSchemeModifierFn,
  t: typeof BabelTypes,
): BabelTypes.Expression | BabelTypes.ArrayExpression | null {
  // Handle string literals
  if (t.isStringLiteral(node)) {
    const className = node.value.trim();
    if (!className) {
      return null;
    }

    // Split into base and modifier classes
    const { baseClasses, modifierClasses: rawModifierClasses } = splitModifierClasses(className);

    // Expand scheme: modifiers into dark: and light: modifiers
    const modifierClasses: Array<import("../../parser/index.js").ParsedModifier> = [];
    for (const modifier of rawModifierClasses) {
      if (isSchemeModifier(modifier.modifier)) {
        // Expand scheme: into dark: and light:
        const expanded = expandSchemeModifier(
          modifier,
          state.customTheme.colors ?? {},
          state.schemeModifierConfig.darkSuffix ?? "-dark",
          state.schemeModifierConfig.lightSuffix ?? "-light",
        );
        modifierClasses.push(...expanded);
      } else {
        // Keep other modifiers as-is
        modifierClasses.push(modifier);
      }
    }

    // Separate modifiers by type
    const platformModifiers = modifierClasses.filter((m) => isPlatformModifier(m.modifier));
    const colorSchemeModifiers = modifierClasses.filter((m) => isColorSchemeModifier(m.modifier));

    const styleElements: BabelTypes.Expression[] = [];

    // Process base classes
    if (baseClasses.length > 0) {
      const baseClassName = baseClasses.join(" ");
      const styleObject = parseClassName(baseClassName, state.customTheme);
      const styleKey = generateStyleKey(baseClassName);
      state.styleRegistry.set(styleKey, styleObject);
      styleElements.push(t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(styleKey)));
    }

    // Process platform modifiers
    if (platformModifiers.length > 0) {
      state.needsPlatformImport = true;
      const platformExpression = processPlatformModifiers(
        platformModifiers,
        state,
        parseClassName,
        generateStyleKey,
        t,
      );
      styleElements.push(platformExpression);
    }

    // Process color scheme modifiers (only if component scope exists)
    if (colorSchemeModifiers.length > 0) {
      if (componentScope) {
        state.needsColorSchemeImport = true;
        state.functionComponentsNeedingColorScheme.add(componentScope);
        // Inject hook immediately for React Compiler compatibility
        injectColorSchemeHook(
          componentScope,
          state.colorSchemeVariableName,
          state.colorSchemeHookName,
          state.colorSchemeLocalIdentifier,
          t,
        );
        const colorSchemeExpressions = processColorSchemeModifiers(
          colorSchemeModifiers,
          state,
          parseClassName,
          generateStyleKey,
          t,
        );
        styleElements.push(...colorSchemeExpressions);
      } else {
        // Warn in development: color scheme modifiers without valid component scope
        // Skip transformation - these modifiers will be ignored
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[react-native-tailwind] dark:/light: modifiers in dynamic expressions require a function component scope. " +
              "These modifiers will be ignored.",
          );
        }
      }
    }

    // Return single element or array
    if (styleElements.length === 0) {
      return null;
    }
    if (styleElements.length === 1) {
      return styleElements[0];
    }
    return t.arrayExpression(styleElements);
  }

  // Handle nested expressions recursively
  if (t.isConditionalExpression(node)) {
    const result = processConditionalExpression(
      node,
      state,
      parseClassName,
      generateStyleKey,
      splitModifierClasses,
      processPlatformModifiers,
      processColorSchemeModifiers,
      componentScope,
      isPlatformModifier,
      isColorSchemeModifier,
      isSchemeModifier,
      expandSchemeModifier,
      t,
    );
    return result?.expression ?? null;
  }

  if (t.isLogicalExpression(node)) {
    const result = processLogicalExpression(
      node,
      state,
      parseClassName,
      generateStyleKey,
      splitModifierClasses,
      processPlatformModifiers,
      processColorSchemeModifiers,
      componentScope,
      isPlatformModifier,
      isColorSchemeModifier,
      isSchemeModifier,
      expandSchemeModifier,
      t,
    );
    return result?.expression ?? null;
  }

  if (t.isTemplateLiteral(node)) {
    const result = processTemplateLiteral(
      node,
      state,
      parseClassName,
      generateStyleKey,
      splitModifierClasses,
      processPlatformModifiers,
      processColorSchemeModifiers,
      componentScope,
      isPlatformModifier,
      isColorSchemeModifier,
      isSchemeModifier,
      expandSchemeModifier,
      t,
    );
    return result?.expression ?? null;
  }

  // Unsupported - return null
  return null;
}
