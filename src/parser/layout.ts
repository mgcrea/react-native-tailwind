/**
 * Layout utilities (flexbox, positioning, display)
 */

import type { StyleObject } from "../types";

/**
 * Parse arbitrary inset value: [123px], [123], [50%], [-10px]
 * Returns number for px values, string for % values, null for unsupported units
 */
function parseArbitraryInset(value: string): number | string | null {
  // Match: [123px], [123], [-123px], [-123] (pixels)
  const pxMatch = value.match(/^\[(-?\d+)(?:px)?\]$/);
  if (pxMatch) {
    return parseInt(pxMatch[1], 10);
  }

  // Match: [50%], [-50%] (percentage)
  const percentMatch = value.match(/^\[(-?\d+(?:\.\d+)?)%\]$/);
  if (percentMatch) {
    return `${percentMatch[1]}%`;
  }

  // Unsupported units (rem, em, vh, vw, etc.) - warn and reject
  if (value.startsWith("[") && value.endsWith("]")) {
    /* v8 ignore next 5 */
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Unsupported arbitrary inset unit: ${value}. Only px and % are supported.`,
      );
    }
    return null;
  }

  return null;
}

/**
 * Parse arbitrary z-index value: [123], [-10]
 * Returns number for valid z-index, null otherwise
 */
function parseArbitraryZIndex(value: string): number | null {
  // Match: [123], [-123] (integers only)
  const zMatch = value.match(/^\[(-?\d+)\]$/);
  if (zMatch) {
    return parseInt(zMatch[1], 10);
  }

  // Unsupported format - warn and reject
  if (value.startsWith("[") && value.endsWith("]")) {
    /* v8 ignore next 5 */
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Invalid arbitrary z-index: ${value}. Only integers are supported.`,
      );
    }
    return null;
  }

  return null;
}

/**
 * Parse arbitrary grow/shrink value: [1.5], [2], [0.5], [.5]
 * Returns number for valid non-negative values, null otherwise
 */
function parseArbitraryGrowShrink(value: string): number | null {
  // Match: [1.5], [2], [0], [0.5], [.5] (non-negative decimals, optional leading digit)
  const match = value.match(/^\[(\d+(?:\.\d+)?|\.\d+)\]$/);
  if (match) {
    return parseFloat(match[1]);
  }

  // Warn about invalid formats (negative values, unsupported formats)
  if (value.startsWith("[") && value.endsWith("]")) {
    /* v8 ignore next 5 */
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Invalid arbitrary grow/shrink value: ${value}. Only non-negative numbers are supported (e.g., [1.5], [2], [0.5], [.5]).`,
      );
    }
    return null;
  }

  return null;
}

/**
 * Parse an arbitrary opacity value: [.67], [0.67], [1], [67%].
 * React Native expects a normalized number from 0 to 1.
 */
function parseArbitraryOpacity(value: string): number | null {
  const match = value.match(/^\[(\d+(?:\.\d*)?|\.\d+)(%)?\]$/);
  if (match) {
    const parsed = Number.parseFloat(match[1]);
    const opacity = match[2] === "%" ? parsed / 100 : parsed;
    if (opacity >= 0 && opacity <= 1) {
      return opacity;
    }
  }

  if (value.startsWith("[") && value.endsWith("]")) {
    /* v8 ignore next 5 */
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Invalid arbitrary opacity value: ${value}. ` +
          "Use a raw value from 0 to 1 or a percentage from 0% to 100% (e.g., [.67], [0.67], [67%]).",
      );
    }
  }

  return null;
}

// Display utilities
const DISPLAY_MAP: Record<string, StyleObject> = {
  flex: { display: "flex" },
  hidden: { display: "none" },
};

// Flex direction utilities
const FLEX_DIRECTION_MAP: Record<string, StyleObject> = {
  "flex-row": { flexDirection: "row" },
  "flex-row-reverse": { flexDirection: "row-reverse" },
  "flex-col": { flexDirection: "column" },
  "flex-col-reverse": { flexDirection: "column-reverse" },
};

// Flex wrap utilities
const FLEX_WRAP_MAP: Record<string, StyleObject> = {
  "flex-wrap": { flexWrap: "wrap" },
  "flex-wrap-reverse": { flexWrap: "wrap-reverse" },
  "flex-nowrap": { flexWrap: "nowrap" },
};

