/**
 * Utility functions for injecting StyleSheet imports and style definitions
 */

import type { NodePath } from "@babel/core";
import type * as BabelTypes from "@babel/types";

import type { StyleObject } from "../../types/core.js";

/**
 * Add StyleSheet import to the file or merge with existing react-native import
 */
export function addStyleSheetImport(path: NodePath<BabelTypes.Program>, t: typeof BabelTypes): void {
  // Check if there's already a value import from react-native
  const body = path.node.body;
  let existingValueImport: BabelTypes.ImportDeclaration | null = null;

  for (const statement of body) {
    if (t.isImportDeclaration(statement) && statement.source.value === "react-native") {
      // Skip type-only imports (they get erased at runtime)
      if (statement.importKind === "type") {
        continue;
      }
      // Skip namespace imports (import * as RN) - can't add named specifiers to them
      const hasNamespaceImport = statement.specifiers.some((spec) => t.isImportNamespaceSpecifier(spec));
      if (hasNamespaceImport) {
        continue;
      }
      existingValueImport = statement;
      break; // Found a value import, we can stop
    }
  }

  if (existingValueImport) {
    // Check if StyleSheet is already imported
    const hasStyleSheet = existingValueImport.specifiers.some(
      (spec) =>
        t.isImportSpecifier(spec) &&
        spec.imported.type === "Identifier" &&
        spec.imported.name === "StyleSheet",
    );

    if (!hasStyleSheet) {
      // Add StyleSheet to existing value import
      existingValueImport.specifiers.push(
        t.importSpecifier(t.identifier("StyleSheet"), t.identifier("StyleSheet")),
      );
    }
  } else {
    // No value import exists - create a new one
    // (Don't merge with type-only or namespace imports)
    const importDeclaration = t.importDeclaration(
      [t.importSpecifier(t.identifier("StyleSheet"), t.identifier("StyleSheet"))],
      t.stringLiteral("react-native"),
    );
    path.unshiftContainer("body", importDeclaration);
  }
}

/**
 * Add Platform import to the file or merge with existing react-native import
 */
export function addPlatformImport(path: NodePath<BabelTypes.Program>, t: typeof BabelTypes): void {
  // Check if there's already a value import from react-native
  const body = path.node.body;
  let existingValueImport: BabelTypes.ImportDeclaration | null = null;

  for (const statement of body) {
    if (t.isImportDeclaration(statement) && statement.source.value === "react-native") {
      // Skip type-only imports (they get erased at runtime)
      if (statement.importKind === "type") {
        continue;
      }
      // Skip namespace imports (import * as RN) - can't add named specifiers to them
      const hasNamespaceImport = statement.specifiers.some((spec) => t.isImportNamespaceSpecifier(spec));
      if (hasNamespaceImport) {
        continue;
      }
      existingValueImport = statement;
      break; // Found a value import, we can stop
    }
  }

  if (existingValueImport) {
    // Check if Platform is already imported
    const hasPlatform = existingValueImport.specifiers.some(
      (spec) =>
        t.isImportSpecifier(spec) && spec.imported.type === "Identifier" && spec.imported.name === "Platform",
    );

    if (!hasPlatform) {
      // Add Platform to existing value import
      existingValueImport.specifiers.push(
        t.importSpecifier(t.identifier("Platform"), t.identifier("Platform")),
      );
    }
  } else {
    // No value import exists - create a new one
    // (Don't merge with type-only or namespace imports)
    const importDeclaration = t.importDeclaration(
      [t.importSpecifier(t.identifier("Platform"), t.identifier("Platform"))],
      t.stringLiteral("react-native"),
    );
    path.unshiftContainer("body", importDeclaration);
  }
}

/**
 * Add useColorScheme import to the file or merge with existing react-native import
 */
export function addColorSchemeImport(
  path: NodePath<BabelTypes.Program>,
  importSource: string,
  hookName: string,
  t: typeof BabelTypes,
): void {
  // Check if there's already an import from the specified source
  const body = path.node.body;
  let existingValueImport: BabelTypes.ImportDeclaration | null = null;

  for (const statement of body) {
    if (t.isImportDeclaration(statement) && statement.source.value === importSource) {
      // Only consider value imports (not type-only imports which get erased)
      if (statement.importKind !== "type") {
        existingValueImport = statement;
        break; // Found a value import, we can stop
      }
    }
  }

  // If we found a value import (not type-only), merge with it
  if (existingValueImport) {
    // Check if the hook is already imported
    const hasHook = existingValueImport.specifiers.some(
      (spec) =>
        t.isImportSpecifier(spec) && spec.imported.type === "Identifier" && spec.imported.name === hookName,
    );

    if (!hasHook) {
      // Add hook to existing value import
      existingValueImport.specifiers.push(t.importSpecifier(t.identifier(hookName), t.identifier(hookName)));
    }
  } else {
    // No value import exists - create a new one
    // (Don't merge with type-only imports as they get erased by Babel/TypeScript)
    const importDeclaration = t.importDeclaration(
      [t.importSpecifier(t.identifier(hookName), t.identifier(hookName))],
      t.stringLiteral(importSource),
    );
    path.unshiftContainer("body", importDeclaration);
  }
}

