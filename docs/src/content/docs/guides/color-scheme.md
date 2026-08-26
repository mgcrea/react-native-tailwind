---
title: Color Scheme
description: Support dark and light modes with automatic theme adaptation
---

Apply color scheme-specific styles using `dark:` and `light:` modifiers that automatically react to the device's appearance settings. These work on **all components in functional components** and compile to conditional expressions that use React Native's `useColorScheme()` hook.

## Basic Example

```tsx
import { View, Text } from "react-native";

export function ThemeCard() {
  return (
    <View className="bg-white dark:bg-gray-900 p-4 rounded-lg">
      <Text className="text-gray-900 dark:text-white">Adapts to device theme</Text>
    </View>
  );
}
```

**Transforms to:**

```tsx
import { useColorScheme, StyleSheet } from "react-native";

export function ThemeCard() {
  const _twColorScheme = useColorScheme();

  return (
    <View
      style={[
        _twStyles._bg_white_p_4_rounded_lg,
        _twColorScheme === "dark" && _twStyles._dark_bg_gray_900,
      ]}
    >
      <Text
        style={[
          _twStyles._text_gray_900,
          _twColorScheme === "dark" && _twStyles._dark_text_white,
        ]}
      >
        Adapts to device theme
      </Text>
    </View>
  );
}
```

## Common Use Cases

### Dark Mode Support

Automatically switches between light and dark themes:

```tsx
<View className="bg-white dark:bg-gray-900">
  <Text className="text-gray-900 dark:text-white">Theme-aware text</Text>
</View>
```

### Both Light and Dark Overrides

Specify both light and dark mode styles explicitly:

```tsx
<View className="bg-gray-100 light:bg-white dark:bg-gray-900">
  <Text className="text-gray-600 light:text-gray-900 dark:text-gray-100">
    Custom light & dark styles
  </Text>
</View>
```

### Mixed with Platform Modifiers

Combine color scheme with platform-specific styles:

```tsx
<View className="p-4 ios:p-6 dark:bg-gray-900 android:rounded-xl">
  <Text className="text-base dark:text-white ios:text-blue-600">
    Platform + theme aware
  </Text>
</View>
```

### Theme-Aware Cards

Card that looks great in both light and dark mode:

```tsx
<View className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
  <Text className="text-lg font-bold text-gray-900 dark:text-white mb-2">
    Card Title
  </Text>
  <Text className="text-gray-600 dark:text-gray-300">
    Card description text
  </Text>
</View>
```

## Supported Modifiers

| Modifier | Color Scheme | Description |
|----------|--------------|-------------|
| `dark:` | Dark mode | Styles when dark mode is active |
| `light:` | Light mode | Styles when light mode is active |

## Scheme Modifier (Convenience)

The `scheme:` modifier is a convenience feature that automatically expands to both `dark:` and `light:` modifiers for color classes.

### Basic Usage

```tsx
import { View, Text } from "react-native";

export function ThemedCard() {
  return (
    <View className="scheme:bg-systemGray p-4 rounded-lg">
      <Text className="scheme:text-systemLabel">Adaptive system colors</Text>
    </View>
  );
}
```

**Transforms to:**

```tsx
// Automatically expands to both dark: and light: modifiers
<View className="dark:bg-systemGray-dark light:bg-systemGray-light p-4 rounded-lg">
  <Text className="dark:text-systemLabel-dark light:text-systemLabel-light">
    Adaptive system colors
  </Text>
</View>
```

### Requirements

Define both color variants in your `tailwind.config.*`:

```javascript
// tailwind.config.mjs
export default {
  theme: {
    extend: {
      colors: {
        // Option 1: Nested structure
        systemGray: {
          light: "#8e8e93",
          dark: "#8e8e93",
        },
        systemLabel: {
          light: "#000000",
          dark: "#ffffff",
        },

        // Option 2: Flat structure with suffixes
        "primary-light": "#bfdbfe",
        "primary-dark": "#1e40af",
      },
    },
  },
};
```

