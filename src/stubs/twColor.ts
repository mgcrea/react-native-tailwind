/**
 * Compile-time raw color helpers.
 *
 * Calls are replaced by the Babel plugin with literal React Native color
 * strings. These stubs throw when the plugin is not configured.
 */

const transformError =
  "useTwColor/useTwColors must be transformed by the Babel plugin. " +
  "Ensure @mgcrea/react-native-tailwind/babel is configured in your babel.config.js.";

/** Resolve one static theme token to a native color string at compile time. */
export function useTwColor(_token: string): string {
  throw new Error(transformError);
}

/** Resolve a named object of static theme tokens at compile time. */
export function useTwColors<const T extends Record<string, string>>(_tokens: T): { [K in keyof T]: string } {
  throw new Error(transformError);
}