// Flex utilities
const FLEX_MAP: Record<string, StyleObject> = {
  "flex-1": { flex: 1 },
  "flex-auto": { flex: 1 },
  "flex-none": { flex: 0 },
};

// Flex grow/shrink utilities (includes CSS-style aliases)
const GROW_SHRINK_MAP: Record<string, StyleObject> = {
  grow: { flexGrow: 1 },
  "grow-0": { flexGrow: 0 },
  shrink: { flexShrink: 1 },
  "shrink-0": { flexShrink: 0 },
  // CSS-style aliases
  "flex-grow": { flexGrow: 1 },
  "flex-grow-0": { flexGrow: 0 },
  "flex-shrink": { flexShrink: 1 },
  "flex-shrink-0": { flexShrink: 0 },
};

// Justify content utilities
const JUSTIFY_CONTENT_MAP: Record<string, StyleObject> = {
  "justify-start": { justifyContent: "flex-start" },
  "justify-end": { justifyContent: "flex-end" },
  "justify-center": { justifyContent: "center" },
  "justify-between": { justifyContent: "space-between" },
  "justify-around": { justifyContent: "space-around" },
  "justify-evenly": { justifyContent: "space-evenly" },
};

// Align items utilities
const ALIGN_ITEMS_MAP: Record<string, StyleObject> = {
  "items-start": { alignItems: "flex-start" },
  "items-end": { alignItems: "flex-end" },
  "items-center": { alignItems: "center" },
  "items-baseline": { alignItems: "baseline" },
  "items-stretch": { alignItems: "stretch" },
};

// Align self utilities
const ALIGN_SELF_MAP: Record<string, StyleObject> = {
  "self-auto": { alignSelf: "auto" },
  "self-start": { alignSelf: "flex-start" },
  "self-end": { alignSelf: "flex-end" },
  "self-center": { alignSelf: "center" },
  "self-stretch": { alignSelf: "stretch" },
  "self-baseline": { alignSelf: "baseline" },
};

// Align content utilities
const ALIGN_CONTENT_MAP: Record<string, StyleObject> = {
  "content-start": { alignContent: "flex-start" },
  "content-end": { alignContent: "flex-end" },
  "content-center": { alignContent: "center" },
  "content-between": { alignContent: "space-between" },
  "content-around": { alignContent: "space-around" },
  "content-stretch": { alignContent: "stretch" },
};

// Position utilities
const POSITION_MAP: Record<string, StyleObject> = {
  absolute: { position: "absolute" },
  relative: { position: "relative" },
};

// Overflow utilities
const OVERFLOW_MAP: Record<string, StyleObject> = {
  "overflow-hidden": { overflow: "hidden" },
  "overflow-visible": { overflow: "visible" },
  "overflow-scroll": { overflow: "scroll" },
};

// Opacity utilities
const OPACITY_MAP: Record<string, StyleObject> = {
  "opacity-0": { opacity: 0 },
  "opacity-5": { opacity: 0.05 },
  "opacity-10": { opacity: 0.1 },
  "opacity-15": { opacity: 0.15 },
  "opacity-20": { opacity: 0.2 },
  "opacity-25": { opacity: 0.25 },
  "opacity-30": { opacity: 0.3 },
  "opacity-35": { opacity: 0.35 },
  "opacity-40": { opacity: 0.4 },
  "opacity-45": { opacity: 0.45 },
  "opacity-50": { opacity: 0.5 },
  "opacity-55": { opacity: 0.55 },
  "opacity-60": { opacity: 0.6 },
  "opacity-65": { opacity: 0.65 },
  "opacity-70": { opacity: 0.7 },
  "opacity-75": { opacity: 0.75 },
  "opacity-80": { opacity: 0.8 },
  "opacity-85": { opacity: 0.85 },
  "opacity-90": { opacity: 0.9 },
  "opacity-95": { opacity: 0.95 },
  "opacity-100": { opacity: 1 },
};

// Z-index scale
export const Z_INDEX_SCALE: Record<string, number> = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  auto: 0, // React Native doesn't have 'auto', default to 0
};

// Inset scale (for top/right/bottom/left positioning in pixels)
export const INSET_SCALE: Record<string, number> = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

