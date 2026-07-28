---
title: Spacing
description: Margin, padding, and gap utilities
---

Control spacing with margin, padding, and gap utilities.

## Margin

Apply margin to all sides or specific directions:

### All Sides

```tsx
<View className="m-4" /> // margin: 16
<View className="m-0" /> // margin: 0
<View className="m-8" /> // margin: 32
```

### Horizontal & Vertical

```tsx
<View className="mx-4" /> // marginHorizontal: 16
<View className="my-2" /> // marginVertical: 8
```

### Directional

```tsx
<View className="mt-4" /> // marginTop: 16
<View className="mr-2" /> // marginRight: 8
<View className="mb-6" /> // marginBottom: 24
<View className="ml-3" /> // marginLeft: 12
```

## Padding

Apply padding to all sides or specific directions:

### All Sides

```tsx
<View className="p-4" /> // padding: 16
<View className="p-0" /> // padding: 0
<View className="p-8" /> // padding: 32
```

### Horizontal & Vertical

```tsx
<View className="px-4" /> // paddingHorizontal: 16
<View className="py-2" /> // paddingVertical: 8
```

### Directional

```tsx
<View className="pt-4" /> // paddingTop: 16
<View className="pr-2" /> // paddingRight: 8
<View className="pb-6" /> // paddingBottom: 24
<View className="pl-3" /> // paddingLeft: 12
```

## Gap

Control spacing between flex items:

```tsx
<View className="flex-row gap-4">
  <View className="flex-1 bg-blue-500" />
  <View className="flex-1 bg-red-500" />
</View>
```

Use directional gaps to control the horizontal and vertical axes independently:

```tsx
<View className="flex-row flex-wrap gap-x-2 gap-y-1.5">
  {/* columnGap: 8, rowGap: 6 */}
</View>

<View className="gap-x-[12px] gap-y-[4.5px]">
  {/* columnGap: 12, rowGap: 4.5 */}
</View>
```

## Available Sizes

Spacing values follow a scale where `1` = 4px:

| Class | Value (px) |
|-------|------------|
| `0` | 0 |
| `0.5` | 2 |
| `1` | 4 |
| `1.5` | 6 |
| `2` | 8 |
| `2.5` | 10 |
| `3` | 12 |
| `3.5` | 14 |
| `4` | 16 |
| `5` | 20 |
| `6` | 24 |
| `7` | 28 |
| `8` | 32 |
| `9` | 36 |
| `10` | 40 |
| `11` | 44 |
| `12` | 48 |
| `14` | 56 |
| `16` | 64 |
| `20` | 80 |
| `24` | 96 |
| `28` | 112 |
| `32` | 128 |
| `36` | 144 |
| `40` | 160 |
| `44` | 176 |
| `48` | 192 |
| `52` | 208 |
| `56` | 224 |
| `60` | 240 |
| `64` | 256 |
| `72` | 288 |
| `80` | 320 |
| `96` | 384 |

## Arbitrary Values

Use arbitrary values for custom spacing not in the preset scale:

```tsx
<View className="m-[16px]" />   // margin: 16
<View className="p-[20px]" />   // padding: 20
<View className="mx-[24px]" />  // marginHorizontal: 24
<View className="gap-[12px]" /> // gap: 12
<View className="gap-x-[12px]" /> // columnGap: 12
<View className="gap-y-[6px]" />  // rowGap: 6
```

:::note
Arbitrary spacing values only support pixel values. Percentages and other units are not supported.
:::

## Common Patterns

### Card with consistent spacing

```tsx
<View className="p-4 m-2 gap-3 bg-white rounded-lg">
  <Text className="text-xl font-bold">Title</Text>
  <Text className="text-base">Description</Text>
  <View className="mt-2">
    <Text className="text-sm text-gray-600">Footer</Text>
  </View>
</View>
```

### Horizontal layout with gaps

```tsx
<View className="flex-row gap-4 p-4">
  <View className="w-12 h-12 bg-blue-500 rounded" />
  <View className="w-12 h-12 bg-red-500 rounded" />
  <View className="w-12 h-12 bg-green-500 rounded" />
</View>
```

### Responsive spacing

```tsx
<View className="p-4 ios:p-6 android:p-8">
  <Text>Platform-specific padding</Text>
</View>
```

## Related

- [Layout](/react-native-tailwind/reference/layout/) - Flexbox utilities
- [Sizing](/react-native-tailwind/reference/sizing/) - Width and height utilities
- [Arbitrary Values](/react-native-tailwind/advanced/arbitrary-values/) - Custom spacing values
