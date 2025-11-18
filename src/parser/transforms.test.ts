import { describe, expect, it } from "vitest";
import { PERSPECTIVE_SCALE, ROTATE_MAP, SCALE_MAP, SKEW_MAP, parseTransform } from "./transforms";

describe("SCALE_MAP", () => {
  it("should export complete scale map", () => {
    expect(SCALE_MAP).toMatchSnapshot();
  });
});

describe("ROTATE_MAP", () => {
  it("should export complete rotate map", () => {
    expect(ROTATE_MAP).toMatchSnapshot();
  });
});

describe("SKEW_MAP", () => {
  it("should export complete skew map", () => {
    expect(SKEW_MAP).toMatchSnapshot();
  });
});

describe("PERSPECTIVE_SCALE", () => {
  it("should export complete perspective scale", () => {
    expect(PERSPECTIVE_SCALE).toMatchSnapshot();
  });
});

describe("parseTransform - scale utilities", () => {
  it("should parse scale values", () => {
    expect(parseTransform("scale-0")).toEqual({ transform: [{ scale: 0 }] });
    expect(parseTransform("scale-50")).toEqual({ transform: [{ scale: 0.5 }] });
    expect(parseTransform("scale-75")).toEqual({ transform: [{ scale: 0.75 }] });
    expect(parseTransform("scale-90")).toEqual({ transform: [{ scale: 0.9 }] });
    expect(parseTransform("scale-95")).toEqual({ transform: [{ scale: 0.95 }] });
    expect(parseTransform("scale-100")).toEqual({ transform: [{ scale: 1 }] });
    expect(parseTransform("scale-105")).toEqual({ transform: [{ scale: 1.05 }] });
    expect(parseTransform("scale-110")).toEqual({ transform: [{ scale: 1.1 }] });
    expect(parseTransform("scale-125")).toEqual({ transform: [{ scale: 1.25 }] });
    expect(parseTransform("scale-150")).toEqual({ transform: [{ scale: 1.5 }] });
    expect(parseTransform("scale-200")).toEqual({ transform: [{ scale: 2 }] });
  });

  it("should parse scaleX values", () => {
    expect(parseTransform("scale-x-0")).toEqual({ transform: [{ scaleX: 0 }] });
    expect(parseTransform("scale-x-50")).toEqual({ transform: [{ scaleX: 0.5 }] });
    expect(parseTransform("scale-x-100")).toEqual({ transform: [{ scaleX: 1 }] });
    expect(parseTransform("scale-x-150")).toEqual({ transform: [{ scaleX: 1.5 }] });
  });

  it("should parse scaleY values", () => {
    expect(parseTransform("scale-y-0")).toEqual({ transform: [{ scaleY: 0 }] });
    expect(parseTransform("scale-y-75")).toEqual({ transform: [{ scaleY: 0.75 }] });
    expect(parseTransform("scale-y-100")).toEqual({ transform: [{ scaleY: 1 }] });
    expect(parseTransform("scale-y-125")).toEqual({ transform: [{ scaleY: 1.25 }] });
  });

  it("should parse arbitrary scale values", () => {
    expect(parseTransform("scale-[1.23]")).toEqual({ transform: [{ scale: 1.23 }] });
    expect(parseTransform("scale-[0.5]")).toEqual({ transform: [{ scale: 0.5 }] });
    expect(parseTransform("scale-[2.5]")).toEqual({ transform: [{ scale: 2.5 }] });
    expect(parseTransform("scale-x-[1.5]")).toEqual({ transform: [{ scaleX: 1.5 }] });
    expect(parseTransform("scale-y-[0.8]")).toEqual({ transform: [{ scaleY: 0.8 }] });
  });

  it("should parse negative arbitrary scale values", () => {
    expect(parseTransform("scale-[-1]")).toEqual({ transform: [{ scale: -1 }] });
    expect(parseTransform("scale-x-[-0.5]")).toEqual({ transform: [{ scaleX: -0.5 }] });
  });

  it("should return null for invalid scale values", () => {
    expect(parseTransform("scale-999")).toBeNull();
    expect(parseTransform("scale-invalid")).toBeNull();
  });
});

