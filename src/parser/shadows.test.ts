import { describe, expect, it } from "vitest";

import { applyOpacity } from "../utils/colorUtils";
import { SHADOW_COLORS, SHADOW_SCALE, parseShadow } from "./shadows";

describe("SHADOW_SCALE", () => {
  it("should export complete shadow scale", () => {
    expect(SHADOW_SCALE).toMatchSnapshot();
  });

  it("should have all shadow variants", () => {
    expect(SHADOW_SCALE).toHaveProperty("shadow-sm");
    expect(SHADOW_SCALE).toHaveProperty("shadow");
    expect(SHADOW_SCALE).toHaveProperty("shadow-md");
    expect(SHADOW_SCALE).toHaveProperty("shadow-lg");
    expect(SHADOW_SCALE).toHaveProperty("shadow-xl");
    expect(SHADOW_SCALE).toHaveProperty("shadow-2xl");
    expect(SHADOW_SCALE).toHaveProperty("shadow-none");
  });
});

describe("parseShadow - basic shadows", () => {
  it("should parse shadow-sm", () => {
    const result = parseShadow("shadow-sm");
    expect(result).toBeTruthy();
    expect(result).toHaveProperty("shadowColor");
    expect(result).toHaveProperty("shadowOffset");
    expect(result).toHaveProperty("shadowOpacity");
    expect(result).toHaveProperty("shadowRadius");
  });

  it("should parse default shadow", () => {
    const result = parseShadow("shadow");
    expect(result).toBeTruthy();
  });

  it("should parse shadow-md", () => {
    const result = parseShadow("shadow-md");
    expect(result).toBeTruthy();
  });

  it("should parse shadow-lg", () => {
    const result = parseShadow("shadow-lg");
    expect(result).toBeTruthy();
  });

  it("should parse shadow-xl", () => {
    const result = parseShadow("shadow-xl");
    expect(result).toBeTruthy();
  });

  it("should parse shadow-2xl", () => {
    const result = parseShadow("shadow-2xl");
    expect(result).toBeTruthy();
  });

  it("should parse shadow-none", () => {
    const result = parseShadow("shadow-none");
    expect(result).toBeTruthy();
    expect(result).toMatchObject({
      shadowColor: "transparent",
      shadowOpacity: 0,
      shadowRadius: 0,
    });
  });
});

describe("parseShadow - shadow properties (iOS)", () => {
  it("should have increasing shadow values for larger shadows", () => {
    const sm = parseShadow("shadow-sm");
    const md = parseShadow("shadow-md");
    const lg = parseShadow("shadow-lg");
    const xl = parseShadow("shadow-xl");
    const xxl = parseShadow("shadow-2xl");

    // Shadow opacity should increase
    expect(md?.shadowOpacity).toBeGreaterThan(sm?.shadowOpacity as number);
    expect(lg?.shadowOpacity).toBeGreaterThan(md?.shadowOpacity as number);

    // Shadow radius should increase
    expect(md?.shadowRadius).toBeGreaterThan(sm?.shadowRadius as number);
    expect(lg?.shadowRadius).toBeGreaterThan(md?.shadowRadius as number);
    expect(xl?.shadowRadius).toBeGreaterThan(lg?.shadowRadius as number);
    expect(xxl?.shadowRadius).toBeGreaterThan(xl?.shadowRadius as number);
  });

  it("should use consistent shadow color", () => {
    const shadows = ["shadow-sm", "shadow", "shadow-md", "shadow-lg", "shadow-xl", "shadow-2xl"];

    shadows.forEach((shadow) => {
      const result = parseShadow(shadow);
      expect(result?.shadowColor).toBe("#000000");
    });
  });

  it("should have proper shadowOffset structure", () => {
    const result = parseShadow("shadow");
    const shadowOffset = result?.shadowOffset;
    expect(shadowOffset).toHaveProperty("width");
    expect(shadowOffset).toHaveProperty("height");
    expect(typeof (shadowOffset as { width: number; height: number }).width).toBe("number");
    expect(typeof (shadowOffset as { width: number; height: number }).height).toBe("number");
  });

  it("should include both iOS shadow and Android elevation properties", () => {
    const result = parseShadow("shadow");
    // iOS properties
    expect(result).toHaveProperty("shadowColor");
    expect(result).toHaveProperty("shadowOffset");
    expect(result).toHaveProperty("shadowOpacity");
    expect(result).toHaveProperty("shadowRadius");
    // Android property
    expect(result).toHaveProperty("elevation");
  });
});

