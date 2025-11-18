/**
 * Transform utilities (scale, rotate, translate, skew, perspective)
 */

import type { StyleObject } from "../types";
import { SPACING_SCALE } from "./spacing";

// Scale values (percentage to decimal)
export const SCALE_MAP: Record<string, number> = {
  0: 0,
  50: 0.5,
  75: 0.75,
  90: 0.9,
  95: 0.95,
  100: 1,
  105: 1.05,
  110: 1.1,
  125: 1.25,
  150: 1.5,
  200: 2,
};

// Rotation degrees
export const ROTATE_MAP: Record<string, number> = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  6: 6,
  12: 12,
  45: 45,
  90: 90,
  180: 180,
};

// Skew degrees
export const SKEW_MAP: Record<string, number> = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  6: 6,
  12: 12,
};

// Perspective values
export const PERSPECTIVE_SCALE: Record<string, number> = {
  0: 0,
  100: 100,
  200: 200,
  300: 300,
  400: 400,
  500: 500,
  600: 600,
  700: 700,
  800: 800,
  900: 900,
  1000: 1000,
};

/**
 * Parse arbitrary scale value: [1.23], [0.5]
 * Returns number for valid scale, null otherwise
 */
function parseArbitraryScale(value: string): number | null {
  const scaleMatch = value.match(/^\[(-?\d+(?:\.\d+)?)\]$/);
  if (scaleMatch) {
    return parseFloat(scaleMatch[1]);
  }

  // Unsupported format
  if (value.startsWith("[") && value.endsWith("]")) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Invalid arbitrary scale value: ${value}. Only numbers are supported (e.g., [1.5], [0.75]).`,
      );
    }
    return null;
  }

  return null;
}

/**
 * Parse arbitrary rotation value: [37deg], [-15deg]
 * Returns string for valid rotation, null otherwise
 */
function parseArbitraryRotation(value: string): string | null {
  const rotateMatch = value.match(/^\[(-?\d+(?:\.\d+)?)deg\]$/);
  if (rotateMatch) {
    return `${rotateMatch[1]}deg`;
  }

  // Unsupported format
  if (value.startsWith("[") && value.endsWith("]")) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Invalid arbitrary rotation value: ${value}. Only deg unit is supported (e.g., [45deg], [-15deg]).`,
      );
    }
    return null;
  }

  return null;
}

/**
 * Parse arbitrary translation value: [123px], [123], [50%], [-10px]
 * Returns number for px values, string for % values, null for unsupported units
 */
function parseArbitraryTranslation(value: string): number | string | null {
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

  // Unsupported units
  if (value.startsWith("[") && value.endsWith("]")) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Unsupported arbitrary translation unit: ${value}. Only px and % are supported.`,
      );
    }
    return null;
  }

  return null;
}

/**
 * Parse arbitrary perspective value: [1500], [2000]
 * Returns number for valid perspective, null otherwise
 */
function parseArbitraryPerspective(value: string): number | null {
  const perspectiveMatch = value.match(/^\[(-?\d+)\]$/);
  if (perspectiveMatch) {
    return parseInt(perspectiveMatch[1], 10);
  }

  // Unsupported format
  if (value.startsWith("[") && value.endsWith("]")) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] Invalid arbitrary perspective value: ${value}. Only integers are supported (e.g., [1500]).`,
      );
    }
    return null;
  }

  return null;
}

/**
 * Parse transform classes
 * Each transform class returns a transform array with a single transform object
 */
