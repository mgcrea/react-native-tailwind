import { describe, expect, it } from "vitest";

import { parseOutline } from "./outline";

describe("parseOutline", () => {
  it("should parse outline shorthand", () => {
    expect(parseOutline("outline")).toEqual({
      outlineWidth: 1,
      outlineStyle: "solid",
    });
  });

  it("should parse outline-none", () => {
    expect(parseOutline("outline-none")).toEqual({ outlineWidth: 0 });
  });

  it("should parse outline width with preset values", () => {
    expect(parseOutline("outline-0")).toEqual({ outlineWidth: 0 });
    expect(parseOutline("outline-2")).toEqual({ outlineWidth: 2 });
    expect(parseOutline("outline-4")).toEqual({ outlineWidth: 4 });
    expect(parseOutline("outline-8")).toEqual({ outlineWidth: 8 });
  });

  it("should parse outline width with arbitrary values", () => {
    expect(parseOutline("outline-[5px]")).toEqual({ outlineWidth: 5 });
    expect(parseOutline("outline-[10]")).toEqual({ outlineWidth: 10 });
  });

  it("should parse outline style", () => {
    expect(parseOutline("outline-solid")).toEqual({ outlineStyle: "solid" });
    expect(parseOutline("outline-dashed")).toEqual({ outlineStyle: "dashed" });
    expect(parseOutline("outline-dotted")).toEqual({ outlineStyle: "dotted" });
  });

  it("should parse outline offset with preset values", () => {
    expect(parseOutline("outline-offset-0")).toEqual({ outlineOffset: 0 });
    expect(parseOutline("outline-offset-2")).toEqual({ outlineOffset: 2 });
    expect(parseOutline("outline-offset-4")).toEqual({ outlineOffset: 4 });
    expect(parseOutline("outline-offset-8")).toEqual({ outlineOffset: 8 });
  });

  it("should parse outline offset with arbitrary values", () => {
    expect(parseOutline("outline-offset-[3px]")).toEqual({ outlineOffset: 3 });
    expect(parseOutline("outline-offset-[5]")).toEqual({ outlineOffset: 5 });
  });

  it("should return null for invalid outline values", () => {
    expect(parseOutline("outline-invalid")).toBeNull();
    expect(parseOutline("outline-3")).toBeNull(); // Not in scale
    expect(parseOutline("outline-offset-3")).toBeNull(); // Not in scale
    expect(parseOutline("outline-[5rem]")).toBeNull(); // Unsupported unit
  });

  it("should return null for outline colors (handled by parseColor)", () => {
    expect(parseOutline("outline-red-500")).toBeNull();
    expect(parseOutline("outline-[#ff0000]")).toBeNull();
  });
});
