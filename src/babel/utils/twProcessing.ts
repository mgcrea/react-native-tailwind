/**
 * Utility functions for processing tw`...` and twStyle() calls
 */

import type { NodePath } from "@babel/core";
import type * as BabelTypes from "@babel/types";

import type { CustomTheme, ModifierType, ParsedModifier } from "../../parser/index.js";
import {
  expandSchemeModifier,
  isColorSchemeModifier,
  isDirectionalModifier,
  isPlatformModifier,
  isSchemeModifier,
} from "../../parser/index.js";
import type { SchemeModifierConfig } from "../../types/config.js";
import type { StyleObject } from "../../types/core.js";
import { processColorSchemeModifiers } from "./colorSchemeModifierProcessing.js";
import { processDirectionalModifiers } from "./directionalModifierProcessing.js";
import { processPlatformModifiers } from "./platformModifierProcessing.js";
import { injectColorSchemeHook } from "./styleInjection.js";
import { hasRuntimeDimensions } from "./windowDimensionsProcessing.js";

/**
 * Plugin state interface (subset needed for tw processing)
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface TwProcessingState {
  styleRegistry: Map<string, StyleObject>;
  customTheme: CustomTheme;
  schemeModifierConfig: SchemeModifierConfig;
  stylesIdentifier: string;
  // Color scheme support (for dark:/light: modifiers)
  needsColorSchemeImport: boolean;
  colorSchemeVariableName: string;
  colorSchemeHookName: string;
  functionComponentsNeedingColorScheme: Set<NodePath<BabelTypes.Function>>;
  colorSchemeLocalIdentifier?: string;
  // Platform support (for ios:/android:/web: modifiers)
  needsPlatformImport: boolean;
  // Directional support (for rtl:/ltr: modifiers)
  needsI18nManagerImport: boolean;
  i18nManagerVariableName: string;
}

/**
 * Process tw`...` or twStyle('...') call and replace with TwStyle object
 * Generates: { style: styles._base, activeStyle: styles._active, ... }
 * When color-scheme modifiers are present, generates: { style: [base, _twColorScheme === 'dark' && dark, ...] }
 * When platform modifiers are present, generates: { style: [base, Platform.select({ ios: ..., android: ... })] }
 */
