"use client";

import React from "react";
import {
  GraduationCap,
  Building2,
  HeartPulse,
  ShieldCheck,
  Award,
} from "lucide-react";

export default function MetricsMarquee() {
  // 6 Prestigious Academic & Healthcare Metrics (Strictly non-visa)
  const metrics = [
    {
      id: "students",
      value: "5,000",
      suffix: "+",
      label: "Students Placed",
      hasAvatars: true,
    },
    {
      id: "colleges",
      value: "120",
      suffix: "+",
      label: "Partner Colleges",
      icon: <Building2 size={18} className="msj-stat-icon-gold" />,
    },
    {
      id: "hospitals",
      value: "45",
      suffix: "+",
      label: "Affiliated Hospitals",
      icon: <HeartPulse size={18} className="msj-stat-icon-gold" />,
    },
    {
      id: "clinical",
      value: "100",
      suffix: "%",
      label: "Clinical Training",
      icon: <ShieldCheck size={18} className="msj-stat-icon-gold" />,
    },
    {
      id: "experience",
      value: "12",
      suffix: "+",
      label: "Years Excellence",
      icon: <Award size={18} className="msj-stat-icon-gold" />,
    },
    {
      id: "success",
      value: "99.2",
      suffix: "%",
      label: "Admission Success",
      icon: <GraduationCap size={18} className="msj-stat-icon-gold" />,
    },
  ];

  return (
    <section className="msj-metrics-slim-bar" id="metrics-strip">
      <div className="msj-metrics-slim-container">
        {metrics.map((item, idx) => (
          <React.Fragment key={item.id}>
            <div className="msj-stat-pill">
              {item.hasAvatars ? (
                <div className="msj-stat-avatar-stack" title="5,000+ Verified Students Placed">
                  <img src="/student-avatar-1.jpg" alt="Student" className="msj-stat-avatar" />
                  <img src="/student-avatar-2.jpg" alt="Student" className="msj-stat-avatar" />
                  <img src="/student-avatar-3.jpg" alt="Student" className="msj-stat-avatar" />
                  <div className="msj-stat-avatar-plus">+</div>
                </div>
              ) : (
                <div className="msj-stat-icon-wrap">
                  {item.icon}
                </div>
              )}

              <div className="msj-stat-text-col">
                <div className="msj-stat-val-row">
                  <span className="msj-stat-number">{item.value}</span>
                  <span className="msj-stat-plus">{item.suffix}</span>
                </div>
                <span className="msj-stat-label">{item.label}</span>
              </div>
            </div>

            {/* Vertical Divider between items (hidden after last item) */}
            {idx < metrics.length - 1 && (
              <div className="msj-stat-divider" />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
