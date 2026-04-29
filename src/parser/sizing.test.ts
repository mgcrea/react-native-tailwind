import { describe, expect, it } from "vitest";

import { SIZE_PERCENTAGES, SIZE_SCALE, parseSizing } from "./sizing";

describe("SIZE_SCALE", () => {
  it("should export complete size scale", () => {
    expect(SIZE_SCALE).toMatchSnapshot();
  });
});

describe("SIZE_PERCENTAGES", () => {
  it("should export complete percentage sizes", () => {
    expect(SIZE_PERCENTAGES).toMatchSnapshot();
  });
});

describe("parseSizing - width", () => {
  it("should parse width with numeric values", () => {
    expect(parseSizing("w-0")).toEqual({ width: 0 });
    expect(parseSizing("w-4")).toEqual({ width: 16 });
    expect(parseSizing("w-8")).toEqual({ width: 32 });
    expect(parseSizing("w-96")).toEqual({ width: 384 });
  });

  it("should parse width with fractional values", () => {
    expect(parseSizing("w-0.5")).toEqual({ width: 2 });
    expect(parseSizing("w-1.5")).toEqual({ width: 6 });
    expect(parseSizing("w-2.5")).toEqual({ width: 10 });
  });

  it("should parse width with percentage values", () => {
    expect(parseSizing("w-full")).toEqual({ width: "100%" });
    expect(parseSizing("w-1/2")).toEqual({ width: "50%" });
    expect(parseSizing("w-1/3")).toEqual({ width: "33.333333%" });
    expect(parseSizing("w-2/3")).toEqual({ width: "66.666667%" });
    expect(parseSizing("w-1/4")).toEqual({ width: "25%" });
    expect(parseSizing("w-3/4")).toEqual({ width: "75%" });
  });

  it("should parse width with special values", () => {
    expect(parseSizing("w-auto")).toEqual({ width: "auto" });
  });

  it("should parse width with arbitrary pixel values", () => {
    expect(parseSizing("w-[123px]")).toEqual({ width: 123 });
    expect(parseSizing("w-[123]")).toEqual({ width: 123 });
    expect(parseSizing("w-[350px]")).toEqual({ width: 350 });
  });

  it("should parse width with arbitrary percentage values", () => {
    expect(parseSizing("w-[50%]")).toEqual({ width: "50%" });
    expect(parseSizing("w-[33.333%]")).toEqual({ width: "33.333%" });
    expect(parseSizing("w-[85%]")).toEqual({ width: "85%" });
  });
});

describe("parseSizing - height", () => {
  it("should parse height with numeric values", () => {
    expect(parseSizing("h-0")).toEqual({ height: 0 });
    expect(parseSizing("h-4")).toEqual({ height: 16 });
    expect(parseSizing("h-8")).toEqual({ height: 32 });
    expect(parseSizing("h-96")).toEqual({ height: 384 });
  });

  it("should parse height with fractional values", () => {
    expect(parseSizing("h-0.5")).toEqual({ height: 2 });
    expect(parseSizing("h-1.5")).toEqual({ height: 6 });
    expect(parseSizing("h-2.5")).toEqual({ height: 10 });
  });

  it("should parse height with percentage values", () => {
    expect(parseSizing("h-full")).toEqual({ height: "100%" });
    expect(parseSizing("h-1/2")).toEqual({ height: "50%" });
    expect(parseSizing("h-1/3")).toEqual({ height: "33.333333%" });
    expect(parseSizing("h-2/3")).toEqual({ height: "66.666667%" });
  });

  it("should parse height with special values", () => {
    expect(parseSizing("h-auto")).toEqual({ height: "auto" });
  });

  it("should parse height with arbitrary values", () => {
    expect(parseSizing("h-[200px]")).toEqual({ height: 200 });
    expect(parseSizing("h-[75%]")).toEqual({ height: "75%" });
  });
});

