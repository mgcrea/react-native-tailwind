---
title: Outlines
description: Outline width, style, and offset utilities
---

Utilities for controlling the outline style of an element.

> **Note**: Outline support requires React Native 0.73+ (New Architecture) and setting the `outline` style property.

## Outline Width

```tsx
<View className="outline" />        // outlineWidth: 1, outlineStyle: 'solid'
<View className="outline-0" />      // outlineWidth: 0
<View className="outline-2" />      // outlineWidth: 2
<View className="outline-4" />      // outlineWidth: 4
<View className="outline-[2px]" />  // outlineWidth: 2
<View className="outline-none" />   // outlineWidth: 0
```

## Outline Color

```tsx
<View className="outline-blue-500" />    // outlineColor: '#3B82F6'
<View className="outline-[#ff0000]" />   // outlineColor: '#ff0000'
<View className="outline-red-500/50" />  // outlineColor: '#EF4444' (50% opacity)
<View className="dark:outline-gray-200" />  // Theme-aware outline color
<View className="scheme:outline-brand" />   // Expands to light/dark variants
```

## Outline Style

```tsx
<View className="outline-solid" />   // outlineStyle: 'solid'
<View className="outline-dashed" />  // outlineStyle: 'dashed'
<View className="outline-dotted" />  // outlineStyle: 'dotted'
```

## Outline Offset

Utilities for controlling the offset of an element's outline.

```tsx
<View className="outline-offset-0" />      // outlineOffset: 0
<View className="outline-offset-1" />      // outlineOffset: 1
<View className="outline-offset-2" />      // outlineOffset: 2
<View className="outline-offset-4" />      // outlineOffset: 4
<View className="outline-offset-[3px]" />  // outlineOffset: 3
```

## Example

```tsx
<View className="w-32 h-32 bg-white outline outline-blue-500 outline-offset-2 rounded-lg" />
```

## Related

- [Borders](/react-native-tailwind/reference/borders/) - Border width, radius, and style utilities
- [Colors](/react-native-tailwind/reference/colors/) - Color utilities
- [Shadows](/react-native-tailwind/reference/shadows/) - Shadow and elevation
