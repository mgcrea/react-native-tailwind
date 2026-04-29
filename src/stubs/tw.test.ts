import { describe, expect, it } from "vitest";

import { tw, twStyle } from "./tw";

describe("tw stub", () => {
  it("should throw error when tw() is called without Babel transformation", () => {
    expect(() => tw`bg-blue-500`).toThrow(
      "tw() must be transformed by the Babel plugin. " +
        "Ensure @mgcrea/react-native-tailwind/babel is configured in your babel.config.js. " +
        "For runtime parsing, use: import { tw } from '@mgcrea/react-native-tailwind/runtime'",
    );
  });

  it("should throw error when twStyle() is called without Babel transformation", () => {
    expect(() => twStyle("bg-blue-500")).toThrow(
      "twStyle() must be transformed by the Babel plugin. " +
        "Ensure @mgcrea/react-native-tailwind/babel is configured in your babel.config.js. " +
        "For runtime parsing, use: import { twStyle } from '@mgcrea/react-native-tailwind/runtime'",
    );
  });

  it("should throw error with template literal interpolation", () => {
    const dynamic = "active";
    expect(() => tw`bg-blue-500 ${dynamic}:bg-blue-700`).toThrow(
      "tw() must be transformed by the Babel plugin",
    );
  });
});
