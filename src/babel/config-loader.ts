/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-dynamic-delete */
/**
 * Tailwind config loader for Babel plugin
 * Discovers and loads tailwind.config.* files from the project
 */

import * as fs from "fs";
import * as path from "path";

import { flattenColors } from "../utils/flattenColors";

export type TailwindConfig = {
  theme?: {
    extend?: {
      colors?: Record<string, string | Record<string, string>>;
      fontFamily?: Record<string, string | string[]>;
      fontSize?: Record<string, string | number>;
      spacing?: Record<string, string | number>;
      [key: string]: unknown;
    };
    colors?: Record<string, string | Record<string, string>>;
    fontFamily?: Record<string, string | string[]>;
    fontSize?: Record<string, string | number>;
    spacing?: Record<string, string | number>;
    [key: string]: unknown;
  };
};

/**
 * Theme keys currently supported by react-native-tailwind
 */
const SUPPORTED_THEME_KEYS = new Set(["colors", "fontFamily", "fontSize", "spacing", "extend"]);

/**
 * Cache for warned config paths to avoid duplicate warnings
 */
const warnedConfigPaths = new Set<string>();

/**
 * Check for unsupported theme extensions and warn the user
 * @internal Exported for testing
 */
export function warnUnsupportedThemeKeys(config: TailwindConfig, configPath: string): void {
  if (process.env.NODE_ENV === "production" || warnedConfigPaths.has(configPath)) {
    return;
  }

  const unsupportedKeys: string[] = [];

  // Check theme.extend keys
  if (config.theme?.extend && typeof config.theme.extend === "object") {
    for (const key of Object.keys(config.theme.extend)) {
      if (!SUPPORTED_THEME_KEYS.has(key)) {
        unsupportedKeys.push(`theme.extend.${key}`);
      }
    }
  }

  // Check direct theme keys (excluding 'extend')
  if (config.theme && typeof config.theme === "object") {
    for (const key of Object.keys(config.theme)) {
      if (key !== "extend" && !SUPPORTED_THEME_KEYS.has(key)) {
        unsupportedKeys.push(`theme.${key}`);
      }
    }
  }

  if (unsupportedKeys.length > 0) {
    warnedConfigPaths.add(configPath);
    console.warn(
      `[react-native-tailwind] Unsupported theme configuration detected:\n` +
        `  ${unsupportedKeys.join(", ")}\n\n` +
        `  Currently supported: colors, fontFamily, fontSize, spacing\n\n` +
        `  These extensions will be ignored. If you need support for these features,\n` +
        `  please open an issue: https://github.com/mgcrea/react-native-tailwind/issues/new`,
    );
  }
}

// Cache configs per path to avoid repeated file I/O
const configCache = new Map<string, TailwindConfig | null>();

/**
 * Find tailwind.config.* file by traversing up from startDir
 */
