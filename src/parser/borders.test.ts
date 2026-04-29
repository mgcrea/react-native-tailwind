import { describe, expect, it } from "vitest";

import { BORDER_RADIUS_SCALE, BORDER_WIDTH_SCALE, parseBorder } from "./borders";

describe("BORDER_WIDTH_SCALE", () => {
  it("should export complete border width scale", () => {
    expect(BORDER_WIDTH_SCALE).toMatchSnapshot();
  });
});

describe("BORDER_RADIUS_SCALE", () => {
  it("should export complete border radius scale", () => {
    expect(BORDER_RADIUS_SCALE).toMatchSnapshot();
  });
});

describe("parseBorder - border width all sides", () => {
  it("should parse border shorthand", () => {
    expect(parseBorder("border")).toEqual({ borderWidth: 1 });
  });

  it("should parse border with preset values", () => {
    expect(parseBorder("border-0")).toEqual({ borderWidth: 0 });
    expect(parseBorder("border-2")).toEqual({ borderWidth: 2 });
    expect(parseBorder("border-4")).toEqual({ borderWidth: 4 });
    expect(parseBorder("border-8")).toEqual({ borderWidth: 8 });
  });

  it("should parse border with arbitrary pixel values", () => {
    expect(parseBorder("border-[1px]")).toEqual({ borderWidth: 1 });
    expect(parseBorder("border-[1]")).toEqual({ borderWidth: 1 });
    expect(parseBorder("border-[3px]")).toEqual({ borderWidth: 3 });
    expect(parseBorder("border-[10px]")).toEqual({ borderWidth: 10 });
  });
});

describe("parseBorder - border width directional", () => {
  it("should parse border top", () => {
    expect(parseBorder("border-t")).toEqual({ borderTopWidth: 1 });
    expect(parseBorder("border-t-0")).toEqual({ borderTopWidth: 0 });
    expect(parseBorder("border-t-2")).toEqual({ borderTopWidth: 2 });
    expect(parseBorder("border-t-4")).toEqual({ borderTopWidth: 4 });
    expect(parseBorder("border-t-8")).toEqual({ borderTopWidth: 8 });
  });

  it("should parse border right", () => {
    expect(parseBorder("border-r")).toEqual({ borderRightWidth: 1 });
    expect(parseBorder("border-r-0")).toEqual({ borderRightWidth: 0 });
    expect(parseBorder("border-r-2")).toEqual({ borderRightWidth: 2 });
    expect(parseBorder("border-r-4")).toEqual({ borderRightWidth: 4 });
  });

  it("should parse border bottom", () => {
    expect(parseBorder("border-b")).toEqual({ borderBottomWidth: 1 });
    expect(parseBorder("border-b-0")).toEqual({ borderBottomWidth: 0 });
    expect(parseBorder("border-b-2")).toEqual({ borderBottomWidth: 2 });
    expect(parseBorder("border-b-4")).toEqual({ borderBottomWidth: 4 });
  });

  it("should parse border left", () => {
    expect(parseBorder("border-l")).toEqual({ borderLeftWidth: 1 });
    expect(parseBorder("border-l-0")).toEqual({ borderLeftWidth: 0 });
    expect(parseBorder("border-l-2")).toEqual({ borderLeftWidth: 2 });
    expect(parseBorder("border-l-4")).toEqual({ borderLeftWidth: 4 });
  });

  it("should parse directional borders with arbitrary values", () => {
    expect(parseBorder("border-t-[3px]")).toEqual({ borderTopWidth: 3 });
    expect(parseBorder("border-r-[5px]")).toEqual({ borderRightWidth: 5 });
    expect(parseBorder("border-b-[7px]")).toEqual({ borderBottomWidth: 7 });
    expect(parseBorder("border-l-[9px]")).toEqual({ borderLeftWidth: 9 });
  });
});

describe("parseBorder - border style", () => {
  it("should parse border styles", () => {
    expect(parseBorder("border-solid")).toEqual({ borderStyle: "solid" });
    expect(parseBorder("border-dotted")).toEqual({ borderStyle: "dotted" });
    expect(parseBorder("border-dashed")).toEqual({ borderStyle: "dashed" });
  });
});

