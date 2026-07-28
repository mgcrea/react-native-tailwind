import { parseSync } from "@babel/core";
import * as BabelTypes from "@babel/types";
import { describe, expect, it } from "vitest";

import { scanForColorSchemeModifiers } from "./preInjection";

describe("scanForColorSchemeModifiers", () => {
  it("should detect typed scheme tokens before React Compiler analysis", () => {
    const ast = parseSync(
      `
        function Component() {
          return useTwColor("scheme:card" satisfies AppThemeColor);
        }
      `,
      { parserOpts: { plugins: ["typescript"] } },
    );
    const declaration = ast?.program.body[0];
    expect(BabelTypes.isFunctionDeclaration(declaration)).toBe(true);
    if (!BabelTypes.isFunctionDeclaration(declaration)) return;

    expect(
      scanForColorSchemeModifiers(
        declaration.body,
        new Set(),
        [],
        new Set(),
        BabelTypes,
        new Set(["useTwColor"]),
      ),
    ).toBe(true);
  });

  it("should detect typed scheme values in useTwColors objects", () => {
    const ast = parseSync(
      `
        function Component() {
          return useTwColors({ card: "scheme:card" as AppThemeColor });
        }
      `,
      { parserOpts: { plugins: ["typescript"] } },
    );
    const declaration = ast?.program.body[0];
    expect(BabelTypes.isFunctionDeclaration(declaration)).toBe(true);
    if (!BabelTypes.isFunctionDeclaration(declaration)) return;

    expect(
      scanForColorSchemeModifiers(
        declaration.body,
        new Set(),
        [],
        new Set(),
        BabelTypes,
        new Set(["useTwColors"]),
      ),
    ).toBe(true);
  });
});
