---
title: Filters
description: Apply native visual filters to views
---

Apply brightness filters with React Native's `filter` style property.

> **Note**: Filters require a React Native version and renderer that support the `filter` style property. Brightness is available on both iOS and Android when native filter support is enabled.

## Brightness

Numeric utilities use percentages, matching Tailwind CSS:

```tsx
<View className="brightness-50" />  // filter: [{ brightness: 0.5 }]
<View className="brightness-100" /> // filter: [{ brightness: 1 }]
<View className="brightness-125" /> // filter: [{ brightness: 1.25 }]
<View className="brightness-200" /> // filter: [{ brightness: 2 }]
```

Numeric brightness classes are dynamic, so values outside the examples also work:

```tsx
<View className="brightness-101" /> // filter: [{ brightness: 1.01 }]
```

## Arbitrary Values

Use bracket syntax for raw React Native amounts or percentages:

```tsx
<View className="brightness-[1.01]" /> // filter: [{ brightness: 1.01 }]
<View className="brightness-[80%]" />  // filter: [{ brightness: 0.8 }]
```

Brightness values must be non-negative. Unsupported units and negative values are ignored with a development warning.