describe("parseBorder - border radius all corners", () => {
  it("should parse rounded shorthand", () => {
    expect(parseBorder("rounded")).toEqual({ borderRadius: 4 });
  });

  it("should parse rounded with preset values", () => {
    expect(parseBorder("rounded-none")).toEqual({ borderRadius: 0 });
    expect(parseBorder("rounded-sm")).toEqual({ borderRadius: 2 });
    expect(parseBorder("rounded-md")).toEqual({ borderRadius: 6 });
    expect(parseBorder("rounded-lg")).toEqual({ borderRadius: 8 });
    expect(parseBorder("rounded-xl")).toEqual({ borderRadius: 12 });
    expect(parseBorder("rounded-2xl")).toEqual({ borderRadius: 16 });
    expect(parseBorder("rounded-3xl")).toEqual({ borderRadius: 24 });
    expect(parseBorder("rounded-full")).toEqual({ borderRadius: 9999 });
  });

  it("should parse rounded with arbitrary pixel values", () => {
    expect(parseBorder("rounded-[5px]")).toEqual({ borderRadius: 5 });
    expect(parseBorder("rounded-[10px]")).toEqual({ borderRadius: 10 });
    expect(parseBorder("rounded-[15]")).toEqual({ borderRadius: 15 });
  });
});

describe("parseBorder - border radius sides", () => {
  it("should parse rounded top", () => {
    expect(parseBorder("rounded-t")).toEqual({
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    });
    expect(parseBorder("rounded-t-lg")).toEqual({
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    });
    expect(parseBorder("rounded-t-[12px]")).toEqual({
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
    });
  });

  it("should parse rounded right", () => {
    expect(parseBorder("rounded-r")).toEqual({
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
    });
    expect(parseBorder("rounded-r-lg")).toEqual({
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    });
    expect(parseBorder("rounded-r-[12px]")).toEqual({
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
    });
  });

  it("should parse rounded bottom", () => {
    expect(parseBorder("rounded-b")).toEqual({
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
    });
    expect(parseBorder("rounded-b-lg")).toEqual({
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    });
    expect(parseBorder("rounded-b-[12px]")).toEqual({
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    });
  });

  it("should parse rounded left", () => {
    expect(parseBorder("rounded-l")).toEqual({
      borderTopLeftRadius: 4,
      borderBottomLeftRadius: 4,
    });
    expect(parseBorder("rounded-l-lg")).toEqual({
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    });
    expect(parseBorder("rounded-l-[12px]")).toEqual({
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    });
  });
});

describe("parseBorder - border radius specific corners", () => {
  it("should parse rounded top-left", () => {
    expect(parseBorder("rounded-tl")).toEqual({ borderTopLeftRadius: 4 });
    expect(parseBorder("rounded-tl-lg")).toEqual({ borderTopLeftRadius: 8 });
    expect(parseBorder("rounded-tl-[12px]")).toEqual({
      borderTopLeftRadius: 12,
    });
  });

  it("should parse rounded top-right", () => {
    expect(parseBorder("rounded-tr")).toEqual({ borderTopRightRadius: 4 });
    expect(parseBorder("rounded-tr-lg")).toEqual({ borderTopRightRadius: 8 });
    expect(parseBorder("rounded-tr-[12px]")).toEqual({
      borderTopRightRadius: 12,
    });
  });

  it("should parse rounded bottom-left", () => {
    expect(parseBorder("rounded-bl")).toEqual({ borderBottomLeftRadius: 4 });
    expect(parseBorder("rounded-bl-lg")).toEqual({ borderBottomLeftRadius: 8 });
    expect(parseBorder("rounded-bl-[12px]")).toEqual({
      borderBottomLeftRadius: 12,
    });
  });

  it("should parse rounded bottom-right", () => {
    expect(parseBorder("rounded-br")).toEqual({ borderBottomRightRadius: 4 });
    expect(parseBorder("rounded-br-lg")).toEqual({
      borderBottomRightRadius: 8,
    });
    expect(parseBorder("rounded-br-[12px]")).toEqual({
      borderBottomRightRadius: 12,
    });
  });
});

