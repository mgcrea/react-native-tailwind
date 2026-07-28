import { describe, expect, it } from "vitest";

import { parseFilter } from "./filters";
import { parseClassName } from "./index";

describe("parseFilter - brightness", () => {
  it("should parse numeric brightness values as percentages", () => {
    expect(parseFilter("brightness-0")).toEqual({ filter: [{ brightness: 0 }] });
    expect(parseFilter("brightness-50")).toEqual({ filter: [{ brightness: 0.5 }] });
    expect(parseFilter("brightness-100")).toEqual({ filter: [{ brightness: 1 }] });
    expect(parseFilter("brightness-101")).toEqual({ filter: [{ brightness: 1.01 }] });
    expect(parseFilter("brightness-125")).toEqual({ filter: [{ brightness: 1.25 }] });
    expect(parseFilter("brightness-200")).toEqual({ filter: [{ brightness: 2 }] });
  });

  it("should parse arbitrary numeric brightness values", () => {
    expect(parseFilter("brightness-[1.01]")).toEqual({ filter: [{ brightness: 1.01 }] });
    expect(parseFilter("brightness-[.5]")).toEqual({ filter: [{ brightness: 0.5 }] });
    expect(parseFilter("brightness-[2]")).toEqual({ filter: [{ brightness: 2 }] });
  });

  it("should parse arbitrary percentage brightness values", () => {
    expect(parseFilter("brightness-[80%]")).toEqual({ filter: [{ brightness: 0.8 }] });
    expect(parseFilter("brightness-[101%]")).toEqual({ filter: [{ brightness: 1.01 }] });
  });

  it("should reject unsupported or negative brightness values", () => {
    expect(parseFilter("brightness-[-1]")).toBeNull();
    expect(parseFilter("brightness-[1.01px]")).toBeNull();
    expect(parseFilter("brightness-[abc]")).toBeNull();
    expect(parseFilter("brightness-auto")).toBeNull();
    expect(parseFilter("brightness-")).toBeNull();
  });

  it("should return null for unrelated classes", () => {
    expect(parseFilter("contrast-100")).toBeNull();
    expect(parseFilter("bg-white")).toBeNull();
    expect(parseFilter("")).toBeNull();
  });

  it("should integrate with the class parser", () => {
    expect(parseClassName("brightness-[1.01] opacity-80")).toEqual({
      filter: [{ brightness: 1.01 }],
      opacity: 0.8,
    });
  });
});
