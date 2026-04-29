/**
 * JSXAttribute visitor - handles className attribute transformations
 */

import type { NodePath } from "@babel/core";
import type * as BabelTypes from "@babel/types";

import type { ParsedModifier, StateModifierType } from "../../../parser/index.js";
import {
  expandSchemeModifier,
  isColorSchemeModifier,
  isDirectionalModifier,
  isPlatformModifier,
  isSchemeModifier,
  isStateModifier,
  parseClassName,
  parsePlaceholderClasses,
  splitModifierClasses,
} from "../../../parser/index.js";
import { generateStyleKey } from "../../../utils/styleKey.js";
import { getTargetStyleProp, isAttributeSupported } from "../../utils/attributeMatchers.js";
import { processColorSchemeModifiers } from "../../utils/colorSchemeModifierProcessing.js";
import { getComponentModifierSupport, getStatePropertyForModifier } from "../../utils/componentSupport.js";
import { processDirectionalModifiers } from "../../utils/directionalModifierProcessing.js";
import { processDynamicExpression } from "../../utils/dynamicProcessing.js";
import { createStyleFunction, processStaticClassNameWithModifiers } from "../../utils/modifierProcessing.js";
import { processPlatformModifiers } from "../../utils/platformModifierProcessing.js";
import { injectColorSchemeHook, injectWindowDimensionsHook } from "../../utils/styleInjection.js";
import {
  addOrMergePlaceholderTextColorProp,
  findStyleAttribute,
  mergeDynamicStyleAttribute,
  mergeStyleAttribute,
  mergeStyleFunctionAttribute,
  replaceDynamicWithStyleAttribute,
  replaceWithStyleAttribute,
  replaceWithStyleFunctionAttribute,
} from "../../utils/styleTransforms.js";
import {
  createRuntimeDimensionObject,
  hasRuntimeDimensions,
  splitStaticAndRuntimeStyles,
} from "../../utils/windowDimensionsProcessing.js";
import { findComponentScope } from "../componentScope.js";
import type { PluginState } from "../state.js";

/**
 * JSXAttribute visitor
 * Handles all className attribute transformations (static, dynamic, modifiers)
 */
