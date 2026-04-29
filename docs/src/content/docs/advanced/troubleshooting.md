---
title: Troubleshooting
description: Common issues and solutions
---

Common issues and their solutions.

## TypeScript `className` Errors

If TypeScript doesn't recognize the `className` prop on React Native components:

### Solution

1. Create the type declaration file:

```typescript
// src/types/react-native-tailwind.d.ts
import "@mgcrea/react-native-tailwind/react-native";
```

2. Verify it's covered by your `tsconfig.json` `include` pattern:

```json
{
  "include": ["src/**/*"]
}
```

3. Restart TypeScript server:
   - VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server"
   - Or restart your editor

## Babel Plugin Not Working

If className props aren't being transformed:

### Solution

**Clear Metro cache:**

```bash
npx react-native start --reset-cache
```

**Verify `babel.config.js`:**

```javascript
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    "@mgcrea/react-native-tailwind/babel", // Make sure this is present
  ],
};
```

**Check plugin is loaded:**

Look for transformation in your bundled code. The `className` props should be replaced with `style` props.

## Custom Colors Not Recognized

If custom colors from `tailwind.config.*` aren't working:

### Solution

1. **Config location**: Must be in project root or parent directory

2. **Config format**: Verify proper export

```javascript
// CommonJS
module.exports = { theme: { extend: { colors: { ... } } } };

// ESM
export default { theme: { extend: { colors: { ... } } } };
```

3. **Clear cache**: Config changes require Metro cache reset

```bash
npx react-native start --reset-cache
```

4. **Use `theme.extend.colors`**: Don't use `theme.colors` directly (overrides defaults)

```javascript
// ✅ Good
{
  theme: {
    extend: {
      colors: { primary: "#1d4ed8" }
    }
  }
}

// ❌ Bad (overrides all defaults)
{
  theme: {
    colors: { primary: "#1d4ed8" }
  }
}
```

## Dynamic className Warning

If you see warnings about dynamic className:

### Understanding

The Babel plugin processes static strings and a small set of dynamic AST shapes at compile time:

- **String literal**: `"m-4 p-2"`
- **Ternary**: `cond ? "a" : "b"`
- **Template literal**: `` `m-4 ${cond ? "p-4" : "p-2"}` ``
- **Logical AND**: `cond && "a"`

Anything else (`||`, `??`, function calls like `cn(...)`, plain identifiers, member expressions, runtime-interpolated values) cannot be parsed at compile time.

### Solution

```tsx
// ❌ Doesn't work - runtime variable
const spacing = 4;
<View className={`p-${spacing}`} />

// ❌ Doesn't work - || / ?? / cn() / variables
<View className={cond || "p-4"} />
<View className={cn("p-4", isActive && "bg-blue-500")} />

// ✅ Use inline style for dynamic values
<View className="border-2" style={{ padding: spacing * 4 }} />

// ✅ Or use conditional expressions (hybrid optimization)
<View className={spacing === 4 ? "p-4" : "p-8"} />

// ✅ Convert || to a ternary
<View className={cond ? "p-4" : ""} />

// ✅ Or use runtime tw for fully dynamic needs
import { tw } from "@mgcrea/react-native-tailwind/runtime";
<View style={tw`p-${spacing}`} />
```

### Warning fires on a *supported* shape (e.g. a ternary)?

If you see this warning on an expression that **is** in the supported list above (most often a ternary on `className` or a `*ClassName` prop), the cause is almost always **plugin ordering** in your `babel.config.js`.

Plugins that transform JSX — most commonly [`babel-plugin-react-compiler`](https://react.dev/reference/react-compiler) — must run **after** `@mgcrea/react-native-tailwind/babel`. If they run first, they restructure the AST in a way that breaks dynamic className detection.

```javascript
// babel.config.js
module.exports = {
  plugins: [
    // ✅ react-native-tailwind FIRST
    "@mgcrea/react-native-tailwind/babel",
    // Then React Compiler
    "babel-plugin-react-compiler",
  ],
};
```

After fixing the order, reset Metro's cache:

```bash
npx react-native start --reset-cache
```

See [Babel Configuration → Plugin Order](/react-native-tailwind/advanced/babel-configuration/#plugin-order) for details.

## State Modifiers Not Working

If `active:`, `focus:`, or `disabled:` modifiers aren't working:

### Solution

State modifiers require using the enhanced components from this package:

```tsx
// ❌ Wrong - using React Native's Pressable
import { Pressable } from "react-native";
<Pressable className="active:bg-blue-700" />

// ✅ Correct - using enhanced Pressable
import { Pressable } from "@mgcrea/react-native-tailwind";
<Pressable className="active:bg-blue-700" />
```

Same for TextInput:

```tsx
// ❌ Wrong
import { TextInput } from "react-native";

// ✅ Correct
import { TextInput } from "@mgcrea/react-native-tailwind";
```

## Color Scheme Modifiers Not Working

If `dark:` or `light:` modifiers aren't working:

### Common Causes

1. **Class components**: Color scheme modifiers require functional components (uses hooks)

```tsx
// ❌ Doesn't work - class component
class MyComponent extends React.Component {
  render() {
    return <View className="dark:bg-gray-900" />;
  }
}

// ✅ Works - functional component
function MyComponent() {
  return <View className="dark:bg-gray-900" />;
}
```

2. **React Native version**: Requires React Native 0.62+ for `useColorScheme()` hook

3. **Nested functions**: Color scheme modifiers in `tw` template must be at component level

```tsx
// ❌ Doesn't work - nested function
function MyComponent() {
  const getStyles = () => tw`dark:bg-gray-900`; // Hook injection would violate Rules of Hooks
}

// ✅ Works - component level
function MyComponent() {
  const styles = tw`dark:bg-gray-900`;
}
```

## Styles Not Applying

If styles aren't being applied to components:

### Solution

1. **Check component support**: Not all React Native components support all style properties

2. **Verify prop name**: Make sure you're using the correct style prop name

```tsx
// ScrollView content container
<ScrollView contentContainerClassName="..." />  // ✅
<ScrollView className="..." />                  // ❌ (won't style content)
```

3. **Check style conflicts**: Later styles may override earlier ones

4. **Inspect generated code**: Look at the transformed output to verify styles are being generated

## Build Errors

If you encounter build errors after installing:

### Solution

1. **Clear all caches:**

```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear Watchman (if using)
watchman watch-del-all

# Clear node_modules and reinstall
rm -rf node_modules
npm install

# iOS: Clear pods and reinstall
cd ios && rm -rf Pods Podfile.lock && pod install && cd ..

# Clear build folders
rm -rf ios/build android/build android/app/build
```

2. **Rebuild:**

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## Performance Issues

If you experience slow build times:

### Understanding

The Babel plugin parses className strings at build time, which adds some overhead to the compilation process.

### Tips

- Use static className strings when possible (faster to parse)
- Avoid extremely long className strings
- Consider splitting complex components into smaller ones
- The overhead is typically 50-200ms per file

## Getting Help

If you can't resolve your issue:

1. **Search existing issues**: [GitHub Issues](https://github.com/mgcrea/react-native-tailwind/issues)
2. **Create a minimal reproduction**: Isolate the problem in a small example
3. **Include details**:
   - React Native version
   - Package version
   - Babel configuration
   - Error messages
   - Code sample

## Related

- [Babel Configuration](/react-native-tailwind/advanced/babel-configuration/) - Plugin options
- [Custom Colors](/react-native-tailwind/advanced/custom-colors/) - Theme configuration
- [Quick Start](/react-native-tailwind/getting-started/quick-start/) - Setup guide
