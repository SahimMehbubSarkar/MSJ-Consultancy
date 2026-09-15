"use client";

import React, { useState } from "react";

/**
 * Reusable Floating Label Input — matches login page style.
 * Supports input, textarea, and select via the `as` prop.
 *
 * Usage:
 *   <FloatingField id="site-name" label="Site Name" value={...} onChange={...} icon={<Globe size={18} />} />
 *   <FloatingField as="textarea" id="address" label="Address" value={...} onChange={...} rows={3} />
 *   <FloatingField as="select" id="tz" label="Timezone" value={...} onChange={...} options={[...]} />
 */
export default function FloatingField({
  id,
  label,
  type = "text",
  value,
  onChange,
  icon,
  rightElement,
  error,
  disabled,
  required,
  autoComplete,
  as,
  rows,
  options,
  placeholder,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue =
    value !== undefined && value !== null && String(value).length > 0;
  const isFloating = isFocused || hasValue;

  const containerClass = `msj-floating-container ${isFocused ? "focused" : ""} ${
    error ? "error" : ""
  }`;

  // Textarea variant
  if (as === "textarea") {
    return (
      <div className="msj-floating-group">
        <div className={`msj-floating-container msj-floating-textarea ${isFocused ? "focused" : ""} ${error ? "error" : ""}`}>
          {icon && <div className="msj-input-icon msj-input-icon-top">{icon}</div>}
          <textarea
            id={id}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            required={required}
            rows={rows || 3}
            className="msj-input msj-input-textarea"
            placeholder=" "
            style={icon ? { paddingLeft: "48px" } : { paddingLeft: "16px" }}
          />
          <label
            htmlFor={id}
            className={`msj-floating-label ${isFloating ? "active" : ""}`}
            style={icon ? {} : { left: "16px" }}
          >
            {label}
          </label>
        </div>
        {error && <p className="msj-field-error">{error}</p>}
      </div>
    );
  }

  // Select variant
  if (as === "select") {
    return (
      <div className="msj-floating-group">
        <div className={containerClass}>
          {icon && <div className="msj-input-icon">{icon}</div>}
          <select
            id={id}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            required={required}
            className="msj-input msj-input-select"
            style={icon ? {} : { paddingLeft: "16px" }}
          >
            {options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <label
            htmlFor={id}
            className={`msj-floating-label ${isFloating ? "active" : ""}`}
            style={icon ? {} : { left: "16px" }}
          >
            {label}
          </label>
        </div>
        {error && <p className="msj-field-error">{error}</p>}
      </div>
    );
  }

  // Default: input
  return (
    <div className="msj-floating-group">
      <div className={containerClass}>
        {icon && <div className="msj-input-icon">{icon}</div>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className="msj-input"
          placeholder=" "
        />
        <label
          htmlFor={id}
          className={`msj-floating-label ${isFloating ? "active" : ""}`}
          style={icon ? {} : { left: "16px" }}
        >
          {label}
        </label>
        {rightElement}
      </div>
      {error && <p className="msj-field-error">{error}</p>}
    </div>
  );
}
