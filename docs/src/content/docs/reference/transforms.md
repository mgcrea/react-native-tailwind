---
title: Transforms
description: Apply 2D and 3D transformations to views
---

Apply 2D and 3D transformations to views with React Native's transform API. All transforms compile to optimized transform arrays at build time.

## Scale

### Uniform Scale

```tsx
<View className="scale-0" />    // scale: 0
<View className="scale-50" />   // scale: 0.5
<View className="scale-80" />   // scale: 0.8
<View className="scale-100" />  // scale: 1
<View className="scale-110" />  // scale: 1.1
<View className="scale-150" />  // scale: 1.5
```

### Axis-Specific Scale

```tsx
<View className="scale-x-110" /> // scaleX: 1.1
<View className="scale-y-90" />  // scaleY: 0.9
<View className="-scale-x-80" /> // scaleX: -0.8
```

### Arbitrary Values

```tsx
<View className="scale-[1.23]" />   // scale: 1.23
<View className="scale-[80%]" />    // scale: 0.8
<View className="scale-x-[0.5]" />  // scaleX: 0.5
<View className="scale-y-[2.5]" />  // scaleY: 2.5
```

## Rotate

### 2D Rotation

```tsx
<View className="rotate-0" />    // rotate: '0deg'
<View className="rotate-45" />   // rotate: '45deg'
<View className="rotate-90" />   // rotate: '90deg'
<View className="rotate-180" />  // rotate: '180deg'
<View className="-rotate-45" />  // rotate: '-45deg'
```

### 3D Rotation

```tsx
<View className="rotate-x-45" /> // rotateX: '45deg'
<View className="rotate-y-30" /> // rotateY: '30deg'
<View className="rotate-z-90" /> // rotateZ: '90deg'
```

### Arbitrary Values

```tsx
<View className="rotate-[37deg]" />     // rotate: '37deg'
<View className="-rotate-[15deg]" />    // rotate: '-15deg'
<View className="rotate-x-[30deg]" />   // rotateX: '30deg'
```

## Translate

Uses spacing scale (same as `m-*`, `p-*`):

```tsx
<View className="translate-x-4" />  // translateX: 16
<View className="translate-y-2" />  // translateY: 8
<View className="-translate-x-4" /> // translateX: -16
<View className="-translate-y-2" /> // translateY: -8
```

### Arbitrary Values

```tsx
<View className="translate-x-[50px]" />  // translateX: 50
<View className="translate-y-[100px]" /> // translateY: 100
<View className="translate-x-[50%]" />   // translateX: '50%'
```

## Skew

```tsx
<View className="skew-x-6" />   // skewX: '6deg'
<View className="skew-y-3" />   // skewY: '3deg'
<View className="-skew-x-6" />  // skewX: '-6deg'
<View className="-skew-y-3" />  // skewY: '-3deg'
```

### Arbitrary Values

```tsx
<View className="skew-x-[15deg]" />  // skewX: '15deg'
<View className="-skew-y-[8deg]" />  // skewY: '-8deg'
```

## Perspective

```tsx
<View className="perspective-500">
  <View className="rotate-x-45 w-16 h-16 bg-blue-500" />
</View>
```

### Arbitrary Values

```tsx
<View className="perspective-[1500]" /> // perspective: 1500
<View className="perspective-[2000]" /> // perspective: 2000
```

## Examples

### Scale

```tsx
<View className="scale-110 p-4">
  <Text>Scaled content (1.1x larger)</Text>
</View>
```

### Rotate

```tsx
<View className="rotate-45 w-16 h-16 bg-blue-500" />
```

### Translate

```tsx
<View className="translate-x-4 translate-y-2 bg-red-500 p-4">
  Moved 16px right, 8px down
</View>
```

### 3D Rotation

```tsx
<View className="rotate-x-45 w-16 h-16 bg-yellow-500" />
<View className="rotate-y-30 w-16 h-16 bg-teal-500" />
```

### Skew

```tsx
<View className="skew-x-6 w-16 h-16 bg-cyan-500" />
```

## Multiple Transforms

Multiple transform classes on the same element are fully supported. Different transform types are combined into a single transform array:

```tsx
// ✅ Different transform types are combined
<View className="scale-110 rotate-45 w-16 h-16 bg-blue-500" />
// Compiles to: { transform: [{ scale: 1.1 }, { rotate: '45deg' }], ... }

// ✅ Combine many transforms
<View className="perspective-500 rotate-45 scale-110 translate-x-4" />
// Compiles to: { transform: [{ perspective: 500 }, { rotate: '45deg' }, { scale: 1.1 }, { translateX: 16 }] }
```

### Same Transform Type: Last Wins

When the same transform type appears multiple times, the last value wins (matching Tailwind CSS behavior):

```tsx
// Same type: last wins
<View className="rotate-45 rotate-90" />
// { transform: [{ rotate: '90deg' }] }

// Mixed: different types combined, same types replaced
<View className="rotate-45 scale-110 rotate-90" />
// { transform: [{ rotate: '90deg' }, { scale: 1.1 }] }
```

This is useful for responsive overrides or conditional styling where you want to override a base transform.

## What's Not Supported

- `transform-origin` — Not available in React Native (transforms always use center as origin)

## Note

All transform parsing happens at compile-time with zero runtime overhead. Each transform compiles to a React Native transform array:

- `transform: [{ scale: 1.1 }]`
- `transform: [{ rotate: '45deg' }]`
- `transform: [{ translateX: 16 }]`

## Related

- [Spacing](/react-native-tailwind/reference/spacing/) - For translate values
- [Layout](/react-native-tailwind/reference/layout/) - Positioning utilities
