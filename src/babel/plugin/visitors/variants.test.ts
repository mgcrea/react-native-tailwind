import { describe, expect, it } from "vitest";
import { transform } from "../../../../test/helpers/babelTransform.js";

describe("variants visitor - tv()", () => {
  describe("import tracking", () => {
    it("should track tv import from tailwind-variants", () => {
      const code = `
        import { tv } from 'tailwind-variants';

        const button = tv({
          base: 'font-semibold rounded-lg',
          variants: {
            color: {
              primary: 'bg-blue-500',
              secondary: 'bg-gray-500',
            },
          },
        });

        function Button() {
          return <button className={button({ color: 'primary' })} />;
        }
      `;

      const result = transform(code, undefined, true);

      // Should remove tailwind-variants import
      expect(result).not.toContain("tailwind-variants");
      // Should have StyleSheet.create
      expect(result).toContain("StyleSheet.create");
      // Should have generated style keys
      expect(result).toContain("_twStyles");
    });

    it("should track aliased tv import", () => {
      const code = `
        import { tv as createVariant } from 'tailwind-variants';

        const button = createVariant({
          base: 'p-4',
        });

        function Button() {
          return <button className={button()} />;
        }
      `;

      const result = transform(code, undefined, true);
      expect(result).not.toContain("tailwind-variants");
      expect(result).toContain("StyleSheet.create");
    });
  });

  describe("static variant resolution", () => {
    it("should resolve static variant call to style reference", () => {
      const code = `
        import { tv } from 'tailwind-variants';

        const button = tv({
          base: 'font-semibold',
          variants: {
            size: {
              sm: 'text-sm',
              lg: 'text-lg',
            },
          },
        });

        function Button() {
          return <button className={button({ size: 'sm' })} />;
        }
      `;

      const result = transform(code, undefined, true);

      // Should generate styles for the variant
      expect(result).toContain("StyleSheet.create");
      // Should replace call with style reference
      expect(result).toContain("_twStyles");
    });

    it("should handle default variants", () => {
      const code = `
        import { tv } from 'tailwind-variants';

        const button = tv({
          base: 'rounded',
          variants: {
            size: {
              sm: 'p-1',
              md: 'p-2',
            },
          },
          defaultVariants: {
            size: 'md',
          },
        });

        function Button() {
          return <button className={button()} />;
        }
      `;

      const result = transform(code, undefined, true);
      expect(result).toContain("StyleSheet.create");
    });

    it("should handle boolean variants", () => {
      const code = `
        import { tv } from 'tailwind-variants';

        const button = tv({
          base: 'rounded',
          variants: {
            disabled: {
              true: 'opacity-50',
              false: 'opacity-100',
            },
          },
        });

        function Button() {
          return <button className={button({ disabled: true })} />;
        }
      `;

      const result = transform(code, undefined, true);
      expect(result).toContain("StyleSheet.create");
    });

    it("should handle compound variants", () => {
      const code = `
        import { tv } from 'tailwind-variants';

        const button = tv({
          base: 'rounded',
          variants: {
            color: {
              primary: 'bg-blue-500',
              secondary: 'bg-gray-500',
            },
            disabled: {
              true: 'opacity-50',
            },
          },
          compoundVariants: [
            {
              color: 'primary',
              disabled: true,
              class: 'bg-blue-300',
            },
          ],
        });

        function Button() {
          return <button className={button({ color: 'primary', disabled: true })} />;
        }
      `;

      const result = transform(code, undefined, true);
      expect(result).toContain("StyleSheet.create");
    });
  });

  describe("removing variant definitions", () => {
    it("should remove the variant function definition after transformation", () => {
      const code = `
        import { tv } from 'tailwind-variants';

        const button = tv({
          base: 'font-semibold',
        });

        function Button() {
          return <button className={button()} />;
        }
      `;

      const result = transform(code, undefined, true);

      // Should not contain the original tv() call
      expect(result).not.toContain("tv({");
      // But should have the generated styles
      expect(result).toContain("StyleSheet.create");
    });
  });
});

describe("variants visitor - cva()", () => {
  describe("import tracking", () => {
    it("should track cva import from class-variance-authority", () => {
      const code = `
        import { cva } from 'class-variance-authority';

        const button = cva('font-semibold rounded-lg', {
          variants: {
            intent: {
              primary: 'bg-blue-500',
              secondary: 'bg-gray-500',
            },
          },
        });

        function Button() {
          return <button className={button({ intent: 'primary' })} />;
        }
      `;

      const result = transform(code, undefined, true);

      // Should remove class-variance-authority import
      expect(result).not.toContain("class-variance-authority");
      // Should have StyleSheet.create
      expect(result).toContain("StyleSheet.create");
    });
  });

  describe("static variant resolution", () => {
    it("should resolve static cva call to style reference", () => {
      const code = `
        import { cva } from 'class-variance-authority';

        const button = cva('font-semibold', {
          variants: {
            size: {
              small: 'text-sm',
              large: 'text-lg',
            },
          },
        });

        function Button() {
          return <button className={button({ size: 'small' })} />;
        }
      `;

      const result = transform(code, undefined, true);
      expect(result).toContain("StyleSheet.create");
      expect(result).toContain("_twStyles");
    });

    it("should handle cva with only base classes", () => {
      const code = `
        import { cva } from 'class-variance-authority';

        const button = cva('font-semibold rounded-lg p-4');

        function Button() {
          return <button className={button()} />;
        }
      `;

      const result = transform(code, undefined, true);
      expect(result).toContain("StyleSheet.create");
    });

    it("should handle cva with base as array", () => {
      const code = `
        import { cva } from 'class-variance-authority';

        const button = cva(['font-semibold', 'rounded-lg', 'p-4']);

        function Button() {
          return <button className={button()} />;
        }
      `;

      const result = transform(code, undefined, true);
      expect(result).toContain("StyleSheet.create");
    });
  });
});

