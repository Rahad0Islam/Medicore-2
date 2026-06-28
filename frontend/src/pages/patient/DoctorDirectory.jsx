import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest, getErrorMessage } from "../../api/client";
import { ENDPOINTS } from "../../api/endpoints";
import Navbar from "../../components/Navbar";

const INITIAL_FORM = { date: "", symptoms: "", transaction_id: "" };

function initialsOf(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function DoctorDirectory() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [location, setLocation] = useState("");

  // Booking modal state
  const [modalDoctor, setModalDoctor] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [bookedData, setBookedData] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();

  async function loadDoctors() {
    setLoading(true);
    setError("");
    try {
      const res = await apiRequest(ENDPOINTS.doctors, { auth: true });
      setDoctors(res.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDoctors();
  }, []);

  // Auto-open modal if doctorId is present in query string
  useEffect(() => {
    if (!doctors.length) return;
    const doctorId = searchParams.get("doctorId");
    if (!doctorId) return;
    const target = doctors.find((d) => String(d.doctorId) === String(doctorId));
    if (target) {
      openModal(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors, searchParams]);

  const filtered = useMemo(() => {
    const spec = specialization.trim().toLowerCase();
    const loc = location.trim().toLowerCase();
    return doctors.filter((doc) => {
      const specMatch = !spec || (doc.specialization || "").toLowerCase().includes(spec);
      const locMatch = !loc || (doc.location || "").toLowerCase().includes(loc);
      return specMatch && locMatch;
    });
  }, [doctors, specialization, location]);

  const hasFilters = specialization || location;

  function openModal(doc) {
    setModalDoctor(doc);
    setForm(INITIAL_FORM);
    setModalError("");
    // Reflect in URL without forcing a navigation away
    setSearchParams({ doctorId: doc.doctorId }, { replace: true });
  }

  function closeModal() {
    setModalDoctor(null);
    const next = new URLSearchParams(searchParams);
    next.delete("doctorId");
    setSearchParams(next, { replace: true });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setModalError("");

    if (!form.date || !form.symptoms || !form.transaction_id) {
      setModalError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        doctor_id: modalDoctor.doctorId,
        doctor_name: modalDoctor.name,
        ...form,
      };
      const res = await apiRequest(ENDPOINTS.appointments, {
        method: "POST",
        body,
        auth: true,
      });
      if (res?.success) {
        setBookedData(res.data);
        setAlert({
          type: "success",
          message: res.message ?? "Appointment booked successfully!",
        });
        closeModal();
      } else {
        setModalError(res?.message ?? "Failed to book appointment.");
      }
    } catch (err) {
      setModalError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <div>
            <p className="section-eyebrow role-patient">Patient Portal</p>
            <h1 className="page-title">Available Doctors</h1>
          </div>
        </div>

        {alert.message && (
          <div
            className={`alert ${
              alert.type === "success" ? "alert-success" : "alert-error"
            }`}
          >
            {alert.message}
          </div>
        )}

        {bookedData && (
          <div className="card confirm-card">
            <p className="section-eyebrow role-patient confirm-card__eyebrow">
              Appointment Confirmed
            </p>
            <p className="confirm-card__row">
              <strong>Prescription ID:</strong> {bookedData.prescriptionID}
            </p>
            <p className="confirm-card__row">
              <strong>Doctor:</strong> {bookedData.doctor_info?.name} (
              {bookedData.doctor_info?.specialization})
            </p>
            <p className="confirm-card__row">
              <strong>Location:</strong> {bookedData.location}
            </p>
            <p className="confirm-card__row">
              <strong>Date:</strong> {bookedData.date}
            </p>
            <p className="confirm-card__row">
              <strong>Serial No:</strong> {bookedData.serial_no}
            </p>
          </div>
        )}

        <form className="form-row" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label className="form-label" htmlFor="specialization">
              Specialization
            </label>
            <input
              id="specialization"
              className="form-control"
              placeholder="e.g. Cardiology"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              className="form-control"
              placeholder="e.g. Building A"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          {hasFilters && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setSpecialization("");
                setLocation("");
              }}
            >
              Clear
            </button>
          )}
        </form>

        {error && (
          <div
            className="alert alert-error"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span>{error}</span>
            <button className="btn btn-outline btn-sm" onClick={loadDoctors}>
              Retry
            </button>
          </div>
        )}

        {loading && <p className="page-subtitle">Loading doctors…</p>}

        {!loading && !error && filtered.length === 0 && (
          <div className="card empty-state">
            <p className="empty-state__icon">🩺</p>
            <p>
              {hasFilters
                ? "No doctors match your search."
                : "No approved doctors yet."}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            {hasFilters && (
              <p className="search-meta">
                {filtered.length} doctor{filtered.length !== 1 ? "s" : ""} found
              </p>
            )}
            <div className="grid-3">
              {filtered.map((doc) => (
                <div key={doc.doctorId} className="card doctor-card">
                  <div
                    className="doctor-appt-avatar"
                    style={{
                      background: "var(--accent-light)",
                      color: "var(--accent)",
                    }}
                  >
                    {initialsOf(doc.name)}
                  </div>
                  <div className="doctor-card__name">{doc.name}</div>
                  <div className="doctor-card__meta">
                    {doc.specialization}
                    {doc.specialization && doc.location ? " · " : ""}
                    {doc.location}
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => openModal(doc)}
                  >
                    Book Appointment
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Booking modal ── */}
      {modalDoctor && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal-card docbook-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <span className="modal-title">Book {modalDoctor.name}</span>
              <button
                type="button"
                className="modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {modalError && <div className="alert alert-error">{modalError}</div>}

            <form className="modal-form" onSubmit={handleSubmit}>
              <label className="modal-field">
                <span>Appointment Date</span>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </label>

              <label className="modal-field">
                <span>Symptoms / Reason for Visit</span>
                <textarea
                  name="symptoms"
                  rows={3}
                  placeholder="Describe your symptoms..."
                  value={form.symptoms}
                  onChange={handleChange}
                />
              </label>

              <label className="modal-field">
                <span>Transaction ID</span>
                <input
                  type="text"
                  name="transaction_id"
                  placeholder="e.g. tx_abc123xyz789"
                  value={form.transaction_id}
                  onChange={handleChange}
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Booking…" : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}