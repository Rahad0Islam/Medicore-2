// src/pages/Home.jsx
//
// Public landing page — visible to anyone, no auth required.
// Gives an overview of the platform and routes to login/signup.
// Pattern: no data fetching, pure render. Simplest possible page.

import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const FEATURES = [
  {
    icon: "bi-heart-pulse",
    title: "Appointments",
    desc: "Patients book slots with approved doctors. A prescription container is prepared automatically on booking.",
  },
  {
    icon: "bi-file-earmark-medical",
    title: "Prescriptions",
    desc: "Doctors write digital prescriptions. Patients view their full history anytime, filterable by doctor.",
  },
  {
    icon: "bi-capsule",
    title: "Pharmacy",
    desc: "Pharmacists manage medicine stock, pricing, and catalog additions in real time.",
  },
  {
    icon: "bi-chat-dots",
    title: "Chat",
    desc: "Direct doctor–patient messaging for follow-ups and dosage questions without a new appointment.",
  },
  {
    icon: "bi-droplet",
    title: "Blood Bank",
    desc: "Patients register as donors. Coordinators filter by blood group to find matches instantly.",
  },
  {
    icon: "bi-shield-check",
    title: "Admin Panel",
    desc: "Admins approve incoming doctor registrations before they appear in patient search directories.",
  },
];

const STATS = [
  { number: "4",    label: "User roles" },
  { number: "6",    label: "Core services" },
  { number: "24/7", label: "Digital access" },
  { number: "1",    label: "Unified platform" },
];

export default function Home() {
  return (
    <div className="page-wrap pub-page">
      <Navbar />

      {/* ── HERO ── */}
      <section className="pub-hero">
        <div className="container">
          <div className="pub-hero-grid">
            <div>
              <span className="pub-hero-eyebrow">
                <i className="bi bi-heart-pulse-fill"></i>
                Welcome to MediCore
              </span>
              <h1 className="pub-hero-title">
                Healthcare,
                <br />
                <span>coordinated.</span>
              </h1>
              <p className="pub-hero-sub">
                Book appointments, manage prescriptions, coordinate pharmacy
                inventory, and connect with your care team — all in one platform.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link to="/signup" className="pub-btn pub-btn-primary">
                  <i className="bi bi-arrow-right-circle"></i>
                  Get started
                </Link>
                <Link to="/login" className="pub-btn pub-btn-ghost">
                  Sign in
                </Link>
              </div>
            </div>

            <div className="pub-hero-icons" aria-hidden="true">
              <span className="pub-hero-icon pub-hero-icon--1"><i className="bi bi-heart-pulse"></i></span>
              <span className="pub-hero-icon pub-hero-icon--2"><i className="bi bi-chat-dots"></i></span>
              <span className="pub-hero-icon pub-hero-icon--3"><i className="bi bi-capsule"></i></span>
              <span className="pub-hero-icon pub-hero-icon--4"><i className="bi bi-droplet"></i></span>
              <span className="pub-hero-icon pub-hero-icon--5"><i className="bi bi-shield-check"></i></span>
              <span className="pub-hero-icon pub-hero-icon--6"><i className="bi bi-file-earmark-medical"></i></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        style={{
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "40px 0",
          background: "var(--white)",
        }}
      >
        <div className="container">
          <div className="grid-4">
            {STATS.map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 600,
                    color: "var(--accent-dark)",
                    lineHeight: 1,
                  }}
                >
                  {s.number}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    marginTop: 8,
                    letterSpacing: "0.04em",
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="pub-features">
        <div className="container">
          <p className="pub-section-eyebrow">What we offer</p>
          <h2 className="pub-section-title" style={{ marginBottom: 40 }}>
            Everything your clinic needs
          </h2>
          <div className="pub-features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="pub-feature-card">
                <span className="pub-icon-badge">
                  <i className={`bi ${f.icon}`}></i>
                </span>
                <div className="pub-feature-card__title">{f.title}</div>
                <div className="pub-feature-card__desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section
        className="pub-section pub-section-alt"
        style={{
          borderTop: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <div className="container">
          <p className="pub-section-eyebrow">Join today</p>
          <h2
            style={{
              fontSize: 26,
              fontWeight: 600,
              marginBottom: 12,
              color: "var(--text)",
            }}
          >
            Ready to get started?
          </h2>
          <p
            className="pub-section-sub"
            style={{ margin: "0 auto 28px" }}
          >
            Create your account and choose your role as a patient, doctor,
            pharmacist, or admin.
          </p>
          <Link to="/signup" className="pub-btn pub-btn-primary">
            <i className="bi bi-arrow-right-circle"></i>
            Create account
          </Link>
        </div>
      </section>
    </div>
  );
}