describe("variants visitor - edge cases", () => {
  it("should handle multiple variant functions in same file", () => {
    const code = `
      import { tv } from 'tailwind-variants';

      const button = tv({
        base: 'rounded-lg',
        variants: {
          size: { sm: 'p-1', lg: 'p-4' },
        },
      });

      const badge = tv({
        base: 'rounded-full',
        variants: {
          color: { red: 'bg-red-500', blue: 'bg-blue-500' },
        },
      });

      function Component() {
        return (
          <div>
            <button className={button({ size: 'sm' })} />
            <span className={badge({ color: 'red' })} />
          </div>
        );
      }
    `;

    const result = transform(code, undefined, true);
    expect(result).toContain("StyleSheet.create");
    // Should have styles for both variants
    expect(result).toContain("_twStyles");
  });

  it("should not transform dynamic configs", () => {
    const code = `
      import { tv } from 'tailwind-variants';

      const getConfig = () => ({ base: 'rounded' });
      const button = tv(getConfig());

      function Button() {
        return <button className={button()} />;
      }
    `;

    const result = transform(code, undefined, true);
    // Dynamic config can't be evaluated at compile time
    // Should preserve the tv() call
    expect(result).toContain("tv(");
  });
});

describe("class utilities visitor - twMerge()", () => {
  describe("import tracking", () => {
    it("should track twMerge import from tailwind-merge", () => {
      const code = `
        import { twMerge } from 'tailwind-merge';

        function Button() {
          return <button className={twMerge('px-2 py-1', 'p-4')} />;
        }
      `;

      const result = transform(code, undefined, true);

      // Should remove tailwind-merge import
      expect(result).not.toContain("tailwind-merge");
      // Should have StyleSheet.create
      expect(result).toContain("StyleSheet.create");
      // Should have generated style reference
      expect(result).toContain("_twStyles");
    });

    it("should track aliased twMerge import", () => {
      const code = `
        import { twMerge as merge } from 'tailwind-merge';

        function Button() {
          return <button className={merge('px-2', 'px-4')} />;
        }
      `;

      const result = transform(code, undefined, true);
      expect(result).not.toContain("tailwind-merge");
      expect(result).toContain("StyleSheet.create");
    });
  });

  describe("static class merging", () => {
    it("should merge conflicting classes correctly", () => {
      const code = `
        import { twMerge } from 'tailwind-merge';

        function Button() {
          return <button className={twMerge('px-2 py-1', 'p-4')} />;
        }
      `;

      const result = transform(code, undefined, true);
      expect(result).toContain("StyleSheet.create");
      // p-4 should win over px-2 py-1
      expect(result).toContain("_twStyles");
    });

    it("should handle multiple string arguments", () => {
      const code = `
        import { twMerge } from 'tailwind-merge';

        function Button() {
          return <button className={twMerge('font-bold', 'text-lg', 'text-blue-500')} />;
        }
      `;

      const result = transform(code, undefined, true);
      expect(result).toContain("StyleSheet.create");
    });

    it("should handle single string argument", () => {
      const code = `
        import { twMerge } from 'tailwind-merge';

        function Button() {
          return <button className={twMerge('p-4 font-bold')} />;
        }
      `;

      const result = transform(code, undefined, true);
      expect(result).toContain("StyleSheet.create");
    });
  });

  describe("dynamic values", () => {
    it("should not transform calls with dynamic arguments", () => {
      const code = `
        import { twMerge } from 'tailwind-merge';

        function Button({ extraClasses }) {
          return <button className={twMerge('p-4', extraClasses)} />;
        }
      `;

      const result = transform(code, undefined, true);
      // Should preserve twMerge call since we can't resolve dynamic values
      expect(result).toContain("twMerge(");
    });
  });
});