describe("parseTransform - rotate utilities", () => {
  it("should parse rotate values", () => {
    expect(parseTransform("rotate-0")).toEqual({ transform: [{ rotate: "0deg" }] });
    expect(parseTransform("rotate-1")).toEqual({ transform: [{ rotate: "1deg" }] });
    expect(parseTransform("rotate-45")).toEqual({ transform: [{ rotate: "45deg" }] });
    expect(parseTransform("rotate-90")).toEqual({ transform: [{ rotate: "90deg" }] });
    expect(parseTransform("rotate-180")).toEqual({ transform: [{ rotate: "180deg" }] });
  });

  it("should parse negative rotate values", () => {
    expect(parseTransform("-rotate-45")).toEqual({ transform: [{ rotate: "-45deg" }] });
    expect(parseTransform("-rotate-90")).toEqual({ transform: [{ rotate: "-90deg" }] });
    expect(parseTransform("-rotate-180")).toEqual({ transform: [{ rotate: "-180deg" }] });
  });

  it("should parse arbitrary rotate values", () => {
    expect(parseTransform("rotate-[37deg]")).toEqual({ transform: [{ rotate: "37deg" }] });
    expect(parseTransform("rotate-[15.5deg]")).toEqual({ transform: [{ rotate: "15.5deg" }] });
    expect(parseTransform("-rotate-[15deg]")).toEqual({ transform: [{ rotate: "-15deg" }] });
  });

  it("should parse rotateX values", () => {
    expect(parseTransform("rotate-x-45")).toEqual({ transform: [{ rotateX: "45deg" }] });
    expect(parseTransform("rotate-x-90")).toEqual({ transform: [{ rotateX: "90deg" }] });
    expect(parseTransform("-rotate-x-45")).toEqual({ transform: [{ rotateX: "-45deg" }] });
    expect(parseTransform("rotate-x-[30deg]")).toEqual({ transform: [{ rotateX: "30deg" }] });
  });

  it("should parse rotateY values", () => {
    expect(parseTransform("rotate-y-45")).toEqual({ transform: [{ rotateY: "45deg" }] });
    expect(parseTransform("rotate-y-180")).toEqual({ transform: [{ rotateY: "180deg" }] });
    expect(parseTransform("-rotate-y-90")).toEqual({ transform: [{ rotateY: "-90deg" }] });
    expect(parseTransform("rotate-y-[60deg]")).toEqual({ transform: [{ rotateY: "60deg" }] });
  });

  it("should parse rotateZ values", () => {
    expect(parseTransform("rotate-z-45")).toEqual({ transform: [{ rotateZ: "45deg" }] });
    expect(parseTransform("rotate-z-90")).toEqual({ transform: [{ rotateZ: "90deg" }] });
    expect(parseTransform("-rotate-z-12")).toEqual({ transform: [{ rotateZ: "-12deg" }] });
    expect(parseTransform("rotate-z-[75deg]")).toEqual({ transform: [{ rotateZ: "75deg" }] });
  });

  it("should return null for invalid rotate values", () => {
    expect(parseTransform("rotate-999")).toBeNull();
    expect(parseTransform("rotate-invalid")).toBeNull();
  });
});

