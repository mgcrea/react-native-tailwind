/**
 * Program visitor - entry and exit points for file processing
 */

import type { NodePath } from "@babel/core";
import type * as BabelTypes from "@babel/types";
import {
  addColorSchemeImport,
  addI18nManagerImport,
  addPlatformImport,
  addStyleSheetImport,
  addWindowDimensionsImport,
  injectColorSchemeHook,
  injectI18nManagerVariable,
  injectStylesAtTop,
  injectWindowDimensionsHook,
} from "../../utils/styleInjection.js";
import { removeTwImports } from "../../utils/twProcessing.js";
import type { PluginState } from "../state.js";
import { removeVariantDefinitions, removeVariantImports } from "./variants.js";

/**
 * Program enter visitor - initialize state for each file
 */
export function programEnter(_path: NodePath<BabelTypes.Program>, _state: PluginState): void {
  // Note: State initialization is already handled by the createInitialState function
  // This is called before any other visitors and receives the initialized state
  // The actual initialization happens in the main plugin.ts file via Object.assign
}

/**
 * Program exit visitor - finalize transformations
 * Injects imports, hooks, and StyleSheet.create
 */
export function programExit(
  path: NodePath<BabelTypes.Program>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  // Remove tw/twStyle imports if they were used (and transformed)
  if (state.hasTwImport) {
    removeTwImports(path, t);
  }

  // Remove variant imports and definitions if they were processed
  if (state.hasVariantDefinitions) {
    removeVariantImports(path, state, t);
    removeVariantDefinitions(path, state, t);
  }

  // If no classNames/variants were found and no hooks/imports needed, skip processing
  if (
    !state.hasClassNames &&
    !state.hasVariantDefinitions &&
    !state.needsWindowDimensionsImport &&
    !state.needsColorSchemeImport &&
    !state.needsI18nManagerImport
  ) {
    return;
  }

  // Add StyleSheet import if not already present (and we have styles to inject)
  if (!state.hasStyleSheetImport && state.styleRegistry.size > 0) {
    addStyleSheetImport(path, t);
  }

  // Add Platform import if platform modifiers were used and not already present
  if (state.needsPlatformImport && !state.hasPlatformImport) {
    addPlatformImport(path, t);
  }

  // Add I18nManager import if directional modifiers were used and not already present
  if (state.needsI18nManagerImport && !state.hasI18nManagerImport) {
    addI18nManagerImport(path, t);
  }

  // Inject I18nManager.isRTL variable at module level (not a hook, so no component scope needed)
  if (state.needsI18nManagerImport) {
    injectI18nManagerVariable(path, state.i18nManagerVariableName, state.i18nManagerLocalIdentifier, t);
  }

  // Add color scheme hook import if color scheme modifiers were used and not already present
  if (state.needsColorSchemeImport && !state.hasColorSchemeImport) {
    addColorSchemeImport(path, state.colorSchemeImportSource, state.colorSchemeHookName, t);
  }

  // Inject color scheme hook in function components that need it
  if (state.needsColorSchemeImport) {
    for (const functionPath of state.functionComponentsNeedingColorScheme) {
      injectColorSchemeHook(
        functionPath,
        state.colorSchemeVariableName,
        state.colorSchemeHookName,
        state.colorSchemeLocalIdentifier,
        t,
      );
    }
  }

  // Add useWindowDimensions import if w-screen/h-screen classes were used and not already present
  if (state.needsWindowDimensionsImport && !state.hasWindowDimensionsImport) {
    addWindowDimensionsImport(path, t);
  }

  // Inject useWindowDimensions hook in function components that need it
  if (state.needsWindowDimensionsImport) {
    for (const functionPath of state.functionComponentsNeedingWindowDimensions) {
      injectWindowDimensionsHook(
        functionPath,
        state.windowDimensionsVariableName,
        "useWindowDimensions",
        state.windowDimensionsLocalIdentifier,
        t,
      );
    }
  }

  // Generate and inject StyleSheet.create at the beginning of the file (after imports)
  // This ensures _twStyles is defined before any code that references it
  // Only inject if we actually have styles to inject
  if (state.styleRegistry.size > 0) {
    injectStylesAtTop(path, state.styleRegistry, state.stylesIdentifier, t);
  }
}
