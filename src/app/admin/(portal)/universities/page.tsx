import React from "react";
import { GraduationCap } from "lucide-react";

export const metadata = {
  title: "Universities | MSJ Admin",
};

export default function UniversitiesPage() {
  return (
    <>
      <div className="msj-dash-page-header">
        <h1>Partner Universities</h1>
        <p>Explore and manage university partnerships and program listings.</p>
      </div>

      <div className="msj-dash-panel" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
        <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", background: "#fdf8ee", color: "var(--msj-gold)", marginBottom: "1rem" }}>
          <GraduationCap size={36} />
        </div>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>University Directory</h2>
        <p style={{ color: "var(--msj-text-muted)", maxWidth: 460, margin: "0 auto" }}>
          The university partnership directory and course management module is coming soon.
        </p>
      </div>
    </>
  );
}