describe("parseSizing - min width", () => {
  it("should parse min-width with numeric values", () => {
    expect(parseSizing("min-w-0")).toEqual({ minWidth: 0 });
    expect(parseSizing("min-w-4")).toEqual({ minWidth: 16 });
    expect(parseSizing("min-w-8")).toEqual({ minWidth: 32 });
  });

  it("should parse min-width with percentage values", () => {
    expect(parseSizing("min-w-full")).toEqual({ minWidth: "100%" });
    expect(parseSizing("min-w-1/2")).toEqual({ minWidth: "50%" });
  });

  it("should parse min-width with arbitrary values", () => {
    expect(parseSizing("min-w-[200px]")).toEqual({ minWidth: 200 });
    expect(parseSizing("min-w-[50%]")).toEqual({ minWidth: "50%" });
  });
});

describe("parseSizing - min height", () => {
  it("should parse min-height with numeric values", () => {
    expect(parseSizing("min-h-0")).toEqual({ minHeight: 0 });
    expect(parseSizing("min-h-4")).toEqual({ minHeight: 16 });
    expect(parseSizing("min-h-8")).toEqual({ minHeight: 32 });
  });

  it("should parse min-height with percentage values", () => {
    expect(parseSizing("min-h-full")).toEqual({ minHeight: "100%" });
    expect(parseSizing("min-h-1/2")).toEqual({ minHeight: "50%" });
  });

  it("should parse min-height with arbitrary values", () => {
    expect(parseSizing("min-h-[150px]")).toEqual({ minHeight: 150 });
    expect(parseSizing("min-h-[40%]")).toEqual({ minHeight: "40%" });
  });
});

describe("parseSizing - max width", () => {
  it("should parse max-width with numeric values", () => {
    expect(parseSizing("max-w-0")).toEqual({ maxWidth: 0 });
    expect(parseSizing("max-w-4")).toEqual({ maxWidth: 16 });
    expect(parseSizing("max-w-8")).toEqual({ maxWidth: 32 });
  });

  it("should parse max-width with percentage values", () => {
    expect(parseSizing("max-w-full")).toEqual({ maxWidth: "100%" });
    expect(parseSizing("max-w-1/2")).toEqual({ maxWidth: "50%" });
  });

  it("should parse max-width with arbitrary values", () => {
    expect(parseSizing("max-w-[500px]")).toEqual({ maxWidth: 500 });
    expect(parseSizing("max-w-[80%]")).toEqual({ maxWidth: "80%" });
  });
});

describe("parseSizing - max height", () => {
  it("should parse max-height with numeric values", () => {
    expect(parseSizing("max-h-0")).toEqual({ maxHeight: 0 });
    expect(parseSizing("max-h-4")).toEqual({ maxHeight: 16 });
    expect(parseSizing("max-h-8")).toEqual({ maxHeight: 32 });
  });

  it("should parse max-height with percentage values", () => {
    expect(parseSizing("max-h-full")).toEqual({ maxHeight: "100%" });
    expect(parseSizing("max-h-1/2")).toEqual({ maxHeight: "50%" });
  });

  it("should parse max-height with arbitrary values", () => {
    expect(parseSizing("max-h-[300px]")).toEqual({ maxHeight: 300 });
    expect(parseSizing("max-h-[90%]")).toEqual({ maxHeight: "90%" });
  });
});

