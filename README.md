<!-- # React Native Tailwind -->

<!-- markdownlint-disable MD033 -->
<p align="center">
  <a href="https://mgcrea.github.io/react-native-tailwind">
    <img src="./.github/assets/logo.png" alt="logo" width="480" height="300"/>
  </a>
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@mgcrea/react-native-tailwind">
    <img src="https://img.shields.io/npm/v/@mgcrea/react-native-tailwind.svg?style=for-the-badge" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/react-native-tailwind">
    <img src="https://img.shields.io/npm/dt/@mgcrea/react-native-tailwind.svg?style=for-the-badge" alt="npm total downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/react-native-tailwind">
    <img src="https://img.shields.io/npm/dm/@mgcrea/react-native-tailwind.svg?style=for-the-badge" alt="npm monthly downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/react-native-tailwind">
    <img src="https://img.shields.io/npm/l/@mgcrea/react-native-tailwind.svg?style=for-the-badge" alt="npm license" />
  </a>
  <br />
  <a href="https://github.com/mgcrea/react-native-tailwind/actions/workflows/main.yaml">
    <img src="https://img.shields.io/github/actions/workflow/status/mgcrea/react-native-tailwind/main.yaml?style=for-the-badge&branch=main" alt="build status" />
  </a>
  <a href="https://codecov.io/gh/mgcrea/react-native-tailwind">
    <img src="https://img.shields.io/codecov/c/github/mgcrea/react-native-tailwind?style=for-the-badge" alt="coverage" />
  </a>
  <a href="https://depfu.com/github/mgcrea/react-native-tailwind">
    <img src="https://img.shields.io/badge/dependencies-none-brightgreen?style=for-the-badge" alt="dependencies status" />
  </a>
</p>

## Overview

Compile-time Tailwind CSS for React Native with zero runtime overhead. Transform `className` props to optimized `StyleSheet.create` calls at build time using a Babel plugin.

## Features

- **⚡ Zero Runtime Overhead** - All transformations happen at compile time
- **🔧 No Dependencies** - Direct-to-React-Native style generation without tailwindcss package
- **🎯 Babel-only Setup** - No Metro configuration required
- **📝 TypeScript-first** - Full type safety and autocomplete support
- **🚀 Optimized Performance** - Compiles down to StyleSheet.create for optimal performance
- **🔀 Dynamic className** - Conditional styles support with compile-time optimization
- **📦 Small Bundle Size** - Only includes actual styles used in your app
- **🎯 State Modifiers** - `active:`, `hover:`, `focus:`, and `disabled:` modifiers for interactive components
- **📱 Platform Modifiers** - `ios:`, `android:`, and `web:` modifiers for platform-specific styling
- **🌓 Color Scheme Modifiers** - `dark:` and `light:` and `scheme:` modifiers for automatic theme adaptation
- **🎨 Custom Colors** - Extend the default palette via tailwind.config.\*
- **📐 Arbitrary Values** - Use custom sizes and borders: `w-[123px]`, `rounded-[20px]`
- **📜 Special Style Props** - Support for `contentContainerClassName`, `columnWrapperClassName`, and more

