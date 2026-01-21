import { describe, expect, it } from "vitest";
import { createVariants, cv, cva, tv } from "./createVariants";

describe("createVariants", () => {
  describe("basic functionality", () => {
    it("should return empty style for empty config", () => {
      const variant = createVariants({});
      const result = variant();
      expect(result.className).toBe("");
      expect(result.style).toEqual({});
    });

    it("should handle base classes", () => {
      const variant = createVariants({
        base: "m-4 p-2",
      });
      const result = variant();
      expect(result.className).toBe("m-4 p-2");
      expect(result.style).toEqual({
        margin: 16,
        padding: 8,
      });
    });

    it("should handle base classes as array", () => {
      const variant = createVariants({
        base: ["m-4", "p-2"],
      });
      const result = variant();
      expect(result.className).toBe("m-4 p-2");
      expect(result.style).toEqual({
        margin: 16,
        padding: 8,
      });
    });
  });

  describe("variants", () => {
    it("should apply variant classes", () => {
      const button = createVariants({
        base: "rounded-lg",
        variants: {
          color: {
            primary: "bg-blue-500",
            secondary: "bg-gray-500",
          },
        },
      });

      const result = button({ color: "primary" });
      expect(result.className).toBe("rounded-lg bg-blue-500");
      expect(result.style).toHaveProperty("backgroundColor", "#2b7fff");
    });

    it("should handle multiple variants", () => {
      const button = createVariants({
        variants: {
          color: {
            primary: "bg-blue-500",
            secondary: "bg-gray-500",
          },
          size: {
            sm: "text-sm p-1",
            lg: "text-lg p-4",
          },
        },
      });

      const result = button({ color: "primary", size: "lg" });
      expect(result.className).toBe("bg-blue-500 text-lg p-4");
      expect(result.style).toHaveProperty("backgroundColor", "#2b7fff");
      expect(result.style).toHaveProperty("fontSize", 18);
      expect(result.style).toHaveProperty("padding", 16);
    });

    it("should handle variant values as arrays", () => {
      const button = createVariants({
        variants: {
          color: {
            primary: ["bg-blue-500", "text-white"],
          },
        },
      });

      const result = button({ color: "primary" });
      expect(result.className).toBe("bg-blue-500 text-white");
    });

    it("should handle null variant values", () => {
      const button = createVariants({
        variants: {
          disabled: {
            true: "opacity-50",
            false: null,
          },
        },
      });

      const enabledResult = button({ disabled: false });
      expect(enabledResult.className).toBe("");

      const disabledResult = button({ disabled: true });
      expect(disabledResult.className).toBe("opacity-50");
    });
  });

  describe("boolean variants", () => {
    it("should handle boolean true variant", () => {
      const button = createVariants({
        variants: {
          disabled: {
            true: "opacity-50",
          },
        },
      });

      const result = button({ disabled: true });
      expect(result.className).toBe("opacity-50");
      expect(result.style).toHaveProperty("opacity", 0.5);
    });

    it("should handle boolean false variant", () => {
      const button = createVariants({
        variants: {
          disabled: {
            true: "opacity-50",
            false: "opacity-100",
          },
        },
      });

      const result = button({ disabled: false });
      expect(result.className).toBe("opacity-100");
      expect(result.style).toHaveProperty("opacity", 1);
    });

    it("should not apply boolean variant when undefined", () => {
      const button = createVariants({
        variants: {
          disabled: {
            true: "opacity-50",
          },
        },
      });

      const result = button({});
      expect(result.className).toBe("");
    });
  });

  describe("default variants", () => {
    it("should apply default variants when no props provided", () => {
      const button = createVariants({
        variants: {
          color: {
            primary: "bg-blue-500",
            secondary: "bg-gray-500",
          },
          size: {
            sm: "text-sm",
            md: "text-base",
          },
        },
        defaultVariants: {
          color: "primary",
          size: "md",
        },
      });

      const result = button();
      expect(result.className).toBe("bg-blue-500 text-base");
    });

    it("should override default variants with props", () => {
      const button = createVariants({
        variants: {
          color: {
            primary: "bg-blue-500",
            secondary: "bg-gray-500",
          },
        },
        defaultVariants: {
          color: "primary",
        },
      });

      const result = button({ color: "secondary" });
      expect(result.className).toBe("bg-gray-500");
    });

    it("should handle boolean default variants", () => {
      const button = createVariants({
        variants: {
          disabled: {
            true: "opacity-50",
            false: "opacity-100",
          },
        },
        defaultVariants: {
          disabled: false,
        },
      });

      const result = button();
      expect(result.className).toBe("opacity-100");
    });
  });

  describe("compound variants", () => {
    it("should apply compound variant when conditions match", () => {
      const button = createVariants({
        variants: {
          color: {
            primary: "bg-blue-500",
            secondary: "bg-gray-500",
          },
          disabled: {
            true: "opacity-50",
          },
        },
        compoundVariants: [
          {
            color: "primary",
            disabled: true,
            class: "bg-blue-300",
          },
        ],
      });

      const result = button({ color: "primary", disabled: true });
      expect(result.className).toBe("bg-blue-500 opacity-50 bg-blue-300");
    });

    it("should not apply compound variant when conditions do not match", () => {
      const button = createVariants({
        variants: {
          color: {
            primary: "bg-blue-500",
            secondary: "bg-gray-500",
          },
          disabled: {
            true: "opacity-50",
          },
        },
        compoundVariants: [
          {
            color: "primary",
            disabled: true,
            class: "bg-blue-300",
          },
        ],
      });

      const result = button({ color: "secondary", disabled: true });
      expect(result.className).toBe("bg-gray-500 opacity-50");
      expect(result.className).not.toContain("bg-blue-300");
    });

    it("should support array conditions in compound variants", () => {
      const button = createVariants({
        variants: {
          color: {
            primary: "bg-blue-500",
            secondary: "bg-gray-500",
            danger: "bg-red-500",
          },
          size: {
            sm: "text-sm",
            md: "text-base",
          },
        },
        compoundVariants: [
          {
            color: ["primary", "secondary"],
            size: "sm",
            class: "font-bold",
          },
        ],
      });

      const primaryResult = button({ color: "primary", size: "sm" });
      expect(primaryResult.className).toContain("font-bold");

      const secondaryResult = button({ color: "secondary", size: "sm" });
      expect(secondaryResult.className).toContain("font-bold");

      const dangerResult = button({ color: "danger", size: "sm" });
      expect(dangerResult.className).not.toContain("font-bold");
    });

    it("should support className key as alias for class", () => {
      const button = createVariants({
        variants: {
          color: {
            primary: "bg-blue-500",
          },
        },
        compoundVariants: [
          {
            color: "primary",
            className: "font-semibold",
          },
        ],
      });

      const result = button({ color: "primary" });
      expect(result.className).toContain("font-semibold");
    });

    it("should apply compound variants with default variants", () => {
      const button = createVariants({
        variants: {
          color: {
            primary: "bg-blue-500",
          },
          disabled: {
            true: "opacity-50",
            false: "",
          },
        },
        compoundVariants: [
          {
            color: "primary",
            disabled: false,
            class: "hover:bg-blue-600",
          },
        ],
        defaultVariants: {
          color: "primary",
          disabled: false,
        },
      });

      const result = button();
      expect(result.className).toContain("hover:bg-blue-600");
    });
  });

  describe("class/className override", () => {
    it("should allow class override", () => {
      const button = createVariants({
        base: "bg-blue-500",
      });

      const result = button({ class: "bg-red-500" });
      expect(result.className).toBe("bg-blue-500 bg-red-500");
    });

    it("should allow className override", () => {
      const button = createVariants({
        base: "bg-blue-500",
      });

      const result = button({ className: "bg-red-500" });
      expect(result.className).toBe("bg-blue-500 bg-red-500");
    });
  });

  describe("class deduplication", () => {
    it("should deduplicate class names", () => {
      const button = createVariants({
        base: "m-4 p-2",
        variants: {
          size: {
            lg: "m-4 p-4",
          },
        },
      });

      const result = button({ size: "lg" });
      // m-4 should only appear once
      const m4Count = result.className.split(" ").filter((c) => c === "m-4").length;
      expect(m4Count).toBe(1);
    });
  });
});

