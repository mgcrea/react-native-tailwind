/**
 * Plugin state and options types
 */

import type { NodePath, PluginPass } from "@babel/core";
import type * as BabelTypes from "@babel/types";

import type { SchemeModifierConfig } from "../../types/config.js";
import type { StyleObject } from "../../types/core.js";
import type { CustomTheme } from "../config-loader.js";
import { extractCustomTheme } from "../config-loader.js";
import { DEFAULT_CLASS_ATTRIBUTES, buildAttributeMatchers } from "../utils/attributeMatchers.js";

/**
 * Plugin options
 */
export type PluginOptions = {
  /**
   * List of JSX attribute names to transform (in addition to or instead of 'className')
   * Supports exact matches and glob patterns:
   * - Exact: 'className', 'containerClassName'
   * - Glob: '*ClassName' (matches any attribute ending in 'ClassName')
   *
   * @default ['className', 'contentContainerClassName', 'columnWrapperClassName', 'ListHeaderComponentClassName', 'ListFooterComponentClassName']
   */
  attributes?: string[];

  /**
   * Custom identifier name for the generated StyleSheet constant
   *
   * @default '_twStyles'
   */
  stylesIdentifier?: string;

  /**
   * Configuration for the scheme: modifier that expands to both dark: and light: modifiers
   *
   * @example
   * {
   *   darkSuffix: '-dark',  // scheme:bg-primary -> dark:bg-primary-dark
   *   lightSuffix: '-light' // scheme:bg-primary -> light:bg-primary-light
   * }
   *
   * @default { darkSuffix: '-dark', lightSuffix: '-light' }
   */
  schemeModifier?: {
    darkSuffix?: string;
    lightSuffix?: string;
  };

  /**
   * Configuration for color scheme hook import (dark:/light: modifiers)
   *
   * Allows using custom color scheme hooks from theme providers instead of
   * React Native's built-in useColorScheme.
   *
   * @example
   * // Use custom hook from theme provider
   * {
   *   importFrom: '@/hooks/useColorScheme',
   *   importName: 'useColorScheme'
   * }
   *
   * @example
   * // Use React Navigation theme
   * {
   *   importFrom: '@react-navigation/native',
   *   importName: 'useTheme'  // You'd wrap this to return ColorSchemeName
   * }
   *
   * @default { importFrom: 'react-native', importName: 'useColorScheme' }
   */
  colorScheme?: {
    /**
     * Module to import the color scheme hook from
     * @default 'react-native'
     */
    importFrom?: string;

    /**
     * Name of the hook to import
     * @default 'useColorScheme'
     */
    importName?: string;
  };
};

/**
 * Plugin state - passed through all visitors
 */
export type PluginState = PluginPass & {
  styleRegistry: Map<string, StyleObject>;
  hasClassNames: boolean;
  hasStyleSheetImport: boolean;
  hasPlatformImport: boolean;
  needsPlatformImport: boolean;
  hasColorSchemeImport: boolean;
  needsColorSchemeImport: boolean;
  colorSchemeVariableName: string;
  colorSchemeImportSource: string; // Where to import the hook from (e.g., 'react-native')
  colorSchemeHookName: string; // Name of the hook to import (e.g., 'useColorScheme')
  colorSchemeLocalIdentifier?: string; // Local identifier if hook is already imported with an alias
  hasWindowDimensionsImport: boolean;
  needsWindowDimensionsImport: boolean;
  windowDimensionsVariableName: string;
  windowDimensionsLocalIdentifier?: string; // Local identifier if hook is already imported with an alias
  hasI18nManagerImport: boolean;
  needsI18nManagerImport: boolean;
  i18nManagerVariableName: string; // Variable name for the RTL state (e.g., '_twIsRTL')
  i18nManagerLocalIdentifier?: string; // Local identifier if I18nManager is already imported with an alias
  customTheme: CustomTheme;
  schemeModifierConfig: SchemeModifierConfig;
  supportedAttributes: Set<string>;
  attributePatterns: RegExp[];
  stylesIdentifier: string;
  // Track tw/twStyle imports from main package
  twImportNames: Set<string>; // e.g., ['tw', 'twStyle'] or ['tw as customTw']
  hasTwImport: boolean;
  // Track react-native import path for conditional StyleSheet/Platform injection
  reactNativeImportPath?: NodePath<BabelTypes.ImportDeclaration>;
  // Track function components that need colorScheme hook injection
  functionComponentsNeedingColorScheme: Set<NodePath<BabelTypes.Function>>;
  // Track function components that need windowDimensions hook injection
  functionComponentsNeedingWindowDimensions: Set<NodePath<BabelTypes.Function>>;
};

// Default identifier for the generated StyleSheet constant
export const DEFAULT_STYLES_IDENTIFIER = "_twStyles";

/**
 * Create initial plugin state for a file
 *
 * @param options - Plugin options from babel config
 * @param filename - Current file being processed
 * @param colorSchemeImportSource - Where to import the color scheme hook from
 * @param colorSchemeHookName - Name of the color scheme hook to import
 * @param schemeModifierConfig - Configuration for scheme: modifier expansion
 * @returns Initial plugin state
 */
export function createInitialState(
  options: PluginOptions | undefined,
  filename: string,
  colorSchemeImportSource: string,
  colorSchemeHookName: string,
  schemeModifierConfig: SchemeModifierConfig,
): Partial<PluginState> {
  // Build attribute matchers from options
  const attributes = options?.attributes ?? [...DEFAULT_CLASS_ATTRIBUTES];
  const { exactMatches, patterns } = buildAttributeMatchers(attributes);
  const stylesIdentifier = options?.stylesIdentifier ?? DEFAULT_STYLES_IDENTIFIER;

  // Load custom theme from tailwind.config.*
  const customTheme = extractCustomTheme(filename);

  return {
    styleRegistry: new Map(),
    hasClassNames: false,
    hasStyleSheetImport: false,
    hasPlatformImport: false,
    needsPlatformImport: false,
    hasColorSchemeImport: false,
    needsColorSchemeImport: false,
    colorSchemeVariableName: "_twColorScheme",
    colorSchemeImportSource,
    colorSchemeHookName,
    colorSchemeLocalIdentifier: undefined,
    hasWindowDimensionsImport: false,
    needsWindowDimensionsImport: false,
    windowDimensionsVariableName: "_twDimensions",
    windowDimensionsLocalIdentifier: undefined,
    hasI18nManagerImport: false,
    needsI18nManagerImport: false,
    i18nManagerVariableName: "_twIsRTL",
    i18nManagerLocalIdentifier: undefined,
    customTheme,
    schemeModifierConfig,
    supportedAttributes: exactMatches,
    attributePatterns: patterns,
    stylesIdentifier,
    twImportNames: new Set(),
    hasTwImport: false,
    reactNativeImportPath: undefined,
    functionComponentsNeedingColorScheme: new Set(),
    functionComponentsNeedingWindowDimensions: new Set(),
  };
}
