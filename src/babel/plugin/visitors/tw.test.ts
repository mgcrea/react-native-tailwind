/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, expect, it, vi } from "vitest";

import { transform } from "../../../../test/helpers/babelTransform.js";
import type { PluginOptions } from "../state.js";

describe("tw visitor - template tag transformation", () => {
  it("should transform simple tw template literal", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';
      const styles = tw\`bg-blue-500 m-4\`;
    `;

    const output = transform(input);

    // Should have StyleSheet import (either ESM or CommonJS)
    expect(output).toMatch(/import.*StyleSheet.*from "react-native"|require\("react-native"\)/);
    expect(output).toContain("StyleSheet");

    // Should have _twStyles definition
    expect(output).toContain("_twStyles");
    expect(output).toContain("StyleSheet.create");

    // Should transform tw call to object with style property
    expect(output).toContain("style:");
    expect(output).toContain("_twStyles._bg_blue_500_m_4");

    // Should remove tw import
    expect(output).not.toContain("from '@mgcrea/react-native-tailwind'");
  });

  it("should transform tw with state modifiers", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';
      const styles = tw\`bg-blue-500 active:bg-blue-700 disabled:bg-gray-300\`;
    `;

    const output = transform(input);

    // Should have base style
    expect(output).toContain("style:");
    expect(output).toContain("_bg_blue_500");

    // Should have activeStyle
    expect(output).toContain("activeStyle:");
    expect(output).toContain("_active_bg_blue_700");

    // Should have disabledStyle
    expect(output).toContain("disabledStyle:");
    expect(output).toContain("_disabled_bg_gray_300");

    // Should create StyleSheet with all styles
    expect(output).toContain("backgroundColor:");
  });

  it("should inject StyleSheet.create after imports", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';
      import { View } from 'react-native';

      const styles = tw\`m-4\`;
    `;

    const output = transform(input);

    // Find the position of imports and StyleSheet.create
    const viewImportPos = output.indexOf('require("react-native")');
    const styleSheetCreatePos = output.indexOf("_twStyles");

    // StyleSheet.create should come after imports
    expect(styleSheetCreatePos).toBeGreaterThan(viewImportPos);
  });

  it("should handle tw in object literals", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      const sizeVariants = {
        sm: {
          container: tw\`h-9 px-3\`,
          text: tw\`text-sm\`,
        },
      };
    `;

    const output = transform(input);

    // Should define _twStyles before object literal
    const twStylesPos = output.indexOf("_twStyles");
    const sizeVariantsPos = output.indexOf("sizeVariants");

    expect(twStylesPos).toBeGreaterThan(0);
    expect(twStylesPos).toBeLessThan(sizeVariantsPos);

    // Should have both styles
    expect(output).toContain("_h_9_px_3");
    expect(output).toContain("_text_sm");
  });

  it("should handle empty tw template literal", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';
      const styles = tw\`\`;
    `;

    const output = transform(input);

    // Should replace with empty style object
    expect(output).toContain("style:");
    expect(output).toContain("{}");
  });

  it("should preserve other imports from the same package", () => {
    const input = `
      import { tw, TwStyle, COLORS } from '@mgcrea/react-native-tailwind';
      const styles = tw\`m-4\`;
    `;

    const output = transform(input);

    // Should remove tw but keep other imports
    expect(output).not.toContain('"tw"');
    expect(output).toContain("TwStyle");
    expect(output).toContain("COLORS");
  });

  it("should handle renamed tw import", () => {
    const input = `
      import { tw as customTw } from '@mgcrea/react-native-tailwind';
      const styles = customTw\`m-4 p-2\`;
    `;

    const output = transform(input);

    // Should still transform the renamed import
    expect(output).toContain("_twStyles");
    expect(output).toContain("_m_4_p_2");
    expect(output).not.toContain("customTw");
  });

  it("should handle multiple tw calls", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';
      const style1 = tw\`bg-red-500\`;
      const style2 = tw\`bg-blue-500\`;
      const style3 = tw\`bg-green-500\`;
    `;

    const output = transform(input);

    // Should have all three styles in StyleSheet
    expect(output).toContain("_bg_red_500");
    expect(output).toContain("_bg_blue_500");
    expect(output).toContain("_bg_green_500");

    // Should have StyleSheet.create with all styles
    expect(output).toContain("StyleSheet.create");
  });

  it("should use custom stylesIdentifier option", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';
      const styles = tw\`m-4\`;
    `;

    const output = transform(input, { stylesIdentifier: "myStyles" });

    // Should use custom identifier
    expect(output).toContain("myStyles");
    expect(output).toContain("myStyles._m_4");
    expect(output).not.toContain("_twStyles");
  });
});

