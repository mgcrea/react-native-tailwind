import { describe, expect, it } from "vitest";

import { parseLayout } from "./layout";

describe("parseLayout - display utilities", () => {
  it("should parse display flex", () => {
    expect(parseLayout("flex")).toEqual({ display: "flex" });
  });

  it("should parse display hidden", () => {
    expect(parseLayout("hidden")).toEqual({ display: "none" });
  });
});

describe("parseLayout - flex direction utilities", () => {
  it("should parse flex row", () => {
    expect(parseLayout("flex-row")).toEqual({ flexDirection: "row" });
  });

  it("should parse flex row reverse", () => {
    expect(parseLayout("flex-row-reverse")).toEqual({ flexDirection: "row-reverse" });
  });

  it("should parse flex column", () => {
    expect(parseLayout("flex-col")).toEqual({ flexDirection: "column" });
  });

  it("should parse flex column reverse", () => {
    expect(parseLayout("flex-col-reverse")).toEqual({ flexDirection: "column-reverse" });
  });
});

describe("parseLayout - flex wrap utilities", () => {
  it("should parse flex wrap", () => {
    expect(parseLayout("flex-wrap")).toEqual({ flexWrap: "wrap" });
  });

  it("should parse flex wrap reverse", () => {
    expect(parseLayout("flex-wrap-reverse")).toEqual({ flexWrap: "wrap-reverse" });
  });

  it("should parse flex nowrap", () => {
    expect(parseLayout("flex-nowrap")).toEqual({ flexWrap: "nowrap" });
  });
});

describe("parseLayout - flex utilities", () => {
  it("should parse flex-1", () => {
    expect(parseLayout("flex-1")).toEqual({ flex: 1 });
  });

  it("should parse flex-auto", () => {
    expect(parseLayout("flex-auto")).toEqual({ flex: 1 });
  });

  it("should parse flex-none", () => {
    expect(parseLayout("flex-none")).toEqual({ flex: 0 });
  });
});

describe("parseLayout - flex grow/shrink utilities", () => {
  it("should parse grow", () => {
    expect(parseLayout("grow")).toEqual({ flexGrow: 1 });
  });

  it("should parse grow-0", () => {
    expect(parseLayout("grow-0")).toEqual({ flexGrow: 0 });
  });

  it("should parse shrink", () => {
    expect(parseLayout("shrink")).toEqual({ flexShrink: 1 });
  });

  it("should parse shrink-0", () => {
    expect(parseLayout("shrink-0")).toEqual({ flexShrink: 0 });
  });

  it("should parse grow with arbitrary values", () => {
    expect(parseLayout("grow-[1.5]")).toEqual({ flexGrow: 1.5 });
    expect(parseLayout("grow-[2]")).toEqual({ flexGrow: 2 });
    expect(parseLayout("grow-[0.5]")).toEqual({ flexGrow: 0.5 });
    expect(parseLayout("grow-[3]")).toEqual({ flexGrow: 3 });
    expect(parseLayout("grow-[0]")).toEqual({ flexGrow: 0 });
  });

  it("should parse shrink with arbitrary values", () => {
    expect(parseLayout("shrink-[0.5]")).toEqual({ flexShrink: 0.5 });
    expect(parseLayout("shrink-[2]")).toEqual({ flexShrink: 2 });
    expect(parseLayout("shrink-[1.5]")).toEqual({ flexShrink: 1.5 });
    expect(parseLayout("shrink-[3]")).toEqual({ flexShrink: 3 });
    expect(parseLayout("shrink-[0]")).toEqual({ flexShrink: 0 });
  });

  it("should parse CSS-style flex-grow aliases", () => {
    expect(parseLayout("flex-grow")).toEqual({ flexGrow: 1 });
    expect(parseLayout("flex-grow-0")).toEqual({ flexGrow: 0 });
  });

  it("should parse CSS-style flex-shrink aliases", () => {
    expect(parseLayout("flex-shrink")).toEqual({ flexShrink: 1 });
    expect(parseLayout("flex-shrink-0")).toEqual({ flexShrink: 0 });
  });

  it("should parse CSS-style flex-grow with arbitrary values", () => {
    expect(parseLayout("flex-grow-[1.5]")).toEqual({ flexGrow: 1.5 });
    expect(parseLayout("flex-grow-[2]")).toEqual({ flexGrow: 2 });
    expect(parseLayout("flex-grow-[0.5]")).toEqual({ flexGrow: 0.5 });
  });

  it("should parse CSS-style flex-shrink with arbitrary values", () => {
    expect(parseLayout("flex-shrink-[0.5]")).toEqual({ flexShrink: 0.5 });
    expect(parseLayout("flex-shrink-[2]")).toEqual({ flexShrink: 2 });
    expect(parseLayout("flex-shrink-[1.5]")).toEqual({ flexShrink: 1.5 });
  });

  it("should handle edge case values", () => {
    expect(parseLayout("grow-[0.1]")).toEqual({ flexGrow: 0.1 });
    expect(parseLayout("grow-[10]")).toEqual({ flexGrow: 10 });
    expect(parseLayout("shrink-[0.01]")).toEqual({ flexShrink: 0.01 });
    expect(parseLayout("shrink-[100]")).toEqual({ flexShrink: 100 });
  });

  it("should parse Tailwind shorthand decimals (no leading zero)", () => {
    expect(parseLayout("grow-[.5]")).toEqual({ flexGrow: 0.5 });
    expect(parseLayout("grow-[.75]")).toEqual({ flexGrow: 0.75 });
    expect(parseLayout("shrink-[.5]")).toEqual({ flexShrink: 0.5 });
    expect(parseLayout("shrink-[.25]")).toEqual({ flexShrink: 0.25 });
    expect(parseLayout("flex-grow-[.5]")).toEqual({ flexGrow: 0.5 });
    expect(parseLayout("flex-shrink-[.5]")).toEqual({ flexShrink: 0.5 });
  });

  it("should reject negative values", () => {
    expect(parseLayout("grow-[-1]")).toBeNull();
    expect(parseLayout("shrink-[-1]")).toBeNull();
    expect(parseLayout("flex-grow-[-2]")).toBeNull();
    expect(parseLayout("flex-shrink-[-0.5]")).toBeNull();
  });
});

