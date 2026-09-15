"use client";

import React, { useState, useMemo } from "react";
import {
  GraduationCap,
  Hospital,
  DollarSign,
  TrendingUp,
  Clock,
  Calendar,
  Filter,
  Search,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  CreditCard,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  Stethoscope,
  Activity,
  HeartPulse,
  Sparkles,
  BarChart3,
} from "lucide-react";

// ============================================================================
// DATA SETS FOR WEEKLY, MONTHLY, AND YEARLY TIMEFRAMES
// ============================================================================

const TIMEFRAME_DATA = {
  weekly: {
    kpis: {
      totalRevenue: "$24,850",
      revenueGrowth: "+18.4%",
      revenueIsUp: true,
      pendingRevenue: "$2,100",
      
      admissionInquiries: 38,
      admissionGrowth: "+12.5%",
      admissionIsUp: true,
      admissionConversion: "84% counseling rate",
      
      hospitalInquiries: 24,
      hospitalGrowth: "+15.2%",
      hospitalIsUp: true,
      hospitalUrgent: "6 urgent/emergency cases",
      
      totalSettledCount: 32,
      settledGrowth: "+9.8%",
      settledIsUp: true,
      successRate: "96.8% settlement",
    },
    chart: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      admission: [5, 8, 6, 9, 7, 12, 11],
      hospital: [3, 5, 4, 6, 5, 8, 7],
      revenue: [2800, 4200, 3100, 4900, 3800, 6200, 5800],
      maxInquiry: 15,
      maxRevenue: 7000,
    },
  },
  monthly: {
    kpis: {
      totalRevenue: "$98,400",
      revenueGrowth: "+22.6%",
      revenueIsUp: true,
      pendingRevenue: "$5,400",
      
      admissionInquiries: 156,
      admissionGrowth: "+16.8%",
      admissionIsUp: true,
      admissionConversion: "88% counseling rate",
      
      hospitalInquiries: 92,
      hospitalGrowth: "+19.4%",
      hospitalIsUp: true,
      hospitalUrgent: "21 urgent/emergency cases",
      
      totalSettledCount: 128,
      settledGrowth: "+14.1%",
      settledIsUp: true,
      successRate: "97.4% settlement",
    },
    chart: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      admission: [34, 42, 38, 48],
      hospital: [19, 24, 21, 28],
      revenue: [21500, 26800, 23400, 31200],
      maxInquiry: 55,
      maxRevenue: 35000,
    },
  },
  yearly: {
    kpis: {
      totalRevenue: "$1,184,500",
      revenueGrowth: "+34.2%",
      revenueIsUp: true,
      pendingRevenue: "$14,200",
      
      admissionInquiries: 1840,
      admissionGrowth: "+28.5%",
      admissionIsUp: true,
      admissionConversion: "91% conversion rate",
      
      hospitalInquiries: 1120,
      hospitalGrowth: "+31.0%",
      hospitalIsUp: true,
      hospitalUrgent: "240+ medical tours",
      
      totalSettledCount: 1540,
      settledGrowth: "+26.3%",
      settledIsUp: true,
      successRate: "98.2% settlement",
    },
    chart: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      admission: [110, 125, 140, 135, 160, 185, 195, 170, 165, 180, 210, 230],
      hospital: [65, 78, 85, 80, 95, 110, 115, 105, 98, 112, 128, 145],
      revenue: [68000, 79000, 88000, 84000, 102000, 118000, 124000, 108000, 104000, 115000, 134000, 158000],
      maxInquiry: 250,
      maxRevenue: 170000,
    },
  },
};

// Category Share Data
const HOSPITAL_SPECIALTIES = [
  { name: "Cardiology & Cardiac Surgery", share: 38, count: 425, color: "#ef4444" },
  { name: "Oncology & Cancer Care", share: 26, count: 291, color: "#8b5cf6" },
  { name: "Orthopedics & Joint Replacement", share: 18, count: 201, color: "#10b981" },
  { name: "Neurology & Spine Surgery", share: 12, count: 134, color: "#0ea5e9" },
  { name: "Organ Transplant & Specialized IVF", share: 6, count: 69, color: "#d4941e" },
];

const ADMISSION_DESTINATIONS = [
  { name: "United Kingdom (UK)", share: 35, count: 644, color: "#d4941e" },
  { name: "Canada", share: 25, count: 460, color: "#e11d48" },
  { name: "United States (USA)", share: 20, count: 368, color: "#3b82f6" },
  { name: "Australia", share: 12, count: 220, color: "#10b981" },
  { name: "Germany & Malaysia", share: 8, count: 148, color: "#6366f1" },
];

