import { describe, expect, it } from "vitest";

import { SPACING_SCALE, parseSpacing } from "./spacing";

describe("SPACING_SCALE", () => {
  it("should export complete spacing scale", () => {
    expect(SPACING_SCALE).toMatchSnapshot();
  });
});

describe("parseSpacing - margin", () => {
  it("should parse margin all sides", () => {
    expect(parseSpacing("m-0")).toEqual({ margin: 0 });
    expect(parseSpacing("m-4")).toEqual({ margin: 16 });
    expect(parseSpacing("m-8")).toEqual({ margin: 32 });
    expect(parseSpacing("m-96")).toEqual({ margin: 384 });
  });

  it("should parse margin with fractional values", () => {
    expect(parseSpacing("m-0.5")).toEqual({ margin: 2 });
    expect(parseSpacing("m-1.5")).toEqual({ margin: 6 });
    expect(parseSpacing("m-2.5")).toEqual({ margin: 10 });
  });

  it("should parse margin horizontal", () => {
    expect(parseSpacing("mx-0")).toEqual({ marginHorizontal: 0 });
    expect(parseSpacing("mx-4")).toEqual({ marginHorizontal: 16 });
    expect(parseSpacing("mx-8")).toEqual({ marginHorizontal: 32 });
  });

  it("should parse margin vertical", () => {
    expect(parseSpacing("my-0")).toEqual({ marginVertical: 0 });
    expect(parseSpacing("my-4")).toEqual({ marginVertical: 16 });
    expect(parseSpacing("my-8")).toEqual({ marginVertical: 32 });
  });

  it("should parse margin directional", () => {
    expect(parseSpacing("mt-4")).toEqual({ marginTop: 16 });
    expect(parseSpacing("mr-4")).toEqual({ marginRight: 16 });
    expect(parseSpacing("mb-4")).toEqual({ marginBottom: 16 });
    expect(parseSpacing("ml-4")).toEqual({ marginLeft: 16 });
  });

  it("should parse margin with arbitrary values", () => {
    expect(parseSpacing("m-[16px]")).toEqual({ margin: 16 });
    expect(parseSpacing("m-[16]")).toEqual({ margin: 16 });
    expect(parseSpacing("m-[100px]")).toEqual({ margin: 100 });
    expect(parseSpacing("m-[100]")).toEqual({ margin: 100 });
  });

  it("should parse margin directional with arbitrary values", () => {
    expect(parseSpacing("mt-[24px]")).toEqual({ marginTop: 24 });
    expect(parseSpacing("mr-[32]")).toEqual({ marginRight: 32 });
    expect(parseSpacing("mb-[16px]")).toEqual({ marginBottom: 16 });
    expect(parseSpacing("ml-[48]")).toEqual({ marginLeft: 48 });
  });

  it("should parse margin horizontal/vertical with arbitrary values", () => {
    expect(parseSpacing("mx-[20px]")).toEqual({ marginHorizontal: 20 });
    expect(parseSpacing("my-[30]")).toEqual({ marginVertical: 30 });
  });
});

