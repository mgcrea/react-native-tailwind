/**
 * Pre-injection utility for React Compiler compatibility
 *
 * React Compiler captures reactive dependencies during its Function.enter visitor.
 * If hooks are injected later (during JSXAttribute or Program.exit visitors),
 * React Compiler won't track the hook return values as reactive, causing
 * memoized expressions to never re-evaluate when the hook value changes.
 *
 * This utility scans function bodies for color scheme modifiers BEFORE
 * React Compiler's analysis phase, allowing hook injection in Function.enter.
 */

import type * as BabelTypes from "@babel/types";

const COLOR_SCHEME_PATTERN = /(?:^|\s)(?:dark:|light:|scheme:)/;

/**
 * Scan an AST node tree for color scheme modifiers in class name contexts.
 *
 * Walks the AST manually (without Babel traverse) to avoid triggering plugin visitors.
 * Skips nested functions as they have their own scope.
 */
export function scanForColorSchemeModifiers(
  node: BabelTypes.Node,
  supportedAttributes: Set<string>,
  attributePatterns: RegExp[],
  twImportNames: Set<string>,
  t: typeof BabelTypes,
  twColorImportNames: Set<string> = new Set(),
): boolean {
  return walkNode(node, supportedAttributes, attributePatterns, twImportNames, t, twColorImportNames);
}

function walkNode(
  node: BabelTypes.Node,
  supportedAttributes: Set<string>,
  attributePatterns: RegExp[],
  twImportNames: Set<string>,
  t: typeof BabelTypes,
  twColorImportNames: Set<string>,
): boolean {
  // Check JSXAttribute with color scheme class names
  if (t.isJSXAttribute(node) && t.isJSXIdentifier(node.name)) {
    const attrName = node.name.name;
    const isSupported = supportedAttributes.has(attrName) || attributePatterns.some((p) => p.test(attrName));
    if (isSupported && valueContainsColorScheme(node.value, t)) {
      return true;
    }
  }

  // Check TaggedTemplateExpression (tw`dark:...`)
  if (t.isTaggedTemplateExpression(node) && t.isIdentifier(node.tag)) {
    if (twImportNames.has(node.tag.name)) {
      for (const quasi of node.quasi.quasis) {
        if (quasi.value.cooked && COLOR_SCHEME_PATTERN.test(quasi.value.cooked)) {
          return true;
        }
      }
    }
  }

  // Check CallExpression (twStyle("dark:..."))
  if (t.isCallExpression(node) && t.isIdentifier(node.callee)) {
    if (twImportNames.has(node.callee.name)) {
      const arg = node.arguments[0];
      if (t.isStringLiteral(arg) && COLOR_SCHEME_PATTERN.test(arg.value)) {
        return true;
      }
    }

    if (twColorImportNames.has(node.callee.name)) {
      const arg = node.arguments[0];
      if (t.isStringLiteral(arg) && COLOR_SCHEME_PATTERN.test(arg.value)) {
        return true;
      }
      if (t.isObjectExpression(arg)) {
        for (const property of arg.properties) {
          if (
            t.isObjectProperty(property) &&
            t.isStringLiteral(property.value) &&
            COLOR_SCHEME_PATTERN.test(property.value.value)
          ) {
            return true;
          }
        }
      }
    }
  }

  // Walk children, skipping nested functions
  const keys = t.VISITOR_KEYS[node.type];
  if (!keys) return false;

  for (const key of keys) {
    const child = (node as unknown as Record<string, unknown>)[key];
    if (!child) continue;

    if (Array.isArray(child)) {
      for (const item of child) {
        if (isASTNode(item)) {
          // Skip nested functions (they have their own scope)
          if (t.isFunction(item)) continue;
          if (walkNode(item, supportedAttributes, attributePatterns, twImportNames, t, twColorImportNames)) {
            return true;
          }
        }
      }
    } else if (isASTNode(child)) {
      // Skip nested functions
      if (t.isFunction(child)) continue;
      if (walkNode(child, supportedAttributes, attributePatterns, twImportNames, t, twColorImportNames)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if a JSXAttribute value contains color scheme modifier strings
 */
function valueContainsColorScheme(value: BabelTypes.JSXAttribute["value"], t: typeof BabelTypes): boolean {
  if (!value) return false;

  // String literal: className="... dark:..."
  if (t.isStringLiteral(value)) {
    return COLOR_SCHEME_PATTERN.test(value.value);
  }

  // JSXExpressionContainer: className={...}
  if (t.isJSXExpressionContainer(value)) {
    return expressionContainsColorScheme(value.expression, t);
  }

  return false;
}

/**
 * Check if an expression contains color scheme modifier strings
 */
function expressionContainsColorScheme(
  node: BabelTypes.Expression | BabelTypes.JSXEmptyExpression,
  t: typeof BabelTypes,
): boolean {
  if (t.isStringLiteral(node)) {
    return COLOR_SCHEME_PATTERN.test(node.value);
  }

  if (t.isTemplateLiteral(node)) {
    for (const quasi of node.quasis) {
      if (quasi.value.cooked && COLOR_SCHEME_PATTERN.test(quasi.value.cooked)) {
        return true;
      }
    }
    for (const expr of node.expressions) {
      if (expressionContainsColorScheme(expr as BabelTypes.Expression, t)) {
        return true;
      }
    }
  }

  if (t.isConditionalExpression(node)) {
    return (
      expressionContainsColorScheme(node.consequent, t) || expressionContainsColorScheme(node.alternate, t)
    );
  }

  if (t.isLogicalExpression(node)) {
    return expressionContainsColorScheme(node.left, t) || expressionContainsColorScheme(node.right, t);
  }

  return false;
}

function isASTNode(value: unknown): value is BabelTypes.Node {
  return (
    value !== null && typeof value === "object" && typeof (value as Record<string, unknown>).type === "string"
  );
}