// Inquiries list (both Admission and Hospital)
const ALL_INQUIRIES = [
  {
    id: "INQ-9481",
    type: "hospital",
    name: "Mrs. Sufia Begum",
    contactPerson: "Dr. Kamal Hossain (Son)",
    email: "kamal.h@gmail.com",
    phone: "+880 1712-334455",
    institution: "Apollo Hospitals, Chennai",
    department: "Cardiology (Angioplasty & Valve Repair)",
    country: "India",
    urgency: "urgent",
    status: "Records Reviewed",
    date: "Today, 10:45 AM",
    doctorPreference: "Dr. Sengottuvelu (Interventional Cardiology)",
    notes: "Patient reports severe chest pain and breathlessness. ECG and Angiogram CD uploaded to coordinator. Teleconsultation recommended.",
  },
  {
    id: "INQ-9480",
    type: "admission",
    name: "Rahim Uddin",
    contactPerson: "Rahim Uddin (Self)",
    email: "rahim.u@gmail.com",
    phone: "+880 1711-234567",
    institution: "University of Toronto",
    department: "MSc Computer Science (AI Track)",
    country: "Canada",
    urgency: "normal",
    status: "Counseling",
    date: "Today, 09:30 AM",
    doctorPreference: "N/A — Fall 2026 Intake",
    notes: "CGPA 3.84/4.00, IELTS 7.5. Needs assistance with Statement of Purpose (SOP) and scholarship portfolio.",
  },
  {
    id: "INQ-9479",
    type: "hospital",
    name: "Kazi Nurul Islam",
    contactPerson: "Self",
    email: "nurul.islam@outlook.com",
    phone: "+880 1819-223344",
    institution: "Bumrungrad International Hospital",
    department: "Oncology (Precision Immunotherapy)",
    country: "Thailand",
    urgency: "urgent",
    status: "Teleconsult Scheduled",
    date: "Yesterday, 04:15 PM",
    doctorPreference: "Dr. Vichien Srimuninnimit",
    notes: "Second opinion required for Stage III Lymphoma protocol. Visa invitation request forwarded to Bangkok team.",
  },
  {
    id: "INQ-9478",
    type: "admission",
    name: "Sadia Karim",
    contactPerson: "Sadia Karim (Self)",
    email: "sadia.k@outlook.com",
    phone: "+880 1822-987654",
    institution: "Imperial College London",
    department: "BEng Mechanical Engineering",
    country: "UK",
    urgency: "normal",
    status: "In Review",
    date: "Yesterday, 02:00 PM",
    doctorPreference: "N/A — UCAS Ref: 198-442-10",
    notes: "A-Levels AAA* predicted. UCAS portal credentials synchronized. Interview preparation requested.",
  },
  {
    id: "INQ-9477",
    type: "hospital",
    name: "Shamim Reza",
    contactPerson: "Tariq Reza (Brother)",
    email: "shamim.reza@gmail.com",
    phone: "+880 1913-778899",
    institution: "Fortis Escorts Heart Institute",
    department: "Coronary Artery Bypass (CABG)",
    country: "India",
    urgency: "urgent",
    status: "Visa Issued",
    date: "Sep 12, 2026",
    doctorPreference: "Dr. Ashok Seth",
    notes: "Medical visa granted by High Commission. Hospital admission booked for September 16, 2026. Airport pickup arranged.",
  },
  {
    id: "INQ-9476",
    type: "admission",
    name: "Nusrat Jahan",
    contactPerson: "Self",
    email: "nusrat.j@gmail.com",
    phone: "+880 1933-456789",
    institution: "University of Melbourne",
    department: "Master of Data Science",
    country: "Australia",
    urgency: "normal",
    status: "Approved",
    date: "Sep 12, 2026",
    doctorPreference: "N/A — Feb 2027 Intake",
    notes: "Offer letter issued! Financial documentation currently under review for GTE verification and visa filing.",
  },
  {
    id: "INQ-9475",
    type: "hospital",
    name: "Farhana Yasmin",
    contactPerson: "Self",
    email: "farhana.y@gmail.com",
    phone: "+880 1614-556677",
    institution: "Mount Elizabeth Hospital",
    department: "Neurosurgery (Spinal Decompression)",
    country: "Singapore",
    urgency: "normal",
    status: "In Review",
    date: "Sep 11, 2026",
    doctorPreference: "Dr. Prem Kumar",
    notes: "MRI Lumbar spine scans submitted. Awaiting package cost estimation and doctor schedule confirmation.",
  },
  {
    id: "INQ-9474",
    type: "admission",
    name: "Tanvir Ahmed",
    contactPerson: "Self",
    email: "tanvir.a@yahoo.com",
    phone: "+880 1644-321098",
    institution: "NYU Stern School of Business",
    department: "Full-Time MBA Finance",
    country: "USA",
    urgency: "normal",
    status: "Visa Processing",
    date: "Sep 11, 2026",
    doctorPreference: "N/A — I-20 Approved",
    notes: "I-20 received with $25k merit fellowship. DS-160 filed. US Embassy Dhaka slot scheduled for October 4th.",
  },
  {
    id: "INQ-9473",
    type: "hospital",
    name: "Abdul Mannan",
    contactPerson: "Son (Mahmud Mannan)",
    email: "mannan.a@gmail.com",
    phone: "+880 1715-990011",
    institution: "Max Super Speciality Hospital, Delhi",
    department: "Orthopedics (Bilateral Knee Replacement)",
    country: "India",
    urgency: "normal",
    status: "Admitted",
    date: "Sep 10, 2026",
    doctorPreference: "Dr. SKS Marya",
    notes: "Surgery scheduled for Sep 14th. Post-op physiotherapy accommodation booked nearby hospital campus.",
  },
  {
    id: "INQ-9472",
    type: "admission",
    name: "Faisal Rahman",
    contactPerson: "Self",
    email: "faisal.r@gmail.com",
    phone: "+880 1755-678901",
    institution: "Technical University of Munich (TUM)",
    department: "MSc Robotics & Cognition",
    country: "Germany",
    urgency: "normal",
    status: "New",
    date: "Sep 10, 2026",
    doctorPreference: "N/A — English Track",
    notes: "BSc in EEE from BUET. Preliminary assessment passed. Translating academic transcripts to German standards.",
  },
];

