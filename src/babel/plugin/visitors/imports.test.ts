import { describe, expect, it } from "vitest";

import { transform } from "../../../../test/helpers/babelTransform.js";

describe("imports visitor - import tracking and injection", () => {
  it("should not add StyleSheet import to files without className usage", () => {
    const input = `
      import { View, Text } from 'react-native';

      function MyComponent() {
        return <View><Text>Hello</Text></View>;
      }
    `;

    const output = transform(input, undefined, true);

    // Should not mutate the import by adding StyleSheet
    // Count occurrences of "StyleSheet" in output
    const styleSheetCount = (output.match(/StyleSheet/g) ?? []).length;
    expect(styleSheetCount).toBe(0);

    // Should not have _twStyles definition
    expect(output).not.toContain("_twStyles");
    expect(output).not.toContain("StyleSheet.create");

    // Original imports should remain unchanged
    expect(output).toContain("View");
    expect(output).toContain("Text");
  });

  it("should add StyleSheet import only when className is used", () => {
    const input = `
      import { View } from 'react-native';

      function MyComponent() {
        return <View className="m-4 p-2" />;
      }
    `;

    const output = transform(input, undefined, true);

    // Should have StyleSheet import (both single and double quotes)
    expect(output).toMatch(/import.*StyleSheet.*from ['"]react-native['"]|require\(['"]react-native['"]\)/);

    // Should have _twStyles definition
    expect(output).toContain("_twStyles");
    expect(output).toContain("StyleSheet.create");
  });

  it("should add Platform import only when platform modifiers are used", () => {
    const input = `
      import { View } from 'react-native';

      function MyComponent() {
        return <View className="ios:m-4 android:m-2" />;
      }
    `;

    const output = transform(input, undefined, true);

    // Should have Platform import
    expect(output).toContain("Platform");

    // Should have StyleSheet import too
    expect(output).toContain("StyleSheet");

    // Should use Platform.select
    expect(output).toContain("Platform.select");
  });

  it("should not add Platform import without platform modifiers", () => {
    const input = `
      import { View } from 'react-native';

      function MyComponent() {
        return <View className="m-4 p-2" />;
      }
    `;

    const output = transform(input, undefined, true);

    // Should not have Platform import
    const platformCount = (output.match(/Platform/g) ?? []).length;
    expect(platformCount).toBe(0);

    // Should still have StyleSheet
    expect(output).toContain("StyleSheet");
  });
});