describe("class utilities visitor - twJoin()", () => {
  it("should track twJoin import from tailwind-merge", () => {
    const code = `
      import { twJoin } from 'tailwind-merge';

      function Button() {
        return <button className={twJoin('px-2', 'py-1', 'bg-blue-500')} />;
      }
    `;

    const result = transform(code, undefined, true);

    // Should remove tailwind-merge import
    expect(result).not.toContain("tailwind-merge");
    expect(result).toContain("StyleSheet.create");
    expect(result).toContain("_twStyles");
  });

  it("should join classes without conflict resolution", () => {
    const code = `
      import { twJoin } from 'tailwind-merge';

      function Button() {
        return <button className={twJoin('px-2', 'px-4')} />;
      }
    `;

    const result = transform(code, undefined, true);
    expect(result).toContain("StyleSheet.create");
    // twJoin keeps both classes (unlike twMerge which resolves conflicts)
  });
});

describe("class utilities visitor - cx()", () => {
  it("should track cx import from class-variance-authority", () => {
    const code = `
      import { cx } from 'class-variance-authority';

      function Button() {
        return <button className={cx('px-2', 'py-1', 'bg-blue-500')} />;
      }
    `;

    const result = transform(code, undefined, true);

    // Should remove class-variance-authority import
    expect(result).not.toContain("class-variance-authority");
    expect(result).toContain("StyleSheet.create");
    expect(result).toContain("_twStyles");
  });

  it("should handle cx with multiple string arguments", () => {
    const code = `
      import { cx } from 'class-variance-authority';

      function Button() {
        return <button className={cx('font-bold', 'text-lg', 'text-red-500')} />;
      }
    `;

    const result = transform(code, undefined, true);
    expect(result).toContain("StyleSheet.create");
  });
});

describe("class utilities - mixed usage", () => {
  it("should handle tv and twMerge in same file", () => {
    const code = `
      import { tv } from 'tailwind-variants';
      import { twMerge } from 'tailwind-merge';

      const button = tv({
        base: 'rounded-lg',
        variants: {
          size: { sm: 'p-1', lg: 'p-4' },
        },
      });

      function Component() {
        return (
          <div>
            <button className={button({ size: 'sm' })} />
            <span className={twMerge('text-sm', 'text-lg')} />
          </div>
        );
      }
    `;

    const result = transform(code, undefined, true);
    expect(result).toContain("StyleSheet.create");
    // Both imports should be removed
    expect(result).not.toContain("tailwind-variants");
    expect(result).not.toContain("tailwind-merge");
  });

  it("should handle cva and twMerge in same file", () => {
    const code = `
      import { cva } from 'class-variance-authority';
      import { twMerge } from 'tailwind-merge';

      const button = cva('font-semibold', {
        variants: {
          size: { sm: 'text-sm', lg: 'text-lg' },
        },
      });

      function Component() {
        return (
          <div>
            <button className={button({ size: 'lg' })} />
            <span className={twMerge('p-2', 'p-4')} />
          </div>
        );
      }
    `;

    const result = transform(code, undefined, true);
    expect(result).toContain("StyleSheet.create");
    expect(result).not.toContain("class-variance-authority");
    expect(result).not.toContain("tailwind-merge");
  });

  it("should handle multiple imports from same library", () => {
    const code = `
      import { cva, cx } from 'class-variance-authority';

      const button = cva('rounded-lg', {
        variants: {
          size: { sm: 'p-1', lg: 'p-4' },
        },
      });

      function Component() {
        return (
          <div>
            <button className={button({ size: 'sm' })} />
            <span className={cx('text-sm', 'font-bold')} />
          </div>
        );
      }
    `;

    const result = transform(code, undefined, true);
    expect(result).toContain("StyleSheet.create");
    expect(result).not.toContain("class-variance-authority");
  });

  it("should handle twMerge and twJoin from same library", () => {
    const code = `
      import { twMerge, twJoin } from 'tailwind-merge';

      function Component() {
        return (
          <div>
            <button className={twMerge('px-2', 'px-4')} />
            <span className={twJoin('text-sm', 'font-bold')} />
          </div>
        );
      }
    `;

    const result = transform(code, undefined, true);
    expect(result).toContain("StyleSheet.create");
    expect(result).not.toContain("tailwind-merge");
  });

  it("should handle all three libraries together", () => {
    const code = `
      import { tv } from 'tailwind-variants';
      import { cva, cx } from 'class-variance-authority';
      import { twMerge, twJoin } from 'tailwind-merge';

      const tvButton = tv({
        base: 'rounded',
        variants: { size: { sm: 'p-1' } },
      });

      const cvaButton = cva('font-bold', {
        variants: { color: { red: 'text-red-500' } },
      });

      function Component() {
        return (
          <div>
            <button className={tvButton({ size: 'sm' })} />
            <button className={cvaButton({ color: 'red' })} />
            <span className={cx('a', 'b')} />
            <span className={twMerge('c', 'd')} />
            <span className={twJoin('e', 'f')} />
          </div>
        );
      }
    `;

    const result = transform(code, undefined, true);
    expect(result).toContain("StyleSheet.create");
    expect(result).not.toContain("tailwind-variants");
    expect(result).not.toContain("class-variance-authority");
    expect(result).not.toContain("tailwind-merge");
  });
});