export function findTailwindConfig(startDir: string): string | null {
  let currentDir = startDir;
  const root = path.parse(currentDir).root;

  const configNames = [
    "tailwind.config.mjs",
    "tailwind.config.js",
    "tailwind.config.cjs",
    "tailwind.config.ts",
  ];

  while (currentDir !== root) {
    for (const configName of configNames) {
      const configPath = path.join(currentDir, configName);
      if (fs.existsSync(configPath)) {
        return configPath;
      }
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * Load and parse tailwind config file
 */
export function loadTailwindConfig(configPath: string): TailwindConfig | null {
  // Check cache
  if (configCache.has(configPath)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return configCache.get(configPath)!;
  }

  try {
    // Clear require cache to allow hot reloading
    const resolvedPath = require.resolve(configPath);
    delete require.cache[resolvedPath];

    // Load config
    const config = require(configPath) as TailwindConfig | { default: TailwindConfig };

    // Handle both default export and direct export
    const resolved: TailwindConfig = "default" in config ? config.default : config;

    configCache.set(configPath, resolved);
    return resolved;
  } catch (error) {
    /* v8 ignore next 3 */
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[react-native-tailwind] Failed to load config from ${configPath}:`, error);
    }
    configCache.set(configPath, null);
    return null;
  }
}

/**
 * Custom theme configuration extracted from tailwind.config
 */
export type CustomTheme = {
  colors: Record<string, string>;
  fontFamily: Record<string, string>;
  fontSize: Record<string, number>;
  spacing: Record<string, number>;
};

/**
 * Extract all custom theme extensions from tailwind config
 * Prefers theme.extend.* over theme.* to avoid overriding defaults
 */
export function extractCustomTheme(filename: string): CustomTheme {
  const projectDir = path.dirname(filename);
  const configPath = findTailwindConfig(projectDir);

  if (!configPath) {
    return { colors: {}, fontFamily: {}, fontSize: {}, spacing: {} };
  }

  const config = loadTailwindConfig(configPath);
  if (!config?.theme) {
    return { colors: {}, fontFamily: {}, fontSize: {}, spacing: {} };
  }

  // Warn about unsupported theme keys
  warnUnsupportedThemeKeys(config, configPath);

  // Extract colors
  /* v8 ignore next 5 */
  if (config.theme.colors && !config.theme.extend?.colors && process.env.NODE_ENV !== "production") {
    console.warn(
      "[react-native-tailwind] Using theme.colors will override all default colors. " +
        "Use theme.extend.colors to add custom colors while keeping defaults.",
    );
  }
  const colors = config.theme.extend?.colors ?? config.theme.colors ?? {};

  // Extract fontFamily
  /* v8 ignore next 5 */
  if (config.theme.fontFamily && !config.theme.extend?.fontFamily && process.env.NODE_ENV !== "production") {
    console.warn(
      "[react-native-tailwind] Using theme.fontFamily will override all default font families. " +
        "Use theme.extend.fontFamily to add custom fonts while keeping defaults.",
    );
  }
  const fontFamily = config.theme.extend?.fontFamily ?? config.theme.fontFamily ?? {};

  // Convert fontFamily values to strings (take first value if array)
  const fontFamilyResult: Record<string, string> = {};
  for (const [key, value] of Object.entries(fontFamily)) {
    if (Array.isArray(value)) {
      // Take first font in the array (React Native doesn't support font stacks)
      fontFamilyResult[key] = value[0];
    } else {
      fontFamilyResult[key] = value;
    }
  }

  // Extract fontSize
  /* v8 ignore next 5 */
  if (config.theme.fontSize && !config.theme.extend?.fontSize && process.env.NODE_ENV !== "production") {
    console.warn(
      "[react-native-tailwind] Using theme.fontSize will override all default font sizes. " +
        "Use theme.extend.fontSize to add custom font sizes while keeping defaults.",
    );
  }
  const fontSize = config.theme.extend?.fontSize ?? config.theme.fontSize ?? {};

  // Convert fontSize values to numbers (handle string or number values)
  const fontSizeResult: Record<string, number> = {};
  for (const [key, value] of Object.entries(fontSize)) {
    if (typeof value === "number") {
      fontSizeResult[key] = value;
    } else if (typeof value === "string") {
      // Parse string values like "18px" or "18" to number
      const parsed = parseFloat(value.replace(/px$/, ""));
      if (!isNaN(parsed)) {
        fontSizeResult[key] = parsed;
      } else {
        /* v8 ignore next 5 */
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[react-native-tailwind] Invalid fontSize value for "${key}": ${value}. Expected number or string like "18px".`,
          );
        }
      }
    }
  }

  // Extract spacing
  /* v8 ignore next 5 */
  if (config.theme.spacing && !config.theme.extend?.spacing && process.env.NODE_ENV !== "production") {
    console.warn(
      "[react-native-tailwind] Using theme.spacing will override all default spacing. " +
        "Use theme.extend.spacing to add custom spacing while keeping defaults.",
    );
  }
  const spacing = config.theme.extend?.spacing ?? config.theme.spacing ?? {};

  // Convert spacing values to numbers (handle rem, px, or number values)
  const spacingResult: Record<string, number> = {};
  for (const [key, value] of Object.entries(spacing)) {
    if (typeof value === "number") {
      spacingResult[key] = value;
    } else if (typeof value === "string") {
      // Parse string values: "18rem" -> 288, "16px" -> 16, "16" -> 16
      let parsed: number;
      if (value.endsWith("rem")) {
        // Convert rem to px (1rem = 16px)
        parsed = parseFloat(value.replace(/rem$/, "")) * 16;
      } else {
        // Parse px or unitless values
        parsed = parseFloat(value.replace(/px$/, ""));
      }
      if (!isNaN(parsed)) {
        spacingResult[key] = parsed;
      } else {
        /* v8 ignore next 5 */
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            `[react-native-tailwind] Invalid spacing value for "${key}": ${value}. Expected number or string like "16px" or "1rem".`,
          );
        }
      }
    }
  }

  return {
    colors: flattenColors(colors),
    fontFamily: fontFamilyResult,
    fontSize: fontSizeResult,
    spacing: spacingResult,
  };
}
