/**
 * Type definitions for the variants system
 * Supports both Tailwind Variants (tv) and CVA (cva) style APIs
 */

import type { StyleObject } from "../types/core";

/**
 * A single variant option value - can be a class string, array of classes, or null
 */
export type VariantValue = string | string[] | null;

/**
 * Variant options - maps option names to their class values
 * e.g., { small: 'text-sm', medium: 'text-base', large: 'text-lg' }
 */
export type VariantOptions = Record<string, VariantValue>;

/**
 * Variants definition - maps variant names to their options
 * e.g., { size: { small: 'text-sm', medium: 'text-base' }, color: { primary: 'bg-blue-500' } }
 */
export type VariantsDefinition = Record<string, VariantOptions>;

/**
 * Extract variant props from a variants definition
 */
export type VariantProps<T extends VariantsDefinition> = {
  [K in keyof T]?: keyof T[K] | boolean;
};

/**
 * Compound variant condition - applies classes when multiple variant conditions match
 */
export type CompoundVariant<T extends VariantsDefinition> = {
  [K in keyof T]?: keyof T[K] | Array<keyof T[K]> | boolean;
} & {
  class?: VariantValue;
  className?: VariantValue;
};

/**
 * Default variants - fallback values when no variant is specified
 */
export type DefaultVariants<T extends VariantsDefinition> = {
  [K in keyof T]?: keyof T[K] | boolean;
};

/**
 * Slots definition - maps slot names to their base classes
 * e.g., { base: 'flex', avatar: 'w-12 h-12', content: 'flex-1' }
 */
export type SlotsDefinition = Record<string, string>;

/**
 * Slot variants - applies variant-specific classes to slots
 */
export type SlotVariants<S extends SlotsDefinition, V extends VariantsDefinition> = {
  [K in keyof V]?: {
    [O in keyof V[K]]?: {
      [Slot in keyof S]?: VariantValue;
    };
  };
};

/**
 * Slot compound variants
 */
export type SlotCompoundVariant<S extends SlotsDefinition, V extends VariantsDefinition> = {
  [K in keyof V]?: keyof V[K] | Array<keyof V[K]> | boolean;
} & {
  class?: {
    [Slot in keyof S]?: VariantValue;
  };
  className?: {
    [Slot in keyof S]?: VariantValue;
  };
};

/**
 * Configuration for createVariants (without slots)
 */
export type VariantsConfig<V extends VariantsDefinition> = {
  base?: string | string[];
  variants?: V;
  compoundVariants?: Array<CompoundVariant<V>>;
  defaultVariants?: DefaultVariants<V>;
};

/**
 * Configuration for createVariants (with slots)
 */
export type VariantsConfigWithSlots<S extends SlotsDefinition, V extends VariantsDefinition> = {
  slots: S;
  variants?: V;
  compoundVariants?: Array<SlotCompoundVariant<S, V>>;
  defaultVariants?: DefaultVariants<V>;
};

/**
 * Props passed to the generated variant function
 */
export type VariantFunctionProps<V extends VariantsDefinition> = VariantProps<V> & {
  class?: string;
  className?: string;
};

/**
 * Return type for variant function (without slots)
 */
export type VariantResult = {
  className: string;
  style: StyleObject;
};

/**
 * Return type for variant function (with slots)
 */
export type SlotVariantResult<S extends SlotsDefinition> = {
  [K in keyof S]: () => VariantResult;
};

/**
 * CVA-style configuration (base as first argument)
 */
export type CvaConfig<V extends VariantsDefinition> = {
  variants?: V;
  compoundVariants?: Array<CompoundVariant<V>>;
  defaultVariants?: DefaultVariants<V>;
};

/**
 * Type helper to extract variant props from a variant function
 */
export type ExtractVariantProps<T> = T extends (props?: infer P) => unknown
  ? Omit<P, "class" | "className">
  : never;
