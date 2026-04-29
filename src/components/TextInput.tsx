/**
 * Enhanced TextInput component with focus state support for focus: modifier
 *
 * This component wraps React Native's TextInput and manages focus state internally,
 * allowing the style prop to be a function that receives { focused: boolean }.
 *
 * @example
 * ```tsx
 * import { TextInput } from '@mgcrea/react-native-tailwind';
 *
 * <TextInput
 *   className="border-2 border-gray-300 focus:border-blue-500 p-3 rounded-lg"
 *   placeholder="Email"
 * />
 * ```
 */

import { forwardRef, useCallback, useState } from "react";
import {
  type BlurEvent,
  type FocusEvent,
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
} from "react-native";

import { type Simplify } from "../types/util";

export type TextInputProps = Simplify<
  Omit<RNTextInputProps, "style"> & {
    /**
     * Style can be a static style object/array or a function that receives focus and disabled state
     */
    style?:
      | RNTextInputProps["style"]
      | ((state: { focused: boolean; disabled: boolean }) => RNTextInputProps["style"]);
    className?: string; // compile-time only
    /**
     * Convenience prop for disabled state (overrides editable if provided)
     * When true, sets editable to false
     */
    disabled?: boolean;
  }
>;

/**
 * Enhanced TextInput with focus and disabled state support
 *
 * Manages focus state internally and passes it to style functions,
 * enabling the use of focus: and disabled: modifiers in className.
 *
 * Note: TextInput uses `editable` prop internally. You can pass either:
 * - `disabled={true}` - convenience prop (sets editable to false)
 * - `editable={false}` - React Native's native prop
 * If both are provided, `disabled` takes precedence.
 */
export const TextInput = forwardRef<RNTextInput, TextInputProps>(function TextInput(
  { style, onFocus, onBlur, disabled, editable = true, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(
    (e: FocusEvent) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e: BlurEvent) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  // Resolve editable state: disabled prop overrides editable if provided
  const isEditable = disabled !== undefined ? !disabled : editable;
  const isDisabled = !isEditable;

  // Resolve style - call function with focus and disabled state if needed
  const resolvedStyle = typeof style === "function" ? style({ focused, disabled: isDisabled }) : style;

  return (
    <RNTextInput
      ref={ref}
      style={resolvedStyle}
      editable={isEditable}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
});