describe("parseBorder - edge cases", () => {
  it("should return null for invalid classes", () => {
    expect(parseBorder("invalid")).toBeNull();
    expect(parseBorder("border-")).toBeNull();
    expect(parseBorder("rounded-")).toBeNull();
    expect(parseBorder("borders-4")).toBeNull();
  });

  it("should return null for invalid border width values", () => {
    expect(parseBorder("border-invalid")).toBeNull();
    expect(parseBorder("border-3")).toBeNull(); // Not in scale
    expect(parseBorder("border-16")).toBeNull(); // Not in scale
    expect(parseBorder("border-t-3")).toBeNull(); // Not in scale
  });

  it("should return null for invalid border radius values", () => {
    expect(parseBorder("rounded-invalid")).toBeNull();
    expect(parseBorder("rounded-4xl")).toBeNull(); // Not in scale
    expect(parseBorder("rounded-t-invalid")).toBeNull();
  });

  it("should return null for arbitrary values with unsupported units", () => {
    expect(parseBorder("border-[2rem]")).toBeNull();
    expect(parseBorder("border-[1em]")).toBeNull();
    expect(parseBorder("rounded-[2rem]")).toBeNull();
    expect(parseBorder("rounded-[1em]")).toBeNull();
  });

  it("should return null for malformed arbitrary values", () => {
    expect(parseBorder("border-[8")).toBeNull();
    expect(parseBorder("border-8]")).toBeNull();
    expect(parseBorder("border-[]")).toBeNull();
    expect(parseBorder("rounded-[12")).toBeNull();
    expect(parseBorder("rounded-12]")).toBeNull();
  });

  it("should handle edge case values", () => {
    expect(parseBorder("border-0")).toEqual({ borderWidth: 0 });
    expect(parseBorder("border-t-0")).toEqual({ borderTopWidth: 0 });
    expect(parseBorder("rounded-none")).toEqual({ borderRadius: 0 });
    expect(parseBorder("rounded-full")).toEqual({ borderRadius: 9999 });
  });

  it("should not match partial class names", () => {
    expect(parseBorder("myborder-4")).toBeNull();
    expect(parseBorder("border-solid-extra")).toBeNull();
    expect(parseBorder("myrounded-lg")).toBeNull();
  });
});

describe("parseBorder - comprehensive coverage", () => {
  it("should handle all border width directions with same value", () => {
    expect(parseBorder("border-2")).toEqual({ borderWidth: 2 });
    expect(parseBorder("border-t-2")).toEqual({ borderTopWidth: 2 });
    expect(parseBorder("border-r-2")).toEqual({ borderRightWidth: 2 });
    expect(parseBorder("border-b-2")).toEqual({ borderBottomWidth: 2 });
    expect(parseBorder("border-l-2")).toEqual({ borderLeftWidth: 2 });
  });

  it("should handle all border radius types with same value", () => {
    // All corners
    expect(parseBorder("rounded-lg")).toEqual({ borderRadius: 8 });

    // Sides
    expect(parseBorder("rounded-t-lg")).toEqual({
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
    });
    expect(parseBorder("rounded-r-lg")).toEqual({
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    });
    expect(parseBorder("rounded-b-lg")).toEqual({
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
    });
    expect(parseBorder("rounded-l-lg")).toEqual({
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
    });

    // Specific corners
    expect(parseBorder("rounded-tl-lg")).toEqual({ borderTopLeftRadius: 8 });
    expect(parseBorder("rounded-tr-lg")).toEqual({ borderTopRightRadius: 8 });
    expect(parseBorder("rounded-bl-lg")).toEqual({ borderBottomLeftRadius: 8 });
    expect(parseBorder("rounded-br-lg")).toEqual({
      borderBottomRightRadius: 8,
    });
  });

  it("should handle arbitrary values across all border width types", () => {
    expect(parseBorder("border-[5px]")).toEqual({ borderWidth: 5 });
    expect(parseBorder("border-t-[5px]")).toEqual({ borderTopWidth: 5 });
    expect(parseBorder("border-r-[5px]")).toEqual({ borderRightWidth: 5 });
    expect(parseBorder("border-b-[5px]")).toEqual({ borderBottomWidth: 5 });
    expect(parseBorder("border-l-[5px]")).toEqual({ borderLeftWidth: 5 });
  });

  it("should handle arbitrary values across all border radius types", () => {
    expect(parseBorder("rounded-[10px]")).toEqual({ borderRadius: 10 });

    expect(parseBorder("rounded-t-[10px]")).toEqual({
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    });

    expect(parseBorder("rounded-tl-[10px]")).toEqual({
      borderTopLeftRadius: 10,
    });
  });

  it("should handle all border styles", () => {
    expect(parseBorder("border-solid")).toEqual({ borderStyle: "solid" });
    expect(parseBorder("border-dotted")).toEqual({ borderStyle: "dotted" });
    expect(parseBorder("border-dashed")).toEqual({ borderStyle: "dashed" });
  });

  it("should handle shorthand classes correctly", () => {
    expect(parseBorder("border")).toEqual({ borderWidth: 1 });
    expect(parseBorder("rounded")).toEqual({ borderRadius: 4 });
    expect(parseBorder("border-t")).toEqual({ borderTopWidth: 1 });
    expect(parseBorder("rounded-t")).toEqual({
      borderTopLeftRadius: 4,
      borderTopRightRadius: 4,
    });
  });
});

