import React from "react";
import { Users } from "lucide-react";

export const metadata = {
  title: "Students | MSJ Admin",
};

export default function StudentsPage() {
  return (
    <>
      <div className="msj-dash-page-header">
        <h1>Students</h1>
        <p>Manage student registrations, profiles, and application statuses.</p>
      </div>

      <div className="msj-dash-panel" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
        <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "50%", background: "#f0f4f8", color: "var(--msj-navy)", marginBottom: "1rem" }}>
          <Users size={36} />
        </div>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Students Management</h2>
        <p style={{ color: "var(--msj-text-muted)", maxWidth: 460, margin: "0 auto" }}>
          The full student directory and profile management module is coming soon.
        </p>
      </div>
    </>
  );
}
