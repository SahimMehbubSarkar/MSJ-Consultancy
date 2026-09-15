"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Monitor,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Layers,
  GraduationCap,
  HeartPulse,
  Type,
  AlignLeft,
  Mail,
  Phone,
  ListFilter,
  Hash,
  Calendar,
  UploadCloud,
  RotateCcw,
  Save,
  Check,
  Send,
  Building2,
  Award,
  CreditCard,
  Image as ImageIcon,
  User,
  MapPin,
  BookOpen,
  FileText,
  Lock,
  ShieldCheck,
  QrCode,
} from "lucide-react";

// The 13 exact database columns from `student_admission` table
export const STUDENT_ADMISSION_COLUMNS = [
  {
    id: "col_student_name",
    column: "student_name",
    type: "text",
    label: "Student Full Name",
    placeholder: "e.g. Tanvir Ahmed",
    required: true,
  },
  {
    id: "col_email",
    column: "email",
    type: "email",
    label: "Email Address",
    placeholder: "e.g. tanvir@example.com",
    required: true,
  },
  {
    id: "col_phone",
    column: "phone",
    type: "phone",
    label: "Phone / WhatsApp Number",
    placeholder: "+880 1700-000000",
    required: true,
  },
  {
    id: "col_gender",
    column: "gender",
    type: "select",
    label: "Gender",
    placeholder: "Select Gender",
    required: false,
    options: ["Male", "Female", "Other"],
  },
  {
    id: "col_target_country",
    column: "target_country",
    type: "select",
    label: "Preferred Study State",
    placeholder: "Select State",
    required: true,
    options: [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Delhi (NCR)",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jammu and Kashmir",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Ladakh",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
      "Andaman and Nicobar Islands",
      "Chandigarh",
      "Dadra and Nagar Haveli and Daman and Diu",
      "Lakshadweep",
      "Puducherry",
      "Other / Overseas Medical Study",
    ],
  },
  {
    id: "col_study_level",
    column: "study_level",
    type: "select",
    label: "Study Level",
    placeholder: "Select Study Level",
    required: true,
    options: [
      "BSc Nursing (4-Year Degree)",
      "GNM (General Nursing & Midwifery)",
      "Paramedical / Allied Health Sciences",
      "BPT (Bachelor of Physiotherapy)",
      "MBBS / Medical Degree",
    ],
  },
  {
    id: "col_target_university",
    column: "target_university",
    type: "text",
    label: "Target University / Preferred College",
    placeholder: "e.g. Vydehi Institute of Medical Sciences",
    required: true,
  },
  {
    id: "col_preferred_course",
    column: "preferred_course",
    type: "text",
    label: "Intended Course & Specialization",
    placeholder: "e.g. BSc Nursing, BSc MLT, OTT, BPT",
    required: true,
  },
  {
    id: "col_hs_marks",
    column: "hs_marks",
    type: "text",
    label: "Higher Secondary Percentage",
    placeholder: "e.g. 85% or 425/500",
    required: true,
  },
  {
    id: "col_madhyamik_marks",
    column: "madhyamik_marks",
    type: "text",
    label: "Madhyamik Percentage",
    placeholder: "e.g. 80% or 560/700",
    required: true,
  },
  {
    id: "col_application_fee",
    column: "application_fee",
    type: "number",
    label: "Application Processing Fee (₹)",
    placeholder: "1000.00",
    required: true,
  },
  {
    id: "col_payment_receipt",
    column: "payment_receipt",
    type: "file",
    label: "Payment Receipt / UPI Confirmation (Max 3MB)",
    placeholder: "Upload payment screenshot or PDF receipt",
    required: false,
    max_size_mb: 3,
  },
  {
    id: "col_counselor_notes",
    column: "counselor_notes",
    type: "textarea",
    label: "Academic Goals & Specific Queries",
    placeholder: "Share details regarding scholarship needs or intake semester...",
    required: false,
  },
];

// The exact database columns from `hospital_requirement` table
export const HOSPITAL_REQUIREMENT_COLUMNS = [
  {
    id: "col_candidate_name",
    column: "candidate_name",
    type: "text",
    label: "Candidate Full Name",
    placeholder: "e.g. Rahim Uddin",
    required: true,
  },
  {
    id: "col_email",
    column: "email",
    type: "email",
    label: "Email Address",
    placeholder: "e.g. rahim@example.com",
    required: true,
  },
  {
    id: "col_phone",
    column: "phone",
    type: "phone",
    label: "Phone / WhatsApp Number",
    placeholder: "+91 98765 43210",
    required: true,
  },
  {
    id: "col_gender",
    column: "gender",
    type: "select",
    label: "Gender",
    placeholder: "Select Gender",
    required: false,
    options: ["Male", "Female", "Other"],
  },
  {
    id: "col_target_state",
    column: "target_state",
    type: "select",
    label: "Preferred Hospital State",
    placeholder: "Select State",
    required: true,
    options: [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Delhi (NCR)",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jammu and Kashmir",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Ladakh",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
      "Andaman and Nicobar Islands",
      "Chandigarh",
      "Dadra and Nagar Haveli and Daman and Diu",
      "Lakshadweep",
      "Puducherry",
      "Other / Overseas Medical Center",
    ],
  },
  {
    id: "col_qualification",
    column: "qualification",
    type: "select",
    label: "Current Medical / Nursing Qualification",
    placeholder: "Select Qualification",
    required: true,
    options: [
      "BSc Nursing (4-Year Degree)",
      "GNM (General Nursing & Midwifery)",
      "BPT / MPT (Physiotherapy)",
      "BSc MLT / Allied Health Sciences",
      "MBBS / Medical Degree",
      "Paramedical / Diploma",
    ],
  },
  {
    id: "col_target_hospital",
    column: "target_hospital",
    type: "text",
    label: "Target Hospital / Preferred Facility (Optional)",
    placeholder: "e.g. Vydehi Institute of Medical Sciences & Research Centre",
    required: false,
  },
  {
    id: "col_department",
    column: "department",
    type: "text",
    label: "Target Department / Specialization (Optional)",
    placeholder: "e.g. ICU & Critical Care, Cardiology, Emergency & Trauma",
    required: false,
  },
  {
    id: "col_hs_marks",
    column: "hs_marks",
    type: "text",
    label: "Higher Secondary (12th) Marks / %",
    placeholder: "e.g. 86% (430/500)",
    required: true,
  },
  {
    id: "col_madhyamik_marks",
    column: "madhyamik_marks",
    type: "text",
    label: "Madhyamik (10th) Marks / %",
    placeholder: "e.g. 82% (574/700)",
    required: true,
  },
  {
    id: "col_application_fee",
    column: "application_fee",
    type: "number",
    label: "Processing / Consultation Fee (₹)",
    placeholder: "1500.00",
    required: true,
  },
  {
    id: "col_payment_receipt",
    column: "payment_receipt",
    type: "file",
    label: "Payment Receipt / UPI Confirmation (Max 3MB)",
    placeholder: "Upload payment screenshot or PDF receipt",
    required: false,
    max_size_mb: 3,
  },
  {
    id: "col_cv_attach",
    column: "cv_attach",
    type: "file",
    label: "CV / Resume Attachment (PDF, DOC, DOCX only — Max 3MB)",
    placeholder: "Upload your CV or resume (PDF, DOC, or DOCX only)",
    required: false,
    max_size_mb: 3,
  },
  {
    id: "col_coordinator_notes",
    column: "coordinator_notes",
    type: "textarea",
    label: "Clinical Experience & Coordinator Notes (Optional)",
    placeholder: "Share details regarding clinical experience, hospital preference...",
    required: false,
  },
];

