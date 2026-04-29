import { parseSync } from "@babel/core";
import * as t from "@babel/types";
import { describe, expect, it } from "vitest";

import { getComponentModifierSupport, getStatePropertyForModifier } from "./componentSupport";

/**
 * Helper to create a JSXOpeningElement from JSX code
 */
function createJSXElement(code: string): t.JSXOpeningElement {
  const ast = parseSync(code, {
    sourceType: "module",
    plugins: [["@babel/plugin-syntax-jsx", {}]],
    filename: "test.tsx",
    configFile: false,
    babelrc: false,
  });

  if (!ast) {
    throw new Error(`Failed to parse: ${code}`);
  }

  // Find the JSXOpeningElement in the AST
  let element: t.JSXOpeningElement | null = null;

  const traverse = (node: t.Node) => {
    if (t.isJSXOpeningElement(node)) {
      element = node;
      return;
    }
    for (const key in node) {
      // @ts-expect-error - Dynamic key access
      if (node[key] && typeof node[key] === "object") {
        // @ts-expect-error - Dynamic key access
        traverse(node[key] as t.Node);
      }
    }
  };

  traverse(ast);

  if (!element) {
    throw new Error(`Could not find JSXOpeningElement in: ${code}`);
  }

  return element;
}

describe("getComponentModifierSupport", () => {
  describe("Supported components", () => {
    it("should recognize Pressable component", () => {
      const element = createJSXElement("<Pressable />");
      const result = getComponentModifierSupport(element, t);

      expect(result).toEqual({
        component: "Pressable",
        supportedModifiers: ["active", "hover", "focus", "disabled"],
      });
    });

    it("should recognize TextInput component", () => {
      const element = createJSXElement("<TextInput />");
      const result = getComponentModifierSupport(element, t);

      expect(result).toEqual({
        component: "TextInput",
        supportedModifiers: ["focus", "disabled", "placeholder"],
      });
    });

    it("should recognize Pressable with attributes", () => {
      const element = createJSXElement('<Pressable className="m-4" onPress={handlePress} />');
      const result = getComponentModifierSupport(element, t);

      expect(result).toEqual({
        component: "Pressable",
        supportedModifiers: ["active", "hover", "focus", "disabled"],
      });
    });

    it("should recognize TextInput with attributes", () => {
      const element = createJSXElement('<TextInput className="border" placeholder="Email" />');
      const result = getComponentModifierSupport(element, t);

      expect(result).toEqual({
        component: "TextInput",
        supportedModifiers: ["focus", "disabled", "placeholder"],
      });
    });

    it("should recognize TouchableOpacity component", () => {
      const element = createJSXElement("<TouchableOpacity />");
      const result = getComponentModifierSupport(element, t);

      expect(result).toEqual({
        component: "TouchableOpacity",
        supportedModifiers: ["active", "disabled"],
      });
    });

    it("should recognize TouchableOpacity with attributes", () => {
      const element = createJSXElement('<TouchableOpacity className="m-4" onPress={handlePress} />');
      const result = getComponentModifierSupport(element, t);

      expect(result).toEqual({
        component: "TouchableOpacity",
        supportedModifiers: ["active", "disabled"],
      });
    });
  });

  describe("Member expressions", () => {
    it("should recognize ReactNative.Pressable", () => {
      const element = createJSXElement("<ReactNative.Pressable />");
      const result = getComponentModifierSupport(element, t);

      expect(result).toEqual({
        component: "Pressable",
        supportedModifiers: ["active", "hover", "focus", "disabled"],
      });
    });

    it("should recognize RN.TextInput", () => {
      const element = createJSXElement("<RN.TextInput />");
      const result = getComponentModifierSupport(element, t);

      expect(result).toEqual({
        component: "TextInput",
        supportedModifiers: ["focus", "disabled", "placeholder"],
      });
    });

    it("should recognize nested member expressions", () => {
      const element = createJSXElement("<Components.Input.TextInput />");
      const result = getComponentModifierSupport(element, t);

      // Should extract "TextInput" from the rightmost property
      expect(result).toEqual({
        component: "TextInput",
        supportedModifiers: ["focus", "disabled", "placeholder"],
      });
    });

    it("should recognize Pressable in namespaced imports", () => {
      const element = createJSXElement("<UI.Pressable />");
      const result = getComponentModifierSupport(element, t);

      expect(result).toEqual({
        component: "Pressable",
        supportedModifiers: ["active", "hover", "focus", "disabled"],
      });
    });
  });

  describe("Unsupported components", () => {
    it("should return null for View", () => {
      const element = createJSXElement("<View />");
      const result = getComponentModifierSupport(element, t);

      expect(result).toBeNull();
    });

    it("should return null for custom components", () => {
      const element = createJSXElement("<CustomButton />");
      const result = getComponentModifierSupport(element, t);

      expect(result).toBeNull();
    });

    it("should return null for Text", () => {
      const element = createJSXElement("<Text />");
      const result = getComponentModifierSupport(element, t);

      expect(result).toBeNull();
    });

    it("should return null for Image", () => {
      const element = createJSXElement("<Image />");
      const result = getComponentModifierSupport(element, t);

      expect(result).toBeNull();
    });
  });

  describe("Edge cases", () => {
    it("should be case-sensitive", () => {
      // lowercase "pressable" should not match
      const element = createJSXElement("<pressable />");
      const result = getComponentModifierSupport(element, t);

      expect(result).toBeNull();
    });

    it("should not match similar names", () => {
      const element1 = createJSXElement("<PressableButton />");
      const result1 = getComponentModifierSupport(element1, t);
      expect(result1).toBeNull();

      const element2 = createJSXElement("<MyPressable />");
      const result2 = getComponentModifierSupport(element2, t);
      expect(result2).toBeNull();

      const element3 = createJSXElement("<TextInputField />");
      const result3 = getComponentModifierSupport(element3, t);
      expect(result3).toBeNull();
    });

    it("should handle self-closing tags", () => {
      const element = createJSXElement("<Pressable />");
      const result = getComponentModifierSupport(element, t);

      expect(result).not.toBeNull();
      expect(result?.component).toBe("Pressable");
    });

    it("should return null for non-JSXOpeningElement nodes", () => {
      // Test with a random node type
      const identifier = t.identifier("foo");
      const result = getComponentModifierSupport(identifier, t);

      expect(result).toBeNull();
    });

    it("should return null for JSXFragment", () => {
      // JSXFragment doesn't have a JSXOpeningElement, so create a mock fragment
      const fragment = {
        type: "JSXFragment",
        openingFragment: {},
        closingFragment: {},
        children: [],
      };

      const result = getComponentModifierSupport(fragment as t.Node, t);
      expect(result).toBeNull();
    });
  });

  describe("Modifier support differences", () => {
    it("should show Pressable supports active modifier but TextInput does not", () => {
      const pressable = createJSXElement("<Pressable />");
      const textInput = createJSXElement("<TextInput />");

      const pressableResult = getComponentModifierSupport(pressable, t);
      const textInputResult = getComponentModifierSupport(textInput, t);

      expect(pressableResult?.supportedModifiers).toContain("active");
      expect(textInputResult?.supportedModifiers).not.toContain("active");
    });

    it("should show both support focus modifier", () => {
      const pressable = createJSXElement("<Pressable />");
      const textInput = createJSXElement("<TextInput />");

      const pressableResult = getComponentModifierSupport(pressable, t);
      const textInputResult = getComponentModifierSupport(textInput, t);

      expect(pressableResult?.supportedModifiers).toContain("focus");
      expect(textInputResult?.supportedModifiers).toContain("focus");
    });

    it("should show TextInput supports placeholder but Pressable does not", () => {
      const pressable = createJSXElement("<Pressable />");
      const textInput = createJSXElement("<TextInput />");

      const pressableResult = getComponentModifierSupport(pressable, t);
      const textInputResult = getComponentModifierSupport(textInput, t);

      expect(pressableResult?.supportedModifiers).not.toContain("placeholder");
      expect(textInputResult?.supportedModifiers).toContain("placeholder");
    });

    it("should show both support disabled modifier", () => {
      const pressable = createJSXElement("<Pressable />");
      const textInput = createJSXElement("<TextInput />");

      const pressableResult = getComponentModifierSupport(pressable, t);
      const textInputResult = getComponentModifierSupport(textInput, t);

      expect(pressableResult?.supportedModifiers).toContain("disabled");
      expect(textInputResult?.supportedModifiers).toContain("disabled");
    });
  });
});