// Recent Payments List
const RECENT_PAYMENTS = [
  {
    txnId: "TXN-90281",
    clientName: "Dr. Kamal Hossain",
    category: "hospital",
    serviceName: "Apollo Hospital Admission & Specialist Booking",
    amount: "$1,250",
    method: "Bank Transfer",
    status: "Completed",
    date: "Today, 11:20 AM",
  },
  {
    txnId: "TXN-90280",
    clientName: "Rahim Uddin",
    category: "admission",
    serviceName: "Univ. of Toronto Application Fee & Documentation",
    amount: "$450",
    method: "Credit Card",
    status: "Completed",
    date: "Today, 09:45 AM",
  },
  {
    txnId: "TXN-90279",
    clientName: "Kazi Nurul Islam",
    category: "hospital",
    serviceName: "Thailand Medical Visa & Bumrungrad Concierge",
    amount: "$350",
    method: "bKash",
    status: "Completed",
    date: "Yesterday, 04:15 PM",
  },
  {
    txnId: "TXN-90278",
    clientName: "Sadia Karim",
    category: "admission",
    serviceName: "UK Fast-Track CAS Processing & Enrollment Deposit",
    amount: "$800",
    method: "Stripe",
    status: "Completed",
    date: "Sep 12, 2026",
  },
  {
    txnId: "TXN-90277",
    clientName: "Shamim Reza",
    category: "hospital",
    serviceName: "Fortis Escorts Heart Package Advance Payment",
    amount: "$3,500",
    method: "Wire Transfer",
    status: "Pending",
    date: "Sep 11, 2026",
  },
  {
    txnId: "TXN-90276",
    clientName: "Tanvir Ahmed",
    category: "admission",
    serviceName: "USA SEVIS Fee & Visa Slot Appointment Service",
    amount: "$220",
    method: "Credit Card",
    status: "Completed",
    date: "Sep 10, 2026",
  },
];

