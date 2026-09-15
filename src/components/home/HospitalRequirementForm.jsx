"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  User,
  Mail,
  Phone,
  Globe,
  GraduationCap,
  Building2,
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
  FileBadge,
  FileCheck,
  Camera,
  Printer,
  Copy,
  Check,
  Download,
} from "lucide-react";

const ICONS = {
  candidate_name: User,
  email: Mail,
  phone: Phone,
  gender: User,
  target_state: MapPin,
  qualification: GraduationCap,
  target_hospital: Building2,
  department: Stethoscope,
  hs_marks: Award,
  madhyamik_marks: Award,
  application_fee: CreditCard,
  payment_receipt: UploadCloud,
  cv_attach: FileBadge,
  coordinator_notes: FileText,
};

function getFieldIcon(column) {
  const Icon = ICONS[column] || FileText;
  return <Icon size={18} />;
}

export default function HospitalRequirementForm() {
  const [template, setTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [receiptFile, setReceiptFile] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [cvFile, setCvFile] = useState("");
  const [cvError, setCvError] = useState("");
  const [cvDragOver, setCvDragOver] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [focused, setFocused] = useState(null);
  const [successCard, setSuccessCard] = useState(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [touched, setTouched] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (successCard) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [successCard]);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await fetch(`/api/hospital-requirements/template?t=${Date.now()}`, { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.template) {
          const t = json.template;
          setTemplate(t);
          const initial = {};
          (t.fields || []).forEach((f) => {
            if (f.column === "application_fee") {
              initial[f.id] = t.application_fee || "1500";
            } else if (f.type === "select" && f.options && f.options.length > 0) {
              initial[f.id] = f.column === "target_state" || f.column === "target_country" ? [] : "";
            } else {
              initial[f.id] = "";
            }
          });
          setFormData(initial);
        }
      } catch (err) {
        console.warn("Could not load hospital template:", err);
      }
    }
    loadTemplate();
  }, []);

  const fee = parseFloat(template?.application_fee || "1500").toFixed(2);

  const isFieldEmpty = (field) => {
    const val = formData[field.id];
    if (field.column === "target_state" || field.column === "target_country") {
      return !Array.isArray(val) || val.length === 0;
    }
    return val === undefined || val === null || String(val).trim().length === 0;
  };

  const isFieldRequired = (field) => {
    if (
      field.column === "target_hospital" ||
      field.column === "department" ||
      field.column === "coordinator_notes" ||
      field.column === "cv_attach" ||
      field.column === "application_fee"
    ) {
      return false;
    }
    return Boolean(field.required);
  };

  const hasFieldError = (field) => {
    if (!isFieldRequired(field)) return false;
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

  const handleCvFile = (file) => {
    setCvError("");
    if (!file) return;
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileExt = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
      setCvError("Only PDF, DOC, or DOCX files are allowed. Please upload a valid CV file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setCvError("CV file must be under 3MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setCvFile(e.target?.result || "");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setResult(null);

    const missing = (template?.fields || []).filter(
      (f) => isFieldRequired(f) && isFieldEmpty(f)
    );

    const receiptMissing = !receiptFile;
    const termsMissing = !termsAccepted;

    if (missing.length > 0 || receiptMissing || termsMissing) {
      const firstMissing = missing[0];
      let targetId = firstMissing ? `hosp_field_${firstMissing.id}` : "hospital-receipt-file";
      if (termsMissing) targetId = "hospital-terms-checkbox";
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.focus?.();
        targetEl.scrollIntoView?.({ behavior: "smooth", block: "center" });
      }

      const missingLabels = missing.map((f) => f.label);
      if (receiptMissing) missingLabels.push("Payment Receipt");
      if (termsMissing) missingLabels.push("Terms & Conditions agreement");
      setResult({
        success: false,
        message: `Please fill required fields: ${missingLabels.join(", ")}`,
      });
      return;
    }

    const payload = { application_fee: fee };
    (template?.fields || []).forEach((f) => {
      if (f.column === "payment_receipt") payload[f.column] = receiptFile;
      else if (f.column === "cv_attach") payload[f.column] = cvFile;
      else if (f.column === "application_fee") payload[f.column] = fee;
      else if (f.column === "target_state" || f.column === "target_country") payload[f.column] = Array.isArray(formData[f.id]) ? formData[f.id].join(", ") : formData[f.id];
      else payload[f.column] = formData[f.id];
    });
    payload.template_header = template?.template_header;
    payload.template_footer = template?.template_footer;
    payload.terms_accepted = true;
    payload.form_data = { ...formData };
    delete payload.form_data.payment_receipt;
    delete payload.form_data.cv_attach;

    setSubmitting(true);
    try {
      const res = await fetch("/api/hospital-requirements/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setResult(json);
      if (json.success) {
        setFormData({});
        setReceiptFile("");
        setCvFile("");
        setSuccessCard({
          application_no: json.trackingId || json.hospital?.application_no || "HSP-2026-REGISTERED",
          candidate_name: payload.candidate_name || "Applicant",
          phone: payload.phone || "N/A",
          email: payload.email || "N/A",
          gender: payload.gender || "Not Specified",
          target_hospital: payload.target_hospital || "Any Verified MSJ Network Hospital",
          department: payload.department || "General Nursing & Patient Care",
          qualification: payload.qualification || "Standard",
          target_state: payload.target_state || "India",
          paid_amount: fee,
          payment_status: "paid",
          payment_method: payload.payment_method || "UPI / QR Scan",
          transaction_id: json.hospital?.transaction_id || `UPI-${Date.now().toString().slice(-8)}`,
          created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      setResult({ success: false, message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadCard = () => {
    if (!successCard) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1200, 1400);

    // Header Background
    ctx.fillStyle = "#0c2340";
    ctx.fillRect(0, 0, 1200, 220);

    // Accent Stripe
    ctx.fillStyle = "#d97706";
    ctx.fillRect(0, 212, 1200, 8);

    // Header Titles
    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("OFFICIAL REGISTRATION PASS • MSJ GLOBAL EDUCATION", 60, 75);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText("Hospital Consultation Pass", 60, 140);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "22px sans-serif";
    ctx.fillText("Overseas & Domestic Hospital Consultation Verification Record", 60, 185);

    // Unique Application Number Box
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.roundRect(60, 260, 1080, 140, 16);
    ctx.fill();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("UNIQUE APPLICATION NUMBER", 90, 310);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 52px monospace";
    ctx.fillText(successCard.application_no, 90, 370);

    // Informative Details Box
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.roundRect(60, 440, 1080, 680, 16);
    ctx.fill();
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.stroke();

    const fields = [
      { label: "APPLICANT FULL NAME", value: successCard.candidate_name, x: 100, y: 520 },
      { label: "CONTACT PHONE NUMBER", value: successCard.phone, x: 640, y: 520 },
      { label: "EMAIL ADDRESS", value: successCard.email, x: 100, y: 640 },
      { label: "TARGET DESTINATION", value: successCard.target_state, x: 640, y: 640 },
      { label: "TARGET HOSPITAL GROUP", value: successCard.target_hospital, x: 100, y: 760 },
      { label: "MEDICAL SPECIALTY / DEPT", value: successCard.department, x: 640, y: 760 },
      { label: "URGENCY / QUALIFICATION", value: successCard.qualification, x: 100, y: 880 },
      { label: "APPLICATION FEE PAID", value: `₹${Number(successCard.paid_amount || 0).toLocaleString()}`, x: 640, y: 880, color: "#059669", isBig: true },
      { label: "PAYMENT VERIFICATION", value: "PAID / RECEIPT ATTACHED", x: 100, y: 1000, color: "#065f46" },
      { label: "TRANSACTION REFERENCE", value: successCard.transaction_id || "UPI-Direct", x: 640, y: 1000 },
    ];

    fields.forEach((f) => {
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(f.label, f.x, f.y);

      ctx.fillStyle = f.color || "#0f172a";
      ctx.font = f.isBig ? "bold 34px sans-serif" : "bold 26px sans-serif";
      ctx.fillText(String(f.value || "N/A"), f.x, f.y + 40);
    });

    // Divider
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(60, 1160);
    ctx.lineTo(1140, 1160);
    ctx.stroke();

    // Footer info
    ctx.fillStyle = "#64748b";
    ctx.font = "20px sans-serif";
    ctx.fillText(`Applied Date: ${new Date(successCard.created_at).toLocaleString()}`, 100, 1220);

    ctx.fillStyle = "#059669";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("✓ Digitally Authenticated by MSJ Medical Coordination Board", 100, 1260);

    // Save as PNG
    const link = document.createElement("a");
    link.download = `${successCard.application_no}-Slip.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!template) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
        <Loader2 size={28} className="spin" style={{ margin: "0 auto 10px" }} />
        <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>Loading Hospital Hiring &amp; Job Application...</div>
      </div>
    );
  }

  const logo = template.hospital_logo || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80";

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
              alt="Hospital Logo"
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
              Official Hospital Placement Dossier
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
          {(template.fields || []).filter((f) => f.column !== "application_fee" && f.column !== "payment_receipt" && f.column !== "cv_attach").map((field) => {
            const isStateField = field.column === "target_state" || field.column === "target_country";
            const isSelect = field.type === "select" && !isStateField;
            const isTextarea = field.type === "textarea";
            const hasValue = isStateField
              ? Array.isArray(formData[field.id]) && formData[field.id].length > 0
              : formData[field.id] !== undefined && formData[field.id] !== "";
            const isFloating = focused === field.id || hasValue;
            const selectedStates = isStateField ? (Array.isArray(formData[field.id]) ? formData[field.id] : []) : [];
            const req = isFieldRequired(field);
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
                    required={req}
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
                      {req && <span className="msj-req-star">*</span>}
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
                      required={req}
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
                    required={req}
                    placeholder=" "
                  />
                )}
                {!isStateField && (
                  <label htmlFor={`hosp_field_${field.id}`} className="msj-floating-label">
                    {field.label}
                    {req ? (
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
              Application Processing Fee <span className="msj-req-star">*</span>
            </label>
          </div>

          <div className={`msj-floating-group active ${hasReceiptError ? "has-error" : receiptFile ? "is-valid" : ""}`}>
            <div className="msj-floating-field-icon"><UploadCloud size={18} /></div>
            <input
              type="file"
              id="hospital-receipt-file"
              accept="image/*,application/pdf"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <label
              htmlFor="hospital-receipt-file"
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

        {/* CV Upload — Drag & Drop */}
        <div className="msj-form-grid-2">
          <div
            className="msj-floating-group active"
            onDragOver={(e) => { e.preventDefault(); setCvDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setCvDragOver(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setCvDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleCvFile(file);
            }}
            style={{
              border: cvDragOver ? "2px solid #2563eb" : cvFile ? "1.5px solid #86efac" : "1.5px dashed #cbd5e1",
              background: cvDragOver ? "#eff6ff" : cvFile ? "#f0fdf4" : "#f8fafc",
              borderRadius: 6,
              padding: "1rem 1.15rem",
              transition: "all 0.2s ease",
              position: "relative",
            }}
          >
            <input
              type="file"
              id="hospital-cv-file"
              accept="application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              style={{ display: "none" }}
              onChange={(e) => handleCvFile(e.target.files?.[0])}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 34, height: 34,
                background: cvFile ? "#dcfce7" : cvDragOver ? "#dbeafe" : "#eff6ff",
                color: cvFile ? "#16a34a" : "#2563eb",
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 4,
              }}>
                {cvFile ? <FileCheck size={18} /> : <FileBadge size={18} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                  {cvFile ? "✓ CV / Resume attached" : "CV / Resume Attachment (Optional)"}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                  {cvFile ? "File uploaded successfully" : "Drag & drop your CV here, or click to browse"}
                </div>
              </div>
              <span style={{ fontSize: "0.68rem", fontWeight: 800, background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", padding: "2px 8px", textTransform: "uppercase" }}>
                MAX 3MB
              </span>
            </div>
            {cvFile ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", border: "1px solid #bbf7d0", padding: "8px 14px", borderRadius: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileBadge size={16} color="#16a34a" />
                  <span style={{ fontSize: "0.80rem", fontWeight: 700, color: "#0f172a" }}>CV file attached</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <label htmlFor="hospital-cv-file" style={{ fontSize: "0.74rem", fontWeight: 700, color: "#2563eb", cursor: "pointer", textDecoration: "underline" }}>
                    Replace
                  </label>
                  <button type="button" onClick={() => { setCvFile(""); setCvError(""); }} style={{ fontSize: "0.74rem", fontWeight: 700, color: "#dc2626", cursor: "pointer", background: "none", border: "none" }}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "6px 0 2px" }}>
                <label htmlFor="hospital-cv-file" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px", background: cvDragOver ? "#2563eb" : "#1e293b", color: "#ffffff", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", borderRadius: 4, transition: "background 0.2s" }}>
                  <UploadCloud size={16} /> {cvDragOver ? "Drop file here" : "Choose CV File (or Drag & Drop)"}
                </label>
                <div style={{ fontSize: "0.70rem", color: "#64748b", marginTop: 5 }}>
                  PDF, DOC, DOCX only • Max 3MB
                </div>
              </div>
            )}
          </div>
          {cvError && <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: 4 }}>{cvError}</div>}
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
            id="hospital-terms-checkbox"
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
            htmlFor="hospital-terms-checkbox"
            style={{
              fontSize: "0.86rem",
              color: "#334155",
              lineHeight: 1.65,
              cursor: "pointer",
              fontWeight: 400,
            }}
          >
            <strong style={{ color: "#0a1d37", display: "block", marginBottom: 6, fontSize: "0.92rem" }}>
              Declaration of Consent & Agreement
            </strong>
            <span style={{ display: "block", marginBottom: 8 }}>
              I confirm that all information provided in this application is true, complete, and accurate to the best of my knowledge. I understand that any false, misleading, or incomplete information may lead to immediate rejection of my application without refund, and may invite legal action under the laws of India.
            </span>
            <span style={{ display: "block", marginBottom: 8 }}>
              I have read and voluntarily agree to the{" "}
              <strong style={{ color: "#1e3a8a" }}>Terms & Conditions</strong>,{" "}
              <strong style={{ color: "#1e3a8a" }}>Privacy Policy</strong>, and{" "}
              <strong style={{ color: "#1e3a8a" }}>Refund Policy</strong> of MSJ Global Education. I authorize MSJ Global Education and its affiliated partner institutions to collect, store, and process my personal and academic data solely for admission, verification, and academic placement purposes, in compliance with applicable data protection regulations.
            </span>
            <span style={{ display: "block", fontSize: "0.8rem", color: "#64748b", fontStyle: "italic" }}>
              By checking this box, I acknowledge that my submission constitutes a legally binding digital declaration of my consent.
            </span>
            <span className="msj-req-star" style={{ fontSize: "0.9rem", color: "#dc2626" }}> *</span>
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
              <span>Submit Hospital Requirement Inquiry</span>
            </>
          )}
        </button>
      </div>

      {/* =====================================================================
          OFFICIAL INQUIRY CONFIRMATION CARD MODAL (RENDERED VIA PORTAL ON BODY)
          ===================================================================== */}
      {mounted && successCard && createPortal(
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(10, 25, 47, 0.88)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 99999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            boxSizing: "border-box",
            margin: 0,
          }}
          onClick={() => setSuccessCard(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            id="hospital-confirmation-card"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.45)",
              border: "2px solid #0f172a",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #0c2340 0%, #0a1d37 100%)",
                padding: "1.25rem 1.5rem",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "3px solid #d97706",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(217,119,6,0.2)", border: "1px solid rgba(217,119,6,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div style={{ fontSize: "0.70rem", fontWeight: 800, color: "#fbbf24", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    OFFICIAL REGISTRATION PASS
                  </div>
                  <h3 style={{ margin: "2px 0 0", fontSize: "1.15rem", fontWeight: 800, color: "#ffffff" }}>
                    Hospital Consultation Pass
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSuccessCard(null)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#cbd5e1",
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {/* SCREENSHOT ALERT BANNER (REQUESTED BY USER) */}
              <div
                style={{
                  background: "#fffbeb",
                  border: "2px dashed #f59e0b",
                  borderRadius: 12,
                  padding: "1rem 1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "#fef3c7",
                    border: "1.5px solid #fde68a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#b45309",
                    flexShrink: 0,
                  }}
                >
                  <Camera size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#92400e" }}>
                    📸 Please Take a Screenshot or Download this Card!
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#b45309", marginTop: 2, lineHeight: 1.4 }}>
                    Keep this card for your official records, application tracking, and payment verification.
                  </div>
                </div>
              </div>

              {/* UNIQUE APPLICATION NUMBER BOX */}
              <div
                style={{
                  background: "#0f172a",
                  color: "#ffffff",
                  padding: "1rem 1.25rem",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: "0.70rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    UNIQUE APPLICATION NUMBER
                  </div>
                  <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#f59e0b", letterSpacing: "0.04em", fontFamily: "monospace", marginTop: 2 }}>
                    {successCard.application_no}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(successCard.application_no);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  style={{
                    padding: "6px 12px",
                    background: copied ? "#059669" : "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    borderRadius: 6,
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.18s ease",
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Copy ID"}</span>
                </button>
              </div>

              {/* INFORMATIVE PARTICULARS GRID */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "0.85rem",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "1.1rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.70rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Applicant Full Name
                  </div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                    {successCard.candidate_name}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.70rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Contact Phone Number
                  </div>
                  <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                    {successCard.phone}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.70rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Target Hospital Group
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e3a8a", marginTop: 2 }}>
                    {successCard.target_hospital}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.70rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Medical Specialty / Dept
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                    {successCard.department}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.70rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Application Fee
                  </div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 900, color: "#059669", marginTop: 2 }}>
                    ₹{Number(successCard.paid_amount || 0).toLocaleString()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.70rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Payment Status
                  </div>
                  <div style={{ marginTop: 3 }}>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        background: "#ecfdf5",
                        color: "#065f46",
                        border: "1px solid #a7f3d0",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      PAID / RECEIPT ATTACHED
                    </span>
                  </div>
                </div>

                <div style={{ gridColumn: "span 2", paddingTop: "0.5rem", borderTop: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.70rem", color: "#64748b", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                    <span>Transaction Ref: <strong>{successCard.transaction_id}</strong></span>
                    <span>Applied: <strong>{new Date(successCard.created_at).toLocaleString()}</strong></span>
                  </div>
                </div>
              </div>

              {/* Seal Note */}
              <div style={{ textAlign: "center", fontSize: "0.72rem", color: "#64748b" }}>
                🔒 MSJ Medical Coordination Board • 100% Digitally Verified Registration
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "0.25rem" }}>
                <button
                  type="button"
                  onClick={handleDownloadCard}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    background: "linear-gradient(135deg, #0f172a, #1e293b)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.2)",
                  }}
                >
                  <Download size={16} /> Download Slip
                </button>
                <button
                  type="button"
                  onClick={() => setSuccessCard(null)}
                  style={{
                    padding: "10px 20px",
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </form>
  );
}