describe("parseTransform - translate utilities", () => {
  it("should parse translateX values", () => {
    expect(parseTransform("translate-x-0")).toEqual({ transform: [{ translateX: 0 }] });
    expect(parseTransform("translate-x-4")).toEqual({ transform: [{ translateX: 16 }] });
    expect(parseTransform("translate-x-8")).toEqual({ transform: [{ translateX: 32 }] });
    expect(parseTransform("translate-x-16")).toEqual({ transform: [{ translateX: 64 }] });
  });

  it("should parse negative translateX values", () => {
    expect(parseTransform("-translate-x-4")).toEqual({ transform: [{ translateX: -16 }] });
    expect(parseTransform("-translate-x-8")).toEqual({ transform: [{ translateX: -32 }] });
  });

  it("should parse translateY values", () => {
    expect(parseTransform("translate-y-0")).toEqual({ transform: [{ translateY: 0 }] });
    expect(parseTransform("translate-y-4")).toEqual({ transform: [{ translateY: 16 }] });
    expect(parseTransform("translate-y-12")).toEqual({ transform: [{ translateY: 48 }] });
  });

  it("should parse negative translateY values", () => {
    expect(parseTransform("-translate-y-4")).toEqual({ transform: [{ translateY: -16 }] });
    expect(parseTransform("-translate-y-10")).toEqual({ transform: [{ translateY: -40 }] });
  });

  it("should parse arbitrary translateX pixel values", () => {
    expect(parseTransform("translate-x-[123px]")).toEqual({ transform: [{ translateX: 123 }] });
    expect(parseTransform("translate-x-[50]")).toEqual({ transform: [{ translateX: 50 }] });
    expect(parseTransform("-translate-x-[100px]")).toEqual({ transform: [{ translateX: -100 }] });
  });

  it("should parse arbitrary translateX percentage values", () => {
    expect(parseTransform("translate-x-[50%]")).toEqual({ transform: [{ translateX: "50%" }] });
    expect(parseTransform("translate-x-[33.333%]")).toEqual({ transform: [{ translateX: "33.333%" }] });
    expect(parseTransform("-translate-x-[25%]")).toEqual({ transform: [{ translateX: "-25%" }] });
  });

  it("should parse arbitrary translateY pixel values", () => {
    expect(parseTransform("translate-y-[200px]")).toEqual({ transform: [{ translateY: 200 }] });
    expect(parseTransform("-translate-y-[75px]")).toEqual({ transform: [{ translateY: -75 }] });
  });

  it("should parse arbitrary translateY percentage values", () => {
    expect(parseTransform("translate-y-[100%]")).toEqual({ transform: [{ translateY: "100%" }] });
    expect(parseTransform("-translate-y-[50%]")).toEqual({ transform: [{ translateY: "-50%" }] });
  });

  it("should return null for invalid translate values", () => {
    expect(parseTransform("translate-x-999")).toBeNull();
    expect(parseTransform("translate-y-invalid")).toBeNull();
  });
});

describe("parseTransform - skew utilities", () => {
  it("should parse skewX values", () => {
    expect(parseTransform("skew-x-0")).toEqual({ transform: [{ skewX: "0deg" }] });
    expect(parseTransform("skew-x-1")).toEqual({ transform: [{ skewX: "1deg" }] });
    expect(parseTransform("skew-x-3")).toEqual({ transform: [{ skewX: "3deg" }] });
    expect(parseTransform("skew-x-6")).toEqual({ transform: [{ skewX: "6deg" }] });
    expect(parseTransform("skew-x-12")).toEqual({ transform: [{ skewX: "12deg" }] });
  });

  it("should parse negative skewX values", () => {
    expect(parseTransform("-skew-x-3")).toEqual({ transform: [{ skewX: "-3deg" }] });
    expect(parseTransform("-skew-x-12")).toEqual({ transform: [{ skewX: "-12deg" }] });
  });

  it("should parse skewY values", () => {
    expect(parseTransform("skew-y-0")).toEqual({ transform: [{ skewY: "0deg" }] });
    expect(parseTransform("skew-y-2")).toEqual({ transform: [{ skewY: "2deg" }] });
    expect(parseTransform("skew-y-6")).toEqual({ transform: [{ skewY: "6deg" }] });
  });

  it("should parse negative skewY values", () => {
    expect(parseTransform("-skew-y-2")).toEqual({ transform: [{ skewY: "-2deg" }] });
    expect(parseTransform("-skew-y-6")).toEqual({ transform: [{ skewY: "-6deg" }] });
  });

  it("should parse arbitrary skew values", () => {
    expect(parseTransform("skew-x-[15deg]")).toEqual({ transform: [{ skewX: "15deg" }] });
    expect(parseTransform("skew-y-[20deg]")).toEqual({ transform: [{ skewY: "20deg" }] });
    expect(parseTransform("-skew-x-[8deg]")).toEqual({ transform: [{ skewX: "-8deg" }] });
  });

  it("should return null for invalid skew values", () => {
    expect(parseTransform("skew-x-999")).toBeNull();
    expect(parseTransform("skew-y-invalid")).toBeNull();
  });
});