describe("parseSpacing - negative margin", () => {
  it("should parse negative margin all sides", () => {
    expect(parseSpacing("-m-0")).toEqual({ margin: -0 }); // JavaScript -0 is distinct from +0
    expect(parseSpacing("-m-4")).toEqual({ margin: -16 });
    expect(parseSpacing("-m-8")).toEqual({ margin: -32 });
    expect(parseSpacing("-m-96")).toEqual({ margin: -384 });
  });

  it("should parse negative margin with fractional values", () => {
    expect(parseSpacing("-m-0.5")).toEqual({ margin: -2 });
    expect(parseSpacing("-m-1.5")).toEqual({ margin: -6 });
    expect(parseSpacing("-m-2.5")).toEqual({ margin: -10 });
  });

  it("should parse negative margin horizontal", () => {
    expect(parseSpacing("-mx-4")).toEqual({ marginHorizontal: -16 });
    expect(parseSpacing("-mx-8")).toEqual({ marginHorizontal: -32 });
  });

  it("should parse negative margin vertical", () => {
    expect(parseSpacing("-my-4")).toEqual({ marginVertical: -16 });
    expect(parseSpacing("-my-8")).toEqual({ marginVertical: -32 });
  });

  it("should parse negative margin directional", () => {
    expect(parseSpacing("-mt-4")).toEqual({ marginTop: -16 });
    expect(parseSpacing("-mr-4")).toEqual({ marginRight: -16 });
    expect(parseSpacing("-mb-4")).toEqual({ marginBottom: -16 });
    expect(parseSpacing("-ml-4")).toEqual({ marginLeft: -16 });
  });

  it("should parse negative margin with arbitrary values", () => {
    expect(parseSpacing("-m-[16px]")).toEqual({ margin: -16 });
    expect(parseSpacing("-m-[16]")).toEqual({ margin: -16 });
    expect(parseSpacing("-m-[100px]")).toEqual({ margin: -100 });
    expect(parseSpacing("-m-[100]")).toEqual({ margin: -100 });
  });

  it("should parse negative margin directional with arbitrary values", () => {
    expect(parseSpacing("-mt-[24px]")).toEqual({ marginTop: -24 });
    expect(parseSpacing("-mr-[32]")).toEqual({ marginRight: -32 });
    expect(parseSpacing("-mb-[16px]")).toEqual({ marginBottom: -16 });
    expect(parseSpacing("-ml-[48]")).toEqual({ marginLeft: -48 });
  });

  it("should parse negative margin horizontal/vertical with arbitrary values", () => {
    expect(parseSpacing("-mx-[20px]")).toEqual({ marginHorizontal: -20 });
    expect(parseSpacing("-my-[30]")).toEqual({ marginVertical: -30 });
  });

  it("should not parse negative padding (invalid)", () => {
    expect(parseSpacing("-p-4")).toBeNull();
    expect(parseSpacing("-px-4")).toBeNull();
    expect(parseSpacing("-pt-4")).toBeNull();
    expect(parseSpacing("-p-[16px]")).toBeNull();
  });

  it("should not parse negative gap (invalid)", () => {
    expect(parseSpacing("-gap-4")).toBeNull();
    expect(parseSpacing("-gap-[16px]")).toBeNull();
  });
});

describe("parseSpacing - padding", () => {
  it("should parse padding all sides", () => {
    expect(parseSpacing("p-0")).toEqual({ padding: 0 });
    expect(parseSpacing("p-4")).toEqual({ padding: 16 });
    expect(parseSpacing("p-8")).toEqual({ padding: 32 });
    expect(parseSpacing("p-96")).toEqual({ padding: 384 });
  });

  it("should parse padding with fractional values", () => {
    expect(parseSpacing("p-0.5")).toEqual({ padding: 2 });
    expect(parseSpacing("p-1.5")).toEqual({ padding: 6 });
    expect(parseSpacing("p-2.5")).toEqual({ padding: 10 });
  });

  it("should parse padding horizontal", () => {
    expect(parseSpacing("px-0")).toEqual({ paddingHorizontal: 0 });
    expect(parseSpacing("px-4")).toEqual({ paddingHorizontal: 16 });
    expect(parseSpacing("px-8")).toEqual({ paddingHorizontal: 32 });
  });

  it("should parse padding vertical", () => {
    expect(parseSpacing("py-0")).toEqual({ paddingVertical: 0 });
    expect(parseSpacing("py-4")).toEqual({ paddingVertical: 16 });
    expect(parseSpacing("py-8")).toEqual({ paddingVertical: 32 });
  });

  it("should parse padding directional", () => {
    expect(parseSpacing("pt-4")).toEqual({ paddingTop: 16 });
    expect(parseSpacing("pr-4")).toEqual({ paddingRight: 16 });
    expect(parseSpacing("pb-4")).toEqual({ paddingBottom: 16 });
    expect(parseSpacing("pl-4")).toEqual({ paddingLeft: 16 });
  });

  it("should parse padding with arbitrary values", () => {
    expect(parseSpacing("p-[16px]")).toEqual({ padding: 16 });
    expect(parseSpacing("p-[16]")).toEqual({ padding: 16 });
    expect(parseSpacing("p-[100px]")).toEqual({ padding: 100 });
    expect(parseSpacing("p-[100]")).toEqual({ padding: 100 });
  });

  it("should parse padding directional with arbitrary values", () => {
    expect(parseSpacing("pt-[24px]")).toEqual({ paddingTop: 24 });
    expect(parseSpacing("pr-[32]")).toEqual({ paddingRight: 32 });
    expect(parseSpacing("pb-[16px]")).toEqual({ paddingBottom: 16 });
    expect(parseSpacing("pl-[48]")).toEqual({ paddingLeft: 48 });
  });

  it("should parse padding horizontal/vertical with arbitrary values", () => {
    expect(parseSpacing("px-[20px]")).toEqual({ paddingHorizontal: 20 });
    expect(parseSpacing("py-[30]")).toEqual({ paddingVertical: 30 });
  });
});