describe("parseSizing - edge cases", () => {
  it("should return null for invalid classes", () => {
    expect(parseSizing("invalid")).toBeNull();
    expect(parseSizing("w")).toBeNull();
    expect(parseSizing("h")).toBeNull();
    expect(parseSizing("width-4")).toBeNull();
    expect(parseSizing("height-4")).toBeNull();
  });

  it("should return null for invalid size values", () => {
    expect(parseSizing("w-invalid")).toBeNull();
    expect(parseSizing("h-999")).toBeNull();
    expect(parseSizing("min-w-abc")).toBeNull();
  });

  it("should return null for arbitrary values with unsupported units", () => {
    expect(parseSizing("w-[16rem]")).toBeNull();
    expect(parseSizing("h-[2em]")).toBeNull();
    expect(parseSizing("max-w-[50vh]")).toBeNull();
    expect(parseSizing("min-h-[100vw]")).toBeNull();
  });

  it("should return null for malformed arbitrary values", () => {
    expect(parseSizing("w-[16")).toBeNull();
    expect(parseSizing("h-16]")).toBeNull();
    expect(parseSizing("min-w-[]")).toBeNull();
  });

  it("should handle edge case size values", () => {
    expect(parseSizing("w-0")).toEqual({ width: 0 });
    expect(parseSizing("h-0")).toEqual({ height: 0 });
    expect(parseSizing("min-w-0")).toEqual({ minWidth: 0 });
    expect(parseSizing("max-h-0")).toEqual({ maxHeight: 0 });
  });

  it("should not match partial class names", () => {
    expect(parseSizing("tw-4")).toBeNull();
    expect(parseSizing("width-4")).toBeNull();
    expect(parseSizing("height-4")).toBeNull();
  });
});

describe("parseSizing - comprehensive coverage", () => {
  it("should parse all width variants with same value", () => {
    const value = 16;
    expect(parseSizing("w-4")).toEqual({ width: value });
    expect(parseSizing("min-w-4")).toEqual({ minWidth: value });
    expect(parseSizing("max-w-4")).toEqual({ maxWidth: value });
  });

  it("should parse all height variants with same value", () => {
    const value = 16;
    expect(parseSizing("h-4")).toEqual({ height: value });
    expect(parseSizing("min-h-4")).toEqual({ minHeight: value });
    expect(parseSizing("max-h-4")).toEqual({ maxHeight: value });
  });

  it("should handle large size values", () => {
    expect(parseSizing("w-96")).toEqual({ width: 384 });
    expect(parseSizing("h-96")).toEqual({ height: 384 });
    expect(parseSizing("max-w-96")).toEqual({ maxWidth: 384 });
  });

  it("should handle arbitrary values across all width variants", () => {
    expect(parseSizing("w-[123px]")).toEqual({ width: 123 });
    expect(parseSizing("min-w-[123px]")).toEqual({ minWidth: 123 });
    expect(parseSizing("max-w-[123px]")).toEqual({ maxWidth: 123 });
  });

  it("should handle arbitrary values across all height variants", () => {
    expect(parseSizing("h-[200px]")).toEqual({ height: 200 });
    expect(parseSizing("min-h-[200px]")).toEqual({ minHeight: 200 });
    expect(parseSizing("max-h-[200px]")).toEqual({ maxHeight: 200 });
  });

  it("should handle arbitrary percentage values across all variants", () => {
    expect(parseSizing("w-[75%]")).toEqual({ width: "75%" });
    expect(parseSizing("h-[60%]")).toEqual({ height: "60%" });
    expect(parseSizing("min-w-[25%]")).toEqual({ minWidth: "25%" });
    expect(parseSizing("max-h-[90%]")).toEqual({ maxHeight: "90%" });
  });

  it("should handle all fractional percentage variants", () => {
    expect(parseSizing("w-1/5")).toEqual({ width: "20%" });
    expect(parseSizing("w-2/5")).toEqual({ width: "40%" });
    expect(parseSizing("w-3/5")).toEqual({ width: "60%" });
    expect(parseSizing("w-4/5")).toEqual({ width: "80%" });
    expect(parseSizing("w-1/6")).toEqual({ width: "16.666667%" });
    expect(parseSizing("w-5/6")).toEqual({ width: "83.333333%" });
  });

  it("should handle special values consistently", () => {
    expect(parseSizing("w-auto")).toEqual({ width: "auto" });
    expect(parseSizing("h-auto")).toEqual({ height: "auto" });
    expect(parseSizing("w-full")).toEqual({ width: "100%" });
    expect(parseSizing("h-full")).toEqual({ height: "100%" });
  });

  it("should parse px (1 pixel) across all sizing utilities", () => {
    expect(parseSizing("w-px")).toEqual({ width: 1 });
    expect(parseSizing("h-px")).toEqual({ height: 1 });
    expect(parseSizing("size-px")).toEqual({ width: 1, height: 1 });
    expect(parseSizing("min-w-px")).toEqual({ minWidth: 1 });
    expect(parseSizing("min-h-px")).toEqual({ minHeight: 1 });
    expect(parseSizing("max-w-px")).toEqual({ maxWidth: 1 });
    expect(parseSizing("max-h-px")).toEqual({ maxHeight: 1 });
  });
});