export function processTwCall(
  className: string,
  path: NodePath,
  state: TwProcessingState,
  parseClassName: (className: string, customTheme?: CustomTheme) => StyleObject,
  generateStyleKey: (className: string) => string,
  splitModifierClasses: (className: string) => { baseClasses: string[]; modifierClasses: ParsedModifier[] },
  findComponentScope: (path: NodePath, t: typeof BabelTypes) => NodePath<BabelTypes.Function> | null,
  t: typeof BabelTypes,
): void {
  const { baseClasses, modifierClasses: rawModifierClasses } = splitModifierClasses(className);

  // Expand scheme: modifiers into dark: and light: modifiers
  const modifierClasses: ParsedModifier[] = [];
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

  // Build TwStyle object properties
  const objectProperties: BabelTypes.ObjectProperty[] = [];

  // Parse and add base styles
  if (baseClasses.length > 0) {
    const baseClassName = baseClasses.join(" ");
    const baseStyleObject = parseClassName(baseClassName, state.customTheme);

    // Check for runtime dimensions (w-screen, h-screen)
    if (hasRuntimeDimensions(baseStyleObject)) {
      throw path.buildCodeFrameError(
        `w-screen and h-screen are not supported in tw\`\` or twStyle() calls. ` +
          `Found: "${baseClassName}". ` +
          `Use them in className attributes instead.`,
      );
    }

    const baseStyleKey = generateStyleKey(baseClassName);
    state.styleRegistry.set(baseStyleKey, baseStyleObject);

    objectProperties.push(
      t.objectProperty(
        t.identifier("style"),
        t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(baseStyleKey)),
      ),
    );
  } else {
    // No base classes - add empty style object
    objectProperties.push(t.objectProperty(t.identifier("style"), t.objectExpression([])));
  }

  // Separate color-scheme, platform, and directional modifiers from other modifiers
  const colorSchemeModifiers = modifierClasses.filter((m) => isColorSchemeModifier(m.modifier));
  const platformModifiers = modifierClasses.filter((m) => isPlatformModifier(m.modifier));
  const directionalModifiers = modifierClasses.filter((m) => isDirectionalModifier(m.modifier));
  const otherModifiers = modifierClasses.filter(
    (m) =>
      !isColorSchemeModifier(m.modifier) &&
      !isPlatformModifier(m.modifier) &&
      !isDirectionalModifier(m.modifier),
  );

  // Check if we need color scheme support
  const hasColorSchemeModifiers = colorSchemeModifiers.length > 0;
  let componentScope: NodePath<BabelTypes.Function> | null = null;

  if (hasColorSchemeModifiers) {
    // Find component scope for hook injection
    componentScope = findComponentScope(path, t);

    if (!componentScope) {
      // Warning: color scheme modifiers used outside component scope
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[react-native-tailwind] Color scheme modifiers (dark:, light:) in tw/twStyle calls ` +
            `cannot resolve automatically outside a React component. ` +
            `darkStyle/lightStyle variants were generated; use useTwStyle() or resolveTwStyle() inside the consumer.`,
        );
      }
    } else {
      // Track this component as needing the color scheme hook
      state.functionComponentsNeedingColorScheme.add(componentScope);
      // Inject hook immediately for React Compiler compatibility
      state.needsColorSchemeImport = true;
      injectColorSchemeHook(
        componentScope,
        state.colorSchemeVariableName,
        state.colorSchemeHookName,
        state.colorSchemeLocalIdentifier,
        t,
      );
    }
  }

  // Process color scheme modifiers if we have a valid component scope
  if (hasColorSchemeModifiers && componentScope) {
    // Generate conditional expressions for color scheme
    const colorSchemeConditionals = processColorSchemeModifiers(
      colorSchemeModifiers,
      state,
      parseClassName,
      generateStyleKey,
      t,
    );

    // Build style array: [baseStyle, _twColorScheme === 'dark' && darkStyle, ...]
    const styleArrayElements: BabelTypes.Expression[] = [];

    // Add base style if present
    if (baseClasses.length > 0) {
      const baseClassName = baseClasses.join(" ");
      const baseStyleObject = parseClassName(baseClassName, state.customTheme);
      const baseStyleKey = generateStyleKey(baseClassName);
      state.styleRegistry.set(baseStyleKey, baseStyleObject);
      styleArrayElements.push(
        t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(baseStyleKey)),
      );
    }

    // Add color scheme conditionals
    styleArrayElements.push(...colorSchemeConditionals);

    // Replace style property with array
    objectProperties[0] = t.objectProperty(t.identifier("style"), t.arrayExpression(styleArrayElements));
  }

  // Always expose darkStyle/lightStyle variants. Inside components the style
  // property is also reactive; outside components these variants can be
  // resolved by useTwStyle() or resolveTwStyle() at the consumption site.
  if (hasColorSchemeModifiers) {
    const darkModifiers = colorSchemeModifiers.filter((m) => m.modifier === "dark");
    const lightModifiers = colorSchemeModifiers.filter((m) => m.modifier === "light");

    if (darkModifiers.length > 0) {
      const darkClassNames = darkModifiers.map((m) => m.baseClass).join(" ");
      const darkStyleObject = parseClassName(darkClassNames, state.customTheme);
      const darkStyleKey = generateStyleKey(`dark_${darkClassNames}`);
      state.styleRegistry.set(darkStyleKey, darkStyleObject);

      objectProperties.push(
        t.objectProperty(
          t.identifier("darkStyle"),
          t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(darkStyleKey)),
        ),
      );
    }

    if (lightModifiers.length > 0) {
      const lightClassNames = lightModifiers.map((m) => m.baseClass).join(" ");
      const lightStyleObject = parseClassName(lightClassNames, state.customTheme);
      const lightStyleKey = generateStyleKey(`light_${lightClassNames}`);
      state.styleRegistry.set(lightStyleKey, lightStyleObject);

      objectProperties.push(
        t.objectProperty(
          t.identifier("lightStyle"),
          t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(lightStyleKey)),
        ),
      );
    }
  }

  // Process platform modifiers if present
  const hasPlatformModifiers = platformModifiers.length > 0;

  if (hasPlatformModifiers) {
    // Mark that we need Platform import
    state.needsPlatformImport = true;

    // Generate Platform.select() expression
    const platformSelectExpression = processPlatformModifiers(
      platformModifiers,
      state,
      parseClassName,
      generateStyleKey,
      t,
    );

    // If we already have a style array (from color scheme modifiers), add to it
    // Otherwise, convert style property to an array
    if (hasColorSchemeModifiers && componentScope) {
      // Already have style array from color scheme processing
      // Get the current array expression and add Platform.select to it
      const styleProperty = objectProperties.find(
        (prop) => t.isIdentifier(prop.key) && prop.key.name === "style",
      );
      if (styleProperty && t.isArrayExpression(styleProperty.value)) {
        styleProperty.value.elements.push(platformSelectExpression);
      }
    } else {
      // No color scheme modifiers, create style array with base + Platform.select
      const styleArrayElements: BabelTypes.Expression[] = [];

      // Add base style if present
      if (baseClasses.length > 0) {
        const baseClassName = baseClasses.join(" ");
        const baseStyleObject = parseClassName(baseClassName, state.customTheme);
        const baseStyleKey = generateStyleKey(baseClassName);
        state.styleRegistry.set(baseStyleKey, baseStyleObject);
        styleArrayElements.push(
          t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(baseStyleKey)),
        );
      }

      // Add Platform.select() expression
      styleArrayElements.push(platformSelectExpression);

      // Replace style property with array
      objectProperties[0] = t.objectProperty(t.identifier("style"), t.arrayExpression(styleArrayElements));
    }

    // Also add iosStyle/androidStyle/webStyle properties for manual processing
    const iosModifiers = platformModifiers.filter((m) => m.modifier === "ios");
    const androidModifiers = platformModifiers.filter((m) => m.modifier === "android");
    const webModifiers = platformModifiers.filter((m) => m.modifier === "web");

    if (iosModifiers.length > 0) {
      const iosClassNames = iosModifiers.map((m) => m.baseClass).join(" ");
      const iosStyleObject = parseClassName(iosClassNames, state.customTheme);
      const iosStyleKey = generateStyleKey(`ios_${iosClassNames}`);
      state.styleRegistry.set(iosStyleKey, iosStyleObject);

      objectProperties.push(
        t.objectProperty(
          t.identifier("iosStyle"),
          t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(iosStyleKey)),
        ),
      );
    }

    if (androidModifiers.length > 0) {
      const androidClassNames = androidModifiers.map((m) => m.baseClass).join(" ");
      const androidStyleObject = parseClassName(androidClassNames, state.customTheme);
      const androidStyleKey = generateStyleKey(`android_${androidClassNames}`);
      state.styleRegistry.set(androidStyleKey, androidStyleObject);

      objectProperties.push(
        t.objectProperty(
          t.identifier("androidStyle"),
          t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(androidStyleKey)),
        ),
      );
    }

    if (webModifiers.length > 0) {
      const webClassNames = webModifiers.map((m) => m.baseClass).join(" ");
      const webStyleObject = parseClassName(webClassNames, state.customTheme);
      const webStyleKey = generateStyleKey(`web_${webClassNames}`);
      state.styleRegistry.set(webStyleKey, webStyleObject);

      objectProperties.push(
        t.objectProperty(
          t.identifier("webStyle"),
          t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(webStyleKey)),
        ),
      );
    }
  }

  // Process directional modifiers if present
  const hasDirectionalModifiers = directionalModifiers.length > 0;

  if (hasDirectionalModifiers) {
    // Mark that we need I18nManager import
    state.needsI18nManagerImport = true;

    // Generate directional conditional expressions
    const directionalConditionals = processDirectionalModifiers(
      directionalModifiers,
      state,
      parseClassName,
      generateStyleKey,
      t,
    );

    // If we already have a style array (from color scheme or platform modifiers), add to it
    // Otherwise, convert style property to an array
    const styleProperty = objectProperties.find(
      (prop) => t.isIdentifier(prop.key) && prop.key.name === "style",
    );

    if (styleProperty && t.isArrayExpression(styleProperty.value)) {
      // Already have style array, add directional conditionals to it
      styleProperty.value.elements.push(...directionalConditionals);
    } else {
      // No existing array, create style array with base + directional conditionals
      const styleArrayElements: BabelTypes.Expression[] = [];

      // Add base style if present
      if (baseClasses.length > 0) {
        const baseClassName = baseClasses.join(" ");
        const baseStyleObject = parseClassName(baseClassName, state.customTheme);
        const baseStyleKey = generateStyleKey(baseClassName);
        state.styleRegistry.set(baseStyleKey, baseStyleObject);
        styleArrayElements.push(
          t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(baseStyleKey)),
        );
      }

      // Add directional conditionals
      styleArrayElements.push(...directionalConditionals);

      // Replace style property with array
      objectProperties[0] = t.objectProperty(t.identifier("style"), t.arrayExpression(styleArrayElements));
    }

    // Also add rtlStyle/ltrStyle properties for manual processing
    const rtlModifiers = directionalModifiers.filter((m) => m.modifier === "rtl");
    const ltrModifiers = directionalModifiers.filter((m) => m.modifier === "ltr");

    if (rtlModifiers.length > 0) {
      const rtlClassNames = rtlModifiers.map((m) => m.baseClass).join(" ");
      const rtlStyleObject = parseClassName(rtlClassNames, state.customTheme);
      const rtlStyleKey = generateStyleKey(`rtl_${rtlClassNames}`);
      state.styleRegistry.set(rtlStyleKey, rtlStyleObject);

      objectProperties.push(
        t.objectProperty(
          t.identifier("rtlStyle"),
          t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(rtlStyleKey)),
        ),
      );
    }

    if (ltrModifiers.length > 0) {
      const ltrClassNames = ltrModifiers.map((m) => m.baseClass).join(" ");
      const ltrStyleObject = parseClassName(ltrClassNames, state.customTheme);
      const ltrStyleKey = generateStyleKey(`ltr_${ltrClassNames}`);
      state.styleRegistry.set(ltrStyleKey, ltrStyleObject);

      objectProperties.push(
        t.objectProperty(
          t.identifier("ltrStyle"),
          t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(ltrStyleKey)),
        ),
      );
    }
  }

  // Group other modifiers by type (non-color-scheme, non-platform, and non-directional modifiers)
  const modifiersByType = new Map<ModifierType, ParsedModifier[]>();
  for (const mod of otherModifiers) {
    if (!modifiersByType.has(mod.modifier)) {
      modifiersByType.set(mod.modifier, []);
    }
    const modGroup = modifiersByType.get(mod.modifier);
    if (modGroup) {
      modGroup.push(mod);
    }
  }

  // Add modifier styles (activeStyle, focusStyle, etc.) for non-color-scheme modifiers
  for (const [modifierType, modifiers] of modifiersByType) {
    const modifierClassNames = modifiers.map((m) => m.baseClass).join(" ");
    const modifierStyleObject = parseClassName(modifierClassNames, state.customTheme);
    const modifierStyleKey = generateStyleKey(`${modifierType}_${modifierClassNames}`);
    state.styleRegistry.set(modifierStyleKey, modifierStyleObject);

    // Map modifier type to property name: active -> activeStyle
    const propertyName = `${modifierType}Style`;

    objectProperties.push(
      t.objectProperty(
        t.identifier(propertyName),
        t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(modifierStyleKey)),
      ),
    );
  }

  // Replace the tw`...` or twStyle('...') with the object
  const twStyleObject = t.objectExpression(objectProperties);
  path.replaceWith(twStyleObject);
}

/**
 * Remove tw/twStyle imports from @mgcrea/react-native-tailwind
 * This is called after all tw calls have been transformed
 */
export function removeTwImports(path: NodePath<BabelTypes.Program>, t: typeof BabelTypes): void {
  // Traverse the program to find and remove tw/twStyle imports
  path.traverse({
    ImportDeclaration(importPath) {
      const node = importPath.node;

      // Only process imports from main package
      if (node.source.value !== "@mgcrea/react-native-tailwind") {
        return;
      }

      // Filter out tw/twStyle specifiers
      const remainingSpecifiers = node.specifiers.filter((spec) => {
        if (t.isImportSpecifier(spec) && t.isIdentifier(spec.imported)) {
          const importedName = spec.imported.name;
          return importedName !== "tw" && importedName !== "twStyle";
        }
        return true;
      });

      if (remainingSpecifiers.length === 0) {
        // Remove entire import if no specifiers remain
        importPath.remove();
      } else if (remainingSpecifiers.length < node.specifiers.length) {
        // Update import with remaining specifiers
        node.specifiers = remainingSpecifiers;
      }
    },
  });
}