describe("parseSpacing - gap", () => {
  it("should parse gap", () => {
    expect(parseSpacing("gap-0")).toEqual({ gap: 0 });
    expect(parseSpacing("gap-4")).toEqual({ gap: 16 });
    expect(parseSpacing("gap-8")).toEqual({ gap: 32 });
    expect(parseSpacing("gap-96")).toEqual({ gap: 384 });
  });

  it("should parse gap with fractional values", () => {
    expect(parseSpacing("gap-0.5")).toEqual({ gap: 2 });
    expect(parseSpacing("gap-1.5")).toEqual({ gap: 6 });
    expect(parseSpacing("gap-2.5")).toEqual({ gap: 10 });
  });

  it("should parse gap with arbitrary values", () => {
    expect(parseSpacing("gap-[16px]")).toEqual({ gap: 16 });
    expect(parseSpacing("gap-[16]")).toEqual({ gap: 16 });
    expect(parseSpacing("gap-[100px]")).toEqual({ gap: 100 });
    expect(parseSpacing("gap-[100]")).toEqual({ gap: 100 });
  });

  it("should parse horizontal and vertical gaps", () => {
    expect(parseSpacing("gap-x-2")).toEqual({ columnGap: 8 });
    expect(parseSpacing("gap-y-1.5")).toEqual({ rowGap: 6 });
    expect(parseSpacing("gap-x-px")).toEqual({ columnGap: 1 });
    expect(parseSpacing("gap-y-0")).toEqual({ rowGap: 0 });
  });

  it("should parse directional gaps with arbitrary values", () => {
    expect(parseSpacing("gap-x-[12px]")).toEqual({ columnGap: 12 });
    expect(parseSpacing("gap-y-[4.5]")).toEqual({ rowGap: 4.5 });
  });
});

describe("parseSpacing - edge cases", () => {
  it("should return null for invalid classes", () => {
    expect(parseSpacing("invalid")).toBeNull();
    expect(parseSpacing("m")).toBeNull();
    expect(parseSpacing("p")).toBeNull();
    expect(parseSpacing("margin-4")).toBeNull();
    expect(parseSpacing("padding-4")).toBeNull();
  });

  it("should return null for invalid spacing values", () => {
    expect(parseSpacing("m-invalid")).toBeNull();
    expect(parseSpacing("p-999")).toBeNull();
    expect(parseSpacing("gap-abc")).toBeNull();
  });

  it("should return null for arbitrary values with unsupported units", () => {
    expect(parseSpacing("m-[16rem]")).toBeNull();
    expect(parseSpacing("p-[2em]")).toBeNull();
    expect(parseSpacing("gap-[50%]")).toBeNull();
  });

  it("should return null for malformed arbitrary values", () => {
    expect(parseSpacing("m-[16")).toBeNull();
    expect(parseSpacing("p-16]")).toBeNull();
    expect(parseSpacing("gap-[]")).toBeNull();
  });

  it("should handle edge case spacing values", () => {
    expect(parseSpacing("m-0")).toEqual({ margin: 0 });
    expect(parseSpacing("p-0")).toEqual({ padding: 0 });
    expect(parseSpacing("gap-0")).toEqual({ gap: 0 });
  });

  it("should parse px (1 pixel) across all spacing utilities", () => {
    expect(parseSpacing("m-px")).toEqual({ margin: 1 });
    expect(parseSpacing("mx-px")).toEqual({ marginHorizontal: 1 });
    expect(parseSpacing("my-px")).toEqual({ marginVertical: 1 });
    expect(parseSpacing("mt-px")).toEqual({ marginTop: 1 });
    expect(parseSpacing("mr-px")).toEqual({ marginRight: 1 });
    expect(parseSpacing("mb-px")).toEqual({ marginBottom: 1 });
    expect(parseSpacing("ml-px")).toEqual({ marginLeft: 1 });
    expect(parseSpacing("ms-px")).toEqual({ marginStart: 1 });
    expect(parseSpacing("me-px")).toEqual({ marginEnd: 1 });
    expect(parseSpacing("p-px")).toEqual({ padding: 1 });
    expect(parseSpacing("px-px")).toEqual({ paddingHorizontal: 1 });
    expect(parseSpacing("py-px")).toEqual({ paddingVertical: 1 });
    expect(parseSpacing("pt-px")).toEqual({ paddingTop: 1 });
    expect(parseSpacing("pr-px")).toEqual({ paddingRight: 1 });
    expect(parseSpacing("pb-px")).toEqual({ paddingBottom: 1 });
    expect(parseSpacing("pl-px")).toEqual({ paddingLeft: 1 });
    expect(parseSpacing("ps-px")).toEqual({ paddingStart: 1 });
    expect(parseSpacing("pe-px")).toEqual({ paddingEnd: 1 });
    expect(parseSpacing("gap-px")).toEqual({ gap: 1 });
    expect(parseSpacing("-m-px")).toEqual({ margin: -1 });
    expect(parseSpacing("-mt-px")).toEqual({ marginTop: -1 });
  });

  it("should not match partial class names", () => {
    expect(parseSpacing("sm-4")).toBeNull();
    expect(parseSpacing("margin-4")).toBeNull();
    expect(parseSpacing("padding-4")).toBeNull();
  });
});

