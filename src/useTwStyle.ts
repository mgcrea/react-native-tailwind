import type { ColorSchemeName } from "react-native";

import type { NativeStyle, TwStyle } from "./types/runtime";

export type ResolvedTwStyle<T extends NativeStyle = NativeStyle> = T | Array<T | false>;
export type TwColorScheme = ColorSchemeName | null | undefined;

/**
 * Resolve a compiled TwStyle object for an explicit color scheme.
 * Useful with an application's custom theme hook.
 */
export function resolveTwStyle<T extends NativeStyle>(
  styles: TwStyle<T>,
  colorScheme: TwColorScheme,
): ResolvedTwStyle<T> {
  const schemeStyle =
    colorScheme === "dark" ? styles.darkStyle : colorScheme === "light" ? styles.lightStyle : undefined;

  if (!schemeStyle) {
    return styles.style;
  }

  if (Array.isArray(styles.style)) {
    // Calls compiled inside a component may already contain the active scheme
    // style. Preserve that array instead of applying the same variant twice.
    return styles.style.includes(schemeStyle) ? styles.style : [...styles.style, schemeStyle];
  }

  return [styles.style, schemeStyle];
}

/**
 * Reactively resolve a module-level compiled TwStyle object with the color
 * scheme hook configured in the Babel plugin. The plugin injects the second
 * argument at compile time.
 */
export function useTwStyle<T extends NativeStyle>(styles: TwStyle<T>): ResolvedTwStyle<T>;
export function useTwStyle<T extends NativeStyle>(
  styles: TwStyle<T>,
  colorScheme?: TwColorScheme,
): ResolvedTwStyle<T> {
  if (arguments.length < 2) {
    throw new Error(
      "useTwStyle() must be transformed by @mgcrea/react-native-tailwind/babel so it can use the configured color-scheme hook.",
    );
  }
  return resolveTwStyle(styles, colorScheme);
}
