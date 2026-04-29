import { transformSync } from "@babel/core";
import { describe, expect, it } from "vitest";

import babelPlugin from "../plugin.js";

/**
 * Helper to transform code with the Babel plugin
 */
function transform(code: string) {
  const result = transformSync(code, {
    presets: ["@babel/preset-react"],
    plugins: [babelPlugin],
    filename: "test.tsx",
    configFile: false,
    babelrc: false,
  });

  return result?.code ?? "";
}

describe("Style merging - mergeStyleAttribute", () => {
  it("should merge className with identifier style prop (object variable)", () => {
    const input = `
      import { TouchableOpacity } from 'react-native';
      export function Component() {
        const style = { marginHorizontal: 24 };
        return (
          <TouchableOpacity
            className="m-4"
            style={style}
            activeOpacity={0.8}
          />
        );
      }
    `;

    const output = transform(input);

    // Should have StyleSheet with className styles
    expect(output).toContain("StyleSheet.create");
    expect(output).toContain("_m_4");

    // Should create a simple array merge, NOT a function wrapper
    expect(output).toContain("[_twStyles._m_4, style]");

    // Should NOT have typeof check or _state parameter
    expect(output).not.toContain("typeof");
    expect(output).not.toContain("_state");

    // Should not have className in output
    expect(output).not.toContain("className");
  });

  it("should merge className with member expression style prop", () => {
    const input = `
      import { View } from 'react-native';
      export function Component(props) {
        return (
          <View
            className="p-2 bg-blue-500"
            style={props.style}
          />
        );
      }
    `;

    const output = transform(input);

    // Should have StyleSheet with className styles
    expect(output).toContain("StyleSheet.create");
    expect(output).toContain("_bg_blue_500_p_2");

    // Should create a simple array merge, NOT a function wrapper
    expect(output).toContain("[_twStyles._bg_blue_500_p_2, props.style]");

    // Should NOT have typeof check or _state parameter
    expect(output).not.toContain("typeof");
    expect(output).not.toContain("_state");

    // Should not have className in output
    expect(output).not.toContain("className");
  });

  it("should merge className with array style prop", () => {
    const input = `
      import { View } from 'react-native';
      export function Component() {
        return (
          <View
            className="m-4"
            style={[baseStyle, conditionalStyle]}
          />
        );
      }
    `;

    const output = transform(input);

    // Should have StyleSheet with className styles
    expect(output).toContain("StyleSheet.create");
    expect(output).toContain("_m_4");

    // Should create array merge without function wrapper
    expect(output).toContain("_twStyles._m_4");

    // Should NOT have typeof check or _state parameter
    expect(output).not.toContain("typeof");
    expect(output).not.toContain("_state");

    // Should not have className in output
    expect(output).not.toContain("className");
  });

  it("should merge className with inline object style prop", () => {
    const input = `
      import { View } from 'react-native';
      export function Component() {
        return (
          <View
            className="m-4 p-2"
            style={{ backgroundColor: 'red' }}
          />
        );
      }
    `;

    const output = transform(input);

    // Should have StyleSheet with className styles
    expect(output).toContain("StyleSheet.create");
    expect(output).toContain("_m_4_p_2");

    // Should create array merge
    expect(output).toContain("_twStyles._m_4_p_2");
    expect(output).toContain("backgroundColor:");

    // Should not have className in output
    expect(output).not.toContain("className");
  });

  it("should merge className with inline function style prop", () => {
    const input = `
      import { TextInput } from 'react-native';
      export function Component() {
        return (
          <TextInput
            className="border border-gray-300"
            style={({ focused, disabled }) => [
              baseStyles,
              focused && focusedStyles,
            ]}
          />
        );
      }
    `;

    const output = transform(input);

    // Should have StyleSheet with className styles
    expect(output).toContain("StyleSheet.create");
    expect(output).toContain("_border_border_gray_300");

    // Should create a wrapper function that merges both
    expect(output).toContain("_state");
    expect(output).toContain("_twStyles._border_border_gray_300");

    // Should have a function that accepts state and returns an array
    expect(output).toMatch(/_state\s*=>/);

    // Should not have className in output
    expect(output).not.toContain("className");
  });
});

