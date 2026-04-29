import { describe, expect, it } from "vitest";

import { ASPECT_RATIO_PRESETS, parseAspectRatio } from "./aspectRatio";
import { parseClassName } from "./index";

describe("ASPECT_RATIO_PRESETS", () => {
  it("should export aspect ratio presets", () => {
    expect(ASPECT_RATIO_PRESETS).toMatchSnapshot();
  });

  it("should have all preset values", () => {
    expect(ASPECT_RATIO_PRESETS).toHaveProperty("aspect-auto");
    expect(ASPECT_RATIO_PRESETS).toHaveProperty("aspect-square");
    expect(ASPECT_RATIO_PRESETS).toHaveProperty("aspect-video");
  });

  it("should have correct preset values", () => {
    expect(ASPECT_RATIO_PRESETS["aspect-auto"]).toBeUndefined();
    expect(ASPECT_RATIO_PRESETS["aspect-square"]).toBe(1);
    expect(ASPECT_RATIO_PRESETS["aspect-video"]).toBe(16 / 9);
  });
});

describe("parseAspectRatio - preset values", () => {
  it("should parse aspect-square", () => {
    expect(parseAspectRatio("aspect-square")).toEqual({ aspectRatio: 1 });
  });

  it("should parse aspect-video", () => {
    expect(parseAspectRatio("aspect-video")).toEqual({ aspectRatio: 16 / 9 });
  });

  it("should parse aspect-auto", () => {
    // aspect-auto removes the aspect ratio constraint by explicitly setting to undefined
    expect(parseAspectRatio("aspect-auto")).toEqual({ aspectRatio: undefined });
  });
});

describe("parseAspectRatio - arbitrary values", () => {
  it("should parse arbitrary aspect ratio values", () => {
    expect(parseAspectRatio("aspect-[4/3]")).toEqual({ aspectRatio: 4 / 3 });
    expect(parseAspectRatio("aspect-[16/9]")).toEqual({ aspectRatio: 16 / 9 });
    expect(parseAspectRatio("aspect-[21/9]")).toEqual({ aspectRatio: 21 / 9 });
    expect(parseAspectRatio("aspect-[1/1]")).toEqual({ aspectRatio: 1 });
  });

  it("should handle arbitrary ratios with different aspect values", () => {
    expect(parseAspectRatio("aspect-[2/1]")).toEqual({ aspectRatio: 2 });
    expect(parseAspectRatio("aspect-[3/2]")).toEqual({ aspectRatio: 1.5 });
    expect(parseAspectRatio("aspect-[9/16]")).toEqual({ aspectRatio: 9 / 16 });
  });

  it("should handle arbitrary ratios with large numbers", () => {
    expect(parseAspectRatio("aspect-[100/50]")).toEqual({ aspectRatio: 2 });
    expect(parseAspectRatio("aspect-[1920/1080]")).toEqual({ aspectRatio: 1920 / 1080 });
  });

  it("should calculate correct aspect ratio values", () => {
    const result = parseAspectRatio("aspect-[4/3]");
    expect(result?.aspectRatio).toBeCloseTo(1.333, 3);

    const result2 = parseAspectRatio("aspect-[16/9]");
    expect(result2?.aspectRatio).toBeCloseTo(1.778, 3);
  });
});

describe("parseAspectRatio - edge cases", () => {
  it("should return null for division by zero", () => {
    expect(parseAspectRatio("aspect-[4/0]")).toBeNull();
    expect(parseAspectRatio("aspect-[16/0]")).toBeNull();
  });

  it("should return null for invalid arbitrary values", () => {
    expect(parseAspectRatio("aspect-[4]")).toBeNull(); // Missing denominator
    expect(parseAspectRatio("aspect-[/3]")).toBeNull(); // Missing numerator
    expect(parseAspectRatio("aspect-[4/3/2]")).toBeNull(); // Extra slash
    expect(parseAspectRatio("aspect-[abc/def]")).toBeNull(); // Non-numeric
  });

  it("should return null for malformed brackets", () => {
    expect(parseAspectRatio("aspect-[4/3")).toBeNull(); // Missing closing bracket
    expect(parseAspectRatio("aspect-4/3]")).toBeNull(); // Missing opening bracket
    expect(parseAspectRatio("aspect-4/3")).toBeNull(); // No brackets
  });

  it("should return null for invalid class prefixes", () => {
    expect(parseAspectRatio("ratio-[4/3]")).toBeNull();
    expect(parseAspectRatio("ar-[4/3]")).toBeNull();
    expect(parseAspectRatio("aspectRatio-[4/3]")).toBeNull();
  });
});

