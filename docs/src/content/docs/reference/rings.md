---
title: Rings
description: Add browser-style focus rings to views
---

Add non-layout-shifting rings with React Native's native outline styles.

> **Note**: Rings require a React Native version and renderer that support `outlineWidth`, `outlineStyle`, `outlineColor`, and `outlineOffset`.

## Default Ring

The bare `ring` class adds a 3-unit, solid blue-500 ring at 50% opacity:

```tsx
<View className="ring" />
// {
//   outlineWidth: 3,
//   outlineStyle: 'solid',
//   outlineColor: '#2B7FFF80'
// }
```

This default intentionally mirrors the familiar blue browser-style focus treatment. Use color utilities when a different treatment is needed.

## Ring Width

Numeric and arbitrary widths are supported:

```tsx
<View className="ring-0" />
<View className="ring-1" />
<View className="ring-2.5" />
<View className="ring-[3px]" />
```

Width utilities set the native outline width and solid style and inherit the default browser-blue color. Combine them with a ring color to override that default; explicit colors win regardless of class order.

## Ring Color

Use preset, custom, arbitrary, and opacity-modified colors:

```tsx
<View className="ring-2 ring-red-500" />
<View className="ring-2 ring-blue-500/25" />
<View className="ring-2 ring-[#123456]" />
<View className="ring-2 ring-brand" />
```

Custom ring colors are read from `theme.extend.colors` like other color utilities.

Color-scheme modifiers such as `dark:ring-white` and `light:ring-black` work like other modified classes. The package-specific `scheme:ring-*` shorthand depends on the scheme color-expansion support and is documented with that modifier.

## Ring Offset

Ring offsets map to React Native's `outlineOffset`:

```tsx
<View className="ring ring-offset-2" />
<View className="ring-2 ring-offset-[3px]" />
```

Inset rings and ring-offset colors do not have direct React Native outline equivalents and are not supported.

Unlike Tailwind CSS's box-shadow rings, these browser-style rings intentionally use React Native outlines. This keeps them non-layout-shifting and close to native browser focus treatment, but a ring and an outline share the same native properties and cannot render as two independent effects.
