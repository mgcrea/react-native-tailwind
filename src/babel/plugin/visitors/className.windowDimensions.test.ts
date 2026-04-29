/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, expect, it, vi } from "vitest";

import { transform } from "../../../../test/helpers/babelTransform.js";

describe("className visitor - window dimensions (w-screen/h-screen)", () => {
  it("should inject useWindowDimensions hook for w-screen in function component", () => {
    const input = `
      import React from 'react';
      import { View } from 'react-native';

      export function MyComponent() {
        return <View className="w-screen bg-white" />;
      }
    `;

    const output = transform(input, undefined, true);

    // Should import useWindowDimensions
    expect(output).toContain("useWindowDimensions");
    expect(output).toMatch(/import.*useWindowDimensions.*from ['"]react-native['"]/);

    // Should inject hook call
    expect(output).toContain("_twDimensions");
    expect(output).toContain("useWindowDimensions()");

    // Should generate inline style with width
    expect(output).toMatch(/width:\s*_twDimensions\.width/);

    // Should have StyleSheet for static styles
    expect(output).toContain("_twStyles");
    expect(output).toContain("backgroundColor:");
  });

  it("should inject useWindowDimensions hook for h-screen in function component", () => {
    const input = `
      import React from 'react';
      import { View } from 'react-native';

      export function MyComponent() {
        return <View className="h-screen bg-blue-500" />;
      }
    `;

    const output = transform(input, undefined, true);

    // Should import useWindowDimensions
    expect(output).toContain("useWindowDimensions");

    // Should inject hook call
    expect(output).toContain("_twDimensions");
    expect(output).toContain("useWindowDimensions()");

    // Should generate inline style with height
    expect(output).toMatch(/height:\s*_twDimensions\.height/);
  });

  it("should handle both w-screen and h-screen together", () => {
    const input = `
      import React from 'react';
      import { View } from 'react-native';

      function FullScreenView() {
        return <View className="w-screen h-screen bg-gray-100" />;
      }
    `;

    const output = transform(input, undefined, true);

    // Should inject hook
    expect(output).toContain("useWindowDimensions()");

    // Should generate inline style with both dimensions
    expect(output).toMatch(/width:\s*_twDimensions\.width/);
    expect(output).toMatch(/height:\s*_twDimensions\.height/);

    // Should have StyleSheet for static styles
    expect(output).toContain("backgroundColor:");
  });

  it("should handle w-screen/h-screen with arrow function component", () => {
    const input = `
      import React from 'react';
      import { View } from 'react-native';

      const MyComponent = () => {
        return <View className="w-screen" />;
      };
    `;

    const output = transform(input, undefined, true);

    // Should inject hook
    expect(output).toContain("useWindowDimensions()");
    expect(output).toMatch(/width:\s*_twDimensions\.width/);
  });

  it("should handle concise arrow function and inject hook", () => {
    const input = `
      import React from 'react';
      import { View } from 'react-native';

      const MyComponent = () => <View className="w-screen" />;
    `;

    const output = transform(input, undefined, true);

    // Should convert concise arrow to block statement and inject hook
    expect(output).toContain("useWindowDimensions()");
    expect(output).toContain("return");
    expect(output).toMatch(/width:\s*_twDimensions\.width/);
  });

  it("should merge useWindowDimensions with existing react-native import", () => {
    const input = `
      import React from 'react';
      import { View, Text } from 'react-native';

      function MyComponent() {
        return <View className="w-screen" />;
      }
    `;

    const output = transform(input, undefined, true);

    // Should merge useWindowDimensions into existing import (not create separate import)
    // The key is that useWindowDimensions should be imported
    expect(output).toContain("useWindowDimensions");
  });

  it("should warn when w-screen/h-screen used outside function component", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const input = `
      import React from 'react';
      import { View } from 'react-native';

      class MyComponent extends React.Component {
        render() {
          return <View className="w-screen" />;
        }
      }
    `;

    transform(input, undefined, true);

    // Should warn about usage in class component
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("w-screen/h-screen classes require a function component scope"),
    );

    consoleWarnSpy.mockRestore();
  });

  it("should combine w-screen with other static classes", () => {
    const input = `
      import React from 'react';
      import { View } from 'react-native';

      function MyComponent() {
        return <View className="w-screen p-4 bg-white rounded-lg" />;
      }
    `;

    const output = transform(input, undefined, true);

    // Should have static styles in StyleSheet
    expect(output).toContain("padding:");
    expect(output).toContain("backgroundColor:");
    expect(output).toContain("borderRadius:");

    // Should have runtime dimension
    expect(output).toMatch(/width:\s*_twDimensions\.width/);

    // Should combine as array
    expect(output).toContain("_twStyles");
    expect(output).toContain("_twDimensions");
  });

  it("should inject hook only once even with multiple w-screen/h-screen uses", () => {
    const input = `
      import React from 'react';
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

    // Count occurrences of hook injection (should be exactly 1)
    const hookMatches = output.match(/_twDimensions\s*=\s*useWindowDimensions\(\)/g) ?? [];
    expect(hookMatches.length).toBe(1);
  });

  it("should handle aliased useWindowDimensions import", () => {
    const input = `
      import React from 'react';
      import { View, useWindowDimensions as useDims } from 'react-native';

      function MyComponent() {
        const dims = useDims();
        return <View className="w-screen" />;
      }
    `;

    const output = transform(input, undefined, true);

    // Should use the aliased name
    expect(output).toContain("useDims()");
    // Should still generate _twDimensions variable for our use
    expect(output).toContain("_twDimensions");
  });

  it("should error when w-screen is combined with dark: modifier", () => {
    const input = `
      import { View } from 'react-native';
      export function MyComponent() {
        return <View className="dark:w-screen bg-white" />;
      }
    `;

    expect(() => transform(input, undefined, true)).toThrow(
      /w-screen and h-screen cannot be combined with color scheme modifiers/,
    );
  });

  it("should error when h-screen is combined with light: modifier", () => {
    const input = `
      import { View } from 'react-native';
      export function MyComponent() {
        return <View className="light:h-screen p-4" />;
      }
    `;

    expect(() => transform(input, undefined, true)).toThrow(
      /w-screen and h-screen cannot be combined with color scheme modifiers/,
    );
  });

  it("should error when w-screen is combined with active: modifier", () => {
    const input = `
      import { Pressable } from 'react-native';
      export function MyComponent() {
        return <Pressable className="active:w-screen bg-blue-500" />;
      }
    `;

    expect(() => transform(input, undefined, true)).toThrow(
      /w-screen and h-screen cannot be combined with state modifiers/,
    );
  });

  it("should error when h-screen is combined with hover: modifier", () => {
    const input = `
      import { Pressable } from 'react-native';
      export function MyComponent() {
        return <Pressable className="hover:h-screen p-4" />;
      }
    `;

    expect(() => transform(input, undefined, true)).toThrow(
      /w-screen and h-screen cannot be combined with state modifiers/,
    );
  });

  it("should error when w-screen is combined with ios: modifier", () => {
    const input = `
      import { View } from 'react-native';
      export function MyComponent() {
        return <View className="ios:w-screen bg-white" />;
      }
    `;

    expect(() => transform(input, undefined, true)).toThrow(
      /w-screen and h-screen cannot be combined with.*platform modifiers/,
    );
  });

  it("should error when h-screen is combined with android: modifier", () => {
    const input = `
      import { View } from 'react-native';
      export function MyComponent() {
        return <View className="android:h-screen p-4" />;
      }
    `;

    expect(() => transform(input, undefined, true)).toThrow(
      /w-screen and h-screen cannot be combined with.*platform modifiers/,
    );
  });

  it("should error when w-screen is used in tw`` call", () => {
    const input = `
      import { tw } from '@mgcrea/react-native-tailwind';
      export function MyComponent() {
        const styles = tw\`w-screen bg-white\`;
        return <View style={styles.style} />;
      }
    `;

    expect(() => transform(input, undefined, true)).toThrow(
      /w-screen and h-screen are not supported in tw.*or twStyle/,
    );
  });

  it("should error when h-screen is used in twStyle() call", () => {
    const input = `
      import { twStyle } from '@mgcrea/react-native-tailwind';
      export function MyComponent() {
        const styles = twStyle('h-screen p-4');
        return <View style={styles.style} />;
      }
    `;

    expect(() => transform(input, undefined, true)).toThrow(
      /w-screen and h-screen are not supported in tw.*or twStyle/,
    );
  });

  it("should properly merge w-screen with Pressable style function", () => {
    const input = `
      import { Pressable } from 'react-native';
      export function MyComponent() {
        return (
          <Pressable
            className="w-screen bg-white"
            style={({ pressed }) => [pressed && { opacity: 0.5 }]}
          />
        );
      }
    `;

    const output = transform(input, undefined, true);

    // Should inject useWindowDimensions hook
    expect(output).toContain("useWindowDimensions");
    expect(output).toContain("_twDimensions");

    // Should wrap the style function properly
    expect(output).toContain("_state");
    // Should contain the runtime dimension access
    expect(output).toContain("_twDimensions.width");
    // Should call the existing function
    expect(output).toContain("pressed");
  });

  it("should properly merge h-screen with arrow function style", () => {
    const input = `
      import { Pressable } from 'react-native';
      export function MyComponent() {
        return (
          <Pressable
            className="h-screen p-4"
            style={(state) => state.pressed ? { opacity: 0.8 } : null}
          />
        );
      }
    `;

    const output = transform(input, undefined, true);

    // Should inject useWindowDimensions hook
    expect(output).toContain("useWindowDimensions");
    expect(output).toContain("_twDimensions");

    // Should wrap the style function
    expect(output).toContain("_state");
    // Should contain the runtime dimension access
    expect(output).toContain("_twDimensions.height");
    // Should call the original function
    expect(output).toContain("state.pressed");
  });

  it("should error when w-screen is in base classes with dark: modifier", () => {
    const input = `
      import { View } from 'react-native';
      export function MyComponent() {
        return <View className="w-screen dark:bg-black" />;
      }
    `;

    expect(() => transform(input, undefined, true)).toThrow(
      /w-screen and h-screen cannot be combined with modifiers/,
    );
  });

  it("should error when w-screen is in base classes with ios: modifier", () => {
    const input = `
      import { View } from 'react-native';
      export function MyComponent() {
        return <View className="w-screen ios:p-4" />;
      }
    `;

    expect(() => transform(input, undefined, true)).toThrow(
      /w-screen and h-screen cannot be combined with modifiers/,
    );
  });
});
