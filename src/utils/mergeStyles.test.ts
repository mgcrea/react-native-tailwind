import { describe, expect, it } from "vitest";

import { mergeStyles } from "./mergeStyles";

describe("mergeStyles", () => {
  describe("standard properties", () => {
    it("should merge non-array properties like Object.assign", () => {
      const target = { margin: 4 };
      const source = { padding: 8 };
      expect(mergeStyles(target, source)).toEqual({ margin: 4, padding: 8 });
    });

    it("should overwrite non-array properties", () => {
      const target = { margin: 4 };
      const source = { margin: 8 };
      expect(mergeStyles(target, source)).toEqual({ margin: 8 });
    });

    it("should handle shadowOffset as standard property (object, not array)", () => {
      const target = { shadowOffset: { width: 0, height: 1 } };
      const source = { shadowOffset: { width: 0, height: 2 } };
      expect(mergeStyles(target, source)).toEqual({
        shadowOffset: { width: 0, height: 2 },
      });
    });
  });

  describe("transform array merging - different types combined", () => {
    it("should combine different transform types", () => {
      const target = { transform: [{ rotate: "45deg" }] };
      const source = { transform: [{ scale: 1.1 }] };
      expect(mergeStyles(target, source)).toEqual({
        transform: [{ rotate: "45deg" }, { scale: 1.1 }],
      });
    });

    it("should handle multiple transforms in source", () => {
      const target = { transform: [{ rotate: "45deg" }] };
      const source = { transform: [{ scale: 1.1 }, { translateX: 10 }] };
      expect(mergeStyles(target, source)).toEqual({
        transform: [{ rotate: "45deg" }, { scale: 1.1 }, { translateX: 10 }],
      });
    });

    it("should assign transform when target has no transform", () => {
      const target = { margin: 4 };
      const source = { transform: [{ scale: 1.1 }] };
      expect(mergeStyles(target, source)).toEqual({
        margin: 4,
        transform: [{ scale: 1.1 }],
      });
    });

    it("should handle empty target transform array", () => {
      const target = { transform: [] as Array<{ scale?: number }> };
      const source = { transform: [{ scale: 1.1 }] };
      expect(mergeStyles(target, source)).toEqual({
        transform: [{ scale: 1.1 }],
      });
    });
  });

  describe("transform array merging - same type last wins (Tailwind parity)", () => {
    it("should replace same transform type with last value", () => {
      const target = { transform: [{ rotate: "45deg" }] };
      const source = { transform: [{ rotate: "90deg" }] };
      expect(mergeStyles(target, source)).toEqual({
        transform: [{ rotate: "90deg" }],
      });
    });

    it("should replace same scale type with last value", () => {
      const target = { transform: [{ scale: 0.5 }] };
      const source = { transform: [{ scale: 1.1 }] };
      expect(mergeStyles(target, source)).toEqual({
        transform: [{ scale: 1.1 }],
      });
    });

    it("should preserve order when replacing - rotate stays in position", () => {
      const target = { transform: [{ rotate: "45deg" }, { scale: 1.1 }] };
      const source = { transform: [{ rotate: "90deg" }] };
      expect(mergeStyles(target, source)).toEqual({
        transform: [{ rotate: "90deg" }, { scale: 1.1 }],
      });
    });

    it("should handle mixed: replace same types, add new types", () => {
      const target = { transform: [{ rotate: "45deg" }, { scale: 0.5 }] };
      const source = { transform: [{ scale: 1.1 }, { translateX: 10 }] };
      expect(mergeStyles(target, source)).toEqual({
        transform: [{ rotate: "45deg" }, { scale: 1.1 }, { translateX: 10 }],
      });
    });

    it("should handle scaleX and scaleY as different types", () => {
      const target = { transform: [{ scaleX: 0.5 }] };
      const source = { transform: [{ scaleY: 1.5 }] };
      expect(mergeStyles(target, source)).toEqual({
        transform: [{ scaleX: 0.5 }, { scaleY: 1.5 }],
      });
    });
  });

  describe("filter array merging", () => {
    it("should compose different filter functions", () => {
      const target = { filter: [{ brightness: 1.1 }] };
      const source = { filter: [{ blur: 8 }] };
      expect(mergeStyles(target, source)).toEqual({
        filter: [{ blur: 8 }, { brightness: 1.1 }],
      });
    });

    it("should replace the same filter function with the last value", () => {
      const target = { filter: [{ brightness: 1.1 }, { blur: 8 }] };
      const source = { filter: [{ brightness: 0.9 }] };
      expect(mergeStyles(target, source)).toEqual({
        filter: [{ blur: 8 }, { brightness: 0.9 }],
      });
    });

    it("should clear filters when the source array is empty", () => {
      const target = { filter: [{ brightness: 1.1 }, { blur: 8 }] };
      expect(mergeStyles(target, { filter: [] })).toEqual({ filter: [] });
    });

    it("should use Tailwind's canonical order for composed filters", () => {
      const target = { filter: [{ dropShadow: { offsetX: 0, offsetY: 1 } }, { sepia: 1 }] };
      const source = { filter: [{ hueRotate: "45deg" }, { contrast: 1.25 }] };
      expect(mergeStyles(target, source)).toEqual({
        filter: [
          { contrast: 1.25 },
          { hueRotate: "45deg" },
          { sepia: 1 },
          { dropShadow: { offsetX: 0, offsetY: 1 } },
        ],
      });
    });
  });

  describe("mixed properties", () => {
    it("should handle mix of standard and transform properties", () => {
      const target = { margin: 4, transform: [{ rotate: "45deg" }] };
      const source = { padding: 8, transform: [{ scale: 1.1 }] };
      expect(mergeStyles(target, source)).toEqual({
        margin: 4,
        padding: 8,
        transform: [{ rotate: "45deg" }, { scale: 1.1 }],
      });
    });
  });

  describe("mutation behavior", () => {
    it("should mutate and return target object", () => {
      const target = { margin: 4 };
      const source = { padding: 8 };
      const result = mergeStyles(target, source);
      expect(result).toBe(target);
      expect(target).toEqual({ margin: 4, padding: 8 });
    });
  });
});