/**
 * Inject color scheme hook call at the top of a function component
 *
 * @param functionPath - Path to the function component
 * @param colorSchemeVariableName - Name for the color scheme variable
 * @param hookName - Name of the hook to call (e.g., 'useColorScheme')
 * @param localIdentifier - Local identifier if hook is already imported with an alias
 * @param t - Babel types
 * @returns true if hook was injected, false if already exists
 */
export function injectColorSchemeHook(
  functionPath: NodePath<BabelTypes.Function>,
  colorSchemeVariableName: string,
  hookName: string,
  localIdentifier: string | undefined,
  t: typeof BabelTypes,
): boolean {
  let body = functionPath.node.body;

  // Handle concise arrow functions: () => <JSX />
  // Convert to block statement: () => { const _twColorScheme = useColorScheme(); return <JSX />; }
  if (!t.isBlockStatement(body)) {
    if (t.isArrowFunctionExpression(functionPath.node) && t.isExpression(body)) {
      // Convert concise body to block statement with return
      const returnStatement = t.returnStatement(body);
      const blockStatement = t.blockStatement([returnStatement]);
      functionPath.node.body = blockStatement;
      body = blockStatement;
    } else {
      // Other non-block functions (shouldn't happen for components, but be safe)
      return false;
    }
  }

  // Check if hook is already injected
  const hasHook = body.body.some((statement) => {
    if (
      t.isVariableDeclaration(statement) &&
      statement.declarations.length > 0 &&
      t.isVariableDeclarator(statement.declarations[0])
    ) {
      const declarator = statement.declarations[0];
      return t.isIdentifier(declarator.id) && declarator.id.name === colorSchemeVariableName;
    }
    return false;
  });

  if (hasHook) {
    return false; // Already injected
  }

  // Use the local identifier if hook was already imported with an alias,
  // otherwise use the configured hook name
  // e.g., import { useTheme as navTheme } → call navTheme()
  const identifierToCall = localIdentifier ?? hookName;

  // Create: const _twColorScheme = useColorScheme(); (or aliased name if already imported)
  const hookCall = t.variableDeclaration("const", [
    t.variableDeclarator(
      t.identifier(colorSchemeVariableName),
      t.callExpression(t.identifier(identifierToCall), []),
    ),
  ]);

  // Insert at the beginning of function body using the path API
  // so Babel's scope system properly tracks the new binding.
  // This is critical for React Compiler compatibility - without proper
  // scope registration, React Compiler won't recognize the hook return
  // value as reactive and will incorrectly memoize expressions using it.
  const bodyPath = functionPath.get("body");
  if (Array.isArray(bodyPath) || !bodyPath.isBlockStatement()) {
    // Fallback for unexpected path shapes
    body.body.unshift(hookCall);
  } else {
    bodyPath.unshiftContainer("body", hookCall);
  }

  return true;
}

/**
 * Add I18nManager import to the file or merge with existing react-native import
 */
export function addI18nManagerImport(path: NodePath<BabelTypes.Program>, t: typeof BabelTypes): void {
  // Check if there's already a value import from react-native
  const body = path.node.body;
  let existingValueImport: BabelTypes.ImportDeclaration | null = null;

  for (const statement of body) {
    if (t.isImportDeclaration(statement) && statement.source.value === "react-native") {
      // Skip type-only imports (they get erased at runtime)
      if (statement.importKind === "type") {
        continue;
      }
      // Skip namespace imports (import * as RN) - can't add named specifiers to them
      const hasNamespaceImport = statement.specifiers.some((spec) => t.isImportNamespaceSpecifier(spec));
      if (hasNamespaceImport) {
        continue;
      }
      existingValueImport = statement;
      break; // Found a value import, we can stop
    }
  }

  if (existingValueImport) {
    // Check if I18nManager is already imported
    const hasI18nManager = existingValueImport.specifiers.some(
      (spec) =>
        t.isImportSpecifier(spec) &&
        spec.imported.type === "Identifier" &&
        spec.imported.name === "I18nManager",
    );

    if (!hasI18nManager) {
      // Add I18nManager to existing value import
      existingValueImport.specifiers.push(
        t.importSpecifier(t.identifier("I18nManager"), t.identifier("I18nManager")),
      );
    }
  } else {
    // No value import exists - create a new one
    // (Don't merge with type-only or namespace imports)
    const importDeclaration = t.importDeclaration(
      [t.importSpecifier(t.identifier("I18nManager"), t.identifier("I18nManager"))],
      t.stringLiteral("react-native"),
    );
    path.unshiftContainer("body", importDeclaration);
  }
}

