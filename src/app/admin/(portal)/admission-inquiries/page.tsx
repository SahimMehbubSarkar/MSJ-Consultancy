"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  GraduationCap,
  Search,
  Eye,
  X,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  Building2,
  Phone,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  Download,
  Printer,
  Edit3,
  Save,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  FileText,
  ExternalLink,
  FileCheck,
} from "lucide-react";
import FormBuilderModal from "@/components/FormBuilderModal";

interface AdmissionRecord {
  id: string;
  application_no: string;
  student_name: string;
  email: string;
  phone: string;
  gender: string;
  target_country: string;
  study_level: string;
  preferred_course: string;
  target_university: string;
  admission_logo: string;
  madhyamik_marks: string;
  hs_marks: string;
  status: "pending" | "completed" | "rejected";
  payment_status: "unpaid" | "pending" | "paid";
  application_fee: number | string;
  paid_amount: number | string;
  payment_method: string;
  transaction_id: string;
  payment_receipt?: string;
  template_header: string;
  template_footer: string;
  form_data: any;
  counselor_notes: string;
  created_at: string;
  updated_at: string;
}

interface StatsData {
  totalStudents: number;
  totalPayments: {
    count: number;
    amount: number;
  };
  inquiriesDone: number;
  pendingCount: number;
  rejectedCount: number;
}

