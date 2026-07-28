---
title: Layout
description: Flexbox, positioning, and display utilities
---

Control layout with flexbox, positioning, and display utilities.

## Flexbox

### Flex

```tsx
<View className="flex" />        // display: 'flex'
<View className="flex-1" />      // flex: 1
<View className="flex-auto" />   // flexGrow: 1, flexShrink: 1
<View className="flex-none" />   // flexGrow: 0, flexShrink: 0
```

### Direction

```tsx
<View className="flex-row" />          // flexDirection: 'row'
<View className="flex-row-reverse" />  // flexDirection: 'row-reverse'
<View className="flex-col" />          // flexDirection: 'column'
<View className="flex-col-reverse" />  // flexDirection: 'column-reverse'
```

### Wrapping

```tsx
<View className="flex-wrap" />         // flexWrap: 'wrap'
<View className="flex-wrap-reverse" /> // flexWrap: 'wrap-reverse'
<View className="flex-nowrap" />       // flexWrap: 'nowrap'
```

### Align Items

```tsx
<View className="items-start" />    // alignItems: 'flex-start'
<View className="items-end" />      // alignItems: 'flex-end'
<View className="items-center" />   // alignItems: 'center'
<View className="items-baseline" /> // alignItems: 'baseline'
<View className="items-stretch" />  // alignItems: 'stretch'
```

### Justify Content

```tsx
<View className="justify-start" />   // justifyContent: 'flex-start'
<View className="justify-end" />     // justifyContent: 'flex-end'
<View className="justify-center" />  // justifyContent: 'center'
<View className="justify-between" /> // justifyContent: 'space-between'
<View className="justify-around" />  // justifyContent: 'space-around'
<View className="justify-evenly" />  // justifyContent: 'space-evenly'
```

### Align Self

```tsx
<View className="self-auto" />     // alignSelf: 'auto'
<View className="self-start" />    // alignSelf: 'flex-start'
<View className="self-end" />      // alignSelf: 'flex-end'
<View className="self-center" />   // alignSelf: 'center'
<View className="self-stretch" />  // alignSelf: 'stretch'
<View className="self-baseline" /> // alignSelf: 'baseline'
```

### Flex Grow & Shrink

```tsx
<View className="grow" />     // flexGrow: 1
<View className="grow-0" />   // flexGrow: 0
<View className="shrink" />   // flexShrink: 1
<View className="shrink-0" /> // flexShrink: 0
```

## Positioning

```tsx
<View className="absolute" /> // position: 'absolute'
<View className="relative" /> // position: 'relative'
```

## Overflow

```tsx
<View className="overflow-hidden" />  // overflow: 'hidden'
<View className="overflow-visible" /> // overflow: 'visible'
<View className="overflow-scroll" />  // overflow: 'scroll'
```

## Opacity

Named opacity utilities use the existing five-point percentage scale. Use an arbitrary raw value or percentage for an exact value:

```tsx
<View className="opacity-65" />       // opacity: 0.65
<View className="opacity-[.67]" />    // opacity: 0.67
<View className="opacity-[67%]" />    // opacity: 0.67
```

Arbitrary values must resolve to React Native's supported range from `0` through `1`.

## Display

```tsx
<View className="flex" />   // display: 'flex'
<View className="hidden" /> // display: 'none'
```

## Common Patterns

### Centered Content

```tsx
<View className="flex-1 items-center justify-center">
  <Text>Centered</Text>
</View>
```

### Horizontal Layout

```tsx
<View className="flex-row items-center gap-4">
  <Image className="w-12 h-12" source={avatar} />
  <View className="flex-1">
    <Text className="font-bold">Name</Text>
    <Text className="text-sm text-gray-600">Description</Text>
  </View>
</View>
```

### Space Between

```tsx
<View className="flex-row justify-between items-center">
  <Text className="font-bold">Title</Text>
  <Pressable>
    <Text className="text-blue-500">Action</Text>
  </Pressable>
</View>
```

### Grid Layout (using flex-wrap)

```tsx
<View className="flex-row flex-wrap gap-2">
  <View className="w-[48%] bg-gray-200 p-4">Item 1</View>
  <View className="w-[48%] bg-gray-200 p-4">Item 2</View>
  <View className="w-[48%] bg-gray-200 p-4">Item 3</View>
  <View className="w-[48%] bg-gray-200 p-4">Item 4</View>
</View>
```

### Absolute Positioning

```tsx
<View className="relative h-64 bg-gray-100">
  <View className="absolute top-4 right-4 bg-blue-500 p-2 rounded">
    <Text className="text-white">Badge</Text>
  </View>
</View>
```

## Related

- [Spacing](/react-native-tailwind/reference/spacing/) - Margin, padding, gap
- [Sizing](/react-native-tailwind/reference/sizing/) - Width and height utilities