export default function DashboardClient({ adminName = "Admin" }) {
  const [period, setPeriod] = useState("weekly"); // 'weekly' | 'monthly' | 'yearly'
  const [activeInquiryTab, setActiveInquiryTab] = useState("all"); // 'all' | 'admission' | 'hospital'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showAdmissionLine, setShowAdmissionLine] = useState(true);
  const [showHospitalLine, setShowHospitalLine] = useState(true);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [revenueHoverIndex, setRevenueHoverIndex] = useState(null);

  const currentData = TIMEFRAME_DATA[period];
  const { kpis, chart } = currentData;

  // Filter inquiries
  const filteredInquiries = useMemo(() => {
    return ALL_INQUIRIES.filter((item) => {
      const matchType = activeInquiryTab === "all" || item.type === activeInquiryTab;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.institution.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.country.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [activeInquiryTab, searchQuery]);

  // SVG Chart path calculation for smooth Bézier curve
  const svgWidth = 600;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  const pointsAdmission = useMemo(() => {
    return chart.admission.map((val, idx) => {
      const x = paddingX + (idx / (chart.admission.length - 1)) * plotWidth;
      const y = svgHeight - paddingY - (val / chart.maxInquiry) * plotHeight;
      return { x, y, val };
    });
  }, [chart, plotWidth, plotHeight]);

  const pointsHospital = useMemo(() => {
    return chart.hospital.map((val, idx) => {
      const x = paddingX + (idx / (chart.hospital.length - 1)) * plotWidth;
      const y = svgHeight - paddingY - (val / chart.maxInquiry) * plotHeight;
      return { x, y, val };
    });
  }, [chart, plotWidth, plotHeight]);

  // Create smooth curved SVG path
  const makeSmoothPath = (pts) => {
    if (pts.length === 0) return "";
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cpX = (curr.x + next.x) / 2;
      d += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const pathAdmission = useMemo(() => makeSmoothPath(pointsAdmission), [pointsAdmission]);
  const pathHospital = useMemo(() => makeSmoothPath(pointsHospital), [pointsHospital]);

  const areaAdmission = useMemo(() => {
    if (pointsAdmission.length === 0) return "";
    const last = pointsAdmission[pointsAdmission.length - 1];
    const first = pointsAdmission[0];
    return `${pathAdmission} L ${last.x} ${svgHeight - paddingY} L ${first.x} ${svgHeight - paddingY} Z`;
  }, [pathAdmission, pointsAdmission]);

  const areaHospital = useMemo(() => {
    if (pointsHospital.length === 0) return "";
    const last = pointsHospital[pointsHospital.length - 1];
    const first = pointsHospital[0];
    return `${pathHospital} L ${last.x} ${svgHeight - paddingY} L ${first.x} ${svgHeight - paddingY} Z`;
  }, [pathHospital, pointsHospital]);

  return (
    <>
      {/* Top Header & Timeframe Switcher */}
      <div className="msj-dash-page-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1>Executive Dashboard</h1>
            <span className="msj-live-pill">
              <span className="msj-live-dot" /> Live Metrics
            </span>
          </div>
          <p>
            Real-time analytics for <strong>Admission Inquiries</strong>, <strong>Hospital Inquiries</strong>, and <strong>Payments / Revenue</strong>.
          </p>
        </div>

        {/* Weekly / Monthly / Yearly Filter Controls */}
        <div className="msj-dash-header-actions">
          <div className="msj-period-switcher" role="group" aria-label="Timeframe Selection">
            <button
              type="button"
              className={`msj-period-btn ${period === "weekly" ? "active" : ""}`}
              onClick={() => setPeriod("weekly")}
            >
              Weekly
            </button>
            <button
              type="button"
              className={`msj-period-btn ${period === "monthly" ? "active" : ""}`}
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`msj-period-btn ${period === "yearly" ? "active" : ""}`}
              onClick={() => setPeriod("yearly")}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="msj-dash-stats-grid" style={{ marginBottom: "1.75rem" }}>
        {/* Total Revenue */}
        <div className="msj-stat-card-advanced revenue">
          <div className="msj-stat-top">
            <div className="msj-stat-icon-wrapper sky">
              <DollarSign size={24} />
            </div>
            <span className={`msj-trend-badge ${kpis.revenueIsUp ? "up" : "down"}`}>
              {kpis.revenueIsUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {kpis.revenueGrowth}
            </span>
          </div>
          <div className="msj-stat-main-value">{kpis.totalRevenue}</div>
          <div className="msj-stat-main-label">Total Revenue Collected ({period})</div>
          <div className="msj-stat-subtext-bar">
            <span>Pending settlement:</span>
            <strong>{kpis.pendingRevenue}</strong>
          </div>
        </div>

        {/* Admission Inquiries */}
        <div className="msj-stat-card-advanced admission">
          <div className="msj-stat-top">
            <div className="msj-stat-icon-wrapper gold">
              <GraduationCap size={24} />
            </div>
            <span className={`msj-trend-badge ${kpis.admissionIsUp ? "up" : "down"}`}>
              {kpis.admissionIsUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {kpis.admissionGrowth}
            </span>
          </div>
          <div className="msj-stat-main-value">{kpis.admissionInquiries}</div>
          <div className="msj-stat-main-label">Admission Inquiries ({period})</div>
          <div className="msj-stat-subtext-bar">
            <span>Conversion benchmark:</span>
            <strong style={{ color: "#d4941e" }}>{kpis.admissionConversion}</strong>
          </div>
        </div>

        {/* Hospital Inquiries */}
        <div className="msj-stat-card-advanced hospital">
          <div className="msj-stat-top">
            <div className="msj-stat-icon-wrapper emerald">
              <Hospital size={24} />
            </div>
            <span className={`msj-trend-badge ${kpis.hospitalIsUp ? "up" : "down"}`}>
              {kpis.hospitalIsUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {kpis.hospitalGrowth}
            </span>
          </div>
          <div className="msj-stat-main-value">{kpis.hospitalInquiries}</div>
          <div className="msj-stat-main-label">Hospital / Medical Inquiries ({period})</div>
          <div className="msj-stat-subtext-bar">
            <span>Clinical urgency:</span>
            <strong style={{ color: "#059669" }}>{kpis.hospitalUrgent}</strong>
          </div>
        </div>

        {/* Total Settled Cases */}
        <div className="msj-stat-card-advanced total">
          <div className="msj-stat-top">
            <div className="msj-stat-icon-wrapper indigo">
              <CreditCard size={24} />
            </div>
            <span className={`msj-trend-badge ${kpis.settledIsUp ? "up" : "down"}`}>
              {kpis.settledIsUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {kpis.settledGrowth}
            </span>
          </div>
          <div className="msj-stat-main-value">{kpis.totalSettledCount}</div>
          <div className="msj-stat-main-label">Settled Inquiries & Payments</div>
          <div className="msj-stat-subtext-bar">
            <span>Overall fulfillment:</span>
            <strong style={{ color: "#6366f1" }}>{kpis.successRate}</strong>
          </div>
        </div>
      </div>

      {/* Interactive Charts Grid */}
      <div className="msj-dash-charts-grid">
        {/* Chart 1: Inquiries Trend (Admission vs Hospital) */}
        <div className="msj-chart-card">
          <div className="msj-chart-header">
            <div>
              <div className="msj-chart-title">
                <Activity size={18} color="var(--msj-navy)" />
                Inquiry Trends: Admission vs. Hospital
              </div>
              <div className="msj-chart-subtitle">
                Comparing inbound student admissions and medical inquiries ({period})
              </div>
            </div>

            {/* Toggleable Legends */}
            <div className="msj-chart-legends">
              <div
                className="msj-chart-legend-item"
                style={{ opacity: showAdmissionLine ? 1 : 0.4 }}
                onClick={() => setShowAdmissionLine((prev) => !prev)}
                title="Click to toggle"
              >
                <span className="msj-chart-legend-dot" style={{ background: "#d4941e" }} />
                <span>🎓 Admission</span>
              </div>
              <div
                className="msj-chart-legend-item"
                style={{ opacity: showHospitalLine ? 1 : 0.4 }}
                onClick={() => setShowHospitalLine((prev) => !prev)}
                title="Click to toggle"
              >
                <span className="msj-chart-legend-dot" style={{ background: "#10b981" }} />
                <span>🏥 Hospital</span>
              </div>
            </div>
          </div>

          {/* SVG Multi-Line Chart */}
          <div className="msj-chart-svg-container">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="msj-chart-svg"
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id="admissionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4941e" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#d4941e" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="hospitalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = svgHeight - paddingY - ratio * plotHeight;
                const valueLabel = Math.round(ratio * chart.maxInquiry);
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      className="msj-chart-grid-line"
                    />
                    <text x={paddingX - 8} y={y + 3} textAnchor="end" className="msj-chart-axis-label">
                      {valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* Area Fills */}
              {showAdmissionLine && <path d={areaAdmission} fill="url(#admissionGrad)" />}
              {showHospitalLine && <path d={areaHospital} fill="url(#hospitalGrad)" />}

              {/* Lines */}
              {showAdmissionLine && (
                <path
                  d={pathAdmission}
                  fill="none"
                  stroke="#d4941e"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}
              {showHospitalLine && (
                <path
                  d={pathHospital}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* X Axis Labels */}
              {chart.labels.map((lbl, idx) => {
                const x = paddingX + (idx / (chart.labels.length - 1)) * plotWidth;
                return (
                  <text
                    key={idx}
                    x={x}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    className="msj-chart-axis-label"
                  >
                    {lbl}
                  </text>
                );
              })}

              {/* Interactive Cursor line & hover triggers */}
              {chart.labels.map((lbl, idx) => {
                const x = paddingX + (idx / (chart.labels.length - 1)) * plotWidth;
                const adm = pointsAdmission[idx];
                const hosp = pointsHospital[idx];
                const isHovered = hoverIndex === idx;

                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoverIndex(idx)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Transparent hover hit column */}
                    <rect
                      x={x - 20}
                      y={0}
                      width={40}
                      height={svgHeight}
                      fill="transparent"
                    />

                    {isHovered && (
                      <>
                        <line
                          x1={x}
                          y1={paddingY}
                          x2={x}
                          y2={svgHeight - paddingY}
                          stroke="#0a1d37"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                        />
                        {showAdmissionLine && (
                          <circle
                            cx={adm.x}
                            cy={adm.y}
                            r="5"
                            fill="#ffffff"
                            stroke="#d4941e"
                            strokeWidth="3"
                          />
                        )}
                        {showHospitalLine && (
                          <circle
                            cx={hosp.x}
                            cy={hosp.y}
                            r="5"
                            fill="#ffffff"
                            stroke="#10b981"
                            strokeWidth="3"
                          />
                        )}
                      </>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoverIndex !== null && (
              <div
                className="msj-chart-tooltip-box"
                style={{
                  left: `${(pointsAdmission[hoverIndex].x / svgWidth) * 100}%`,
                  top: "28%",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 4, color: "#f3ba42" }}>
                  {chart.labels[hoverIndex]}
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span>🎓 Admissions: <strong>{chart.admission[hoverIndex]}</strong></span>
                  <span>🏥 Hospital: <strong>{chart.hospital[hoverIndex]}</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Revenue & Cash Flow Bar Graph */}
        <div className="msj-chart-card">
          <div className="msj-chart-header">
            <div>
              <div className="msj-chart-title">
                <BarChart3 size={18} color="var(--msj-navy)" />
                Revenue & Cash Flow
              </div>
              <div className="msj-chart-subtitle">
                Total earnings collected across all consultancy services
              </div>
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0284c7" }}>
              {kpis.totalRevenue}
            </div>
          </div>

          <div className="msj-chart-svg-container">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="msj-chart-svg"
              onMouseLeave={() => setRevenueHoverIndex(null)}
            >
              <defs>
                <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 0.33, 0.66, 1].map((ratio, i) => {
                const y = svgHeight - paddingY - ratio * plotHeight;
                const valueLabel = `$${Math.round((ratio * chart.maxRevenue) / 1000)}k`;
                return (
                  <g key={i}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={svgWidth - paddingX}
                      y2={y}
                      className="msj-chart-grid-line"
                    />
                    <text x={paddingX - 8} y={y + 3} textAnchor="end" className="msj-chart-axis-label">
                      {valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {chart.revenue.map((val, idx) => {
                const numBars = chart.revenue.length;
                const step = plotWidth / numBars;
                const barWidth = Math.min(32, step * 0.55);
                const x = paddingX + idx * step + (step - barWidth) / 2;
                const barHeight = (val / chart.maxRevenue) * plotHeight;
                const y = svgHeight - paddingY - barHeight;
                const isHovered = revenueHoverIndex === idx;

                return (
                  <g
                    key={idx}
                    className="msj-chart-interactive-group"
                    onMouseEnter={() => setRevenueHoverIndex(idx)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      rx="6"
                      fill="url(#revBarGrad)"
                      className="msj-chart-bar-rect"
                      opacity={isHovered ? 1 : 0.88}
                    />
                    <text
                      x={x + barWidth / 2}
                      y={svgHeight - 6}
                      textAnchor="middle"
                      className="msj-chart-axis-label"
                    >
                      {chart.labels[idx]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {revenueHoverIndex !== null && (
              <div
                className="msj-chart-tooltip-box"
                style={{
                  left: `${((paddingX + revenueHoverIndex * (plotWidth / chart.revenue.length) + (plotWidth / chart.revenue.length) / 2) / svgWidth) * 100}%`,
                  top: "28%",
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 2, color: "#38bdf8" }}>
                  {chart.labels[revenueHoverIndex]}
                </div>
                <div>Revenue: <strong>${chart.revenue[revenueHoverIndex].toLocaleString()}</strong></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Distribution Cards: Top Hospital Specialties & Top Study Abroad Destinations */}
      <div className="msj-dash-charts-grid" style={{ marginBottom: "1.75rem" }}>
        {/* Hospital Specialties Breakdown */}
        <div className="msj-chart-card">
          <div className="msj-chart-header">
            <div>
              <div className="msj-chart-title">
                <HeartPulse size={18} color="#059669" />
                Hospital Inquiries by Medical Department
              </div>
              <div className="msj-chart-subtitle">
                Most requested treatment sectors across partner hospitals (Apollo, Bumrungrad, Fortis)
              </div>
            </div>
            <span className="msj-badge-type msj-badge-hospital">🏥 Medical Tourism</span>
          </div>

          <div className="msj-progress-list">
            {HOSPITAL_SPECIALTIES.map((item, idx) => (
              <div key={idx} className="msj-progress-item">
                <div className="msj-progress-meta">
                  <span className="msj-progress-label">
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                    {item.name}
                  </span>
                  <span className="msj-progress-val">{item.share}% ({item.count} inquiries)</span>
                </div>
                <div className="msj-progress-track">
                  <div
                    className="msj-progress-fill"
                    style={{ width: `${item.share}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admission Destinations Breakdown */}
        <div className="msj-chart-card">
          <div className="msj-chart-header">
            <div>
              <div className="msj-chart-title">
                <GraduationCap size={18} color="#d4941e" />
                Admission Inquiries by Destination
              </div>
              <div className="msj-chart-subtitle">
                Top student preferences for higher education and university placements
              </div>
            </div>
            <span className="msj-badge-type msj-badge-admission">🎓 Higher Education</span>
          </div>

          <div className="msj-progress-list">
            {ADMISSION_DESTINATIONS.map((item, idx) => (
              <div key={idx} className="msj-progress-item">
                <div className="msj-progress-meta">
                  <span className="msj-progress-label">
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color }} />
                    {item.name}
                  </span>
                  <span className="msj-progress-val">{item.share}% ({item.count} students)</span>
                </div>
                <div className="msj-progress-track">
                  <div
                    className="msj-progress-fill"
                    style={{ width: `${item.share}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comprehensive Inquiries Feed (Admission & Hospital) */}
      <div className="msj-dash-panel" style={{ marginBottom: "1.75rem" }}>
        <div className="msj-dash-panel-header">
          <div>
            <h2>Inquiry Management Hub</h2>
            <p style={{ fontSize: "0.82rem", color: "var(--msj-text-muted)", marginTop: 2 }}>
              Browse and review all incoming hospital and admission consultation inquiries.
            </p>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="msj-table-controls">
          <div className="msj-inquiry-tabs">
            <button
              type="button"
              className={`msj-inquiry-tab ${activeInquiryTab === "all" ? "active" : ""}`}
              onClick={() => setActiveInquiryTab("all")}
            >
              All Inquiries ({ALL_INQUIRIES.length})
            </button>
            <button
              type="button"
              className={`msj-inquiry-tab ${activeInquiryTab === "admission" ? "active" : ""}`}
              onClick={() => setActiveInquiryTab("admission")}
            >
              🎓 Admission ({ALL_INQUIRIES.filter((x) => x.type === "admission").length})
            </button>
            <button
              type="button"
              className={`msj-inquiry-tab ${activeInquiryTab === "hospital" ? "active" : ""}`}
              onClick={() => setActiveInquiryTab("hospital")}
            >
              🏥 Hospital ({ALL_INQUIRIES.filter((x) => x.type === "hospital").length})
            </button>
          </div>

          <div className="msj-table-search-box">
            <Search size={16} color="var(--msj-text-muted)" />
            <input
              type="text"
              placeholder="Search by name, hospital, university, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="msj-dash-table-wrap">
          <table className="msj-dash-table">
            <thead>
              <tr>
                <th>Applicant / Patient</th>
                <th>Category</th>
                <th>Target Institution / Department</th>
                <th>Destination</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem", color: "var(--msj-text-muted)" }}>
                    No inquiries match your current filter.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((row) => {
                  const isHospital = row.type === "hospital";
                  const isUrgent = row.urgency === "urgent";

                  return (
                    <tr key={row.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "50%",
                              background: isHospital ? "rgba(16, 185, 129, 0.12)" : "rgba(212, 148, 30, 0.12)",
                              color: isHospital ? "#059669" : "#d4941e",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "0.85rem",
                              flexShrink: 0,
                            }}
                          >
                            {row.name.charAt(0)}
                          </div>
                          <div>
                            <div className="msj-dash-table-name">{row.name}</div>
                            <div style={{ fontSize: "0.76rem", color: "var(--msj-text-muted)" }}>
                              {row.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`msj-badge-type ${isHospital ? "msj-badge-hospital" : "msj-badge-admission"}`}>
                          {isHospital ? <Stethoscope size={13} /> : <GraduationCap size={13} />}
                          {isHospital ? "Hospital" : "Admission"}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--msj-navy)" }}>{row.institution}</div>
                        <div style={{ fontSize: "0.76rem", color: "var(--msj-text-muted)" }}>{row.department}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: "var(--msj-text-secondary)" }}>
                          {row.country}
                        </span>
                      </td>
                      <td>
                        <span className={isUrgent ? "msj-badge-urgency-urgent" : "msj-badge-urgency-normal"}>
                          {isUrgent ? "Urgent" : "Normal"}
                        </span>
                      </td>
                      <td>
                        <span className="msj-dash-badge msj-dash-badge-approved">
                          {row.status}
                        </span>
                      </td>
                      <td className="msj-dash-table-date">{row.date}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="msj-table-action-btn"
                          onClick={() => setSelectedInquiry(row)}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payments & Transactions Feed */}
      <div className="msj-dash-panel">
        <div className="msj-dash-panel-header">
          <div>
            <h2>Payments & Financial Transactions</h2>
            <p style={{ fontSize: "0.82rem", color: "var(--msj-text-muted)", marginTop: 2 }}>
              Recent consultancy bookings, hospital advance settlements, and university fee payments.
            </p>
          </div>
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--msj-gold)" }}>
            Total Volume: {kpis.totalRevenue}
          </span>
        </div>

        <div className="msj-dash-table-wrap">
          <table className="msj-dash-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Client / Payer</th>
                <th>Category</th>
                <th>Service Description</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_PAYMENTS.map((txn) => {
                const isHospital = txn.category === "hospital";
                const isCompleted = txn.status === "Completed";

                return (
                  <tr key={txn.txnId}>
                    <td>
                      <code style={{ fontSize: "0.82rem", background: "#f1f5f9", padding: "2px 6px", borderRadius: 4, color: "var(--msj-navy)" }}>
                        {txn.txnId}
                      </code>
                    </td>
                    <td className="msj-dash-table-name">{txn.clientName}</td>
                    <td>
                      <span className={`msj-badge-type ${isHospital ? "msj-badge-hospital" : "msj-badge-admission"}`}>
                        {isHospital ? <Hospital size={12} /> : <GraduationCap size={12} />}
                        {isHospital ? "Hospital" : "Admission"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.84rem", color: "var(--msj-text-secondary)" }}>
                        {txn.serviceName}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--msj-navy)" }}>
                        {txn.amount}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", background: "#f8fafc", padding: "3px 8px", borderRadius: 5, border: "1px solid #e2e8f0" }}>
                        {txn.method}
                      </span>
                    </td>
                    <td>
                      <span className={`msj-dash-badge ${isCompleted ? "msj-dash-badge-approved" : "msj-dash-badge-pending"}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="msj-dash-table-date">{txn.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="msj-modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="msj-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="msj-modal-header">
              <h3>
                {selectedInquiry.type === "hospital" ? (
                  <Hospital size={20} color="#059669" />
                ) : (
                  <GraduationCap size={20} color="#d4941e" />
                )}
                Inquiry Details: {selectedInquiry.id}
              </h3>
              <button
                type="button"
                className="msj-modal-close-btn"
                onClick={() => setSelectedInquiry(null)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="msj-modal-body">
              {/* Profile Top Banner */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--msj-bg)", padding: "1rem", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: selectedInquiry.type === "hospital" ? "#059669" : "#d4941e",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      fontWeight: 800,
                    }}
                  >
                    {selectedInquiry.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--msj-navy)" }}>
                      {selectedInquiry.name}
                    </h4>
                    <span style={{ fontSize: "0.82rem", color: "var(--msj-text-muted)" }}>
                      Contact: {selectedInquiry.contactPerson}
                    </span>
                  </div>
                </div>

                <span className={`msj-badge-type ${selectedInquiry.type === "hospital" ? "msj-badge-hospital" : "msj-badge-admission"}`}>
                  {selectedInquiry.type === "hospital" ? "🏥 Hospital Inquiry" : "🎓 Admission Inquiry"}
                </span>
              </div>

              {/* Grid details */}
              <div className="msj-detail-grid">
                <div className="msj-detail-field">
                  <span className="msj-detail-label">Target Institution</span>
                  <span className="msj-detail-value">{selectedInquiry.institution}</span>
                </div>
                <div className="msj-detail-field">
                  <span className="msj-detail-label">
                    {selectedInquiry.type === "hospital" ? "Medical Department" : "Academic Program"}
                  </span>
                  <span className="msj-detail-value">{selectedInquiry.department}</span>
                </div>
                <div className="msj-detail-field">
                  <span className="msj-detail-label">Destination Country</span>
                  <span className="msj-detail-value">{selectedInquiry.country}</span>
                </div>
                <div className="msj-detail-field">
                  <span className="msj-detail-label">Priority / Urgency</span>
                  <span className="msj-detail-value" style={{ textTransform: "capitalize" }}>
                    {selectedInquiry.urgency}
                  </span>
                </div>
                <div className="msj-detail-field">
                  <span className="msj-detail-label">Phone Number</span>
                  <span className="msj-detail-value">{selectedInquiry.phone}</span>
                </div>
                <div className="msj-detail-field">
                  <span className="msj-detail-label">Email Address</span>
                  <span className="msj-detail-value">{selectedInquiry.email}</span>
                </div>
                <div className="msj-detail-field">
                  <span className="msj-detail-label">Current Status</span>
                  <span className="msj-detail-value" style={{ color: "#059669" }}>
                    {selectedInquiry.status}
                  </span>
                </div>
                <div className="msj-detail-field">
                  <span className="msj-detail-label">Submission Date</span>
                  <span className="msj-detail-value">{selectedInquiry.date}</span>
                </div>
              </div>

              {/* Doctor / Intake Preference */}
              <div className="msj-detail-field">
                <span className="msj-detail-label">Specialist / Intake Details</span>
                <span className="msj-detail-value">{selectedInquiry.doctorPreference}</span>
              </div>

              {/* Counselor / Clinical Notes */}
              <div className="msj-detail-field" style={{ background: "#fffdfa", borderColor: "#fde68a" }}>
                <span className="msj-detail-label" style={{ color: "#92400e" }}>
                  Clinical / Counseling Case Notes
                </span>
                <p style={{ fontSize: "0.86rem", color: "#78350f", lineHeight: 1.5, marginTop: 4 }}>
                  {selectedInquiry.notes}
                </p>
              </div>
            </div>

            <div className="msj-modal-footer">
              <button
                type="button"
                className="msj-period-btn"
                style={{ background: "#e2e8f0", color: "var(--msj-navy)" }}
                onClick={() => setSelectedInquiry(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="msj-period-btn"
                style={{ background: "var(--msj-navy)", color: "#ffffff" }}
                onClick={() => {
                  alert(`Status notification triggered for ${selectedInquiry.name}`);
                  setSelectedInquiry(null);
                }}
              >
                Contact Client / Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
