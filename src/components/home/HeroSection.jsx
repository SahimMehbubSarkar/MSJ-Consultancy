"use client";

import React from "react";
import {
  GraduationCap,
  HeartPulse,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  Building2,
  Award,
  BookOpen,
  UserCheck,
} from "lucide-react";

export default function HeroSection({ onSelectTab }) {
  const [showSticky, setShowSticky] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const formsElem = document.getElementById("forms-section");
      if (scrollY > 380) {
        if (formsElem) {
          const formsTop = formsElem.offsetTop;
          if (scrollY >= formsTop - 250) {
            setShowSticky(false);
            return;
          }
        }
        setShowSticky(true);
      } else {
        setShowSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToForm = (tabType) => {
    if (onSelectTab) {
      onSelectTab(tabType);
    }
    const section = document.getElementById("forms-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="msj-hero-fullscreen" id="hero">
      {/* Full-bleed Background Image of World-Class Academic Medical Campus */}
      <img
        src="/medical-campus.jpg"
        alt="MSJ International University Medical College and Academic Health Science Center"
        className="msj-hero-bg-photo"
      />

      {/* Navy & Gold Ambient Scrim Gradient */}
      <div className="msj-hero-scrim" />

      {/* Hero Content Layer */}
      <div className="msj-hero-container">
        <div className="msj-hero-split">
          {/* Left Column: Prestigious Text & Actions */}
          <div className="msj-hero-left">
            <div className="msj-hero-badge-dark">
              <span className="msj-hero-badge-dot" />
              <span className="msj-hero-badge-text">OFFICIAL GATEWAY • NURSING, HIGHER ED &amp; OVERSEAS HEALTHCARE</span>
            </div>

            <h1 className="msj-hero-title-dark">
              Your Trusted Gateway to{" "}
              <span className="msj-hero-gold-text">Global Education</span> &amp;{" "}
              <span className="msj-hero-gold-text">World-Class Care</span>
            </h1>

            <p className="msj-hero-desc-dark">
              MSJ Consultancy empowers aspiring scholars to secure admissions in BSc &amp; MSc Nursing,
              MBBS, and top global university programs with guaranteed hospital clinical training,
              merit scholarships, and comprehensive visa assistance.
            </p>

            {/* Interactive CTA Buttons - Plan 3: Dual VIP Application Pass Cards */}
            <div className="msj-hero-cta-group">
              <div className="msj-vip-pass-row">
                {/* Pass 1: Overseas Hospital Gateway Pass */}
                <button
                  type="button"
                  className="msj-vip-pass-card hospital-pass"
                  id="hero-hospital-consult-btn"
                  onClick={() => handleScrollToForm("hospital")}
                >
                  <div className="msj-pass-shimmer" />

                  {/* Pass Header Stripe */}
                  <div className="msj-pass-header">
                    <div className="msj-pass-status-pill blue">
                      <span className="msj-pass-live-dot blue" />
                      <span>DIRECT TIE-UPS VERIFIED</span>
                    </div>
                    <div className="msj-pass-badge blue">
                      <Building2 size={11} style={{ marginRight: 3 }} />
                      <span>CLINICAL PARTNER</span>
                    </div>
                  </div>

                  {/* Pass Body Content */}
                  <div className="msj-pass-body">
                    <div className="msj-pass-icon-box blue">
                      <UserCheck size={22} />
                    </div>
                    <div className="msj-pass-info">
                      <div className="msj-pass-title">
                        Hospital Hiring &amp; Job Application
                      </div>
                      <div className="msj-pass-sub">
                        💼 Clinical Staff Recruitment &amp; Tie-ups
                      </div>
                    </div>

                    {/* Perforated Stub / Action Trigger */}
                    <div className="msj-pass-stub">
                      <div className="msj-pass-stub-line" />
                      <div className="msj-pass-action-circle blue">
                        <ArrowRight size={17} className="msj-pass-arrow" />
                      </div>
                    </div>
                  </div>
                </button>

                {/* Pass 2: Student Admission Gateway Pass */}
                <button
                  type="button"
                  className="msj-vip-pass-card admission-pass"
                  id="hero-apply-admission-btn"
                  onClick={() => handleScrollToForm("admission")}
                >
                  <div className="msj-pass-shimmer" />

                  {/* Pass Header Stripe */}
                  <div className="msj-pass-header">
                    <div className="msj-pass-status-pill green">
                      <span className="msj-pass-live-dot green" />
                      <span>INTAKE 2026-27 ACTIVE</span>
                    </div>
                    <div className="msj-pass-badge gold">
                      <Sparkles size={11} style={{ marginRight: 3 }} />
                      <span>OFFICIAL GATEWAY</span>
                    </div>
                  </div>

                  {/* Pass Body Content */}
                  <div className="msj-pass-body">
                    <div className="msj-pass-icon-box gold">
                      <GraduationCap size={22} />
                    </div>
                    <div className="msj-pass-info">
                      <div className="msj-pass-title">
                        Student Admission Form
                      </div>
                      <div className="msj-pass-sub">
                        ⚡ Fast-Track Application • 2 Min Easy Process
                      </div>
                    </div>

                    {/* Perforated Stub / Action Trigger */}
                    <div className="msj-pass-stub">
                      <div className="msj-pass-stub-line" />
                      <div className="msj-pass-action-circle gold">
                        <ArrowRight size={17} className="msj-pass-arrow" />
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Glassmorphic Badges over the full image */}
          <div className="msj-hero-right-floats">
            {/* Float 1: Nursing Admissions */}
            <div className="msj-glass-floating-card top" onClick={() => handleScrollToForm("admission")}>
              <div className="msj-glass-icon-gold">
                <Stethoscope size={22} />
              </div>
              <div>
                <div className="msj-glass-card-title">BSc &amp; MSc Nursing Admissions</div>
                <div className="msj-glass-card-desc">2026-27 Intake Open • Direct University Enrolment</div>
              </div>
              <span className="msj-glass-tag">Open</span>
            </div>

            {/* Float 2: Hospital Affiliations */}
            <div className="msj-glass-floating-card mid" onClick={() => handleScrollToForm("hospital")}>
              <div className="msj-glass-icon-navy">
                <Building2 size={22} />
              </div>
              <div>
                <div className="msj-glass-card-title">Direct Hospital Clinical Training</div>
                <div className="msj-glass-card-desc">Apollo • Fortis • Max • Bumrungrad International</div>
              </div>
              <span className="msj-glass-tag-gold">Certified</span>
            </div>

            {/* Float 3: Internship & Placement */}
            <div className="msj-glass-floating-card bot">
              <div className="msj-glass-icon-green">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="msj-glass-card-title">100% Practical Internship &amp; Placement</div>
                <div className="msj-glass-card-desc">Govt &amp; University Approved • Direct Hospital Clinical Rotations</div>
              </div>
              <span className="msj-glass-tag-green">100% Assured</span>
            </div>

            {/* Float 4: 12+ Years of Trusted Educational Excellence */}
            <div className="msj-glass-floating-card fourth">
              <div className="msj-glass-icon-amber">
                <Award size={22} />
              </div>
              <div>
                <div className="msj-glass-card-title">12+ Years of Trusted Guidance</div>
                <div className="msj-glass-card-desc">Estd. 2014 • 5,000+ Students Mentored • Ethical Admissions</div>
              </div>
              <span className="msj-glass-tag-gold">12+ Yrs Estd</span>
            </div>
          </div>
        </div>
      </div>


      {/* Mobile-Only Sticky Floating CTA Bar (Appears when scrolling down on mobile) */}
      <div className={`msj-mobile-bottom-sticky ${showSticky ? "is-visible" : ""}`}>
        <button
          type="button"
          className="msj-sticky-apply-btn"
          onClick={() => handleScrollToForm("admission")}
        >
          <div className="msj-sticky-btn-left">
            <span className="msj-sticky-live-dot" />
            <span className="msj-sticky-title">Intake Open 2026-27</span>
          </div>
          <div className="msj-sticky-btn-right">
            <GraduationCap size={16} />
            <span>Apply for Admission</span>
            <ArrowRight size={15} />
          </div>
        </button>
      </div>
    </section>
  );
}
