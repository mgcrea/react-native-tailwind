---
title: Compile-Time tw
description: Use the tw template tag for compile-time style generation
---

For static or compile-time determinable styles, you can use the `tw` template tag that gets transformed by the Babel plugin. This provides **zero runtime overhead** as all styles are compiled to `StyleSheet.create` calls.

## Import

```typescript
import { tw } from "@mgcrea/react-native-tailwind";
```

## Basic Usage

```tsx
import { View, Text, Pressable } from "react-native";
import { tw } from "@mgcrea/react-native-tailwind";

// Static styles - transformed at compile time
const containerStyles = tw`flex-1 p-4 bg-gray-100`;
const buttonStyles = tw`p-4 rounded-lg bg-blue-500`;
const textStyles = tw`text-white font-bold text-center`;

export function Example() {
  return (
    <View style={containerStyles.style}>
      <Pressable style={buttonStyles.style}>
        <Text style={textStyles.style}>Click me</Text>
      </Pressable>
    </View>
  );
}
```

## With State Modifiers

The compile-time `tw` supports state modifiers (`active:`, `focus:`, `disabled:`) that return a `TwStyle` object with separate style properties:

```tsx
import { Pressable, Text } from "react-native";
import { tw } from "@mgcrea/react-native-tailwind";

const buttonStyles = tw`bg-blue-500 active:bg-blue-700 disabled:bg-gray-300`;

export function Button({ disabled }) {
  return (
    <Pressable
      disabled={disabled}
      style={(state) => [
        buttonStyles.style,
        state.pressed && buttonStyles.activeStyle,
        disabled && buttonStyles.disabledStyle,
      ]}
    >
      <Text style={tw`text-white font-bold`.style}>Press me</Text>
    </Pressable>
  );
}
```

## Transformation Example

The Babel plugin transforms your code at compile time:

```tsx
// Input
const styles = tw`bg-blue-500 active:bg-blue-700 m-4`;

// Compiled Output
const styles = {
  style: _twStyles._bg_blue_500_m_4,
  activeStyle: _twStyles._active_bg_blue_700,
};

const _twStyles = StyleSheet.create({
  _bg_blue_500_m_4: { backgroundColor: "#2b7fff", margin: 16 },
  _active_bg_blue_700: { backgroundColor: "#1854d6" },
});
```

## With Color Scheme Modifiers

Color-scheme modifiers (`dark:`, `light:`, `scheme:`) work in `tw` calls inside React components:

```tsx
import { View, Text } from "react-native";
import { tw } from "@mgcrea/react-native-tailwind";

function MyComponent() {
  // ✅ Works! Hook is injected automatically
  const textStyles = tw`text-gray-900 dark:text-gray-100`;

  return <Text style={textStyles.style}>Hello</Text>;
}
```

**Generated output:**

```tsx
import { useColorScheme } from "react-native";

function MyComponent() {
  const _twColorScheme = useColorScheme();

  const textStyles = {
    style: [
      styles._text_gray_900,
      _twColorScheme === "dark" && styles._dark_text_gray_100,
    ],
    darkStyle: styles._dark_text_gray_100, // Also available for manual processing
  };

  return <Text style={textStyles.style}>Hello</Text>;
}
```

:::note
Both `style` (with runtime conditionals) and `darkStyle`/`lightStyle` properties are generated. This allows:
- **Automatic behavior**: Use `textStyles.style` for automatic dark/light switching
- **Manual control**: Access `textStyles.darkStyle` or `textStyles.lightStyle` for custom logic
:::

### Shared Module-Level Theme Styles

Hooks cannot run at module scope, but theme-aware styles can still be declared there and resolved reactively where they are consumed:

```tsx
import { View } from "react-native";
import { tw, useTwStyle } from "@mgcrea/react-native-tailwind";

const cardStyles = tw`bg-white dark:bg-gray-900 light:bg-gray-50`;

export function Card({ selected }: { selected: boolean }) {
  // Call the hook unconditionally inside the component.
  const themedCardStyle = useTwStyle(cardStyles);

  return <View style={selected ? themedCardStyle : undefined} />;
}
```

At compile time, the module-level declaration retains every variant without attempting an invalid module-level hook call:

```tsx
const cardStyles = {
  style: styles._bg_white,
  darkStyle: styles._dark_bg_gray_900,
  lightStyle: styles._light_bg_gray_50,
};
```

`useTwStyle` uses the color-scheme hook configured in the Babel plugin, including custom theme-provider hooks. The consuming component re-renders and selects the matching variant when that hook changes. The module-level `style` property remains the base style; it is intentionally not a mutable global value.