describe("parseSpacing - decimal arbitrary values", () => {
  it("should parse margin with decimal arbitrary values", () => {
    expect(parseSpacing("m-[4.5px]")).toEqual({ margin: 4.5 });
    expect(parseSpacing("m-[4.5]")).toEqual({ margin: 4.5 });
    expect(parseSpacing("m-[16.75px]")).toEqual({ margin: 16.75 });
    expect(parseSpacing("m-[16.75]")).toEqual({ margin: 16.75 });
    expect(parseSpacing("m-[100.25px]")).toEqual({ margin: 100.25 });
    expect(parseSpacing("m-[0.5]")).toEqual({ margin: 0.5 });
  });

  it("should parse padding with decimal arbitrary values", () => {
    expect(parseSpacing("p-[4.5px]")).toEqual({ padding: 4.5 });
    expect(parseSpacing("p-[4.5]")).toEqual({ padding: 4.5 });
    expect(parseSpacing("pl-[4.5px]")).toEqual({ paddingLeft: 4.5 });
    expect(parseSpacing("pl-[4.5]")).toEqual({ paddingLeft: 4.5 });
    expect(parseSpacing("pr-[16.75px]")).toEqual({ paddingRight: 16.75 });
    expect(parseSpacing("pt-[10.5]")).toEqual({ paddingTop: 10.5 });
    expect(parseSpacing("pb-[20.25px]")).toEqual({ paddingBottom: 20.25 });
  });

  it("should parse padding horizontal/vertical with decimal arbitrary values", () => {
    expect(parseSpacing("px-[4.5px]")).toEqual({ paddingHorizontal: 4.5 });
    expect(parseSpacing("py-[10.75]")).toEqual({ paddingVertical: 10.75 });
  });

  it("should parse gap with decimal arbitrary values", () => {
    expect(parseSpacing("gap-[4.5px]")).toEqual({ gap: 4.5 });
    expect(parseSpacing("gap-[4.5]")).toEqual({ gap: 4.5 });
    expect(parseSpacing("gap-[16.75px]")).toEqual({ gap: 16.75 });
    expect(parseSpacing("gap-[0.5]")).toEqual({ gap: 0.5 });
  });

  it("should parse negative margin with decimal arbitrary values", () => {
    expect(parseSpacing("-m-[4.5px]")).toEqual({ margin: -4.5 });
    expect(parseSpacing("-m-[4.5]")).toEqual({ margin: -4.5 });
    expect(parseSpacing("-m-[10.5px]")).toEqual({ margin: -10.5 });
    expect(parseSpacing("-mt-[16.75px]")).toEqual({ marginTop: -16.75 });
    expect(parseSpacing("-ml-[8.25]")).toEqual({ marginLeft: -8.25 });
    expect(parseSpacing("-mx-[12.5px]")).toEqual({ marginHorizontal: -12.5 });
    expect(parseSpacing("-my-[20.75]")).toEqual({ marginVertical: -20.75 });
  });

  it("should parse margin directional with decimal arbitrary values", () => {
    expect(parseSpacing("mt-[4.5px]")).toEqual({ marginTop: 4.5 });
    expect(parseSpacing("mr-[8.25]")).toEqual({ marginRight: 8.25 });
    expect(parseSpacing("mb-[16.75px]")).toEqual({ marginBottom: 16.75 });
    expect(parseSpacing("ml-[12.5]")).toEqual({ marginLeft: 12.5 });
  });

  it("should parse margin horizontal/vertical with decimal arbitrary values", () => {
    expect(parseSpacing("mx-[4.5px]")).toEqual({ marginHorizontal: 4.5 });
    expect(parseSpacing("my-[10.75]")).toEqual({ marginVertical: 10.75 });
  });

  it("should handle edge case decimal values", () => {
    expect(parseSpacing("m-[0.1px]")).toEqual({ margin: 0.1 });
    expect(parseSpacing("p-[0.001]")).toEqual({ padding: 0.001 });
    expect(parseSpacing("gap-[999.999px]")).toEqual({ gap: 999.999 });
    expect(parseSpacing("-m-[0.5]")).toEqual({ margin: -0.5 });
  });
});

