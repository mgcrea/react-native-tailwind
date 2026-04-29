import { describe, expect, it } from "vitest";

import {
  DEFAULT_CLASS_ATTRIBUTES,
  buildAttributeMatchers,
  getTargetStyleProp,
  isAttributeSupported,
} from "./attributeMatchers";

describe("DEFAULT_CLASS_ATTRIBUTES", () => {
  it("should contain standard className attributes", () => {
    expect(DEFAULT_CLASS_ATTRIBUTES).toEqual([
      "className",
      "contentContainerClassName",
      "columnWrapperClassName",
      "ListHeaderComponentClassName",
      "ListFooterComponentClassName",
    ]);
  });

  it("should be a readonly array", () => {
    // TypeScript compile-time check - if this compiles, the const assertion works
    const _typeCheck: readonly string[] = DEFAULT_CLASS_ATTRIBUTES;
    expect(_typeCheck).toBeDefined();
  });
});

describe("buildAttributeMatchers", () => {
  it("should separate exact matches from patterns", () => {
    const attributes = ["className", "containerClassName", "*Style", "custom*"];
    const result = buildAttributeMatchers(attributes);

    // Exact matches should be in a Set
    expect(result.exactMatches).toBeInstanceOf(Set);
    expect(result.exactMatches.has("className")).toBe(true);
    expect(result.exactMatches.has("containerClassName")).toBe(true);
    expect(result.exactMatches.size).toBe(2);

    // Patterns should be RegExp objects
    expect(result.patterns).toHaveLength(2);
    expect(result.patterns[0]).toBeInstanceOf(RegExp);
    expect(result.patterns[1]).toBeInstanceOf(RegExp);
  });

  it("should handle only exact matches", () => {
    const attributes = ["className", "customClass", "anotherClass"];
    const result = buildAttributeMatchers(attributes);

    expect(result.exactMatches.size).toBe(3);
    expect(result.patterns).toHaveLength(0);
  });

  it("should handle only patterns", () => {
    const attributes = ["*ClassName", "container*", "*Style*"];
    const result = buildAttributeMatchers(attributes);

    expect(result.exactMatches.size).toBe(0);
    expect(result.patterns).toHaveLength(3);
  });

  it("should handle empty array", () => {
    const result = buildAttributeMatchers([]);

    expect(result.exactMatches.size).toBe(0);
    expect(result.patterns).toHaveLength(0);
  });

  it("should convert glob patterns to regex correctly", () => {
    const attributes = ["*ClassName", "container*", "*custom*"];
    const result = buildAttributeMatchers(attributes);

    // Test that patterns match expected strings
    expect(result.patterns[0]?.test("myClassName")).toBe(true);
    expect(result.patterns[0]?.test("fooClassName")).toBe(true);
    expect(result.patterns[0]?.test("className")).toBe(false); // Doesn't start with anything

    expect(result.patterns[1]?.test("containerStyle")).toBe(true);
    expect(result.patterns[1]?.test("containerFoo")).toBe(true);
    expect(result.patterns[1]?.test("myContainer")).toBe(false);

    expect(result.patterns[2]?.test("mycustomattr")).toBe(true);
    expect(result.patterns[2]?.test("customattr")).toBe(true);
    expect(result.patterns[2]?.test("attrcustom")).toBe(true);
  });

  it("should handle multiple wildcards in same pattern", () => {
    const attributes = ["*custom*Class*"];
    const result = buildAttributeMatchers(attributes);

    expect(result.patterns[0]?.test("mycustomFooClassName")).toBe(true);
    expect(result.patterns[0]?.test("customClassName")).toBe(true);
    expect(result.patterns[0]?.test("foocustombarClassbaz")).toBe(true);
  });
});