describe("parseLayout - justify content utilities", () => {
  it("should parse justify-start", () => {
    expect(parseLayout("justify-start")).toEqual({ justifyContent: "flex-start" });
  });

  it("should parse justify-end", () => {
    expect(parseLayout("justify-end")).toEqual({ justifyContent: "flex-end" });
  });

  it("should parse justify-center", () => {
    expect(parseLayout("justify-center")).toEqual({ justifyContent: "center" });
  });

  it("should parse justify-between", () => {
    expect(parseLayout("justify-between")).toEqual({ justifyContent: "space-between" });
  });

  it("should parse justify-around", () => {
    expect(parseLayout("justify-around")).toEqual({ justifyContent: "space-around" });
  });

  it("should parse justify-evenly", () => {
    expect(parseLayout("justify-evenly")).toEqual({ justifyContent: "space-evenly" });
  });
});

describe("parseLayout - align items utilities", () => {
  it("should parse items-start", () => {
    expect(parseLayout("items-start")).toEqual({ alignItems: "flex-start" });
  });

  it("should parse items-end", () => {
    expect(parseLayout("items-end")).toEqual({ alignItems: "flex-end" });
  });

  it("should parse items-center", () => {
    expect(parseLayout("items-center")).toEqual({ alignItems: "center" });
  });

  it("should parse items-baseline", () => {
    expect(parseLayout("items-baseline")).toEqual({ alignItems: "baseline" });
  });

  it("should parse items-stretch", () => {
    expect(parseLayout("items-stretch")).toEqual({ alignItems: "stretch" });
  });
});

describe("parseLayout - align self utilities", () => {
  it("should parse self-auto", () => {
    expect(parseLayout("self-auto")).toEqual({ alignSelf: "auto" });
  });

  it("should parse self-start", () => {
    expect(parseLayout("self-start")).toEqual({ alignSelf: "flex-start" });
  });

  it("should parse self-end", () => {
    expect(parseLayout("self-end")).toEqual({ alignSelf: "flex-end" });
  });

  it("should parse self-center", () => {
    expect(parseLayout("self-center")).toEqual({ alignSelf: "center" });
  });

  it("should parse self-stretch", () => {
    expect(parseLayout("self-stretch")).toEqual({ alignSelf: "stretch" });
  });

  it("should parse self-baseline", () => {
    expect(parseLayout("self-baseline")).toEqual({ alignSelf: "baseline" });
  });
});

describe("parseLayout - align content utilities", () => {
  it("should parse content-start", () => {
    expect(parseLayout("content-start")).toEqual({ alignContent: "flex-start" });
  });

  it("should parse content-end", () => {
    expect(parseLayout("content-end")).toEqual({ alignContent: "flex-end" });
  });

  it("should parse content-center", () => {
    expect(parseLayout("content-center")).toEqual({ alignContent: "center" });
  });

  it("should parse content-between", () => {
    expect(parseLayout("content-between")).toEqual({ alignContent: "space-between" });
  });

  it("should parse content-around", () => {
    expect(parseLayout("content-around")).toEqual({ alignContent: "space-around" });
  });

  it("should parse content-stretch", () => {
    expect(parseLayout("content-stretch")).toEqual({ alignContent: "stretch" });
  });
});