For an explicit or controlled scheme value, use the pure resolver:

```tsx
import { resolveTwStyle } from "@mgcrea/react-native-tailwind";
import { useAppColorScheme } from "./theme";

export function Card() {
  const colorScheme = useAppColorScheme();
  const themedCardStyle = resolveTwStyle(cardStyles, colorScheme);

  return <View style={themedCardStyle} />;
}
```

The same API works with `twStyle("...")` declarations.

## With Platform Modifiers

Platform modifiers (`ios:`, `android:`, `web:`) work in `tw` calls anywhere:

```tsx
import { tw } from "@mgcrea/react-native-tailwind";

function MyComponent() {
  // ✅ Works! Platform import is added automatically
  const cardStyles = tw`p-4 ios:p-6 android:p-8`;

  return <View style={cardStyles.style}>...</View>;
}
```

**Generated output:**

```tsx
import { Platform } from "react-native";

function MyComponent() {
  const cardStyles = {
    style: [
      styles._p_4,
      Platform.select({
        ios: styles._ios_p_6,
        android: styles._android_p_8,
      }),
    ],
    iosStyle: styles._ios_p_6, // Also available for manual processing
    androidStyle: styles._android_p_8,
  };

  return <View style={cardStyles.style}>...</View>;
}
```

## Important Constraints

:::caution[Must be inside a React component for color-scheme modifiers]
Color-scheme modifiers require the `tw` call to be inside a React component for hook injection:

```tsx
// ❌ BAD: Used outside component (no hook can be injected)
const globalStyles = tw`bg-white dark:bg-gray-900`;

// ✅ GOOD: Used inside component
function MyComponent() {
  const styles = tw`bg-white dark:bg-gray-900`;
  return <View style={styles.style} />;
}
```
:::

:::caution[Cannot use in nested functions]
```tsx
function MyComponent() {
  const createStyles = () => {
    // ❌ BAD: Nested function (hook injection would violate Rules of Hooks)
    return tw`bg-white dark:bg-gray-900`;
  };

  // ✅ GOOD: Component-level
  const styles = tw`bg-white dark:bg-gray-900`;
}
```
:::

## Compatibility with Modifiers

Color-scheme modifiers work alongside state modifiers:

```tsx
const buttonStyles = tw`bg-white dark:bg-gray-900 active:bg-blue-500`;

// Generated:
{
  style: [
    styles._bg_white,
    _twColorScheme === "dark" && styles._dark_bg_gray_900
  ],
  activeStyle: styles._active_bg_blue_500  // Separate property
}
```

**Key difference:**

- **Color-scheme modifiers** → Runtime conditionals in `style` array
- **State modifiers** → Separate properties (`activeStyle`, `focusStyle`, etc.)

## When to Use

Use compile-time `tw` when:

- ✅ You want to extract styles as constants
- ✅ Styles are static or compile-time determinable
- ✅ You want zero runtime overhead
- ✅ You're building reusable component libraries

Use `className` prop instead when:

- ✅ Styles are component-specific
- ✅ You prefer inline styling
- ✅ You want more concise code

## Complete Example

```tsx
import { View, Text, ScrollView } from "react-native";
import { Pressable } from "@mgcrea/react-native-tailwind";
import { tw } from "@mgcrea/react-native-tailwind";

// Extracted style constants
const containerStyles = tw`flex-1 bg-white dark:bg-gray-900`;
const headerStyles = tw`text-3xl font-bold text-gray-900 dark:text-white mb-4`;
const cardStyles = tw`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4`;
const buttonStyles = tw`bg-blue-500 active:bg-blue-700 p-4 rounded-lg items-center`;

export function StyledApp() {
  return (
    <ScrollView style={containerStyles.style}>
      <View className="p-4">
        <Text style={headerStyles.style}>My App</Text>

        <View style={cardStyles.style}>
          <Text style={tw`text-lg font-semibold mb-2`.style}>Card Title</Text>
          <Text style={tw`text-gray-600 dark:text-gray-300`.style}>
            Card description
          </Text>
        </View>

        <Pressable
          style={(state) => [
            buttonStyles.style,
            state.pressed && buttonStyles.activeStyle,
          ]}
        >
          <Text style={tw`text-white font-semibold`.style}>Action Button</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
```

## What's Next?

- Learn about [Runtime tw](/react-native-tailwind/guides/runtime-tw/) for fully dynamic styling
- Explore [State Modifiers](/react-native-tailwind/guides/state-modifiers/) for interactive components
- Check out [Color Scheme](/react-native-tailwind/guides/color-scheme/) for dark mode support