export default function AdmissionInquiriesPage() {
  const [admissions, setAdmissions] = useState<AdmissionRecord[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalStudents: 0,
    totalPayments: { count: 0, amount: 0 },
    inquiriesDone: 0,
    pendingCount: 0,
    rejectedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10; // Exactly 10 latest records as requested

  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<AdmissionRecord | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<{ url: string; name: string; appNo: string } | null>(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Template Editing State inside Modal
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateHeader, setTemplateHeader] = useState("");
  const [templateFooter, setTemplateFooter] = useState("");
  const [counselorNotes, setCounselorNotes] = useState("");
  const [admissionLogo, setAdmissionLogo] = useState("");
  const [logoOffset, setLogoOffset] = useState(0);
  const [isDraggingDossierLogo, setIsDraggingDossierLogo] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const handleDossierLogoFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WebP, SVG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAdmissionLogo(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Fetch admissions from DB
  const fetchAdmissions = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (paymentFilter !== "all") params.set("payment_status", paymentFilter);

      const res = await fetch(`/api/admin/admissions?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setAdmissions(data.admissions || []);
        setStats(data.stats || {
          totalStudents: 0,
          totalPayments: { count: 0, amount: 0 },
          inquiriesDone: 0,
          pendingCount: 0,
          rejectedCount: 0,
        });
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to load admissions:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Instant Status Change from Table Row (pending, completed, rejected)
  const handleStatusChange = async (id: string, newStatus: "pending" | "completed" | "rejected") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/admissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setAdmissions((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        }
        showToast(`Status updated to ${newStatus.toUpperCase()}`);
        // Refresh stats
        fetchAdmissions();
      } else {
        showToast(data.message || "Failed to update status", "error");
      }
    } catch (err) {
      showToast("Network error updating status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Open Template Modal with prefilled values
  const handleOpenTemplateModal = (item: AdmissionRecord) => {
    setSelectedInquiry(item);
    setTemplateHeader(item.template_header || "MSJ Global Education • Official Admission Application");
    setTemplateFooter(item.template_footer || "Certified by MSJ Academic Board • 100% Clinical Training Assistance");
    setCounselorNotes(item.counselor_notes || "");
    setAdmissionLogo(item.admission_logo || "");
    setIsEditingTemplate(false);
  };

  // Save changes to Template Header, Footer, Notes, or Logo
  const handleSaveTemplate = async () => {
    if (!selectedInquiry) return;
    setSavingTemplate(true);
    try {
      const res = await fetch(`/api/admin/admissions/${selectedInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_header: templateHeader,
          template_footer: templateFooter,
          counselor_notes: counselorNotes,
          admission_logo: admissionLogo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedInquiry({
          ...selectedInquiry,
          template_header: templateHeader,
          template_footer: templateFooter,
          counselor_notes: counselorNotes,
          admission_logo: admissionLogo,
        });
        setAdmissions((prev) =>
          prev.map((item) =>
            item.id === selectedInquiry.id
              ? {
                  ...item,
                  template_header: templateHeader,
                  template_footer: templateFooter,
                  counselor_notes: counselorNotes,
                  admission_logo: admissionLogo,
                }
              : item
          )
        );
        setIsEditingTemplate(false);
        showToast("Template & Dossier details updated successfully!");
      } else {
        showToast(data.message || "Failed to save template", "error");
      }
    } catch (err) {
      showToast("Error saving template", "error");
    } finally {
      setSavingTemplate(false);
    }
  };

  // Format Date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <>
      {/* Toast Banner */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            zIndex: 9999,
            background: toastMsg.type === "success" ? "#065f46" : "#991b1b",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: 600,
            fontSize: "0.9rem",
            animation: "slideIn 0.3s ease",
          }}
        >
          {toastMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="msj-dash-page-header">
        <div>
          <h1>Student Admission Inquiries &amp; Templates</h1>
          <p>
            Overseas &amp; Domestic college applications pipeline, Madhyamik/HS academic verification, and admission templates.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            type="button"
            style={{
              padding: "8px 18px",
              fontSize: "0.86rem",
              borderRadius: "10px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #1e40af, #2563eb)",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
              transition: "all 0.2s ease",
            }}
            onClick={() => setShowFormBuilder(true)}
          >
            <Layers size={16} /> Dynamic Form Studio
          </button>
          <button
            type="button"
            onClick={fetchAdmissions}
            title="Refresh list"
            style={{
              padding: "8px 14px",
              fontSize: "0.86rem",
              borderRadius: "10px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#1e40af",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={15} /> Refresh
          </button>
        </div>
      </div>

      {/* =========================================================================
          3 TOP DYNAMIC METRIC CARDS (Requested by User)
          1. Student Admission Total
          2. Student Admission Payments
          3. Inquiries Done
          ========================================================================= */}
      <div className="msj-dash-stats-grid" style={{ marginBottom: "1.75rem" }}>
        {/* Card 1: Total Student Admissions */}
        <div className="msj-dash-stat-card" style={{ borderLeft: "4px solid #2563eb" }}>
          <div className="msj-dash-stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
            <GraduationCap size={26} />
          </div>
          <div className="msj-dash-stat-body">
            <div className="msj-dash-stat-value">{stats.totalStudents}</div>
            <div className="msj-dash-stat-label">Student Admission Total</div>
            <div style={{ fontSize: "0.74rem", color: "#64748b", marginTop: "4px", fontWeight: 600 }}>
              {stats.pendingCount} Pending • {stats.rejectedCount} Rejected
            </div>
          </div>
        </div>

        {/* Card 2: Student Admission Payments */}
        <div className="msj-dash-stat-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div className="msj-dash-stat-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
            <CreditCard size={26} />
          </div>
          <div className="msj-dash-stat-body">
            <div className="msj-dash-stat-value">
              ₹{stats.totalPayments.amount.toLocaleString()}
            </div>
            <div className="msj-dash-stat-label">Student Admission Payments</div>
            <div style={{ fontSize: "0.74rem", color: "#059669", marginTop: "4px", fontWeight: 700 }}>
              🟢 {stats.totalPayments.count} Applications Paid
            </div>
          </div>
        </div>

        {/* Card 3: Inquiries Done */}
        <div className="msj-dash-stat-card" style={{ borderLeft: "4px solid #d97706" }}>
          <div className="msj-dash-stat-icon" style={{ background: "#fef3c7", color: "#d97706" }}>
            <CheckCircle2 size={26} />
          </div>
          <div className="msj-dash-stat-body">
            <div className="msj-dash-stat-value">{stats.inquiriesDone}</div>
            <div className="msj-dash-stat-label">Inquiries Done</div>
            <div style={{ fontSize: "0.74rem", color: "#d97706", marginTop: "4px", fontWeight: 700 }}>
              {stats.totalStudents > 0
                ? `${Math.round((stats.inquiriesDone / stats.totalStudents) * 100)}% Conversion Rate`
                : "Completed counseling"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="msj-dash-panel">
        <div className="msj-table-controls" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700, color: "var(--msj-navy)", display: "flex", alignItems: "center", gap: 8 }}>
            <GraduationCap size={20} color="#2563eb" />
            <span>Latest 10 Student Admissions</span>
            <span style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: 6, color: "#475569" }}>
              Showing {admissions.length} of {totalCount} records
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Search Box */}
            <div className="msj-table-search-box" style={{ minWidth: 260 }}>
              <Search size={16} color="var(--msj-text-muted)" />
              <input
                type="text"
                placeholder="Search student, university, course..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                color: "#1e293b",
                fontWeight: 600,
                background: "#ffffff",
                cursor: "pointer",
              }}
            >
              <option value="all">Status: All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Filter by Payment */}
            <select
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                color: "#1e293b",
                fontWeight: 600,
                background: "#ffffff",
                cursor: "pointer",
              }}
            >
              <option value="all">Payment: All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="msj-dash-table-wrap">
          <table className="msj-dash-table">
            <thead>
              <tr>
                <th>App No &amp; Student</th>
                <th>Target University &amp; Logo</th>
                <th>Program / Course</th>
                <th>Academic Marks (Madhyamik &amp; HS)</th>
                <th>Payment Status</th>
                <th style={{ minWidth: 150 }}>Action Status</th>
                <th>Applied Date</th>
                <th style={{ textAlign: "right" }}>Template</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                      <span className="msj-spinner" /> Loading latest admissions from database...
                    </div>
                  </td>
                </tr>
              ) : admissions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No student admission inquiries found matching your filters.
                  </td>
                </tr>
              ) : (
                admissions.map((item) => (
                  <tr key={item.id} style={{ transition: "background 0.15s ease" }}>
                    {/* Student Info */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            color: "#1d4ed8",
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            padding: "1px 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {item.application_no}
                        </span>
                        {item.gender && (
                          <span style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "capitalize" }}>
                            ({item.gender})
                          </span>
                        )}
                      </div>
                      <div className="msj-dash-table-name" style={{ fontWeight: 700, color: "#0f172a" }}>
                        {item.student_name}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone size={12} /> {item.phone}
                      </div>
                    </td>

                    {/* University & Admission Logo Column */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {item.admission_logo ? (
                          <img
                            src={item.admission_logo}
                            alt="Logo"
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "8px",
                              objectFit: "cover",
                              border: "1px solid #e2e8f0",
                              flexShrink: 0,
                            }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: "8px",
                              background: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#64748b",
                              flexShrink: 0,
                            }}
                          >
                            <Building2 size={18} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--msj-navy)", fontSize: "0.88rem" }}>
                            {item.target_university || "General University"}
                          </div>
                          <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                            📍 {item.target_country || "India"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Program */}
                    <td>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>
                        {item.preferred_course || "Nursing / Healthcare"}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#64748b" }}>{item.study_level}</div>
                    </td>

                    {/* Academic Marks: Madhyamik & HS (Strictly NO english_test) */}
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem" }}>
                          <span style={{ fontWeight: 700, color: "#0369a1", background: "#f0f9ff", padding: "1px 6px", borderRadius: 4, border: "1px solid #bae6fd" }}>
                            HS (12th):
                          </span>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>{item.hs_marks || "Pending"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem" }}>
                          <span style={{ fontWeight: 700, color: "#4338ca", background: "#eef2ff", padding: "1px 6px", borderRadius: 4, border: "1px solid #c7d2fe" }}>
                            Madhyamik:
                          </span>
                          <span style={{ fontWeight: 600, color: "#334155" }}>{item.madhyamik_marks || "Pending"}</span>
                        </div>
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td>
                      {item.payment_status === "paid" && (
                        <div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              background: "#ecfdf5",
                              color: "#059669",
                              padding: "3px 8px",
                              borderRadius: 6,
                              border: "1px solid #a7f3d0",
                            }}
                          >
                            <CheckCircle2 size={12} /> PAID (₹{parseFloat(item.paid_amount as any || 0).toLocaleString()})
                          </span>
                          {item.payment_method && (
                            <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: 2 }}>
                              via {item.payment_method}
                            </div>
                          )}
                        </div>
                      )}
                      {item.payment_status === "pending" && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: "#fffbeb",
                            color: "#b45309",
                            padding: "3px 8px",
                            borderRadius: 6,
                            border: "1px solid #fde68a",
                          }}
                        >
                          <Clock size={12} /> Verification Pending
                        </span>
                      )}
                      {item.payment_status === "unpaid" && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: "#fef2f2",
                            color: "#b91c1c",
                            padding: "3px 8px",
                            borderRadius: 6,
                            border: "1px solid #fecaca",
                          }}
                        >
                          <XCircle size={12} /> Unpaid (₹{parseFloat(item.application_fee as any || 1000).toLocaleString()})
                        </span>
                      )}

                      {/* Payment Receipt Button (Max 3MB Verified) */}
                      {item.payment_receipt && (
                        <div style={{ marginTop: 4 }}>
                          <button
                            type="button"
                            onClick={() => setViewingReceipt({ url: item.payment_receipt || "", name: item.student_name, appNo: item.application_no })}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              background: "#eff6ff",
                              color: "#1d4ed8",
                              border: "1px solid #bfdbfe",
                              padding: "2px 7px",
                              borderRadius: 4,
                              cursor: "pointer",
                            }}
                            title="View Uploaded Payment Receipt (Max 3MB)"
                          >
                            <FileText size={11} /> View Receipt
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Interactive Status Selector (Admin can set pending, completed, rejected) */}
                    <td>
                      <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                        <select
                          value={item.status}
                          disabled={updatingId === item.id}
                          onChange={(e) =>
                            handleStatusChange(
                              item.id,
                              e.target.value as "pending" | "completed" | "rejected"
                            )
                          }
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            borderRadius: "7px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            cursor: "pointer",
                            outline: "none",
                            transition: "all 0.15s ease",
                            border:
                              item.status === "completed"
                                ? "1.5px solid #10b981"
                                : item.status === "rejected"
                                ? "1.5px solid #ef4444"
                                : "1.5px solid #f59e0b",
                            background:
                              item.status === "completed"
                                ? "#ecfdf5"
                                : item.status === "rejected"
                                ? "#fef2f2"
                                : "#fffbeb",
                            color:
                              item.status === "completed"
                                ? "#065f46"
                                : item.status === "rejected"
                                ? "#991b1b"
                                : "#92400e",
                          }}
                        >
                          <option value="pending">🟡 Pending</option>
                          <option value="completed">🟢 Completed</option>
                          <option value="rejected">🔴 Rejected</option>
                        </select>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="msj-dash-table-date" style={{ fontSize: "0.78rem" }}>
                      {formatDate(item.created_at)}
                    </td>

                    {/* Action: View Application Template */}
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        style={{
                          padding: "6px 14px",
                          fontSize: "0.8rem",
                          borderRadius: "8px",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#1d4ed8",
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          cursor: "pointer",
                          transition: "all 0.18s ease",
                        }}
                        onClick={() => handleOpenTemplateModal(item)}
                      >
                        <Eye size={14} /> View Template
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 10-Item Pagination */}
        <div
          style={{
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid var(--msj-border)",
            background: "#fafafa",
          }}
        >
          <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (10 records per page)
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                background: page <= 1 ? "#f1f5f9" : "#ffffff",
                color: page <= 1 ? "#94a3b8" : "#1e293b",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: page <= 1 ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <ChevronLeft size={16} /> Previous 10
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                background: page >= totalPages ? "#f1f5f9" : "#ffffff",
                color: page >= totalPages ? "#94a3b8" : "#1e293b",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: page >= totalPages ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Next 10 <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          APPLICATION TEMPLATE DOSSIER MODAL ("Template ta dekhabe")
          With Dynamic Header, Admission Logo, Marks, Payment, Footer, and Counselor Notes
          ========================================================================= */}
      {selectedInquiry && (
        <div
          className="msj-modal-overlay"
          onClick={() => setSelectedInquiry(null)}
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            padding: 0,
            margin: 0,
            zIndex: 2000,
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(6px)",
          }}
        >
          <div
            className="msj-modal-dialog"
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
            {/* Modal Navigation Bar */}
            <div
              style={{
                background: "#0a1d37",
                padding: "14px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#ffffff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "rgba(212, 148, 30, 0.2)", color: "#f59e0b", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(212, 148, 30, 0.4)" }}>
                  OFFICIAL TEMPLATE VIEW
                </span>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  Ref: {selectedInquiry.application_no}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsEditingTemplate(!isEditingTemplate)}
                  style={{
                    background: isEditingTemplate ? "#2563eb" : "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Edit3 size={14} /> {isEditingTemplate ? "Done Customizing" : "Customize Header / Footer / Logo"}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "#ffffff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  style={{
                    background: "transparent",
                    color: "#cbd5e1",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Editable Template Header / Logo Settings Drawer if toggled */}
            {isEditingTemplate && (
              <div
                style={{
                  background: "#f8fafc",
                  borderBottom: "1.5px solid #e2e8f0",
                  padding: "1rem 1.5rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                    Template Header Title:
                  </label>
                  <input
                    type="text"
                    value={templateHeader}
                    onChange={(e) => setTemplateHeader(e.target.value)}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b" }}>
                      Admission Logo (Drag &amp; Drop / Upload):
                    </label>
                    {logoOffset !== 0 && (
                      <span style={{ fontSize: "0.72rem", color: "#2563eb", fontWeight: 700 }}>
                        Offset: {logoOffset > 0 ? `+${logoOffset}px` : `${logoOffset}px`}
                      </span>
                    )}
                  </div>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingDossierLogo(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDraggingDossierLogo(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingDossierLogo(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleDossierLogoFile(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => {
                      const fileInput = document.getElementById("dossier-logo-input");
                      if (fileInput) fileInput.click();
                    }}
                    style={{
                      border: `1.5px dashed ${isDraggingDossierLogo ? "#2563eb" : "#cbd5e1"}`,
                      borderRadius: 8,
                      padding: "8px 12px",
                      background: isDraggingDossierLogo ? "#eff6ff" : "#ffffff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <input
                      id="dossier-logo-input"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleDossierLogoFile(e.target.files[0]);
                        }
                      }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {admissionLogo || selectedInquiry.admission_logo ? (
                        <img
                          src={admissionLogo || selectedInquiry.admission_logo}
                          alt="Logo Preview"
                          style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover", border: "1px solid #cbd5e1" }}
                        />
                      ) : null}
                      <span style={{ fontSize: "0.78rem", color: "#475569", fontWeight: 600 }}>
                        {admissionLogo ? "Logo active (Click or Drop to change)" : "Drop image or Click to browse"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>Shift:</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogoOffset((p) => Math.max(-30, p - 10));
                        }}
                        style={{ padding: "2px 6px", fontSize: "0.72rem", borderRadius: 4, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 800 }}
                      >
                        ⇦
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogoOffset((p) => Math.min(60, p + 10));
                        }}
                        style={{ padding: "2px 6px", fontSize: "0.72rem", borderRadius: 4, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 800 }}
                      >
                        ⇨
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                    Template Footer Note:
                  </label>
                  <input
                    type="text"
                    value={templateFooter}
                    onChange={(e) => setTemplateFooter(e.target.value)}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
            )}

            {/* =======================================================
                THE OFFICIAL ADMISSION TEMPLATE FORM CANVAS
                ======================================================= */}
            <div
              className="msj-modal-body"
              style={{
                background: "#f8fafc",
                padding: "2rem",
                flex: 1,
                overflowY: "auto",
              }}
            >
              {/* Official Template Sheet Container */}
              <div
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #cbd5e1",
                  borderRadius: 14,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  padding: "2rem",
                  position: "relative",
                }}
              >
                {/* 1. Dynamic Header with Admission Logo */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: "1.25rem",
                    borderBottom: "2px solid #0f172a",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                      style={{
                        transform: `translateX(${logoOffset}px)`,
                        transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      {admissionLogo || selectedInquiry.admission_logo ? (
                        <img
                          src={admissionLogo || selectedInquiry.admission_logo}
                          alt="Admission Logo"
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 10,
                            objectFit: "cover",
                            border: "2px solid #2563eb",
                            boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: 10,
                            background: "#eff6ff",
                            border: "2px solid #bfdbfe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#2563eb",
                          }}
                        >
                          <Building2 size={32} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#d97706", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        OFFICIAL ENROLMENT DOSSIER
                      </div>
                      <h2 style={{ margin: "2px 0 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
                        {templateHeader || "MSJ Global Education • Official Admission Application"}
                      </h2>
                      <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: 2 }}>
                        Target: <strong style={{ color: "#1e40af" }}>{selectedInquiry.target_university}</strong> ({selectedInquiry.target_country})
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: 6,
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        letterSpacing: "0.04em",
                        background: "#0f172a",
                        color: "#ffffff",
                      }}
                    >
                      {selectedInquiry.application_no}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4 }}>
                      Date: {formatDate(selectedInquiry.created_at)}
                    </div>
                  </div>
                </div>

                {/* 2. Candidate Particulars */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      color: "#1e40af",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background: "#eff6ff",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <GraduationCap size={16} /> 1. Candidate Personal Particulars
                  </div>

                  <div className="msj-detail-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label">Full Name</span>
                      <span className="msj-detail-value" style={{ fontWeight: 700 }}>{selectedInquiry.student_name}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label">Gender</span>
                      <span className="msj-detail-value">{selectedInquiry.gender || "Not Specified"}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label">Direct Contact Phone</span>
                      <span className="msj-detail-value">{selectedInquiry.phone}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label">Email Address</span>
                      <span className="msj-detail-value">{selectedInquiry.email}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label">Intended Degree Level</span>
                      <span className="msj-detail-value">{selectedInquiry.study_level}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label">Country Preference</span>
                      <span className="msj-detail-value">{selectedInquiry.target_country}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Academic Standings (Strictly Madhyamik & HS Marks) */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      color: "#0369a1",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background: "#f0f9ff",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Building2 size={16} /> 2. Academic Benchmarks &amp; Eligibility
                  </div>

                  <div className="msj-detail-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #bae6fd",
                        borderRadius: 10,
                        padding: "1rem",
                      }}
                    >
                      <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#0284c7", textTransform: "uppercase" }}>
                        Higher Secondary (HS / 12th Grade) Marks
                      </span>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0c4a6e", marginTop: 4 }}>
                        {selectedInquiry.hs_marks || "N/A"}
                      </div>
                      <span style={{ fontSize: "0.74rem", color: "#64748b" }}>Required for BSc Nursing &amp; Paramedical clinical courses</span>
                    </div>

                    <div
                      style={{
                        background: "#ffffff",
                        border: "1.5px solid #c7d2fe",
                        borderRadius: 10,
                        padding: "1rem",
                      }}
                    >
                      <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#4338ca", textTransform: "uppercase" }}>
                        Madhyamik (10th Grade / Secondary) Marks
                      </span>
                      <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1e1b4b", marginTop: 4 }}>
                        {selectedInquiry.madhyamik_marks || "N/A"}
                      </div>
                      <span style={{ fontSize: "0.74rem", color: "#64748b" }}>Secondary school verification baseline</span>
                    </div>

                    <div className="msj-detail-field" style={{ gridColumn: "span 2", marginTop: 8 }}>
                      <span className="msj-detail-label">Applied Course &amp; Specialization</span>
                      <span className="msj-detail-value" style={{ fontWeight: 700, color: "#0f172a" }}>
                        {selectedInquiry.preferred_course}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Financial & Payment Records */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      color: "#059669",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background: "#ecfdf5",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <CreditCard size={16} /> 3. Application Fee &amp; Payment Verification
                  </div>

                  <div className="msj-detail-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label">Application Fee</span>
                      <span className="msj-detail-value">₹{parseFloat(selectedInquiry.application_fee as any || 1000).toLocaleString()}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label">Paid Amount</span>
                      <span className="msj-detail-value" style={{ fontWeight: 700, color: "#059669" }}>
                        ₹{parseFloat(selectedInquiry.paid_amount as any || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label">Payment Mode</span>
                      <span className="msj-detail-value">{selectedInquiry.payment_method || "Online"}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label">Transaction ID</span>
                      <span className="msj-detail-value" style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                        {selectedInquiry.transaction_id || "None"}
                      </span>
                    </div>
                  </div>

                  {/* Attached Payment Receipt in Details View */}
                  {selectedInquiry.payment_receipt && (
                    <div style={{ marginTop: "1rem", padding: "1rem", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#166534", display: "flex", alignItems: "center", gap: 6 }}>
                          <FileCheck size={16} /> Attached Payment Receipt (Max 3MB Verified):
                        </span>
                        <a
                          href={selectedInquiry.payment_receipt}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "0.76rem",
                            fontWeight: 700,
                            color: "#2563eb",
                            textDecoration: "underline",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          Open Full File <ExternalLink size={12} />
                        </a>
                      </div>
                      {selectedInquiry.payment_receipt.match(/\.(jpeg|jpg|png|webp)($|\?)/i) || selectedInquiry.payment_receipt.startsWith("data:image") ? (
                        <img
                          src={selectedInquiry.payment_receipt}
                          alt="Payment Receipt"
                          style={{ maxWidth: "100%", maxHeight: "280px", objectFit: "contain", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, padding: 4 }}
                        />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <FileText size={20} color="#2563eb" />
                          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0f172a" }}>PDF / Document Receipt Attached</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 5. Counselor Case Notes */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      background: "#f1f5f9",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      marginBottom: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>4. Counselor Verification &amp; Advisory Notes</span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Academic Advisory</span>
                  </div>

                  <textarea
                    rows={3}
                    value={counselorNotes}
                    onChange={(e) => setCounselorNotes(e.target.value)}
                    placeholder="Enter counselor remarks, seat booking details, or document status..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: "1px solid #cbd5e1",
                      fontSize: "0.88rem",
                      color: "#1e293b",
                      lineHeight: 1.5,
                      background: "#ffffff",
                    }}
                  />
                </div>

                {/* 6. Dynamic Template Footer */}
                <div
                  style={{
                    paddingTop: "1.25rem",
                    borderTop: "1.5px dashed #cbd5e1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.78rem",
                    color: "#64748b",
                  }}
                >
                  <div>
                    <strong style={{ color: "#0f172a" }}>MSJ Global Education Verification Seal</strong>
                    <div style={{ marginTop: 2 }}>
                      {templateFooter || "Certified by MSJ Academic Board • 100% Clinical Training Assistance"}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#94a3b8" }}>
                      AUTHENTICATED ENROLMENT RECORD
                    </div>
                    <div style={{ fontWeight: 700, color: "#10b981", marginTop: 2 }}>
                      ✓ Digitally Certified
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action Bar */}
            <div
              className="msj-modal-footer"
              style={{
                background: "#ffffff",
                padding: "1rem 1.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>Update Pipeline Status:</span>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) =>
                    handleStatusChange(
                      selectedInquiry.id,
                      e.target.value as "pending" | "completed" | "rejected"
                    )
                  }
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: "1.5px solid #cbd5e1",
                  }}
                >
                  <option value="pending">🟡 Pending</option>
                  <option value="completed">🟢 Completed</option>
                  <option value="rejected">🔴 Rejected</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className="msj-btn-studio-secondary"
                  style={{ padding: "8px 16px" }}
                  onClick={() => setSelectedInquiry(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={savingTemplate}
                  onClick={handleSaveTemplate}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #1e40af, #2563eb)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.84rem",
                    border: "none",
                    cursor: savingTemplate ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.25)",
                  }}
                >
                  <Save size={15} /> {savingTemplate ? "Saving..." : "Save Template Updates"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Form Builder Studio Modal */}
      <FormBuilderModal
        isOpen={showFormBuilder}
        onClose={() => setShowFormBuilder(false)}
        defaultCategory="admission"
      />

      {/* Payment Receipt Lightbox Modal */}
      {viewingReceipt && (
        <div
          onClick={() => setViewingReceipt(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 25, 47, 0.85)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "10px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "1rem 1.25rem",
                background: "#0f172a",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.95rem", fontWeight: 800 }}>
                <FileCheck size={18} color="#4ade80" />
                <div style={{ display: "flex", flexDirection: "column" }}><span>Uploaded Student Payment Receipt</span><span style={{ fontSize: "0.78rem", color: "#93c5fd", fontWeight: 600, marginTop: 2 }}>{viewingReceipt.name} · {viewingReceipt.appNo}</span></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <a
                  href={viewingReceipt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#93c5fd",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    textDecoration: "underline",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Open in New Tab <ExternalLink size={13} />
                </a>
                <button
                  type="button"
                  onClick={() => setViewingReceipt(null)}
                  style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content preview */}
            <div
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                textAlign: "center",
                background: "#f8fafc",
                flex: 1,
              }}
            >
              {(() => {
                const url = viewingReceipt.url;
                const isImage = url.match(/\.(jpeg|jpg|png|webp|gif|bmp)($|\?)/i) || url.startsWith("data:image");
                const isPdf = url.match(/\.pdf($|\?)/i) || url.startsWith("data:application/pdf");
                if (isImage) {
                  return (
                    <img
                      src={url}
                      alt={`Payment Receipt Preview for ${viewingReceipt.name}`}
                      style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      onError={() => alert("Unable to load receipt image. The file may be corrupt or too large.")}
                    />
                  );
                }
                if (isPdf) {
                  return (
                    <div style={{ textAlign: "center" }}>
                      <FileText size={48} color="#dc2626" style={{ margin: "0 auto 1rem" }} />
                      <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>PDF Receipt Attached</div>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "8px 0 1.25rem" }}>
                        This receipt is a PDF document. Click below to view or download.
                      </p>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "#2563eb",
                          color: "#ffffff",
                          padding: "8px 20px",
                          borderRadius: 6,
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        <Download size={16} /> Open / Download PDF
                      </a>
                    </div>
                  );
                }
                return (
                  <div style={{ padding: "3rem 1rem" }}>
                    <FileText size={48} color="#2563eb" style={{ margin: "0 auto 1rem" }} />
                    <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>Document Receipt</div>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "8px 0 1.25rem" }}>
                      This receipt is not an image. Click below to view or download the file.
                    </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#2563eb",
                        color: "#ffffff",
                        padding: "8px 20px",
                        borderRadius: 6,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      <Download size={16} /> Download / View File
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