describe("parseLayout - position utilities", () => {
  it("should parse absolute", () => {
    expect(parseLayout("absolute")).toEqual({ position: "absolute" });
  });

  it("should parse relative", () => {
    expect(parseLayout("relative")).toEqual({ position: "relative" });
  });
});

describe("parseLayout - overflow utilities", () => {
  it("should parse overflow-hidden", () => {
    expect(parseLayout("overflow-hidden")).toEqual({ overflow: "hidden" });
  });

  it("should parse overflow-visible", () => {
    expect(parseLayout("overflow-visible")).toEqual({ overflow: "visible" });
  });

  it("should parse overflow-scroll", () => {
    expect(parseLayout("overflow-scroll")).toEqual({ overflow: "scroll" });
  });
});

describe("parseLayout - opacity utilities", () => {
  it("should parse opacity-0 (fully transparent)", () => {
    expect(parseLayout("opacity-0")).toEqual({ opacity: 0 });
  });

  it("should parse opacity-50 (half transparent)", () => {
    expect(parseLayout("opacity-50")).toEqual({ opacity: 0.5 });
  });

  it("should parse opacity-100 (fully opaque)", () => {
    expect(parseLayout("opacity-100")).toEqual({ opacity: 1 });
  });

  it("should parse all opacity values", () => {
    expect(parseLayout("opacity-5")).toEqual({ opacity: 0.05 });
    expect(parseLayout("opacity-10")).toEqual({ opacity: 0.1 });
    expect(parseLayout("opacity-15")).toEqual({ opacity: 0.15 });
    expect(parseLayout("opacity-20")).toEqual({ opacity: 0.2 });
    expect(parseLayout("opacity-25")).toEqual({ opacity: 0.25 });
    expect(parseLayout("opacity-30")).toEqual({ opacity: 0.3 });
    expect(parseLayout("opacity-35")).toEqual({ opacity: 0.35 });
    expect(parseLayout("opacity-40")).toEqual({ opacity: 0.4 });
    expect(parseLayout("opacity-45")).toEqual({ opacity: 0.45 });
    expect(parseLayout("opacity-55")).toEqual({ opacity: 0.55 });
    expect(parseLayout("opacity-60")).toEqual({ opacity: 0.6 });
    expect(parseLayout("opacity-65")).toEqual({ opacity: 0.65 });
    expect(parseLayout("opacity-70")).toEqual({ opacity: 0.7 });
    expect(parseLayout("opacity-75")).toEqual({ opacity: 0.75 });
    expect(parseLayout("opacity-80")).toEqual({ opacity: 0.8 });
    expect(parseLayout("opacity-85")).toEqual({ opacity: 0.85 });
    expect(parseLayout("opacity-90")).toEqual({ opacity: 0.9 });
    expect(parseLayout("opacity-95")).toEqual({ opacity: 0.95 });
  });

  it("should parse arbitrary raw and percentage opacity values", () => {
    expect(parseLayout("opacity-[.67]")).toEqual({ opacity: 0.67 });
    expect(parseLayout("opacity-[0.125]")).toEqual({ opacity: 0.125 });
    expect(parseLayout("opacity-[1]")).toEqual({ opacity: 1 });
    expect(parseLayout("opacity-[67%]")).toEqual({ opacity: 0.67 });
    expect(parseLayout("opacity-[12.5%]")).toEqual({ opacity: 0.125 });
  });

  it("should reject arbitrary opacity outside the native range", () => {
    expect(parseLayout("opacity-[1.1]")).toBeNull();
    expect(parseLayout("opacity-[101%]")).toBeNull();
    expect(parseLayout("opacity-[-.1]")).toBeNull();
    expect(parseLayout("opacity-[invalid]")).toBeNull();
  });
});

describe("parseLayout - edge cases", () => {
  it("should return null for invalid classes", () => {
    expect(parseLayout("invalid")).toBeNull();
    expect(parseLayout("flex-invalid")).toBeNull();
    expect(parseLayout("justify")).toBeNull();
    expect(parseLayout("items")).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(parseLayout("")).toBeNull();
  });

  it("should return null for partial class names", () => {
    expect(parseLayout("fle")).toBeNull();
    expect(parseLayout("flexbox")).toBeNull();
    expect(parseLayout("justify-start-center")).toBeNull();
  });

  it("should return null for CSS classes not in React Native", () => {
    expect(parseLayout("inline")).toBeNull();
    expect(parseLayout("block")).toBeNull();
    expect(parseLayout("inline-block")).toBeNull();
    expect(parseLayout("grid")).toBeNull();
  });
});