describe("twStyle visitor - function transformation", () => {
  it("should transform twStyle function call", () => {
    const input = `
      import { twStyle } from '@mgcrea/react-native-tailwind';
      const styles = twStyle('bg-blue-500 m-4');
    `;

    const output = transform(input);

    // Should transform to object with style property
    expect(output).toContain("style:");
    expect(output).toContain("_twStyles._bg_blue_500_m_4");
  });

  it("should transform twStyle with modifiers", () => {
    const input = `
      import { twStyle } from '@mgcrea/react-native-tailwind';
      const styles = twStyle('bg-blue-500 active:bg-blue-700');
    `;

    const output = transform(input);

    expect(output).toContain("style:");
    expect(output).toContain("activeStyle:");
  });

  it("should handle empty twStyle call", () => {
    const input = `
      import { twStyle } from '@mgcrea/react-native-tailwind';
      const styles = twStyle('');
    `;

    const output = transform(input);

    // Should replace with undefined
    expect(output).toContain("undefined");
  });
});

describe("tw/twStyle - color scheme modifiers", () => {
  it("should transform tw with dark: modifier inside component", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`bg-white dark:bg-gray-900\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should inject useColorScheme hook
    expect(output).toContain("useColorScheme");
    expect(output).toContain("_twColorScheme");

    // Should generate style array with conditionals
    expect(output).toContain("style: [");
    expect(output).toContain('_twColorScheme === "dark"');
    expect(output).toContain("_twStyles._dark_bg_gray_900");
    expect(output).toContain("_twStyles._bg_white");

    // Should have StyleSheet.create
    expect(output).toContain("StyleSheet.create");
  });

  it("should transform twStyle with light: modifier inside component", () => {
    const input = `
      import { twStyle } from '@mgcrea/react-native-tailwind';

      export const MyComponent = () => {
        const buttonStyles = twStyle('text-gray-900 light:text-gray-100');
        return null;
      };
    `;

    const output = transform(input);

    // Should inject useColorScheme hook
    expect(output).toContain("useColorScheme");
    expect(output).toContain("_twColorScheme");

    // Should generate style array with conditionals
    expect(output).toContain("style: [");
    expect(output).toContain('_twColorScheme === "light"');
    expect(output).toContain("_twStyles._light_text_gray_100");
    expect(output).toContain("_twStyles._text_gray_900");
  });

  it("should transform tw with both dark: and light: modifiers", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`bg-blue-500 dark:bg-blue-900 light:bg-blue-100\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should have both conditionals
    expect(output).toContain('_twColorScheme === "dark"');
    expect(output).toContain('_twColorScheme === "light"');
    expect(output).toContain("_twStyles._dark_bg_blue_900");
    expect(output).toContain("_twStyles._light_bg_blue_100");
    expect(output).toContain("_twStyles._bg_blue_500");
  });

  it("should combine color scheme modifiers with state modifiers", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`bg-white dark:bg-gray-900 active:bg-blue-500\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should have color scheme conditionals in style array
    expect(output).toContain("style: [");
    expect(output).toContain('_twColorScheme === "dark"');

    // Should have activeStyle property (separate from color scheme)
    expect(output).toContain("activeStyle:");
    expect(output).toContain("_twStyles._active_bg_blue_500");
  });

  it("should preserve color scheme variants when tw is used outside a component", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      const globalStyles = tw\`bg-white dark:bg-gray-900\`;
    `;

    const output = transform(input);

    // Should explain how to resolve the generated variants at the consumption site
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("use useTwStyle() or resolveTwStyle() inside the consumer"),
    );

    // Should not inject hook (no component scope)
    expect(output).not.toContain("useColorScheme");

    // Should generate the base style and raw dark variant without module-level hook conditionals
    expect(output).toContain("_twStyles");
    expect(output).toContain("style: _twStyles._bg_white");
    expect(output).toContain("darkStyle: _twStyles._dark_bg_gray_900");
    expect(output).not.toContain('_twColorScheme === "dark"');

    consoleWarnSpy.mockRestore();
  });

  it("should preserve both variants for module-level twStyle calls", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const input = `
      import { twStyle } from '@mgcrea/react-native-tailwind';

      export const sharedStyles = twStyle('bg-gray-500 dark:bg-gray-900 light:bg-gray-100');
    `;

    const output = transform(input);

    expect(output).not.toContain("useColorScheme");
    expect(output).toContain("style: _twStyles._bg_gray_500");
    expect(output).toContain("darkStyle: _twStyles._dark_bg_gray_900");
    expect(output).toContain("lightStyle: _twStyles._light_bg_gray_100");

    consoleWarnSpy.mockRestore();
  });

  it("should preserve the runtime useTwStyle import for shared styles", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const input = `
      import { tw, useTwStyle } from '@mgcrea/react-native-tailwind';

      const sharedStyles = tw\`bg-white dark:bg-gray-900\`;

      export function Component() {
        const style = useTwStyle(sharedStyles);
        return style;
      }
    `;

    const output = transform(input);

    expect(output).not.toMatch(/import\s*{[^}]*\btw\b/);
    expect(output).toMatch(/import\s*{\s*useTwStyle\s*}\s*from/);
    expect(output).toContain("darkStyle: _twStyles._dark_bg_gray_900");
    expect(output).toContain("useTwStyle(sharedStyles)");

    consoleWarnSpy.mockRestore();
  });

  it("should handle tw with only dark: modifier (no base class)", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`dark:bg-gray-900\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should still generate style array
    expect(output).toContain("style: [");
    expect(output).toContain('_twColorScheme === "dark"');
    expect(output).toContain("_twStyles._dark_bg_gray_900");
  });

  it("should work with custom color scheme hook import", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';
      import { useTheme } from '@react-navigation/native';

      function MyComponent() {
        const styles = tw\`bg-white dark:bg-gray-900\`;
        return null;
      }
    `;

    const options: PluginOptions = {
      colorScheme: {
        importFrom: "@react-navigation/native",
        importName: "useTheme",
      },
    };

    const output = transform(input, options);

    // Should use existing import (not duplicate)
    const themeImportCount = (output.match(/useTheme/g) ?? []).length;
    // Should appear in import statement and hook call
    expect(themeImportCount).toBeGreaterThanOrEqual(2);

    // Should call the custom hook
    expect(output).toContain("useTheme()");
  });

  it("should generate both style array and darkStyle/lightStyle properties", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`bg-white dark:bg-gray-900 light:bg-gray-50\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should have runtime conditional in style array
    expect(output).toContain("style: [");
    expect(output).toContain('_twColorScheme === "dark"');
    expect(output).toContain('_twColorScheme === "light"');

    // Should ALSO have darkStyle and lightStyle properties for manual access
    expect(output).toContain("darkStyle:");
    expect(output).toContain("lightStyle:");
    expect(output).toContain("_twStyles._dark_bg_gray_900");
    expect(output).toContain("_twStyles._light_bg_gray_50");
  });

  it("should allow accessing raw color values from darkStyle/lightStyle", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const btnStyles = tw\`bg-blue-500 dark:bg-blue-900\`;
        // User can access raw hex for Reanimated
        const darkBgColor = btnStyles.darkStyle?.backgroundColor;
        return null;
      }
    `;

    const output = transform(input);

    // Should have darkStyle property available
    expect(output).toContain("darkStyle:");
    expect(output).toContain("_twStyles._dark_bg_blue_900");

    // The actual usage line should be preserved (TypeScript/Babel doesn't remove it)
    expect(output).toContain("btnStyles.darkStyle");
  });
});

