/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, expect, it, vi } from "vitest";

import { parsePlaceholderClass, parsePlaceholderClasses } from "./placeholder";

describe("parsePlaceholderClass", () => {
  it("should parse text color classes", () => {
    // Using actual colors from this project's custom palette (src/config/tailwind.ts)
    expect(parsePlaceholderClass("text-red-500")).toBe("#fb2c36");
    expect(parsePlaceholderClass("text-blue-500")).toBe("#2b7fff");
    expect(parsePlaceholderClass("text-gray-400")).toBe("#99a1af");
  });

  it("should parse text colors with opacity", () => {
    // Using actual colors from custom palette
    // Note: opacity conversion uppercases hex values
    expect(parsePlaceholderClass("text-red-500/50")).toBe("#FB2C3680"); // 50% opacity
    expect(parsePlaceholderClass("text-blue-500/75")).toBe("#2B7FFFBF"); // 75% opacity
    expect(parsePlaceholderClass("text-gray-400/25")).toBe("#99A1AF40"); // 25% opacity
  });

  it("should parse arbitrary color values", () => {
    expect(parsePlaceholderClass("text-[#ff0000]")).toBe("#ff0000");
    expect(parsePlaceholderClass("text-[#ff0000aa]")).toBe("#ff0000aa");
  });

  it("should parse custom colors", () => {
    const customColors = {
      "brand-primary": "#123456",
      "brand-secondary": "#654321",
    };
    expect(parsePlaceholderClass("text-brand-primary", customColors)).toBe("#123456");
    expect(parsePlaceholderClass("text-brand-secondary", customColors)).toBe("#654321");
  });

  it("should return null for non-text color classes", () => {
    expect(parsePlaceholderClass("font-bold")).toBeNull();
    expect(parsePlaceholderClass("text-lg")).toBeNull();
    expect(parsePlaceholderClass("text-center")).toBeNull();
    expect(parsePlaceholderClass("italic")).toBeNull();
  });

  it("should warn about unsupported utilities in development", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    parsePlaceholderClass("font-bold");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Only text color utilities are supported in placeholder: modifier"),
    );

    parsePlaceholderClass("text-lg");
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Only text color utilities are supported in placeholder: modifier"),
    );

    process.env.NODE_ENV = originalEnv;
    consoleSpy.mockRestore();
  });

  it("should not warn in production", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    parsePlaceholderClass("font-bold");
    expect(consoleSpy).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
    consoleSpy.mockRestore();
  });

  it("should return null for invalid color values", () => {
    expect(parsePlaceholderClass("text-invalid-color")).toBeNull();
    expect(parsePlaceholderClass("text-[invalid]")).toBeNull();
  });
});

describe("parsePlaceholderClasses", () => {
  it("should parse multiple color classes (last wins)", () => {
    expect(parsePlaceholderClasses("text-red-500 text-blue-500")).toBe("#2b7fff"); // blue-500
    expect(parsePlaceholderClasses("text-gray-400 text-green-500")).toBe("#00c950"); // green-500
  });

  it("should ignore non-color classes and return last valid color", () => {
    expect(parsePlaceholderClasses("text-red-500 font-bold text-blue-500")).toBe("#2b7fff");
    expect(parsePlaceholderClasses("font-bold text-red-500 text-lg")).toBe("#fb2c36");
  });

  it("should return null if no valid colors found", () => {
    expect(parsePlaceholderClasses("font-bold italic text-lg")).toBeNull();
    expect(parsePlaceholderClasses("")).toBeNull();
  });

  it("should handle opacity modifiers", () => {
    // Note: opacity conversion uppercases hex values
    expect(parsePlaceholderClasses("text-red-500/50")).toBe("#FB2C3680");
    expect(parsePlaceholderClasses("text-red-500 text-blue-500/75")).toBe("#2B7FFFBF");
  });

  it("should work with custom colors", () => {
    const customColors = { "brand-primary": "#123456" };
    expect(parsePlaceholderClasses("text-red-500 text-brand-primary", customColors)).toBe("#123456");
  });
});
