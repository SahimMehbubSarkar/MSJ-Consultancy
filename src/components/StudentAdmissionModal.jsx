"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Lock,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Layers,
  Award,
  GraduationCap,
  CreditCard,
  FileText,
  Type,
  QrCode,
  Copy,
  Check,
  UploadCloud,
  FileCheck,
  AlertCircle,
} from "lucide-react";

export default function StudentAdmissionModal({ isOpen, onClose }) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({
    student_name: "",
    email: "",
    phone: "",
    gender: "",
    target_country: "",
    study_level: "",
    target_university: "",
    preferred_course: "",
    hs_marks: "",
    madhyamik_marks: "",
    application_fee: "1000.00",
    payment_receipt: "",
    counselor_notes: "",
  });

  // Receipt Upload State (Strict Max 3MB)
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [isDraggingReceipt, setIsDraggingReceipt] = useState(false);

  // Fetch admission template config
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/admin/admissions/template?t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.template) {
            setTemplate(data.template);
          }
        })
        .catch((err) => {
          console.warn("Could not load admission template:", err);
        })
        .finally(() => setLoading(false));

      // Reset submission state when opened
      setSubmitSuccess(null);
      setCopiedTracking(false);
      setReceiptFile(null);
      setReceiptUrl("");
      setReceiptError("");
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const topBannerTitle =
    template?.top_banner_title ||
    "OFFICIAL FAST-TRACK ADMISSION DOSSIER • SESSION 2025–26";
  const topBannerTag =
    template?.top_banner_tag || "Direct  Registry";
  const templateHeader =
    template?.template_header ||
    "MSJ Global Education • Official Admission Application";
  const templateFooter =
    template?.template_footer ||
    "Certified by MSJ Academic Board • 100% Clinical Training Assistance & Verification Guaranteed";
  const formDesc =
    template?.subtitle ||
    "Direct university application guidance, academic verification, and admission seat allocation.";
  const admissionLogo =
    template?.admission_logo ||
    "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80";
  const logoAlign = template?.logo_align || "left";
  const logoOffset = template?.logo_offset || 0;
  const paymentQr =
    template?.payment_qr ||
    "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=msjglobal@icici%26pn=MSJ%20Global%20Education%26am=1000.00%26cu=INR%26tn=Application%20Processing%20Fee";
  const paymentInstructions =
    template?.payment_instructions ||
    "Scan via any UPI App (GPay, PhonePe, Paytm, BHIM) to pay Application Processing Fee ₹1,000. Keep Transaction Reference / UTR for instant verification.";

  // Fallback fields if template has not loaded fields
  const baseFields =
    template?.fields && template.fields.length > 0
      ? template.fields
      : [
        { id: "col_student_name", column: "student_name", type: "text", label: "Student Full Name", required: true },
        { id: "col_email", column: "email", type: "email", label: "Email Address", required: true },
        { id: "col_phone", column: "phone", type: "phone", label: "Phone / WhatsApp", required: true },
        { id: "col_gender", column: "gender", type: "select", label: "Gender", required: false, options: ["Male", "Female", "Other"] },
        { id: "col_target_country", column: "target_country", type: "select", label: "Preferred Study States (Select up to 4)", required: true, options: ["Karnataka", "West Bengal", "Delhi (NCR)", "Maharashtra", "Tamil Nadu", "Kerala", "Uttar Pradesh", "Gujarat", "Andhra Pradesh", "Rajasthan"] },
        { id: "col_study_level", column: "study_level", type: "select", label: "Study Level", required: true, options: ["BSc Nursing", "General Nursing & Midwifery (GNM)", "Post Basic BSc Nursing", "MSc Nursing", "B.Pharm", "D.Pharm", "BPT (Physiotherapy)", "BSc Medical Lab Tech (MLT)", "BSc Radiology & Imaging", "MBBS / MD Direct"] },
        { id: "col_target_university", column: "target_university", type: "text", label: "Target University / Preferred College", required: true },
        { id: "col_preferred_course", column: "preferred_course", type: "text", label: "Intended Course & Specialization", required: true },
        { id: "col_hs_marks", column: "hs_marks", type: "text", label: "Higher Secondary Percentage", placeholder: "e.g. 85% or 425/500", required: true },
        { id: "col_madhyamik_marks", column: "madhyamik_marks", type: "text", label: "Madhyamik Percentage", placeholder: "e.g. 80% or 560/700", required: true },
        { id: "col_application_fee", column: "application_fee", type: "number", label: "Application Processing Fee (₹)", required: true },
        { id: "col_payment_receipt", column: "payment_receipt", type: "file", label: "Payment Receipt / Screenshot Upload (Max 3MB)", required: false },
        { id: "col_counselor_notes", column: "counselor_notes", type: "textarea", label: "Academic Goals & Counselor Notes(optional)", required: false },
      ];

  // Guarantee payment_receipt is present exactly once in fields list
  const fields = [...baseFields];
  if (!fields.some((f) => f.column === "payment_receipt")) {
    const feeIdx = fields.findIndex((f) => f.column === "application_fee");
    const receiptField = {
      id: "col_payment_receipt",
      column: "payment_receipt",
      type: "file",
      label: "Payment Receipt / Screenshot Upload (Max 3MB)",
      required: false,
    };
    if (feeIdx !== -1) {
      fields.splice(feeIdx + 1, 0, receiptField);
    } else {
      fields.push(receiptField);
    }
  }

  const getFieldIcon = (column) => {
    switch (column) {
      case "student_name":
        return <User size={16} />;
      case "email":
        return <Mail size={16} />;
      case "phone":
        return <Phone size={16} />;
      case "gender":
        return <User size={16} />;
      case "target_country":
        return <MapPin size={16} />;
      case "study_level":
        return <BookOpen size={16} />;
      case "target_university":
        return <Building2 size={16} />;
      case "preferred_course":
        return <Layers size={16} />;
      case "hs_marks":
        return <Award size={16} />;
      case "madhyamik_marks":
        return <GraduationCap size={16} />;
      case "application_fee":
        return <CreditCard size={16} />;
      case "payment_receipt":
        return <FileCheck size={16} />;
      case "counselor_notes":
        return <FileText size={16} />;
      default:
        return <Type size={16} />;
    }
  };

  const handleFieldChange = (column, val) => {
    setFormData((prev) => ({ ...prev, [column]: val }));
  };

  // State Multi-Select Helpers (Max 4 States)
  const getSelectedStates = () => {
    const raw = formData.target_country;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return String(raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleToggleState = (stateName) => {
    if (!stateName) return;
    const current = getSelectedStates();
    if (current.includes(stateName)) {
      const updated = current.filter((s) => s !== stateName);
      setFormData((prev) => ({ ...prev, target_country: updated.join(", ") }));
    } else {
      if (current.length >= 4) {
        alert("Maximum 4 preferred states allowed (সর্বোচ্চ ৪টি রাজ্য নির্বাচন করা যাবে).");
        return;
      }
      const updated = [...current, stateName];
      setFormData((prev) => ({ ...prev, target_country: updated.join(", ") }));
    }
  };

  // Receipt Upload Handler (Strict Max 3MB)
  const handleReceiptFile = async (file) => {
    if (!file) return;
    setReceiptError("");

    const MAX_SIZE = 3 * 1024 * 1024; // 3MB in bytes
    if (file.size > MAX_SIZE) {
      setReceiptError(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 3MB limit. Please upload under 3MB (সর্বোচ্চ ৩ মেগাবাইট ফাইল আপলোড করতে পারবেন).`
      );
      return;
    }

    setReceiptFile(file);
    setReceiptUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admissions/upload-receipt", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setReceiptUrl(data.url);
        setFormData((prev) => ({ ...prev, payment_receipt: data.url }));
      } else {
        // Fallback: convert to base64 data url
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          setReceiptUrl(dataUrl);
          setFormData((prev) => ({ ...prev, payment_receipt: dataUrl }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn("Receipt upload API fallback to base64:", err);
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        setReceiptUrl(dataUrl);
        setFormData((prev) => ({ ...prev, payment_receipt: dataUrl }));
      };
      reader.readAsDataURL(file);
    } finally {
      setReceiptUploading(false);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptUrl("");
    setReceiptError("");
    setFormData((prev) => ({ ...prev, payment_receipt: "" }));
  };

  // Completion stats - Exclude admin-fixed application_fee from user-fillable calculation
  const fillableFields = fields.filter((f) => f.column !== "application_fee");
  const completedCount = fillableFields.filter((f) => {
    const v = formData[f.column];
    return v !== undefined && v !== null && String(v).trim().length > 0;
  }).length;
  const completionPercentage = Math.min(
    100,
    Math.round((completedCount / Math.max(fillableFields.length, 1)) * 100)
  );

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        student_name: formData.student_name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender || "Not Specified",
        target_country: formData.target_country || "Karnataka",
        study_level: formData.study_level || "BSc Nursing",
        preferred_course: formData.preferred_course || formData.study_level,
        target_university: formData.target_university || "Affiliated Medical College",
        madhyamik_marks: formData.madhyamik_marks || "Awaiting Verification",
        hs_marks: formData.hs_marks || "Awaiting Verification",
        application_fee: parseFloat(formData.application_fee) || 1000.0,
        paid_amount: receiptUrl || formData.payment_receipt ? 1000.0 : 0.0,
        payment_receipt: receiptUrl || formData.payment_receipt || "",
        payment_status: receiptUrl || formData.payment_receipt ? "paid" : "unpaid",
        payment_method: receiptUrl || formData.payment_receipt ? "UPI / QR Scan" : null,
        counselor_notes: formData.counselor_notes || "",
        admission_logo: admissionLogo,
        template_header: templateHeader,
        template_footer: templateFooter,
        form_data: formData,
      };

      const res = await fetch("/api/admissions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(data);
      } else {
        alert("Submission Failed: " + (data.message || "Please check required fields."));
      }
    } catch (err) {
      console.error("Submission network error:", err);
      alert("Network error submitting application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyTracking = (trackingId) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackingId);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 3000);
    }
  };

  return (
    <div
      className="msj-student-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        background: "rgba(10, 25, 47, 0.78)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        overflowY: "auto",
      }}
    >
      {/* Modal Container: Authentic Official Document Page (border-radius: 0) */}
      <div
        className="msj-student-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "95%",
          maxWidth: "960px",
          background: "#ffffff",
          border: "1.5px solid #cbd5e1",
          borderRadius: "0px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(15, 23, 42, 0.08)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          position: "relative",
          margin: "auto",
        }}
      >
        {/* Unified Official Institutional Header (Solid Navy Blue - No Gradient) */}
        <div
          style={{
            background: "#0c2340",
            color: "#ffffff",
            padding: "1rem 1.75rem 1.15rem 1.75rem",
            borderBottom: "3px solid #1e3a8a",
            flexShrink: 0,
            position: "relative",
          }}
        >
          {/* Top registry sub-bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "0.55rem",
              marginBottom: "0.75rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.74rem", fontWeight: 700, letterSpacing: "0.06em", color: "#93c5fd" }}>
              <ShieldCheck size={16} color="#93c5fd" />
              <span>{topBannerTitle}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.72rem", color: "#bfdbfe", fontWeight: 600 }}>
                <Lock size={12} color="#93c5fd" />
                <span>{topBannerTag}</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#ffffff",
                  width: "26px",
                  height: "26px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  padding: 0,
                  marginLeft: "4px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)")}
                title="Close Application (Esc)"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Main Logo & Title Row inside Solid Navy Blue Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: logoAlign === "center" ? "column" : "row",
              justifyContent: logoAlign === "right" ? "space-between" : logoAlign === "center" ? "center" : "flex-start",
              textAlign: logoAlign === "center" ? "center" : "left",
              gap: 16,
            }}
          >
            {logoAlign !== "right" && (
              <div
                style={{
                  flexShrink: 0,
                  transform: `translateX(${logoOffset}px)`,
                }}
              >
                {admissionLogo ? (
                  <img
                    src={admissionLogo}
                    alt="University Admission Logo"
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 4,
                      objectFit: "cover",
                      background: "#ffffff",
                      padding: 3,
                      border: "1.5px solid rgba(255, 255, 255, 0.3)",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 4,
                      background: "#1e3a8a",
                      border: "1.5px solid #3b82f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                    }}
                  >
                    <Building2 size={30} />
                  </div>
                )}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.70rem", fontWeight: 800, letterSpacing: "0.08em", color: "#60a5fa", textTransform: "uppercase" }}>
                OFFICIAL ADMISSION ENROLMENT DOSSIER
              </div>
              <h2 style={{ fontSize: "1.28rem", fontWeight: 800, color: "#ffffff", margin: "2px 0 3px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
                {templateHeader}
              </h2>
              <div style={{ fontSize: "0.80rem", color: "#cbd5e1", lineHeight: 1.45, fontWeight: 500 }}>
                {formDesc}
              </div>
            </div>

            {logoAlign === "right" && (
              <div
                style={{
                  flexShrink: 0,
                  transform: `translateX(${logoOffset}px)`,
                }}
              >
                {admissionLogo ? (
                  <img
                    src={admissionLogo}
                    alt="University Admission Logo"
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 4,
                      objectFit: "cover",
                      background: "#ffffff",
                      padding: 3,
                      border: "1.5px solid rgba(255, 255, 255, 0.3)",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 4,
                      background: "#1e3a8a",
                      border: "1.5px solid #3b82f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                    }}
                  >
                    <Building2 size={30} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div
          style={{
            overflowY: "auto",
            padding: "2rem 2.25rem 2.5rem 2.25rem",
            flex: 1,
            scrollbarWidth: "thin",
            scrollbarColor: "#94a3b8 #f1f5f9",
          }}
        >
          {submitSuccess ? (
            /* Success State Dossier Certificate */
            <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "#ecfdf5",
                  border: "2px solid #059669",
                  color: "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.25rem",
                  boxShadow: "0 8px 25px rgba(5, 150, 105, 0.2)",
                }}
              >
                <CheckCircle2 size={40} />
              </div>

              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Official Enrolment Registered
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", margin: "4px 0 10px" }}>
                Admission Application Successfully Submitted!
              </h2>
              <p style={{ fontSize: "0.88rem", color: "#64748b", maxWidth: "560px", margin: "0 auto 1.5rem", lineHeight: 1.55 }}>
                Your admission dossier for <strong>{formData.preferred_course || formData.study_level}</strong> has been registered with the MSJ Global Education Admissions Directorate.
              </p>

              {/* Application Tracking Box */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1.5px dashed #cbd5e1",
                  borderRadius: "0px",
                  padding: "1.25rem",
                  maxWidth: "460px",
                  margin: "0 auto 1.75rem",
                }}
              >
                <div style={{ fontSize: "0.74rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Official Application Tracking Number
                </div>
                <div style={{ fontSize: "1.45rem", fontWeight: 900, color: "#1e3a8a", margin: "6px 0", letterSpacing: "0.05em", fontFamily: "monospace" }}>
                  {submitSuccess.trackingId}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyTracking(submitSuccess.trackingId)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: copiedTracking ? "#059669" : "#2563eb",
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    padding: "6px 14px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  {copiedTracking ? <Check size={14} /> : <Copy size={14} />}
                  {copiedTracking ? "Tracking ID Copied!" : "Copy Tracking ID"}
                </button>
              </div>

              {/* Next Steps Notice */}
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "0px",
                  padding: "12px 18px",
                  maxWidth: "520px",
                  margin: "0 auto 1.75rem",
                  textAlign: "left",
                  fontSize: "0.82rem",
                  color: "#1e40af",
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ display: "block", marginBottom: 4 }}>📌 Directorate Next Steps:</strong>
                <div>
                  1. A Senior Academic Counselor will verify your eligibility &amp; academic records.
                  <br />
                  2. You will receive an official seat allotment briefing call or WhatsApp message within 2 business hours.
                  <br />
                  3. If fee was paid via UPI, verification receipt will be confirmed automatically.
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "12px 32px",
                  background: "#0c2340",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "0.92rem",
                  borderRadius: "5px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Done / Close Application
              </button>
            </div>
          ) : (
            /* Active Form View */
            <div>

              {/* Dynamic Application Readiness Progress Bar */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 0,
                  padding: "10px 14px",
                  marginBottom: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#0f172a" }}>
                    <Sparkles size={14} color="#2563eb" />
                    <span>Application Readiness:</span>
                    <span style={{ color: completionPercentage === 100 ? "#059669" : "#2563eb", fontWeight: 800 }}>
                      {completionPercentage}% Completed
                    </span>
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>
                    {completedCount} of {fillableFields.length} Fields Filled
                  </span>
                </div>
                <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${completionPercentage}%`,
                      height: "100%",
                      background:
                        completionPercentage === 100
                          ? "#059669"
                          : "#1e40af",
                      borderRadius: 99,
                      transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                </div>
              </div>

              {/* Form Fields: Pure Floating Inputs (No Static Placeholders) */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                {fields.map((field) => {
                  const val = formData[field.column] || "";
                  const isFocused = focusedField === field.column;
                  const hasVal = String(val).trim().length > 0;
                  const isFloating = isFocused || hasVal;
                  const isTextarea = field.type === "textarea";
                  const isSelect = field.type === "select";
                  const isStateField = field.column === "target_country";

                  // Dedicated State Multi-Select (Max 4 States)
                  if (isStateField) {
                    const selectedStates = getSelectedStates();
                    const isMaxReached = selectedStates.length >= 4;

                    return (
                      <React.Fragment key={field.id || field.column}>
                        <div
                          className={`msj-multiselect-state-group ${selectedStates.length > 0 || isFocused ? "active" : ""}`}
                          style={{ position: "relative" }}
                        >
                          {/* Left MapPin Icon */}
                          <div
                            className="msj-floating-field-icon"
                            style={{
                              position: "absolute",
                              left: 14,
                              top: selectedStates.length > 0 ? "14px" : "50%",
                              transform: selectedStates.length > 0 ? "none" : "translateY(-50%)",
                            }}
                          >
                            <MapPin size={16} />
                          </div>

                          {/* Max 4 Selection Counter Tag */}
                          <div
                            style={{
                              position: "absolute",
                              top: "-11px",
                              right: "12px",
                              zIndex: 10,
                              background: isMaxReached ? "#fef3c7" : "#eff6ff",
                              color: isMaxReached ? "#b45309" : "#1d4ed8",
                              border: isMaxReached ? "1px solid #fde68a" : "1px solid #bfdbfe",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              letterSpacing: "0.02em",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                          >
                            {isMaxReached ? "✓ Max 4/4 States Selected" : `${selectedStates.length}/4 States Selected (Max 4)`}
                          </div>

                          {/* Selected State Badges (Chips) */}
                          {selectedStates.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px",
                                padding: "14px 14px 6px 42px",
                                background: "#f8fafc",
                                borderBottom: "1px solid #e2e8f0",
                              }}
                            >
                              {selectedStates.map((st) => (
                                <span
                                  key={st}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    background: "#ffffff",
                                    color: "#1e3a8a",
                                    border: "1.5px solid #93c5fd",
                                    borderRadius: "4px",
                                    padding: "4px 8px",
                                    fontSize: "0.80rem",
                                    fontWeight: 700,
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                                  }}
                                >
                                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb" }} />
                                  <span>{st}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleState(st);
                                    }}
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
                                    title={`Remove ${st}`}
                                  >
                                    <X size={13} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* State Selection Dropdown */}
                          <select
                            id={`public_field_${field.column}`}
                            className="msj-floating-input msj-floating-select"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleToggleState(e.target.value);
                              }
                            }}
                            onFocus={() => setFocusedField(field.column)}
                            onBlur={() => setFocusedField(null)}
                            disabled={isMaxReached}
                            style={{
                              height: "48px",
                              cursor: isMaxReached ? "not-allowed" : "pointer",
                              background: isMaxReached ? "#f8fafc" : "#ffffff",
                              paddingLeft: selectedStates.length > 0 ? "42px" : "42px",
                            }}
                          >
                            <option value="">
                              {isMaxReached
                                ? "✓ Maximum 4 states selected (Remove a state to change)"
                                : selectedStates.length === 0
                                  ? "— Click here to select Preferred Study State (Up to 4) —"
                                  : `+ Click to add another preferred state (${selectedStates.length}/4 selected)...`}
                            </option>
                            {(field.options || []).map((opt, optIndex) => {
                              const isSelected = selectedStates.includes(opt);
                              return (
                                <option key={optIndex} value={opt} disabled={isSelected}>
                                  {isSelected ? `✓ ${opt} (Already Selected)` : opt}
                                </option>
                              );
                            })}
                          </select>

                          {/* Floating Label - Always elevated to top border line */}
                          <label
                            htmlFor={`public_field_${field.column}`}
                            className="msj-floating-label"
                            style={{
                              top: "0px",
                              left: "18px",
                              transform: "translateY(-50%) scale(0.85)",
                              transformOrigin: "left top",
                              background: "#ffffff",
                              padding: "0 8px",
                              fontWeight: 800,
                              color: focusedField === field.column ? "#1d4ed8" : "#334155",
                              zIndex: 5,
                            }}
                          >
                            {field.label.includes("Max") ? field.label : `${field.label} (Max 4)`}
                            {field.required && <span className="msj-req-star">*</span>}
                          </label>

                          {/* Hidden required validator */}
                          {field.required && (
                            <input
                              type="text"
                              required
                              value={selectedStates.length > 0 ? selectedStates.join(", ") : ""}
                              onChange={() => { }}
                              style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
                              tabIndex={-1}
                            />
                          )}
                        </div>
                      </React.Fragment>
                    );
                  }

                  // Dedicated Official Payment Receipt Upload Card (Strict Max 3MB) - EXACTLY ONE UPLOAD BOX
                  if (field.column === "payment_receipt" || field.type === "file") {
                    return (
                      <React.Fragment key={field.id || field.column}>
                        <div
                          style={{
                            marginTop: "0.25rem",
                            marginBottom: "0.5rem",
                            background: receiptFile ? "#f0fdf4" : isDraggingReceipt ? "#eff6ff" : "#f8fafc",
                            border: receiptFile ? "1.5px solid #86efac" : isDraggingReceipt ? "2px dashed #2563eb" : "1.5px dashed #cbd5e1",
                            borderRadius: "0px",
                            padding: "1rem 1.15rem",
                            position: "relative",
                            transition: "all 0.2s ease",
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDraggingReceipt(true);
                          }}
                          onDragLeave={() => setIsDraggingReceipt(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingReceipt(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleReceiptFile(e.dataTransfer.files[0]);
                            }
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  background: receiptFile ? "#dcfce7" : "#eff6ff",
                                  color: receiptFile ? "#16a34a" : "#2563eb",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {receiptFile ? <FileCheck size={18} /> : <UploadCloud size={18} />}
                              </div>
                              <div>
                                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                                  Payment Receipt / Screenshot Upload
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                  {receiptFile
                                    ? "✓ Payment receipt attached successfully"
                                    : "After paying ₹1,000 via UPI, attach confirmation screenshot or PDF"}
                                </div>
                              </div>
                            </div>

                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                background: "#fef3c7",
                                color: "#b45309",
                                border: "1px solid #fde68a",
                                padding: "2px 8px",
                                textTransform: "uppercase",
                                letterSpacing: "0.03em",
                              }}
                            >
                              Max 3MB
                            </span>
                          </div>

                          {/* File Display if Uploaded */}
                          {receiptFile ? (
                            <div
                              style={{
                                background: "#ffffff",
                                border: "1px solid #bbf7d0",
                                padding: "10px 14px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginTop: 6,
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {receiptUrl && receiptFile.type?.startsWith("image/") ? (
                                  <img
                                    src={receiptUrl}
                                    alt="Receipt Preview"
                                    style={{ width: 44, height: 44, objectFit: "cover", border: "1px solid #86efac" }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: 44,
                                      height: 44,
                                      background: "#f1f5f9",
                                      border: "1px solid #cbd5e1",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#1e293b",
                                    }}
                                  >
                                    <FileText size={22} />
                                  </div>
                                )}
                                <div>
                                  <div
                                    style={{
                                      fontSize: "0.82rem",
                                      fontWeight: 700,
                                      color: "#0f172a",
                                      maxWidth: "320px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {receiptFile.name}
                                  </div>
                                  <div style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                                    <span>{(receiptFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                                    <span>•</span>
                                    <span>✓ Verified &lt; 3MB</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleRemoveReceipt}
                                style={{
                                  background: "#fee2e2",
                                  border: "1px solid #fca5a5",
                                  color: "#dc2626",
                                  fontSize: "0.74rem",
                                  fontWeight: 700,
                                  padding: "5px 10px",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <X size={13} /> Remove
                              </button>
                            </div>
                          ) : (
                            /* Dropzone / Choose File */
                            <div style={{ textAlign: "center", padding: "8px 0 2px" }}>
                              <input
                                type="file"
                                id="public_receipt_file"
                                accept="image/png, image/jpeg, image/webp, image/jpg, application/pdf"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleReceiptFile(e.target.files[0]);
                                  }
                                }}
                              />
                              <label
                                htmlFor="public_receipt_file"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 8,
                                  padding: "7px 18px",
                                  background: "#2563eb",
                                  color: "#ffffff",
                                  fontSize: "0.82rem",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  boxShadow: "0 2px 6px rgba(37,99,235,0.2)",
                                }}
                              >
                                <UploadCloud size={16} /> Choose Receipt File (or Drag &amp; Drop)
                              </label>
                              <div style={{ fontSize: "0.70rem", color: "#64748b", marginTop: 5 }}>
                                JPG, PNG, WebP, PDF • Strictly Maximum 3MB Upload Size
                              </div>
                            </div>
                          )}

                          {/* Error message if > 3MB */}
                          {receiptError && (
                            <div
                              style={{
                                marginTop: 8,
                                padding: "6px 10px",
                                background: "#fee2e2",
                                border: "1px solid #fca5a5",
                                color: "#b91c1c",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <AlertCircle size={14} />
                              <span>{receiptError}</span>
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  }

                  // All other standard fields (clean, zero database column badges)
                  return (
                    <React.Fragment key={field.id || field.column}>
                      <div
                        className={`msj-floating-group ${isFloating ? "active " : ""}${isTextarea ? "textarea-group " : ""}${isSelect ? "select-group " : ""}`}
                      >
                        {/* Left Field Icon */}
                        <div className="msj-floating-field-icon">
                          {getFieldIcon(field.column)}
                        </div>

                        {/* Input / Textarea / Select Element without static placeholder */}
                        {isTextarea ? (
                          <textarea
                            id={`public_field_${field.column}`}
                            className="msj-floating-input msj-floating-textarea"
                            value={val}
                            onChange={(e) => handleFieldChange(field.column, e.target.value)}
                            onFocus={() => setFocusedField(field.column)}
                            onBlur={() => setFocusedField(null)}
                            required={field.required}
                            placeholder=" "
                            rows={3}
                          />
                        ) : isSelect ? (
                          <select
                            id={`public_field_${field.column}`}
                            className="msj-floating-input msj-floating-select"
                            value={val}
                            onChange={(e) => handleFieldChange(field.column, e.target.value)}
                            onFocus={() => setFocusedField(field.column)}
                            onBlur={() => setFocusedField(null)}
                            required={field.required}
                          >
                            <option value="">{`— Select ${field.label} —`}</option>
                            {(field.options || []).map((opt, optIndex) => (
                              <option key={optIndex} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : field.column === "application_fee" ? (
                          <>
                            <input
                              id={`public_field_${field.column}`}
                              type="text"
                              readOnly
                              className="msj-floating-input"
                              value={`₹${val || "1,000.00"} (Official Fixed Fee)`}
                              style={{
                                background: "#f8fafc",
                                cursor: "not-allowed",
                                fontWeight: 800,
                                color: "#0f172a",
                                borderColor: "#cbd5e1",
                                paddingRight: "115px",
                                userSelect: "none",
                              }}
                              title="Application Processing Fee is set by MSJ administration and cannot be modified."
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
                                borderRadius: "3px",
                                pointerEvents: "none",
                              }}
                            >
                              <Lock size={12} color="#64748b" /> Fixed Fee
                            </span>
                          </>
                        ) : (
                          <input
                            id={`public_field_${field.column}`}
                            type={field.type === "phone" ? "tel" : field.type === "number" ? "number" : field.type}
                            step={field.type === "number" ? "any" : undefined}
                            className="msj-floating-input"
                            value={val}
                            onChange={(e) => handleFieldChange(field.column, e.target.value)}
                            onFocus={() => setFocusedField(field.column)}
                            onBlur={() => setFocusedField(null)}
                            required={field.required}
                            placeholder=" "
                          />
                        )}

                        {/* Floating Label: Rises cleanly to top border line on focus/fill */}
                        <label htmlFor={`public_field_${field.column}`} className="msj-floating-label">
                          {field.label}
                          {field.required && <span className="msj-req-star">*</span>}
                        </label>
                      </div>

                      {/* Official Scan & Pay QR Code Verification Card for Application Fee */}
                      {field.column === "application_fee" && paymentQr && (
                        <div
                          style={{
                            marginTop: "-0.25rem",
                            marginBottom: "0.25rem",
                            background: "#f0fdf4",
                            border: "1.5px solid #86efac",
                            borderRadius: "0px",
                            padding: "1rem 1.15rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "1.25rem",
                            boxShadow: "0 2px 8px rgba(22, 101, 52, 0.05)",
                          }}
                        >
                          <div style={{ flexShrink: 0, textAlign: "center" }}>
                            <img
                              src={paymentQr}
                              alt="Scan & Pay Application Fee"
                              style={{
                                width: 105,
                                height: 105,
                                objectFit: "contain",
                                background: "#ffffff",
                                padding: 6,
                                border: "1.5px solid #16a34a",
                                borderRadius: "0px",
                                display: "block",
                              }}
                            />
                            <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#166534", marginTop: 4 }}>
                              SCAN &amp; PAY ₹{val || "1,000"}
                            </div>
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 800, color: "#166534" }}>
                              <QrCode size={16} color="#15803d" />
                              <span>OFFICIAL UPI APPLICATION FEE VERIFICATION</span>
                            </div>
                            <div style={{ fontSize: "0.74rem", color: "#14532d", margin: "4px 0 8px", lineHeight: 1.45 }}>
                              {paymentInstructions}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              <span style={{ fontSize: "0.68rem", background: "#ffffff", color: "#15803d", padding: "2px 8px", border: "1px solid #bbf7d0", fontWeight: 700 }}>
                                ✓ Instant UPI Verification
                              </span>
                              <span style={{ fontSize: "0.68rem", background: "#ffffff", color: "#15803d", padding: "2px 8px", border: "1px solid #bbf7d0", fontWeight: 700 }}>
                                ✓ GPay / PhonePe / Paytm / BHIM
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* 3. Dynamic Template Footer */}
                <div
                  style={{
                    marginTop: "1.25rem",
                    paddingTop: "1rem",
                    borderTop: "1.5px dashed #cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.76rem",
                    color: "#64748b",
                  }}
                >
                  <div>
                    <strong style={{ color: "#0f172a" }}>MSJ Admissions Board</strong>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>{templateFooter}</div>
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      fontWeight: 700,
                      color: "#059669",
                      background: "#ecfdf5",
                      padding: "4px 8px",
                      borderRadius: "0px",
                      border: "1px solid #a7f3d0",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ✓ 100% Verified Directorate
                  </div>
                </div>

                {/* Official High-Conversion Submit Button */}
                <div style={{ marginTop: "0.75rem" }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="msj-submit-cta-btn"
                  >
                    {submitting ? (
                      <>
                        <Sparkles size={16} className="animate-spin" /> Registering Admission Application...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Submit Official Admission Application
                      </>
                    )}
                  </button>
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "0.68rem",
                      color: "#94a3b8",
                      marginTop: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Lock size={11} />
                    <span></span>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