describe("Style merging - mergeDynamicStyleAttribute", () => {
  it("should merge dynamic className with identifier style prop", () => {
    const input = `
      import { View } from 'react-native';
      export function Component({ isActive }) {
        const customStyle = { opacity: 0.8 };
        return (
          <View
            className={\`p-2 \${isActive ? 'bg-blue-500' : 'bg-gray-300'}\`}
            style={customStyle}
          />
        );
      }
    `;

    const output = transform(input);

    // Should have StyleSheet with both className styles
    expect(output).toContain("StyleSheet.create");
    expect(output).toContain("_p_2");
    expect(output).toContain("_bg_blue_500");
    expect(output).toContain("_bg_gray_300");

    // Should create array merge without function wrapper
    expect(output).toContain("customStyle");

    // Should NOT have typeof check or _state parameter for the style merge
    expect(output).not.toContain("typeof");
    expect(output).not.toContain("_state");

    // Should not have className in output
    expect(output).not.toContain("className");
  });

  it("should merge dynamic className with inline function style prop", () => {
    const input = `
      import { TextInput } from 'react-native';
      export function Component({ isError }) {
        return (
          <TextInput
            className={\`border \${isError ? 'border-red-500' : 'border-gray-300'}\`}
            style={({ focused }) => [
              baseStyles,
              focused && focusedStyles,
            ]}
          />
        );
      }
    `;

    const output = transform(input);

    // Should have StyleSheet with both className styles
    expect(output).toContain("StyleSheet.create");
    expect(output).toContain("_border");
    expect(output).toContain("_border_red_500");
    expect(output).toContain("_border_gray_300");

    // Should create a wrapper function that merges dynamic styles with function result
    expect(output).toContain("_state");

    // Should not have className in output
    expect(output).not.toContain("className");
  });

  it("should merge dynamic className with member expression style prop", () => {
    const input = `
      import { View } from 'react-native';
      export function Component({ variant, ...props }) {
        return (
          <View
            className={\`m-2 \${variant === 'primary' ? 'bg-blue-500' : 'bg-gray-300'}\`}
            style={props.style}
          />
        );
      }
    `;

    const output = transform(input);

    // Should have StyleSheet with both className styles
    expect(output).toContain("StyleSheet.create");
    expect(output).toContain("_m_2");
    expect(output).toContain("_bg_blue_500");
    expect(output).toContain("_bg_gray_300");

    // Should create array merge without function wrapper
    expect(output).toContain("props.style");

    // Should NOT have typeof check or _state parameter for the style merge
    expect(output).not.toContain("typeof");
    expect(output).not.toContain("_state");

    // Should not have className in output
    expect(output).not.toContain("className");
  });
});

describe("Style merging - edge cases", () => {
  it("should handle className without existing style prop", () => {
    const input = `
      import { View } from 'react-native';
      export function Component() {
        return <View className="m-4 p-2" />;
      }
    `;

    const output = transform(input);

    // Should have StyleSheet with className styles
    expect(output).toContain("StyleSheet.create");
    expect(output).toContain("_m_4_p_2");

    // Should have style prop with reference to stylesheet
    expect(output).toContain("style: _twStyles._m_4_p_2");

    // Should not have className in output
    expect(output).not.toContain("className");
  });

  it("should handle empty className", () => {
    const input = `
      import { View } from 'react-native';
      export function Component() {
        return <View className="" style={myStyle} />;
      }
    `;

    const output = transform(input);

    // Should not create StyleSheet
    expect(output).not.toContain("StyleSheet.create");

    // Should preserve original style prop
    expect(output).toContain("style: myStyle");

    // Should not have className in output
    expect(output).not.toContain("className");
  });

  it("should handle multiple components with different merge scenarios", () => {
    const input = `
      import { View, TouchableOpacity } from 'react-native';
      export function Component() {
        const style1 = { opacity: 0.5 };
        return (
          <>
            <View className="m-4" style={style1} />
            <TouchableOpacity className="p-2" />
            <View className="bg-red-500" style={[baseStyle]} />
          </>
        );
      }
    `;

    const output = transform(input);

    // Should have StyleSheet with all className styles
    expect(output).toContain("StyleSheet.create");
    expect(output).toContain("_m_4");
    expect(output).toContain("_p_2");
    expect(output).toContain("_bg_red_500");

    // Should handle identifier merge
    expect(output).toContain("[_twStyles._m_4, style1]");

    // Should handle no merge
    expect(output).toContain("_twStyles._p_2");

    // Should handle array merge
    expect(output).toContain("_twStyles._bg_red_500");

    // Should not have className in output
    expect(output).not.toContain("className");
  });
});

describe("Style function merging - mergeStyleFunctionAttribute", () => {
  it("should merge modifier className with existing function style prop", () => {
    const input = `
      import { Pressable } from 'react-native';
      export function Component() {
        return (
          <Pressable
            className="bg-blue-500 active:bg-blue-700"
            style={({ pressed }) => pressed && { opacity: 0.8 }}
          />
        );
      }
    `;

    const output = transform(input);

    // Should create wrapper function that merges both style functions
    expect(output).toContain("_state");
    expect(output).toMatch(/_state\s*=>/);

    // Should call both the new style function and existing style function
    expect(output).toContain("_bg_blue_500");
    expect(output).toContain("_active_bg_blue_700");

    // Should not have className in output
    expect(output).not.toContain("className");
  });

  it("should merge modifier className with static existing style when using Pressable", () => {
    const input = `
      import { Pressable } from 'react-native';
      export function Component() {
        return (
          <Pressable
            className="p-4 active:bg-gray-100"
            style={{ borderRadius: 8 }}
          />
        );
      }
    `;

    const output = transform(input);

    // Should create function that wraps className styles
    expect(output).toContain("_state");

    // Should include both the className styles and the static style
    expect(output).toContain("_p_4");
    expect(output).toContain("_active_bg_gray_100");
    expect(output).toContain("borderRadius");

    // Should not have className in output
    expect(output).not.toContain("className");
  });
});
