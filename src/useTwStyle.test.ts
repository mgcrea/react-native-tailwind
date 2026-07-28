import type { ViewStyle } from "react-native";
import { describe, expect, it } from "vitest";

import type { TwStyle } from "./types/runtime";
import { resolveTwStyle } from "./useTwStyle";

const baseStyle: ViewStyle = { backgroundColor: "white" };
const darkStyle: ViewStyle = { backgroundColor: "black" };
const lightStyle: ViewStyle = { backgroundColor: "ivory" };

const sharedStyles: TwStyle<ViewStyle> = {
  style: baseStyle,
  darkStyle,
  lightStyle,
};

describe("resolveTwStyle", () => {
  it("should append the matching dark or light variant", () => {
    expect(resolveTwStyle(sharedStyles, "dark")).toEqual([baseStyle, darkStyle]);
    expect(resolveTwStyle(sharedStyles, "light")).toEqual([baseStyle, lightStyle]);
  });

  it("should leave the base style unchanged for a null scheme or missing variant", () => {
    expect(resolveTwStyle(sharedStyles, "unspecified")).toBe(baseStyle);
    expect(resolveTwStyle(sharedStyles, null)).toBe(baseStyle);
    expect(resolveTwStyle({ style: baseStyle }, "dark")).toBe(baseStyle);
  });

  it("should append to an existing style array without mutating it", () => {
    const baseArray = [baseStyle, false] as Array<ViewStyle | false>;
    const styles: TwStyle<ViewStyle> = { style: baseArray, darkStyle };

    expect(resolveTwStyle(styles, "dark")).toEqual([baseStyle, false, darkStyle]);
    expect(baseArray).toEqual([baseStyle, false]);
  });

  it("should not duplicate a scheme style already resolved by the compiler", () => {
    const resolvedArray = [baseStyle, darkStyle] as Array<ViewStyle | false>;
    const styles: TwStyle<ViewStyle> = { style: resolvedArray, darkStyle };

    expect(resolveTwStyle(styles, "dark")).toBe(resolvedArray);
  });
});
