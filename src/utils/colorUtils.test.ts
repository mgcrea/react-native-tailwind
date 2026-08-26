import { describe, expect, it } from "vitest";

import {
  COLORS,
  applyOpacity,
  parseArbitraryColor,
  parseColorOpacityModifier,
  parseColorValue,
} from "./colorUtils";

describe("COLORS", () => {
  it("should include basic colors", () => {
    expect(COLORS.white).toBe("#FFFFFF");
    expect(COLORS.black).toBe("#000000");
    expect(COLORS.transparent).toBe("transparent");
  });

  it("should include flattened Tailwind colors", () => {
    expect(COLORS["red-500"]).toBeDefined();
    expect(COLORS["blue-500"]).toBeDefined();
    expect(COLORS["green-500"]).toBeDefined();
    expect(COLORS["gray-100"]).toBeDefined();
    expect(COLORS["gray-900"]).toBeDefined();
  });
});

describe("applyOpacity", () => {
  it("should apply opacity to 6-digit hex colors", () => {
    expect(applyOpacity("#ff0000", 50)).toBe("#FF000080");
    expect(applyOpacity("#00ff00", 100)).toBe("#00FF00FF");
    expect(applyOpacity("#0000ff", 0)).toBe("#0000FF00");
  });

  it("should apply opacity to 3-digit hex colors", () => {
    expect(applyOpacity("#f00", 50)).toBe("#FF000080");
    expect(applyOpacity("#0f0", 25)).toBe("#00FF0040");
    expect(applyOpacity("#00f", 75)).toBe("#0000FFBF");
  });

  it("should multiply existing alpha on 8-digit hex colors", () => {
    expect(applyOpacity("#ff000080", 50)).toBe("#FF000040");
    expect(applyOpacity("#edecf7af", 25)).toBe("#EDECF72C");
    expect(applyOpacity("#edecf7af", 100)).toBe("#EDECF7AF");
  });

  it("should handle various opacity values", () => {
    expect(applyOpacity("#000000", 0)).toBe("#00000000");
    expect(applyOpacity("#000000", 25)).toBe("#00000040");
    expect(applyOpacity("#000000", 50)).toBe("#00000080");
    expect(applyOpacity("#000000", 75)).toBe("#000000BF");
    expect(applyOpacity("#000000", 80)).toBe("#000000CC");
    expect(applyOpacity("#000000", 100)).toBe("#000000FF");
  });

  it("should return transparent unchanged", () => {
    expect(applyOpacity("transparent", 50)).toBe("transparent");
    expect(applyOpacity("transparent", 0)).toBe("transparent");
    expect(applyOpacity("transparent", 100)).toBe("transparent");
  });

  it("should uppercase the output", () => {
    expect(applyOpacity("#aabbcc", 50)).toBe("#AABBCC80");
    expect(applyOpacity("#AbCdEf", 50)).toBe("#ABCDEF80");
  });
});

describe("parseColorOpacityModifier", () => {
  it("should parse named percentages and arbitrary alpha values", () => {
    expect(parseColorOpacityModifier("card/35")).toEqual({
      baseColorKey: "card",
      opacity: 35,
      suffix: "/35",
    });
    expect(parseColorOpacityModifier("card/[.37]")).toEqual({
      baseColorKey: "card",
      opacity: 37,
      suffix: "/[.37]",
    });
    expect(parseColorOpacityModifier("card/[37%]")).toEqual({
      baseColorKey: "card",
      opacity: 37,
      suffix: "/[37%]",
    });
  });

  it("should preserve recognized but out-of-range modifiers for validation", () => {
    expect(parseColorOpacityModifier("card/101")).toEqual({
      baseColorKey: "card",
      opacity: null,
      suffix: "/101",
    });
    expect(parseColorOpacityModifier("card/[1.1]")).toEqual({
      baseColorKey: "card",
      opacity: null,
      suffix: "/[1.1]",
    });
  });
});

describe("parseArbitraryColor", () => {
  it("should parse 6-digit hex colors", () => {
    expect(parseArbitraryColor("[#ff0000]")).toBe("#ff0000");
    expect(parseArbitraryColor("[#00ff00]")).toBe("#00ff00");
    expect(parseArbitraryColor("[#0000ff]")).toBe("#0000ff");
    expect(parseArbitraryColor("[#AABBCC]")).toBe("#AABBCC");
  });

  it("should parse and expand 3-digit hex colors", () => {
    expect(parseArbitraryColor("[#f00]")).toBe("#ff0000");
    expect(parseArbitraryColor("[#0f0]")).toBe("#00ff00");
    expect(parseArbitraryColor("[#00f]")).toBe("#0000ff");
    expect(parseArbitraryColor("[#ABC]")).toBe("#AABBCC");
  });

  it("should parse 8-digit hex colors (with alpha)", () => {
    expect(parseArbitraryColor("[#ff000080]")).toBe("#ff000080");
    expect(parseArbitraryColor("[#00ff00cc]")).toBe("#00ff00cc");
    expect(parseArbitraryColor("[#AABBCCDD]")).toBe("#AABBCCDD");
  });

  it("should preserve input case", () => {
    expect(parseArbitraryColor("[#aabbcc]")).toBe("#aabbcc");
    expect(parseArbitraryColor("[#AABBCC]")).toBe("#AABBCC");
    expect(parseArbitraryColor("[#AaBbCc]")).toBe("#AaBbCc");
  });

  it("should return null for invalid formats", () => {
    expect(parseArbitraryColor("[#gg0000]")).toBeNull();
    expect(parseArbitraryColor("[#ff00]")).toBeNull();
    expect(parseArbitraryColor("[#ff00000]")).toBeNull();
    expect(parseArbitraryColor("[ff0000]")).toBeNull();
    expect(parseArbitraryColor("#ff0000")).toBeNull();
    expect(parseArbitraryColor("[rgb(255,0,0)]")).toBeNull();
    expect(parseArbitraryColor("")).toBeNull();
    expect(parseArbitraryColor("[]")).toBeNull();
  });
});

