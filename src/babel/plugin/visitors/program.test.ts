import { describe, expect, it } from "vitest";

import { transform } from "../../../../test/helpers/babelTransform.js";

describe("program visitor - Program.exit behavior", () => {
  describe("StyleSheet injection", () => {
    it("should inject StyleSheet.create when className is used", () => {
      const input = `
        import { View } from 'react-native';

        function MyComponent() {
          return <View className="m-4 p-2 bg-blue-500" />;
        }
      `;

      const output = transform(input, undefined, true);

      // Should have StyleSheet import
      expect(output).toContain("StyleSheet");

      // Should inject StyleSheet.create
      expect(output).toContain("StyleSheet.create");
      expect(output).toContain("_twStyles");

      // Should have the styles
      expect(output).toMatch(/margin:\s*16/);
      expect(output).toMatch(/padding:\s*8/);
      expect(output).toMatch(/backgroundColor:/);
    });

    it("should not inject StyleSheet when no className is used", () => {
      const input = `
        import { View } from 'react-native';

        function MyComponent() {
          return <View />;
        }
      `;

      const output = transform(input, undefined, true);

      // Should not add StyleSheet import
      expect(output).not.toContain("StyleSheet");
      expect(output).not.toContain("_twStyles");
    });

    it("should inject styles at top of file after imports", () => {
      const input = `
        import React from 'react';
        import { View } from 'react-native';

        function MyComponent() {
          return <View className="m-4" />;
        }

        function AnotherComponent() {
          return <View className="p-2" />;
        }
      `;

      const output = transform(input, undefined, true);

      // StyleSheet.create should come before component definitions
      const styleSheetIndex = output.indexOf("StyleSheet.create");
      const firstComponentIndex = output.indexOf("function MyComponent");

      expect(styleSheetIndex).toBeGreaterThan(0);
      expect(styleSheetIndex).toBeLessThan(firstComponentIndex);
    });
  });

  describe("tw import removal", () => {
    it("should remove tw import when tw tagged template is used", () => {
      const input = `
        import { tw } from '@mgcrea/react-native-tailwind';
        import { View } from 'react-native';

        function MyComponent() {
          const styles = tw\`m-4 p-2\`;
          return <View style={styles.style} />;
        }
      `;

      const output = transform(input, undefined, true);

      // Should not have tw import anymore
      expect(output).not.toMatch(/import.*tw.*from ['"]@mgcrea\/react-native-tailwind['"]/);

      // Should have StyleSheet instead
      expect(output).toContain("StyleSheet");
    });

    it("should remove twStyle import when twStyle call is used", () => {
      const input = `
        import { twStyle } from '@mgcrea/react-native-tailwind';
        import { View } from 'react-native';

        function MyComponent() {
          const styles = twStyle('m-4 p-2');
          return <View style={styles.style} />;
        }
      `;

      const output = transform(input, undefined, true);

      // Should not have twStyle import anymore
      expect(output).not.toMatch(/import.*twStyle.*from ['"]@mgcrea\/react-native-tailwind['"]/);

      // Should have StyleSheet instead
      expect(output).toContain("StyleSheet");
    });
  });

  describe("hook injection - color scheme", () => {
    it("should inject useColorScheme hook when dark: modifier is used", () => {
      const input = `
        import { View } from 'react-native';

        function MyComponent() {
          return <View className="bg-white dark:bg-gray-900" />;
        }
      `;

      const output = transform(input, undefined, true);

      // Should import useColorScheme
      expect(output).toContain("useColorScheme");

      // Should inject hook call
      expect(output).toContain("_twColorScheme");
      expect(output).toContain("useColorScheme()");

      // Should use in conditional
      expect(output).toMatch(/_twColorScheme\s*===\s*['"]dark['"]/);
    });

    it("should inject useColorScheme hook when light: modifier is used", () => {
      const input = `
        import { View } from 'react-native';

        function MyComponent() {
          return <View className="bg-gray-900 light:bg-white" />;
        }
      `;

      const output = transform(input, undefined, true);

      // Should import and inject hook
      expect(output).toContain("useColorScheme");
      expect(output).toContain("_twColorScheme");

      // Should use in conditional
      expect(output).toMatch(/_twColorScheme\s*===\s*['"]light['"]/);
    });

    it("should inject hook only once for multiple color scheme modifiers", () => {
      const input = `
        import { View } from 'react-native';

        function MyComponent() {
          return (
            <>
              <View className="dark:bg-gray-900" />
              <View className="light:bg-white" />
              <View className="dark:text-white" />
            </>
          );
        }
      `;

      const output = transform(input, undefined, true);

      // Count hook injections (should be exactly 1)
      const hookMatches = output.match(/_twColorScheme\s*=\s*useColorScheme\(\)/g) ?? [];
      expect(hookMatches.length).toBe(1);
    });

    it("should use custom color scheme hook when configured", () => {
      const input = `
        import { View } from 'react-native';

        function MyComponent() {
          return <View className="dark:bg-gray-900" />;
        }
      `;

      const output = transform(
        input,
        {
          colorScheme: {
            importFrom: "@react-navigation/native",
            importName: "useTheme",
          },
        },
        true,
      );

      // Should import from custom source
      expect(output).toContain("@react-navigation/native");
      expect(output).toContain("useTheme");

      // Should use custom hook
      expect(output).toContain("useTheme()");
    });
  });

  describe("hook injection - window dimensions", () => {
    it("should inject useWindowDimensions hook when w-screen is used", () => {
      const input = `
        import { View } from 'react-native';

        function MyComponent() {
          return <View className="w-screen bg-white" />;
        }
      `;

      const output = transform(input, undefined, true);

      // Should import useWindowDimensions
      expect(output).toContain("useWindowDimensions");

      // Should inject hook call
      expect(output).toContain("_twDimensions");
      expect(output).toContain("useWindowDimensions()");

      // Should use in inline style
      expect(output).toMatch(/width:\s*_twDimensions\.width/);
    });

    it("should inject useWindowDimensions hook when h-screen is used", () => {
      const input = `
        import { View } from 'react-native';

        function MyComponent() {
          return <View className="h-screen bg-white" />;
        }
      `;

      const output = transform(input, undefined, true);

      // Should import and inject hook
      expect(output).toContain("useWindowDimensions");
      expect(output).toContain("_twDimensions");

      // Should use in inline style
      expect(output).toMatch(/height:\s*_twDimensions\.height/);
    });

    it("should inject hook only once for multiple w-screen/h-screen uses", () => {
      const input = `
        import { View } from 'react-native';

        function MyComponent() {
          return (
            <>
              <View className="w-screen" />
              <View className="h-screen" />
              <View className="w-screen h-screen" />
            </>
          );
        }
      `;

      const output = transform(input, undefined, true);

      // Count hook injections (should be exactly 1)
      const hookMatches = output.match(/_twDimensions\s*=\s*useWindowDimensions\(\)/g) ?? [];
      expect(hookMatches.length).toBe(1);
    });
  });

  describe("combined scenarios", () => {
    it("should inject color scheme and platform imports together", () => {
      const input = `
        import { View } from 'react-native';

        function MyComponent() {
          return (
            <View className="ios:p-4 android:p-2 dark:bg-gray-900 light:bg-white" />
          );
        }
      `;

      const output = transform(input, undefined, true);

      // Should have all imports
      expect(output).toContain("StyleSheet");
      expect(output).toContain("Platform");
      expect(output).toContain("useColorScheme");

      // Should have color scheme hook
      expect(output).toContain("_twColorScheme");
      expect(output).toContain("useColorScheme()");

      // Should have platform select
      expect(output).toContain("Platform.select");
    });

    it("should inject window dimensions and color scheme hooks in separate components", () => {
      const input = `
        import { View } from 'react-native';

        function ComponentA() {
          return <View className="w-screen h-screen" />;
        }

        function ComponentB() {
          return <View className="dark:bg-gray-900 light:bg-white" />;
        }
      `;

      const output = transform(input, undefined, true);

      // Should have both hooks
      expect(output).toContain("useColorScheme");
      expect(output).toContain("useWindowDimensions");

      // Should have both hook calls
      expect(output).toContain("_twColorScheme");
      expect(output).toContain("_twDimensions");

      // Should have StyleSheet
      expect(output).toContain("StyleSheet.create");
    });
  });
});