describe("slots", () => {
  it("should create slot functions", () => {
    const card = createVariants({
      slots: {
        base: "rounded-lg",
        header: "p-4",
        body: "p-4",
      },
    });

    const result = card();
    expect(typeof result.base).toBe("function");
    expect(typeof result.header).toBe("function");
    expect(typeof result.body).toBe("function");
  });

  it("should return correct classes for each slot", () => {
    const card = createVariants({
      slots: {
        base: "rounded-lg shadow-md",
        header: "p-4 border-b",
        body: "p-4",
      },
    });

    const slots = card();
    expect(slots.base().className).toBe("rounded-lg shadow-md");
    expect(slots.header().className).toBe("p-4 border-b");
    expect(slots.body().className).toBe("p-4");
  });

  it("should parse slot classes to styles", () => {
    const card = createVariants({
      slots: {
        base: "m-4",
        content: "p-2",
      },
    });

    const slots = card();
    expect(slots.base().style).toEqual({ margin: 16 });
    expect(slots.content().style).toEqual({ padding: 8 });
  });

  it("should apply compound variants to specific slots", () => {
    const card = createVariants({
      slots: {
        base: "rounded-lg",
        header: "p-4",
      },
      variants: {
        variant: {
          elevated: "",
          outlined: "",
        },
      },
      compoundVariants: [
        {
          variant: "elevated",
          class: {
            base: "shadow-lg",
          },
        },
        {
          variant: "outlined",
          class: {
            base: "border",
            header: "border-b",
          },
        },
      ],
    });

    const elevatedSlots = card({ variant: "elevated" });
    expect(elevatedSlots.base().className).toContain("shadow-lg");
    expect(elevatedSlots.header().className).not.toContain("shadow-lg");

    const outlinedSlots = card({ variant: "outlined" });
    expect(outlinedSlots.base().className).toContain("border");
    expect(outlinedSlots.header().className).toContain("border-b");
  });
});

