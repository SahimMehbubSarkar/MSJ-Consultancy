import React from "react";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Applications | MSJ Admin",
};

export default function ApplicationsPage() {
  return (
    <>
      <div className="msj-dash-page-header">
        <h1>Applications</h1>
        <p>Review, filter, and process student admission applications.</p>
      </div>

      <div className="msj-dash-panel" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
        <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", background: "#f0f4f8", color: "var(--msj-navy)", marginBottom: "1rem" }}>
          <FileText size={36} />
        </div>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Applications Processing</h2>
        <p style={{ color: "var(--msj-text-muted)", maxWidth: 460, margin: "0 auto" }}>
          The applications management workflow and document verification module is coming soon.
        </p>
      </div>
    </>
  );
}