📊 **[How It Compares](https://mgcrea.github.io/react-native-tailwind/getting-started/how-it-compares/)** - See how this library stacks up against other React Native styling solutions.

### Related projects

- For iOS native components, check out [@mgcrea/react-native-swiftui](https://github.com/mgcrea/react-native-swiftui).
- For Android native components, check out [@mgcrea/react-native-jetpack-compose](https://github.com/mgcrea/react-native-jetpack-compose).

## Demo

![demo](./.github/assets/demo.gif)

## Quick Start

### Installation

```bash
npm install @mgcrea/react-native-tailwind
# or
yarn add @mgcrea/react-native-tailwind
# or
pnpm add @mgcrea/react-native-tailwind
```

### 1. Add Babel Plugin

Update your `babel.config.js`:

```javascript
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    "@mgcrea/react-native-tailwind/babel", // Add this line
  ],
};
```

> **Plugin order matters.** If you also use [`babel-plugin-react-compiler`](https://react.dev/reference/react-compiler) or any other plugin that transforms JSX, list `@mgcrea/react-native-tailwind/babel` **first**. Otherwise, dynamic `className` expressions (ternaries, template literals) may trigger spurious "not fully supported" warnings. See [Plugin Order](https://mgcrea.github.io/react-native-tailwind/advanced/babel-configuration/#plugin-order) for details.

### 2. Enable TypeScript Support (Optional)

Create a type declaration file to enable `className` prop autocomplete:

```typescript
// src/types/react-native-tailwind.d.ts
import "@mgcrea/react-native-tailwind/react-native";
```

### 3. Start Using className

```tsx
import { View, Text } from "react-native";

export function MyComponent() {
  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-xl font-bold text-blue-500">Hello, Tailwind!</Text>
    </View>
  );
}
```

## How It Works

The Babel plugin transforms your code at compile time:

**Input** (what you write):

```tsx
<View className={`rounded-lg p-4 ${isSelected ? "bg-blue-500 border border-blue-700" : "bg-gray-200"}`} />
```

**Output** (what Babel generates):

```tsx
import { StyleSheet } from "react-native";

<View
  style={[
    _twStyles._rounded_lg,
    _twStyles._p_4,
    isSelected ? _twStyles._bg_blue_500_border_border_blue_700 : _twStyles._bg_gray_200,
  ]}
/>;

const _twStyles = StyleSheet.create({
  _rounded_lg: { borderRadius: 8 },
  _p_4: { padding: 16 },
  _bg_blue_500_border_border_blue_700: { backgroundColor: "#3B82F6", borderWidth: 1, borderColor: "#1D4ED8" },
  _bg_gray_200: { backgroundColor: "#E5E7EB" },
});
```

## Documentation

📚 **[Full Documentation](https://mgcrea.github.io/react-native-tailwind/)**

- **[Getting Started](https://mgcrea.github.io/react-native-tailwind/getting-started/installation/)** - Installation and setup
- **[Guides](https://mgcrea.github.io/react-native-tailwind/guides/basic-usage/)** - Usage examples and patterns
- **[API Reference](https://mgcrea.github.io/react-native-tailwind/reference/spacing/)** - Complete utility reference
- **[Advanced](https://mgcrea.github.io/react-native-tailwind/advanced/custom-colors/)** - Configuration and customization

## Examples

### Dynamic Styles

```tsx
import { useState } from "react";
import { Pressable, Text } from "react-native";

export function ToggleButton() {
  const [isActive, setIsActive] = useState(false);

  return (
    <Pressable
      onPress={() => setIsActive(!isActive)}
      className={isActive ? "bg-green-500 p-4" : "bg-red-500 p-4"}
    >
      <Text className="text-white">{isActive ? "Active" : "Inactive"}</Text>
    </Pressable>
  );
}
```

### State Modifiers

```tsx
import { Pressable, Text } from "@mgcrea/react-native-tailwind";

export function MyButton() {
  return (
    <Pressable className="bg-blue-500 active:bg-blue-700 p-4 rounded-lg">
      <Text className="text-white font-semibold">Press Me</Text>
    </Pressable>
  );
}
```

### Dark Mode

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

### Platform-Specific Styles

```tsx
import { View, Text } from "react-native";

export function PlatformCard() {
  return (
    <View className="p-4 ios:p-6 android:p-8 bg-white rounded-lg">
      <Text className="text-base ios:text-blue-600 android:text-green-600">Platform-specific styles</Text>
    </View>
  );
}
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://mgcrea.github.io/react-native-tailwind/advanced/contributing/) for details.

## Credits

- [Tailwind CSS](https://tailwindcss.com/) - The utility-first CSS framework that revolutionized the way we style applications. If you enjoy this library, consider supporting them by purchasing [Tailwind Plus](https://tailwindcss.com/plus).

## Authors

- [Olivier Louvignes](https://github.com/mgcrea) - [@mgcrea](https://twitter.com/mgcrea)

```text
MIT License

Copyright (c) 2025 Olivier Louvignes <olivier@mgcrea.io>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