/**
 * Parse layout classes
 * @param cls - The class name to parse
 * @param customSpacing - Optional custom spacing values from tailwind.config (for inset utilities)
 */
export function parseLayout(cls: string, customSpacing?: Record<string, number>): StyleObject | null {
  // Merge custom spacing with defaults for inset utilities
  const insetMap = customSpacing ? { ...INSET_SCALE, ...customSpacing } : INSET_SCALE;

  if (cls.startsWith("opacity-")) {
    const arbitraryOpacity = parseArbitraryOpacity(cls.substring(8));
    if (arbitraryOpacity !== null) {
      return { opacity: arbitraryOpacity };
    }
  }

  // Z-index: z-0, z-10, z-20, z-[999], etc.
  if (cls.startsWith("z-")) {
    const zKey = cls.substring(2);

    // Arbitrary values: z-[123], z-[-10]
    const arbitraryZ = parseArbitraryZIndex(zKey);
    if (arbitraryZ !== null) {
      return { zIndex: arbitraryZ };
    }

    const zValue = Z_INDEX_SCALE[zKey];
    if (zValue !== undefined) {
      return { zIndex: zValue };
    }
  }

  // Top positioning: top-0, top-4, top-[10px], top-[50%], -top-4, etc.
  const topMatch = cls.match(/^(-?)top-(.+)$/);
  if (topMatch) {
    const [, negPrefix, topKey] = topMatch;
    const isNegative = negPrefix === "-";

    // Auto value - return empty object (no-op, removes the property)
    if (topKey === "auto") {
      return {};
    }

    // Arbitrary values: top-[123px], top-[50%], -top-[10px]
    const arbitraryTop = parseArbitraryInset(topKey);
    if (arbitraryTop !== null) {
      if (typeof arbitraryTop === "number") {
        return { top: isNegative ? -arbitraryTop : arbitraryTop };
      }
      // Percentage values with negative prefix
      if (isNegative && arbitraryTop.endsWith("%")) {
        const numValue = parseFloat(arbitraryTop);
        return { top: `${-numValue}%` };
      }
      return { top: arbitraryTop };
    }

    const topValue = insetMap[topKey];
    if (topValue !== undefined) {
      return { top: isNegative ? -topValue : topValue };
    }
  }

  // Right positioning: right-0, right-4, right-[10px], right-[50%], -right-4, etc.
  const rightMatch = cls.match(/^(-?)right-(.+)$/);
  if (rightMatch) {
    const [, negPrefix, rightKey] = rightMatch;
    const isNegative = negPrefix === "-";

    // Auto value - return empty object (no-op, removes the property)
    if (rightKey === "auto") {
      return {};
    }

    // Arbitrary values: right-[123px], right-[50%], -right-[10px]
    const arbitraryRight = parseArbitraryInset(rightKey);
    if (arbitraryRight !== null) {
      if (typeof arbitraryRight === "number") {
        return { right: isNegative ? -arbitraryRight : arbitraryRight };
      }
      // Percentage values with negative prefix
      if (isNegative && arbitraryRight.endsWith("%")) {
        const numValue = parseFloat(arbitraryRight);
        return { right: `${-numValue}%` };
      }
      return { right: arbitraryRight };
    }

    const rightValue = insetMap[rightKey];
    if (rightValue !== undefined) {
      return { right: isNegative ? -rightValue : rightValue };
    }
  }

  // Bottom positioning: bottom-0, bottom-4, bottom-[10px], bottom-[50%], -bottom-4, etc.
  const bottomMatch = cls.match(/^(-?)bottom-(.+)$/);
  if (bottomMatch) {
    const [, negPrefix, bottomKey] = bottomMatch;
    const isNegative = negPrefix === "-";

    // Auto value - return empty object (no-op, removes the property)
    if (bottomKey === "auto") {
      return {};
    }

    // Arbitrary values: bottom-[123px], bottom-[50%], -bottom-[10px]
    const arbitraryBottom = parseArbitraryInset(bottomKey);
    if (arbitraryBottom !== null) {
      if (typeof arbitraryBottom === "number") {
        return { bottom: isNegative ? -arbitraryBottom : arbitraryBottom };
      }
      // Percentage values with negative prefix
      if (isNegative && arbitraryBottom.endsWith("%")) {
        const numValue = parseFloat(arbitraryBottom);
        return { bottom: `${-numValue}%` };
      }
      return { bottom: arbitraryBottom };
    }

    const bottomValue = insetMap[bottomKey];
    if (bottomValue !== undefined) {
      return { bottom: isNegative ? -bottomValue : bottomValue };
    }
  }

  // Left positioning: left-0, left-4, left-[10px], left-[50%], -left-4, etc.
  const leftMatch = cls.match(/^(-?)left-(.+)$/);
  if (leftMatch) {
    const [, negPrefix, leftKey] = leftMatch;
    const isNegative = negPrefix === "-";

    // Auto value - return empty object (no-op, removes the property)
    if (leftKey === "auto") {
      return {};
    }

    // Arbitrary values: left-[123px], left-[50%], -left-[10px]
    const arbitraryLeft = parseArbitraryInset(leftKey);
    if (arbitraryLeft !== null) {
      if (typeof arbitraryLeft === "number") {
        return { left: isNegative ? -arbitraryLeft : arbitraryLeft };
      }
      // Percentage values with negative prefix
      if (isNegative && arbitraryLeft.endsWith("%")) {
        const numValue = parseFloat(arbitraryLeft);
        return { left: `${-numValue}%` };
      }
      return { left: arbitraryLeft };
    }

    const leftValue = insetMap[leftKey];
    if (leftValue !== undefined) {
      return { left: isNegative ? -leftValue : leftValue };
    }
  }

  // Start positioning (RTL-aware): start-0, start-4, start-[10px], -start-4, etc.
  const startMatch = cls.match(/^(-?)start-(.+)$/);
  if (startMatch) {
    const [, negPrefix, startKey] = startMatch;
    const isNegative = negPrefix === "-";

    // Auto value - return empty object (no-op, removes the property)
    if (startKey === "auto") {
      return {};
    }

    // Arbitrary values: start-[123px], start-[50%], -start-[10px]
    const arbitraryStart = parseArbitraryInset(startKey);
    if (arbitraryStart !== null) {
      if (typeof arbitraryStart === "number") {
        return { start: isNegative ? -arbitraryStart : arbitraryStart };
      }
      // Percentage values with negative prefix
      if (isNegative && arbitraryStart.endsWith("%")) {
        const numValue = parseFloat(arbitraryStart);
        return { start: `${-numValue}%` };
      }
      return { start: arbitraryStart };
    }

    const startValue = insetMap[startKey];
    if (startValue !== undefined) {
      return { start: isNegative ? -startValue : startValue };
    }
  }

  // End positioning (RTL-aware): end-0, end-4, end-[10px], -end-4, etc.
  const endMatch = cls.match(/^(-?)end-(.+)$/);
  if (endMatch) {
    const [, negPrefix, endKey] = endMatch;
    const isNegative = negPrefix === "-";

    // Auto value - return empty object (no-op, removes the property)
    if (endKey === "auto") {
      return {};
    }

    // Arbitrary values: end-[123px], end-[50%], -end-[10px]
    const arbitraryEnd = parseArbitraryInset(endKey);
    if (arbitraryEnd !== null) {
      if (typeof arbitraryEnd === "number") {
        return { end: isNegative ? -arbitraryEnd : arbitraryEnd };
      }
      // Percentage values with negative prefix
      if (isNegative && arbitraryEnd.endsWith("%")) {
        const numValue = parseFloat(arbitraryEnd);
        return { end: `${-numValue}%` };
      }
      return { end: arbitraryEnd };
    }

    const endValue = insetMap[endKey];
    if (endValue !== undefined) {
      return { end: isNegative ? -endValue : endValue };
    }
  }

  // Inset X (left and right): inset-x-0, inset-x-4, inset-x-[10px], etc.
  if (cls.startsWith("inset-x-")) {
    const insetKey = cls.substring(8);

    // Arbitrary values: inset-x-[123px], inset-x-[50%]
    const arbitraryInset = parseArbitraryInset(insetKey);
    if (arbitraryInset !== null) {
      return { left: arbitraryInset, right: arbitraryInset };
    }

    const insetValue = insetMap[insetKey];
    if (insetValue !== undefined) {
      return { left: insetValue, right: insetValue };
    }
  }

  // Inset Y (top and bottom): inset-y-0, inset-y-4, inset-y-[10px], etc.
  if (cls.startsWith("inset-y-")) {
    const insetKey = cls.substring(8);

    // Arbitrary values: inset-y-[123px], inset-y-[50%]
    const arbitraryInset = parseArbitraryInset(insetKey);
    if (arbitraryInset !== null) {
      return { top: arbitraryInset, bottom: arbitraryInset };
    }

    const insetValue = insetMap[insetKey];
    if (insetValue !== undefined) {
      return { top: insetValue, bottom: insetValue };
    }
  }

  // Inset S (start, RTL-aware): inset-s-0, inset-s-4, inset-s-[10px], etc.
  if (cls.startsWith("inset-s-")) {
    const insetKey = cls.substring(8);

    // Arbitrary values: inset-s-[123px], inset-s-[50%]
    const arbitraryInset = parseArbitraryInset(insetKey);
    if (arbitraryInset !== null) {
      return { start: arbitraryInset };
    }

    const insetValue = insetMap[insetKey];
    if (insetValue !== undefined) {
      return { start: insetValue };
    }
  }

  // Inset E (end, RTL-aware): inset-e-0, inset-e-4, inset-e-[10px], etc.
  if (cls.startsWith("inset-e-")) {
    const insetKey = cls.substring(8);

    // Arbitrary values: inset-e-[123px], inset-e-[50%]
    const arbitraryInset = parseArbitraryInset(insetKey);
    if (arbitraryInset !== null) {
      return { end: arbitraryInset };
    }

    const insetValue = insetMap[insetKey];
    if (insetValue !== undefined) {
      return { end: insetValue };
    }
  }

  // Inset (all sides): inset-0, inset-4, inset-[10px], etc.
  if (cls.startsWith("inset-")) {
    const insetKey = cls.substring(6);

    // Arbitrary values: inset-[123px], inset-[50%]
    const arbitraryInset = parseArbitraryInset(insetKey);
    if (arbitraryInset !== null) {
      return { top: arbitraryInset, right: arbitraryInset, bottom: arbitraryInset, left: arbitraryInset };
    }

    const insetValue = insetMap[insetKey];
    if (insetValue !== undefined) {
      return { top: insetValue, right: insetValue, bottom: insetValue, left: insetValue };
    }
  }

  // Flex grow: grow-[1.5], flex-grow-[2], etc. (arbitrary values)
  if (cls.startsWith("grow-") || cls.startsWith("flex-grow-")) {
    const prefix = cls.startsWith("flex-grow-") ? "flex-grow-" : "grow-";
    const growKey = cls.substring(prefix.length);

    // Arbitrary values: grow-[1.5], flex-grow-[2]
    const arbitraryGrow = parseArbitraryGrowShrink(growKey);
    if (arbitraryGrow !== null) {
      return { flexGrow: arbitraryGrow };
    }
  }

  // Flex shrink: shrink-[0.5], flex-shrink-[1], etc. (arbitrary values)
  if (cls.startsWith("shrink-") || cls.startsWith("flex-shrink-")) {
    const prefix = cls.startsWith("flex-shrink-") ? "flex-shrink-" : "shrink-";
    const shrinkKey = cls.substring(prefix.length);

    // Arbitrary values: shrink-[0.5], flex-shrink-[1]
    const arbitraryShrink = parseArbitraryGrowShrink(shrinkKey);
    if (arbitraryShrink !== null) {
      return { flexShrink: arbitraryShrink };
    }
  }

  // Try each lookup table in order
  return (
    DISPLAY_MAP[cls] ??
    FLEX_DIRECTION_MAP[cls] ??
    FLEX_WRAP_MAP[cls] ??
    FLEX_MAP[cls] ??
    GROW_SHRINK_MAP[cls] ??
    JUSTIFY_CONTENT_MAP[cls] ??
    ALIGN_ITEMS_MAP[cls] ??
    ALIGN_SELF_MAP[cls] ??
    ALIGN_CONTENT_MAP[cls] ??
    POSITION_MAP[cls] ??
    OVERFLOW_MAP[cls] ??
    OPACITY_MAP[cls] ??
    null
  );
}