describe("parseLayout - comprehensive coverage", () => {
  it("should handle all flex direction variants", () => {
    const directions = ["flex-row", "flex-row-reverse", "flex-col", "flex-col-reverse"];
    directions.forEach((dir) => {
      expect(parseLayout(dir)).toBeTruthy();
    });
  });

  it("should handle all flex wrap variants", () => {
    const wraps = ["flex-wrap", "flex-wrap-reverse", "flex-nowrap"];
    wraps.forEach((wrap) => {
      expect(parseLayout(wrap)).toBeTruthy();
    });
  });

  it("should handle all justify content variants", () => {
    const justifies = [
      "justify-start",
      "justify-end",
      "justify-center",
      "justify-between",
      "justify-around",
      "justify-evenly",
    ];
    justifies.forEach((justify) => {
      expect(parseLayout(justify)).toBeTruthy();
    });
  });

  it("should handle all align items variants", () => {
    const aligns = ["items-start", "items-end", "items-center", "items-baseline", "items-stretch"];
    aligns.forEach((align) => {
      expect(parseLayout(align)).toBeTruthy();
    });
  });

  it("should handle all align self variants", () => {
    const selfs = ["self-auto", "self-start", "self-end", "self-center", "self-stretch", "self-baseline"];
    selfs.forEach((self) => {
      expect(parseLayout(self)).toBeTruthy();
    });
  });

  it("should handle all align content variants", () => {
    const contents = [
      "content-start",
      "content-end",
      "content-center",
      "content-between",
      "content-around",
      "content-stretch",
    ];
    contents.forEach((content) => {
      expect(parseLayout(content)).toBeTruthy();
    });
  });

  it("should handle all position variants", () => {
    const positions = ["absolute", "relative"];
    positions.forEach((position) => {
      expect(parseLayout(position)).toBeTruthy();
    });
  });

  it("should handle all overflow variants", () => {
    const overflows = ["overflow-hidden", "overflow-visible", "overflow-scroll"];
    overflows.forEach((overflow) => {
      expect(parseLayout(overflow)).toBeTruthy();
    });
  });
});

describe("parseLayout - case sensitivity", () => {
  it("should be case-sensitive", () => {
    expect(parseLayout("FLEX")).toBeNull();
    expect(parseLayout("Flex")).toBeNull();
    expect(parseLayout("ABSOLUTE")).toBeNull();
  });
});

describe("parseLayout - z-index utilities", () => {
  it("should parse z-index values", () => {
    expect(parseLayout("z-0")).toEqual({ zIndex: 0 });
    expect(parseLayout("z-10")).toEqual({ zIndex: 10 });
    expect(parseLayout("z-20")).toEqual({ zIndex: 20 });
    expect(parseLayout("z-30")).toEqual({ zIndex: 30 });
    expect(parseLayout("z-40")).toEqual({ zIndex: 40 });
    expect(parseLayout("z-50")).toEqual({ zIndex: 50 });
  });

  it("should parse z-auto as 0", () => {
    expect(parseLayout("z-auto")).toEqual({ zIndex: 0 });
  });

  it("should parse arbitrary z-index values", () => {
    expect(parseLayout("z-[999]")).toEqual({ zIndex: 999 });
    expect(parseLayout("z-[100]")).toEqual({ zIndex: 100 });
    expect(parseLayout("z-[1]")).toEqual({ zIndex: 1 });
  });

  it("should parse negative arbitrary z-index values", () => {
    expect(parseLayout("z-[-1]")).toEqual({ zIndex: -1 });
    expect(parseLayout("z-[-10]")).toEqual({ zIndex: -10 });
    expect(parseLayout("z-[-999]")).toEqual({ zIndex: -999 });
  });

  it("should return null for invalid z-index values", () => {
    expect(parseLayout("z-100")).toBeNull();
    expect(parseLayout("z-5")).toBeNull();
    expect(parseLayout("z-invalid")).toBeNull();
  });
});