describe("parseSizing - custom spacing", () => {
  const customSpacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 32,
    xl: 64,
    "4": 20, // Override default (16)
  };

  it("should support custom spacing values for width", () => {
    expect(parseSizing("w-xs", customSpacing)).toEqual({ width: 4 });
    expect(parseSizing("w-sm", customSpacing)).toEqual({ width: 8 });
    expect(parseSizing("w-lg", customSpacing)).toEqual({ width: 32 });
    expect(parseSizing("w-xl", customSpacing)).toEqual({ width: 64 });
  });

  it("should support custom spacing values for height", () => {
    expect(parseSizing("h-xs", customSpacing)).toEqual({ height: 4 });
    expect(parseSizing("h-md", customSpacing)).toEqual({ height: 16 });
    expect(parseSizing("h-xl", customSpacing)).toEqual({ height: 64 });
  });

  it("should support custom spacing values for min/max dimensions", () => {
    expect(parseSizing("min-w-sm", customSpacing)).toEqual({ minWidth: 8 });
    expect(parseSizing("min-h-lg", customSpacing)).toEqual({ minHeight: 32 });
    expect(parseSizing("max-w-xl", customSpacing)).toEqual({ maxWidth: 64 });
    expect(parseSizing("max-h-md", customSpacing)).toEqual({ maxHeight: 16 });
  });

  it("should allow custom spacing to override preset values", () => {
    expect(parseSizing("w-4", customSpacing)).toEqual({ width: 20 }); // Custom 20, not default 16
    expect(parseSizing("h-4", customSpacing)).toEqual({ height: 20 }); // Custom 20, not default 16
  });

  it("should prefer arbitrary values over custom spacing", () => {
    expect(parseSizing("w-[24px]", customSpacing)).toEqual({ width: 24 }); // Arbitrary wins
    expect(parseSizing("h-[50]", customSpacing)).toEqual({ height: 50 }); // Arbitrary wins
  });

  it("should fall back to preset scale for unknown custom keys", () => {
    expect(parseSizing("w-8", customSpacing)).toEqual({ width: 32 }); // Not overridden, uses preset
    expect(parseSizing("h-12", customSpacing)).toEqual({ height: 48 }); // Not overridden, uses preset
  });

  it("should preserve percentage values with custom spacing", () => {
    expect(parseSizing("w-full", customSpacing)).toEqual({ width: "100%" });
    expect(parseSizing("h-1/2", customSpacing)).toEqual({ height: "50%" });
  });

  it("should work without custom spacing (backward compatible)", () => {
    expect(parseSizing("w-4")).toEqual({ width: 16 }); // Default behavior
    expect(parseSizing("h-8")).toEqual({ height: 32 }); // Default behavior
  });
});

