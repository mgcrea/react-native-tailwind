---
title: Programmatic API
description: Access the parser and constants programmatically
---

Access the parser and constants programmatically for advanced use cases.

## Compile-Time Raw Colors

Use `useTwColor` when a React Native API needs a color string instead of a `style` object, such as navigation options, gradients, SVG, or Skia:

```tsx
import { useTwColor, useTwColors } from "@mgcrea/react-native-tailwind";

function Header() {
  const tintColor = useTwColor("scheme:accent");

  return <Icon color={tintColor} />;
}
```

Raw tokens use the same configured palette as color classes. Prefix a token with `scheme:` to resolve its configured light and dark variants reactively:

```tsx
const card = useTwColor("scheme:card");
const translucentBlue = useTwColor("blue-500/35");
const customHex = useTwColor("[#50d71e]");
```

The Babel plugin replaces each call with literal color strings. Scheme tokens reuse the plugin's configured `colorScheme` hook, including custom application theme hooks.
When that hook returns `"dark"`, the dark variant is used; `"light"`, `null`, and other non-dark values use the light variant, matching the default light appearance before a dark preference is active.

Use `useTwColors` to resolve several named colors with one injected scheme hook:

```tsx
function Screen() {
  const colors = useTwColors({
    background: "scheme:background",
    text: "scheme:text",
    accent: "accent",
  });

  return (
    <LinearGradient colors={[colors.background, colors.accent]}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </LinearGradient>
  );
}
```

Both helpers require static string literals and must be called unconditionally inside a function component. Unknown colors, unsupported modifiers, dynamic expressions, and module-scope calls produce a compile error. Utility-form tokens such as `bg-card` and `text-accent` are accepted, but raw palette names are preferred when the consumer needs only a string.

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

- `useTwColor` and `useTwColors` are compile-time APIs; `parseClassName` parses styles at runtime
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
