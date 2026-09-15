import React, { useState, forwardRef } from "react";
import styles from "./FloatingInput.module.css";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ id, label, icon, rightElement, error, value, type = "text", onChange, onFocus, onBlur, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    const isFloating = isFocused || hasValue;

    return (
      <div className={styles.wrapper}>
        <div
          className={`${styles.container} ${isFocused ? styles.focused : ""} ${
            error ? styles.hasError : ""
          } ${icon ? styles.withIcon : ""}`}
        >
          {icon && <div className={styles.leftIcon}>{icon}</div>}

          <input
            ref={ref}
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            placeholder=" "
            className={styles.inputField}
            {...rest}
          />

          <label
            htmlFor={id}
            className={`${styles.floatingLabel} ${isFloating ? styles.floating : ""}`}
          >
            {label}
          </label>

          {rightElement && <div className={styles.rightElement}>{rightElement}</div>}
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";