describe("tw/twStyle - platform modifiers", () => {
  it("should transform tw with ios: modifier", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`bg-white ios:p-6\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should add Platform import
    expect(output).toContain("Platform");
    expect(output).toContain('from "react-native"');

    // Should generate style array with Platform.select()
    expect(output).toContain("style: [");
    expect(output).toContain("Platform.select");
    expect(output).toContain("ios:");
    expect(output).toContain("_twStyles._ios_p_6");
    expect(output).toContain("_twStyles._bg_white");

    // Should have StyleSheet.create
    expect(output).toContain("StyleSheet.create");
  });

  it("should transform twStyle with android: modifier", () => {
    const input = `
      import { twStyle } from '@mgcrea/react-native-tailwind';

      export const MyComponent = () => {
        const buttonStyles = twStyle('bg-blue-500 android:p-8');
        return null;
      };
    `;

    const output = transform(input);

    // Should add Platform import
    expect(output).toContain("Platform");

    // Should generate style array with Platform.select()
    expect(output).toContain("style: [");
    expect(output).toContain("Platform.select");
    expect(output).toContain("android:");
    expect(output).toContain("_twStyles._android_p_8");
    expect(output).toContain("_twStyles._bg_blue_500");
  });

  it("should transform tw with multiple platform modifiers", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`bg-white ios:p-6 android:p-8 web:p-4\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should generate Platform.select() with all platforms
    expect(output).toContain("Platform.select");
    expect(output).toContain("ios:");
    expect(output).toContain("android:");
    expect(output).toContain("web:");
    expect(output).toContain("_twStyles._ios_p_6");
    expect(output).toContain("_twStyles._android_p_8");
    expect(output).toContain("_twStyles._web_p_4");
  });

  it("should combine platform modifiers with color-scheme modifiers", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`bg-white ios:p-6 dark:bg-gray-900\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should have both Platform and useColorScheme
    expect(output).toContain("Platform");
    expect(output).toContain("useColorScheme");
    expect(output).toContain("_twColorScheme");

    // Should have both conditionals in style array
    expect(output).toContain("Platform.select");
    expect(output).toContain('_twColorScheme === "dark"');
  });

  it("should generate iosStyle/androidStyle/webStyle properties for manual access", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`bg-white ios:p-6 android:p-8 web:p-4\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should have separate platform style properties
    expect(output).toContain("iosStyle:");
    expect(output).toContain("_twStyles._ios_p_6");
    expect(output).toContain("androidStyle:");
    expect(output).toContain("_twStyles._android_p_8");
    expect(output).toContain("webStyle:");
    expect(output).toContain("_twStyles._web_p_4");

    // Should also have runtime Platform.select() in style array
    expect(output).toContain("Platform.select");
  });

  it("should work with only platform modifiers (no base class)", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`ios:p-6 android:p-8\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should generate Platform.select() even without base classes
    expect(output).toContain("Platform.select");
    expect(output).toContain("_twStyles._ios_p_6");
    expect(output).toContain("_twStyles._android_p_8");
  });

  it("should allow accessing platform-specific styles manually", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const btnStyles = tw\`bg-blue-500 ios:p-6\`;
        const iosPadding = btnStyles.iosStyle;
        return null;
      }
    `;

    const output = transform(input);

    // Should have iosStyle property available
    expect(output).toContain("iosStyle:");
    expect(output).toContain("_twStyles._ios_p_6");

    // The actual usage line should be preserved
    expect(output).toContain("btnStyles.iosStyle");
  });

  it("should combine state modifiers with platform modifiers", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`bg-white active:bg-blue-500 ios:p-6\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should have both activeStyle and platform modifiers
    expect(output).toContain("activeStyle:");
    expect(output).toContain("_twStyles._active_bg_blue_500");
    expect(output).toContain("Platform.select");
    expect(output).toContain("_twStyles._ios_p_6");
  });
});

describe("tw/twStyle - integration with className", () => {
  it("should work with both tw and className in same file", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';
      import { View } from 'react-native';

      const styles = tw\`bg-red-500\`;

      export function Component() {
        return <View className="m-4 p-2" />;
      }
    `;

    const output = transform(input, undefined, true); // Enable JSX

    // Should have both styles in StyleSheet
    expect(output).toContain("_bg_red_500");
    expect(output).toContain("_m_4_p_2");
  });
});

