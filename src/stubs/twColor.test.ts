import { describe, expect, it } from "vitest";

import { twColor, useTwColor, useTwColors } from "./twColor";

describe("raw color stubs", () => {
  it("should throw when twColor is not transformed", () => {
    expect(() => twColor`blue-500`).toThrow(
      "twColor/useTwColor/useTwColors must be transformed by the Babel plugin",
    );
  });

  it("should throw when useTwColor is not transformed", () => {
    expect(() => useTwColor("blue-500")).toThrow(
      "twColor/useTwColor/useTwColors must be transformed by the Babel plugin",
    );
  });

  it("should throw when useTwColors is not transformed", () => {
    expect(() => useTwColors({ accent: "blue-500" })).toThrow(
      "twColor/useTwColor/useTwColors must be transformed by the Babel plugin",
    );
  });
});
