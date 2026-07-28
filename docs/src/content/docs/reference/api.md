---
title: Programmatic API
description: Access the parser and constants programmatically
---

Access the parser and constants programmatically for advanced use cases.

## parseClassName

Parse className strings to React Native styles:

```typescript
import { parseClassName } from "@mgcrea/react-native-tailwind";

// Basic usage
const styles = parseClassName("m-4 p-2 bg-blue-500");
// Returns: { margin: 16, padding: 8, backgroundColor: '#3B82F6' }
```

### With Custom Theme

```typescript
const customStyles = parseClassName("m-4 bg-primary font-custom", {
  colors: { primary: "#1d4ed8" },
  fontFamily: { custom: "My Custom Font" },
});
// Returns: { margin: 16, backgroundColor: '#1d4ed8', fontFamily: 'My Custom Font' }
```

### Type Signature

```typescript
function parseClassName(
  className: string,
  customTheme?: {
    colors?: Record<string, string>;
    fontFamily?: Record<string, string>;
  },
): ViewStyle | TextStyle | ImageStyle;
```

## useTwStyle

Reactively resolve a module-level compiled `tw` or `twStyle` object with React Native's current color scheme:

```tsx
import { tw, useTwStyle } from "@mgcrea/react-native-tailwind";

const sharedStyles = tw`bg-white dark:bg-gray-900`;

function Component() {
  const style = useTwStyle(sharedStyles);
  return <View style={style} />;
}
```

Call `useTwStyle` unconditionally inside a function component, like any React hook.

## resolveTwStyle

Resolve the same compiled object with an explicit scheme. Use this with custom theme hooks or controlled theme state:

```tsx
import { resolveTwStyle } from "@mgcrea/react-native-tailwind";

const style = resolveTwStyle(sharedStyles, "dark");
// [sharedStyles.style, sharedStyles.darkStyle]
```

The resolver accepts `"light"`, `"dark"`, React Native's `"unspecified"`, `null`, or `undefined`. It does not mutate the compiled style object or an existing style array.

## Constants

Access default color and spacing scales:

### COLORS

```typescript
import { COLORS } from "@mgcrea/react-native-tailwind";

const blueColor = COLORS["blue-500"]; // '#3B82F6'
const grayColor = COLORS["gray-300"]; // '#D1D5DB'
```

### SPACING_SCALE

```typescript
import { SPACING_SCALE } from "@mgcrea/react-native-tailwind";

const spacing = SPACING_SCALE[4]; // 16
const largeSpacing = SPACING_SCALE[8]; // 32
```

## Use Cases

### Dynamic Style Generation

```tsx
import { parseClassName } from "@mgcrea/react-native-tailwind";
import { useState } from "react";

function DynamicStyles() {
  const [color, setColor] = useState("blue");

  // Generate styles dynamically
  const buttonStyles = parseClassName(`bg-${color}-500 p-4 rounded-lg`);

  return (
    <Pressable style={buttonStyles}>
      <Text>Dynamic Button</Text>
    </Pressable>
  );
}
```

### Custom Style Builder

```typescript
import { parseClassName, COLORS } from "@mgcrea/react-native-tailwind";

function createButtonStyle(variant: "primary" | "secondary") {
  const variantClasses = {
    primary: "bg-blue-500 text-white",
    secondary: "bg-gray-200 text-gray-900",
  };

  return parseClassName(`p-4 rounded-lg ${variantClasses[variant]}`);
}

// Usage
const primaryStyle = createButtonStyle("primary");
const secondaryStyle = createButtonStyle("secondary");
```

### Testing

```typescript
import { parseClassName } from "@mgcrea/react-native-tailwind";

describe("Button styles", () => {
  it("should apply correct padding", () => {
    const styles = parseClassName("p-4");
    expect(styles.padding).toBe(16);
  });

  it("should apply correct background color", () => {
    const styles = parseClassName("bg-blue-500");
    expect(styles.backgroundColor).toBe("#3B82F6");
  });
});
```

### Style Composition

```typescript
import { parseClassName } from "@mgcrea/react-native-tailwind";

function composeStyles(...classNames: string[]) {
  return classNames.map((className) => parseClassName(className));
}

// Usage
const styles = composeStyles(
  "bg-white p-4",
  "border border-gray-200",
  "rounded-lg shadow"
);

<View style={styles}>
  <Text>Composed styles</Text>
</View>
```

### Integration with Theme Provider

```tsx
import { parseClassName } from "@mgcrea/react-native-tailwind";
import { useTheme } from "./ThemeProvider";

function ThemedComponent() {
  const { colors } = useTheme();

  const styles = parseClassName("p-4 bg-primary text-white", {
    colors: {
      primary: colors.brand,
    },
  });

  return (
    <View style={styles}>
      <Text>Themed content</Text>
    </View>
  );
}
```

## Important Notes

- `parseClassName` parses styles at **runtime**; `useTwStyle` and `resolveTwStyle` only select already compiled variants
- For production apps, prefer using `className` prop for compile-time optimization
- Use the programmatic API for:
  - Testing
  - Dynamic style generation
  - Custom tooling
  - Style composition utilities

## Performance Considerations

The programmatic API has some overhead since it parses at runtime:

| Approach                        | Performance         | When to Use                          |
| ------------------------------- | ------------------- | ------------------------------------ |
| `className` prop (compile-time) | ⚡ Zero overhead    | Production code (recommended)        |
| Programmatic API                | 🐌 Runtime parsing  | Testing, tooling, dynamic generation |
| Runtime `tw`                    | 🚀 Memoized parsing | Fully dynamic styling needs          |

## Related

- [Runtime tw](/react-native-tailwind/guides/runtime-tw/) - For fully dynamic styling
- [Custom Colors](/react-native-tailwind/advanced/custom-colors/) - Extend color palette
- [Troubleshooting](/react-native-tailwind/advanced/troubleshooting/) - Common issues
