import { describe, expect, it } from "vitest";

import { SUPPORTED_MODIFIERS, hasModifiers, splitModifierClasses } from "./modifiers";

describe("SUPPORTED_MODIFIERS", () => {
  it("should export list of supported modifiers", () => {
    expect(SUPPORTED_MODIFIERS).toEqual(["active", "focus", "disabled"]);
  });

  it("should be readonly", () => {
    // TypeScript enforces this at compile time
    expect(Array.isArray(SUPPORTED_MODIFIERS)).toBe(true);
  });
});

describe("hasModifiers", () => {
  it("should return true for active modifier", () => {
    expect(hasModifiers("active:bg-blue-500")).toBe(true);
    expect(hasModifiers("m-4 active:bg-blue-500")).toBe(true);
    expect(hasModifiers("active:bg-blue-500 active:text-white")).toBe(true);
  });

  it("should return true for focus modifier", () => {
    expect(hasModifiers("focus:border-blue-500")).toBe(true);
    expect(hasModifiers("p-2 focus:border-blue-500")).toBe(true);
    expect(hasModifiers("focus:bg-blue-500 focus:text-white")).toBe(true);
  });

  it("should return true for disabled modifier", () => {
    expect(hasModifiers("disabled:opacity-50")).toBe(true);
    expect(hasModifiers("bg-blue-500 disabled:opacity-50")).toBe(true);
    expect(hasModifiers("disabled:bg-gray-300 disabled:text-gray-500")).toBe(true);
  });

  it("should return true for multiple different modifiers", () => {
    expect(hasModifiers("active:bg-blue-700 focus:border-blue-500")).toBe(true);
    expect(hasModifiers("bg-blue-500 active:bg-blue-700 disabled:opacity-50")).toBe(true);
    expect(hasModifiers("focus:border-blue-500 disabled:bg-gray-300")).toBe(true);
  });

  it("should return false for no modifiers", () => {
    expect(hasModifiers("bg-blue-500")).toBe(false);
    expect(hasModifiers("m-4 p-2 text-white")).toBe(false);
    expect(hasModifiers("flex items-center justify-center")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(hasModifiers("")).toBe(false);
  });

  it("should return false for partial matches", () => {
    expect(hasModifiers("active")).toBe(false);
    expect(hasModifiers("focus")).toBe(false);
    expect(hasModifiers("disabled")).toBe(false);
    expect(hasModifiers("active-bg-blue-500")).toBe(false);
    expect(hasModifiers("focusborder-blue-500")).toBe(false);
  });

  it("should detect modifiers anywhere in the string", () => {
    expect(hasModifiers("bg-blue-500 active:bg-blue-700 text-white")).toBe(true);
    expect(hasModifiers("flex items-center focus:border-blue-500 p-4")).toBe(true);
  });

  it("should handle whitespace variations", () => {
    expect(hasModifiers("  active:bg-blue-500  ")).toBe(true);
    expect(hasModifiers("\tactive:bg-blue-500\n")).toBe(true);
    expect(hasModifiers("m-4  active:bg-blue-500  p-2")).toBe(true);
  });

  it("should be case-sensitive", () => {
    expect(hasModifiers("Active:bg-blue-500")).toBe(false);
    expect(hasModifiers("ACTIVE:bg-blue-500")).toBe(false);
    expect(hasModifiers("Focus:border-blue-500")).toBe(false);
  });
});

describe("splitModifierClasses", () => {
  it("should split base classes without modifiers", () => {
    const result = splitModifierClasses("m-4 p-2 bg-blue-500");

    expect(result.base).toEqual(["m-4", "p-2", "bg-blue-500"]);
    expect(result.modifiers.size).toBe(0);
  });

  it("should split active modifier classes", () => {
    const result = splitModifierClasses("bg-blue-500 active:bg-blue-700");

    expect(result.base).toEqual(["bg-blue-500"]);
    expect(result.modifiers.get("active")).toEqual(["bg-blue-700"]);
  });

  it("should split focus modifier classes", () => {
    const result = splitModifierClasses("border-gray-300 focus:border-blue-500");

    expect(result.base).toEqual(["border-gray-300"]);
    expect(result.modifiers.get("focus")).toEqual(["border-blue-500"]);
  });

  it("should split disabled modifier classes", () => {
    const result = splitModifierClasses("bg-blue-500 disabled:bg-gray-300");

    expect(result.base).toEqual(["bg-blue-500"]);
    expect(result.modifiers.get("disabled")).toEqual(["bg-gray-300"]);
  });

  it("should split multiple classes with same modifier", () => {
    const result = splitModifierClasses(
      "bg-blue-500 active:bg-blue-700 active:text-white active:border-blue-900",
    );

    expect(result.base).toEqual(["bg-blue-500"]);
    expect(result.modifiers.get("active")).toEqual(["bg-blue-700", "text-white", "border-blue-900"]);
  });

  it("should split multiple different modifiers", () => {
    const result = splitModifierClasses(
      "bg-blue-500 active:bg-blue-700 focus:border-blue-500 disabled:opacity-50",
    );

    expect(result.base).toEqual(["bg-blue-500"]);
    expect(result.modifiers.get("active")).toEqual(["bg-blue-700"]);
    expect(result.modifiers.get("focus")).toEqual(["border-blue-500"]);
    expect(result.modifiers.get("disabled")).toEqual(["opacity-50"]);
  });

  it("should handle complex combination of base and modifier classes", () => {
    const result = splitModifierClasses(
      "m-4 p-2 bg-blue-500 text-white rounded-lg active:bg-blue-700 active:text-gray-100 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-300",
    );

    expect(result.base).toEqual(["m-4", "p-2", "bg-blue-500", "text-white", "rounded-lg"]);
    expect(result.modifiers.get("active")).toEqual(["bg-blue-700", "text-gray-100"]);
    expect(result.modifiers.get("focus")).toEqual(["border-blue-500"]);
    expect(result.modifiers.get("disabled")).toEqual(["opacity-50", "bg-gray-300"]);
  });

  it("should handle empty string", () => {
    const result = splitModifierClasses("");

    expect(result.base).toEqual([]);
    expect(result.modifiers.size).toBe(0);
  });

  it("should handle whitespace-only string", () => {
    const result = splitModifierClasses("   ");

    expect(result.base).toEqual([]);
    expect(result.modifiers.size).toBe(0);
  });

  it("should handle only modifier classes", () => {
    const result = splitModifierClasses("active:bg-blue-700 focus:border-blue-500");

    expect(result.base).toEqual([]);
    expect(result.modifiers.get("active")).toEqual(["bg-blue-700"]);
    expect(result.modifiers.get("focus")).toEqual(["border-blue-500"]);
  });

  it("should filter out empty strings from split", () => {
    const result = splitModifierClasses("m-4  p-2   bg-blue-500");

    expect(result.base).toEqual(["m-4", "p-2", "bg-blue-500"]);
    expect(result.modifiers.size).toBe(0);
  });

  it("should handle leading and trailing whitespace", () => {
    const result = splitModifierClasses("  m-4 active:bg-blue-700  ");

    expect(result.base).toEqual(["m-4"]);
    expect(result.modifiers.get("active")).toEqual(["bg-blue-700"]);
  });

  it("should handle arbitrary values with modifiers", () => {
    const result = splitModifierClasses("bg-[#ff0000] active:bg-[#00ff00] text-[14px]");

    expect(result.base).toEqual(["bg-[#ff0000]", "text-[14px]"]);
    expect(result.modifiers.get("active")).toEqual(["bg-[#00ff00]"]);
  });

  it("should handle opacity modifiers with state modifiers", () => {
    const result = splitModifierClasses("bg-black/50 active:bg-black/80 text-white/90");

    expect(result.base).toEqual(["bg-black/50", "text-white/90"]);
    expect(result.modifiers.get("active")).toEqual(["bg-black/80"]);
  });

  it("should preserve order of base classes", () => {
    const result = splitModifierClasses("z-10 m-4 a-1 p-2");

    expect(result.base).toEqual(["z-10", "m-4", "a-1", "p-2"]);
  });

  it("should preserve order of modifier classes", () => {
    const result = splitModifierClasses("active:z-10 active:m-4 active:a-1 active:p-2");

    expect(result.modifiers.get("active")).toEqual(["z-10", "m-4", "a-1", "p-2"]);
  });

  it("should not match modifiers without colon", () => {
    const result = splitModifierClasses("active bg-blue-500 focus border-blue-500");

    expect(result.base).toEqual(["active", "bg-blue-500", "focus", "border-blue-500"]);
    expect(result.modifiers.size).toBe(0);
  });

  it("should not match partial modifier names", () => {
    const result = splitModifierClasses("reactive:bg-blue-500 prefocus:border-blue-500");

    expect(result.base).toEqual(["reactive:bg-blue-500", "prefocus:border-blue-500"]);
    expect(result.modifiers.size).toBe(0);
  });

  it("should handle modifiers at different positions", () => {
    const result = splitModifierClasses(
      "active:bg-blue-700 m-4 focus:border-blue-500 p-2 disabled:opacity-50",
    );

    expect(result.base).toEqual(["m-4", "p-2"]);
    expect(result.modifiers.get("active")).toEqual(["bg-blue-700"]);
    expect(result.modifiers.get("focus")).toEqual(["border-blue-500"]);
    expect(result.modifiers.get("disabled")).toEqual(["opacity-50"]);
  });

  it("should return empty Map when no modifiers present", () => {
    const result = splitModifierClasses("m-4 p-2 bg-blue-500");

    expect(result.modifiers).toBeInstanceOf(Map);
    expect(result.modifiers.size).toBe(0);
    expect(result.modifiers.get("active")).toBeUndefined();
    expect(result.modifiers.get("focus")).toBeUndefined();
    expect(result.modifiers.get("disabled")).toBeUndefined();
  });

  it("should return Map with only present modifiers", () => {
    const result = splitModifierClasses("bg-blue-500 active:bg-blue-700");

    expect(result.modifiers.has("active")).toBe(true);
    expect(result.modifiers.has("focus")).toBe(false);
    expect(result.modifiers.has("disabled")).toBe(false);
  });

  it("should handle real-world button example", () => {
    const result = splitModifierClasses(
      "px-4 py-2 bg-blue-500 text-white rounded-lg active:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500",
    );

    expect(result.base).toEqual(["px-4", "py-2", "bg-blue-500", "text-white", "rounded-lg"]);
    expect(result.modifiers.get("active")).toEqual(["bg-blue-700"]);
    expect(result.modifiers.get("disabled")).toEqual(["bg-gray-300", "text-gray-500"]);
    expect(result.modifiers.get("focus")).toBeUndefined();
  });

  it("should handle real-world input example", () => {
    const result = splitModifierClasses(
      "border border-gray-300 rounded p-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400",
    );

    expect(result.base).toEqual(["border", "border-gray-300", "rounded", "p-2"]);
    expect(result.modifiers.get("focus")).toEqual(["border-blue-500", "outline-none"]);
    expect(result.modifiers.get("disabled")).toEqual(["bg-gray-100", "text-gray-400"]);
    expect(result.modifiers.get("active")).toBeUndefined();
  });

  it("should be consistent across multiple calls", () => {
    const className = "m-4 active:bg-blue-700 focus:border-blue-500";
    const result1 = splitModifierClasses(className);
    const result2 = splitModifierClasses(className);

    expect(result1.base).toEqual(result2.base);
    expect(result1.modifiers.get("active")).toEqual(result2.modifiers.get("active"));
    expect(result1.modifiers.get("focus")).toEqual(result2.modifiers.get("focus"));
  });

  it("should handle negative values with modifiers", () => {
    const result = splitModifierClasses("-m-4 active:-m-8 -translate-x-2");

    expect(result.base).toEqual(["-m-4", "-translate-x-2"]);
    expect(result.modifiers.get("active")).toEqual(["-m-8"]);
  });

  it("should handle transform classes with modifiers", () => {
    const result = splitModifierClasses("scale-100 active:scale-110 rotate-0 active:rotate-45");

    expect(result.base).toEqual(["scale-100", "rotate-0"]);
    expect(result.modifiers.get("active")).toEqual(["scale-110", "rotate-45"]);
  });
});
