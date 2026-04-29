---
title: Babel Configuration
description: Complete reference for all Babel plugin options
---

Complete reference for all available Babel plugin configuration options.

## Basic Configuration

```javascript
// babel.config.js
module.exports = {
  plugins: [
    "@mgcrea/react-native-tailwind/babel", // Default options
  ],
};
```

## All Options

```javascript
// babel.config.js
module.exports = {
  plugins: [
    [
      "@mgcrea/react-native-tailwind/babel",
      {
        // Custom attributes to transform
        attributes: ["*ClassName"],

        // Custom StyleSheet identifier
        stylesIdentifier: "_twStyles",

        // Custom color scheme hook
        colorScheme: {
          importFrom: "react-native",
          importName: "useColorScheme",
        },

        // Scheme modifier configuration
        schemeModifier: {
          darkSuffix: "-dark",
          lightSuffix: "-light",
        },
      },
    ],
  ],
};
```

## Option Reference

### `attributes`

Configure which props to transform.

**Type:** `string[]`

**Default:** `["className", "contentContainerClassName", "columnWrapperClassName", "ListHeaderComponentClassName", "ListFooterComponentClassName"]`

**Examples:**

```javascript
// Exact matches
{
  attributes: ["className", "buttonClassName", "containerClassName"]
}

// Glob patterns
{
  attributes: ["*ClassName"]  // Matches any attribute ending in 'ClassName'
}

// Mixed
{
  attributes: [
    "className",
    "*ClassName",
    "custom*"
  ]
}
```

See [Custom Attributes](/react-native-tailwind/advanced/custom-attributes/) for more details.

### `stylesIdentifier`

Customize the StyleSheet constant name.

**Type:** `string`

**Default:** `"_twStyles"`

**Examples:**

```javascript
{
  stylesIdentifier: "styles"      // Most common
}

{
  stylesIdentifier: "tw"          // Short form
}

{
  stylesIdentifier: "tailwind"    // Descriptive
}
```

See [Custom Styles Identifier](/react-native-tailwind/advanced/custom-styles-identifier/) for more details.

### `colorScheme`

Configure custom color scheme hook.

**Type:** `{ importFrom: string; importName: string }`

**Default:** `{ importFrom: "react-native", importName: "useColorScheme" }`

**Examples:**

```javascript
// Custom hook
{
  colorScheme: {
    importFrom: "@/hooks/useColorScheme",
    importName: "useColorScheme"
  }
}

// React Navigation
{
  colorScheme: {
    importFrom: "@react-navigation/native",
    importName: "useTheme"  // Requires wrapper
  }
}

// Expo Router
{
  colorScheme: {
    importFrom: "expo-router",
    importName: "useColorScheme"
  }
}
```

See [Custom Color Scheme Hook](/react-native-tailwind/advanced/custom-color-scheme-hook/) for more details.

### `schemeModifier`

Configure `scheme:` modifier color suffixes.

**Type:** `{ darkSuffix: string; lightSuffix: string }`

**Default:** `{ darkSuffix: "-dark", lightSuffix: "-light" }`

**Examples:**

```javascript
// Default (matches "color-dark" and "color-light")
{
  schemeModifier: {
    darkSuffix: "-dark",
    lightSuffix: "-light"
  }
}

// PascalCase (matches "colorDark" and "colorLight")
{
  schemeModifier: {
    darkSuffix: "Dark",
    lightSuffix: "Light"
  }
}

// Custom (matches "color_d" and "color_l")
{
  schemeModifier: {
    darkSuffix: "_d",
    lightSuffix: "_l"
  }
}
```

See [Color Scheme - Scheme Modifier](/react-native-tailwind/guides/color-scheme/#scheme-modifier-convenience) for more details.

## Complete Example

```javascript
// babel.config.js
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    [
      "@mgcrea/react-native-tailwind/babel",
      {
        // Transform all *ClassName props
        attributes: ["*ClassName"],

        // Use 'styles' as identifier
        stylesIdentifier: "styles",

        // Use custom theme hook
        colorScheme: {
          importFrom: "@/context/ThemeContext",
          importName: "useColorScheme",
        },

        // PascalCase suffixes for scheme modifier
        schemeModifier: {
          darkSuffix: "Dark",
          lightSuffix: "Light",
        },
      },
    ],
  ],
};
```

## Environment-Specific Configuration

```javascript
// babel.config.js
module.exports = function (api) {
  const isTest = api.env("test");

  return {
    presets: ["module:@react-native/babel-preset"],
    plugins: [
      [
        "@mgcrea/react-native-tailwind/babel",
        {
          // Mock color scheme in tests
          colorScheme: isTest
            ? {
                importFrom: "@/test/mocks/useColorScheme",
                importName: "useColorScheme",
              }
            : undefined,
        },
      ],
    ],
  };
};
```

## Plugin Order

When combined with other Babel plugins that transform JSX (most notably [`babel-plugin-react-compiler`](https://react.dev/reference/react-compiler)), this plugin must run **first** in the `plugins` array.

```javascript
// babel.config.js
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    // ✅ react-native-tailwind first
    [
      "@mgcrea/react-native-tailwind/babel",
      {
        attributes: ["className", "*ClassName"],
      },
    ],

    // Then React Compiler and any other JSX-transforming plugins
    "babel-plugin-react-compiler",
  ],
};
```

### Why does order matter?

Babel runs plugins in the order they appear in the `plugins` array, applied during the same AST traversal. If React Compiler runs first, it memoizes JSX expressions and may restructure dynamic `className` values (ternaries, template literals) in ways the tailwind plugin no longer recognizes.

The most common symptom of incorrect ordering is this warning at build time, even when the expression is one of the supported shapes:

```text
[react-native-tailwind] Dynamic <attribute> values are not fully supported at <file>.
Use the <attribute>Style prop for dynamic values.
```

For example, the following ternary is supported by this plugin, but will trigger the warning if React Compiler runs first:

```tsx
<FlatList contentContainerClassName={isEmpty ? "flex-grow" : undefined} />
```

Move `@mgcrea/react-native-tailwind/babel` above `babel-plugin-react-compiler` and the warning disappears.

### Compatibility note

The output of this plugin is fully compatible with React Compiler — `style` props referencing `StyleSheet.create()` keys are stable references that React Compiler can safely memoize. Running this plugin first means React Compiler operates on the post-transform JSX and memoizes the resulting `style={...}` expressions correctly.

## Clearing Cache

After changing Babel configuration, clear Metro's cache:

```bash
npx react-native start --reset-cache
```

## Related

- [Custom Attributes](/react-native-tailwind/advanced/custom-attributes/)
- [Custom Styles Identifier](/react-native-tailwind/advanced/custom-styles-identifier/)
- [Custom Color Scheme Hook](/react-native-tailwind/advanced/custom-color-scheme-hook/)
- [Custom Colors](/react-native-tailwind/advanced/custom-colors/)
- [Troubleshooting](/react-native-tailwind/advanced/troubleshooting/)
