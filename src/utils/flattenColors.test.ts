import { describe, expect, it } from "vitest";

import { flattenColors } from "./flattenColors";

describe("flattenColors", () => {
  it("should handle flat color objects", () => {
    const colors = {
      red: "#ff0000",
      blue: "#0000ff",
      green: "#00ff00",
    };

    expect(flattenColors(colors)).toEqual({
      red: "#ff0000",
      blue: "#0000ff",
      green: "#00ff00",
    });
  });

  it("should flatten single-level nested objects", () => {
    const colors = {
      brand: {
        primary: "#ff6b6b",
        secondary: "#4ecdc4",
      },
    };

    expect(flattenColors(colors)).toEqual({
      "brand-primary": "#ff6b6b",
      "brand-secondary": "#4ecdc4",
    });
  });

  it("should flatten multi-level nested objects", () => {
    const colors = {
      brand: {
        light: {
          primary: "#ffcccc",
          secondary: "#ccffff",
        },
        dark: {
          primary: "#990000",
          secondary: "#006666",
        },
      },
    };

    expect(flattenColors(colors)).toEqual({
      "brand-light-primary": "#ffcccc",
      "brand-light-secondary": "#ccffff",
      "brand-dark-primary": "#990000",
      "brand-dark-secondary": "#006666",
    });
  });

  it("should handle mixed flat and nested objects", () => {
    const colors = {
      white: "#ffffff",
      black: "#000000",
      brand: {
        primary: "#ff6b6b",
        secondary: "#4ecdc4",
      },
      accent: "#ffe66d",
    };

    expect(flattenColors(colors)).toEqual({
      white: "#ffffff",
      black: "#000000",
      "brand-primary": "#ff6b6b",
      "brand-secondary": "#4ecdc4",
      accent: "#ffe66d",
    });
  });

  it("should handle Tailwind-style color scale objects", () => {
    const colors = {
      gray: {
        "50": "#f9fafb",
        "100": "#f3f4f6",
        "200": "#e5e7eb",
        "500": "#6b7280",
        "900": "#111827",
      },
    };

    expect(flattenColors(colors)).toEqual({
      "gray-50": "#f9fafb",
      "gray-100": "#f3f4f6",
      "gray-200": "#e5e7eb",
      "gray-500": "#6b7280",
      "gray-900": "#111827",
    });
  });

  it("should handle empty object", () => {
    expect(flattenColors({})).toEqual({});
  });

  it("should handle single color", () => {
    const colors = {
      primary: "#ff0000",
    };

    expect(flattenColors(colors)).toEqual({
      primary: "#ff0000",
    });
  });

  it("should handle deeply nested objects (3+ levels)", () => {
    const colors = {
      theme: {
        light: {
          brand: {
            primary: "#ff6b6b",
            secondary: "#4ecdc4",
          },
        },
        dark: {
          brand: {
            primary: "#990000",
            secondary: "#006666",
          },
        },
      },
    };

    expect(flattenColors(colors)).toEqual({
      "theme-light-brand-primary": "#ff6b6b",
      "theme-light-brand-secondary": "#4ecdc4",
      "theme-dark-brand-primary": "#990000",
      "theme-dark-brand-secondary": "#006666",
    });
  });

  it("should handle numeric keys", () => {
    const colors = {
      blue: {
        "100": "#dbeafe",
        "500": "#3b82f6",
        "900": "#1e3a8a",
      },
    };

    expect(flattenColors(colors)).toEqual({
      "blue-100": "#dbeafe",
      "blue-500": "#3b82f6",
      "blue-900": "#1e3a8a",
    });
  });

  it("should handle keys with hyphens", () => {
    const colors = {
      "brand-primary": "#ff0000",
      "brand-secondary": {
        light: "#00ff00",
        dark: "#006600",
      },
    };

    expect(flattenColors(colors)).toEqual({
      "brand-primary": "#ff0000",
      "brand-secondary-light": "#00ff00",
      "brand-secondary-dark": "#006600",
    });
  });

  it("should handle uppercase and lowercase hex values", () => {
    const colors = {
      red: "#FF0000",
      blue: "#0000ff",
      green: "#00Ff00",
    };

    expect(flattenColors(colors)).toEqual({
      red: "#FF0000",
      blue: "#0000ff",
      green: "#00Ff00",
    });
  });

  it("should handle 3-digit hex values", () => {
    const colors = {
      red: "#f00",
      blue: "#00f",
      green: "#0f0",
    };

    expect(flattenColors(colors)).toEqual({
      red: "#f00",
      blue: "#00f",
      green: "#0f0",
    });
  });

  it("should handle 8-digit hex values (with alpha)", () => {
    const colors = {
      "red-50": "#ff000080",
      "blue-50": "#0000ff80",
    };

    expect(flattenColors(colors)).toEqual({
      "red-50": "#ff000080",
      "blue-50": "#0000ff80",
    });
  });

  it("should handle complex real-world Tailwind config", () => {
    const colors = {
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      black: "#000000",
      gray: {
        "50": "#f9fafb",
        "100": "#f3f4f6",
        "500": "#6b7280",
        "900": "#111827",
      },
      brand: {
        primary: "#ff6b6b",
        secondary: "#4ecdc4",
        accent: {
          light: "#ffe66d",
          dark: "#ffb900",
        },
      },
    };

    expect(flattenColors(colors)).toEqual({
      transparent: "transparent",
      current: "currentColor",
      white: "#ffffff",
      black: "#000000",
      "gray-50": "#f9fafb",
      "gray-100": "#f3f4f6",
      "gray-500": "#6b7280",
      "gray-900": "#111827",
      "brand-primary": "#ff6b6b",
      "brand-secondary": "#4ecdc4",
      "brand-accent-light": "#ffe66d",
      "brand-accent-dark": "#ffb900",
    });
  });

  it("should not mutate input object", () => {
    const colors = {
      brand: {
        primary: "#ff6b6b",
        secondary: "#4ecdc4",
      },
    };

    const original = JSON.parse(JSON.stringify(colors));
    flattenColors(colors);

    expect(colors).toEqual(original);
  });

  it("should handle undefined values gracefully", () => {
    const colors = {
      red: "#ff0000",
      blue: undefined as unknown as string, // Testing runtime edge case
      green: "#00ff00",
    };

    // undefined values are skipped (not objects or strings)
    expect(flattenColors(colors)).toEqual({
      red: "#ff0000",
      green: "#00ff00",
    });
  });

  it("should handle special color keywords", () => {
    const colors = {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
    };

    expect(flattenColors(colors)).toEqual({
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
    });
  });

  it("should handle RGB/RGBA color values", () => {
    const colors = {
      primary: "rgb(255, 0, 0)",
      secondary: "rgba(0, 255, 0, 0.5)",
    };

    expect(flattenColors(colors)).toEqual({
      primary: "rgb(255, 0, 0)",
      secondary: "rgba(0, 255, 0, 0.5)",
    });
  });

  it("should handle very deeply nested structures (stress test)", () => {
    const colors = {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: "#ff0000",
            },
          },
        },
      },
    };

    expect(flattenColors(colors)).toEqual({
      "level1-level2-level3-level4-level5": "#ff0000",
    });
  });

  it("should handle camelCase keys", () => {
    const colors = {
      brandPrimary: "#ff0000",
      accentColor: {
        lightShade: "#ffcccc",
        darkShade: "#cc0000",
      },
    };

    expect(flattenColors(colors)).toEqual({
      brandPrimary: "#ff0000",
      "accentColor-lightShade": "#ffcccc",
      "accentColor-darkShade": "#cc0000",
    });
  });

  it("should produce consistent output", () => {
    const colors = {
      brand: {
        primary: "#ff6b6b",
        secondary: "#4ecdc4",
      },
    };

    const result1 = flattenColors(colors);
    const result2 = flattenColors(colors);
    const result3 = flattenColors(colors);

    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);
  });

  it("should maintain key order (insertion order)", () => {
    const colors = {
      z: "#000001",
      a: "#000002",
      m: "#000003",
    };

    const flattened = flattenColors(colors);
    const keys = Object.keys(flattened);

    expect(keys).toEqual(["z", "a", "m"]);
  });

  it("should handle DEFAULT key in color scale objects", () => {
    const colors = {
      primary: {
        "50": "#eefdfd",
        "100": "#d4f9f9",
        "200": "#aef2f3",
        "500": "#1bacb5",
        "900": "#1e4f5b",
        DEFAULT: "#1bacb5",
      },
    };

    expect(flattenColors(colors)).toEqual({
      primary: "#1bacb5", // DEFAULT becomes the parent key
      "primary-50": "#eefdfd",
      "primary-100": "#d4f9f9",
      "primary-200": "#aef2f3",
      "primary-500": "#1bacb5",
      "primary-900": "#1e4f5b",
    });
  });

  it("should handle DEFAULT key with multiple color scales", () => {
    const colors = {
      primary: {
        DEFAULT: "#1bacb5",
        "500": "#1bacb5",
      },
      secondary: {
        DEFAULT: "#ff6b6b",
        "500": "#ff6b6b",
      },
    };

    expect(flattenColors(colors)).toEqual({
      primary: "#1bacb5",
      "primary-500": "#1bacb5",
      secondary: "#ff6b6b",
      "secondary-500": "#ff6b6b",
    });
  });

  it("should handle DEFAULT key in nested structures", () => {
    const colors = {
      brand: {
        primary: {
          DEFAULT: "#1bacb5",
          light: "#d4f9f9",
          dark: "#0e343e",
        },
      },
    };

    expect(flattenColors(colors)).toEqual({
      "brand-primary": "#1bacb5", // DEFAULT uses parent key
      "brand-primary-light": "#d4f9f9",
      "brand-primary-dark": "#0e343e",
    });
  });

  it("should handle DEFAULT at top level (edge case)", () => {
    const colors = {
      DEFAULT: "#000000",
      primary: "#ff0000",
    };

    expect(flattenColors(colors)).toEqual({
      DEFAULT: "#000000", // Top-level DEFAULT kept as-is (no parent)
      primary: "#ff0000",
    });
  });

  it("should handle mixed DEFAULT and regular keys", () => {
    const colors = {
      gray: {
        "50": "#f9fafb",
        "100": "#f3f4f6",
        DEFAULT: "#6b7280",
        "500": "#6b7280",
        "900": "#111827",
      },
      white: "#ffffff",
      brand: {
        DEFAULT: "#ff6b6b",
        accent: "#4ecdc4",
      },
    };

    expect(flattenColors(colors)).toEqual({
      "gray-50": "#f9fafb",
      "gray-100": "#f3f4f6",
      gray: "#6b7280", // DEFAULT becomes parent key
      "gray-500": "#6b7280",
      "gray-900": "#111827",
      white: "#ffffff",
      brand: "#ff6b6b", // DEFAULT becomes parent key
      "brand-accent": "#4ecdc4",
    });
  });
});