describe("parseLayout - positioning utilities", () => {
  it("should parse top values", () => {
    expect(parseLayout("top-0")).toEqual({ top: 0 });
    expect(parseLayout("top-4")).toEqual({ top: 16 });
    expect(parseLayout("top-8")).toEqual({ top: 32 });
    expect(parseLayout("top-16")).toEqual({ top: 64 });
  });

  it("should parse right values", () => {
    expect(parseLayout("right-0")).toEqual({ right: 0 });
    expect(parseLayout("right-4")).toEqual({ right: 16 });
    expect(parseLayout("right-8")).toEqual({ right: 32 });
    expect(parseLayout("right-16")).toEqual({ right: 64 });
  });

  it("should parse bottom values", () => {
    expect(parseLayout("bottom-0")).toEqual({ bottom: 0 });
    expect(parseLayout("bottom-4")).toEqual({ bottom: 16 });
    expect(parseLayout("bottom-8")).toEqual({ bottom: 32 });
    expect(parseLayout("bottom-16")).toEqual({ bottom: 64 });
  });

  it("should parse left values", () => {
    expect(parseLayout("left-0")).toEqual({ left: 0 });
    expect(parseLayout("left-4")).toEqual({ left: 16 });
    expect(parseLayout("left-8")).toEqual({ left: 32 });
    expect(parseLayout("left-16")).toEqual({ left: 64 });
  });

  it("should parse fractional positioning values", () => {
    expect(parseLayout("top-0.5")).toEqual({ top: 2 });
    expect(parseLayout("right-1.5")).toEqual({ right: 6 });
    expect(parseLayout("bottom-2.5")).toEqual({ bottom: 10 });
    expect(parseLayout("left-3.5")).toEqual({ left: 14 });
  });

  it("should parse auto positioning values as empty object", () => {
    // Auto removes the property, which is useful for responsive overrides
    expect(parseLayout("top-auto")).toEqual({});
    expect(parseLayout("right-auto")).toEqual({});
    expect(parseLayout("bottom-auto")).toEqual({});
    expect(parseLayout("left-auto")).toEqual({});
  });

  it("should parse arbitrary top values with pixels", () => {
    expect(parseLayout("top-[50px]")).toEqual({ top: 50 });
    expect(parseLayout("top-[100px]")).toEqual({ top: 100 });
    expect(parseLayout("top-[0px]")).toEqual({ top: 0 });
  });

  it("should parse arbitrary top values without unit (defaults to px)", () => {
    expect(parseLayout("top-[50]")).toEqual({ top: 50 });
    expect(parseLayout("top-[100]")).toEqual({ top: 100 });
  });

  it("should parse arbitrary top values with percentages", () => {
    expect(parseLayout("top-[25%]")).toEqual({ top: "25%" });
    expect(parseLayout("top-[50%]")).toEqual({ top: "50%" });
    expect(parseLayout("top-[10.5%]")).toEqual({ top: "10.5%" });
  });

  it("should parse negative arbitrary top values", () => {
    expect(parseLayout("top-[-10px]")).toEqual({ top: -10 });
    expect(parseLayout("top-[-50]")).toEqual({ top: -50 });
    expect(parseLayout("top-[-25%]")).toEqual({ top: "-25%" });
  });

  it("should parse arbitrary right values", () => {
    expect(parseLayout("right-[30px]")).toEqual({ right: 30 });
    expect(parseLayout("right-[20]")).toEqual({ right: 20 });
    expect(parseLayout("right-[15%]")).toEqual({ right: "15%" });
    expect(parseLayout("right-[-10px]")).toEqual({ right: -10 });
  });

  it("should parse arbitrary bottom values", () => {
    expect(parseLayout("bottom-[40px]")).toEqual({ bottom: 40 });
    expect(parseLayout("bottom-[25]")).toEqual({ bottom: 25 });
    expect(parseLayout("bottom-[33.333%]")).toEqual({ bottom: "33.333%" });
    expect(parseLayout("bottom-[-15px]")).toEqual({ bottom: -15 });
  });

  it("should parse arbitrary left values", () => {
    expect(parseLayout("left-[60px]")).toEqual({ left: 60 });
    expect(parseLayout("left-[45]")).toEqual({ left: 45 });
    expect(parseLayout("left-[12.5%]")).toEqual({ left: "12.5%" });
    expect(parseLayout("left-[-20px]")).toEqual({ left: -20 });
  });

  it("should parse negative positioning prefixes", () => {
    // Standard spacing scale
    expect(parseLayout("-top-1")).toEqual({ top: -4 });
    expect(parseLayout("-top-4")).toEqual({ top: -16 });
    expect(parseLayout("-right-1")).toEqual({ right: -4 });
    expect(parseLayout("-right-2")).toEqual({ right: -8 });
    expect(parseLayout("-bottom-4")).toEqual({ bottom: -16 });
    expect(parseLayout("-bottom-8")).toEqual({ bottom: -32 });
    expect(parseLayout("-left-2")).toEqual({ left: -8 });
    expect(parseLayout("-left-4")).toEqual({ left: -16 });
  });

  it("should parse negative positioning with fractional values", () => {
    expect(parseLayout("-top-0.5")).toEqual({ top: -2 });
    expect(parseLayout("-right-1.5")).toEqual({ right: -6 });
    expect(parseLayout("-bottom-2.5")).toEqual({ bottom: -10 });
    expect(parseLayout("-left-3.5")).toEqual({ left: -14 });
  });

  it("should parse negative positioning with arbitrary values", () => {
    expect(parseLayout("-top-[10px]")).toEqual({ top: -10 });
    expect(parseLayout("-right-[20px]")).toEqual({ right: -20 });
    expect(parseLayout("-bottom-[30]")).toEqual({ bottom: -30 });
    expect(parseLayout("-left-[40px]")).toEqual({ left: -40 });
  });

  it("should parse negative positioning with arbitrary percentages", () => {
    expect(parseLayout("-top-[10%]")).toEqual({ top: "-10%" });
    expect(parseLayout("-right-[25%]")).toEqual({ right: "-25%" });
    expect(parseLayout("-bottom-[50%]")).toEqual({ bottom: "-50%" });
    expect(parseLayout("-left-[100%]")).toEqual({ left: "-100%" });
  });
});