describe("tw visitor - directional modifiers (RTL/LTR)", () => {
  it("should transform rtl: modifier in tw template", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`p-4 rtl:mr-4\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should import I18nManager
    expect(output).toContain("I18nManager");

    // Should declare _twIsRTL variable
    expect(output).toContain("_twIsRTL");
    expect(output).toContain("I18nManager.isRTL");

    // Should have style array with conditional
    expect(output).toContain("style:");
    expect(output).toContain("_twStyles._p_4");
    expect(output).toMatch(/_twIsRTL\s*&&\s*_twStyles\._rtl_mr_4/);

    // Should have rtlStyle property
    expect(output).toContain("rtlStyle:");
    expect(output).toContain("_twStyles._rtl_mr_4");
  });

  it("should transform ltr: modifier with negated conditional", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`p-4 ltr:ml-4\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should import I18nManager
    expect(output).toContain("I18nManager");

    // Should have negated conditional for LTR (!_twIsRTL)
    expect(output).toMatch(/!\s*_twIsRTL\s*&&\s*_twStyles\._ltr_ml_4/);

    // Should have ltrStyle property
    expect(output).toContain("ltrStyle:");
  });

  it("should combine rtl: and ltr: modifiers", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`rtl:mr-4 ltr:ml-4\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should have both conditionals
    expect(output).toMatch(/_twIsRTL\s*&&\s*_twStyles\._rtl_mr_4/);
    expect(output).toMatch(/!\s*_twIsRTL\s*&&\s*_twStyles\._ltr_ml_4/);

    // Should have both style properties
    expect(output).toContain("rtlStyle:");
    expect(output).toContain("ltrStyle:");
  });

  it("should combine directional modifiers with platform modifiers", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`p-4 ios:p-6 rtl:mr-4\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should have Platform import
    expect(output).toContain("Platform");

    // Should have I18nManager import
    expect(output).toContain("I18nManager");

    // Should have both modifiers in style array
    expect(output).toContain("Platform.select");
    expect(output).toMatch(/_twIsRTL\s*&&/);

    // Should have iosStyle and rtlStyle properties
    expect(output).toContain("iosStyle:");
    expect(output).toContain("rtlStyle:");
  });

  it("should combine directional modifiers with state modifiers", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = tw\`bg-white active:bg-blue-500 rtl:pr-4\`;
        return null;
      }
    `;

    const output = transform(input);

    // Should have I18nManager import
    expect(output).toContain("I18nManager");

    // Should have directional conditional
    expect(output).toMatch(/_twIsRTL\s*&&/);

    // Should have activeStyle property
    expect(output).toContain("activeStyle:");
    expect(output).toContain("_twStyles._active_bg_blue_500");

    // Should have rtlStyle property
    expect(output).toContain("rtlStyle:");
  });

  it("should work with twStyle function for RTL modifiers", () => {
    const input = `
      import { twStyle } from '@mgcrea/react-native-tailwind';

      function MyComponent() {
        const styles = twStyle('p-4 rtl:mr-4 ltr:ml-4');
        return null;
      }
    `;

    const output = transform(input);

    // Should import I18nManager
    expect(output).toContain("I18nManager");

    // Should have both conditionals
    expect(output).toMatch(/_twIsRTL\s*&&/);
    expect(output).toMatch(/!\s*_twIsRTL\s*&&/);

    // Should have both style properties
    expect(output).toContain("rtlStyle:");
    expect(output).toContain("ltrStyle:");
  });
});
