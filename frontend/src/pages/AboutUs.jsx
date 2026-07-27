// src/pages/AboutUs.jsx
//
// Public "About Us" page. No auth required. Linked from the Navbar
// and the Footer's Resources column.

import Navbar from "../components/Navbar";

const TEAM = [
  { name: "Autanu Datta", role: "Backend & APIs", github: "https://github.com/AD-053" },
  { name: "Taposh Kumer Ghosh", role: "Backend & APIs", github: "https://github.com/taposhkumer"},
  { name: "Rahad Islam", role: "Backend, API, Database & Auth", github: "https://github.com/Rahad0Islam"},
  {name: "Shyamali Das", role: "Frontend & UI/UX", github:"https://github.com/ShyamaliDas"},
  {name: "Jannat Bhuiyan", role: "Frontend & UI/UX", github:"https://github.com/JannatBhuiyan63"},
  {name: "Afia Farzana", role: "Frontend, UI/UX & Testing", github:"https://github.com/afiaFarzanaTasnim"}
];

function initials(name) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AboutUs() {
  return (
    <div className="page-wrap pub-page">
      <Navbar />

      {/* ── INTRO ── */}
      <section className="pub-hero pub-hero--about" style={{ padding: "88px 0 64px" }}>
        <span className="pub-hero-blob pub-hero-blob--1" aria-hidden="true"></span>
        <span className="pub-hero-blob pub-hero-blob--2" aria-hidden="true"></span>
        <span className="pub-hero-blob pub-hero-blob--3" aria-hidden="true"></span>
 
        <div className="container">
          <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
            <span className="pub-hero-eyebrow">
              <i className="bi bi-info-circle-fill"></i>
              About MediCore
            </span>
            <h1 className="pub-hero-title" style={{ fontSize: 44, maxWidth: "none" }}>
              Built by a small team,
              <br />
              <span>for everyday care.</span>
            </h1>
            <p className="pub-hero-sub" style={{ maxWidth: "none", margin: "0 auto" }}>
              MediCore started as a Software Engineering lab project and we hope it grows
              into a full patient-doctor-pharmacist-admin platform. Here's who
              built it and why.
            </p>
          </div>
        </div>
      </section>

      {/* ── MISSION / VISION ── */}
      <section className="pub-section">
        <div className="container">
          <p className="pub-section-eyebrow" style={{textAlign: "center"}}>
            Our purpose
          </p>
          <h2 className="pub-section-title" style={{ textAlign: "center" }}>
            Mission &amp; Vision
          </h2>
          <div className="pub-mv-grid" style={{ marginTop: 24 }}>
            <div className="pub-mv-card">
              <div className="pub-mv-card__title">Our Mission</div>
              <p className="pub-mv-card__text">
                To bring appointments, prescriptions, pharmacy stock, and
                doctor-patient communication into one coordinated platform,
                so care teams spend less time on paperwork and more time on
                patients.
              </p>
            </div>
            <div className="pub-mv-card">
              <div className="pub-mv-card__title">Our Vision</div>
              <p className="pub-mv-card__text">
                A future where every clinic, regardless of size, has access
                to the same digital coordination tools as a large hospital
                system; simple, role-aware, and built for real workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="pub-section pub-section-alt">
        <div className="container">
          <p className="pub-section-eyebrow" style={{textAlign: "center"}}>
            Meet the builders
          </p>
          <h2 className="pub-section-title" style={{ textAlign: "center", marginBottom: 32 }}>
            The team behind MediCore
          </h2>
          <div className="pub-team-grid">
            {TEAM.map((member) => (
              <div key={member.name} className="pub-team-card">
                <div className="pub-team-avatar">{initials(member.name)}</div>
                <div className="pub-team-name">{member.name}</div>
                <div className="pub-team-role">{member.role}</div>
                <div className="pub-team-socials">
                  <a href={member.github} aria-label={`${member.name} on GitHub`}>
                    <i className="bi bi-github"></i>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