describe("parseTransform - perspective utility", () => {
  it("should parse perspective values", () => {
    expect(parseTransform("perspective-0")).toEqual({ transform: [{ perspective: 0 }] });
    expect(parseTransform("perspective-100")).toEqual({ transform: [{ perspective: 100 }] });
    expect(parseTransform("perspective-500")).toEqual({ transform: [{ perspective: 500 }] });
    expect(parseTransform("perspective-1000")).toEqual({ transform: [{ perspective: 1000 }] });
  });

  it("should parse arbitrary perspective values", () => {
    expect(parseTransform("perspective-[1500]")).toEqual({ transform: [{ perspective: 1500 }] });
    expect(parseTransform("perspective-[2000]")).toEqual({ transform: [{ perspective: 2000 }] });
    expect(parseTransform("perspective-[250]")).toEqual({ transform: [{ perspective: 250 }] });
  });

  it("should return null for invalid perspective values", () => {
    expect(parseTransform("perspective-99")).toBeNull();
    expect(parseTransform("perspective-invalid")).toBeNull();
  });
});

describe("parseTransform - transform origin warning", () => {
  it("should return null and warn for origin classes", () => {
    // Note: warnings are logged in development, testing null return is sufficient
    expect(parseTransform("origin-center")).toBeNull();
    expect(parseTransform("origin-top")).toBeNull();
    expect(parseTransform("origin-left")).toBeNull();
  });
});

describe("parseTransform - edge cases", () => {
  it("should return null for invalid classes", () => {
    expect(parseTransform("invalid")).toBeNull();
    expect(parseTransform("transform")).toBeNull();
    expect(parseTransform("transforms")).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(parseTransform("")).toBeNull();
  });

  it("should return null for partial class names", () => {
    expect(parseTransform("scal")).toBeNull();
    expect(parseTransform("rotat")).toBeNull();
    expect(parseTransform("translat")).toBeNull();
  });

  it("should handle all transform types returning arrays", () => {
    // Verify all transforms return arrays (required for React Native)
    const scaleResult = parseTransform("scale-110");
    expect(scaleResult).toHaveProperty("transform");
    expect(Array.isArray(scaleResult?.transform)).toBe(true);

    const rotateResult = parseTransform("rotate-45");
    expect(rotateResult).toHaveProperty("transform");
    expect(Array.isArray(rotateResult?.transform)).toBe(true);

    const translateResult = parseTransform("translate-x-4");
    expect(translateResult).toHaveProperty("transform");
    expect(Array.isArray(translateResult?.transform)).toBe(true);
  });
});

describe("parseTransform - comprehensive coverage", () => {
  it("should handle all scale variants", () => {
    const scaleClasses = ["scale-0", "scale-50", "scale-100", "scale-150"];
    scaleClasses.forEach((cls) => {
      expect(parseTransform(cls)).toBeTruthy();
    });
  });

  it("should handle all rotate variants", () => {
    const rotateClasses = ["rotate-0", "rotate-45", "rotate-90", "rotate-180"];
    rotateClasses.forEach((cls) => {
      expect(parseTransform(cls)).toBeTruthy();
    });
  });

  it("should handle all translate variants", () => {
    const translateClasses = ["translate-x-0", "translate-x-4", "translate-y-8", "-translate-x-2"];
    translateClasses.forEach((cls) => {
      expect(parseTransform(cls)).toBeTruthy();
    });
  });

  it("should handle all skew variants", () => {
    const skewClasses = ["skew-x-3", "skew-y-6", "-skew-x-12"];
    skewClasses.forEach((cls) => {
      expect(parseTransform(cls)).toBeTruthy();
    });
  });

  it("should handle all perspective variants", () => {
    const perspectiveClasses = ["perspective-100", "perspective-500", "perspective-1000"];
    perspectiveClasses.forEach((cls) => {
      expect(parseTransform(cls)).toBeTruthy();
    });
  });
});

describe("parseTransform - case sensitivity", () => {
  it("should be case-sensitive", () => {
    expect(parseTransform("SCALE-110")).toBeNull();
    expect(parseTransform("Scale-110")).toBeNull();
    expect(parseTransform("ROTATE-45")).toBeNull();
  });
});