describe("parseBorder - color pattern detection", () => {
  it("should return null for directional border colors with preset values", () => {
    // These should be handled by parseColor
    expect(parseBorder("border-t-red-500")).toBeNull();
    expect(parseBorder("border-r-blue-500")).toBeNull();
    expect(parseBorder("border-b-green-500")).toBeNull();
    expect(parseBorder("border-l-yellow-500")).toBeNull();
  });

  it("should return null for directional border colors with basic values", () => {
    // These should be handled by parseColor
    expect(parseBorder("border-t-white")).toBeNull();
    expect(parseBorder("border-r-black")).toBeNull();
    expect(parseBorder("border-b-transparent")).toBeNull();
    expect(parseBorder("border-l-white")).toBeNull();
  });

  it("should return null for directional border colors with arbitrary hex values", () => {
    // These should be handled by parseColor
    expect(parseBorder("border-t-[#ff0000]")).toBeNull();
    expect(parseBorder("border-r-[#3B82F6]")).toBeNull();
    expect(parseBorder("border-b-[#abc]")).toBeNull();
    expect(parseBorder("border-l-[#00FF00AA]")).toBeNull();
  });

  it("should return null for directional border colors with opacity", () => {
    // These should be handled by parseColor
    expect(parseBorder("border-t-red-500/50")).toBeNull();
    expect(parseBorder("border-r-blue-500/80")).toBeNull();
    expect(parseBorder("border-b-[#ff0000]/60")).toBeNull();
    expect(parseBorder("border-l-black/25")).toBeNull();
  });

  it("should return null for directional border colors with custom colors", () => {
    // These should be handled by parseColor (assuming brand-primary is a custom color)
    expect(parseBorder("border-t-brand-primary")).toBeNull();
    expect(parseBorder("border-r-accent")).toBeNull();
    expect(parseBorder("border-b-brand-secondary")).toBeNull();
    expect(parseBorder("border-l-custom")).toBeNull();
  });

  it("should still handle directional border widths correctly", () => {
    // These should NOT be detected as color patterns
    expect(parseBorder("border-t-2")).toEqual({ borderTopWidth: 2 });
    expect(parseBorder("border-r-4")).toEqual({ borderRightWidth: 4 });
    expect(parseBorder("border-b-8")).toEqual({ borderBottomWidth: 8 });
    expect(parseBorder("border-l-0")).toEqual({ borderLeftWidth: 0 });
  });

  it("should still handle directional border width arbitrary values", () => {
    // These should NOT be detected as color patterns
    expect(parseBorder("border-t-[3px]")).toEqual({ borderTopWidth: 3 });
    expect(parseBorder("border-r-[5px]")).toEqual({ borderRightWidth: 5 });
    expect(parseBorder("border-b-[10]")).toEqual({ borderBottomWidth: 10 });
    expect(parseBorder("border-l-[8px]")).toEqual({ borderLeftWidth: 8 });
  });
});

describe("parseBorder - logical border width (RTL-aware)", () => {
  it("should parse border start width", () => {
    expect(parseBorder("border-s")).toEqual({ borderStartWidth: 1 });
    expect(parseBorder("border-s-0")).toEqual({ borderStartWidth: 0 });
    expect(parseBorder("border-s-2")).toEqual({ borderStartWidth: 2 });
    expect(parseBorder("border-s-4")).toEqual({ borderStartWidth: 4 });
    expect(parseBorder("border-s-8")).toEqual({ borderStartWidth: 8 });
  });

  it("should parse border end width", () => {
    expect(parseBorder("border-e")).toEqual({ borderEndWidth: 1 });
    expect(parseBorder("border-e-0")).toEqual({ borderEndWidth: 0 });
    expect(parseBorder("border-e-2")).toEqual({ borderEndWidth: 2 });
    expect(parseBorder("border-e-4")).toEqual({ borderEndWidth: 4 });
    expect(parseBorder("border-e-8")).toEqual({ borderEndWidth: 8 });
  });

  it("should parse border start/end with arbitrary values", () => {
    expect(parseBorder("border-s-[3px]")).toEqual({ borderStartWidth: 3 });
    expect(parseBorder("border-s-[5]")).toEqual({ borderStartWidth: 5 });
    expect(parseBorder("border-e-[3px]")).toEqual({ borderEndWidth: 3 });
    expect(parseBorder("border-e-[5]")).toEqual({ borderEndWidth: 5 });
  });
});

