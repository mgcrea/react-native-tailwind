import { describe, expect, it } from "vitest";

import { generateStyleKey } from "./styleKey";

describe("generateStyleKey", () => {
  it("should generate key with leading underscore", () => {
    expect(generateStyleKey("m-4")).toBe("_m_4");
    expect(generateStyleKey("p-2")).toBe("_p_2");
    expect(generateStyleKey("bg-blue-500")).toBe("_bg_blue_500");
  });

  it("should sort classes alphabetically for consistency", () => {
    expect(generateStyleKey("m-4 p-2")).toBe(generateStyleKey("p-2 m-4"));
    expect(generateStyleKey("bg-blue-500 text-white")).toBe(generateStyleKey("text-white bg-blue-500"));
    expect(generateStyleKey("flex items-center justify-center")).toBe(
      generateStyleKey("justify-center flex items-center"),
    );
  });

  it("should handle single class", () => {
    expect(generateStyleKey("flex")).toBe("_flex");
    expect(generateStyleKey("hidden")).toBe("_hidden");
    expect(generateStyleKey("absolute")).toBe("_absolute");
  });

  it("should handle multiple classes", () => {
    expect(generateStyleKey("m-4 p-2 bg-blue-500")).toBe("_bg_blue_500_m_4_p_2");
    expect(generateStyleKey("flex items-center justify-center")).toBe("_flex_items_center_justify_center");
  });

  it("should replace special characters with underscores", () => {
    expect(generateStyleKey("bg-[#ff0000]")).toBe("_bg_ff0000_");
    expect(generateStyleKey("text-[14px]")).toBe("_text_14px_");
    expect(generateStyleKey("m-[16px]")).toBe("_m_16px_");
  });

  it("should collapse multiple underscores", () => {
    expect(generateStyleKey("bg-[#ff0000]")).toBe("_bg_ff0000_");
    expect(generateStyleKey("w-[100%]")).toBe("_w_100_");
  });

  it("should handle classes with hyphens", () => {
    expect(generateStyleKey("bg-blue-500")).toBe("_bg_blue_500");
    expect(generateStyleKey("text-gray-700")).toBe("_text_gray_700");
    expect(generateStyleKey("border-red-300")).toBe("_border_red_300");
  });

  it("should handle classes with numbers", () => {
    expect(generateStyleKey("m-4")).toBe("_m_4");
    expect(generateStyleKey("p-8")).toBe("_p_8");
    expect(generateStyleKey("gap-96")).toBe("_gap_96");
    expect(generateStyleKey("text-2xl")).toBe("_text_2xl");
  });

  it("should handle classes with decimals", () => {
    expect(generateStyleKey("m-0.5")).toBe("_m_0_5");
    expect(generateStyleKey("p-1.5")).toBe("_p_1_5");
    expect(generateStyleKey("gap-2.5")).toBe("_gap_2_5");
  });

  it("should handle empty string", () => {
    expect(generateStyleKey("")).toBe("_");
  });

  it("should handle whitespace-only string", () => {
    expect(generateStyleKey("   ")).toBe("_");
    expect(generateStyleKey("\t\n")).toBe("_");
  });

  it("should handle multiple consecutive spaces", () => {
    expect(generateStyleKey("m-4  p-2   bg-blue-500")).toBe("_bg_blue_500_m_4_p_2");
    expect(generateStyleKey("flex    items-center")).toBe("_flex_items_center");
  });

  it("should handle leading and trailing spaces", () => {
    expect(generateStyleKey("  m-4 p-2  ")).toBe("_m_4_p_2");
    expect(generateStyleKey("\tflex items-center\n")).toBe("_flex_items_center");
  });

  it("should handle opacity modifiers", () => {
    expect(generateStyleKey("bg-black/50")).toBe("_bg_black_50");
    expect(generateStyleKey("text-white/80")).toBe("_text_white_80");
    expect(generateStyleKey("border-blue-500/30")).toBe("_border_blue_500_30");
  });

  it("should handle state modifiers", () => {
    expect(generateStyleKey("active:bg-blue-700")).toBe("_active_bg_blue_700");
    expect(generateStyleKey("focus:border-blue-500")).toBe("_focus_border_blue_500");
    expect(generateStyleKey("disabled:opacity-50")).toBe("_disabled_opacity_50");
  });

  it("should handle complex combinations", () => {
    expect(generateStyleKey("m-4 p-2 bg-blue-500 text-white rounded-lg")).toBe(
      "_bg_blue_500_m_4_p_2_rounded_lg_text_white",
    );
    expect(generateStyleKey("flex items-center justify-between p-4 bg-gray-100 border-b-2")).toBe(
      "_bg_gray_100_border_b_2_flex_items_center_justify_between_p_4",
    );
  });

  it("should handle arbitrary values in complex scenarios", () => {
    expect(generateStyleKey("m-[16px] p-[8px] bg-[#ff0000]")).toBe("_bg_ff0000_m_16px_p_8px_");
    expect(generateStyleKey("w-[100%] h-[50px] text-[14px]")).toBe("_h_50px_text_14px_w_100_");
  });

  it("should produce consistent keys regardless of class order", () => {
    const combinations = [
      "m-4 p-2 bg-blue-500",
      "p-2 m-4 bg-blue-500",
      "bg-blue-500 m-4 p-2",
      "bg-blue-500 p-2 m-4",
      "m-4 bg-blue-500 p-2",
      "p-2 bg-blue-500 m-4",
    ];

    const keys = combinations.map(generateStyleKey);
    const firstKey = keys[0];
    keys.forEach((key) => {
      expect(key).toBe(firstKey);
    });
  });

  it("should handle duplicate classes", () => {
    // Note: duplicates will appear in output since we don't dedupe
    expect(generateStyleKey("m-4 m-4")).toBe("_m_4_m_4");
    expect(generateStyleKey("flex flex flex")).toBe("_flex_flex_flex");
  });

  it("should handle transform classes", () => {
    expect(generateStyleKey("scale-110")).toBe("_scale_110");
    expect(generateStyleKey("rotate-45")).toBe("_rotate_45");
    expect(generateStyleKey("translate-x-4")).toBe("_translate_x_4");
    expect(generateStyleKey("-rotate-90")).toBe("__rotate_90");
  });

  it("should handle negative values", () => {
    expect(generateStyleKey("-m-4")).toBe("__m_4");
    expect(generateStyleKey("-translate-x-8")).toBe("__translate_x_8");
    expect(generateStyleKey("-rotate-180")).toBe("__rotate_180");
  });

  it("should be deterministic", () => {
    const className = "m-4 p-2 bg-blue-500 text-white rounded-lg flex items-center";
    const key1 = generateStyleKey(className);
    const key2 = generateStyleKey(className);
    const key3 = generateStyleKey(className);

    expect(key1).toBe(key2);
    expect(key2).toBe(key3);
  });

  it("should create valid JavaScript identifiers", () => {
    // Valid identifiers start with _, $, or letter, and contain _, $, letters, or digits
    const keys = [
      generateStyleKey("m-4"),
      generateStyleKey("bg-blue-500"),
      generateStyleKey("text-[14px]"),
      generateStyleKey("flex items-center"),
      generateStyleKey("active:bg-red-500"),
    ];

    keys.forEach((key) => {
      // Should start with underscore
      expect(key).toMatch(/^_/);
      // Should only contain alphanumeric and underscores
      expect(key).toMatch(/^[_a-zA-Z0-9]+$/);
    });
  });
});