export function jsxAttributeVisitor(
  path: NodePath<BabelTypes.JSXAttribute>,
  state: PluginState,
  t: typeof BabelTypes,
): void {
  const node = path.node;

  // Ensure we have a JSXIdentifier name (not JSXNamespacedName)
  if (!t.isJSXIdentifier(node.name)) {
    return;
  }

  const attributeName = node.name.name;

  // Only process configured className-like attributes
  if (!isAttributeSupported(attributeName, state.supportedAttributes, state.attributePatterns)) {
    return;
  }

  const value = node.value;

  // Determine target style prop based on attribute name
  const targetStyleProp = getTargetStyleProp(attributeName);

  /**
   * Process static className string (handles both direct StringLiteral and StringLiteral in JSXExpressionContainer)
   */
  const processStaticClassName = (className: string): boolean => {
    const trimmedClassName = className.trim();

    // Skip empty classNames
    if (!trimmedClassName) {
      path.remove();
      return true;
    }

    state.hasClassNames = true;

    // Check if className contains modifiers (active:, hover:, focus:, placeholder:, ios:, android:, web:, dark:, light:, scheme:)
    const { baseClasses, modifierClasses: rawModifierClasses } = splitModifierClasses(trimmedClassName);

    // Expand scheme: modifiers into dark: and light: modifiers
    const modifierClasses: ParsedModifier[] = [];
    for (const modifier of rawModifierClasses) {
      if (isSchemeModifier(modifier.modifier)) {
        // Expand scheme: into dark: and light:
        const expanded = expandSchemeModifier(
          modifier,
          state.customTheme.colors ?? {},
          state.schemeModifierConfig.darkSuffix,
          state.schemeModifierConfig.lightSuffix,
        );
        modifierClasses.push(...expanded);
      } else {
        // Keep other modifiers as-is
        modifierClasses.push(modifier);
      }
    }

    // Separate modifiers by type
    const placeholderModifiers = modifierClasses.filter((m) => m.modifier === "placeholder");
    const platformModifiers = modifierClasses.filter((m) => isPlatformModifier(m.modifier));
    const colorSchemeModifiers = modifierClasses.filter((m) => isColorSchemeModifier(m.modifier));
    const directionalModifiers = modifierClasses.filter((m) => isDirectionalModifier(m.modifier));
    const stateModifiers = modifierClasses.filter(
      (m) => isStateModifier(m.modifier) && m.modifier !== "placeholder",
    );

    // Handle placeholder modifiers first (they generate placeholderTextColor prop, not style)
    if (placeholderModifiers.length > 0) {
      // Check if this is a TextInput component (placeholder only works on TextInput)
      const jsxOpeningElement = path.parent as BabelTypes.JSXOpeningElement;
      const componentSupport = getComponentModifierSupport(jsxOpeningElement, t);

      if (componentSupport?.supportedModifiers.includes("placeholder")) {
        const placeholderClasses = placeholderModifiers.map((m) => m.baseClass).join(" ");
        const placeholderColor = parsePlaceholderClasses(placeholderClasses, state.customTheme.colors);

        if (placeholderColor) {
          // Add or merge placeholderTextColor prop
          addOrMergePlaceholderTextColorProp(jsxOpeningElement, placeholderColor, t);
        }
      } else {
        // Warn if placeholder modifier used on non-TextInput element
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[react-native-tailwind] placeholder: modifier can only be used on TextInput component at ${state.file.opts.filename ?? "unknown"}`,
          );
        }
      }
    }

    // Handle combination of modifiers
    const hasPlatformModifiers = platformModifiers.length > 0;
    const hasColorSchemeModifiers = colorSchemeModifiers.length > 0;
    const hasDirectionalModifiers = directionalModifiers.length > 0;
    const hasStateModifiers = stateModifiers.length > 0;
    const hasBaseClasses = baseClasses.length > 0;

    // If we have color scheme modifiers, we need to track the parent function component
    let componentScope: NodePath<BabelTypes.Function> | null = null;
    if (hasColorSchemeModifiers) {
      componentScope = findComponentScope(path, t);
      if (componentScope) {
        state.functionComponentsNeedingColorScheme.add(componentScope);
        // Inject hook immediately for React Compiler compatibility
        // (React Compiler processes functions before Program.exit where hooks were previously injected)
        state.needsColorSchemeImport = true;
        injectColorSchemeHook(
          componentScope,
          state.colorSchemeVariableName,
          state.colorSchemeHookName,
          state.colorSchemeLocalIdentifier,
          t,
        );
      } else {
        // Warn if color scheme modifiers used in invalid context (class component, nested function)
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[react-native-tailwind] dark:/light: modifiers require a function component scope. ` +
              `Found in non-component context at ${state.file.opts.filename ?? "unknown"}. ` +
              `These modifiers are not supported in class components or nested callbacks.`,
          );
        }
      }
    }

    // If we have multiple modifier types, combine them in an array expression
    // For state modifiers, wrap in arrow function; for color scheme and directional, they're just conditionals
    if (hasStateModifiers && (hasPlatformModifiers || hasColorSchemeModifiers || hasDirectionalModifiers)) {
      // Get the JSX opening element for component support checking
      const jsxOpeningElement = path.parent;
      const componentSupport = getComponentModifierSupport(jsxOpeningElement, t);

      if (componentSupport) {
        // Build style array: [baseStyle, Platform.select(...), colorSchemeConditionals, directionalConditionals, stateConditionals]
        const styleArrayElements: BabelTypes.Expression[] = [];

        // Add base classes
        if (hasBaseClasses) {
          const baseClassName = baseClasses.join(" ");
          const baseStyleObject = parseClassName(baseClassName, state.customTheme);

          // Check for runtime dimensions (w-screen, h-screen) in base classes
          if (hasRuntimeDimensions(baseStyleObject)) {
            throw path.buildCodeFrameError(
              `w-screen and h-screen cannot be combined with modifiers. ` +
                `Found: "${baseClassName}" with state, platform, color scheme, or directional modifiers. ` +
                `Use w-screen/h-screen without modifiers instead.`,
            );
          }

          const baseStyleKey = generateStyleKey(baseClassName);
          state.styleRegistry.set(baseStyleKey, baseStyleObject);
          styleArrayElements.push(
            t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(baseStyleKey)),
          );
        }

        // Add platform modifiers as Platform.select()
        if (hasPlatformModifiers) {
          const platformSelectExpression = processPlatformModifiers(
            platformModifiers,
            state,
            parseClassName,
            generateStyleKey,
            t,
          );
          styleArrayElements.push(platformSelectExpression);
        }

        // Add color scheme modifiers as conditionals (only if component scope exists)
        if (hasColorSchemeModifiers && componentScope) {
          const colorSchemeConditionals = processColorSchemeModifiers(
            colorSchemeModifiers,
            state,
            parseClassName,
            generateStyleKey,
            t,
          );
          styleArrayElements.push(...colorSchemeConditionals);
        }

        // Add directional modifiers as conditionals
        if (hasDirectionalModifiers) {
          const directionalConditionals = processDirectionalModifiers(
            directionalModifiers,
            state,
            parseClassName,
            generateStyleKey,
            t,
          );
          styleArrayElements.push(...directionalConditionals);
        }

        // Add state modifiers as conditionals
        // Group by modifier type
        const modifiersByType = new Map<StateModifierType, ParsedModifier[]>();
        for (const mod of stateModifiers) {
          const modType = mod.modifier as StateModifierType;
          if (!modifiersByType.has(modType)) {
            modifiersByType.set(modType, []);
          }
          modifiersByType.get(modType)?.push(mod);
        }

        // Build conditionals for each state modifier type
        for (const [modifierType, modifiers] of modifiersByType) {
          if (!componentSupport.supportedModifiers.includes(modifierType)) {
            continue; // Skip unsupported modifiers
          }

          const modifierClassNames = modifiers.map((m) => m.baseClass).join(" ");
          const modifierStyleObject = parseClassName(modifierClassNames, state.customTheme);
          const modifierStyleKey = generateStyleKey(`${modifierType}_${modifierClassNames}`);
          state.styleRegistry.set(modifierStyleKey, modifierStyleObject);

          const stateProperty = getStatePropertyForModifier(modifierType);
          const conditionalExpression = t.logicalExpression(
            "&&",
            t.identifier(stateProperty),
            t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(modifierStyleKey)),
          );

          styleArrayElements.push(conditionalExpression);
        }

        // Wrap in arrow function for state support
        const usedModifiers = Array.from(new Set(stateModifiers.map((m) => m.modifier))).filter((mod) =>
          componentSupport.supportedModifiers.includes(mod),
        );
        const styleArrayExpression = t.arrayExpression(styleArrayElements);
        const styleFunctionExpression = createStyleFunction(styleArrayExpression, usedModifiers, t);

        const styleAttribute = findStyleAttribute(path, targetStyleProp, t);
        if (styleAttribute) {
          mergeStyleFunctionAttribute(path, styleAttribute, styleFunctionExpression, t);
        } else {
          replaceWithStyleFunctionAttribute(path, styleFunctionExpression, targetStyleProp, t);
        }
        return true;
      } else {
        // Component doesn't support state modifiers, but we can still use platform modifiers
        // Fall through to platform-only handling
      }
    }

    // Handle platform, color scheme, and/or directional modifiers (no state modifiers)
    if ((hasPlatformModifiers || hasColorSchemeModifiers || hasDirectionalModifiers) && !hasStateModifiers) {
      // Build style array/expression: [baseStyle, Platform.select(...), colorSchemeConditionals, directionalConditionals]
      const styleExpressions: BabelTypes.Expression[] = [];

      // Add base classes
      if (hasBaseClasses) {
        const baseClassName = baseClasses.join(" ");
        const baseStyleObject = parseClassName(baseClassName, state.customTheme);

        // Check for runtime dimensions (w-screen, h-screen) in base classes
        if (hasRuntimeDimensions(baseStyleObject)) {
          throw path.buildCodeFrameError(
            `w-screen and h-screen cannot be combined with modifiers. ` +
              `Found: "${baseClassName}" with platform, color scheme, or directional modifiers. ` +
              `Use w-screen/h-screen without modifiers instead.`,
          );
        }

        const baseStyleKey = generateStyleKey(baseClassName);
        state.styleRegistry.set(baseStyleKey, baseStyleObject);
        styleExpressions.push(
          t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(baseStyleKey)),
        );
      }

      // Add platform modifiers as Platform.select()
      if (hasPlatformModifiers) {
        const platformSelectExpression = processPlatformModifiers(
          platformModifiers,
          state,
          parseClassName,
          generateStyleKey,
          t,
        );
        styleExpressions.push(platformSelectExpression);
      }

      // Add color scheme modifiers as conditionals (only if we have a valid component scope)
      if (hasColorSchemeModifiers && componentScope) {
        const colorSchemeConditionals = processColorSchemeModifiers(
          colorSchemeModifiers,
          state,
          parseClassName,
          generateStyleKey,
          t,
        );
        styleExpressions.push(...colorSchemeConditionals);
      }

      // Add directional modifiers as conditionals
      if (hasDirectionalModifiers) {
        const directionalConditionals = processDirectionalModifiers(
          directionalModifiers,
          state,
          parseClassName,
          generateStyleKey,
          t,
        );
        styleExpressions.push(...directionalConditionals);
      }

      // Generate style attribute
      const styleExpression =
        styleExpressions.length === 1 ? styleExpressions[0] : t.arrayExpression(styleExpressions);

      const styleAttribute = findStyleAttribute(path, targetStyleProp, t);
      if (styleAttribute) {
        // Merge with existing style attribute
        const existingStyle = styleAttribute.value;
        if (t.isJSXExpressionContainer(existingStyle) && !t.isJSXEmptyExpression(existingStyle.expression)) {
          const existing = existingStyle.expression;
          // Merge as array: [ourStyles, existingStyles]
          const mergedArray = t.isArrayExpression(existing)
            ? t.arrayExpression([styleExpression, ...existing.elements])
            : t.arrayExpression([styleExpression, existing]);
          styleAttribute.value = t.jsxExpressionContainer(mergedArray);
        } else {
          styleAttribute.value = t.jsxExpressionContainer(styleExpression);
        }
        path.remove();
      } else {
        // Replace className with style prop containing our expression
        path.node.name = t.jsxIdentifier(targetStyleProp);
        path.node.value = t.jsxExpressionContainer(styleExpression);
      }
      return true;
    }

    // If there are state modifiers (and no platform modifiers), check if this component supports them
    if (hasStateModifiers) {
      // Get the JSX opening element (the direct parent of the attribute)
      const jsxOpeningElement = path.parent;
      const componentSupport = getComponentModifierSupport(jsxOpeningElement, t);

      if (componentSupport) {
        // Get modifier types used in className
        const usedModifiers = Array.from(new Set(stateModifiers.map((m) => m.modifier)));

        // Check if all modifiers are supported by this component
        const unsupportedModifiers = usedModifiers.filter(
          (mod) => !componentSupport.supportedModifiers.includes(mod),
        );

        if (unsupportedModifiers.length > 0) {
          // Warn about unsupported modifiers
          if (process.env.NODE_ENV !== "production") {
            console.warn(
              `[react-native-tailwind] Modifiers (${unsupportedModifiers.map((m) => `${m}:`).join(", ")}) are not supported on ${componentSupport.component} component at ${state.file.opts.filename ?? "unknown"}. ` +
                `Supported modifiers: ${componentSupport.supportedModifiers.join(", ")}`,
            );
          }
          // Filter out unsupported modifiers
          const supportedModifierClasses = stateModifiers.filter((m) =>
            componentSupport.supportedModifiers.includes(m.modifier),
          );

          // If no supported modifiers remain, fall through to normal processing
          if (supportedModifierClasses.length === 0) {
            // Continue to normal processing
          } else {
            // Process only supported modifiers
            const filteredClassName =
              baseClasses.join(" ") +
              " " +
              supportedModifierClasses.map((m) => `${m.modifier}:${m.baseClass}`).join(" ");
            const styleExpression = processStaticClassNameWithModifiers(
              filteredClassName.trim(),
              state,
              parseClassName,
              generateStyleKey,
              splitModifierClasses,
              t,
            );
            const modifierTypes = Array.from(new Set(supportedModifierClasses.map((m) => m.modifier)));
            const styleFunctionExpression = createStyleFunction(styleExpression, modifierTypes, t);

            const styleAttribute = findStyleAttribute(path, targetStyleProp, t);

            if (styleAttribute) {
              mergeStyleFunctionAttribute(path, styleAttribute, styleFunctionExpression, t);
            } else {
              replaceWithStyleFunctionAttribute(path, styleFunctionExpression, targetStyleProp, t);
            }
            return true;
          }
        } else {
          // All modifiers are supported - process normally
          const styleExpression = processStaticClassNameWithModifiers(
            trimmedClassName,
            state,
            parseClassName,
            generateStyleKey,
            splitModifierClasses,
            t,
          );
          const modifierTypes = usedModifiers;
          const styleFunctionExpression = createStyleFunction(styleExpression, modifierTypes, t);

          const styleAttribute = findStyleAttribute(path, targetStyleProp, t);

          if (styleAttribute) {
            mergeStyleFunctionAttribute(path, styleAttribute, styleFunctionExpression, t);
          } else {
            replaceWithStyleFunctionAttribute(path, styleFunctionExpression, targetStyleProp, t);
          }
          return true;
        }
      } else {
        // Component doesn't support any modifiers
        if (process.env.NODE_ENV !== "production") {
          const usedModifiers = Array.from(new Set(stateModifiers.map((m) => m.modifier)));
          console.warn(
            `[react-native-tailwind] Modifiers (${usedModifiers.map((m) => `${m}:`).join(", ")}) can only be used on compatible components (Pressable, TextInput). Found on unsupported element at ${state.file.opts.filename ?? "unknown"}`,
          );
        }
        // Fall through to normal processing (ignore modifiers)
      }
    }

    // Normal processing without modifiers
    // Use baseClasses only (placeholder modifiers already handled separately)
    const classNameForStyle = baseClasses.join(" ");
    if (!classNameForStyle) {
      // No base classes, only had placeholder modifiers - just remove className
      path.remove();
      return true;
    }

    const styleObject = parseClassName(classNameForStyle, state.customTheme);

    // Check if the style object contains runtime dimension markers (w-screen, h-screen)
    if (hasRuntimeDimensions(styleObject)) {
      // Split into static and runtime parts
      const { static: staticStyles, runtime: runtimeStyles } = splitStaticAndRuntimeStyles(styleObject);

      // Track component scope for hook injection
      const componentScope = findComponentScope(path, t);
      if (componentScope) {
        state.hasClassNames = true; // Mark that we have classNames to process
        state.functionComponentsNeedingWindowDimensions.add(componentScope);
        state.needsWindowDimensionsImport = true;
        // Inject hook immediately for React Compiler compatibility
        injectWindowDimensionsHook(
          componentScope,
          state.windowDimensionsVariableName,
          "useWindowDimensions",
          state.windowDimensionsLocalIdentifier,
          t,
        );

        // Build style array: [staticStyles, { width: _twDimensions.width }]
        const styleExpressions: BabelTypes.Expression[] = [];

        // Add static styles if any
        if (Object.keys(staticStyles).length > 0) {
          const styleKey = generateStyleKey(classNameForStyle);
          state.styleRegistry.set(styleKey, staticStyles);
          styleExpressions.push(
            t.memberExpression(t.identifier(state.stylesIdentifier), t.identifier(styleKey)),
          );
        }

        // Add runtime dimension object
        const runtimeDimensionObject = createRuntimeDimensionObject(runtimeStyles, state, t);
        styleExpressions.push(runtimeDimensionObject);

        // Create style array or single expression
        const styleExpression =
          styleExpressions.length === 1 ? styleExpressions[0] : t.arrayExpression(styleExpressions);

        // Check if there's already a style prop on this element
        const styleAttribute = findStyleAttribute(path, targetStyleProp, t);

        if (styleAttribute) {
          // Merge with existing style attribute
          const existingStyle = styleAttribute.value;
          if (t.isJSXExpressionContainer(existingStyle) && !t.isJSXEmptyExpression(existingStyle.expression)) {
            const existing = existingStyle.expression;

            // Check if existing style is a function (e.g., Pressable's style prop)
            if (t.isArrowFunctionExpression(existing) || t.isFunctionExpression(existing)) {
              // Existing style is a function - create wrapper that calls it and merges results
              // (_state) => [styleExpression, existingStyleFn(_state)]
              const paramIdentifier = t.identifier("_state");
              const functionCall = t.callExpression(existing, [paramIdentifier]);

              const mergedArray = t.arrayExpression([styleExpression, functionCall]);

              const wrappedFunction = t.arrowFunctionExpression([paramIdentifier], mergedArray);
              styleAttribute.value = t.jsxExpressionContainer(wrappedFunction);
            } else {
              // Merge as array: [ourStyles, existingStyles]
              const mergedArray = t.isArrayExpression(existing)
                ? t.arrayExpression([styleExpression, ...existing.elements])
                : t.arrayExpression([styleExpression, existing]);
              styleAttribute.value = t.jsxExpressionContainer(mergedArray);
            }
          } else {
            styleAttribute.value = t.jsxExpressionContainer(styleExpression);
          }
          path.remove();
        } else {
          // Replace className with style prop containing runtime expression
          path.node.name = t.jsxIdentifier(targetStyleProp);
          path.node.value = t.jsxExpressionContainer(styleExpression);
        }
        return true;
      } else {
        // Warn if w-screen/h-screen used in invalid context
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[react-native-tailwind] w-screen/h-screen classes require a function component scope. ` +
              `Found in non-component context at ${state.file.opts.filename ?? "unknown"}. ` +
              `These classes are not supported in class components or nested callbacks.`,
          );
        }
        // Fall through to normal processing (will generate static styles, which won't work correctly)
      }
    }

    const styleKey = generateStyleKey(classNameForStyle);
    state.styleRegistry.set(styleKey, styleObject);

    // Check if there's already a style prop on this element
    const styleAttribute = findStyleAttribute(path, targetStyleProp, t);

    if (styleAttribute) {
      // Merge with existing style prop
      mergeStyleAttribute(path, styleAttribute, styleKey, state.stylesIdentifier, t);
    } else {
      // Replace className with style prop
      replaceWithStyleAttribute(path, styleKey, targetStyleProp, state.stylesIdentifier, t);
    }
    return true;
  };

  // Handle static string literals
  if (t.isStringLiteral(value)) {
    if (processStaticClassName(value.value)) {
      return;
    }
  }

  // Handle dynamic expressions (JSXExpressionContainer)
  if (t.isJSXExpressionContainer(value)) {
    const expression = value.expression;

    // Skip JSXEmptyExpression
    if (t.isJSXEmptyExpression(expression)) {
      return;
    }

    // Fast path: Support string literals wrapped in JSXExpressionContainer: className={"flex-row"}
    if (t.isStringLiteral(expression)) {
      if (processStaticClassName(expression.value)) {
        return;
      }
    }

    try {
      // Find component scope for color scheme modifiers
      const componentScope = findComponentScope(path, t);

      // Process dynamic expression with modifier support
      const result = processDynamicExpression(
        expression,
        state,
        parseClassName,
        generateStyleKey,
        splitModifierClasses,
        processPlatformModifiers,
        processColorSchemeModifiers,
        componentScope,
        isPlatformModifier as (modifier: unknown) => boolean,
        isColorSchemeModifier as (modifier: unknown) => boolean,
        isSchemeModifier as (modifier: unknown) => boolean,
        expandSchemeModifier,
        t,
      );

      if (result) {
        state.hasClassNames = true;

        // Check if there's already a style prop on this element
        const styleAttribute = findStyleAttribute(path, targetStyleProp, t);

        if (styleAttribute) {
          // Merge with existing style prop
          mergeDynamicStyleAttribute(path, styleAttribute, result, t);
        } else {
          // Replace className with style prop
          replaceDynamicWithStyleAttribute(path, result, targetStyleProp, t);
        }
        return;
      }
    } catch (error) {
      // Fall through to warning
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[react-native-tailwind] Failed to process dynamic ${attributeName} at ${state.file.opts.filename ?? "unknown"}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  // Unsupported dynamic className - warn in development
  if (process.env.NODE_ENV !== "production") {
    const filename = state.file.opts.filename ?? "unknown";
    console.warn(
      `[react-native-tailwind] Dynamic ${attributeName} values are not fully supported at ${filename}. ` +
        `Use the ${targetStyleProp} prop for dynamic values.`,
    );
  }
}