export default function FormBuilderModal({ isOpen, onClose, defaultCategory = "admission" }) {
  const [category, setCategory] = useState(defaultCategory);
  const isHospital = defaultCategory === "hospital" || category === "hospital";

  const [topBannerTitle, setTopBannerTitle] = useState(
    defaultCategory === "hospital"
      ? "OFFICIAL HOSPITAL CLINICAL TRAINING & PLACEMENT DOSSIER •"
      : "OFFICIAL FAST-TRACK ADMISSION DOSSIER • SESSION 2025–26"
  );
  const [topBannerTag, setTopBannerTag] = useState("Direct Hospital Registry");
  const [templateHeader, setTemplateHeader] = useState(
    defaultCategory === "hospital"
      ? "MSJ Global Education • Official Hospital Consultation & Placement Application"
      : "MSJ Global Education • Official Admission Application"
  );
  const [templateFooter, setTemplateFooter] = useState(
    defaultCategory === "hospital"
      ? "Certified by MSJ Clinical Coordination Board • 100% Verified Hospital Placement & Training Assistance"
      : "Certified by MSJ Academic Board • 100% Clinical Training Assistance & Verification Guaranteed"
  );
  const [admissionLogo, setAdmissionLogo] = useState(
    defaultCategory === "hospital"
      ? "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80"
      : "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80"
  );
  const [logoAlign, setLogoAlign] = useState("left"); // "left" | "center" | "right"
  const [logoOffset, setLogoOffset] = useState(0); // in px: -40 to +80
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [paymentQr, setPaymentQr] = useState(
    defaultCategory === "hospital"
      ? "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=msjglobal@icici%26pn=MSJ%20Hospital%20Services%26am=1500.00%26cu=INR%26tn=Hospital%20Processing%20Fee"
      : "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=msjglobal@icici%26pn=MSJ%20Global%20Education%26am=1000.00%26cu=INR%26tn=Application%20Processing%20Fee"
  );
  const [isDraggingQr, setIsDraggingQr] = useState(false);
  const [showQrUrlInput, setShowQrUrlInput] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState(
    defaultCategory === "hospital"
      ? "Scan via any UPI App (GPay, PhonePe, Paytm, BHIM) to pay Hospital Processing Fee. Keep Transaction Reference / UTR for instant verification."
      : "Scan via any UPI App (GPay, PhonePe, Paytm, BHIM) to pay Application Processing Fee. Keep Transaction Reference / UTR for instant verification."
  );
  const [applicationFee, setApplicationFee] = useState(
    defaultCategory === "hospital" ? "1500" : "1000"
  );
  const [formDesc, setFormDesc] = useState(
    defaultCategory === "hospital"
      ? "Direct hospital recruitment guidance, clinical rotation verification, and department seat allocation."
      : "Direct university application guidance, academic verification, and admission seat allocation."
  );
  const [editorWidth, setEditorWidth] = useState("standard"); // "standard" | "wide" | "expanded" | "full"
  const [fields, setFields] = useState(
    defaultCategory === "hospital" ? HOSPITAL_REQUIREMENT_COLUMNS : STUDENT_ADMISSION_COLUMNS
  );
  const [viewDevice, setViewDevice] = useState("desktop");
  const [mobileTab, setMobileTab] = useState("builder"); // "preview" | "builder"
  const [previewValues, setPreviewValues] = useState({});
  const [newOptionInput, setNewOptionInput] = useState({});
  const [publishStatus, setPublishStatus] = useState(null);
  const [testSubmitSuccess, setTestSubmitSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [previewReceiptFile, setPreviewReceiptFile] = useState(null);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState("");
  const [previewReceiptError, setPreviewReceiptError] = useState("");
  const [previewCvFile, setPreviewCvFile] = useState(null);
  const [previewCvUrl, setPreviewCvUrl] = useState("");
  const [previewCvError, setPreviewCvError] = useState("");
  const [previewCvDragOver, setPreviewCvDragOver] = useState(false);

  // Field Icon Helper based on DB Column
  const getFieldIcon = (column) => {
    switch (column) {
      case "candidate_name":
      case "student_name":
        return <User size={16} />;
      case "email":
        return <Mail size={16} />;
      case "phone":
        return <Phone size={16} />;
      case "gender":
        return <User size={16} />;
      case "target_country":
      case "target_state":
        return <MapPin size={16} />;
      case "study_level":
        return <BookOpen size={16} />;
      case "qualification":
        return <Award size={16} />;
      case "target_university":
      case "target_hospital":
        return <Building2 size={16} />;
      case "preferred_course":
        return <Layers size={16} />;
      case "department":
        return <HeartPulse size={16} />;
      case "hs_marks":
        return <Award size={16} />;
      case "madhyamik_marks":
        return <GraduationCap size={16} />;
      case "application_fee":
        return <CreditCard size={16} />;
      case "counselor_notes":
      case "coordinator_notes":
        return <FileText size={16} />;
      default:
        return <Type size={16} />;
    }
  };

  // Handle Logo File Drop or Selection
  const handleLogoFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please upload or drop a valid image file (PNG, JPG, WebP, SVG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAdmissionLogo(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Payment QR File Drop or Selection
  const handleQrFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please upload or drop a valid QR code image file (PNG, JPG, WebP, SVG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPaymentQr(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleQrDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingQr(true);
  };

  const handleQrDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingQr(false);
  };

  const handleQrDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingQr(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleQrFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLogo(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLogo(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingLogo(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  // Load saved template or fallback to database columns
  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory);
      const isHosp = defaultCategory === "hospital";
      const apiUrl = isHosp
        ? "/api/admin/hospital-requirements/template"
        : "/api/admin/admissions/template";
      const defaultCols = isHosp ? HOSPITAL_REQUIREMENT_COLUMNS : STUDENT_ADMISSION_COLUMNS;
      const defaultHeader = isHosp
        ? "MSJ Global Education • Official Hospital Consultation & Placement Application"
        : "MSJ Global Education • Official Admission Application";
      const defaultFooter = isHosp
        ? "Certified by MSJ Clinical Coordination Board • 100% Verified Hospital Placement & Training Assistance"
        : "Certified by MSJ Academic Board • 100% Clinical Training Assistance & Verification Guaranteed";
      const defaultLogo = isHosp
        ? "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80"
        : "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=120&auto=format&fit=crop&q=80";
      const defaultTopTitle = isHosp
        ? "OFFICIAL HOSPITAL CLINICAL TRAINING & PLACEMENT DOSSIER •"
        : "OFFICIAL FAST-TRACK ADMISSION DOSSIER • SESSION 2025–26";
      const defaultTopTag = isHosp ? "Direct Hospital Registry" : "Direct University Registry";
      const defaultDesc = isHosp
        ? "Direct hospital recruitment guidance, clinical rotation verification, and department seat allocation."
        : "Direct university application guidance, academic verification, and admission seat allocation.";
      const defaultQr = isHosp
        ? "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=msjglobal@icici%26pn=MSJ%20Hospital%20Services%26am=1500.00%26cu=INR%26tn=Hospital%20Processing%20Fee"
        : "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=msjglobal@icici%26pn=MSJ%20Global%20Education%26am=1000.00%26cu=INR%26tn=Application%20Processing%20Fee";
      const defaultInstructions = isHosp
        ? "Scan via any UPI App (GPay, PhonePe, Paytm, BHIM) to pay Hospital Processing Fee. Keep Transaction Reference / UTR for instant verification."
        : "Scan via any UPI App (GPay, PhonePe, Paytm, BHIM) to pay Application Processing Fee. Keep Transaction Reference / UTR for instant verification.";
      const defaultFee = isHosp ? "1500" : "1000";

      fetch(apiUrl)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.template) {
            setTopBannerTitle(data.template.top_banner_title || defaultTopTitle);
            setTopBannerTag(data.template.top_banner_tag || defaultTopTag);
            setTemplateHeader(data.template.template_header || defaultHeader);
            setTemplateFooter(data.template.template_footer || defaultFooter);
            setAdmissionLogo(data.template.hospital_logo || data.template.admission_logo || defaultLogo);
            if (data.template.logo_align) setLogoAlign(data.template.logo_align);
            if (data.template.logo_offset !== undefined) setLogoOffset(data.template.logo_offset);
            setFormDesc(data.template.subtitle || defaultDesc);
            setPaymentQr(data.template.payment_qr || defaultQr);
            setPaymentInstructions(data.template.payment_instructions || defaultInstructions);
            setApplicationFee(data.template.application_fee || defaultFee);
            if (Array.isArray(data.template.fields) && data.template.fields.length > 0) {
              setFields(
                data.template.fields.filter(
                  (f) =>
                    f.column !== "admission_logo" &&
                    f.id !== "col_admission_logo" &&
                    f.column !== "hospital_logo" &&
                    defaultCols.some((dc) => dc.column === f.column)
                )
              );
            } else {
              setFields(defaultCols);
            }
          } else {
            setTopBannerTitle(defaultTopTitle);
            setTopBannerTag(defaultTopTag);
            setTemplateHeader(defaultHeader);
            setTemplateFooter(defaultFooter);
            setAdmissionLogo(defaultLogo);
            setFormDesc(defaultDesc);
            setPaymentQr(defaultQr);
            setPaymentInstructions(defaultInstructions);
            setApplicationFee(defaultFee);
            setFields(defaultCols);
          }
        })
        .catch(() => {
          setTopBannerTitle(defaultTopTitle);
          setTopBannerTag(defaultTopTag);
          setTemplateHeader(defaultHeader);
          setTemplateFooter(defaultFooter);
          setAdmissionLogo(defaultLogo);
          setFormDesc(defaultDesc);
          setPaymentQr(defaultQr);
          setPaymentInstructions(defaultInstructions);
          setApplicationFee(defaultFee);
          setFields(defaultCols);
        });

      setPublishStatus(null);
      setTestSubmitSuccess(false);
    }
  }, [isOpen, defaultCategory]);

  if (!isOpen) return null;

  // Restore standard table columns
  const handleRestoreTableColumns = () => {
    setFields(isHospital ? HOSPITAL_REQUIREMENT_COLUMNS : STUDENT_ADMISSION_COLUMNS);
    setPreviewValues({});
    setTestSubmitSuccess(false);
  };

  // Add specific column
  const handleAddColumnField = (colDef) => {
    const exists = fields.some((f) => f.column === colDef.column);
    if (exists) {
      alert(`The column "${colDef.column}" is already included in your template.`);
      return;
    }
    const newField = {
      ...colDef,
      id: `col_${colDef.column}_${Date.now()}`,
    };
    setFields((prev) => [...prev, newField]);
  };

  // Update field
  const handleUpdateField = (id, key, value) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: value } : f))
    );
  };

  // Remove field
  const handleRemoveField = (id) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setPreviewValues((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Move field
  const handleMoveField = (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFields(updated);
  };

  // Add option to select
  const handleAddOption = (fieldId) => {
    const optText = (newOptionInput[fieldId] || "").trim();
    if (!optText) return;
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId) {
          return { ...f, options: [...(f.options || []), optText] };
        }
        return f;
      })
    );
    setNewOptionInput((prev) => ({ ...prev, [fieldId]: "" }));
  };

  // Remove option
  const handleRemoveOption = (fieldId, optIndex) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === fieldId) {
          const nextOpts = [...f.options];
          nextOpts.splice(optIndex, 1);
          return { ...f, options: nextOpts };
        }
        return f;
      })
    );
  };

  // Handle Save / Publish Template
  const handlePublish = async () => {
    setPublishStatus("saving");
    try {
      const payload = {
        top_banner_title: topBannerTitle,
        top_banner_tag: topBannerTag,
        template_header: templateHeader,
        template_footer: templateFooter,
        [isHospital ? "hospital_logo" : "admission_logo"]: admissionLogo,
        logo_align: logoAlign,
        logo_offset: logoOffset,
        subtitle: formDesc,
        payment_qr: paymentQr,
        payment_instructions: paymentInstructions,
        application_fee: applicationFee,
        fields: fields.filter(
          (f) =>
            f.column !== "admission_logo" &&
            f.id !== "col_admission_logo" &&
            f.column !== "hospital_logo" &&
            f.id !== "col_hospital_logo"
        ),
      };

      const apiUrl = isHospital
        ? "/api/admin/hospital-requirements/template"
        : "/api/admin/admissions/template";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setPublishStatus("saved");
        setTimeout(() => setPublishStatus(null), 3500);
      } else {
        alert("Failed to save template: " + (data.message || "Unknown error"));
        setPublishStatus(null);
      }
    } catch (err) {
      alert("Network error saving template.");
      setPublishStatus(null);
    }
  };

  const handlePreviewChange = (fieldId, val) => {
    setPreviewValues((prev) => ({ ...prev, [fieldId]: val }));
  };

  // Preview Multi-Select State Helpers (Max 4)
  const getPreviewSelectedStates = (fieldId) => {
    const raw = previewValues[fieldId];
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    return String(raw)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handlePreviewToggleState = (fieldId, stateName) => {
    if (!stateName) return;
    const current = getPreviewSelectedStates(fieldId);
    if (current.includes(stateName)) {
      const updated = current.filter((s) => s !== stateName);
      setPreviewValues((prev) => ({ ...prev, [fieldId]: updated.join(", ") }));
    } else {
      if (current.length >= 4) {
        alert("Maximum 4 preferred states allowed (সর্বোচ্চ ৪টি রাজ্য নির্বাচন করা যাবে).");
        return;
      }
      const updated = [...current, stateName];
      setPreviewValues((prev) => ({ ...prev, [fieldId]: updated.join(", ") }));
    }
  };

  // Preview Receipt Handler (Strict Max 3MB)
  const handlePreviewReceiptFile = (file) => {
    if (!file) return;
    setPreviewReceiptError("");
    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setPreviewReceiptError("File exceeds 3MB limit. Please choose a smaller file.");
      return;
    }
    setPreviewReceiptFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) setPreviewReceiptUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Preview CV Handler (Strict PDF/DOC/DOCX only, Max 3MB)
  const handlePreviewCvFile = (file) => {
    if (!file) return;
    setPreviewCvError("");
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileExt = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
      setPreviewCvError("Only PDF, DOC, or DOCX files are allowed for CV upload.");
      return;
    }
    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setPreviewCvError("File exceeds 3MB limit. Please choose a smaller file.");
      return;
    }
    setPreviewCvFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) setPreviewCvUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleTestSubmit = (e) => {
    e.preventDefault();
    setTestSubmitSuccess(true);
    setTimeout(() => setTestSubmitSuccess(false), 4000);
  };

  // Exclude admin-fixed application_fee from user-fillable calculation
  const fillablePreviewFields = fields.filter((f) => f.column !== "application_fee");
  const completedCount = fillablePreviewFields.filter((f) => {
    const v = previewValues[f.id];
    return v !== undefined && v !== null && String(v).trim().length > 0;
  }).length;
  const completionPercentage = Math.min(
    100,
    Math.round((completedCount / Math.max(fillablePreviewFields.length, 1)) * 100)
  );

  return (
    <div
      className="msj-fb-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        padding: 0,
        margin: 0,
        zIndex: 2000,
        background: "#0f172a",
      }}
    >
      <div
        className="msj-fb-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100vw",
          maxWidth: "100vw",
          height: "100vh",
          maxHeight: "100vh",
          borderRadius: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top Action Bar */}
        <div className="msj-fb-header" style={{ padding: "0.75rem 2rem", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: isHospital ? "#fef3c7" : "#eff6ff",
                color: isHospital ? "#b45309" : "#2563eb",
                border: isHospital ? "1.5px solid #fde68a" : "1.5px solid #bfdbfe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isHospital ? <HeartPulse size={24} /> : <GraduationCap size={24} />}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                  {isHospital ? "Hospital Consultation & Placement Template Studio" : "Admission Application Template Studio"}
                </span>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, background: "#ecfdf5", color: "#059669", padding: "2px 8px", borderRadius: 6, border: "1px solid #a7f3d0" }}>
                  Table: {isHospital ? "hospital_requirement" : "student_admission"}
                </span>
              </div>
              <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 2 }}>
                Fields are derived directly from the PostgreSQL <code>{isHospital ? "hospital_requirement" : "student_admission"}</code> database schema.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", flexWrap: "wrap" }}>
            {/* Panel Width Expand Right Controls */}
            <div
              className="msj-fb-width-controls"
              style={{
                display: "flex",
                alignItems: "center",
                background: "#f1f5f9",
                padding: "3px 6px",
                borderRadius: "10px",
                border: "1.5px solid #cbd5e1",
                gap: 4,
              }}
            >
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#475569", paddingLeft: 4, paddingRight: 4, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Width:
              </span>
              <button
                type="button"
                onClick={() => setEditorWidth("standard")}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "0.76rem",
                  fontWeight: editorWidth === "standard" ? 800 : 600,
                  border: editorWidth === "standard" ? "1.5px solid #2563eb" : "1px solid transparent",
                  background: editorWidth === "standard" ? "#ffffff" : "transparent",
                  color: editorWidth === "standard" ? "#1d4ed8" : "#64748b",
                  cursor: "pointer",
                  boxShadow: editorWidth === "standard" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                Standard (860px)
              </button>
              <button
                type="button"
                onClick={() => setEditorWidth("wide")}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "0.76rem",
                  fontWeight: editorWidth === "wide" ? 800 : 600,
                  border: editorWidth === "wide" ? "1.5px solid #2563eb" : "1px solid transparent",
                  background: editorWidth === "wide" ? "#ffffff" : "transparent",
                  color: editorWidth === "wide" ? "#1d4ed8" : "#64748b",
                  cursor: "pointer",
                  boxShadow: editorWidth === "wide" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                Wide (1060px)
              </button>
              <button
                type="button"
                onClick={() => setEditorWidth("expanded")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "0.76rem",
                  fontWeight: editorWidth === "expanded" ? 800 : 600,
                  border: editorWidth === "expanded" ? "1.5px solid #2563eb" : "1px solid transparent",
                  background: editorWidth === "expanded" ? "#2563eb" : "transparent",
                  color: editorWidth === "expanded" ? "#ffffff" : "#64748b",
                  cursor: "pointer",
                  boxShadow: editorWidth === "expanded" ? "0 2px 6px rgba(37,99,235,0.25)" : "none",
                }}
              >
                🚀 Expand Right (1280px)
              </button>
              <button
                type="button"
                onClick={() => setEditorWidth("full")}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "0.76rem",
                  fontWeight: editorWidth === "full" ? 800 : 600,
                  border: editorWidth === "full" ? "1.5px solid #2563eb" : "1px solid transparent",
                  background: editorWidth === "full" ? "#ffffff" : "transparent",
                  color: editorWidth === "full" ? "#1d4ed8" : "#64748b",
                  cursor: "pointer",
                  boxShadow: editorWidth === "full" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                🖥️ Max Fullscreen
              </button>
            </div>

            {/* Restore standard table columns */}
            <button
              type="button"
              className="msj-btn-studio-secondary"
              title="Reset to 13 database table columns"
              onClick={handleRestoreTableColumns}
            >
              <RotateCcw size={14} /> Restore Standard Table Columns
            </button>

            {/* Save & Publish Button */}
            <button
              type="button"
              className={`msj-btn-studio-publish ${publishStatus === "saved" ? "saved" : ""}`}
              onClick={handlePublish}
              disabled={publishStatus === "saving"}
            >
              {publishStatus === "saved" ? (
                <>
                  <Check size={16} /> Saved &amp; Published to Portal!
                </>
              ) : publishStatus === "saving" ? (
                <>
                  <Sparkles size={16} className="animate-spin" /> Saving Template...
                </>
              ) : (
                <>
                  <Save size={16} /> Save &amp; Publish Template
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              className="msj-btn-studio-close"
              onClick={onClose}
              title="Close Template Studio"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Workspace Tabs Switcher (Visible on mobile/tablets < 1024px) */}
        <div className="msj-fb-mobile-tabs">
          <button
            type="button"
            className={`msj-fb-mobile-tab-btn ${mobileTab === "preview" ? "active" : ""}`}
            onClick={() => setMobileTab("preview")}
          >
            <Sparkles size={16} color={mobileTab === "preview" ? "#2563eb" : "#64748b"} />
            <span>👁️ Live Template Preview</span>
          </button>
          <button
            type="button"
            className={`msj-fb-mobile-tab-btn ${mobileTab === "builder" ? "active" : ""}`}
            onClick={() => setMobileTab("builder")}
          >
            <Layers size={16} color={mobileTab === "builder" ? "#2563eb" : "#64748b"} />
            <span>⚙️ Builder Settings &amp; Columns</span>
          </button>
        </div>

        {/* Main Workspace Split */}
        <div
          className={`msj-fb-split mobile-${mobileTab}`}
          style={{
            gridTemplateColumns:
              editorWidth === "full"
                ? "1fr"
                : editorWidth === "expanded"
                ? "minmax(1100px, 62%) 1fr"
                : editorWidth === "wide"
                ? "minmax(960px, 55%) 1fr"
                : "minmax(780px, 48%) 1fr",
          }}
        >
          {/* Left: Table Columns & Template Header/Footer Settings */}
          <div className="msj-fb-builder-panel">
            {/* Header, Logo, and Footer Dynamic Configuration */}
            <div
              style={{
                background: "#ffffff",
                border: "2px solid #cbd5e1",
                borderRadius: "14px",
                padding: "1.5rem 1.85rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  ⚙️ Dynamic Template Header, Logo &amp; Footer
                </span>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Live preview on right</span>
              </div>

              {/* 0. Top Dossier Banner & Badge (Dynamic) */}
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "block", marginBottom: 6 }}>
                    🛡️ Top Dossier Banner Title (top_banner_title):
                  </label>
                  <input
                    type="text"
                    className="msj-fb-preview-input"
                    style={{ fontSize: "0.9rem", fontWeight: 700, padding: "11px 14px", height: "46px" }}
                    value={topBannerTitle}
                    onChange={(e) => setTopBannerTitle(e.target.value)}
                    placeholder="e.g. OFFICIAL FAST-TRACK ADMISSION DOSSIER • SESSION 2025–26"
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", display: "block", marginBottom: 6 }}>
                    🔒 Registry Tag (top_banner_tag):
                  </label>
                  <input
                    type="text"
                    className="msj-fb-preview-input"
                    style={{ fontSize: "0.9rem", fontWeight: 700, padding: "11px 14px", height: "46px" }}
                    value={topBannerTag}
                    onChange={(e) => setTopBannerTag(e.target.value)}
                    placeholder="e.g. Direct University Registry"
                  />
                </div>
              </div>

              {/* 1. Template Header Title */}
              <div>
                <label style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", display: "block", marginBottom: 6 }}>
                  Template Header Title (template_header):
                </label>
                <input
                  type="text"
                  className="msj-fb-preview-input"
                  style={{ fontSize: "1.05rem", fontWeight: 700, padding: "12px 16px", height: "50px" }}
                  value={templateHeader}
                  onChange={(e) => setTemplateHeader(e.target.value)}
                  placeholder="e.g. MSJ Global Education • Official Admission Application"
                />
              </div>

              {/* 2. Admission Logo with Drag & Drop & Position Shifter */}
              <div style={{ background: "#f8fafc", padding: "16px 20px", borderRadius: 12, border: "1.5px solid #cbd5e1" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 6 }}>
                    <UploadCloud size={16} color="#2563eb" />
                    Admission Logo (Drag &amp; Drop / Upload):
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    style={{ fontSize: "0.8rem", color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 700, textDecoration: "underline" }}
                  >
                    {showUrlInput ? "Hide URL" : "Paste URL instead"}
                  </button>
                </div>

                {/* Drag and Drop Dropzone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${isDraggingLogo ? "#2563eb" : "#94a3b8"}`,
                    borderRadius: 12,
                    padding: "18px 22px",
                    textAlign: "center",
                    background: isDraggingLogo ? "#eff6ff" : "#ffffff",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() => {
                    const fileInput = document.getElementById("logo-file-input");
                    if (fileInput) fileInput.click();
                  }}
                >
                  <input
                    id="logo-file-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleLogoFile(e.target.files[0]);
                      }
                    }}
                  />

                  {admissionLogo ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <img
                          src={admissionLogo}
                          alt="Logo Preview"
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: 10,
                            objectFit: "cover",
                            border: "2px solid #2563eb",
                            boxShadow: "0 2px 10px rgba(37,99,235,0.25)",
                          }}
                        />
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a" }}>
                            Logo Active
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 2 }}>
                            Drag &amp; drop new image or click to change
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAdmissionLogo("");
                        }}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 8,
                          background: "#fee2e2",
                          border: "1.5px solid #fca5a5",
                          color: "#b91c1c",
                          fontSize: "0.82rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Trash2 size={14} /> Remove Logo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud size={30} color="#2563eb" style={{ margin: "0 auto 6px" }} />
                      <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a" }}>
                        Drag &amp; drop logo image here
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 3 }}>
                        or click to browse from computer (PNG, JPG, SVG, WebP)
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional direct URL input */}
                {showUrlInput && (
                  <div style={{ marginTop: 10 }}>
                    <input
                      type="text"
                      className="msj-fb-preview-input"
                      style={{ fontSize: "0.9rem", height: "46px" }}
                      value={admissionLogo}
                      onChange={(e) => setAdmissionLogo(e.target.value)}
                      placeholder="Or paste direct image URL (https://...)"
                    />
                  </div>
                )}

                {/* Position / Shift Controls ("r ektu eidike sorau") */}
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "#1e293b" }}>
                      Align:
                    </span>
                    <button
                      type="button"
                      onClick={() => setLogoAlign("left")}
                      style={{
                        padding: "6px 14px",
                        fontSize: "0.84rem",
                        borderRadius: 6,
                        fontWeight: 700,
                        border: logoAlign === "left" ? "2px solid #2563eb" : "1.5px solid #cbd5e1",
                        background: logoAlign === "left" ? "#eff6ff" : "#ffffff",
                        color: logoAlign === "left" ? "#1e40af" : "#475569",
                        cursor: "pointer",
                      }}
                    >
                      Left
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoAlign("center")}
                      style={{
                        padding: "6px 14px",
                        fontSize: "0.84rem",
                        borderRadius: 6,
                        fontWeight: 700,
                        border: logoAlign === "center" ? "2px solid #2563eb" : "1.5px solid #cbd5e1",
                        background: logoAlign === "center" ? "#eff6ff" : "#ffffff",
                        color: logoAlign === "center" ? "#1e40af" : "#475569",
                        cursor: "pointer",
                      }}
                    >
                      Center
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoAlign("right")}
                      style={{
                        padding: "6px 14px",
                        fontSize: "0.84rem",
                        borderRadius: 6,
                        fontWeight: 700,
                        border: logoAlign === "right" ? "2px solid #2563eb" : "1.5px solid #cbd5e1",
                        background: logoAlign === "right" ? "#eff6ff" : "#ffffff",
                        color: logoAlign === "right" ? "#1e40af" : "#475569",
                        cursor: "pointer",
                      }}
                    >
                      Right
                    </button>
                  </div>

                  {/* Horizontal Shift / Nudge Buttons ("r ektu eidike sorau") */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "#1e293b" }}>
                      Shift (পজিশন সরাও):
                    </span>
                    <button
                      type="button"
                      onClick={() => setLogoOffset((prev) => Math.max(-60, prev - 10))}
                      title="Shift Left"
                      style={{
                        padding: "5px 12px",
                        fontSize: "0.95rem",
                        borderRadius: 6,
                        border: "1.5px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#0f172a",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      ⇦
                    </button>
                    <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#2563eb", minWidth: 32, textAlign: "center" }}>
                      {logoOffset > 0 ? `+${logoOffset}px` : `${logoOffset}px`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setLogoOffset((prev) => Math.min(100, prev + 10))}
                      title="Shift Right"
                      style={{
                        padding: "5px 12px",
                        fontSize: "0.95rem",
                        borderRadius: 6,
                        border: "1.5px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#0f172a",
                        fontWeight: 900,
                        cursor: "pointer",
                      }}
                    >
                      ⇨
                    </button>
                    {logoOffset !== 0 && (
                      <button
                        type="button"
                        onClick={() => setLogoOffset(0)}
                        style={{ fontSize: "0.78rem", color: "#64748b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Subtitle Description (Multi-line Textarea for comfortable long text writing) */}
              <div>
                <label style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", display: "block", marginBottom: 6 }}>
                  Public Subtitle / Advisory Text:
                </label>
                <textarea
                  rows={3}
                  className="msj-fb-preview-input msj-fb-preview-textarea"
                  style={{ fontSize: "1.05rem", padding: "14px 18px", minHeight: "85px", lineHeight: "1.6" }}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Direct university application guidance, academic verification, and admission seat allocation."
                />
              </div>

              {/* 4. Template Footer Notice */}
              <div>
                <label style={{ fontSize: "0.92rem", fontWeight: 800, color: "#0f172a", display: "block", marginBottom: 6 }}>
                  Template Footer Notice (template_footer):
                </label>
                <textarea
                  rows={2}
                  className="msj-fb-preview-input msj-fb-preview-textarea"
                  style={{ fontSize: "1.05rem", fontWeight: 600, padding: "14px 18px", minHeight: "75px", lineHeight: "1.5" }}
                  value={templateFooter}
                  onChange={(e) => setTemplateFooter(e.target.value)}
                  placeholder="Certified by MSJ Academic Board • 100% Clinical Training Assistance & Verification Guaranteed"
                />
              </div>
            </div>

            {/* Payment QR Code Dynamic Configuration (Drag & Drop) */}
            <div
              style={{
                background: "#ffffff",
                border: "2px solid #cbd5e1",
                borderRadius: "14px",
                padding: "1.5rem 1.85rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 8 }}>
                  <QrCode size={18} color="#16a34a" /> Application Fee Payment QR Code (Scan &amp; Pay)
                </span>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>Drag &amp; drop UPI QR image</span>
              </div>

              {/* Drag and Drop Dropzone for QR */}
              <div style={{ background: "#f0fdf4", padding: "16px 20px", borderRadius: 12, border: "1.5px solid #bbf7d0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: "0.88rem", fontWeight: 800, color: "#14532d", display: "flex", alignItems: "center", gap: 6 }}>
                    <UploadCloud size={16} color="#16a34a" />
                    Payment UPI / Institutional Bank QR Code:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowQrUrlInput(!showQrUrlInput)}
                    style={{ fontSize: "0.8rem", color: "#16a34a", background: "none", border: "none", cursor: "pointer", fontWeight: 700, textDecoration: "underline" }}
                  >
                    {showQrUrlInput ? "Hide URL" : "Paste QR URL instead"}
                  </button>
                </div>

                <div
                  onDragOver={handleQrDragOver}
                  onDragLeave={handleQrDragLeave}
                  onDrop={handleQrDrop}
                  style={{
                    border: `2px dashed ${isDraggingQr ? "#16a34a" : "#86efac"}`,
                    borderRadius: 12,
                    padding: "18px 22px",
                    textAlign: "center",
                    background: isDraggingQr ? "#dcfce7" : "#ffffff",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() => {
                    const fileInput = document.getElementById("qr-file-input");
                    if (fileInput) fileInput.click();
                  }}
                >
                  <input
                    id="qr-file-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleQrFile(e.target.files[0]);
                      }
                    }}
                  />

                  {paymentQr ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <img
                          src={paymentQr}
                          alt="QR Preview"
                          style={{
                            width: 64,
                            height: 64,
                            objectFit: "contain",
                            background: "#ffffff",
                            padding: 4,
                            border: "1.5px solid #16a34a",
                            borderRadius: 6,
                            boxShadow: "0 2px 10px rgba(22,163,74,0.2)",
                          }}
                        />
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#14532d" }}>
                            Payment QR Code Active
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#15803d", marginTop: 2 }}>
                            Drag &amp; drop new QR or click to replace
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPaymentQr("");
                        }}
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          color: "#dc2626",
                          border: "1px solid #fecaca",
                          background: "#fef2f2",
                          padding: "6px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Trash2 size={13} /> Remove QR
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "#15803d" }}>
                      <UploadCloud size={28} color="#16a34a" />
                      <div style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                        Drop Payment QR Code Image Here (PNG, JPG, WebP)
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "#64748b" }}>
                        or click to browse from computer
                      </div>
                    </div>
                  )}
                </div>

                {showQrUrlInput && (
                  <div style={{ marginTop: 12 }}>
                    <input
                      type="text"
                      className="msj-fb-preview-input"
                      placeholder="https://example.com/payment-qr.png"
                      value={paymentQr}
                      onChange={(e) => setPaymentQr(e.target.value)}
                      style={{ fontSize: "0.85rem" }}
                    />
                  </div>
                )}

                {/* Application Fee Amount Input */}
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#14532d", display: "block", marginBottom: 4 }}>
                    Application Processing Fee Amount (₹):
                  </label>
                  <input
                    type="number"
                    className="msj-fb-preview-input"
                    value={applicationFee}
                    onChange={(e) => setApplicationFee(e.target.value)}
                    placeholder="e.g. 1500"
                    style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}
                  />
                  <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 4 }}>
                    This amount will be shown as fixed fee to candidates & used in UPI QR code.
                  </div>
                </div>

                {/* Instructions Input */}
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#14532d", display: "block", marginBottom: 4 }}>
                    Fee Payment Instructions / UPI Note:
                  </label>
                  <input
                    type="text"
                    className="msj-fb-preview-input"
                    value={paymentInstructions}
                    onChange={(e) => setPaymentInstructions(e.target.value)}
                    placeholder="e.g. Scan via any UPI App to pay application fee..."
                    style={{ fontSize: "0.85rem" }}
                  />
                </div>
              </div>
            </div>

            {/* Table Columns Palette */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Database Columns Palette
                </span>
                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 600 }}>
                  Click to add missing column
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(isHospital ? HOSPITAL_REQUIREMENT_COLUMNS : STUDENT_ADMISSION_COLUMNS).map((col) => {
                  const isIncluded = fields.some((f) => f.column === col.column);
                  return (
                    <button
                      key={col.column}
                      type="button"
                      onClick={() => handleAddColumnField(col)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        border: isIncluded ? "1.5px solid #cbd5e1" : "2px solid #2563eb",
                        background: isIncluded ? "#f1f5f9" : "#eff6ff",
                        color: isIncluded ? "#64748b" : "#1d4ed8",
                        cursor: isIncluded ? "default" : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: isIncluded ? "none" : "0 2px 6px rgba(37,99,235,0.12)",
                      }}
                      title={isIncluded ? "Column already present" : "Add this column"}
                    >
                      <span>{col.column}</span>
                      {isIncluded ? <Check size={14} color="#059669" /> : <Plus size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Configured Fields List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--msj-navy)" }}>
                  Configured Form Fields ({fields.length} Columns)
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--msj-text-muted)", fontWeight: 600 }}>
                  Reorder using arrows
                </span>
              </div>

              {fields.map((field, idx) => (
                <div key={field.id} className="msj-fb-field-card">
                  {/* Top Bar of Field */}
                  <div className="msj-fb-field-card-top" style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="msj-fb-field-pill">
                        <code>{field.column || field.type}</code>
                      </span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155" }}>
                        #{idx + 1}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        type="button"
                        className="msj-fb-action-icon-btn"
                        disabled={idx === 0}
                        style={{ opacity: idx === 0 ? 0.3 : 1 }}
                        onClick={() => handleMoveField(idx, "up")}
                        title="Move Up"
                      >
                        <ChevronUp size={18} />
                      </button>
                      <button
                        type="button"
                        className="msj-fb-action-icon-btn"
                        disabled={idx === fields.length - 1}
                        style={{ opacity: idx === fields.length - 1 ? 0.3 : 1 }}
                        onClick={() => handleMoveField(idx, "down")}
                        title="Move Down"
                      >
                        <ChevronDown size={18} />
                      </button>
                      <button
                        type="button"
                        className="msj-fb-action-icon-btn danger"
                        onClick={() => handleRemoveField(field.id)}
                        title="Delete Field"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Field Attributes Editor - Spacious 2-Column Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.6fr", gap: "1.25rem" }}>
                    <div>
                      <label style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--msj-navy)", display: "block", marginBottom: 6 }}>
                        Field Label *
                      </label>
                      <input
                        type="text"
                        className="msj-fb-preview-input"
                        style={{ fontSize: "1.05rem", fontWeight: 600, padding: "12px 18px", height: "48px" }}
                        value={field.label}
                        onChange={(e) => handleUpdateField(field.id, "label", e.target.value)}
                        placeholder="Label..."
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "0.88rem", fontWeight: 800, color: "var(--msj-navy)", display: "block", marginBottom: 6 }}>
                        Placeholder Text
                      </label>
                      <input
                        type="text"
                        className="msj-fb-preview-input"
                        style={{ fontSize: "1.05rem", padding: "12px 18px", height: "48px" }}
                        value={field.placeholder || ""}
                        onChange={(e) => handleUpdateField(field.id, "placeholder", e.target.value)}
                        placeholder="Placeholder..."
                      />
                    </div>
                  </div>

                  {/* Required Checkbox */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: "8px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.92rem", fontWeight: 700, color: "var(--msj-navy)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleUpdateField(field.id, "required", e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: "#2563eb", cursor: "pointer" }}
                      />
                      Required in application form
                    </label>
                  </div>

                  {/* Dropdown Options Editor (if type is select) */}
                  {field.type === "select" && (
                    <div style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #cbd5e1", marginTop: 8 }}>
                      <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "var(--msj-navy)", display: "block", marginBottom: 6 }}>
                        Select Options:
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                        {(field.options || []).map((opt, oIdx) => (
                          <span key={oIdx} className="msj-fb-opt-chip" style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
                            {opt}
                            <button
                              type="button"
                              className="msj-fb-opt-del"
                              onClick={() => handleRemoveOption(field.id, oIdx)}
                            >
                              <X size={13} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          className="msj-fb-preview-input"
                          style={{ padding: "8px 14px", fontSize: "0.95rem", background: "#ffffff", height: "44px" }}
                          placeholder="Add new choice..."
                          value={newOptionInput[field.id] || ""}
                          onChange={(e) =>
                            setNewOptionInput((prev) => ({ ...prev, [field.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddOption(field.id);
                            }
                          }}
                        />
                        <button
                          type="button"
                          style={{
                            padding: "8px 18px",
                            background: "#2563eb",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: 800,
                            fontSize: "0.88rem",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            height: "44px",
                          }}
                          onClick={() => handleAddOption(field.id)}
                        >
                          Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Live Template Preview Panel */}
          {editorWidth !== "full" && (
            <div className="msj-fb-preview-panel">
            {/* View Mode Controls */}
            <div className="msj-fb-preview-header">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 7 }}>
                  <Sparkles size={16} color="#2563eb" /> {isHospital ? "Live Hospital Consultation Template Simulator" : "Live Admission Template Simulator"}
                </span>
                <span className="msj-badge-type msj-badge-admission" style={{ fontSize: "0.74rem", fontWeight: 700 }}>
                  {isHospital ? "🏥" : "🎓"} {fields.length} Columns Active
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    color: "#2563eb",
                    background: "#eff6ff",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    border: "1.5px solid #bfdbfe",
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  ↕ Scroll inside card for all fields
                </span>

                {/* Device Mode Toggle */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "#ffffff",
                    padding: "3px",
                    borderRadius: "8px",
                    border: "1.5px solid #cbd5e1",
                    gap: "2px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <button
                    type="button"
                    className={`msj-fb-device-btn ${viewDevice === "desktop" ? "active" : ""}`}
                    onClick={() => setViewDevice("desktop")}
                    title="Desktop View"
                  >
                    <Monitor size={13} /> Desktop
                  </button>
                  <button
                    type="button"
                    className={`msj-fb-device-btn ${viewDevice === "mobile" ? "active" : ""}`}
                    onClick={() => setViewDevice("mobile")}
                    title="Mobile View"
                  >
                    <Smartphone size={13} /> Mobile
                  </button>
                </div>

                {/* Quick Scroll to Bottom Button */}
                <button
                  type="button"
                  onClick={() => {
                    const scroller = document.getElementById("msj-preview-card-scroller");
                    if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
                  }}
                  style={{
                    padding: "5px 11px",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    borderRadius: "7px",
                    border: "1.5px solid #bfdbfe",
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  title="Scroll inside card to submit button"
                >
                  <ChevronDown size={13} /> Scroll to Bottom
                </button>
              </div>
            </div>

            {/* Simulated Live Form Canvas with Dedicated Internal Scroller */}
            <div
              className={`msj-fb-preview-frame ${viewDevice === "mobile" ? "mobile-view" : ""}`}
              style={{
                background: "#ffffff",
                border: "1.5px solid #cbd5e1",
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                padding: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                maxHeight: "calc(100vh - 160px)",
                minHeight: "450px",
                width: "100%",
                maxWidth: viewDevice === "mobile" ? "390px" : "680px",
              }}
            >
              {/* Unified Official Institutional Header (Solid Navy Blue - No Gradient) */}
              <div
                style={{
                  background: "#0c2340",
                  color: "#ffffff",
                  padding: "1rem 1.4rem 1.15rem 1.4rem",
                  borderBottom: "3px solid #1e3a8a",
                }}
              >
                {/* Top registry sub-bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "0.5rem",
                    marginBottom: "0.65rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.70rem", fontWeight: 700, letterSpacing: "0.06em", color: "#93c5fd" }}>
                    <ShieldCheck size={14} color="#93c5fd" />
                    <span>{topBannerTitle}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.68rem", color: "#bfdbfe", fontWeight: 600 }}>
                    <Lock size={11} color="#93c5fd" />
                    <span>{topBannerTag}</span>
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
                    gap: 14,
                  }}
                >
                  {logoAlign !== "right" && (
                    <div style={{ flexShrink: 0, transform: `translateX(${logoOffset}px)` }}>
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 4,
                          background: "#ffffff",
                          padding: 3,
                          border: "1.5px solid rgba(255, 255, 255, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {admissionLogo ? (
                          <img
                            src={admissionLogo}
                            alt="Logo"
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: 2,
                              objectFit: "cover",
                              display: "block",
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <Building2 size={28} color="#0c2340" />
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.08em", color: "#60a5fa", textTransform: "uppercase" }}>
                      {isHospital ? "OFFICIAL HOSPITAL PLACEMENT & CLINICAL DOSSIER" : "OFFICIAL ADMISSION ENROLMENT DOSSIER"}
                    </div>
                    <h3 style={{ fontSize: "1.20rem", fontWeight: 800, color: "#ffffff", margin: "2px 0 3px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
                      {templateHeader || "MSJ Global Education • Official Admission Application"}
                    </h3>
                    <div style={{ fontSize: "0.76rem", color: "#cbd5e1", lineHeight: 1.4, fontWeight: 500 }}>
                      {formDesc}
                    </div>
                  </div>

                  {logoAlign === "right" && (
                    <div style={{ flexShrink: 0, transform: `translateX(${logoOffset}px)` }}>
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 4,
                          background: "#ffffff",
                          padding: 3,
                          border: "1.5px solid rgba(255, 255, 255, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {admissionLogo ? (
                          <img
                            src={admissionLogo}
                            alt="Logo"
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: 2,
                              objectFit: "cover",
                              display: "block",
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <Building2 size={28} color="#0c2340" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Content Body with Floating Fields - Dedicated Card Scroller */}
              <div
                className="msj-fb-preview-body"
                id="msj-preview-card-scroller"
              >
                {/* Live Application Readiness Progress Bar */}
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 0,
                    padding: "10px 14px",
                    marginBottom: "1.25rem",
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
                      {completedCount} of {fillablePreviewFields.length} Fields Filled
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${completionPercentage}%`,
                        height: "100%",
                        background: completionPercentage === 100 ? "#059669" : "#1e40af",
                        borderRadius: 99,
                        transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    />
                  </div>
                </div>

                {/* Pure Floating Form Fields Simulation (Exact Public UI) */}
                <form onSubmit={handleTestSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.05rem" }}>
                  {fields.map((field) => {
                    const val = previewValues[field.id] || "";
                    const isFocused = focusedField === field.id;
                    const hasVal = String(val).trim().length > 0;
                    const isFloating = isFocused || hasVal;
                    const isTextarea = field.type === "textarea";
                    const isSelect = field.type === "select";
                    const isStateField = field.column === "target_country" || field.column === "target_state";

                    // State Multi-Select (Max 4 States)
                    if (isStateField) {
                      const selectedStates = getPreviewSelectedStates(field.id);
                      const isMaxReached = selectedStates.length >= 4;
                      return (
                        <React.Fragment key={field.id}>
                          <div
                            className={`msj-multiselect-state-group ${selectedStates.length > 0 || isFocused ? "active" : ""}`}
                            style={{ marginTop: "4px", marginBottom: "4px" }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "4px 14px 2px",
                                borderBottom: selectedStates.length > 0 ? "1px solid #e2e8f0" : "none",
                                background: selectedStates.length > 0 ? "#f8fafc" : "transparent",
                              }}
                            >
                              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>
                                {selectedStates.length === 0
                                  ? "Select up to 4 Indian States"
                                  : `${selectedStates.length} of 4 states chosen`}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.68rem",
                                  fontWeight: 800,
                                  background: isMaxReached ? "#dcfce7" : "#eff6ff",
                                  color: isMaxReached ? "#166534" : "#1e40af",
                                  border: isMaxReached ? "1px solid #86efac" : "1px solid #bfdbfe",
                                  borderRadius: "4px",
                                  padding: "2px 8px",
                                }}
                              >
                                {selectedStates.length}/4 States Selected{isMaxReached ? " (Max)" : ""}
                              </span>
                            </div>

                            {selectedStates.length > 0 && (
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "6px",
                                  padding: "8px 12px 6px",
                                  background: "#f8fafc",
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
                                    }}
                                  >
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb" }} />
                                    <span>{st}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePreviewToggleState(field.id, st);
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

                            <div style={{ position: "relative", width: "100%" }}>
                              <div className="msj-floating-field-icon"><MapPin size={18} /></div>
                              <select
                                id={`preview_field_${field.id}`}
                                className="msj-floating-input msj-floating-select"
                                value=""
                                onChange={(e) => handlePreviewToggleState(field.id, e.target.value)}
                                onFocus={() => setFocusedField(field.id)}
                                onBlur={() => setFocusedField(null)}
                                disabled={isMaxReached}
                                style={{ height: "48px", paddingLeft: "42px" }}
                              >
                                <option value="">
                                  {isMaxReached
                                    ? "✓ Maximum 4 states selected (Remove a state to change)"
                                    : selectedStates.length === 0
                                    ? "— Click here to select Preferred State (Up to 4) —"
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

                              <label
                                htmlFor={`preview_field_${field.id}`}
                                className="msj-floating-label"
                                style={{
                                  top: "0px",
                                  left: "18px",
                                  transform: "translateY(-50%) scale(0.85)",
                                  transformOrigin: "left top",
                                  background: "#ffffff",
                                  padding: "0 8px",
                                  fontWeight: 800,
                                  color: focusedField === field.id ? "#1d4ed8" : "#334155",
                                  zIndex: 5,
                                }}
                              >
                                {field.label.includes("Max") ? field.label : `${field.label} (Max 4)`}
                                {field.required && <span className="msj-req-star">*</span>}
                              </label>
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    }

                    // Payment Receipt Upload Card
                    if (field.column === "payment_receipt") {
                      return (
                        <div
                          key={field.id}
                          style={{
                            background: previewReceiptFile ? "#f0fdf4" : "#f8fafc",
                            border: previewReceiptFile ? "1.5px solid #86efac" : "1.5px dashed #cbd5e1",
                            borderRadius: 0,
                            padding: "1rem 1.15rem",
                            position: "relative",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  background: previewReceiptFile ? "#dcfce7" : "#eff6ff",
                                  color: previewReceiptFile ? "#16a34a" : "#2563eb",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {previewReceiptFile ? <FileCheck size={18} /> : <UploadCloud size={18} />}
                              </div>
                              <div>
                                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                                  {field.label}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                  {previewReceiptFile
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
                              }}
                            >
                              MAX 3MB
                            </span>
                          </div>

                          {previewReceiptFile ? (
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
                                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                                  {previewReceiptFile.name}
                                </div>
                                <span style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 700 }}>
                                  {(previewReceiptFile.size / (1024 * 1024)).toFixed(2)} MB • Verified &lt; 3MB
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewReceiptFile(null);
                                  setPreviewReceiptUrl("");
                                  setPreviewReceiptError("");
                                }}
                                style={{
                                  background: "#fee2e2",
                                  border: "1px solid #fca5a5",
                                  color: "#dc2626",
                                  fontSize: "0.74rem",
                                  fontWeight: 700,
                                  padding: "4px 8px",
                                  cursor: "pointer",
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div style={{ textAlign: "center", padding: "8px 0 2px" }}>
                              <input
                                type="file"
                                id={`preview_file_${field.id}`}
                                accept="image/png, image/jpeg, image/webp, image/jpg, application/pdf"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handlePreviewReceiptFile(e.target.files[0]);
                                  }
                                }}
                              />
                              <label
                                htmlFor={`preview_file_${field.id}`}
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
                                }}
                              >
                                <UploadCloud size={16} /> Choose Receipt File (or Drag &amp; Drop)
                              </label>
                              <div style={{ fontSize: "0.70rem", color: "#64748b", marginTop: 5 }}>
                                JPG, PNG, WebP, PDF • Strictly Maximum 3MB Upload Size
                              </div>
                            </div>
                          )}

                          {previewReceiptError && (
                            <div
                              style={{
                                marginTop: 8,
                                padding: "6px 10px",
                                background: "#fee2e2",
                                border: "1px solid #fca5a5",
                                color: "#b91c1c",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              {previewReceiptError}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // CV Upload Card
                    if (field.column === "cv_attach") {
                      return (
                        <div
                          key={field.id}
                          onDragOver={(e) => { e.preventDefault(); setPreviewCvDragOver(true); }}
                          onDragLeave={(e) => { e.preventDefault(); setPreviewCvDragOver(false); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setPreviewCvDragOver(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handlePreviewCvFile(file);
                          }}
                          style={{
                            background: previewCvDragOver ? "#eff6ff" : previewCvFile ? "#f0fdf4" : "#f8fafc",
                            border: previewCvDragOver ? "2px solid #2563eb" : previewCvFile ? "1.5px solid #86efac" : "1.5px dashed #cbd5e1",
                            borderRadius: 0,
                            padding: "1rem 1.15rem",
                            position: "relative",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  background: previewCvFile ? "#dcfce7" : "#eff6ff",
                                  color: previewCvFile ? "#16a34a" : "#2563eb",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {previewCvFile ? <FileCheck size={18} /> : <UploadCloud size={18} />}
                              </div>
                              <div>
                                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a" }}>
                                  {field.label}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>
                                  {previewCvFile
                                    ? "✓ CV / Resume attached successfully"
                                    : "Upload your CV or resume (PDF, DOC, or image)"}
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
                              }}
                            >
                              MAX 3MB
                            </span>
                          </div>

                          {previewCvFile ? (
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
                                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
                                  {previewCvFile.name}
                                </div>
                                <span style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 700 }}>
                                  {(previewCvFile.size / (1024 * 1024)).toFixed(2)} MB • Verified under 3MB
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewCvFile(null);
                                  setPreviewCvUrl("");
                                  setPreviewCvError("");
                                }}
                                style={{
                                  background: "#fee2e2",
                                  border: "1px solid #fca5a5",
                                  color: "#dc2626",
                                  fontSize: "0.74rem",
                                  fontWeight: 700,
                                  padding: "4px 8px",
                                  cursor: "pointer",
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div style={{ textAlign: "center", padding: "8px 0 2px" }}>
                              <input
                                type="file"
                                id={`preview_file_${field.id}`}
                                accept="application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handlePreviewCvFile(e.target.files[0]);
                                  }
                                }}
                              />
                              <label
                                htmlFor={`preview_file_${field.id}`}
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
                                }}
                              >
                                <UploadCloud size={16} /> {previewCvDragOver ? "Drop file here" : "Choose CV File (or Drag & Drop)"}
                              </label>
                              <div style={{ fontSize: "0.70rem", color: "#64748b", marginTop: 5 }}>
                                PDF, DOC, DOCX only • Strictly Maximum 3MB Upload Size
                              </div>
                            </div>
                          )}

                          {previewCvError && (
                            <div
                              style={{
                                marginTop: 8,
                                padding: "6px 10px",
                                background: "#fee2e2",
                                border: "1px solid #fca5a5",
                                color: "#b91c1c",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                              }}
                            >
                              {previewCvError}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <React.Fragment key={field.id}>
                        <div
                          className={`msj-floating-group ${isSelect ? "select-group" : isTextarea ? "textarea-group" : ""} ${isFloating ? "active" : ""}`}
                        >
                          <div className="msj-floating-field-icon">
                            {getFieldIcon(field.column)}
                          </div>

                          {isTextarea ? (
                            <textarea
                              id={`preview_field_${field.id}`}
                              className="msj-floating-input msj-floating-textarea"
                              value={val}
                              onChange={(e) => handlePreviewChange(field.id, e.target.value)}
                              onFocus={() => setFocusedField(field.id)}
                              onBlur={() => setFocusedField(null)}
                              required={field.required}
                              placeholder=" "
                              rows={3}
                            />
                          ) : isSelect ? (
                            <select
                              id={`preview_field_${field.id}`}
                              className="msj-floating-input msj-floating-select"
                              value={val}
                              onChange={(e) => handlePreviewChange(field.id, e.target.value)}
                              onFocus={() => setFocusedField(field.id)}
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
                                id={`preview_field_${field.id}`}
                                type="text"
                                readOnly
                                className="msj-floating-input"
                                value={`₹${parseFloat(applicationFee || "0").toFixed(2)} (Official Fixed Fee)`}
                                style={{
                                  background: "#f8fafc",
                                  cursor: "not-allowed",
                                  fontWeight: 800,
                                  color: "#0f172a",
                                  borderColor: "#cbd5e1",
                                  paddingRight: "125px",
                                }}
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
                              id={`preview_field_${field.id}`}
                              type={field.type === "phone" ? "tel" : field.type === "number" ? "number" : field.type}
                              step={field.type === "number" ? "any" : undefined}
                              className="msj-floating-input"
                              value={val}
                              onChange={(e) => handlePreviewChange(field.id, e.target.value)}
                              onFocus={() => setFocusedField(field.id)}
                              onBlur={() => setFocusedField(null)}
                              required={field.required}
                              placeholder=" "
                            />
                          )}

                          <label htmlFor={`preview_field_${field.id}`} className="msj-floating-label">
                            {field.label}
                            {field.required && <span className="msj-req-star">*</span>}
                          </label>
                        </div>

                        {/* Official UPI QR Code Verification Box */}
                        {field.column === "application_fee" && paymentQr && (
                          <div
                            style={{
                              background: "#f0fdf4",
                              border: "1.5px solid #86efac",
                              borderRadius: 0,
                              padding: "1rem 1.15rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "1.25rem",
                              marginTop: "-0.25rem",
                              marginBottom: "0.25rem",
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
                                  display: "block",
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=msjglobal@upi&pn=MSJ%20Global&am=${applicationFee || "1000"}`;
                                }}
                              />
                              <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "#166534", marginTop: 4 }}>
                                SCAN & PAY ₹{parseFloat(applicationFee || "0").toFixed(2)}
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

                  {/* Dynamic Template Footer */}
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
                      <strong style={{ color: "#0f172a" }}>{isHospital ? "MSJ Medical Coordination Board" : "MSJ Admissions Board"}</strong>
                      <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>{templateFooter}</div>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        fontWeight: 700,
                        color: "#059669",
                        background: "#ecfdf5",
                        padding: "4px 8px",
                        border: "1px solid #a7f3d0",
                      }}
                    >
                      ✓ 100% Verified Directorate
                    </div>
                  </div>

                  {/* Submit Test Button (Solid Navy Blue - No Gradient) */}
                  <div id="msj-template-preview-bottom" style={{ marginTop: "0.75rem" }}>
                    <button
                      type="submit"
                      className="msj-submit-cta-btn"
                      style={{
                        background: "#0c2340",
                        boxShadow: "0 4px 14px rgba(12, 35, 64, 0.25)",
                      }}
                    >
                      <Send size={16} /> {isHospital ? "Submit Hospital Application (Test Run)" : "Submit Admission Application (Test Run)"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Simulation test feedback message */}
              {testSubmitSuccess && (
                <div
                  style={{
                    marginTop: "1rem",
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: 10,
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: "#065f46",
                    fontSize: "0.82rem",
                  }}
                >
                  <CheckCircle2 size={18} color="#059669" />
                  <div>
                    <strong>Test Application Validated!</strong>
                    <div>All table columns formatted and ready for {isHospital ? "hospital_requirement" : "student_admission"} database insertion.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