describe("parseColorValue", () => {
  describe("preset colors", () => {
    it("should parse preset color names", () => {
      expect(parseColorValue("red-500")).toBe(COLORS["red-500"]);
      expect(parseColorValue("blue-800")).toBe(COLORS["blue-800"]);
      expect(parseColorValue("green-600")).toBe(COLORS["green-600"]);
    });

    it("should parse basic colors", () => {
      expect(parseColorValue("black")).toBe("#000000");
      expect(parseColorValue("white")).toBe("#FFFFFF");
      expect(parseColorValue("transparent")).toBe("transparent");
    });

    it("should return null for invalid color names", () => {
      expect(parseColorValue("notacolor")).toBeNull();
      expect(parseColorValue("red-999")).toBeNull();
      expect(parseColorValue("foobar-500")).toBeNull();
    });
  });

  describe("arbitrary colors", () => {
    it("should parse arbitrary hex colors", () => {
      expect(parseColorValue("[#ff0000]")).toBe("#ff0000");
      expect(parseColorValue("[#00ff00]")).toBe("#00ff00");
      expect(parseColorValue("[#0000ff]")).toBe("#0000ff");
    });

    it("should parse 3-digit arbitrary hex colors", () => {
      expect(parseColorValue("[#f00]")).toBe("#ff0000");
      expect(parseColorValue("[#0f0]")).toBe("#00ff00");
      expect(parseColorValue("[#00f]")).toBe("#0000ff");
    });

    it("should parse 8-digit arbitrary hex colors", () => {
      expect(parseColorValue("[#ff000080]")).toBe("#ff000080");
      expect(parseColorValue("[#00ff00cc]")).toBe("#00ff00cc");
    });
  });

  describe("opacity modifier", () => {
    it("should apply opacity to preset colors", () => {
      expect(parseColorValue("red-500/50")).toBe(applyOpacity(COLORS["red-500"], 50));
      expect(parseColorValue("blue-800/80")).toBe(applyOpacity(COLORS["blue-800"], 80));
      expect(parseColorValue("black/25")).toBe(applyOpacity("#000000", 25));
    });

    it("should apply opacity to arbitrary colors", () => {
      expect(parseColorValue("[#ff0000]/50")).toBe("#FF000080");
      expect(parseColorValue("[#00ff00]/25")).toBe("#00FF0040");
      expect(parseColorValue("[#0000ff]/80")).toBe("#0000FFCC");
    });

    it("should apply arbitrary raw and percentage opacity values", () => {
      expect(parseColorValue("red-500/[.37]")).toBe(applyOpacity(COLORS["red-500"], 37));
      expect(parseColorValue("black/[37%]")).toBe("#0000005E");
      expect(parseColorValue("[#ff0000]/[.5]")).toBe("#FF000080");
    });

    it("should compose opacity with colors that already have alpha", () => {
      expect(parseColorValue("[#ff000080]/50")).toBe("#FF000040");
      expect(parseColorValue("translucent/[.25]", { translucent: "#edecf7af" })).toBe("#EDECF72C");
    });

    it("should handle edge opacity values", () => {
      expect(parseColorValue("red-500/0")).toBe(applyOpacity(COLORS["red-500"], 0));
      expect(parseColorValue("red-500/100")).toBe(applyOpacity(COLORS["red-500"], 100));
    });

    it("should return null for invalid opacity values", () => {
      expect(parseColorValue("red-500/101")).toBeNull();
      expect(parseColorValue("red-500/-1")).toBeNull();
      expect(parseColorValue("red-500/abc")).toBeNull();
      expect(parseColorValue("red-500/[1.1]")).toBeNull();
      expect(parseColorValue("red-500/[101%]")).toBeNull();
    });

    it("should keep transparent unchanged with opacity", () => {
      expect(parseColorValue("transparent/50")).toBe("transparent");
      expect(parseColorValue("transparent/0")).toBe("transparent");
    });
  });

  describe("custom colors", () => {
    const customColors = {
      brand: "#FF5733",
      "brand-primary": "#3498DB",
      "brand-secondary": "#2ECC71",
    };

    it("should parse custom colors", () => {
      expect(parseColorValue("brand", customColors)).toBe("#FF5733");
      expect(parseColorValue("brand-primary", customColors)).toBe("#3498DB");
      expect(parseColorValue("brand-secondary", customColors)).toBe("#2ECC71");
    });

    it("should apply opacity to custom colors", () => {
      expect(parseColorValue("brand/50", customColors)).toBe("#FF573380");
      expect(parseColorValue("brand-primary/80", customColors)).toBe("#3498DBCC");
    });

    it("should still support preset colors with custom colors", () => {
      expect(parseColorValue("red-500", customColors)).toBe(COLORS["red-500"]);
      expect(parseColorValue("blue-800/50", customColors)).toBe(applyOpacity(COLORS["blue-800"], 50));
    });

    it("should allow custom colors to override presets", () => {
      const overrideColors = {
        "red-500": "#CUSTOM1",
      };
      expect(parseColorValue("red-500", overrideColors)).toBe("#CUSTOM1");
    });
  });
});
