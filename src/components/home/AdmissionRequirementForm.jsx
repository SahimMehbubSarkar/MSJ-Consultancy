"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Mail,
  Phone,
  Globe,
  GraduationCap,
  Building2,
  BookOpen,
  Layers,
  FileText,
  UploadCloud,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
  ShieldCheck,
  Lock,
  QrCode,
  MapPin,
  Stethoscope,
  Award,
  ChevronDown,
  X,
  CreditCard,
} from "lucide-react";

const ICONS = {
  candidate_name: User,
  student_name: User,
  email: Mail,
  phone: Phone,
  gender: User,
  target_state: MapPin,
  target_country: MapPin,
  qualification: GraduationCap,
  study_level: BookOpen,
  target_hospital: Building2,
  target_university: Building2,
  department: Stethoscope,
  preferred_course: Layers,
  hs_marks: Award,
  madhyamik_marks: Award,
  application_fee: CreditCard,
  payment_receipt: UploadCloud,
  coordinator_notes: FileText,
  counselor_notes: FileText,
};

function getFieldIcon(column) {
  const Icon = ICONS[column] || FileText;
  return <Icon size={18} />;
}

export default function AdmissionRequirementForm() {
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [receiptFile, setReceiptFile] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [focused, setFocused] = useState(null);
  const [touched, setTouched] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await fetch(`/api/admin/admissions/template?t=${Date.now()}`, { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.template) {
          const t = json.template;
          setTemplate(t);
          const initial = {};
          (t.fields || []).forEach((f) => {
            if (f.column === "application_fee") {
              initial[f.id] = t.application_fee || "1000";
            } else if (f.type === "select" && f.options && f.options.length > 0) {
              initial[f.id] = f.column === "target_state" || f.column === "target_country" ? [] : "";
            } else {
              initial[f.id] = "";
            }
          });
          setFormData(initial);
        }
      } catch (err) {
        console.warn("Could not load admission template:", err);
      }
    }
    loadTemplate();
  }, []);

  const fee = parseFloat(template?.application_fee || "1000").toFixed(2);

  const isFieldEmpty = (field) => {
    const val = formData[field.id];
    if (field.column === "target_state" || field.column === "target_country") {
      return !Array.isArray(val) || val.length === 0;
    }
    return val === undefined || val === null || String(val).trim().length === 0;
  };

  const hasFieldError = (field) => {
    if (!field.required || field.column === "application_fee") return false;
    return (formSubmitted || touched[field.id]) && isFieldEmpty(field);
  };

  const isFieldValid = (field) => {
    if (field.column === "application_fee") return true;
    return !isFieldEmpty(field);
  };

  const hasReceiptError = formSubmitted && !receiptFile;

  const completion = useMemo(() => {
    if (!template?.fields?.length) return 0;
    const fillable = template.fields.filter((f) => f.column !== "application_fee");
    const filled = fillable.filter((f) => {
      const v = formData[f.id];
      return v !== undefined && v !== null && String(v).trim().length > 0;
    }).length;
    return Math.round((filled / fillable.length) * 100);
  }, [formData, template]);

  const handleToggleState = (id, value) => {
    if (!value) return;
    setTouched((prev) => ({ ...prev, [id]: true }));
    setFormData((prev) => {
      const arr = Array.isArray(prev[id]) ? prev[id] : [];
      if (arr.includes(value)) return prev;
      if (arr.length >= 4) return prev;
      return { ...prev, [id]: [...arr, value] };
    });
  };

  const handleRemoveState = (id, value) => {
    setTouched((prev) => ({ ...prev, [id]: true }));
    setFormData((prev) => {
      const arr = Array.isArray(prev[id]) ? prev[id] : [];
      return { ...prev, [id]: arr.filter((v) => v !== value) };
    });
  };

  const handleChange = (id, val) => {
    setFormData((prev) => ({ ...prev, [id]: val }));
    setTouched((prev) => ({ ...prev, [id]: true }));
  };

  const handleFile = (file) => {
    setReceiptError("");
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setReceiptError("Receipt file must be under 3MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setReceiptFile(e.target?.result || "");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setResult(null);

    const missing = (template?.fields || []).filter(
      (f) => f.required && !f.column.includes("application_fee") && isFieldEmpty(f)
    );
    const receiptMissing = !receiptFile;
    const termsMissing = !termsAccepted;

    if (missing.length > 0 || receiptMissing || termsMissing) {
      const firstMissing = missing[0];
      let targetId = firstMissing ? `hosp_field_${firstMissing.id}` : "admission-receipt-file";
      if (termsMissing) targetId = "admission-terms-checkbox";
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.focus?.();
        targetEl.scrollIntoView?.({ behavior: "smooth", block: "center" });
      }

      const missingLabels = missing.map((f) => f.label);
      if (receiptMissing) missingLabels.push("Payment Receipt");
      if (termsMissing) missingLabels.push("Terms & Conditions agreement");
      setResult({ success: false, message: `Please fill required fields: ${missingLabels.join(", ")}` });
      return;
    }

    const payload = { application_fee: fee };
    (template?.fields || []).forEach((f) => {
      if (f.column === "payment_receipt") payload[f.column] = receiptFile;
      else if (f.column === "application_fee") payload[f.column] = fee;
      else if (f.column === "target_state" || f.column === "target_country") payload[f.column] = Array.isArray(formData[f.id]) ? formData[f.id].join(", ") : formData[f.id];
      else payload[f.column] = formData[f.id];
    });
    payload.template_header = template?.template_header;
    payload.template_footer = template?.template_footer;
    payload.terms_accepted = true;
    payload.form_data = { ...formData };
    delete payload.form_data.payment_receipt;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admissions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setResult(json);
      if (json.success) {
        setFormData({});
        setReceiptFile("");
      }
    } catch (err) {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!template) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
        <Loader2 size={28} className="spin" style={{ margin: "0 auto 10px" }} />
        <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>Loading Student Admission Application...</div>
      </div>
    );
  }

  const logo = template.admission_logo || "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80";

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0a1d37 0%, #0c2340 50%, #102d50 100%)",
        color: "#ffffff",
        padding: "1.5rem 2rem 1.5rem 2rem",
        borderBottom: "4px solid #1e3a8a",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative accent bar */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 4,
          height: "100%",
          background: "linear-gradient(180deg, #3b82f6, #1e3a8a)",
        }}>
        </div>

        {/* Top banner row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "0.75rem",
          marginBottom: "1rem",
          borderBottom: "1px solid rgba(147,197,253,0.15)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.74rem",
            fontWeight: 700,
            letterSpacing: "0.07em",
            color: "#93c5fd",
            textTransform: "uppercase",
          }}>
            <ShieldCheck size={16} color="#60a5fa" />
            <span>{template.top_banner_title}</span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.72rem",
            color: "#bfdbfe",
            fontWeight: 600,
            background: "rgba(30,58,138,0.35)",
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid rgba(96,165,250,0.2)",
          }}>
            <Lock size={13} color="#60a5fa" />
            <span>{template.top_banner_tag}</span>
          </div>
        </div>

        {/* Main header content */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{
            flexShrink: 0,
            width: 72,
            height: 72,
            borderRadius: 8,
            background: "#ffffff",
            padding: 4,
            border: "2px solid rgba(96,165,250,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          }}>
            <img
              src={logo}
              alt="University Admission Logo"
              style={{ width: "100%", height: "100%", borderRadius: 4, objectFit: "cover", display: "block" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.1em",
              color: "#60a5fa",
              textTransform: "uppercase",
              marginBottom: 4,
            }}>
              Official Admission Enrolment Dossier
            </div>
            <h2 style={{
              fontSize: "1.38rem",
              fontWeight: 800,
              color: "#ffffff",
              margin: "0 0 5px 0",
              lineHeight: 1.2,
              letterSpacing: "-0.015em",
            }}>
              {template.template_header}
            </h2>
            <div style={{
              fontSize: "0.84rem",
              color: "#cbd5e1",
              lineHeight: 1.5,
              fontWeight: 500,
            }}>
              {template.subtitle}
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding: "1.5rem 1.75rem 2rem 1.75rem", display: "flex", flexDirection: "column", gap: "1.05rem" }}>
        <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#0f172a" }}>
              <HeartPulse size={14} color="#0d9488" />
              <span>Application Readiness:</span>
              <span style={{ color: completion === 100 ? "#059669" : "#0d9488", fontWeight: 800 }}>{completion}% Completed</span>
            </div>
          </div>
          <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${completion}%`, height: "100%", background: completion === 100 ? "#059669" : "#0d9488", borderRadius: 99, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* Fields */}
        <div className="msj-form-grid-2">
          {(template.fields || []).filter((f) => f.column !== "application_fee" && f.column !== "payment_receipt").map((field) => {
            const isStateField = field.column === "target_state" || field.column === "target_country";
            const isSelect = field.type === "select" && !isStateField;
            const isTextarea = field.type === "textarea";
            const hasValue = isStateField
              ? Array.isArray(formData[field.id]) && formData[field.id].length > 0
              : formData[field.id] !== undefined && formData[field.id] !== "";
            const isFloating = focused === field.id || hasValue;
            const selectedStates = isStateField ? (Array.isArray(formData[field.id]) ? formData[field.id] : []) : [];
            const hasErr = hasFieldError(field);
            const isValid = isFieldValid(field);

            return (
              <div
                className={`msj-floating-group ${isSelect ? "select-group " : isTextarea ? "textarea-group " : ""}${isFloating || isStateField ? "active " : ""}${hasErr ? "has-error " : ""}${isValid ? "is-valid " : ""}`}
                key={field.id}
              >
                <div className="msj-floating-field-icon">{getFieldIcon(field.column)}</div>
                {isTextarea ? (
                  <textarea
                    id={`hosp_field_${field.id}`}
                    className={`msj-floating-input msj-floating-textarea ${hasErr ? "has-error" : ""}`}
                    value={formData[field.id] || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    onFocus={() => setFocused(field.id)}
                    onBlur={() => {
                      setFocused(null);
                      setTouched((prev) => ({ ...prev, [field.id]: true }));
                    }}
                    required={field.required}
                    placeholder=" "
                    rows={3}
                  />
                ) : isStateField ? (
                  <div
                    className={`msj-multiselect-state-group ${hasErr ? "has-error" : isValid ? "active is-valid" : ""}`}
                    style={{ position: "relative", width: "100%" }}
                  >
                    {selectedStates.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8, paddingTop: 4, paddingLeft: 8, paddingRight: 8 }}>
                        {selectedStates.map((st) => (
                          <span
                            key={st}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              background: "#eff6ff",
                              color: "#1e3a8a",
                              border: "1.5px solid #93c5fd",
                              borderRadius: "4px",
                              padding: "3px 8px",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb" }} />
                            <span>{st}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveState(field.id, st)}
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "#64748b",
                                cursor: "pointer",
                                padding: "0 0 0 4px",
                                display: "inline-flex",
                                alignItems: "center",
                                fontWeight: 900,
                              }}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <select
                      id={`hosp_field_${field.id}`}
                      className="msj-floating-input msj-floating-select"
                      value=""
                      onChange={(e) => handleToggleState(field.id, e.target.value)}
                      onFocus={() => setFocused(field.id)}
                      onBlur={() => {
                        setFocused(null);
                        setTouched((prev) => ({ ...prev, [field.id]: true }));
                      }}
                      disabled={selectedStates.length >= 4}
                      style={{ height: "48px", paddingRight: "40px" }}
                    >
                      <option value="">
                        {selectedStates.length === 0
                          ? "— Select preferred state (Up to 4) —"
                          : selectedStates.length >= 4
                            ? "✓ Maximum 4 states selected"
                            : `+ Add another preferred state (${selectedStates.length}/4 selected)`}
                      </option>
                      {(field.options || []).map((opt, idx) => {
                        const isSelected = selectedStates.includes(opt);
                        return (
                          <option key={idx} value={opt} disabled={isSelected}>
                            {isSelected ? `✓ ${opt} (Selected)` : opt}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown
                      size={18}
                      color={hasErr ? "#dc2626" : "#64748b"}
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                    <label
                      htmlFor={`hosp_field_${field.id}`}
                      className="msj-floating-label"
                      style={{ top: "0px" }}
                    >
                      {field.label.includes("Max") ? field.label : `${field.label} (Max 4)`}
                      {field.required && <span className="msj-req-star">*</span>}
                    </label>
                  </div>
                ) : isSelect ? (
                  <>
                    <select
                      id={`hosp_field_${field.id}`}
                      className={`msj-floating-input msj-floating-select ${hasErr ? "has-error" : ""}`}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      onFocus={() => setFocused(field.id)}
                      onBlur={() => {
                        setFocused(null);
                        setTouched((prev) => ({ ...prev, [field.id]: true }));
                      }}
                      required={field.required}
                      style={{ paddingRight: "40px" }}
                    >
                      <option value="" disabled>{field.placeholder || "Select"}</option>
                      {(field.options || []).map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      color={hasErr ? "#dc2626" : "#64748b"}
                      style={{
                        position: "absolute",
                        right: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                  </>
                ) : (
                  <input
                    id={`hosp_field_${field.id}`}
                    type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
                    step={field.type === "number" ? "any" : undefined}
                    className={`msj-floating-input ${hasErr ? "has-error" : ""}`}
                    value={formData[field.id] || ""}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    onFocus={() => setFocused(field.id)}
                    onBlur={() => {
                      setFocused(null);
                      setTouched((prev) => ({ ...prev, [field.id]: true }));
                    }}
                    required={field.required}
                    placeholder=" "
                  />
                )}
                {!isStateField && (
                  <label htmlFor={`hosp_field_${field.id}`} className="msj-floating-label">
                    {field.label}
                    {field.required ? (
                      <span className="msj-req-star">*</span>
                    ) : (
                      !field.label.toLowerCase().includes("optional") && (
                        <span style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 600, marginLeft: 4 }}>
                          (Optional)
                        </span>
                      )
                    )}
                  </label>
                )}
                {hasErr && (
                  <div className="msj-field-error-msg">
                    <AlertCircle size={12} />
                    <span>{isStateField ? "Please select at least 1 preferred state" : `${field.label} is required`}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Application Fee */}
        <div className="msj-form-grid-2">
          <div className="msj-floating-group active">
            <div className="msj-floating-field-icon"><CreditCard size={18} /></div>
            <input
              id="hosp_field_application_fee"
              type="text"
              className="msj-floating-input"
              value={`₹${fee}`}
              readOnly
              style={{ paddingRight: "115px" }}
              placeholder=" "
            />
            <span
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.72rem",
                fontWeight: 800,
                color: "#64748b",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                padding: "3px 8px",
                borderRadius: 3,
                pointerEvents: "none",
              }}
            >
              <Lock size={12} /> Fixed
            </span>
            <label htmlFor="hosp_field_application_fee" className="msj-floating-label">
              Application Processing Fee
            </label>
          </div>

          <div className={`msj-floating-group active ${hasReceiptError ? "has-error" : receiptFile ? "is-valid" : ""}`}>
            <div className="msj-floating-field-icon"><UploadCloud size={18} /></div>
            <input
              type="file"
              id="admission-receipt-file"
              accept="image/*,application/pdf"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <label
              htmlFor="admission-receipt-file"
              className={`msj-floating-input msj-receipt-upload-box ${hasReceiptError ? "has-error" : ""}`}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderStyle: "dashed",
                color: hasReceiptError ? "#dc2626" : receiptFile ? "#1d4ed8" : "#0f172a",
              }}
            >
              <UploadCloud size={16} />
              {receiptFile ? "✓ Receipt uploaded successfully" : "Upload payment screenshot / PDF"}
            </label>
            <label className="msj-floating-label" style={{ top: "0px" }}>
              Payment Receipt / UPI Confirmation <span className="msj-req-star">*</span>
            </label>
            {hasReceiptError && (
              <div className="msj-field-error-msg">
                <AlertCircle size={12} />
                <span>Payment receipt / screenshot is required</span>
              </div>
            )}
            {receiptError && <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: 4 }}>{receiptError}</div>}
          </div>
        </div>

        {/* QR Section */}
        {template.payment_qr && (
          <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", padding: "1rem 1.15rem", display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div style={{ flexShrink: 0, textAlign: "center" }}>
              <img
                src={template.payment_qr}
                alt="Scan & Pay"
                style={{ width: 105, height: 105, objectFit: "contain", background: "#ffffff", padding: 6, border: "1.5px solid #16a34a", display: "block" }}
              />
              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#166534", marginTop: 4 }}>
                SCAN &amp; PAY ₹{fee}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 800, color: "#166534" }}>
                <QrCode size={16} color="#15803d" />
                <span>OFFICIAL UPI APPLICATION FEE VERIFICATION</span>
              </div>
              <div style={{ fontSize: "0.74rem", color: "#14532d", margin: "4px 0 8px", lineHeight: 1.45 }}>
                {template.payment_instructions}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#0f172a", fontWeight: 700 }}>
                Amount: <strong>₹{fee}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        {result && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: "0.85rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: result.success ? "#ecfdf5" : "#fee2e2",
              color: result.success ? "#065f46" : "#b91c1c",
              border: `1px solid ${result.success ? "#a7f3d0" : "#fca5a5"}`,
            }}
          >
            {result.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {result.message}
          </div>
        )}

        <div
          style={{
            background: "#f8fafc",
            border: `1.5px solid ${!termsAccepted && formSubmitted ? "#ef4444" : "#cbd5e1"}`,
            borderRadius: 10,
            padding: "1rem 1.15rem",
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            transition: "border-color 0.2s ease",
          }}
        >
          <input
            type="checkbox"
            id="admission-terms-checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            required
            style={{
              marginTop: 3,
              width: 20,
              height: 20,
              minWidth: 20,
              minHeight: 20,
              accentColor: "#0a1d37",
              cursor: "pointer",
            }}
          />
          <label
            htmlFor="admission-terms-checkbox"
            style={{
              fontSize: "0.85rem",
              color: "#1e293b",
              lineHeight: 1.6,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            <strong style={{ color: "#0a1d37" }}>
              I hereby confirm that I have read, understood, and voluntarily agree to the
              Terms & Conditions, Privacy Policy, and Refund Policy of MSJ Global Education.
            </strong>{" "}
            I acknowledge that the information provided in this application is true and accurate to the best of my knowledge.
            I understand that submission of false or misleading information may result in immediate rejection of my application
            without refund, and may be subject to legal action under applicable Indian laws.
            I authorize MSJ Global Education and its partner institutions to process my personal and academic data for admission,
            verification, and placement purposes in accordance with their data protection policies.
            <span className="msj-req-star" style={{ fontSize: "0.9rem" }}> *</span>
          </label>
        </div>
        {!termsAccepted && formSubmitted && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#dc2626",
            fontSize: "0.82rem",
            fontWeight: 600,
            marginTop: 6,
            padding: "0 0.25rem",
          }}>
            <AlertCircle size={14} />
            <span>You must agree to the Terms & Conditions to submit this application.</span>
          </div>
        )}

        <button
          type="submit"
          className="msj-submit-cta-btn"
          disabled={submitting}
          id="hsp-form-submit-btn"
          style={{ marginTop: "0.5rem" }}
        >
          {submitting ? (
            <>
              <Loader2 className="msj-spinner" size={18} />
              <span>Transmitting Application...</span>
            </>
          ) : (
            <>
              <Send size={18} />
              <span>Submit Official Admission Application</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