describe("getStatePropertyForModifier", () => {
  it("should map active to pressed", () => {
    expect(getStatePropertyForModifier("active")).toBe("pressed");
  });

  it("should map hover to hovered", () => {
    expect(getStatePropertyForModifier("hover")).toBe("hovered");
  });

  it("should map focus to focused", () => {
    expect(getStatePropertyForModifier("focus")).toBe("focused");
  });

  it("should map disabled to disabled", () => {
    expect(getStatePropertyForModifier("disabled")).toBe("disabled");
  });

  it("should return pressed as fallback for unknown modifiers", () => {
    // @ts-expect-error - Testing fallback with invalid modifier
    expect(getStatePropertyForModifier("unknown")).toBe("pressed");

    // @ts-expect-error - Testing fallback with invalid modifier
    expect(getStatePropertyForModifier("invalid")).toBe("pressed");

    // @ts-expect-error - Testing fallback with invalid modifier
    expect(getStatePropertyForModifier("")).toBe("pressed");
  });

  it("should handle all Pressable modifier states", () => {
    // Pressable supports: active, hover, focus, disabled
    const pressableModifiers: Array<"active" | "hover" | "focus" | "disabled"> = [
      "active",
      "hover",
      "focus",
      "disabled",
    ];

    const expectedMapping = {
      active: "pressed",
      hover: "hovered",
      focus: "focused",
      disabled: "disabled",
    };

    for (const modifier of pressableModifiers) {
      expect(getStatePropertyForModifier(modifier)).toBe(expectedMapping[modifier]);
    }
  });

  it("should handle all TextInput modifier states", () => {
    // TextInput supports: focus, disabled, placeholder
    // Note: placeholder doesn't have a state property (it's a prop, not state)
    const textInputModifiers: Array<"focus" | "disabled"> = ["focus", "disabled"];

    const expectedMapping = {
      focus: "focused",
      disabled: "disabled",
    };

    for (const modifier of textInputModifiers) {
      expect(getStatePropertyForModifier(modifier)).toBe(expectedMapping[modifier]);
    }
  });
});

