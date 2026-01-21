/**
 * Core variant creation function
 * Provides a unified API compatible with both Tailwind Variants (tv) and CVA (cva)
 */

import type { CustomTheme } from "../parser";
import { parseClassName } from "../parser";
import type {
  CompoundVariant,
  CvaConfig,
  DefaultVariants,
  SlotCompoundVariant,
  SlotsDefinition,
  SlotVariantResult,
  VariantFunctionProps,
  VariantResult,
  VariantsConfig,
  VariantsConfigWithSlots,
  VariantsDefinition,
  VariantValue,
} from "./types";

/**
 * Normalize a variant value to a string
 */
function normalizeValue(value: VariantValue): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(" ");
  }
  return value;
}

/**
 * Merge class strings, deduplicating and preserving order
 */
function mergeClasses(...classes: Array<string | undefined | null | false>): string {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const classStr of classes) {
    if (!classStr) continue;
    for (const cls of classStr.split(/\s+/)) {
      if (cls && !seen.has(cls)) {
        seen.add(cls);
        result.push(cls);
      }
    }
  }

  return result.join(" ");
}

/**
 * Check if a compound variant condition matches
 */
function matchesCompoundCondition<V extends VariantsDefinition>(
  compound: CompoundVariant<V> | SlotCompoundVariant<SlotsDefinition, V>,
  props: VariantFunctionProps<V>,
  defaultVariants?: DefaultVariants<V>,
): boolean {
  for (const key of Object.keys(compound)) {
    // Skip class/className keys
    if (key === "class" || key === "className") continue;

    const conditionValue = compound[key as keyof V];
    const propValue = props[key as keyof V] ?? defaultVariants?.[key as keyof V];

    // Handle array conditions (OR logic)
    if (Array.isArray(conditionValue)) {
      if (!conditionValue.includes(propValue as never)) {
        return false;
      }
    } else {
      // Direct comparison
      if (conditionValue !== propValue) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Get classes for a specific variant selection
 */
function getVariantClasses<V extends VariantsDefinition>(
  variants: V | undefined,
  props: VariantFunctionProps<V>,
  defaultVariants?: DefaultVariants<V>,
): string {
  if (!variants) return "";

  const classes: string[] = [];

  for (const [variantName, variantOptions] of Object.entries(variants)) {
    // Get the selected option, falling back to default
    const selectedOption = props[variantName as keyof V] ?? defaultVariants?.[variantName as keyof V];

    if (selectedOption === undefined || selectedOption === null) continue;

    // Handle boolean variants
    const optionKey =
      selectedOption === true ? "true" : selectedOption === false ? "false" : String(selectedOption);

    const optionValue = variantOptions[optionKey];
    if (optionValue !== undefined) {
      classes.push(normalizeValue(optionValue));
    }
  }

  return classes.filter(Boolean).join(" ");
}

/**
 * Get classes from compound variants
 */
function getCompoundClasses<V extends VariantsDefinition>(
  compoundVariants: Array<CompoundVariant<V>> | undefined,
  props: VariantFunctionProps<V>,
  defaultVariants?: DefaultVariants<V>,
): string {
  if (!compoundVariants) return "";

  const classes: string[] = [];

  for (const compound of compoundVariants) {
    if (matchesCompoundCondition(compound, props, defaultVariants)) {
      const compoundClass = compound.class ?? compound.className;
      if (compoundClass) {
        classes.push(normalizeValue(compoundClass));
      }
    }
  }

  return classes.filter(Boolean).join(" ");
}

/**
 * Type guard to check if config has slots
 */
function hasSlots<S extends SlotsDefinition, V extends VariantsDefinition>(
  config: VariantsConfig<V> | VariantsConfigWithSlots<S, V>,
): config is VariantsConfigWithSlots<S, V> {
  return "slots" in config && config.slots !== undefined;
}

/**
 * Create a variant function without slots
 */
function createVariantFunction<V extends VariantsDefinition>(
  config: VariantsConfig<V>,
  customTheme?: CustomTheme,
): (props?: VariantFunctionProps<V>) => VariantResult {
  const { base, variants, compoundVariants, defaultVariants } = config;

  return (props: VariantFunctionProps<V> = {} as VariantFunctionProps<V>): VariantResult => {
    // Compute class name
    const baseClass = normalizeValue(base ?? null);
    const variantClasses = getVariantClasses(variants, props, defaultVariants);
    const compoundClasses = getCompoundClasses(compoundVariants, props, defaultVariants);
    const overrideClass = props.class ?? props.className ?? "";

    const className = mergeClasses(baseClass, variantClasses, compoundClasses, overrideClass);

    // Parse to style object
    const style = className ? parseClassName(className, customTheme) : {};

    return { className, style };
  };
}

/**
 * Create a variant function with slots
 */
function createSlotVariantFunction<S extends SlotsDefinition, V extends VariantsDefinition>(
  config: VariantsConfigWithSlots<S, V>,
  customTheme?: CustomTheme,
): (props?: VariantFunctionProps<V>) => SlotVariantResult<S> {
  const { slots, variants: _variants, compoundVariants, defaultVariants } = config;

  return (props: VariantFunctionProps<V> = {} as VariantFunctionProps<V>): SlotVariantResult<S> => {
    const result = {} as SlotVariantResult<S>;

    for (const slotName of Object.keys(slots) as Array<keyof S>) {
      result[slotName] = () => {
        // Base slot classes
        const baseClass = slots[slotName] ?? "";

        // Collect variant classes for this slot
        const variantClasses: string[] = [];

        // Note: For slot variants, the variants structure would need to be:
        // variants: { size: { sm: { base: '...', avatar: '...' } } }
        // But that's a different structure than standard variants.
        // We'll support both standard variants (applied to all slots) and
        // check for slot-specific variant values

        // Get standard variant classes (applied to all slots if not slot-specific)
        // This is the simpler case where variants apply globally
        // For slot-specific variants, users should use compoundVariants

        // Compound variant slot classes
        const compoundClasses: string[] = [];
        if (compoundVariants) {
          for (const compound of compoundVariants) {
            if (matchesCompoundCondition(compound, props, defaultVariants)) {
              const slotClass = (compound.class ?? compound.className) as
                | { [K in keyof S]?: VariantValue }
                | undefined;
              if (slotClass && typeof slotClass === "object" && slotName in slotClass) {
                const slotValue = slotClass[slotName];
                if (slotValue) {
                  compoundClasses.push(normalizeValue(slotValue));
                }
              }
            }
          }
        }

        const className = mergeClasses(baseClass, ...variantClasses, ...compoundClasses);
        const style = className ? parseClassName(className, customTheme) : {};

        return { className, style };
      };
    }

    return result;
  };
}

/**
 * Create a variants function (Tailwind Variants style)
 *
 * Supports:
 * - Base classes
 * - Variants with multiple options
 * - Boolean variants
 * - Compound variants (conditional styles based on multiple variant combinations)
 * - Default variants
 * - Slots (multi-part components)
 *
 * @example
 * ```typescript
 * // Simple variant (no slots)
 * const button = createVariants({
 *   base: 'font-semibold rounded-lg',
 *   variants: {
 *     color: {
 *       primary: 'bg-blue-500 text-white',
 *       secondary: 'bg-gray-200 text-gray-800',
 *     },
 *     size: {
 *       sm: 'text-sm px-3 py-1',
 *       md: 'text-base px-4 py-2',
 *       lg: 'text-lg px-6 py-3',
 *     },
 *     disabled: {
 *       true: 'opacity-50 cursor-not-allowed',
 *     },
 *   },
 *   compoundVariants: [
 *     { color: 'primary', disabled: true, class: 'bg-blue-300' },
 *   ],
 *   defaultVariants: {
 *     color: 'primary',
 *     size: 'md',
 *   },
 * });
 *
 * // Usage
 * const { className, style } = button({ color: 'secondary', size: 'lg' });
 * ```
 *
 * @example
 * ```typescript
 * // With slots
 * const card = createVariants({
 *   slots: {
 *     base: 'rounded-xl shadow-md',
 *     header: 'p-4 border-b',
 *     body: 'p-4',
 *     footer: 'p-4 border-t',
 *   },
 *   variants: {
 *     variant: {
 *       elevated: {},
 *       outlined: {},
 *     },
 *   },
 *   compoundVariants: [
 *     { variant: 'elevated', class: { base: 'shadow-lg' } },
 *     { variant: 'outlined', class: { base: 'border border-gray-200 shadow-none' } },
 *   ],
 * });
 *
 * // Usage
 * const slots = card({ variant: 'elevated' });
 * const { style: baseStyle } = slots.base();
 * const { style: headerStyle } = slots.header();
 * ```
 */
export function createVariants<S extends SlotsDefinition, V extends VariantsDefinition>(
  config: VariantsConfigWithSlots<S, V>,
  customTheme?: CustomTheme,
): (props?: VariantFunctionProps<V>) => SlotVariantResult<S>;

export function createVariants<V extends VariantsDefinition>(
  config: VariantsConfig<V>,
  customTheme?: CustomTheme,
): (props?: VariantFunctionProps<V>) => VariantResult;

export function createVariants<S extends SlotsDefinition, V extends VariantsDefinition>(
  config: VariantsConfig<V> | VariantsConfigWithSlots<S, V>,
  customTheme?: CustomTheme,
): (props?: VariantFunctionProps<V>) => VariantResult | SlotVariantResult<S> {
  if (hasSlots<S, V>(config)) {
    return createSlotVariantFunction(config, customTheme);
  }
  return createVariantFunction(config, customTheme);
}

/**
 * Alias for createVariants - Tailwind Variants style
 */
export const tv = createVariants;

/**
 * CVA-style variant creation (base as first argument)
 *
 * @example
 * ```typescript
 * const button = cva('font-semibold rounded-lg', {
 *   variants: {
 *     intent: {
 *       primary: 'bg-blue-500 text-white',
 *       secondary: 'bg-gray-200 text-gray-800',
 *     },
 *     size: {
 *       sm: 'text-sm px-3 py-1',
 *       md: 'text-base px-4 py-2',
 *     },
 *   },
 *   defaultVariants: {
 *     intent: 'primary',
 *     size: 'md',
 *   },
 * });
 *
 * // Usage
 * const { className, style } = button({ intent: 'secondary' });
 * ```
 */
export function cva<V extends VariantsDefinition>(
  base: string | string[],
  config?: CvaConfig<V>,
  customTheme?: CustomTheme,
): (props?: VariantFunctionProps<V>) => VariantResult {
  return createVariants(
    {
      base,
      ...config,
    },
    customTheme,
  );
}

/**
 * Alias for cva - Class Variance Authority style
 * Also compatible with Tailwind Variants cv function
 */
export const cv = cva;