### Supported Color Classes

The `scheme:` modifier only works with color utilities:

- ✅ `scheme:text-{color}` — Text colors
- ✅ `scheme:bg-{color}` — Background colors
- ✅ `scheme:border-{color}` — Border colors
- ❌ Other utilities — Ignored with development warning

Opacity modifiers are preserved when the semantic color expands:

```tsx
<View className="scheme:bg-primary/25" />
// dark:bg-primary-dark/25 light:bg-primary-light/25

<Text className="scheme:text-systemLabel/80" />
// dark:text-systemLabel-dark/80 light:text-systemLabel-light/80

<View className="scheme:bg-primary/[.37]" />
// dark:bg-primary-dark/[.37] light:bg-primary-light/[.37]
```

Named opacity modifiers use percentages from `/0` through `/100`. Arbitrary modifiers accept a raw alpha such as `/[.37]` or an explicit percentage such as `/[37%]`. If a configured color already includes an alpha channel, the modifier composes with that alpha instead of producing an invalid color.

### Use Cases

**Semantic color names:**

```tsx
<View className="scheme:bg-systemBackground p-4">
  <Text className="scheme:text-systemLabel">System-native appearance</Text>
  <View className="scheme:border-systemSeparator border-t mt-2 pt-2">
    <Text className="scheme:text-systemSecondaryLabel">Secondary text</Text>
  </View>
</View>
```

**Brand colors with theme variants:**

```tsx
<View className="scheme:bg-brand p-6 rounded-xl">
  <Text className="scheme:text-brandContrast text-xl font-bold">
    Branded Card
  </Text>
  <Text className="scheme:text-brandSubtle mt-2">
    Automatically adapts to user's theme preference
  </Text>
</View>
```

**Mixed with other modifiers:**

```tsx
import { Pressable } from "@mgcrea/react-native-tailwind";

<Pressable className="scheme:bg-interactive active:opacity-80 ios:p-6 android:p-4 rounded-lg">
  <Text className="scheme:text-interactiveText font-semibold">
    Press Me
  </Text>
</Pressable>
```

## Key Features

- ✅ **Reactive** — Automatically updates when user changes system appearance
- ✅ **Zero runtime parsing** — All styles compiled at build time
- ✅ **Auto-injected hook** — `useColorScheme()` automatically added to components
- ✅ **Works with all modifiers** — Combine with platform and state modifiers
- ✅ **Type-safe** — Full TypeScript autocomplete
- ✅ **Optimized** — Minimal runtime overhead (just conditional checks)

## Requirements

- ⚠️ **Functional components only** — Color scheme modifiers require hooks (React Native's `useColorScheme()`)
  - ✅ Works with function declarations: `function Component() { ... }`
  - ✅ Works with arrow functions: `const Component = () => { ... }`
  - ✅ Works with concise arrow functions: `const Component = () => <View className="dark:..." />`
  - ❌ **Not supported in class components** — Will show a warning
- ⚠️ **React Native 0.62+** — Requires the `useColorScheme` API

## Complete Example

```tsx
import { View, Text, ScrollView } from "react-native";
import { Pressable } from "@mgcrea/react-native-tailwind";

export function ThemedApp() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-4">
        <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          My App
        </Text>

        <View className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Card Title
          </Text>
          <Text className="text-gray-600 dark:text-gray-300">
            This card adapts to your device's theme automatically.
          </Text>
        </View>

        <Pressable className="bg-blue-500 dark:bg-blue-600 active:bg-blue-700 dark:active:bg-blue-800 p-4 rounded-lg items-center">
          <Text className="text-white font-semibold">Action Button</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
```

## What's Next?

- Learn about [Custom Color Scheme Hook](/react-native-tailwind/advanced/custom-color-scheme-hook/) to use theme providers
- Explore [Custom Colors](/react-native-tailwind/advanced/custom-colors/) for theme customization
- Check out [Platform Modifiers](/react-native-tailwind/guides/platform-modifiers/) for platform-specific styling