/**
 * Inject I18nManager.isRTL variable at the top of the file (after imports and directives)
 *
 * Unlike hooks (useColorScheme, useWindowDimensions), I18nManager.isRTL is not a hook
 * and can be accessed at module level. This is injected once per file.
 *
 * @param path - Program path
 * @param variableName - Name for the RTL variable (e.g., '_twIsRTL')
 * @param localIdentifier - Local identifier if I18nManager is already imported with an alias
 * @param t - Babel types
 */
export function injectI18nManagerVariable(
  path: NodePath<BabelTypes.Program>,
  variableName: string,
  localIdentifier: string | undefined,
  t: typeof BabelTypes,
): void {
  const body = path.node.body;

  // Check if variable is already declared
  for (const statement of body) {
    if (
      t.isVariableDeclaration(statement) &&
      statement.declarations.length > 0 &&
      t.isVariableDeclarator(statement.declarations[0])
    ) {
      const declarator = statement.declarations[0];
      if (t.isIdentifier(declarator.id) && declarator.id.name === variableName) {
        return; // Already injected
      }
    }
  }

  // Use the local identifier if I18nManager was already imported with an alias,
  // otherwise use 'I18nManager'
  // e.g., import { I18nManager as RTL } → use RTL.isRTL
  const identifierToUse = localIdentifier ?? "I18nManager";

  // Create: const _twIsRTL = I18nManager.isRTL; (or aliased name if already imported)
  const i18nVariable = t.variableDeclaration("const", [
    t.variableDeclarator(
      t.identifier(variableName),
      t.memberExpression(t.identifier(identifierToUse), t.identifier("isRTL")),
    ),
  ]);

  // Find the index to insert after all imports and directives ('use client', 'use strict', etc.)
  let insertIndex = 0;

  for (let i = 0; i < body.length; i++) {
    const statement = body[i];

    // Skip directives ('use client', 'use strict', etc.)
    if (t.isExpressionStatement(statement) && t.isStringLiteral(statement.expression)) {
      insertIndex = i + 1;
      continue;
    }

    // Skip imports
    if (t.isImportDeclaration(statement)) {
      insertIndex = i + 1;
      continue;
    }

    // Stop at the first non-directive, non-import statement
    break;
  }

  // Insert after imports and directives
  body.splice(insertIndex, 0, i18nVariable);
}

/**
 * Add useWindowDimensions import to the file or merge with existing react-native import
 */
export function addWindowDimensionsImport(path: NodePath<BabelTypes.Program>, t: typeof BabelTypes): void {
  // Check if there's already an import from react-native
  const body = path.node.body;
  let existingValueImport: BabelTypes.ImportDeclaration | null = null;

  for (const statement of body) {
    if (t.isImportDeclaration(statement) && statement.source.value === "react-native") {
      // Only consider value imports (not type-only imports which get erased)
      if (statement.importKind !== "type") {
        existingValueImport = statement;
        break; // Found a value import, we can stop
      }
    }
  }

  // If we found a value import (not type-only), merge with it
  if (existingValueImport) {
    // Check if the hook is already imported
    const hasHook = existingValueImport.specifiers.some(
      (spec) =>
        t.isImportSpecifier(spec) &&
        spec.imported.type === "Identifier" &&
        spec.imported.name === "useWindowDimensions",
    );

    if (!hasHook) {
      // Add hook to existing value import
      existingValueImport.specifiers.push(
        t.importSpecifier(t.identifier("useWindowDimensions"), t.identifier("useWindowDimensions")),
      );
    }
  } else {
    // No value import exists - create a new one
    // (Don't merge with type-only imports as they get erased by Babel/TypeScript)
    const importDeclaration = t.importDeclaration(
      [t.importSpecifier(t.identifier("useWindowDimensions"), t.identifier("useWindowDimensions"))],
      t.stringLiteral("react-native"),
    );
    path.unshiftContainer("body", importDeclaration);
  }
}

/**
 * Inject useWindowDimensions hook call at the top of a function component
 *
 * @param functionPath - Path to the function component
 * @param dimensionsVariableName - Name for the dimensions variable
 * @param hookName - Name of the hook to call (e.g., 'useWindowDimensions')
 * @param localIdentifier - Local identifier if hook is already imported with an alias
 * @param t - Babel types
 * @returns true if hook was injected, false if already exists
 */