describe("Integration - Real-world scenarios", () => {
  it("should correctly identify modifiers for a Pressable button", () => {
    const element = createJSXElement(
      '<Pressable className="active:bg-blue-700 hover:bg-blue-600 disabled:bg-gray-300" />',
    );
    const result = getComponentModifierSupport(element, t);

    expect(result).not.toBeNull();
    expect(result?.component).toBe("Pressable");

    // Verify all used modifiers are supported
    expect(result?.supportedModifiers).toContain("active");
    expect(result?.supportedModifiers).toContain("hover");
    expect(result?.supportedModifiers).toContain("disabled");
  });

  it("should correctly identify modifiers for a TextInput field", () => {
    const element = createJSXElement(
      '<TextInput className="focus:border-blue-500 disabled:bg-gray-100 placeholder:text-gray-400" />',
    );
    const result = getComponentModifierSupport(element, t);

    expect(result).not.toBeNull();
    expect(result?.component).toBe("TextInput");

    // Verify all used modifiers are supported
    expect(result?.supportedModifiers).toContain("focus");
    expect(result?.supportedModifiers).toContain("disabled");
    expect(result?.supportedModifiers).toContain("placeholder");
  });

  it("should handle namespaced components from imports", () => {
    const element = createJSXElement('<RN.Pressable className="active:opacity-80" />');
    const result = getComponentModifierSupport(element, t);

    expect(result).not.toBeNull();
    expect(result?.component).toBe("Pressable");
    expect(result?.supportedModifiers).toContain("active");
  });

  it("should return null for unsupported components with modifiers", () => {
    const element = createJSXElement('<View className="hover:bg-blue-500" />');
    const result = getComponentModifierSupport(element, t);

    // View doesn't support modifiers
    expect(result).toBeNull();
  });

  it("should map all Pressable modifiers to correct state properties", () => {
    const element = createJSXElement("<Pressable />");
    const result = getComponentModifierSupport(element, t);

    expect(result).not.toBeNull();

    // Test each supported modifier maps correctly
    const modifiers = result?.supportedModifiers as Array<"active" | "hover" | "focus" | "disabled">;
    for (const modifier of modifiers) {
      const stateProp = getStatePropertyForModifier(modifier);
      expect(stateProp).toBeTruthy();
      expect(typeof stateProp).toBe("string");
    }

    // Verify the mappings
    expect(getStatePropertyForModifier("active")).toBe("pressed");
    expect(getStatePropertyForModifier("hover")).toBe("hovered");
    expect(getStatePropertyForModifier("focus")).toBe("focused");
    expect(getStatePropertyForModifier("disabled")).toBe("disabled");
  });

  it("should map all TextInput modifiers to correct state properties", () => {
    const element = createJSXElement("<TextInput />");
    const result = getComponentModifierSupport(element, t);

    expect(result).not.toBeNull();

    // Filter out placeholder as it doesn't have a state property
    const stateModifiers = result?.supportedModifiers.filter((m) => m !== "placeholder") as Array<
      "focus" | "disabled"
    >;

    for (const modifier of stateModifiers) {
      const stateProp = getStatePropertyForModifier(modifier);
      expect(stateProp).toBeTruthy();
      expect(typeof stateProp).toBe("string");
    }

    // Verify the mappings
    expect(getStatePropertyForModifier("focus")).toBe("focused");
    expect(getStatePropertyForModifier("disabled")).toBe("disabled");
  });
});
