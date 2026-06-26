// src/pages/Profile.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const SPECIALIZATIONS = [
  "Cardiology", "Dermatology", "Neurology", "Pediatrics", "Orthopedics",
  "General Medicine", "Gynecology", "Psychiatry", "ENT", "Ophthalmology",
];

const EMPTY_DOCTOR = {
  specialization: "",
  qualification: "",
  location: "",
  visiting_fee: "",
};

const EMPTY_PHARMACIST = {
  pharmacy_name: "",
};

export default function Profile() {
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";
  const isPharmacist = user?.role === "pharmacist";

  const [form, setForm] = useState(isDoctor ? EMPTY_DOCTOR : EMPTY_PHARMACIST);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const body = isDoctor
        ? { ...form, visiting_fee: Number(form.visiting_fee) }
        : { ...form };
      const res = await apiRequest(ENDPOINTS.profile, { method: "PUT", body });
      setSaved(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const dashboardPath = `/${user?.role}`;

  return (
    <>
      <Navbar />
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>

        <div style={{ marginBottom: 32 }}>
          <p className="section-eyebrow">
            {isDoctor ? "Doctor Profile" : "Pharmacist Profile"}
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 4 }}>
            Set up your professional details
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", maxWidth: 560 }}>
            {isDoctor
              ? "These details power your card in the patient directory. Patients can't find or book you until this is filled in."
              : "Your pharmacy name appears on the inventory you manage."}
          </p>
          <div className="accent-line" />
        </div>

        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start" }}>

          <div className="card" style={{ flex: "1 1 380px", maxWidth: 460, padding: 28 }}>
            {error && <div className="alert alert-error">{error}</div>}
            {saved && <div className="alert alert-success">Profile updated successfully.</div>}

            <form onSubmit={handleSubmit}>
              {isDoctor && (
                <>
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <select
                      className="form-control form-select"
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select specialization</option>
                      {SPECIALIZATIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Qualification</label>
                    <input
                      className="form-control"
                      name="qualification"
                      value={form.qualification}
                      onChange={handleChange}
                      placeholder="e.g. MD, FACC"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Chamber / location</label>
                    <input
                      className="form-control"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Building A, Clinic Suite 402"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Visiting fee</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-control"
                      name="visiting_fee"
                      value={form.visiting_fee}
                      onChange={handleChange}
                      placeholder="e.g. 150.00"
                      required
                    />
                  </div>
                </>
              )}

              {isPharmacist && (
                <div className="form-group">
                  <label className="form-label">Pharmacy name</label>
                  <input
                    className="form-control"
                    name="pharmacy_name"
                    value={form.pharmacy_name}
                    onChange={handleChange}
                    placeholder="e.g. Central Metro Pharmacy"
                    required
                  />
                </div>
              )}

              <button
                className="btn btn-primary btn-full"
                type="submit"
                disabled={submitting}
                style={{ marginTop: 8 }}
              >
                {submitting ? "Saving..." : "Save profile"}
              </button>
            </form>
          </div>

          <div style={{ flex: "1 1 280px", maxWidth: 320 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
              {saved ? "Saved details" : "Preview"}
            </p>

            {isDoctor ? (
              <div className="card-sm" style={{ borderColor: saved ? "var(--accent)" : "var(--border)" }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: "var(--accent)", marginBottom: 8 }}>
                  {(saved?.specialization || form.specialization) || "Specialization not set"}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
                  {(saved?.qualification || form.qualification) && (
                    <div>{saved?.qualification || form.qualification}</div>
                  )}
                  {(saved?.location || form.location) && (
                    <div>{saved?.location || form.location}</div>
                  )}
                  {(saved?.visiting_fee || form.visiting_fee) && (
                    <div>${Number(saved?.visiting_fee ?? form.visiting_fee).toFixed(2)} visiting fee</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card-sm" style={{ borderColor: saved ? "var(--accent)" : "var(--border)" }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{user?.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {(saved?.pharmacy_name || form.pharmacy_name) || "Pharmacy name not set"}
                </div>
              </div>
            )}

            <Link
              to={dashboardPath}
              style={{ display: "inline-block", marginTop: 16, fontSize: 13, color: "var(--accent)", fontWeight: 500, textDecoration: "none" }}
            >
              ← Back to dashboard
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}