describe("parseShadow - shadow properties (Android)", () => {
  it("should have increasing elevation values for larger shadows", () => {
    const sm = parseShadow("shadow-sm");
    const md = parseShadow("shadow-md");
    const lg = parseShadow("shadow-lg");
    const xl = parseShadow("shadow-xl");
    const xxl = parseShadow("shadow-2xl");

    // Elevation should increase
    expect(md?.elevation).toBeGreaterThan(sm?.elevation as number);
    expect(lg?.elevation).toBeGreaterThan(md?.elevation as number);
    expect(xl?.elevation).toBeGreaterThan(lg?.elevation as number);
    expect(xxl?.elevation).toBeGreaterThan(xl?.elevation as number);
  });

  it("should include elevation property for Android", () => {
    const result = parseShadow("shadow");
    expect(result).toHaveProperty("elevation");
    expect(typeof result?.elevation).toBe("number");
  });
});

describe("parseShadow - invalid classes", () => {
  it("should return null for invalid shadow classes", () => {
    expect(parseShadow("shadow-invalidcolor")).toBeNull();
    expect(parseShadow("shadows")).toBeNull();
    expect(parseShadow("shadow-")).toBeNull();
    expect(parseShadow("shadow-small")).toBeNull();
    expect(parseShadow("shadow-3xl")).toBeNull();
  });

  it("should return null for non-shadow classes", () => {
    expect(parseShadow("bg-blue-500")).toBeNull();
    expect(parseShadow("p-4")).toBeNull();
    expect(parseShadow("text-white")).toBeNull();
    expect(parseShadow("border-2")).toBeNull();
  });

  it("should return null for empty or invalid input", () => {
    expect(parseShadow("")).toBeNull();
    expect(parseShadow("shadow123")).toBeNull();
  });
});

describe("parseShadow - comprehensive coverage", () => {
  it("should parse all shadow variants without errors", () => {
    const variants = [
      "shadow-sm",
      "shadow",
      "shadow-md",
      "shadow-lg",
      "shadow-xl",
      "shadow-2xl",
      "shadow-none",
    ];

    variants.forEach((variant) => {
      const result = parseShadow(variant);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("object");
    });
  });

  it("should return consistent results for same input", () => {
    const result1 = parseShadow("shadow-md");
    const result2 = parseShadow("shadow-md");
    expect(result1).toEqual(result2);
  });

  it("should handle case-sensitive class names", () => {
    // Shadow classes are case-sensitive
    expect(parseShadow("SHADOW")).toBeNull();
    expect(parseShadow("Shadow-md")).toBeNull();
    expect(parseShadow("shadow-MD")).toBeNull();
  });
});