describe("parseSizing - size (width + height)", () => {
  it("should parse size with numeric values", () => {
    expect(parseSizing("size-0")).toEqual({ width: 0, height: 0 });
    expect(parseSizing("size-4")).toEqual({ width: 16, height: 16 });
    expect(parseSizing("size-8")).toEqual({ width: 32, height: 32 });
    expect(parseSizing("size-96")).toEqual({ width: 384, height: 384 });
  });

  it("should parse size with fractional values", () => {
    expect(parseSizing("size-0.5")).toEqual({ width: 2, height: 2 });
    expect(parseSizing("size-1.5")).toEqual({ width: 6, height: 6 });
    expect(parseSizing("size-2.5")).toEqual({ width: 10, height: 10 });
  });

  it("should parse size with percentage values", () => {
    expect(parseSizing("size-full")).toEqual({ width: "100%", height: "100%" });
    expect(parseSizing("size-1/2")).toEqual({ width: "50%", height: "50%" });
    expect(parseSizing("size-1/3")).toEqual({ width: "33.333333%", height: "33.333333%" });
    expect(parseSizing("size-2/3")).toEqual({ width: "66.666667%", height: "66.666667%" });
    expect(parseSizing("size-1/4")).toEqual({ width: "25%", height: "25%" });
    expect(parseSizing("size-3/4")).toEqual({ width: "75%", height: "75%" });
  });

  it("should parse size with special values", () => {
    expect(parseSizing("size-auto")).toEqual({ width: "auto", height: "auto" });
  });

  it("should parse size with arbitrary pixel values", () => {
    expect(parseSizing("size-[123px]")).toEqual({ width: 123, height: 123 });
    expect(parseSizing("size-[200]")).toEqual({ width: 200, height: 200 });
    expect(parseSizing("size-[50px]")).toEqual({ width: 50, height: 50 });
  });

  it("should parse size with arbitrary percentage values", () => {
    expect(parseSizing("size-[50%]")).toEqual({ width: "50%", height: "50%" });
    expect(parseSizing("size-[33.333%]")).toEqual({ width: "33.333%", height: "33.333%" });
    expect(parseSizing("size-[85%]")).toEqual({ width: "85%", height: "85%" });
  });

  it("should support custom spacing values for size", () => {
    const customSpacing = { sm: 8, md: 16, lg: 32, xl: 64 };
    expect(parseSizing("size-sm", customSpacing)).toEqual({ width: 8, height: 8 });
    expect(parseSizing("size-md", customSpacing)).toEqual({ width: 16, height: 16 });
    expect(parseSizing("size-lg", customSpacing)).toEqual({ width: 32, height: 32 });
    expect(parseSizing("size-xl", customSpacing)).toEqual({ width: 64, height: 64 });
  });

  it("should allow custom spacing to override preset values", () => {
    const customSpacing = { "4": 20 }; // Override default (16)
    expect(parseSizing("size-4", customSpacing)).toEqual({ width: 20, height: 20 });
  });

  it("should prefer arbitrary values over custom spacing", () => {
    expect(parseSizing("size-[24px]", { "4": 20 })).toEqual({ width: 24, height: 24 });
    expect(parseSizing("size-[50]", { sm: 8 })).toEqual({ width: 50, height: 50 });
  });

  it("should handle all fractional percentage variants", () => {
    expect(parseSizing("size-1/5")).toEqual({ width: "20%", height: "20%" });
    expect(parseSizing("size-2/5")).toEqual({ width: "40%", height: "40%" });
    expect(parseSizing("size-3/5")).toEqual({ width: "60%", height: "60%" });
    expect(parseSizing("size-4/5")).toEqual({ width: "80%", height: "80%" });
    expect(parseSizing("size-1/6")).toEqual({ width: "16.666667%", height: "16.666667%" });
    expect(parseSizing("size-5/6")).toEqual({ width: "83.333333%", height: "83.333333%" });
  });

  it("should handle edge case size values", () => {
    expect(parseSizing("size-0")).toEqual({ width: 0, height: 0 });
  });

  it("should return null for invalid size values", () => {
    expect(parseSizing("size-invalid")).toBeNull();
    expect(parseSizing("size-999")).toBeNull();
  });

  it("should return null for arbitrary values with unsupported units", () => {
    expect(parseSizing("size-[16rem]")).toBeNull();
    expect(parseSizing("size-[2em]")).toBeNull();
    expect(parseSizing("size-[50vh]")).toBeNull();
  });
});
