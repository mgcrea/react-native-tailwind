import { describe, expect, it } from "vitest";

import { applyOpacity } from "../utils/colorUtils";
import { parseClassName } from "./index";
import { DEFAULT_RING_COLOR, DEFAULT_RING_WIDTH, parseRing } from "./rings";

describe("parseRing", () => {
  it("should parse the browser-style default ring", () => {
    expect(parseRing("ring")).toEqual({
      outlineWidth: DEFAULT_RING_WIDTH,
      outlineStyle: "solid",
      outlineColor: DEFAULT_RING_COLOR,
    });
  });

  it("should parse dynamic ring widths", () => {
    expect(parseRing("ring-0")).toEqual({
      outlineWidth: 0,
      outlineStyle: "solid",
    });
    expect(parseRing("ring-1")).toEqual({
      outlineWidth: 1,
      outlineStyle: "solid",
    });
    expect(parseRing("ring-2.5")).toEqual({
      outlineWidth: 2.5,
      outlineStyle: "solid",
    });
  });

  it("should parse arbitrary ring widths", () => {
    expect(parseRing("ring-[3px]")).toEqual({
      outlineWidth: 3,
      outlineStyle: "solid",
    });
    expect(parseRing("ring-[1.5]")).toEqual({
      outlineWidth: 1.5,
      outlineStyle: "solid",
    });
  });

  it("should parse ring colors and opacity", () => {
    expect(parseRing("ring-red-500")).toEqual({ outlineColor: "#fb2c36" });
    expect(parseRing("ring-blue-500/25")).toEqual({
      outlineColor: applyOpacity("#2b7fff", 25),
    });
    expect(parseRing("ring-[#123456]")).toEqual({ outlineColor: "#123456" });
  });

  it("should parse custom ring colors", () => {
    expect(parseRing("ring-brand", { brand: "#123456" })).toEqual({ outlineColor: "#123456" });
  });

  it("should parse dynamic and arbitrary offsets", () => {
    expect(parseRing("ring-offset-0")).toEqual({ outlineOffset: 0 });
    expect(parseRing("ring-offset-2")).toEqual({ outlineOffset: 2 });
    expect(parseRing("ring-offset-2.5")).toEqual({ outlineOffset: 2.5 });
    expect(parseRing("ring-offset-[3px]")).toEqual({ outlineOffset: 3 });
  });

  it("should compose width, color, and offset through the class parser", () => {
    expect(parseClassName("ring-2 ring-red-500 ring-offset-1")).toEqual({
      outlineWidth: 2,
      outlineStyle: "solid",
      outlineColor: "#fb2c36",
      outlineOffset: 1,
    });
  });

  it("should preserve a ring color declared before its width", () => {
    expect(parseClassName("ring-red-500 ring-2")).toEqual({
      outlineColor: "#fb2c36",
      outlineWidth: 2,
      outlineStyle: "solid",
    });
  });

  it("should reject unsupported ring classes", () => {
    expect(parseRing("ring-inset")).toBeNull();
    expect(parseRing("ring-offset-red-500")).toBeNull();
    expect(parseRing("ring-[-1px]")).toBeNull();
    expect(parseRing("ring-[2rem]")).toBeNull();
    expect(parseRing("rings")).toBeNull();
    expect(parseRing("")).toBeNull();
  });
});