export function parseTransform(cls: string): StyleObject | null {
  // Transform origin warning (not supported in React Native)
  if (cls.startsWith("origin-")) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[react-native-tailwind] transform-origin is not supported in React Native. Class "${cls}" will be ignored.`,
      );
    }
    return null;
  }

  // Scale: scale-{value}
  if (cls.startsWith("scale-")) {
    const scaleKey = cls.substring(6);

    // Arbitrary values: scale-[1.23]
    const arbitraryScale = parseArbitraryScale(scaleKey);
    if (arbitraryScale !== null) {
      return { transform: [{ scale: arbitraryScale }] };
    }

    const scaleValue = SCALE_MAP[scaleKey];
    if (scaleValue !== undefined) {
      return { transform: [{ scale: scaleValue }] };
    }
  }

  // Scale X: scale-x-{value}
  if (cls.startsWith("scale-x-")) {
    const scaleKey = cls.substring(8);

    // Arbitrary values: scale-x-[1.5]
    const arbitraryScale = parseArbitraryScale(scaleKey);
    if (arbitraryScale !== null) {
      return { transform: [{ scaleX: arbitraryScale }] };
    }

    const scaleValue = SCALE_MAP[scaleKey];
    if (scaleValue !== undefined) {
      return { transform: [{ scaleX: scaleValue }] };
    }
  }

  // Scale Y: scale-y-{value}
  if (cls.startsWith("scale-y-")) {
    const scaleKey = cls.substring(8);

    // Arbitrary values: scale-y-[2.5]
    const arbitraryScale = parseArbitraryScale(scaleKey);
    if (arbitraryScale !== null) {
      return { transform: [{ scaleY: arbitraryScale }] };
    }

    const scaleValue = SCALE_MAP[scaleKey];
    if (scaleValue !== undefined) {
      return { transform: [{ scaleY: scaleValue }] };
    }
  }

  // Rotate: rotate-{degrees}, -rotate-{degrees}
  if (cls.startsWith("rotate-") || cls.startsWith("-rotate-")) {
    const isNegative = cls.startsWith("-");
    const rotateKey = isNegative ? cls.substring(8) : cls.substring(7);

    // Arbitrary values: rotate-[37deg], -rotate-[15deg]
    const arbitraryRotate = parseArbitraryRotation(rotateKey);
    if (arbitraryRotate !== null) {
      const degrees = isNegative ? `-${arbitraryRotate}` : arbitraryRotate;
      return { transform: [{ rotate: degrees }] };
    }

    const rotateValue = ROTATE_MAP[rotateKey];
    if (rotateValue !== undefined) {
      const degrees = isNegative ? -rotateValue : rotateValue;
      return { transform: [{ rotate: `${degrees}deg` }] };
    }
  }

  // Rotate X: rotate-x-{degrees}, -rotate-x-{degrees}
  if (cls.startsWith("rotate-x-") || cls.startsWith("-rotate-x-")) {
    const isNegative = cls.startsWith("-");
    const rotateKey = isNegative ? cls.substring(10) : cls.substring(9);

    // Arbitrary values
    const arbitraryRotate = parseArbitraryRotation(rotateKey);
    if (arbitraryRotate !== null) {
      const degrees = isNegative ? `-${arbitraryRotate}` : arbitraryRotate;
      return { transform: [{ rotateX: degrees }] };
    }

    const rotateValue = ROTATE_MAP[rotateKey];
    if (rotateValue !== undefined) {
      const degrees = isNegative ? -rotateValue : rotateValue;
      return { transform: [{ rotateX: `${degrees}deg` }] };
    }
  }

  // Rotate Y: rotate-y-{degrees}, -rotate-y-{degrees}
  if (cls.startsWith("rotate-y-") || cls.startsWith("-rotate-y-")) {
    const isNegative = cls.startsWith("-");
    const rotateKey = isNegative ? cls.substring(10) : cls.substring(9);

    // Arbitrary values
    const arbitraryRotate = parseArbitraryRotation(rotateKey);
    if (arbitraryRotate !== null) {
      const degrees = isNegative ? `-${arbitraryRotate}` : arbitraryRotate;
      return { transform: [{ rotateY: degrees }] };
    }

    const rotateValue = ROTATE_MAP[rotateKey];
    if (rotateValue !== undefined) {
      const degrees = isNegative ? -rotateValue : rotateValue;
      return { transform: [{ rotateY: `${degrees}deg` }] };
    }
  }

  // Rotate Z: rotate-z-{degrees}, -rotate-z-{degrees}
  if (cls.startsWith("rotate-z-") || cls.startsWith("-rotate-z-")) {
    const isNegative = cls.startsWith("-");
    const rotateKey = isNegative ? cls.substring(10) : cls.substring(9);

    // Arbitrary values
    const arbitraryRotate = parseArbitraryRotation(rotateKey);
    if (arbitraryRotate !== null) {
      const degrees = isNegative ? `-${arbitraryRotate}` : arbitraryRotate;
      return { transform: [{ rotateZ: degrees }] };
    }

    const rotateValue = ROTATE_MAP[rotateKey];
    if (rotateValue !== undefined) {
      const degrees = isNegative ? -rotateValue : rotateValue;
      return { transform: [{ rotateZ: `${degrees}deg` }] };
    }
  }

  // Translate X: translate-x-{spacing}, -translate-x-{spacing}
  if (cls.startsWith("translate-x-") || cls.startsWith("-translate-x-")) {
    const isNegative = cls.startsWith("-");
    const translateKey = isNegative ? cls.substring(13) : cls.substring(12);

    // Arbitrary values: translate-x-[123px], -translate-x-[10px]
    const arbitraryTranslate = parseArbitraryTranslation(translateKey);
    if (arbitraryTranslate !== null) {
      const value =
        typeof arbitraryTranslate === "number"
          ? isNegative
            ? -arbitraryTranslate
            : arbitraryTranslate
          : isNegative
            ? `-${arbitraryTranslate}`
            : arbitraryTranslate;
      return { transform: [{ translateX: value }] };
    }

    const translateValue = SPACING_SCALE[translateKey];
    if (translateValue !== undefined) {
      const value = isNegative ? -translateValue : translateValue;
      return { transform: [{ translateX: value }] };
    }
  }

  // Translate Y: translate-y-{spacing}, -translate-y-{spacing}
  if (cls.startsWith("translate-y-") || cls.startsWith("-translate-y-")) {
    const isNegative = cls.startsWith("-");
    const translateKey = isNegative ? cls.substring(13) : cls.substring(12);

    // Arbitrary values: translate-y-[123px], -translate-y-[10px]
    const arbitraryTranslate = parseArbitraryTranslation(translateKey);
    if (arbitraryTranslate !== null) {
      const value =
        typeof arbitraryTranslate === "number"
          ? isNegative
            ? -arbitraryTranslate
            : arbitraryTranslate
          : isNegative
            ? `-${arbitraryTranslate}`
            : arbitraryTranslate;
      return { transform: [{ translateY: value }] };
    }

    const translateValue = SPACING_SCALE[translateKey];
    if (translateValue !== undefined) {
      const value = isNegative ? -translateValue : translateValue;
      return { transform: [{ translateY: value }] };
    }
  }

  // Skew X: skew-x-{degrees}, -skew-x-{degrees}
  if (cls.startsWith("skew-x-") || cls.startsWith("-skew-x-")) {
    const isNegative = cls.startsWith("-");
    const skewKey = isNegative ? cls.substring(8) : cls.substring(7);

    // Arbitrary values
    const arbitrarySkew = parseArbitraryRotation(skewKey);
    if (arbitrarySkew !== null) {
      const degrees = isNegative ? `-${arbitrarySkew}` : arbitrarySkew;
      return { transform: [{ skewX: degrees }] };
    }

    const skewValue = SKEW_MAP[skewKey];
    if (skewValue !== undefined) {
      const degrees = isNegative ? -skewValue : skewValue;
      return { transform: [{ skewX: `${degrees}deg` }] };
    }
  }

  // Skew Y: skew-y-{degrees}, -skew-y-{degrees}
  if (cls.startsWith("skew-y-") || cls.startsWith("-skew-y-")) {
    const isNegative = cls.startsWith("-");
    const skewKey = isNegative ? cls.substring(8) : cls.substring(7);

    // Arbitrary values
    const arbitrarySkew = parseArbitraryRotation(skewKey);
    if (arbitrarySkew !== null) {
      const degrees = isNegative ? `-${arbitrarySkew}` : arbitrarySkew;
      return { transform: [{ skewY: degrees }] };
    }

    const skewValue = SKEW_MAP[skewKey];
    if (skewValue !== undefined) {
      const degrees = isNegative ? -skewValue : skewValue;
      return { transform: [{ skewY: `${degrees}deg` }] };
    }
  }

  // Perspective: perspective-{value}
  if (cls.startsWith("perspective-")) {
    const perspectiveKey = cls.substring(12);

    // Arbitrary values: perspective-[1500]
    const arbitraryPerspective = parseArbitraryPerspective(perspectiveKey);
    if (arbitraryPerspective !== null) {
      return { transform: [{ perspective: arbitraryPerspective }] };
    }

    const perspectiveValue = PERSPECTIVE_SCALE[perspectiveKey];
    if (perspectiveValue !== undefined) {
      return { transform: [{ perspective: perspectiveValue }] };
    }
  }

  return null;
}
