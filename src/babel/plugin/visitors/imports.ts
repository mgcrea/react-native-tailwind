/**
 * ImportDeclaration visitor - tracks existing imports
 */

import type { NodePath } from "@babel/core";
import type * as BabelTypes from "@babel/types";

import type { PluginState } from "../state.js";

/**
 * ImportDeclaration visitor
 * Tracks existing imports from react-native and the main package
 */
export function importDeclarationVisitor(
  path: NodePath<BabelTypes.ImportDeclaration>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  const node = path.node;

  // Track react-native StyleSheet, Platform, and I18nManager imports
  if (node.source.value === "react-native") {
    const specifiers = node.specifiers;

    const hasStyleSheet = specifiers.some((spec) => {
      if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
        return spec.imported.name === "StyleSheet";
      }
      return false;
    });

    const hasPlatform = specifiers.some((spec) => {
      if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
        return spec.imported.name === "Platform";
      }
      return false;
    });

    // Check for I18nManager import (only value imports, not type-only)
    if (node.importKind !== "type") {
      for (const spec of specifiers) {
        if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
          if (spec.imported.name === "I18nManager") {
            state.hasI18nManagerImport = true;
            // Track the local identifier (handles aliased imports)
            // e.g., import { I18nManager as RTL } → local name is 'RTL'
            state.i18nManagerLocalIdentifier = spec.local.name;
            break;
          }
        }
      }
    }

    // Check for useWindowDimensions import (only value imports, not type-only)
    if (node.importKind !== "type") {
      for (const spec of specifiers) {
        if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
          if (spec.imported.name === "useWindowDimensions") {
            state.hasWindowDimensionsImport = true;
            // Track the local identifier (handles aliased imports)
            // e.g., import { useWindowDimensions as useDims } → local name is 'useDims'
            state.windowDimensionsLocalIdentifier = spec.local.name;
            break;
          }
        }
      }
    }

    // Only track if imports exist - don't mutate yet
    // Actual import injection happens in Program.exit only if needed
    if (hasStyleSheet) {
      state.hasStyleSheetImport = true;
    }

    if (hasPlatform) {
      state.hasPlatformImport = true;
    }

    // Store reference to the react-native import for later modification if needed
    state.reactNativeImportPath = path;
  }

  // Track color scheme hook import from the configured source
  // (default: react-native, but can be custom like @/hooks/useColorScheme)
  // Only track value imports (not type-only imports which get erased)
  if (node.source.value === state.colorSchemeImportSource && node.importKind !== "type") {
    const specifiers = node.specifiers;

    for (const spec of specifiers) {
      if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
        if (spec.imported.name === state.colorSchemeHookName) {
          state.hasColorSchemeImport = true;
          // Track the local identifier (handles aliased imports)
          // e.g., import { useTheme as navTheme } → local name is 'navTheme'
          state.colorSchemeLocalIdentifier = spec.local.name;
          break;
        }
      }
    }
  }

  // Track tw/twStyle imports from main package (for compile-time transformation)
  if (node.source.value === "@mgcrea/react-native-tailwind") {
    const specifiers = node.specifiers;
    specifiers.forEach((spec) => {
      if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
        const importedName = spec.imported.name;
        if (importedName === "tw" || importedName === "twStyle") {
          // Track the local name (could be renamed: import { tw as customTw })
          const localName = spec.local.name;
          state.twImportNames.add(localName);
          // Don't set hasTwImport yet - only set it when we successfully transform a call
        } else if (importedName === "useTwColor" || importedName === "useTwColors") {
          state.twColorImportNames.set(spec.local.name, importedName);
        }
      }
    });
  }
}
