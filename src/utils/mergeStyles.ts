/**
 * Smart merge utility for StyleObject values
 * Handles transform and filter arrays with "last wins" semantics for duplicate function types
 */

import type { FilterStyle, StyleObject, TransformStyle } from "../types/core";

/**
 * Get the transform type key from a transform object
 * e.g., { rotate: '45deg' } -> 'rotate', { scale: 1.1 } -> 'scale'
 */
function getTransformType(transform: TransformStyle): string {
  return Object.keys(transform)[0];
}

/**
 * Merge transform arrays with "last wins" semantics for duplicate transform types.
 * Different transform types are combined, but if the same type appears twice,
 * the later one replaces the earlier one (matching Tailwind CSS behavior).
 *
 * @example
 * // Different types are combined
 * mergeTransforms([{ rotate: '45deg' }], [{ scale: 1.1 }])
 * // => [{ rotate: '45deg' }, { scale: 1.1 }]
 *
 * @example
 * // Same type: last wins
 * mergeTransforms([{ rotate: '45deg' }], [{ rotate: '90deg' }])
 * // => [{ rotate: '90deg' }]
 */
function mergeTransforms(target: TransformStyle[], source: TransformStyle[]): TransformStyle[] {
  // Build result by processing target first, then source
  // For each source transform, replace any existing transform of the same type
  const result: TransformStyle[] = [...target];

  for (const sourceTransform of source) {
    const sourceType = getTransformType(sourceTransform);
    const existingIndex = result.findIndex((t) => getTransformType(t) === sourceType);

    if (existingIndex !== -1) {
      // Replace existing transform of same type (last wins)
      result[existingIndex] = sourceTransform;
    } else {
      // Add new transform type
      result.push(sourceTransform);
    }
  }

  return result;
}

function getFilterType(filter: FilterStyle): string {
  return Object.keys(filter)[0];
}

/**
 * Merge native filter arrays, composing different filter functions while the
 * last utility wins for duplicate filter types.
 */
function mergeFilters(target: FilterStyle[], source: FilterStyle[]): FilterStyle[] {
  if (source.length === 0) {
    return [];
  }

  const result: FilterStyle[] = [...target];

  for (const sourceFilter of source) {
    const sourceType = getFilterType(sourceFilter);
    const existingIndex = result.findIndex((filter) => getFilterType(filter) === sourceType);

    if (existingIndex !== -1) {
      result[existingIndex] = sourceFilter;
    } else {
      result.push(sourceFilter);
    }
  }

  return result;
}

/**
 * Merge two StyleObject instances, handling transform and filter arrays specially
 *
 * @param target - The target object to merge into (mutated)
 * @param source - The source object to merge from
 * @returns The merged target object
 *
 * @example
 * // Standard properties are overwritten (like Object.assign)
 * mergeStyles({ margin: 4 }, { padding: 8 })
 * // => { margin: 4, padding: 8 }
 *
 * @example
 * // Different transform types are combined
 * mergeStyles(
 *   { transform: [{ rotate: '45deg' }] },
 *   { transform: [{ scale: 1.1 }] }
 * )
 * // => { transform: [{ rotate: '45deg' }, { scale: 1.1 }] }
 *
 * @example
 * // Same transform type: last wins (Tailwind parity)
 * mergeStyles(
 *   { transform: [{ rotate: '45deg' }] },
 *   { transform: [{ rotate: '90deg' }] }
 * )
 * // => { transform: [{ rotate: '90deg' }] }
 */
export function mergeStyles(target: StyleObject, source: StyleObject): StyleObject {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];

      // Handle transform arrays specially
      if (key === "transform" && Array.isArray(sourceValue)) {
        const sourceTransforms = sourceValue as TransformStyle[];
        const targetValue = target.transform;
        if (Array.isArray(targetValue)) {
          // Merge transforms with "last wins" for same types
          target.transform = mergeTransforms(targetValue, sourceTransforms);
        } else {
          // No existing array, just assign
          target.transform = sourceTransforms;
        }
      } else if (key === "filter" && Array.isArray(sourceValue)) {
        const sourceFilters = sourceValue as FilterStyle[];
        const targetValue = target.filter;
        if (Array.isArray(targetValue)) {
          target.filter = mergeFilters(targetValue, sourceFilters);
        } else {
          target.filter = sourceFilters;
        }
      } else {
        // Standard Object.assign behavior for scalar and object properties
        target[key] = sourceValue;
      }
    }
  }

  return target;
}