describe("parseAspectRatio - invalid classes", () => {
  it("should return null for non-aspect classes", () => {
    expect(parseAspectRatio("bg-blue-500")).toBeNull();
    expect(parseAspectRatio("p-4")).toBeNull();
    expect(parseAspectRatio("text-white")).toBeNull();
    expect(parseAspectRatio("w-full")).toBeNull();
  });

  it("should return null for invalid aspect class names", () => {
    expect(parseAspectRatio("aspect")).toBeNull();
    expect(parseAspectRatio("aspect-")).toBeNull();
    expect(parseAspectRatio("aspect-invalid")).toBeNull();
    expect(parseAspectRatio("aspect-16-9")).toBeNull();
  });

  it("should return null for empty or whitespace input", () => {
    expect(parseAspectRatio("")).toBeNull();
    expect(parseAspectRatio("   ")).toBeNull();
  });
});

describe("parseAspectRatio - type validation", () => {
  it("should return objects with correct property types", () => {
    const square = parseAspectRatio("aspect-square");
    expect(typeof square?.aspectRatio).toBe("number");

    const video = parseAspectRatio("aspect-video");
    expect(typeof video?.aspectRatio).toBe("number");

    const arbitrary = parseAspectRatio("aspect-[4/3]");
    expect(typeof arbitrary?.aspectRatio).toBe("number");
  });

  it("should return null or object, never undefined", () => {
    const valid = parseAspectRatio("aspect-square");
    expect(valid).not.toBeUndefined();
    expect(typeof valid).toBe("object");

    const invalid = parseAspectRatio("invalid");
    expect(invalid).toBeNull();
  });
});

describe("parseAspectRatio - override behavior", () => {
  it("should allow aspect-auto to override previously set aspect ratios", () => {
    // This tests the fix for issue #3 - aspect-auto must explicitly set aspectRatio: undefined
    // to override previous aspect ratio values when using Object.assign
    const result = parseClassName("aspect-square aspect-auto");
    expect(result).toEqual({ aspectRatio: undefined });
  });

  it("should allow aspect ratios to override aspect-auto", () => {
    const result = parseClassName("aspect-auto aspect-square");
    expect(result).toEqual({ aspectRatio: 1 });
  });

  it("should apply last aspect ratio in sequence", () => {
    const result = parseClassName("aspect-square aspect-video aspect-auto");
    expect(result).toEqual({ aspectRatio: undefined });

    const result2 = parseClassName("aspect-auto aspect-square aspect-video");
    expect(result2).toEqual({ aspectRatio: 16 / 9 });
  });
});

describe("parseAspectRatio - comprehensive coverage", () => {
  it("should parse all preset variants without errors", () => {
    const presets = ["aspect-auto", "aspect-square", "aspect-video"];

    presets.forEach((preset) => {
      const result = parseAspectRatio(preset);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("object");
    });
  });

  it("should return consistent results for same input", () => {
    const result1 = parseAspectRatio("aspect-square");
    const result2 = parseAspectRatio("aspect-square");
    expect(result1).toEqual(result2);

    const result3 = parseAspectRatio("aspect-[4/3]");
    const result4 = parseAspectRatio("aspect-[4/3]");
    expect(result3).toEqual(result4);
  });

  it("should handle case-sensitive class names", () => {
    // Aspect ratio classes are case-sensitive
    expect(parseAspectRatio("ASPECT-square")).toBeNull();
    expect(parseAspectRatio("Aspect-video")).toBeNull();
    expect(parseAspectRatio("aspect-SQUARE")).toBeNull();
  });

  it("should handle common aspect ratios", () => {
    // Common aspect ratios
    expect(parseAspectRatio("aspect-[1/1]")).toBeTruthy(); // Square
    expect(parseAspectRatio("aspect-[4/3]")).toBeTruthy(); // Standard
    expect(parseAspectRatio("aspect-[16/9]")).toBeTruthy(); // Widescreen
    expect(parseAspectRatio("aspect-[21/9]")).toBeTruthy(); // Ultrawide
    expect(parseAspectRatio("aspect-[9/16]")).toBeTruthy(); // Portrait video
  });

  it("should differentiate between preset and arbitrary values", () => {
    // Preset
    const preset = parseAspectRatio("aspect-video");
    expect(preset).toEqual({ aspectRatio: 16 / 9 });

    // Arbitrary with same ratio
    const arbitrary = parseAspectRatio("aspect-[16/9]");
    expect(arbitrary).toEqual({ aspectRatio: 16 / 9 });

    // Both should produce same result
    expect(preset).toEqual(arbitrary);
  });

  it("should handle fractional results correctly", () => {
    const result = parseAspectRatio("aspect-[5/7]");
    expect(result?.aspectRatio).toBeCloseTo(0.714, 3);

    const result2 = parseAspectRatio("aspect-[3/4]");
    expect(result2?.aspectRatio).toBe(0.75);
  });
});
