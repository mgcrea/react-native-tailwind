import { describe, expect, it } from "vitest";

import type { ParsedModifier } from "./modifiers";
import {
  expandSchemeModifier,
  hasModifier,
  isColorClass,
  isColorSchemeModifier,
  isDirectionalModifier,
  isPlatformModifier,
  isSchemeModifier,
  isStateModifier,
  parseModifier,
  splitModifierClasses,
} from "./modifiers";

describe("parseModifier - basic functionality", () => {
  it("should parse active modifier", () => {
    const result = parseModifier("active:bg-blue-500");
    expect(result).toEqual({
      modifier: "active",
      baseClass: "bg-blue-500",
    });
  });

  it("should parse hover modifier", () => {
    const result = parseModifier("hover:text-red-500");
    expect(result).toEqual({
      modifier: "hover",
      baseClass: "text-red-500",
    });
  });

  it("should parse focus modifier", () => {
    const result = parseModifier("focus:border-green-500");
    expect(result).toEqual({
      modifier: "focus",
      baseClass: "border-green-500",
    });
  });

  it("should parse disabled modifier", () => {
    const result = parseModifier("disabled:bg-gray-400");
    expect(result).toEqual({
      modifier: "disabled",
      baseClass: "bg-gray-400",
    });
  });

  it("should return null for class without modifier", () => {
    expect(parseModifier("bg-blue-500")).toBeNull();
    expect(parseModifier("text-red-500")).toBeNull();
    expect(parseModifier("p-4")).toBeNull();
  });
});

describe("parseModifier - various base classes", () => {
  it("should parse modifiers with spacing classes", () => {
    expect(parseModifier("active:m-4")).toEqual({
      modifier: "active",
      baseClass: "m-4",
    });
    expect(parseModifier("hover:p-8")).toEqual({
      modifier: "hover",
      baseClass: "p-8",
    });
  });

  it("should parse modifiers with layout classes", () => {
    expect(parseModifier("active:flex")).toEqual({
      modifier: "active",
      baseClass: "flex",
    });
    expect(parseModifier("focus:absolute")).toEqual({
      modifier: "focus",
      baseClass: "absolute",
    });
  });

  it("should parse modifiers with typography classes", () => {
    expect(parseModifier("hover:text-lg")).toEqual({
      modifier: "hover",
      baseClass: "text-lg",
    });
    expect(parseModifier("active:font-bold")).toEqual({
      modifier: "active",
      baseClass: "font-bold",
    });
  });

  it("should parse modifiers with arbitrary values", () => {
    expect(parseModifier("active:bg-[#ff0000]")).toEqual({
      modifier: "active",
      baseClass: "bg-[#ff0000]",
    });
    expect(parseModifier("hover:w-[100px]")).toEqual({
      modifier: "hover",
      baseClass: "w-[100px]",
    });
  });

  it("should parse modifiers with complex class names", () => {
    expect(parseModifier("active:inset-x-4")).toEqual({
      modifier: "active",
      baseClass: "inset-x-4",
    });
    expect(parseModifier("focus:border-blue-500")).toEqual({
      modifier: "focus",
      baseClass: "border-blue-500",
    });
  });
});

describe("parseModifier - edge cases", () => {
  it("should return null for unsupported modifiers", () => {
    expect(parseModifier("selected:bg-blue-500")).toBeNull();
    expect(parseModifier("pressed:bg-red-500")).toBeNull();
    expect(parseModifier("custom:bg-green-500")).toBeNull();
    expect(parseModifier("unknown:bg-gray-500")).toBeNull();
  });

  it("should return null for nested modifiers", () => {
    expect(parseModifier("active:hover:bg-blue-500")).toBeNull();
    expect(parseModifier("hover:focus:text-red-500")).toBeNull();
    expect(parseModifier("focus:active:p-4")).toBeNull();
  });

  it("should return null for empty base class", () => {
    expect(parseModifier("active:")).toBeNull();
    expect(parseModifier("hover:")).toBeNull();
    expect(parseModifier("focus:")).toBeNull();
  });

  it("should return null for empty modifier", () => {
    expect(parseModifier(":bg-blue-500")).toBeNull();
    expect(parseModifier(":")).toBeNull();
  });

  it("should return null for class with only colon", () => {
    expect(parseModifier(":")).toBeNull();
  });

  it("should return null for class with multiple colons but no modifier", () => {
    expect(parseModifier("bg:blue:500")).toBeNull();
  });

  it("should handle base classes that look like they have colons", () => {
    // Base class contains colon - should be rejected as nested modifier
    expect(parseModifier("active:some:thing")).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(parseModifier("")).toBeNull();
  });
});