describe("tv alias", () => {
  it("should be an alias for createVariants", () => {
    expect(tv).toBe(createVariants);
  });

  it("should work the same as createVariants", () => {
    const button = tv({
      base: "font-semibold",
      variants: {
        color: {
          primary: "bg-blue-500",
        },
      },
    });

    const result = button({ color: "primary" });
    expect(result.className).toBe("font-semibold bg-blue-500");
  });
});

describe("cva", () => {
  it("should accept base as first argument", () => {
    const button = cva("font-semibold rounded-lg");
    const result = button();
    expect(result.className).toBe("font-semibold rounded-lg");
  });

  it("should accept base as array", () => {
    const button = cva(["font-semibold", "rounded-lg"]);
    const result = button();
    expect(result.className).toBe("font-semibold rounded-lg");
  });

  it("should work with variants", () => {
    const button = cva("font-semibold", {
      variants: {
        intent: {
          primary: "bg-blue-500 text-white",
          secondary: "bg-gray-200 text-gray-800",
        },
        size: {
          small: "text-sm p-1",
          medium: "text-base p-2",
        },
      },
    });

    const result = button({ intent: "primary", size: "small" });
    expect(result.className).toBe("font-semibold bg-blue-500 text-white text-sm p-1");
  });

  it("should work with compound variants", () => {
    const button = cva("font-semibold", {
      variants: {
        intent: {
          primary: "bg-blue-500",
        },
        disabled: {
          true: "opacity-50",
          false: null,
        },
      },
      compoundVariants: [
        {
          intent: "primary",
          disabled: false,
          class: "hover:bg-blue-600",
        },
      ],
    });

    const result = button({ intent: "primary", disabled: false });
    expect(result.className).toContain("hover:bg-blue-600");
  });

  it("should work with default variants", () => {
    const button = cva("font-semibold", {
      variants: {
        intent: {
          primary: "bg-blue-500",
          secondary: "bg-gray-500",
        },
      },
      defaultVariants: {
        intent: "primary",
      },
    });

    const result = button();
    expect(result.className).toBe("font-semibold bg-blue-500");
  });
});

describe("cv alias", () => {
  it("should be an alias for cva", () => {
    expect(cv).toBe(cva);
  });
});

describe("custom theme support", () => {
  it("should parse custom colors from theme", () => {
    const customTheme = {
      colors: {
        brand: "#ff6b6b",
      },
    };

    const button = createVariants(
      {
        variants: {
          color: {
            brand: "bg-brand",
          },
        },
      },
      customTheme,
    );

    const result = button({ color: "brand" });
    expect(result.className).toBe("bg-brand");
    expect(result.style).toHaveProperty("backgroundColor", "#ff6b6b");
  });

  it("should work with cva and custom theme", () => {
    const customTheme = {
      colors: {
        primary: "#007aff",
      },
    };

    const button = cva(
      "rounded-lg",
      {
        variants: {
          color: {
            primary: "bg-primary",
          },
        },
      },
      customTheme,
    );

    const result = button({ color: "primary" });
    expect(result.style).toHaveProperty("backgroundColor", "#007aff");
  });
});

