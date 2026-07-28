import { describe, expect, it } from "vitest";

import { applyOpacity } from "../utils/colorUtils";
import { BLUR_SCALE, DROP_SHADOW_SCALE, parseFilter } from "./filters";
import { parseClassName } from "./index";

describe("parseFilter - percentage filters", () => {
  it("should parse numeric values as percentages", () => {
    expect(parseFilter("brightness-101")).toEqual({ filter: [{ brightness: 1.01 }] });
    expect(parseFilter("contrast-125")).toEqual({ filter: [{ contrast: 1.25 }] });
    expect(parseFilter("grayscale-50")).toEqual({ filter: [{ grayscale: 0.5 }] });
    expect(parseFilter("invert-25")).toEqual({ filter: [{ invert: 0.25 }] });
    expect(parseFilter("saturate-150")).toEqual({ filter: [{ saturate: 1.5 }] });
    expect(parseFilter("sepia-75")).toEqual({ filter: [{ sepia: 0.75 }] });
  });

  it("should parse bare full-effect utilities", () => {
    expect(parseFilter("grayscale")).toEqual({ filter: [{ grayscale: 1 }] });
    expect(parseFilter("invert")).toEqual({ filter: [{ invert: 1 }] });
    expect(parseFilter("sepia")).toEqual({ filter: [{ sepia: 1 }] });
  });

  it("should parse arbitrary numeric values", () => {
    expect(parseFilter("brightness-[1.01]")).toEqual({ filter: [{ brightness: 1.01 }] });
    expect(parseFilter("contrast-[.5]")).toEqual({ filter: [{ contrast: 0.5 }] });
    expect(parseFilter("saturate-[2]")).toEqual({ filter: [{ saturate: 2 }] });
  });

  it("should parse arbitrary percentage values", () => {
    expect(parseFilter("brightness-[80%]")).toEqual({ filter: [{ brightness: 0.8 }] });
    expect(parseFilter("grayscale-[25%]")).toEqual({ filter: [{ grayscale: 0.25 }] });
    expect(parseFilter("sepia-[101%]")).toEqual({ filter: [{ sepia: 1.01 }] });
  });
});

describe("parseFilter - blur", () => {
  it("should expose the Tailwind blur scale", () => {
    expect(BLUR_SCALE).toEqual({ none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 40, "3xl": 64 });
  });

  it("should parse blur presets", () => {
    expect(parseFilter("blur-none")).toEqual({ filter: [{ blur: 0 }] });
    expect(parseFilter("blur-xs")).toEqual({ filter: [{ blur: 4 }] });
    expect(parseFilter("blur-sm")).toEqual({ filter: [{ blur: 8 }] });
    expect(parseFilter("blur-3xl")).toEqual({ filter: [{ blur: 64 }] });
  });

  it("should parse arbitrary pixel blur values", () => {
    expect(parseFilter("blur-[2px]")).toEqual({ filter: [{ blur: 2 }] });
    expect(parseFilter("blur-[2.5]")).toEqual({ filter: [{ blur: 2.5 }] });
  });
});

describe("parseFilter - hue rotate", () => {
  it("should parse degree utilities", () => {
    expect(parseFilter("hue-rotate-0")).toEqual({ filter: [{ hueRotate: "0deg" }] });
    expect(parseFilter("hue-rotate-45")).toEqual({ filter: [{ hueRotate: "45deg" }] });
    expect(parseFilter("-hue-rotate-90")).toEqual({ filter: [{ hueRotate: "-90deg" }] });
  });

  it("should parse arbitrary deg and rad angles", () => {
    expect(parseFilter("hue-rotate-[22.5deg]")).toEqual({ filter: [{ hueRotate: "22.5deg" }] });
    expect(parseFilter("hue-rotate-[-45deg]")).toEqual({ filter: [{ hueRotate: "-45deg" }] });
    expect(parseFilter("hue-rotate-[0.5rad]")).toEqual({ filter: [{ hueRotate: "0.5rad" }] });
  });
});

describe("parseFilter - drop shadow", () => {
  it("should expose and parse Tailwind drop-shadow presets", () => {
    expect(Object.keys(DROP_SHADOW_SCALE)).toEqual(["xs", "sm", "md", "lg", "xl", "2xl", "none"]);
    expect(parseFilter("drop-shadow-md")).toEqual({ filter: [{ dropShadow: DROP_SHADOW_SCALE.md }] });
    expect(parseFilter("drop-shadow-none")).toEqual({ filter: [{ dropShadow: DROP_SHADOW_SCALE.none }] });
  });

  it("should apply opacity modifiers to preset drop shadows", () => {
    expect(parseFilter("drop-shadow-xl/50")).toEqual({
      filter: [{ dropShadow: { ...DROP_SHADOW_SCALE.xl, color: applyOpacity("#000000", 50) } }],
    });
  });

  it("should parse arbitrary drop shadows", () => {
    expect(parseFilter("drop-shadow-[0_4px_4px_#00000080]")).toEqual({
      filter: [{ dropShadow: { offsetX: 0, offsetY: 4, standardDeviation: 4, color: "#00000080" } }],
    });
    expect(parseFilter("drop-shadow-[-2px_3px_#ff0000]")).toEqual({
      filter: [{ dropShadow: { offsetX: -2, offsetY: 3, color: "#ff0000" } }],
    });
  });

  it("should resolve custom colors in arbitrary drop shadows", () => {
    expect(parseFilter("drop-shadow-[0_2px_3px_brand]", { brand: "#123456" })).toEqual({
      filter: [{ dropShadow: { offsetX: 0, offsetY: 2, standardDeviation: 3, color: "#123456" } }],
    });
  });
});

describe("parseFilter - composition and validation", () => {
  it("should compose different filter functions", () => {
    expect(parseClassName("blur-sm brightness-110 contrast-125 saturate-150")).toEqual({
      filter: [{ blur: 8 }, { brightness: 1.1 }, { contrast: 1.25 }, { saturate: 1.5 }],
    });
  });

  it("should use the last utility for duplicate filter functions", () => {
    expect(parseClassName("brightness-110 blur-sm brightness-90")).toEqual({
      filter: [{ brightness: 0.9 }, { blur: 8 }],
    });
  });

  it("should clear preceding filters with filter-none", () => {
    expect(parseClassName("brightness-110 blur-sm filter-none")).toEqual({ filter: [] });
  });

  it("should compose native opacity with filters without a class collision", () => {
    expect(parseClassName("brightness-[1.01] opacity-80")).toEqual({
      filter: [{ brightness: 1.01 }],
      opacity: 0.8,
    });
  });

  it("should reject unsupported or malformed values", () => {
    expect(parseFilter("brightness-[-1]")).toBeNull();
    expect(parseFilter("contrast-[1.01px]")).toBeNull();
    expect(parseFilter("blur-[-1px]")).toBeNull();
    expect(parseFilter("blur-[50%]")).toBeNull();
    expect(parseFilter("hue-rotate-[45turn]")).toBeNull();
    expect(parseFilter("drop-shadow-[0_4px_-2px_#000000]")).toBeNull();
    expect(parseFilter("drop-shadow-[invalid]")).toBeNull();
    expect(parseFilter("brightness-auto")).toBeNull();
  });

  it("should return null for unrelated classes", () => {
    expect(parseFilter("opacity-50")).toBeNull();
    expect(parseFilter("bg-white")).toBeNull();
    expect(parseFilter("")).toBeNull();
  });
});
