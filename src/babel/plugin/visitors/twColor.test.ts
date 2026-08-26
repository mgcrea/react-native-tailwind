import { describe, expect, it } from "vitest";

import { transform } from "../../../../test/helpers/babelTransform.js";
import { COLORS } from "../../../parser/colors.js";
import { applyOpacity } from "../../../utils/colorUtils.js";

describe("twColor tag", () => {
  it("should compile a module-level static token to a string literal", () => {
    const output = transform(`
      import { twColor } from '@mgcrea/react-native-tailwind';
      export const color = twColor\`blue-500\`;
    `);

    expect(output).toContain(`export const color = "${COLORS["blue-500"]}"`);
    expect(output).not.toContain("twColor");
    expect(output).not.toContain("useColorScheme");
  });

  it("should support utility-form tokens, opacity, arbitrary hex, and aliased imports", () => {
    const output = transform(`
      import { twColor as color } from '@mgcrea/react-native-tailwind';
      export const background = color\`bg-red-500/35\`;
      export const foreground = color\`[#abcdef]\`;
    `);

    expect(output).toContain('export const background = "#FB2C3659"');
    expect(output).toContain('export const foreground = "#abcdef"');
    expect(output).not.toContain("twColor");
    expect(output).not.toContain("color`");
  });

  it("should support arbitrary opacity from the shared color grammar", () => {
    const output = transform(`
      import { twColor } from '@mgcrea/react-native-tailwind';
      export const color = twColor\`blue-500/[.37]\`;
    `);

    expect(output).toContain('export const color = "#2B7FFF5E"');
  });

  it("should reject scheme tokens with an actionable useTwColor error", () => {
    expect(() =>
      transform(`
        import { twColor } from '@mgcrea/react-native-tailwind';
        export const color = twColor\`scheme:not-configured\`;
      `),
    ).toThrow(/cannot resolve a runtime color scheme.*Use useTwColor/);
  });

  it("should reject interpolations, empty tags, unknown colors, and function-call syntax", () => {
    expect(() =>
      transform(`
        import { twColor } from '@mgcrea/react-native-tailwind';
        const shade = 500;
        export const color = twColor\`blue-\${shade}\`;
      `),
    ).toThrow(/without interpolations/);

    expect(() =>
      transform(`
        import { twColor } from '@mgcrea/react-native-tailwind';
        export const color = twColor\`\`;
      `),
    ).toThrow(/requires one static color token/);

    expect(() =>
      transform(`
        import { twColor } from '@mgcrea/react-native-tailwind';
        export const color = twColor\`not-a-real-color\`;
      `),
    ).toThrow(/Unknown or unsupported color token/);

    expect(() =>
      transform(`
        import { twColor } from '@mgcrea/react-native-tailwind';
        export const color = twColor('blue-500');
      `),
    ).toThrow(/must be used as a tagged template/);
  });
});

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

  it("should compile scheme outline colors with arbitrary opacity", () => {
    const output = transform(
      `
        import { useTwColor } from '@mgcrea/react-native-tailwind';
        export function Component() {
          return useTwColor('scheme:outline-gray/[.37]');
        }
      `,
      { schemeModifier: { darkSuffix: "-900", lightSuffix: "-100" } },
    );

    expect(output).toContain(`? "${applyOpacity(COLORS["gray-900"], 37)}"`);
    expect(output).toContain(`: "${applyOpacity(COLORS["gray-100"], 37)}"`);
  });

  it("should preserve TypeScript satisfies checks around direct static tokens", () => {
    const output = transform(
      `
        import { useTwColor, useTwColors } from '@mgcrea/react-native-tailwind';
        type AppColor = 'card' | 'text';
        type AppSchemeColor = \`scheme:\${AppColor}\`;

        export function Component() {
          const card = useTwColor('scheme:gray' satisfies string);
          const colors = useTwColors({ text: 'black' satisfies string });
          return [card, colors.text];
        }
      `,
      { schemeModifier: { darkSuffix: "-900", lightSuffix: "-100" } },
      true,
    );

    expect(output).toContain(`? "${COLORS["gray-900"]}"`);
    expect(output).toContain('text: "#000000"');
    expect(output).not.toContain("satisfies");
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