describe("edge cases", () => {
  it("should handle empty props", () => {
    const button = createVariants({
      base: "m-4",
    });

    const result = button({});
    expect(result.className).toBe("m-4");
  });

  it("should handle undefined variant values", () => {
    const button = createVariants({
      variants: {
        color: {
          primary: "bg-blue-500",
        },
      },
    });

    const result = button({ color: undefined });
    expect(result.className).toBe("");
  });

  it("should handle variant option that does not exist", () => {
    const button = createVariants({
      variants: {
        color: {
          primary: "bg-blue-500",
        },
      },
    });

    // @ts-expect-error - Testing runtime behavior with invalid option
    const result = button({ color: "nonexistent" });
    expect(result.className).toBe("");
  });

  it("should handle whitespace in class strings", () => {
    const button = createVariants({
      base: "  m-4   p-2  ",
    });

    const result = button();
    expect(result.className).toBe("m-4 p-2");
  });

  it("should handle multiple compound variants matching", () => {
    const button = createVariants({
      variants: {
        color: {
          primary: "bg-blue-500",
        },
        size: {
          lg: "text-lg",
        },
        disabled: {
          true: "opacity-50",
        },
      },
      compoundVariants: [
        { color: "primary", size: "lg", class: "font-bold" },
        { color: "primary", disabled: true, class: "bg-blue-300" },
      ],
    });

    const result = button({ color: "primary", size: "lg", disabled: true });
    expect(result.className).toContain("font-bold");
    expect(result.className).toContain("bg-blue-300");
  });
});

describe("real-world examples", () => {
  it("should handle a complete button component", () => {
    const button = createVariants({
      base: "font-semibold rounded-lg",
      variants: {
        intent: {
          primary: "bg-blue-500 text-white",
          secondary: "bg-white text-gray-800 border border-gray-200",
          danger: "bg-red-500 text-white",
        },
        size: {
          sm: "text-sm px-3 py-1",
          md: "text-base px-4 py-2",
          lg: "text-lg px-6 py-3",
        },
        fullWidth: {
          true: "w-full",
        },
        disabled: {
          true: "opacity-50",
        },
      },
      compoundVariants: [
        {
          intent: "primary",
          disabled: true,
          class: "bg-blue-300",
        },
        {
          intent: "danger",
          disabled: true,
          class: "bg-red-300",
        },
      ],
      defaultVariants: {
        intent: "primary",
        size: "md",
      },
    });

    // Default button
    const defaultResult = button();
    expect(defaultResult.className).toContain("bg-blue-500");
    expect(defaultResult.className).toContain("text-base");

    // Large danger button
    const dangerResult = button({ intent: "danger", size: "lg" });
    expect(dangerResult.className).toContain("bg-red-500");
    expect(dangerResult.className).toContain("text-lg");

    // Disabled primary button
    const disabledResult = button({ disabled: true });
    expect(disabledResult.className).toContain("opacity-50");
    expect(disabledResult.className).toContain("bg-blue-300");
  });

  it("should handle a card component with slots", () => {
    const card = createVariants({
      slots: {
        base: "rounded-xl overflow-hidden",
        header: "p-4",
        body: "p-4",
        footer: "p-4",
      },
      variants: {
        variant: {
          elevated: "",
          outlined: "",
          filled: "",
        },
      },
      compoundVariants: [
        {
          variant: "elevated",
          class: {
            base: "shadow-lg bg-white",
          },
        },
        {
          variant: "outlined",
          class: {
            base: "border border-gray-200 bg-white",
          },
        },
        {
          variant: "filled",
          class: {
            base: "bg-gray-100",
          },
        },
      ],
      defaultVariants: {
        variant: "elevated",
      },
    });

    const slots = card();
    expect(slots.base().className).toContain("shadow-lg");
    expect(slots.header().className).toBe("p-4");

    const outlinedSlots = card({ variant: "outlined" });
    expect(outlinedSlots.base().className).toContain("border");
    expect(outlinedSlots.base().className).not.toContain("shadow-lg");
  });
});
