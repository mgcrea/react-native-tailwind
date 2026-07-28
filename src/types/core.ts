/**
 * Core type definitions
 */

// Transform types for React Native
export type TransformStyle =
  | { scale?: number }
  | { scaleX?: number }
  | { scaleY?: number }
  | { rotate?: string }
  | { rotateX?: string }
  | { rotateY?: string }
  | { rotateZ?: string }
  | { translateX?: number | string }
  | { translateY?: number | string }
  | { skewX?: string }
  | { skewY?: string }
  | { perspective?: number };

export type ShadowOffsetStyle = { width: number; height: number };
export type FilterStyle = { brightness: number };

export type StyleObject = {
  [key: string]: string | number | ShadowOffsetStyle | TransformStyle[] | FilterStyle[] | undefined;
  filter?: FilterStyle[];
  shadowOffset?: ShadowOffsetStyle;
  transform?: TransformStyle[];
};

export type SpacingValue = number;
export type ColorValue = string;
export type Parser = (className: string) => StyleObject | null;
