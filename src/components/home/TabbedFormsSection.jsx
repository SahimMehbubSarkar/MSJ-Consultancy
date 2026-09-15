"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  HeartPulse,
  User,
  UserCheck,
  Mail,
  Phone,
  Globe,
  BookOpen,
  Award,
  FileText,
  UploadCloud,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building2,
  AlertTriangle,
  FileCheck,
  Calendar,
  Layers,
  Lock,
  ShieldCheck,
  QrCode,
  Sparkles,
  X,
  MapPin,
} from "lucide-react";
import HospitalRequirementForm from "./HospitalRequirementForm";
import AdmissionRequirementForm from "./AdmissionRequirementForm";
export default function TabbedFormsSection({ activeTab = "hospital", setActiveTab }) {
  // Local state for active tab if not passed
  const [currentTab, setCurrentTab] = useState(activeTab);
  const effectiveTab = setActiveTab ? activeTab : currentTab;
  const setTab = setActiveTab || setCurrentTab;

  // Template state
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await fetch(`/api/admin/admissions/template?t=${Date.now()}`, { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.template) {
          setTemplate(json.template);
        }
      } catch (err) {
        console.warn("Could not fetch admission template:", err);
      }
    }
    loadTemplate();
  }, []);

  // Template dynamic variables
  const topBannerTitle =
    template?.top_banner_title ||
    "OFFICIAL FAST-TRACK ADMISSION DOSSIER • SESSION 2025–26";
  const topBannerTag =
    template?.top_banner_tag || "Direct University Registry";
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
  const paymentQr =
    template?.payment_qr ||
    "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=msjglobal@icici%26pn=MSJ%20Global%20Education%26am=1000.00%26cu=INR%26tn=Application%20Processing%20Fee";
  const paymentInstructions =
    template?.payment_instructions ||
    "Scan via any UPI App (GPay, PhonePe, Paytm, BHIM) to pay Application Processing Fee ₹1,000. Keep Transaction Reference / UTR for instant verification.";

  // Admission Form State (Completely Fresh & Clean - No Static Prefill)
  const [admData, setAdmData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    country: "",
    level: "",
    course: "",
    university: "",
    madhyamikMarks: "",
    hsMarks: "",
    applicationFee: "1000.00",
    notes: "",
  });

  const [selectedStates, setSelectedStates] = useState([]);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptError, setReceiptError] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const STATE_OPTIONS = [
    "Karnataka",
    "West Bengal",
    "Delhi (NCR)",
    "Maharashtra",
    "Tamil Nadu",
    "Kerala",
    "Uttar Pradesh",
    "Gujarat",
    "Andhra Pradesh",
    "Rajasthan",
  ];

  const handleToggleState = (st) => {
    if (!st) return;
    if (selectedStates.includes(st)) {
      setSelectedStates((prev) => prev.filter((s) => s !== st));
    } else {
      if (selectedStates.length >= 4) {
        alert("Maximum 4 preferred states allowed (সর্বোচ্চ ৪টি রাজ্য নির্বাচন করা যাবে).");
        return;
      }
      setSelectedStates((prev) => [...prev, st]);
    }
  };

  const handleReceiptFile = (file) => {
    if (!file) return;
    setReceiptError("");
    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setReceiptError(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 3MB limit (সর্বোচ্চ ৩ মেগাবাইট ফাইল আপলোড করা যাবে).`
      );
      return;
    }
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setReceiptUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const fillableKeys = [
    "name",
    "email",
    "phone",
    "gender",
    "states",
    "level",
    "university",
    "course",
    "hsMarks",
    "madhyamikMarks",
    "receipt",
    "notes",
  ];
  const filledMap = {
    name: !!admData.name?.trim(),
    email: !!admData.email?.trim(),
    phone: !!admData.phone?.trim(),
    gender: !!admData.gender?.trim(),
    states: selectedStates.length > 0,
    level: !!admData.level?.trim(),
    university: !!admData.university?.trim(),
    course: !!admData.course?.trim(),
    hsMarks: !!admData.hsMarks?.trim(),
    madhyamikMarks: !!admData.madhyamikMarks?.trim(),
    receipt: !!receiptFile,
    notes: !!admData.notes?.trim(),
  };
  const completedCount = fillableKeys.filter((k) => filledMap[k]).length;
  const completionPercentage = Math.min(
    100,
    Math.round((completedCount / fillableKeys.length) * 100)
  );

  // Hospital Form State
  const [hspData, setHspData] = useState({
    patientName: "",
    attendant: "",
    email: "",
    phone: "",
    country: "India",
    hospital: "Apollo Hospitals",
    department: "Cardiology & Heart Surgery",
    urgency: "urgent",
    medicalNotes: "",
  });

  const [simulatedFile, setSimulatedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Handle Admission Submit to new /api/admissions/submit
  const handleAdmissionSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmissionResult(null);

    if (!admData.name.trim() || !admData.email.trim() || !admData.phone.trim()) {
      setErrorMsg("Please fill in your Name, Email, and Phone Number.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/admissions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: admData.name,
          email: admData.email,
          phone: admData.phone,
          gender: admData.gender || "Not Specified",
          target_country: selectedStates.length > 0 ? selectedStates.join(", ") : (admData.country || "Karnataka"),
          study_level: admData.level,
          preferred_course: admData.course,
          target_university: admData.university,
          madhyamik_marks: admData.madhyamikMarks || "Submitted for Verification",
          hs_marks: admData.hsMarks || "Submitted for Verification",
          application_fee: 1000.00,
          payment_receipt: receiptUrl || null,
          counselor_notes: admData.notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmissionResult({
          type: "admission",
          trackingId: data.trackingId,
          message: data.message,
        });
        // Reset form
        setAdmData({
          name: "",
          email: "",
          phone: "",
          gender: "",
          country: "Karnataka",
          level: "BSc Nursing",
          course: "BSc Nursing (Clinical Specialization)",
          university: "Vydehi Institute of Nursing & Medical Sciences",
          madhyamikMarks: "",
          hsMarks: "",
          applicationFee: "1000.00",
          notes: "",
        });
        setSelectedStates([]);
        setReceiptFile(null);
        setReceiptUrl("");
        setReceiptError("");
        setSimulatedFile(null);
      } else {
        setErrorMsg(data.message || "Failed to submit admission inquiry.");
      }
    } catch (err) {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Hospital Submit
  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmissionResult(null);

    if (!hspData.patientName.trim() || !hspData.email.trim() || !hspData.phone.trim()) {
      setErrorMsg("Please fill in Patient Name, Contact Email, and Phone Number.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/inquiries/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hospital",
          name: hspData.patientName,
          email: hspData.email,
          phone: hspData.phone,
          attendant: hspData.attendant,
          country: hspData.country,
          hospital: hspData.hospital,
          department: hspData.department,
          urgency: hspData.urgency,
          medicalNotes: hspData.medicalNotes,
          fileName: simulatedFile?.name || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmissionResult({
          type: "hospital",
          trackingId: data.trackingId,
          message: data.message,
        });
        // Reset form
        setHspData({
          patientName: "",
          attendant: "",
          email: "",
          phone: "",
          country: "India",
          hospital: "Apollo Hospitals",
          department: "Cardiology & Heart Surgery",
          urgency: "urgent",
          medicalNotes: "",
        });
        setSimulatedFile(null);
      } else {
        setErrorMsg(data.message || "Failed to submit hospital consultation.");
      }
    } catch (err) {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSimulatedFile(e.target.files[0]);
    }
  };

  return (
    <section className="msj-forms-section" id="forms-section">
      <div className="msj-section-header">
        <div className="msj-section-badge">
          <Layers size={14} />
          <span>Dual Application Portal</span>
        </div>
        <h2 className="msj-section-title">Online Application &amp; Consultation Request</h2>
        <p className="msj-section-desc">
          Select either the Academic Admission or Overseas Hospital tab below to submit your official
          application to our specialist consultants.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="msj-tabs-wrapper">
        <div className="msj-tabs-pill-box">
          <button
            type="button"
            className={`msj-tab-btn ${effectiveTab === "hospital" ? "active" : ""}`}
            onClick={() => {
              setTab("hospital");
              setSubmissionResult(null);
              setErrorMsg("");
            }}
            id="tab-btn-hospital"
          >
            <UserCheck size={19} className="msj-tab-icon" />
            <span>Hospital Hiring &amp; Job Application</span>
          </button>

          <button
            type="button"
            className={`msj-tab-btn ${effectiveTab === "admission" ? "active" : ""}`}
            onClick={() => {
              setTab("admission");
              setSubmissionResult(null);
              setErrorMsg("");
            }}
            id="tab-btn-admission"
          >
            <GraduationCap size={19} className="msj-tab-icon" />
            <span>Student Admission Form</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {submissionResult && (
        <div className="msj-success-banner" role="status">
          <CheckCircle2 size={28} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#065f46" }}>
              Application Successfully Registered!
            </div>
            <p style={{ fontSize: "0.9rem", color: "#047857", marginTop: "4px" }}>
              {submissionResult.message}
            </p>
            <div style={{ marginTop: "8px" }}>
              <span style={{ fontSize: "0.82rem", color: "#065f46", fontWeight: 600, marginRight: 8 }}>
                Your Reference Tracking Code:
              </span>
              <span className="msj-success-code-tag">{submissionResult.trackingId}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div
          style={{
            background: "#fff1f2",
            border: "1.5px solid #f43f5e",
            borderRadius: 12,
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "#9f1239",
            fontSize: "0.92rem",
            fontWeight: 600,
          }}
        >
          <AlertCircle size={20} color="#f43f5e" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Card Container */}
      <div className="msj-form-card" style={{ padding: 0, overflow: "hidden", border: "1.5px solid #cbd5e1" }}>
        {/* ====================================================================
            TAB 1: HOSPITAL REQUIREMENT INQUIRY
            ==================================================================== */}
        <div style={{ display: effectiveTab === "hospital" ? "block" : "none" }}>
          <HospitalRequirementForm />
        </div>

        {/* ====================================================================
            TAB 2: STUDENT ADMISSION FORM (EXACT MATCH TO OFFICIAL MODAL)
            ==================================================================== */}
        <div style={{ display: effectiveTab === "admission" ? "block" : "none" }}>
          <AdmissionRequirementForm />
        </div>
      </div>
    </section>
  );
}
