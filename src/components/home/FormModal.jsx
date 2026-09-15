"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import HospitalRequirementForm from "./HospitalRequirementForm";
import AdmissionRequirementForm from "./AdmissionRequirementForm";

export default function FormModal({ formType, onClose }) {
  useEffect(() => {
    if (formType) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [formType]);

  if (!formType) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        background: "rgba(10, 29, 55, 0.75)",
        backdropFilter: "blur(6px)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 960,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#ffffff",
          borderRadius: 16,
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
          border: "1px solid rgba(212,148,30,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.95)",
            border: "1px solid #e2e8f0",
            cursor: "pointer",
            color: "#0f172a",
          }}
          aria-label="Close form"
        >
          <X size={20} />
        </button>

        {formType === "hospital" ? (
          <HospitalRequirementForm />
        ) : (
          <AdmissionRequirementForm />
        )}
      </div>
    </div>,
    document.body
  );
}