describe("parseSpacing - comprehensive coverage", () => {
  it("should parse all margin directions with same value", () => {
    const value = 16;
    expect(parseSpacing("m-4")).toEqual({ margin: value });
    expect(parseSpacing("mx-4")).toEqual({ marginHorizontal: value });
    expect(parseSpacing("my-4")).toEqual({ marginVertical: value });
    expect(parseSpacing("mt-4")).toEqual({ marginTop: value });
    expect(parseSpacing("mr-4")).toEqual({ marginRight: value });
    expect(parseSpacing("mb-4")).toEqual({ marginBottom: value });
    expect(parseSpacing("ml-4")).toEqual({ marginLeft: value });
  });

  it("should parse all padding directions with same value", () => {
    const value = 16;
    expect(parseSpacing("p-4")).toEqual({ padding: value });
    expect(parseSpacing("px-4")).toEqual({ paddingHorizontal: value });
    expect(parseSpacing("py-4")).toEqual({ paddingVertical: value });
    expect(parseSpacing("pt-4")).toEqual({ paddingTop: value });
    expect(parseSpacing("pr-4")).toEqual({ paddingRight: value });
    expect(parseSpacing("pb-4")).toEqual({ paddingBottom: value });
    expect(parseSpacing("pl-4")).toEqual({ paddingLeft: value });
  });

  it("should handle large spacing values", () => {
    expect(parseSpacing("m-96")).toEqual({ margin: 384 });
    expect(parseSpacing("p-96")).toEqual({ padding: 384 });
    expect(parseSpacing("gap-96")).toEqual({ gap: 384 });
  });

  it("should handle arbitrary values across all margin directions", () => {
    expect(parseSpacing("m-[50px]")).toEqual({ margin: 50 });
    expect(parseSpacing("mx-[50px]")).toEqual({ marginHorizontal: 50 });
    expect(parseSpacing("my-[50px]")).toEqual({ marginVertical: 50 });
    expect(parseSpacing("mt-[50px]")).toEqual({ marginTop: 50 });
    expect(parseSpacing("mr-[50px]")).toEqual({ marginRight: 50 });
    expect(parseSpacing("mb-[50px]")).toEqual({ marginBottom: 50 });
    expect(parseSpacing("ml-[50px]")).toEqual({ marginLeft: 50 });
  });

  it("should handle arbitrary values across all padding directions", () => {
    expect(parseSpacing("p-[50px]")).toEqual({ padding: 50 });
    expect(parseSpacing("px-[50px]")).toEqual({ paddingHorizontal: 50 });
    expect(parseSpacing("py-[50px]")).toEqual({ paddingVertical: 50 });
    expect(parseSpacing("pt-[50px]")).toEqual({ paddingTop: 50 });
    expect(parseSpacing("pr-[50px]")).toEqual({ paddingRight: 50 });
    expect(parseSpacing("pb-[50px]")).toEqual({ paddingBottom: 50 });
    expect(parseSpacing("pl-[50px]")).toEqual({ paddingLeft: 50 });
  });
});