export function injectWindowDimensionsHook(
  functionPath: NodePath<BabelTypes.Function>,
  dimensionsVariableName: string,
  hookName: string,
  localIdentifier: string | undefined,
  t: typeof BabelTypes,
): boolean {
  let body = functionPath.node.body;

  // Handle concise arrow functions: () => <JSX />
  // Convert to block statement: () => { const _twDimensions = useWindowDimensions(); return <JSX />; }
  if (!t.isBlockStatement(body)) {
    if (t.isArrowFunctionExpression(functionPath.node) && t.isExpression(body)) {
      // Convert concise body to block statement with return
      const returnStatement = t.returnStatement(body);
      const blockStatement = t.blockStatement([returnStatement]);
      functionPath.node.body = blockStatement;
      body = blockStatement;
    } else {
      // Other non-block functions (shouldn't happen for components, but be safe)
      return false;
    }
  }

  // Check if hook is already injected
  const hasHook = body.body.some((statement) => {
    if (
      t.isVariableDeclaration(statement) &&
      statement.declarations.length > 0 &&
      t.isVariableDeclarator(statement.declarations[0])
    ) {
      const declarator = statement.declarations[0];
      return t.isIdentifier(declarator.id) && declarator.id.name === dimensionsVariableName;
    }
    return false;
  });

  if (hasHook) {
    return false; // Already injected
  }

  // Use the local identifier if hook was already imported with an alias,
  // otherwise use the configured hook name
  // e.g., import { useWindowDimensions as useDims } → call useDims()
  const identifierToCall = localIdentifier ?? hookName;

  // Create: const _twDimensions = useWindowDimensions(); (or aliased name if already imported)
  const hookCall = t.variableDeclaration("const", [
    t.variableDeclarator(
      t.identifier(dimensionsVariableName),
      t.callExpression(t.identifier(identifierToCall), []),
    ),
  ]);

  // Insert at the beginning of function body using the path API
  // so Babel's scope system properly tracks the new binding.
  // (Same approach as injectColorSchemeHook for React Compiler compatibility)
  const bodyPath = functionPath.get("body");
  if (Array.isArray(bodyPath) || !bodyPath.isBlockStatement()) {
    body.body.unshift(hookCall);
  } else {
    bodyPath.unshiftContainer("body", hookCall);
  }

  return true;
}

/**
 * Inject StyleSheet.create with all collected styles at the top of the file
 * This ensures the styles object is defined before any code that references it
 */
export function injectStylesAtTop(
  path: NodePath<BabelTypes.Program>,
  styleRegistry: Map<string, StyleObject>,
  stylesIdentifier: string,
  t: typeof BabelTypes,
): void {
  // Build style object properties
  const styleProperties: BabelTypes.ObjectProperty[] = [];

  for (const [key, styleObject] of styleRegistry) {
    const properties = Object.entries(styleObject).map(([styleProp, styleValue]) => {
      let valueNode;

      if (typeof styleValue === "number") {
        valueNode = t.numericLiteral(styleValue);
      } else if (typeof styleValue === "string") {
        valueNode = t.stringLiteral(styleValue);
      } else {
        // Fallback for other types
        valueNode = t.valueToNode(styleValue);
      }

      return t.objectProperty(t.identifier(styleProp), valueNode);
    });

    styleProperties.push(t.objectProperty(t.identifier(key), t.objectExpression(properties)));
  }

  // Create: const _twStyles = StyleSheet.create({ ... })
  const styleSheet = t.variableDeclaration("const", [
    t.variableDeclarator(
      t.identifier(stylesIdentifier),
      t.callExpression(t.memberExpression(t.identifier("StyleSheet"), t.identifier("create")), [
        t.objectExpression(styleProperties),
      ]),
    ),
  ]);

  // Find the index to insert after all imports and directives ('use client', 'use strict', etc.)
  const body = path.node.body;
  let insertIndex = 0;

  for (let i = 0; i < body.length; i++) {
    const statement = body[i];

    // Skip directives ('use client', 'use strict', etc.)
    if (t.isExpressionStatement(statement) && t.isStringLiteral(statement.expression)) {
      insertIndex = i + 1;
      continue;
    }

    // Skip imports
    if (t.isImportDeclaration(statement)) {
      insertIndex = i + 1;
      continue;
    }

    // Stop at the first non-directive, non-import statement
    break;
  }

  // Insert StyleSheet.create after imports and directives
  body.splice(insertIndex, 0, styleSheet);
}