describe("parseBorder - logical border radius sides (RTL-aware)", () => {
  it("should parse rounded start (both top and bottom start corners)", () => {
    expect(parseBorder("rounded-s")).toEqual({
      borderTopStartRadius: 4,
      borderBottomStartRadius: 4,
    });
    expect(parseBorder("rounded-s-lg")).toEqual({
      borderTopStartRadius: 8,
      borderBottomStartRadius: 8,
    });
    expect(parseBorder("rounded-s-[12px]")).toEqual({
      borderTopStartRadius: 12,
      borderBottomStartRadius: 12,
    });
  });

  it("should parse rounded end (both top and bottom end corners)", () => {
    expect(parseBorder("rounded-e")).toEqual({
      borderTopEndRadius: 4,
      borderBottomEndRadius: 4,
    });
    expect(parseBorder("rounded-e-lg")).toEqual({
      borderTopEndRadius: 8,
      borderBottomEndRadius: 8,
    });
    expect(parseBorder("rounded-e-[12px]")).toEqual({
      borderTopEndRadius: 12,
      borderBottomEndRadius: 12,
    });
  });
});

describe("parseBorder - logical border radius corners (RTL-aware)", () => {
  it("should parse rounded start-start (top-start corner)", () => {
    expect(parseBorder("rounded-ss")).toEqual({ borderTopStartRadius: 4 });
    expect(parseBorder("rounded-ss-lg")).toEqual({ borderTopStartRadius: 8 });
    expect(parseBorder("rounded-ss-[12px]")).toEqual({
      borderTopStartRadius: 12,
    });
  });

  it("should parse rounded start-end (top-end corner)", () => {
    expect(parseBorder("rounded-se")).toEqual({ borderTopEndRadius: 4 });
    expect(parseBorder("rounded-se-lg")).toEqual({ borderTopEndRadius: 8 });
    expect(parseBorder("rounded-se-[12px]")).toEqual({
      borderTopEndRadius: 12,
    });
  });

  it("should parse rounded end-start (bottom-start corner)", () => {
    expect(parseBorder("rounded-es")).toEqual({ borderBottomStartRadius: 4 });
    expect(parseBorder("rounded-es-lg")).toEqual({ borderBottomStartRadius: 8 });
    expect(parseBorder("rounded-es-[12px]")).toEqual({
      borderBottomStartRadius: 12,
    });
  });

  it("should parse rounded end-end (bottom-end corner)", () => {
    expect(parseBorder("rounded-ee")).toEqual({ borderBottomEndRadius: 4 });
    expect(parseBorder("rounded-ee-lg")).toEqual({ borderBottomEndRadius: 8 });
    expect(parseBorder("rounded-ee-[12px]")).toEqual({
      borderBottomEndRadius: 12,
    });
  });

  it("should parse all logical corners with different sizes", () => {
    // Using full scale to verify all sizes work
    expect(parseBorder("rounded-ss-none")).toEqual({ borderTopStartRadius: 0 });
    expect(parseBorder("rounded-se-sm")).toEqual({ borderTopEndRadius: 2 });
    expect(parseBorder("rounded-es-md")).toEqual({ borderBottomStartRadius: 6 });
    expect(parseBorder("rounded-ee-xl")).toEqual({ borderBottomEndRadius: 12 });
    expect(parseBorder("rounded-ss-2xl")).toEqual({ borderTopStartRadius: 16 });
    expect(parseBorder("rounded-se-3xl")).toEqual({ borderTopEndRadius: 24 });
    expect(parseBorder("rounded-es-full")).toEqual({
      borderBottomStartRadius: 9999,
    });
  });
});
