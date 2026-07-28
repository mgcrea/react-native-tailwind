import { describe, expect, it } from "vitest";

import type { PluginState } from "../plugin/state";
import { resolveTwColorToken } from "./twColorProcessing";

const state = {
  customTheme: {
    colors: {
      card: "#ffffff",
      "card-dark": "#222222",
      "card-light": "#ffffff",
    },
    fontFamily: {},
    fontSize: {},
    spacing: {},
  },
  schemeModifierConfig: {
    darkSuffix: "-dark",
    lightSuffix: "-light",
  },
} as unknown as PluginState;

describe("resolveTwColorToken", () => {
  it("should resolve custom and preset raw tokens", () => {
    expect(resolveTwColorToken("card", state)).toEqual({ kind: "static", color: "#ffffff" });
    expect(resolveTwColorToken("black", state)).toEqual({ kind: "static", color: "#000000" });
  });

  it("should resolve scheme variants from flattened theme colors", () => {
    expect(resolveTwColorToken("scheme:card", state)).toEqual({
      kind: "scheme",
      darkColor: "#222222",
      lightColor: "#ffffff",
    });
  });

  it("should reject unsupported modifiers, multiple tokens, and unknown colors", () => {
    expect(resolveTwColorToken("dark:card", state)).toBeNull();
    expect(resolveTwColorToken("card text", state)).toBeNull();
    expect(resolveTwColorToken("missing", state)).toBeNull();
  });
});
