---
title: Filters
description: Apply native visual filters to views
---

Apply composable visual filters with React Native's native `filter` style property.

> **Note**: Filters require a React Native version and renderer that support the `filter` style property. Applying a filter also implies `overflow: hidden`, so descendants are clipped to the view's bounds.

## Platform Support

| Utility | iOS | Android |
|---------|-----|---------|
| `brightness-*` | ✅ | ✅ |
| `blur-*` | ❌ | ✅ |
| `contrast-*` | ❌ | ✅ |
| `drop-shadow-*` | ❌ | ✅ |
| `grayscale-*` | ❌ | ✅ |
| `hue-rotate-*` | ❌ | ✅ |
| `invert-*` | ❌ | ✅ |
| `saturate-*` | ❌ | ✅ |
| `sepia-*` | ❌ | ✅ |

React Native also supports filter-level opacity on iOS and Android, but Tailwind's `opacity-*` class already maps to the native `opacity` style property in this package. It remains a regular opacity utility to avoid an ambiguous class collision.

## Percentage Filters

Brightness, contrast, grayscale, invert, saturate, and sepia use percentage-based numeric utilities:

```tsx
<View className="brightness-101" /> // { brightness: 1.01 }
<View className="contrast-125" />   // { contrast: 1.25 }
<View className="grayscale-50" />   // { grayscale: 0.5 }
<View className="invert-25" />      // { invert: 0.25 }
<View className="saturate-150" />   // { saturate: 1.5 }
<View className="sepia-75" />       // { sepia: 0.75 }
```

The full-effect forms are also supported:

```tsx
<View className="grayscale invert sepia" />
```

Use bracket syntax for raw React Native amounts or explicit percentages:

```tsx
<View className="brightness-[1.01]" /> // { brightness: 1.01 }
<View className="contrast-[80%]" />    // { contrast: 0.8 }
```

## Blur

Blur uses Tailwind's pixel scale:

```tsx
<View className="blur-xs" />  // { blur: 4 }
<View className="blur-sm" />  // { blur: 8 }
<View className="blur-md" />  // { blur: 12 }
<View className="blur-lg" />  // { blur: 16 }
<View className="blur-xl" />  // { blur: 24 }
<View className="blur-2xl" /> // { blur: 40 }
<View className="blur-3xl" /> // { blur: 64 }
<View className="blur-none" />
```

Arbitrary blur values accept non-negative pixels:

```tsx
<View className="blur-[2px]" />
<View className="blur-[2.5]" />
```

## Hue Rotation

Numeric hue rotation utilities use degrees and support negative values:

```tsx
<View className="hue-rotate-45" />  // { hueRotate: '45deg' }
<View className="-hue-rotate-90" /> // { hueRotate: '-90deg' }
```

Arbitrary values support `deg` and `rad` angles:

```tsx
<View className="hue-rotate-[22.5deg]" />
<View className="hue-rotate-[0.5rad]" />
```

## Drop Shadow

Drop shadows use Tailwind's `xs` through `2xl` presets and operate on the rendered alpha mask:

```tsx
<View className="drop-shadow-xs" />
<View className="drop-shadow-md" />
<View className="drop-shadow-xl/50" />
<View className="drop-shadow-none" />
```

Arbitrary drop shadows accept X offset, Y offset, optional blur, and a preset, custom, or hex color:

```tsx
<View className="drop-shadow-[0_4px_4px_#00000080]" />
<View className="drop-shadow-[-2px_3px_#ff0000]" />
```

Standalone `drop-shadow-{color}` utilities are not emitted because React Native requires a complete `dropShadow` object rather than Tailwind's separate CSS color variable. Put the color in an arbitrary drop shadow instead.

## Combining Filters

Different filter utilities compile into one ordered native filter array. If the same filter type appears more than once, the last value wins:

```tsx
<View className="blur-sm brightness-110 contrast-125" />
// filter: [{ blur: 8 }, { brightness: 1.1 }, { contrast: 1.25 }]

<View className="brightness-110 brightness-90" />
// filter: [{ brightness: 0.9 }]
```

Use `filter-none` to clear all composable filters on the same element. It wins regardless of class-string order, matching Tailwind's generated CSS:

```tsx
<View className="blur-sm brightness-110 filter-none" /> // filter: []
<View className="filter-none blur-sm brightness-110" /> // filter: []
```

Unsupported units, malformed drop shadows, and negative values where React Native requires non-negative amounts are ignored with a development warning.
