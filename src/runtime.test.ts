import { beforeEach, describe, expect, it } from "vitest";

import { clearCache, getCacheStats, getCustomTheme, setConfig, tw, twStyle } from "./runtime";

describe("runtime", () => {
  beforeEach(() => {
    clearCache();
    setConfig({}); // Reset config
  });

  describe("tw template tag", () => {
    it("should parse static classes", () => {
      const result = tw`m-4 p-2 bg-blue-500`;
      expect(result?.style).toEqual({
        margin: 16,
        padding: 8,
        backgroundColor: "#2b7fff",
      });
      expect(result?.activeStyle).toBeUndefined();
      expect(result?.disabledStyle).toBeUndefined();
    });

    it("should handle interpolated values", () => {
      const isActive = true;
      const result = tw`m-4 ${isActive && "bg-blue-500"}`;
      expect(result?.style).toEqual({
        margin: 16,
        backgroundColor: "#2b7fff",
      });
    });

    it("should handle conditional classes", () => {
      const isLarge = true;
      const result = tw`p-4 ${isLarge ? "text-xl" : "text-sm"}`;
      expect(result?.style).toEqual({
        padding: 16,
        fontSize: 20,
      });
    });

    it("should handle falsy values", () => {
      const result = tw`m-4 ${false} ${null} ${undefined} p-2`;
      expect(result?.style).toEqual({
        margin: 16,
        padding: 8,
      });
    });

    it("should preserve zero values in template literals", () => {
      // Issue #1 fix: 0 should be treated as valid value, not filtered out
      const result = tw`opacity-${0} m-4`;
      expect(result?.style).toEqual({
        opacity: 0,
        margin: 16,
      });
    });

    it("should preserve empty string values in template literals", () => {
      // Empty strings should be preserved (even though they don't contribute to className)
      const result = tw`m-4 ${""}p-2`;
      expect(result?.style).toEqual({
        margin: 16,
        padding: 8,
      });
    });

    it("should handle mixed falsy and truthy numeric values", () => {
      const spacing = 0;
      const result = tw`m-${spacing} p-4`;
      expect(result?.style).toEqual({
        margin: 0,
        padding: 16,
      });
    });

    it("should return empty style object for empty className", () => {
      const result = tw``;
      expect(result).toEqual({ style: {} });
    });

    it("should normalize whitespace", () => {
      const result = tw`m-4    p-2   bg-blue-500`;
      expect(result?.style).toEqual({
        margin: 16,
        padding: 8,
        backgroundColor: "#2b7fff",
      });
    });
  });

  describe("twStyle function", () => {
    it("should parse className string", () => {
      const result = twStyle("m-4 p-2 bg-blue-500");
      expect(result?.style).toEqual({
        margin: 16,
        padding: 8,
        backgroundColor: "#2b7fff",
      });
      expect(result?.activeStyle).toBeUndefined();
    });

    it("should return undefined for empty string", () => {
      const result = twStyle("");
      expect(result).toBeUndefined();
    });

    it("should normalize whitespace", () => {
      const result = twStyle("m-4    p-2   bg-blue-500");
      expect(result?.style).toEqual({
        margin: 16,
        padding: 8,
        backgroundColor: "#2b7fff",
      });
    });
  });

  describe("setConfig", () => {
    it("should set custom colors", () => {
      setConfig({
        theme: {
          extend: {
            colors: {
              primary: "#007AFF",
              secondary: "#5856D6",
            },
          },
        },
      });

      const theme = getCustomTheme();
      expect(theme.colors).toEqual({
        primary: "#007AFF",
        secondary: "#5856D6",
      });
    });

    it("should flatten nested colors", () => {
      setConfig({
        theme: {
          extend: {
            colors: {
              brand: {
                light: "#FF6B6B",
                dark: "#CC0000",
              },
            },
          },
        },
      });

      const theme = getCustomTheme();
      expect(theme.colors).toEqual({
        "brand-light": "#FF6B6B",
        "brand-dark": "#CC0000",
      });
    });

    it("should handle mixed flat and nested colors", () => {
      setConfig({
        theme: {
          extend: {
            colors: {
              primary: "#007AFF",
              brand: {
                light: "#FF6B6B",
                dark: "#CC0000",
              },
            },
          },
        },
      });

      const theme = getCustomTheme();
      expect(theme.colors).toEqual({
        primary: "#007AFF",
        "brand-light": "#FF6B6B",
        "brand-dark": "#CC0000",
      });
    });

    it("should clear cache when config changes", () => {
      const style = tw`bg-blue-500`;
      expect(style).toBeDefined();
      expect(getCacheStats().size).toBe(1);

      setConfig({
        theme: {
          extend: {
            colors: { primary: "#007AFF" },
          },
        },
      });

      expect(getCacheStats().size).toBe(0);
    });

    it("should use custom colors in parsing", () => {
      setConfig({
        theme: {
          extend: {
            colors: {
              primary: "#007AFF",
            },
          },
        },
      });

      const result = tw`bg-primary`;
      expect(result?.style).toEqual({
        backgroundColor: "#007AFF",
      });
    });

    it("should set custom fontFamily", () => {
      setConfig({
        theme: {
          extend: {
            fontFamily: {
              display: "Inter",
              body: ["Roboto", "sans-serif"], // Array format - takes first value
            },
          },
        },
      });

      const theme = getCustomTheme();
      expect(theme.fontFamily).toEqual({
        display: "Inter",
        body: "Roboto",
      });
    });

    it("should set custom fontSize", () => {
      setConfig({
        theme: {
          extend: {
            fontSize: {
              tiny: 10,
              small: "12px",
              medium: 16,
              large: "24",
            },
          },
        },
      });

      const theme = getCustomTheme();
      expect(theme.fontSize).toEqual({
        tiny: 10,
        small: 12,
        medium: 16,
        large: 24,
      });
    });

    it("should set custom spacing", () => {
      setConfig({
        theme: {
          extend: {
            spacing: {
              xs: 4,
              sm: "8px",
              md: 16,
              lg: "2rem", // 2rem = 32px
            },
          },
        },
      });

      const theme = getCustomTheme();
      expect(theme.spacing).toEqual({
        xs: 4,
        sm: 8,
        md: 16,
        lg: 32,
      });
    });

    it("should use custom fontSize in parsing", () => {
      setConfig({
        theme: {
          extend: {
            fontSize: {
              tiny: 10,
            },
          },
        },
      });

      const result = tw`text-tiny`;
      expect(result?.style).toEqual({
        fontSize: 10,
      });
    });

    it("should use custom spacing in parsing", () => {
      setConfig({
        theme: {
          extend: {
            spacing: {
              xs: 4,
            },
          },
        },
      });

      const result = tw`m-xs p-xs`;
      expect(result?.style).toEqual({
        margin: 4,
        padding: 4,
      });
    });

    it("should reset fontSize and spacing when config is cleared", () => {
      setConfig({
        theme: {
          extend: {
            fontSize: { tiny: 10 },
            spacing: { xs: 4 },
          },
        },
      });

      let theme = getCustomTheme();
      expect(theme.fontSize).toEqual({ tiny: 10 });
      expect(theme.spacing).toEqual({ xs: 4 });

      setConfig({});

      theme = getCustomTheme();
      expect(theme.fontSize).toEqual({});
      expect(theme.spacing).toEqual({});
    });

    it("should handle all theme extensions together", () => {
      setConfig({
        theme: {
          extend: {
            colors: { primary: "#007AFF" },
            fontFamily: { display: "Inter" },
            fontSize: { tiny: 10 },
            spacing: { xs: 4 },
          },
        },
      });

      const theme = getCustomTheme();
      expect(theme.colors).toEqual({ primary: "#007AFF" });
      expect(theme.fontFamily).toEqual({ display: "Inter" });
      expect(theme.fontSize).toEqual({ tiny: 10 });
      expect(theme.spacing).toEqual({ xs: 4 });

      // Test that parsing uses all of them
      const result = tw`bg-primary font-display text-tiny m-xs`;
      expect(result?.style).toEqual({
        backgroundColor: "#007AFF",
        fontFamily: "Inter",
        fontSize: 10,
        margin: 4,
      });
    });
  });

  describe("cache", () => {
    it("should cache parsed styles", () => {
      const result1 = tw`m-4 p-2`;
      const result2 = tw`m-4 p-2`;

      // Should return the same reference (cached)
      expect(result1).toBe(result2);
    });

    it("should track cache stats", () => {
      const style1 = tw`m-4`;
      const style2 = tw`p-2`;
      const style3 = tw`bg-blue-500`;
      expect(style1).toBeDefined();
      expect(style2).toBeDefined();
      expect(style3).toBeDefined();

      const stats = getCacheStats();
      expect(stats.size).toBe(3);
      expect(stats.keys).toContain("m-4");
      expect(stats.keys).toContain("p-2");
      expect(stats.keys).toContain("bg-blue-500");
    });

    it("should clear cache", () => {
      const style1 = tw`m-4`;
      const style2 = tw`p-2`;
      expect(style1).toBeDefined();
      expect(style2).toBeDefined();
      expect(getCacheStats().size).toBe(2);

      clearCache();
      expect(getCacheStats().size).toBe(0);
    });
  });

  describe("state modifiers", () => {
    it("should return activeStyle when active: modifier is used", () => {
      const result = tw`bg-blue-500 active:bg-blue-700`;
      expect(result?.style).toEqual({
        backgroundColor: "#2b7fff",
      });
      expect(result?.activeStyle).toEqual({
        backgroundColor: "#1447e6",
      });
      expect(result?.disabledStyle).toBeUndefined();
    });

    it("should return disabledStyle when disabled: modifier is used", () => {
      const result = tw`bg-blue-500 disabled:bg-gray-300`;
      expect(result?.style).toEqual({
        backgroundColor: "#2b7fff",
      });
      expect(result?.disabledStyle).toEqual({
        backgroundColor: "#d1d5dc",
      });
      expect(result?.activeStyle).toBeUndefined();
    });

    it("should return both activeStyle and disabledStyle when both modifiers are used", () => {
      const result = tw`bg-blue-500 active:bg-blue-700 disabled:bg-gray-300`;
      expect(result?.style).toEqual({
        backgroundColor: "#2b7fff",
      });
      expect(result?.activeStyle).toEqual({
        backgroundColor: "#1447e6",
      });
      expect(result?.disabledStyle).toEqual({
        backgroundColor: "#d1d5dc",
      });
    });

    it("should merge base and active styles with multiple properties", () => {
      const result = tw`p-4 m-2 bg-blue-500 active:bg-blue-700 active:p-6`;
      expect(result?.style).toEqual({
        padding: 16,
        margin: 8,
        backgroundColor: "#2b7fff",
      });
      expect(result?.activeStyle).toEqual({
        backgroundColor: "#1447e6",
        padding: 24,
      });
    });

    it("should handle only modifier classes (no base)", () => {
      const result = tw`active:bg-blue-700`;
      expect(result?.style).toEqual({});
      expect(result?.activeStyle).toEqual({
        backgroundColor: "#1447e6",
      });
    });

    it("should work with twStyle function", () => {
      const result = twStyle("bg-blue-500 active:bg-blue-700");
      expect(result?.style).toEqual({
        backgroundColor: "#2b7fff",
      });
      expect(result?.activeStyle).toEqual({
        backgroundColor: "#1447e6",
      });
    });

    it("should provide raw hex values for animations", () => {
      const result = tw`bg-blue-500 active:bg-blue-700`;
      // Access raw backgroundColor value for use with reanimated
      const style = Array.isArray(result?.style) ? result.style.find((s) => s !== false) : result?.style;
      expect(
        style && typeof style === "object" && "backgroundColor" in style ? style.backgroundColor : undefined,
      ).toBe("#2b7fff");
      expect(result?.activeStyle?.backgroundColor).toBe("#1447e6");
    });

    it("should return focusStyle when focus: modifier is used", () => {
      const result = tw`bg-blue-500 focus:bg-blue-800`;
      expect(result?.style).toEqual({
        backgroundColor: "#2b7fff",
      });
      expect(result?.focusStyle).toEqual({
        backgroundColor: "#193cb8",
      });
      expect(result?.activeStyle).toBeUndefined();
      expect(result?.disabledStyle).toBeUndefined();
    });

    it("should return all three modifier styles when all are used", () => {
      const result = tw`bg-blue-500 active:bg-blue-700 focus:bg-blue-800 disabled:bg-gray-300`;
      expect(result?.style).toEqual({
        backgroundColor: "#2b7fff",
      });
      expect(result?.activeStyle).toEqual({
        backgroundColor: "#1447e6",
      });
      expect(result?.focusStyle).toEqual({
        backgroundColor: "#193cb8",
      });
      expect(result?.disabledStyle).toEqual({
        backgroundColor: "#d1d5dc",
      });
    });
  });
});