describe("parseShadow - shadow colors", () => {
  it("should parse shadow color with preset colors", () => {
    expect(parseShadow("shadow-red-500")).toEqual({ shadowColor: SHADOW_COLORS["red-500"] });
    expect(parseShadow("shadow-blue-800")).toEqual({ shadowColor: SHADOW_COLORS["blue-800"] });
    expect(parseShadow("shadow-green-600")).toEqual({ shadowColor: SHADOW_COLORS["green-600"] });
  });

  it("should parse shadow color with basic colors", () => {
    expect(parseShadow("shadow-black")).toEqual({ shadowColor: SHADOW_COLORS.black });
    expect(parseShadow("shadow-white")).toEqual({ shadowColor: SHADOW_COLORS.white });
    expect(parseShadow("shadow-transparent")).toEqual({ shadowColor: "transparent" });
  });

  it("should parse shadow color with opacity modifier", () => {
    expect(parseShadow("shadow-red-500/50")).toEqual({
      shadowColor: applyOpacity(SHADOW_COLORS["red-500"], 50),
    });
    expect(parseShadow("shadow-blue-800/80")).toEqual({
      shadowColor: applyOpacity(SHADOW_COLORS["blue-800"], 80),
    });
    expect(parseShadow("shadow-black/25")).toEqual({
      shadowColor: applyOpacity(SHADOW_COLORS.black, 25),
    });
    expect(parseShadow("shadow-white/0")).toEqual({
      shadowColor: applyOpacity(SHADOW_COLORS.white, 0),
    });
    expect(parseShadow("shadow-green-500/100")).toEqual({
      shadowColor: applyOpacity(SHADOW_COLORS["green-500"], 100),
    });
  });

  it("should parse shadow color with arbitrary hex values", () => {
    expect(parseShadow("shadow-[#ff0000]")).toEqual({ shadowColor: "#ff0000" });
    expect(parseShadow("shadow-[#00ff00]")).toEqual({ shadowColor: "#00ff00" });
    expect(parseShadow("shadow-[#0000ff]")).toEqual({ shadowColor: "#0000ff" });
  });

  it("should parse shadow color with 3-digit hex values", () => {
    expect(parseShadow("shadow-[#f00]")).toEqual({ shadowColor: "#ff0000" });
    expect(parseShadow("shadow-[#0f0]")).toEqual({ shadowColor: "#00ff00" });
    expect(parseShadow("shadow-[#00f]")).toEqual({ shadowColor: "#0000ff" });
  });

  it("should parse shadow color with arbitrary hex and opacity", () => {
    // When opacity is applied, the color is uppercased for consistency
    expect(parseShadow("shadow-[#ff0000]/50")).toEqual({ shadowColor: "#FF000080" });
    expect(parseShadow("shadow-[#00ff00]/25")).toEqual({ shadowColor: "#00FF0040" });
    expect(parseShadow("shadow-[#0000ff]/80")).toEqual({ shadowColor: "#0000FFCC" });
  });

  it("should parse shadow color with 8-digit hex (with alpha)", () => {
    expect(parseShadow("shadow-[#ff000080]")).toEqual({ shadowColor: "#ff000080" });
    expect(parseShadow("shadow-[#00ff00cc]")).toEqual({ shadowColor: "#00ff00cc" });
  });

  it("should handle transparent with opacity modifier", () => {
    // Transparent should remain transparent even with opacity
    expect(parseShadow("shadow-transparent/50")).toEqual({ shadowColor: "transparent" });
  });

  it("should return null for invalid opacity values", () => {
    expect(parseShadow("shadow-red-500/101")).toBeNull();
    expect(parseShadow("shadow-red-500/-1")).toBeNull();
    expect(parseShadow("shadow-red-500/abc")).toBeNull();
  });

  it("should return null for invalid color names", () => {
    expect(parseShadow("shadow-notacolor")).toBeNull();
    expect(parseShadow("shadow-foobar-500")).toBeNull();
    expect(parseShadow("shadow-red-999")).toBeNull();
  });
});

describe("parseShadow - shadow colors with custom colors", () => {
  const customColors = {
    brand: "#FF5733",
    "brand-primary": "#3498DB",
    "brand-secondary": "#2ECC71",
  };

  it("should parse shadow with custom colors", () => {
    expect(parseShadow("shadow-brand", customColors)).toEqual({ shadowColor: "#FF5733" });
    expect(parseShadow("shadow-brand-primary", customColors)).toEqual({ shadowColor: "#3498DB" });
    expect(parseShadow("shadow-brand-secondary", customColors)).toEqual({ shadowColor: "#2ECC71" });
  });

  it("should parse shadow with custom colors and opacity", () => {
    expect(parseShadow("shadow-brand/50", customColors)).toEqual({ shadowColor: "#FF573380" });
    expect(parseShadow("shadow-brand-primary/80", customColors)).toEqual({ shadowColor: "#3498DBCC" });
  });

  it("should still support preset colors with custom colors", () => {
    expect(parseShadow("shadow-red-500", customColors)).toEqual({ shadowColor: SHADOW_COLORS["red-500"] });
    expect(parseShadow("shadow-blue-800/50", customColors)).toEqual({
      shadowColor: applyOpacity(SHADOW_COLORS["blue-800"], 50),
    });
  });

  it("should allow custom colors to override presets", () => {
    const overrideColors = {
      "red-500": "#CUSTOM1",
    };
    expect(parseShadow("shadow-red-500", overrideColors)).toEqual({ shadowColor: "#CUSTOM1" });
  });
});
