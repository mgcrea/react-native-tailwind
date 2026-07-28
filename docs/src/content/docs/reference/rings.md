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

Width utilities set the native outline width and solid style. Combine them with a ring color; use the bare `ring` utility when you want the default blue treatment.

## Ring Color

Use preset, custom, arbitrary, and opacity-modified colors:

```tsx
<View className="ring-2 ring-red-500" />
<View className="ring-2 ring-blue-500/25" />
<View className="ring-2 ring-[#123456]" />
<View className="ring-2 ring-brand" />
```

Custom ring colors are read from `theme.extend.colors` like other color utilities.

## Ring Offset

Ring offsets map to React Native's `outlineOffset`:

```tsx
<View className="ring ring-offset-2" />
<View className="ring-2 ring-offset-[3px]" />
```

Inset rings and ring-offset colors do not have direct React Native outline equivalents and are not supported.