describe("parseSpacing - logical margin (RTL-aware)", () => {
  it("should parse margin start", () => {
    expect(parseSpacing("ms-0")).toEqual({ marginStart: 0 });
    expect(parseSpacing("ms-4")).toEqual({ marginStart: 16 });
    expect(parseSpacing("ms-8")).toEqual({ marginStart: 32 });
  });

  it("should parse margin end", () => {
    expect(parseSpacing("me-0")).toEqual({ marginEnd: 0 });
    expect(parseSpacing("me-4")).toEqual({ marginEnd: 16 });
    expect(parseSpacing("me-8")).toEqual({ marginEnd: 32 });
  });

  it("should parse margin start/end with fractional values", () => {
    expect(parseSpacing("ms-0.5")).toEqual({ marginStart: 2 });
    expect(parseSpacing("me-1.5")).toEqual({ marginEnd: 6 });
    expect(parseSpacing("ms-2.5")).toEqual({ marginStart: 10 });
  });

  it("should parse margin start/end with arbitrary values", () => {
    expect(parseSpacing("ms-[16px]")).toEqual({ marginStart: 16 });
    expect(parseSpacing("ms-[16]")).toEqual({ marginStart: 16 });
    expect(parseSpacing("me-[24px]")).toEqual({ marginEnd: 24 });
    expect(parseSpacing("me-[24]")).toEqual({ marginEnd: 24 });
  });

  it("should parse negative margin start/end", () => {
    expect(parseSpacing("-ms-4")).toEqual({ marginStart: -16 });
    expect(parseSpacing("-me-4")).toEqual({ marginEnd: -16 });
    expect(parseSpacing("-ms-8")).toEqual({ marginStart: -32 });
    expect(parseSpacing("-me-8")).toEqual({ marginEnd: -32 });
  });

  it("should parse negative margin start/end with arbitrary values", () => {
    expect(parseSpacing("-ms-[16px]")).toEqual({ marginStart: -16 });
    expect(parseSpacing("-me-[24]")).toEqual({ marginEnd: -24 });
  });
});

describe("parseSpacing - logical padding (RTL-aware)", () => {
  it("should parse padding start", () => {
    expect(parseSpacing("ps-0")).toEqual({ paddingStart: 0 });
    expect(parseSpacing("ps-4")).toEqual({ paddingStart: 16 });
    expect(parseSpacing("ps-8")).toEqual({ paddingStart: 32 });
  });

  it("should parse padding end", () => {
    expect(parseSpacing("pe-0")).toEqual({ paddingEnd: 0 });
    expect(parseSpacing("pe-4")).toEqual({ paddingEnd: 16 });
    expect(parseSpacing("pe-8")).toEqual({ paddingEnd: 32 });
  });

  it("should parse padding start/end with fractional values", () => {
    expect(parseSpacing("ps-0.5")).toEqual({ paddingStart: 2 });
    expect(parseSpacing("pe-1.5")).toEqual({ paddingEnd: 6 });
    expect(parseSpacing("ps-2.5")).toEqual({ paddingStart: 10 });
  });

  it("should parse padding start/end with arbitrary values", () => {
    expect(parseSpacing("ps-[16px]")).toEqual({ paddingStart: 16 });
    expect(parseSpacing("ps-[16]")).toEqual({ paddingStart: 16 });
    expect(parseSpacing("pe-[24px]")).toEqual({ paddingEnd: 24 });
    expect(parseSpacing("pe-[24]")).toEqual({ paddingEnd: 24 });
  });
});

