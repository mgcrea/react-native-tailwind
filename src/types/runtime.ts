import type { ImageStyle, TextStyle, ViewStyle } from "react-native";

/**
 * Union type for all React Native style types
 */
export type NativeStyle = ViewStyle | TextStyle | ImageStyle;

/**
 * Return type for tw/twStyle functions with separate style properties for modifiers
 * When color-scheme modifiers (dark:, light:) are used inside a component, style becomes an array with runtime conditionals.
 * Module-level calls retain a base style and expose darkStyle/lightStyle for useTwStyle or resolveTwStyle.
 * When platform modifiers (ios:, android:, web:) are present, style becomes an array with Platform.select()
 */
export type TwStyle<T extends NativeStyle = NativeStyle> = {
  style: T | Array<T | false>;
  activeStyle?: T;
  focusStyle?: T;
  disabledStyle?: T;
  placeholderStyle?: TextStyle;
  lightStyle?: T;
  darkStyle?: T;
  iosStyle?: T;
  androidStyle?: T;
  webStyle?: T;
};
