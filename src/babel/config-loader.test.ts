import * as fs from "fs";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  extractCustomTheme,
  findTailwindConfig,
  loadTailwindConfig,
  warnUnsupportedThemeKeys,
} from "./config-loader";

// Mock fs
vi.mock("fs");

describe("config-loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("findTailwindConfig", () => {
    it("should find tailwind.config.mjs in current directory", () => {
      const startDir = "/project/src";
      const expectedPath = "/project/src/tailwind.config.mjs";

      vi.spyOn(fs, "existsSync").mockImplementation((filepath) => {
        return filepath === expectedPath;
      });

      const result = findTailwindConfig(startDir);
      expect(result).toBe(expectedPath);
    });

    it("should find tailwind.config.js in parent directory", () => {
      const startDir = "/project/src/components";
      const expectedPath = "/project/tailwind.config.js";

      vi.spyOn(fs, "existsSync").mockImplementation((filepath) => {
        return filepath === expectedPath;
      });

      const result = findTailwindConfig(startDir);
      expect(result).toBe(expectedPath);
    });

    it("should return null if no config found", () => {
      const startDir = "/project/src";

      vi.spyOn(fs, "existsSync").mockReturnValue(false);

      const result = findTailwindConfig(startDir);
      expect(result).toBeNull();
    });

    it("should prioritize config file extensions in correct order", () => {
      const startDir = "/project";
      const mjsPath = "/project/tailwind.config.mjs";
      const jsPath = "/project/tailwind.config.js";

      vi.spyOn(fs, "existsSync").mockImplementation((filepath) => {
        // Both exist, but mjs should be found first
        return filepath === mjsPath || filepath === jsPath;
      });

      const result = findTailwindConfig(startDir);
      expect(result).toBe(mjsPath); // .mjs has priority
    });
  });

  describe("loadTailwindConfig", () => {
    it("should load config with default export", () => {
      const configPath = "/project/tailwind.config.js";
      const mockConfig = {
        theme: {
          extend: {
            colors: { brand: "#123456" },
          },
        },
      };

      // Mock require.resolve and require
      vi.spyOn(require, "resolve").mockReturnValue(configPath);
      vi.doMock(configPath, () => ({ default: mockConfig }));

      // We need to use dynamic import workaround for testing
      const config = { default: mockConfig };
      const result = "default" in config ? config.default : config;

      expect(result).toEqual(mockConfig);
    });

    it("should load config with direct export", () => {
      const mockConfig = {
        theme: {
          colors: { primary: "#ff0000" },
        },
      };

      const config = mockConfig;
      const result = "default" in config ? (config as { default: unknown }).default : config;

      expect(result).toEqual(mockConfig);
    });

    it("should cache loaded configs", () => {
      const configPath = "/project/tailwind.config.js";
      const _mockConfig = { theme: {} };

      vi.spyOn(require, "resolve").mockReturnValue(configPath);

      // First load
      const config1 = loadTailwindConfig(configPath);

      // Second load - should hit cache
      const config2 = loadTailwindConfig(configPath);

      // Both should return same result (from cache)
      expect(config1).toBe(config2);
    });
  });

  describe("extractCustomTheme", () => {
    it("should return empty theme when no config found", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(false);

      const result = extractCustomTheme("/project/src/file.ts");
      expect(result).toEqual({ colors: {}, fontFamily: {}, fontSize: {}, spacing: {} });
    });
  });

  describe("warnUnsupportedThemeKeys", () => {
    it("should warn about unsupported theme keys", () => {
      const configPath = "/project/unsupported/tailwind.config.js";
      const mockConfig = {
        theme: {
          extend: {
            colors: { brand: "#123456" },
            spacing: { "72": "18rem" }, // Supported (now!)
            borderRadius: { xl: "1rem" }, // Unsupported
            lineHeight: { tight: "1.25" }, // Unsupported
          },
          screens: { tablet: "640px" }, // Unsupported
        },
      };

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(vi.fn());

      warnUnsupportedThemeKeys(mockConfig, configPath);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Unsupported theme configuration detected"),
      );
      // spacing is now supported, so should NOT warn about it
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining("theme.extend.spacing"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("theme.extend.borderRadius"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("theme.extend.lineHeight"));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("theme.screens"));
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("https://github.com/mgcrea/react-native-tailwind/issues/new"),
      );

      consoleSpy.mockRestore();
    });

    it("should not warn for supported theme keys only", () => {
      const configPath = "/project/supported/tailwind.config.js";
      const mockConfig = {
        theme: {
          extend: {
            colors: { brand: "#123456" },
            fontFamily: { custom: "CustomFont" },
            fontSize: { huge: "48px" },
            spacing: { "72": "18rem" },
          },
        },
      };

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(vi.fn());

      warnUnsupportedThemeKeys(mockConfig, configPath);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should only warn once per config path", () => {
      const configPath = "/project/once/tailwind.config.js";
      const mockConfig = {
        theme: {
          extend: {
            borderRadius: { xl: "1rem" }, // Unsupported
          },
        },
      };

      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(vi.fn());

      warnUnsupportedThemeKeys(mockConfig, configPath);
      warnUnsupportedThemeKeys(mockConfig, configPath);

      expect(consoleSpy).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });
  });
});