describe("parseSpacing - auto margin", () => {
  it("should parse m-auto", () => {
    expect(parseSpacing("m-auto")).toEqual({ margin: "auto" });
  });

  it("should parse mx-auto", () => {
    expect(parseSpacing("mx-auto")).toEqual({ marginHorizontal: "auto" });
  });

  it("should parse my-auto", () => {
    expect(parseSpacing("my-auto")).toEqual({ marginVertical: "auto" });
  });

  it("should parse directional auto margins", () => {
    expect(parseSpacing("mt-auto")).toEqual({ marginTop: "auto" });
    expect(parseSpacing("mr-auto")).toEqual({ marginRight: "auto" });
    expect(parseSpacing("mb-auto")).toEqual({ marginBottom: "auto" });
    expect(parseSpacing("ml-auto")).toEqual({ marginLeft: "auto" });
  });

  it("should parse logical auto margins (RTL-aware)", () => {
    expect(parseSpacing("ms-auto")).toEqual({ marginStart: "auto" });
    expect(parseSpacing("me-auto")).toEqual({ marginEnd: "auto" });
  });

  it("should not parse padding auto (not valid in Tailwind)", () => {
    expect(parseSpacing("p-auto")).toBeNull();
    expect(parseSpacing("px-auto")).toBeNull();
    expect(parseSpacing("py-auto")).toBeNull();
    expect(parseSpacing("pt-auto")).toBeNull();
  });

  it("should not parse gap auto (not valid in Tailwind)", () => {
    expect(parseSpacing("gap-auto")).toBeNull();
  });
});

describe("parseSpacing - custom spacing", () => {
  const customSpacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 32,
    xl: 64,
    "4": 20, // Override default (16)
  };

  it("should support custom spacing values for margin", () => {
    expect(parseSpacing("m-xs", customSpacing)).toEqual({ margin: 4 });
    expect(parseSpacing("m-sm", customSpacing)).toEqual({ margin: 8 });
    expect(parseSpacing("m-lg", customSpacing)).toEqual({ margin: 32 });
    expect(parseSpacing("mx-xl", customSpacing)).toEqual({ marginHorizontal: 64 });
    expect(parseSpacing("mt-md", customSpacing)).toEqual({ marginTop: 16 });
  });

  it("should support custom spacing values for padding", () => {
    expect(parseSpacing("p-xs", customSpacing)).toEqual({ padding: 4 });
    expect(parseSpacing("p-sm", customSpacing)).toEqual({ padding: 8 });
    expect(parseSpacing("px-lg", customSpacing)).toEqual({ paddingHorizontal: 32 });
    expect(parseSpacing("pt-xl", customSpacing)).toEqual({ paddingTop: 64 });
  });

  it("should support custom spacing values for gap", () => {
    expect(parseSpacing("gap-xs", customSpacing)).toEqual({ gap: 4 });
    expect(parseSpacing("gap-md", customSpacing)).toEqual({ gap: 16 });
    expect(parseSpacing("gap-xl", customSpacing)).toEqual({ gap: 64 });
    expect(parseSpacing("gap-x-sm", customSpacing)).toEqual({ columnGap: 8 });
    expect(parseSpacing("gap-y-lg", customSpacing)).toEqual({ rowGap: 32 });
  });

  it("should allow custom spacing to override preset values", () => {
    expect(parseSpacing("m-4", customSpacing)).toEqual({ margin: 20 }); // Custom 20, not default 16
  });

  it("should prefer arbitrary values over custom spacing", () => {
    expect(parseSpacing("m-[24px]", customSpacing)).toEqual({ margin: 24 }); // Arbitrary wins
    expect(parseSpacing("p-[50]", customSpacing)).toEqual({ padding: 50 }); // Arbitrary wins
  });

  it("should support negative margins with custom spacing", () => {
    expect(parseSpacing("-m-xs", customSpacing)).toEqual({ margin: -4 });
    expect(parseSpacing("-m-lg", customSpacing)).toEqual({ margin: -32 });
    expect(parseSpacing("-mx-xl", customSpacing)).toEqual({ marginHorizontal: -64 });
  });

  it("should fall back to preset scale for unknown custom keys", () => {
    expect(parseSpacing("m-8", customSpacing)).toEqual({ margin: 32 }); // Not overridden, uses preset
    expect(parseSpacing("p-12", customSpacing)).toEqual({ padding: 48 }); // Not overridden, uses preset
  });

  it("should work without custom spacing (backward compatible)", () => {
    expect(parseSpacing("m-4")).toEqual({ margin: 16 }); // Default behavior
    expect(parseSpacing("p-8")).toEqual({ padding: 32 }); // Default behavior
  });
});