describe("parseModifier - case sensitivity", () => {
  it("should be case-sensitive for modifiers", () => {
    expect(parseModifier("Active:bg-blue-500")).toBeNull();
    expect(parseModifier("ACTIVE:bg-blue-500")).toBeNull();
    expect(parseModifier("Hover:text-red-500")).toBeNull();
    expect(parseModifier("FOCUS:border-green-500")).toBeNull();
  });

  it("should preserve case in base class", () => {
    const result = parseModifier("active:bg-Blue-500");
    expect(result).toEqual({
      modifier: "active",
      baseClass: "bg-Blue-500",
    });
  });
});

describe("hasModifier", () => {
  it("should return true for classes with modifiers", () => {
    expect(hasModifier("active:bg-blue-500")).toBe(true);
    expect(hasModifier("hover:text-red-500")).toBe(true);
    expect(hasModifier("focus:border-green-500")).toBe(true);
    expect(hasModifier("disabled:bg-gray-400")).toBe(true);
  });

  it("should return false for classes without modifiers", () => {
    expect(hasModifier("bg-blue-500")).toBe(false);
    expect(hasModifier("text-red-500")).toBe(false);
    expect(hasModifier("p-4")).toBe(false);
  });

  it("should return false for unsupported modifiers", () => {
    expect(hasModifier("selected:bg-gray-500")).toBe(false);
    expect(hasModifier("pressed:bg-blue-500")).toBe(false);
  });

  it("should return false for nested modifiers", () => {
    expect(hasModifier("active:hover:bg-blue-500")).toBe(false);
  });

  it("should return false for empty base class", () => {
    expect(hasModifier("active:")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(hasModifier("")).toBe(false);
  });
});

describe("splitModifierClasses - basic functionality", () => {
  it("should split classes with and without modifiers", () => {
    const result = splitModifierClasses("bg-blue-500 active:bg-blue-700");
    expect(result).toEqual({
      baseClasses: ["bg-blue-500"],
      modifierClasses: [{ modifier: "active", baseClass: "bg-blue-700" }],
    });
  });

  it("should handle multiple base classes", () => {
    const result = splitModifierClasses("bg-blue-500 p-4 m-2 text-white");
    expect(result).toEqual({
      baseClasses: ["bg-blue-500", "p-4", "m-2", "text-white"],
      modifierClasses: [],
    });
  });

  it("should handle multiple modifier classes", () => {
    const result = splitModifierClasses("active:bg-blue-700 hover:bg-blue-800 focus:bg-blue-900");
    expect(result).toEqual({
      baseClasses: [],
      modifierClasses: [
        { modifier: "active", baseClass: "bg-blue-700" },
        { modifier: "hover", baseClass: "bg-blue-800" },
        { modifier: "focus", baseClass: "bg-blue-900" },
      ],
    });
  });

  it("should handle mixed base and modifier classes", () => {
    const result = splitModifierClasses("bg-blue-500 active:bg-blue-700 p-4 active:p-6");
    expect(result).toEqual({
      baseClasses: ["bg-blue-500", "p-4"],
      modifierClasses: [
        { modifier: "active", baseClass: "bg-blue-700" },
        { modifier: "active", baseClass: "p-6" },
      ],
    });
  });
});

describe("splitModifierClasses - whitespace handling", () => {
  it("should handle leading whitespace", () => {
    const result = splitModifierClasses("  bg-blue-500 active:bg-blue-700");
    expect(result).toEqual({
      baseClasses: ["bg-blue-500"],
      modifierClasses: [{ modifier: "active", baseClass: "bg-blue-700" }],
    });
  });

  it("should handle trailing whitespace", () => {
    const result = splitModifierClasses("bg-blue-500 active:bg-blue-700  ");
    expect(result).toEqual({
      baseClasses: ["bg-blue-500"],
      modifierClasses: [{ modifier: "active", baseClass: "bg-blue-700" }],
    });
  });

  it("should handle multiple spaces between classes", () => {
    const result = splitModifierClasses("bg-blue-500    active:bg-blue-700");
    expect(result).toEqual({
      baseClasses: ["bg-blue-500"],
      modifierClasses: [{ modifier: "active", baseClass: "bg-blue-700" }],
    });
  });

  it("should handle tabs and newlines", () => {
    const result = splitModifierClasses("bg-blue-500\tactive:bg-blue-700\np-4");
    expect(result).toEqual({
      baseClasses: ["bg-blue-500", "p-4"],
      modifierClasses: [{ modifier: "active", baseClass: "bg-blue-700" }],
    });
  });

  it("should handle empty string", () => {
    const result = splitModifierClasses("");
    expect(result).toEqual({
      baseClasses: [],
      modifierClasses: [],
    });
  });

  it("should handle whitespace-only string", () => {
    const result = splitModifierClasses("   ");
    expect(result).toEqual({
      baseClasses: [],
      modifierClasses: [],
    });
  });
});

describe("splitModifierClasses - complex scenarios", () => {
  it("should handle duplicate modifiers for same property", () => {
    const result = splitModifierClasses("active:bg-blue-700 active:bg-red-700");
    expect(result).toEqual({
      baseClasses: [],
      modifierClasses: [
        { modifier: "active", baseClass: "bg-blue-700" },
        { modifier: "active", baseClass: "bg-red-700" },
      ],
    });
  });

  it("should handle all four modifier types", () => {
    const result = splitModifierClasses(
      "bg-gray-500 active:bg-blue-700 hover:bg-green-700 focus:bg-red-700 disabled:bg-gray-400",
    );
    expect(result).toEqual({
      baseClasses: ["bg-gray-500"],
      modifierClasses: [
        { modifier: "active", baseClass: "bg-blue-700" },
        { modifier: "hover", baseClass: "bg-green-700" },
        { modifier: "focus", baseClass: "bg-red-700" },
        { modifier: "disabled", baseClass: "bg-gray-400" },
      ],
    });
  });

  it("should ignore unsupported modifiers in the base classes", () => {
    const result = splitModifierClasses("bg-blue-500 pressed:bg-gray-500 active:bg-blue-700");
    expect(result).toEqual({
      baseClasses: ["bg-blue-500", "pressed:bg-gray-500"],
      modifierClasses: [{ modifier: "active", baseClass: "bg-blue-700" }],
    });
  });

  it("should handle modifiers with arbitrary values", () => {
    const result = splitModifierClasses("bg-blue-500 active:bg-[#ff0000] hover:w-[200px]");
    expect(result).toEqual({
      baseClasses: ["bg-blue-500"],
      modifierClasses: [
        { modifier: "active", baseClass: "bg-[#ff0000]" },
        { modifier: "hover", baseClass: "w-[200px]" },
      ],
    });
  });

  it("should handle real-world className example", () => {
    const result = splitModifierClasses(
      "flex items-center justify-center bg-blue-500 p-4 active:bg-blue-700 active:scale-95 hover:bg-blue-600",
    );
    expect(result).toEqual({
      baseClasses: ["flex", "items-center", "justify-center", "bg-blue-500", "p-4"],
      modifierClasses: [
        { modifier: "active", baseClass: "bg-blue-700" },
        { modifier: "active", baseClass: "scale-95" },
        { modifier: "hover", baseClass: "bg-blue-600" },
      ],
    });
  });
});

describe("splitModifierClasses - nested modifiers", () => {
  it("should ignore nested modifiers", () => {
    const result = splitModifierClasses("bg-blue-500 active:hover:bg-red-500");
    expect(result).toEqual({
      baseClasses: ["bg-blue-500", "active:hover:bg-red-500"],
      modifierClasses: [],
    });
  });
});

describe("type safety", () => {
  it("should properly type modifier types", () => {
    const result = parseModifier("active:bg-blue-500");
    expect(result).toEqual(
      expect.objectContaining({
        modifier: expect.stringMatching(/^(active|hover|focus|disabled)$/),
      }),
    );
  });

  it("should properly type ParsedModifier", () => {
    const result = parseModifier("hover:text-red-500");
    expect(result).toEqual(
      expect.objectContaining({
        modifier: expect.any(String),
        baseClass: expect.any(String),
      }),
    );
  });
});

describe("isSchemeModifier", () => {
  it("should return true for scheme modifier", () => {
    expect(isSchemeModifier("scheme")).toBe(true);
  });

  it("should return false for non-scheme modifiers", () => {
    expect(isSchemeModifier("dark")).toBe(false);
    expect(isSchemeModifier("light")).toBe(false);
    expect(isSchemeModifier("active")).toBe(false);
    expect(isSchemeModifier("ios")).toBe(false);
  });
});

describe("isColorClass", () => {
  it("should return true for text color classes", () => {
    expect(isColorClass("text-red-500")).toBe(true);
    expect(isColorClass("text-systemGray")).toBe(true);
    expect(isColorClass("text-blue-50")).toBe(true);
  });

  it("should return true for background color classes", () => {
    expect(isColorClass("bg-red-500")).toBe(true);
    expect(isColorClass("bg-systemGray")).toBe(true);
    expect(isColorClass("bg-transparent")).toBe(true);
  });

  it("should return true for border color classes", () => {
    expect(isColorClass("border-red-500")).toBe(true);
    expect(isColorClass("border-systemGray")).toBe(true);
    expect(isColorClass("border-black")).toBe(true);
  });

  it("should return false for non-color classes", () => {
    expect(isColorClass("m-4")).toBe(false);
    expect(isColorClass("p-2")).toBe(false);
    expect(isColorClass("flex")).toBe(false);
    expect(isColorClass("rounded-lg")).toBe(false);
    expect(isColorClass("font-bold")).toBe(false);
  });
});

describe("expandSchemeModifier", () => {
  const customColors = {
    "systemGray-dark": "#333333",
    "systemGray-light": "#CCCCCC",
    "primary-dark": "#1E40AF",
    "primary-light": "#BFDBFE",
    "accent-dark": "#DC2626",
    "accent-light": "#FECACA",
  };

  it("should expand text color scheme modifier with default suffixes", () => {
    const modifier = { modifier: "scheme" as const, baseClass: "text-systemGray" };
    const result = expandSchemeModifier(modifier, customColors);

    expect(result).toHaveLength(2);
    expect((result as [ParsedModifier, ParsedModifier])[0]).toEqual({
      modifier: "dark",
      baseClass: "text-systemGray-dark",
    });
    expect((result as [ParsedModifier, ParsedModifier])[1]).toEqual({
      modifier: "light",
      baseClass: "text-systemGray-light",
    });
  });

  it("should expand background color scheme modifier", () => {
    const modifier = { modifier: "scheme" as const, baseClass: "bg-primary" };
    const result = expandSchemeModifier(modifier, customColors);

    expect(result).toHaveLength(2);
    expect((result as [ParsedModifier, ParsedModifier])[0]).toEqual({
      modifier: "dark",
      baseClass: "bg-primary-dark",
    });
    expect((result as [ParsedModifier, ParsedModifier])[1]).toEqual({
      modifier: "light",
      baseClass: "bg-primary-light",
    });
  });

  it("should expand border color scheme modifier", () => {
    const modifier = { modifier: "scheme" as const, baseClass: "border-accent" };
    const result = expandSchemeModifier(modifier, customColors);

    expect(result).toHaveLength(2);
    expect((result as [ParsedModifier, ParsedModifier])[0]).toEqual({
      modifier: "dark",
      baseClass: "border-accent-dark",
    });
    expect((result as [ParsedModifier, ParsedModifier])[1]).toEqual({
      modifier: "light",
      baseClass: "border-accent-light",
    });
  });

  it("should use custom suffixes when provided", () => {
    const modifier = { modifier: "scheme" as const, baseClass: "text-systemGray" };
    const _result = expandSchemeModifier(modifier, customColors, "-darkMode", "-lightMode");

    const expectedColors = {
      "systemGray-darkMode": "#333333",
      "systemGray-lightMode": "#CCCCCC",
    };

    expect(expandSchemeModifier(modifier, expectedColors, "-darkMode", "-lightMode")).toHaveLength(2);
  });

  it("should return empty array for non-color classes", () => {
    const modifier = { modifier: "scheme" as const, baseClass: "m-4" };
    const result = expandSchemeModifier(modifier, customColors);

    expect(result).toEqual([]);
  });

  it("should return empty array when dark color variant is missing", () => {
    const modifier = { modifier: "scheme" as const, baseClass: "text-missing" };
    const incompleteColors = {
      "missing-light": "#FFFFFF",
    };
    const result = expandSchemeModifier(modifier, incompleteColors);

    expect(result).toEqual([]);
  });

  it("should return empty array when light color variant is missing", () => {
    const modifier = { modifier: "scheme" as const, baseClass: "text-missing" };
    const incompleteColors = {
      "missing-dark": "#000000",
    };
    const result = expandSchemeModifier(modifier, incompleteColors);

    expect(result).toEqual([]);
  });

  it("should return empty array when both color variants are missing", () => {
    const modifier = { modifier: "scheme" as const, baseClass: "text-missing" };
    const result = expandSchemeModifier(modifier, customColors);

    expect(result).toEqual([]);
  });
});

describe("parseModifier - directional modifiers (rtl/ltr)", () => {
  it("should parse rtl modifier", () => {
    const result = parseModifier("rtl:text-right");
    expect(result).toEqual({
      modifier: "rtl",
      baseClass: "text-right",
    });
  });

  it("should parse ltr modifier", () => {
    const result = parseModifier("ltr:text-left");
    expect(result).toEqual({
      modifier: "ltr",
      baseClass: "text-left",
    });
  });

  it("should parse directional modifiers with various base classes", () => {
    expect(parseModifier("rtl:ms-4")).toEqual({
      modifier: "rtl",
      baseClass: "ms-4",
    });
    expect(parseModifier("ltr:me-4")).toEqual({
      modifier: "ltr",
      baseClass: "me-4",
    });
    expect(parseModifier("rtl:flex-row-reverse")).toEqual({
      modifier: "rtl",
      baseClass: "flex-row-reverse",
    });
  });
});

describe("modifier type check functions", () => {
  it("should identify state modifiers", () => {
    expect(isStateModifier("active")).toBe(true);
    expect(isStateModifier("hover")).toBe(true);
    expect(isStateModifier("focus")).toBe(true);
    expect(isStateModifier("disabled")).toBe(true);
    expect(isStateModifier("placeholder")).toBe(true);
    expect(isStateModifier("ios")).toBe(false);
    expect(isStateModifier("dark")).toBe(false);
    expect(isStateModifier("rtl")).toBe(false);
  });

  it("should identify platform modifiers", () => {
    expect(isPlatformModifier("ios")).toBe(true);
    expect(isPlatformModifier("android")).toBe(true);
    expect(isPlatformModifier("web")).toBe(true);
    expect(isPlatformModifier("active")).toBe(false);
    expect(isPlatformModifier("dark")).toBe(false);
    expect(isPlatformModifier("rtl")).toBe(false);
  });

  it("should identify color scheme modifiers", () => {
    expect(isColorSchemeModifier("dark")).toBe(true);
    expect(isColorSchemeModifier("light")).toBe(true);
    expect(isColorSchemeModifier("active")).toBe(false);
    expect(isColorSchemeModifier("ios")).toBe(false);
    expect(isColorSchemeModifier("rtl")).toBe(false);
  });

  it("should identify directional modifiers", () => {
    expect(isDirectionalModifier("rtl")).toBe(true);
    expect(isDirectionalModifier("ltr")).toBe(true);
    expect(isDirectionalModifier("active")).toBe(false);
    expect(isDirectionalModifier("ios")).toBe(false);
    expect(isDirectionalModifier("dark")).toBe(false);
  });

  it("should identify scheme modifier", () => {
    expect(isSchemeModifier("scheme")).toBe(true);
    expect(isSchemeModifier("active")).toBe(false);
    expect(isSchemeModifier("dark")).toBe(false);
    expect(isSchemeModifier("rtl")).toBe(false);
  });
});

describe("splitModifierClasses - directional modifiers", () => {
  it("should split directional modifier classes", () => {
    const result = splitModifierClasses("bg-white rtl:bg-gray-100 ltr:bg-gray-50");
    expect(result.baseClasses).toEqual(["bg-white"]);
    expect(result.modifierClasses).toHaveLength(2);
    expect(result.modifierClasses[0]).toEqual({
      modifier: "rtl",
      baseClass: "bg-gray-100",
    });
    expect(result.modifierClasses[1]).toEqual({
      modifier: "ltr",
      baseClass: "bg-gray-50",
    });
  });

  it("should handle mixed modifiers including directional", () => {
    const result = splitModifierClasses("p-4 rtl:ps-6 ios:p-8 dark:bg-gray-900");
    expect(result.baseClasses).toEqual(["p-4"]);
    expect(result.modifierClasses).toHaveLength(3);
    expect(result.modifierClasses.map((m) => m.modifier)).toContain("rtl");
    expect(result.modifierClasses.map((m) => m.modifier)).toContain("ios");
    expect(result.modifierClasses.map((m) => m.modifier)).toContain("dark");
  });
});

describe("splitModifierClasses - text-start/text-end expansion", () => {
  it("should expand text-start to ltr:text-left rtl:text-right", () => {
    const result = splitModifierClasses("text-start");
    expect(result.baseClasses).toEqual([]);
    expect(result.modifierClasses).toHaveLength(2);
    expect(result.modifierClasses).toContainEqual({
      modifier: "ltr",
      baseClass: "text-left",
    });
    expect(result.modifierClasses).toContainEqual({
      modifier: "rtl",
      baseClass: "text-right",
    });
  });

  it("should expand text-end to ltr:text-right rtl:text-left", () => {
    const result = splitModifierClasses("text-end");
    expect(result.baseClasses).toEqual([]);
    expect(result.modifierClasses).toHaveLength(2);
    expect(result.modifierClasses).toContainEqual({
      modifier: "ltr",
      baseClass: "text-right",
    });
    expect(result.modifierClasses).toContainEqual({
      modifier: "rtl",
      baseClass: "text-left",
    });
  });

  it("should handle text-start with other classes", () => {
    const result = splitModifierClasses("p-4 text-start bg-white");
    expect(result.baseClasses).toEqual(["p-4", "bg-white"]);
    expect(result.modifierClasses).toHaveLength(2);
    expect(result.modifierClasses).toContainEqual({
      modifier: "ltr",
      baseClass: "text-left",
    });
    expect(result.modifierClasses).toContainEqual({
      modifier: "rtl",
      baseClass: "text-right",
    });
  });

  it("should handle both text-start and text-end in same className", () => {
    // This is unusual but should work
    const result = splitModifierClasses("text-start text-end");
    expect(result.baseClasses).toEqual([]);
    expect(result.modifierClasses).toHaveLength(4);
    // text-start expands
    expect(result.modifierClasses).toContainEqual({
      modifier: "ltr",
      baseClass: "text-left",
    });
    expect(result.modifierClasses).toContainEqual({
      modifier: "rtl",
      baseClass: "text-right",
    });
    // text-end expands
    expect(result.modifierClasses).toContainEqual({
      modifier: "ltr",
      baseClass: "text-right",
    });
    expect(result.modifierClasses).toContainEqual({
      modifier: "rtl",
      baseClass: "text-left",
    });
  });

  it("should not affect text-left and text-right (no expansion)", () => {
    const result = splitModifierClasses("text-left text-right text-center");
    expect(result.baseClasses).toEqual(["text-left", "text-right", "text-center"]);
    expect(result.modifierClasses).toEqual([]);
  });

  it("should handle text-start/text-end with other modifiers", () => {
    const result = splitModifierClasses("text-start active:bg-blue-500 rtl:pr-4");
    expect(result.baseClasses).toEqual([]);
    expect(result.modifierClasses).toHaveLength(4);
    // text-start expansion
    expect(result.modifierClasses).toContainEqual({
      modifier: "ltr",
      baseClass: "text-left",
    });
    expect(result.modifierClasses).toContainEqual({
      modifier: "rtl",
      baseClass: "text-right",
    });
    // explicit modifiers
    expect(result.modifierClasses).toContainEqual({
      modifier: "active",
      baseClass: "bg-blue-500",
    });
    expect(result.modifierClasses).toContainEqual({
      modifier: "rtl",
      baseClass: "pr-4",
    });
  });
});