describe("parseLayout - inset utilities", () => {
  it("should parse inset (all sides) values", () => {
    expect(parseLayout("inset-0")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(parseLayout("inset-4")).toEqual({ top: 16, right: 16, bottom: 16, left: 16 });
    expect(parseLayout("inset-8")).toEqual({ top: 32, right: 32, bottom: 32, left: 32 });
  });

  it("should parse inset-x (horizontal) values", () => {
    expect(parseLayout("inset-x-0")).toEqual({ left: 0, right: 0 });
    expect(parseLayout("inset-x-4")).toEqual({ left: 16, right: 16 });
    expect(parseLayout("inset-x-8")).toEqual({ left: 32, right: 32 });
  });

  it("should parse inset-y (vertical) values", () => {
    expect(parseLayout("inset-y-0")).toEqual({ top: 0, bottom: 0 });
    expect(parseLayout("inset-y-4")).toEqual({ top: 16, bottom: 16 });
    expect(parseLayout("inset-y-8")).toEqual({ top: 32, bottom: 32 });
  });

  it("should parse fractional inset values", () => {
    expect(parseLayout("inset-0.5")).toEqual({ top: 2, right: 2, bottom: 2, left: 2 });
    expect(parseLayout("inset-x-1.5")).toEqual({ left: 6, right: 6 });
    expect(parseLayout("inset-y-2.5")).toEqual({ top: 10, bottom: 10 });
  });

  it("should return null for invalid inset values", () => {
    expect(parseLayout("inset-100")).toBeNull();
    expect(parseLayout("inset-x-100")).toBeNull();
    expect(parseLayout("inset-y-100")).toBeNull();
  });

  it("should parse arbitrary inset (all sides) values with pixels", () => {
    expect(parseLayout("inset-[10px]")).toEqual({ top: 10, right: 10, bottom: 10, left: 10 });
    expect(parseLayout("inset-[25px]")).toEqual({ top: 25, right: 25, bottom: 25, left: 25 });
    expect(parseLayout("inset-[0px]")).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
  });

  it("should parse arbitrary inset values without unit (defaults to px)", () => {
    expect(parseLayout("inset-[15]")).toEqual({ top: 15, right: 15, bottom: 15, left: 15 });
    expect(parseLayout("inset-[30]")).toEqual({ top: 30, right: 30, bottom: 30, left: 30 });
  });

  it("should parse arbitrary inset values with percentages", () => {
    expect(parseLayout("inset-[10%]")).toEqual({ top: "10%", right: "10%", bottom: "10%", left: "10%" });
    expect(parseLayout("inset-[25%]")).toEqual({ top: "25%", right: "25%", bottom: "25%", left: "25%" });
    expect(parseLayout("inset-[5.5%]")).toEqual({ top: "5.5%", right: "5.5%", bottom: "5.5%", left: "5.5%" });
  });

  it("should parse arbitrary inset-x (horizontal) values", () => {
    expect(parseLayout("inset-x-[20px]")).toEqual({ left: 20, right: 20 });
    expect(parseLayout("inset-x-[15]")).toEqual({ left: 15, right: 15 });
    expect(parseLayout("inset-x-[10%]")).toEqual({ left: "10%", right: "10%" });
  });

  it("should parse arbitrary inset-y (vertical) values", () => {
    expect(parseLayout("inset-y-[30px]")).toEqual({ top: 30, bottom: 30 });
    expect(parseLayout("inset-y-[25]")).toEqual({ top: 25, bottom: 25 });
    expect(parseLayout("inset-y-[15%]")).toEqual({ top: "15%", bottom: "15%" });
  });

  it("should parse negative arbitrary inset values", () => {
    expect(parseLayout("inset-[-5px]")).toEqual({ top: -5, right: -5, bottom: -5, left: -5 });
    expect(parseLayout("inset-x-[-10px]")).toEqual({ left: -10, right: -10 });
    expect(parseLayout("inset-y-[-15px]")).toEqual({ top: -15, bottom: -15 });
    expect(parseLayout("inset-[-20%]")).toEqual({ top: "-20%", right: "-20%", bottom: "-20%", left: "-20%" });
  });
});

describe("parseLayout - specific property coverage", () => {
  it("should return unique objects for each class", () => {
    const flex1 = parseLayout("flex");
    const flex2 = parseLayout("flex");
    // Should be equal in value but not necessarily same reference
    expect(flex1).toEqual(flex2);
  });

  it("should handle flex value variations", () => {
    expect(parseLayout("flex-1")).toEqual({ flex: 1 });
    expect(parseLayout("flex-auto")).toEqual({ flex: 1 });
    expect(parseLayout("flex-none")).toEqual({ flex: 0 });
  });

  it("should distinguish between similar class names", () => {
    expect(parseLayout("flex")).not.toEqual(parseLayout("flex-1"));
    expect(parseLayout("grow")).not.toEqual(parseLayout("grow-0"));
    expect(parseLayout("shrink")).not.toEqual(parseLayout("shrink-0"));
  });

  it("should handle positioning with absolute/relative", () => {
    // Common pattern: absolute + top/left
    expect(parseLayout("absolute")).toEqual({ position: "absolute" });
    expect(parseLayout("top-0")).toEqual({ top: 0 });
    expect(parseLayout("left-0")).toEqual({ left: 0 });
  });

  it("should handle all positioning directions", () => {
    expect(parseLayout("top-4")).toHaveProperty("top");
    expect(parseLayout("right-4")).toHaveProperty("right");
    expect(parseLayout("bottom-4")).toHaveProperty("bottom");
    expect(parseLayout("left-4")).toHaveProperty("left");
  });

  it("should handle inset shorthand variations", () => {
    const insetAll = parseLayout("inset-4");
    expect(insetAll).toHaveProperty("top", 16);
    expect(insetAll).toHaveProperty("right", 16);
    expect(insetAll).toHaveProperty("bottom", 16);
    expect(insetAll).toHaveProperty("left", 16);

    const insetX = parseLayout("inset-x-4");
    expect(insetX).toHaveProperty("left", 16);
    expect(insetX).toHaveProperty("right", 16);
    expect(insetX).not.toHaveProperty("top");
    expect(insetX).not.toHaveProperty("bottom");

    const insetY = parseLayout("inset-y-4");
    expect(insetY).toHaveProperty("top", 16);
    expect(insetY).toHaveProperty("bottom", 16);
    expect(insetY).not.toHaveProperty("left");
    expect(insetY).not.toHaveProperty("right");
  });
});

describe("parseLayout - logical positioning (RTL-aware)", () => {
  it("should parse start positioning with preset values", () => {
    expect(parseLayout("start-0")).toEqual({ start: 0 });
    expect(parseLayout("start-4")).toEqual({ start: 16 });
    expect(parseLayout("start-8")).toEqual({ start: 32 });
    expect(parseLayout("start-0.5")).toEqual({ start: 2 });
    expect(parseLayout("start-2.5")).toEqual({ start: 10 });
  });

  it("should parse end positioning with preset values", () => {
    expect(parseLayout("end-0")).toEqual({ end: 0 });
    expect(parseLayout("end-4")).toEqual({ end: 16 });
    expect(parseLayout("end-8")).toEqual({ end: 32 });
    expect(parseLayout("end-0.5")).toEqual({ end: 2 });
    expect(parseLayout("end-2.5")).toEqual({ end: 10 });
  });

  it("should parse start/end with arbitrary pixel values", () => {
    expect(parseLayout("start-[10px]")).toEqual({ start: 10 });
    expect(parseLayout("start-[50]")).toEqual({ start: 50 });
    expect(parseLayout("end-[10px]")).toEqual({ end: 10 });
    expect(parseLayout("end-[50]")).toEqual({ end: 50 });
  });

  it("should parse start/end with arbitrary percentage values", () => {
    expect(parseLayout("start-[10%]")).toEqual({ start: "10%" });
    expect(parseLayout("start-[50%]")).toEqual({ start: "50%" });
    expect(parseLayout("end-[10%]")).toEqual({ end: "10%" });
    expect(parseLayout("end-[50%]")).toEqual({ end: "50%" });
  });

  it("should parse negative start/end with preset values", () => {
    expect(parseLayout("-start-4")).toEqual({ start: -16 });
    expect(parseLayout("-start-8")).toEqual({ start: -32 });
    expect(parseLayout("-end-4")).toEqual({ end: -16 });
    expect(parseLayout("-end-8")).toEqual({ end: -32 });
  });

  it("should parse negative start/end with arbitrary values", () => {
    expect(parseLayout("-start-[10px]")).toEqual({ start: -10 });
    expect(parseLayout("-start-[50]")).toEqual({ start: -50 });
    expect(parseLayout("-end-[10px]")).toEqual({ end: -10 });
    expect(parseLayout("-end-[50]")).toEqual({ end: -50 });
    expect(parseLayout("-start-[10%]")).toEqual({ start: "-10%" });
    expect(parseLayout("-end-[25%]")).toEqual({ end: "-25%" });
  });

  it("should handle auto value for start/end", () => {
    expect(parseLayout("start-auto")).toEqual({});
    expect(parseLayout("end-auto")).toEqual({});
  });
});

describe("parseLayout - logical inset (RTL-aware)", () => {
  it("should parse inset-s (start) with preset values", () => {
    expect(parseLayout("inset-s-0")).toEqual({ start: 0 });
    expect(parseLayout("inset-s-4")).toEqual({ start: 16 });
    expect(parseLayout("inset-s-8")).toEqual({ start: 32 });
  });

  it("should parse inset-e (end) with preset values", () => {
    expect(parseLayout("inset-e-0")).toEqual({ end: 0 });
    expect(parseLayout("inset-e-4")).toEqual({ end: 16 });
    expect(parseLayout("inset-e-8")).toEqual({ end: 32 });
  });

  it("should parse inset-s/inset-e with arbitrary values", () => {
    expect(parseLayout("inset-s-[10px]")).toEqual({ start: 10 });
    expect(parseLayout("inset-s-[20%]")).toEqual({ start: "20%" });
    expect(parseLayout("inset-e-[10px]")).toEqual({ end: 10 });
    expect(parseLayout("inset-e-[20%]")).toEqual({ end: "20%" });
  });
});

describe("parseLayout - custom spacing", () => {
  const customSpacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 32,
    xl: 64,
    "4": 20, // Override default (16)
  };

  it("should support custom spacing values for top/right/bottom/left", () => {
    expect(parseLayout("top-xs", customSpacing)).toEqual({ top: 4 });
    expect(parseLayout("top-sm", customSpacing)).toEqual({ top: 8 });
    expect(parseLayout("top-md", customSpacing)).toEqual({ top: 16 });
    expect(parseLayout("top-lg", customSpacing)).toEqual({ top: 32 });
    expect(parseLayout("top-xl", customSpacing)).toEqual({ top: 64 });

    expect(parseLayout("right-xs", customSpacing)).toEqual({ right: 4 });
    expect(parseLayout("bottom-sm", customSpacing)).toEqual({ bottom: 8 });
    expect(parseLayout("left-md", customSpacing)).toEqual({ left: 16 });
  });

  it("should override default spacing values", () => {
    // Without custom spacing, top-4 is 16
    expect(parseLayout("top-4")).toEqual({ top: 16 });

    // With custom spacing, top-4 is 20 (overridden)
    expect(parseLayout("top-4", customSpacing)).toEqual({ top: 20 });
  });

  it("should merge custom spacing with defaults", () => {
    // Custom spacing should merge with defaults
    // top-0 should still work (from defaults)
    expect(parseLayout("top-0", customSpacing)).toEqual({ top: 0 });

    // top-8 should still work (from defaults, not overridden)
    expect(parseLayout("top-8", customSpacing)).toEqual({ top: 32 });

    // top-xs should work (from custom)
    expect(parseLayout("top-xs", customSpacing)).toEqual({ top: 4 });
  });

  it("should support custom spacing for start/end (RTL-aware)", () => {
    expect(parseLayout("start-xs", customSpacing)).toEqual({ start: 4 });
    expect(parseLayout("end-lg", customSpacing)).toEqual({ end: 32 });
  });

  it("should support custom spacing for inset utilities", () => {
    expect(parseLayout("inset-xs", customSpacing)).toEqual({
      top: 4,
      right: 4,
      bottom: 4,
      left: 4,
    });

    expect(parseLayout("inset-x-sm", customSpacing)).toEqual({
      left: 8,
      right: 8,
    });

    expect(parseLayout("inset-y-md", customSpacing)).toEqual({
      top: 16,
      bottom: 16,
    });
  });

  it("should support custom spacing for inset-s/inset-e", () => {
    expect(parseLayout("inset-s-lg", customSpacing)).toEqual({ start: 32 });
    expect(parseLayout("inset-e-xl", customSpacing)).toEqual({ end: 64 });
  });

  it("should support negative values with custom spacing for positioning", () => {
    expect(parseLayout("-top-sm", customSpacing)).toEqual({ top: -8 });
    expect(parseLayout("-right-md", customSpacing)).toEqual({ right: -16 });
    expect(parseLayout("-bottom-lg", customSpacing)).toEqual({ bottom: -32 });
    expect(parseLayout("-left-xl", customSpacing)).toEqual({ left: -64 });
    expect(parseLayout("-start-sm", customSpacing)).toEqual({ start: -8 });
    expect(parseLayout("-end-md", customSpacing)).toEqual({ end: -16 });
  });

  it("should still support arbitrary values with custom spacing", () => {
    expect(parseLayout("top-[100px]", customSpacing)).toEqual({ top: 100 });
    expect(parseLayout("inset-[50%]", customSpacing)).toEqual({
      top: "50%",
      right: "50%",
      bottom: "50%",
      left: "50%",
    });
  });

  it("should handle non-layout classes as null", () => {
    expect(parseLayout("text-xl", customSpacing)).toBeNull();
    expect(parseLayout("bg-blue-500", customSpacing)).toBeNull();
  });
});