describe("isAttributeSupported", () => {
  it("should match exact attributes", () => {
    const { exactMatches, patterns } = buildAttributeMatchers(["className", "customClass"]);

    expect(isAttributeSupported("className", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("customClass", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("otherClass", exactMatches, patterns)).toBe(false);
  });

  it("should match pattern-based attributes", () => {
    const { exactMatches, patterns } = buildAttributeMatchers(["*ClassName", "container*"]);

    expect(isAttributeSupported("myClassName", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("fooClassName", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("containerStyle", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("containerFoo", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("randomAttr", exactMatches, patterns)).toBe(false);
  });

  it("should match both exact and pattern attributes", () => {
    const { exactMatches, patterns } = buildAttributeMatchers(["className", "*Style"]);

    // Exact match
    expect(isAttributeSupported("className", exactMatches, patterns)).toBe(true);

    // Pattern match
    expect(isAttributeSupported("containerStyle", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("customStyle", exactMatches, patterns)).toBe(true);

    // No match
    expect(isAttributeSupported("otherAttr", exactMatches, patterns)).toBe(false);
  });

  it("should prioritize exact matches (performance)", () => {
    // Even if a pattern would match, exact match should work
    const { exactMatches, patterns } = buildAttributeMatchers(["className", "*Name"]);

    expect(isAttributeSupported("className", exactMatches, patterns)).toBe(true);
  });

  it("should handle empty matchers", () => {
    const { exactMatches, patterns } = buildAttributeMatchers([]);

    expect(isAttributeSupported("className", exactMatches, patterns)).toBe(false);
    expect(isAttributeSupported("anyAttr", exactMatches, patterns)).toBe(false);
  });

  it("should be case-sensitive", () => {
    const { exactMatches, patterns } = buildAttributeMatchers(["className"]);

    expect(isAttributeSupported("className", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("ClassName", exactMatches, patterns)).toBe(false);
    expect(isAttributeSupported("classname", exactMatches, patterns)).toBe(false);
  });

  it("should match default React Native FlatList attributes", () => {
    const { exactMatches, patterns } = buildAttributeMatchers([...DEFAULT_CLASS_ATTRIBUTES]);

    expect(isAttributeSupported("className", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("contentContainerClassName", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("columnWrapperClassName", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("ListHeaderComponentClassName", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("ListFooterComponentClassName", exactMatches, patterns)).toBe(true);
  });

  it("should work with complex glob patterns", () => {
    const { exactMatches, patterns } = buildAttributeMatchers(["*Container*Class*"]);

    expect(isAttributeSupported("myContainerFooClassName", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("ContainerClassName", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("fooContainerBarClassBaz", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("ContainerStyle", exactMatches, patterns)).toBe(false);
  });
});

describe("getTargetStyleProp", () => {
  it("should convert className to style", () => {
    expect(getTargetStyleProp("className")).toBe("style");
  });

  it("should convert *ClassName to *Style", () => {
    expect(getTargetStyleProp("contentContainerClassName")).toBe("contentContainerStyle");
    expect(getTargetStyleProp("columnWrapperClassName")).toBe("columnWrapperStyle");
    expect(getTargetStyleProp("ListHeaderComponentClassName")).toBe("ListHeaderComponentStyle");
    expect(getTargetStyleProp("ListFooterComponentClassName")).toBe("ListFooterComponentStyle");
  });

  it("should handle custom className attributes", () => {
    expect(getTargetStyleProp("customClassName")).toBe("customStyle");
    expect(getTargetStyleProp("myCustomClassName")).toBe("myCustomStyle");
    expect(getTargetStyleProp("fooBarClassName")).toBe("fooBarStyle");
  });

  it("should return style for attributes not ending in ClassName", () => {
    expect(getTargetStyleProp("customClass")).toBe("style");
    expect(getTargetStyleProp("class")).toBe("style");
    expect(getTargetStyleProp("myAttr")).toBe("style");
    expect(getTargetStyleProp("")).toBe("style");
  });

  it("should handle edge cases", () => {
    // Attribute IS exactly "ClassName"
    expect(getTargetStyleProp("ClassName")).toBe("Style");

    // Multiple "ClassName" occurrences (only last one replaced)
    expect(getTargetStyleProp("classNameClassName")).toBe("classNameStyle");
  });

  it("should be case-sensitive", () => {
    expect(getTargetStyleProp("classname")).toBe("style");
    expect(getTargetStyleProp("CLASSNAME")).toBe("style");
    expect(getTargetStyleProp("classNamee")).toBe("style");
  });

  it("should handle all default attributes correctly", () => {
    const expectedMappings = [
      ["className", "style"],
      ["contentContainerClassName", "contentContainerStyle"],
      ["columnWrapperClassName", "columnWrapperStyle"],
      ["ListHeaderComponentClassName", "ListHeaderComponentStyle"],
      ["ListFooterComponentClassName", "ListFooterComponentStyle"],
    ] as const;

    for (const [input, expected] of expectedMappings) {
      expect(getTargetStyleProp(input)).toBe(expected);
    }
  });
});

describe("Integration - Real-world scenarios", () => {
  it("should handle FlatList with multiple className attributes", () => {
    const { exactMatches, patterns } = buildAttributeMatchers([...DEFAULT_CLASS_ATTRIBUTES]);

    // All FlatList className props should be supported
    const flatListAttrs = [
      ["className", "style"],
      ["contentContainerClassName", "contentContainerStyle"],
      ["columnWrapperClassName", "columnWrapperStyle"],
      ["ListHeaderComponentClassName", "ListHeaderComponentStyle"],
      ["ListFooterComponentClassName", "ListFooterComponentStyle"],
    ] as const;

    for (const [attr, expectedStyle] of flatListAttrs) {
      expect(isAttributeSupported(attr, exactMatches, patterns)).toBe(true);
      expect(getTargetStyleProp(attr)).toBe(expectedStyle);
    }
  });

  it("should support custom wildcard pattern for all *ClassName attributes", () => {
    const { exactMatches, patterns } = buildAttributeMatchers(["*ClassName"]);

    // Should match any attribute ending in ClassName (with at least one char before)
    // Note: The regex ^.*ClassName$ requires at least one character due to .*
    expect(isAttributeSupported("myCustomClassName", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("fooBarBazClassName", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("xClassName", exactMatches, patterns)).toBe(true);

    // Edge case: bare "className" needs at least one char before it for .* to match
    // If you want to include "className", add it explicitly or use a different pattern
    expect(isAttributeSupported("className", exactMatches, patterns)).toBe(false);

    // Should convert to corresponding style prop
    expect(getTargetStyleProp("myCustomClassName")).toBe("myCustomStyle");

    // Should not match non-className attributes
    expect(isAttributeSupported("myCustomClass", exactMatches, patterns)).toBe(false);
  });

  it("should support combining exact matches with patterns", () => {
    const { exactMatches, patterns } = buildAttributeMatchers([
      "className",
      "customClass",
      "*ClassName",
      "container*",
    ]);

    // Exact matches
    expect(isAttributeSupported("className", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("customClass", exactMatches, patterns)).toBe(true);

    // Pattern matches
    expect(isAttributeSupported("myClassName", exactMatches, patterns)).toBe(true);
    expect(isAttributeSupported("containerStyle", exactMatches, patterns)).toBe(true);

    // No matches
    expect(isAttributeSupported("randomAttr", exactMatches, patterns)).toBe(false);
  });

  it("should handle empty configuration gracefully", () => {
    const { exactMatches, patterns } = buildAttributeMatchers([]);

    // Nothing should be supported
    expect(isAttributeSupported("className", exactMatches, patterns)).toBe(false);
    expect(isAttributeSupported("anything", exactMatches, patterns)).toBe(false);

    // getTargetStyleProp should still work
    expect(getTargetStyleProp("className")).toBe("style");
    expect(getTargetStyleProp("customClassName")).toBe("customStyle");
  });
});
