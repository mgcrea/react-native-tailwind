import { describe, expect, it } from "vitest";

import { transform } from "../../../../test/helpers/babelTransform.js";
import { COLORS } from "../../../parser/colors.js";

describe("raw color hooks", () => {
  it("should compile a static color token to a string literal", () => {
    const output = transform(`
      import { useTwColor } from '@mgcrea/react-native-tailwind';
      export function Component() {
        const color = useTwColor('blue-500');
        return color;
      }
    `);

    expect(output).toContain(`const color = "${COLORS["blue-500"]}"`);
    expect(output).not.toContain("useTwColor");
    expect(output).not.toContain("useColorScheme");
  });

  it("should support utility-form tokens, opacity, and arbitrary hex", () => {
    const output = transform(`
      import { useTwColors } from '@mgcrea/react-native-tailwind';
      export function Component() {
        return useTwColors({
          background: 'bg-red-500/35',
          foreground: 'text-[#abcdef]',
        });
      }
    `);

    expect(output).toContain('background: "#FB2C3659"');
    expect(output).toContain('foreground: "#abcdef"');
    expect(output).not.toContain("useTwColors");
  });

  it("should compile a scheme token with the configured hook", () => {
    const output = transform(
      `
        import { useTwColor } from '@mgcrea/react-native-tailwind';
        export function Component() {
          return useTwColor('scheme:gray');
        }
      `,
      {
        colorScheme: {
          importFrom: "@/theme/useColorScheme",
          importName: "useAppColorScheme",
        },
        schemeModifier: {
          darkSuffix: "-900",
          lightSuffix: "-100",
        },
      },
    );

    expect(output).toContain('from "@/theme/useColorScheme"');
    expect(output).toContain("useAppColorScheme()");
    expect(output).toContain('_twColorScheme === "dark"');
    expect(output).toContain(`? "${COLORS["gray-900"]}"`);
    expect(output).toContain(`: "${COLORS["gray-100"]}"`);
  });

  it("should inject one scheme hook for a color object", () => {
    const output = transform(
      `
        import { useTwColors } from '@mgcrea/react-native-tailwind';
        export function Component() {
          return useTwColors({
            background: 'scheme:gray',
            foreground: 'scheme:slate',
            accent: 'blue-500',
          });
        }
      `,
      {
        schemeModifier: {
          darkSuffix: "-900",
          lightSuffix: "-100",
        },
      },
    );

    expect(output.match(/_twColorScheme\s*=\s*useColorScheme\(\)/g)).toHaveLength(1);
    expect(output).toContain("background:");
    expect(output).toContain("foreground:");
    expect(output).toContain("accent:");
  });

  it("should pre-inject the scheme hook for a concise arrow component", () => {
    const output = transform(
      `
        import { useTwColor } from '@mgcrea/react-native-tailwind';
        export const Component = () => useTwColor('scheme:gray');
      `,
      {
        schemeModifier: {
          darkSuffix: "-900",
          lightSuffix: "-100",
        },
      },
    );

    expect(output.match(/_twColorScheme\s*=\s*useColorScheme\(\)/g)).toHaveLength(1);
    expect(output).toContain('_twColorScheme === "dark"');
    expect(output).toContain(`? "${COLORS["gray-900"]}"`);
    expect(output).toContain(`: "${COLORS["gray-100"]}"`);
  });

  it("should transform aliased imports and preserve unrelated imports", () => {
    const output = transform(`
      import { parseColor, useTwColor as useColor } from '@mgcrea/react-native-tailwind';
      export function Component() {
        return [useColor('black'), parseColor];
      }
    `);

    expect(output).toContain("parseColor");
    expect(output).not.toContain("useTwColor");
    expect(output).not.toContain("useColor as");
    expect(output).toContain('"#000000"');
  });

  it("should reject unknown, dynamic, and module-scope tokens", () => {
    expect(() =>
      transform(`
        import { useTwColor } from '@mgcrea/react-native-tailwind';
        export function Component() {
          return useTwColor('not-a-real-color');
        }
      `),
    ).toThrow(/Unknown or unsupported color token/);

    expect(() =>
      transform(`
        import { useTwColor } from '@mgcrea/react-native-tailwind';
        export function Component({ token }) {
          return useTwColor(token);
        }
      `),
    ).toThrow(/requires a static string literal/);

    expect(() =>
      transform(
        `
          import { useTwColor } from '@mgcrea/react-native-tailwind';
          export const color = useTwColor('scheme:gray');
        `,
        { schemeModifier: { darkSuffix: "-900", lightSuffix: "-100" } },
      ),
    ).toThrow(/must be called inside a React function component/);

    expect(() =>
      transform(`
        import { useTwColor } from '@mgcrea/react-native-tailwind';
        export const color = useTwColor('blue-500');
      `),
    ).toThrow(/must be called inside a React function component/);
  });

  it("should reject runtime references to compile-only color helpers", () => {
    expect(() =>
      transform(`
        import { useTwColor } from '@mgcrea/react-native-tailwind';
        const resolveColor = useTwColor;
        export function Component() {
          return useTwColor('blue-500');
        }
      `),
    ).toThrow(/must be called directly/);
  });
});
