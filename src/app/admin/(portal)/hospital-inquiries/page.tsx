"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  HeartPulse,
  Search,
  Eye,
  X,
  CheckCircle2,
  CreditCard,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trash2,
  Layers,
  Printer,
  Edit3,
  Save,
  FileCheck,
  FileText,
  ExternalLink,
} from "lucide-react";
import FormBuilderModal from "@/components/FormBuilderModal";

interface HospitalRecord {
  id: string;
  application_no: string;
  candidate_name: string;
  email: string;
  phone: string;
  gender: string;
  target_state: string;
  qualification: string;
  target_hospital: string;
  department: string;
  madhyamik_marks: string;
  hs_marks: string;
  status: "pending" | "completed" | "rejected";
  payment_status: "unpaid" | "pending" | "paid";
  application_fee: number | string;
  paid_amount: number | string;
  payment_method: string;
  transaction_id: string;
  payment_receipt?: string;
  cv_attach?: string;
  template_header: string;
  template_footer: string;
  form_data: any;
  coordinator_notes: string;
  created_at: string;
  updated_at: string;
}

interface StatsData {
  totalInquiries: number;
  totalPayments: { count: number; amount: number };
  completedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

export default function HospitalInquiriesPage() {
  const [records, setRecords] = useState<HospitalRecord[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalInquiries: 0,
    totalPayments: { count: 0, amount: 0 },
    completedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  const [selectedRecord, setSelectedRecord] = useState<HospitalRecord | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<{ url: string; name: string; appNo: string } | null>(null);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateHeader, setTemplateHeader] = useState("");
  const [templateFooter, setTemplateFooter] = useState("");
  const [coordinatorNotes, setCoordinatorNotes] = useState("");
  const [hospitalLogo, setHospitalLogo] = useState("");
  const [logoOffset, setLogoOffset] = useState(0);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const handleLogoFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WebP, SVG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setHospitalLogo(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const fetchRecords = useCallback(async () => {
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

      const res = await fetch(`/api/admin/hospital-requirements?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setRecords(data.records || []);
        setStats({
          totalInquiries: Number(data.stats?.totalInquiries || 0),
          totalPayments: {
            count: Number(data.stats?.totalPayments?.count || 0),
            amount: Number(data.stats?.totalPayments?.amount || 0),
          },
          completedCount: Number(data.stats?.completedCount || 0),
          pendingCount: Number(data.stats?.pendingCount || 0),
          rejectedCount: Number(data.stats?.rejectedCount || 0),
        });
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to load hospital records:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleStatusChange = async (id: string, newStatus: "pending" | "completed" | "rejected") => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/hospital-requirements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setRecords((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedRecord && selectedRecord.id === id) {
          setSelectedRecord({ ...selectedRecord, status: newStatus });
        }
        showToast(`Status updated to ${newStatus.toUpperCase()}`);
        fetchRecords();
      } else {
        showToast(data.message || "Failed to update status", "error");
      }
    } catch (err) {
      showToast("Network error updating status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteRecord = async (id: string, appNo: string, candidateName: string) => {
    if (!window.confirm(`Are you sure you want to delete inquiry ${appNo} (${candidateName})?`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/hospital-requirements/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Inquiry ${appNo} deleted successfully`);
        if (selectedRecord && selectedRecord.id === id) {
          setSelectedRecord(null);
        }
        fetchRecords();
      } else {
        showToast(data.message || "Failed to delete inquiry", "error");
      }
    } catch (err) {
      showToast("Network error deleting inquiry", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAllInquiries = async () => {
    if (
      !window.confirm(
        "WARNING: Are you sure you want to clear ALL hospital consultation inquiries from the database? This action is permanent and cannot be undone."
      )
    ) {
      return;
    }
    setClearingAll(true);
    try {
      const res = await fetch(`/api/admin/hospital-requirements?clearAll=true`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        showToast("All hospital inquiries cleared from database");
        setRecords([]);
        setStats({
          totalInquiries: 0,
          totalPayments: { count: 0, amount: 0 },
          completedCount: 0,
          pendingCount: 0,
          rejectedCount: 0,
        });
        setTotalCount(0);
        setSelectedRecord(null);
      } else {
        showToast(data.message || "Failed to clear inquiries", "error");
      }
    } catch (err) {
      showToast("Network error clearing database", "error");
    } finally {
      setClearingAll(false);
    }
  };

  const handleOpenTemplateModal = (item: HospitalRecord) => {
    setSelectedRecord(item);
    setTemplateHeader(item.template_header || "MSJ Global Education • Official Hospital Consultation Application");
    setTemplateFooter(item.template_footer || "Certified by MSJ Medical Coordination Board • 100% Verified Overseas Hospital Assistance");
    setCoordinatorNotes(item.coordinator_notes || "");
    setHospitalLogo("");
    setLogoOffset(0);
    setIsEditingTemplate(false);
  };

  const handleSaveTemplate = async () => {
    if (!selectedRecord) return;
    setSavingTemplate(true);
    try {
      const res = await fetch(`/api/admin/hospital-requirements/${selectedRecord.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_header: templateHeader,
          template_footer: templateFooter,
          coordinator_notes: coordinatorNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedRecord({
          ...selectedRecord,
          template_header: templateHeader,
          template_footer: templateFooter,
          coordinator_notes: coordinatorNotes,
        });
        setRecords((prev) =>
          prev.map((item) =>
            item.id === selectedRecord.id
              ? { ...item, template_header: templateHeader, template_footer: templateFooter, coordinator_notes: coordinatorNotes }
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
      {/* Toast Notification */}
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
          }}
        >
          {toastMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Embedded Responsive Styles for Top Cards & Mobile Layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hospital-header-wrap {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .hospital-header-actions {
          display: flex;
          gap: 0.6rem;
          align-items: center;
          flex-wrap: wrap;
        }
        .hospital-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.75rem;
          width: 100%;
        }
        .hospital-stat-card {
          background: #ffffff;
          border: 1px solid var(--msj-border, #e2e8f0);
          border-radius: 14px;
          padding: 1.25rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 10px -2px rgba(10, 29, 55, 0.05);
          transition: all 0.2s ease;
          width: 100%;
        }
        .hospital-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 22px -4px rgba(10, 29, 55, 0.1);
        }
        .hospital-stat-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hospital-controls-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--msj-border, #e2e8f0);
          background: #ffffff;
        }
        .hospital-controls-filters {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        @media (max-width: 960px) {
          .hospital-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1rem;
          }
        }
        @media (max-width: 640px) {
          .hospital-header-wrap {
            flex-direction: column;
            align-items: stretch;
          }
          .hospital-header-actions {
            width: 100%;
            justify-content: flex-start;
          }
          .hospital-stats-grid {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }
          .hospital-stat-card {
            padding: 1rem;
          }
          .hospital-controls-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .hospital-controls-filters {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }
          .hospital-controls-filters select,
          .hospital-controls-filters input {
            width: 100%;
          }
        }
      `}} />

      {/* Page Header */}
      <div className="hospital-header-wrap">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--msj-navy, #0a1d37)", margin: "0 0 4px 0" }}>
            Hospital Consultation Inquiries &amp; Templates
          </h1>
          <p style={{ fontSize: "0.88rem", color: "#64748b", margin: 0 }}>
            Overseas &amp; domestic hospital consultation pipeline, medical verification, and official consultation dossiers.
          </p>
        </div>
        <div className="hospital-header-actions">
          <button
            type="button"
            style={{
              padding: "8px 16px",
              fontSize: "0.85rem",
              borderRadius: "9px",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #d97706, #b45309)",
              boxShadow: "0 4px 14px rgba(180, 83, 9, 0.25)",
              transition: "all 0.2s ease",
            }}
            onClick={() => setShowFormBuilder(true)}
          >
            <Layers size={16} /> Dynamic Form Studio
          </button>
          <button
            type="button"
            onClick={fetchRecords}
            title="Refresh list"
            style={{
              padding: "8px 14px",
              fontSize: "0.85rem",
              borderRadius: "9px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "#b45309",
              background: "#fef3c7",
              border: "1px solid #fde68a",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={15} /> Refresh
          </button>
          {records.length > 0 && (
            <button
              type="button"
              disabled={clearingAll}
              onClick={handleClearAllInquiries}
              title="Clear all hospital consultation records from database"
              style={{
                padding: "8px 14px",
                fontSize: "0.85rem",
                borderRadius: "9px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                color: "#dc2626",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                cursor: clearingAll ? "not-allowed" : "pointer",
              }}
            >
              <Trash2 size={15} /> {clearingAll ? "Clearing..." : "Clear Database"}
            </button>
          )}
        </div>
      </div>

      {/* 3 TOP DYNAMIC STATS CARDS (Fully Responsive on Desktop & Mobile) */}
      <div className="hospital-stats-grid">
        {/* Card 1: Total Hospital Inquiries */}
        <div className="hospital-stat-card" style={{ borderLeft: "4px solid #d97706" }}>
          <div className="hospital-stat-icon-wrap" style={{ background: "#fef3c7", color: "#d97706" }}>
            <HeartPulse size={26} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "#0a1d37", lineHeight: 1.1 }}>
              {stats.totalInquiries}
            </div>
            <div style={{ fontSize: "0.84rem", color: "#475569", fontWeight: 600, marginTop: 3 }}>
              Hospital Inquiry Total
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 4, fontWeight: 600 }}>
              {stats.pendingCount} Pending • {stats.rejectedCount} Rejected
            </div>
          </div>
        </div>

        {/* Card 2: Consultation Payments */}
        <div className="hospital-stat-card" style={{ borderLeft: "4px solid #10b981" }}>
          <div className="hospital-stat-icon-wrap" style={{ background: "#ecfdf5", color: "#059669" }}>
            <CreditCard size={26} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "#0a1d37", lineHeight: 1.1 }}>
              ₹{Number(stats.totalPayments?.amount || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: "0.84rem", color: "#475569", fontWeight: 600, marginTop: 3 }}>
              Consultation Payments
            </div>
            <div style={{ fontSize: "0.75rem", color: "#059669", marginTop: 4, fontWeight: 700 }}>
              {stats.totalPayments?.count || 0} Cases Paid
            </div>
          </div>
        </div>

        {/* Card 3: Cases Completed */}
        <div className="hospital-stat-card" style={{ borderLeft: "4px solid #2563eb" }}>
          <div className="hospital-stat-icon-wrap" style={{ background: "#eff6ff", color: "#2563eb" }}>
            <CheckCircle2 size={26} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "1.65rem", fontWeight: 800, color: "#0a1d37", lineHeight: 1.1 }}>
              {stats.completedCount}
            </div>
            <div style={{ fontSize: "0.84rem", color: "#475569", fontWeight: 600, marginTop: 3 }}>
              Cases Completed
            </div>
            <div style={{ fontSize: "0.75rem", color: "#2563eb", marginTop: 4, fontWeight: 700 }}>
              {stats.totalInquiries > 0
                ? `${Math.round((stats.completedCount / stats.totalInquiries) * 100)}% Completion Rate`
                : "0% Completion Rate"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="msj-dash-panel" style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 12px -2px rgba(10,29,55,0.06)" }}>
        {/* Controls Bar */}
        <div className="hospital-controls-bar">
          <div style={{ fontWeight: 700, color: "var(--msj-navy, #0a1d37)", display: "flex", alignItems: "center", gap: 8, fontSize: "0.92rem" }}>
            <span>Hospital Consultation Records</span>
            <span style={{ fontSize: "0.75rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: 6, color: "#475569", fontWeight: 600 }}>
              Showing {records.length} of {totalCount} records
            </span>
          </div>

          <div className="hospital-controls-filters">
            {/* Search Box */}
            <div className="msj-table-search-box" style={{ minWidth: 220, display: "flex", alignItems: "center", gap: 8, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 10px" }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search patient, hospital, dept..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                style={{ border: "none", background: "transparent", outline: "none", fontSize: "0.84rem", width: "100%", color: "#1e293b" }}
              />
            </div>

            {/* Filter by Status */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.84rem", color: "#1e293b", fontWeight: 600, background: "#ffffff", cursor: "pointer" }}
            >
              <option value="all">Status: All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Filter by Payment */}
            <select
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
              style={{ padding: "7px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.84rem", color: "#1e293b", fontWeight: 600, background: "#ffffff", cursor: "pointer" }}
            >
              <option value="all">Payment: All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
        </div>

        {/* Table Content (NO ICONS IN DATA / UNIVERSITY / SPECIALTY AS REQUESTED) */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="msj-dash-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 850 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                <th style={{ padding: "12px 16px", fontSize: "0.76rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>App No &amp; Patient</th>
                <th style={{ padding: "12px 16px", fontSize: "0.76rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hospital &amp; Destination</th>
                <th style={{ padding: "12px 16px", fontSize: "0.76rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Department / Specialty</th>
                <th style={{ padding: "12px 16px", fontSize: "0.76rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Qualification &amp; Urgency</th>
                <th style={{ padding: "12px 16px", fontSize: "0.76rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Payment Status</th>
                <th style={{ padding: "12px 16px", fontSize: "0.76rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", minWidth: 140 }}>Action Status</th>
                <th style={{ padding: "12px 16px", fontSize: "0.76rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Applied Date</th>
                <th style={{ padding: "12px 16px", fontSize: "0.76rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                      Loading hospital inquiries from database...
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "3.5rem 1.5rem", color: "#64748b" }}>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                      No Hospital Consultation Inquiries Found
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", maxWidth: 460, margin: "0 auto 1rem" }}>
                      {search || statusFilter !== "all" || paymentFilter !== "all"
                        ? "No inquiries match your selected search or filter criteria. Try resetting your filters."
                        : "The hospital consultation database is currently clear. Any patient submissions through the public portal will appear here dynamically in real time."}
                    </p>
                    {(search || statusFilter !== "all" || paymentFilter !== "all") && (
                      <button
                        type="button"
                        onClick={() => { setSearch(""); setStatusFilter("all"); setPaymentFilter("all"); setPage(1); }}
                        style={{ padding: "6px 14px", fontSize: "0.82rem", borderRadius: 6, background: "#0a1d37", color: "#ffffff", border: "none", cursor: "pointer", fontWeight: 600 }}
                      >
                        Reset Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                records.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.15s ease" }}>
                    {/* 1. Patient Info (NO ICONS) */}
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#b45309", background: "#fef3c7", border: "1px solid #fde68a", padding: "1px 6px", borderRadius: "4px" }}>
                          {item.application_no}
                        </span>
                        {item.gender && (
                          <span style={{ fontSize: "0.72rem", color: "#64748b", textTransform: "capitalize" }}>
                            ({item.gender})
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>
                        {item.candidate_name}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 2 }}>
                        {item.phone}
                      </div>
                    </td>

                    {/* 2. Hospital & Destination (NO ICONS) */}
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 700, color: "var(--msj-navy, #0a1d37)", fontSize: "0.88rem" }}>
                        {item.target_hospital || "Hospital TBD"}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "#64748b", marginTop: 2 }}>
                        {item.target_state || "India"}
                      </div>
                    </td>

                    {/* 3. Department (NO ICONS) */}
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>
                        {item.department || "General Medicine"}
                      </div>
                    </td>

                    {/* 4. Qualification & Urgency (NO ICONS) */}
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.78rem" }}>
                          <span style={{ fontWeight: 700, color: "#0369a1", background: "#f0f9ff", padding: "1px 6px", borderRadius: 4, border: "1px solid #bae6fd", fontSize: "0.72rem" }}>
                            Urgency:
                          </span>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>{item.qualification || "Standard"}</span>
                        </div>
                        {item.madhyamik_marks && (
                          <div style={{ fontSize: "0.74rem", color: "#64748b" }}>
                            {item.madhyamik_marks}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 5. Payment Status (NO ICONS - CLEAN TEXT BADGES) */}
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      {item.payment_status === "paid" && (
                        <div>
                          <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 700, background: "#ecfdf5", color: "#065f46", padding: "3px 8px", borderRadius: 6, border: "1px solid #a7f3d0" }}>
                            PAID (₹{parseFloat((item.paid_amount as any) || 0).toLocaleString()})
                          </span>
                          {item.payment_method && (
                            <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: 2 }}>
                              via {item.payment_method}
                            </div>
                          )}
                        </div>
                      )}
                      {item.payment_status === "pending" && (
                        <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 700, background: "#fffbeb", color: "#92400e", padding: "3px 8px", borderRadius: 6, border: "1px solid #fde68a" }}>
                          Verification Pending
                        </span>
                      )}
                      {item.payment_status === "unpaid" && (
                        <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 700, background: "#fef2f2", color: "#991b1b", padding: "3px 8px", borderRadius: 6, border: "1px solid #fecaca" }}>
                          Unpaid (₹{parseFloat((item.application_fee as any) || 2000).toLocaleString()})
                        </span>
                      )}
                      {item.payment_receipt && (
                        <div style={{ marginTop: 4 }}>
                          <button
                            type="button"
                            onClick={() => setViewingReceipt({ url: item.payment_receipt || "", name: item.candidate_name, appNo: item.application_no })}
                            style={{ fontSize: "0.72rem", fontWeight: 700, background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a", padding: "2px 7px", borderRadius: 4, cursor: "pointer" }}
                          >
                            Receipt
                          </button>
                        </div>
                      )}
                    </td>

                    {/* 6. Action Status Dropdown (NO ICONS) */}
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <select
                        value={item.status}
                        disabled={updatingId === item.id}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as "pending" | "completed" | "rejected")}
                        style={{
                          width: "100%",
                          padding: "6px 10px",
                          borderRadius: "7px",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          outline: "none",
                          border: item.status === "completed" ? "1.5px solid #10b981" : item.status === "rejected" ? "1.5px solid #ef4444" : "1.5px solid #f59e0b",
                          background: item.status === "completed" ? "#ecfdf5" : item.status === "rejected" ? "#fef2f2" : "#fffbeb",
                          color: item.status === "completed" ? "#065f46" : item.status === "rejected" ? "#991b1b" : "#92400e",
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>

                    {/* 7. Applied Date */}
                    <td style={{ padding: "12px 16px", verticalAlign: "middle", fontSize: "0.78rem", color: "#475569", whiteSpace: "nowrap" }}>
                      {formatDate(item.created_at)}
                    </td>

                    {/* 8. Action Buttons (View Template & Delete) */}
                    <td style={{ padding: "12px 16px", verticalAlign: "middle", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                        <button
                          type="button"
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.78rem",
                            borderRadius: "7px",
                            fontWeight: 700,
                            color: "#b45309",
                            background: "#fef3c7",
                            border: "1px solid #fde68a",
                            cursor: "pointer",
                            transition: "all 0.18s ease",
                          }}
                          onClick={() => handleOpenTemplateModal(item)}
                        >
                          View Template
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          title="Delete inquiry"
                          style={{
                            padding: "6px 9px",
                            fontSize: "0.78rem",
                            borderRadius: "7px",
                            fontWeight: 700,
                            color: "#dc2626",
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            cursor: deletingId === item.id ? "not-allowed" : "pointer",
                            transition: "all 0.18s ease",
                          }}
                          onClick={() => handleDeleteRecord(item.id, item.application_no, item.candidate_name)}
                        >
                          {deletingId === item.id ? "..." : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", background: "#fafafa", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ fontSize: "0.82rem", color: "#64748b" }}>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({limit} records per page)
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
              <ChevronLeft size={16} /> Previous
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
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* HOSPITAL CONSULTATION DOSSIER MODAL */}
      {selectedRecord && (
        <div
          className="msj-modal-overlay"
          onClick={() => setSelectedRecord(null)}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", padding: 0, margin: 0, zIndex: 2000, background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="msj-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100vw", maxWidth: "100vw", height: "100vh", maxHeight: "100vh", borderRadius: 0, margin: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}
          >
            {/* Modal Nav Bar */}
            <div style={{ background: "#0a1d37", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#ffffff", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 800, background: "rgba(217, 119, 6, 0.2)", color: "#f59e0b", padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(217, 119, 6, 0.4)" }}>
                  OFFICIAL TEMPLATE VIEW
                </span>
                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                  Ref: {selectedRecord.application_no}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setIsEditingTemplate(!isEditingTemplate)}
                  style={{ background: isEditingTemplate ? "#d97706" : "rgba(255,255,255,0.1)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 12px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Edit3 size={14} /> {isEditingTemplate ? "Done Customizing" : "Customize Header / Footer"}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 12px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Printer size={14} /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  style={{ background: "transparent", color: "#cbd5e1", border: "none", cursor: "pointer", padding: 4 }}
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Editing Drawer */}
            {isEditingTemplate && (
              <div style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", padding: "1rem 1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>Template Header Title:</label>
                  <input
                    type="text"
                    value={templateHeader}
                    onChange={(e) => setTemplateHeader(e.target.value)}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>Hospital Logo (Drag &amp; Drop / Upload):</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDraggingLogo(false); }}
                    onDrop={(e) => { e.preventDefault(); setIsDraggingLogo(false); if (e.dataTransfer.files?.[0]) handleLogoFile(e.dataTransfer.files[0]); }}
                    onClick={() => document.getElementById("hospital-logo-input")?.click()}
                    style={{ border: `1.5px dashed ${isDraggingLogo ? "#d97706" : "#cbd5e1"}`, borderRadius: 8, padding: "8px 12px", background: isDraggingLogo ? "#fef3c7" : "#ffffff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <input id="hospital-logo-input" type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { if (e.target.files?.[0]) handleLogoFile(e.target.files[0]); }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {hospitalLogo && <img src={hospitalLogo} alt="Logo Preview" style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover", border: "1px solid #cbd5e1" }} />}
                      <span style={{ fontSize: "0.78rem", color: "#475569", fontWeight: 600 }}>
                        {hospitalLogo ? "Logo active (Click to change)" : "Drop image or Click to browse"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>Shift:</span>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setLogoOffset((p) => Math.max(-30, p - 10)); }} style={{ padding: "2px 6px", fontSize: "0.72rem", borderRadius: 4, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 800 }}>⇦</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setLogoOffset((p) => Math.min(60, p + 10)); }} style={{ padding: "2px 6px", fontSize: "0.72rem", borderRadius: 4, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer", fontWeight: 800 }}>⇨</button>
                    </div>
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>Template Footer Note:</label>
                  <input
                    type="text"
                    value={templateFooter}
                    onChange={(e) => setTemplateFooter(e.target.value)}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />
                </div>
              </div>
            )}

            {/* Template Body */}
            <div className="msj-modal-body" style={{ background: "#f8fafc", padding: "1.5rem", flex: 1, overflowY: "auto" }}>
              <div style={{ background: "#ffffff", border: "1.5px solid #cbd5e1", borderRadius: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", padding: "1.75rem", position: "relative" }}>
                {/* 1. Dynamic Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", background: "linear-gradient(135deg, #0a1d37 0%, #0c2340 50%, #102d50 100%)", borderRadius: 12, marginBottom: "1.5rem", flexWrap: "wrap", gap: 14, color: "#ffffff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div style={{ transform: `translateX(${logoOffset}px)`, transition: "transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)" }}>
                      <div style={{
                        width: 88,
                        height: 88,
                        borderRadius: "50%",
                        background: "#ffffff",
                        padding: 5,
                        border: "4px solid rgba(96,165,250,0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 6px 22px rgba(0,0,0,0.22)",
                        position: "relative",
                      }}>
                        {hospitalLogo ? (
                          <img src={hospitalLogo} alt="Hospital Logo" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }} />
                        ) : (
                          <HeartPulse size={42} color="#d97706" />
                        )}
                        <div style={{
                          position: "absolute",
                          inset: -5,
                          borderRadius: "50%",
                          border: "2px dashed rgba(147,197,253,0.55)",
                        }}>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>
                        Official Hospital Placement Dossier
                      </div>
                      <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#ffffff", lineHeight: 1.25 }}>
                        {templateHeader || "MSJ Global Education • Official Hospital Consultation Application"}
                      </h2>
                      <div style={{ fontSize: "0.85rem", color: "#cbd5e1", marginTop: 3 }}>
                        Hospital: <strong style={{ color: "#93c5fd" }}>{selectedRecord.target_hospital}</strong> ({selectedRecord.target_state})
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ display: "inline-block", padding: "5px 12px", borderRadius: 8, fontWeight: 800, fontSize: "0.85rem", letterSpacing: "0.04em", background: "rgba(255,255,255,0.12)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.2)" }}>
                      {selectedRecord.application_no}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#bfdbfe", marginTop: 5 }}>
                      {formatDate(selectedRecord.created_at)}
                    </div>
                  </div>
                </div>

                {/* 2. Patient Particulars */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.05em", background: "#fef3c7", padding: "6px 12px", borderRadius: "6px", marginBottom: "1rem" }}>
                    1. Patient Personal Particulars
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label" style={{ fontSize: "0.74rem", color: "#64748b", display: "block", fontWeight: 600 }}>Full Name</span>
                      <span className="msj-detail-value" style={{ fontWeight: 700, color: "#0f172a" }}>{selectedRecord.candidate_name}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label" style={{ fontSize: "0.74rem", color: "#64748b", display: "block", fontWeight: 600 }}>Gender</span>
                      <span className="msj-detail-value" style={{ fontWeight: 600, color: "#0f172a" }}>{selectedRecord.gender || "Not Specified"}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label" style={{ fontSize: "0.74rem", color: "#64748b", display: "block", fontWeight: 600 }}>Contact Phone</span>
                      <span className="msj-detail-value" style={{ fontWeight: 600, color: "#0f172a" }}>{selectedRecord.phone}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label" style={{ fontSize: "0.74rem", color: "#64748b", display: "block", fontWeight: 600 }}>Email Address</span>
                      <span className="msj-detail-value" style={{ fontWeight: 600, color: "#0f172a" }}>{selectedRecord.email}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label" style={{ fontSize: "0.74rem", color: "#64748b", display: "block", fontWeight: 600 }}>Attendant / Contact Person</span>
                      <span className="msj-detail-value" style={{ fontWeight: 600, color: "#0f172a" }}>{selectedRecord.madhyamik_marks || "N/A"}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label" style={{ fontSize: "0.74rem", color: "#64748b", display: "block", fontWeight: 600 }}>Preferred Destination</span>
                      <span className="msj-detail-value" style={{ fontWeight: 600, color: "#0f172a" }}>{selectedRecord.target_state || "India"}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Medical Details */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.05em", background: "#f0f9ff", padding: "6px 12px", borderRadius: "6px", marginBottom: "1rem" }}>
                    2. Medical &amp; Consultation Details
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
                    <div style={{ background: "#ffffff", border: "1.5px solid #fde68a", borderRadius: 10, padding: "1rem" }}>
                      <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#b45309", textTransform: "uppercase" }}>Preferred Hospital Group</span>
                      <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#92400e", marginTop: 4 }}>{selectedRecord.target_hospital || "N/A"}</div>
                    </div>
                    <div style={{ background: "#ffffff", border: "1.5px solid #bae6fd", borderRadius: 10, padding: "1rem" }}>
                      <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#0369a1", textTransform: "uppercase" }}>Medical Specialty / Department</span>
                      <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0c4a6e", marginTop: 4 }}>{selectedRecord.department || "N/A"}</div>
                    </div>
                    <div style={{ gridColumn: "1 / -1", background: "#f8fafc", padding: "10px 14px", borderRadius: 8 }}>
                      <span style={{ fontSize: "0.74rem", color: "#64748b", display: "block", fontWeight: 600 }}>Urgency Level</span>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>{selectedRecord.qualification || "Standard"}</span>
                    </div>
                    {selectedRecord.hs_marks && (
                      <div style={{ gridColumn: "1 / -1", background: "#f8fafc", padding: "10px 14px", borderRadius: 8 }}>
                        <span style={{ fontSize: "0.74rem", color: "#64748b", display: "block", fontWeight: 600 }}>Diagnostic Summary &amp; Symptoms</span>
                        <span style={{ color: "#1e293b", fontSize: "0.88rem" }}>{selectedRecord.hs_marks}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Payment Records */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em", background: "#ecfdf5", padding: "6px 12px", borderRadius: "6px", marginBottom: "1rem" }}>
                    3. Consultation Fee &amp; Payment Verification
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label" style={{ fontSize: "0.74rem", color: "#64748b", display: "block", fontWeight: 600 }}>Consultation Fee</span>
                      <span className="msj-detail-value" style={{ fontWeight: 600, color: "#0f172a" }}>₹{parseFloat((selectedRecord.application_fee as any) || 2000).toLocaleString()}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label" style={{ fontSize: "0.74rem", color: "#64748b", display: "block", fontWeight: 600 }}>Paid Amount</span>
                      <span className="msj-detail-value" style={{ fontWeight: 700, color: "#059669" }}>₹{parseFloat((selectedRecord.paid_amount as any) || 0).toLocaleString()}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label" style={{ fontSize: "0.74rem", color: "#64748b", display: "block", fontWeight: 600 }}>Payment Mode</span>
                      <span className="msj-detail-value" style={{ fontWeight: 600, color: "#0f172a" }}>{selectedRecord.payment_method || "Online"}</span>
                    </div>
                    <div className="msj-detail-field">
                      <span className="msj-detail-label" style={{ fontSize: "0.74rem", color: "#64748b", display: "block", fontWeight: 600 }}>Transaction ID</span>
                      <span className="msj-detail-value" style={{ fontFamily: "monospace", fontSize: "0.82rem", color: "#0f172a" }}>{selectedRecord.transaction_id || "None"}</span>
                    </div>
                  </div>
                  {selectedRecord.payment_receipt && (
                    <div style={{ marginTop: "1rem", padding: "1rem", background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#166534" }}>
                          Attached Payment Receipt:
                        </span>
                        <a href={selectedRecord.payment_receipt} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.76rem", fontWeight: 700, color: "#2563eb", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          Open Full File <ExternalLink size={12} />
                        </a>
                      </div>
                      {(selectedRecord.payment_receipt.match(/\.(jpeg|jpg|png|webp)($|\?)/i) || selectedRecord.payment_receipt.startsWith("data:image")) ? (
                        <img src={selectedRecord.payment_receipt} alt={`Payment Receipt for ${selectedRecord.candidate_name}`} style={{ maxWidth: "100%", maxHeight: "280px", objectFit: "contain", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, padding: 4 }} />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <FileText size={20} color="#2563eb" />
                          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0f172a" }}>PDF / Document Receipt Attached</span>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedRecord.cv_attach && (
                    <div style={{ marginTop: "1rem", padding: "1rem", background: "#eff6ff", border: "1.5px solid #93c5fd", borderRadius: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 800, color: "#1e3a8a" }}>
                          Attached CV / Resume:
                        </span>
                        <a href={selectedRecord.cv_attach} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.76rem", fontWeight: 700, color: "#2563eb", textDecoration: "underline", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          Open Full File <ExternalLink size={12} />
                        </a>
                      </div>
                      {(selectedRecord.cv_attach.match(/\.(jpeg|jpg|png|webp)($|\?)/i) || selectedRecord.cv_attach.startsWith("data:image")) ? (
                        <img src={selectedRecord.cv_attach} alt="CV / Resume" style={{ maxWidth: "100%", maxHeight: "280px", objectFit: "contain", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, padding: 4 }} />
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <FileText size={20} color="#2563eb" />
                          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0f172a" }}>PDF / Document CV Attached</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 5. Coordinator Notes */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", background: "#f1f5f9", padding: "6px 12px", borderRadius: "6px", marginBottom: "0.75rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>4. Medical Coordinator Verification &amp; Advisory Notes</span>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Advisory</span>
                  </div>
                  <textarea
                    rows={3}
                    value={coordinatorNotes}
                    onChange={(e) => setCoordinatorNotes(e.target.value)}
                    placeholder="Enter coordinator remarks, hospital booking details, or document status..."
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.88rem", color: "#1e293b", lineHeight: 1.5, background: "#ffffff" }}
                  />
                </div>

                {/* 6. Footer */}
                <div style={{ paddingTop: "1.25rem", borderTop: "1.5px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", color: "#64748b", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <strong style={{ color: "#0f172a" }}>MSJ Global Education Medical Coordination Seal</strong>
                    <div style={{ marginTop: 2 }}>
                      {templateFooter || "Certified by MSJ Medical Coordination Board • 100% Verified Overseas Hospital Assistance"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#94a3b8" }}>AUTHENTICATED CONSULTATION RECORD</div>
                    <div style={{ fontWeight: 700, color: "#10b981", marginTop: 2 }}>Digitally Certified</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action Bar */}
            <div className="msj-modal-footer" style={{ background: "#ffffff", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid #e2e8f0", flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b" }}>Update Pipeline Status:</span>
                <select
                  value={selectedRecord.status}
                  onChange={(e) => handleStatusChange(selectedRecord.id, e.target.value as "pending" | "completed" | "rejected")}
                  style={{ padding: "6px 12px", borderRadius: "6px", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", border: "1.5px solid #cbd5e1" }}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" className="msj-btn-studio-secondary" style={{ padding: "8px 16px" }} onClick={() => setSelectedRecord(null)}>
                  Close
                </button>
                <button
                  type="button"
                  disabled={savingTemplate}
                  onClick={handleSaveTemplate}
                  style={{ padding: "8px 20px", borderRadius: "8px", background: "linear-gradient(135deg, #b45309, #d97706)", color: "#ffffff", fontWeight: 700, fontSize: "0.84rem", border: "none", cursor: savingTemplate ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "6px", boxShadow: "0 4px 12px rgba(180,83,9,0.25)" }}
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
        defaultCategory="hospital"
      />

      {/* Payment Receipt Lightbox */}
      {viewingReceipt && (
        <div
          onClick={() => setViewingReceipt(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(10, 25, 47, 0.85)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#ffffff", borderRadius: "10px", maxWidth: "800px", width: "100%", maxHeight: "90vh", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", display: "flex", flexDirection: "column" }}
          >
            <div style={{ padding: "1rem 1.25rem", background: "#0f172a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.95rem", fontWeight: 800 }}>
                <FileCheck size={18} color="#4ade80" />
                <div style={{ display: "flex", flexDirection: "column" }}><span>Uploaded Payment Receipt</span><span style={{ fontSize: "0.78rem", color: "#93c5fd", fontWeight: 600, marginTop: 2 }}>{viewingReceipt.name} · {viewingReceipt.appNo}</span></div>
              </div>
              <button type="button" onClick={() => setViewingReceipt(null)} style={{ background: "transparent", border: "none", color: "#cbd5e1", cursor: "pointer", padding: 4 }}>
                <X size={22} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", background: "#f8fafc" }}>
              {(viewingReceipt.url.match(/\.(jpeg|jpg|png|webp)($|\?)/i) || viewingReceipt.url.startsWith("data:image")) ? (
                <img src={viewingReceipt.url} alt={`Payment Receipt for ${viewingReceipt.name}`} style={{ width: "100%", maxHeight: "600px", objectFit: "contain", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 8 }} />
              ) : (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <FileText size={48} color="#2563eb" style={{ marginBottom: "1rem" }} />
                  <p style={{ fontWeight: 600, color: "#0f172a" }}>PDF or Document Receipt</p>
                  <a href={viewingReceipt.url} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "underline" }}>
                    Open in New Tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
